import {useState, useRef, DragEvent, ChangeEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useCheckSplit} from '../../context/CheckSplitContext';
import {Card} from '../shared/Card';
import {validateImageFile} from '../../utils/mockOCR';
import {processReceiptImage, OCRError} from '../../utils/receiptOCR';
import {motion} from 'motion/react';
import {CameraIcon, ArrowPathIcon} from '@heroicons/react/24/outline';
import {AdGate} from './AdGate';

const IS_DEMO = !!import.meta.env.VITE_DEMO;

interface ImageUploadProps {
  onProcessComplete?: () => void;
}

export function ImageUpload({onProcessComplete}: ImageUploadProps) {
  const {t} = useTranslation();
  const {addItem, setOcrSummary, setTaxRate, setTipRate, setServiceCharges} =
    useCheckSplit();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<OCRError | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasWatchedAd, setHasWatchedAd] = useState(false);
  const [showAdGate, setShowAdGate] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setOcrError(null);
    setLastFile(file);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      const errorKey = validation.errorType
        ? `errors.${validation.errorType}`
        : 'errors.invalidFile';
      setError(t(errorKey));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process receipt image (uses API in prod, mock in dev)
    setIsProcessing(true);
    try {
      const result = await processReceiptImage(file);
      result.items.forEach((item) => {
        addItem(item);
      });
      // Store OCR summary and pre-populate rates if available
      if (result.summary) {
        setOcrSummary(result.summary);

        // Calculate subtotal from items for rate calculations
        const subtotal = result.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        // Pre-populate tax rate if tax amount was detected
        if (result.summary.tax !== null && subtotal > 0) {
          const taxRate = (result.summary.tax / subtotal) * 100;
          setTaxRate(Math.round(taxRate * 2) / 2); // Round to nearest 0.5
        }

        // Pre-populate tip rate if tip amount was detected
        if (result.summary.tip !== null && subtotal > 0) {
          const tipRate = (result.summary.tip / subtotal) * 100;
          setTipRate(Math.round(tipRate)); // Round to nearest integer
        }

        // Pre-populate service charge directly (it's already a fixed amount)
        if (result.summary.serviceCharge !== null) {
          setServiceCharges(result.summary.serviceCharge);
        }
      }
      setPreview(null);
      onProcessComplete?.();
    } catch (err) {
      // Check if it's a structured OCR error
      if (err && typeof err === 'object' && 'code' in err) {
        const ocrErr = err as OCRError;
        setOcrError(ocrErr);
        setError(t(`errors.ocr.${ocrErr.code}`));
      } else {
        setError(t('errors.processingFailed'));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (lastFile) {
      handleFile(lastFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!hasWatchedAd) {
      setPendingFile(file);
      setShowAdGate(true);
      return;
    }
    handleFile(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    if (!hasWatchedAd) {
      setPendingFile(null);
      setShowAdGate(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleAdWatched = () => {
    setHasWatchedAd(true);
    setShowAdGate(false);
    if (pendingFile) {
      handleFile(pendingFile);
      setPendingFile(null);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
        {t('checkInput.uploadReceiptImage')}
      </h3>
      <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">
        {t('checkInput.uploadInstructions')}
      </p>
      {IS_DEMO && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 mb-4 inline-block dark:bg-amber-600 dark:text-amber-50">
          {t('checkInput.demoMode')}
        </p>
      )}

      <motion.div
        whileHover={{scale: 1.01}}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <motion.div
              animate={{rotate: 360}}
              transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
              className="mb-2"
            >
              <ArrowPathIcon className="size-10 text-primary-600" />
            </motion.div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('checkInput.processingReceipt')}
            </p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center">
            <img
              src={preview}
              alt="Receipt preview"
              className="max-h-40 rounded mb-2"
            />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('checkInput.processing')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <CameraIcon className="size-12 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1 dark:text-white">
              {t('checkInput.clickToUpload')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('checkInput.fileTypes')}
            </p>
          </div>
        )}
      </motion.div>

      {error && (
        <div className="mt-2">
          <p className="text-sm text-red-600">{error}</p>
          {ocrError?.retryable && (
            <button
              onClick={handleRetry}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 underline"
            >
              {t('errors.tryAgain')}
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showAdGate && (
        <AdGate
          onAdWatched={handleAdWatched}
          onClose={() => {
            setShowAdGate(false);
            setPendingFile(null);
          }}
        />
      )}
    </Card>
  );
}

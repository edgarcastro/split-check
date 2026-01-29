import {useState, useRef, DragEvent, ChangeEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useCheckSplit} from '../../context/CheckSplitContext';
import {Card} from '../shared/Card';
import {validateImageFile} from '../../utils/mockOCR';
import {processReceiptImage, OCRError} from '../../utils/receiptOCR';
import {motion} from 'motion/react';
import {CameraIcon, ArrowPathIcon} from '@heroicons/react/24/outline';

const IS_DEMO = !!import.meta.env.VITE_DEMO;

interface ImageUploadProps {
  onProcessComplete?: () => void;
}

export function ImageUpload({onProcessComplete}: ImageUploadProps) {
  const {t} = useTranslation();
  const {addItem} = useCheckSplit();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<OCRError | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (file) {
      handleFile(file);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('checkInput.uploadReceiptImage')}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {t('checkInput.uploadInstructions')}
      </p>
      {IS_DEMO && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 mb-4 inline-block">
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
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
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
            <p className="text-sm text-gray-600">
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
            <p className="text-sm text-gray-600">
              {t('checkInput.processing')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <CameraIcon className="size-12 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {t('checkInput.clickToUpload')}
            </p>
            <p className="text-xs text-gray-500">{t('checkInput.fileTypes')}</p>
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
    </Card>
  );
}

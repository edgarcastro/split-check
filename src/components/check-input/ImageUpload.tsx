import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useCheckSplit } from "../../context/CheckSplitContext";
import { Card } from "../shared/Card";
import { mockReceiptOCR, validateImageFile } from "../../utils/mockOCR";
import { motion } from "motion/react";

export function ImageUpload() {
  const { t } = useTranslation();
  const { addItem } = useCheckSplit();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

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

    // Process with mock OCR
    setIsProcessing(true);
    try {
      const result = await mockReceiptOCR(file);
      result.items.forEach((item) => {
        addItem(item);
      });
      setPreview(null);
    } catch {
      setError(t('errors.processingFailed'));
    } finally {
      setIsProcessing(false);
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

      <motion.div
        whileHover={{ scale: 1.01 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
        }`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-4xl mb-2"
            >
              ⏳
            </motion.div>
            <p className="text-sm text-gray-600">{t('checkInput.processingReceipt')}</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center">
            <img
              src={preview}
              alt="Receipt preview"
              className="max-h-40 rounded mb-2"
            />
            <p className="text-sm text-gray-600">{t('checkInput.processing')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-5xl mb-2">📸</div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {t('checkInput.clickToUpload')}
            </p>
            <p className="text-xs text-gray-500">
              {t('checkInput.fileTypes')}
            </p>
          </div>
        )}
      </motion.div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

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

import {MockOCRResult} from '../types';
import {mockReceiptOCR} from './mockOCR';
import {functions} from '../firebase';
import {httpsCallable} from 'firebase/functions';
import {FirebaseError} from 'firebase/app';

const IS_DEMO = !!import.meta.env.VITE_DEMO;

// Error codes matching backend
export const OCRErrorCode = {
  BAD_DOCUMENT: 'BAD_DOCUMENT',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  DOCUMENT_TOO_LARGE: 'DOCUMENT_TOO_LARGE',
  SERVICE_BUSY: 'SERVICE_BUSY',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVICE_ERROR: 'SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type OCRErrorCodeType = (typeof OCRErrorCode)[keyof typeof OCRErrorCode];

export interface OCRError {
  code: OCRErrorCodeType;
  message: string;
  retryable: boolean;
}

interface ErrorDetails {
  errorCode?: string;
  retryable?: boolean;
}

/**
 * Transform Firebase/Functions errors into structured OCR errors
 */
function parseOCRError(error: unknown): OCRError {
  // Check if it's a Firebase Functions error
  if (error instanceof FirebaseError) {
    const details = (error as FirebaseError & {details?: ErrorDetails}).details;

    if (details?.errorCode) {
      return {
        code: details.errorCode as OCRErrorCodeType,
        message: error.message,
        retryable: details.retryable ?? false,
      };
    }

    // Handle Firebase error codes without custom details
    if (error.code?.includes('unavailable')) {
      return {
        code: OCRErrorCode.SERVICE_BUSY,
        message: error.message,
        retryable: true,
      };
    }
  }

  // Fallback for unknown errors
  return {
    code: OCRErrorCode.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : 'Unknown error',
    retryable: false,
  };
}

export interface ReceiptOCRResult {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  summary?: {
    subtotal: number | null;
    tax: number | null;
    tip: number | null;
    total: number | null;
    serviceCharge: number | null;
  };
}

interface AnalyzeReceiptResponse {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  summary: {
    subtotal: number | null;
    tax: number | null;
    tip: number | null;
    total: number | null;
    service_charge: number | null;
  };
}

/**
 * Convert a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Process receipt image using OCR
 * Uses real API in production, mock in development
 */
export async function processReceiptImage(
  imageFile: File,
): Promise<ReceiptOCRResult> {
  if (!IS_DEMO) {
    return callOCRApi(imageFile);
  }
  return callMockOCR(imageFile);
}

/**
 * Call the Firebase Function using httpsCallable
 */
async function callOCRApi(imageFile: File): Promise<ReceiptOCRResult> {
  const analyzeReceipt = httpsCallable<
    {fileData: string; contentType: string},
    AnalyzeReceiptResponse
  >(functions, 'analyze_receipt');

  try {
    const fileData = await fileToBase64(imageFile);

    const result = await analyzeReceipt({
      fileData,
      contentType: imageFile.type,
    });

    const data = result.data;

    return {
      items: data.items.map((item) => ({
        name: item.name.replace(/\n/g, ' ').trim(),
        price: item.price,
        quantity: item.quantity,
      })),
      summary: {
        subtotal: data.summary.subtotal,
        tax: data.summary.tax,
        tip: data.summary.tip,
        total: data.summary.total,
        serviceCharge: data.summary.service_charge,
      },
    };
  } catch (error) {
    throw parseOCRError(error);
  }
}

/**
 * Use mock OCR for development
 */
async function callMockOCR(imageFile: File): Promise<ReceiptOCRResult> {
  const result: MockOCRResult = await mockReceiptOCR(imageFile);
  return {
    items: result.items,
  };
}

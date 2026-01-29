import {MockOCRResult} from '../types';
import {mockReceiptOCR} from './mockOCR';
import {functions} from '../firebase';
import {httpsCallable} from 'firebase/functions';

const IS_DEMO = !!import.meta.env.DEMO;

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

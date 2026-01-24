import {OCRApiResponse, MockOCRResult} from '../types';
import {mockReceiptOCR} from './mockOCR';

const OCR_API_URL = import.meta.env.VITE_OCR_API_URL;
const IS_PROD = import.meta.env.VITE_ENV === 'production';

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

/**
 * Process receipt image using OCR
 * Uses real API in production, mock in development
 */
export async function processReceiptImage(
  imageFile: File,
): Promise<ReceiptOCRResult> {
  if (IS_PROD && OCR_API_URL) {
    return callOCRApi(imageFile);
  }
  return callMockOCR(imageFile);
}

/**
 * Call the real OCR API endpoint
 */
async function callOCRApi(imageFile: File): Promise<ReceiptOCRResult> {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR API error: ${response.status}`);
  }

  const data: OCRApiResponse = await response.json();

  if (!data.success) {
    throw new Error('OCR processing failed');
  }

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

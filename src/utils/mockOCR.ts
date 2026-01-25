import {MockOCRResult} from '../types';
import i18n from '../i18n';

// English mock items (USD pricing)
const mockItemsEn = [
  {name: 'Caesar Salad', price: 12.99, quantity: 1},
  {name: 'Margherita Pizza', price: 18.5, quantity: 1},
  {name: 'Grilled Salmon', price: 24.99, quantity: 1},
  {name: 'French Fries', price: 6.99, quantity: 2},
  {name: 'Coca Cola', price: 3.5, quantity: 3},
  {name: 'Tiramisu', price: 8.99, quantity: 1},
  {name: 'Chicken Wings', price: 11.99, quantity: 1},
  {name: 'Onion Rings', price: 7.99, quantity: 1},
  {name: 'Iced Tea', price: 2.99, quantity: 2},
  {name: 'Chocolate Cake', price: 9.99, quantity: 1},
];

// Spanish mock items (Colombian Peso pricing)
const mockItemsEs = [
  {name: 'Bandeja Paisa', price: 32000, quantity: 1},
  {name: 'Ajiaco Santafereño', price: 28000, quantity: 1},
  {name: 'Empanadas', price: 3500, quantity: 4},
  {name: 'Arepa con Queso', price: 8000, quantity: 2},
  {name: 'Limonada de Coco', price: 7000, quantity: 3},
  {name: 'Sancocho de Gallina', price: 25000, quantity: 1},
  {name: 'Patacones', price: 12000, quantity: 1},
  {name: 'Chicharrón', price: 18000, quantity: 1},
  {name: 'Jugo de Lulo', price: 6000, quantity: 2},
  {name: 'Tres Leches', price: 14000, quantity: 1},
];

/**
 * Mock OCR function that simulates parsing a receipt image
 * Returns random items for demonstration purposes
 * Uses language detection to return appropriate mock items
 */
export async function mockReceiptOCR(imageFile: File): Promise<MockOCRResult> {
  console.log('imageFile', imageFile);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Select mock items based on current language
  const currentLang = i18n.language?.split('-')[0] || 'en';
  const mockItems = currentLang === 'es' ? mockItemsEs : mockItemsEn;

  // Randomly select 3-5 items
  const itemCount = Math.floor(Math.random() * 3) + 3;
  const selectedItems = [...mockItems]
    .sort(() => Math.random() - 0.5)
    .slice(0, itemCount);

  return {
    items: selectedItems,
    confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
  };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean;
  errorType?: 'invalidFileType' | 'fileTooLarge';
} {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      errorType: 'invalidFileType',
    };
  }

  if (file.size > maxSize) {
    return {valid: false, errorType: 'fileTooLarge'};
  }

  return {valid: true};
}

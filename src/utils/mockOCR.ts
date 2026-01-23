import { MockOCRResult } from '../types';

/**
 * Mock OCR function that simulates parsing a receipt image
 * Returns random items for demonstration purposes
 */
export async function mockReceiptOCR(imageFile: File): Promise<MockOCRResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock parsed items
  const mockItems = [
    { name: 'Caesar Salad', price: 12.99, quantity: 1 },
    { name: 'Margherita Pizza', price: 18.5, quantity: 1 },
    { name: 'Grilled Salmon', price: 24.99, quantity: 1 },
    { name: 'French Fries', price: 6.99, quantity: 2 },
    { name: 'Coca Cola', price: 3.5, quantity: 3 },
    { name: 'Tiramisu', price: 8.99, quantity: 1 },
    { name: 'Chicken Wings', price: 11.99, quantity: 1 },
    { name: 'Onion Rings', price: 7.99, quantity: 1 },
    { name: 'Iced Tea', price: 2.99, quantity: 2 },
    { name: 'Chocolate Cake', price: 9.99, quantity: 1 },
  ];

  // Randomly select 3-5 items
  const itemCount = Math.floor(Math.random() * 3) + 3;
  const selectedItems = mockItems
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
export function validateImageFile(
  file: File
): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, HEIC)',
    };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }

  return { valid: true };
}

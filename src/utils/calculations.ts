import { CheckItem, Person, CheckState, SplitSummary, PersonTotal } from '../types';

/**
 * Calculate total split amounts for all people
 */
export function calculateSplit(state: CheckState): SplitSummary {
  const { items, people, taxRate, tipRate, serviceCharges } = state;

  // Calculate subtotal for each person
  const personSubtotals = people.map((person) => {
    const assignedItems = items.filter((item) =>
      item.assignedTo.includes(person.id)
    );

    const subtotal = assignedItems.reduce((sum, item) => {
      // If item is split between multiple people, divide price
      const splitCount = item.assignedTo.length;
      const itemTotal = item.price * item.quantity;
      return sum + itemTotal / splitCount;
    }, 0);

    return { personId: person.id, subtotal };
  });

  const totalBeforeTaxAndTip = personSubtotals.reduce(
    (sum, p) => sum + p.subtotal,
    0
  );

  // Calculate proportional tax, tip, and service charges
  const personTotals: PersonTotal[] = personSubtotals.map(
    ({ personId, subtotal }) => {
      const person = people.find((p) => p.id === personId)!;
      const proportion =
        totalBeforeTaxAndTip > 0 ? subtotal / totalBeforeTaxAndTip : 0;

      const tax = (subtotal * taxRate) / 100;
      const tip = ((subtotal + tax) * tipRate) / 100;
      const serviceCharge = serviceCharges * proportion;

      return {
        personId,
        personName: person.name,
        subtotal,
        tax,
        tip,
        serviceCharge,
        total: subtotal + tax + tip + serviceCharge,
      };
    }
  );

  const totalTax = personTotals.reduce((sum, p) => sum + p.tax, 0);
  const totalTip = personTotals.reduce((sum, p) => sum + p.tip, 0);
  const totalServiceCharges = serviceCharges;
  const grandTotal =
    totalBeforeTaxAndTip + totalTax + totalTip + totalServiceCharges;

  return {
    personTotals,
    grandTotal,
    totalBeforeTaxAndTip,
    totalTax,
    totalTip,
    totalServiceCharges,
  };
}

/**
 * Validate price input
 */
export function validatePrice(price: string): boolean {
  const parsed = parseFloat(price);
  return !isNaN(parsed) && parsed > 0;
}

/**
 * Validate quantity input
 */
export function validateQuantity(quantity: string): boolean {
  const parsed = parseInt(quantity, 10);
  return !isNaN(parsed) && parsed > 0 && parsed < 100;
}

/**
 * Validate item name
 */
export function validateItemName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 100;
}

/**
 * Validate person name
 */
export function validatePersonName(name: string, existingNames: string[]): { valid: boolean; error?: string } {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (trimmedName.length > 50) {
    return { valid: false, error: 'Name must be 50 characters or less' };
  }

  if (existingNames.map(n => n.toLowerCase()).includes(trimmedName.toLowerCase())) {
    return { valid: false, error: 'This name is already taken' };
  }

  return { valid: true };
}

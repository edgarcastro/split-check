import { CheckState, SplitSummary, PersonTotal, PersonItemDetail } from "../types";

/**
 * Calculate total split amounts for all people
 */
export function calculateSplit(state: CheckState): SplitSummary {
  const { items, people, taxRate, tipRate, serviceCharges } = state;

  // Calculate subtotal and item details for each person based on unit assignments
  const personSubtotals = people.map((person) => {
    let subtotal = 0;
    const itemDetailsMap = new Map<string, PersonItemDetail>();

    items.forEach((item) => {
      let itemAmount = 0;
      let unitsAssigned = 0;
      let hasSharedUnit = false;

      item.unitAssignments.forEach((ua) => {
        if (ua.assignedTo.includes(person.id)) {
          // This person has this unit - split unit price among all assigned
          const splitCount = ua.assignedTo.length;
          const unitAmount = item.price / splitCount;
          itemAmount += unitAmount;
          unitsAssigned++;
          if (splitCount > 1) {
            hasSharedUnit = true;
          }
        }
      });

      if (unitsAssigned > 0) {
        subtotal += itemAmount;
        itemDetailsMap.set(item.id, {
          itemId: item.id,
          itemName: item.name,
          unitPrice: item.price,
          unitsAssigned,
          isShared: hasSharedUnit,
          amount: itemAmount,
        });
      }
    });

    return {
      personId: person.id,
      subtotal,
      items: Array.from(itemDetailsMap.values()),
    };
  });

  const totalBeforeTaxAndTip = personSubtotals.reduce(
    (sum, p) => sum + p.subtotal,
    0,
  );

  // Calculate proportional tax, tip, and service charges
  const personTotals: PersonTotal[] = personSubtotals.map(
    ({ personId, subtotal, items: personItems }) => {
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
        items: personItems,
      };
    },
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
export function validatePersonName(
  name: string,
  existingNames: string[],
): { valid: boolean; error?: string } {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, error: "Name is required" };
  }

  if (trimmedName.length > 50) {
    return { valid: false, error: "Name must be 50 characters or less" };
  }

  if (
    existingNames
      .map((n) => n.toLowerCase())
      .includes(trimmedName.toLowerCase())
  ) {
    return { valid: false, error: "This name is already taken" };
  }

  return { valid: true };
}

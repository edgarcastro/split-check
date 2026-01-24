// Core data models
export interface UnitAssignment {
  unitIndex: number; // 0-indexed unit (0, 1, 2, etc.)
  assignedTo: string[]; // Person IDs who split THIS unit
}

export interface CheckItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unitAssignments: UnitAssignment[]; // Per-unit assignment tracking
  createdAt: Date;
}

export interface Person {
  id: string;
  name: string;
  color: string; // For visual distinction in UI
  createdAt: Date;
}

export interface CheckState {
  items: CheckItem[];
  people: Person[];
  taxRate: number; // Percentage (e.g., 8.5 for 8.5%)
  tipRate: number; // Percentage (e.g., 20 for 20%)
  serviceCharges: number; // Fixed amount
}

export interface PersonItemDetail {
  itemId: string;
  itemName: string;
  unitPrice: number;
  unitsAssigned: number; // How many units of this item are assigned to this person
  isShared: boolean; // True if any unit is split with others
  amount: number; // Total amount this person owes for this item
}

export interface PersonTotal {
  personId: string;
  personName: string;
  subtotal: number;
  tax: number;
  tip: number;
  serviceCharge: number;
  total: number;
  items: PersonItemDetail[]; // Details of items assigned to this person
}

export interface SplitSummary {
  personTotals: PersonTotal[];
  grandTotal: number;
  totalBeforeTaxAndTip: number;
  totalTax: number;
  totalTip: number;
  totalServiceCharges: number;
}

// Form types
export interface CheckItemFormData {
  name: string;
  price: string;
  quantity: string;
}

export interface PersonFormData {
  name: string;
}

// Context types
export interface CheckSplitContextType {
  state: CheckState;
  addItem: (
    item: Omit<CheckItem, 'id' | 'unitAssignments' | 'createdAt'>,
  ) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<CheckItem>) => void;
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  removePerson: (personId: string) => void;
  updatePerson: (personId: string, updates: Partial<Person>) => void;
  assignUnitToPerson: (
    itemId: string,
    unitIndex: number,
    personId: string,
  ) => void;
  unassignUnitFromPerson: (
    itemId: string,
    unitIndex: number,
    personId: string,
  ) => void;
  setTaxRate: (rate: number) => void;
  setTipRate: (rate: number) => void;
  setServiceCharges: (amount: number) => void;
  getSplitSummary: () => SplitSummary;
  resetCheck: () => void;
}

// Image upload types
export interface MockOCRResult {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  confidence: number;
}

// OCR API response type
export interface OCRApiResponse {
  success: boolean;
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

// Workflow step enum
export const WorkflowStep = {
  INPUT: 'input',
  PEOPLE: 'people',
  ASSIGN: 'assign',
  SUMMARY: 'summary',
} as const;

export type WorkflowStep = (typeof WorkflowStep)[keyof typeof WorkflowStep];

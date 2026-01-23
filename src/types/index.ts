// Core data models
export interface CheckItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string[]; // Array of person IDs (supports splitting items)
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

export interface PersonTotal {
  personId: string;
  personName: string;
  subtotal: number;
  tax: number;
  tip: number;
  serviceCharge: number;
  total: number;
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
  addItem: (item: Omit<CheckItem, 'id' | 'assignedTo' | 'createdAt'>) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<CheckItem>) => void;
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  removePerson: (personId: string) => void;
  updatePerson: (personId: string, updates: Partial<Person>) => void;
  assignItemToPerson: (itemId: string, personId: string) => void;
  unassignItemFromPerson: (itemId: string, personId: string) => void;
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

// Workflow step enum
export const WorkflowStep = {
  INPUT: 'input',
  PEOPLE: 'people',
  ASSIGN: 'assign',
  SUMMARY: 'summary',
} as const;

export type WorkflowStep = typeof WorkflowStep[keyof typeof WorkflowStep];

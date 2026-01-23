import { createContext, useContext, useReducer, ReactNode } from "react";
import {
  CheckState,
  CheckSplitContextType,
  CheckItem,
  Person,
  SplitSummary,
} from "../types";
import { calculateSplit } from "../utils/calculations";

// Initial state
const initialState: CheckState = {
  items: [],
  people: [],
  taxRate: 0,
  tipRate: 15,
  serviceCharges: 0,
};

// Action types
type Action =
  | { type: "ADD_ITEM"; payload: CheckItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | {
      type: "UPDATE_ITEM";
      payload: { id: string; updates: Partial<CheckItem> };
    }
  | { type: "ADD_PERSON"; payload: Person }
  | { type: "REMOVE_PERSON"; payload: string }
  | {
      type: "UPDATE_PERSON";
      payload: { id: string; updates: Partial<Person> };
    }
  | { type: "ASSIGN_ITEM"; payload: { itemId: string; personId: string } }
  | { type: "UNASSIGN_ITEM"; payload: { itemId: string; personId: string } }
  | { type: "SET_TAX_RATE"; payload: number }
  | { type: "SET_TIP_RATE"; payload: number }
  | { type: "SET_SERVICE_CHARGES"; payload: number }
  | { type: "RESET_CHECK" };

// Reducer function with all business logic
function checkSplitReducer(state: CheckState, action: Action): CheckState {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item,
        ),
      };

    case "ADD_PERSON":
      return {
        ...state,
        people: [...state.people, action.payload],
      };

    case "REMOVE_PERSON":
      return {
        ...state,
        people: state.people.filter((person) => person.id !== action.payload),
        // Unassign all items from this person
        items: state.items.map((item) => ({
          ...item,
          assignedTo: item.assignedTo.filter((id) => id !== action.payload),
        })),
      };

    case "UPDATE_PERSON":
      return {
        ...state,
        people: state.people.map((person) =>
          person.id === action.payload.id
            ? { ...person, ...action.payload.updates }
            : person,
        ),
      };

    case "ASSIGN_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId
            ? {
                ...item,
                assignedTo: item.assignedTo.includes(action.payload.personId)
                  ? item.assignedTo
                  : [...item.assignedTo, action.payload.personId],
              }
            : item,
        ),
      };

    case "UNASSIGN_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId
            ? {
                ...item,
                assignedTo: item.assignedTo.filter(
                  (id) => id !== action.payload.personId,
                ),
              }
            : item,
        ),
      };

    case "SET_TAX_RATE":
      return {
        ...state,
        taxRate: action.payload,
      };

    case "SET_TIP_RATE":
      return {
        ...state,
        tipRate: action.payload,
      };

    case "SET_SERVICE_CHARGES":
      return {
        ...state,
        serviceCharges: action.payload,
      };

    case "RESET_CHECK":
      return initialState;

    default:
      return state;
  }
}

// Create context
const CheckSplitContext = createContext<CheckSplitContextType | undefined>(
  undefined,
);

// Provider component
export function CheckSplitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checkSplitReducer, initialState);

  // Wrapper functions for dispatch
  const addItem = (
    item: Omit<CheckItem, "id" | "assignedTo" | "createdAt">,
  ) => {
    const newItem: CheckItem = {
      ...item,
      id: crypto.randomUUID(),
      assignedTo: [],
      createdAt: new Date(),
    };
    dispatch({ type: "ADD_ITEM", payload: newItem });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId });
  };

  const updateItem = (itemId: string, updates: Partial<CheckItem>) => {
    dispatch({ type: "UPDATE_ITEM", payload: { id: itemId, updates } });
  };

  const addPerson = (person: Omit<Person, "id" | "createdAt">) => {
    const newPerson: Person = {
      ...person,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    dispatch({ type: "ADD_PERSON", payload: newPerson });
  };

  const removePerson = (personId: string) => {
    dispatch({ type: "REMOVE_PERSON", payload: personId });
  };

  const updatePerson = (personId: string, updates: Partial<Person>) => {
    dispatch({ type: "UPDATE_PERSON", payload: { id: personId, updates } });
  };

  const assignItemToPerson = (itemId: string, personId: string) => {
    dispatch({ type: "ASSIGN_ITEM", payload: { itemId, personId } });
  };

  const unassignItemFromPerson = (itemId: string, personId: string) => {
    dispatch({ type: "UNASSIGN_ITEM", payload: { itemId, personId } });
  };

  const setTaxRate = (rate: number) => {
    dispatch({ type: "SET_TAX_RATE", payload: rate });
  };

  const setTipRate = (rate: number) => {
    dispatch({ type: "SET_TIP_RATE", payload: rate });
  };

  const setServiceCharges = (amount: number) => {
    dispatch({ type: "SET_SERVICE_CHARGES", payload: amount });
  };

  const getSplitSummary = (): SplitSummary => {
    return calculateSplit(state);
  };

  const resetCheck = () => {
    dispatch({ type: "RESET_CHECK" });
  };

  const contextValue: CheckSplitContextType = {
    state,
    addItem,
    removeItem,
    updateItem,
    addPerson,
    removePerson,
    updatePerson,
    assignItemToPerson,
    unassignItemFromPerson,
    setTaxRate,
    setTipRate,
    setServiceCharges,
    getSplitSummary,
    resetCheck,
  };

  return (
    <CheckSplitContext.Provider value={contextValue}>
      {children}
    </CheckSplitContext.Provider>
  );
}

// Custom hook for consuming context
export function useCheckSplit() {
  const context = useContext(CheckSplitContext);
  if (!context) {
    throw new Error("useCheckSplit must be used within CheckSplitProvider");
  }
  return context;
}

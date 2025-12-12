/**
 * Core type definitions for Money For Nothing
 */

// ============================================
// Data Models
// ============================================

export interface Income {
  id: string;
  name: string;
  defaultAmount: number;
  currentAmount: number;
  paycheckNumber?: 1 | 2; // Only for the two main paychecks; undefined for additional income sources
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
}

export interface Savings {
  id: string;
  name: string;
  amount: number;
}

export interface SavingsHistoryEntry {
  month: string; // Format: "YYYY-MM"
  total: number;
}

export interface AppState {
  lastSessionMonth: string; // Format: "YYYY-MM"
  versionString: string;
  hasCompletedSetup: boolean;
  savingsHistory: SavingsHistoryEntry[];
}

// ============================================
// App State (Combined)
// ============================================

export interface AppData {
  income: Income[];
  bills: Bill[];
  savings: Savings[];
  appState: AppState;
}

// ============================================
// Action Types
// ============================================

export type IncomeAction =
  | { type: 'SET_INCOME'; payload: Income[] }
  | { type: 'ADD_INCOME'; payload: Income }
  | { type: 'UPDATE_INCOME'; payload: { id: string; currentAmount: number } }
  | { type: 'UPDATE_INCOME_DEFAULT'; payload: { id: string; defaultAmount: number } }
  | { type: 'UPDATE_INCOME_NAME'; payload: { id: string; name: string } }
  | { type: 'DELETE_INCOME'; payload: string }
  | { type: 'RESET_INCOME_TO_DEFAULTS' };

export type BillAction =
  | { type: 'SET_BILLS'; payload: Bill[] }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'UPDATE_BILL'; payload: { id: string; updates: Partial<Omit<Bill, 'id'>> } }
  | { type: 'TOGGLE_BILL_PAID'; payload: string }
  | { type: 'DELETE_BILL'; payload: string }
  | { type: 'RESET_ALL_BILLS_UNPAID' };

export type SavingsAction =
  | { type: 'SET_SAVINGS'; payload: Savings[] }
  | { type: 'ADD_SAVINGS'; payload: Savings }
  | { type: 'UPDATE_SAVINGS'; payload: { id: string; updates: Partial<Omit<Savings, 'id'>> } }
  | { type: 'DELETE_SAVINGS'; payload: string };

export type AppStateAction =
  | { type: 'SET_APP_STATE'; payload: AppState }
  | { type: 'UPDATE_LAST_SESSION_MONTH'; payload: string }
  | { type: 'SET_SETUP_COMPLETED'; payload: boolean }
  | { type: 'SET_VERSION_STRING'; payload: string }
  | { type: 'ADD_SAVINGS_HISTORY_ENTRY'; payload: SavingsHistoryEntry }
  | { type: 'SET_SAVINGS_HISTORY'; payload: SavingsHistoryEntry[] };

export type AppAction =
  | IncomeAction
  | BillAction
  | SavingsAction
  | AppStateAction
  | { type: 'LOAD_ALL_DATA'; payload: AppData }
  | { type: 'PERFORM_MONTHLY_RESET' }
  | { type: 'IMPORT_DATA'; payload: AppData };

// ============================================
// Input Types (for forms/validation)
// ============================================

export interface IncomeInput {
  name: string;
  defaultAmount: number;
  paycheckNumber: 1 | 2;
}

export interface BillInput {
  name: string;
  amount: number;
}

export interface SavingsInput {
  name: string;
  amount: number;
}

// ============================================
// Computed/Derived Types
// ============================================

export interface BillsSummary {
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
  progress: number; // 0-100
}

export interface IncomeSummary {
  total: number;
  defaultTotal: number; // Sum of defaultAmount (used for descent graph)
}

export interface SavingsSummary {
  total: number;
}

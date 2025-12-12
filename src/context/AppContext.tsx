/**
 * App Context - Global state management for Money For Nothing
 * Uses React Context API + useReducer pattern
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppData,
  AppAction,
  Income,
  Bill,
  Savings,
  AppState,
  BillsSummary,
  IncomeSummary,
  SavingsSummary,
} from '../types';

// ============================================
// Initial State
// ============================================

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const generateVersionString = (): string => {
  // Generate random nonsense string like "v0.01682.c"
  const num = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, '0');
  const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  return `v0.${num}.${letter}`;
};

const createInitialState = (): AppData => ({
  income: [
    {
      id: uuidv4(),
      name: 'Paycheck 1',
      defaultAmount: 0,
      currentAmount: 0,
      paycheckNumber: 1,
    },
    {
      id: uuidv4(),
      name: 'Paycheck 2',
      defaultAmount: 0,
      currentAmount: 0,
      paycheckNumber: 2,
    },
  ],
  bills: [],
  savings: [],
  appState: {
    lastSessionMonth: getCurrentMonth(),
    versionString: generateVersionString(),
    hasCompletedSetup: false,
    savingsHistory: [],
  },
});

const initialState: AppData = createInitialState();

// ============================================
// Reducer
// ============================================

function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    // Income Actions
    case 'SET_INCOME':
      return { ...state, income: action.payload };

    case 'UPDATE_INCOME':
      return {
        ...state,
        income: state.income.map(inc =>
          inc.id === action.payload.id
            ? { ...inc, currentAmount: action.payload.currentAmount }
            : inc
        ),
      };

    case 'UPDATE_INCOME_DEFAULT':
      return {
        ...state,
        income: state.income.map(inc =>
          inc.id === action.payload.id
            ? { ...inc, defaultAmount: action.payload.defaultAmount }
            : inc
        ),
      };

    case 'UPDATE_INCOME_NAME':
      return {
        ...state,
        income: state.income.map(inc =>
          inc.id === action.payload.id ? { ...inc, name: action.payload.name } : inc
        ),
      };

    case 'ADD_INCOME':
      return { ...state, income: [...state.income, action.payload] };

    case 'DELETE_INCOME':
      return {
        ...state,
        income: state.income.filter(inc => inc.id !== action.payload),
      };

    case 'RESET_INCOME_TO_DEFAULTS':
      return {
        ...state,
        income: state.income.map(inc => ({ ...inc, currentAmount: inc.defaultAmount })),
      };

    // Bill Actions
    case 'SET_BILLS':
      return { ...state, bills: action.payload };

    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.payload] };

    case 'UPDATE_BILL':
      return {
        ...state,
        bills: state.bills.map(bill =>
          bill.id === action.payload.id ? { ...bill, ...action.payload.updates } : bill
        ),
      };

    case 'TOGGLE_BILL_PAID':
      return {
        ...state,
        bills: state.bills.map(bill =>
          bill.id === action.payload ? { ...bill, paid: !bill.paid } : bill
        ),
      };

    case 'DELETE_BILL':
      return {
        ...state,
        bills: state.bills.filter(bill => bill.id !== action.payload),
      };

    case 'RESET_ALL_BILLS_UNPAID':
      return {
        ...state,
        bills: state.bills.map(bill => ({ ...bill, paid: false })),
      };

    // Savings Actions
    case 'SET_SAVINGS':
      return { ...state, savings: action.payload };

    case 'ADD_SAVINGS':
      return { ...state, savings: [...state.savings, action.payload] };

    case 'UPDATE_SAVINGS':
      return {
        ...state,
        savings: state.savings.map(sav =>
          sav.id === action.payload.id ? { ...sav, ...action.payload.updates } : sav
        ),
      };

    case 'DELETE_SAVINGS':
      return {
        ...state,
        savings: state.savings.filter(sav => sav.id !== action.payload),
      };

    // App State Actions
    case 'SET_APP_STATE':
      return { ...state, appState: action.payload };

    case 'UPDATE_LAST_SESSION_MONTH':
      return {
        ...state,
        appState: { ...state.appState, lastSessionMonth: action.payload },
      };

    case 'SET_SETUP_COMPLETED':
      return {
        ...state,
        appState: { ...state.appState, hasCompletedSetup: action.payload },
      };

    case 'SET_VERSION_STRING':
      return {
        ...state,
        appState: { ...state.appState, versionString: action.payload },
      };

    case 'ADD_SAVINGS_HISTORY_ENTRY':
      // Keep last 12 months of history
      const newHistory = [...(state.appState.savingsHistory ?? []), action.payload].slice(-12);
      return {
        ...state,
        appState: { ...state.appState, savingsHistory: newHistory },
      };

    case 'SET_SAVINGS_HISTORY':
      return {
        ...state,
        appState: { ...state.appState, savingsHistory: action.payload },
      };

    // Bulk Actions
    case 'LOAD_ALL_DATA':
      return action.payload;

    case 'IMPORT_DATA':
      // Replace all data with imported data
      return action.payload;

    case 'PERFORM_MONTHLY_RESET': {
      // Capture savings snapshot before reset
      const savingsTotal = state.savings.reduce((sum, sav) => sum + sav.amount, 0);
      const historyEntry = {
        month: state.appState.lastSessionMonth,
        total: savingsTotal,
      };
      // Add to history (keep last 12 months)
      const updatedHistory = [...(state.appState.savingsHistory ?? []), historyEntry].slice(-12);

      return {
        ...state,
        income: state.income.map(inc => ({ ...inc, currentAmount: inc.defaultAmount })),
        bills: state.bills.map(bill => ({ ...bill, paid: false })),
        appState: {
          ...state.appState,
          lastSessionMonth: getCurrentMonth(),
          savingsHistory: updatedHistory,
        },
      };
    }

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface AppContextValue {
  state: AppData;
  dispatch: React.Dispatch<AppAction>;
  // Computed values
  incomeSummary: IncomeSummary;
  billsSummary: BillsSummary;
  savingsSummary: SavingsSummary;
  tusUltimosPesos: number;
  // Helper functions
  getCurrentMonth: () => string;
  checkNeedsMonthlyReset: () => boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================
// Provider
// ============================================

interface AppProviderProps {
  children: ReactNode;
  initialData?: AppData;
}

export function AppProvider({ children, initialData }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialData ?? initialState);

  // Computed: Income Summary
  const incomeSummary: IncomeSummary = {
    total: state.income.reduce((sum, inc) => sum + inc.currentAmount, 0),
  };

  // Computed: Bills Summary
  const billsSummary: BillsSummary = (() => {
    const totalDue = state.bills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalPaid = state.bills
      .filter(bill => bill.paid)
      .reduce((sum, bill) => sum + bill.amount, 0);
    const totalRemaining = totalDue - totalPaid;
    const progress = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

    return { totalDue, totalPaid, totalRemaining, progress };
  })();

  // Computed: Savings Summary
  const savingsSummary: SavingsSummary = {
    total: state.savings.reduce((sum, sav) => sum + sav.amount, 0),
  };

  // Computed: Tus Ultimos Pesos (Income - Unpaid Bills)
  const tusUltimosPesos = incomeSummary.total - billsSummary.totalRemaining;

  // Helper: Check if monthly reset is needed
  const checkNeedsMonthlyReset = (): boolean => {
    const currentMonth = getCurrentMonth();
    return state.appState.lastSessionMonth !== currentMonth;
  };

  const contextValue: AppContextValue = {
    state,
    dispatch,
    incomeSummary,
    billsSummary,
    savingsSummary,
    tusUltimosPesos,
    getCurrentMonth,
    checkNeedsMonthlyReset,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

// ============================================
// Hook
// ============================================

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// ============================================
// Selector Hooks (for more granular subscriptions)
// ============================================

export function useIncome(): Income[] {
  const { state } = useAppContext();
  return state.income;
}

export function useBills(): Bill[] {
  const { state } = useAppContext();
  return state.bills;
}

export function useSavingsData(): Savings[] {
  const { state } = useAppContext();
  return state.savings;
}

export function useAppState(): AppState {
  const { state } = useAppContext();
  return state.appState;
}

// ============================================
// Action Creator Helpers
// ============================================

export const createIncome = (name: string, defaultAmount: number): Income => ({
  id: uuidv4(),
  name,
  defaultAmount,
  currentAmount: defaultAmount,
});

export const createBill = (name: string, amount: number): Bill => ({
  id: uuidv4(),
  name,
  amount,
  paid: false,
});

export const createSavings = (name: string, amount: number): Savings => ({
  id: uuidv4(),
  name,
  amount,
});

export { getCurrentMonth, generateVersionString };

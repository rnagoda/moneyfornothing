/**
 * useMonthlyReset Hook
 * Handles automatic monthly reset logic
 */

import { useCallback, useEffect, useState } from 'react';
import { useAppContext, getCurrentMonth } from '../context/AppContext';
import { getStorage } from '../storage';

interface UseMonthlyResetReturn {
  // State
  needsReset: boolean;
  lastSessionMonth: string;
  currentMonth: string;

  // Actions
  performReset: () => Promise<void>;
  checkAndReset: () => Promise<boolean>;
}

export function useMonthlyReset(): UseMonthlyResetReturn {
  const { state, dispatch, checkNeedsMonthlyReset } = useAppContext();
  const [needsReset, setNeedsReset] = useState(false);
  const currentMonth = getCurrentMonth();

  // Check on mount and when lastSessionMonth changes
  useEffect(() => {
    setNeedsReset(checkNeedsMonthlyReset());
  }, [checkNeedsMonthlyReset, state.appState.lastSessionMonth]);

  const performReset = useCallback(async () => {
    dispatch({ type: 'PERFORM_MONTHLY_RESET' });

    // Persist all changes to storage
    const storage = await getStorage();

    // Update income (reset to defaults)
    const updatedIncome = state.income.map(inc => ({
      ...inc,
      currentAmount: inc.defaultAmount,
    }));
    await storage.saveIncome(updatedIncome);

    // Update bills (reset to unpaid)
    const updatedBills = state.bills.map(bill => ({
      ...bill,
      paid: false,
    }));
    await storage.saveBills(updatedBills);

    // Update app state
    const updatedAppState = {
      ...state.appState,
      lastSessionMonth: currentMonth,
    };
    await storage.saveAppState(updatedAppState);

    setNeedsReset(false);
  }, [dispatch, state.income, state.bills, state.appState, currentMonth]);

  const checkAndReset = useCallback(async (): Promise<boolean> => {
    if (checkNeedsMonthlyReset()) {
      await performReset();
      return true;
    }
    return false;
  }, [checkNeedsMonthlyReset, performReset]);

  return {
    needsReset,
    lastSessionMonth: state.appState.lastSessionMonth,
    currentMonth,
    performReset,
    checkAndReset,
  };
}

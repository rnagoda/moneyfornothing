/**
 * useIncome Hook
 * Manages income data with persistence
 */

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { getStorage } from '../storage';
import type { Income } from '../types';

interface UseIncomeReturn {
  // Data
  income: Income[];
  total: number;

  // Actions
  addIncome: (name: string, defaultAmount: number) => Promise<void>;
  updateCurrentAmount: (id: string, amount: number) => Promise<void>;
  updateDefaultAmount: (id: string, amount: number) => Promise<void>;
  updateName: (id: string, name: string) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export function useIncome(): UseIncomeReturn {
  const { state, dispatch, incomeSummary } = useAppContext();

  const addIncome = useCallback(
    async (name: string, defaultAmount: number) => {
      const newIncome: Income = {
        id: uuidv4(),
        name,
        defaultAmount,
        currentAmount: defaultAmount,
      };
      dispatch({ type: 'ADD_INCOME', payload: newIncome });

      // Persist to storage
      const storage = await getStorage();
      await storage.saveIncome([...state.income, newIncome]);
    },
    [dispatch, state.income]
  );

  const updateCurrentAmount = useCallback(
    async (id: string, currentAmount: number) => {
      dispatch({ type: 'UPDATE_INCOME', payload: { id, currentAmount } });

      // Persist to storage
      const updatedIncome = state.income.map(inc =>
        inc.id === id ? { ...inc, currentAmount } : inc
      );
      const storage = await getStorage();
      await storage.saveIncome(updatedIncome);
    },
    [dispatch, state.income]
  );

  const updateDefaultAmount = useCallback(
    async (id: string, defaultAmount: number) => {
      dispatch({ type: 'UPDATE_INCOME_DEFAULT', payload: { id, defaultAmount } });

      // Persist to storage
      const updatedIncome = state.income.map(inc =>
        inc.id === id ? { ...inc, defaultAmount } : inc
      );
      const storage = await getStorage();
      await storage.saveIncome(updatedIncome);
    },
    [dispatch, state.income]
  );

  const updateName = useCallback(
    async (id: string, name: string) => {
      dispatch({ type: 'UPDATE_INCOME_NAME', payload: { id, name } });

      // Persist to storage
      const updatedIncome = state.income.map(inc => (inc.id === id ? { ...inc, name } : inc));
      const storage = await getStorage();
      await storage.saveIncome(updatedIncome);
    },
    [dispatch, state.income]
  );

  const deleteIncome = useCallback(
    async (id: string) => {
      dispatch({ type: 'DELETE_INCOME', payload: id });

      // Persist to storage
      const updatedIncome = state.income.filter(inc => inc.id !== id);
      const storage = await getStorage();
      await storage.saveIncome(updatedIncome);
    },
    [dispatch, state.income]
  );

  const resetToDefaults = useCallback(async () => {
    dispatch({ type: 'RESET_INCOME_TO_DEFAULTS' });

    // Persist to storage
    const updatedIncome = state.income.map(inc => ({
      ...inc,
      currentAmount: inc.defaultAmount,
    }));
    const storage = await getStorage();
    await storage.saveIncome(updatedIncome);
  }, [dispatch, state.income]);

  return {
    income: state.income,
    total: incomeSummary.total,
    addIncome,
    updateCurrentAmount,
    updateDefaultAmount,
    updateName,
    deleteIncome,
    resetToDefaults,
  };
}

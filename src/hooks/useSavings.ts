/**
 * useSavings Hook
 * Manages savings data with persistence
 */

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { getStorage } from '../storage';
import type { Savings } from '../types';

interface UseSavingsReturn {
  // Data
  savings: Savings[];
  total: number;

  // Actions
  addSavings: (name: string, amount: number) => Promise<void>;
  updateSavings: (id: string, updates: Partial<Pick<Savings, 'name' | 'amount'>>) => Promise<void>;
  deleteSavings: (id: string) => Promise<void>;
}

export function useSavings(): UseSavingsReturn {
  const { state, dispatch, savingsSummary } = useAppContext();

  const addSavings = useCallback(
    async (name: string, amount: number) => {
      const newSavings: Savings = {
        id: uuidv4(),
        name,
        amount,
      };
      dispatch({ type: 'ADD_SAVINGS', payload: newSavings });

      // Persist to storage
      const storage = await getStorage();
      await storage.saveSavings([...state.savings, newSavings]);
    },
    [dispatch, state.savings]
  );

  const updateSavings = useCallback(
    async (id: string, updates: Partial<Pick<Savings, 'name' | 'amount'>>) => {
      dispatch({ type: 'UPDATE_SAVINGS', payload: { id, updates } });

      // Persist to storage
      const updatedSavings = state.savings.map(sav =>
        sav.id === id ? { ...sav, ...updates } : sav
      );
      const storage = await getStorage();
      await storage.saveSavings(updatedSavings);
    },
    [dispatch, state.savings]
  );

  const deleteSavings = useCallback(
    async (id: string) => {
      dispatch({ type: 'DELETE_SAVINGS', payload: id });

      // Persist to storage
      const updatedSavings = state.savings.filter(sav => sav.id !== id);
      const storage = await getStorage();
      await storage.saveSavings(updatedSavings);
    },
    [dispatch, state.savings]
  );

  return {
    savings: state.savings,
    total: savingsSummary.total,
    addSavings,
    updateSavings,
    deleteSavings,
  };
}

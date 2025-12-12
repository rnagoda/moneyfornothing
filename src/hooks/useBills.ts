/**
 * useBills Hook
 * Manages bills data with persistence
 */

import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../context/AppContext';
import { getStorage } from '../storage';
import type { Bill } from '../types';

interface UseBillsReturn {
  // Data
  bills: Bill[];
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
  progress: number;

  // Actions
  addBill: (name: string, amount: number) => Promise<void>;
  updateBill: (id: string, updates: Partial<Pick<Bill, 'name' | 'amount'>>) => Promise<void>;
  togglePaid: (id: string) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
}

export function useBills(): UseBillsReturn {
  const { state, dispatch, billsSummary } = useAppContext();

  const addBill = useCallback(
    async (name: string, amount: number) => {
      const newBill: Bill = {
        id: uuidv4(),
        name,
        amount,
        paid: false,
      };
      dispatch({ type: 'ADD_BILL', payload: newBill });

      // Persist to storage
      const storage = await getStorage();
      await storage.saveBills([...state.bills, newBill]);
    },
    [dispatch, state.bills]
  );

  const updateBill = useCallback(
    async (id: string, updates: Partial<Pick<Bill, 'name' | 'amount'>>) => {
      dispatch({ type: 'UPDATE_BILL', payload: { id, updates } });

      // Persist to storage
      const updatedBills = state.bills.map(bill =>
        bill.id === id ? { ...bill, ...updates } : bill
      );
      const storage = await getStorage();
      await storage.saveBills(updatedBills);
    },
    [dispatch, state.bills]
  );

  const togglePaid = useCallback(
    async (id: string) => {
      dispatch({ type: 'TOGGLE_BILL_PAID', payload: id });

      // Persist to storage
      const updatedBills = state.bills.map(bill =>
        bill.id === id ? { ...bill, paid: !bill.paid } : bill
      );
      const storage = await getStorage();
      await storage.saveBills(updatedBills);
    },
    [dispatch, state.bills]
  );

  const deleteBill = useCallback(
    async (id: string) => {
      dispatch({ type: 'DELETE_BILL', payload: id });

      // Persist to storage
      const updatedBills = state.bills.filter(bill => bill.id !== id);
      const storage = await getStorage();
      await storage.saveBills(updatedBills);
    },
    [dispatch, state.bills]
  );

  return {
    bills: state.bills,
    totalDue: billsSummary.totalDue,
    totalPaid: billsSummary.totalPaid,
    totalRemaining: billsSummary.totalRemaining,
    progress: billsSummary.progress,
    addBill,
    updateBill,
    togglePaid,
    deleteBill,
  };
}

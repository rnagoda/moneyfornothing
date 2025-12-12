/**
 * Storage interface definitions for Money For Nothing
 */

import type { AppData, Income, Bill, Savings, AppState } from '../types';

/**
 * Storage interface that all platform implementations must follow
 */
export interface StorageInterface {
  // Initialization
  initialize(): Promise<void>;

  // Full data operations
  loadAllData(): Promise<AppData | null>;
  saveAllData(data: AppData): Promise<void>;
  clearAllData(): Promise<void>;

  // Income operations
  getIncome(): Promise<Income[]>;
  saveIncome(income: Income[]): Promise<void>;

  // Bills operations
  getBills(): Promise<Bill[]>;
  saveBills(bills: Bill[]): Promise<void>;

  // Savings operations
  getSavings(): Promise<Savings[]>;
  saveSavings(savings: Savings[]): Promise<void>;

  // App state operations
  getAppState(): Promise<AppState | null>;
  saveAppState(appState: AppState): Promise<void>;
}

/**
 * Storage keys used across implementations
 */
export const STORAGE_KEYS = {
  INCOME: 'moneyfornothing_income',
  BILLS: 'moneyfornothing_bills',
  SAVINGS: 'moneyfornothing_savings',
  APP_STATE: 'moneyfornothing_appstate',
  ALL_DATA: 'moneyfornothing_data',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

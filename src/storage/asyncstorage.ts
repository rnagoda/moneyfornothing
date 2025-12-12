/**
 * AsyncStorage implementation for React Native (Android/iOS)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData, Income, Bill, Savings, AppState } from '../types';
import type { StorageInterface } from './types';
import { STORAGE_KEYS } from './types';

class AsyncStorageAdapter implements StorageInterface {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // AsyncStorage doesn't require explicit initialization
    // but we can verify it's accessible
    try {
      await AsyncStorage.getItem(STORAGE_KEYS.APP_STATE);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize AsyncStorage:', error);
      throw new Error('Storage initialization failed');
    }
  }

  // ============================================
  // Full Data Operations
  // ============================================

  async loadAllData(): Promise<AppData | null> {
    try {
      const [incomeJson, billsJson, savingsJson, appStateJson] = await AsyncStorage.multiGet([
        STORAGE_KEYS.INCOME,
        STORAGE_KEYS.BILLS,
        STORAGE_KEYS.SAVINGS,
        STORAGE_KEYS.APP_STATE,
      ]);

      const income = incomeJson[1] ? JSON.parse(incomeJson[1]) : null;
      const bills = billsJson[1] ? JSON.parse(billsJson[1]) : null;
      const savings = savingsJson[1] ? JSON.parse(savingsJson[1]) : null;
      const appState = appStateJson[1] ? JSON.parse(appStateJson[1]) : null;

      // If any required data is missing, return null (first launch)
      if (!income || !appState) {
        return null;
      }

      return {
        income,
        bills: bills ?? [],
        savings: savings ?? [],
        appState,
      };
    } catch (error) {
      console.error('Failed to load data from AsyncStorage:', error);
      return null;
    }
  }

  async saveAllData(data: AppData): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.INCOME, JSON.stringify(data.income)],
        [STORAGE_KEYS.BILLS, JSON.stringify(data.bills)],
        [STORAGE_KEYS.SAVINGS, JSON.stringify(data.savings)],
        [STORAGE_KEYS.APP_STATE, JSON.stringify(data.appState)],
      ]);
    } catch (error) {
      console.error('Failed to save data to AsyncStorage:', error);
      throw new Error('Failed to save data');
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.INCOME,
        STORAGE_KEYS.BILLS,
        STORAGE_KEYS.SAVINGS,
        STORAGE_KEYS.APP_STATE,
      ]);
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
      throw new Error('Failed to clear data');
    }
  }

  // ============================================
  // Income Operations
  // ============================================

  async getIncome(): Promise<Income[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.INCOME);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Failed to get income from AsyncStorage:', error);
      return [];
    }
  }

  async saveIncome(income: Income[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(income));
    } catch (error) {
      console.error('Failed to save income to AsyncStorage:', error);
      throw new Error('Failed to save income');
    }
  }

  // ============================================
  // Bills Operations
  // ============================================

  async getBills(): Promise<Bill[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.BILLS);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Failed to get bills from AsyncStorage:', error);
      return [];
    }
  }

  async saveBills(bills: Bill[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
    } catch (error) {
      console.error('Failed to save bills to AsyncStorage:', error);
      throw new Error('Failed to save bills');
    }
  }

  // ============================================
  // Savings Operations
  // ============================================

  async getSavings(): Promise<Savings[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SAVINGS);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Failed to get savings from AsyncStorage:', error);
      return [];
    }
  }

  async saveSavings(savings: Savings[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savings));
    } catch (error) {
      console.error('Failed to save savings to AsyncStorage:', error);
      throw new Error('Failed to save savings');
    }
  }

  // ============================================
  // App State Operations
  // ============================================

  async getAppState(): Promise<AppState | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.APP_STATE);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error('Failed to get app state from AsyncStorage:', error);
      return null;
    }
  }

  async saveAppState(appState: AppState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(appState));
    } catch (error) {
      console.error('Failed to save app state to AsyncStorage:', error);
      throw new Error('Failed to save app state');
    }
  }
}

// Export singleton instance
export const asyncStorageAdapter = new AsyncStorageAdapter();

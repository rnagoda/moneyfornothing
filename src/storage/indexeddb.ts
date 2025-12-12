/**
 * IndexedDB implementation for Web
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { AppData, Income, Bill, Savings, AppState } from '../types';
import type { StorageInterface } from './types';

const DB_NAME = 'MoneyForNothingDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  INCOME: 'income',
  BILLS: 'bills',
  SAVINGS: 'savings',
  APP_STATE: 'appState',
} as const;

interface MoneyForNothingDB {
  income: {
    key: string;
    value: Income;
  };
  bills: {
    key: string;
    value: Bill;
  };
  savings: {
    key: string;
    value: Savings;
  };
  appState: {
    key: string;
    value: AppState;
  };
}

class IndexedDBAdapter implements StorageInterface {
  private db: IDBPDatabase<MoneyForNothingDB> | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized && this.db) return;

    try {
      this.db = await openDB<MoneyForNothingDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains(STORES.INCOME)) {
            db.createObjectStore(STORES.INCOME, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.BILLS)) {
            db.createObjectStore(STORES.BILLS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.SAVINGS)) {
            db.createObjectStore(STORES.SAVINGS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.APP_STATE)) {
            db.createObjectStore(STORES.APP_STATE, { keyPath: 'id' });
          }
        },
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw new Error('Storage initialization failed');
    }
  }

  private ensureDB(): IDBPDatabase<MoneyForNothingDB> {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // ============================================
  // Full Data Operations
  // ============================================

  async loadAllData(): Promise<AppData | null> {
    try {
      const db = this.ensureDB();

      const [income, bills, savings, appStateRecords] = await Promise.all([
        db.getAll(STORES.INCOME),
        db.getAll(STORES.BILLS),
        db.getAll(STORES.SAVINGS),
        db.getAll(STORES.APP_STATE),
      ]);

      // AppState is stored with a fixed key 'main'
      const appState = appStateRecords.find(record => (record as AppState & { id?: string }).id === 'main') as AppState | undefined;

      // If no app state exists, this is first launch
      if (!appState || income.length === 0) {
        return null;
      }

      // Remove the 'id' field we added for IndexedDB
      const cleanAppState: AppState = {
        lastSessionMonth: appState.lastSessionMonth,
        versionString: appState.versionString,
        hasCompletedSetup: appState.hasCompletedSetup,
      };

      return {
        income,
        bills,
        savings,
        appState: cleanAppState,
      };
    } catch (error) {
      console.error('Failed to load data from IndexedDB:', error);
      return null;
    }
  }

  async saveAllData(data: AppData): Promise<void> {
    try {
      const db = this.ensureDB();

      const tx = db.transaction([STORES.INCOME, STORES.BILLS, STORES.SAVINGS, STORES.APP_STATE], 'readwrite');

      // Clear existing data
      await Promise.all([
        tx.objectStore(STORES.INCOME).clear(),
        tx.objectStore(STORES.BILLS).clear(),
        tx.objectStore(STORES.SAVINGS).clear(),
        tx.objectStore(STORES.APP_STATE).clear(),
      ]);

      // Add new data
      const incomeStore = tx.objectStore(STORES.INCOME);
      const billsStore = tx.objectStore(STORES.BILLS);
      const savingsStore = tx.objectStore(STORES.SAVINGS);
      const appStateStore = tx.objectStore(STORES.APP_STATE);

      await Promise.all([
        ...data.income.map(item => incomeStore.add(item)),
        ...data.bills.map(item => billsStore.add(item)),
        ...data.savings.map(item => savingsStore.add(item)),
        appStateStore.add({ ...data.appState, id: 'main' } as AppState & { id: string }),
      ]);

      await tx.done;
    } catch (error) {
      console.error('Failed to save data to IndexedDB:', error);
      throw new Error('Failed to save data');
    }
  }

  async clearAllData(): Promise<void> {
    try {
      const db = this.ensureDB();

      const tx = db.transaction([STORES.INCOME, STORES.BILLS, STORES.SAVINGS, STORES.APP_STATE], 'readwrite');

      await Promise.all([
        tx.objectStore(STORES.INCOME).clear(),
        tx.objectStore(STORES.BILLS).clear(),
        tx.objectStore(STORES.SAVINGS).clear(),
        tx.objectStore(STORES.APP_STATE).clear(),
      ]);

      await tx.done;
    } catch (error) {
      console.error('Failed to clear IndexedDB:', error);
      throw new Error('Failed to clear data');
    }
  }

  // ============================================
  // Income Operations
  // ============================================

  async getIncome(): Promise<Income[]> {
    try {
      const db = this.ensureDB();
      return await db.getAll(STORES.INCOME);
    } catch (error) {
      console.error('Failed to get income from IndexedDB:', error);
      return [];
    }
  }

  async saveIncome(income: Income[]): Promise<void> {
    try {
      const db = this.ensureDB();
      const tx = db.transaction(STORES.INCOME, 'readwrite');
      const store = tx.objectStore(STORES.INCOME);

      await store.clear();
      await Promise.all(income.map(item => store.add(item)));
      await tx.done;
    } catch (error) {
      console.error('Failed to save income to IndexedDB:', error);
      throw new Error('Failed to save income');
    }
  }

  // ============================================
  // Bills Operations
  // ============================================

  async getBills(): Promise<Bill[]> {
    try {
      const db = this.ensureDB();
      return await db.getAll(STORES.BILLS);
    } catch (error) {
      console.error('Failed to get bills from IndexedDB:', error);
      return [];
    }
  }

  async saveBills(bills: Bill[]): Promise<void> {
    try {
      const db = this.ensureDB();
      const tx = db.transaction(STORES.BILLS, 'readwrite');
      const store = tx.objectStore(STORES.BILLS);

      await store.clear();
      await Promise.all(bills.map(item => store.add(item)));
      await tx.done;
    } catch (error) {
      console.error('Failed to save bills to IndexedDB:', error);
      throw new Error('Failed to save bills');
    }
  }

  // ============================================
  // Savings Operations
  // ============================================

  async getSavings(): Promise<Savings[]> {
    try {
      const db = this.ensureDB();
      return await db.getAll(STORES.SAVINGS);
    } catch (error) {
      console.error('Failed to get savings from IndexedDB:', error);
      return [];
    }
  }

  async saveSavings(savings: Savings[]): Promise<void> {
    try {
      const db = this.ensureDB();
      const tx = db.transaction(STORES.SAVINGS, 'readwrite');
      const store = tx.objectStore(STORES.SAVINGS);

      await store.clear();
      await Promise.all(savings.map(item => store.add(item)));
      await tx.done;
    } catch (error) {
      console.error('Failed to save savings to IndexedDB:', error);
      throw new Error('Failed to save savings');
    }
  }

  // ============================================
  // App State Operations
  // ============================================

  async getAppState(): Promise<AppState | null> {
    try {
      const db = this.ensureDB();
      const record = await db.get(STORES.APP_STATE, 'main');

      if (!record) return null;

      // Remove the 'id' field we added for IndexedDB
      return {
        lastSessionMonth: record.lastSessionMonth,
        versionString: record.versionString,
        hasCompletedSetup: record.hasCompletedSetup,
      };
    } catch (error) {
      console.error('Failed to get app state from IndexedDB:', error);
      return null;
    }
  }

  async saveAppState(appState: AppState): Promise<void> {
    try {
      const db = this.ensureDB();
      await db.put(STORES.APP_STATE, { ...appState, id: 'main' } as AppState & { id: string });
    } catch (error) {
      console.error('Failed to save app state to IndexedDB:', error);
      throw new Error('Failed to save app state');
    }
  }
}

// Export singleton instance
export const indexedDBAdapter = new IndexedDBAdapter();

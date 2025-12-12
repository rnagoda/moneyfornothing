/**
 * Storage abstraction layer for Money For Nothing
 * Detects platform and provides appropriate storage implementation
 */

import { Platform } from 'react-native';
import type { StorageInterface } from './types';

// Lazy-load adapters to avoid importing unnecessary code
let storageInstance: StorageInterface | null = null;

/**
 * Get the appropriate storage adapter for the current platform
 */
export async function getStorage(): Promise<StorageInterface> {
  if (storageInstance) {
    return storageInstance;
  }

  if (Platform.OS === 'web') {
    // Web platform - use IndexedDB
    const { indexedDBAdapter } = await import('./indexeddb');
    storageInstance = indexedDBAdapter;
  } else {
    // Native platforms (Android/iOS) - use AsyncStorage
    const { asyncStorageAdapter } = await import('./asyncstorage');
    storageInstance = asyncStorageAdapter;
  }

  // Initialize the storage
  await storageInstance.initialize();

  return storageInstance;
}

/**
 * Get storage synchronously (must be called after getStorage has initialized)
 * Throws if storage hasn't been initialized yet
 */
export function getStorageSync(): StorageInterface {
  if (!storageInstance) {
    throw new Error('Storage not initialized. Call getStorage() first.');
  }
  return storageInstance;
}

/**
 * Check if storage has been initialized
 */
export function isStorageInitialized(): boolean {
  return storageInstance !== null;
}

/**
 * Reset storage instance (useful for testing)
 */
export function resetStorageInstance(): void {
  storageInstance = null;
}

// Re-export types for convenience
export type { StorageInterface } from './types';
export { STORAGE_KEYS } from './types';

/**
 * SafeNeighbor AsyncStorage Wrapper
 * 
 * Typed wrapper around AsyncStorage with JSON serialization,
 * error handling, and offline caching support.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  /**
   * Get a value from storage, deserialized from JSON.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[Storage] Failed to read key "${key}":`, err);
      return null;
    }
  }

  /**
   * Set a value in storage, serialized to JSON.
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[Storage] Failed to write key "${key}":`, err);
    }
  }

  /**
   * Remove a key from storage.
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn(`[Storage] Failed to remove key "${key}":`, err);
    }
  }

  /**
   * Get multiple keys at once.
   */
  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, T | null> = {};
      for (const [key, raw] of pairs) {
        result[key] = raw ? (JSON.parse(raw) as T) : null;
      }
      return result;
    } catch (err) {
      console.warn('[Storage] Failed multi-read:', err);
      const result: Record<string, T | null> = {};
      keys.forEach((k) => (result[k] = null));
      return result;
    }
  }

  /**
   * Clear all app storage. Use with caution.
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (err) {
      console.warn('[Storage] Failed to clear:', err);
    }
  }

  /**
   * Get all storage keys.
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys() as string[];
    } catch (err) {
      console.warn('[Storage] Failed to get keys:', err);
      return [];
    }
  }

  /**
   * Cache with TTL. Returns cached value if fresh, null if expired.
   */
  async getCached<T>(
    key: string,
    ttlMs: number
  ): Promise<T | null> {
    const entry = await this.get<{ data: T; cachedAt: number }>(key);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > ttlMs) {
      await this.remove(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Set a value with cache metadata.
   */
  async setWithTTL<T>(key: string, data: T): Promise<void> {
    await this.set(key, { data, cachedAt: Date.now() });
  }
}

export const storage = new Storage();
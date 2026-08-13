interface CacheEntry<T> {
  value: T;
  expiry: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Set a value in the cache with a TTL (in seconds)
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiry = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Get a value from the cache, returns null if missing or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }
}

export const cache = new InMemoryCache();

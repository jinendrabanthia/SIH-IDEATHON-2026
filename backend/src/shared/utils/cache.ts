interface CacheEntry<T> {
  value: T;
  expiry: number;
}

/**
 * A simple, type-safe, in-memory TTL cache.
 * Used to cache public API responses and prevent rate-limiting or slow responses.
 */
export class TTLMemoryCache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private ttlMs: number;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, {
      value,
      expiry: Date.now() + this.ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

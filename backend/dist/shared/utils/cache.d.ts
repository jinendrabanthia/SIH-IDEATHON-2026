/**
 * A simple, type-safe, in-memory TTL cache.
 * Used to cache public API responses and prevent rate-limiting or slow responses.
 */
export declare class TTLMemoryCache<T> {
    private store;
    private ttlMs;
    constructor(ttlMs: number);
    get(key: string): T | null;
    set(key: string, value: T): void;
    delete(key: string): void;
    clear(): void;
}
//# sourceMappingURL=cache.d.ts.map
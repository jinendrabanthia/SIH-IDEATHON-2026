declare class InMemoryCache {
    private cache;
    /**
     * Set a value in the cache with a TTL (in seconds)
     */
    set<T>(key: string, value: T, ttlSeconds: number): void;
    /**
     * Get a value from the cache, returns null if missing or expired
     */
    get<T>(key: string): T | null;
}
export declare const cache: InMemoryCache;
export {};
//# sourceMappingURL=cache.d.ts.map
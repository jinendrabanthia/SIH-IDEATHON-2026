class InMemoryCache {
    cache = new Map();
    /**
     * Set a value in the cache with a TTL (in seconds)
     */
    set(key, value, ttlSeconds) {
        const expiry = Date.now() + ttlSeconds * 1000;
        this.cache.set(key, { value, expiry });
    }
    /**
     * Get a value from the cache, returns null if missing or expired
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
}
export const cache = new InMemoryCache();
//# sourceMappingURL=cache.js.map
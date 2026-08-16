/**
 * A simple, type-safe, in-memory TTL cache.
 * Used to cache public API responses and prevent rate-limiting or slow responses.
 */
export class TTLMemoryCache {
    store = new Map();
    ttlMs;
    constructor(ttlMs) {
        this.ttlMs = ttlMs;
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiry) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    set(key, value) {
        this.store.set(key, {
            value,
            expiry: Date.now() + this.ttlMs,
        });
    }
    delete(key) {
        this.store.delete(key);
    }
    clear() {
        this.store.clear();
    }
}
//# sourceMappingURL=cache.js.map
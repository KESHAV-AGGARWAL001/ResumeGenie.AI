class TieredCache {
    constructor({ maxSize = 500, defaultTTL = 300000 } = {}) {
        this._map = new Map();
        this._maxSize = maxSize;
        this._defaultTTL = defaultTTL;
        this._hits = 0;
        this._misses = 0;
    }

    get(key) {
        const entry = this._map.get(key);
        if (!entry) { this._misses++; return undefined; }
        if (Date.now() > entry.expires) {
            this._map.delete(key);
            this._misses++;
            return undefined;
        }
        // LRU refresh: re-insert to move to end
        this._map.delete(key);
        this._map.set(key, entry);
        this._hits++;
        return entry.value;
    }

    set(key, value, ttlMs) {
        this._map.delete(key);
        if (this._map.size >= this._maxSize) {
            const oldest = this._map.keys().next().value;
            this._map.delete(oldest);
        }
        this._map.set(key, {
            value,
            expires: Date.now() + (ttlMs ?? this._defaultTTL),
        });
    }

    has(key) {
        const entry = this._map.get(key);
        if (!entry) return false;
        if (Date.now() > entry.expires) {
            this._map.delete(key);
            return false;
        }
        return true;
    }

    delete(key) {
        return this._map.delete(key);
    }

    clear() {
        this._map.clear();
        this._hits = 0;
        this._misses = 0;
    }

    stats() {
        // Purge expired entries for accurate size
        const now = Date.now();
        for (const [k, v] of this._map) {
            if (now > v.expires) this._map.delete(k);
        }
        return {
            size: this._map.size,
            maxSize: this._maxSize,
            hits: this._hits,
            misses: this._misses,
            hitRate: this._hits + this._misses > 0
                ? ((this._hits / (this._hits + this._misses)) * 100).toFixed(1) + '%'
                : '0%',
        };
    }
}

module.exports = { TieredCache };

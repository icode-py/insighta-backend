const crypto = require('crypto');

// Simple in-memory cache (no Redis setup needed in 30 min)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const normalizeFilters = (filters) => {
    const normalized = {};
    const keys = Object.keys(filters).sort();

    for (const key of keys) {
        if (filters[key] !== undefined && filters[key] !== null) {
            normalized[key] = filters[key];
        }
    }

    return normalized;
};

const generateCacheKey = (filters, options) => {
    const normalized = normalizeFilters(filters);
    const data = JSON.stringify({ filters: normalized, options });
    return crypto.createHash('md5').update(data).digest('hex');
};

const get = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }

    return entry.data;
};

const set = (key, data) => {
    cache.set(key, {
        data,
        expiresAt: Date.now() + CACHE_TTL
    });
};

const invalidate = () => {
    cache.clear();
};

module.exports = { get, set, invalidate, generateCacheKey, normalizeFilters };
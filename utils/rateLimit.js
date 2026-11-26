// utils/rateLimit.js - Client-side sliding-window rate limiter

const attempts = new Map();

/**
 * Checks whether an action for a given key is within its allowed rate limit.
 * @param {string} key - Unique action/user identifier (e.g. 'login:email@example.com').
 * @param {number} [maxAttempts=5] - Maximum attempts allowed within windowMs.
 * @param {number} [windowMs=900000] - Window duration in milliseconds (default 15 minutes).
 * @returns {boolean} True if allowed, false if rate-limited.
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const userAttempts = attempts.get(key) || [];
    const recent = userAttempts.filter((t) => now - t < windowMs);
    if (recent.length >= maxAttempts) {
        attempts.set(key, recent);
        return false;
    }
    recent.push(now);
    attempts.set(key, recent);
    return true;
}

/**
 * Clears recorded attempts for a key (e.g. after successful authentication).
 * @param {string} key
 */
export function resetRateLimit(key) {
    attempts.delete(key);
}

/**
 * Returns remaining lockout duration in milliseconds, or 0 if not limited.
 * @param {string} key
 * @param {number} [maxAttempts=5]
 * @param {number} [windowMs=900000]
 * @returns {number}
 */
export function getRemainingLockoutMs(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const recent = (attempts.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length < maxAttempts) return 0;
    return Math.max(0, windowMs - (now - recent[0]));
}

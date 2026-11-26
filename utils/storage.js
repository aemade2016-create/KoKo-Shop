// utils/storage.js - Web Crypto AES-GCM Encrypted localStorage Wrapper
const ENCRYPTION_KEY_NAME = 'koko_enc_key';
const ENCRYPTED_PREFIX = 'enc:v1:';
const SENSITIVE_KEYS = ['luxe_cart', 'luxe_wishlist', 'luxe_currentUser', 'currentUser'];

const memoryCache = new Map();

async function getOrCreateKey() {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
        return null;
    }
    let rawKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
    if (!rawKey) {
        rawKey = typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem(ENCRYPTION_KEY_NAME, rawKey);
    }
    const keyBytes = new TextEncoder().encode(rawKey.padEnd(32, '0').slice(0, 32));
    return crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

function bytesToBase64(bytes) {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

function base64ToBytes(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Encrypts and stores a value in localStorage using AES-GCM.
 * Updates the in-memory synchronous cache immediately.
 * @param {string} key
 * @param {unknown} value
 */
export async function setSecureItem(key, value) {
    memoryCache.set(key, value);
    try {
        const cryptoKey = await getOrCreateKey();
        if (!cryptoKey) {
            localStorage.setItem(key, JSON.stringify(value));
            return;
        }
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(JSON.stringify(value));
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded);
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        localStorage.setItem(key, ENCRYPTED_PREFIX + bytesToBase64(combined));
    } catch (err) {
        console.warn(`Secure storage write fallback for ${key}:`, err);
    }
}

/**
 * Reads and decrypts a value from localStorage (supports legacy plaintext migration).
 * @param {string} key
 * @param {unknown} [defaultValue=null]
 */
export async function getSecureItem(key, defaultValue = null) {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) {
            memoryCache.set(key, defaultValue);
            return defaultValue;
        }

        if (!stored.startsWith(ENCRYPTED_PREFIX)) {
            const parsed = JSON.parse(stored);
            memoryCache.set(key, parsed);
            // Transparently upgrade legacy plaintext to encrypted at rest
            await setSecureItem(key, parsed);
            return parsed;
        }

        const cryptoKey = await getOrCreateKey();
        if (!cryptoKey) return defaultValue;

        const combined = base64ToBytes(stored.slice(ENCRYPTED_PREFIX.length));
        const iv = combined.slice(0, 12);
        const encrypted = combined.slice(12);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, encrypted);
        const parsed = JSON.parse(new TextDecoder().decode(decrypted));
        memoryCache.set(key, parsed);
        return parsed;
    } catch {
        return defaultValue;
    }
}

/**
 * Synchronous read helper backed by in-memory decrypted cache + plaintext fallback.
 * @param {string} key
 * @param {unknown} [defaultValue=null]
 */
export function getCachedSecureItem(key, defaultValue = null) {
    if (memoryCache.has(key)) {
        const cached = memoryCache.get(key);
        return cached === undefined ? defaultValue : cached;
    }
    try {
        const stored = localStorage.getItem(key);
        if (!stored || stored.startsWith(ENCRYPTED_PREFIX)) return defaultValue;
        const parsed = JSON.parse(stored);
        memoryCache.set(key, parsed);
        return parsed;
    } catch {
        return defaultValue;
    }
}

/**
 * Removes an item from both memory cache and localStorage.
 * @param {string} key
 */
export function removeSecureItem(key) {
    memoryCache.delete(key);
    localStorage.removeItem(key);
}

/**
 * Hydrates and migrates all sensitive keys on startup, then dispatches 'secure-storage-ready'.
 * @param {string[]} [keys=SENSITIVE_KEYS]
 */
export async function hydrateSecureStorage(keys = SENSITIVE_KEYS) {
    await Promise.all(
        keys.map((k) => {
            const fallback = (k === 'luxe_cart' || k === 'luxe_wishlist') ? [] : null;
            return getSecureItem(k, fallback);
        })
    );
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('secure-storage-ready'));
    }
}

if (typeof window !== 'undefined') {
    window.setSecureItem = setSecureItem;
    window.getSecureItem = getSecureItem;
    window.getCachedSecureItem = getCachedSecureItem;
    window.removeSecureItem = removeSecureItem;
}

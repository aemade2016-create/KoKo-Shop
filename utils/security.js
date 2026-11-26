// utils/security.js - Single source of truth for XSS & URL protection

/**
 * Escapes HTML special characters to prevent XSS when interpolating untrusted strings.
 * @param {unknown} unsafe
 * @returns {string}
 */
export function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Validates and sanitizes URLs to block javascript:, vbscript:, and unsafe data: URIs.
 * @param {string} url
 * @param {string} [fallback='']
 * @returns {string}
 */
export function safeUrl(url, fallback = '') {
    if (!url || typeof url !== 'string') return fallback;
    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();
    if (
        lower.startsWith('javascript:') ||
        lower.startsWith('vbscript:') ||
        lower.startsWith('data:text/html') ||
        lower.startsWith('data:application/')
    ) {
        return fallback;
    }
    if (
        lower.startsWith('https://') ||
        lower.startsWith('http://') ||
        lower.startsWith('./') ||
        lower.startsWith('../') ||
        lower.startsWith('/') ||
        lower.startsWith('images/') ||
        lower.startsWith('data:image/') ||
        /^[a-zA-Z0-9_\-./]+$/.test(trimmed)
    ) {
        return trimmed;
    }
    return fallback;
}

// Attach to window for backward compatibility across modules & legacy globals
if (typeof window !== 'undefined') {
    window.escapeHtml = escapeHtml;
    window.safeUrl = safeUrl;
}

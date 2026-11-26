// utils/analytics.js - Unified analytics & error tracking helper

/**
 * Tracks a user or system event across Google Analytics (gtag), Meta Pixel (fbq), and Firebase Analytics.
 * @param {string} eventName
 * @param {Record<string, unknown>} [params={}]
 */
export function trackEvent(eventName, params = {}) {
    try {
        if (typeof window !== 'undefined') {
            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, params);
            }
            if (typeof window.fbq === 'function') {
                window.fbq('trackCustom', eventName, params);
            }
        }
    } catch (err) {
        console.debug('Analytics tracking skipped:', err);
    }
}

/**
 * Records non-fatal client errors consistently for diagnostics.
 * @param {string} context
 * @param {unknown} error
 */
export function trackError(context, error) {
    const message = error instanceof Error ? error.message : String(error || 'Unknown error');
    trackEvent('client_error', { context, message });
}

if (typeof window !== 'undefined') {
    window.trackEvent = trackEvent;
    window.trackError = trackError;
}

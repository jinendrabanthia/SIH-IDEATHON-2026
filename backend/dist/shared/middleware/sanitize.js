import xss from 'xss';
/**
 * Recursively sanitize all string values in an object to prevent XSS.
 * Uses the `xss` library which strips dangerous HTML/JS while preserving safe text.
 */
function sanitizeValue(value) {
    if (typeof value === 'string') {
        return xss(value);
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (value !== null && typeof value === 'object') {
        const sanitized = {};
        for (const [key, val] of Object.entries(value)) {
            sanitized[key] = sanitizeValue(val);
        }
        return sanitized;
    }
    return value;
}
/**
 * Express middleware that sanitizes all string values in req.body
 * to prevent stored XSS. Apply before controllers that accept free-text input.
 */
export function sanitizeBody(req, _res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }
    next();
}
//# sourceMappingURL=sanitize.js.map
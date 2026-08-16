/**
 * Global rate limiter — applied to all routes.
 * 100 requests per minute per IP.
 */
export declare const globalLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict limiter for expensive endpoints (LLM, planner).
 * 10 requests per minute per IP.
 */
export declare const strictLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Feedback limiter — prevents abuse of fact-status-changing endpoints.
 * 20 requests per minute per IP.
 */
export declare const feedbackLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Auth limiter — aggressive rate limiting for login/register endpoints.
 * 5 requests per 15 minutes per IP.
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map
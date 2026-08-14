import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter — applied to all routes.
 * 100 requests per minute per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again shortly.',
    },
  },
});

/**
 * Strict limiter for expensive endpoints (LLM, planner).
 * 10 requests per minute per IP.
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'This endpoint is rate limited. Please wait before trying again.',
    },
  },
});

/**
 * Feedback limiter — prevents abuse of fact-status-changing endpoints.
 * 20 requests per minute per IP.
 */
export const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Feedback submission rate limited. Please wait.',
    },
  },
});

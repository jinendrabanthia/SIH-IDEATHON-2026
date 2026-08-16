import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';

const DEV_SECRET_PREFIX = 'dev-jwt-secret';

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface AuthPayload {
  userId: string;
  email: string;
}

// Extend Express Request with optional auth
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Extracts and verifies JWT from the Authorization header.
 * Returns decoded payload or null if missing/invalid.
 */
function extractToken(req: Request): AuthPayload | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    if (!decoded.userId || !decoded.email) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Strict auth middleware — rejects unauthenticated requests with 401.
 * In MVP dev mode (JWT_SECRET starts with dev placeholder), it logs a warning
 * but still enforces if a token is provided.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const user = extractToken(req);

  if (user) {
    req.user = user;
    return next();
  }

  // In dev mode with placeholder secret, allow through with a warning
  const isDevSecret = env.JWT_SECRET.startsWith(DEV_SECRET_PREFIX);
  if (env.NODE_ENV === 'development' && isDevSecret) {
    console.warn(`[AUTH] ⚠ No auth token on ${req.method} ${req.path} — allowed in dev mode`);
    return next();
  }

  res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Provide a valid Bearer token.',
    },
  });
}

/**
 * Optional auth — attaches user if token is valid, but doesn't reject.
 * Useful for public endpoints that behave differently for logged-in users.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const user = extractToken(req);
  if (user) {
    req.user = user;
  }
  next();
}

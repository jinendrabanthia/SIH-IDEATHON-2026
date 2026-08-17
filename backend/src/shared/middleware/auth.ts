import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/index.js';

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

// Initialize Supabase client for auth verification
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

import { prisma } from '../db/index.js';

/**
 * Extracts and verifies JWT from the Authorization header via Supabase.
 * Returns decoded payload or null if missing/invalid.
 */
async function extractToken(req: Request): Promise<AuthPayload | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;

  const token = header.slice(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    // Auto-sync user to our database so foreign keys and profile routes work
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email || '' },
      create: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name || null,
        supabaseId: user.id,
      },
    });

    return { userId: user.id, email: user.email || '' };
  } catch {
    return null;
  }
}

/**
 * Strict auth middleware — rejects unauthenticated requests with 401.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await extractToken(req);

  if (user) {
    req.user = user;
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
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const user = await extractToken(req);
  if (user) {
    req.user = user;
  }
  next();
}

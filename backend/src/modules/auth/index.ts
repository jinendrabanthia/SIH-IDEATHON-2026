import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { env } from '../../shared/config/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import { registerSchema, loginSchema } from './schemas.js';
import { sanitizeBody } from '../../shared/middleware/sanitize.js';

const router = Router();

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;

// ─── Brute-force protection ────────────────────────────────────────────────
// In-memory store: IP → { count, blockedUntil }
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkBruteForce(ip: string): void {
  const record = loginAttempts.get(ip);
  if (!record) return;

  if (record.blockedUntil > Date.now()) {
    const remainingSec = Math.ceil((record.blockedUntil - Date.now()) / 1000);
    throw new AppError(
      `Too many failed login attempts. Try again in ${remainingSec} seconds.`,
      429,
      'LOGIN_LOCKED',
    );
  }

  // Reset if lockout expired
  if (record.blockedUntil <= Date.now() && record.count >= MAX_ATTEMPTS) {
    loginAttempts.delete(ip);
  }
}

function recordFailedAttempt(ip: string): void {
  const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = Date.now() + LOCKOUT_MS;
  }

  loginAttempts.set(ip, record);
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function signAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

async function createRefreshToken(userId: string): Promise<string> {
  const rawToken = randomUUID();
  const tokenHash = await bcrypt.hash(rawToken, 10); // lighter hash for refresh tokens
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return rawToken;
}

function setRefreshCookie(res: import('express').Response, token: string): void {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });
}

// ─── POST /register ─────────────────────────────────────────────────────────
router.post('/register', sanitizeBody, async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = await createRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        accessToken,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration data',
          details: err.flatten().fieldErrors,
        },
      });
      return;
    }
    next(err);
  }
});

// ─── POST /login ────────────────────────────────────────────────────────────
router.post('/login', sanitizeBody, async (req, res, next) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    checkBruteForce(ip);

    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      recordFailedAttempt(ip);
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      recordFailedAttempt(ip);
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Success — clear lockout
    clearAttempts(ip);

    // Revoke all old refresh tokens for this user (single-session enforcement)
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = await createRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    res.json({
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        accessToken,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid login data',
          details: err.flatten().fieldErrors,
        },
      });
      return;
    }
    next(err);
  }
});

// ─── POST /refresh ──────────────────────────────────────────────────────────
router.post('/refresh', async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refresh_token;
    if (!rawToken || typeof rawToken !== 'string') {
      throw new AppError('Refresh token required', 401, 'NO_REFRESH_TOKEN');
    }

    // Find all non-expired refresh tokens and match against the provided one
    const tokens = await prisma.refreshToken.findMany({
      where: { expiresAt: { gt: new Date() } },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    let matchedToken: (typeof tokens)[number] | null = null;
    for (const token of tokens) {
      const valid = await bcrypt.compare(rawToken, token.tokenHash);
      if (valid) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      // Clear cookie — token invalid or expired
      res.clearCookie('refresh_token', { path: '/api/v1/auth' });
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Rotate: delete old, issue new
    await prisma.refreshToken.delete({ where: { id: matchedToken.id } });

    const accessToken = signAccessToken(matchedToken.user.id, matchedToken.user.email);
    const newRefreshToken = await createRefreshToken(matchedToken.user.id);
    setRefreshCookie(res, newRefreshToken);

    res.json({
      data: {
        user: {
          id: matchedToken.user.id,
          email: matchedToken.user.email,
          name: matchedToken.user.name,
        },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /logout ───────────────────────────────────────────────────────────
router.post('/logout', async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refresh_token;

    if (rawToken && typeof rawToken === 'string') {
      // Best-effort: find and delete the matching refresh token
      const tokens = await prisma.refreshToken.findMany({
        where: { expiresAt: { gt: new Date() } },
      });

      for (const token of tokens) {
        const valid = await bcrypt.compare(rawToken, token.tokenHash);
        if (valid) {
          await prisma.refreshToken.delete({ where: { id: token.id } });
          break;
        }
      }
    }

    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
    res.json({ data: { success: true, message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
});

export default router;

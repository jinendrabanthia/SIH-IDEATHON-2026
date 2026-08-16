import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import { sanitizeBody } from '../../shared/middleware/sanitize.js';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// ─── Validation Schemas ──────────────────────────────────────────────────────

const preferencesSchema = z.object({
  budgetBand: z.enum(['BUDGET', 'MODERATE', 'PREMIUM']).optional(),
  pace: z.enum(['RELAXED', 'MODERATE', 'PACKED']).optional(),
  groupType: z.enum(['SOLO', 'COUPLE', 'FAMILY', 'GROUP']).optional(),
  interests: z.array(z.string().max(100)).max(20).optional(),
  foodPreferences: z.array(z.string().max(100)).max(20).optional(),
  transportPreference: z.enum(['WALKING', 'PUBLIC_TRANSIT', 'CAB', 'OWN_VEHICLE', 'MIXED']).optional(),
  accessibilityMobility: z.boolean().optional(),
  accessibilityVision: z.boolean().optional(),
  accessibilityHearing: z.boolean().optional(),
  accessibilityCognitive: z.boolean().optional(),
  accessibilityNotes: z.string().max(500).optional(),
  walkingToleranceMinutes: z.number().int().min(5).max(240).optional(),
  indoorOutdoorPreference: z.enum(['indoor', 'outdoor', 'mixed']).optional(),
  localBusinessPreference: z.boolean().optional(),
}).strict();

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  preferredLanguage: z.enum(['en', 'hi', 'or']).optional(),
}).strict();

// ─── GET /api/v1/users/me — fetch current user profile ──────────────────────
router.get('/me', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        preferredLanguage: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/v1/users/me — update name / language ────────────────────────
router.patch('/me', sanitizeBody, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const updates = profileUpdateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        preferredLanguage: true,
        updatedAt: true,
      },
    });

    res.json({ data: user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid profile data', details: err.flatten().fieldErrors },
      });
      return;
    }
    next(err);
  }
});

// ─── GET /api/v1/users/me/preferences ────────────────────────────────────────
router.get('/me/preferences', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const preferences = await prisma.userPreference.findUnique({
      where: { userId },
    });

    // Return null-safe: if no preferences exist yet, return sensible defaults
    res.json({
      data: preferences ?? {
        pace: 'MODERATE',
        groupType: 'SOLO',
        interests: [],
        foodPreferences: [],
        transportPreference: 'MIXED',
        accessibilityMobility: false,
        accessibilityVision: false,
        accessibilityHearing: false,
        accessibilityCognitive: false,
        walkingToleranceMinutes: 30,
        indoorOutdoorPreference: 'mixed',
        localBusinessPreference: false,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/v1/users/me/preferences — upsert full preferences ──────────────
router.put('/me/preferences', sanitizeBody, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const prefs = preferencesSchema.parse(req.body);

    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: prefs,
      create: { userId, ...prefs },
    });

    res.json({ data: preferences });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid preferences data', details: err.flatten().fieldErrors },
      });
      return;
    }
    next(err);
  }
});

// ─── PATCH /api/v1/users/me/preferences — partial update ────────────────────
router.patch('/me/preferences', sanitizeBody, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const prefs = preferencesSchema.parse(req.body);

    // Ensure a row exists before patching
    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: prefs,
      create: { userId, ...prefs },
    });

    res.json({ data: preferences });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid preferences data', details: err.flatten().fieldErrors },
      });
      return;
    }
    next(err);
  }
});

export default router;

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/middleware/errorHandler.js';

const router = Router();

// All favorites routes require authentication
router.use(requireAuth);

const addFavoriteSchema = z.object({
  attractionId: z.string().uuid(),
}).strict();

const paramSchema = z.object({
  attractionId: z.string().uuid(),
}).strict();

// GET /api/v1/favorites — list user's favorites
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        attraction: {
          select: {
            id: true,
            name: true,
            categories: true,
            latitude: true,
            longitude: true,
            address: true,
            description: true,
            indoorOutdoor: true,
            accessibilityWheelchair: true,
            accessibilityVisual: true,
            accessibilityHearing: true,
            accessibilityNotes: true,
            destinationId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      data: favorites.map((f) => ({
        id: f.id,
        attractionId: f.attractionId,
        createdAt: f.createdAt.toISOString(),
        attraction: f.attraction,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/favorites — add a favorite
router.post('/', async (req, res, next) => {
  try {
    const { attractionId } = addFavoriteSchema.parse(req.body);
    const userId = req.user!.userId;

    // Verify attraction exists
    const attraction = await prisma.attraction.findUnique({ where: { id: attractionId } });
    if (!attraction) {
      throw new AppError('Attraction not found', 404, 'NOT_FOUND');
    }

    // Upsert to avoid duplicate errors
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_attractionId: { userId, attractionId },
      },
      create: { userId, attractionId },
      update: {}, // no-op if already exists
    });

    res.status(201).json({
      data: {
        id: favorite.id,
        attractionId: favorite.attractionId,
        createdAt: favorite.createdAt.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: err.flatten().fieldErrors,
        },
      });
      return;
    }
    next(err);
  }
});

// DELETE /api/v1/favorites/:attractionId — remove a favorite
router.delete('/:attractionId', async (req, res, next) => {
  try {
    const { attractionId } = paramSchema.parse(req.params);
    const userId = req.user!.userId;

    await prisma.favorite.deleteMany({
      where: { userId, attractionId },
    });

    res.json({ data: { success: true, message: 'Favorite removed' } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid attraction ID',
          details: err.flatten().fieldErrors,
        },
      });
      return;
    }
    next(err);
  }
});

export default router;

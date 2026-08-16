import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';

const router = Router();

const uuidParamSchema = z.object({
  id: z.string().uuid(),
}).strict();

// GET all destinations
router.get('/destinations', async (req, res, next) => {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ data: destinations });
  } catch (err) {
    next(err);
  }
});

// GET attractions by destination
router.get('/destinations/:id/attractions', async (req, res, next) => {
  try {
    const { id } = uuidParamSchema.parse(req.params);

    // Verify destination exists
    const destination = await prisma.destination.findUnique({ where: { id } });
    if (!destination) {
      throw new AppError('Destination not found', 404, 'NOT_FOUND');
    }

    const attractions = await prisma.attraction.findMany({
      where: { destinationId: id },
      orderBy: { name: 'asc' },
    });
    res.json({ data: attractions });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid destination ID', details: err.flatten().fieldErrors },
      });
      return;
    }
    next(err);
  }
});

export default router;

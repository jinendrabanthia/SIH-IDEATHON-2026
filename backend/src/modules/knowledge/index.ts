import { Router } from 'express';
import { prisma } from '../../shared/db/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';

const router = Router();

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
    const { id } = req.params;
    const attractions = await prisma.attraction.findMany({
      where: { destinationId: id },
      orderBy: { name: 'asc' },
    });
    res.json({ data: attractions });
  } catch (err) {
    next(err);
  }
});

export default router;

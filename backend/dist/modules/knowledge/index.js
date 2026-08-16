import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
const router = Router();
// ─── Schemas ─────────────────────────────────────────────────────────────────
const idParamSchema = z.object({
    id: z.string().min(1).max(100), // Accepts both UUID and slug IDs (e.g. 'dest-bhubaneswar')
}).strict();
const destinationsQuerySchema = z.object({
    region: z.string().optional(),
    country: z.string().optional(),
}).strict();
const attractionsQuerySchema = z.object({
    categories: z.string().optional(), // comma-separated list: "Heritage,Spiritual"
    accessibilityWheelchair: z.enum(['true', 'false']).optional(),
    indoorOutdoor: z.enum(['indoor', 'outdoor', 'mixed']).optional(),
    search: z.string().max(100).optional(), // name search
}).strict();
// ─── GET /destinations — list all destinations ───────────────────────────────
router.get('/destinations', async (req, res, next) => {
    try {
        const query = destinationsQuerySchema.safeParse(req.query);
        const where = query.success
            ? {
                ...(query.data.region ? { region: { contains: query.data.region, mode: 'insensitive' } } : {}),
                ...(query.data.country ? { country: { contains: query.data.country, mode: 'insensitive' } } : {}),
            }
            : {};
        const destinations = await prisma.destination.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        res.json({ data: destinations });
    }
    catch (err) {
        next(err);
    }
});
// ─── GET /destinations/:id — single destination with attraction count ─────────
router.get('/destinations/:id', async (req, res, next) => {
    try {
        const { id } = idParamSchema.parse(req.params);
        const destination = await prisma.destination.findUnique({
            where: { id },
            include: {
                _count: { select: { attractions: true } },
            },
        });
        if (!destination) {
            throw new AppError('Destination not found', 404, 'NOT_FOUND');
        }
        res.json({ data: destination });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid destination ID' } });
            return;
        }
        next(err);
    }
});
// ─── GET /destinations/:id/attractions — list attractions with optional filters ─
router.get('/destinations/:id/attractions', async (req, res, next) => {
    try {
        const { id } = idParamSchema.parse(req.params);
        const queryResult = attractionsQuerySchema.safeParse(req.query);
        const filters = queryResult.success ? queryResult.data : {};
        const destination = await prisma.destination.findUnique({ where: { id } });
        if (!destination) {
            throw new AppError('Destination not found', 404, 'NOT_FOUND');
        }
        // Build Prisma where clause from filters
        const where = { destinationId: id };
        if (filters.accessibilityWheelchair === 'true') {
            where.accessibilityWheelchair = true;
        }
        if (filters.indoorOutdoor) {
            where.indoorOutdoor = filters.indoorOutdoor;
        }
        if (filters.search) {
            where.name = { contains: filters.search, mode: 'insensitive' };
        }
        let attractions = await prisma.attraction.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        // Category filter — done in-memory since categories is a String[] field
        if (filters.categories) {
            const requested = filters.categories.split(',').map((c) => c.trim().toLowerCase());
            attractions = attractions.filter((a) => a.categories.some((cat) => requested.includes(cat.toLowerCase())));
        }
        res.json({ data: attractions });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid destination ID' } });
            return;
        }
        next(err);
    }
});
export default router;
//# sourceMappingURL=index.js.map
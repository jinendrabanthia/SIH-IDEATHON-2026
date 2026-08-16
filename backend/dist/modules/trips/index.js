import { Router } from 'express';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import { globalLimiter } from '../../shared/middleware/rateLimiter.js';
const router = Router();
// ─── Schemas ────────────────────────────────────────────────────────────────
const createTripSchema = z.object({
    destinationId: z.string().min(1).max(100), // supports both UUID and slug IDs
    title: z.string().min(1).max(200).default('My Trip'),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z.enum(['DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED']).default('DRAFT'),
}).strict();
const updateTripSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED']).optional(),
    isPublic: z.boolean().optional(),
}).strict();
const saveSnapshotSchema = z.object({
    itinerarySnapshot: z.record(z.unknown()),
}).strict();
const uuidParamSchema = z.object({
    id: z.string().uuid(),
}).strict();
const shareTokenParamSchema = z.object({
    token: z.string().min(8).max(128),
}).strict();
// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateShareToken() {
    // 32 bytes = 64 hex chars — cryptographically unguessable
    return randomBytes(32).toString('hex');
}
function tripToPublic(trip) {
    // Strip all owner-identifying fields for public share view
    return {
        id: trip.id,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        itinerarySnapshot: trip.itinerarySnapshot,
        createdAt: trip.createdAt,
        // NOTE: userId, user email, shareToken are deliberately excluded
    };
}
// ─── Authenticated Routes ────────────────────────────────────────────────────
// GET /api/v1/trips — list user's trips
router.get('/', requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const trips = await prisma.trip.findMany({
            where: { userId },
            include: {
                destination: {
                    select: { id: true, name: true, region: true, country: true },
                },
                itineraries: {
                    select: { id: true, generatedAt: true, validated: true },
                    orderBy: { generatedAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { startDate: 'asc' },
        });
        res.json({
            data: trips.map((trip) => ({
                id: trip.id,
                title: trip.title,
                destinationId: trip.destinationId,
                destination: trip.destination,
                startDate: trip.startDate.toISOString(),
                endDate: trip.endDate.toISOString(),
                status: trip.status,
                isPublic: trip.isPublic,
                shareToken: trip.isPublic ? trip.shareToken : null, // only expose token if public
                hasSnapshot: trip.itinerarySnapshot !== null,
                hasItinerary: trip.itineraries.length > 0,
                createdAt: trip.createdAt.toISOString(),
                updatedAt: trip.updatedAt.toISOString(),
            })),
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/v1/trips/:id — get trip details with itinerary
router.get('/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = uuidParamSchema.parse(req.params);
        const userId = req.user.userId;
        const trip = await prisma.trip.findUnique({
            where: { id },
            include: {
                destination: true,
                itineraries: {
                    include: {
                        items: {
                            include: {
                                attraction: {
                                    select: { id: true, name: true, categories: true, latitude: true, longitude: true },
                                },
                            },
                            orderBy: [{ dayNumber: 'asc' }, { sequence: 'asc' }],
                        },
                    },
                    orderBy: { generatedAt: 'desc' },
                    take: 1,
                },
            },
        });
        if (!trip)
            throw new AppError('Trip not found', 404, 'NOT_FOUND');
        // Ownership check — service-role key bypasses RLS, so we enforce in code
        if (trip.userId !== userId)
            throw new AppError('Trip not found', 404, 'NOT_FOUND');
        res.json({
            data: {
                ...trip,
                startDate: trip.startDate.toISOString(),
                endDate: trip.endDate.toISOString(),
                shareToken: trip.isPublic ? trip.shareToken : null,
            },
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid trip ID', details: err.flatten().fieldErrors } });
            return;
        }
        next(err);
    }
});
// POST /api/v1/trips — create a new trip
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const { destinationId, title, startDate, endDate, status } = createTripSchema.parse(req.body);
        const userId = req.user.userId;
        const destination = await prisma.destination.findUnique({ where: { id: destinationId } });
        if (!destination)
            throw new AppError('Destination not found', 404, 'NOT_FOUND');
        if (new Date(endDate) <= new Date(startDate)) {
            throw new AppError('End date must be after start date', 400, 'INVALID_DATES');
        }
        const trip = await prisma.trip.create({
            data: { userId, destinationId, title, startDate: new Date(startDate), endDate: new Date(endDate), status },
            include: {
                destination: { select: { id: true, name: true, region: true, country: true } },
            },
        });
        res.status(201).json({
            data: {
                id: trip.id,
                title: trip.title,
                destinationId: trip.destinationId,
                destination: trip.destination,
                startDate: trip.startDate.toISOString(),
                endDate: trip.endDate.toISOString(),
                status: trip.status,
                isPublic: trip.isPublic,
                shareToken: null,
                createdAt: trip.createdAt.toISOString(),
            },
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid trip data', details: err.flatten().fieldErrors } });
            return;
        }
        next(err);
    }
});
// PATCH /api/v1/trips/:id — update trip metadata (title, dates, status, isPublic)
router.patch('/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = uuidParamSchema.parse(req.params);
        const updates = updateTripSchema.parse(req.body);
        const userId = req.user.userId;
        const existing = await prisma.trip.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId)
            throw new AppError('Trip not found', 404, 'NOT_FOUND');
        const data = {};
        if (updates.title !== undefined)
            data.title = updates.title;
        if (updates.startDate)
            data.startDate = new Date(updates.startDate);
        if (updates.endDate)
            data.endDate = new Date(updates.endDate);
        if (updates.status)
            data.status = updates.status;
        // Handle sharing: generate token when making public, null it when making private
        if (updates.isPublic === true && !existing.isPublic) {
            data.isPublic = true;
            data.shareToken = generateShareToken();
        }
        else if (updates.isPublic === false && existing.isPublic) {
            data.isPublic = false;
            data.shareToken = null;
        }
        const trip = await prisma.trip.update({ where: { id }, data });
        res.json({
            data: {
                id: trip.id,
                title: trip.title,
                status: trip.status,
                isPublic: trip.isPublic,
                shareToken: trip.isPublic ? trip.shareToken : null,
                shareUrl: trip.isPublic && trip.shareToken
                    ? `/share/${trip.shareToken}`
                    : null,
                startDate: trip.startDate.toISOString(),
                endDate: trip.endDate.toISOString(),
                updatedAt: trip.updatedAt.toISOString(),
            },
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid update data', details: err.flatten().fieldErrors } });
            return;
        }
        next(err);
    }
});
// POST /api/v1/trips/:id/snapshot — save generated itinerary into the trip (freeze it)
router.post('/:id/snapshot', requireAuth, async (req, res, next) => {
    try {
        const { id } = uuidParamSchema.parse(req.params);
        const { itinerarySnapshot } = saveSnapshotSchema.parse(req.body);
        const userId = req.user.userId;
        const existing = await prisma.trip.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId)
            throw new AppError('Trip not found', 404, 'NOT_FOUND');
        const trip = await prisma.trip.update({
            where: { id },
            // Prisma Json fields require explicit cast via Prisma.InputJsonValue
            data: { itinerarySnapshot: itinerarySnapshot },
        });
        res.json({
            data: {
                id: trip.id,
                hasSnapshot: trip.itinerarySnapshot !== null,
                updatedAt: trip.updatedAt.toISOString(),
                message: 'Itinerary snapshot saved. Facts are frozen at this version. Use "Verify Facts" to check if they are still current.',
            },
        });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid snapshot data', details: err.flatten().fieldErrors } });
            return;
        }
        next(err);
    }
});
// DELETE /api/v1/trips/:id — delete trip
router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const { id } = uuidParamSchema.parse(req.params);
        const userId = req.user.userId;
        const existing = await prisma.trip.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId)
            throw new AppError('Trip not found', 404, 'NOT_FOUND');
        await prisma.trip.delete({ where: { id } });
        res.json({ data: { success: true, message: 'Trip deleted' } });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid trip ID', details: err.flatten().fieldErrors } });
            return;
        }
        next(err);
    }
});
// ─── Public Share Route (Feature 2) ─────────────────────────────────────────
// GET /api/v1/trips/share/:token — NO AUTH REQUIRED, rate-limited
// Returns only trips with is_public=true and matching share_token
// NEVER leaks owner email/userId
router.get('/share/:token', globalLimiter, async (req, res, next) => {
    try {
        const { token } = shareTokenParamSchema.parse(req.params);
        const trip = await prisma.trip.findUnique({
            where: { shareToken: token },
            include: {
                destination: {
                    select: { id: true, name: true, region: true, country: true, latitude: true, longitude: true },
                },
            },
        });
        if (!trip || !trip.isPublic) {
            throw new AppError('Shared trip not found or is no longer public', 404, 'NOT_FOUND');
        }
        res.json({ data: tripToPublic(trip) });
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid share token', details: err.flatten().fieldErrors } });
            return;
        }
        next(err);
    }
});
export default router;
//# sourceMappingURL=index.js.map
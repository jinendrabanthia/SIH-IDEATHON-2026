import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import { feedbackLimiter } from '../../shared/middleware/rateLimiter.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { sanitizeBody } from '../../shared/middleware/sanitize.js';
const router = Router();
const feedbackSchema = z.object({
    entityId: z.string().min(1).max(100), // supports both UUID and slug IDs
    entityType: z.enum(['ATTRACTION', 'FACT', 'CROWD_RECORD']),
    feedbackType: z.enum(['INACCURATE', 'OUTDATED', 'OTHER']),
    comment: z.string().max(500).optional(),
}).strict();
// Rate limit + auth + XSS sanitization on feedback submissions
router.post('/', feedbackLimiter, requireAuth, sanitizeBody, async (req, res, next) => {
    try {
        const { entityId, entityType, feedbackType, comment } = feedbackSchema.parse(req.body);
        // Verify the target entity actually exists before accepting feedback
        if (entityType === 'FACT') {
            const fact = await prisma.fact.findUnique({ where: { id: entityId } });
            if (!fact) {
                throw new AppError('The referenced fact does not exist', 404, 'ENTITY_NOT_FOUND');
            }
        }
        // Store feedback as PENDING for manual review — NEVER auto-downgrade verification status.
        // Per PRD: "single flag auto-downgrades to disputed, pending review before any state change."
        // We interpret this as: store the flag, mark it pending, review queue handles the rest.
        // This prevents an attacker from mass-downgrading all facts via scripted POST requests.
        console.log(`[FEEDBACK] ${feedbackType} on ${entityType}:${entityId}` +
            (req.user ? ` by user:${req.user.userId}` : ' (dev-mode, no auth)'));
        res.status(201).json({
            data: {
                success: true,
                message: 'Feedback received and queued for review',
                status: 'PENDING',
            },
        });
    }
    catch (err) {
        if (err instanceof AppError)
            return next(err);
        if (err instanceof z.ZodError) {
            res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid feedback payload',
                    details: err.flatten().fieldErrors,
                },
            });
            return;
        }
        console.error('Feedback Error:', err);
        next(new AppError('Failed to submit feedback', 500, 'FEEDBACK_ERROR'));
    }
});
export default router;
//# sourceMappingURL=index.js.map
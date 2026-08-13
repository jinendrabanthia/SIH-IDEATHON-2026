import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';

const router = Router();

const feedbackSchema = z.object({
  entityId: z.string().uuid(),
  entityType: z.enum(['ATTRACTION', 'FACT', 'CROWD_RECORD']),
  feedbackType: z.enum(['INACCURATE', 'OUTDATED', 'OTHER']),
  comment: z.string().optional()
});

router.post('/', async (req, res, next) => {
  try {
    const { entityId, entityType, feedbackType, comment } = feedbackSchema.parse(req.body);

    // In a full implementation, we'd store the feedback in a Feedback table.
    // For the MVP, if a fact is reported as INACCURATE, auto-downgrade it to DISPUTED.
    
    if (entityType === 'FACT' && (feedbackType === 'INACCURATE' || feedbackType === 'OUTDATED')) {
      await prisma.fact.update({
        where: { id: entityId },
        data: { verificationStatus: 'DISPUTED' }
      });
      console.log(`Fact ${entityId} downgraded to DISPUTED due to user feedback.`);
    }

    res.status(201).json({ data: { success: true, message: 'Feedback received' } });
  } catch (err) {
    console.error('Feedback Error:', err);
    next(new AppError('Failed to submit feedback', 400, 'FEEDBACK_ERROR'));
  }
});

export default router;

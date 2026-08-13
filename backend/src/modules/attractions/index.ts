import { Router } from 'express';
import { prisma } from '../../shared/db/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';

const router = Router();

// GET all facts for an attraction with provenance details
router.get('/:id/facts', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify attraction exists
    const attraction = await prisma.attraction.findUnique({
      where: { id },
    });
    
    if (!attraction) {
      throw new AppError('Attraction not found', 404, 'NOT_FOUND');
    }

    const facts = await prisma.fact.findMany({
      where: { 
        entityType: 'attraction',
        entityId: id 
      },
      include: {
        source: {
          select: {
            name: true,
            sourceType: true,
          }
        }
      }
    });

    // Map to FactProvenance DTO
    const provenance = facts.map(fact => ({
      fact_id: fact.id,
      fact_key: fact.factKey,
      fact_value: fact.factValue,
      source_name: fact.source.name,
      source_type: fact.source.sourceType,
      verification_status: fact.verificationStatus,
      confidence: fact.confidence,
      timestamp: fact.timestamp.toISOString(),
      last_checked: fact.lastChecked.toISOString(),
      geographic_scope: fact.geographicScope,
    }));

    res.json({ data: provenance });
  } catch (err) {
    next(err);
  }
});

export default router;

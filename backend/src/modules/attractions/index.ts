import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';

const router = Router();

const idParamSchema = z.object({
  id: z.string().min(1).max(100), // supports both UUID and slug IDs
}).strict();

// ─── GET /:id/facts — full provenance for all facts of an attraction ──────────
router.get('/:id/facts', async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const attraction = await prisma.attraction.findUnique({ where: { id } });
    if (!attraction) throw new AppError('Attraction not found', 404, 'NOT_FOUND');

    const facts = await prisma.fact.findMany({
      where: { entityType: 'attraction', entityId: id },
      include: { source: { select: { name: true, sourceType: true } } },
    });

    const provenance = facts.map((fact) => ({
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
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid attraction ID' } });
      return;
    }
    next(err);
  }
});

// ─── GET /:id/alternatives — suggest similar attractions in the same destination ─
// Returns up to 4 alternatives that share at least one category with the original,
// excluding the original itself, ordered by category overlap (most relevant first).
router.get('/:id/alternatives', async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const attraction = await prisma.attraction.findUnique({ where: { id } });
    if (!attraction) throw new AppError('Attraction not found', 404, 'NOT_FOUND');

    // Fetch all other attractions in the same destination
    const candidates = await prisma.attraction.findMany({
      where: {
        destinationId: attraction.destinationId,
        id: { not: id },
      },
    });

    // Score each candidate by how many categories it shares with the original
    const scored = candidates
      .map((c) => ({
        ...c,
        overlap: c.categories.filter((cat) => attraction.categories.includes(cat)).length,
      }))
      .filter((c) => c.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, 4);

    // If fewer than 2 matches, pad with remaining attractions (at least show something)
    const result = scored.length >= 2
      ? scored
      : candidates
        .filter((c) => !scored.find((s) => s.id === c.id))
        .slice(0, 4 - scored.length)
        .map((c) => ({ ...c, overlap: 0 }));

    const combined = [...scored, ...result].slice(0, 4);

    res.json({
      data: combined.map(({ overlap: _o, ...rest }) => rest),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid attraction ID' } });
      return;
    }
    next(err);
  }
});

export default router;

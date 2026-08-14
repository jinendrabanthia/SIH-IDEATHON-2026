import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/middleware/errorHandler.js';
import { validateLLMNarration } from '../trust-validation/index.js';

const router = Router();

// Schema for raw text extraction
const extractSchema = z.object({
  prompt: z.string().min(5).max(1000),
}).strict();

router.post('/extract', async (req, res, next) => {
  try {
    const { prompt } = extractSchema.parse(req.body);

    // Mocking the LLM extraction to avoid API key/SDK deprecation issues during the MVP
    console.log(`Mock NLU extracting from: ${prompt}`);
    
    // Very simple keyword matching for the mock
    const p = prompt.toLowerCase();
    
    const parsed = {
      pace: p.includes('relaxed') ? 'RELAXED' : p.includes('packed') ? 'PACKED' : 'MODERATE',
      transportPreference: p.includes('car') || p.includes('drive') ? 'OWN_VEHICLE' : p.includes('walk') ? 'WALKING' : 'MIXED',
      groupType: p.includes('family') ? 'FAMILY' : p.includes('couple') ? 'COUPLE' : 'SOLO',
      accessibilityWheelchair: p.includes('wheelchair') || p.includes('access'),
      interests: p.includes('history') ? ['history'] : [],
    };

    res.json({ data: parsed });
  } catch (err) {
    console.error('NLU Extract Error:', err);
    next(new AppError('Failed to extract preferences from text', 500, 'NLU_ERROR'));
  }
});

// Schema for narrative generation
const narrateSchema = z.object({
  itinerary: z.array(z.object({
    attractionName: z.string().max(200),
    startTime: z.string(),
    endTime: z.string(),
    factId: z.string().optional(),
    description: z.string().max(1000).optional(),
  }).strict()).max(20),
  validFactIds: z.array(z.string().uuid()).max(100),
}).strict();

router.post('/narrate', async (req, res, next) => {
  try {
    const { itinerary, validFactIds } = narrateSchema.parse(req.body);

    console.log(`Mock NLU narrating itinerary of ${itinerary.length} items`);
    
    // Mock the LLM narration
    let rawNarration = "Here is your wonderful itinerary! ";
    itinerary.forEach((item) => {
      rawNarration += `You will visit ${item.attractionName} from ${item.startTime} to ${item.endTime}. `;
      if (item.factId) {
        rawNarration += `[fact:${item.factId}] `;
      }
    });
    
    // Pass through Trust Validation Gate
    const validatedNarration = validateLLMNarration(rawNarration, validFactIds);

    res.json({ data: { narration: validatedNarration } });
  } catch (err) {
    console.error('NLU Narrate Error:', err);
    next(new AppError('Failed to generate narration', 500, 'NLU_ERROR'));
  }
});

export default router;

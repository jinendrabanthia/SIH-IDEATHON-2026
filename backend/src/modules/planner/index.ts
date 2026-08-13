import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import { getRoute } from '../live-data/routing.js';

const router = Router();

// Zod Schema for Planner Input (usually output by the NLU engine)
const plannerInputSchema = z.object({
  destinationId: z.string().uuid(),
  startDate: z.string().datetime(), // ISO string
  days: z.number().int().min(1).max(14),
  preferences: z.object({
    pace: z.enum(['RELAXED', 'MODERATE', 'PACKED']).default('MODERATE'),
    accessibilityWheelchair: z.boolean().default(false),
    interests: z.array(z.string()).default([]),
    transportPreference: z.enum(['WALKING', 'PUBLIC_TRANSIT', 'CAB', 'OWN_VEHICLE', 'MIXED']).default('MIXED'),
  }),
});

// Helper to convert HH:MM to minutes since midnight
const timeToMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Helper to format minutes to HH:MM
const minutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

router.post('/generate', async (req, res, next) => {
  try {
    const input = plannerInputSchema.parse(req.body);

    // 1. Candidate Generation
    // Fetch all attractions for the destination
    let attractions = await prisma.attraction.findMany({
      where: { destinationId: input.destinationId },
      include: {
        facts: true,
        crowdRecords: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
    });

    if (attractions.length === 0) {
      throw new AppError('No attractions found for this destination', 404, 'NO_ATTRACTIONS');
    }

    // Filter by accessibility if required
    if (input.preferences.accessibilityWheelchair) {
      attractions = attractions.filter(a => a.accessibilityWheelchair);
    }

    // Sort candidates by matching interests (very basic scoring)
    attractions.sort((a, b) => {
      const aScore = a.categories.filter(c => input.preferences.interests.includes(c)).length;
      const bScore = b.categories.filter(c => input.preferences.interests.includes(c)).length;
      return bScore - aScore;
    });

    // 2. Deterministic Scheduling
    const itineraryItems = [];
    const paceMaxPerDay = input.preferences.pace === 'RELAXED' ? 2 : input.preferences.pace === 'MODERATE' ? 3 : 5;
    const attractionDurationMinutes = 120; // Default 2 hours per attraction

    let currentAttractionIndex = 0;

    for (let day = 1; day <= input.days; day++) {
      let currentMinutes = timeToMinutes('09:00'); // Start day at 9 AM
      let itemsToday = 0;
      let lastLat: number | null = null;
      let lastLon: number | null = null;

      while (itemsToday < paceMaxPerDay && currentAttractionIndex < attractions.length) {
        const candidate = attractions[currentAttractionIndex];
        
        // Check Opening Hours Fact
        const hoursFact = candidate.facts.find(f => f.factKey === 'opening_hours');
        let isOpen = true;
        if (hoursFact && typeof hoursFact.factValue === 'object' && hoursFact.factValue !== null) {
          const val = hoursFact.factValue as any;
          if (val.open && val.close) {
            const openMins = timeToMinutes(val.open);
            const closeMins = timeToMinutes(val.close);
            if (currentMinutes < openMins || currentMinutes + attractionDurationMinutes > closeMins) {
              isOpen = false;
            }
          }
        }

        // Check Crowding Fact (skip if Severe)
        let isOvercrowded = false;
        if (candidate.crowdRecords.length > 0 && candidate.crowdRecords[0].currentCrowdLevel === 'SEVERE') {
          isOvercrowded = true;
        }

        if (isOpen && !isOvercrowded) {
          // Calculate travel time from previous location
          let travelMins = 0;
          if (lastLat !== null && lastLon !== null) {
            try {
              const route = await getRoute(lastLat, lastLon, candidate.latitude, candidate.longitude, 'driving-car');
              travelMins = Math.ceil(route.duration_seconds / 60);
            } catch (e) {
              travelMins = 15; // Fallback to 15 mins if routing fails
            }
          }

          currentMinutes += travelMins;

          const startTime = minutesToTime(currentMinutes);
          currentMinutes += attractionDurationMinutes;
          const endTime = minutesToTime(currentMinutes);

          itineraryItems.push({
            dayNumber: day,
            sequence: itemsToday + 1,
            entityType: 'attraction',
            entityId: candidate.id,
            attractionName: candidate.name,
            startTime,
            endTime,
            travelBufferMinutesBefore: travelMins,
          });

          lastLat = candidate.latitude;
          lastLon = candidate.longitude;
          itemsToday++;
        }

        currentAttractionIndex++;
      }
    }

    res.json({
      data: {
        destinationId: input.destinationId,
        days: input.days,
        itineraryItems,
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

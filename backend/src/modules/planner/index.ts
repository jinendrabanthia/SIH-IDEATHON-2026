import type { Prisma } from '@prisma/client';
import { VerificationStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/db/index.js';
import { AppError } from '../../shared/middleware/errorHandler.js';
import { getRoute } from '../live-data/routing.js';

const router = Router();

const DAY_START = '09:00';
const DAY_END = '18:00';
const VISIT_DURATION_MINUTES = 120;
const ROUTING_FALLBACK_MINUTES = 20;

const plannerInputSchema = z.object({
  destinationId: z.string().uuid(),
  startDate: z.string().datetime(),
  days: z.number().int().min(1).max(14),
  preferences: z.object({
    pace: z.enum(['RELAXED', 'MODERATE', 'PACKED']).default('MODERATE'),
    accessibilityWheelchair: z.boolean().default(false),
    interests: z.array(z.string()).default([]),
    transportPreference: z.enum(['WALKING', 'PUBLIC_TRANSIT', 'CAB', 'OWN_VEHICLE', 'MIXED']).default('MIXED'),
  }),
});

type PlannerInput = z.infer<typeof plannerInputSchema>;
type PlannerAttraction = Prisma.AttractionGetPayload<{
  include: {
    destination: true;
    facts: {
      include: {
        source: {
          select: {
            name: true;
            sourceType: true;
          };
        };
      };
    };
    crowdRecords: true;
    sensitivityFlags: true;
  };
}>;

type Exclusion = {
  entityId: string;
  attractionName: string;
  reason: string;
  verificationStatus: VerificationStatus;
};

const timeToMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const paceLimit = (pace: PlannerInput['preferences']['pace']) => {
  if (pace === 'RELAXED') return 2;
  if (pace === 'PACKED') return 5;
  return 3;
};

const riskRank: Record<VerificationStatus, number> = {
  [VerificationStatus.LIVE]: 0,
  [VerificationStatus.VERIFIED]: 1,
  [VerificationStatus.COMMUNITY]: 2,
  [VerificationStatus.INFERRED]: 3,
  [VerificationStatus.UNVERIFIED]: 4,
  [VerificationStatus.OUTDATED]: 5,
  [VerificationStatus.DISPUTED]: 6,
};

const factToProvenance = (fact: PlannerAttraction['facts'][number]) => ({
  fact_id: fact.id,
  fact_key: fact.factKey,
  fact_value: fact.factValue,
  source_name: fact.source.name,
  source_type: fact.source.sourceType,
  verification_status: fact.verificationStatus,
  confidence: fact.confidence,
  timestamp: fact.timestamp.toISOString(),
  last_checked: fact.lastChecked.toISOString(),
  geographic_scope: fact.geographicScope ?? undefined,
});

const buildTrustSummary = (attraction: PlannerAttraction, warnings: string[]) => {
  const facts = attraction.facts
    .filter((fact) => ['opening_hours', 'ticket_price', 'accessibility', 'entry_restrictions'].includes(fact.factKey))
    .map(factToProvenance);

  const overallStatus = facts.reduce<VerificationStatus>(
    (worst, fact) => riskRank[fact.verification_status] > riskRank[worst] ? fact.verification_status : worst,
    facts.length > 0 ? facts[0].verification_status : VerificationStatus.UNVERIFIED,
  );

  return {
    overall_status: overallStatus,
    facts,
    warnings,
  };
};

const openingWindow = (attraction: PlannerAttraction, warnings: string[]) => {
  const hoursFact = attraction.facts.find((fact) => fact.factKey === 'opening_hours');

  if (
    !hoursFact ||
    (hoursFact.verificationStatus !== VerificationStatus.VERIFIED &&
      hoursFact.verificationStatus !== VerificationStatus.LIVE)
  ) {
    warnings.push('Opening hours not verified; confirm before visiting');
    return null;
  }

  if (typeof hoursFact.factValue !== 'object' || hoursFact.factValue === null || Array.isArray(hoursFact.factValue)) {
    warnings.push('Opening hours not verified; confirm before visiting');
    return null;
  }

  const value = hoursFact.factValue as { open?: unknown; close?: unknown };
  if (typeof value.open !== 'string' || typeof value.close !== 'string') {
    warnings.push('Opening hours not verified; confirm before visiting');
    return null;
  }

  return {
    open: timeToMinutes(value.open),
    close: timeToMinutes(value.close),
  };
};

const activeSensitivityFlag = (attraction: PlannerAttraction, tripStart: Date) => {
  return attraction.sensitivityFlags.find((flag) => {
    const startsBeforeTrip = !flag.activeFrom || flag.activeFrom <= tripStart;
    const endsAfterTrip = !flag.activeTo || flag.activeTo >= tripStart;
    return startsBeforeTrip && endsAfterTrip;
  });
};

const exclusionFor = (attraction: PlannerAttraction, tripStart: Date): Exclusion | null => {
  const crowd = attraction.crowdRecords[0];
  if (crowd?.currentCrowdLevel === 'SEVERE') {
    return {
      entityId: attraction.id,
      attractionName: attraction.name,
      reason: 'Excluded because current crowd level is severe',
      verificationStatus: crowd.verificationStatus,
    };
  }

  const sensitivity = activeSensitivityFlag(attraction, tripStart);
  if (sensitivity) {
    return {
      entityId: attraction.id,
      attractionName: attraction.name,
      reason: sensitivity.description || `Excluded because of active ${sensitivity.sensitivityType.toLowerCase()} sensitivity flag`,
      verificationStatus: VerificationStatus.VERIFIED,
    };
  }

  return null;
};

const canSchedule = async (
  candidate: PlannerAttraction,
  currentMinutes: number,
  lastLocation: { latitude: number; longitude: number } | null,
  input: PlannerInput,
) => {
  const itemWarnings: string[] = [];
  const transitionMinutes = await getTransitionMinutes(
    lastLocation,
    { latitude: candidate.latitude, longitude: candidate.longitude },
    input.preferences.transportPreference,
    itemWarnings,
  );
  let startMinutes = currentMinutes + transitionMinutes;

  const hours = openingWindow(candidate, itemWarnings);
  if (hours) {
    startMinutes = Math.max(startMinutes, hours.open);
    if (startMinutes + VISIT_DURATION_MINUTES > hours.close) return null;
  }

  if (startMinutes + VISIT_DURATION_MINUTES > timeToMinutes(DAY_END)) return null;

  return {
    startMinutes,
    endMinutes: startMinutes + VISIT_DURATION_MINUTES,
    transitionMinutes,
    itemWarnings,
  };
};

const getTransitionMinutes = async (
  from: { latitude: number; longitude: number } | null,
  to: { latitude: number; longitude: number },
  transportPreference: PlannerInput['preferences']['transportPreference'],
  warnings: string[],
) => {
  if (!from) return 0;

  try {
    const profile = transportPreference === 'WALKING' ? 'foot-walking' : 'driving-car';
    const route = await getRoute(from.latitude, from.longitude, to.latitude, to.longitude, profile);
    const travelMinutes = Math.ceil(route.duration_seconds / 60);
    return travelMinutes + Math.max(10, Math.ceil(travelMinutes * 0.15));
  } catch {
    warnings.push('Routing unavailable; estimated buffer used');
    return ROUTING_FALLBACK_MINUTES + Math.max(10, Math.ceil(ROUTING_FALLBACK_MINUTES * 0.15));
  }
};

const sortCandidates = async (input: PlannerInput, warnings: string[]) => {
  const destination = await prisma.destination.findUnique({ where: { id: input.destinationId } });

  if (!destination) {
    throw new AppError('Destination not found', 404, 'DESTINATION_NOT_FOUND');
  }

  let orderedIds: string[] = [];
  try {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM attractions
      WHERE destination_id = ${input.destinationId}
      ORDER BY ST_Distance(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${destination.longitude}, ${destination.latitude})::geography
      ) ASC
    `;
    orderedIds = rows.map((row) => row.id);
  } catch {
    warnings.push('PostGIS ordering unavailable; fallback ordering used');
  }

  const attractions = await prisma.attraction.findMany({
    where: { destinationId: input.destinationId },
    include: {
      destination: true,
      facts: {
        include: {
          source: {
            select: {
              name: true,
              sourceType: true,
            },
          },
        },
      },
      crowdRecords: { orderBy: { timestamp: 'desc' }, take: 1 },
      sensitivityFlags: true,
    },
  });

  const idOrder = new Map(orderedIds.map((id, index) => [id, index]));
  const interests = new Set(input.preferences.interests.map((interest) => interest.toLowerCase()));

  return attractions
    .filter((attraction) => !input.preferences.accessibilityWheelchair || attraction.accessibilityWheelchair)
    .sort((a, b) => {
      const interestScoreA = interests.size === 0 ? 0 : a.categories.filter((category) => interests.has(category.toLowerCase())).length;
      const interestScoreB = interests.size === 0 ? 0 : b.categories.filter((category) => interests.has(category.toLowerCase())).length;

      if (interestScoreA !== interestScoreB) return interestScoreB - interestScoreA;

      return (idOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (idOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER);
    });
};

router.post('/generate', async (req, res, next) => {
  try {
    const input = plannerInputSchema.parse(req.body);
    const tripStart = new Date(input.startDate);
    const warnings: string[] = [];
    const excluded: Exclusion[] = [];
    const candidates = await sortCandidates(input, warnings);

    if (candidates.length === 0) {
      throw new AppError('No matching attractions found for these preferences', 404, 'NO_ATTRACTIONS');
    }

    const itineraryItems = [];
    const maxItemsPerDay = paceLimit(input.preferences.pace);
    const usedCandidateIds = new Set<string>();
    const excludedCandidateIds = new Set<string>();

    for (let day = 1; day <= input.days; day++) {
      let currentMinutes = timeToMinutes(DAY_START);
      let itemsToday = 0;
      let lastLocation: { latitude: number; longitude: number } | null = null;

      while (itemsToday < maxItemsPerDay) {
        let scheduled = false;

        for (const candidate of candidates) {
          if (usedCandidateIds.has(candidate.id) || excludedCandidateIds.has(candidate.id)) continue;

          const exclusion = exclusionFor(candidate, tripStart);
          if (exclusion) {
            excluded.push(exclusion);
            excludedCandidateIds.add(candidate.id);
            continue;
          }

          const slot = await canSchedule(candidate, currentMinutes, lastLocation, input);
          if (!slot) continue;

          const trustSummary = buildTrustSummary(candidate, slot.itemWarnings);

          itineraryItems.push({
            dayNumber: day,
            sequence: itemsToday + 1,
            entityType: 'attraction',
            entityId: candidate.id,
            attractionName: candidate.name,
            startTime: minutesToTime(slot.startMinutes),
            endTime: minutesToTime(slot.endMinutes),
            travelBufferMinutesBefore: slot.transitionMinutes,
            factIds: trustSummary.facts.map((fact) => fact.fact_id),
            trustSummary,
          });

          currentMinutes = slot.endMinutes;
          lastLocation = { latitude: candidate.latitude, longitude: candidate.longitude };
          usedCandidateIds.add(candidate.id);
          itemsToday++;
          scheduled = true;
          break;
        }

        if (!scheduled) break;
      }
    }

    if (itineraryItems.length === 0) {
      warnings.push('No attractions could be scheduled within the selected constraints');
    }

    res.json({
      data: {
        destinationId: input.destinationId,
        days: input.days,
        itineraryItems,
        excluded,
        warnings,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

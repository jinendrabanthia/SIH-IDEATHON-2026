import { Router } from 'express';
import { prisma } from '../../shared/db/index.js';
const router = Router();
// GET /api/v1/analytics/dashboard
router.get('/dashboard', async (req, res, next) => {
    try {
        const totalTrips = await prisma.trip.count();
        // Total users with a preference profile
        const totalUsers = await prisma.userPreference.count();
        // Distinct destinations visited
        const tripsWithDestinations = await prisma.trip.findMany({
            select: { destinationId: true },
            distinct: ['destinationId'],
        });
        const uniqueDestinations = tripsWithDestinations.length;
        // Trust Metrics
        const factsCount = await prisma.fact.count();
        const verifiedFacts = await prisma.fact.count({
            where: {
                verificationStatus: { in: ['VERIFIED', 'LIVE'] }
            }
        });
        const factAccuracy = factsCount > 0 ? Math.round((verifiedFacts / factsCount) * 100) : 0;
        res.json({
            data: {
                totalTrips,
                totalUsers,
                uniqueDestinations,
                factAccuracy,
                totalFacts: factsCount
            }
        });
    }
    catch (err) {
        next(err);
    }
});
export default router;
//# sourceMappingURL=index.js.map
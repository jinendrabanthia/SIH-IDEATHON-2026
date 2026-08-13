import { Router } from 'express';
import { getLiveWeather } from './weather.js';
import { getRoute } from './routing.js';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validate.js';

const router = Router();

const coordSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

const routeSchema = z.object({
  startLat: z.coerce.number().min(-90).max(90),
  startLon: z.coerce.number().min(-180).max(180),
  endLat: z.coerce.number().min(-90).max(90),
  endLon: z.coerce.number().min(-180).max(180),
  profile: z.enum(['driving-car', 'foot-walking']).default('driving-car'),
});

router.get('/weather', async (req, res, next) => {
  try {
    const { lat, lon } = coordSchema.parse(req.query);
    const data = await getLiveWeather(lat, lon);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/route', async (req, res, next) => {
  try {
    const { startLat, startLon, endLat, endLon, profile } = routeSchema.parse(req.query);
    const data = await getRoute(startLat, startLon, endLat, endLon, profile);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;

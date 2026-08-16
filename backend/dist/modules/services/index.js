import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../../shared/middleware/errorHandler.js';
import { TTLMemoryCache } from '../../shared/utils/cache.js';
import { validate } from '../../shared/middleware/validate.js';
const router = Router();
// Caches for the different APIs
const exchangeRateCache = new TTLMemoryCache(24 * 60 * 60 * 1000); // 24 hours
const holidayCache = new TTLMemoryCache(30 * 24 * 60 * 60 * 1000); // 30 days
const countryCache = new TTLMemoryCache(30 * 24 * 60 * 60 * 1000); // 30 days
const safetyCache = new TTLMemoryCache(60 * 60 * 1000); // 1 hour
// ─── Currency Exchange (Currency-api) ───────────────────────────────────────
router.get('/exchange-rates', async (_req, res, next) => {
    try {
        const cached = exchangeRateCache.get('inr-rates');
        if (cached) {
            return res.json({ data: cached });
        }
        // Free tier from fawazahmed0/currency-api
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json');
        if (!response.ok) {
            throw new AppError('Failed to fetch exchange rates', 502, 'PUBLIC_API_ERROR');
        }
        const data = await response.json();
        exchangeRateCache.set('inr-rates', data);
        res.json({ data });
    }
    catch (err) {
        next(err);
    }
});
// ─── Public Holidays (Nager.Date) ───────────────────────────────────────────
const holidayQuerySchema = z.object({
    countryCode: z.string().length(2).toUpperCase().default('IN'),
    year: z.coerce.number().int().min(2020).max(2100).default(new Date().getFullYear()),
}).strict();
export async function getHolidays(countryCode, year) {
    const cacheKey = `${countryCode}-${year}`;
    const cached = holidayCache.get(cacheKey);
    if (cached)
        return cached;
    try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        if (!response.ok)
            return [];
        const data = await response.json();
        holidayCache.set(cacheKey, data);
        return data;
    }
    catch {
        return [];
    }
}
router.get('/holidays', validate(holidayQuerySchema, 'query'), async (req, res, next) => {
    try {
        const { countryCode, year } = req.query;
        const data = await getHolidays(countryCode, year);
        res.json({ data });
    }
    catch (err) {
        next(err);
    }
});
// ─── Country Metadata (REST Countries) ──────────────────────────────────────
const countryParamSchema = z.object({
    code: z.string().min(2).max(3).toLowerCase(),
}).strict();
router.get('/country-info/:code', validate(countryParamSchema, 'params'), async (req, res, next) => {
    try {
        const { code } = req.params;
        const cached = countryCache.get(code);
        if (cached) {
            return res.json({ data: cached });
        }
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
        if (!response.ok) {
            throw new AppError('Country not found', 404, 'NOT_FOUND');
        }
        const data = (await response.json());
        countryCache.set(code, data[0]);
        res.json({ data: data[0] });
    }
    catch (err) {
        next(err);
    }
});
// ─── Travel Safety Pulse (Warnely) ──────────────────────────────────────────
router.get('/safety-pulse', async (_req, res, next) => {
    try {
        const cached = safetyCache.get('global-safety');
        if (cached) {
            return res.json({ data: cached });
        }
        const response = await fetch('https://api.warnely.com/v1/countries/IN');
        if (!response.ok) {
            // Fallback data if API changes or is unavailable
            const fallback = {
                score: 75,
                level: 'Moderate',
                description: 'Exercise a high degree of caution.',
                incidents: []
            };
            return res.json({ data: fallback });
        }
        const data = await response.json();
        safetyCache.set('global-safety', data);
        res.json({ data });
    }
    catch (err) {
        // Graceful fallback
        const fallback = {
            score: 75,
            level: 'Moderate',
            description: 'Exercise a high degree of caution.',
            incidents: []
        };
        res.json({ data: fallback });
    }
});
export default router;
//# sourceMappingURL=index.js.map
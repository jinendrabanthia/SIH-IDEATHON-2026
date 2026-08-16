# API Documentation

Base URL: `/api/v1`

Response shape used by most endpoints:

```json
{
  "data": {}
}
```

Error shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Auth-protected endpoints expect:

```http
Authorization: Bearer <accessToken>
```

## Status Summary

- Backend route coverage is mostly in place for auth, profile/preferences, knowledge, attractions, live data, planning, trips, favorites, services, and analytics.
- Remaining backend gaps are mainly review/workflow endpoints, search/nearby/content APIs, budget/export/audio support, and persistence for feedback.
- Remaining frontend gaps include favorites API wiring, trip creation/snapshot flows, and a broken analytics config import.

## Finished / Backend Functional

These endpoints exist and perform real backend work.

| Method | Endpoint | Auth | Purpose | Notes |
|---|---:|---:|---|---|
| GET | `/api/health` | No | Health check | Checks database connectivity and returns uptime/memory/status. |
| POST | `/api/v1/auth/register` | No | Create user account | Body: `{ email, password, name? }`. Sets refresh cookie and returns access token. |
| POST | `/api/v1/auth/login` | No | Login user | Body: `{ email, password }`. Includes brute-force lockout. |
| POST | `/api/v1/auth/refresh` | Cookie | Refresh session | Uses `refresh_token` HTTP-only cookie and rotates refresh token. |
| POST | `/api/v1/auth/logout` | Cookie | Logout user | Best-effort refresh-token deletion and clears cookie. |
| GET | `/api/v1/users/me` | Yes | Get current user profile | Includes preferences when present. |
| PATCH | `/api/v1/users/me` | Yes | Update current user profile | Can update `name` and `preferredLanguage`. |
| GET | `/api/v1/users/me/preferences` | Yes | Get current user preferences | Returns saved preferences or safe defaults. |
| PUT | `/api/v1/users/me/preferences` | Yes | Upsert full user preferences | Validates budget, pace, group, interests, accessibility, and transport fields. |
| PATCH | `/api/v1/users/me/preferences` | Yes | Partially update user preferences | Upserts a preference row when missing. |
| GET | `/api/v1/knowledge/destinations` | No | List destinations | Reads `destinations` table. |
| GET | `/api/v1/knowledge/destinations/:id` | No | Get one destination | Includes attraction count. `:id` can be a UUID or slug ID. |
| GET | `/api/v1/knowledge/destinations/:id/attractions` | No | List attractions for destination | `:id` can be a UUID or slug ID. Supports category, accessibility, indoor/outdoor, and name search filters. |
| GET | `/api/v1/attractions/:id/facts` | No | Get fact provenance for attraction | `:id` can be a UUID or slug ID. Includes source and verification metadata. |
| GET | `/api/v1/attractions/:id/alternatives` | No | Suggest similar attractions | Returns nearby same-destination alternatives based on category overlap. |
| GET | `/api/v1/live/weather?lat=&lon=` | No | Current weather | Uses Open-Meteo with in-memory cache. |
| GET | `/api/v1/live/route?startLat=&startLon=&endLat=&endLon=&profile=` | No | Travel distance/duration | Uses OpenRouteService. `profile`: `driving-car` or `foot-walking`. |
| POST | `/api/v1/planner/generate` | No | Generate itinerary | Uses DB attractions/facts/crowd/sensitivity, routing buffers, weather warnings, and holiday crowd warnings. |
| GET | `/api/v1/trips` | Yes | List current user's trips | Includes destination summary and snapshot flags. |
| GET | `/api/v1/trips/:id` | Yes | Get trip details | Enforces trip ownership. Includes latest itinerary records. |
| POST | `/api/v1/trips` | Yes | Create trip | Body: `{ destinationId, title?, startDate, endDate, status? }`. |
| PATCH | `/api/v1/trips/:id` | Yes | Update trip metadata / sharing | Can update title, dates, status, and `isPublic`. Generates share token. |
| POST | `/api/v1/trips/:id/snapshot` | Yes | Save frozen itinerary snapshot | Stores generated plan JSON in `trip.itinerarySnapshot`. |
| DELETE | `/api/v1/trips/:id` | Yes | Delete trip | Enforces ownership. |
| GET | `/api/v1/trips/share/:token` | No | Public shared trip | Only returns public trips. Does not expose owner email/user ID. |
| GET | `/api/v1/favorites` | Yes | List favorites | Returns saved attractions for current user. |
| POST | `/api/v1/favorites` | Yes | Add favorite | Body: `{ attractionId }`. Uses upsert to avoid duplicates. |
| DELETE | `/api/v1/favorites/:attractionId` | Yes | Remove favorite | Deletes favorite for current user. |
| GET | `/api/v1/services/exchange-rates` | No | INR exchange rates | Uses public currency API with cache. |
| GET | `/api/v1/services/holidays?countryCode=&year=` | No | Public holidays | Uses Nager.Date with cache. Defaults to India/current year. |
| GET | `/api/v1/services/country-info/:code` | No | Country metadata | Uses REST Countries with cache. |
| GET | `/api/v1/services/safety-pulse` | No | Travel safety pulse | Uses Warnely when available, otherwise fallback data. |
| GET | `/api/v1/analytics/dashboard` | No | Platform metrics | Counts trips, users with preferences, unique destinations, facts, and verified/live fact percentage. |

## In Work / Partial

These endpoints exist, but the implementation is incomplete, mocked, or not fully wired to the frontend.

| Method | Endpoint | Auth | Current behavior | Missing / Risk |
|---|---:|---:|---|---|
| POST | `/api/v1/nlu/extract` | No | Uses Gemini for prompt preference extraction with keyword fallback. | Falls back when Gemini is unavailable; depends on `GEMINI_API_KEY` for LLM behavior. |
| POST | `/api/v1/nlu/narrate` | No | Uses Gemini for itinerary narration, then validates fact markers. | Falls back to template narration when Gemini is unavailable. |
| POST | `/api/v1/feedback` | Yes | Validates payload, verifies facts, rate-limits, sanitizes, returns `PENDING`. | Does not currently persist feedback to the database. |
| POST | `/api/v1/planner/generate` | No | Generates itinerary response. | Does not automatically create a trip or save the plan; caller must use trip snapshot endpoint. |
| GET | `/api/v1/analytics/dashboard` | No | Backend endpoint works. | Frontend `AnalyticsPage` imports missing `../config/env`, so the page cannot call it correctly. |
| GET/POST/DELETE | `/api/v1/favorites...` | Yes | Backend works. | Frontend `FavoritesPage` currently uses hardcoded local state instead of these APIs. |
| POST | `/api/v1/trips` | Yes | Backend works. | No frontend screen currently calls `tripsApi.create`. |
| POST | `/api/v1/trips/:id/snapshot` | Yes | Backend works. | No frontend screen currently calls `tripsApi.saveSnapshot`. |

## Not Set Yet / No Backend Endpoint

These features are visible or implied in the frontend, but no matching backend endpoint exists yet.

| Feature | Suggested endpoint | Status |
|---|---:|---|
| Global destination/place search from dashboard header | `GET /api/v1/search?q=` | Not set yet |
| Nearby places based on current location | `GET /api/v1/nearby?lat=&lon=&radius=` | Not set yet |
| Dedicated accessibility guide page | `GET /api/v1/accessibility/...` | Not set yet |
| Travel guide articles/content | `GET /api/v1/guides` | Not set yet |
| Emergency contacts/services | `GET /api/v1/emergency?destinationId=` | Not set yet |
| Admin feedback review queue | `GET/PATCH /api/v1/admin/feedback` | Not set yet |
| Fact re-verification workflow | `POST /api/v1/facts/:id/verify` | Not set yet |
| Crowd report submission | `POST /api/v1/crowd-reports` | Not set yet |
| Local business discovery | `GET /api/v1/local-businesses?destinationId=` | Not set yet |
| Budget persistence for actual spend | `GET/PATCH /api/v1/trips/:id/budget` | Not set yet |
| PDF export generation on server | `GET /api/v1/trips/:id/export.pdf` | Not set yet |
| Voice/audio generation on server | `POST /api/v1/nlu/audio` | Not set yet |

## Auth Endpoint Details

### POST `/api/v1/auth/register`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Optional Name"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Optional Name"
    },
    "accessToken": "jwt"
  }
}
```

### POST `/api/v1/auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Optional Name"
    },
    "accessToken": "jwt"
  }
}
```

### POST `/api/v1/auth/refresh`

Request: no JSON body. Requires `refresh_token` cookie.

Response:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Optional Name"
    },
    "accessToken": "new-jwt"
  }
}
```

### POST `/api/v1/auth/logout`

Request: no JSON body. Uses `refresh_token` cookie if present.

Response:

```json
{
  "data": {
    "success": true,
    "message": "Logged out successfully"
  }
}
```

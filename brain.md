# MargDarshak / TravelShield — Project Brain

> **For AI agents:** Read this entire file before touching any code. It is the authoritative context document. Everything here is verified from the actual source files — not assumptions.

---

## 1. Product Identity

**Name:** MargDarshak (aka TravelShield)
**Tagline:** Multilingual Trustworthy Travel Assistant for India
**Purpose:** A hackathon (SIH) project that plans travel itineraries with *verifiable, cited facts* — the core pitch is that **the AI never fabricates travel information**. Every claim in the generated itinerary is backed by a `Fact` row with a real `Source`, trust-rated at VERIFIED / LIVE / COMMUNITY / UNVERIFIED / DISPUTED.

**The Iron Rule:** The Trust Validation Gate (`trust-validation/index.ts`) must **never** be weakened, bypassed, or skipped. The LLM narration module is **read-only** — it annotates facts but cannot create or modify them.

---

## 2. Repository Layout

```
c:\jb\SIH\
├── backend/               Express + Prisma (Node 18+, TypeScript, ES Modules)
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── server.ts      # Entry point, mounts all routers
│   │   ├── shared/
│   │   │   ├── config/index.ts       # Zod-validated env vars
│   │   │   ├── db/index.ts           # Prisma singleton
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           # requireAuth / optionalAuth (JWT)
│   │   │   │   ├── errorHandler.ts   # AppError class + handler
│   │   │   │   ├── rateLimiter.ts    # globalLimiter, strictLimiter, authLimiter
│   │   │   │   ├── sanitize.ts       # sanitizeBody (XSS via xss library)
│   │   │   │   └── validate.ts       # validate(schema, 'body'|'query'|'params')
│   │   │   ├── types/index.ts        # VerificationStatus, TrustSummary, FactProvenance, etc.
│   │   │   └── utils/cache.ts        # TTLMemoryCache<T> (new, added today)
│   │   └── modules/
│   │       ├── attractions/index.ts  # GET /:id/facts — provenance-rich fact list
│   │       ├── auth/index.ts         # POST /register /login /refresh /logout
│   │       ├── favorites/index.ts    # Favorites CRUD (requireAuth)
│   │       ├── feedback/index.ts     # Community fact feedback
│   │       ├── knowledge/index.ts    # Destinations + Knowledge layer reads
│   │       ├── live-data/
│   │       │   ├── weather.ts        # Open-Meteo (no key, free, cached 1h)
│   │       │   ├── routing.ts        # OpenRouteService (ROUTING_API_KEY)
│   │       │   └── index.ts          # Mounts /weather and /routing routes
│   │       ├── nlu/index.ts          # POST /extract (mock NLU) + /narrate (mock LLM)
│   │       ├── planner/index.ts      # POST /generate — deterministic scheduling engine
│   │       ├── services/index.ts     # Public API proxies: exchange-rates, holidays, country-info, safety-pulse
│   │       ├── trips/index.ts        # Trip CRUD (requireAuth, ownership checks)
│   │       └── trust-validation/index.ts # resolveSourceConflicts + validateLLMNarration
└── frontend/              React 18 + Vite + TypeScript + TailwindCSS
    └── src/
        ├── App.tsx         # Router + ErrorBoundary + QueryClientProvider
        ├── i18n/           # react-i18next, 3 locales: en, hi, or
        ├── pages/
        │   ├── DashboardPage.tsx
        │   ├── PlanTripPage.tsx       # NLU free-text → preference extraction
        │   ├── PlannerPage.tsx        # Itinerary display (reads planner output)
        │   ├── ExploreIndiaPage.tsx
        │   ├── AttractionExplorerPage.tsx
        │   ├── MyTripsPage.tsx
        │   ├── FavoritesPage.tsx
        │   ├── MapsPage.tsx
        │   └── PlaceholderPages.tsx   # Weather, Nearby, Accessibility, TravelGuide, Emergency
        └── components/
            ├── TrustBadge.tsx         # Renders VERIFIED/LIVE/COMMUNITY/etc badge
            ├── ItineraryView.tsx      # Day-by-day view of planner output
            ├── layout/                # Sidebar, Navbar, Layout wrapper
            ├── planner/               # Planner-specific sub-components
            ├── trust/                 # Trust-related components
            ├── dashboard/             # Dashboard widgets
            ├── map/                   # Map components
            ├── ui/                    # Shared UI primitives (Button, Card, etc)
            └── animations/
```

---

## 3. Data Model (Prisma Schema — `backend/prisma/schema.prisma`)

### Core Entities

| Model | Key Fields | Notes |
|---|---|---|
| `User` | id, email, passwordHash, name, preferredLanguage, supabaseId | Auth via JWT + bcrypt; supabaseId field exists for future Supabase Auth integration |
| `UserPreference` | 1:1 with User; pace, budgetBand, groupType, interests[], transport, accessibility | |
| `Destination` | id, name, country, region, lat/lon, timezone | India-focused, PostGIS via Supabase |
| `Attraction` | id, destinationId, name, categories[], lat/lon, indoorOutdoor, accessibility flags | Has many Facts, CrowdRecords, SensitivityFlags |
| `Source` | id, name, sourceType (GOVERNMENT/OFFICIAL_TOURISM/COMMUNITY/AI_INFERENCE/etc), url, reliabilityTier | |
| `Fact` | id, entityType, entityId, factKey, factValue (Json), sourceId, verificationStatus, confidence, timestamp, lastChecked, expiresAt | **THE core provenance unit** — every planner claim must trace to a Fact |
| `VerificationRecord` | factId, checkedBy, result, notes | Audit log of fact verifications |
| `CrowdCapacityRecord` | attractionId, currentCrowdLevel (LOW/MODERATE/HIGH/SEVERE), verificationStatus | Used by planner to exclude SEVERE attractions |
| `SensitivityFlag` | attractionId, sensitivityType (ENVIRONMENTAL/CULTURAL/COMMUNITY_RESTRICTION), activeFrom, activeTo | Date-scoped exclusion in planner |
| `Trip` | id, userId, destinationId, startDate, endDate, status (DRAFT/PLANNED/ACTIVE/COMPLETED) | **MISSING:** title, itinerary_snapshot, is_public, share_token — needed for Feature 1/2 |
| `Itinerary` | tripId, generatedAt, rawPlan (Json), validated | Linked to Trip; contains ItineraryItems |
| `ItineraryItem` | itineraryId, dayNumber, sequence, startTime, endTime, entityId, trustSummary (Json), explanationText | trustSummary is the serialized TrustSummary |
| `Feedback` | userId, factId, submittedValue, note, status (PENDING/REVIEWED/ACCEPTED/REJECTED) | Community corrections |
| `RefreshToken` | userId, tokenHash, expiresAt | Rotated on every /refresh |
| `Favorite` | userId, attractionId | Unique(userId, attractionId) |

### Enums
`VerificationStatus`: VERIFIED, LIVE, COMMUNITY, INFERRED, UNVERIFIED, OUTDATED, DISPUTED
`SourceType`: GOVERNMENT, OFFICIAL_TOURISM, OFFICIAL_OPERATOR, TRANSPORT_AUTHORITY, WEATHER_SERVICE, VERIFIED_LOCAL_ORG, TRUSTED_THIRD_PARTY, COMMUNITY, AI_INFERENCE
`TripStatus`: DRAFT, PLANNED, ACTIVE, COMPLETED
`CrowdLevel`: LOW, MODERATE, HIGH, SEVERE

---

## 4. Backend Architecture

### API Routes (all at `/api/v1/...`)

| Route | Module | Auth | Notes |
|---|---|---|---|
| `/auth/register` | auth | None | bcrypt 12 rounds, emits access+refresh tokens |
| `/auth/login` | auth | None | brute-force protection (5 fails → 15min lockout) |
| `/auth/refresh` | auth | Cookie | Rotates refresh token |
| `/auth/logout` | auth | Cookie | Deletes refresh token |
| `/knowledge/*` | knowledge | None | Destinations, regions |
| `/attractions/:id/facts` | attractions | None | Returns facts with full provenance |
| `/live/weather` | live-data | None | Open-Meteo proxy (1h cache) |
| `/planner/generate` | planner | None | Deterministic scheduler (PostGIS + ORS) |
| `/nlu/extract` | nlu | None | Mock preference extraction |
| `/nlu/narrate` | nlu | None | Mock LLM narration → Trust Validation Gate |
| `/feedback` | feedback | None | Community fact corrections |
| `/favorites` | favorites | **JWT** | User's favorite attractions |
| `/trips` | trips | **JWT** | Full Trip CRUD (ownership enforced in code) |
| `/services/exchange-rates` | services | None | Currency-api (24h cache) |
| `/services/holidays` | services | None | Nager.Date (30d cache) |
| `/services/country-info/:code` | services | None | REST Countries (30d cache) |
| `/services/safety-pulse` | services | None | Warnely (1h cache, graceful fallback) |

### Security Stack
- **Helmet** — CSP, X-Frame-Options, etc.
- **CORS** — only allows `CORS_ORIGIN` env var
- **Rate limiting** — `globalLimiter` (all), `strictLimiter` (planner/NLU), `authLimiter` (5 req/15min on auth)
- **JWT** — `Authorization: Bearer <token>` (15min access) + `httpOnly` refresh cookie (7 days, rotated)
- **bcrypt** — 12 rounds for passwords
- **XSS sanitization** — `sanitizeBody` middleware (recursive, applied to feedback + NLU)
- **Zod validation** — every route input validated at boundary
- **Ownership checks** — all Trip/Favorites mutations check `req.user.id === record.userId` in code (Supabase service-role key bypasses RLS)
- **Prompt injection sandboxing** — NLU input wrapped in `<user_input_start>` delimiters

### Trust Pipeline (the critical path)
```
User input (free text)
    → POST /nlu/extract (keyword mock → TBD: real LLM)
    → Preferences extracted
    → POST /planner/generate
        → sortCandidates (PostGIS distance ordering)
        → exclusionFor (crowd SEVERE check, sensitivity flag check)
        → canSchedule (opening hours, ORS travel time, day_end constraint)
        → buildTrustSummary (aggregates FactProvenance per item)
        → Holiday crowd risk warnings (Nager.Date via services module)
    → POST /nlu/narrate
        → Mock LLM produces text with [fact:UUID] citations
        → validateLLMNarration() strips any sentence citing a non-existent factId
        → Trust Validation Gate MUST NOT be bypassed
    → Frontend renders with TrustBadge per item
```

---

## 5. Frontend Architecture

- **Stack:** React 18, Vite, TypeScript, TailwindCSS
- **State:** `@tanstack/react-query` (5min stale time, 1 retry)
- **i18n:** `react-i18next` — 3 locales: `en`, `hi`, `or` (Odia)
- **Routing:** `react-router-dom` v6

### Routes
| Path | Component | Status |
|---|---|---|
| `/` | → redirect to `/dashboard` | |
| `/dashboard` | DashboardPage | Exists (stub/partial) |
| `/plan-trip` | PlanTripPage | Exists — NLU text input |
| `/planner` | PlannerPage | Exists — itinerary display |
| `/explore` | ExploreIndiaPage | Exists |
| `/attractions` | AttractionExplorerPage | Exists |
| `/my-trips` | MyTripsPage | Exists |
| `/favorites` | FavoritesPage | Exists |
| `/maps` | MapsPage | Exists (placeholder) |
| `/weather` | WeatherPage | Placeholder |
| `/nearby` | NearbyPage | Placeholder |
| `/accessibility` | AccessibilityPage | Placeholder |
| `/travel-guide` | TravelGuidePage | Placeholder |
| `/emergency` | EmergencyPage | Placeholder |

### Design System
- **Glassmorphism** — cards use `backdrop-blur`, semi-transparent backgrounds
- **TrustBadge** — component at `components/TrustBadge.tsx` — renders color + text label for each VerificationStatus
- **ItineraryView** — `components/ItineraryView.tsx` — day-by-day display

---

## 6. External Services & Keys

| Service | Purpose | Key Env Var | Free Tier |
|---|---|---|---|
| Supabase | PostgreSQL + PostGIS hosting | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Yes |
| Open-Meteo | Weather forecasts | None (no key) | Always free |
| OpenRouteService | Routing / travel times | `ROUTING_API_KEY` | Free tier |
| Currency-api (fawazahmed0) | Exchange rates | None | Always free, no limits |
| Nager.Date | Public holidays | None | Always free |
| REST Countries | Country metadata | None | Always free |
| Warnely | Travel safety scores | None | Always free |
| NVIDIA NIM | LLM (via free-claude-code proxy) | `NVIDIA_NIM_API_KEY` | 40 req/min |
| OpenRouter | LLM alternative | `OPENROUTER_API_KEY` | Free models |

---

## 7. Feature Backlog (active work)

### ✅ DONE (Previous Sessions)
- Full Auth system (register/login/refresh/logout) with JWT + bcrypt + brute-force protection
- Refresh token rotation (httpOnly cookie)
- Trip CRUD with ownership enforcement
- Favorites CRUD with ownership enforcement
- XSS sanitization middleware
- Enhanced Zod validation (body/query/params)
- CSP via Helmet
- NLU prompt injection sandboxing
- Public API Services module (exchange-rates, holidays, country-info, safety-pulse with TTL cache)
- Nager.Date holiday integration into Planner (crowd risk warnings)

### 🔧 IN PROGRESS (Current Session — 8 Features)

#### Feature 1: Auth + Saved/Shareable Trips
- **Status:** Auth backend DONE. Trips CRUD DONE. 
- **Gap:** `Trip` model missing `title`, `itinerary_snapshot (Json)`, `is_public (Boolean)`, `share_token (String unique)`, `updatedAt`.
- **Action:** Prisma migration to add fields. Update trips router to handle snapshot saving. Frontend auth flow (login/register pages or modal).

#### Feature 2: Public Shareable Itinerary Link
- **Depends on:** Feature 1 (share_token on Trip)
- **Action:** New public route `GET /api/v1/trips/share/:token` (no auth, rate-limited). Frontend `/share/:token` page.

#### Feature 3: Interactive Map View
- **Stack:** Leaflet + OpenStreetMap tiles (no API key)
- **Data:** lat/lon already on every Attraction. Travel times already computed via ORS in Planner.
- **Action:** Leaflet map in MapsPage and/or inline in PlannerPage. Numbered pins per itinerary stop. Click → existing recommendation card.

#### Feature 4: Budget Tracker
- **Critical constraint:** No invented prices. Only sum VERIFIED/LIVE-tier price Facts. Unpriced items show "Cost not verified".
- **Action:** Backend helper to compute budget from itinerary's factIds. Frontend budget breakdown with trust badges per line item. Manual line items (user-entered, clearly labeled).

#### Feature 5: Weather-Aware Itinerary Warnings
- **Stack:** Extend existing Open-Meteo integration (weather.ts). Add daily forecast (not just current).
- **Data:** Open-Meteo forecast horizon is ~16 days.
- **Action:** For each itinerary day, fetch forecast for that date/location. Inject LIVE-tier warning banners for rain/extreme heat on outdoor-heavy days.

#### Feature 6: PDF / Offline Export
- **Stack:** Server-side `pdfkit` or `puppeteer` in Express backend.
- **Output:** Self-contained PDF (no live network calls at view time). Trust badges as text labels. Budget summary. Multilingual.

#### Feature 7: Voice Input/Output
- **Stack:** Web Speech API (browser-native, no cloud service, free).
- **Input:** Mic button on PlanTripPage → transcribes to NLU text field → hits existing /extract endpoint.
- **Output:** SpeechSynthesis reads validated narration.
- **Constraint:** Odia (`or-IN`) speech recognition is unreliable in Web Speech API — show "not supported" rather than a broken button.

#### Feature 8: Impact / Analytics Dashboard
- **Critical:** Real counters only — no placeholder numbers.
- **Instrumentation points:** Trust Validation Gate strip events, planner generation count, fact counts by verification_status.
- **Stack:** New `analytics` module backend. Recharts for frontend.
- **Visibility:** Public dashboard page (aggregate stats only, no PII).

---

## 8. Dev Environment

### Backend
```bash
cd c:\jb\SIH\backend
npm run dev         # ts-node-esm server.ts, port 3001
npx tsc --noEmit    # Type-check
npx prisma migrate dev  # Run migrations
npx prisma generate     # Regenerate client
```

### Frontend
```bash
cd c:\jb\SIH\frontend
npm run dev         # Vite dev server, port 5173
```

### free-claude-code proxy (for Claude Code CLI)
```bash
cd c:\jb\SIH\free-claude-code
C:\Users\redmi\.local\bin\uv.exe run uvicorn server:app --host 0.0.0.0 --port 8082
# Then: $env:ANTHROPIC_BASE_URL="http://localhost:8082"; $env:ANTHROPIC_AUTH_TOKEN="freecc"; claude
```

---

## 9. Critical Invariants (Never Violate)

1. **Trust Validation Gate** — `validateLLMNarration()` in `trust-validation/index.ts` MUST run on all LLM output before display.
2. **LLM is read-only** — the narration module cannot create/modify Facts, Sources, or VerificationRecords.
3. **Ownership checks in code** — Supabase service-role key bypasses RLS. Every Trip/Favorites endpoint must check `req.user.id === record.userId` explicitly.
4. **Zod on every endpoint** — All request bodies/query params/path params validated with Zod at the route handler boundary.
5. **No fabricated prices** — Budget totals only from VERIFIED/LIVE-tier price Facts. Unpriced = "Cost not verified", never a guessed number.
6. **No fabricated weather** — Only show forecasts within Open-Meteo's real horizon (~16 days). Outside horizon → "Forecast not yet available".
7. **No fabricated analytics** — Dashboard only renders cards for instrumented stats. Uninstrumented stat = no card, not a fake zero.
8. **i18n parity** — All new user-facing strings must be added to all 3 locale files: en, hi, or.
9. **Glassmorphism design** — New pages must reuse existing card/badge/button components. No second UI kit.
10. **No new paid API keys** — Leaflet+OSM (free), Web Speech API (browser-native), pdfkit (server-side, no external calls).

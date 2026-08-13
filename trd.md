# Technical Requirements Document (TRD)
## Multilingual Trustworthy Travel Assistant (MVP)

**Version:** 1.0
**Companion to:** PRD_Multilingual_Trustworthy_Travel_Assistant.md
**Target execution environment:** Antigravity (agentic build) — this document is written to be handed to an agent as the authoritative build spec.

---

## 1. Architecture Decision Records (ADRs) — decisions made now, so the build doesn't stall

| # | Decision | Chosen | Rejected alternative(s) | Why |
|---|---|---|---|---|
| ADR-1 | Repository shape | **Modular monolith**, single deployable backend, single frontend app | Microservices | No team-scale or independent-deploy pressure yet; module boundaries (see §3) give the same separation of concerns without operational overhead |
| ADR-2 | Backend language/runtime | **Node.js + TypeScript (Express)** | Python/FastAPI | Aligns with the pre-existing project notes (Express-based plan), strong ecosystem for I/O-bound API orchestration (many external calls: weather, transport, LLM), one language across backend + shared validation schemas with frontend |
| ADR-3 | Primary datastore | **PostgreSQL + PostGIS** | MongoDB Atlas (as in early notes) | The domain is inherently relational + geospatial (destinations, attractions, sources, verification records, geographic scope, distance/routing queries). PostGIS gives real geospatial queries (nearest-attraction, radius search, route feasibility) that MongoDB would require bolting on. This **overrides** the early notes document. |
| ADR-4 | ORM/schema layer | **Prisma** (TypeScript-native, migrations, type-safe queries) | Raw SQL, TypeORM | Fast to iterate, strong typing shared with API layer, good Postgres/PostGIS support via raw extensions where needed |
| ADR-5 | Auth | **JWT-based session auth**, credentials + optional OAuth (Google) stored via a standard auth table — NOT Firebase | Firebase Auth (as in early notes) | Keeps the whole stack in one Postgres instance (no split source of truth for user data vs. app data); avoids a second vendor dependency for an MVP; OAuth providers can be added later behind the same interface |
| ADR-6 | LLM provider | **Anthropic Claude via API** (see `anthropic_api_in_artifacts`-style server-side integration) | OpenAI | Per product constraints, Claude is used strictly for NLU/extraction/explanation/translation-assist — never as a fact source. Called server-side only; API key never touches the client. |
| ADR-7 | Frontend framework | **React + TypeScript, Vite** | Next.js | Simpler for an MVP SPA talking to one backend; avoids SSR complexity not needed for this product; can migrate to Next later if SEO/SSR becomes a requirement |
| ADR-8 | Styling | **Tailwind CSS + component library (shadcn/ui-style primitives)** | Custom CSS from scratch | Speed, consistency, accessible primitives out of the box |
| ADR-9 | i18n | **i18next** with per-locale resource bundles + a **structured-content translation approach** (translate fields, not final prose) | Post-hoc full-text translation | Required by PRD §5.7 — trust labels/dates/prices must never be paraphrased away |
| ADR-10 | Live external data | **Weather:** OpenWeatherMap (or Open-Meteo as a free/no-key fallback) · **Routing/transport:** OpenRouteService (primary) with Mapbox Directions as a paid fallback, OSRM self-hosted as a last-resort fallback · **Transit disruption/crowd:** no reliable free global API exists — MVP uses **verified static + manually curated live-status records with explicit "not live" labeling** where no real API is integrated, exactly per the PRD's "never label cached data as live" rule | Building custom scrapers | Scraping = untrusted, fragile, and violates the "never fabricate a live response" rule if scraped data is stale/wrong without a confidence layer |
| ADR-11 | Background jobs | **BullMQ (Redis-backed)** for scheduled verification refresh, source re-checks, cache invalidation | Cron scripts only | Need retry/backoff and observability for external-API calls; Redis is a small, justified addition (also useful as a cache layer) |
| ADR-12 | Caching | **Redis** for live-data caching (weather/transport TTL-based) and job queue | None / in-memory only | Prevents redundant external calls, supports explicit TTL so "live" data has a bounded freshness window |
| ADR-13 | Testing | **Vitest** (unit/integration) + **Playwright** (E2E) + a dedicated **trust-rule test suite** (see §9) | Jest | Vitest is faster and TS-native; Playwright covers the real multilingual, multi-viewport E2E journey |
| ADR-14 al | Deployment target | Single containerized backend (Docker) + static frontend build, Postgres + Redis as managed services | Serverless functions per early Pipedream idea | Predictable behavior for background jobs (verification refresh) which serverless makes awkward; Pipedream-style glue is unnecessary once the backend owns orchestration directly |

**Explicit rejection of the early notes' fare-comparison-engine idea (Uber/Ola price formulas) for MVP:** hardcoded fare formulas (`CostUber = 50 + distance×12 + duration×2`) are exactly the kind of **fabricated-looking-as-real** number the product's core rule forbids — a made-up formula presented as a real fare is a trust violation. Transport **cost estimates**, if shown at all, must be clearly labeled as "estimated, unverified" (INFERRED state) or omitted. This is a hard product-rule override of the early notes.

---

## 2. High-Level System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + TS + Vite + Tailwind + i18next)                    │
│  Landing/Search → Preference Setup → Trip Dashboard → Trust UI        │
└───────────────────────────┬─────────────────────────────────────────┘
                             │ REST/JSON (auth via JWT bearer)
┌───────────────────────────▼─────────────────────────────────────────┐
│  BACKEND (Node.js + TypeScript + Express) — Modular Monolith          │
│                                                                         │
│  ┌────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌────────────┐ │
│  │ Auth Module │ │ NLU/Intent    │ │ Knowledge Layer  │ │ Live Data  │ │
│  │             │ │ Module (LLM)  │ │ (Postgres/PostGIS│ │ Module     │ │
│  │             │ │               │ │  read/write)     │ │ (weather,  │ │
│  │             │ │               │ │                  │ │  transport)│ │
│  └────────────┘ └───────────────┘ └─────────────────┘ └────────────┘ │
│  ┌──────────────────┐ ┌─────────────────┐ ┌───────────────────────┐ │
│  │ Crowding &       │ │ Itinerary        │ │ Trust Validation      │ │
│  │ Sensitivity      │ │ Planning Engine  │ │ Layer (final gate)    │ │
│  │ Engine           │ │ (deterministic)  │ │                        │ │
│  └──────────────────┘ └─────────────────┘ └───────────────────────┘ │
│  ┌──────────────────┐ ┌─────────────────┐ ┌───────────────────────┐ │
│  │ LLM Explanation  │ │ i18n/Multilingual│ │ Feedback & Provenance │ │
│  │ Generator        │ │ Delivery Module  │ │ Module                │ │
│  └──────────────────┘ └─────────────────┘ └───────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────────┘
              ┌──────────────┼───────────────┐
      ┌───────▼──────┐ ┌─────▼──────┐ ┌──────▼───────┐
      │ PostgreSQL    │ │ Redis       │ │ External APIs│
      │ + PostGIS     │ │ (cache/jobs)│ │ (weather,    │
      │               │ │             │ │ routing, LLM)│
      └───────────────┘ └────────────┘ └──────────────┘
```

### Pipeline (matches PRD's logical flow, mapped to modules)

```
User input
  → Auth Module (session)
  → NLU/Intent Module (LLM: extract structured TripRequest — destination, dates,
      interests, accessibility, etc. — from free text if provided; always
      confirmed/editable via structured UI, never silently trusted from LLM alone)
  → User Profile (Postgres)
  → Knowledge Layer query (candidate destinations/attractions within scope)
  → Live Data Module (weather, transport — Redis-cached, TTL-labeled)
  → Source Verification (per-fact provenance resolution, conflict detection)
  → Crowding & Sensitivity Engine (filter/deprioritize/substitute)
  → Itinerary Planning Engine (deterministic scheduling + travel-time buffers)
  → LLM Explanation Generator (narrates the ALREADY-VALID plan; cannot alter facts)
  → Trust Validation Layer (final gate — strips/flags any unsupported claim)
  → i18n/Multilingual Delivery Module (structured-field translation)
  → Response to frontend
  → Feedback Module (async, writes back to Knowledge Layer review queue)
```

---

## 3. Backend Module Boundaries (modular monolith — folder-level separation)

```
/backend
  /src
    /modules
      /auth               → signup/login/JWT/session
      /users              → profile, preferences (separate from public data)
      /nlu                → LLM-backed intent & preference extraction
      /knowledge           → destinations, attractions, sources, verification records (CRUD + query)
      /live-data           → weather adapter, transport/routing adapter, TTL cache wrapper
      /crowding            → crowd/capacity/sensitivity scoring + substitution logic
      /itinerary           → deterministic planner (scheduling, buffers, constraint solver)
      /explanation         → LLM prompt orchestration for itinerary narration
      /trust-validation    → final-gate validator (see §9), provenance stamping
      /i18n                → locale resources, structured-field translation service
      /feedback            → user-submitted fact corrections, review queue
    /shared
      /types               → shared TS types/DTOs (also exported for frontend via a shared package)
      /db                  → Prisma client, migrations
      /middleware          → auth guard, input validation (zod), error handler, rate limiting
      /config              → env loading/validation (never trust raw process.env directly)
    server.ts
```

**Rule enforced by structure, not convention:** the `/explanation` module (LLM) has **no write access** to `/knowledge` or `/itinerary` outputs — it receives a read-only, already-finalized `ValidatedItinerary` object and can only produce narrative text keyed to existing fact IDs. This is what makes "LLM never bypasses verification" true at the code level, not just the prompt level.

---

## 4. Database Schema (PostgreSQL + PostGIS)

Core tables (Prisma models shown conceptually; full schema to be generated in Phase 1 of the build):

```
users
  id, email, password_hash, name, preferred_language, created_at

user_preferences                 -- kept separate from public travel data
  id, user_id, budget_band, pace, group_type, interests[], food_preferences[],
  transport_preference, accessibility_requirements[], accessibility_notes,
  walking_tolerance_minutes, indoor_outdoor_preference, local_business_preference,
  updated_at

destinations
  id, name, country, region, geom (PostGIS Point), timezone, created_at

attractions
  id, destination_id, name, category[], geom (PostGIS Point), address,
  description, indoor_outdoor, accessibility_features[], created_at

facts                             -- the core provenance-carrying table
  id, entity_type, entity_id,       -- e.g. entity_type='attraction', entity_id=<uuid>
  fact_key,                         -- e.g. 'opening_hours', 'ticket_price', 'safety_advisory'
  fact_value (jsonb),
  source_id,
  verification_status (enum: VERIFIED, LIVE, COMMUNITY, INFERRED, UNVERIFIED, OUTDATED),
  confidence (numeric 0-1),
  geographic_scope,
  timestamp, last_checked, expires_at

sources
  id, name, source_type (enum: government, official_tourism, official_operator,
  transport_authority, weather_service, verified_local_org, trusted_third_party,
  community, ai_inference), url, reliability_tier (int, matches priority order), created_at

verification_records
  id, fact_id, checked_by (system/admin/user_flag), checked_at, result, notes

crowd_capacity_records
  id, attraction_id, current_crowd_level (enum: low/moderate/high/severe),
  capacity_value, source_id, verification_status, timestamp

sensitivity_flags
  id, attraction_id, sensitivity_type (environmental/cultural/community_restriction),
  description, source_id, active_from, active_to

local_businesses
  id, name, category, geom, destination_id, is_locally_owned (nullable bool),
  ownership_evidence_source_id, description

trips
  id, user_id, destination_id, start_date, end_date, status, created_at

itineraries
  id, trip_id, generated_at, planner_version, raw_plan (jsonb), validated (bool)

itinerary_items
  id, itinerary_id, day_number, sequence, start_time, end_time,
  entity_type, entity_id, travel_buffer_minutes_before, explanation_text,
  trust_summary (jsonb: rolled-up verification states of all facts used)

feedback
  id, user_id, fact_id, submitted_value, note, status (pending/reviewed/accepted/rejected), created_at
```

**Geospatial use:** PostGIS `ST_DWithin` / `ST_Distance` for radius search and nearest-neighbor candidate selection during itinerary planning; indexed with GiST indexes on all `geom` columns.

**Provenance is enforced at the fact level, not the entity level** — an attraction can have VERIFIED opening hours and simultaneously UNVERIFIED accessibility info. This directly implements the PRD's per-fact trust model.

---

## 5. API Contracts (REST, JSON, versioned under `/api/v1`)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/auth/register`, `/login`, `/refresh` | POST | Auth |
| `/api/v1/users/me/preferences` | GET/PUT | Personalization profile (separate from trip data) |
| `/api/v1/nlu/extract` | POST | Free-text → structured `TripRequestDraft` (user must confirm before use) |
| `/api/v1/trips` | POST | Create trip (destination, dates, preferences reference) |
| `/api/v1/trips/:id/itinerary` | POST | Trigger generation pipeline (async job, returns job id) |
| `/api/v1/trips/:id/itinerary` | GET | Fetch generated + validated itinerary |
| `/api/v1/attractions/:id/facts` | GET | Full provenance record for a given place (powers "why/source" UI) |
| `/api/v1/attractions/:id/alternatives` | GET | Crowding/sensitivity-driven alternatives |
| `/api/v1/live/weather` | GET | Server-proxied, cached, TTL-labeled weather (never called client-side directly) |
| `/api/v1/live/transport` | GET | Server-proxied routing/disruption data |
| `/api/v1/feedback` | POST | Submit a fact correction |
| `/api/v1/i18n/locales` | GET | Supported locales + resource bundle version |

All responses that include a "fact" embed the full provenance object (`source, source_type, verification_status, timestamp, last_checked, confidence, geographic_scope`) — the frontend never has to guess trust state; it renders exactly what the backend certifies.

Standard error envelope for all failure modes (API failure, empty results, invalid input, etc.) — no raw stack traces, no `undefined`/`null` leaking into UI copy:
```json
{ "error": { "code": "LIVE_DATA_UNAVAILABLE", "message": "...", "fallback_used": true } }
```

---

## 6. Itinerary Planning Engine (deterministic core)

Implemented as a **constraint-based scheduler**, not an LLM call:
1. Candidate generation: query `attractions` within destination + interest match + accessibility filter (hard filter, not a scoring nudge) + indoor/outdoor preference.
2. Crowding/Sensitivity Engine scores and removes/deprioritizes candidates; substitution search re-runs candidate generation with the excluded ID blacklisted.
3. Feasibility pass: for each candidate pair in sequence, compute real travel time via the routing adapter (walking/transit/driving per user's transport preference) and require `available_time >= travel_time + buffer(15% or 10min minimum)`. Reject schedules that violate this — **this is the mechanism that prevents "10:00 A → 10:20 B" impossible transitions.**
4. Opening-hours/date validation: reject any slot outside a VERIFIED or LIVE opening-hours window; if hours are UNVERIFIED, the slot is allowed only with a mandatory "hours not verified — confirm before visiting" flag, never silently scheduled as if open.
5. Meal-timing insertion, pace-based item-count targets, budget rollup.
6. Output: a fully-populated `itinerary_items[]` structure, each item already carrying its `trust_summary` — **this object is what gets handed to the LLM explanation module; the LLM cannot add, remove, or reschedule items.**

---

## 7. Crowding & Sensitivity Engine

Deterministic scoring function combining: `current_crowd_level`, `capacity_value` vs. estimated visitor load, active `sensitivity_flags`, and time-of-day/seasonality where data exists. Threshold-based exclusion (not ML in MVP — a transparent, explainable rule set is required by the explainability requirement itself). Every exclusion produces a structured `ExclusionReason` object consumed by the explanation module, e.g.:
```json
{ "attraction_id": "...", "reason": "high_visitor_pressure", "evidence": {...},
  "alternatives": ["attraction_id_2", "attraction_id_3"] }
```

---

## 8. AI/LLM Integration Layer

Two distinct, isolated LLM call sites — never merged into one "do everything" prompt:

1. **NLU/Intent Extraction** (`/modules/nlu`): free-text trip description → structured JSON via a strict JSON-schema-constrained prompt. Output is always shown back to the user for confirmation before being used (prevents silent misextraction).
2. **Explanation Generation** (`/modules/explanation`): receives the finalized, validated `Itinerary` object (facts + trust states + exclusion reasons already resolved) and produces natural-language narration **strictly grounded in the supplied structured data**. System prompt explicitly forbids introducing any fact, name, price, hour, or claim not present in the input payload. Output is passed through the Trust Validation Layer regardless (defense in depth — see §9).

**Prompt injection defense:** any external content that flows into an LLM prompt (community feedback text, scraped descriptions) is wrapped and labeled as untrusted data in the prompt structure, and the system prompt explicitly instructs the model to treat such content as data-to-summarize, never as instructions.

---

## 9. Trust Validation Layer (final gate — the most important module)

Runs **after** LLM narration, **before** the response leaves the backend. Responsibilities:
- Cross-check every named fact/claim in the LLM's output text against the `trust_summary` of the structured itinerary it was given (via entity/fact-ID tagging the LLM is required to emit alongside its prose, e.g. inline reference markers resolved server-side and stripped before display).
- Any sentence asserting a critical fact with **no matching fact ID** in the validated payload is rejected and the sentence is regenerated in a stricter mode or replaced with a template fallback ("See verified details above.").
- Recomputes conflict detection across sources feeding the same fact; if two VERIFIED-tier sources disagree, downgrades that fact to a surfaced "conflicting sources" state rather than picking one.
- Confirms every UNVERIFIED/OUTDATED fact is rendered with its warning state — never silently upgraded by phrasing.
- This layer is pure deterministic code (regex/structured parsing + DB lookups), not another LLM call — an LLM cannot be trusted to grade itself as the sole safeguard.

---

## 10. Multilingual Architecture

- `i18n` module stores UI strings in `i18next` resource bundles (`en`, `hi`, `or`).
- **Dynamic content (itinerary text, trust labels, place names) is never machine-translated as a finished paragraph.** Instead: structured fields (verification_status enum, dates, currency, numbers) are rendered via locale-aware formatters (ICU MessageFormat), and only the LLM-authored explanatory prose is translated — via a constrained translation prompt that receives the source prose **plus the list of protected tokens** (place names, fact IDs, numbers, dates) it must preserve verbatim, then is re-validated by the Trust Validation Layer in the target language (checking that fact-ID markers survived translation) before being shown.
- Adding a language = adding a resource bundle + registering it in `/api/v1/i18n/locales`; no code fork required.

---

## 11. Security Requirements (implementation-level)

- All input validated with `zod` schemas at the route boundary; reject-by-default.
- All external HTML/text (place descriptions, community feedback) sanitized before storage and before LLM prompt inclusion.
- Secrets (LLM API key, weather/routing API keys) loaded server-side only via env vars, validated at boot (`/shared/config`), never sent to the frontend bundle.
- JWT auth guard on all mutating endpoints; rate limiting on `/nlu/extract`, `/trips/:id/itinerary`, and `/feedback` (abuse/cost control).
- CORS locked to the deployed frontend origin.
- SQL access exclusively through Prisma (parameterized) — no raw string concatenation.

---

## 12. Testing Plan (mapped 1:1 to PRD's required test list)

Implemented as a dedicated `trust-rules.spec.ts` suite plus module-level tests:

1. Verified information renders with correct badge/source — `trust-validation` unit test.
2. Unverified info never rendered as verified — negative test asserting badge mapping is exhaustive/whitelisted (no default-to-verified fallthrough).
3. Missing opening hours → "Unknown ⚠ Not verified", never fabricated — planner + validation test.
4. Missing safety info → same pattern.
5. Community-sourced facts remain labeled through the full pipeline (including translation) — E2E.
6. Live vs. static distinguished — mock live-data outage, assert fallback label appears.
7. Overcrowded destination triggers alternatives — crowding engine unit test with seeded high-crowd fixture.
8. Sensitive locations filtered — seeded `sensitivity_flags` fixture.
9. Accessibility requirement changes itinerary composition — property test: two identical requests differing only in accessibility produce different candidate sets.
10. Invalid itineraries rejected — feasibility-pass test with an intentionally impossible transition, assert planner rejects/reschedules.
11. Critical claims have provenance — schema-level assertion: every `itinerary_item` critical field has a non-null `fact_id`.
12. Conflicting sources trigger uncertainty — two VERIFIED sources with different values for the same fact → assert "disputed" state, not silent pick.
13. API failures have fallbacks — mocked weather/transport 500s → assert graceful fallback copy, no crash, no fake data.
14. Multilingual responses preserve trust labels — run the same itinerary through en/hi/or and diff the structured trust fields (must be identical; only prose differs).
15. Local-business recommendations don't falsely claim ownership — assert `is_locally_owned=true` requires non-null `ownership_evidence_source_id`.

Plus: one realistic **end-to-end scenario test** (Playwright) — full journey from landing page through a 3-day itinerary in Hindi with one accessibility requirement and one deliberately-seeded overcrowded attraction, asserting the correct exclusion + alternative + trust UI at every step.

---

## 13. Phased Build Plan (execution order for Antigravity)

| Phase | Deliverable | Exit criteria |
|---|---|---|
| 0 | Repo scaffold: backend (Express+TS+Prisma), frontend (Vite+React+TS+Tailwind), Docker Compose for Postgres+PostGIS+Redis, env/config validation | `docker compose up` boots all services; health check endpoint green |
| 1 | Schema + migrations (§4) + seed script with one real, hand-verified destination dataset (recommend: seed 1 Indian city, ~15–20 real attractions with genuinely sourced opening hours/accessibility info, not placeholders) | Seed data passes a manual provenance audit |
| 2 | Knowledge Layer CRUD + Source Verification module + `/attractions/:id/facts` endpoint | Fact provenance visible via API for every seeded record |
| 3 | Live Data Module (weather + routing adapters, Redis TTL cache, fallback handling) | Kill an API key → system falls back cleanly, labels degrade correctly |
| 4 | Crowding & Sensitivity Engine + itinerary Planning Engine (deterministic) | Feasibility + exclusion unit tests (items 7–10 in §12) pass |
| 5 | Auth + user preferences (incl. accessibility) | Preference changes provably change planner output |
| 6 | LLM layer: NLU extraction + explanation generation (isolated modules) | Explanation output never introduces an unsupported claim (tested) |
| 7 | Trust Validation Layer (final gate) | Full trust-rules test suite (§12, items 1–13) green |
| 8 | i18n/multilingual pipeline | Item 14 test green across en/hi/or |
| 9 | Frontend: Landing/Search → Preference Setup → Trip Dashboard → Recommendation Cards → Trust UI | Full manual click-through in all 3 languages |
| 10 | Feedback module + admin review queue (minimal internal UI or authenticated endpoint) | Feedback flag → disputed state → review → resolution, round-trip verified |
| 11 | E2E Playwright suite + hardening pass (security checklist §11) + performance pass (§6 in PRD) | All PRD success metrics met on seed dataset |
| 12 | Polish: loading states, empty states, error copy audit (no `undefined`/`NaN`/stack traces), responsive/accessibility (WCAG AA) pass | Clean, deployable MVP |

Each phase leaves the app runnable — Antigravity should run and verify (`npm run test`, `npm run dev`, manual smoke) at the end of every phase before moving to the next, per the master engineering directive.

---

## 14. Environment Variables (server-side only, `.env`, never committed)

```
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
ANTHROPIC_API_KEY=
WEATHER_API_KEY=
ROUTING_API_KEY=
NODE_ENV=
CORS_ORIGIN=
```

---

## 15. What's Deliberately Deferred Past MVP

- Real-time transit disruption feeds (needs per-city transit-authority partnerships — out of reach for MVP; static+manual-refresh is the honest interim state, clearly labeled).
- ML-based crowd prediction (rule-based scoring is more explainable and auditable for a trust-first product; revisit once there's a labeled dataset).
- More than 3 languages, native apps, booking/payments, full social layer.

---

*This TRD is implementation-ready. Build order follows §13. Any deviation from the ADRs in §1 should be logged as a new ADR row with rationale, not silently changed.*

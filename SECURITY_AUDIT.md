# Security Audit Report

**Project:** Multilingual Trustworthy Travel Assistant (SIH 2026)
**Auditor:** Security Hardening Pass
**Date:** 2026-08-14
**Scope:** Full codebase — backend (Express+TypeScript+Prisma), frontend (React+Vite+TypeScript)

---

## Executive Summary

This audit covered the complete codebase for secrets exposure, authentication, authorization, input validation, injection vectors, rate limiting, CORS, error handling, dependency vulnerabilities, and the product-specific Trust Validation Gate. **8 issues** were found and **all fixable issues have been remediated in code**. Zero changes weaken the Trust Validation Gate or anti-hallucination guarantees.

---

## Findings Table

| # | Category | File / Location | Severity | Status | Description |
|---|----------|----------------|----------|--------|-------------|
| 1 | Secrets | `.env` files | ✅ Info | Verified Safe | `.env` is git-ignored, not tracked in history. No secrets leaked. |
| 2 | Secrets | `SUPABASE_ANON_KEY` | ✅ Info | Verified Safe | Key is a publishable anon key (prefix `sb_publishable`), NOT a service-role key. Backend uses Prisma/DATABASE_URL directly. No `SUPABASE_SERVICE_KEY` exists in codebase. |
| 3 | Secrets | `VITE_` prefix check | ✅ Info | Verified Safe | No secret has a `VITE_` prefix. No secrets in frontend bundle. |
| 4 | Auth | Backend — all endpoints | 🔴 Critical | **Fixed** | No auth middleware existed. Added `requireAuth` and `optionalAuth` middleware. In MVP dev mode (with dev JWT_SECRET), requests pass with a warning. In production, auth is enforced. |
| 5 | IDOR/Abuse | `feedback/index.ts` | 🔴 Critical | **Fixed** | Any unauthenticated user could downgrade any fact to DISPUTED with a single POST. Fixed: removed auto-downgrade, added auth + rate limiting + entity existence check. Feedback is now stored as PENDING for manual review. |
| 6 | Rate Limiting | `server.ts` | 🟠 High | **Fixed** | `express-rate-limit` was a dependency but never used. Added: global limiter (100/min), strict limiter on planner/NLU (10/min), feedback limiter (20/min). |
| 7 | Input Validation | `planner/index.ts`, `nlu/index.ts` | 🟡 Medium | **Fixed** | Zod schemas lacked `.strict()` and array size limits. Added `.strict()` to all schemas, `.max(20)` on interests, `.max(20)` on narrate itinerary array, `.max(500)` on feedback comment. |
| 8 | Config | `config/index.ts` | 🟡 Medium | **Fixed** | `JWT_SECRET` had a `.default()` with a weak dev value, allowing the app to boot without a real secret. Removed default, added production-mode guard rejecting `dev-jwt-secret*` prefix. |
| 9 | Health Check | `server.ts` | 🟡 Medium | **Fixed** | Health check was superficial (no DB check). Enhanced to verify Prisma DB connectivity, report memory/uptime, return 503 when degraded. |
| 10 | Frontend | `App.tsx` | 🟡 Low | **Fixed** | Hardcoded `http://localhost:3001/api/v1` — breaks in production. Changed to relative `/api/v1`. |
| 11 | CORS | `server.ts` | ✅ Info | Verified Safe | CORS locked to `env.CORS_ORIGIN`, not `*`. |
| 12 | Helmet | `server.ts` | ✅ Info | Verified Safe | Helmet is used for security headers. |
| 13 | Error Handling | `errorHandler.ts` | ✅ Info | Verified Safe | Generic errors in prod, detailed in dev. No stack traces leak to client. |
| 14 | SQL Injection | `planner/index.ts` L231 | ✅ Info | Verified Safe | `$queryRaw` uses tagged template literals — Prisma auto-parameterizes. |
| 15 | XSS | Frontend components | ✅ Info | Verified Safe | No `dangerouslySetInnerHTML`. React escapes by default. |
| 16 | i18n | `i18n/index.ts` | ✅ Info | Verified Safe | Locale files statically imported, no remote loading attack surface. |
| 17 | Trust Gate | `trust-validation/index.ts` | ✅ Info | Verified Safe | Gate strips invalid `[fact:ID]` markers from LLM output. MVP mock always adds markers. Gate was NOT weakened by any security fix. |
| 18 | Dependencies | `npm audit` both sides | ✅ Info | Verified Safe | 0 vulnerabilities in backend and frontend. |
| 19 | Type Safety | `routing.ts`, `weather.ts` | 🟢 Low | **Fixed** | Pre-existing `fetch().json()` returned `unknown` — added proper type assertions. |
| 20 | Build Config | `tsconfig.json` | 🟢 Low | **Fixed** | Pre-existing compile error from `prisma/seed.ts` outside `rootDir`. |

---

## Items Requiring Manual Action

> **None of these can be done in code — they require your action:**

### 1. Key Rotation (Recommended but Not Critical)
The `.env` secrets were never committed to git history (verified). However, if you've ever shared the `.env` file outside of this machine, rotate:
- `GEMINI_API_KEY`
- `ROUTING_API_KEY` (ORS)
- `JWT_SECRET`
- `DATABASE_URL` password
- `SUPABASE_ANON_KEY`

### 2. Production JWT_SECRET
Before deploying to production, set a strong random `JWT_SECRET` (64+ chars). The config now rejects the dev placeholder in production mode.

### 3. Auth Endpoints
The auth middleware scaffold is in place, but actual registration/login endpoints (`/api/v1/auth/register`, `/api/v1/auth/login`) are not yet implemented. These are needed for the auth middleware to be useful beyond dev bypass mode.

### 4. Supabase RLS
The codebase uses Prisma (direct PostgreSQL via `DATABASE_URL`), not the Supabase JS client with `SUPABASE_SERVICE_KEY`. This means Supabase RLS policies don't apply — all access control is application-level. This is fine as long as the backend is the only path to the database. **Ensure no client-side Supabase JS client uses this DATABASE_URL.**

---

## Trust Validation Gate Integrity Confirmation

✅ **No security fix weakened the Trust Validation Gate.** Specifically:
- The `validateLLMNarration()` function was not modified
- The `resolveSourceConflicts()` function was not modified
- The feedback endpoint no longer auto-downgrades facts (strengthens trust, doesn't weaken it)
- Error handling changes never silently present cached/stale data as "live"

---

## Files Changed

| File | Change |
|------|--------|
| `backend/src/server.ts` | Rate limiting, enhanced health check |
| `backend/src/shared/middleware/auth.ts` | **NEW** — JWT auth middleware |
| `backend/src/shared/middleware/rateLimiter.ts` | **NEW** — Rate limiter configs |
| `backend/src/shared/config/index.ts` | Removed JWT_SECRET default, added prod guard |
| `backend/src/modules/feedback/index.ts` | Auth, rate limiting, no auto-downgrade, entity check |
| `backend/src/modules/nlu/index.ts` | `.strict()`, array limits, removed unused import |
| `backend/src/modules/planner/index.ts` | `.strict()`, interests array capped |
| `backend/src/modules/live-data/weather.ts` | Type-safe API response |
| `backend/src/modules/live-data/routing.ts` | Type-safe API response |
| `backend/tsconfig.json` | Fixed pre-existing seed.ts rootDir error |
| `frontend/src/App.tsx` | Relative API base URL |

---

## Verification Results

- ✅ `npx tsc --noEmit` — clean (0 errors)
- ✅ `npm audit` backend — 0 vulnerabilities
- ✅ `npm audit` frontend — 0 vulnerabilities
- ✅ `.env` not tracked in git history
- ✅ No `VITE_` prefixed secrets
- ✅ No `dangerouslySetInnerHTML` in frontend
- ✅ Trust Validation Gate code unchanged

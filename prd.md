# Product Requirements Document (PRD)
## Multilingual Trustworthy Travel Assistant (MVP)

**Version:** 1.0
**Status:** Approved for build — ready for import into Antigravity
**Owner:** Product/Engineering (single-owner MVP)
**Last updated:** 2026-08-13

---

## 1. Repository Inspection Summary (baseline before this PRD)

Before writing this PRD, the project workspace was inspected. Findings:

- There is **no existing application code repository** — only two planning artifacts exist:
  - `Project_Notes_Document.pdf` — early architecture notes covering: Firebase Authentication (email/password, Google, GitHub, phone OTP, anonymous), a routing/logic API layer (OpenRouteService / Mapbox Directions / OSRM candidates), a Pipedream-based "API → API" integration idea, a ride-fare comparison engine (Uber/Ola cost formulas), MongoDB Atlas as a candidate datastore, an Express.js REST layer, and a separately-scoped "Weather API module" (client request → backend processing → external fetch → normalized response).
  - `api_working_.pdf` — handwritten architecture sketches, consistent with the same stack ideas (mostly diagrams, no additional decisions beyond the notes doc).
- **Conclusion:** this is a **greenfield build**. The early notes are directionally useful (they correctly anticipated the need for a routing layer, a normalized external-API layer, and an auth provider) but they predate the trust/verification/provenance requirements that now govern this product. Where the notes conflict with the hardened requirements below (e.g., MongoDB vs. relational+geospatial storage), **this PRD and its companion TRD supersede the notes.** Rationale is documented in the TRD's "Architecture Decision Records" section.

This PRD defines **what** we are building and **why**. The companion **TRD** (`TRD_Multilingual_Trustworthy_Travel_Assistant.md`) defines **how**, including schema, API contracts, module boundaries, and the build sequence for Antigravity to execute against.

---

## 2. Product Vision

A travel planning assistant that a user can trust the way they'd trust a knowledgeable, honest local friend — not a generic chatbot. It produces personalized, day-by-day itineraries built from **verifiable data**, clearly separates fact from inference, adapts to accessibility needs, avoids funneling tourists into overcrowded or culturally sensitive sites, favors local economic benefit where evidence supports it, and communicates all of this in the user's language (English, Hindi, Odia at launch) without losing any trust signal in translation.

**Non-goal:** being the most "conversational" or "creative" travel chatbot. If a feature increases fluency at the cost of factual reliability, it is rejected.

---

## 3. The Central Product Rule

> **The AI must never fabricate critical travel information.**

Critical information = opening/closing hours, temporary closures, ticket requirements, current prices, transport schedules/disruptions, weather, safety advisories, accessibility availability, site capacity, crowd conditions, cultural restrictions/local rules, and business operating status.

If any of the above cannot be verified against a real source, the system must **omit it or mark it uncertain** — never guess, never let the LLM backfill from general knowledge. This rule is enforced architecturally (see §9 and the TRD's Trust Validation Layer), not just by prompting the model to "be careful."

---

## 4. Target Users & Core Use Cases

| Persona | Need | Success looks like |
|---|---|---|
| Domestic Indian tourist (Hindi/Odia speaker) | Plan a 2–4 day trip to an unfamiliar city with confidence | Itinerary in their language, accessible hours/prices they can verify, no surprises on arrival |
| Accessibility-constrained traveler (wheelchair user, low-vision, elderly, walking-limited) | Itinerary that is physically feasible, not just interesting | Every stop and transition respects their stated constraints; nothing recommended that isn't actually accessible |
| Budget/first-time international visitor | Avoid scams, overpaying, or wasted trips to closed attractions | Every price/hour is either verified or explicitly flagged as unverified |
| Sustainability/community-minded traveler | Avoid contributing to overtourism; support local businesses | Overcrowded/sensitive sites are proactively deprioritized with honest alternatives; local-business claims are evidence-backed |

### Primary user journeys (MVP scope)
1. **Plan a trip** — enter destination, dates, preferences → receive a validated, explainable day-by-day itinerary.
2. **Inspect trust** — for any recommendation, see why it was chosen, its verification status, its source, and alternatives.
3. **Adjust the plan** — change pace, swap out a low-confidence recommendation, or ask "why not X" and get an honest answer (e.g., "X is currently over capacity").
4. **Get it in my language** — full itinerary and trust labels available in English, Hindi, or Odia without loss of meaning or provenance.
5. **Leave feedback** — flag an inaccurate fact, which feeds the verification pipeline (community/feedback loop).

---

## 5. Functional Requirements

### 5.1 Trip Setup & Personalization
- Destination, travel dates, trip duration, budget band, group type (solo/couple/family/group), pace (relaxed/moderate/packed).
- Interests (multi-select taxonomy: culture, nature, food, history, adventure, nightlife, shopping, spiritual, etc.).
- Food preferences (dietary restrictions, cuisine interest, local-food preference).
- Transportation preference (walking, public transit, cab, own vehicle, mixed).
- **Accessibility requirements are explicitly and separately elicited** — never assumed, never inferred from other fields. Options include mobility (wheelchair/limited walking), vision, hearing, cognitive/sensory, and "none." Multi-select, free-text elaboration allowed.
- Indoor/outdoor preference, walking tolerance (distance/time thresholds), local-business preference (on/off).
- Language selection (English / Hindi / Odia at launch).

### 5.2 Itinerary Generation
- System produces a day-by-day itinerary with realistic timing, including **travel-time buffers** between stops (no impossible back-to-back scheduling).
- Each day balances interests, pace, meal timing, opening hours, weather, accessibility, budget, and crowd/capacity constraints.
- Itinerary is generated by a **deterministic planning engine first**; the LLM only narrates and explains an already-valid plan (see §9).

### 5.3 Recommendation Cards
Every recommended place/business/experience must display:
- Name, category, why recommended (tied to a specific stated user preference).
- **Verification status badge** (Verified / Live / Community / Inferred / Unverified / Outdated) with plain-language meaning, not jargon.
- Source (name of source, not a raw URL dump) and "last checked" timestamp.
- Live status where applicable (e.g., "open now — live" vs. "typically open — scheduled").
- Accessibility information (or an explicit "not verified" if unknown).
- Crowd/capacity status.
- At least one alternative if the primary pick has any degraded trust state.

### 5.4 Crowding & Sensitivity Handling
- Overcrowded or environmentally/culturally sensitive sites are **not silently included**. The system explains the exclusion and offers evidence-based alternatives satisfying similar interests.
- User-facing copy avoids alarmism; it's factual and constructive (see example in the master spec).

### 5.5 Trust & Provenance UI
- A visible, simple legend: 🟢 Verified · 🔵 Live · 🟡 Community-sourced · 🟠 AI-inferred · 🔴 Unverified/Outdated.
- Any itinerary item lacking a critical fact shows "Unknown ⚠ Not verified" rather than a guess.
- Conflicting sources surface as an explicit uncertainty note, never a silently-picked "best guess."

### 5.6 Local Business Support
- Local/community-owned tagging only appears when backed by evidence (e.g., an official local-business registry, verified community source). No default assumption of local ownership.
- Ranking blends relevance, quality signals, user preference fit, accessibility, availability, and evidence quality — not popularity alone.

### 5.7 Multilingual Delivery
- English, Hindi, Odia at launch; architecture allows adding languages without rework.
- Translation happens on **structured content**, not on a finished English paragraph — place names, dates, currency, numbers, and trust labels are formatted per-locale and never mistranslated or dropped.

### 5.8 Feedback Loop
- Users can flag a specific fact as wrong/outdated. Flags are stored with provenance and surfaced to a review queue (manual/admin review in MVP; no auto-publish of unverified user corrections into VERIFIED state).

### 5.9 Explainability
- Every recommendation answers, in-product: **why selected, what evidence supports it, what uncertainty exists, what the alternatives are.**

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Trust/accuracy | No critical fact reaches the UI without a provenance record; validation pipeline blocks unverified critical claims before render |
| Privacy | Only travel-relevant personalization data is collected; no protected-attribute-based ranking; user preferences stored separately from public travel data |
| Accessibility | WCAG 2.1 AA target for the frontend itself, independent of the accessibility-aware itinerary logic |
| Security | Server-side secrets only, input validation/sanitization, protected API endpoints, external content treated as untrusted (prompt-injection resistant) |
| Reliability | Graceful degradation for any external API outage — never fabricate a live response |
| Performance | Itinerary generation P95 < 8s end-to-end (including LLM explanation pass) with cached/static fallback data |
| Internationalization | New language addable via translation-resource + locale config, no code fork |
| Auditability | Every itinerary is reproducible from its stored inputs + fact snapshot for support/debugging |

---

## 7. Explicitly Out of Scope (MVP)

- Real-time booking/payment integration (tickets, hotels, transport purchase).
- Full social/community platform (reviews authoring UI beyond simple feedback flags).
- More than 3 launch languages.
- Native mobile apps (responsive web only for MVP).
- Real-time multi-user collaborative trip editing.
- Fully automated "self-healing" verification (MVP verification refresh is scheduled + on-demand, not continuous streaming).

---

## 8. Success Metrics

- **Zero** critical-fact fabrication incidents in QA/test-suite runs (hard gate, not a target to approach).
- ≥95% of itinerary items carry a non-"Unverified" state for MVP's seeded destination(s).
- 100% of accessibility-flagged users receive itineraries with zero infeasible transitions.
- Trust legend comprehension: users can correctly explain what a badge means without reading docs (validated via lightweight usability check).
- Multilingual parity: no dropped/mistranslated trust label, date, or price across the 3 launch languages (test-suite enforced).

---

## 9. Product-Level Guardrails (carried into engineering as hard constraints)

1. The LLM is never the source of truth; it explains and phrases, it does not decide facts.
2. Every critical fact rendered to a user must carry: `fact, source, source_type, verification_status, timestamp, last_checked, confidence, geographic_scope`.
3. Source conflicts must surface as uncertainty, never be silently resolved.
4. Accessibility constraints must materially change itinerary composition and routing, not just appear as a stored profile field.
5. Crowded/sensitive destinations get deprioritized + explained + alternatived — never silently dropped without explanation, never silently included.
6. Local-business "locally owned" claims require evidence; false claims are treated as a trust-layer defect.
7. Mock/demo data is allowed during development but must be visibly labeled as such and never presented as live/verified.

---

## 10. Open Product Questions (to resolve during build, non-blocking)

- Which single destination/region to seed first with real verified data for the MVP demo (recommend: one mid-size Indian city with accessible open data — to be finalized in Phase 1 of the TRD).
- Whether community feedback that corrects a VERIFIED fact should auto-downgrade it to UNVERIFIED pending review, or require two independent flags — **default decision: single flag auto-downgrades to "disputed," pending review before any state change.**

---

*This PRD is the source of "what/why." See the TRD for schema, API contracts, module design, phased build plan, and the concrete engineering decisions needed to start implementation in Antigravity.*

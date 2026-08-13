// ─── Verification Status Enum ───────────────────────────────────────────────
// Matches Prisma enum + frontend badge rendering
export enum VerificationStatus {
  VERIFIED = 'VERIFIED',
  LIVE = 'LIVE',
  COMMUNITY = 'COMMUNITY',
  INFERRED = 'INFERRED',
  UNVERIFIED = 'UNVERIFIED',
  OUTDATED = 'OUTDATED',
  DISPUTED = 'DISPUTED',
}

// ─── Source Type Enum ───────────────────────────────────────────────────────
export enum SourceType {
  GOVERNMENT = 'GOVERNMENT',
  OFFICIAL_TOURISM = 'OFFICIAL_TOURISM',
  OFFICIAL_OPERATOR = 'OFFICIAL_OPERATOR',
  TRANSPORT_AUTHORITY = 'TRANSPORT_AUTHORITY',
  WEATHER_SERVICE = 'WEATHER_SERVICE',
  VERIFIED_LOCAL_ORG = 'VERIFIED_LOCAL_ORG',
  TRUSTED_THIRD_PARTY = 'TRUSTED_THIRD_PARTY',
  COMMUNITY = 'COMMUNITY',
  AI_INFERENCE = 'AI_INFERENCE',
}

// ─── Crowd Level Enum ───────────────────────────────────────────────────────
export enum CrowdLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  SEVERE = 'SEVERE',
}

// ─── Sensitivity Type Enum ──────────────────────────────────────────────────
export enum SensitivityType {
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  CULTURAL = 'CULTURAL',
  COMMUNITY_RESTRICTION = 'COMMUNITY_RESTRICTION',
}

// ─── Feedback Status Enum ───────────────────────────────────────────────────
export enum FeedbackStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

// ─── Trip Status Enum ───────────────────────────────────────────────────────
export enum TripStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

// ─── Budget Band ────────────────────────────────────────────────────────────
export enum BudgetBand {
  BUDGET = 'BUDGET',
  MODERATE = 'MODERATE',
  PREMIUM = 'PREMIUM',
}

// ─── Pace ───────────────────────────────────────────────────────────────────
export enum Pace {
  RELAXED = 'RELAXED',
  MODERATE = 'MODERATE',
  PACKED = 'PACKED',
}

// ─── Group Type ─────────────────────────────────────────────────────────────
export enum GroupType {
  SOLO = 'SOLO',
  COUPLE = 'COUPLE',
  FAMILY = 'FAMILY',
  GROUP = 'GROUP',
}

// ─── Transport Preference ───────────────────────────────────────────────────
export enum TransportPreference {
  WALKING = 'WALKING',
  PUBLIC_TRANSIT = 'PUBLIC_TRANSIT',
  CAB = 'CAB',
  OWN_VEHICLE = 'OWN_VEHICLE',
  MIXED = 'MIXED',
}

// ─── API Response Types ─────────────────────────────────────────────────────
export interface ApiError {
  code: string;
  message: string;
  fallback_used?: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// ─── Fact Provenance (attached to every fact in API responses) ───────────────
export interface FactProvenance {
  fact_id: string;
  fact_key: string;
  fact_value: unknown;
  source_name: string;
  source_type: SourceType;
  verification_status: VerificationStatus;
  confidence: number;
  timestamp: string;
  last_checked: string;
  geographic_scope?: string;
}

// ─── Trust Summary (rolled up per itinerary item) ───────────────────────────
export interface TrustSummary {
  overall_status: VerificationStatus;
  facts: FactProvenance[];
  warnings: string[];
}

// ─── Supported Locales ──────────────────────────────────────────────────────
export const SUPPORTED_LOCALES = ['en', 'hi', 'or'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

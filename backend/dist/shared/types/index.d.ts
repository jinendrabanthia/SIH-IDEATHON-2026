export declare enum VerificationStatus {
    VERIFIED = "VERIFIED",
    LIVE = "LIVE",
    COMMUNITY = "COMMUNITY",
    INFERRED = "INFERRED",
    UNVERIFIED = "UNVERIFIED",
    OUTDATED = "OUTDATED",
    DISPUTED = "DISPUTED"
}
export declare enum SourceType {
    GOVERNMENT = "GOVERNMENT",
    OFFICIAL_TOURISM = "OFFICIAL_TOURISM",
    OFFICIAL_OPERATOR = "OFFICIAL_OPERATOR",
    TRANSPORT_AUTHORITY = "TRANSPORT_AUTHORITY",
    WEATHER_SERVICE = "WEATHER_SERVICE",
    VERIFIED_LOCAL_ORG = "VERIFIED_LOCAL_ORG",
    TRUSTED_THIRD_PARTY = "TRUSTED_THIRD_PARTY",
    COMMUNITY = "COMMUNITY",
    AI_INFERENCE = "AI_INFERENCE"
}
export declare enum CrowdLevel {
    LOW = "LOW",
    MODERATE = "MODERATE",
    HIGH = "HIGH",
    SEVERE = "SEVERE"
}
export declare enum SensitivityType {
    ENVIRONMENTAL = "ENVIRONMENTAL",
    CULTURAL = "CULTURAL",
    COMMUNITY_RESTRICTION = "COMMUNITY_RESTRICTION"
}
export declare enum FeedbackStatus {
    PENDING = "PENDING",
    REVIEWED = "REVIEWED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}
export declare enum TripStatus {
    DRAFT = "DRAFT",
    PLANNED = "PLANNED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED"
}
export declare enum BudgetBand {
    BUDGET = "BUDGET",
    MODERATE = "MODERATE",
    PREMIUM = "PREMIUM"
}
export declare enum Pace {
    RELAXED = "RELAXED",
    MODERATE = "MODERATE",
    PACKED = "PACKED"
}
export declare enum GroupType {
    SOLO = "SOLO",
    COUPLE = "COUPLE",
    FAMILY = "FAMILY",
    GROUP = "GROUP"
}
export declare enum TransportPreference {
    WALKING = "WALKING",
    PUBLIC_TRANSIT = "PUBLIC_TRANSIT",
    CAB = "CAB",
    OWN_VEHICLE = "OWN_VEHICLE",
    MIXED = "MIXED"
}
export interface ApiError {
    code: string;
    message: string;
    fallback_used?: boolean;
}
export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
}
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
export interface TrustSummary {
    overall_status: VerificationStatus;
    facts: FactProvenance[];
    warnings: string[];
}
export declare const SUPPORTED_LOCALES: readonly ["en", "hi", "or"];
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
//# sourceMappingURL=index.d.ts.map
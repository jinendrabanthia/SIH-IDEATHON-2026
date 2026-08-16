// ─── Verification Status Enum ───────────────────────────────────────────────
// Matches Prisma enum + frontend badge rendering
export var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["LIVE"] = "LIVE";
    VerificationStatus["COMMUNITY"] = "COMMUNITY";
    VerificationStatus["INFERRED"] = "INFERRED";
    VerificationStatus["UNVERIFIED"] = "UNVERIFIED";
    VerificationStatus["OUTDATED"] = "OUTDATED";
    VerificationStatus["DISPUTED"] = "DISPUTED";
})(VerificationStatus || (VerificationStatus = {}));
// ─── Source Type Enum ───────────────────────────────────────────────────────
export var SourceType;
(function (SourceType) {
    SourceType["GOVERNMENT"] = "GOVERNMENT";
    SourceType["OFFICIAL_TOURISM"] = "OFFICIAL_TOURISM";
    SourceType["OFFICIAL_OPERATOR"] = "OFFICIAL_OPERATOR";
    SourceType["TRANSPORT_AUTHORITY"] = "TRANSPORT_AUTHORITY";
    SourceType["WEATHER_SERVICE"] = "WEATHER_SERVICE";
    SourceType["VERIFIED_LOCAL_ORG"] = "VERIFIED_LOCAL_ORG";
    SourceType["TRUSTED_THIRD_PARTY"] = "TRUSTED_THIRD_PARTY";
    SourceType["COMMUNITY"] = "COMMUNITY";
    SourceType["AI_INFERENCE"] = "AI_INFERENCE";
})(SourceType || (SourceType = {}));
// ─── Crowd Level Enum ───────────────────────────────────────────────────────
export var CrowdLevel;
(function (CrowdLevel) {
    CrowdLevel["LOW"] = "LOW";
    CrowdLevel["MODERATE"] = "MODERATE";
    CrowdLevel["HIGH"] = "HIGH";
    CrowdLevel["SEVERE"] = "SEVERE";
})(CrowdLevel || (CrowdLevel = {}));
// ─── Sensitivity Type Enum ──────────────────────────────────────────────────
export var SensitivityType;
(function (SensitivityType) {
    SensitivityType["ENVIRONMENTAL"] = "ENVIRONMENTAL";
    SensitivityType["CULTURAL"] = "CULTURAL";
    SensitivityType["COMMUNITY_RESTRICTION"] = "COMMUNITY_RESTRICTION";
})(SensitivityType || (SensitivityType = {}));
// ─── Feedback Status Enum ───────────────────────────────────────────────────
export var FeedbackStatus;
(function (FeedbackStatus) {
    FeedbackStatus["PENDING"] = "PENDING";
    FeedbackStatus["REVIEWED"] = "REVIEWED";
    FeedbackStatus["ACCEPTED"] = "ACCEPTED";
    FeedbackStatus["REJECTED"] = "REJECTED";
})(FeedbackStatus || (FeedbackStatus = {}));
// ─── Trip Status Enum ───────────────────────────────────────────────────────
export var TripStatus;
(function (TripStatus) {
    TripStatus["DRAFT"] = "DRAFT";
    TripStatus["PLANNED"] = "PLANNED";
    TripStatus["ACTIVE"] = "ACTIVE";
    TripStatus["COMPLETED"] = "COMPLETED";
})(TripStatus || (TripStatus = {}));
// ─── Budget Band ────────────────────────────────────────────────────────────
export var BudgetBand;
(function (BudgetBand) {
    BudgetBand["BUDGET"] = "BUDGET";
    BudgetBand["MODERATE"] = "MODERATE";
    BudgetBand["PREMIUM"] = "PREMIUM";
})(BudgetBand || (BudgetBand = {}));
// ─── Pace ───────────────────────────────────────────────────────────────────
export var Pace;
(function (Pace) {
    Pace["RELAXED"] = "RELAXED";
    Pace["MODERATE"] = "MODERATE";
    Pace["PACKED"] = "PACKED";
})(Pace || (Pace = {}));
// ─── Group Type ─────────────────────────────────────────────────────────────
export var GroupType;
(function (GroupType) {
    GroupType["SOLO"] = "SOLO";
    GroupType["COUPLE"] = "COUPLE";
    GroupType["FAMILY"] = "FAMILY";
    GroupType["GROUP"] = "GROUP";
})(GroupType || (GroupType = {}));
// ─── Transport Preference ───────────────────────────────────────────────────
export var TransportPreference;
(function (TransportPreference) {
    TransportPreference["WALKING"] = "WALKING";
    TransportPreference["PUBLIC_TRANSIT"] = "PUBLIC_TRANSIT";
    TransportPreference["CAB"] = "CAB";
    TransportPreference["OWN_VEHICLE"] = "OWN_VEHICLE";
    TransportPreference["MIXED"] = "MIXED";
})(TransportPreference || (TransportPreference = {}));
// ─── Supported Locales ──────────────────────────────────────────────────────
export const SUPPORTED_LOCALES = ['en', 'hi', 'or'];
//# sourceMappingURL=index.js.map
export type VerificationStatus =
  | 'VERIFIED'
  | 'LIVE'
  | 'COMMUNITY'
  | 'INFERRED'
  | 'UNVERIFIED'
  | 'OUTDATED'
  | 'DISPUTED';

export type SourceType =
  | 'GOVERNMENT'
  | 'OFFICIAL_TOURISM'
  | 'OFFICIAL_OPERATOR'
  | 'TRANSPORT_AUTHORITY'
  | 'WEATHER_SERVICE'
  | 'VERIFIED_LOCAL_ORG'
  | 'TRUSTED_THIRD_PARTY'
  | 'COMMUNITY'
  | 'AI_INFERENCE';

export type CrowdLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
export type Pace = 'RELAXED' | 'MODERATE' | 'PACKED';
export type TransportPreference = 'WALKING' | 'PUBLIC_TRANSIT' | 'CAB' | 'OWN_VEHICLE' | 'MIXED';

export interface Destination {
  id: string;
  name: string;
  country: string;
  region?: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
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
  geographic_scope?: string | null;
}

export interface TrustSummary {
  overall_status: VerificationStatus;
  facts: FactProvenance[];
  warnings: string[];
}

export interface Attraction {
  id: string;
  destinationId: string;
  name: string;
  categories: string[];
  latitude: number;
  longitude: number;
  address?: string | null;
  description?: string | null;
  indoorOutdoor: string;
  accessibilityWheelchair: boolean;
  accessibilityVisual: boolean;
  accessibilityHearing: boolean;
  accessibilityNotes?: string | null;
}

export interface Exclusion {
  entityId: string;
  attractionName: string;
  reason: string;
  verificationStatus: VerificationStatus;
}

export interface ItineraryItem {
  dayNumber: number;
  sequence: number;
  entityType: string;
  entityId: string;
  attractionName: string;
  startTime: string;
  endTime: string;
  travelBufferMinutesBefore: number;
  explanationText?: string;
  factIds?: string[];
  trustSummary: TrustSummary;
}

export interface ItineraryPlanResponse {
  destinationId: string;
  days: number;
  itineraryItems: ItineraryItem[];
  excluded: Exclusion[];
  warnings: string[];
}

export interface PlannerInput {
  destinationId: string;
  startDate: string;
  days: number;
  preferences: {
    pace: Pace;
    accessibilityWheelchair: boolean;
    interests: string[];
    transportPreference: TransportPreference;
  };
}

export interface NLUExtractResult {
  pace: Pace;
  transportPreference: TransportPreference;
  groupType: 'SOLO' | 'COUPLE' | 'FAMILY' | 'GROUP';
  accessibilityWheelchair: boolean;
  interests: string[];
}

export interface LiveWeatherData {
  temperature_celsius?: number;
  temperature?: number;
  condition: string;
  is_day?: boolean;
  humidity?: number;
  windSpeed?: number;
  uvIndex?: number;
  alert?: string | null;
  source?: string;
  verifiedAt?: string;
}

export interface RouteGeometryData {
  distance_meters: number;
  duration_seconds: number;
  geometry: {
    type: string;
    coordinates: [number, number][]; // [lon, lat]
  };
}

export interface FeedbackPayload {
  entityId: string;
  entityType: 'ATTRACTION' | 'FACT' | 'CROWD_RECORD';
  feedbackType: 'INACCURATE' | 'OUTDATED' | 'OTHER';
  comment?: string;
}

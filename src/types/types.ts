/**
 * SafeNeighbor Type Definitions
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export type TabParamList = {
  Search: undefined;
  Map: undefined;
  Alerts: undefined;
  Safety: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Detail: { offender: Offender };
};

export type DetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Detail'
>;

// ---------------------------------------------------------------------------
// Offender Data
// ---------------------------------------------------------------------------

export type RiskLevel = 'low' | 'moderate' | 'high';

export type ComplianceStatus = 'compliant' | 'non-compliant';

export type DataSource =
  | 'offenders_io'
  | 'iowa_sor'
  | 'nsopw'
  | 'family_watchdog'
  | 'crimeometer';

export interface Offender {
  id: string;
  name: string;
  aliases: string[];
  dob: string;
  sex: string;
  race: string;
  height: string;
  weight: string;
  eyeColor: string;
  hairColor: string;
  photoUrl: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  offenseDescription: string;
  convictionDate: string;
  registrationDate: string;
  riskLevel: RiskLevel;
  complianceStatus: ComplianceStatus;
  source: DataSource;
  distance?: number;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number;
  address?: string;
  zipCode?: string;
  name?: string;
}

export interface SearchResult {
  offenders: Offender[];
  totalCount: number;
  sources: string[];
  searchedAt: string;
}

// ---------------------------------------------------------------------------
// API Configuration
// ---------------------------------------------------------------------------

export interface ApiEndpoint {
  baseUrl: string;
  apiKey?: string;
}

export interface ApiConfig {
  offendersIo: ApiEndpoint;
  iowa: ApiEndpoint;
  nsopw: ApiEndpoint;
  crimeoMeter: ApiEndpoint;
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export interface AlertConfig {
  enabled: boolean;
  radiusMiles: number;
  newRegistrants: boolean;
  complianceChanges: boolean;
  nearbyActivity: boolean;
}

export interface AlertHistoryItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'new_registrant' | 'compliance_change' | 'proximity';
}

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}
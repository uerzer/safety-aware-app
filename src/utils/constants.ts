/**
 * SafeNeighbor Constants
 */

import type { RiskLevel } from '../types/types';
import type { Region } from 'react-native-maps';

// ---------------------------------------------------------------------------
// Theme colors
// ---------------------------------------------------------------------------

export const COLORS = {
  primary: '#1A2A44',
  accent: '#E63946',
  background: '#F8F9FA',
  white: '#FFFFFF',
  textPrimary: '#1A2A44',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E8E8E8',
  cardBg: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#3B82F6',
} as const;

// ---------------------------------------------------------------------------
// Risk level colors (map pins + badges)
// ---------------------------------------------------------------------------

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#10B981',     // green
  moderate: '#F59E0B', // amber
  high: '#DC2626',     // red
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Level 1 - Low Risk',
  moderate: 'Level 2 - Moderate Risk',
  high: 'Level 3 - High Risk',
};

// ---------------------------------------------------------------------------
// Map defaults
// ---------------------------------------------------------------------------

export const DEFAULT_REGION: Region = {
  latitude: 39.8283,    // center of US
  longitude: -98.5795,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

// ---------------------------------------------------------------------------
// Search radius options (miles)
// ---------------------------------------------------------------------------

export const RADIUS_OPTIONS: number[] = [0.5, 1, 2, 3, 5];

export const DEFAULT_RADIUS = 1;

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------

export const STORAGE_KEYS = {
  ALERT_CONFIG: 'alert_config',
  IS_PREMIUM: 'is_premium',
  ALERT_HISTORY: 'alert_history',
  SEARCH_HISTORY: 'search_history',
  LAST_LOCATION: 'last_location',
  ONBOARDING_DONE: 'onboarding_done',
} as const;

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const API_TIMEOUT_MS = 10_000;
export const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_RESULTS = 100;

// ---------------------------------------------------------------------------
// Premium
// ---------------------------------------------------------------------------

export const PREMIUM_PRICE = '$4.99';
export const PREMIUM_PERIOD = 'month';
export const REVENUECAT_API_KEY_IOS = 'YOUR_REVENUECAT_IOS_KEY';
export const REVENUECAT_API_KEY_ANDROID = 'YOUR_REVENUECAT_ANDROID_KEY';
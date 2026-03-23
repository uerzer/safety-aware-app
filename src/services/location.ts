/**
 * SafeNeighbor Location Service
 * 
 * Handles GPS permissions, geolocation, distance calculations,
 * and radius-based geometry for the map and search features.
 */

import * as ExpoLocation from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  coords: Coordinates;
  accuracy: number | null;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Permission management
// ---------------------------------------------------------------------------

export async function requestLocationPermission(): Promise<boolean> {
  const { status: foreground } =
    await ExpoLocation.requestForegroundPermissionsAsync();
  return foreground === 'granted';
}

export async function requestBackgroundPermission(): Promise<boolean> {
  const { status } =
    await ExpoLocation.requestBackgroundPermissionsAsync();
  return status === 'granted';
}

export async function checkPermissionStatus(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  const fg = await ExpoLocation.getForegroundPermissionsAsync();
  const bg = await ExpoLocation.getBackgroundPermissionsAsync();
  return {
    foreground: fg.status === 'granted',
    background: bg.status === 'granted',
  };
}

// ---------------------------------------------------------------------------
// Get current location
// ---------------------------------------------------------------------------

export async function getCurrentLocation(): Promise<LocationResult | null> {
  const granted = await requestLocationPermission();
  if (!granted) return null;

  try {
    const location = await ExpoLocation.getCurrentPositionAsync({
      accuracy: ExpoLocation.Accuracy.Balanced,
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (err) {
    console.error('[Location] Failed to get position:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Distance calculation (Haversine formula)
// ---------------------------------------------------------------------------

const EARTH_RADIUS_MILES = 3958.8;

export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(point1.latitude)) *
      Math.cos(toRad(point2.latitude)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

/**
 * Filter an array of items with lat/lng by radius from a center point.
 */
export function filterByRadius<T extends Coordinates>(
  items: T[],
  center: Coordinates,
  radiusMiles: number
): (T & { distance: number })[] {
  return items
    .map((item) => ({
      ...item,
      distance: calculateDistance(center, item),
    }))
    .filter((item) => item.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance);
}

// ---------------------------------------------------------------------------
// Bounding box for map region
// ---------------------------------------------------------------------------

export function getBoundingBox(
  center: Coordinates,
  radiusMiles: number
): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  const latDelta = radiusMiles / 69.0; // ~69 miles per degree latitude
  const lonDelta =
    radiusMiles /
    (69.0 * Math.cos((center.latitude * Math.PI) / 180));

  return {
    north: center.latitude + latDelta,
    south: center.latitude - latDelta,
    east: center.longitude + lonDelta,
    west: center.longitude - lonDelta,
  };
}

// ---------------------------------------------------------------------------
// Reverse geocode (coordinates -> address)
// ---------------------------------------------------------------------------

export async function reverseGeocode(
  coords: Coordinates
): Promise<string | null> {
  try {
    const results = await ExpoLocation.reverseGeocodeAsync(coords);
    if (results.length > 0) {
      const r = results[0];
      const parts = [
        r.streetNumber,
        r.street,
        r.city,
        r.region,
        r.postalCode,
      ].filter(Boolean);
      return parts.join(', ') || null;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Watch location (for proximity alerts)
// ---------------------------------------------------------------------------

export async function watchLocation(
  callback: (location: LocationResult) => void,
  intervalMs: number = 30000
): Promise<ExpoLocation.LocationSubscription | null> {
  const hasBg = await requestBackgroundPermission();
  if (!hasBg) {
    console.warn('[Location] Background permission denied');
    return null;
  }

  try {
    return await ExpoLocation.watchPositionAsync(
      {
        accuracy: ExpoLocation.Accuracy.Balanced,
        timeInterval: intervalMs,
        distanceInterval: 100, // meters
      },
      (loc) => {
        callback({
          coords: {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          },
          accuracy: loc.coords.accuracy,
          timestamp: loc.timestamp,
        });
      }
    );
  } catch (err) {
    console.error('[Location] Watch failed:', err);
    return null;
  }
}
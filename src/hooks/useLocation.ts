/**
 * useLocation Hook
 * 
 * Provides reactive location state, permission handling,
 * and a simple interface for screens to request GPS position.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getCurrentLocation,
  checkPermissionStatus,
  type Coordinates,
} from '../services/location';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

interface UseLocationReturn {
  location: Coordinates | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean | null;
  requestLocation: () => Promise<Coordinates | null>;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );

  // Check permission status on mount
  useEffect(() => {
    (async () => {
      const status = await checkPermissionStatus();
      setPermissionGranted(status.foreground);

      // Restore last known location from cache
      const cached = await storage.get<Coordinates>(
        STORAGE_KEYS.LAST_LOCATION
      );
      if (cached) {
        setLocation(cached);
      }
    })();
  }, []);

  /**
   * Request current GPS location.
   * Handles permission prompts, caching, and error states.
   */
  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCurrentLocation();

      if (!result) {
        setPermissionGranted(false);
        setError(
          'Location permission denied. Please enable location services in Settings.'
        );
        return null;
      }

      setPermissionGranted(true);
      setLocation(result.coords);

      // Cache for offline use
      await storage.set(STORAGE_KEYS.LAST_LOCATION, result.coords);

      return result.coords;
    } catch (err: any) {
      const message =
        err?.message || 'Failed to get location. Please try again.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    location,
    loading,
    error,
    permissionGranted,
    requestLocation,
  };
}
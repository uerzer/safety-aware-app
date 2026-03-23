/**
 * useOffenderSearch Hook
 * 
 * Manages offender search state, integrates with the API service,
 * and handles geocoding for address-based searches.
 */

import { useState, useCallback } from 'react';
import { searchOffenders, geocodeAddress } from '../services/api';
import type { Offender, SearchParams } from '../types/types';
import { DEFAULT_RADIUS } from '../utils/constants';

interface UseOffenderSearchReturn {
  results: Offender[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  sources: string[];
  search: (query: string) => Promise<void>;
  searchByCoords: (
    lat: number,
    lng: number,
    radius?: number
  ) => Promise<void>;
  clearResults: () => void;
}

export function useOffenderSearch(): UseOffenderSearchReturn {
  const [results, setResults] = useState<Offender[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [sources, setSources] = useState<string[]>([]);

  /**
   * Search by address, city, or zip code string.
   * Auto-detects zip codes vs. addresses and geocodes as needed.
   */
  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const isZip = /^\d{5}(-\d{4})?$/.test(query.trim());

      let params: SearchParams;

      if (isZip) {
        params = { zipCode: query.trim() };
      } else {
        // Try to geocode the address for coordinate-based search
        const coords = await geocodeAddress(query);
        if (coords) {
          params = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            radius: DEFAULT_RADIUS,
            address: query,
          };
        } else {
          params = { address: query };
        }
      }

      const result = await searchOffenders(params);
      setResults(result.offenders);
      setTotalCount(result.totalCount);
      setSources(result.sources);
    } catch (err: any) {
      const message =
        err?.message || 'Search failed. Please check your connection.';
      setError(message);
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search by GPS coordinates and radius.
   */
  const searchByCoords = useCallback(
    async (lat: number, lng: number, radius: number = DEFAULT_RADIUS) => {
      setLoading(true);
      setError(null);

      try {
        const params: SearchParams = {
          latitude: lat,
          longitude: lng,
          radius,
        };

        const result = await searchOffenders(params);
        setResults(result.offenders);
        setTotalCount(result.totalCount);
        setSources(result.sources);
      } catch (err: any) {
        const message =
          err?.message || 'Search failed. Please check your connection.';
        setError(message);
        setResults([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setTotalCount(0);
    setError(null);
    setSources([]);
  }, []);

  return {
    results,
    loading,
    error,
    totalCount,
    sources,
    search,
    searchByCoords,
    clearResults,
  };
}
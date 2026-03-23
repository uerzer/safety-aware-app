/**
 * SafeNeighbor API Service
 * 
 * Integrates with multiple sex offender registry data sources:
 * - Offenders.io (primary, 900K+ records)
 * - Iowa Sex Offender Registry (free state-level)
 * - NSOPW.gov (federal search portal fallback)
 * - FamilyWatchdog / CrimeoMeter (secondary)
 * 
 * In production, replace placeholder endpoints with real API keys
 * and implement proper rate limiting.
 */

import type {
  Offender,
  SearchParams,
  SearchResult,
  ApiConfig,
  RiskLevel,
} from '../types/types';
import { storage } from '../utils/storage';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_CONFIG: ApiConfig = {
  offendersIo: {
    baseUrl: 'https://api.offenders.io/v1',
    apiKey: process.env.EXPO_PUBLIC_OFFENDERS_IO_KEY || '',
  },
  iowa: {
    baseUrl: 'https://api.iowa.gov/sor/v1',
  },
  nsopw: {
    baseUrl: 'https://www.nsopw.gov/api',
  },
  crimeoMeter: {
    baseUrl: 'https://api.crimeometer.com/v1',
    apiKey: process.env.EXPO_PUBLIC_CRIMEOMETER_KEY || '',
  },
};

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ---------------------------------------------------------------------------
// Primary: Offenders.io
// ---------------------------------------------------------------------------

async function searchOffendersIo(
  params: SearchParams
): Promise<Offender[]> {
  const { latitude, longitude, radius = 1, address, zipCode } = params;

  const queryParams = new URLSearchParams();
  if (latitude && longitude) {
    queryParams.set('lat', String(latitude));
    queryParams.set('lng', String(longitude));
    queryParams.set('radius', String(radius));
  } else if (zipCode) {
    queryParams.set('zip', zipCode);
  } else if (address) {
    queryParams.set('address', address);
  }
  queryParams.set('limit', '100');

  try {
    const res = await fetch(
      `${API_CONFIG.offendersIo.baseUrl}/offenders?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${API_CONFIG.offendersIo.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) throw new Error(`Offenders.io: ${res.status}`);

    const data = await res.json();
    return normalizeOffendersIoResponse(data.results || []);
  } catch (err) {
    console.warn('[API] Offenders.io failed, falling back:', err);
    return [];
  }
}

function normalizeOffendersIoResponse(raw: any[]): Offender[] {
  return raw.map((r) => ({
    id: r.id || r.offender_id || String(Math.random()),
    name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
    aliases: r.aliases || [],
    dob: r.date_of_birth || '',
    sex: r.sex || '',
    race: r.race || '',
    height: r.height || '',
    weight: r.weight || '',
    eyeColor: r.eye_color || '',
    hairColor: r.hair_color || '',
    photoUrl: r.photo_url || r.image || '',
    address: r.address || '',
    city: r.city || '',
    state: r.state || '',
    zipCode: r.zip_code || '',
    latitude: parseFloat(r.latitude) || 0,
    longitude: parseFloat(r.longitude) || 0,
    offenseDescription: r.offense || r.offense_description || 'Unknown offense',
    convictionDate: r.conviction_date || '',
    registrationDate: r.registration_date || '',
    riskLevel: mapRiskLevel(r.risk_level || r.tier),
    complianceStatus: r.compliance === 'non-compliant' ? 'non-compliant' : 'compliant',
    source: 'offenders_io',
    distance: r.distance ? parseFloat(r.distance) : undefined,
  }));
}

// ---------------------------------------------------------------------------
// Secondary: Iowa SOR (free state-level)
// ---------------------------------------------------------------------------

async function searchIowaSOR(
  params: SearchParams
): Promise<Offender[]> {
  const { zipCode, address } = params;
  if (!zipCode && !address) return [];

  const queryParams = new URLSearchParams();
  if (zipCode) queryParams.set('zip', zipCode);
  if (address) queryParams.set('address', address);

  try {
    const res = await fetch(
      `${API_CONFIG.iowa.baseUrl}/search?${queryParams}`
    );
    if (!res.ok) throw new Error(`Iowa SOR: ${res.status}`);

    const data = await res.json();
    return (data.offenders || []).map((r: any) => ({
      id: `iowa_${r.id}`,
      name: r.name || `${r.first_name} ${r.last_name}`,
      aliases: r.aliases || [],
      dob: r.dob || '',
      sex: r.gender || '',
      race: r.race || '',
      height: r.height || '',
      weight: r.weight || '',
      eyeColor: r.eye_color || '',
      hairColor: r.hair_color || '',
      photoUrl: r.photo || '',
      address: r.address || '',
      city: r.city || '',
      state: 'Iowa',
      zipCode: r.zip || '',
      latitude: parseFloat(r.lat) || 0,
      longitude: parseFloat(r.lng) || 0,
      offenseDescription: r.offense || 'See registry for details',
      convictionDate: r.conviction_date || '',
      registrationDate: r.registration_date || '',
      riskLevel: mapRiskLevel(r.tier),
      complianceStatus: 'compliant' as const,
      source: 'iowa_sor',
      distance: undefined,
    }));
  } catch (err) {
    console.warn('[API] Iowa SOR failed:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Tertiary: CrimeoMeter (location-based crime data enrichment)
// ---------------------------------------------------------------------------

async function searchCrimeoMeter(
  lat: number,
  lng: number,
  radiusMiles: number
): Promise<Offender[]> {
  if (!API_CONFIG.crimeoMeter.apiKey) return [];

  try {
    const res = await fetch(
      `${API_CONFIG.crimeoMeter.baseUrl}/incidents/raw-data?` +
        `lat=${lat}&lon=${lng}&distance=${radiusMiles}mi&datetime_ini=2020-01-01&datetime_end=2025-12-31`,
      {
        headers: {
          'x-api-key': API_CONFIG.crimeoMeter.apiKey!,
        },
      }
    );
    if (!res.ok) return [];

    const data = await res.json();
    // Filter for sex-offense-related incidents only
    const sexOffenses = (data.incidents || []).filter((i: any) =>
      /sex|rape|assault|indec|lewd|child/i.test(i.incident_offense || '')
    );

    return sexOffenses.map((i: any) => ({
      id: `cm_${i.incident_code}`,
      name: 'Name Unavailable',
      aliases: [],
      dob: '',
      sex: '',
      race: '',
      height: '',
      weight: '',
      eyeColor: '',
      hairColor: '',
      photoUrl: '',
      address: i.incident_address || '',
      city: i.city_key || '',
      state: i.state || '',
      zipCode: '',
      latitude: parseFloat(i.incident_latitude) || 0,
      longitude: parseFloat(i.incident_longitude) || 0,
      offenseDescription: i.incident_offense || 'Sex offense (details on file)',
      convictionDate: i.incident_date || '',
      registrationDate: '',
      riskLevel: 'moderate' as RiskLevel,
      complianceStatus: 'compliant' as const,
      source: 'crimeometer',
      distance: undefined,
    }));
  } catch (err) {
    console.warn('[API] CrimeoMeter failed:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Aggregated search (fan-out to all sources)
// ---------------------------------------------------------------------------

export async function searchOffenders(
  params: SearchParams
): Promise<SearchResult> {
  const cacheKey = `search_${JSON.stringify(params)}`;

  // Check cache
  const cached = await storage.get<{ data: SearchResult; ts: number }>(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  // Fan-out to all available sources
  const [primary, iowa, crime] = await Promise.allSettled([
    searchOffendersIo(params),
    searchIowaSOR(params),
    params.latitude && params.longitude
      ? searchCrimeoMeter(
          params.latitude,
          params.longitude,
          params.radius || 1
        )
      : Promise.resolve([]),
  ]);

  const results: Offender[] = [];
  const sources: string[] = [];

  if (primary.status === 'fulfilled' && primary.value.length) {
    results.push(...primary.value);
    sources.push('offenders_io');
  }
  if (iowa.status === 'fulfilled' && iowa.value.length) {
    results.push(...iowa.value);
    sources.push('iowa_sor');
  }
  if (crime.status === 'fulfilled' && crime.value.length) {
    results.push(...crime.value);
    sources.push('crimeometer');
  }

  // Deduplicate by name + address
  const dedupKey = (o: Offender) =>
    `${o.name.toLowerCase()}_${o.address.toLowerCase()}`;
  const seen = new Set<string>();
  const deduped = results.filter((o) => {
    const key = dedupKey(o);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: high risk first, then by distance
  const riskOrder: Record<RiskLevel, number> = { high: 0, moderate: 1, low: 2 };
  deduped.sort((a, b) => {
    const rDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    if (rDiff !== 0) return rDiff;
    return (a.distance ?? Infinity) - (b.distance ?? Infinity);
  });

  const result: SearchResult = {
    offenders: deduped,
    totalCount: deduped.length,
    sources,
    searchedAt: new Date().toISOString(),
  };

  // Cache
  await storage.set(cacheKey, { data: result, ts: Date.now() });

  return result;
}

// ---------------------------------------------------------------------------
// Geocoding (address -> coordinates)
// ---------------------------------------------------------------------------

export async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Use free Nominatim geocoder (OpenStreetMap)
    const encoded = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'SafeNeighbor/1.0',
        },
      }
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapRiskLevel(raw: string | number | undefined): RiskLevel {
  if (!raw) return 'moderate';
  const s = String(raw).toLowerCase();
  if (s === '3' || s === 'high' || s === 'tier 3' || s === 'level 3') return 'high';
  if (s === '1' || s === 'low' || s === 'tier 1' || s === 'level 1') return 'low';
  return 'moderate';
}
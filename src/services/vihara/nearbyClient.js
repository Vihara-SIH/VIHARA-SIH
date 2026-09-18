import { cacheGet, cacheSet, cacheKey } from './cache.js';
import {
  inferCategoryAndSubcategories,
  resolveRequiredPillars,
  ALL_PILLARS
} from './placeClassifier.js';

function normalizeNearbyPlace(raw, dest, source) {
  const lat = Number(raw.lat ?? raw.latitude ?? raw.geometry?.location?.lat);
  const lng = Number(raw.lng ?? raw.longitude ?? raw.geometry?.location?.lng);
  const name = raw.name || raw.displayName?.text || raw.mainText || 'Attraction';

  const { category, subcategories } = inferCategoryAndSubcategories(raw, dest);

  return {
    id: raw.place_id || raw.placeId || raw.id || `nearby_${(name || '').toLowerCase().replace(/\s+/g, '-')}`,
    placeId: raw.placeId || raw.place_id || raw.id,
    name,
    title: name,
    category,
    subcategories,
    description: raw.description || raw.vicinity || raw.formattedAddress || `Notable place in ${dest?.name || dest?.city || 'this destination'}.`,
    formattedAddress: raw.formattedAddress || raw.vicinity || '',
    vicinity: raw.vicinity || raw.formattedAddress || '',
    image: raw.image || 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
    coordinates: {
      lat: Number.isFinite(lat) ? lat : dest?.coordinates?.lat,
      lng: Number.isFinite(lng) ? lng : dest?.coordinates?.lng
    },
    city: dest?.name || dest?.city || '',
    state: dest?.state || '',
    country: dest?.country || 'India',
    visitingHours: raw.visitingHours || { open: '09:00 AM', close: '06:00 PM' },
    regularOpeningHours: raw.regularOpeningHours || null,
    openingHours: raw.openingHours || null,
    entryInfo: raw.entryInfo || 'Check locally',
    estimatedVisitDuration: raw.estimatedVisitDuration || '1.5 hours',
    travelTips: raw.travelTips || 'Confirm timings on the day of visit.',
    rating: raw.rating ?? null,
    userRatingsTotal: raw.user_ratings_total || raw.userRatingCount || raw.userRatingsTotal || 0,
    priceLevel: raw.priceLevel || null,
    googleMapsUri: raw.googleMapsUri || null,
    types: Array.isArray(raw.types) ? raw.types : [],
    source: raw.source || source || 'google-places-new'
  };
}

export const CATEGORY_QUERY = {
  heritage: { type: 'tourist_attraction', keyword: 'heritage' },
  nature: { type: 'natural_feature', keyword: 'nature' },
  spiritual: { type: 'place_of_worship', keyword: 'temple' },
  adventure: { type: 'tourist_attraction', keyword: 'adventure' },
  forts: { type: 'tourist_attraction', keyword: 'fort' },
  temples: { type: 'hindu_temple', keyword: 'temple' },
  beaches: { type: 'natural_feature', keyword: 'beach' },
  waterfalls: { type: 'natural_feature', keyword: 'waterfall' },
  lakes: { type: 'natural_feature', keyword: 'lake' },
  palaces: { type: 'tourist_attraction', keyword: 'palace' }
};

function getBaseUrl() {
  return typeof window !== 'undefined' ? '' : (process.env.TEST_BASE_URL || 'http://localhost:5173');
}

export async function fetchNearbyPlaces({ latitude, longitude, destination, category = 'heritage', radius = 25000 } = {}) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { places: [], source: 'none', error: 'invalid-coords' };
  }

  const key = cacheKey(['nearby', lat.toFixed(3), lng.toFixed(3), category || '', destination || '', String(radius)]);
  const cached = cacheGet(key);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      radius: String(radius)
    });
    if (destination) params.set('destination', destination);
    if (category) params.set('category', category);

    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/places-nearby?${params.toString()}`);
    const data = await res.json();
    const destStub = { name: destination, coordinates: { lat, lng }, city: destination };
    const places = (data.places || []).map((p) => normalizeNearbyPlace(p, destStub, data.provider || 'live'));
    const payload = {
      places,
      source: data.provider || 'live',
      estimated: !!data.estimated,
      fallback: !!data.fallback
    };
    cacheSet(key, payload, 15 * 60 * 1000);
    return payload;
  } catch (err) {
    console.warn('[VIHARA nearby] request failed:', err.message);
    return { places: [], source: 'none', error: err.message, fallback: true };
  }
}

/**
 * Fetches live Google Places in parallel for ONLY the required pillars
 * (e.g. ['nature', 'heritage'] or ['nature'] or all 4 if broad).
 * Deduplicates and returns consolidated place list.
 */
export async function fetchNearbyPlacesForPillars({ latitude, longitude, destination, pillars = ['heritage'], radius = 25000 } = {}) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { places: [], source: 'none', error: 'invalid-coords' };
  }

  const targetPillars = Array.isArray(pillars) && pillars.length > 0
    ? [...new Set(pillars)]
    : [...ALL_PILLARS];

  try {
    const results = await Promise.allSettled(
      targetPillars.map((pillar) =>
        fetchNearbyPlaces({
          latitude: lat,
          longitude: lng,
          destination,
          category: pillar,
          radius
        })
      )
    );

    const aggregated = [];
    const seenIds = new Set();
    const seenNames = new Set();
    let hasLiveSource = false;

    const normalizeToken = (str) =>
      String(str || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .trim();

    for (const res of results) {
      if (res.status === 'fulfilled' && res.value && Array.isArray(res.value.places)) {
        if (!res.value.fallback) hasLiveSource = true;
        for (const place of res.value.places) {
          const pid = String(place.id || place.placeId || '').toLowerCase().trim();
          const cleanName = normalizeToken(place.name || place.title || '');

          if (pid && seenIds.has(pid)) continue;
          if (cleanName && seenNames.has(cleanName)) continue;

          if (pid) seenIds.add(pid);
          if (cleanName) seenNames.add(cleanName);

          aggregated.push(place);
        }
      }
    }

    return {
      places: aggregated,
      source: hasLiveSource ? 'google-places-new' : 'catalog-fallback',
      fallback: !hasLiveSource
    };
  } catch (err) {
    console.warn('[VIHARA nearby] fetchNearbyPlacesForPillars failed:', err.message);
    return { places: [], source: 'none', error: err.message, fallback: true };
  }
}

/**
 * Merges Catalog / Firestore items with Live Google Places.
 * LIVE GOOGLE PLACES TAKE PRECEDENCE over catalog places.
 * Deduplicates by place ID first and normalized name second.
 */
export function mergeCatalogAndLive(catalogPlaces = [], livePlaces = [], dest) {
  const merged = [];
  const seenIds = new Set();
  const seenNames = new Set();

  const normalizeToken = (str) =>
    String(str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();

  const push = (place, preferredSource) => {
    if (!place) return;
    const pid = String(place.id || place.placeId || place.place_id || '').toLowerCase().trim();
    const cleanName = normalizeToken(place.name || place.title || '');

    if (pid && seenIds.has(pid)) return;
    if (cleanName && seenNames.has(cleanName)) return;

    if (pid) seenIds.add(pid);
    if (cleanName) seenNames.add(cleanName);

    merged.push({
      ...place,
      coordinates: place.coordinates || dest?.coordinates,
      source: place.source || preferredSource
    });
  };

  // 1. Live Google Places take primary precedence
  (livePlaces || []).forEach((p) => push(p, p.source || 'google-places-new'));
  // 2. Catalog / Firestore places fill in remaining slots or unique attractions
  (catalogPlaces || []).forEach((p) => push(p, 'catalog'));

  return merged;
}

export { resolveRequiredPillars };

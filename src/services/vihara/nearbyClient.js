import { cacheGet, cacheSet, cacheKey } from './cache.js';

function normalizeNearbyPlace(raw, dest, source) {
  const lat = Number(raw.lat ?? raw.latitude ?? raw.geometry?.location?.lat);
  const lng = Number(raw.lng ?? raw.longitude ?? raw.geometry?.location?.lng);
  const name = raw.name || raw.mainText || 'Heritage site';
  return {
    id: raw.place_id || raw.placeId || raw.id || `nearby_${(name || '').toLowerCase().replace(/\s+/g, '-')}`,
    name,
    category: raw.category || inferCategory(raw.types || raw.subcategories, dest),
    subcategories: raw.subcategories || inferSubs(raw.types),
    description: raw.description || raw.vicinity || `Notable place in ${dest.name || dest.city || 'this destination'}.`,
    image: raw.image || 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
    coordinates: { lat: Number.isFinite(lat) ? lat : dest.coordinates?.lat, lng: Number.isFinite(lng) ? lng : dest.coordinates?.lng },
    city: dest.name || dest.city,
    state: dest.state || '',
    country: 'India',
    visitingHours: raw.visitingHours || { open: '09:00 AM', close: '06:00 PM' },
    entryInfo: raw.entryInfo || 'Check locally',
    estimatedVisitDuration: raw.estimatedVisitDuration || '1.5 hours',
    travelTips: raw.travelTips || 'Confirm timings on the day of visit.',
    rating: raw.rating,
    userRatingsTotal: raw.user_ratings_total || raw.userRatingsTotal,
    source
  };
}

function inferCategory(types = [], dest) {
  const t = (types || []).join(' ').toLowerCase();
  if (/temple|church|mosque|hindu|place_of_worship/.test(t)) return 'Spiritual';
  if (/park|natural|zoo|camp/.test(t)) return 'Nature';
  if (/museum|fort|monument|tourist/.test(t)) return 'Heritage';
  return dest?.places?.[0]?.category || 'Heritage';
}

function inferSubs(types = []) {
  const t = (types || []).join(' ').toLowerCase();
  const subs = [];
  if (/temple|hindu/.test(t)) subs.push('temples');
  if (/church|mosque|place_of_worship/.test(t)) subs.push('pilgrimage-sites');
  if (/museum|monument/.test(t)) subs.push('historical-monuments');
  if (/park/.test(t)) subs.push('national-parks');
  if (/tourist/.test(t)) subs.push('heritage-walks');
  return subs.length ? subs : ['heritage-walks', 'historical-monuments'];
}

const CATEGORY_QUERY = {
  spiritual: { type: 'place_of_worship', keyword: 'temple heritage' },
  adventure: { type: 'tourist_attraction', keyword: 'trek adventure park' },
  heritage: { type: 'tourist_attraction', keyword: 'fort palace monument heritage' },
  nature: { type: 'park', keyword: 'lake garden waterfall beach' },
  forts: { type: 'tourist_attraction', keyword: 'fort' },
  temples: { type: 'hindu_temple', keyword: 'temple' },
  beaches: { type: 'tourist_attraction', keyword: 'beach' }
};

export async function fetchNearbyPlaces({ latitude, longitude, destination, category, radius = 12000 } = {}) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { places: [], source: 'none', error: 'invalid-coords' };

  const key = cacheKey(['nearby', lat.toFixed(3), lng.toFixed(3), category || '', destination || '']);
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

    const res = await fetch(`/api/places-nearby?${params.toString()}`);
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

export function mergeCatalogAndLive(catalogPlaces = [], livePlaces = [], dest) {
  const merged = [];
  const seen = new Set();

  const push = (place, source) => {
    const id = (place.id || place.placeId || place.name || '').toLowerCase();
    const name = (place.name || '').toLowerCase().trim();
    const token = id || name;
    if (!token || seen.has(token)) return;
    seen.add(token);
    merged.push({
      ...place,
      coordinates: place.coordinates || dest?.coordinates,
      source: place.source || source
    });
  };

  catalogPlaces.forEach((p) => push(p, 'catalog'));
  livePlaces.forEach((p) => push(p, p.source || 'google'));
  return merged;
}

export { CATEGORY_QUERY };

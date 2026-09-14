import { cacheGet, cacheSet, cacheKey } from './cache.js';
import { estimateTravelMinutes } from './geo.js';

export async function fetchRouteLegs(waypoints = []) {
  const usable = (waypoints || []).filter((w) => w?.coordinates?.lat && w?.coordinates?.lng);
  if (usable.length < 2) {
    return { legs: [], source: 'none', estimated: true };
  }

  const key = cacheKey([
    'route',
    ...usable.map((w) => `${Number(w.coordinates.lat).toFixed(3)},${Number(w.coordinates.lng).toFixed(3)}`)
  ]);
  const cached = cacheGet(key);
  if (cached) return cached;

  try {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        waypoints: usable.map((w) => ({
          name: w.name,
          latitude: w.coordinates.lat,
          longitude: w.coordinates.lng
        }))
      })
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.legs)) {
      const payload = {
        legs: data.legs,
        source: data.provider || 'live',
        estimated: !!data.estimated
      };
      cacheSet(key, payload, 20 * 60 * 1000);
      return payload;
    }
  } catch (err) {
    console.warn('[VIHARA routes] failed, using distance estimate:', err.message);
  }

  const legs = [];
  for (let i = 0; i < usable.length - 1; i++) {
    const from = usable[i];
    const to = usable[i + 1];
    const est = estimateTravelMinutes(from.coordinates, to.coordinates);
    legs.push({
      legIndex: i + 1,
      from: from.name,
      to: to.name,
      distanceKm: est.km,
      durationMinutes: est.minutes,
      distance: est.km != null ? `${est.km} km` : 'Distance estimate unavailable',
      duration: `${est.minutes} mins`,
      mode: (est.km || 0) > 80 ? 'Intercity transfer' : 'Local transit',
      estimated: true,
      source: 'haversine',
      tip: 'Approximate travel time from map distance, not a live traffic route.'
    });
  }
  const payload = { legs, source: 'haversine', estimated: true };
  cacheSet(key, payload, 10 * 60 * 1000);
  return payload;
}

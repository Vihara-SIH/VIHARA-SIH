import { cacheGet, cacheSet, cacheKey } from './cache.js';

export function fallbackWeather(city = '') {
  return {
    temp: '—',
    condition: 'Forecast unavailable',
    humidity: '—',
    uvIndex: '—',
    sunset: '—',
    source: 'unavailable',
    estimated: false,
    live: false
  };
}

function getBaseUrl() {
  return typeof window !== 'undefined' ? '' : (process.env.TEST_BASE_URL || 'http://localhost:5173');
}

export async function fetchWeather({ latitude, longitude, date, city } = {}) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  const day = date ? String(date).slice(0, 10) : '';
  const key = cacheKey(['wx', lat.toFixed(2), lng.toFixed(2), day]);
  const cached = cacheGet(key);
  if (cached) return cached;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return fallbackWeather(city);
  }

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng)
    });
    if (day) params.set('date', day);
    if (city) params.set('city', city);

    const res = await fetch(`${getBaseUrl()}/api/weather?${params.toString()}`);
    const data = await res.json();
    if (!res.ok || !data.success || !data.weather) {
      return fallbackWeather(city);
    }
    const weather = { ...data.weather, live: data.weather.source !== 'unavailable' };
    cacheSet(key, weather, 30 * 60 * 1000);
    return weather;
  } catch (err) {
    console.warn('[VIHARA weather] failed:', err.message);
    return fallbackWeather(city);
  }
}

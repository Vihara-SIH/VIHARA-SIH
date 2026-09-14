import { applyCors, rateLimit } from './_lib/http.js';

const WMO = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Icy fog',
  51: 'Light drizzle',
  61: 'Rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Snow',
  80: 'Showers',
  95: 'Thunderstorm'
};

export default async function handler(req, res) {
  applyCors(res, req);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const limited = rateLimit(req, { max: 40 });
  if (!limited.ok) {
    return res.status(429).json({ success: false, error: 'Weather rate limit exceeded.' });
  }

  const src = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const lat = parseFloat(src.latitude ?? src.lat);
  const lng = parseFloat(src.longitude ?? src.lng);
  const date = String(src.date || '').slice(0, 10);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ success: false, error: 'latitude and longitude are required.' });
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    daily: 'weathercode,temperature_2m_max,temperature_2m_min,sunset,relative_humidity_2m_max,uv_index_max',
    timezone: 'auto'
  });
  if (date) {
    params.set('start_date', date);
    params.set('end_date', date);
  }

  try {
    const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!wxRes.ok) {
      return res.status(200).json({
        success: false,
        weather: {
          temp: '—',
          condition: 'Forecast unavailable',
          humidity: '—',
          uvIndex: '—',
          sunset: '—',
          source: 'unavailable',
          live: false
        }
      });
    }
    const data = await wxRes.json();
    const daily = data.daily || {};
    const idx = 0;
    const code = daily.weathercode?.[idx];
    const tmax = daily.temperature_2m_max?.[idx];
    const tmin = daily.temperature_2m_min?.[idx];
    const sunset = daily.sunset?.[idx];
    const humidity = daily.relative_humidity_2m_max?.[idx];
    const uv = daily.uv_index_max?.[idx];

    return res.status(200).json({
      success: true,
      provider: 'open-meteo',
      weather: {
        temp: Number.isFinite(tmax) ? `${Math.round(tmax)}°C` : '—',
        condition: WMO[code] || 'Forecast',
        humidity: Number.isFinite(humidity) ? `${Math.round(humidity)}%` : '—',
        uvIndex: Number.isFinite(uv) ? String(Math.round(uv)) : '—',
        sunset: sunset ? sunset.slice(11, 16) : '—',
        tmin: Number.isFinite(tmin) ? `${Math.round(tmin)}°C` : undefined,
        date: date || daily.time?.[idx],
        source: 'open-meteo',
        live: true
      }
    });
  } catch (err) {
    console.error('[weather]', err.message);
    return res.status(200).json({
      success: false,
      weather: {
        temp: '—',
        condition: 'Forecast unavailable',
        humidity: '—',
        uvIndex: '—',
        sunset: '—',
        source: 'unavailable',
        live: false
      }
    });
  }
}

const hits = new Map();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173'
];

export function applyCors(res, req) {
  const origin = req?.headers?.origin || '';
  const prodOrigin = (process.env.ALLOWED_ORIGIN || '').trim();
  if (prodOrigin) ALLOWED_ORIGINS.push(prodOrigin);

  // Allow known origins, or fall back to permissive if no production origin is configured
  const allowed = ALLOWED_ORIGINS.includes(origin) || !prodOrigin;
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', allowed ? (origin || '*') : ALLOWED_ORIGINS[0]);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export function rateLimit(req, { windowMs = 60_000, max = 20 } = {}) {
  const ip = clientIp(req);
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > windowMs) {
    hits.set(ip, { start: now, count: 1 });
    return { ok: true, remaining: max - 1 };
  }
  rec.count += 1;
  if (rec.count > max) return { ok: false, remaining: 0 };
  return { ok: true, remaining: max - rec.count };
}

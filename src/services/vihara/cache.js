const memory = new Map();

export function cacheGet(key) {
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.expiresAt && Date.now() > hit.expiresAt) {
    memory.delete(key);
    return null;
  }
  return hit.value;
}

export function cacheSet(key, value, ttlMs = 10 * 60 * 1000) {
  memory.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function cacheKey(parts) {
  return parts.map((p) => (p === undefined || p === null ? '' : String(p))).join('|');
}

export const ALLOWED_AI_ACTIONS = [
  'REMOVE_ACTIVITY',
  'ADD_ACTIVITY',
  'MOVE_ACTIVITY',
  'REPLACE_ACTIVITY',
  'SET_CATEGORIES',
  'SET_BUDGET',
  'SET_PACE',
  'REGENERATE_ITINERARY'
];

const KNOWN_CATS = new Set([
  'spiritual', 'adventure', 'heritage', 'nature',
  'temples', 'ashrams', 'pilgrimage-sites', 'spiritual-towns', 'yoga-meditation',
  'trekking', 'camping', 'river-rafting', 'paragliding', 'wildlife-safari',
  'forts', 'palaces', 'historical-monuments', 'unesco-sites', 'heritage-walks',
  'hills-valleys', 'waterfalls', 'beaches', 'national-parks', 'lakes'
]);

export function sanitizeActions(actions, tripContext = {}) {
  if (!Array.isArray(actions)) return [];
  const allowedIds = new Set(tripContext.allowedPlaceIds || []);
  const out = [];

  for (const raw of actions.slice(0, 10)) {
    if (!raw || typeof raw !== 'object') continue;
    const type = String(raw.type || '').toUpperCase();
    if (!ALLOWED_AI_ACTIONS.includes(type)) continue;

    if (type === 'SET_CATEGORIES') {
      const categories = (raw.categories || []).filter((c) => KNOWN_CATS.has(String(c)));
      if (categories.length) out.push({ type, categories });
      continue;
    }
    if (type === 'SET_BUDGET') {
      const amount = Number(raw.amount);
      if (Number.isFinite(amount) && amount >= 1000 && amount <= 5000000) {
        out.push({ type, amount: Math.round(amount) });
      }
      continue;
    }
    if (type === 'SET_PACE') {
      out.push({
        type,
        day: raw.day ? Number(raw.day) : undefined,
        maxActivities: Math.max(1, Math.min(4, Number(raw.maxActivities) || 2))
      });
      continue;
    }
    if (type === 'REGENERATE_ITINERARY') {
      out.push({ type, reason: String(raw.reason || '').slice(0, 200) });
      continue;
    }
    if (type === 'REMOVE_ACTIVITY' || type === 'MOVE_ACTIVITY' || type === 'REPLACE_ACTIVITY' || type === 'ADD_ACTIVITY') {
      let targetId = raw.targetPlaceId || raw.placeId || null;
      const targetPos = raw.position != null
        ? Number(raw.position)
        : (raw.targetPosition != null
            ? Number(raw.targetPosition)
            : (raw.activityIndex != null ? Number(raw.activityIndex) + 1 : undefined));

      if (targetId && allowedIds.size && type !== 'ADD_ACTIVITY' && type !== 'REPLACE_ACTIVITY' && !allowedIds.has(targetId)) {
        if (!raw.title && !raw.targetTitle && targetPos == null) {
          continue;
        }
        // Retain for fuzzy title matching if ID is not canonical
        targetId = null;
      }
      const repl = raw.replacement || raw.replacementPlace || raw.newPlace || raw.place;
      out.push({
        type,
        day: raw.day != null ? Number(raw.day) : undefined,
        fromDay: raw.fromDay != null ? Number(raw.fromDay) : undefined,
        toDay: raw.toDay != null ? Number(raw.toDay) : undefined,
        position: targetPos,
        targetPosition: targetPos,
        placeId: targetId || null,
        targetPlaceId: targetId || null,
        title: raw.title ? String(raw.title).slice(0, 120) : undefined,
        targetTitle: (raw.targetTitle || raw.title) ? String(raw.targetTitle || raw.title).slice(0, 120) : undefined,
        replacementPlace: repl && typeof repl === 'object'
          ? {
              id: repl.id || repl.placeId || `repl_${Date.now()}`,
              name: repl.name || repl.title || 'Attraction',
              description: repl.description,
              category: repl.category,
              image: repl.image,
              coordinates: repl.coordinates,
              entryInfo: repl.entryInfo || repl.price,
              visitingHours: repl.visitingHours
            }
          : null,
        place: repl && typeof repl === 'object'
          ? {
              id: repl.id || repl.placeId || (type === 'ADD_ACTIVITY' ? raw.placeId : `repl_${Date.now()}`),
              name: repl.name || repl.title || raw.title || 'Attraction',
              description: repl.description,
              category: repl.category,
              image: repl.image,
              coordinates: repl.coordinates,
              entryInfo: repl.entryInfo || repl.price,
              visitingHours: repl.visitingHours
            }
          : (type === 'ADD_ACTIVITY' && raw.title ? { name: raw.title } : null)
      });
    }
  }
  return out;
}

export function extractJsonObject(text) {
  if (!text) return null;
  let trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const candidate = trimmed.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        try {
          const sanitized = candidate.replace(/[\u0000-\u001F]+/g, (m) => (m === '\n' ? '\\n' : m === '\r' ? '\\r' : m === '\t' ? '\\t' : ''));
          return JSON.parse(sanitized);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}

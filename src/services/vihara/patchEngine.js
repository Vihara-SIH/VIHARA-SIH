import { ALLOWED_AI_ACTIONS, expandSelectedCategories } from './schemas.js';
import { CATEGORY_DEFINITIONS } from '../destinationService.js';

const VALID_CATS = new Set([
  ...Object.keys(CATEGORY_DEFINITIONS),
  ...Object.values(CATEGORY_DEFINITIONS).flatMap((c) => c.subcategories.map((s) => s.id))
]);

export function validateActions(actions, tripCompact = {}) {
  if (!Array.isArray(actions)) return { ok: false, actions: [], errors: ['actions must be an array'] };

  const allowedIds = new Set(tripCompact.allowedPlaceIds || []);
  const errors = [];
  const clean = [];

  for (const raw of actions.slice(0, 12)) {
    if (!raw || typeof raw !== 'object') {
      errors.push('Invalid action object');
      continue;
    }
    const type = String(raw.type || '').toUpperCase();
    if (!ALLOWED_AI_ACTIONS.includes(type)) {
      errors.push(`Unsupported action: ${type}`);
      continue;
    }

    if (type === 'REMOVE_ACTIVITY' || type === 'MOVE_ACTIVITY' || type === 'REPLACE_ACTIVITY') {
      if (raw.placeId && allowedIds.size && !allowedIds.has(raw.placeId) && type !== 'REPLACE_ACTIVITY') {
        errors.push(`Unknown placeId ${raw.placeId}`);
        continue;
      }
    }

    if (type === 'SET_CATEGORIES') {
      const cats = (raw.categories || []).filter((c) => VALID_CATS.has(c));
      if (!cats.length) {
        errors.push('SET_CATEGORIES had no valid category ids');
        continue;
      }
      clean.push({ type, categories: expandSelectedCategories(cats) });
      continue;
    }

    if (type === 'SET_BUDGET') {
      const amount = Number(raw.amount);
      if (!Number.isFinite(amount) || amount < 1000) {
        errors.push('SET_BUDGET amount invalid');
        continue;
      }
      clean.push({ type, amount: Math.round(amount) });
      continue;
    }

    if (type === 'SET_PACE') {
      const maxActivities = Math.max(1, Math.min(4, Number(raw.maxActivities) || 2));
      const day = Math.max(1, Number(raw.day) || 0);
      clean.push({ type, day: day || undefined, maxActivities });
      continue;
    }

    if (type === 'ADD_ACTIVITY') {
      const placeId = raw.placeId || raw.place?.id;
      const title = raw.title || raw.place?.name;
      if (!placeId && !title) {
        errors.push(`${type} needs placeId or title`);
        continue;
      }
      clean.push({
        type,
        day: Number(raw.day) || Number(raw.toDay) || 1,
        fromDay: raw.fromDay,
        placeId,
        title,
        place: raw.place || null
      });
      continue;
    }

    if (type === 'REPLACE_ACTIVITY') {
      const targetId = raw.targetPlaceId || raw.oldPlaceId || raw.placeId;
      const targetTitle = raw.targetTitle || raw.oldTitle || raw.title;
      const repl = raw.replacement || raw.replacementPlace || raw.newPlace || raw.place || null;
      const replId = repl?.id || repl?.placeId || raw.newPlaceId || raw.replacementPlaceId;
      const replTitle = repl?.name || repl?.title || raw.newTitle || raw.replacementTitle;

      if (!targetId && !targetTitle) {
        errors.push('REPLACE_ACTIVITY needs target placeId or title');
        continue;
      }
      if (!repl && !replId && !replTitle) {
        errors.push('REPLACE_ACTIVITY needs replacement place or title');
        continue;
      }

      clean.push({
        type: 'REPLACE_ACTIVITY',
        day: raw.day != null ? Number(raw.day) : undefined,
        fromDay: raw.fromDay != null ? Number(raw.fromDay) : undefined,
        placeId: targetId,
        title: targetTitle,
        targetPlaceId: targetId,
        targetTitle,
        replacementPlace: repl || { id: replId, name: replTitle },
        place: repl || { id: replId, name: replTitle }
      });
      continue;
    }

    if (type === 'MOVE_ACTIVITY') {
      clean.push({
        type,
        placeId: raw.placeId,
        fromDay: Number(raw.fromDay) || Number(raw.day),
        toDay: Number(raw.toDay) || Number(raw.day) + 1
      });
      continue;
    }

    if (type === 'REMOVE_ACTIVITY') {
      clean.push({
        type,
        day: Number(raw.day) || undefined,
        placeId: raw.placeId,
        title: raw.title
      });
      continue;
    }

    if (type === 'REGENERATE_ITINERARY') {
      clean.push({ type, reason: String(raw.reason || '').slice(0, 200) });
    }
  }

  return { ok: errors.length === 0 || clean.length > 0, actions: clean, errors };
}

export function applyActionsToItinerary(itinerary = [], actions = []) {
  let next = itinerary.map((day) => ({
    ...day,
    activities: [...(day.activities || [])]
  }));
  let needsRegenerate = false;
  const applied = [];

  const findActivity = (placeId, title, dayHint) => {
    const days = dayHint ? next.filter((d) => d.dayNumber === dayHint) : next;
    for (const day of days) {
      const idx = day.activities.findIndex((a) =>
        (placeId && a.placeId === placeId) ||
        (title && String(a.title).toLowerCase() === String(title).toLowerCase())
      );
      if (idx >= 0) return { day, idx };
    }
    return null;
  };

  for (const action of actions) {
    if (action.type === 'REGENERATE_ITINERARY' || action.type === 'SET_CATEGORIES' || action.type === 'SET_PACE' || action.type === 'SET_BUDGET') {
      needsRegenerate = action.type !== 'SET_BUDGET';
      applied.push(action);
      continue;
    }

    if (action.type === 'REMOVE_ACTIVITY') {
      const found = findActivity(action.placeId, action.title, action.day);
      if (!found) continue;
      found.day.activities.splice(found.idx, 1);
      applied.push(action);
      continue;
    }

    if (action.type === 'MOVE_ACTIVITY') {
      const found = findActivity(action.placeId, action.title, action.fromDay);
      if (!found) continue;
      const [act] = found.day.activities.splice(found.idx, 1);
      const target = next.find((d) => d.dayNumber === action.toDay) || next[next.length - 1];
      if (target) {
        target.activities.push(act);
        applied.push(action);
      }
      continue;
    }

    if (action.type === 'ADD_ACTIVITY' && (action.place || action.title)) {
      const target = next.find((d) => d.dayNumber === action.day) || next[0];
      if (!target) continue;
      const place = action.place || {};
      target.activities.push({
        time: '03:30 PM - 05:00 PM',
        slotType: 'Afternoon Heritage Walk',
        title: place.name || action.title,
        placeName: place.name || action.title,
        description: place.description || 'Added by AI Concierge.',
        image: place.image || 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
        category: place.category || 'Heritage',
        visitingHours: place.visitingHours || '09:00 AM - 05:00 PM',
        entryInfo: place.entryInfo || place.price || 'Standard Entry',
        travelTip: place.travelTip || place.tip || 'Added from concierge request. Confirm opening hours locally.',
        placeId: action.placeId || place.id || `custom_${Date.now()}`,
        coordinates: place.coordinates || null,
        source: 'concierge'
      });
      applied.push(action);
      continue;
    }

    if (action.type === 'REPLACE_ACTIVITY') {
      const targetId = action.targetPlaceId || action.placeId;
      const targetTitle = action.targetTitle || action.title;
      const found = findActivity(targetId, targetTitle, action.day || action.fromDay);
      if (!found) continue;

      const oldAct = found.day.activities[found.idx];
      const repl = action.replacementPlace || action.place || {};
      const newPlaceId = repl.id || repl.placeId || action.newPlaceId || `replace_${Date.now()}`;
      const newTitle = repl.name || repl.title || action.replacementTitle || 'Curated Attraction';

      // Duplicate prevention within the target day
      const isDuplicate = found.day.activities.some((a, i) => i !== found.idx && (
        (newPlaceId && a.placeId === newPlaceId) ||
        (newTitle && String(a.title).toLowerCase() === String(newTitle).toLowerCase())
      ));
      if (isDuplicate) continue;

      // Swap in-place preserving slot, timing and order
      const newAct = {
        ...oldAct,
        placeId: newPlaceId,
        title: newTitle,
        placeName: newTitle,
        description: repl.description || `Replaced ${oldAct.title} with ${newTitle}.`,
        category: repl.category || oldAct.category || 'Heritage',
        image: repl.image || oldAct.image,
        coordinates: repl.coordinates || oldAct.coordinates,
        visitingHours: repl.visitingHours || oldAct.visitingHours || '09:00 AM - 05:00 PM',
        entryInfo: repl.entryInfo || repl.price || oldAct.entryInfo || 'Standard Entry',
        travelTip: repl.travelTip || repl.tip || oldAct.travelTip || 'Recommended cultural replacement.',
        source: 'concierge-replacement',
        time: oldAct.time,
        slotType: oldAct.slotType
      };

      found.day.activities[found.idx] = newAct;
      applied.push(action);
      continue;
    }
  }

  return { itinerary: next, needsRegenerate, applied };
}


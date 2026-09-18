import { ALLOWED_AI_ACTIONS, expandSelectedCategories, formatVisitingHours } from './schemas.js';
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
      const hasTitleOrPos = raw.title || raw.targetTitle || raw.position != null || raw.targetPosition != null;
      if (raw.placeId && allowedIds.size && !allowedIds.has(raw.placeId) && type !== 'REPLACE_ACTIVITY' && !hasTitleOrPos) {
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
      const targetPos = raw.position != null
        ? Number(raw.position)
        : (raw.targetPosition != null
            ? Number(raw.targetPosition)
            : (raw.activityIndex != null ? Number(raw.activityIndex) + 1 : undefined));
      const repl = raw.replacement || raw.replacementPlace || raw.newPlace || raw.place || null;
      const replId = repl?.id || repl?.placeId || raw.newPlaceId || raw.replacementPlaceId;
      const replTitle = repl?.name || repl?.title || raw.newTitle || raw.replacementTitle;

      if (!targetId && !targetTitle && targetPos == null) {
        errors.push('REPLACE_ACTIVITY needs target placeId, title, or position');
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
        position: targetPos,
        targetPosition: targetPos,
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
      const targetPos = raw.position != null
        ? Number(raw.position)
        : (raw.targetPosition != null ? Number(raw.targetPosition) : undefined);
      clean.push({
        type,
        placeId: raw.placeId,
        title: raw.title || raw.targetTitle,
        position: targetPos,
        targetPosition: targetPos,
        fromDay: Number(raw.fromDay) || Number(raw.day),
        toDay: Number(raw.toDay) || Number(raw.day) + 1
      });
      continue;
    }

    if (type === 'REMOVE_ACTIVITY') {
      const targetPos = raw.position != null
        ? Number(raw.position)
        : (raw.targetPosition != null
            ? Number(raw.targetPosition)
            : (raw.activityIndex != null ? Number(raw.activityIndex) + 1 : undefined));
      clean.push({
        type,
        day: raw.day != null ? Number(raw.day) : undefined,
        placeId: raw.placeId || raw.targetPlaceId,
        title: raw.title || raw.targetTitle,
        position: targetPos,
        targetPosition: targetPos
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

  const norm = (s) => (s ? String(s).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim() : '');

  const findActivity = (placeId, title, dayHint, position) => {
    const days = (dayHint != null && dayHint !== '')
      ? next.filter((d) => Number(d.dayNumber || d.day) === Number(dayHint))
      : next;

    const searchTitle = norm(title);

    // 1. Position / ordinal matching (e.g. 1st activity of Day 1)
    if (days.length > 0) {
      const targetPos = Number(position);
      if (Number.isFinite(targetPos) && targetPos >= 1) {
        for (const day of days) {
          const nonLunchActs = day.activities
            .map((act, i) => ({ act, i }))
            .filter(({ act }) => act.slotType !== 'Culinary Immersion & Local Flavors' && act.slotType !== 'Lunch Break');
          if (nonLunchActs[targetPos - 1]) return { day, idx: nonLunchActs[targetPos - 1].i };
          if (day.activities[targetPos - 1]) return { day, idx: targetPos - 1 };
        }
      }

      if (searchTitle) {
        let ordinal = 0;
        if (/\b(first|1st)\b/.test(searchTitle)) ordinal = 1;
        else if (/\b(second|2nd)\b/.test(searchTitle)) ordinal = 2;
        else if (/\b(third|3rd)\b/.test(searchTitle)) ordinal = 3;
        else if (/\b(fourth|4th)\b/.test(searchTitle)) ordinal = 4;
        else if (/\b(last)\b/.test(searchTitle)) ordinal = 999;

        if (ordinal > 0) {
          for (const day of days) {
            const nonLunchActs = day.activities
              .map((act, i) => ({ act, i }))
              .filter(({ act }) => act.slotType !== 'Culinary Immersion & Local Flavors' && act.slotType !== 'Lunch Break');
            if (ordinal === 999 && nonLunchActs.length > 0) {
              return { day, idx: nonLunchActs[nonLunchActs.length - 1].i };
            }
            if (nonLunchActs[ordinal - 1]) return { day, idx: nonLunchActs[ordinal - 1].i };
          }
        }
      }
    }

    // 2. Exact placeId
    if (placeId) {
      for (const day of days) {
        const idx = day.activities.findIndex((a) =>
          a.placeId === placeId || a.id === placeId || (a.place && (a.place.id === placeId || a.place.placeId === placeId))
        );
        if (idx >= 0) return { day, idx };
      }
    }

    // 3. Exact normalized title
    if (searchTitle) {
      for (const day of days) {
        const idx = day.activities.findIndex((a) => norm(a.title || a.placeName || a.name) === searchTitle);
        if (idx >= 0) return { day, idx };
      }
    }

    // 4. Substring inclusion
    if (searchTitle && searchTitle.length >= 3) {
      for (const day of days) {
        const idx = day.activities.findIndex((a) => {
          const actTitle = norm(a.title || a.placeName || a.name);
          return actTitle && (actTitle.includes(searchTitle) || searchTitle.includes(actTitle));
        });
        if (idx >= 0) return { day, idx };
      }
    }

    // 5. Word-level overlap
    if (searchTitle) {
      const searchWords = searchTitle.split(/\s+/).filter((w) => w.length > 2 && !['the', 'and', 'activity', 'place', 'visit', 'nearby', 'from'].includes(w));
      if (searchWords.length > 0) {
        for (const day of days) {
          const idx = day.activities.findIndex((a) => {
            const actWords = norm(a.title || a.placeName || a.name).split(/\s+/);
            return searchWords.some((sw) => actWords.includes(sw));
          });
          if (idx >= 0) return { day, idx };
        }
      }
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
      const found = findActivity(action.placeId, action.title || action.targetTitle, action.day, action.position || action.targetPosition);
      if (!found) continue;
      found.day.activities.splice(found.idx, 1);
      applied.push(action);
      continue;
    }

    if (action.type === 'MOVE_ACTIVITY') {
      const found = findActivity(action.placeId, action.title || action.targetTitle, action.fromDay || action.day, action.position || action.targetPosition);
      if (!found) continue;
      const [act] = found.day.activities.splice(found.idx, 1);
      const target = next.find((d) => Number(d.dayNumber) === Number(action.toDay)) || next[next.length - 1];
      if (target) {
        target.activities.push(act);
        applied.push(action);
      }
      continue;
    }

    if (action.type === 'ADD_ACTIVITY' && (action.place || action.title)) {
      const target = next.find((d) => Number(d.dayNumber) === Number(action.day)) || next[0];
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
        visitingHours: formatVisitingHours(place.visitingHours),
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
      const targetPos = action.targetPosition || action.position;
      const found = findActivity(targetId, targetTitle, action.day || action.fromDay, targetPos);
      if (!found) continue;

      const oldAct = found.day.activities[found.idx];
      const repl = action.replacementPlace || action.place || {};
      const newPlaceId = repl.id || repl.placeId || action.newPlaceId || `replace_${Date.now()}`;
      const newTitle = repl.name || repl.title || action.replacementTitle || 'Curated Attraction';

      // Duplicate resolution: if the replacement place is already in this day, remove the duplicate
      const dupIdx = found.day.activities.findIndex((a, i) => i !== found.idx && (
        (newPlaceId && (a.placeId === newPlaceId || a.id === newPlaceId)) ||
        (newTitle && norm(a.title || a.placeName) === norm(newTitle))
      ));
      if (dupIdx >= 0) {
        found.day.activities.splice(dupIdx, 1);
        if (dupIdx < found.idx) found.idx -= 1;
      }

      // Swap in-place preserving slot, timing and order
      const newAct = {
        ...oldAct,
        placeId: newPlaceId,
        id: newPlaceId,
        title: newTitle,
        placeName: newTitle,
        description: repl.description || `Replaced ${oldAct.title} with ${newTitle}.`,
        category: repl.category || oldAct.category || 'Heritage',
        image: repl.image || oldAct.image,
        coordinates: repl.coordinates || oldAct.coordinates,
        visitingHours: formatVisitingHours(repl.visitingHours || oldAct.visitingHours),
        entryInfo: repl.entryInfo || repl.price || oldAct.entryInfo || 'Standard Entry',
        travelTip: repl.travelTip || repl.tip || oldAct.travelTip || 'Recommended cultural replacement.',
        source: 'concierge-replacement',
        time: oldAct.time,
        startTime: oldAct.startTime,
        endTime: oldAct.endTime,
        slotType: oldAct.slotType
      };

      found.day.activities[found.idx] = newAct;
      applied.push(action);
      continue;
    }
  }

  return { itinerary: next, needsRegenerate, applied };
}


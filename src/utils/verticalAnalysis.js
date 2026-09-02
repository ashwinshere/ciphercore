// ============================================================================
// utils/verticalAnalysis.js
//
// Detects rooms that are "vertically related" — i.e. their X/Y footprints
// significantly overlap across different floors. This is the core of the
// Vertical Property Mapping feature: it lets us answer "what is directly
// above / below this room?" purely from 2D footprint data + floor elevation.
// ============================================================================

import { overlapFraction } from './geometry.js';

// A pair of rooms on different floors is considered "vertically aligned"
// when at least this fraction of the smaller footprint overlaps.
export const VERTICAL_ALIGNMENT_THRESHOLD = 0.5;

/**
 * Find every room (on any floor) vertically related to `selectedRoom`,
 * ordered from topmost to bottommost floor.
 *
 * @param {object} selectedRoom - flattened room (has floorId, elevation, id)
 * @param {Array<object>} allRooms - flattened rooms (see propertyId.flattenRooms)
 * @returns {{ stack: Array<object>, above: object|null, below: object|null }}
 */
export function detectVerticalStack(selectedRoom, allRooms) {
  if (!selectedRoom) return { stack: [], above: null, below: null };

  const related = allRooms.filter((room) => {
    if (room.id === selectedRoom.id) return true; // include self for context
    const frac = overlapFraction(selectedRoom, room);
    return frac >= VERTICAL_ALIGNMENT_THRESHOLD;
  });

  // Sort topmost floor first (highest elevation first)
  const stack = related.sort((a, b) => b.elevation - a.elevation);

  const selfIndex = stack.findIndex((r) => r.id === selectedRoom.id);
  const above = selfIndex > 0 ? stack[selfIndex - 1] : null;
  const below = selfIndex >= 0 && selfIndex < stack.length - 1 ? stack[selfIndex + 1] : null;

  return { stack, above, below };
}

/**
 * Count total vertical relationships across the whole building — used on
 * the dashboard summary card. A "relationship" is one above/below pair.
 */
export function countVerticalRelationships(allRooms) {
  let count = 0;
  const seen = new Set();
  allRooms.forEach((room) => {
    const { above } = detectVerticalStack(room, allRooms);
    if (above) {
      const key = [room.id, above.id].sort().join('::');
      if (!seen.has(key)) {
        seen.add(key);
        count += 1;
      }
    }
  });
  return count;
}

// ============================================================================
// utils/conflictDetection.js
//
// Runs simple, understandable geometry checks over the flattened room list
// and reports spatial data-quality issues, in the spirit of a real cadastral
// / GIS QA pass. All checks operate on axis-aligned bounding boxes.
// ============================================================================

import { rectanglesOverlap, overlapFraction, isWithinBoundary } from './geometry.js';
import { VERTICAL_ALIGNMENT_THRESHOLD } from './verticalAnalysis.js';

let _counter = 0;
function conflictId(prefix) {
  _counter += 1;
  return `${prefix}-${_counter}`;
}

/**
 * Run every conflict check over the flattened room list.
 * @param {Array<object>} allRooms - flattened rooms (see propertyId.flattenRooms)
 * @param {object} buildingBoundary - bounding box { xMin, xMax, yMin, yMax }
 * @param {string} buildingName - name of active building
 * @returns {Array<object>} conflicts: { id, type, severity, propertyId, description }
 */
export function detectAllConflicts(allRooms, buildingBoundary, buildingName = 'Building') {
  _counter = 0;
  const conflicts = [];

  conflicts.push(...detectDuplicateIds(allRooms));
  conflicts.push(...detectMissingIds(allRooms));
  conflicts.push(...detectOutOfBounds(allRooms, buildingBoundary, buildingName));
  conflicts.push(...detectHorizontalOverlaps(allRooms));
  conflicts.push(...detectSuspiciousVerticalOverlaps(allRooms));

  return conflicts;
}

// 1. Duplicate Property ID -----------------------------------------------
export function detectDuplicateIds(allRooms) {
  const seen = new Map();
  const conflicts = [];
  allRooms.forEach((room) => {
    if (seen.has(room.id)) {
      conflicts.push({
        id: conflictId('DUP'),
        type: 'Duplicate Property ID',
        severity: 'critical',
        propertyId: room.id,
        description: `Property ID "${room.id}" is assigned to more than one room (${seen.get(room.id)} and ${room.name}).`,
      });
    } else {
      seen.set(room.id, room.name);
    }
  });
  return conflicts;
}

// 2. Missing Vertical Property ID -----------------------------------------
export function detectMissingIds(allRooms) {
  const conflicts = [];
  allRooms.forEach((room) => {
    if (!room.id || room.id.trim() === '') {
      conflicts.push({
        id: conflictId('MISS'),
        type: 'Missing Vertical Property ID',
        severity: 'critical',
        propertyId: room.name || 'Unknown room',
        description: `Room "${room.name || 'Unnamed'}" on ${room.floorName} has no generated Vertical Property ID.`,
      });
    }
  });
  return conflicts;
}

// 3. Invalid room outside building boundary --------------------------------
export function detectOutOfBounds(allRooms, boundary, buildingName = 'Building') {
  const conflicts = [];
  if (!boundary) return conflicts;

  allRooms.forEach((room) => {
    if (!isWithinBoundary(room, boundary)) {
      conflicts.push({
        id: conflictId('OOB'),
        type: 'Room Outside Building Boundary',
        severity: 'critical',
        propertyId: room.id,
        description: `${room.name} footprint extends beyond the defined ${buildingName} boundary on ${room.floorName}.`,
      });
    }
  });
  return conflicts;
}

// 4. Horizontal room overlap (same floor) ----------------------------------
export function detectHorizontalOverlaps(allRooms) {
  const conflicts = [];
  const byFloor = groupBy(allRooms, 'floorId');
  Object.values(byFloor).forEach((rooms) => {
    for (let i = 0; i < rooms.length; i += 1) {
      for (let j = i + 1; j < rooms.length; j += 1) {
        if (rectanglesOverlap(rooms[i], rooms[j])) {
          conflicts.push({
            id: conflictId('HOV'),
            type: 'Horizontal Room Overlap',
            severity: 'warning',
            propertyId: rooms[i].id,
            description: `${rooms[i].name} overlaps ${rooms[j].name} on ${rooms[i].floorName} — footprints intersect on the same level.`,
          });
        }
      }
    }
  });
  return conflicts;
}

// 5. Suspicious vertical overlap (partial, misaligned across floors) -------
export function detectSuspiciousVerticalOverlaps(allRooms) {
  const conflicts = [];
  const flagged = new Set();
  for (let i = 0; i < allRooms.length; i += 1) {
    for (let j = i + 1; j < allRooms.length; j += 1) {
      const a = allRooms[i];
      const b = allRooms[j];
      if (a.floorId === b.floorId) continue; // handled by horizontal check
      const frac = overlapFraction(a, b);
      // "Suspicious": some overlap exists, but not enough to count as a
      // clean vertical stack relationship
      if (frac > 0.05 && frac < VERTICAL_ALIGNMENT_THRESHOLD) {
        const key = [a.id, b.id].sort().join('::');
        if (flagged.has(key)) continue;
        flagged.add(key);
        conflicts.push({
          id: conflictId('SVO'),
          type: 'Suspicious Vertical Overlap',
          severity: 'warning',
          propertyId: a.id,
          description: `${a.name} (${a.floorShortName}) only partially overlaps ${b.name} (${b.floorShortName}) — ${(frac * 100).toFixed(0)}% footprint alignment. Verify vertical stacking.`,
        });
      }
    }
  }
  return conflicts;
}

function groupBy(list, key) {
  return list.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}

export function summarizeConflicts(conflicts, totalProperties) {
  const critical = conflicts.filter((c) => c.severity === 'critical').length;
  const warning = conflicts.filter((c) => c.severity === 'warning').length;
  return {
    total: totalProperties,
    valid: Math.max(totalProperties - critical - warning, 0),
    warnings: warning,
    conflicts: critical,
  };
}

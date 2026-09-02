// ============================================================================
// utils/geometry.js
// Simple, understandable 2D bounding-box geometry helpers shared by the
// vertical analysis and conflict detection algorithms.
// ============================================================================

/** Area of a room footprint (m²): width × depth. */
export function calculateArea(room) {
  return +(room.width * room.depth).toFixed(1);
}

/** Elevation (m) of a floor, taken straight from buildingData. */
export function getRoomElevation(floor) {
  return floor.elevation;
}

/** Convert a room {x,y,width,depth} into an axis-aligned bounding box. */
export function toBounds(room) {
  return {
    xMin: room.x,
    xMax: room.x + room.width,
    yMin: room.y,
    yMax: room.y + room.depth,
  };
}

/** Do two rectangles overlap at all (strict, not just touching)? */
export function rectanglesOverlap(a, b) {
  const A = toBounds(a);
  const B = toBounds(b);
  return A.xMin < B.xMax && A.xMax > B.xMin && A.yMin < B.yMax && A.yMax > B.yMin;
}

/**
 * Fraction (0..1) of room `a`'s footprint area that overlaps with room `b`.
 * Used to decide whether two rooms on different floors are "vertically
 * aligned" (high overlap) vs merely "suspiciously overlapping" (partial).
 */
export function overlapFraction(a, b) {
  const A = toBounds(a);
  const B = toBounds(b);
  const xOverlap = Math.max(0, Math.min(A.xMax, B.xMax) - Math.max(A.xMin, B.xMin));
  const yOverlap = Math.max(0, Math.min(A.yMax, B.yMax) - Math.max(A.yMin, B.yMin));
  const overlapArea = xOverlap * yOverlap;
  const areaA = (A.xMax - A.xMin) * (A.yMax - A.yMin);
  if (areaA === 0) return 0;
  return overlapArea / areaA;
}

/** Is a room's footprint fully inside the building boundary? */
export function isWithinBoundary(room, boundary) {
  const B = toBounds(room);
  return (
    B.xMin >= boundary.xMin &&
    B.xMax <= boundary.xMax &&
    B.yMin >= boundary.yMin &&
    B.yMax <= boundary.yMax
  );
}

/** Center point of a room footprint, used for label / camera targeting. */
export function roomCenter(room) {
  return { x: room.x + room.width / 2, y: room.y + room.depth / 2 };
}

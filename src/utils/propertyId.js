// ============================================================================
// utils/propertyId.js
//
// Generates and manages the 3D Vertical Property Identifiers (3D ULPIN).
// Strict Cadastral Format: [2D-ULPIN]-[FLOOR-ID]-U[UNIT-ID]
// Example: 29-01-001-000128-F03-U007
// ============================================================================

/**
 * Build the standard 3D Vertical Property ID for a room on a given floor.
 * @param {object} floor - floor object from buildingData (needs id or numId)
 * @param {object} room - room object from buildingData (needs number)
 * @param {string} buildingPrefix - 2D ULPIN or building code
 * @returns {string}
 */
export function generateVerticalPropertyId(floor, room, buildingPrefix) {
  const prefix = buildingPrefix || '29-01-001-000123';
  const floorPart = floor?.id || (floor?.numId ? `F${floor.numId}` : 'F00');
  const unitNum = room?.number || (room?.unitSeq ? `U${String(room.unitSeq).padStart(3, '0')}` : 'U001');
  const roomPart = unitNum.startsWith('U') ? unitNum : `U${String(unitNum).padStart(3, '0')}`;
  return `${prefix}-${floorPart}-${roomPart}`;
}

/**
 * Attach standard attributes and retain the authoritative `id` on every room
 * in the building data, returning a flat list of rooms.
 * @param {object} buildingData
 * @returns {Array<object>} flattened rooms with id, floorId, floorName, elevation
 */
export function flattenRooms(buildingData) {
  const flat = [];
  if (!buildingData || !buildingData.floors) return flat;
  const buildingPrefix = buildingData.building?.ulpin2D || buildingData.building?.buildingCode || '29-01-001-000123';
  
  buildingData.floors.forEach((floor) => {
    floor.rooms.forEach((room) => {
      const canonicalId = room.id || generateVerticalPropertyId(floor, room, buildingPrefix);
      flat.push({
        ...room,
        id: canonicalId,
        floorId: floor.id,
        floorNumId: floor.numId,
        floorName: floor.name,
        floorShortName: floor.shortName,
        elevation: floor.elevation,
      });
    });
  });
  return flat;
}

/**
 * Parse a Vertical Property ID back into its components.
 */
export function parsePropertyId(idString) {
  if (!idString) return null;
  const parts = idString.trim().split('-');
  if (parts.length < 3) return null;
  const unit = parts[parts.length - 1];
  const floor = parts[parts.length - 2];
  const ulpin2D = parts.slice(0, parts.length - 2).join('-');
  return { ulpin2D, floorId: floor, unitNumber: unit };
}

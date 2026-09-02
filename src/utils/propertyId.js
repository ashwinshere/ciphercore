// ============================================================================
// utils/propertyId.js
//
// Generates the PROTOTYPE Vertical Property Identifier.
// Format:  TN-TRY-SCE-RV-F{floor}-R{room}
// Example: TN-TRY-SCE-RV-F03-R403
//
// IMPORTANT: This ID format is a hackathon PROTOTYPE convention only.
// It is not the official Government ULPIN and must not be represented
// as such. It exists to demonstrate how a vertical/3D-aware identifier
// could extend a 2D ULPIN once official schema guidance is available.
// ============================================================================

/**
 * Build the prototype Vertical Property ID for a room on a given floor.
 * @param {object} floor - floor object from buildingData (needs numId)
 * @param {object} room - room object from buildingData (needs number)
 * @returns {string}
 */
export function generateVerticalPropertyId(floor, room) {
  return `TN-TRY-SCE-RV-F${floor.numId}-R${room.number}`;
}

/**
 * Attach a computed `id` and `floorId` to every room in the building data,
 * returning a flat list of rooms — convenient for search, registry table,
 * conflict detection, etc.
 * @param {object} buildingData
 * @returns {Array<object>} flattened rooms with id, floorId, floorName, elevation
 */
export function flattenRooms(buildingData) {
  const flat = [];
  buildingData.floors.forEach((floor) => {
    floor.rooms.forEach((room) => {
      flat.push({
        ...room,
        id: generateVerticalPropertyId(floor, room),
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
 * Parse a prototype Vertical Property ID back into its parts.
 * Returns null if the string doesn't match the expected pattern.
 */
export function parsePropertyId(idString) {
  const match = /^TN-TRY-SCE-RV-F(\d{2})-R(.+)$/i.exec(idString.trim());
  if (!match) return null;
  return { floorNumId: match[1], roomNumber: match[2] };
}

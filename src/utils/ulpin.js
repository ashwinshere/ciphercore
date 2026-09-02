/**
 * Generates a 3D ULPIN based on the 2D ULPIN, floor number, and unit number.
 * Format: [2D-ULPIN]-F[Floor]-U[Unit]
 */
export function generate3DULPIN(property, floorId, unitNumber) {
  if (!property || !property.ulpin2D) return 'UNKNOWN';
  
  // Format floor: F01, F02, etc. (floorId is usually 'F01' already, but just in case)
  const formattedFloor = floorId.startsWith('F') ? floorId : `F${String(floorId).padStart(2, '0')}`;
  
  // Format unit: U01, U02, etc.
  const formattedUnit = unitNumber.toString().startsWith('U') 
    ? unitNumber 
    : `U${String(unitNumber).padStart(2, '0')}`;
    
  return `${property.ulpin2D}-${formattedFloor}-${formattedUnit}`;
}

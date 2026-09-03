/**
 * Generates a standard 3D ULPIN based on the 2D ULPIN, floor number, and unit number.
 * Cadastral Format: [2D-ULPIN]-[FLOOR-ID]-U[UNIT-ID]
 * Example: 29-01-001-000128-F03-U007
 */
export function generate3DULPIN(property, floorId, unitNumber) {
  const ulpin2D = (typeof property === 'string' ? property : property?.ulpin2D) || '29-01-001-000123';
  
  // Format floor: F00, F01, F02, etc.
  let formattedFloor = String(floorId || 'F00');
  if (!formattedFloor.startsWith('F')) {
    formattedFloor = `F${String(floorId).padStart(2, '0')}`;
  }
  
  // Format unit: U001, U002, etc.
  let formattedUnit = String(unitNumber || 'U001');
  if (!formattedUnit.startsWith('U')) {
    formattedUnit = `U${String(unitNumber).padStart(3, '0')}`;
  } else {
    const digits = formattedUnit.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 3) {
      formattedUnit = `U${digits.padStart(3, '0')}`;
    }
  }
    
  return `${ulpin2D}-${formattedFloor}-${formattedUnit}`;
}

// ============================================================================
// VERTEX — src/data/buildingData.js
//
// Procedural extrusion & digital twin layout generator for Saranathan College.
// Generates dynamic 3D building floor plates and room units matching the
// property's actual footprint dimensions (footprintWidthM x footprintDepthM).
// ============================================================================

import properties from './properties.js';

const FLOOR_HEIGHT = 3.5;
const CORRIDOR_DEPTH = 3;

function getRoomTypeForProperty(property, floorIndex, side, index) {
  const pId = property?.id || '';
  const bType = (property?.buildingType || '').toLowerCase();
  const pType = (property?.propertyType || '').toLowerCase();

  // 1. Hostel / Residential
  if (bType === 'hostel' || pId === 'boys-hostel' || pType.includes('hostel') || pType.includes('residential')) {
    if (floorIndex === 0) {
      if (side === 'north') {
        const groundNorth = ['Warden Office', 'Student Lounge', 'Recreation Room', 'Linen Store', 'Study Room', 'Medical Room'];
        return groundNorth[index % groundNorth.length];
      } else {
        const groundSouth = ['Hostel Reception', 'Visitor Lounge', 'Common Room', 'Canteen Antechamber'];
        return groundSouth[index % groundSouth.length];
      }
    } else {
      if (side === 'north') {
        const upperNorth = ['Dormitory Room', 'Double Occupancy Room', 'Single Deluxe Room', 'Resident Suite', 'Study Room'];
        return upperNorth[index % upperNorth.length];
      } else {
        const upperSouth = ['Dormitory Room', 'Double Occupancy Room', 'Triple Sharing Room', 'Resident Room'];
        return upperSouth[index % upperSouth.length];
      }
    }
  }

  // 2. Parking
  if (pId === 'parking' || pType.includes('parking')) {
    const slots = ['Covered Vehicle Bay', 'Two-Wheeler Slot', 'EV Charging Station', 'Logistics Bay', 'Security Kiosk'];
    return slots[index % slots.length];
  }

  // 3. Canteen / Dining
  if (pId === 'canteen' || pType.includes('dining') || pType.includes('amenities')) {
    const canteenTypes = ['Main Dining Hall', 'Kitchen & Food Prep', 'Service Counter', 'Storage & Cold Room', 'Staff Mess', 'Billing Counter'];
    return canteenTypes[index % canteenTypes.length];
  }

  // 4. Sports
  if (pId === 'basketball-ground' || bType === 'sports' || pType.includes('sports')) {
    const sportsTypes = ['Primary Play Court', 'Equipment Store', 'Pavilion & Bench Area', 'Official Scoring Station'];
    return sportsTypes[index % sportsTypes.length];
  }

  // 5. Mechanical Academic
  if (pId === 'me-block' || pType.includes('mechanical')) {
    if (floorIndex === 0) {
      const groundMech = ['Heavy Workshop', 'Machinery & Heat Transfer Lab', 'Fluid Mechanics Lab', 'Department Office'];
      return groundMech[index % groundMech.length];
    } else {
      const upperMech = ['CAD/CAM Simulation Lab', 'Mechatronics Lab', 'Department Faculty Room', 'Lecture Room'];
      return upperMech[index % upperMech.length];
    }
  }

  // 6. Standard Academic (BD Block, RV Block, KS Block, default)
  if (floorIndex === 0) {
    return side === 'north'
      ? (index === 0 ? 'Administrative Office' : 'Department Office')
      : (index === 0 ? 'Reception' : 'Faculty Lounge');
  } else {
    return side === 'north'
      ? (index % 2 === 0 ? 'Classroom' : 'Common Laboratory')
      : (index % 2 === 0 ? 'Tutorial Room' : 'Seminar Hall');
  }
}

function generateRoomsForFloor(floorIndex, floorId, property) {
  const rooms = [];
  const buildingWidth = property.footprintWidthM || 60;
  const buildingDepth = property.footprintDepthM || 20;
  const config = property.buildingConfig || { floors: 3, unitsPerFloor: 6, roomPrefix: 'BLD' };
  
  const prefix = config.roomPrefix || 'RM';
  const unitsPerFloor = config.unitsPerFloor || 6;
  const roomDepth = Math.max(4, (buildingDepth - CORRIDOR_DEPTH) / 2);
  
  const roomsPerSide = Math.ceil(unitsPerFloor / 2);
  const availableWidth = buildingWidth - 2;
  const roomWidth = Math.max(5, availableWidth / roomsPerSide);

  const startX = -buildingWidth / 2 + 1 + roomWidth / 2;
  const northZ = CORRIDOR_DEPTH / 2 + roomDepth / 2;
  const southZ = -CORRIDOR_DEPTH / 2 - roomDepth / 2;

  let count = 0;
  // North Side
  for (let i = 0; i < roomsPerSide && count < unitsPerFloor; i++) {
    const x = startX + i * roomWidth;
    const unitSeq = count + 1;
    const unitNumStr = String(unitSeq).padStart(3, '0');
    // Strict 3D ULPIN format: [2D-ULPIN]-[FLOOR-ID]-U[UNIT-ID]
    const roomId = `${property.ulpin2D}-${floorId}-U${unitNumStr}`;
    const isKnown = config.knownRooms?.includes(`${prefix}${floorIndex + 1}0${i + 1}`);
    const roomName = `${prefix}-${floorIndex + 1}0${i + 1}`;
    const roomType = getRoomTypeForProperty(property, floorIndex, 'north', i);

    rooms.push({
      id: roomId,
      ulpin3D: roomId,
      ulpin2D: property.ulpin2D,
      floorId: floorId,
      number: `U${unitNumStr}`,
      unitSeq: unitSeq,
      name: roomName,
      type: roomType,
      blockNumber: property.blockNumber ? `Block ${property.blockNumber}` : 'Block 100',
      ownerName: property.ownerName || 'Saranathan Educational Trust',
      surveyNumber: `${property.surveyNumber || 'SF-100/1'}-${floorIndex + 1}0${i + 1}`,
      buildingName: property.name,
      cadastreStatus: 'Verified 3D Record',
      x: x - roomWidth / 2,
      y: northZ - roomDepth / 2,
      width: roomWidth - 0.4,
      depth: roomDepth - 0.4,
      height: FLOOR_HEIGHT - 0.4,
      side: 'north',
      officialReference: isKnown || false,
      elevation: floorIndex * FLOOR_HEIGHT,
      floorName: floorIndex === 0 ? 'Ground Floor' : `Floor ${floorIndex}`,
      floorShortName: floorIndex === 0 ? 'Ground' : `F${floorIndex}`,
    });
    count++;
  }

  // South Side
  for (let i = 0; i < roomsPerSide && count < unitsPerFloor; i++) {
    const x = startX + i * roomWidth;
    const unitSeq = count + 1;
    const unitNumStr = String(unitSeq).padStart(3, '0');
    const roomId = `${property.ulpin2D}-${floorId}-U${unitNumStr}`;
    const isKnown = config.knownRooms?.includes(`${prefix}${floorIndex + 1}0${i + 1}`);
    const roomName = `${prefix}-${floorIndex + 1}0${i + roomsPerSide + 1}`;
    const roomType = getRoomTypeForProperty(property, floorIndex, 'south', i);

    rooms.push({
      id: roomId,
      ulpin3D: roomId,
      ulpin2D: property.ulpin2D,
      floorId: floorId,
      number: `U${unitNumStr}`,
      unitSeq: unitSeq,
      name: roomName,
      type: roomType,
      blockNumber: property.blockNumber ? `Block ${property.blockNumber}` : 'Block 100',
      ownerName: property.ownerName || 'Saranathan Educational Trust',
      surveyNumber: `${property.surveyNumber || 'SF-100/1'}-${floorIndex + 1}0${i + roomsPerSide + 1}`,
      buildingName: property.name,
      cadastreStatus: 'Verified 3D Record',
      x: x - roomWidth / 2,
      y: southZ - roomDepth / 2,
      width: roomWidth - 0.4,
      depth: roomDepth - 0.4,
      height: FLOOR_HEIGHT - 0.4,
      side: 'south',
      officialReference: isKnown || false,
      elevation: floorIndex * FLOOR_HEIGHT,
      floorName: floorIndex === 0 ? 'Ground Floor' : `Floor ${floorIndex}`,
      floorShortName: floorIndex === 0 ? 'Ground' : `F${floorIndex}`,
    });
    count++;
  }

  return rooms;
}

export function generateBuildingData(property = properties[0]) {
  if (!property) property = properties[0];

  const config = property.buildingConfig || { floors: 4, unitsPerFloor: 8, roomPrefix: 'BLD' };
  const numFloors = property.floors || config.floors || 4;
  const buildingWidth = property.footprintWidthM || 60;
  const buildingDepth = property.footprintDepthM || 20;

  const floorNames = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor', 'Fifth Floor', 'Sixth Floor'];
  const floors = [];

  for (let i = 0; i < numFloors; i++) {
    const floorId = `F${String(i).padStart(2, '0')}`;
    const name = floorNames[i] || `Floor ${i}`;
    floors.push({
      id: floorId,
      numId: String(i).padStart(2, '0'),
      name,
      shortName: i === 0 ? 'Ground' : `Floor ${i}`,
      elevation: i * FLOOR_HEIGHT,
      height: FLOOR_HEIGHT,
      rooms: generateRoomsForFloor(i, floorId, property)
    });
  }

  return {
    building: {
      id: property.id,
      name: property.name,
      blockNumber: property.blockNumber ? `Block ${property.blockNumber}` : 'Block 100',
      ownerName: property.ownerName || 'Saranathan Educational Trust',
      surveyNumber: property.surveyNumber || 'SF-100/1A',
      institution: property.institution || 'Saranathan College of Engineering',
      location: 'Panjappur, Tiruchirappalli, Tamil Nadu',
      state: 'Tamil Nadu',
      district: 'Tiruchirappalli',
      institutionCode: 'SCE',
      buildingCode: property.id,
      status: 'Prototype Digital Twin',
      ulpin2D: property.ulpin2D,
      propertyType: property.propertyType,
      realWorld: property.realWorld !== undefined ? property.realWorld : true,
      prototypeStatus: property.prototypeStatus || 'approximate',
      geometryConfidence: property.geometryConfidence || 'high',
      sourceType: property.sourceType || 'satellite',
      sources: property.sources || ['Google Maps Satellite Imagery'],
      footprintWidthM: buildingWidth,
      footprintDepthM: buildingDepth,
      buildingHeightM: numFloors * FLOOR_HEIGHT,
      orientationDeg: property.orientationDeg || 0,
      coordinates: property.coordinates,
      footprint: property.footprint,
    },
    floors,
    boundary: {
      width: buildingWidth,
      depth: buildingDepth,
      height: numFloors * FLOOR_HEIGHT,
      xMin: -buildingWidth / 2 - 2,
      xMax: buildingWidth / 2 + 2,
      yMin: -buildingDepth / 2 - 2,
      yMax: buildingDepth / 2 + 2,
    }
  };
}

export const buildingData = generateBuildingData(properties[0]);

export const BUILDING_BOUNDARY = {
  xMin: -35,
  xMax: 35,
  yMin: -15,
  yMax: 15,
};

export const CORRIDOR = { x: -30, y: -1.5, width: 60, depth: 3 };
export const STAIRCASE = { x: 20, y: -1.5, width: 8, depth: 3 };

export const DEFAULT_TIMELINE_EVENTS = [
  { year: 2024, title: 'Satellite Cadastral Survey', status: 'Mapped', description: 'Footprint captured from high-resolution satellite imagery.' },
  { year: 2025, title: 'Spatial 3D Extrusion', status: 'Updated', description: 'Extruded footprint into multi-level vertical digital twin.' },
  { year: 2026, title: 'Prototype 3D ULPIN Indexing', status: 'Verified', description: 'Generated 3D ULPIN identifiers linked to 2D land parcel.' },
];

export const TIMELINE_YEARS = [2024, 2025, 2026];

export default buildingData;


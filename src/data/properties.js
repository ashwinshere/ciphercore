// ============================================================================
// VERTEX — src/data/properties.js
//
// Real-World Campus Spatial Properties for Saranathan College of Engineering.
// Ground-Truth Spatial Layout aligned with Satellite Reference Imagery.
// Campus Center: 10.757172° N, 78.651348° E
//
// Building polygon coordinates derived from user-supplied red-outline
// reference image, mapped to WGS 84 lat/lng using meter-to-degree
// conversion at this latitude.
// ============================================================================

function createGeoRect(centerLat, centerLng, widthM, heightM, rotationDegrees = 32) {
  const latOffsetPerMeter = 1 / 111111;
  const lngOffsetPerMeter = 1 / (111111 * Math.cos(centerLat * Math.PI / 180));

  const rad = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = widthM / 2;
  const hh = heightM / 2;

  const corners = [
    [-hw, -hh],
    [ hw, -hh],
    [ hw,  hh],
    [-hw,  hh]
  ];

  return corners.map(([dx, dy]) => {
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    return [
      Number((centerLat + (ry * latOffsetPerMeter)).toFixed(6)),
      Number((centerLng + (rx * lngOffsetPerMeter)).toFixed(6))
    ];
  });
}

function createLocalRect(widthM, depthM, rotationDegrees = 0) {
  const rad = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = widthM / 2;
  const hd = depthM / 2;

  const corners = [
    [-hw, -hd],
    [ hw, -hd],
    [ hw,  hd],
    [-hw,  hd]
  ];

  return corners.map(([dx, dz]) => [
    Number((dx * cos - dz * sin).toFixed(2)),
    Number((dx * sin + dz * cos).toFixed(2))
  ]);
}

const CENTER_LAT = 10.757172;
const CENTER_LNG = 78.651348;
const CAMPUS_GRID_ROTATION = 32; // Campus buildings aligned to ~32° diagonal axis

export const properties = [
  {
    id: "boys-hostel",
    name: "Boys Hostel",
    institution: "Saranathan College of Engineering",
    ulpin2D: "29-01-001-000128",
    propertyType: "Residential Hostel",
    buildingType: "Hostel",
    floors: 4,
    unitsPerFloor: 16,
    coordinates: { latitude: 10.758350, longitude: 78.649850 },
    footprint: createGeoRect(10.758350, 78.649850, 55, 40, CAMPUS_GRID_ROTATION),
    footprintLocal: createLocalRect(55, 40, 0),
    footprintWidthM: 55,
    footprintDepthM: 40,
    buildingHeightM: 14.0,
    orientationDeg: CAMPUS_GRID_ROTATION,
    color: "#10B981",
    stroke: "#047857",
    realWorld: true,
    prototypeStatus: "approximate",
    geometryConfidence: "high",
    sourceType: "satellite",
    sources: ["Saranathan College Satellite Reference Imagery"],
    buildingConfig: {
      floors: 4,
      unitsPerFloor: 16,
      type: "Hostel",
      roomPrefix: "BH"
    }
  },
  {
    id: "parking",
    name: "Parking Zone",
    institution: "Saranathan College of Engineering",
    ulpin2D: "29-01-001-000131",
    propertyType: "Parking & Transport",
    buildingType: "Amenity",
    floors: 1,
    unitsPerFloor: 4,
    coordinates: { latitude: 10.757750, longitude: 78.650450 },
    footprint: createGeoRect(10.757750, 78.650450, 75, 20, CAMPUS_GRID_ROTATION),
    footprintLocal: createLocalRect(75, 20, 0),
    footprintWidthM: 75,
    footprintDepthM: 20,
    buildingHeightM: 3.5,
    orientationDeg: CAMPUS_GRID_ROTATION,
    color: "#64748B",
    stroke: "#334155",
    realWorld: true,
    prototypeStatus: "approximate",
    geometryConfidence: "high",
    sourceType: "satellite",
    sources: ["Saranathan College Satellite Reference Imagery"],
    buildingConfig: {
      floors: 1,
      unitsPerFloor: 4,
      type: "Parking",
      roomPrefix: "PK"
    }
  },
  {
    id: "bd-block",
    name: "BD Block",
    institution: "Saranathan College of Engineering",
    ulpin2D: "29-01-001-000124",
    propertyType: "Academic Main Block",
    buildingType: "Academic",
    floors: 4,
    unitsPerFloor: 14,
    hasCourtyard: true,
    courtyardWidthM: 40,
    courtyardDepthM: 30,
    coordinates: { latitude: 10.757550, longitude: 78.651200 },
    footprint: createGeoRect(10.757550, 78.651200, 90, 75, CAMPUS_GRID_ROTATION),
    footprintLocal: createLocalRect(90, 75, 0),
    footprintWidthM: 90,
    footprintDepthM: 75,
    buildingHeightM: 14.0,
    orientationDeg: CAMPUS_GRID_ROTATION,
    color: "#3B82F6",
    stroke: "#1D4ED8",
    realWorld: true,
    prototypeStatus: "approximate",
    geometryConfidence: "high",
    sourceType: "satellite",
    sources: ["Saranathan College Satellite Reference Imagery"],
    buildingConfig: {
      floors: 4,
      unitsPerFloor: 14,
      type: "Academic",
      roomPrefix: "BD"
    }
  },
  {
    id: "rv-block",
    name: "RV Block",
    institution: "Saranathan College of Engineering",
    ulpin2D: "29-01-001-000123",
    propertyType: "Academic Block",
    buildingType: "Academic",
    floors: 5,
    unitsPerFloor: 10,
    coordinates: { latitude: 10.757450, longitude: 78.651900 },
    footprint: createGeoRect(10.757450, 78.651900, 80, 70, CAMPUS_GRID_ROTATION),
    footprintLocal: createLocalRect(80, 70, 0),
    footprintWidthM: 80,
    footprintDepthM: 70,
    buildingHeightM: 17.5,
    orientationDeg: CAMPUS_GRID_ROTATION,
    color: "#2563EB",
    stroke: "#1E40AF",
    realWorld: true,
    prototypeStatus: "approximate",
    geometryConfidence: "high",
    sourceType: "satellite",
    sources: ["Saranathan College Satellite Reference Imagery"],
    buildingConfig: {
      floors: 5,
      unitsPerFloor: 10,
      type: "Academic",
      roomPrefix: "RV",
      knownRooms: ["RV301","RV302","RV409","RV410","RV412","RV413","RV414","RV415"]
    }
  },
  {
    id: "me-block",
    name: "ME Block",
    institution: "Saranathan College of Engineering",
    ulpin2D: "29-01-001-000125",
    propertyType: "Mechanical Academic Block",
    buildingType: "Academic",
    floors: 3,
    unitsPerFloor: 8,
    coordinates: { latitude: 10.757100, longitude: 78.650100 },
    footprint: createGeoRect(10.757100, 78.650100, 50, 65, CAMPUS_GRID_ROTATION),
    footprintLocal: createLocalRect(50, 65, 0),
    footprintWidthM: 50,
    footprintDepthM: 65,
    buildingHeightM: 10.5,
    orientationDeg: CAMPUS_GRID_ROTATION,
    color: "#8B5CF6",
    stroke: "#6D28D9",
    realWorld: true,
    prototypeStatus: "approximate",
    geometryConfidence: "high",
    sourceType: "satellite",
    sources: ["Saranathan College Satellite Reference Imagery"],
    buildingConfig: {
      floors: 3,
      unitsPerFloor: 8,
      type: "Academic",
      roomPrefix: "ME"
    }
  },
  {
    id: "canteen",
    name: "Canteen",
    institution: "Saranathan College of Engineering",
    ulpin2D: "29-01-001-000130",
    propertyType: "Dining & Amenities",
    buildingType: "Amenity",
    floors: 1,
    unitsPerFloor: 6,
    coordinates: { latitude: 10.756650, longitude: 78.650650 },
    footprint: createGeoRect(10.756650, 78.650650, 80, 45, CAMPUS_GRID_ROTATION),
    footprintLocal: createLocalRect(80, 45, 0),
    footprintWidthM: 80,
    footprintDepthM: 45,
    buildingHeightM: 4.5,
    orientationDeg: CAMPUS_GRID_ROTATION,
    color: "#EC4899",
    stroke: "#BE185D",
    realWorld: true,
    prototypeStatus: "approximate",
    geometryConfidence: "high",
    sourceType: "satellite",
    sources: ["Saranathan College Satellite Reference Imagery"],
    buildingConfig: {
      floors: 1,
      unitsPerFloor: 6,
      type: "Retail",
      roomPrefix: "CN"
    }
  },
  {
    id: "ks-block",
    name: "KS Block",
    institution: "Saranathan College of Engineering",
    ulpin2D: "29-01-001-000132",
    propertyType: "Academic Block",
    buildingType: "Academic",
    floors: 4,
    unitsPerFloor: 12,
    hasCourtyard: true,
    courtyardWidthM: 40,
    courtyardDepthM: 35,
    coordinates: { latitude: 10.756400, longitude: 78.651500 },
    footprint: createGeoRect(10.756400, 78.651500, 100, 90, CAMPUS_GRID_ROTATION),
    footprintLocal: createLocalRect(100, 90, 0),
    footprintWidthM: 100,
    footprintDepthM: 90,
    buildingHeightM: 14.0,
    orientationDeg: CAMPUS_GRID_ROTATION,
    color: "#F59E0B",
    stroke: "#B45309",
    realWorld: true,
    prototypeStatus: "approximate",
    geometryConfidence: "high",
    sourceType: "satellite",
    sources: ["Saranathan College Satellite Reference Imagery"],
    buildingConfig: {
      floors: 4,
      unitsPerFloor: 12,
      type: "Academic",
      roomPrefix: "KS"
    }
  },
  {
    id: "basketball-ground",
    name: "Basketball Ground",
    institution: "Saranathan College of Engineering",
    ulpin2D: "29-01-001-000133",
    propertyType: "Sports Court",
    buildingType: "Sports",
    floors: 1,
    unitsPerFloor: 1,
    isSportsCourt: true,
    coordinates: { latitude: 10.757200, longitude: 78.652500 },
    footprint: createGeoRect(10.757200, 78.652500, 40, 35, CAMPUS_GRID_ROTATION),
    footprintLocal: createLocalRect(40, 35, 0),
    footprintWidthM: 40,
    footprintDepthM: 35,
    buildingHeightM: 0.5,
    orientationDeg: CAMPUS_GRID_ROTATION,
    color: "#0EA5E9",
    stroke: "#0284C7",
    realWorld: true,
    prototypeStatus: "approximate",
    geometryConfidence: "high",
    sourceType: "satellite",
    sources: ["Saranathan College Satellite Reference Imagery"],
    buildingConfig: {
      floors: 1,
      unitsPerFloor: 1,
      type: "Sports",
      roomPrefix: "BB"
    }
  }
];

export const MAP_CENTER = [CENTER_LAT, CENTER_LNG];

export default properties;

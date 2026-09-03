// ============================================================================
// VERTEX — src/data/gisData.js
//
// Geographic Information System (GIS) Configuration and Spatial Anchoring
// Connects global real-world coordinates (WGS84 EPSG:4326) to the local
// 3D Cartesian XYZ spatial coordinates of Saranathan College of Engineering.
// ============================================================================

export const gisData = {
  // Campus Geographic Boundary & Reference Anchor
  campus: {
    name: "Saranathan College of Engineering",
    shortName: "SCE Campus",
    institutionCode: "SCE",
    address: "Venkateswara Nagar, Panjappur, Tiruchirappalli, Tamil Nadu 620012, India",
    state: "Tamil Nadu",
    district: "Tiruchirappalli",
    taluk: "Tiruchirappalli West",
    village: "Panjappur",
    // Configurable WGS84 Coordinates
    latitude: 10.757172,
    longitude: 78.651348,
    altitudeM: 85.0, // Above Mean Sea Level (AMSL)
    coordinateReferenceSystem: "WGS84 (EPSG:4326)",
    localCoordinateSystem: "Local Cartesian Metric (XYZ)",
    surveyNumber: "SF-248/1A",
    totalAreaAcres: 40.5,
    dataConfidence: "Prototype",
    statusNote: "Approximate Prototype Location – Requires Survey Verification",
    mapDefaultZoom: 17,
    bounds: [
      [10.754500, 78.647500], // Southwest
      [10.760000, 78.654500]  // Northeast
    ]
  },

  // Pilot Demonstration Building (RV Block)
  pilotBuilding: {
    id: "rv-block",
    name: "RV Block",
    code: "RV",
    propertyType: "Academic Block",
    institution: "Saranathan College of Engineering",
    ulpin2D: "29-01-001-000123",
    // Geographic Anchor (WGS84)
    geographicAnchor: {
      latitude: 10.757450,
      longitude: 78.651900,
      altitudeM: 85.0,
      coordinateSystem: "WGS84 (EPSG:4326)",
      localSystem: "Local Cartesian XYZ (Meters)",
      datum: "WGS 84 Ellipsoid"
    },
    footprintWidthM: 80,
    footprintDepthM: 70,
    buildingHeightM: 17.5,
    floorsCount: 5,
    unitsPerFloor: 10,
    orientationDeg: 32,
    dataConfidence: "Prototype",
    status: "Prototype Spatial Data - Requires Survey Verification",
    description: "Multi-level academic facility housing lecture halls, research labs, and faculty departments. Serves as the primary pilot anchor for 3D ULPIN generation.",
    knownRooms: ["RV301", "RV302", "RV409", "RV410", "RV412", "RV413", "RV414", "RV415"]
  },

  // GIS → 3D Transformation Model
  spatialModel: {
    globalCRS: "WGS84 (EPSG:4326)",
    localCRS: "Metric Cartesian (Origin at Building Center)",
    verticalCRS: "Orthometric Height (Elevation above Ground Level in Meters)",
    conceptExplanation: {
      global: "GIS coordinates (Latitude & Longitude) locate the building globally on Earth.",
      local: "Local Cartesian XYZ coordinates define the 3D position of each property inside the building.",
      vertical: "Floor elevation (+Zm) establishes vertical stratification for 3D ULPIN indexing."
    },
    mantra: "GIS tells us where the building exists on Earth. VERTEX tells us where every property exists inside the building."
  }
};

/**
 * Generate a standardized Prototype Vertical Property Identifier
 * Example output: TN-TRY-SCE-RV-F03-R403
 */
export function generatePrototypePropertyId(buildingCode = "RV", floorIndex = 3, roomNumber = "403") {
  const floorTag = `F${String(floorIndex).padStart(2, '0')}`;
  return `TN-TRY-SCE-${buildingCode.toUpperCase()}-${floorTag}-R${roomNumber}`;
}

/**
 * Calculate Local XYZ to Estimated Geographic Coordinates
 */
export function localToGeographic(localX, localZ, anchorLat = 10.757450, anchorLng = 78.651900, rotationDeg = 32) {
  const latOffsetPerMeter = 1 / 111111;
  const lngOffsetPerMeter = 1 / (111111 * Math.cos(anchorLat * Math.PI / 180));
  const rad = (rotationDeg * Math.PI) / 180;
  
  const rx = localX * Math.cos(rad) - localZ * Math.sin(rad);
  const ry = localX * Math.sin(rad) + localZ * Math.cos(rad);

  return {
    latitude: Number((anchorLat + ry * latOffsetPerMeter).toFixed(6)),
    longitude: Number((anchorLng + rx * lngOffsetPerMeter).toFixed(6))
  };
}

export default gisData;

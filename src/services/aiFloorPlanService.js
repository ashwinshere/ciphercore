/**
 * AI Floor Plan Recognition & 3D Building Geometry Service
 * 
 * Modular service architecture simulating trained Computer Vision / Deep Learning models.
 * Architecture structured for future integration with Python FastAPI / PyTorch / OpenCV backend.
 */

// Sample realistic CAD floor plan presets with architectural coordinates
export const FLOOR_PLAN_PRESETS = [
  {
    id: 'academic_standard',
    name: 'Standard Academic / Laboratory Floor Plan',
    category: 'Educational',
    description: 'Classrooms, tutorial halls, faculty lounges, and central laboratory core',
    defaultDimensions: { width: 60, depth: 22, height: 3.6 },
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23f8fafc"/><rect x="20" y="20" width="360" height="160" fill="%23ffffff" stroke="%233b82f6" stroke-width="2"/><line x1="20" y1="100" x2="380" y2="100" stroke="%2394a3b8" stroke-dasharray="4 4"/><text x="200" y="105" text-anchor="middle" fill="%23475569" font-family="sans-serif" font-size="12" font-weight="bold">CENTRAL CORRIDOR</text><rect x="30" y="30" width="70" height="60" fill="%23eff6ff" stroke="%232563eb"/><text x="65" y="65" text-anchor="middle" fill="%231e40af" font-size="10">Lab 1</text><rect x="110" y="30" width="70" height="60" fill="%23eff6ff" stroke="%232563eb"/><text x="145" y="65" text-anchor="middle" fill="%231e40af" font-size="10">Lab 2</text><rect x="190" y="30" width="80" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="230" y="65" text-anchor="middle" fill="%23166534" font-size="10">Class 1</text><rect x="280" y="30" width="90" height="60" fill="%23fef3c7" stroke="%23d97706"/><text x="325" y="65" text-anchor="middle" fill="%2392400e" font-size="10">Seminar</text><rect x="30" y="110" width="80" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="70" y="145" text-anchor="middle" fill="%23166534" font-size="10">Class 2</text><rect x="120" y="110" width="80" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="160" y="145" text-anchor="middle" fill="%23166534" font-size="10">Class 3</text><rect x="210" y="110" width="70" height="60" fill="%23fef2f2" stroke="%23dc2626"/><text x="245" y="145" text-anchor="middle" fill="%23991b1b" font-size="10">Admin</text><rect x="290" y="110" width="80" height="60" fill="%23eff6ff" stroke="%232563eb"/><text x="330" y="145" text-anchor="middle" fill="%231e40af" font-size="10">Faculty</text></svg>',
  },
  {
    id: 'commercial_office',
    name: 'Commercial Enterprise & Admin Floor Plan',
    category: 'Commercial',
    description: 'Executive suites, conference rooms, open-plan workspace, and server facility',
    defaultDimensions: { width: 50, depth: 24, height: 3.8 },
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23f8fafc"/><rect x="20" y="20" width="360" height="160" fill="%23ffffff" stroke="%236366f1" stroke-width="2"/><rect x="30" y="30" width="100" height="70" fill="%23eef2ff" stroke="%234f46e5"/><text x="80" y="70" text-anchor="middle" fill="%233730a3" font-size="11">Conference</text><rect x="140" y="30" width="120" height="70" fill="%23f0fdf4" stroke="%2316a34a"/><text x="200" y="70" text-anchor="middle" fill="%23166534" font-size="11">Open Workspace</text><rect x="270" y="30" width="100" height="70" fill="%23fdf4ff" stroke="%23c026d3"/><text x="320" y="70" text-anchor="middle" fill="%2386198f" font-size="11">Executive Suite</text><rect x="30" y="110" width="160" height="60" fill="%23f8fafc" stroke="%2364748b"/><text x="110" y="145" text-anchor="middle" fill="%23334155" font-size="11">Tech Hub &amp; Server</text><rect x="200" y="110" width="80" height="60" fill="%23fef3c7" stroke="%23d97706"/><text x="240" y="145" text-anchor="middle" fill="%2392400e" font-size="11">Lounge</text><rect x="290" y="110" width="80" height="60" fill="%23eff6ff" stroke="%232563eb"/><text x="330" y="145" text-anchor="middle" fill="%231e40af" font-size="11">Reception</text></svg>',
  },
  {
    id: 'residential_hostel',
    name: 'Residential / Hostel Block Floor Plan',
    category: 'Residential',
    description: 'Double occupancy units, warden quarter, common recreation hall, and utility zone',
    defaultDimensions: { width: 55, depth: 20, height: 3.2 },
    previewUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23f8fafc"/><rect x="20" y="20" width="360" height="160" fill="%23ffffff" stroke="%2310b981" stroke-width="2"/><line x1="20" y1="100" x2="380" y2="100" stroke="%2394a3b8" stroke-dasharray="4 4"/><rect x="30" y="30" width="50" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="55" y="65" text-anchor="middle" fill="%23166534" font-size="10">R-101</text><rect x="90" y="30" width="50" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="115" y="65" text-anchor="middle" fill="%23166534" font-size="10">R-102</text><rect x="150" y="30" width="50" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="175" y="65" text-anchor="middle" fill="%23166534" font-size="10">R-103</text><rect x="210" y="30" width="50" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="235" y="65" text-anchor="middle" fill="%23166534" font-size="10">R-104</text><rect x="270" y="30" width="100" height="60" fill="%23fef3c7" stroke="%23d97706"/><text x="320" y="65" text-anchor="middle" fill="%2392400e" font-size="10">Common Lounge</text><rect x="30" y="110" width="50" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="55" y="145" text-anchor="middle" fill="%23166534" font-size="10">R-105</text><rect x="90" y="110" width="50" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="115" y="145" text-anchor="middle" fill="%23166534" font-size="10">R-106</text><rect x="150" y="110" width="50" height="60" fill="%23f0fdf4" stroke="%2316a34a"/><text x="175" y="145" text-anchor="middle" fill="%23166534" font-size="10">R-107</text><rect x="210" y="110" width="70" height="60" fill="%23fee2e2" stroke="%23dc2626"/><text x="245" y="145" text-anchor="middle" fill="%23991b1b" font-size="10">Warden</text><rect x="290" y="110" width="80" height="60" fill="%23eff6ff" stroke="%232563eb"/><text x="330" y="145" text-anchor="middle" fill="%231e40af" font-size="10">Study Hall</text></svg>',
  }
];

/**
 * AI Wall Detection Algorithm (Simulation with precision architectural coordinates)
 */
export function detectWalls(floorNumber = 0, specs = { width: 60, depth: 22, height: 3.6 }, planType = 'academic_standard') {
  const W = specs.width || 60;
  const D = specs.depth || 22;
  const H = specs.height || 3.6;
  const halfW = W / 2;
  const halfD = D / 2;
  const thickness = 0.25;

  const walls = [];

  // Perimeter Exterior Walls
  // North Wall
  walls.push({ id: `w_n_f${floorNumber}`, startX: -halfW, startY: halfD, endX: halfW, endY: halfD, thickness: 0.3, height: H, isExterior: true });
  // South Wall
  walls.push({ id: `w_s_f${floorNumber}`, startX: -halfW, startY: -halfD, endX: halfW, endY: -halfD, thickness: 0.3, height: H, isExterior: true });
  // West Wall
  walls.push({ id: `w_w_f${floorNumber}`, startX: -halfW, startY: -halfD, endX: -halfW, endY: halfD, thickness: 0.3, height: H, isExterior: true });
  // East Wall
  walls.push({ id: `w_e_f${floorNumber}`, startX: halfW, startY: -halfD, endX: halfW, endY: halfD, thickness: 0.3, height: H, isExterior: true });

  // Corridor Spine (Central Longitudinal Dividing Walls)
  const corrHalfDepth = 1.5;
  walls.push({ id: `w_corr_n_f${floorNumber}`, startX: -halfW + 1, startY: corrHalfDepth, endX: halfW - 1, endY: corrHalfDepth, thickness, height: H, isExterior: false });
  walls.push({ id: `w_corr_s_f${floorNumber}`, startX: -halfW + 1, startY: -corrHalfDepth, endX: halfW - 1, endY: -corrHalfDepth, thickness, height: H, isExterior: false });

  // Interior Dividing Transverse Walls
  const numDivisions = planType === 'residential_hostel' ? 6 : 4;
  const stepX = (W - 2) / numDivisions;

  for (let i = 1; i < numDivisions; i++) {
    const x = -halfW + 1 + i * stepX;
    // North section divider
    walls.push({ id: `w_div_n_${i}_f${floorNumber}`, startX: x, startY: corrHalfDepth, endX: x, endY: halfD, thickness, height: H, isExterior: false });
    // South section divider
    walls.push({ id: `w_div_s_${i}_f${floorNumber}`, startX: x, startY: -halfD, endX: x, endY: -corrHalfDepth, thickness, height: H, isExterior: false });
  }

  return walls;
}

/**
 * AI Room Spatial Boundary Detection
 */
export function detectRooms(floorNumber = 0, specs = { width: 60, depth: 22, height: 3.6 }, planType = 'academic_standard') {
  const W = specs.width || 60;
  const D = specs.depth || 22;
  const H = specs.height || 3.6;
  const halfW = W / 2;
  const halfD = D / 2;
  const corrHalfDepth = 1.5;

  const numDivisions = planType === 'residential_hostel' ? 6 : 4;
  const stepX = (W - 2) / numDivisions;
  const roomDepth = halfD - corrHalfDepth;

  const rooms = [];
  const floorPrefix = floorNumber === 0 ? 'G' : `F${floorNumber}`;

  // Room type palettes based on plan category
  const roomTypesNorth = planType === 'commercial_office' 
    ? ['Conference Room', 'Open Workspace', 'Executive Suite', 'Analytics Lab']
    : (planType === 'residential_hostel'
      ? ['Double Occupancy Unit', 'Study Room', 'Resident Suite', 'Guest Room', 'Recreation Room', 'Lounge']
      : ['Advanced Laboratory', 'Computer Lab', 'Classroom Hall', 'Seminar Theater']);

  const roomTypesSouth = planType === 'commercial_office'
    ? ['Server & IT Hub', 'Team Meeting Room', 'Administrative Office', 'Cafeteria & Lounge']
    : (planType === 'residential_hostel'
      ? ['Double Occupancy Unit', 'Double Occupancy Unit', 'Double Occupancy Unit', 'Warden Office', 'Linen Store', 'Common Room']
      : ['Classroom A', 'Classroom B', 'Department Office', 'Faculty Lounge']);

  // North Row Units
  for (let i = 0; i < numDivisions; i++) {
    const x = -halfW + 1 + i * stepX;
    const roomNum = (floorNumber * 100) + 101 + i;
    const roomType = roomTypesNorth[i % roomTypesNorth.length];
    const roomW = stepX - 0.2;
    const roomD = roomDepth - 0.2;

    rooms.push({
      id: `${floorPrefix}-${roomNum}`,
      name: `${floorPrefix}-${roomNum}`,
      type: roomType,
      x: x + 0.1,
      y: corrHalfDepth + 0.1,
      width: roomW,
      depth: roomD,
      height: H,
      area: parseFloat((roomW * roomD).toFixed(1)),
      elevation: floorNumber * H,
      floorNumber,
      floorId: `F0${floorNumber}`,
      confidence: 0.96 - (i * 0.01),
    });
  }

  // South Row Units
  for (let i = 0; i < numDivisions; i++) {
    const x = -halfW + 1 + i * stepX;
    const roomNum = (floorNumber * 100) + 201 + i;
    const roomType = roomTypesSouth[i % roomTypesSouth.length];
    const roomW = stepX - 0.2;
    const roomD = roomDepth - 0.2;

    rooms.push({
      id: `${floorPrefix}-${roomNum}`,
      name: `${floorPrefix}-${roomNum}`,
      type: roomType,
      x: x + 0.1,
      y: -halfD + 0.1,
      width: roomW,
      depth: roomD,
      height: H,
      area: parseFloat((roomW * roomD).toFixed(1)),
      elevation: floorNumber * H,
      floorNumber,
      floorId: `F0${floorNumber}`,
      confidence: 0.95 - (i * 0.01),
    });
  }

  return rooms;
}

/**
 * AI Door Detection
 */
export function detectDoors(floorNumber = 0, specs = { width: 60, depth: 22, height: 3.6 }, planType = 'academic_standard') {
  const rooms = detectRooms(floorNumber, specs, planType);
  const doors = [];

  rooms.forEach((rm, idx) => {
    // Connect door along corridor boundary
    const isNorth = rm.y > 0;
    const doorX = rm.x + rm.width / 2;
    const doorY = isNorth ? rm.y : rm.y + rm.depth;

    doors.push({
      id: `door_${rm.id}`,
      roomId: rm.id,
      position: { x: parseFloat(doorX.toFixed(2)), y: parseFloat(doorY.toFixed(2)) },
      width: 1.0,
      height: 2.1,
      swingDirection: isNorth ? 'inward_right' : 'inward_left',
      confidence: 0.94,
    });
  });

  return doors;
}

/**
 * AI Window Detection
 */
export function detectWindows(floorNumber = 0, specs = { width: 60, depth: 22, height: 3.6 }, planType = 'academic_standard') {
  const rooms = detectRooms(floorNumber, specs, planType);
  const windows = [];

  rooms.forEach((rm, idx) => {
    const isNorth = rm.y > 0;
    const winX = rm.x + rm.width / 2;
    const winY = isNorth ? rm.y + rm.depth : rm.y;

    windows.push({
      id: `win_${rm.id}`,
      roomId: rm.id,
      position: { x: parseFloat(winX.toFixed(2)), y: parseFloat(winY.toFixed(2)) },
      width: 1.6,
      height: 1.4,
      sillHeight: 0.9,
      wallOrientation: isNorth ? 'North Facade' : 'South Facade',
      confidence: 0.93,
    });
  });

  return windows;
}

/**
 * AI Staircase & Core Detection
 */
export function detectStairs(floorNumber = 0, specs = { width: 60, depth: 22, height: 3.6 }) {
  const W = specs.width || 60;
  const halfW = W / 2;

  return [
    {
      id: `stair_east_f${floorNumber}`,
      name: `Stair Core East (F0${floorNumber})`,
      x: halfW - 7,
      y: -1.4,
      width: 6.5,
      depth: 2.8,
      steps: 18,
      type: 'Dog-legged Concrete Flight',
      confidence: 0.97,
    },
    {
      id: `elevator_west_f${floorNumber}`,
      name: `Lift Core West (F0${floorNumber})`,
      x: -halfW + 1.2,
      y: -1.4,
      width: 4.8,
      depth: 2.8,
      type: 'Traction Passenger Elevator',
      confidence: 0.95,
    }
  ];
}

/**
 * Complete AI Floor Plan Analysis Pipeline (Simulates Multi-Stage CV Model)
 * @param {Object} params
 * @param {number} params.floorNumber
 * @param {string|File} params.floorPlan
 * @param {string} params.presetId
 * @param {Object} params.buildingSpecs
 * @param {Function} [params.onProgress]
 */
export async function analyzeFloorPlan({
  floorNumber = 0,
  floorPlan = null,
  presetId = 'academic_standard',
  buildingSpecs = { width: 60, depth: 22, height: 3.6 },
  onProgress = () => {}
}) {
  const stages = [
    { step: 'UPLOAD', label: 'Uploading floor plan raster & metadata...', progress: 18 },
    { step: 'PREPROCESS', label: 'Computer Vision preprocessing & noise filtration...', progress: 38 },
    { step: 'SEGMENTATION', label: 'Neural network deep boundary segmentation...', progress: 62 },
    { step: 'FEATURE_EXTRACTION', label: 'Extracting walls, rooms, doors, and apertures...', progress: 84 },
    { step: '3D_VECTOR_MAPPING', label: 'Synthesizing parametric 3D cadastral geometry...', progress: 100 },
  ];

  for (const stage of stages) {
    onProgress(stage);
    await new Promise((r) => setTimeout(r, 260));
  }

  const walls = detectWalls(floorNumber, buildingSpecs, presetId);
  const rooms = detectRooms(floorNumber, buildingSpecs, presetId);
  const doors = detectDoors(floorNumber, buildingSpecs, presetId);
  const windows = detectWindows(floorNumber, buildingSpecs, presetId);
  const stairs = detectStairs(floorNumber, buildingSpecs);

  const totalArea = rooms.reduce((sum, r) => sum + r.area, 0);
  const averageConfidence = 94.6 + (Math.random() * 2.2 - 1.1);

  return {
    floorNumber,
    floorName: floorNumber === 0 ? 'Ground Floor' : `Floor 0${floorNumber}`,
    elevation: floorNumber * buildingSpecs.height,
    confidence: parseFloat(averageConfidence.toFixed(1)),
    detectedElements: {
      wallsCount: walls.length,
      roomsCount: rooms.length,
      doorsCount: doors.length,
      windowsCount: windows.length,
      stairsCount: stairs.length,
    },
    geometry: {
      walls,
      rooms,
      doors,
      windows,
      stairs,
      totalArea: parseFloat(totalArea.toFixed(1)),
    },
    analyzedAt: new Date().toISOString(),
    aiModelVersion: 'DeepCadastre-CV-v3.4',
  };
}

/**
 * Combine Multi-Floor Analysis into a Unified Building Structure
 */
export function generateMultiFloorBuildingGeometry(buildingMetadata, floorAnalysisMap) {
  const numFloors = parseInt(buildingMetadata.numFloors || 3, 10);
  const floorHeight = parseFloat(buildingMetadata.floorHeight || 3.6);
  const width = parseFloat(buildingMetadata.buildingWidth || 60);
  const depth = parseFloat(buildingMetadata.buildingLength || 22);

  const floors = [];
  let totalBuiltUpArea = 0;

  for (let i = 0; i < numFloors; i++) {
    const analysis = floorAnalysisMap[i];
    const floorElevation = i * floorHeight;

    if (analysis && analysis.geometry) {
      floors.push({
        id: `F0${i}`,
        floorNumber: i,
        name: i === 0 ? 'Ground Floor' : `Floor 0${i}`,
        shortName: i === 0 ? 'GF' : `F${i}`,
        elevation: floorElevation,
        height: floorHeight,
        confidence: analysis.confidence || 94.5,
        walls: analysis.geometry.walls,
        rooms: analysis.geometry.rooms,
        doors: analysis.geometry.doors,
        windows: analysis.geometry.windows,
        stairs: analysis.geometry.stairs,
        area: analysis.geometry.totalArea,
      });
      totalBuiltUpArea += analysis.geometry.totalArea;
    } else {
      // Auto-synthesize standard floor geometry if not individually scanned
      const walls = detectWalls(i, { width, depth, height: floorHeight }, 'academic_standard');
      const rooms = detectRooms(i, { width, depth, height: floorHeight }, 'academic_standard');
      const doors = detectDoors(i, { width, depth, height: floorHeight }, 'academic_standard');
      const windows = detectWindows(i, { width, depth, height: floorHeight }, 'academic_standard');
      const stairs = detectStairs(i, { width, depth, height: floorHeight });
      const area = rooms.reduce((s, r) => s + r.area, 0);

      floors.push({
        id: `F0${i}`,
        floorNumber: i,
        name: i === 0 ? 'Ground Floor' : `Floor 0${i}`,
        shortName: i === 0 ? 'GF' : `F${i}`,
        elevation: floorElevation,
        height: floorHeight,
        confidence: 93.8,
        walls,
        rooms,
        doors,
        windows,
        stairs,
        area: parseFloat(area.toFixed(1)),
      });
      totalBuiltUpArea += area;
    }
  }

  return {
    buildingId: buildingMetadata.id || `bld-${Date.now()}`,
    ulpin: buildingMetadata.ulpin || '29-01-001-000199',
    surveyNumber: buildingMetadata.surveyNumber || '142/2A',
    name: buildingMetadata.name || 'AI Surveyed Block',
    propertyType: buildingMetadata.propertyType || 'Academic & Research Facility',
    constructionType: buildingMetadata.constructionType || 'RCC Framed Structure',
    footprintWidthM: width,
    footprintDepthM: depth,
    floorHeightM: floorHeight,
    buildingHeightM: numFloors * floorHeight,
    totalFloors: numFloors,
    totalBuiltUpArea: parseFloat(totalBuiltUpArea.toFixed(1)),
    gpsCoordinates: buildingMetadata.gpsCoordinates || {
      latitude: 10.75782,
      longitude: 78.65215,
    },
    floors,
    createdAt: new Date().toISOString(),
  };
}

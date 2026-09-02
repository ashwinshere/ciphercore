// ============================================================================
// VERTEX — src/data/buildingData.js
//
// SINGLE SOURCE OF TRUTH for all building / floor / room geometry.
// Nothing in the React components or Three.js scene hardcodes room geometry —
// everything is generated procedurally from this file.
//
// DATA STATUS: PROTOTYPE SPATIAL DATA
// Exact architectural floor plans of RV Block, Saranathan College of
// Engineering are not publicly verified. Room numbers marked
// `officialReference: true` are drawn from publicly referenced room
// numbering (e.g. departmental notices / timetables) for RV Block.
// Their exact coordinates, dimensions and shapes are still an editable
// PROTOTYPE approximation, not a surveyed architectural drawing.
//
// To replace with real data later: keep this exact shape (building / floors
// / rooms) and swap the values for verified CAD / BIM / GIS / ULPIN survey
// data. See README.md → "Replacing prototype data with real data".
// ============================================================================

// Shared floor plate layout — every floor reuses this slot grid so that
// rooms stack vertically and `verticalAnalysis.js` can detect real overlaps.
// Each slot = { x, y, width, depth } footprint (metres), corner-anchored.
const ROOM_WIDTH = 8;
const ROOM_DEPTH = 6;
const ROOM_HEIGHT = 3.5;

const NORTH_XS = [0, 9, 18, 27, 36];
const SOUTH_XS = [0, 9, 18, 27];
const NORTH_Y = 3;              // north rooms sit north of the corridor
const SOUTH_Y = -3 - ROOM_DEPTH; // south rooms sit south of the corridor

const SLOTS = [
  ...NORTH_XS.map((x) => ({ x, y: NORTH_Y, side: 'north' })),
  ...SOUTH_XS.map((x) => ({ x, y: SOUTH_Y, side: 'south' })),
];

// Building footprint boundary, used by conflict detection ("out of bounds").
export const BUILDING_BOUNDARY = {
  xMin: -3,
  xMax: 55,
  yMin: -12,
  yMax: 12,
};

// Shared corridor + staircase/core geometry, identical on every floor.
export const CORRIDOR = { x: -2, y: -3, width: 53, depth: 6 };
export const STAIRCASE = { x: 43, y: -3, width: 8, depth: 6 };

function makeRoom({ number, name, type, slotIndex, officialReference }) {
  const slot = SLOTS[slotIndex];
  return {
    number,
    name,
    type,
    x: slot.x,
    y: slot.y,
    width: ROOM_WIDTH,
    depth: ROOM_DEPTH,
    height: ROOM_HEIGHT,
    side: slot.side,
    officialReference,
    dataConfidence: 'Prototype',
  };
}

// ---------------------------------------------------------------------------
// Floor 00 — Ground Floor (no official RV room refs available -> prototype)
// ---------------------------------------------------------------------------
const groundRooms = [
  { number: 'G01', name: 'RV G01', type: 'Reception', slotIndex: 0 },
  { number: 'G02', name: 'RV G02', type: 'Administrative Office', slotIndex: 1 },
  { number: 'G03', name: 'RV G03', type: 'Store Room', slotIndex: 2 },
  { number: 'G04', name: 'RV G04', type: 'Seminar Hall', slotIndex: 3 },
  { number: 'G05', name: 'RV G05', type: 'Faculty Room', slotIndex: 4 },
  { number: 'G06', name: 'RV G06', type: 'Common Laboratory', slotIndex: 5 },
  { number: 'G07', name: 'RV G07', type: 'Tutorial Room', slotIndex: 6 },
  { number: 'G08', name: 'RV G08', type: 'Waiting Area', slotIndex: 7 },
  { number: 'G09', name: 'RV G09', type: 'Records Room', slotIndex: 8 },
].map((r) => makeRoom({ ...r, officialReference: false }));

// ---------------------------------------------------------------------------
// Floor 01 — First Floor (prototype)
// ---------------------------------------------------------------------------
const firstRooms = [
  { number: '101', name: 'RV 101', type: 'Classroom', slotIndex: 0 },
  { number: '102', name: 'RV 102', type: 'Classroom', slotIndex: 1 },
  { number: '103', name: 'RV 103', type: 'Tutorial Room', slotIndex: 2 },
  { number: '104', name: 'RV 104', type: 'Classroom', slotIndex: 3 },
  { number: '105', name: 'RV 105', type: 'Common Laboratory', slotIndex: 4 },
  { number: '106', name: 'RV 106', type: 'Classroom', slotIndex: 5 },
  { number: '107', name: 'RV 107', type: 'Faculty Room', slotIndex: 6 },
  { number: '108', name: 'RV 108', type: 'Tutorial Room', slotIndex: 7 },
  { number: '109', name: 'RV 109', type: 'Classroom', slotIndex: 8 },
].map((r) => makeRoom({ ...r, officialReference: false }));

// ---------------------------------------------------------------------------
// Floor 02 — Second Floor (prototype)
// ---------------------------------------------------------------------------
const secondRooms = [
  { number: '201', name: 'RV 201', type: 'Classroom', slotIndex: 0 },
  { number: '202', name: 'RV 202', type: 'Classroom', slotIndex: 1 },
  { number: '203', name: 'RV 203', type: 'Seminar Hall', slotIndex: 2 },
  { number: '204', name: 'RV 204', type: 'Classroom', slotIndex: 3 },
  { number: '205', name: 'RV 205', type: 'Common Laboratory', slotIndex: 4 },
  { number: '206', name: 'RV 206', type: 'Classroom', slotIndex: 5 },
  { number: '207', name: 'RV 207', type: 'Tutorial Room', slotIndex: 6 },
  { number: '208', name: 'RV 208', type: 'Faculty Room', slotIndex: 7 },
  { number: '209', name: 'RV 209', type: 'Classroom', slotIndex: 8 },
].map((r) => makeRoom({ ...r, officialReference: false }));

// ---------------------------------------------------------------------------
// Floor 03 — Third Floor. RV 302 / RV 303 are publicly referenced room
// numbers for RV Block; remaining rooms are editable prototype fills.
// ---------------------------------------------------------------------------
const thirdRooms = [
  { number: '301', name: 'RV 301', type: 'Classroom', slotIndex: 0, officialReference: false },
  { number: '302', name: 'RV 302', type: 'Classroom', slotIndex: 1, officialReference: true },
  { number: '303', name: 'RV 303', type: 'Classroom', slotIndex: 2, officialReference: true },
  { number: '304', name: 'RV 304', type: 'Tutorial Room', slotIndex: 3, officialReference: false },
  { number: '305', name: 'RV 305', type: 'Common Laboratory', slotIndex: 4, officialReference: false },
  { number: '306', name: 'RV 306', type: 'Classroom', slotIndex: 5, officialReference: false },
  { number: '307', name: 'RV 307', type: 'Faculty Room', slotIndex: 6, officialReference: false },
  { number: '308', name: 'RV 308', type: 'Tutorial Room', slotIndex: 7, officialReference: false },
  { number: '309', name: 'RV 309', type: 'Classroom', slotIndex: 8, officialReference: false },
].map((r) => makeRoom(r));

// ---------------------------------------------------------------------------
// Floor 04 — Fourth Floor. All nine room numbers below are publicly
// referenced RV Block room numbers. Their exact wall geometry is still
// PROTOTYPE — only the room numbering is drawn from public reference.
// ---------------------------------------------------------------------------
const fourthRooms = [
  { number: '403', name: 'RV 403', type: 'Classroom', slotIndex: 0 },
  { number: '404', name: 'RV 404', type: 'Classroom', slotIndex: 1 },
  { number: '405', name: 'RV 405', type: 'Seminar Hall', slotIndex: 2 },
  { number: '406', name: 'RV 406', type: 'Classroom', slotIndex: 3 },
  { number: '407', name: 'RV 407', type: 'Common Laboratory', slotIndex: 4 },
  { number: '409', name: 'RV 409', type: 'Classroom', slotIndex: 5 },
  { number: '410', name: 'RV 410', type: 'Tutorial Room', slotIndex: 6 },
  { number: '412', name: 'RV 412', type: 'Classroom', slotIndex: 7 },
  { number: '413', name: 'RV 413', type: 'Faculty Room', slotIndex: 8 },
].map((r) => makeRoom({ ...r, officialReference: true }));

export const buildingData = {
  building: {
    name: 'RV Block',
    institution: 'Saranathan College of Engineering',
    location: 'Tiruchirappalli, Tamil Nadu',
    state: 'Tamil Nadu',
    district: 'Tiruchirappalli',
    institutionCode: 'SCE',
    buildingCode: 'RV',
    status: 'Prototype Spatial Data',
  },
  floors: [
    { id: 'F00', numId: '00', name: 'Ground Floor', shortName: 'Ground', elevation: 0, rooms: groundRooms },
    { id: 'F01', numId: '01', name: 'First Floor', shortName: 'Floor 1', elevation: 4, rooms: firstRooms },
    { id: 'F02', numId: '02', name: 'Second Floor', shortName: 'Floor 2', elevation: 8, rooms: secondRooms },
    { id: 'F03', numId: '03', name: 'Third Floor', shortName: 'Floor 3', elevation: 12, rooms: thirdRooms },
    { id: 'F04', numId: '04', name: 'Fourth Floor', shortName: 'Floor 4', elevation: 16, rooms: fourthRooms },
  ],
};

// Sample 4D timeline events, keyed by room number. Applies to any room that
// doesn't have its own override — used by the Timeline feature.
export const DEFAULT_TIMELINE_EVENTS = [
  { year: 2024, title: 'Initial Mapping', status: 'Mapped', description: 'Room footprint captured from public reference data and added to the prototype spatial index.' },
  { year: 2025, title: 'Room Boundary Updated', status: 'Updated', description: 'Prototype boundary coordinates refined for corridor alignment.' },
  { year: 2026, title: 'Vertical Mapping Verified', status: 'Verified', description: 'Vertical stack relationship checked against adjoining floors.' },
];

export const TIMELINE_YEARS = [2024, 2025, 2026];

export default buildingData;

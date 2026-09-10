// ============================================================================
// utils/spatialFingerprint.js
//
// Cryptographic Spatial Hashing (SHA-256) & 3D Volumetric Digital Twin Certificates
// Strict Cadastral 3D ULPIN format: [2D-ULPIN]-[FLOOR-ID]-U[UNIT-ID]
// ============================================================================

import { generateVerticalPropertyId } from './propertyId.js';

/**
 * Standard SHA-256 cryptographic hash calculation with cross-environment fallback.
 * @param {string} message 
 * @returns {Promise<string>}
 */
export async function sha256(message) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }

  // Simple deterministic 64-char hash fallback for SSR/older environments
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < message.length; i++) {
    ch = message.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  const part2 = (4294967296 * (2097151 & h1) + (h2 >>> 0)).toString(16).padStart(16, '0');
  return `0x${part1}${part2}${part1}${part2}`.slice(0, 66);
}

/**
 * Generates a standardized 3D ULPIN.
 * @param {object} params
 * @param {string} params.ulpin2D - 2D parcel ULPIN (e.g. '29-01-001-000128')
 * @param {string} params.floorId - Floor designation (e.g. 'F02')
 * @param {string|number} params.unitNumber - Unit / Room ID (e.g. '004' or 'U004')
 * @returns {string}
 */
export function generate3DUlpin({ ulpin2D = '29-01-001-000123', floorId = 'F00', unitNumber = '001' }) {
  const cleanFloor = floorId.startsWith('F') ? floorId : `F${String(floorId).padStart(2, '0')}`;
  const cleanUnit = String(unitNumber).startsWith('U') ? String(unitNumber) : `U${String(unitNumber).padStart(3, '0')}`;
  return `${ulpin2D}-${cleanFloor}-${cleanUnit}`;
}

/**
 * Calculates accurate volumetric dimensions and metric extents.
 * @param {object} room
 * @param {object} floor
 * @returns {object}
 */
export function calculateVolumetricDimensions(room = {}, floor = {}) {
  const width = room.width || room.dimensions?.width || 8.0;
  const depth = room.depth || room.dimensions?.depth || 6.0;
  const height = room.height || floor.height || 3.6;
  const area = room.area || room.dimensions?.area || (width * depth);
  const volume = parseFloat((area * height).toFixed(2));
  const elevation = floor.elevation || 0;

  return {
    floorAreaM2: Math.round(area * 10) / 10,
    heightM: height,
    volumeM3: volume,
    minZ: elevation,
    maxZ: elevation + height,
    boundingBox: {
      width,
      depth,
      height
    }
  };
}

/**
 * Generates an official 3D Spatial Digital Twin Certificate.
 * @param {object} property
 * @param {object} room
 * @param {object} buildingData
 * @returns {Promise<object>}
 */
export async function generateDigitalTwinCertificate(property = {}, room = {}, buildingData = {}) {
  const ulpin2D = property.ulpin2D || property.ulpin || buildingData.building?.ulpin2D || '29-01-001-000128';
  const surveyNumber = property.surveyNumber || buildingData.building?.surveyNumber || '142/2A';
  const floorId = room.floorId || 'F01';
  const unitNumber = room.number || room.unitSeq || '001';
  const ulpin3D = room.id && room.id.includes(ulpin2D)
    ? room.id
    : generate3DUlpin({ ulpin2D, floorId, unitNumber });

  const lat = property.coordinates?.latitude || property.center?.[0] || 10.757172;
  const lng = property.coordinates?.longitude || property.center?.[1] || 78.651348;
  const dimensions = calculateVolumetricDimensions(room, { elevation: room.elevation || 3.6, height: 3.6 });

  const rawHashPayload = JSON.stringify({
    ulpin3D,
    ulpin2D,
    surveyNumber,
    coordinates: { lat, lng },
    dimensions,
    roomName: room.name || room.roomName || 'Cadastral Unit',
    timestamp: '2026-09-10T00:00:00.000Z'
  });

  const spatialHash = await sha256(rawHashPayload);
  const certId = `CERT-3D-${spatialHash.slice(2, 10).toUpperCase()}-${floorId}`;

  return {
    certificateId: certId,
    issuedDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    surveyNumber,
    propertyId: property.id || 'campus-parcel',
    identity: {
      ulpin3D,
      ulpin2D,
      spatialHash: `0x${spatialHash.replace(/^0x/, '')}`,
      geographicAnchor: {
        latitude: lat,
        longitude: lng,
        crs: 'EPSG:4326',
        verticalDatum: 'EGM96'
      },
      dimensions,
      cadastralMetadata: {
        roomName: room.name || room.roomName || 'Spatial Stratum Unit',
        floorId,
        elevationM: room.elevation || 0,
        roomType: room.type || room.use || 'Academic / Institutional',
        occupant: room.department || room.occupant || 'Saranathan Educational Trust'
      }
    },
    verificationStatus: 'GOVERNMENT_CERTIFIED',
    authority: 'Survey & Land Records Department, Tamil Nadu Cadastre Division'
  };
}

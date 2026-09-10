/**
 * Cadastral Survey Store & Lifecycle State Manager
 * Persists building surveys in localStorage with realistic government state transitions.
 */

import { generateMultiFloorBuildingGeometry } from './aiFloorPlanService.js';

const STORAGE_KEY = 'ciphercore_building_surveys';

export const SURVEY_STATUS = {
  DRAFT: 'DRAFT',
  AI_PROCESSING: 'AI_PROCESSING',
  SURVEYOR_REVIEW: 'SURVEYOR_REVIEW',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Initial Seed Surveys
const SEED_SURVEYS = [
  {
    id: 'SURV-2025-001',
    ulpin: '29-01-001-000109',
    surveyNumber: '158/3B',
    propertyAddress: 'Saranathan College Campus, Panjappur, Tiruchirappalli, Tamil Nadu 620012',
    name: 'Nanotechnology Research Wing',
    propertyType: 'Academic & Research',
    constructionType: 'RCC Framed Multi-Tier',
    surveyorName: 'R. Kumar (SURV-TN-409)',
    surveyorId: 'surveyor',
    numFloors: 3,
    floorHeight: 3.8,
    buildingWidth: 54,
    buildingLength: 22,
    totalBuiltUpArea: 3564,
    gpsCoordinates: {
      latitude: 10.758412,
      longitude: 78.652894,
    },
    status: SURVEY_STATUS.PENDING_VERIFICATION,
    aiConfidence: 95.2,
    submittedAt: '2025-02-28T09:45:00.000Z',
    updatedAt: '2025-02-28T10:15:00.000Z',
    floorAnalysis: {},
    buildingGeometry: null,
  },
  {
    id: 'SURV-2025-002',
    ulpin: '29-01-001-000110',
    surveyNumber: '159/1A',
    propertyAddress: 'West Campus Zone, Saranathan College, Tiruchirappalli',
    name: 'Indoor Sports & Fitness Complex',
    propertyType: 'Sports & Recreational',
    constructionType: 'Pre-Engineered Steel & RCC',
    surveyorName: 'R. Kumar (SURV-TN-409)',
    surveyorId: 'surveyor',
    numFloors: 2,
    floorHeight: 4.5,
    buildingWidth: 48,
    buildingLength: 28,
    totalBuiltUpArea: 2688,
    gpsCoordinates: {
      latitude: 10.756201,
      longitude: 78.650421,
    },
    status: SURVEY_STATUS.SURVEYOR_REVIEW,
    aiConfidence: 93.8,
    submittedAt: null,
    updatedAt: '2025-03-01T14:20:00.000Z',
    floorAnalysis: {},
    buildingGeometry: null,
  },
  {
    id: 'SURV-2025-003',
    ulpin: '29-01-001-000111',
    surveyNumber: '160/4C',
    propertyAddress: 'Central Academic Quadrangle, Saranathan Campus',
    name: 'ECE Embedded IoT Innovation Wing',
    propertyType: 'Academic Block',
    constructionType: 'RCC Framed Structure',
    surveyorName: 'K. Senthil Nathan (SURV-TN-312)',
    surveyorId: 'surveyor',
    numFloors: 4,
    floorHeight: 3.6,
    buildingWidth: 62,
    buildingLength: 24,
    totalBuiltUpArea: 5952,
    gpsCoordinates: {
      latitude: 10.757650,
      longitude: 78.651890,
    },
    status: SURVEY_STATUS.APPROVED,
    verifiedBy: 'T. Anand, IAS (GOV-OFFICER-01)',
    verifiedAt: '2025-02-25T16:30:00.000Z',
    aiConfidence: 96.4,
    submittedAt: '2025-02-24T11:00:00.000Z',
    updatedAt: '2025-02-25T16:30:00.000Z',
    floorAnalysis: {},
    buildingGeometry: null,
  }
];

// Initialize default geometry on seed records
SEED_SURVEYS.forEach((s) => {
  if (!s.buildingGeometry) {
    s.buildingGeometry = generateMultiFloorBuildingGeometry(s, {});
  }
});

/**
 * Fetch all surveys from storage
 */
export function getSurveys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SURVEYS));
      return SEED_SURVEYS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading surveys from localStorage', err);
    return SEED_SURVEYS;
  }
}

/**
 * Save or update survey
 */
export function saveSurvey(survey) {
  const surveys = getSurveys();
  const existingIdx = surveys.findIndex((s) => s.id === survey.id);

  const payload = {
    ...survey,
    updatedAt: new Date().toISOString(),
  };

  if (!payload.buildingGeometry && payload.numFloors) {
    payload.buildingGeometry = generateMultiFloorBuildingGeometry(payload, payload.floorAnalysis || {});
  }

  if (existingIdx !== -1) {
    surveys[existingIdx] = payload;
  } else {
    surveys.unshift(payload);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys));
  } catch (e) {
    console.error('Failed to write survey to localStorage', e);
  }

  return payload;
}

/**
 * Get survey by ID
 */
export function getSurveyById(id) {
  const surveys = getSurveys();
  return surveys.find((s) => s.id === id) || null;
}

/**
 * Update survey status (Surveyor Submission / Officer Verification)
 */
export function updateSurveyStatus(id, newStatus, extraData = {}) {
  const surveys = getSurveys();
  const target = surveys.find((s) => s.id === id);
  if (!target) return null;

  target.status = newStatus;
  target.updatedAt = new Date().toISOString();

  if (newStatus === SURVEY_STATUS.PENDING_VERIFICATION) {
    target.submittedAt = new Date().toISOString();
  }

  if (newStatus === SURVEY_STATUS.APPROVED) {
    target.verifiedAt = new Date().toISOString();
  }

  Object.assign(target, extraData);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys));
  } catch (e) {
    console.error('Failed to save survey status update', e);
  }

  return target;
}

/**
 * Delete a draft survey
 */
export function deleteSurvey(id) {
  const surveys = getSurveys().filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(surveys));
  } catch (e) {
    console.error('Failed to delete survey', e);
  }
  return surveys;
}

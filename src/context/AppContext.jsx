import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import properties from '../data/properties.js';
import { generateBuildingData, TIMELINE_YEARS } from '../data/buildingData.js';
import { flattenRooms } from '../utils/propertyId.js';
import { detectAllConflicts } from '../utils/conflictDetection.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewMode, setViewMode] = useState('map'); // 'map' or '3d'
  
  // Default selected property to RV Block (properties[0]) so it's active from start
  const [selectedProperty, setSelectedProperty] = useState(properties[0]);
  
  const buildingData = useMemo(() => {
    return generateBuildingData(selectedProperty || properties[0]);
  }, [selectedProperty]);

  const allRooms = useMemo(() => flattenRooms(buildingData), [buildingData]);
  const conflicts = useMemo(() => detectAllConflicts(allRooms), [allRooms]);

  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  const [explodedView, setExplodedView] = useState(false);
  const [isolatedFloorId, setIsolatedFloorId] = useState(null);
  const [visibleFloorIds, setVisibleFloorIds] = useState(() => buildingData.floors.map((f) => f.id));
  
  React.useEffect(() => {
    setVisibleFloorIds(buildingData.floors.map((f) => f.id));
  }, [buildingData]);

  const [timelineYear, setTimelineYear] = useState(TIMELINE_YEARS[TIMELINE_YEARS.length - 1]);
  const [focusRequest, setFocusRequest] = useState(0); // increments to trigger camera focus
  const [resetRequest, setResetRequest] = useState(0); // increments to trigger camera reset
  const [showWelcome, setShowWelcome] = useState(false);

  // Select property on map and directly open 3D detail view
  const selectProperty = useCallback((property) => {
    if (property) setSelectedProperty(property);
    setViewMode('3d');
    setSelectedRoomId(null);
    setIsolatedFloorId(null);
    setExplodedView(false);
  }, []);

  const selectPropertyOnMap = useCallback((property) => {
    if (property) setSelectedProperty(property);
    setSelectedRoomId(null);
    setIsolatedFloorId(null);
    setExplodedView(false);
  }, []);

  const enter3DView = useCallback((property) => {
    selectProperty(property);
  }, [selectProperty]);

  // Return back to 2D map view keeping selected property retained
  const backToMap = useCallback(() => {
    setViewMode('map');
    setCurrentPage('dashboard');
  }, []);

  const resetCamera = useCallback(() => {
    setSelectedRoomId(null);
    setResetRequest((n) => n + 1);
  }, []);

  const selectedRoom = useMemo(
    () => allRooms.find((r) => r.id === selectedRoomId) || null,
    [allRooms, selectedRoomId]
  );

  const selectRoom = useCallback((roomId, { focus = true, navigate = false } = {}) => {
    setSelectedRoomId(roomId);
    if (focus) setFocusRequest((n) => n + 1);
    if (navigate) setCurrentPage('explorer');
  }, []);

  const toggleFloorVisibility = useCallback((floorId) => {
    setVisibleFloorIds((prev) =>
      prev.includes(floorId) ? prev.filter((id) => id !== floorId) : [...prev, floorId]
    );
  }, []);

  const isolateFloor = useCallback((floorId) => {
    setIsolatedFloorId((prev) => (prev === floorId ? null : floorId));
  }, []);

  const value = {
    properties,
    buildingData,
    allRooms,
    conflicts,
    currentPage,
    setCurrentPage,
    selectedRoomId,
    selectedRoom,
    selectRoom,
    selectedProperty,
    setSelectedProperty,
    selectPropertyOnMap,
    enter3DView,
    backToMap,
    selectProperty,
    viewMode,
    setViewMode,
    hoveredRoomId,
    setHoveredRoomId,
    explodedView,
    setExplodedView,
    isolatedFloorId,
    isolateFloor,
    visibleFloorIds,
    toggleFloorVisibility,
    timelineYear,
    setTimelineYear,
    focusRequest,
    resetRequest,
    resetCamera,
    showWelcome,
    setShowWelcome,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

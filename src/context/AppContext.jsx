import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { buildingData, TIMELINE_YEARS } from '../data/buildingData.js';
import { flattenRooms } from '../utils/propertyId.js';
import { detectAllConflicts } from '../utils/conflictDetection.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const allRooms = useMemo(() => flattenRooms(buildingData), []);
  const conflicts = useMemo(() => detectAllConflicts(allRooms), [allRooms]);

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  const [explodedView, setExplodedView] = useState(false);
  const [isolatedFloorId, setIsolatedFloorId] = useState(null); // null = show all floors
  const [visibleFloorIds, setVisibleFloorIds] = useState(() => buildingData.floors.map((f) => f.id));
  const [timelineYear, setTimelineYear] = useState(TIMELINE_YEARS[TIMELINE_YEARS.length - 1]);
  const [focusRequest, setFocusRequest] = useState(0); // increments to trigger camera focus
  const [resetRequest, setResetRequest] = useState(0); // increments to trigger camera reset
  const [showWelcome, setShowWelcome] = useState(true);

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
    buildingData,
    allRooms,
    conflicts,
    currentPage,
    setCurrentPage,
    selectedRoomId,
    selectedRoom,
    selectRoom,
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

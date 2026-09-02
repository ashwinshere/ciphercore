import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import BuildingFloor from './BuildingFloor.jsx';
import CameraController from './CameraController.jsx';
import { useApp } from '../context/AppContext.jsx';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';
import { roomCenter } from '../utils/geometry.js';

const EXPLODE_GAP = 6; // extra vertical spacing per floor when exploded

export default function BuildingScene({ isolateOverride, height = '100%', showStackOnly = false }) {
  const {
    buildingData,
    allRooms,
    selectedRoom,
    selectedRoomId,
    hoveredRoomId,
    setHoveredRoomId,
    selectRoom,
    explodedView,
    isolatedFloorId,
    visibleFloorIds,
    focusRequest,
    resetRequest,
  } = useApp();

  const activeIsolatedFloor = isolateOverride !== undefined ? isolateOverride : isolatedFloorId;

  const stackMemberIds = useMemo(() => {
    if (!showStackOnly || !selectedRoom) return new Set();
    const { stack } = detectVerticalStack(selectedRoom, allRooms);
    return new Set(stack.map((r) => r.id));
  }, [showStackOnly, selectedRoom, allRooms]);

  const focusTarget = useMemo(() => {
    if (!selectedRoom) return null;
    const center = roomCenter(selectedRoom);
    return { x: center.x, y: selectedRoom.elevation + selectedRoom.height / 2, z: center.y };
  }, [selectedRoom]);

  return (
    <div style={{ height }} className="relative w-full rounded-xl overflow-hidden border border-vertex-border bg-[#040910]">
      <Canvas shadows camera={{ fov: 42, near: 0.1, far: 500 }}>
        <color attach="background" args={['#040910']} />
        <fog attach="fog" args={['#040910', 60, 160]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[40, 60, 20]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-20, 20, -20]} intensity={0.3} color="#22d3ee" />

        <Grid
          position={[24, -0.15, 0]}
          args={[120, 120]}
          cellSize={4}
          cellThickness={0.5}
          cellColor="#123049"
          sectionSize={20}
          sectionThickness={1}
          sectionColor="#1e4a6b"
          fadeDistance={140}
          infiniteGrid
        />

        {buildingData.floors.map((floor, idx) => {
          const isVisible = visibleFloorIds.includes(floor.id);
          const isIsolated = activeIsolatedFloor && activeIsolatedFloor !== floor.id;
          const explodedOffset = explodedView ? idx * EXPLODE_GAP : 0;
          return (
            <BuildingFloor
              key={floor.id}
              floor={floor}
              explodedOffset={explodedOffset}
              isDimmed={isIsolated}
              isHiddenFully={!isVisible}
              selectedRoomId={selectedRoomId}
              hoveredRoomId={hoveredRoomId}
              stackMemberIds={showStackOnly ? stackMemberIds : null}
              stackModeActive={showStackOnly && !!selectedRoom}
              onSelectRoom={(id) => selectRoom(id, { focus: true })}
              onHoverRoom={setHoveredRoomId}
              onUnhoverRoom={() => setHoveredRoomId(null)}
            />
          );
        })}

        <CameraController focusTarget={focusTarget} focusRequest={focusRequest} resetRequest={resetRequest} />
      </Canvas>

      <div className="absolute bottom-3 left-3 glass rounded-lg px-3 py-1.5 text-[11px] text-slate-300 pointer-events-none">
        Drag to orbit · Scroll to zoom · Click a room to select
      </div>
    </div>
  );
}

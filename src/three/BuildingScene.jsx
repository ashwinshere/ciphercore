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
    <div style={{ height }} className="relative w-full rounded-xl overflow-hidden border border-cipher-border bg-[#EBF1F6] shadow-subtle">
      <Canvas shadows camera={{ fov: 40, near: 0.1, far: 500, position: [55, 34, 55] }}>
        <color attach="background" args={['#EEF3F8']} />
        <fog attach="fog" args={['#EEF3F8', 80, 220]} />
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[45, 70, 30]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-30, 40, -30]} intensity={0.4} color="#94A3B8" />

        <Grid
          position={[24, -0.15, 0]}
          args={[140, 140]}
          cellSize={4}
          cellThickness={0.6}
          cellColor="#CBD5E1"
          sectionSize={20}
          sectionThickness={1.2}
          sectionColor="#94A3B8"
          fadeDistance={160}
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

      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-cipher-border rounded-md px-3 py-1.5 text-[11px] font-medium text-cipher-muted shadow-subtle pointer-events-none flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cipher-govblue" />
        <span>Left Click: Orbit · Right Click: Pan · Scroll: Zoom · Click Room: Inspect</span>
      </div>
    </div>
  );
}

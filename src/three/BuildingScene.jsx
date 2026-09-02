import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import BuildingFloor from './BuildingFloor.jsx';
import CameraController from './CameraController.jsx';
import { useApp } from '../context/AppContext.jsx';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';
import { roomCenter } from '../utils/geometry.js';

const EXPLODE_GAP = 7; // spacing per floor when exploded

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
  const building = buildingData.building;

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

  const width = building.footprintWidthM || 60;
  const depth = building.footprintDepthM || 20;

  return (
    <div style={{ height }} className="relative w-full rounded-xl overflow-hidden border border-cipher-border bg-[#F1F5F9] shadow-subtle">
      <Canvas shadows camera={{ fov: 38, near: 0.1, far: 600, position: [60, 40, 60] }}>
        <color attach="background" args={['#F1F5F9']} />
        <fog attach="fog" args={['#F1F5F9', 90, 280]} />
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[60, 80, 40]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-40, 50, -40]} intensity={0.4} color="#94A3B8" />

        {/* Clean Minimalist Cadastral Ground Grid */}
        <Grid
          position={[0, -0.2, 0]}
          args={[Math.max(width * 2.5, 120), Math.max(depth * 2.5, 120)]}
          cellSize={4}
          cellThickness={0.6}
          cellColor="#CBD5E1"
          sectionSize={20}
          sectionThickness={1.2}
          sectionColor="#94A3B8"
          fadeDistance={180}
          infiniteGrid
        />

        {/* Building Group */}
        <group>
          {buildingData.floors.map((floor, idx) => {
            const isVisible = visibleFloorIds.includes(floor.id);
            const isIsolated = activeIsolatedFloor && activeIsolatedFloor !== floor.id;
            const explodedOffset = explodedView ? idx * EXPLODE_GAP : 0;
            return (
              <BuildingFloor
                key={floor.id}
                floor={floor}
                building={building}
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
        </group>

        <CameraController
          building={building}
          focusTarget={focusTarget}
          focusRequest={focusRequest}
          resetRequest={resetRequest}
        />
      </Canvas>

      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-cipher-border rounded-md px-3 py-1.5 text-[11px] font-medium text-cipher-navy shadow-subtle pointer-events-none flex items-center gap-2 z-10">
        <span className="w-2 h-2 rounded-full bg-cipher-govblue animate-pulse" />
        <span>Left Click: Orbit · Right Click: Pan · Scroll: Zoom · Click Unit: Inspect 3D ULPIN</span>
      </div>
    </div>
  );
}

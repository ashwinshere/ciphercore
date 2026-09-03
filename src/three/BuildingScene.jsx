import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import BuildingFloor from './BuildingFloor.jsx';
import CameraController from './CameraController.jsx';
import { useApp } from '../context/AppContext.jsx';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';
import { roomCenter } from '../utils/geometry.js';

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
    explodeDistance = 7,
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
    <div style={{ height }} className="relative w-full rounded-2xl overflow-hidden border border-cipher-border bg-[#F8FAFC] shadow-sm">
      <Canvas shadows camera={{ fov: 36, near: 0.1, far: 800, position: [65, 45, 65] }}>
        {/* Crisp Modern Architectural Light Theme */}
        <color attach="background" args={['#F8FAFC']} />
        <fog attach="fog" args={['#F8FAFC', 120, 360]} />

        {/* Ambient & Sky Lighting */}
        <ambientLight intensity={0.9} />
        <hemisphereLight skyColor="#E0F2FE" groundColor="#F1F5F9" intensity={0.7} />

        {/* Warm Sunlight casting soft contact shadows */}
        <directionalLight
          position={[60, 90, 45]}
          intensity={1.4}
          color="#FFFDF5"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={10}
          shadow-camera-far={250}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-50, 40, -50]} intensity={0.5} color="#BAE6FD" />

        {/* Architectural Ground Plane & Shadow Receiver */}
        <mesh position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[500, 500]} />
          <shadowMaterial opacity={0.15} />
        </mesh>

        {/* Clean Minimalist Cadastral Grid */}
        <Grid
          position={[0, -0.2, 0]}
          args={[Math.max(width * 2.5, 140), Math.max(depth * 2.5, 140)]}
          cellSize={5}
          cellThickness={0.7}
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
            const explodedOffset = explodedView ? idx * explodeDistance : 0;
            return (
              <BuildingFloor
                key={floor.id}
                floor={{ ...floor, isTop: idx === buildingData.floors.length - 1 }}
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

      {/* Interactive Helper Overlay Bar */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-cipher-border rounded-lg px-3 py-1.5 text-[11px] font-medium text-cipher-navy shadow-subtle pointer-events-none flex items-center gap-2 z-10">
        <span className="w-2 h-2 rounded-full bg-cipher-govblue animate-pulse" />
        <span>Click Unit: Focus &amp; Inspect 3D ULPIN · Left Click: Orbit · Right Click: Pan · Scroll: Zoom</span>
      </div>
    </div>
  );
}

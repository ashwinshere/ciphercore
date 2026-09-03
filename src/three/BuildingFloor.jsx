import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Edges } from '@react-three/drei';
import * as THREE from 'three';
import PropertyRoom from './PropertyRoom.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function BuildingFloor({
  floor,
  building,
  explodedOffset,
  isDimmed,
  isHiddenFully,
  selectedRoomId,
  hoveredRoomId,
  stackMemberIds,
  stackModeActive,
  onSelectRoom,
  onHoverRoom,
  onUnhoverRoom,
}) {
  const groupRef = useRef();
  const targetY = useRef(explodedOffset);
  targetY.current = explodedOffset;
  const { wireframeMode } = useApp();

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY.current,
      0.12
    );
  });

  if (isHiddenFully) return null;

  const width = building.footprintWidthM || 60;
  const depth = building.footprintDepthM || 20;
  const floorHeight = floor.height || 3.5;
  const isGroundFloor = floor.numId === '00' || floor.id === 'F00';
  const isTopFloor = floor.isTop || floor.id === `F0${building.floors - 1}` || floor.id === 'F03' || floor.id === 'F05';

  return (
    <group ref={groupRef} position={[0, explodedOffset, 0]}>
      <group position={[0, floor.elevation, 0]}>
        {/* Structural Architectural Floor Slab - raycast disabled so it never blocks room selection */}
        <mesh position={[0, -0.1, 0]} receiveShadow castShadow={!isDimmed} raycast={() => null}>
          <boxGeometry args={[width + 0.4, 0.2, depth + 0.4]} />
          <meshStandardMaterial
            color={isDimmed ? '#E2E8F0' : '#FFFFFF'}
            roughness={0.6}
            metalness={0.1}
            transparent
            opacity={isDimmed ? 0.25 : 0.95}
            wireframe={wireframeMode}
          />
          <Edges scale={1.001} color={isDimmed ? '#CBD5E1' : '#94A3B8'} />
        </mesh>

        {/* Central Circulation Hallway Runner Floor */}
        {!wireframeMode && (
          <mesh position={[0, 0.01, 0]} receiveShadow raycast={() => null}>
            <boxGeometry args={[width - 1, 0.02, 3]} />
            <meshStandardMaterial
              color={isDimmed ? '#F1F5F9' : '#E0F2FE'}
              roughness={0.4}
              transparent
              opacity={isDimmed ? 0.2 : 0.8}
            />
          </mesh>
        )}

        {/* Outer Perimeter Architectural Balcony / Fascia Trim */}
        {!wireframeMode && (
          <mesh position={[0, -0.05, 0]} raycast={() => null}>
            <boxGeometry args={[width + 0.6, 0.1, depth + 0.6]} />
            <meshStandardMaterial
              color="#0284C7"
              transparent
              opacity={isDimmed ? 0.1 : 0.45}
            />
          </mesh>
        )}

        {/* Rooftop Parapet and Core Block (Rendered on top level) */}
        {isTopFloor && !wireframeMode && (
          <group position={[0, floorHeight, 0]}>
            {/* Rooftop Slab */}
            <mesh position={[0, 0.1, 0]} receiveShadow castShadow={!isDimmed} raycast={() => null}>
              <boxGeometry args={[width + 0.4, 0.2, depth + 0.4]} />
              <meshStandardMaterial
                color="#F8FAFC"
                roughness={0.5}
                transparent
                opacity={isDimmed ? 0.2 : 0.9}
              />
              <Edges scale={1.001} color="#94A3B8" />
            </mesh>
            {/* Perimeter Parapet Wall */}
            <mesh position={[0, 0.45, (depth + 0.2) / 2]} raycast={() => null}>
              <boxGeometry args={[width + 0.4, 0.5, 0.2]} />
              <meshStandardMaterial color="#E2E8F0" />
            </mesh>
            <mesh position={[0, 0.45, -(depth + 0.2) / 2]} raycast={() => null}>
              <boxGeometry args={[width + 0.4, 0.5, 0.2]} />
              <meshStandardMaterial color="#E2E8F0" />
            </mesh>
            <mesh position={[(width + 0.2) / 2, 0.45, 0]} raycast={() => null}>
              <boxGeometry args={[0.2, 0.5, depth]} />
              <meshStandardMaterial color="#E2E8F0" />
            </mesh>
            <mesh position={[-(width + 0.2) / 2, 0.45, 0]} raycast={() => null}>
              <boxGeometry args={[0.2, 0.5, depth]} />
              <meshStandardMaterial color="#E2E8F0" />
            </mesh>
            {/* Rooftop Elevator / Stair Headroom Penthouse */}
            <mesh position={[width / 2 - 8, 1.2, 0]} castShadow receiveShadow raycast={() => null}>
              <boxGeometry args={[7, 2, 4]} />
              <meshStandardMaterial color="#334155" roughness={0.4} />
              <Edges scale={1.001} color="#64748B" />
            </mesh>
          </group>
        )}

        {/* Floor Level 3D Tag */}
        <Text
          position={[-width / 2 - 3, 1.2, 0]}
          fontSize={1.1}
          color="#0F172A"
          anchorX="right"
          anchorY="middle"
          rotation={[0, Math.PI / 2, 0]}
          fillOpacity={isDimmed ? 0.2 : 0.9}
          fontWeight="bold"
          raycast={() => null}
        >
          {floor.shortName.toUpperCase()}
        </Text>
      </group>

      {/* Interior Floor Spatial Units */}
      {floor.rooms.map((room) => {
        const isStackMember = stackMemberIds?.has(room.id);
        const roomDimmed = isDimmed || (stackModeActive && !isStackMember);
        return (
          <PropertyRoom
            key={room.id}
            room={room}
            floorElevation={floor.elevation}
            isSelected={selectedRoomId === room.id}
            isHovered={hoveredRoomId === room.id}
            isStackMember={isStackMember}
            dimmed={roomDimmed}
            onSelect={() => onSelectRoom(room.id)}
            onHover={() => onHoverRoom(room.id)}
            onUnhover={() => onUnhoverRoom(room.id)}
          />
        );
      })}
    </group>
  );
}

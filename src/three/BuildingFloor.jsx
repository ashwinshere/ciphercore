import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Edges } from '@react-three/drei';
import * as THREE from 'three';
import PropertyRoom from './PropertyRoom.jsx';

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
  const hasCourtyard = building.hasCourtyard || false;
  const isSports = building.buildingType === 'Sports';

  const cw = building.courtyardWidthM || 30;
  const cd = building.courtyardDepthM || 24;
  const wingThickZ = (depth - cd) / 2;
  const wingThickX = (width - cw) / 2;

  return (
    <group ref={groupRef} position={[0, explodedOffset, 0]}>
      {/* 1. SPORTS COURT SPECIAL 3D REPRESENTATION */}
      {isSports ? (
        <group position={[0, floor.elevation, 0]}>
          {/* Court Playing Surface */}
          <mesh position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[width, 0.1, depth]} />
            <meshStandardMaterial color="#0284C7" roughness={0.4} />
            <Edges scale={1.001} color="#38BDF8" />
          </mesh>
          {/* Court Border Lines */}
          <mesh position={[0, 0.11, 0]}>
            <boxGeometry args={[width - 2, 0.02, depth - 2]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
          {/* Key Court Text */}
          <Text
            position={[0, 0.2, 0]}
            fontSize={2.5}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI / 2, 0, 0]}
            fontWeight="bold"
          >
            BASKETBALL COURT
          </Text>
        </group>
      ) : hasCourtyard ? (
        /* 2. COURTYARD QUADRANGLE BUILDING EXTRUSION (BD Block & KS Block) */
        <group position={[0, floor.elevation, 0]}>
          {/* Floor Plate Slab - North Wing */}
          <mesh position={[0, -0.15, (depth - wingThickZ) / 2]} receiveShadow castShadow>
            <boxGeometry args={[width, 0.3, wingThickZ]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.5} transparent opacity={isDimmed ? 0.25 : 0.9} />
            <Edges scale={1.001} color={isDimmed ? '#94A3B8' : '#475569'} />
          </mesh>
          {/* Floor Plate Slab - South Wing */}
          <mesh position={[0, -0.15, -(depth - wingThickZ) / 2]} receiveShadow castShadow>
            <boxGeometry args={[width, 0.3, wingThickZ]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.5} transparent opacity={isDimmed ? 0.25 : 0.9} />
            <Edges scale={1.001} color={isDimmed ? '#94A3B8' : '#475569'} />
          </mesh>
          {/* Floor Plate Slab - West Wing */}
          <mesh position={[-(width - wingThickX) / 2, -0.15, 0]} receiveShadow castShadow>
            <boxGeometry args={[wingThickX, 0.3, cd]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.5} transparent opacity={isDimmed ? 0.25 : 0.9} />
            <Edges scale={1.001} color={isDimmed ? '#94A3B8' : '#475569'} />
          </mesh>
          {/* Floor Plate Slab - East Wing */}
          <mesh position={[(width - wingThickX) / 2, -0.15, 0]} receiveShadow castShadow>
            <boxGeometry args={[wingThickX, 0.3, cd]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.5} transparent opacity={isDimmed ? 0.25 : 0.9} />
            <Edges scale={1.001} color={isDimmed ? '#94A3B8' : '#475569'} />
          </mesh>

          {/* Facade Glass Outer Envelopes */}
          <mesh position={[0, floorHeight / 2 - 0.15, (depth - wingThickZ) / 2]}>
            <boxGeometry args={[width - 0.2, floorHeight - 0.3, wingThickZ - 0.2]} />
            <meshStandardMaterial color="#93C5FD" transparent opacity={isDimmed ? 0.05 : 0.25} roughness={0.1} />
            <Edges scale={1.001} color={isDimmed ? '#CBD5E1' : '#3B82F6'} />
          </mesh>
          <mesh position={[0, floorHeight / 2 - 0.15, -(depth - wingThickZ) / 2]}>
            <boxGeometry args={[width - 0.2, floorHeight - 0.3, wingThickZ - 0.2]} />
            <meshStandardMaterial color="#93C5FD" transparent opacity={isDimmed ? 0.05 : 0.25} roughness={0.1} />
            <Edges scale={1.001} color={isDimmed ? '#CBD5E1' : '#3B82F6'} />
          </mesh>

          {/* Central Courtyard Grass Lawn Marker on Ground Floor */}
          {floor.numId === '00' && (
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[cw - 1, 0.1, cd - 1]} />
              <meshStandardMaterial color="#15803D" roughness={0.8} />
            </mesh>
          )}
        </group>
      ) : (
        /* 3. SOLID EXTRUDED BUILDING BLOCK (RV Block, ME Block, Boys Hostel, Canteen) */
        <group position={[0, floor.elevation, 0]}>
          {/* Structural Floor Plate Slab extruded to footprint size */}
          <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
            <boxGeometry args={[width + 0.6, 0.3, depth + 0.6]} />
            <meshStandardMaterial
              color="#CBD5E1"
              roughness={0.5}
              metalness={0.2}
              transparent
              opacity={isDimmed ? 0.25 : 0.9}
            />
            <Edges scale={1.001} color={isDimmed ? '#94A3B8' : '#475569'} />
          </mesh>

          {/* Extruded Facade Glass Envelope */}
          <mesh position={[0, floorHeight / 2 - 0.15, 0]}>
            <boxGeometry args={[width, floorHeight - 0.3, depth]} />
            <meshStandardMaterial
              color="#93C5FD"
              transparent
              opacity={isDimmed ? 0.05 : 0.22}
              roughness={0.1}
              metalness={0.3}
            />
            <Edges scale={1.001} color={isDimmed ? '#CBD5E1' : '#3B82F6'} threshold={15} />
          </mesh>

          {/* Floor Spandrel Accent Line */}
          <mesh position={[0, floorHeight - 0.2, 0]}>
            <boxGeometry args={[width + 0.2, 0.15, depth + 0.2]} />
            <meshStandardMaterial color="#1E3A8A" transparent opacity={isDimmed ? 0.1 : 0.6} />
          </mesh>
        </group>
      )}

      {/* Floor Designation Label */}
      <Text
        position={[-width / 2 - 2.5, floor.elevation + 1.2, 0]}
        fontSize={1.2}
        color="#1E3A8A"
        anchorX="right"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
        fillOpacity={isDimmed ? 0.2 : 0.95}
        fontWeight="bold"
      >
        {floor.shortName.toUpperCase()}
      </Text>

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

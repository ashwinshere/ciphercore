import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import PropertyRoom from './PropertyRoom.jsx';
import { CORRIDOR, STAIRCASE, BUILDING_BOUNDARY } from '../data/buildingData.js';

export default function BuildingFloor({
  floor,
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

  const slabWidth = BUILDING_BOUNDARY.xMax - BUILDING_BOUNDARY.xMin;
  const slabDepth = BUILDING_BOUNDARY.yMax - BUILDING_BOUNDARY.yMin;
  const slabCenterX = (BUILDING_BOUNDARY.xMax + BUILDING_BOUNDARY.xMin) / 2;
  const slabCenterZ = (BUILDING_BOUNDARY.yMax + BUILDING_BOUNDARY.yMin) / 2;

  const groupOpacityRooms = isHiddenFully ? 0 : 1;

  if (isHiddenFully) return null;

  return (
    <group ref={groupRef} position={[0, explodedOffset, 0]}>
      {/* Floor slab */}
      <mesh position={[slabCenterX, floor.elevation - 0.1, slabCenterZ]} receiveShadow>
        <boxGeometry args={[slabWidth, 0.2, slabDepth]} />
        <meshStandardMaterial
          color="#E2E8F0"
          transparent
          opacity={isDimmed ? 0.2 : 0.85}
          roughness={0.7}
        />
      </mesh>

      {/* Corridor strip */}
      <mesh position={[CORRIDOR.x + CORRIDOR.width / 2, floor.elevation - 0.04, CORRIDOR.y + CORRIDOR.depth / 2]}>
        <boxGeometry args={[CORRIDOR.width, 0.05, CORRIDOR.depth]} />
        <meshStandardMaterial color="#CBD5E1" transparent opacity={isDimmed ? 0.2 : 0.7} />
      </mesh>

      {/* Staircase / core */}
      <mesh position={[STAIRCASE.x + STAIRCASE.width / 2, floor.elevation + 1, STAIRCASE.y + STAIRCASE.depth / 2]}>
        <boxGeometry args={[STAIRCASE.width, 2.4, STAIRCASE.depth]} />
        <meshStandardMaterial
          color="#F59E0B"
          transparent
          opacity={isDimmed ? 0.1 : 0.35}
          wireframe={false}
        />
      </mesh>
      <Text
        position={[STAIRCASE.x + STAIRCASE.width / 2, floor.elevation + 2.4, STAIRCASE.y + STAIRCASE.depth / 2]}
        fontSize={0.9}
        color="#B45309"
        anchorX="center"
        anchorY="middle"
        fillOpacity={isDimmed ? 0.2 : 0.9}
        fontWeight="bold"
      >
        CORE
      </Text>

      {/* Floor label */}
      <Text
        position={[-4, floor.elevation + 1.2, 0]}
        fontSize={1.1}
        color="#123B63"
        anchorX="right"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
        fillOpacity={isDimmed ? 0.25 : 0.95}
        fontWeight="bold"
      >
        {floor.shortName.toUpperCase()}
      </Text>

      {/* Rooms */}
      {groupOpacityRooms > 0 &&
        floor.rooms.map((room) => {
          const fullId = `TN-TRY-SCE-RV-F${floor.numId}-R${room.number}`;
          const isStackMember = stackMemberIds?.has(fullId);
          const roomDimmed = isDimmed || (stackModeActive && !isStackMember);
          return (
            <PropertyRoom
              key={fullId}
              room={{ ...room, id: fullId }}
              floorElevation={floor.elevation}
              isSelected={selectedRoomId === fullId}
              isHovered={hoveredRoomId === fullId}
              isStackMember={isStackMember}
              dimmed={roomDimmed}
              onSelect={() => onSelectRoom(fullId)}
              onHover={() => onHoverRoom(fullId)}
              onUnhover={() => onUnhoverRoom(fullId)}
            />
          );
        })}
    </group>
  );
}

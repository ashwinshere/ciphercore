import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';

const TYPE_COLORS = {
  Classroom: '#2563EB',
  'Tutorial Room': '#3B82F6',
  'Seminar Hall': '#4F46E5',
  'Common Laboratory': '#0284C7',
  'Faculty Room': '#D97706',
  'Administrative Office': '#D97706',
  Reception: '#059669',
  'Store Room': '#64748B',
  'Waiting Area': '#10B981',
  'Records Room': '#475569',
};

export default function PropertyRoom({
  room,
  floorElevation,
  isSelected,
  isHovered,
  isStackMember,
  dimmed,
  onSelect,
  onHover,
  onUnhover,
}) {
  const meshRef = useRef();
  const baseColor = TYPE_COLORS[room.type] || '#2563EB';

  const color = useMemo(() => {
    if (isSelected) return '#1D4ED8';
    if (isStackMember) return '#3B82F6';
    if (isHovered) return '#60A5FA';
    return baseColor;
  }, [isSelected, isStackMember, isHovered, baseColor]);

  const opacity = dimmed ? 0.1 : isSelected ? 0.9 : isStackMember ? 0.75 : 0.55;

  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.depth / 2;
  const centerY = floorElevation + room.height / 2;

  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = isSelected ? 1.03 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
  });

  return (
    <group position={[centerX, centerY, centerZ]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(room);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover?.(room);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onUnhover?.(room);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={[room.width, room.height, room.depth]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.3}
          metalness={0.1}
        />
        <Edges
          scale={1.001}
          threshold={15}
          color={isSelected ? '#FFFFFF' : isStackMember ? '#BFDBFE' : '#1E293B'}
        />
      </mesh>

      {(isHovered || isSelected) && !dimmed && (
        <Html
          position={[0, room.height / 2 + 0.5, 0]}
          center
          distanceFactor={22}
          occlude={false}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-white/95 backdrop-blur-xs rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap shadow-card border border-cipher-border text-left">
            <div className="font-extrabold text-cipher-navy text-[11px]">{room.name}</div>
            <div className="text-cipher-govblue text-[10px] font-bold mono">{room.id}</div>
            <div className="text-cipher-muted text-[10px]">{room.type}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

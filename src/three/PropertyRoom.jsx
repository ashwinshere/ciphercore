import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';

const TYPE_COLORS = {
  Classroom: '#1E5A96',
  'Tutorial Room': '#2563EB',
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
  const baseColor = TYPE_COLORS[room.type] || '#1E5A96';

  const color = useMemo(() => {
    if (isSelected) return '#123B63';
    if (isStackMember) return '#2F6FAF';
    if (isHovered) return '#3B82F6';
    return baseColor;
  }, [isSelected, isStackMember, isHovered, baseColor]);

  const opacity = dimmed ? 0.15 : isSelected ? 0.95 : isStackMember ? 0.8 : 0.65;

  // Center position: room.x/y are corner coords, box origin is center.
  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.depth / 2;
  const centerY = floorElevation + room.height / 2;

  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = isSelected ? 1.025 : 1;
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
          roughness={0.4}
          metalness={0.1}
        />
        <Edges
          scale={1.001}
          threshold={15}
          color={isSelected ? '#FFFFFF' : isStackMember ? '#93C5FD' : '#0F172A'}
        />
      </mesh>

      {(isHovered || isSelected) && !dimmed && (
        <Html
          position={[0, room.height / 2 + 0.6, 0]}
          center
          distanceFactor={22}
          occlude={false}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-white/95 backdrop-blur-xs rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap shadow-card border border-cipher-border text-left">
            <div className="font-bold text-cipher-navy text-[11px]">{room.name}</div>
            <div className="text-cipher-muted text-[10px] font-medium">{room.type}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

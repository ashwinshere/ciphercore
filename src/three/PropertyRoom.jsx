import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';

const TYPE_COLORS = {
  Classroom: '#3b82f6',
  'Tutorial Room': '#6366f1',
  'Seminar Hall': '#a855f7',
  'Common Laboratory': '#06b6d4',
  'Faculty Room': '#f59e0b',
  'Administrative Office': '#f59e0b',
  Reception: '#10b981',
  'Store Room': '#64748b',
  'Waiting Area': '#10b981',
  'Records Room': '#64748b',
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
  const baseColor = TYPE_COLORS[room.type] || '#3b82f6';

  const color = useMemo(() => {
    if (isSelected) return '#22d3ee';
    if (isStackMember) return '#38bdf8';
    if (isHovered) return '#7dd3fc';
    return baseColor;
  }, [isSelected, isStackMember, isHovered, baseColor]);

  const opacity = dimmed ? 0.12 : isSelected ? 0.85 : isStackMember ? 0.65 : 0.4;

  // Center position: room.x/y are corner coords, box origin is center.
  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.depth / 2;
  const centerY = floorElevation + room.height / 2;

  useFrame((state) => {
    if (!meshRef.current) return;
    const targetScale = isSelected ? 1.02 : 1;
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
          color={isSelected ? '#67e8f9' : isStackMember ? '#38bdf8' : '#1e3a5f'}
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
          <div className="glass rounded-lg px-3 py-1.5 text-xs whitespace-nowrap shadow-glow border border-vertex-cyan/30">
            <div className="font-semibold text-vertex-cyan">{room.name}</div>
            <div className="text-slate-300 mono text-[10px]">{room.type}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

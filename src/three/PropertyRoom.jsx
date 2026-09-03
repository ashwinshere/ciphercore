import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useApp } from '../context/AppContext.jsx';

// Premium Light Architectural Color Palette
const TYPE_CONFIG = {
  Classroom: {
    color: '#3B82F6',
    glass: '#93C5FD',
    glow: '#60A5FA',
    border: '#2563EB',
    tag: 'bg-blue-600 text-white'
  },
  'Tutorial Room': {
    color: '#0EA5E9',
    glass: '#BAE6FD',
    glow: '#38BDF8',
    border: '#0284C7',
    tag: 'bg-sky-600 text-white'
  },
  'Seminar Hall': {
    color: '#8B5CF6',
    glass: '#DDD6FE',
    glow: '#A78BFA',
    border: '#7C3AED',
    tag: 'bg-purple-600 text-white'
  },
  'Common Laboratory': {
    color: '#6366F1',
    glass: '#C7D2FE',
    glow: '#818CF8',
    border: '#4F46E5',
    tag: 'bg-indigo-600 text-white'
  },
  'Faculty Room': {
    color: '#F59E0B',
    glass: '#FDE68A',
    glow: '#FBBF24',
    border: '#D97706',
    tag: 'bg-amber-600 text-white'
  },
  'Administrative Office': {
    color: '#10B981',
    glass: '#A7F3D0',
    glow: '#34D399',
    border: '#059669',
    tag: 'bg-emerald-600 text-white'
  },
  Reception: {
    color: '#14B8A6',
    glass: '#99F6E4',
    glow: '#2DD4BF',
    border: '#0D9488',
    tag: 'bg-teal-600 text-white'
  },
  'Store Room': {
    color: '#64748B',
    glass: '#CBD5E1',
    glow: '#94A3B8',
    border: '#475569',
    tag: 'bg-slate-600 text-white'
  },
  'Waiting Area': {
    color: '#06B6D4',
    glass: '#A5F3FC',
    glow: '#22D3EE',
    border: '#0891B2',
    tag: 'bg-cyan-600 text-white'
  }
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
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const { wireframeMode, selectRoom } = useApp();

  const cfg = TYPE_CONFIG[room.type] || TYPE_CONFIG['Classroom'];

  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.depth / 2;
  const centerY = floorElevation + room.height / 2;

  // Dynamic architectural colors
  const activeColor = useMemo(() => {
    if (isSelected) return '#0284C7';
    if (isHovered) return cfg.glow;
    if (isStackMember) return '#3B82F6';
    return cfg.color;
  }, [isSelected, isHovered, isStackMember, cfg]);

  const edgeColor = useMemo(() => {
    if (isSelected) return '#0369A1';
    if (isHovered) return '#0284C7';
    if (isStackMember) return '#2563EB';
    return '#64748B';
  }, [isSelected, isHovered, isStackMember]);

  // Opacity in light theme
  const opacity = dimmed
    ? 0.12
    : isSelected
    ? 0.88
    : isHovered
    ? 0.65
    : isStackMember
    ? 0.72
    : 0.45;

  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = isSelected ? 1.025 : isHovered ? 1.015 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.15
    );
  });

  const handleTriggerSelect = (e) => {
    e?.stopPropagation?.();
    selectRoom(room.id, { focus: true });
    onSelect?.(room);
  };

  return (
    <group position={[centerX, centerY, centerZ]}>
      {/* Main Room Volume with Architectural Glass / Facade styling */}
      <mesh
        ref={meshRef}
        onPointerDown={(e) => {
          pointerDownPos.current = { x: e.clientX || 0, y: e.clientY || 0 };
        }}
        onPointerUp={(e) => {
          const dx = Math.abs((e.clientX || 0) - pointerDownPos.current.x);
          const dy = Math.abs((e.clientY || 0) - pointerDownPos.current.y);
          if (dx < 8 && dy < 8) {
            handleTriggerSelect(e);
          }
        }}
        onClick={handleTriggerSelect}
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
        receiveShadow
        castShadow={!dimmed && (isSelected || isHovered)}
      >
        <boxGeometry args={[room.width, room.height, room.depth]} />
        <meshStandardMaterial
          color={activeColor}
          roughness={0.2}
          metalness={0.15}
          transparent
          opacity={opacity}
          wireframe={wireframeMode}
          emissive={isSelected ? '#0284C7' : isHovered ? '#38BDF8' : '#000000'}
          emissiveIntensity={isSelected ? 0.45 : isHovered ? 0.2 : 0}
        />

        {/* Clean Architectural Boundary Chamfer */}
        <Edges
          scale={1.001}
          threshold={12}
          color={edgeColor}
        />
      </mesh>

      {/* Interior Floor Plate Tile (Architectural Unit Finish) */}
      {!dimmed && !wireframeMode && (
        <mesh position={[0, -room.height / 2 + 0.05, 0]} receiveShadow>
          <boxGeometry args={[room.width - 0.2, 0.06, room.depth - 0.2]} />
          <meshStandardMaterial
            color={isSelected ? '#BAE6FD' : isHovered ? '#E0F2FE' : '#F8FAFC'}
            roughness={0.5}
          />
        </mesh>
      )}

      {/* Ceiling Trim Edge */}
      {!dimmed && !wireframeMode && (
        <mesh position={[0, room.height / 2 - 0.03, 0]}>
          <boxGeometry args={[room.width - 0.1, 0.04, room.depth - 0.1]} />
          <meshStandardMaterial color="#E2E8F0" opacity={0.6} transparent />
        </mesh>
      )}

      {/* 3D Floating Tag for Selected or Hovered Unit */}
      {(isHovered || isSelected) && !dimmed && (
        <Html
          position={[0, room.height / 2 + 0.8, 0]}
          center
          distanceFactor={24}
          occlude={false}
          style={{ pointerEvents: 'none' }}
        >
          <div className="fade-in bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 text-xs whitespace-nowrap shadow-xl border border-cipher-border text-left ring-2 ring-cipher-govblue/30 select-none">
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${cfg.tag}`}>
                {room.name}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                {(room.width * room.depth).toFixed(0)} m²
              </span>
            </div>
            <div className="text-cipher-govblue text-[11px] font-bold mono truncate max-w-[210px]">
              {room.id}
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
              <span>{room.type}</span>
              <span className="font-semibold text-cipher-navy">
                {room.floorShortName || 'Level'} (+{room.elevation}m)
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import {
  Layers,
  Maximize2,
  Minimize2,
  Box,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

// Room colors based on category
const ROOM_COLORS = {
  Classroom: '#3B82F6',
  'Advanced Laboratory': '#6366F1',
  'Computer Lab': '#0EA5E9',
  'Seminar Theater': '#8B5CF6',
  'Conference Room': '#4F46E5',
  'Open Workspace': '#10B981',
  'Executive Suite': '#D97706',
  'Server & IT Hub': '#64748B',
  'Double Occupancy Unit': '#2563EB',
  'Warden Office': '#DC2626',
  'Common Room': '#059669',
  'Administrative Office': '#D97706',
  'Faculty Lounge': '#F59E0B',
};

function getRoomColor(type) {
  for (const [key, color] of Object.entries(ROOM_COLORS)) {
    if (type && type.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  return '#3B82F6';
}

function WallMesh({ wall, floorElevation, height }) {
  const wallH = wall.height || height || 3.6;
  const dx = wall.endX - wall.startX;
  const dy = wall.endY - wall.startY;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  const midX = (wall.startX + wall.endX) / 2;
  const midZ = (wall.startY + wall.endY) / 2;
  const midY = floorElevation + wallH / 2;

  const thickness = wall.thickness || (wall.isExterior ? 0.3 : 0.2);

  return (
    <group position={[midX, midY, midZ]} rotation={[0, -angle, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, wallH, thickness]} />
        <meshStandardMaterial
          color={wall.isExterior ? '#CBD5E1' : '#E2E8F0'}
          roughness={0.4}
          metalness={0.1}
        />
        <Edges scale={1.001} threshold={15} color="#94A3B8" />
      </mesh>
    </group>
  );
}

function RoomVolume({ room, floorElevation, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const color = getRoomColor(room.type);
  const centerX = room.x + room.width / 2;
  const centerZ = room.y + room.depth / 2;
  const centerY = floorElevation + room.height / 2;

  return (
    <group position={[centerX, centerY, centerZ]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(room);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        receiveShadow
        castShadow={isSelected || hovered}
      >
        <boxGeometry args={[room.width, room.height, room.depth]} />
        <meshStandardMaterial
          color={isSelected ? '#0284C7' : color}
          transparent
          opacity={isSelected ? 0.88 : hovered ? 0.7 : 0.38}
          roughness={0.2}
          metalness={0.15}
          emissive={isSelected ? '#0284C7' : hovered ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : hovered ? 0.25 : 0}
        />
        <Edges
          scale={1.001}
          threshold={15}
          color={isSelected ? '#0284C7' : hovered ? '#3B82F6' : '#64748B'}
        />
      </mesh>

      {/* Floating 3D Label */}
      {(hovered || isSelected) && (
        <Html position={[0, room.height / 2 + 0.6, 0]} center distanceFactor={22} pointerEvents="none">
          <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-xl text-xs whitespace-nowrap text-left ring-2 ring-cipher-govblue/30">
            <div className="font-bold text-cipher-navy text-[11px]">{room.name}</div>
            <div className="text-[10px] text-cipher-govblue font-semibold">{room.type}</div>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5">{room.area} m² · F0{room.floorNumber}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function FloorSlab({ width, depth, elevation, height }) {
  return (
    <group position={[0, elevation, 0]}>
      {/* Floor Deck Slab */}
      <mesh receiveShadow position={[0, 0.05, 0]} raycast={() => null}>
        <boxGeometry args={[width + 0.6, 0.12, depth + 0.6]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.6} />
        <Edges scale={1.001} color="#94A3B8" />
      </mesh>
    </group>
  );
}

function GeneratedFloorGroup({ floor, width, depth, explodedOffset, isIsolated, onSelectRoom, selectedRoomId }) {
  const effectiveElevation = floor.elevation + explodedOffset;

  return (
    <group>
      {/* Slab */}
      <FloorSlab width={width} depth={depth} elevation={effectiveElevation} height={floor.height} />

      {/* Extruded Architectural Walls */}
      {floor.walls?.map((wall) => (
        <WallMesh
          key={wall.id}
          wall={wall}
          floorElevation={effectiveElevation}
          height={floor.height}
        />
      ))}

      {/* Room Volumes */}
      {floor.rooms?.map((rm) => (
        <RoomVolume
          key={rm.id}
          room={rm}
          floorElevation={effectiveElevation}
          isSelected={selectedRoomId === rm.id}
          onSelect={onSelectRoom}
        />
      ))}
    </group>
  );
}

export default function GeneratedBuildingViewer({
  buildingGeometry,
  onSelectRoom = () => {},
  selectedRoomId = null,
  height = '480px'
}) {
  const [isolatedFloorIdx, setIsolatedFloorIdx] = useState(null);
  const [exploded, setExploded] = useState(false);
  const [explodeDist, setExplodeDist] = useState(6);
  const [wireframe, setWireframe] = useState(false);

  const bld = buildingGeometry || {
    name: 'AI Generated Building',
    footprintWidthM: 60,
    footprintDepthM: 22,
    floorHeightM: 3.6,
    buildingHeightM: 10.8,
    floors: [],
  };

  const W = bld.footprintWidthM || 60;
  const D = bld.footprintDepthM || 22;
  const H = bld.buildingHeightM || 12;

  const floors = bld.floors || [];

  const visibleFloors = useMemo(() => {
    if (isolatedFloorIdx !== null) {
      return floors.filter((_, idx) => idx === isolatedFloorIdx);
    }
    return floors;
  }, [floors, isolatedFloorIdx]);

  return (
    <div style={{ height }} className="relative w-full rounded-2xl overflow-hidden border border-cipher-border bg-[#F8FAFC] shadow-card flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-cipher-border shadow-md pointer-events-auto text-xs">
          <span className="text-[10px] font-bold text-cipher-muted uppercase px-2">Level:</span>
          <button
            onClick={() => setIsolatedFloorIdx(null)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
              isolatedFloorIdx === null
                ? 'bg-cipher-govblue text-white shadow-xs'
                : 'text-cipher-navy hover:bg-slate-100'
            }`}
          >
            All Floors ({floors.length})
          </button>
          {floors.map((fl, idx) => (
            <button
              key={fl.id || idx}
              onClick={() => setIsolatedFloorIdx(idx)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                isolatedFloorIdx === idx
                  ? 'bg-cipher-govblue text-white shadow-xs'
                  : 'text-cipher-navy hover:bg-slate-100'
              }`}
            >
              {fl.shortName || `F${idx}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-cipher-border shadow-md pointer-events-auto text-xs">
          <button
            onClick={() => setExploded(!exploded)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
              exploded ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Exploded Floor View"
          >
            <Layers size={13} />
            <span>Explode</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full">
        <Canvas shadows camera={{ fov: 36, near: 0.1, far: 500, position: [W * 1.1, H * 1.6 + 12, D * 1.2] }}>
          <color attach="background" args={['#F8FAFC']} />
          <fog attach="fog" args={['#F8FAFC', 100, 300]} />

          <ambientLight intensity={0.85} />
          <hemisphereLight skyColor="#E0F2FE" groundColor="#F1F5F9" intensity={0.65} />

          <directionalLight
            position={[50, 80, 40]}
            intensity={1.3}
            color="#FFFDF5"
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-40, 30, -40]} intensity={0.4} color="#BAE6FD" />

          {/* Ground Plane */}
          <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={() => null}>
            <planeGeometry args={[400, 400]} />
            <shadowMaterial opacity={0.12} />
          </mesh>

          <Grid
            position={[0, -0.18, 0]}
            args={[Math.max(W * 2.2, 100), Math.max(D * 2.2, 100)]}
            cellSize={4}
            cellThickness={0.6}
            cellColor="#CBD5E1"
            sectionSize={16}
            sectionThickness={1.1}
            sectionColor="#94A3B8"
            fadeDistance={140}
            infiniteGrid
          />

          {/* Generated Floors */}
          <group>
            {visibleFloors.map((floor, idx) => {
              const actualIdx = isolatedFloorIdx !== null ? isolatedFloorIdx : idx;
              const explodedOffset = exploded ? actualIdx * explodeDist : 0;

              return (
                <GeneratedFloorGroup
                  key={floor.id || idx}
                  floor={floor}
                  width={W}
                  depth={D}
                  explodedOffset={explodedOffset}
                  isIsolated={isolatedFloorIdx !== null}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={onSelectRoom}
                />
              );
            })}
          </group>

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.06}
            rotateSpeed={0.65}
            zoomSpeed={0.7}
            panSpeed={0.75}
            minDistance={14}
            maxDistance={180}
            maxPolarAngle={Math.PI / 2.08}
            minPolarAngle={Math.PI / 16}
            target={[0, H * 0.45, 0]}
          />
        </Canvas>
      </div>

      {/* Bottom Info Status Bar */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-2 border-t border-cipher-border flex items-center justify-between text-xs text-cipher-navy">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">{bld.name}</span>
          <span className="text-slate-400">·</span>
          <span className="text-cipher-muted font-mono">{W}m × {D}m × {H}m</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-cipher-muted">
          <span>{floors.length} Spatial Floors</span>
          <span>·</span>
          <span className="text-cipher-govblue font-semibold">AI Generated 3D Mesh</span>
        </div>
      </div>
    </div>
  );
}

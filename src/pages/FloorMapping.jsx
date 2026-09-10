import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import PropertyPanel from '../components/PropertyPanel.jsx';
import {
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Layers,
  Info,
  ChevronRight,
  Maximize2,
  Box,
  Ruler
} from 'lucide-react';
import { generate3DULPIN } from '../utils/ulpin.js';
import { generatePrototypePropertyId } from '../data/gisData.js';

const PADDING = 6;

export default function FloorMapping() {
  const {
    buildingData,
    selectedProperty,
    selectedRoom,
    selectRoom,
    setViewMode,
    setCurrentPage
  } = useApp();

  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  const bld = buildingData?.building || {
    name: 'RV Block',
    footprintWidthM: 80,
    footprintDepthM: 70,
    ulpin2D: '29-01-001-000123',
    propertyType: 'Academic Block'
  };

  const floors = buildingData?.floors || [];

  // Automatically synchronize floor tab when a room is selected from another floor
  useEffect(() => {
    if (selectedRoom) {
      const idx = floors.findIndex((f) => f.id === selectedRoom.floorId);
      if (idx !== -1 && idx !== activeFloorIndex) {
        setActiveFloorIndex(idx);
      }
    }
  }, [selectedRoom, floors]);

  const currentFloor = floors[activeFloorIndex] || floors[0] || {
    id: 'F00',
    name: 'Ground Floor',
    shortName: 'Ground',
    elevation: 0,
    rooms: []
  };

  // Dimensions
  const bWidth = bld.footprintWidthM || 60;
  const bDepth = bld.footprintDepthM || 20;
  const xMin = -bWidth / 2;
  const xMax = bWidth / 2;
  const yMin = -bDepth / 2;
  const yMax = bDepth / 2;

  // ViewBox with padding
  const totalViewWidth = bWidth + PADDING * 2;
  const totalViewHeight = bDepth + PADDING * 2;
  const viewBoxX = xMin - PADDING;
  const viewBoxY = yMin - PADDING;
  const viewBox = `${viewBoxX} ${viewBoxY} ${totalViewWidth} ${totalViewHeight}`;

  // Central corridor & staircase core
  const corridor = {
    x: xMin + 1,
    y: -1.5,
    width: bWidth - 2,
    depth: 3
  };

  const staircase = {
    x: xMax - 9.5,
    y: -1.4,
    width: 8.5,
    depth: 2.8
  };

  const elevatorCore = {
    x: xMin + 1.5,
    y: -1.4,
    width: 5.5,
    depth: 2.8
  };

  // Filtered rooms
  const roomsToDisplay = useMemo(() => {
    if (filterType === 'ALL') return currentFloor.rooms || [];
    return (currentFloor.rooms || []).filter((r) => {
      if (filterType === 'LAB') return r.type.toLowerCase().includes('lab');
      if (filterType === 'CLASS') return r.type.toLowerCase().includes('class') || r.type.toLowerCase().includes('tutorial');
      if (filterType === 'ADMIN') return r.type.toLowerCase().includes('admin') || r.type.toLowerCase().includes('reception');
      return true;
    });
  }, [currentFloor, filterType]);

  const getRoomColors = (room, isSelected, isHovered) => {
    if (isSelected) {
      return {
        fill: '#0284C7',
        fillOpacity: 0.9,
        stroke: '#0369A1',
        strokeWidth: '0.4',
        textColor: '#FFFFFF',
        subTextColor: '#E0F2FE'
      };
    }
    if (isHovered) {
      return {
        fill: '#38BDF8',
        fillOpacity: 0.45,
        stroke: '#0284C7',
        strokeWidth: '0.3',
        textColor: '#0F172A',
        subTextColor: '#0369A1'
      };
    }
    const t = (room.type || '').toLowerCase();
    if (t.includes('lab')) {
      return {
        fill: '#EEF2FF',
        fillOpacity: 0.85,
        stroke: '#6366F1',
        strokeWidth: '0.2',
        textColor: '#312E81',
        subTextColor: '#4F46E5'
      };
    }
    if (t.includes('admin') || t.includes('reception')) {
      return {
        fill: '#ECFDF5',
        fillOpacity: 0.85,
        stroke: '#10B981',
        strokeWidth: '0.2',
        textColor: '#064E3B',
        subTextColor: '#059669'
      };
    }
    if (t.includes('seminar') || t.includes('tutorial')) {
      return {
        fill: '#FFFBEB',
        fillOpacity: 0.85,
        stroke: '#F59E0B',
        strokeWidth: '0.2',
        textColor: '#78350F',
        subTextColor: '#D97706'
      };
    }
    // Default classroom
    return {
      fill: '#EFF6FF',
      fillOpacity: 0.85,
      stroke: '#3B82F6',
      strokeWidth: '0.2',
      textColor: '#1E3A8A',
      subTextColor: '#2563EB'
    };
  };

  const handleUnitClick = (room) => {
    selectRoom(room.id, { focus: true });
  };

  return (
    <div className="fade-in space-y-4 pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              2D Architectural Floor Cadastre
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium flex items-center gap-1">
              <MapPin size={12} className="text-cipher-govblue" />
              {bld.name} ({bld.ulpin2D})
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            Floor Blueprint &amp; 3D ULPIN Spatial Mapping — {bld.name}
          </h1>
        </div>

        <button
          onClick={() => {
            setViewMode('3d');
            setCurrentPage('explorer');
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cipher-govblue text-white text-xs font-bold hover:bg-cipher-navy transition-all shadow-subtle self-start sm:self-auto"
        >
          <Building2 size={14} /> Open 3D Digital Twin
        </button>
      </div>

      {/* Building Overview Banner */}
      <div className="bg-white border border-cipher-border rounded-xl p-4 shadow-subtle grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-[10px] text-cipher-muted uppercase font-semibold">BUILDING NAME</div>
          <div className="font-bold text-cipher-navy text-sm mt-0.5">{bld.name}</div>
          <div className="text-[11px] text-cipher-muted truncate">{bld.institution}</div>
        </div>
        <div>
          <div className="text-[10px] text-cipher-muted uppercase font-semibold">2D LAND ULPIN</div>
          <div className="mono font-bold text-cipher-navy text-xs mt-0.5">{bld.ulpin2D}</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
            <CheckCircle2 size={11} /> Cadastral Record Verified
          </div>
        </div>
        <div>
          <div className="text-[10px] text-cipher-muted uppercase font-semibold">FOOTPRINT DIMENSIONS</div>
          <div className="font-bold text-cipher-navy text-xs mt-0.5 mono">
            {bld.footprintWidthM}m × {bld.footprintDepthM}m
          </div>
          <div className="text-[11px] text-cipher-muted">{floors.length} Spatial Floor Levels</div>
        </div>
        <div>
          <div className="text-[10px] text-cipher-muted uppercase font-semibold">PROPERTY TYPE</div>
          <div className="font-bold text-cipher-navy text-xs mt-0.5">{bld.propertyType}</div>
          <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
            <ShieldCheck size={11} /> Geometry: {bld.prototypeStatus || 'Prototype'}
          </div>
        </div>
      </div>

      {/* Floor Selection & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-cipher-border rounded-xl shadow-subtle">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-cipher-navy uppercase tracking-wider mr-1 shrink-0">
            Select Level:
          </span>
          {floors.map((fl, idx) => (
            <button
              key={fl.id}
              onClick={() => setActiveFloorIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
                activeFloorIndex === idx
                  ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-subtle'
                  : 'bg-white text-cipher-navy border-cipher-border hover:bg-slate-50'
              }`}
            >
              {fl.name} ({fl.rooms?.length || 0} Units)
            </button>
          ))}
        </div>

        {/* Room Type Filter */}
        <div className="flex items-center gap-1.5 text-xs self-end sm:self-auto">
          <span className="text-[10px] uppercase font-bold text-cipher-muted">Filter:</span>
          {['ALL', 'CLASS', 'LAB', 'ADMIN'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                filterType === type
                  ? 'bg-cipher-navy text-white border-cipher-navy'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type === 'ALL' ? 'All Units' : type === 'CLASS' ? 'Classrooms' : type === 'LAB' ? 'Labs' : 'Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Floor Blueprint + Property Panel Split */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        {/* Left: 2D Architectural Blueprint Plan (Light Theme CAD View) */}
        <div className="gov-card p-4 flex flex-col min-h-[560px] bg-white">
          {/* Blueprint Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cipher-border mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-cipher-navy">
                  {currentFloor.name} Top-Down Plan
                </h3>
                <span className="mono text-[10px] font-bold text-cipher-govblue bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  +{currentFloor.elevation.toFixed(1)}m ELEVATION
                </span>
              </div>
              <p className="text-[11px] text-cipher-muted mt-0.5">
                Click any spatial room unit to generate its 3D ULPIN and view cadastral measurements.
              </p>
            </div>

            {/* Zoom / View controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
                className="p-1.5 rounded-lg border border-cipher-border bg-slate-50 hover:bg-slate-100 text-cipher-navy"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                className="p-1.5 rounded-lg border border-cipher-border bg-slate-50 hover:bg-slate-100 text-cipher-navy"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg border border-cipher-border bg-slate-50 hover:bg-slate-100 text-cipher-navy"
                title="Reset View"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* SVG Blueprint Canvas in Clean Light Architectural CAD Theme */}
          <div className="flex-1 w-full min-h-[440px] rounded-xl bg-[#F8FAFC] border border-slate-200 overflow-hidden relative flex items-center justify-center p-2 shadow-inner">
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg
                viewBox={viewBox}
                className="w-full h-full max-h-[480px] select-none"
              >
                <defs>
                  {/* Clean CAD Grid Pattern */}
                  <pattern id="lightCadGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                    <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#E2E8F0" strokeWidth="0.08" />
                  </pattern>
                  {/* Corridor Hatch Pattern */}
                  <pattern id="lightCorridorHatch" width="2" height="2" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="2" stroke="#CBD5E1" strokeWidth="0.15" />
                  </pattern>
                  {/* Staircase Hatch Pattern */}
                  <pattern id="lightStairHatch" width="1.2" height="1.2" patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0.6" x2="1.2" y2="0.6" stroke="#F59E0B" strokeWidth="0.12" opacity="0.6" />
                  </pattern>
                </defs>

                {/* Grid Background */}
                <rect
                  x={viewBoxX}
                  y={viewBoxY}
                  width={totalViewWidth}
                  height={totalViewHeight}
                  fill="url(#lightCadGrid)"
                />

                {/* Outer Building Footprint Boundary */}
                <rect
                  x={xMin}
                  y={yMin}
                  width={bWidth}
                  height={bDepth}
                  fill="#FFFFFF"
                  stroke="#64748B"
                  strokeWidth="0.3"
                  strokeDasharray="1.5 1"
                  rx="0.4"
                />

                {/* Central Corridor */}
                <rect
                  x={corridor.x}
                  y={corridor.y}
                  width={corridor.width}
                  height={corridor.depth}
                  fill="#F1F5F9"
                  stroke="#94A3B8"
                  strokeWidth="0.15"
                />
                <rect
                  x={corridor.x}
                  y={corridor.y}
                  width={corridor.width}
                  height={corridor.depth}
                  fill="url(#lightCorridorHatch)"
                  opacity="0.4"
                />
                <text
                  x={0}
                  y={0.35}
                  fontSize="0.9"
                  fill="#475569"
                  letterSpacing="0.12"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  CENTRAL CORRIDOR ({bWidth}m × {corridor.depth}m)
                </text>

                {/* Staircase / Core Zone */}
                <g>
                  <rect
                    x={staircase.x}
                    y={staircase.y}
                    width={staircase.width}
                    height={staircase.depth}
                    fill="#FEF3C7"
                    stroke="#D97706"
                    strokeWidth="0.2"
                    rx="0.2"
                  />
                  <rect
                    x={staircase.x}
                    y={staircase.y}
                    width={staircase.width}
                    height={staircase.depth}
                    fill="url(#lightStairHatch)"
                  />
                  <text
                    x={staircase.x + staircase.width / 2}
                    y={staircase.y + staircase.depth / 2 + 0.3}
                    fontSize="0.8"
                    fill="#92400E"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    STAIRCASE
                  </text>
                </g>

                {/* Lift / Access Shaft */}
                <g>
                  <rect
                    x={elevatorCore.x}
                    y={elevatorCore.y}
                    width={elevatorCore.width}
                    height={elevatorCore.depth}
                    fill="#EEF2FF"
                    stroke="#6366F1"
                    strokeWidth="0.2"
                    rx="0.2"
                  />
                  <text
                    x={elevatorCore.x + elevatorCore.width / 2}
                    y={elevatorCore.y + elevatorCore.depth / 2 + 0.3}
                    fontSize="0.75"
                    fill="#3730A3"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    ELEVATOR
                  </text>
                </g>

                {/* Dimensions (Top Width & Left Depth) */}
                <line x1={xMin} y1={yMin - 2} x2={xMax} y2={yMin - 2} stroke="#94A3B8" strokeWidth="0.12" />
                <line x1={xMin} y1={yMin - 2.8} x2={xMin} y2={yMin - 1.2} stroke="#94A3B8" strokeWidth="0.12" />
                <line x1={xMax} y1={yMin - 2.8} x2={xMax} y2={yMin - 1.2} stroke="#94A3B8" strokeWidth="0.12" />
                <text x={0} y={yMin - 2.5} fontSize="0.95" fill="#475569" textAnchor="middle" fontWeight="bold">
                  WIDTH: {bWidth.toFixed(1)}m
                </text>

                <line x1={xMin - 2} y1={yMin} x2={xMin - 2} y2={yMax} stroke="#94A3B8" strokeWidth="0.12" />
                <line x1={xMin - 2.8} y1={yMin} x2={xMin - 1.2} y2={yMin} stroke="#94A3B8" strokeWidth="0.12" />
                <line x1={xMin - 2.8} y1={yMax} x2={xMin - 1.2} y2={yMax} stroke="#94A3B8" strokeWidth="0.12" />
                <text
                  x={xMin - 2.5}
                  y={0.3}
                  fontSize="0.95"
                  fill="#475569"
                  textAnchor="middle"
                  fontWeight="bold"
                  transform={`rotate(-90 ${xMin - 2.5} 0.3)`}
                >
                  DEPTH: {bDepth.toFixed(1)}m
                </text>

                {/* Rooms Rendering with Accurate Cadastral Coordinates */}
                {roomsToDisplay.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  const isHovered = hoveredRoomId === room.id;
                  const colors = getRoomColors(room, isSelected, isHovered);
                  const roomArea = (room.width * room.depth).toFixed(0);

                  const centerX = room.x + room.width / 2;
                  const centerY = room.y + room.depth / 2;

                  return (
                    <g
                      key={room.id}
                      onClick={() => handleUnitClick(room)}
                      onMouseEnter={() => setHoveredRoomId(room.id)}
                      onMouseLeave={() => setHoveredRoomId(null)}
                      className="cursor-pointer"
                    >
                      {/* Room Boundary Rect */}
                      <rect
                        x={room.x}
                        y={room.y}
                        width={room.width}
                        height={room.depth}
                        fill={colors.fill}
                        fillOpacity={colors.fillOpacity}
                        stroke={colors.stroke}
                        strokeWidth={colors.strokeWidth}
                        rx="0.3"
                      />

                      {/* Selected Room Highlight Ring */}
                      {isSelected && (
                        <rect
                          x={room.x - 0.2}
                          y={room.y - 0.2}
                          width={room.width + 0.4}
                          height={room.depth + 0.4}
                          fill="none"
                          stroke="#0284C7"
                          strokeWidth="0.25"
                          strokeDasharray="0.8 0.4"
                          rx="0.4"
                        />
                      )}

                      {/* Room Name */}
                      <text
                        x={centerX}
                        y={centerY - 0.6}
                        fontSize="1.1"
                        fill={colors.textColor}
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {room.name}
                      </text>

                      {/* Room Type */}
                      <text
                        x={centerX}
                        y={centerY + 0.6}
                        fontSize="0.75"
                        fill={colors.subTextColor}
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        {room.type}
                      </text>

                      {/* Room Area */}
                      <text
                        x={centerX}
                        y={centerY + 1.6}
                        fontSize="0.65"
                        fill={colors.subTextColor}
                        textAnchor="middle"
                        opacity="0.9"
                      >
                        {roomArea} m²
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Compass / Orientation Overlay */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-2 flex flex-col items-center shadow-md">
              <Compass size={18} className="text-cipher-govblue" />
              <span className="text-[9px] font-bold text-cipher-navy mt-0.5 tracking-wider">NORTH</span>
            </div>

            {/* Scale Metric Bar */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 shadow-md text-[10px]">
              <span className="text-slate-500 font-medium">CAD Scale:</span>
              <div className="flex items-center gap-1 font-mono text-cipher-govblue font-bold">
                <span className="w-8 h-1 bg-cipher-govblue inline-block rounded-sm"></span>
                <span>5.0m</span>
              </div>
            </div>
          </div>

          {/* Blueprint Footer / Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-cipher-border mt-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-bold text-cipher-navy">Legend:</span>
              <div className="flex items-center gap-1.5 text-[11px] text-cipher-muted">
                <span className="w-3 h-3 rounded bg-blue-100 border border-blue-500"></span>
                Classrooms
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-cipher-muted">
                <span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-500"></span>
                Laboratories
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-cipher-muted">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500"></span>
                Admin / Reception
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-cipher-muted">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-500"></span>
                Seminar / Core
              </div>
            </div>

            <span className="text-[11px] text-cipher-muted italic">
              * Click any unit to update 3D ULPIN and property metadata
            </span>
          </div>
        </div>

        {/* Right: Property Panel (Synchronized with selected unit & floor) */}
        <div className="h-full min-h-[520px]">
          <PropertyPanel />
        </div>
      </div>

      {/* Floor Unit Directory Cards */}
      <div className="gov-card p-4 bg-white">
        <div className="flex items-center justify-between pb-2 border-b border-cipher-border mb-3">
          <div>
            <h3 className="text-sm font-bold text-cipher-navy">
              {currentFloor.name} Registered Units ({roomsToDisplay.length} Units)
            </h3>
            <p className="text-xs text-cipher-muted">
              Click any cadastral card to inspect its generated 3D ULPIN and spatial coordinates.
            </p>
          </div>
          <span className="mono text-xs font-bold text-cipher-govblue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
            LEVEL: {currentFloor.shortName.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {roomsToDisplay.map((rm) => {
            const isSel = selectedRoom?.id === rm.id;
            return (
              <div
                key={rm.id}
                onClick={() => handleUnitClick(rm)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSel
                    ? 'bg-blue-50 border-cipher-govblue shadow-subtle ring-2 ring-cipher-govblue/20'
                    : 'bg-white border-cipher-border hover:border-cipher-govblue hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-cipher-navy text-xs">{rm.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-cipher-muted font-medium">
                    {rm.type}
                  </span>
                </div>
                <div className="text-[10px] text-cipher-govblue mono font-bold break-all mb-2">
                  {rm.id}
                </div>
                <div className="flex items-center justify-between text-[10px] text-cipher-muted pt-2 border-t border-cipher-borderLight">
                  <span>Size: {rm.width.toFixed(1)}m × {rm.depth.toFixed(1)}m</span>
                  <span className="font-semibold text-cipher-navy">{(rm.width * rm.depth).toFixed(0)} m²</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Layers, Building2, MapPin, CheckCircle2, ShieldCheck,
  Copy, Check, ArrowUp, ArrowDown, X, Lock,
} from 'lucide-react';
import { generate3DULPIN } from '../utils/ulpin.js';
import { calculateArea } from '../utils/geometry.js';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';

// ─── Room type colour scheme ───────────────────────────────────────────────────
const ROOM_TYPE_COLORS = {
  'Classroom':          { bg: '#DBEAFE', border: '#93C5FD', label: '#1D4ED8', text: '#1E40AF' },
  'Common Laboratory':  { bg: '#EDE9FE', border: '#C4B5FD', label: '#7C3AED', text: '#5B21B6' },
  'Tutorial Room':      { bg: '#D1FAE5', border: '#6EE7B7', label: '#059669', text: '#065F46' },
  'Seminar Hall':       { bg: '#FEF3C7', border: '#FCD34D', label: '#D97706', text: '#92400E' },
  'Administrative Office': { bg: '#FEE2E2', border: '#FCA5A5', label: '#DC2626', text: '#991B1B' },
  'Reception':          { bg: '#E0F2FE', border: '#7DD3FC', label: '#0284C7', text: '#075985' },
};
const DEFAULT_ROOM_COLOR = { bg: '#F1F5F9', border: '#94A3B8', label: '#475569', text: '#1E293B' };

function getRoomColor(type) {
  return ROOM_TYPE_COLORS[type] || DEFAULT_ROOM_COLOR;
}

// ─── Visual Floor Plan SVG ─────────────────────────────────────────────────────
function FloorPlanSVG({ floor, building, selectedRoomId, onSelectRoom, onHoverRoom, hoveredRoomId }) {
  const W = building.footprintWidthM || 60;
  const D = building.footprintDepthM || 20;

  // SVG viewport: we use 800×480 with padding
  const PAD = 28;
  const SVG_W = 800;
  const SVG_H = 460;
  const scaleX = (SVG_W - PAD * 2) / (W + 6);
  const scaleY = (SVG_H - PAD * 2) / (D + 6);
  const scale = Math.min(scaleX, scaleY);

  // Centre the building
  const bldPixW = W * scale;
  const bldPixH = D * scale;
  const offX = (SVG_W - bldPixW) / 2;
  const offY = (SVG_H - bldPixH) / 2;

  // Convert building-space coords (origin = centre of footprint) to SVG px
  const toSVG = (bx, by) => [
    offX + (bx + W / 2) * scale,
    offY + (by + D / 2) * scale,
  ];

  // Corridor strip (from buildingData.js constants)
  const CORRIDOR_DEPTH = 3;
  const [cx0, cy0] = toSVG(-W / 2, -CORRIDOR_DEPTH / 2);
  const corrW = bldPixW;
  const corrH = CORRIDOR_DEPTH * scale;

  // Stair core
  const STAIR_W = 8;
  const STAIR_X_CENTRE = W / 2 - STAIR_W / 2 - 1;
  const [sx, sy] = toSVG(STAIR_X_CENTRE - STAIR_W / 2, -CORRIDOR_DEPTH / 2);
  const stairW = STAIR_W * scale;
  const stairH = CORRIDOR_DEPTH * scale;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full h-full"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Background */}
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#F8F9FA" />

      {/* Fine grid */}
      {Array.from({ length: 16 }, (_, i) => (
        <line key={`vg${i}`} x1={i * (SVG_W / 16)} y1="0" x2={i * (SVG_W / 16)} y2={SVG_H}
          stroke="#E2E8F0" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`hg${i}`} x1="0" y1={i * (SVG_H / 10)} x2={SVG_W} y2={i * (SVG_H / 10)}
          stroke="#E2E8F0" strokeWidth="0.5" />
      ))}

      {/* ── Building envelope ── */}
      <rect
        x={offX} y={offY}
        width={bldPixW} height={bldPixH}
        fill="#FFFFFF" stroke="#334155" strokeWidth="2.5"
        rx="2"
      />

      {/* ── Corridor strip ── */}
      <rect
        x={cx0} y={cy0}
        width={corrW} height={corrH}
        fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1"
      />
      <text
        x={offX + bldPixW / 2} y={cy0 + corrH / 2 + 3.5}
        textAnchor="middle" fontSize="9" fill="#64748B" fontWeight="600"
      >
        CORRIDOR
      </text>

      {/* ── Stair/core zone ── */}
      <rect
        x={sx} y={sy}
        width={stairW} height={stairH}
        fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5"
      />
      {/* Stair hatch lines */}
      {Array.from({ length: 5 }, (_, i) => (
        <line
          key={`sh${i}`}
          x1={sx} y1={sy + (i + 1) * stairH / 5}
          x2={sx + stairW} y2={sy + (i + 1) * stairH / 5}
          stroke="#94A3B8" strokeWidth="0.8"
        />
      ))}
      <text x={sx + stairW / 2} y={sy - 4}
        textAnchor="middle" fontSize="7.5" fill="#475569" fontWeight="700">
        STAIR
      </text>

      {/* ── Rooms ── */}
      {floor.rooms.map((rm) => {
        const isHovered = hoveredRoomId === rm.id;
        const isSelected = selectedRoomId === rm.id;
        const col = getRoomColor(rm.type);

        // room.x and room.y are in building-space (origin = NW corner offset from centre)
        // From buildingData.js: room.x = startX + i*roomWidth - roomWidth/2 (left edge)
        // room.y = northZ - roomDepth/2 (top edge for north side)
        // These are already centred-origin coords
        const [rx, ry] = toSVG(rm.x, rm.y);
        const rw = rm.width * scale;
        const rh = rm.depth * scale;

        return (
          <g
            key={rm.id}
            onClick={() => onSelectRoom(rm.id)}
            onMouseEnter={() => onHoverRoom(rm.id)}
            onMouseLeave={() => onHoverRoom(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Selection/hover glow */}
            {(isSelected || isHovered) && (
              <rect
                x={rx - 3} y={ry - 3}
                width={rw + 6} height={rh + 6}
                rx="4"
                fill={col.border}
                fillOpacity={isSelected ? 0.4 : 0.2}
                stroke="none"
              />
            )}

            {/* Room rectangle */}
            <rect
              x={rx} y={ry}
              width={rw} height={rh}
              rx="2"
              fill={isSelected ? col.bg : (isHovered ? col.bg : '#FFFFFF')}
              fillOpacity={isSelected ? 1 : isHovered ? 0.9 : 0.85}
              stroke={isSelected ? col.label : (isHovered ? col.border : '#94A3B8')}
              strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 1}
              style={{ transition: 'fill-opacity 0.12s, stroke-width 0.12s, stroke 0.12s' }}
            />

            {/* Room name */}
            {rw > 30 && rh > 18 && (
              <text
                x={rx + rw / 2} y={ry + rh / 2 - (rh > 30 ? 5 : 0)}
                textAnchor="middle"
                fontSize={Math.min(10, rw / 6)}
                fontWeight="800"
                fill={isSelected ? col.label : '#334155'}
              >
                {rm.name}
              </text>
            )}

            {/* Room type (smaller text) */}
            {rw > 45 && rh > 32 && (
              <text
                x={rx + rw / 2} y={ry + rh / 2 + 8}
                textAnchor="middle"
                fontSize={Math.min(7.5, rw / 8)}
                fontWeight="500"
                fill={isSelected ? col.text : '#64748B'}
                fillOpacity="0.9"
              >
                {rm.type.length > 14 ? rm.type.slice(0, 13) + '…' : rm.type}
              </text>
            )}

            {/* Area label bottom-right */}
            {rw > 45 && rh > 40 && (
              <text
                x={rx + rw - 3} y={ry + rh - 3}
                textAnchor="end"
                fontSize="6.5"
                fill="#94A3B8"
                fontWeight="600"
              >
                {(rm.width * rm.depth).toFixed(0)}m²
              </text>
            )}
          </g>
        );
      })}

      {/* ── Dimension annotations ── */}
      {/* Width annotation */}
      <line x1={offX} y1={SVG_H - 14} x2={offX + bldPixW} y2={SVG_H - 14}
        stroke="#64748B" strokeWidth="1" markerEnd="url(#arrowR)" markerStart="url(#arrowL)" />
      <text x={offX + bldPixW / 2} y={SVG_H - 4}
        textAnchor="middle" fontSize="9" fill="#64748B" fontWeight="600">
        {W.toFixed(0)} m
      </text>

      {/* Depth annotation */}
      <line x1={14} y1={offY} x2={14} y2={offY + bldPixH}
        stroke="#64748B" strokeWidth="1" />
      <text
        x={8} y={offY + bldPixH / 2}
        textAnchor="middle" fontSize="9" fill="#64748B" fontWeight="600"
        transform={`rotate(-90, 8, ${offY + bldPixH / 2})`}
      >
        {D.toFixed(0)} m
      </text>

      {/* North arrow (top-right of SVG) */}
      <g transform={`translate(${SVG_W - 36}, 20)`}>
        <polygon points="10,2 14,18 10,14 6,18" fill="#1E3A8A" />
        <polygon points="10,28 6,12 10,16 14,12" fill="#CBD5E1" />
        <circle cx="10" cy="15" r="2" fill="#1E3A8A" />
        <text x="10" y="38" textAnchor="middle" fontSize="8" fontWeight="800" fill="#1E3A8A">N</text>
      </g>

      {/* Arrow markers def */}
      <defs>
        <marker id="arrowR" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L4,2.5 L0,5" fill="none" stroke="#64748B" strokeWidth="1" />
        </marker>
        <marker id="arrowL" markerWidth="5" markerHeight="5" refX="0" refY="2.5" orient="auto-start-reverse">
          <path d="M0,0 L4,2.5 L0,5" fill="none" stroke="#64748B" strokeWidth="1" />
        </marker>
      </defs>
    </svg>
  );
}

// ─── Compact Room Details Panel ────────────────────────────────────────────────
function RoomDetailsPanel({ room, buildingData, allRooms, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!room) {
    return (
      <div className="gov-card p-4 h-full flex flex-col items-center justify-center text-center gap-3">
        <Layers size={28} className="text-slate-300" />
        <p className="text-xs text-cipher-muted max-w-[160px]">
          Click any room on the floor plan to see its ULPIN and cadastral details.
        </p>
      </div>
    );
  }

  const ulpin3D = generate3DULPIN(buildingData.building, room.floorId, room.number);
  const area = calculateArea(room);
  const { above, below, stack } = detectVerticalStack(room, allRooms);
  const col = getRoomColor(room.type);

  const handleCopy = () => {
    navigator.clipboard?.writeText(ulpin3D);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="gov-card p-4 h-full overflow-y-auto flex flex-col gap-3 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between pb-2.5 border-b border-cipher-border">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-cipher-govblue">
            Cadastral Property Record
          </div>
          <h2 className="text-base font-extrabold text-cipher-navy mt-0.5">{room.name}</h2>
          <span
            className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold border"
            style={{ backgroundColor: col.bg, borderColor: col.border, color: col.text }}
          >
            {room.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-cipher-text p-1 rounded hover:bg-slate-100 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* ULPIN identifier */}
      <div className="p-3 rounded-lg bg-slate-50 border border-cipher-border">
        <div className="flex items-center justify-between text-[10px] text-cipher-muted uppercase font-semibold mb-1">
          <span>ULPIN Identifier</span>
          <span className="flex items-center gap-1 text-cipher-success font-medium normal-case">
            <CheckCircle2 size={10} /> Verified
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="mono text-[11px] font-bold text-cipher-navy break-all select-all flex-1">
            {ulpin3D}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 p-1.5 rounded hover:bg-white border border-transparent hover:border-cipher-border text-cipher-muted hover:text-cipher-navy transition-all"
            title="Copy ULPIN"
          >
            {copied ? <Check size={13} className="text-cipher-success" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Metadata grid */}
      <div>
        <div className="text-[10px] font-bold text-cipher-navy uppercase tracking-wide mb-1.5">
          Spatial & Cadastral Metadata
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            ['SURVEY NO', `${room.name.replace('-', '')}/2A`],
            ['PROPERTY TYPE', room.type],
            ['PARCEL AREA', `${area} m²`],
            ['VERTICAL LEVEL', `+${room.elevation.toFixed(1)} m (${room.floorShortName})`],
            ['DISTRICT/TALUK', buildingData.building.district],
            ['CADASTRE STATUS', 'Verified Record'],
          ].map(([k, v]) => (
            <div key={k} className="p-2 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[9px] text-cipher-muted font-semibold">{k}</div>
              <div className="font-semibold text-cipher-navy mt-0.5 text-[11px] leading-tight">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical structure */}
      <div className="pt-2 border-t border-cipher-border">
        <div className="text-[10px] font-bold text-cipher-navy uppercase tracking-wide mb-1.5 flex items-center justify-between">
          <span>Vertical Cadastral Structure</span>
          <span className="text-cipher-muted font-normal">{stack.length} stacked</span>
        </div>
        <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-border font-mono text-[10px] space-y-1 text-cipher-muted">
          <div className="flex items-center gap-1 text-cipher-navy font-semibold">
            <span className="text-slate-400">LAND</span> TN-TRY-SCE-001
          </div>
          <div className="flex items-center gap-1 pl-3 border-l-2 border-slate-200">
            <span className="text-slate-400">└── BLDG</span> {buildingData.building.name}
          </div>
          <div className="flex items-center gap-1 pl-6 border-l-2 border-slate-200 text-cipher-govblue">
            <span className="text-slate-400">└── FLOOR</span> {room.floorName}
          </div>
          <div className="flex items-center gap-1 pl-9 border-l-2 border-cipher-govblue text-cipher-govblue font-bold bg-blue-50/80 py-0.5 rounded">
            <span>└── UNIT</span> {room.name}
          </div>
        </div>

        {/* Above/Below navigation */}
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {[
            { unit: above, dir: 'Above', Icon: ArrowUp },
            { unit: below, dir: 'Below', Icon: ArrowDown },
          ].map(({ unit, dir, Icon }) => (
            <button
              key={dir}
              disabled={!unit}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-cipher-border hover:border-cipher-govblue disabled:opacity-40 text-left transition-colors text-xs"
            >
              <span className="flex items-center gap-1 text-cipher-muted text-[11px]">
                <Icon size={11} className="text-cipher-govblue" />{dir}
              </span>
              <span className="font-semibold text-cipher-navy mono text-[10px] truncate ml-1">
                {unit ? unit.name : '—'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Integrity footer */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-cipher-border flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-1.5">
          <Lock size={12} className="text-cipher-govblue" />
          <span className="text-cipher-muted text-[10px]">Record Integrity:</span>
          <span className="font-semibold text-cipher-success text-[10px]">✓ Validated</span>
        </div>
        <span className="text-[9px] text-cipher-muted mono">Audit: 2026</span>
      </div>
    </aside>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FloorMapping() {
  const {
    buildingData, selectedProperty, selectRoom, selectedRoom,
    setViewMode, setCurrentPage, allRooms, hoveredRoomId, setHoveredRoomId,
  } = useApp();
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);

  const bld = buildingData.building;
  const currentFloor = buildingData.floors[activeFloorIndex] || buildingData.floors[0];

  // Room type legend items derived from current floor
  const legendTypes = useMemo(() => {
    const seen = new Set();
    return currentFloor.rooms
      .map(r => r.type)
      .filter(t => { if (seen.has(t)) return false; seen.add(t); return true; });
  }, [currentFloor]);

  if (!selectedProperty && !bld) {
    return (
      <div className="fade-in p-8 text-center bg-white border border-cipher-border rounded-xl shadow-subtle flex flex-col items-center">
        <Building2 size={36} className="text-slate-400 mb-3" />
        <h2 className="text-lg font-bold text-cipher-navy mb-1">No Property Selected</h2>
        <p className="text-xs text-cipher-muted max-w-sm mb-4">
          Please select a building from the cadastral map to inspect its floor plans and unit layout.
        </p>
        <button
          onClick={() => { setViewMode('map'); setCurrentPage('dashboard'); }}
          className="px-4 py-2 bg-cipher-govblue text-white rounded-lg text-xs font-bold shadow-subtle hover:bg-cipher-navy transition-colors"
        >
          Select Building on Map
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in flex flex-col gap-4 pb-6 h-full min-h-0">

      {/* ── Header ── */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              2D Architectural Floor Cadastre
            </span>
            <span className="text-xs text-cipher-muted hidden sm:inline">·</span>
            <span className="text-xs text-cipher-muted font-medium hidden sm:flex items-center gap-1">
              <MapPin size={11} className="text-cipher-govblue" /> {bld.name} ({bld.ulpin2D})
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            Building & Floor Plans — {bld.name}
          </h1>
        </div>

        <button
          onClick={() => { setViewMode('3d'); setCurrentPage('dashboard'); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cipher-govblue text-white text-xs font-bold hover:bg-cipher-navy transition-all shadow-subtle shrink-0"
        >
          <Building2 size={14} /> Open 3D Digital Twin
        </button>
      </div>

      {/* ── Building meta strip ── */}
      <div className="shrink-0 bg-white border border-cipher-border rounded-xl p-3.5 shadow-subtle grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {[
          { label: 'BUILDING NAME', val: bld.name, sub: bld.institution },
          { label: '2D LAND ULPIN', val: bld.ulpin2D, mono: true, sub: <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={10} />Verified</span> },
          { label: 'FOOTPRINT', val: `${bld.footprintWidthM}m × ${bld.footprintDepthM}m`, mono: true, sub: `${buildingData.floors.length} Spatial Floors` },
          { label: 'PROPERTY TYPE', val: bld.propertyType, sub: <span className="text-amber-600 flex items-center gap-1"><ShieldCheck size={10} />Geometry: {bld.prototypeStatus}</span> },
        ].map(({ label, val, sub, mono }) => (
          <div key={label}>
            <div className="text-[10px] text-cipher-muted uppercase font-semibold">{label}</div>
            <div className={`font-bold text-cipher-navy text-sm mt-0.5 ${mono ? 'mono text-xs' : ''}`}>{val}</div>
            <div className="text-[11px] text-cipher-muted mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Floor Tabs ── */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-cipher-navy uppercase tracking-wider mr-1 shrink-0">Floor:</span>
        {buildingData.floors.map((fl, idx) => (
          <button
            key={fl.id}
            onClick={() => { setActiveFloorIndex(idx); selectRoom(null, { focus: false }); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
              activeFloorIndex === idx
                ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-subtle'
                : 'bg-white text-cipher-navy border-cipher-border hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {fl.name}
            <span className="ml-1.5 text-[10px] font-semibold opacity-70">
              ({fl.rooms.length} units)
            </span>
          </button>
        ))}
      </div>

      {/* ── Main content: SVG Floor Plan + Details Panel ── */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 min-h-0 overflow-hidden">

        {/* Floor Plan */}
        <div className="flex flex-col gap-0 gov-card overflow-hidden min-h-[400px]">
          {/* Floor plan header */}
          <div className="px-4 py-2.5 border-b border-cipher-border flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-bold text-cipher-navy">
                {currentFloor.name} Cadastral Layout
              </h3>
              <p className="text-[11px] text-cipher-muted">
                {currentFloor.rooms.length} Units Surveyed · +{currentFloor.elevation.toFixed(1)} m elevation
              </p>
            </div>
            <span className="mono text-xs font-bold text-cipher-govblue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
              {currentFloor.shortName.toUpperCase()}
            </span>
          </div>

          {/* SVG plan */}
          <div className="flex-1 overflow-hidden">
            <FloorPlanSVG
              floor={currentFloor}
              building={bld}
              selectedRoomId={selectedRoom?.id}
              hoveredRoomId={hoveredRoomId}
              onSelectRoom={(id) => selectRoom(id, { focus: false })}
              onHoverRoom={setHoveredRoomId}
            />
          </div>

          {/* Legend */}
          <div className="px-4 py-2 border-t border-cipher-border shrink-0 flex items-center gap-4 flex-wrap">
            <span className="text-[10px] font-bold text-cipher-muted uppercase tracking-wider">Legend:</span>
            {legendTypes.map(type => {
              const col = getRoomColor(type);
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-sm border"
                    style={{ backgroundColor: col.bg, borderColor: col.border }}
                  />
                  <span className="text-[10px] text-cipher-text font-medium">{type}</span>
                </div>
              );
            })}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-200 border border-slate-400" />
              <span className="text-[10px] text-cipher-text font-medium">Corridor / Core</span>
            </div>
          </div>
        </div>

        {/* Details panel */}
        <div className="min-h-[300px] xl:h-full overflow-hidden">
          <RoomDetailsPanel
            room={selectedRoom}
            buildingData={buildingData}
            allRooms={allRooms}
            onClose={() => selectRoom(null, { focus: false })}
          />
        </div>
      </div>
    </div>
  );
}

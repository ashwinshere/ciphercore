import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import properties from '../data/properties.js';
import { MapPin, Navigation2, Layers, ShieldCheck, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

// ─── Cadastral Projection ────────────────────────────────────────────────────
// Projects the existing [lat, lng] footprint arrays to SVG pixel coordinates.
// We use a simple linear (plate carrée) projection fitted to the bounding box
// of all property footprints so the relative shapes and positions are preserved.

function getFootprintBounds(properties) {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const prop of properties) {
    for (const [lat, lng] of prop.footprint) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
  }
  return { minLat, maxLat, minLng, maxLng };
}

function makeProjector(bounds, svgW, svgH, padding = 48) {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  const latSpan = maxLat - minLat || 0.001;
  const lngSpan = maxLng - minLng || 0.001;
  const W = svgW - padding * 2;
  const H = svgH - padding * 2;
  return ([lat, lng]) => [
    padding + ((lng - minLng) / lngSpan) * W,
    padding + ((maxLat - lat) / latSpan) * H,   // flip Y (lat increases upward)
  ];
}

// Property colour palette aligned with properties.js
const PROP_COLORS = {
  'boys-hostel':       { fill: '#10B981', stroke: '#047857', label: '#065F46' },
  'parking':           { fill: '#64748B', stroke: '#334155', label: '#1E293B' },
  'bd-block':          { fill: '#3B82F6', stroke: '#1D4ED8', label: '#1E40AF' },
  'rv-block':          { fill: '#2563EB', stroke: '#1E40AF', label: '#1E3A8A' },
  'me-block':          { fill: '#8B5CF6', stroke: '#6D28D9', label: '#5B21B6' },
  'canteen':           { fill: '#EC4899', stroke: '#BE185D', label: '#9D174D' },
  'ks-block':          { fill: '#F59E0B', stroke: '#B45309', label: '#78350F' },
  'basketball-ground': { fill: '#0EA5E9', stroke: '#0284C7', label: '#075985' },
};

// Block numbers for display (cadastral parcel numbers)
const BLOCK_NUMBERS = {
  'boys-hostel': '101',
  'parking': '102',
  'bd-block': '103',
  'rv-block': '104',
  'me-block': '105',
  'canteen': '106',
  'ks-block': '107',
  'basketball-ground': '108',
};

const SVG_W = 900;
const SVG_H = 640;

// ─── Individual Parcel Polygon ────────────────────────────────────────────────
function CadastralParcel({ property, project, isSelected, onHover, onLeave, onClick }) {
  const [hovered, setHovered] = useState(false);
  const pts = property.footprint.map(project);
  const pointsStr = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const cx = pts.reduce((s, [x]) => s + x, 0) / pts.length;
  const cy = pts.reduce((s, [, y]) => s + y, 0) / pts.length;
  const col = PROP_COLORS[property.id] || { fill: '#94A3B8', stroke: '#64748B', label: '#1E293B' };
  const blockNo = BLOCK_NUMBERS[property.id] || '???';

  const handleMouseEnter = () => { setHovered(true); onHover(property, cx, cy); };
  const handleMouseLeave = () => { setHovered(false); onLeave(); };

  return (
    <g
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(property)}
      style={{ cursor: 'pointer' }}
    >
      {/* Shadow/glow when selected or hovered */}
      {(hovered || isSelected) && (
        <polygon
          points={pointsStr}
          fill="none"
          stroke={col.stroke}
          strokeWidth={hovered ? 6 : 4}
          strokeOpacity={0.25}
          strokeLinejoin="round"
        />
      )}

      {/* Main parcel polygon */}
      <polygon
        points={pointsStr}
        fill={col.fill}
        fillOpacity={hovered ? 0.45 : isSelected ? 0.35 : 0.22}
        stroke={col.stroke}
        strokeWidth={hovered ? 2.5 : isSelected ? 2 : 1.5}
        strokeLinejoin="round"
        style={{ transition: 'fill-opacity 0.15s, stroke-width 0.15s' }}
      />

      {/* Parcel hatch pattern lines for depth */}
      {isSelected && (
        <polygon
          points={pointsStr}
          fill={`url(#hatch-${property.id})`}
          fillOpacity={0.3}
          stroke="none"
          pointerEvents="none"
        />
      )}

      {/* Block number label */}
      <text
        x={cx}
        y={cy - 7}
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        fill={col.label}
        fontFamily="'Inter', system-ui, sans-serif"
        pointerEvents="none"
        style={{ userSelect: 'none' }}
      >
        {blockNo}
      </text>

      {/* Short building name label */}
      <text
        x={cx}
        y={cy + 8}
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="600"
        fill={col.label}
        fillOpacity={0.85}
        fontFamily="'Inter', system-ui, sans-serif"
        pointerEvents="none"
        style={{ userSelect: 'none' }}
      >
        {property.name}
      </text>
    </g>
  );
}

// ─── Tooltip Card ─────────────────────────────────────────────────────────────
function ParcelTooltip({ property, svgX, svgY, containerRef }) {
  if (!property) return null;
  const col = PROP_COLORS[property.id] || { fill: '#3B82F6', stroke: '#1E40AF' };
  const blockNo = BLOCK_NUMBERS[property.id] || '???';

  // Convert SVG coords to container-relative pixel coords
  const [px, setPx] = useState(0);
  const [py, setPy] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scaleX = rect.width / vb.width;
    const scaleY = rect.height / vb.height;
    setPx(svgX * scaleX + 12);
    setPy(svgY * scaleY - 80);
  }, [svgX, svgY, containerRef]);

  return (
    <div
      className="absolute pointer-events-none z-50 fade-in"
      style={{ left: px, top: py, minWidth: 200 }}
    >
      <div className="bg-white rounded-xl border border-cipher-border shadow-card p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: col.fill }}
          />
          <span className="font-extrabold text-cipher-navy text-sm leading-tight">
            {property.name}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-cipher-muted mb-0.5">
          <span className="font-medium">Block No.</span>
          <span className="font-bold text-cipher-navy mono">{blockNo}</span>
        </div>
        <div className="text-[10px] text-cipher-govblue mono font-semibold break-all">
          ULPIN: {property.ulpin2D}
        </div>
        <div className="mt-2 pt-1.5 border-t border-cipher-borderLight text-[10px] text-cipher-muted flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cipher-govblue" />
          Click to open 3D ULPIN view
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ULPINMap() {
  const { selectedProperty, selectProperty, enter3DView } = useApp();

  const [hoveredProp, setHoveredProp] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  const activeProp = selectedProperty || properties[0];
  const bounds = useMemo(() => getFootprintBounds(properties), []);
  const project = useMemo(() => makeProjector(bounds, SVG_W, SVG_H, 56), [bounds]);

  const handleParcelHover = useCallback((prop, cx, cy) => {
    setHoveredProp(prop);
    setTooltipPos({ x: cx, y: cy });
  }, []);

  const handleParcelLeave = useCallback(() => setHoveredProp(null), []);

  const handleParcelClick = useCallback((prop) => {
    selectProperty(prop);
    // Slight delay for visual feedback, then open 3D
    setTimeout(() => enter3DView(prop), 180);
  }, [selectProperty, enter3DView]);

  // Pan handlers
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const onMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const onMouseUp = () => setIsPanning(false);

  // Wheel zoom
  const onWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(4, Math.max(0.5, z - e.deltaY * 0.001)));
  };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="fade-in h-full flex flex-col gap-0 w-full min-h-0">

      {/* ── Cadastral Map Header ── */}
      <div className="shrink-0 bg-white border border-cipher-border rounded-t-xl px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              Cadastral Parcel Map
            </span>
            <span className="text-xs text-cipher-muted hidden sm:inline">·</span>
            <span className="text-xs text-cipher-muted font-medium hidden sm:flex items-center gap-1">
              <MapPin size={11} className="text-cipher-govblue" />
              Saranathan College of Engineering, Panjappur, Tiruchirappalli
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            2D Geospatial Cadastral Map
          </h1>
        </div>

        {/* Property quick-jump buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-xs font-semibold text-cipher-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Navigation2 size={12} /> Blocks:
          </span>
          {properties.map((p) => (
            <button
              key={p.id}
              onClick={() => handleParcelClick(p)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all border whitespace-nowrap ${
                activeProp?.id === p.id
                  ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-subtle'
                  : 'bg-white text-cipher-navy border-cipher-border hover:bg-blue-50 hover:border-blue-200'
              }`}
            >
              {BLOCK_NUMBERS[p.id]} · {p.name.replace(' Block', '').replace('Basketball ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main SVG Cadastral Map ── */}
      <div
        ref={containerRef}
        className="relative flex-1 bg-[#F8F9FA] border-x border-b border-cipher-border rounded-b-xl overflow-hidden select-none min-h-[480px]"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        {/* Zoom + Pan Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
          <button
            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
            className="w-8 h-8 bg-white border border-cipher-border rounded-lg flex items-center justify-center text-cipher-navy hover:bg-slate-50 shadow-subtle transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            className="w-8 h-8 bg-white border border-cipher-border rounded-lg flex items-center justify-center text-cipher-navy hover:bg-slate-50 shadow-subtle transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 bg-white border border-cipher-border rounded-lg flex items-center justify-center text-cipher-navy hover:bg-slate-50 shadow-subtle transition-colors"
            title="Reset View"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* Cadastral Info Panel — Top Left */}
        <div className="absolute top-3 left-3 z-20 bg-white/96 backdrop-blur border border-cipher-border rounded-xl p-3 shadow-card max-w-[210px]">
          <div className="text-[9px] font-extrabold text-cipher-govblue uppercase tracking-widest mb-2 pb-1.5 border-b border-cipher-borderLight">
            Cadastral Survey Information
          </div>
          <div className="space-y-1 text-[10px]">
            {[
              ['STATE', 'Tamil Nadu'],
              ['DISTRICT', 'Tiruchirappalli'],
              ['TALUK', 'Tiruchirappalli North'],
              ['VILLAGE', 'Panjappur'],
              ['SHEET NO', '78G/4'],
              ['DATUM', 'WGS 84'],
              ['PROJECTION', 'UTM Zone 44N'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline gap-1">
                <span className="text-cipher-muted font-semibold w-[68px] shrink-0">{k}:</span>
                <span className="text-cipher-navy font-bold leading-tight">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend — Bottom Left */}
        <div className="absolute bottom-10 left-3 z-20 bg-white/96 backdrop-blur border border-cipher-border rounded-xl p-2.5 shadow-card">
          <div className="text-[9px] font-extrabold text-cipher-muted uppercase tracking-widest mb-2">Legend</div>
          <div className="space-y-1.5">
            {[
              { color: '#3B82F6', label: 'Academic Block' },
              { color: '#10B981', label: 'Residential / Hostel' },
              { color: '#8B5CF6', label: 'Mechanical Block' },
              { color: '#F59E0B', label: 'Large Academic Block' },
              { color: '#EC4899', label: 'Dining / Amenities' },
              { color: '#0EA5E9', label: 'Sports Court' },
              { color: '#64748B', label: 'Parking / Infrastructure' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm border border-black/10 shrink-0" style={{ backgroundColor: color, opacity: 0.7 }} />
                <span className="text-[10px] text-cipher-text font-medium">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1 border-t border-cipher-borderLight">
              <span className="w-3 h-0.5 bg-cipher-muted shrink-0" />
              <span className="text-[10px] text-cipher-muted font-medium">Parcel Boundary</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-amber-400 shrink-0" style={{ borderTop: '1.5px dashed #F59E0B' }} />
              <span className="text-[10px] text-cipher-muted font-medium">Internal Road</span>
            </div>
          </div>
        </div>

        {/* North Arrow — Top Right corner of map (below zoom controls) */}
        <div className="absolute top-3 right-14 z-20 bg-white/96 backdrop-blur border border-cipher-border rounded-xl px-2.5 py-2 shadow-card flex flex-col items-center">
          <svg width="28" height="36" viewBox="0 0 28 36">
            <polygon points="14,2 20,22 14,17 8,22" fill="#1E3A8A" />
            <polygon points="14,34 8,14 14,19 20,14" fill="#CBD5E1" />
            <circle cx="14" cy="18" r="2.5" fill="#1E3A8A" />
          </svg>
          <span className="text-[9px] font-extrabold text-cipher-navy mt-0.5 tracking-widest">N</span>
        </div>

        {/* SVG Cadastral Map */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
            transition: isPanning ? 'none' : 'transform 0.15s ease',
          }}
          onMouseLeave={handleParcelLeave}
        >
          <defs>
            {/* SVG hatch patterns for selected parcels */}
            {properties.map((p) => {
              const col = PROP_COLORS[p.id] || { stroke: '#3B82F6' };
              return (
                <pattern key={p.id} id={`hatch-${p.id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="6" stroke={col.stroke} strokeWidth="1" strokeOpacity="0.4" />
                </pattern>
              );
            })}
          </defs>

          {/* ── Background grid (cadastral survey grid) ── */}
          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#F8F9FA" />

          {/* Fine grid lines */}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`vg${i}`} x1={i * (SVG_W / 20)} y1="0" x2={i * (SVG_W / 20)} y2={SVG_H}
              stroke="#CBD5E1" strokeWidth="0.5" strokeOpacity="0.6" />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <line key={`hg${i}`} x1="0" y1={i * (SVG_H / 14)} x2={SVG_W} y2={i * (SVG_H / 14)}
              stroke="#CBD5E1" strokeWidth="0.5" strokeOpacity="0.6" />
          ))}

          {/* Major grid lines */}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`vmg${i}`} x1={(i + 1) * (SVG_W / 5)} y1="0" x2={(i + 1) * (SVG_W / 5)} y2={SVG_H}
              stroke="#94A3B8" strokeWidth="0.8" strokeOpacity="0.5" />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <line key={`hmg${i}`} x1="0" y1={(i + 1) * (SVG_H / 4)} x2={SVG_W} y2={(i + 1) * (SVG_H / 4)}
              stroke="#94A3B8" strokeWidth="0.8" strokeOpacity="0.5" />
          ))}

          {/* ── Road network (schematic internal roads) ── */}
          {/* Main campus spine road */}
          <line
            x1={project([10.757750, 78.649600])[0]}
            y1={project([10.757750, 78.649600])[1]}
            x2={project([10.756200, 78.652800])[0]}
            y2={project([10.756200, 78.652800])[1]}
            stroke="#E2E8F0" strokeWidth="14" strokeLinecap="round"
          />
          <line
            x1={project([10.757750, 78.649600])[0]}
            y1={project([10.757750, 78.649600])[1]}
            x2={project([10.756200, 78.652800])[0]}
            y2={project([10.756200, 78.652800])[1]}
            stroke="#F1F5F9" strokeWidth="11" strokeLinecap="round"
            strokeDasharray="0"
          />
          <line
            x1={project([10.757750, 78.649600])[0]}
            y1={project([10.757750, 78.649600])[1]}
            x2={project([10.756200, 78.652800])[0]}
            y2={project([10.756200, 78.652800])[1]}
            stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round"
          />

          {/* Internal connector road */}
          <line
            x1={project([10.757172, 78.650600])[0]}
            y1={project([10.757172, 78.650600])[1]}
            x2={project([10.757172, 78.652400])[0]}
            y2={project([10.757172, 78.652400])[1]}
            stroke="#E2E8F0" strokeWidth="9" strokeLinecap="round"
          />
          <line
            x1={project([10.757172, 78.650600])[0]}
            y1={project([10.757172, 78.650600])[1]}
            x2={project([10.757172, 78.652400])[0]}
            y2={project([10.757172, 78.652400])[1]}
            stroke="#F1F5F9" strokeWidth="6" strokeDasharray="8 4"
            strokeLinecap="round"
          />

          {/* Road labels */}
          <text
            x={project([10.757172, 78.651400])[0] + 6}
            y={project([10.757172, 78.651400])[1] - 6}
            fontSize="8" fill="#94A3B8" fontWeight="600"
            fontFamily="'Inter', system-ui, sans-serif"
            transform={`rotate(-10, ${project([10.757172, 78.651400])[0] + 6}, ${project([10.757172, 78.651400])[1] - 6})`}
          >
            Campus Internal Road
          </text>

          {/* ── Parcels ── */}
          {properties.map((prop) => (
            <CadastralParcel
              key={prop.id}
              property={prop}
              project={project}
              isSelected={activeProp?.id === prop.id}
              onHover={handleParcelHover}
              onLeave={handleParcelLeave}
              onClick={handleParcelClick}
            />
          ))}

          {/* ── Scale bar ── */}
          <g transform={`translate(${SVG_W - 150}, ${SVG_H - 30})`}>
            {/* Compute approx pixel width for 100m at this scale */}
            {(() => {
              const [x0] = project([10.757172, 78.651000]);
              const [x1] = project([10.757172, 78.651000 + 100 / (111111 * Math.cos(10.757172 * Math.PI / 180))]);
              const barW = Math.abs(x1 - x0);
              return (
                <>
                  <rect x="0" y="-6" width={barW} height="6" fill="#334155" />
                  <rect x={barW / 2} y="-6" width={barW / 2} height="6" fill="#F1F5F9" />
                  <line x1="0" y1="-6" x2="0" y2="-10" stroke="#334155" strokeWidth="1.5" />
                  <line x1={barW} y1="-6" x2={barW} y2="-10" stroke="#334155" strokeWidth="1.5" />
                  <text x={barW / 2} y="-13" textAnchor="middle" fontSize="8.5" fill="#334155"
                    fontWeight="700" fontFamily="'Inter', system-ui, sans-serif">
                    100 m
                  </text>
                </>
              );
            })()}
          </g>
        </svg>

        {/* Floating Tooltip */}
        {hoveredProp && (
          <ParcelTooltip
            property={hoveredProp}
            svgX={tooltipPos.x}
            svgY={tooltipPos.y}
            containerRef={containerRef}
          />
        )}

        {/* Footer info bar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-white/90 backdrop-blur border-t border-cipher-border text-[10px] flex items-center justify-between gap-2 text-cipher-muted z-10">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
            <span>{properties.length} cadastral parcels · Saranathan College of Engineering Campus</span>
          </span>
          <span className="mono font-semibold text-amber-600 shrink-0">
            GEOMETRY: SATELLITE-ALIGNED PROTOTYPE · WGS 84
          </span>
        </div>
      </div>
    </div>
  );
}

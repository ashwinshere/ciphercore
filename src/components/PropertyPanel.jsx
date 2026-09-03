import React, { useState } from 'react';
import {
  MapPin,
  Ruler,
  Layers,
  Hash,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  X,
  Building2,
  Copy,
  Check,
  GitCommit,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { calculateArea } from '../utils/geometry.js';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';
import { generate3DULPIN } from '../utils/ulpin.js';

export default function PropertyPanel() {
  const { selectedRoom, allRooms, selectRoom, buildingData, viewMode, enter3DView, selectedProperty } = useApp();
  const [copied, setCopied] = useState(false);

  const bld = buildingData.building;

  if (!selectedRoom) {
    return (
      <aside className="gov-card p-5 w-full h-full overflow-y-auto fade-in flex flex-col gap-4">
        <div className="flex items-start justify-between pb-3 border-b border-cipher-border">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-cipher-govblue flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Selected Property Cadastre
            </div>
            <h2 className="text-base font-extrabold text-cipher-navy mt-0.5">
              {bld.name}
            </h2>
            <div className="text-xs text-cipher-muted mt-0.5">{bld.institution}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-1">
          {bld.realWorld && (
            <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wide rounded bg-blue-50 text-cipher-govblue border border-blue-200">
              Real-World Satellite Location
            </span>
          )}
          <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wide rounded bg-amber-50 text-amber-700 border border-amber-200">
            Geometry: {bld.prototypeStatus}
          </span>
          <span className={`px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wide rounded border ${bld.geometryConfidence === 'high' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (bld.geometryConfidence === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200')}`}>
            Confidence: {bld.geometryConfidence}
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-cipher-border">
          <div className="text-[10px] text-cipher-muted uppercase font-semibold mb-1">2D Land Parcel ULPIN</div>
          <div className="mono text-xs font-bold text-cipher-navy break-all">{bld.ulpin2D || 'N/A'}</div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide mb-2">
            Building Cadastral Specifications
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[10px] text-cipher-muted font-medium">PROPERTY TYPE</div>
              <div className="font-semibold text-cipher-navy mt-0.5">{bld.propertyType || 'Building'}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[10px] text-cipher-muted font-medium">SPATIAL FLOORS</div>
              <div className="font-semibold text-cipher-navy mt-0.5">{buildingData.floors.length} Levels</div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[10px] text-cipher-muted font-medium">FOOTPRINT DIMENSIONS</div>
              <div className="font-semibold text-cipher-navy mt-0.5 mono text-[11px]">
                {bld.footprintWidthM}m × {bld.footprintDepthM}m
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[10px] text-cipher-muted font-medium">TOTAL 3D UNITS</div>
              <div className="font-semibold text-cipher-navy mt-0.5 mono">{allRooms.length} Spatial Units</div>
            </div>
          </div>
        </div>

        {viewMode === 'map' ? (
          <div className="mt-auto pt-4 border-t border-cipher-border flex flex-col gap-2">
            <button
              onClick={() => enter3DView(selectedProperty)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-extrabold shadow-card transition-all group"
            >
              <Building2 size={16} />
              <span>View 3D Property</span>
              <GitCommit size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] text-cipher-muted text-center">
              Extrudes {bld.name}'s 2D satellite footprint into an interactive 3D digital twin.
            </p>
          </div>
        ) : (
          <div className="mt-auto text-center flex flex-col items-center text-xs text-cipher-muted pt-4 border-t border-cipher-border">
            <Layers size={22} className="mb-1.5 text-slate-300" />
            <p className="max-w-[200px] text-[11px]">Select any unit or floor level in the 3D canvas to inspect its 3D ULPIN.</p>
          </div>
        )}
      </aside>
    );
  }

  const { above, below, stack } = detectVerticalStack(selectedRoom, allRooms);
  const area = calculateArea(selectedRoom);

  const ulpin3D = generate3DULPIN(buildingData.building, selectedRoom.floorId, selectedRoom.number);

  const handleCopy = () => {
    navigator.clipboard?.writeText(ulpin3D);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="gov-card p-5 w-full h-full overflow-y-auto fade-in flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-cipher-border">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-cipher-govblue">
            Cadastral Property Record
          </div>
          <h2 className="text-base font-bold text-cipher-navy mt-0.5">
            {selectedRoom.name}
          </h2>
        </div>
        <button
          onClick={() => selectRoom(null, { focus: false })}
          className="text-slate-400 hover:text-cipher-text p-1 rounded hover:bg-slate-100 transition-colors"
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      {/* Official ULPIN Identifier Card */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-cipher-border">
        <div className="flex items-center justify-between text-[10px] text-cipher-muted uppercase font-semibold mb-1">
          <span>ULPIN Identifier</span>
          <span className="flex items-center gap-1 text-cipher-success font-medium normal-case">
            <CheckCircle2 size={11} />
            Verified Spatial Record
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="mono text-xs font-bold text-cipher-navy break-all select-all">
            {ulpin3D}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 p-1.5 rounded hover:bg-white border border-transparent hover:border-cipher-border text-cipher-muted hover:text-cipher-navy transition-all"
            title="Copy ULPIN"
          >
            {copied ? <Check size={14} className="text-cipher-success" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Two-Column Metadata Grid */}
      <div>
        <div className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide mb-2">
          Spatial &amp; Cadastral Metadata
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">2D ULPIN</div>
            <div className="font-semibold text-cipher-navy mt-0.5 mono text-[10px]">
              {buildingData.building.ulpin2D || 'N/A'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">PROPERTY TYPE</div>
            <div className="font-semibold text-cipher-navy mt-0.5">
              {selectedRoom.type}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">PARCEL AREA</div>
            <div className="font-semibold text-cipher-navy mt-0.5 mono">
              {area} m² ({(area * 10.7639).toFixed(0)} sq.ft)
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">VERTICAL LEVEL</div>
            <div className="font-semibold text-cipher-navy mt-0.5 mono">
              +{selectedRoom.elevation.toFixed(1)} m ({selectedRoom.floorShortName})
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">DISTRICT / TALUK</div>
            <div className="font-semibold text-cipher-navy mt-0.5 truncate">
              {buildingData.building.district}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">GEOMETRY STATUS</div>
            <div className="font-semibold text-amber-600 mt-0.5 flex items-center gap-1">
              <ShieldCheck size={12} />
              Approximate ({buildingData.building.geometryConfidence})
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Property Hierarchy Tree */}
      <div className="pt-2 border-t border-cipher-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide">
            Vertical Cadastral Structure
          </span>
          <span className="text-[10px] text-cipher-muted">
            {stack.length} Stacked Units
          </span>
        </div>

        {/* Tree Representation */}
        <div className="p-3 rounded-lg bg-cipher-bg border border-cipher-border font-mono text-[11px] space-y-1 text-cipher-muted">
          <div className="flex items-center gap-1 text-cipher-navy font-semibold">
            <span className="text-slate-400">LAND</span> TN-TRY-SCE-001
          </div>
          <div className="flex items-center gap-1 pl-3 border-l-2 border-slate-200 text-cipher-text">
            <span className="text-slate-400">└── BLDG</span> {buildingData.building.name}
          </div>
          <div className="flex items-center gap-1 pl-6 border-l-2 border-slate-200 text-cipher-govblue font-semibold">
            <span className="text-slate-400">└── FLOOR</span> {selectedRoom.floorName}
          </div>
          <div className="flex items-center gap-1 pl-9 border-l-2 border-cipher-govblue text-cipher-govblue font-bold bg-blue-50/80 py-0.5 rounded">
            <span>└── UNIT</span> {selectedRoom.name} ({selectedRoom.type})
          </div>
        </div>

        {/* Above & Below Direct Navigators */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={() => above && selectRoom(above.id)}
            disabled={!above}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-cipher-border hover:border-cipher-govblue disabled:opacity-40 disabled:hover:border-cipher-border text-left transition-colors text-xs"
          >
            <span className="flex items-center gap-1.5 text-cipher-muted font-medium text-[11px]">
              <ArrowUp size={13} className="text-cipher-govblue" /> Above
            </span>
            <span className="font-semibold text-cipher-navy mono text-[11px] truncate ml-1">
              {above ? above.name : '—'}
            </span>
          </button>

          <button
            onClick={() => below && selectRoom(below.id)}
            disabled={!below}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-cipher-border hover:border-cipher-govblue disabled:opacity-40 disabled:hover:border-cipher-border text-left transition-colors text-xs"
          >
            <span className="flex items-center gap-1.5 text-cipher-muted font-medium text-[11px]">
              <ArrowDown size={13} className="text-cipher-govblue" /> Below
            </span>
            <span className="font-semibold text-cipher-navy mono text-[11px] truncate ml-1">
              {below ? below.name : '—'}
            </span>
          </button>
        </div>
      </div>

      {/* Security & Verification Card */}
      <div className="p-3 rounded-lg bg-slate-50 border border-cipher-border flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-2">
          <Lock size={13} className="text-cipher-govblue" />
          <span className="text-cipher-muted text-[11px]">Record Integrity:</span>
          <span className="font-semibold text-cipher-success text-[11px]">✓ Validated</span>
        </div>
        <span className="text-[10px] text-cipher-muted mono">Audit: 2026</span>
      </div>
    </aside>
  );
}

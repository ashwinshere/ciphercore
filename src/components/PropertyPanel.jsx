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

export default function PropertyPanel() {
  const { selectedRoom, allRooms, selectRoom, buildingData } = useApp();
  const [copied, setCopied] = useState(false);

  if (!selectedRoom) {
    return (
      <aside className="gov-card p-6 w-full h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Building2 size={24} />
        </div>
        <h3 className="text-sm font-semibold text-cipher-navy mb-1">No Property Selected</h3>
        <p className="text-xs text-cipher-muted max-w-xs leading-relaxed">
          Select a spatial unit from the 3D map, 2D floor plan, or registry table to inspect official cadastral records.
        </p>
      </aside>
    );
  }

  const { above, below, stack } = detectVerticalStack(selectedRoom, allRooms);
  const area = calculateArea(selectedRoom);

  const handleCopy = () => {
    navigator.clipboard?.writeText(selectedRoom.id);
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
            {selectedRoom.id}
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
            <div className="text-[10px] text-cipher-muted font-medium">SURVEY NUMBER</div>
            <div className="font-semibold text-cipher-navy mt-0.5 mono">
              {selectedRoom.number}/2A
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
            <div className="text-[10px] text-cipher-muted font-medium">CADASTRE STATUS</div>
            <div className="font-semibold text-cipher-success mt-0.5 flex items-center gap-1">
              <ShieldCheck size={12} />
              {selectedRoom.officialReference ? 'Verified Record' : 'Pilot Survey'}
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

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
  User,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { calculateArea } from '../utils/geometry.js';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';
import { generate3DULPIN } from '../utils/ulpin.js';

export default function PropertyPanel() {
  const { selectedRoom, allRooms, selectRoom, buildingData, viewMode, enter3DView, selectedProperty } = useApp();
  const [copied, setCopied] = useState(false);

  const bld = buildingData.building;
  const activeProp = selectedProperty || bld;

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mode 1: No Room Selected -> Show Property / Building Block Details
  if (!selectedRoom) {
    const parcelArea = activeProp.footprintWidthM && activeProp.footprintDepthM
      ? activeProp.footprintWidthM * activeProp.footprintDepthM
      : 2000;

    return (
      <aside className="gov-card p-5 w-full h-full overflow-y-auto fade-in flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-cipher-border">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-cipher-govblue flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Selected Property Parcel
            </div>
            <h2 className="text-base font-extrabold text-cipher-navy mt-0.5">
              {activeProp.name}
            </h2>
            <div className="text-xs text-cipher-muted font-medium mt-0.5">
              {activeProp.institution || 'Saranathan College of Engineering'}
            </div>
          </div>
          {activeProp.blockNumber && (
            <span className="px-2.5 py-1 rounded bg-blue-50 text-cipher-govblue border border-blue-200 text-xs font-bold mono">
              Block {activeProp.blockNumber.replace('Block ', '')}
            </span>
          )}
        </div>

        {/* 2D ULPIN Identifier Card */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-cipher-border space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-cipher-muted uppercase font-semibold">
            <span>2D Land Parcel ULPIN</span>
            <span className="flex items-center gap-1 text-cipher-success font-medium normal-case">
              <CheckCircle2 size={11} /> Verified Parcel
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="mono text-xs font-bold text-cipher-navy break-all select-all">
              {activeProp.ulpin2D || bld.ulpin2D || '29-01-001-000123'}
            </span>
            <button
              onClick={() => handleCopy(activeProp.ulpin2D || bld.ulpin2D)}
              className="shrink-0 p-1.5 rounded hover:bg-white border border-transparent hover:border-cipher-border text-cipher-muted hover:text-cipher-navy transition-all"
              title="Copy ULPIN"
            >
              {copied ? <Check size={14} className="text-cipher-success" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Complete Property Attributes Grid */}
        <div>
          <div className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide mb-2 flex items-center justify-between">
            <span>Cadastral Attributes</span>
            <span className="text-[10px] text-cipher-muted font-normal">WGS 84 Datum</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">BLOCK NUMBER</div>
              <div className="font-bold text-cipher-navy mt-0.5 mono text-[11px]">
                {activeProp.blockNumber ? (activeProp.blockNumber.startsWith('Block') ? activeProp.blockNumber : `Block ${activeProp.blockNumber}`) : 'Block 100'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">SURVEY NUMBER</div>
              <div className="font-bold text-cipher-navy mt-0.5 mono text-[11px]">
                {activeProp.surveyNumber || bld.surveyNumber || 'SF-100/1A'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight col-span-2">
              <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">OWNER / AUTHORITY</div>
              <div className="font-bold text-cipher-navy mt-0.5 flex items-center gap-1.5 text-[11px]">
                <User size={12} className="text-cipher-govblue shrink-0" />
                <span className="truncate">{activeProp.ownerName || bld.ownerName || 'Saranathan Educational Trust'}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">PROPERTY TYPE</div>
              <div className="font-bold text-cipher-navy mt-0.5 truncate text-[11px]">
                {activeProp.propertyType || bld.propertyType || 'Academic Block'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">PARCEL AREA</div>
              <div className="font-bold text-cipher-navy mt-0.5 mono text-[11px]">
                {parcelArea.toLocaleString()} m²
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">SPATIAL FLOORS</div>
              <div className="font-bold text-cipher-navy mt-0.5 text-[11px]">
                {buildingData.floors.length} Levels
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
              <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">TOTAL 3D UNITS</div>
              <div className="font-bold text-cipher-navy mt-0.5 mono text-[11px]">
                {allRooms.length} Units
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight col-span-2">
              <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">VERIFICATION STATUS</div>
              <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                <span>Verified Cadastral Record · High Confidence</span>
              </div>
            </div>
          </div>

          {/* Building Usage & Facilities Summary */}
          {(() => {
            const pId = activeProp.id || '';
            const bType = (activeProp.buildingType || '').toLowerCase();
            const pType = (activeProp.propertyType || '').toLowerCase();
            let usageTitle = 'Academic & Research Space';
            let usageDesc = 'Classrooms, Common Laboratories, Tutorial Rooms & Faculty Offices';
            let iconColor = 'text-cipher-govblue';

            if (bType === 'hostel' || pId === 'boys-hostel' || pType.includes('hostel') || pType.includes('residential')) {
              usageTitle = 'Residential Hostel & Living Quarters';
              usageDesc = 'Dormitory Rooms, Double/Single Deluxe Suites, Warden Office, Student Lounge & Study Halls';
              iconColor = 'text-emerald-600';
            } else if (pId === 'canteen' || pType.includes('dining')) {
              usageTitle = 'Dining & Amenity Services';
              usageDesc = 'Main Dining Hall, Commercial Kitchen Prep, Food Service Counters & Store Rooms';
              iconColor = 'text-pink-600';
            } else if (pId === 'parking' || pType.includes('parking')) {
              usageTitle = 'Vehicle Parking Infrastructure';
              usageDesc = 'Covered Four-Wheeler Bays, Two-Wheeler Slots & EV Charging Outlets';
              iconColor = 'text-slate-600';
            } else if (pId === 'basketball-ground' || bType === 'sports' || pType.includes('sports')) {
              usageTitle = 'Outdoor Sports Facility';
              usageDesc = 'Regulation Basketball Court, Athletic Equipment Pavilion & Scoring Area';
              iconColor = 'text-sky-600';
            } else if (pId === 'me-block' || pType.includes('mechanical')) {
              usageTitle = 'Mechanical Engineering Labs & Workshops';
              usageDesc = 'Heavy Machine Workshops, Heat Transfer Labs & CAD/CAM Simulation Suites';
              iconColor = 'text-purple-600';
            }

            return (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-cipher-border space-y-1">
                <div className="text-[9.5px] font-bold text-cipher-muted uppercase tracking-wider">
                  BUILDING USAGE & FACILITIES
                </div>
                <div className={`text-xs font-bold ${iconColor}`}>
                  {usageTitle}
                </div>
                <p className="text-[11px] text-cipher-text leading-relaxed mt-0.5">
                  {usageDesc}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Action / Guidance Footer */}
        {viewMode === 'map' ? (
          <div className="mt-auto pt-3 border-t border-cipher-border flex flex-col gap-2">
            <button
              onClick={() => enter3DView(selectedProperty || activeProp)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-extrabold shadow-card transition-all group cursor-pointer"
            >
              <Building2 size={16} />
              <span>View 3D Property Digital Twin</span>
              <GitCommit size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[10px] text-cipher-muted text-center">
              Extrudes {activeProp.name}'s parcel into an interactive multi-floor 3D model.
            </p>
          </div>
        ) : (
          <div className="mt-auto text-center flex flex-col items-center text-xs text-cipher-muted pt-3 border-t border-cipher-border">
            <Layers size={20} className="mb-1.5 text-slate-400" />
            <p className="max-w-[220px] text-[11px]">
              Click any room or unit block in the 3D model to inspect its exact 3D ULPIN and unit records.
            </p>
          </div>
        )}
      </aside>
    );
  }

  // Mode 2: Room / Unit Selected -> Show Exact Unit Details
  const { above, below, stack } = detectVerticalStack(selectedRoom, allRooms);
  const area = calculateArea(selectedRoom);
  const ulpin3D = generate3DULPIN(bld, selectedRoom.floorId, selectedRoom.number);

  return (
    <aside className="gov-card p-5 w-full h-full overflow-y-auto fade-in flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-cipher-border">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-cipher-govblue flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Selected Unit Cadastral Record
          </div>
          <h2 className="text-base font-extrabold text-cipher-navy mt-0.5">
            {selectedRoom.name}
          </h2>
          <div className="text-xs text-cipher-muted font-medium mt-0.5">
            Building: <strong className="text-cipher-navy">{selectedRoom.buildingName || bld.name}</strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-blue-50 text-cipher-govblue border border-blue-200 text-xs font-bold mono">
            {selectedRoom.blockNumber || (activeProp.blockNumber ? `Block ${activeProp.blockNumber}` : 'Block 100')}
          </span>
          <button
            onClick={() => selectRoom(null, { focus: false })}
            className="text-slate-400 hover:text-cipher-text p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="Deselect unit"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 3D ULPIN Identifier Card */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-cipher-border space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-cipher-muted uppercase font-semibold">
          <span>3D ULPIN Identifier</span>
          <span className="flex items-center gap-1 text-cipher-success font-medium normal-case">
            <CheckCircle2 size={11} /> Verified Spatial Record
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="mono text-xs font-bold text-cipher-navy break-all select-all">
            {selectedRoom.ulpin3D || ulpin3D}
          </span>
          <button
            onClick={() => handleCopy(selectedRoom.ulpin3D || ulpin3D)}
            className="shrink-0 p-1.5 rounded hover:bg-white border border-transparent hover:border-cipher-border text-cipher-muted hover:text-cipher-navy transition-all"
            title="Copy 3D ULPIN"
          >
            {copied ? <Check size={14} className="text-cipher-success" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Complete Unit Attributes Grid */}
      <div>
        <div className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide mb-2 flex items-center justify-between">
          <span>Unit Spatial Attributes</span>
          <span className="text-[10px] text-cipher-muted font-normal">{selectedRoom.floorName}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">ROOM / UNIT NAME</div>
            <div className="font-bold text-cipher-navy mt-0.5 text-[11px]">
              {selectedRoom.name}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">BLOCK NUMBER</div>
            <div className="font-bold text-cipher-navy mt-0.5 mono text-[11px]">
              {selectedRoom.blockNumber || (activeProp.blockNumber ? `Block ${activeProp.blockNumber}` : 'Block 104')}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight col-span-2">
            <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">OWNER / ALLOCATED TO</div>
            <div className="font-bold text-cipher-navy mt-0.5 flex items-center gap-1.5 text-[11px]">
              <User size={12} className="text-cipher-govblue shrink-0" />
              <span className="truncate">{selectedRoom.ownerName || activeProp.ownerName || 'Saranathan Educational Trust'}</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">SURVEY NUMBER</div>
            <div className="font-bold text-cipher-navy mt-0.5 mono text-[11px]">
              {selectedRoom.surveyNumber || 'SF-104/101'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">PROPERTY TYPE</div>
            <div className="font-bold text-cipher-navy mt-0.5 truncate text-[11px]">
              {selectedRoom.type}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">FLOOR / LEVEL</div>
            <div className="font-bold text-cipher-navy mt-0.5 mono text-[11px]">
              +{selectedRoom.elevation.toFixed(1)} m ({selectedRoom.floorShortName})
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">UNIT AREA</div>
            <div className="font-bold text-cipher-navy mt-0.5 mono text-[11px]">
              {area} m² ({(area * 10.7639).toFixed(0)} sq.ft)
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight col-span-2">
            <div className="text-[9.5px] text-cipher-muted font-semibold uppercase">2D LAND PARCEL ULPIN</div>
            <div className="font-bold text-cipher-navy mt-0.5 mono text-[11px] select-all">
              {selectedRoom.ulpin2D || bld.ulpin2D}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Property Structure & Direct Links */}
      <div className="pt-2 border-t border-cipher-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide">
            Vertical Cadastral Stack
          </span>
          <span className="text-[10px] text-cipher-muted font-semibold">
            {stack.length} Stacked Units
          </span>
        </div>

        <div className="p-3 rounded-lg bg-cipher-bg border border-cipher-border font-mono text-[11px] space-y-1 text-cipher-muted">
          <div className="flex items-center gap-1 text-cipher-navy font-semibold">
            <span className="text-slate-400">LAND</span> {selectedRoom.ulpin2D || bld.ulpin2D}
          </div>
          <div className="flex items-center gap-1 pl-3 border-l-2 border-slate-200 text-cipher-text">
            <span className="text-slate-400">└── BLDG</span> {selectedRoom.buildingName || bld.name}
          </div>
          <div className="flex items-center gap-1 pl-6 border-l-2 border-slate-200 text-cipher-govblue font-semibold">
            <span className="text-slate-400">└── FLOOR</span> {selectedRoom.floorName}
          </div>
          <div className="flex items-center gap-1 pl-9 border-l-2 border-cipher-govblue text-cipher-govblue font-bold bg-blue-50/90 py-0.5 rounded">
            <span>└── UNIT</span> {selectedRoom.name} ({selectedRoom.type})
          </div>
        </div>

        {/* Above & Below Direct Navigators */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={() => above && selectRoom(above.id)}
            disabled={!above}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-cipher-border hover:border-cipher-govblue disabled:opacity-40 disabled:hover:border-cipher-border text-left transition-colors text-xs cursor-pointer"
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
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-cipher-border hover:border-cipher-govblue disabled:opacity-40 disabled:hover:border-cipher-border text-left transition-colors text-xs cursor-pointer"
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
          <span className="font-semibold text-cipher-success text-[11px]">✓ Validated 3D Record</span>
        </div>
        <span className="text-[10px] text-cipher-muted mono">Audit: 2026</span>
      </div>
    </aside>
  );
}

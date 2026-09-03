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
  CheckCircle2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { generate3DULPIN } from '../utils/ulpin.js';
import { calculateArea } from '../utils/geometry.js';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';

export default function PropertyDetails() {
  const { selectedProperty, setViewMode, selectedRoom, allRooms, selectRoom, buildingData } = useApp();
  const [copied, setCopied] = useState(false);

  // Active property can be from selectedProperty or fallback to buildingData.building
  const propertyName = selectedProperty ? selectedProperty.name : buildingData.building.name;
  const ulpin2D = selectedProperty ? selectedProperty.ulpin2D : '29-01-001-000123';
  const propertyType = selectedProperty ? selectedProperty.propertyType : 'Academic Block';
  const totalFloors = selectedProperty ? selectedProperty.floors : buildingData.floors.length;
  const unitsPerFloor = selectedProperty ? selectedProperty.unitsPerFloor : (buildingData.floors[0]?.rooms?.length || 9);

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selected3DULPIN = selectedRoom
    ? (selectedProperty 
        ? generate3DULPIN(selectedProperty, selectedRoom.floorNumId || selectedRoom.floorId, selectedRoom.number || selectedRoom.name)
        : selectedRoom.id)
    : null;

  return (
    <aside className="gov-card p-5 w-full h-full overflow-y-auto fade-in flex flex-col gap-4">
      {/* Navigation / Header */}
      <div className="flex items-start justify-between pb-3 border-b border-cipher-border">
        <div>
          <button
            onClick={() => setViewMode('map')}
            className="flex items-center gap-1 text-[11px] font-semibold text-cipher-govblue hover:underline mb-1"
          >
            <ArrowLeft size={12} /> Back to 2D Map
          </button>
          <div className="text-[10px] uppercase font-bold tracking-wider text-cipher-govblue">
            Property Details
          </div>
          <h2 className="text-base font-bold text-cipher-navy mt-0.5">
            {selectedRoom ? selectedRoom.name : propertyName}
          </h2>
        </div>
        {selectedRoom && (
          <button
            onClick={() => selectRoom(null, { focus: false })}
            className="text-slate-400 hover:text-cipher-text p-1 rounded hover:bg-slate-100 transition-colors"
            title="Deselect room"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Building Overview Card */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-cipher-border space-y-2">
        <div className="flex items-center justify-between text-[10px] text-cipher-muted uppercase font-semibold">
          <span>2D ULPIN</span>
          <span className="flex items-center gap-1 text-cipher-success font-medium normal-case">
            <CheckCircle2 size={11} />
            Active Parcel
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="mono text-xs font-bold text-cipher-navy break-all select-all">
            {ulpin2D}
          </span>
          <button
            onClick={() => handleCopy(ulpin2D)}
            className="shrink-0 p-1.5 rounded hover:bg-white border border-transparent hover:border-cipher-border text-cipher-muted hover:text-cipher-navy transition-all"
            title="Copy 2D ULPIN"
          >
            {copied ? <Check size={14} className="text-cipher-success" /> : <Copy size={14} />}
          </button>
        </div>

        {selected3DULPIN && (
          <div className="pt-2 border-t border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted uppercase font-semibold mb-0.5">
              Generated 3D ULPIN
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="mono text-xs font-bold text-cipher-govblue break-all select-all">
                {selected3DULPIN}
              </span>
              <button
                onClick={() => handleCopy(selected3DULPIN)}
                className="shrink-0 p-1 rounded hover:bg-white text-cipher-muted hover:text-cipher-navy transition-all"
                title="Copy 3D ULPIN"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Grid */}
      <div>
        <div className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide mb-2">
          {selectedRoom ? 'Selected Unit Metadata' : 'Building Specs'}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">PROPERTY NAME</div>
            <div className="font-semibold text-cipher-navy mt-0.5 truncate">
              {propertyName}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">PROPERTY TYPE</div>
            <div className="font-semibold text-cipher-navy mt-0.5 truncate">
              {selectedRoom ? selectedRoom.type : propertyType}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">TOTAL FLOORS</div>
            <div className="font-semibold text-cipher-navy mt-0.5 mono">
              {totalFloors} Floors
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
            <div className="text-[10px] text-cipher-muted font-medium">UNITS / FLOOR</div>
            <div className="font-semibold text-cipher-navy mt-0.5 mono">
              {unitsPerFloor} Units
            </div>
          </div>
          {selectedRoom && (
            <>
              <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
                <div className="text-[10px] text-cipher-muted font-medium">FLOOR LEVEL</div>
                <div className="font-semibold text-cipher-navy mt-0.5 mono">
                  {selectedRoom.floorShortName || selectedRoom.floorId} (+{selectedRoom.elevation}m)
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-cipher-bg border border-cipher-borderLight">
                <div className="text-[10px] text-cipher-muted font-medium">ESTIMATED AREA</div>
                <div className="font-semibold text-cipher-navy mt-0.5 mono">
                  {calculateArea(selectedRoom)} m²
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Security & Verification Footer */}
      <div className="p-3 rounded-lg bg-slate-50 border border-cipher-border flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-2">
          <Lock size={13} className="text-cipher-govblue" />
          <span className="text-cipher-muted text-[11px]">Record Status:</span>
          <span className="font-semibold text-cipher-success text-[11px]">✓ 3D Linked</span>
        </div>
        <span className="text-[10px] text-cipher-muted mono">Spatial GIS</span>
      </div>
    </aside>
  );
}

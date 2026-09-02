import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Layers, Building2, MapPin, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function FloorMapping() {
  const { buildingData, selectedProperty, selectRoom, selectedRoom, setViewMode, setCurrentPage } = useApp();
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);

  const bld = buildingData.building;
  const currentFloor = buildingData.floors[activeFloorIndex] || buildingData.floors[0];

  if (!selectedProperty && !bld) {
    return (
      <div className="fade-in p-8 text-center bg-white border border-cipher-border rounded-xl shadow-subtle flex flex-col items-center">
        <Building2 size={36} className="text-slate-400 mb-3" />
        <h2 className="text-lg font-bold text-cipher-navy mb-1">No Property Selected</h2>
        <p className="text-xs text-cipher-muted max-w-sm mb-4">
          Please select a building from the satellite map to inspect its floor plans and unit layout.
        </p>
        <button
          onClick={() => {
            setViewMode('map');
            setCurrentPage('dashboard');
          }}
          className="px-4 py-2 bg-cipher-govblue text-white rounded-lg text-xs font-bold shadow-subtle hover:bg-cipher-navy transition-colors"
        >
          Select Building on Map
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
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
            Building &amp; Floor Plans — {bld.name}
          </h1>
        </div>

        <button
          onClick={() => {
            setViewMode('3d');
            setCurrentPage('dashboard');
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cipher-govblue text-white text-xs font-bold hover:bg-cipher-navy transition-all shadow-subtle"
        >
          <Building2 size={14} /> Open 3D Digital Twin
        </button>
      </div>

      {/* Building Overview Banner */}
      <div className="bg-white border border-cipher-border rounded-xl p-4 shadow-subtle grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-[10px] text-cipher-muted uppercase font-semibold">BUILDING NAME</div>
          <div className="font-bold text-cipher-navy text-sm mt-0.5">{bld.name}</div>
          <div className="text-[11px] text-cipher-muted">{bld.institution}</div>
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
          <div className="text-[11px] text-cipher-muted">{buildingData.floors.length} Spatial Floor Levels</div>
        </div>
        <div>
          <div className="text-[10px] text-cipher-muted uppercase font-semibold">PROPERTY TYPE</div>
          <div className="font-bold text-cipher-navy text-xs mt-0.5">{bld.propertyType}</div>
          <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
            <ShieldCheck size={11} /> Geometry: {bld.prototypeStatus}
          </div>
        </div>
      </div>

      {/* Floor Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-cipher-border pb-3 overflow-x-auto">
        <span className="text-xs font-bold text-cipher-navy uppercase tracking-wider mr-2">Select Floor Level:</span>
        {buildingData.floors.map((fl, idx) => (
          <button
            key={fl.id}
            onClick={() => setActiveFloorIndex(idx)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeFloorIndex === idx
                ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-subtle'
                : 'bg-white text-cipher-navy border-cipher-border hover:bg-slate-50'
            }`}
          >
            {fl.name} ({fl.rooms.length} Units)
          </button>
        ))}
      </div>

      {/* 2D Floor Plan Layout Display */}
      <div className="gov-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-cipher-border mb-4">
          <div>
            <h3 className="text-sm font-bold text-cipher-navy">
              {currentFloor.name} Layout ({currentFloor.rooms.length} Spatial Units)
            </h3>
            <p className="text-xs text-cipher-muted">
              Click any spatial unit box to view its 3D ULPIN identifier and cadastral attributes.
            </p>
          </div>
          <span className="mono text-xs font-bold text-cipher-govblue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
            LEVEL: {currentFloor.shortName.toUpperCase()} (+{currentFloor.elevation}m)
          </span>
        </div>

        {/* 2D Unit Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {currentFloor.rooms.map((rm) => {
            const isSel = selectedRoom?.id === rm.id;
            return (
              <div
                key={rm.id}
                onClick={() => selectRoom(rm.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSel
                    ? 'bg-blue-50 border-cipher-govblue shadow-subtle ring-2 ring-cipher-govblue/20'
                    : 'bg-cipher-bg border-cipher-border hover:border-cipher-govblue hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-cipher-navy text-xs">{rm.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-cipher-muted font-medium">
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

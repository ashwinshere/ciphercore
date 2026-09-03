import React from 'react';
import { Globe, MapPin, Compass, ShieldAlert, Layers, ArrowRight, CheckCircle2, Box, Info } from 'lucide-react';
import { gisData } from '../data/gisData.js';
import { useApp } from '../context/AppContext.jsx';

export default function GISInfoPanel({ className = '', selectedRoom = null }) {
  const { selectedProperty, buildingData } = useApp();
  const bld = selectedProperty || buildingData?.building || gisData.pilotBuilding;
  const campus = gisData.campus;
  const anchor = bld.coordinates || gisData.pilotBuilding.geographicAnchor;

  return (
    <div className={`gov-card p-4 space-y-3.5 bg-white shadow-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-cipher-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-cipher-govblue border border-blue-200">
            <Globe size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-cipher-navy uppercase tracking-wider">
              GIS Spatial Reference Anchor
            </h3>
            <p className="text-[10px] text-cipher-muted">Geodetic WGS84 to Local Cartesian Mapping</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
          {gisData.pilotBuilding.dataConfidence} Data
        </span>
      </div>

      {/* Core Principle Callout Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 text-center">
        <p className="text-xs font-extrabold text-cipher-navy leading-snug">
          “GIS tells us where the building exists on Earth.<br />
          <span className="text-cipher-govblue">VERTEX tells us where every property exists inside the building.”</span>
        </p>
      </div>

      {/* Geodetic vs Local Matrix */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Global Reference */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-cipher-border space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-cipher-muted uppercase">
            <span>GLOBAL CRS</span>
            <span className="text-cipher-govblue mono font-bold">WGS84</span>
          </div>
          <div className="text-[11px] font-bold text-cipher-navy truncate">
            {anchor.latitude?.toFixed(6)}° N
          </div>
          <div className="text-[11px] font-bold text-cipher-navy truncate">
            {anchor.longitude?.toFixed(6)}° E
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
            Altitude: {gisData.campus.altitudeM}m AMSL
          </div>
        </div>

        {/* Local 3D Reference */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-cipher-border space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-cipher-muted uppercase">
            <span>LOCAL 3D SYSTEM</span>
            <span className="text-cipher-govblue mono font-bold">XYZ CAD</span>
          </div>
          <div className="text-[11px] font-bold text-cipher-navy">
            Origin: Building Center
          </div>
          <div className="text-[11px] font-bold text-cipher-navy">
            Rotation: {bld.orientationDeg || 32}° Axis
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
            Units: Metric ($m, m^2, m^3$)
          </div>
        </div>
      </div>

      {/* Spatial Hierarchy Visual Flow */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-cipher-borderLight">
        <div className="text-[10px] font-bold uppercase tracking-wider text-cipher-muted mb-2 text-center">
          Spatial Anchoring Hierarchy
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-cipher-navy gap-1">
          <div className="px-1.5 py-1 rounded bg-white border border-slate-200 text-center flex-1 shadow-2xs">
            <div className="text-[9px] text-cipher-muted">GLOBAL</div>
            <div className="truncate text-cipher-govblue">WGS84</div>
          </div>
          <ArrowRight size={11} className="text-slate-400 shrink-0" />
          <div className="px-1.5 py-1 rounded bg-white border border-slate-200 text-center flex-1 shadow-2xs">
            <div className="text-[9px] text-cipher-muted">ANCHOR</div>
            <div className="truncate">{bld.name || 'RV Block'}</div>
          </div>
          <ArrowRight size={11} className="text-slate-400 shrink-0" />
          <div className="px-1.5 py-1 rounded bg-white border border-slate-200 text-center flex-1 shadow-2xs">
            <div className="text-[9px] text-cipher-muted">LOCAL</div>
            <div className="truncate text-cipher-govblue">XYZ $m$</div>
          </div>
          <ArrowRight size={11} className="text-slate-400 shrink-0" />
          <div className="px-1.5 py-1 rounded bg-blue-50 border border-blue-200 text-center flex-1 shadow-2xs">
            <div className="text-[9px] text-cipher-govblue">PARCEL</div>
            <div className="truncate text-cipher-govblue font-extrabold">3D ULPIN</div>
          </div>
        </div>
      </div>

      {/* Survey & Accuracy Disclaimer */}
      <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[10px] text-amber-900 flex items-start gap-2">
        <ShieldAlert size={14} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Prototype Spatial Data:</span> {campus.statusNote}. Geographic positions are derived from satellite cadastre references for demonstration.
        </div>
      </div>
    </div>
  );
}

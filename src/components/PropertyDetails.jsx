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
  ArrowLeft,
  ChevronRight,
  Compass,
  Box,
  Maximize,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { generate3DULPIN } from '../utils/ulpin.js';
import { calculateArea } from '../utils/geometry.js';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';
import { generatePrototypePropertyId, gisData } from '../data/gisData.js';

export default function PropertyDetails() {
  const {
    selectedProperty,
    setViewMode,
    selectedRoom,
    allRooms,
    selectRoom,
    buildingData
  } = useApp();

  const [copiedField, setCopiedField] = useState(null);

  const bld = buildingData?.building || {};
  const propertyName = selectedProperty ? selectedProperty.name : bld.name || 'RV Block';
  const ulpin2D = selectedProperty ? selectedProperty.ulpin2D : bld.ulpin2D || '29-01-001-000123';
  const propertyType = selectedProperty ? selectedProperty.propertyType : bld.propertyType || 'Academic Block';
  const totalFloors = selectedProperty ? selectedProperty.floors : buildingData?.floors?.length || 5;

  const handleCopy = (text, fieldName = 'ulpin') => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const selected3DULPIN = selectedRoom
    ? (selectedProperty 
        ? generate3DULPIN(selectedProperty, selectedRoom.floorNumId || selectedRoom.floorId, selectedRoom.number || selectedRoom.name)
        : selectedRoom.id)
    : null;

  // Generate standardized prototype property ID (e.g. TN-TRY-SCE-RV-F03-R403)
  const floorNum = selectedRoom ? parseInt(selectedRoom.floorId?.replace(/\D/g, '') || '0', 10) : 0;
  const roomCleanNum = selectedRoom ? selectedRoom.name?.replace(/\D/g, '') || '101' : '101';
  const prototypePropertyId = selectedRoom 
    ? generatePrototypePropertyId(bld.id === 'rv-block' ? 'RV' : (selectedProperty?.buildingConfig?.roomPrefix || 'BLD'), floorNum, roomCleanNum)
    : null;

  const area = selectedRoom ? calculateArea(selectedRoom) : null;
  const volume = selectedRoom ? (selectedRoom.width * selectedRoom.depth * selectedRoom.height).toFixed(1) : null;
  const localX = selectedRoom ? (selectedRoom.x + selectedRoom.width / 2).toFixed(2) : null;
  const localZ = selectedRoom ? (selectedRoom.y + selectedRoom.depth / 2).toFixed(2) : null;
  const localY = selectedRoom ? (selectedRoom.elevation + selectedRoom.height / 2).toFixed(2) : null;

  // Building GIS Anchor
  const anchorLat = selectedProperty?.coordinates?.latitude || bld.coordinates?.latitude || gisData.pilotBuilding.geographicAnchor.latitude;
  const anchorLng = selectedProperty?.coordinates?.longitude || bld.coordinates?.longitude || gisData.pilotBuilding.geographicAnchor.longitude;

  // Vertical Stack analysis for the selected room
  const stackInfo = selectedRoom ? detectVerticalStack(selectedRoom, allRooms) : null;

  return (
    <aside className="gov-card p-4 w-full h-full overflow-y-auto fade-in flex flex-col gap-3.5 bg-white shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between pb-2.5 border-b border-cipher-border">
        <div>
          <button
            onClick={() => setViewMode('map')}
            className="flex items-center gap-1 text-[11px] font-bold text-cipher-govblue hover:underline mb-1"
          >
            <ArrowLeft size={12} /> Back to 2D Map
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cipher-govblue">
              {selectedRoom ? '3D Spatial Unit Cadastre' : 'Building Cadastre'}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Prototype
            </span>
          </div>
          <h2 className="text-base font-extrabold text-cipher-navy mt-0.5 leading-tight">
            {selectedRoom ? selectedRoom.name : propertyName}
          </h2>
        </div>

        {selectedRoom && (
          <button
            onClick={() => selectRoom(null, { focus: false })}
            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="Deselect Unit"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Property Identifiers Card (ULPIN & Prototype Vertical ID) */}
      <div className="p-3 rounded-xl bg-slate-50 border border-cipher-border space-y-2.5">
        {/* 2D Land Parcel ULPIN */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-cipher-muted uppercase font-bold mb-0.5">
            <span>2D LAND ULPIN</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1 normal-case text-[10px]">
              <CheckCircle2 size={11} /> Verified Parcel
            </span>
          </div>
          <div className="flex items-center justify-between gap-1">
            <span className="mono text-xs font-bold text-cipher-navy select-all break-all">
              {ulpin2D}
            </span>
            <button
              onClick={() => handleCopy(ulpin2D, '2d')}
              className="shrink-0 p-1 rounded hover:bg-white text-cipher-muted hover:text-cipher-navy transition-all"
              title="Copy 2D ULPIN"
            >
              {copiedField === '2d' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* 3D Generated ULPIN */}
        {selected3DULPIN && (
          <div className="pt-2 border-t border-cipher-borderLight">
            <div className="flex items-center justify-between text-[10px] text-cipher-muted uppercase font-bold mb-0.5">
              <span>GENERATED 3D ULPIN</span>
              <span className="text-cipher-govblue font-semibold text-[10px]">
                Standard 3D Index
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 bg-blue-50/80 p-2 rounded-lg border border-blue-200/80">
              <span className="mono text-xs font-extrabold text-cipher-govblue select-all break-all">
                {selected3DULPIN}
              </span>
              <button
                onClick={() => handleCopy(selected3DULPIN, '3d')}
                className="shrink-0 p-1 rounded bg-white text-cipher-govblue hover:bg-blue-100 transition-all shadow-2xs"
                title="Copy 3D ULPIN"
              >
                {copiedField === '3d' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        )}

        {/* Prototype Vertical Property Identifier */}
        {prototypePropertyId && (
          <div className="pt-2 border-t border-cipher-borderLight">
            <div className="flex items-center justify-between text-[10px] text-cipher-muted uppercase font-bold mb-0.5">
              <span>PROTOTYPE PROPERTY ID</span>
              <span className="text-[9px] font-mono text-slate-500">Cadastre Tag</span>
            </div>
            <div className="flex items-center justify-between gap-1 bg-slate-100/80 px-2 py-1.5 rounded-lg border border-slate-200">
              <span className="mono text-xs font-bold text-slate-800 select-all break-all">
                {prototypePropertyId}
              </span>
              <button
                onClick={() => handleCopy(prototypePropertyId, 'proto')}
                className="shrink-0 p-1 rounded hover:bg-white text-slate-500 hover:text-slate-800 transition-all"
                title="Copy Prototype ID"
              >
                {copiedField === 'proto' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>
            <p className="text-[9px] text-cipher-muted mt-1 italic">
              Prototype GIS + Local Spatial Mapping
            </p>
          </div>
        )}
      </div>

      {/* Selected Room Multi-Tier Spatial Model */}
      {selectedRoom ? (
        <div className="space-y-3">
          {/* 1. Global GIS Location */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-[10px] font-bold text-cipher-navy uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1 text-cipher-govblue">
                <Globe size={12} />
                Global GIS Location
              </span>
              <span className="mono text-[9px] text-cipher-muted">WGS84</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[9px] text-cipher-muted uppercase block">BUILDING LAT</span>
                <span className="font-bold text-cipher-navy mono text-[11px]">{anchorLat?.toFixed(6)}° N</span>
              </div>
              <div>
                <span className="text-[9px] text-cipher-muted uppercase block">BUILDING LNG</span>
                <span className="font-bold text-cipher-navy mono text-[11px]">{anchorLng?.toFixed(6)}° E</span>
              </div>
            </div>
          </div>

          {/* 2. Local 3D Cartesian Coordinates & Vertical Elevation */}
          <div>
            <div className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Ruler size={13} className="text-cipher-govblue" />
              <span>Local 3D &amp; Vertical Geometry</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[9px] text-cipher-muted font-bold">LOCAL X</div>
                <div className="font-bold text-cipher-navy mono text-[11px] mt-0.5">{localX}m</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[9px] text-cipher-muted font-bold">LOCAL Y (ALT)</div>
                <div className="font-bold text-cipher-navy mono text-[11px] mt-0.5">+{localY}m</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
                <div className="text-[9px] text-cipher-muted font-bold">LOCAL Z</div>
                <div className="font-bold text-cipher-navy mono text-[11px] mt-0.5">{localZ}m</div>
              </div>
            </div>
          </div>

          {/* 3. Cadastral Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-cipher-muted font-medium">UNIT TYPE</div>
              <div className="font-bold text-cipher-navy mt-0.5 truncate">{selectedRoom.type}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-cipher-muted font-medium">FLOOR LEVEL</div>
              <div className="font-bold text-cipher-navy mt-0.5 mono truncate">
                {selectedRoom.floorShortName || selectedRoom.floorId} (+{selectedRoom.elevation}m)
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-cipher-muted font-medium">FLOOR AREA</div>
              <div className="font-bold text-cipher-govblue mt-0.5 mono">{area} m²</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-cipher-muted font-medium">DIMENSIONS (W×D×H)</div>
              <div className="font-bold text-cipher-navy mt-0.5 mono text-[10px]">
                {selectedRoom.width.toFixed(1)}m × {selectedRoom.depth.toFixed(1)}m × {selectedRoom.height.toFixed(1)}m
              </div>
            </div>
          </div>

          {/* Vertical Stack Column */}
          {stackInfo && stackInfo.stack.length > 1 && (
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60">
              <div className="flex items-center justify-between text-[11px] font-bold text-cipher-navy uppercase tracking-wide mb-2">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-cipher-govblue" />
                  Vertical Column Stack
                </span>
                <span className="text-[10px] font-semibold text-cipher-govblue bg-white px-2 py-0.5 rounded border border-blue-200">
                  {stackInfo.stack.length} Units
                </span>
              </div>
              <div className="space-y-1.5">
                {stackInfo.above && (
                  <button
                    onClick={() => selectRoom(stackInfo.above.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-cipher-govblue text-left transition-all text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <ArrowUp size={12} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-cipher-navy">{stackInfo.above.name}</div>
                        <div className="text-[10px] text-slate-500">{stackInfo.above.floorShortName} (+{stackInfo.above.elevation}m)</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-cipher-govblue font-bold">Above →</span>
                  </button>
                )}

                <div className="p-2 rounded-lg bg-cipher-govblue text-white flex items-center justify-between text-xs font-bold shadow-2xs">
                  <span>★ {selectedRoom.name} (Current)</span>
                  <span className="text-[10px] opacity-90">{selectedRoom.floorShortName} (+{selectedRoom.elevation}m)</span>
                </div>

                {stackInfo.below && (
                  <button
                    onClick={() => selectRoom(stackInfo.below.id)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-cipher-govblue text-left transition-all text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <ArrowDown size={12} className="text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold text-cipher-navy">{stackInfo.below.name}</div>
                        <div className="text-[10px] text-slate-500">{stackInfo.below.floorShortName} (+{stackInfo.below.elevation}m)</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-cipher-govblue font-bold">Below →</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Building Overview Specs */
        <div>
          <div className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide mb-2">
            Building Cadastral Specifications
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-cipher-muted font-medium">PROPERTY NAME</div>
              <div className="font-bold text-cipher-navy mt-0.5 truncate">{propertyName}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-cipher-muted font-medium">PROPERTY TYPE</div>
              <div className="font-bold text-cipher-navy mt-0.5 truncate">{propertyType}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-cipher-muted font-medium">TOTAL FLOORS</div>
              <div className="font-bold text-cipher-navy mt-0.5 mono">{totalFloors} Spatial Floors</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-cipher-muted font-medium">GIS ANCHOR (WGS84)</div>
              <div className="font-bold text-cipher-navy mt-0.5 mono text-[10px]">
                {anchorLat?.toFixed(4)}°N, {anchorLng?.toFixed(4)}°E
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <p className="text-xs text-cipher-navy font-semibold">Touch or Click any 3D Block</p>
            <p className="text-[11px] text-cipher-muted mt-0.5">
              Inspect Global GIS (WGS84) + Local 3D Coordinates (XYZ) and Vertical ULPIN.
            </p>
          </div>
        </div>
      )}

      {/* Security & Verification Footer */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-cipher-border flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-2">
          <Lock size={13} className="text-cipher-govblue" />
          <span className="text-cipher-muted text-[11px]">GIS Reference:</span>
          <span className="font-bold text-emerald-600 text-[11px]">✓ WGS84 EPSG:4326</span>
        </div>
        <span className="text-[10px] text-cipher-muted mono font-semibold">CIPHERCORE</span>
      </div>
    </aside>
  );
}

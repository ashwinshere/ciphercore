import React from 'react';
import BuildingScene from '../three/BuildingScene.jsx';
import BuildingControls from '../three/BuildingControls.jsx';
import PropertyDetails from '../components/PropertyDetails.jsx';
import FloorSelector from '../components/FloorSelector.jsx';
import { useApp } from '../context/AppContext.jsx';
import { Globe, ChevronRight, MapPin, Building2, Layers } from 'lucide-react';
import { gisData } from '../data/gisData.js';

export default function Explorer() {
  const { selectedRoom, buildingData, selectedProperty, setCurrentPage } = useApp();

  const titleName = selectedProperty ? selectedProperty.name : buildingData.building.name;
  const ulpin2D = selectedProperty ? selectedProperty.ulpin2D : '29-01-001-000123';

  return (
    <div className="fade-in h-full flex flex-col gap-3 pb-4">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              3D Spatial Digital Twin
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium mono">
              {titleName} ({ulpin2D})
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            3D Building Explorer — {titleName}
          </h1>
        </div>
        <BuildingControls />
      </div>

      {/* Visual Transition / Breadcrumb Flow Bar */}
      <div className="gov-card px-3.5 py-2 bg-white border border-cipher-border flex items-center justify-between flex-wrap gap-2 shadow-subtle text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 font-bold text-cipher-navy overflow-x-auto">
          <button
            onClick={() => setCurrentPage('gis-explorer')}
            className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-blue-50 text-cipher-govblue border border-slate-200 flex items-center gap-1 shrink-0 transition-colors"
            title="View in GIS Explorer"
          >
            <Globe size={12} />
            <span>1. GIS MAP</span>
          </button>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-cipher-navy border border-slate-200 shrink-0">
            2. {gisData.campus.shortName}
          </span>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-cipher-govblue border border-blue-200 shrink-0 font-extrabold">
            3. {titleName} (3D MODEL)
          </span>
          <ChevronRight size={13} className="text-slate-400 shrink-0" />
          <span className={`px-2.5 py-1 rounded-md border shrink-0 ${selectedRoom ? 'bg-amber-50 text-amber-900 border-amber-200 font-extrabold' : 'bg-slate-50 text-cipher-muted border-slate-200'}`}>
            4. {selectedRoom ? selectedRoom.name : 'SELECT ROOM'}
          </span>
        </div>

        <div className="text-[11px] text-cipher-muted hidden lg:block font-medium">
          “GIS tells us where the building exists on Earth. VERTEX tells us where every property exists inside.”
        </div>
      </div>

      {/* Main Viewport + Property Details Panel */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 min-h-[560px]">
        <div className="flex flex-col gap-3 h-full">
          <div className="flex-1 min-h-[460px]">
            <BuildingScene height="100%" />
          </div>
          <FloorSelector />
        </div>
        <div className="h-full min-h-[460px]">
          <PropertyDetails />
        </div>
      </div>

      {selectedRoom && (
        <div className="gov-card px-4 py-2 flex items-center justify-between text-xs text-cipher-muted shadow-subtle">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cipher-govblue" />
            <span>Active Unit Selection:</span>
            <strong className="text-cipher-navy">{selectedRoom.name}</strong>
            <span className="text-[10px] text-slate-500">({selectedRoom.type})</span>
          </div>
          <span className="mono font-semibold text-cipher-govblue">{selectedRoom.id}</span>
        </div>
      )}
    </div>
  );
}

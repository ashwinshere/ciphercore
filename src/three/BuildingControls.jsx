import React from 'react';
import { RotateCcw, Eye, EyeOff, Maximize2, Map } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import ExplodedViewController from './ExplodedViewController.jsx';

export default function BuildingControls() {
  const {
    buildingData,
    isolatedFloorId,
    isolateFloor,
    visibleFloorIds,
    toggleFloorVisibility,
    resetCamera,
    backToMap
  } = useApp();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={backToMap}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-extrabold bg-cipher-govblue text-white hover:bg-cipher-navy transition-all shadow-subtle group"
      >
        <Map size={14} className="text-white group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to 2D Map</span>
      </button>

      <button
        onClick={resetCamera}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-cipher-border text-cipher-navy hover:bg-slate-50 hover:border-slate-300 transition-all shadow-subtle"
      >
        <RotateCcw size={13} className="text-cipher-govblue" /> Reset View
      </button>

      <ExplodedViewController />

      <button
        onClick={() => isolateFloor(null)}
        disabled={!isolatedFloorId}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-cipher-border text-cipher-navy hover:bg-slate-50 transition-all shadow-subtle disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Maximize2 size={13} className="text-cipher-govblue" /> All Floors
      </button>

      <div className="h-5 w-px bg-cipher-border mx-1 hidden sm:block" />

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {buildingData.floors.map((floor) => {
          const isVisible = visibleFloorIds.includes(floor.id);
          const isIsolated = isolatedFloorId === floor.id;
          return (
            <div key={floor.id} className="flex items-center gap-0.5 bg-white border border-cipher-border rounded-lg p-0.5 shadow-subtle">
              <button
                onClick={() => isolateFloor(floor.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  isIsolated
                    ? 'bg-cipher-govblue text-white shadow-subtle'
                    : 'text-cipher-text hover:bg-slate-100'
                }`}
                title={`Isolate ${floor.name}`}
              >
                {floor.shortName}
              </button>
              <button
                onClick={() => toggleFloorVisibility(floor.id)}
                className={`p-1 rounded-md transition-colors ${
                  isVisible ? 'text-cipher-muted hover:text-cipher-navy' : 'text-slate-300'
                }`}
                title={isVisible ? 'Hide floor' : 'Show floor'}
              >
                {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

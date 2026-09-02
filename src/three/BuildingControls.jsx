import React from 'react';
import { RotateCcw, Eye, EyeOff, Maximize2 } from 'lucide-react';
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
  } = useApp();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={resetCamera}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass border border-vertex-border hover:border-vertex-cyan/50 text-slate-200 transition-colors"
      >
        <RotateCcw size={13} /> Reset Camera
      </button>

      <ExplodedViewController />

      <button
        onClick={() => isolateFloor(null)}
        disabled={!isolatedFloorId}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass border border-vertex-border text-slate-200 hover:border-vertex-cyan/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Maximize2 size={13} /> Show All Floors
      </button>

      <div className="h-5 w-px bg-vertex-border mx-1" />

      {buildingData.floors.map((floor) => {
        const isVisible = visibleFloorIds.includes(floor.id);
        const isIsolated = isolatedFloorId === floor.id;
        return (
          <div key={floor.id} className="flex items-center gap-1">
            <button
              onClick={() => isolateFloor(floor.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                isIsolated
                  ? 'bg-vertex-cyan/20 border-vertex-cyan text-vertex-cyan'
                  : 'glass border-vertex-border text-slate-300 hover:border-vertex-cyan/40'
              }`}
              title={`Isolate ${floor.name}`}
            >
              {floor.shortName}
            </button>
            <button
              onClick={() => toggleFloorVisibility(floor.id)}
              className="p-1.5 rounded-lg glass border border-vertex-border text-slate-400 hover:text-vertex-cyan transition-colors"
              title={isVisible ? 'Hide floor' : 'Show floor'}
            >
              {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          </div>
        );
      })}
    </div>
  );
}

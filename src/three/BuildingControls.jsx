import React from 'react';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  Map,
  Compass,
  Box,
  Layers,
  Sparkles
} from 'lucide-react';
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
    backToMap,
    cameraPreset,
    setCameraPreset,
    wireframeMode,
    setWireframeMode,
  } = useApp();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Back to 2D Map */}
      <button
        onClick={backToMap}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cipher-govblue text-white hover:bg-cipher-navy transition-all shadow-subtle group"
      >
        <Map size={13} className="text-white group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to 2D Map</span>
      </button>

      {/* Camera View Angle Presets */}
      <div className="flex items-center bg-white border border-cipher-border rounded-lg p-0.5 shadow-subtle">
        <button
          onClick={() => setCameraPreset('iso')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
            cameraPreset === 'iso'
              ? 'bg-cipher-govblue text-white shadow-subtle'
              : 'text-cipher-navy hover:bg-slate-100'
          }`}
          title="Isometric 3D Perspective"
        >
          3D Iso
        </button>
        <button
          onClick={() => setCameraPreset('top')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
            cameraPreset === 'top'
              ? 'bg-cipher-govblue text-white shadow-subtle'
              : 'text-cipher-navy hover:bg-slate-100'
          }`}
          title="Top-Down 2D Architectural View"
        >
          Top
        </button>
        <button
          onClick={() => setCameraPreset('front')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
            cameraPreset === 'front'
              ? 'bg-cipher-govblue text-white shadow-subtle'
              : 'text-cipher-navy hover:bg-slate-100'
          }`}
          title="Front Elevation"
        >
          Front
        </button>
        <button
          onClick={() => setCameraPreset('side')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
            cameraPreset === 'side'
              ? 'bg-cipher-govblue text-white shadow-subtle'
              : 'text-cipher-navy hover:bg-slate-100'
          }`}
          title="Side Elevation"
        >
          Side
        </button>
      </div>

      {/* Exploded View Toggle */}
      <ExplodedViewController />

      {/* Wireframe / X-Ray Toggle */}
      <button
        onClick={() => setWireframeMode((w) => !w)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          wireframeMode
            ? 'bg-cipher-navy text-white border-cipher-navy shadow-subtle'
            : 'bg-white border-cipher-border text-cipher-navy hover:bg-slate-50 shadow-subtle'
        }`}
        title="Toggle Architectural Wireframe / X-Ray Mode"
      >
        <Box size={13} className={wireframeMode ? 'text-cyan-300' : 'text-cipher-govblue'} />
        <span>{wireframeMode ? 'Solid Mode' : 'Wireframe'}</span>
      </button>

      {/* Reset Camera Position */}
      <button
        onClick={resetCamera}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-cipher-border text-cipher-navy hover:bg-slate-50 transition-all shadow-subtle"
        title="Reset Camera to Default Perspective"
      >
        <RotateCcw size={12} className="text-cipher-govblue" />
        <span>Reset</span>
      </button>

      {/* Isolate All / Reset Isolation */}
      {isolatedFloorId && (
        <button
          onClick={() => isolateFloor(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-subtle"
        >
          <Maximize2 size={13} />
          <span>Show All Floors</span>
        </button>
      )}

      {/* Floor Isolation & Visibility Chips */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {buildingData.floors.map((floor) => {
          const isVisible = visibleFloorIds.includes(floor.id);
          const isIsolated = isolatedFloorId === floor.id;
          return (
            <div
              key={floor.id}
              className="flex items-center gap-0.5 bg-white border border-cipher-border rounded-lg p-0.5 shadow-subtle"
            >
              <button
                onClick={() => isolateFloor(floor.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  isIsolated
                    ? 'bg-cipher-govblue text-white shadow-subtle'
                    : 'text-cipher-navy hover:bg-slate-100'
                }`}
                title={`Isolate ${floor.name}`}
              >
                {floor.shortName}
              </button>
              <button
                onClick={() => toggleFloorVisibility(floor.id)}
                className={`p-0.5 rounded transition-colors ${
                  isVisible ? 'text-cipher-muted hover:text-cipher-navy' : 'text-slate-300'
                }`}
                title={isVisible ? 'Hide Floor' : 'Show Floor'}
              >
                {isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

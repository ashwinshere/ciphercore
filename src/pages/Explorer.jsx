import React from 'react';
import BuildingScene from '../three/BuildingScene.jsx';
import BuildingControls from '../three/BuildingControls.jsx';
import PropertyPanel from '../components/PropertyPanel.jsx';
import FloorSelector from '../components/FloorSelector.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function Explorer() {
  const { selectedRoom } = useApp();

  return (
    <div className="fade-in h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-white">3D Explorer</h1>
          <p className="text-xs text-slate-500">Interactive digital twin of RV Block · Prototype Spatial Data</p>
        </div>
        <BuildingControls />
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 min-h-[560px]">
        <BuildingScene height="100%" />
        <div className="h-full min-h-[400px]">
          <PropertyPanel />
        </div>
      </div>

      <FloorSelector />

      {selectedRoom && (
        <p className="text-[11px] text-slate-500 text-center">
          Selected: <span className="mono text-vertex-cyan">{selectedRoom.id}</span>
        </p>
      )}
    </div>
  );
}

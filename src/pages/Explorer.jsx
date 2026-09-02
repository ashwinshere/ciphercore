import React from 'react';
import { Box, Layers, MapPin } from 'lucide-react';
import BuildingScene from '../three/BuildingScene.jsx';
import BuildingControls from '../three/BuildingControls.jsx';
import PropertyPanel from '../components/PropertyPanel.jsx';
import FloorSelector from '../components/FloorSelector.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function Explorer() {
  const { selectedRoom, buildingData } = useApp();

  return (
    <div className="fade-in h-full flex flex-col gap-4 pb-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              Cadastral 3D Engine
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">
              {buildingData.building.name}, {buildingData.building.location}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            3D Property Map
          </h1>
        </div>
        <BuildingControls />
      </div>

      {/* Main Viewport + Property Panel */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 min-h-[560px]">
        <div className="flex flex-col gap-3 h-full">
          <div className="flex-1 min-h-[460px]">
            <BuildingScene height="100%" />
          </div>
          <FloorSelector />
        </div>
        <div className="h-full min-h-[460px]">
          <PropertyPanel />
        </div>
      </div>

      {selectedRoom && (
        <div className="gov-card px-4 py-2 flex items-center justify-between text-xs text-cipher-muted shadow-subtle">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cipher-govblue" />
            <span>Active Selection:</span>
            <strong className="text-cipher-navy">{selectedRoom.name}</strong>
          </div>
          <span className="mono font-semibold text-cipher-govblue">{selectedRoom.id}</span>
        </div>
      )}
    </div>
  );
}

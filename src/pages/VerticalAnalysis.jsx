import React from 'react';
import { ArrowUpDown, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import BuildingScene from '../three/BuildingScene.jsx';
import VerticalStack from '../three/VerticalStack.jsx';

export default function VerticalAnalysis() {
  const { allRooms, selectedRoom, selectRoom, buildingData } = useApp();

  return (
    <div className="fade-in h-full flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              3D Cadastral Hierarchy
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">
              Multi-Floor Overlap Analysis
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            Vertical Stack Structure
          </h1>
        </div>

        {/* Room Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-cipher-muted">Target Unit:</label>
          <select
            value={selectedRoom?.id || ''}
            onChange={(e) => e.target.value && selectRoom(e.target.value)}
            className="bg-white border border-cipher-border rounded-lg px-3 py-1.5 text-xs font-semibold text-cipher-navy outline-none focus:border-cipher-govblue shadow-subtle cursor-pointer"
          >
            <option value="" disabled>
              Select cadastral unit…
            </option>
            {allRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.floorShortName} ({r.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: 3D Stack Canvas + Vertical Stack Diagram */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 flex-1 min-h-[520px]">
        <div className="flex flex-col h-full min-h-[460px]">
          <BuildingScene height="100%" showStackOnly />
        </div>
        <div className="h-full min-h-[460px]">
          <VerticalStack />
        </div>
      </div>
    </div>
  );
}

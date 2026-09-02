import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import BuildingScene from '../three/BuildingScene.jsx';
import VerticalStack from '../three/VerticalStack.jsx';

export default function VerticalAnalysis() {
  const { allRooms, selectedRoom, selectRoom } = useApp();

  return (
    <div className="fade-in h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <ArrowUpDown size={18} className="text-vertex-cyan" />
            Vertical Stack Analysis
          </h1>
          <p className="text-xs text-slate-500">
            Rooms whose X/Y footprints significantly overlap across floors are treated as vertically related.
          </p>
        </div>
        <select
          value={selectedRoom?.id || ''}
          onChange={(e) => e.target.value && selectRoom(e.target.value)}
          className="glass border border-vertex-border rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-vertex-cyan/50"
        >
          <option value="" disabled>
            Select a room…
          </option>
          {allRooms.map((r) => (
            <option key={r.id} value={r.id} className="bg-vertex-panel">
              {r.name} — {r.floorShortName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4 flex-1 min-h-[520px]">
        <BuildingScene height="100%" showStackOnly />
        <div className="h-full overflow-y-auto">
          <VerticalStack />
        </div>
      </div>
    </div>
  );
}

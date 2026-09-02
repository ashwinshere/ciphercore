import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function FloorSelector({ onFloorClick }) {
  const { buildingData, isolatedFloorId, isolateFloor } = useApp();

  const handleClick = (floorId) => {
    isolateFloor(floorId);
    onFloorClick?.(floorId);
  };

  return (
    <div className="flex items-center gap-2 glass border border-vertex-border rounded-xl px-3 py-2 overflow-x-auto">
      <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1 shrink-0">Floors</span>
      {[...buildingData.floors].reverse().map((floor) => {
        const active = isolatedFloorId === floor.id;
        return (
          <button
            key={floor.id}
            onClick={() => handleClick(floor.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              active
                ? 'bg-vertex-cyan text-vertex-bg border-vertex-cyan font-semibold'
                : 'text-slate-300 border-vertex-border hover:border-vertex-cyan/40'
            }`}
          >
            {floor.shortName}
          </button>
        );
      })}
    </div>
  );
}

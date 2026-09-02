import React from 'react';
import { Layers } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function FloorSelector({ onFloorClick }) {
  const { buildingData, isolatedFloorId, isolateFloor } = useApp();

  const handleClick = (floorId) => {
    isolateFloor(floorId);
    onFloorClick?.(floorId);
  };

  return (
    <div className="flex items-center gap-2 gov-card px-4 py-2.5 overflow-x-auto shadow-subtle">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cipher-muted mr-2 shrink-0">
        <Layers size={14} className="text-cipher-govblue" />
        <span>Floor Levels:</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleClick(null)}
          className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
            isolatedFloorId === null
              ? 'bg-cipher-navy text-white border-cipher-navy shadow-subtle'
              : 'bg-white text-cipher-text border-cipher-border hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          All Levels
        </button>
        {[...buildingData.floors].reverse().map((floor) => {
          const active = isolatedFloorId === floor.id;
          return (
            <button
              key={floor.id}
              onClick={() => handleClick(floor.id)}
              className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                active
                  ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-subtle'
                  : 'bg-white text-cipher-text border-cipher-border hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span>{floor.shortName}</span>
              <span className="text-[10px] font-normal opacity-70 ml-1.5">
                +{floor.elevation}m
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

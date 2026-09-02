import React from 'react';
import { ArrowUp, ArrowDown, Layers3 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';

export default function VerticalStack({ compact = false }) {
  const { selectedRoom, allRooms, selectRoom } = useApp();

  if (!selectedRoom) {
    return (
      <div className="glass rounded-xl p-5 text-center text-slate-500 text-sm">
        <Layers3 size={26} className="mx-auto mb-2 opacity-40" />
        Select a room to see its vertical stack.
      </div>
    );
  }

  const { stack } = detectVerticalStack(selectedRoom, allRooms);

  return (
    <div className="glass rounded-xl p-5 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Layers3 size={16} className="text-vertex-cyan" />
        <h3 className="text-sm font-semibold text-white">Vertical Stack — {selectedRoom.name}</h3>
      </div>

      <div className="flex flex-col items-center">
        {stack.map((room, idx) => {
          const isSelf = room.id === selectedRoom.id;
          const isTop = idx === 0;
          const isBottom = idx === stack.length - 1;
          return (
            <React.Fragment key={room.id}>
              {idx !== 0 && <div className="w-px h-4 bg-vertex-border" />}
              <button
                onClick={() => selectRoom(room.id)}
                className={`w-full ${compact ? 'max-w-[220px]' : 'max-w-xs'} flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-colors ${
                  isSelf
                    ? 'bg-vertex-cyan/20 border-vertex-cyan text-vertex-cyan shadow-glow'
                    : 'glass border-vertex-border text-slate-200 hover:border-vertex-cyan/40'
                }`}
              >
                <span className="text-xs font-semibold">{room.name}</span>
                <span className="text-[10px] mono text-slate-400">{room.floorShortName}</span>
              </button>
              {isTop && stack.length > 1 && (
                <span className="text-[10px] text-slate-500 mt-1 -mb-1">ABOVE</span>
              )}
            </React.Fragment>
          );
        })}
        {stack.length > 1 && <span className="text-[10px] text-slate-500 mt-2">BELOW</span>}
        {stack.length <= 1 && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            No vertically aligned rooms detected on other floors for this footprint.
          </p>
        )}
      </div>
    </div>
  );
}

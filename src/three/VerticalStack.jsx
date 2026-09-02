import React from 'react';
import { ArrowUp, ArrowDown, Layers, Building2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';

export default function VerticalStack({ compact = false }) {
  const { selectedRoom, allRooms, selectRoom } = useApp();

  if (!selectedRoom) {
    return (
      <div className="gov-card p-6 text-center text-cipher-muted text-xs flex flex-col items-center justify-center h-full">
        <Layers size={28} className="text-slate-300 mb-2" />
        <p className="font-medium text-cipher-navy">Select a Cadastral Unit</p>
        <p className="text-[11px] text-cipher-muted mt-1">
          Select any property to inspect vertically aligned units across all floors.
        </p>
      </div>
    );
  }

  const { stack } = detectVerticalStack(selectedRoom, allRooms);

  return (
    <div className="gov-card p-5 fade-in flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-cipher-border">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-cipher-govblue" />
          <h3 className="text-xs font-bold text-cipher-navy uppercase tracking-wide">
            Vertical Stack — {selectedRoom.name}
          </h3>
        </div>
        <span className="text-[10px] font-semibold bg-blue-50 text-cipher-govblue border border-blue-200 px-2 py-0.5 rounded">
          {stack.length} Units In Column
        </span>
      </div>

      <div className="flex flex-col items-center flex-1 justify-center py-2">
        {stack.map((room, idx) => {
          const isSelf = room.id === selectedRoom.id;
          const isTop = idx === 0;
          const isBottom = idx === stack.length - 1;
          return (
            <React.Fragment key={room.id}>
              {idx !== 0 && (
                <div className="flex flex-col items-center my-0.5">
                  <div className="w-0.5 h-4 bg-slate-300" />
                </div>
              )}
              <button
                onClick={() => selectRoom(room.id)}
                className={`w-full ${compact ? 'max-w-[240px]' : 'max-w-xs'} flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border transition-all ${
                  isSelf
                    ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-card'
                    : 'bg-white border-cipher-border text-cipher-text hover:border-cipher-govblue hover:bg-blue-50/40 shadow-subtle'
                }`}
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{
                    backgroundColor: isSelf ? '#FFFFFF' : '#1E5A96'
                  }} />
                  <div>
                    <div className={`text-xs font-bold ${isSelf ? 'text-white' : 'text-cipher-navy'}`}>
                      {room.name}
                    </div>
                    <div className={`text-[10px] ${isSelf ? 'text-blue-100' : 'text-cipher-muted'}`}>
                      {room.type}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[11px] font-semibold ${isSelf ? 'text-white' : 'text-cipher-navy'}`}>
                    {room.floorShortName}
                  </div>
                  <div className={`text-[10px] mono ${isSelf ? 'text-blue-100' : 'text-slate-400'}`}>
                    +{room.elevation}m
                  </div>
                </div>
              </button>
            </React.Fragment>
          );
        })}
        {stack.length <= 1 && (
          <p className="text-xs text-cipher-muted mt-2 text-center">
            No vertically aligned rooms detected on other levels for this footprint.
          </p>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-cipher-border text-[10px] text-cipher-muted text-center">
        Bounding-box overlap threshold: <span className="font-semibold text-cipher-navy">50% footprint</span>
      </div>
    </div>
  );
}

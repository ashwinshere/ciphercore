import React from 'react';
import { History, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { DEFAULT_TIMELINE_EVENTS, TIMELINE_YEARS } from '../data/buildingData.js';

export default function Timeline() {
  const { allRooms, selectedRoom, selectRoom, timelineYear, setTimelineYear } = useApp();

  const activeIndex = TIMELINE_YEARS.indexOf(timelineYear);
  const eventsUpToYear = DEFAULT_TIMELINE_EVENTS.filter((e) => e.year <= timelineYear);
  const currentEvent = [...eventsUpToYear].reverse()[0];

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <History size={18} className="text-vertex-cyan" />
            4D Property Timeline
          </h1>
          <p className="text-xs text-slate-500">Track a property's prototype mapping status over time.</p>
        </div>
        <select
          value={selectedRoom?.id || ''}
          onChange={(e) => e.target.value && selectRoom(e.target.value, { focus: false })}
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

      <div className="glass rounded-xl border border-vertex-border p-6">
        <div className="flex items-center justify-between mb-6 px-2">
          {TIMELINE_YEARS.map((year, idx) => (
            <React.Fragment key={year}>
              <button onClick={() => setTimelineYear(year)} className="flex flex-col items-center gap-2 group">
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    idx <= activeIndex
                      ? 'bg-vertex-cyan border-vertex-cyan shadow-glow'
                      : 'bg-transparent border-vertex-border group-hover:border-vertex-cyan/50'
                  }`}
                />
                <span className={`text-xs font-semibold ${idx <= activeIndex ? 'text-vertex-cyan' : 'text-slate-500'}`}>
                  {year}
                </span>
              </button>
              {idx < TIMELINE_YEARS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded ${idx < activeIndex ? 'bg-vertex-cyan' : 'bg-vertex-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <input
          type="range"
          min={0}
          max={TIMELINE_YEARS.length - 1}
          value={activeIndex}
          onChange={(e) => setTimelineYear(TIMELINE_YEARS[Number(e.target.value)])}
          className="w-full accent-cyan-400"
        />
      </div>

      {!selectedRoom ? (
        <div className="glass rounded-xl p-10 text-center text-slate-500 text-sm">
          Select a room above to view its property event history.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div className="glass rounded-xl border border-vertex-border p-6">
            <h2 className="text-sm font-semibold text-white mb-4">
              Event History — <span className="text-vertex-cyan">{selectedRoom.name}</span>
            </h2>
            <div className="space-y-4">
              {DEFAULT_TIMELINE_EVENTS.map((ev) => {
                const reached = ev.year <= timelineYear;
                return (
                  <div key={ev.year} className={`flex gap-3 ${reached ? '' : 'opacity-35'}`}>
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${reached ? 'bg-vertex-cyan/15 border-vertex-cyan text-vertex-cyan' : 'border-vertex-border text-slate-500'}`}>
                        <CheckCircle2 size={13} />
                      </div>
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100">{ev.title}</span>
                        <span className="mono text-[10px] text-slate-500">{ev.year}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{ev.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-xl border border-vertex-border p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Status as of {timelineYear}
            </h3>
            <div className="text-lg font-bold text-vertex-cyan mb-1">{currentEvent?.status || '—'}</div>
            <p className="text-xs text-slate-500">{currentEvent?.description}</p>
            <div className="mt-4 pt-4 border-t border-vertex-border/60 text-[11px] text-slate-500 mono break-all">
              {selectedRoom.id}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

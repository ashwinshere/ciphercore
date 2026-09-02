import React from 'react';
import { History, CheckCircle2, ShieldCheck, Clock, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { DEFAULT_TIMELINE_EVENTS, TIMELINE_YEARS } from '../data/buildingData.js';

export default function Timeline() {
  const { allRooms, selectedRoom, selectRoom, timelineYear, setTimelineYear, buildingData } = useApp();

  const activeIndex = TIMELINE_YEARS.indexOf(timelineYear);
  const eventsUpToYear = DEFAULT_TIMELINE_EVENTS.filter((e) => e.year <= timelineYear);
  const currentEvent = [...eventsUpToYear].reverse()[0];

  return (
    <div className="fade-in space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              4D Cadastral Records
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">
              Spatial Registry Versioning
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight flex items-center gap-2">
            <History size={20} className="text-cipher-govblue" />
            Cadastral Timeline
          </h1>
        </div>

        {/* Room Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-cipher-muted">Inspect Cadastral Unit:</label>
          <select
            value={selectedRoom?.id || ''}
            onChange={(e) => e.target.value && selectRoom(e.target.value, { focus: false })}
            className="bg-white border border-cipher-border rounded-lg px-3 py-1.5 text-xs font-semibold text-cipher-navy outline-none focus:border-cipher-govblue shadow-subtle cursor-pointer"
          >
            <option value="" disabled>
              Select unit…
            </option>
            {allRooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} — {r.floorShortName} ({r.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Slider Control */}
      <div className="gov-card p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-cipher-navy">
            Cadastral Survey Progression
          </span>
          <span className="text-xs font-semibold text-cipher-govblue bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
            Active Epoch: {timelineYear}
          </span>
        </div>

        <div className="flex items-center justify-between my-6 px-4">
          {TIMELINE_YEARS.map((year, idx) => (
            <React.Fragment key={year}>
              <button
                onClick={() => setTimelineYear(year)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    idx <= activeIndex
                      ? 'bg-cipher-govblue border-cipher-govblue text-white shadow-subtle'
                      : 'bg-white border-slate-300 group-hover:border-cipher-govblue'
                  }`}
                >
                  {idx <= activeIndex && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span
                  className={`text-xs font-bold ${
                    idx <= activeIndex ? 'text-cipher-navy' : 'text-slate-400'
                  }`}
                >
                  {year}
                </span>
              </button>
              {idx < TIMELINE_YEARS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-3 rounded transition-colors ${
                    idx < activeIndex ? 'bg-cipher-govblue' : 'bg-slate-200'
                  }`}
                />
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
          className="w-full accent-cipher-govblue cursor-pointer"
        />
      </div>

      {!selectedRoom ? (
        <div className="gov-card p-12 text-center text-cipher-muted text-xs flex flex-col items-center justify-center gap-2">
          <History size={28} className="text-slate-300" />
          <p className="font-semibold text-cipher-navy">No Cadastral Unit Selected</p>
          <p>Select any property from the dropdown above to view historical spatial milestones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          {/* Milestone Trail */}
          <div className="gov-card p-5">
            <h2 className="text-xs font-bold text-cipher-navy uppercase tracking-wide mb-4 pb-2 border-b border-cipher-border">
              Historical Audits — <span className="text-cipher-govblue">{selectedRoom.name}</span>
            </h2>
            <div className="space-y-4">
              {DEFAULT_TIMELINE_EVENTS.map((ev) => {
                const reached = ev.year <= timelineYear;
                return (
                  <div
                    key={ev.year}
                    className={`flex items-start gap-3.5 transition-opacity ${
                      reached ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div className="flex flex-col items-center mt-0.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                          reached
                            ? 'bg-emerald-50 border-emerald-300 text-cipher-success shadow-subtle'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <CheckCircle2 size={15} />
                      </div>
                    </div>
                    <div className="flex-1 pb-3 border-b border-cipher-borderLight last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cipher-navy">{ev.title}</span>
                        <span className="mono text-[10px] font-semibold text-cipher-muted bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          {ev.year}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {ev.status}
                        </span>
                      </div>
                      <p className="text-xs text-cipher-text mt-1 leading-relaxed">{ev.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Epoch Status Card */}
          <div className="gov-card p-5 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-cipher-muted uppercase tracking-wider mb-2">
                Cadastral Status at {timelineYear}
              </div>
              <div className="text-xl font-extrabold text-cipher-navy mb-1 flex items-center gap-2">
                <ShieldCheck size={20} className="text-cipher-success" />
                {currentEvent?.status || 'Active'}
              </div>
              <p className="text-xs text-cipher-muted leading-relaxed mt-2">{currentEvent?.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-cipher-border">
              <div className="text-[10px] text-cipher-muted uppercase font-semibold mb-1">
                Property ULPIN
              </div>
              <div className="mono text-xs font-bold text-cipher-govblue break-all bg-slate-50 p-2 rounded border border-cipher-border">
                {selectedRoom.id}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

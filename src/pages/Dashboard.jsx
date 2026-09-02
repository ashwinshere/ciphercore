import React, { useMemo } from 'react';
import { Building2, Ruler, ArrowUpDown, AlertTriangle, Hash, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { countVerticalRelationships } from '../utils/verticalAnalysis.js';

export default function Dashboard() {
  const { buildingData, allRooms, conflicts, setCurrentPage } = useApp();

  const verticalRelationships = useMemo(() => countVerticalRelationships(allRooms), [allRooms]);

  const cards = [
    { icon: Building2, label: 'Building', value: buildingData.building.name, sub: buildingData.building.location, color: 'text-vertex-cyan' },
    { icon: Ruler, label: 'Properties Mapped', value: allRooms.length, sub: `Across ${buildingData.floors.length} floors`, color: 'text-vertex-blue' },
    { icon: ArrowUpDown, label: 'Vertical Relationships', value: verticalRelationships, sub: 'Room-above / room-below pairs', color: 'text-vertex-accent' },
    { icon: AlertTriangle, label: 'Spatial Conflicts', value: conflicts.length, sub: 'Detected via geometry QA', color: conflicts.length ? 'text-vertex-warn' : 'text-vertex-ok' },
    { icon: Hash, label: 'Property IDs Generated', value: allRooms.length, sub: 'Prototype Vertical Property IDs', color: 'text-vertex-cyan' },
  ];

  return (
    <div className="fade-in space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-vertex-warn/15 text-vertex-warn border border-vertex-warn/30">
            PROTOTYPE SPATIAL DATA
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">
          Digital Twin Overview — {buildingData.building.name}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {buildingData.building.institution}, {buildingData.building.location}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass rounded-xl p-4 border border-vertex-border hover:border-vertex-cyan/30 transition-colors">
              <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center mb-3 ${card.color}`}>
                <Icon size={17} />
              </div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">{card.label}</div>
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-xl p-6 border border-vertex-border">
          <h2 className="text-sm font-semibold text-white mb-4">How VERTEX Works</h2>
          <div className="flex flex-col gap-0">
            {[
              { step: '2D Floor Data', desc: 'Editable room coordinates & dimensions in buildingData.js' },
              { step: '3D Digital Twin', desc: 'Procedurally generated Three.js model from that data' },
              { step: 'Vertical Property Mapping', desc: 'Bounding-box overlap detects rooms above/below' },
              { step: 'Spatial Intelligence', desc: 'Automated conflict & anomaly detection across the registry' },
            ].map((s, idx, arr) => (
              <div key={s.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-vertex-cyan/15 border border-vertex-cyan/40 text-vertex-cyan flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  {idx < arr.length - 1 && <div className="w-px flex-1 bg-vertex-border my-1" />}
                </div>
                <div className="pb-6">
                  <div className="text-sm font-semibold text-slate-100">{s.step}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6 border border-vertex-border flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-2.5">
            {[
              { label: 'Open 3D Explorer', page: 'explorer' },
              { label: 'View Floor Mapping', page: 'floor-mapping' },
              { label: 'Run Vertical Analysis', page: 'vertical-analysis' },
              { label: 'Review Conflicts', page: 'conflict-detection' },
              { label: 'Browse Property Registry', page: 'registry' },
            ].map((a) => (
              <button
                key={a.page}
                onClick={() => setCurrentPage(a.page)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg glass border border-vertex-border hover:border-vertex-cyan/40 text-xs text-slate-200 transition-colors"
              >
                {a.label}
                <ArrowRight size={13} className="text-vertex-cyan" />
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-auto pt-4 border-t border-vertex-border/60 leading-relaxed">
            All figures derive from prototype geometry in <span className="mono">src/data/buildingData.js</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

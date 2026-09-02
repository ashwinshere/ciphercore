import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { summarizeConflicts } from '../utils/conflictDetection.js';

const SEVERITY_STYLE = {
  critical: {
    label: 'Critical Conflict',
    icon: AlertCircle,
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  warning: {
    label: 'Spatial Warning',
    icon: AlertTriangle,
    text: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
};

export default function ConflictPanel() {
  const { conflicts, allRooms, selectRoom } = useApp();
  const [filter, setFilter] = useState('all');

  const summary = summarizeConflicts(conflicts, allRooms.length);
  const visible = conflicts.filter((c) => filter === 'all' || c.severity === filter);

  return (
    <div className="fade-in space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              Quality Assurance Pass
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">
              Automated Geometry &amp; Overlap Engine
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            Spatial Audit &amp; QA
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-cipher-muted flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-cipher-border shadow-subtle">
            {[
              { id: 'all', label: `All (${conflicts.length})` },
              { id: 'critical', label: `Conflicts (${summary.conflicts})` },
              { id: 'warning', label: `Warnings (${summary.warnings})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  filter === f.id
                    ? 'bg-cipher-govblue text-white shadow-subtle'
                    : 'text-cipher-muted hover:text-cipher-navy hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard
          label="Total Properties"
          value={summary.total}
          color="text-cipher-navy"
          sub="Indexed cadastral units"
        />
        <StatCard
          label="Valid &amp; Verified"
          value={summary.valid}
          color="text-emerald-700"
          bg="bg-emerald-50"
          sub="Passed all geometry tests"
        />
        <StatCard
          label="Boundary Warnings"
          value={summary.warnings}
          color="text-amber-800"
          bg="bg-amber-50"
          sub="Partial / minor overlap"
        />
        <StatCard
          label="Critical Conflicts"
          value={summary.conflicts}
          color="text-rose-700"
          bg="bg-rose-50"
          sub="Immediate survey check"
        />
      </div>

      {/* Conflict Cards List */}
      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="gov-card p-10 text-center text-cipher-muted text-sm flex flex-col items-center justify-center gap-2">
            <CheckCircle2 size={26} className="text-cipher-success" />
            <span className="font-semibold text-cipher-navy">Zero Spatial Issues Found</span>
            <span className="text-xs">All indexed cadastral properties satisfy spatial boundary checks.</span>
          </div>
        ) : (
          visible.map((c) => {
            const style = SEVERITY_STYLE[c.severity];
            const Icon = style.icon;
            const room = allRooms.find((r) => r.id === c.propertyId);
            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border ${style.border} ${style.bg} flex items-start justify-between gap-4 transition-all`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2 rounded-lg bg-white border ${style.border} ${style.text} shrink-0 mt-0.5`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-cipher-navy">{c.type}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
                        {style.label.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-cipher-text mt-1 leading-relaxed max-w-3xl">
                      {c.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className="mono text-[11px] text-cipher-muted bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                        Target ID: {c.propertyId}
                      </span>
                    </div>
                  </div>
                </div>

                {room && (
                  <button
                    onClick={() => selectRoom(room.id, { navigate: true })}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-cipher-border hover:border-cipher-govblue text-cipher-navy hover:text-cipher-govblue text-xs font-semibold shadow-subtle transition-all"
                  >
                    Inspect in 3D <ArrowRight size={13} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg, sub }) {
  return (
    <div className={`gov-card p-4 ${bg || ''}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-cipher-muted mb-1">
        {label}
      </div>
      <div className={`text-2xl font-extrabold tracking-tight ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-cipher-muted mt-1 truncate">{sub}</div>}
    </div>
  );
}

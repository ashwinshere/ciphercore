import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { summarizeConflicts } from '../utils/conflictDetection.js';

const SEVERITY_STYLE = {
  critical: {
    label: 'Conflict',
    icon: AlertCircle,
    text: 'text-vertex-danger',
    bg: 'bg-vertex-danger/10',
    border: 'border-vertex-danger/30',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    text: 'text-vertex-warn',
    bg: 'bg-vertex-warn/10',
    border: 'border-vertex-warn/30',
  },
};

export default function ConflictPanel() {
  const { conflicts, allRooms, selectRoom } = useApp();
  const [filter, setFilter] = useState('all');

  const summary = summarizeConflicts(conflicts, allRooms.length);
  const visible = conflicts.filter((c) => filter === 'all' || c.severity === filter);

  return (
    <div className="fade-in space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert size={19} className="text-vertex-cyan" />
          Spatial Intelligence
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Automated bounding-box geometry checks over all {summary.total} prototype properties.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Properties" value={summary.total} color="text-vertex-cyan" />
        <StatCard label="Valid Properties" value={summary.valid} color="text-vertex-ok" dot="🟢" />
        <StatCard label="Warnings" value={summary.warnings} color="text-vertex-warn" dot="🟡" />
        <StatCard label="Conflicts" value={summary.conflicts} color="text-vertex-danger" dot="🔴" />
      </div>

      <div className="flex items-center gap-2">
        {['all', 'critical', 'warning'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
              filter === f
                ? 'bg-vertex-cyan/20 border-vertex-cyan text-vertex-cyan'
                : 'glass border-vertex-border text-slate-400 hover:text-slate-200'
            }`}
          >
            {f === 'critical' ? 'Conflicts' : f === 'warning' ? 'Warnings' : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.length === 0 && (
          <div className="glass rounded-xl p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <CheckCircle2 size={22} className="text-vertex-ok" />
            No issues found for this filter.
          </div>
        )}
        {visible.map((c) => {
          const style = SEVERITY_STYLE[c.severity];
          const Icon = style.icon;
          const room = allRooms.find((r) => r.id === c.propertyId);
          return (
            <div
              key={c.id}
              className={`glass rounded-xl p-4 border ${style.border} flex items-start gap-3`}
            >
              <div className={`p-2 rounded-lg ${style.bg}`}>
                <Icon size={16} className={style.text} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{c.type}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                    {style.label.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="mono text-[10px] text-slate-500">{c.propertyId}</span>
                  {room && (
                    <button
                      onClick={() => selectRoom(room.id, { navigate: true })}
                      className="text-[10px] text-vertex-cyan hover:underline"
                    >
                      View in 3D →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, dot }) {
  return (
    <div className="glass rounded-xl p-4 border border-vertex-border">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
        {dot && <span className="mr-1">{dot}</span>}
        {label}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

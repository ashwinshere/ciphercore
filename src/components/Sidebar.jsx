import React from 'react';
import {
  LayoutDashboard,
  Box,
  LayoutGrid,
  ArrowUpDown,
  AlertTriangle,
  Database,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'explorer', label: '3D Explorer', icon: Box },
  { id: 'floor-mapping', label: 'Floor Mapping', icon: LayoutGrid },
  { id: 'vertical-analysis', label: 'Vertical Analysis', icon: ArrowUpDown },
  { id: 'conflict-detection', label: 'Conflict Detection', icon: AlertTriangle },
  { id: 'registry', label: 'Property Registry', icon: Database },
  { id: 'timeline', label: 'Timeline', icon: History },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, conflicts } = useApp();
  const conflictCount = conflicts.length;

  return (
    <nav className="w-56 shrink-0 glass border-r border-vertex-border flex flex-col py-4 px-3 gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              active
                ? 'bg-gradient-to-r from-vertex-cyan/20 to-transparent text-vertex-cyan border border-vertex-cyan/30 shadow-glow'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon size={16} />
              {item.label}
            </span>
            {item.id === 'conflict-detection' && conflictCount > 0 && (
              <span className="text-[10px] font-bold bg-vertex-danger/20 text-vertex-danger px-1.5 py-0.5 rounded-full">
                {conflictCount}
              </span>
            )}
          </button>
        );
      })}

      <div className="mt-auto pt-4 border-t border-vertex-border/60">
        <div className="px-3 py-2 rounded-lg bg-vertex-warn/10 border border-vertex-warn/25 text-[10px] text-vertex-warn leading-relaxed">
          <strong className="block mb-0.5">Prototype Spatial Data</strong>
          Geometry is illustrative, not an official survey.
        </div>
      </div>
    </nav>
  );
}

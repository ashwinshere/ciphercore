import React from 'react';
import {
  LayoutDashboard,
  Box,
  Layers,
  ArrowUpDown,
  ShieldAlert,
  Database,
  History,
  Building2,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Land & Property Overview', icon: LayoutDashboard },
  { id: 'explorer', label: '3D Property Map', icon: Box },
  { id: 'floor-mapping', label: 'Building & Floor Plans', icon: Layers },
  { id: 'vertical-analysis', label: 'Vertical Stack Structure', icon: ArrowUpDown },
  { id: 'conflict-detection', label: 'Spatial Audit & QA', icon: ShieldAlert },
  { id: 'registry', label: 'ULPIN Registry', icon: Database },
  { id: 'timeline', label: 'Cadastral Timeline', icon: History },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, conflicts } = useApp();
  const conflictCount = conflicts.length;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-cipher-border flex flex-col py-4 px-3 gap-1 shadow-subtle select-none">
      <div className="px-3 pb-3 mb-1 border-b border-cipher-border/60">
        <div className="text-[11px] font-semibold text-cipher-muted uppercase tracking-wider">
          Cadastral Navigation
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`relative flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-blue-50/80 text-cipher-navy font-semibold'
                  : 'text-cipher-muted hover:text-cipher-text hover:bg-slate-50'
              }`}
            >
              {/* Active Indicator Bar */}
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cipher-govblue rounded-r" />
              )}

              <span className="flex items-center gap-2.5 truncate">
                <Icon
                  size={16}
                  className={active ? 'text-cipher-govblue' : 'text-slate-400'}
                />
                <span className="truncate">{item.label}</span>
              </span>

              {item.id === 'conflict-detection' && conflictCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-50 text-cipher-warning border border-amber-200 px-1.5 py-0.5 rounded-full">
                  {conflictCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cadastral Pilot Info Footer */}
      <div className="pt-3 border-t border-cipher-border/80 mt-auto">
        <div className="p-3 rounded-lg bg-cipher-bg border border-cipher-border text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-cipher-navy text-[11px] mb-1">
            <Building2 size={13} className="text-cipher-govblue" />
            <span>Pilot Cadastral Entity</span>
          </div>
          <p className="text-[11px] text-cipher-muted">
            RV Block, SCE Complex
          </p>
          <div className="mt-2 pt-2 border-t border-cipher-border/60 flex items-center justify-between text-[10px] text-cipher-muted">
            <span>Spatial Model</span>
            <span className="font-semibold text-cipher-govblue">3D ULPIN v2.4</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

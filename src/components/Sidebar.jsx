import React from 'react';
import {
  LayoutDashboard,
  Globe,
  Box,
  Layers,
  ArrowUpDown,
  ShieldAlert,
  Database,
  History,
  Building2,
  Satellite,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Land & Property Overview', icon: LayoutDashboard },
  { id: 'gis-explorer', label: 'GIS Explorer', icon: Globe, highlight: true },
  { id: 'satellite-view', label: 'Satellite View', icon: Satellite },
  { id: 'explorer', label: '3D Building Explorer', icon: Box },
  { id: 'floor-mapping', label: 'Building & Floor Plans', icon: Layers },
  { id: 'vertical-analysis', label: 'Vertical Stack Structure', icon: ArrowUpDown },
  { id: 'conflict-detection', label: 'Spatial Audit & QA', icon: ShieldAlert },
  { id: 'registry', label: 'ULPIN Registry', icon: Database },
  { id: 'timeline', label: 'Cadastral Timeline', icon: History },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage, viewMode, setViewMode, conflicts, selectedProperty } = useApp();
  const conflictCount = conflicts.length;

  const handleNavClick = (id) => {
    if (id === 'dashboard') {
      setCurrentPage('dashboard');
      setViewMode('map');
    } else if (id === 'explorer') {
      setCurrentPage('explorer');
      setViewMode('3d');
    } else {
      setCurrentPage(id);
    }
  };

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
          let active = currentPage === item.id;

          if (currentPage === 'dashboard') {
            if (viewMode === 'map' && item.id === 'dashboard') active = true;
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
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
                  className={active ? 'text-cipher-govblue' : item.highlight ? 'text-blue-600' : 'text-slate-400'}
                />
                <span className="truncate">{item.label}</span>
              </span>

              {item.highlight && !active && (
                <span className="text-[9px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 px-1.5 py-0.2 rounded">
                  NEW
                </span>
              )}

              {item.id === 'conflict-detection' && (
                conflictCount > 0 ? (
                  <span className="text-[10px] font-bold bg-amber-50 text-cipher-warning border border-amber-200 px-1.5 py-0.5 rounded-full">
                    {conflictCount}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                    ✓
                  </span>
                )
              )}
            </button>
          );
        })}
      </div>

      {/* Cadastral Active Property Info Footer */}
      <div className="pt-3 border-t border-cipher-border/80 mt-auto">
        <div className="p-3 rounded-lg bg-slate-50 border border-cipher-border text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-cipher-navy text-[11px] mb-1">
            <Building2 size={13} className="text-cipher-govblue" />
            <span>Active Property</span>
          </div>
          <p className="text-[11px] text-cipher-navy font-bold truncate">
            {selectedProperty?.name || 'RV Block (Pilot)'}
          </p>
          <div className="mt-2 pt-2 border-t border-cipher-border/60 flex items-center justify-between text-[10px] text-cipher-muted">
            <span>2D ULPIN:</span>
            <span className="font-semibold text-cipher-govblue mono">{selectedProperty?.ulpin2D || '29-01-001-000123'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

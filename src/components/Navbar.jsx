import React from 'react';
import { Box, Building2, ChevronDown, Wifi } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function Navbar() {
  const { buildingData } = useApp();

  return (
    <header className="h-16 shrink-0 glass border-b border-vertex-border flex items-center px-5 gap-5 z-30">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-vertex-cyan to-vertex-blue flex items-center justify-center shadow-glow">
          <Box size={18} className="text-vertex-bg" />
        </div>
        <div className="leading-tight">
          <div className="font-extrabold text-white tracking-wide text-lg text-glow">VERTEX</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider -mt-0.5">
            3D Property Intelligence Platform
          </div>
        </div>
      </div>

      <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-vertex-border text-xs text-slate-200 hover:border-vertex-cyan/40 transition-colors">
        <Building2 size={13} className="text-vertex-cyan" />
        {buildingData.building.name} · {buildingData.building.institution}
        <ChevronDown size={12} className="text-slate-500" />
      </button>

      <div className="flex-1 max-w-md">
        <SearchBar />
      </div>

      <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-vertex-ok/30 text-[11px] text-vertex-ok">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vertex-ok opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-vertex-ok" />
        </span>
        System Online
        <Wifi size={12} />
      </div>
    </header>
  );
}

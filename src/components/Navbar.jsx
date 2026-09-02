import React from 'react';
import { Box, Building2, ChevronDown, Wifi, LogOut, UserCheck } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { buildingData } = useApp();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 shrink-0 glass border-b border-vertex-border flex items-center px-5 gap-4 z-30">
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

      <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-vertex-border text-xs text-slate-200 hover:border-vertex-cyan/40 transition-colors">
        <Building2 size={13} className="text-vertex-cyan" />
        {buildingData.building.name} · {buildingData.building.institution}
        <ChevronDown size={12} className="text-slate-500" />
      </button>

      <div className="flex-1 max-w-md">
        <SearchBar />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-vertex-ok/30 text-[11px] text-vertex-ok">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vertex-ok opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-vertex-ok" />
          </span>
          System Online
          <Wifi size={12} />
        </div>

        {/* User Session Profile & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-vertex-border/80">
            <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-lg glass border border-vertex-border">
              <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${user.avatarColor || 'from-cyan-500 to-blue-600'} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden md:block leading-tight">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  {user.name || user.username}
                  {user.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-vertex-cyan/15 text-vertex-cyan border border-vertex-cyan/30">
                      {user.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout from VERTEX session"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-500/10 hover:border-red-500/50 text-xs font-medium transition-all group active:scale-95 cursor-pointer"
            >
              <LogOut size={13} className="transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


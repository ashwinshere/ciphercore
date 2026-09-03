import React from 'react';
import { Layers, ShieldCheck, MapPin, Building, Box, Building2, ChevronDown, Wifi, LogOut, UserCheck } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { buildingData, setShowWelcome } = useApp();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 shrink-0 bg-white border-b border-cipher-border flex items-center px-6 gap-6 z-30 shadow-subtle">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cipher-navy text-white flex items-center justify-center shadow-subtle">
          <Layers size={20} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-cipher-navy tracking-tight text-lg leading-none">
              CIPHERCORE
            </span>
            <span className="text-[10px] font-semibold bg-blue-50 text-cipher-govblue border border-blue-200 px-1.5 py-0.5 rounded">
              3D CADASTRE
            </span>
          </div>
          <p className="text-[11px] text-cipher-muted font-medium mt-0.5 leading-none">
            3D Land &amp; Property Information System
          </p>
        </div>
      </div>

      {/* Jurisdiction Pill */}
      <button
        onClick={() => setShowWelcome(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-cipher-bg border border-cipher-border hover:border-cipher-govblue text-xs text-cipher-text transition-colors cursor-pointer"
        title="View Pilot Cadastral Zone Details"
      >
        <MapPin size={13} className="text-cipher-govblue" />
        <span className="font-medium text-cipher-muted">Jurisdiction:</span>
        <span className="font-semibold text-cipher-navy">
          {buildingData.building.district}, {buildingData.building.state}
        </span>
      </button>

      {/* Prominent Search */}
      <div className="flex-1 max-w-lg mx-auto">
        <SearchBar />
      </div>

      {/* Status & Officer Profile */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] text-cipher-success font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cipher-success" />
          </span>
          <ShieldCheck size={13} />
          Registry Active
        </div>

        {user ? (
          <div className="flex items-center gap-2 pl-3 border-l border-cipher-border">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full ${user.avatarColor ? 'bg-gradient-to-br ' + user.avatarColor : 'bg-cipher-navy text-white'} border border-cipher-border flex items-center justify-center text-xs font-bold shadow-sm`}>
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-cipher-navy leading-tight flex items-center gap-1.5">
                  {user.name || user.username}
                  {user.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-blue-50 text-cipher-govblue border border-blue-200">
                      {user.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-cipher-muted leading-tight">
                  {user.role}
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              title="Logout"
              className="ml-2 flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-red-50 text-red-600 border border-transparent hover:border-red-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 pl-3 border-l border-cipher-border">
            <div className="w-8 h-8 rounded-full bg-cipher-navy/5 border border-cipher-border flex items-center justify-center text-cipher-navy text-xs font-bold">
              GA
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-cipher-navy leading-tight">Gov Admin</div>
              <div className="text-[10px] text-cipher-muted leading-tight">Survey &amp; Records</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


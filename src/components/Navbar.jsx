import React from 'react';
import { Layers, ShieldCheck, MapPin, Building2, UserCheck, LogOut, Wifi } from 'lucide-react';
import SearchBar from './SearchBar.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { buildingData, setShowWelcome } = useApp();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 shrink-0 bg-white border-b border-cipher-border flex items-center px-5 gap-4 z-30 shadow-subtle">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-cipher-navy text-white flex items-center justify-center shadow-subtle">
          <Layers size={19} className="text-white" />
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
        onClick={() => setShowWelcome && setShowWelcome(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cipher-bg border border-cipher-border hover:border-cipher-govblue text-xs text-cipher-text transition-colors cursor-pointer"
        title="View Pilot Cadastral Zone Details"
      >
        <MapPin size={13} className="text-cipher-govblue" />
        <span className="font-medium text-cipher-muted">Jurisdiction:</span>
        <span className="font-semibold text-cipher-navy">
          {buildingData?.building?.district || 'Tiruchirappalli'}, {buildingData?.building?.state || 'Tamil Nadu'}
        </span>
      </button>

      {/* Prominent Search */}
      <div className="flex-1 max-w-md mx-auto">
        <SearchBar />
      </div>

      {/* Status & Officer / User Session Profile */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] text-cipher-success font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cipher-success" />
          </span>
          <ShieldCheck size={13} />
          <span>System Online</span>
        </div>

        {/* User Session Profile & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-3 border-l border-cipher-border">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-cipher-border">
              <div className="w-7 h-7 rounded-md bg-cipher-navy text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden md:block leading-tight">
                <div className="text-xs font-bold text-cipher-navy flex items-center gap-1.5">
                  {user.name || user.username}
                  {user.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-50 text-cipher-govblue border border-blue-200">
                      {user.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-cipher-muted font-medium">
                  {user.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout from CIPHERCORE session"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/70 text-red-600 hover:bg-red-100 hover:border-red-300 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

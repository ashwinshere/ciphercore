import React from 'react';
import { Box, ShieldAlert, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function WelcomeModal() {
  const { showWelcome, setShowWelcome, buildingData } = useApp();
  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="glass grid-bg rounded-2xl max-w-lg w-full p-8 border border-vertex-cyan/30 shadow-glow fade-in">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-vertex-cyan to-vertex-blue flex items-center justify-center shadow-glow">
            <Box size={24} className="text-vertex-bg" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white text-glow tracking-wide">VERTEX</h1>
            <p className="text-xs text-slate-400">3D ULPIN Generation &amp; Vertical Property Mapping</p>
          </div>
        </div>

        <div className="mb-5">
          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-vertex-warn/15 text-vertex-warn border border-vertex-warn/30 mb-3">
            PROTOTYPE SPATIAL DATA
          </span>
          <p className="text-sm text-slate-300 leading-relaxed">
            Pilot Digital Twin: <strong className="text-white">{buildingData.building.name}</strong>,{' '}
            {buildingData.building.institution}, {buildingData.building.location}.
          </p>
        </div>

        <div className="flex gap-2.5 p-3.5 rounded-xl bg-vertex-warn/10 border border-vertex-warn/25 mb-6">
          <ShieldAlert size={16} className="text-vertex-warn shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            The current RV Block geometry is a prototype generated from publicly available building and
            room references. It is not an official architectural floor plan and can be replaced with
            verified survey, CAD, BIM or GIS data.
          </p>
        </div>

        <button
          onClick={() => setShowWelcome(false)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-vertex-cyan to-vertex-blue text-vertex-bg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Enter Platform <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

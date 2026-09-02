import React from 'react';
import { Layers, ShieldAlert, ArrowRight, X, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function WelcomeModal() {
  const { showWelcome, setShowWelcome, buildingData } = useApp();
  if (!showWelcome) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      onClick={() => setShowWelcome(false)}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 border border-cipher-border shadow-modal fade-in max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowWelcome(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-cipher-text hover:bg-slate-100 transition-colors"
          title="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 pb-3.5 border-b border-cipher-border pr-8">
          <div className="w-10 h-10 rounded-lg bg-cipher-navy text-white flex items-center justify-center shadow-subtle shrink-0">
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-cipher-navy tracking-tight">
                CIPHERCORE
              </h1>
              <span className="text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 px-1.5 py-0.5 rounded">
                DPI SPATIAL PLATFORM
              </span>
            </div>
            <p className="text-xs text-cipher-muted font-medium">
              3D Land &amp; Vertical Property Information System
            </p>
          </div>
        </div>

        <div className="my-4 space-y-2.5">
          <div className="p-3 rounded-lg bg-cipher-bg border border-cipher-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-cipher-navy mb-1">
              <Building2 size={13} className="text-cipher-govblue" />
              Pilot Cadastral Zone
            </div>
            <p className="text-xs text-cipher-text">
              <strong className="font-semibold text-cipher-navy">{buildingData.building.name}</strong>,{' '}
              {buildingData.building.institution}, {buildingData.building.location}.
            </p>
          </div>

          <div className="flex gap-2.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200/80">
            <ShieldAlert size={15} className="text-cipher-warning shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-950 leading-relaxed">
              <strong>Spatial Pilot Notice:</strong> The spatial models and vertical property identifiers in this system represent 3D cadastral structures generated for land administration demonstration.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setShowWelcome(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cipher-govblue hover:bg-cipher-navy text-white font-semibold text-xs transition-colors shadow-subtle cursor-pointer"
          >
            Enter Cadastral Platform <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

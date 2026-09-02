import React, { useMemo } from 'react';
import {
  Building2,
  Ruler,
  ArrowUpDown,
  AlertTriangle,
  Hash,
  ArrowRight,
  ShieldCheck,
  Layers,
  MapPin,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { countVerticalRelationships } from '../utils/verticalAnalysis.js';
import BuildingScene from '../three/BuildingScene.jsx';
import BuildingControls from '../three/BuildingControls.jsx';
import PropertyPanel from '../components/PropertyPanel.jsx';
import FloorSelector from '../components/FloorSelector.jsx';

export default function Dashboard() {
  const { buildingData, allRooms, conflicts, setCurrentPage, selectRoom } = useApp();

  const verticalRelationships = useMemo(() => countVerticalRelationships(allRooms), [allRooms]);

  const stats = [
    {
      label: 'Registered Parcels',
      value: allRooms.length,
      sub: `${buildingData.floors.length} Spatial Floor Levels`,
      icon: Ruler,
      color: 'text-cipher-navy',
      bg: 'bg-blue-50/70',
      badge: 'Active Registry',
    },
    {
      label: '3D Mapped Units',
      value: allRooms.length,
      sub: 'Vertical Cadastral Entities',
      icon: Building2,
      color: 'text-cipher-govblue',
      bg: 'bg-slate-100',
      badge: '3D Surveyed',
    },
    {
      label: 'ULPIN Records',
      value: allRooms.length,
      sub: '100% Identifiers Generated',
      icon: Hash,
      color: 'text-cipher-accent',
      bg: 'bg-sky-50',
      badge: 'Standard Compliant',
    },
    {
      label: 'Vertical Stacks',
      value: verticalRelationships,
      sub: 'Multi-level Overlap Pairs',
      icon: ArrowUpDown,
      color: 'text-cipher-navy',
      bg: 'bg-indigo-50/70',
      badge: 'Spatial Aligned',
    },
    {
      label: 'Spatial QA Status',
      value: conflicts.length > 0 ? `${conflicts.length} QA Notices` : '0 Conflicts',
      sub: conflicts.length > 0 ? 'Review Boundary Checks' : 'All Bounds Verified',
      icon: AlertTriangle,
      color: conflicts.length ? 'text-cipher-warning' : 'text-cipher-success',
      bg: conflicts.length ? 'bg-amber-50/80' : 'bg-emerald-50',
      badge: conflicts.length ? 'Action Required' : 'Verified Valid',
    },
  ];

  return (
    <div className="fade-in space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              Land Administration Portal
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium flex items-center gap-1">
              <MapPin size={12} className="text-cipher-govblue" />
              {buildingData.building.name}, {buildingData.building.institution}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-cipher-navy tracking-tight">
            Land &amp; Property Overview
          </h1>
          <p className="text-xs text-cipher-muted mt-0.5">
            Unified spatial view of land parcels, buildings and vertical property units.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentPage('explorer')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-semibold shadow-subtle transition-colors"
          >
            <Layers size={14} /> Full 3D Map View
          </button>
          <button
            onClick={() => setCurrentPage('registry')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-cipher-border hover:bg-slate-50 text-cipher-navy text-xs font-semibold shadow-subtle transition-colors"
          >
            Browse Registry
          </button>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="gov-card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-cipher-muted uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`p-1.5 rounded-md ${card.bg} ${card.color}`}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-cipher-navy tracking-tight">
                  {card.value}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-cipher-borderLight flex items-center justify-between">
                <span className="text-[11px] text-cipher-muted truncate">{card.sub}</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-cipher-text border border-slate-200">
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Central Spatial Visualizer (65%) + Property Information Panel (35%) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-cipher-navy uppercase tracking-wide">
              3D Spatial Property Overview
            </h2>
            <span className="text-xs text-cipher-muted">
              · Interactive Cadastral Digital Twin
            </span>
          </div>
          <BuildingControls />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 min-h-[560px]">
          {/* 3D Spatial Canvas */}
          <div className="flex flex-col gap-3 h-full min-h-[460px]">
            <div className="flex-1 min-h-[440px]">
              <BuildingScene height="100%" />
            </div>
            <FloorSelector />
          </div>

          {/* Right Information Panel */}
          <div className="h-full min-h-[500px]">
            <PropertyPanel />
          </div>
        </div>
      </div>

      {/* Workflow & Quick Links Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        <div className="lg:col-span-2 gov-card p-5">
          <h3 className="text-xs font-bold text-cipher-navy uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-cipher-govblue" />
            Cadastral Property Administration Workflow
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-cipher-bg border border-cipher-border">
              <div className="font-bold text-cipher-navy flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-cipher-govblue text-[11px] flex items-center justify-center font-bold">1</span>
                2D Spatial Ingestion
              </div>
              <p className="text-cipher-muted text-[11px] leading-relaxed">
                Parse boundary coordinates, room polygons, and parcel attributes directly into cadastral records.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cipher-bg border border-cipher-border">
              <div className="font-bold text-cipher-navy flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-cipher-govblue text-[11px] flex items-center justify-center font-bold">2</span>
                3D Extrusion &amp; Stacking
              </div>
              <p className="text-cipher-muted text-[11px] leading-relaxed">
                Procedurally extrude vertical floor levels and compute bounding boxes for 3D multi-owner representations.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cipher-bg border border-cipher-border">
              <div className="font-bold text-cipher-navy flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-cipher-govblue text-[11px] flex items-center justify-center font-bold">3</span>
                Vertical Stack Detection
              </div>
              <p className="text-cipher-muted text-[11px] leading-relaxed">
                Detect vertical overlap relationships between floors to enforce vertical property hierarchy.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-cipher-bg border border-cipher-border">
              <div className="font-bold text-cipher-navy flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-cipher-govblue text-[11px] flex items-center justify-center font-bold">4</span>
                ULPIN &amp; QA Validation
              </div>
              <p className="text-cipher-muted text-[11px] leading-relaxed">
                Generate official 3D vertical property identifiers and run automated geometric anomaly checks.
              </p>
            </div>
          </div>
        </div>

        <div className="gov-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-cipher-navy uppercase tracking-wider mb-3">
              Cadastral Modules
            </h3>
            <div className="space-y-2">
              {[
                { label: '3D Spatial Explorer', page: 'explorer', desc: 'Inspect vertical digital twin' },
                { label: 'Building Floor Plans', page: 'floor-mapping', desc: '2D cadastral boundary view' },
                { label: 'Vertical Stack Structure', page: 'vertical-analysis', desc: 'Column relationship inspector' },
                { label: 'Spatial QA & Audit', page: 'conflict-detection', desc: 'Automated geometric validation' },
                { label: 'Property Registry', page: 'registry', desc: 'Searchable government ledger' },
              ].map((m) => (
                <button
                  key={m.page}
                  onClick={() => setCurrentPage(m.page)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-cipher-bg border border-cipher-border hover:border-cipher-govblue hover:bg-blue-50/40 text-left transition-all group"
                >
                  <div>
                    <div className="text-xs font-bold text-cipher-navy group-hover:text-cipher-govblue">
                      {m.label}
                    </div>
                    <div className="text-[10px] text-cipher-muted">{m.desc}</div>
                  </div>
                  <ArrowRight size={13} className="text-cipher-muted group-hover:text-cipher-govblue group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-cipher-border text-[10px] text-cipher-muted text-center mt-3">
            Pilot Entity: <strong className="text-cipher-navy">{buildingData.building.name}</strong> · {buildingData.building.institutionCode}
          </div>
        </div>
      </div>
    </div>
  );
}

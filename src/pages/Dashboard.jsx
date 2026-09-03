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
  Globe,
  Compass,
  Box,
  Database,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { countVerticalRelationships } from '../utils/verticalAnalysis.js';
import BuildingScene from '../three/BuildingScene.jsx';
import BuildingControls from '../three/BuildingControls.jsx';
import PropertyPanel from '../components/PropertyPanel.jsx';
import FloorSelector from '../components/FloorSelector.jsx';
import ULPINMap from '../components/ULPINMap.jsx';
import { gisData } from '../data/gisData.js';

export default function Dashboard() {
  const { buildingData, allRooms, conflicts, setCurrentPage, selectRoom, viewMode, setViewMode } = useApp();

  const verticalRelationships = useMemo(() => countVerticalRelationships(allRooms), [allRooms]);

  const stats = [
    {
      label: 'Campus GIS Anchor',
      value: `${gisData.campus.latitude.toFixed(3)}°N`,
      sub: 'WGS84 EPSG:4326',
      icon: Globe,
      color: 'text-cipher-govblue',
      bg: 'bg-blue-50/70',
      badge: 'OpenStreetMap',
    },
    {
      label: 'Pilot Buildings',
      value: '7 Blocks',
      sub: 'RV Block Primary Anchor',
      icon: Building2,
      color: 'text-cipher-navy',
      bg: 'bg-slate-100',
      badge: '3D Extruded',
    },
    {
      label: '3D Mapped Units',
      value: allRooms.length,
      sub: 'Vertical Cadastral Entities',
      icon: Hash,
      color: 'text-cipher-accent',
      bg: 'bg-sky-50',
      badge: '3D ULPIN Indexed',
    },
    {
      label: 'Vertical Stacks',
      value: verticalRelationships,
      sub: 'Multi-level Overlap Pairs',
      icon: ArrowUpDown,
      color: 'text-cipher-navy',
      bg: 'bg-indigo-50/70',
      badge: 'Column Linked',
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              Land Administration &amp; GIS Cadastre
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium flex items-center gap-1">
              <MapPin size={12} className="text-cipher-govblue" />
              {buildingData.building.name}, {buildingData.building.institution}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
              WGS84 ({gisData.campus.latitude.toFixed(4)}°N, {gisData.campus.longitude.toFixed(4)}°E)
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-cipher-navy tracking-tight">
            VERTEX 3D ULPIN &amp; GIS Cadastre Overview
          </h1>
          <p className="text-xs text-cipher-muted mt-0.5">
            Connecting real-world GIS spatial anchors with 3D multi-level vertical property models.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setCurrentPage('gis-explorer')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-bold shadow-subtle transition-colors"
          >
            <Globe size={14} /> Open GIS Explorer
          </button>
          <button
            onClick={() => setCurrentPage('explorer')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-cipher-border hover:bg-slate-50 text-cipher-navy text-xs font-semibold shadow-subtle transition-colors"
          >
            <Layers size={14} /> 3D Digital Twin
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

      {/* Professional GIS + 3D Architecture Workflow Diagram */}
      <div className="gov-card p-5 bg-gradient-to-r from-slate-900 via-cipher-navy to-slate-900 text-white shadow-card rounded-2xl overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/15">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-[11px] font-mono uppercase tracking-wider font-bold mb-1">
              <Compass size={14} className="animate-spin-slow" />
              <span>VERTEX GIS ➔ 3D SPATIAL ARCHITECTURE</span>
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-white">
              From Global Coordinates to Vertical Sub-Parcels
            </h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-center text-xs font-semibold text-cyan-200 max-w-md">
            “GIS tells us where the building exists on Earth.<br />
            <span className="text-white font-bold">VERTEX tells us where every property exists inside the building.”</span>
          </div>
        </div>

        {/* Interactive Architecture Flow Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4">
          {[
            { step: '01', title: 'OpenStreetMap', sub: 'WGS84 Tiles (EPSG:4326)', icon: Globe, highlight: '#38BDF8' },
            { step: '02', title: 'GIS Location', sub: 'Saranathan Campus', icon: MapPin, highlight: '#60A5FA' },
            { step: '03', title: 'Building Anchor', sub: 'RV Block Geographic Lat/Lng', icon: Building2, highlight: '#F59E0B' },
            { step: '04', title: '3D Digital Twin', sub: 'Procedural Floor Slabs', icon: Box, highlight: '#818CF8' },
            { step: '05', title: 'Vertical Cadastre', sub: '3D ULPIN Indexing', icon: Layers, highlight: '#34D399' },
            { step: '06', title: 'Spatial Intel', sub: 'QA Audit & Stack Graph', icon: Cpu, highlight: '#F472B6' },
          ].map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.step}
                className="bg-white/5 hover:bg-white/10 transition-all border border-white/10 rounded-xl p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-white/50">{node.step}</span>
                    <Icon size={14} style={{ color: node.highlight }} />
                  </div>
                  <div className="text-xs font-bold text-white">{node.title}</div>
                </div>
                <div className="text-[10px] text-slate-300 mt-2 pt-2 border-t border-white/10 truncate">
                  {node.sub}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Central Spatial Visualizer (1fr) + Property Information Panel (360px) */}
      <div className="space-y-3">
        {viewMode === '3d' && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-cipher-navy uppercase tracking-wide">
                3D Digital Twin Representation
              </h2>
              <span className="text-xs text-cipher-muted">
                · Extruded Satellite Footprint
              </span>
            </div>
            <BuildingControls />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 min-h-[560px]">
          {/* Main Visualizer Area: 2D Satellite Map or 3D Digital Twin */}
          <div className="flex flex-col gap-3 h-full min-h-[460px]">
            {viewMode === 'map' ? (
              <div className="flex-1 min-h-[520px]">
                <ULPINMap />
              </div>
            ) : (
              <>
                <div className="flex-1 min-h-[440px]">
                  <BuildingScene height="100%" />
                </div>
                <FloorSelector />
              </>
            )}
          </div>

          {/* Right Information Panel (Always Synced to selectedProperty) */}
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
                GIS Spatial Anchoring
              </div>
              <p className="text-cipher-muted text-[11px] leading-relaxed">
                Georeference campus footprints to WGS84 coordinates on OpenStreetMap without paid API keys.
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
                { label: 'GIS Explorer (OpenStreetMap)', page: 'gis-explorer', desc: 'Real-world campus georeferencing' },
                { label: '3D Spatial Explorer', page: 'explorer', desc: 'Inspect vertical digital twin' },
                { label: 'Building Floor Plans', page: 'floor-mapping', desc: '2D cadastral blueprint plan' },
                { label: 'Vertical Stack Structure', page: 'vertical-analysis', desc: 'Column relationship inspector' },
                { label: 'Spatial QA & Audit', page: 'conflict-detection', desc: 'Automated geometric validation' },
                { label: 'Property Registry', page: 'registry', desc: 'Searchable government ledger' },
              ].map((m) => (
                <button
                  key={m.page}
                  onClick={() => setCurrentPage(m.page)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-cipher-bg border border-cipher-border hover:border-cipher-govblue hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
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
            Pilot Entity: <strong className="text-cipher-navy">{buildingData.building.name}</strong> · {gisData.campus.shortName}
          </div>
        </div>
      </div>
    </div>
  );
}

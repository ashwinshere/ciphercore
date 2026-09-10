import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe,
  Building2,
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  ChevronRight,
  Info,
  Navigation
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { gisData } from '../data/gisData.js';
import GISInfoPanel from '../components/GISInfoPanel.jsx';
import properties from '../data/properties.js';

// Custom Crisp Leaflet Markers using L.divIcon
const createCustomMarker = (color = '#2563EB', isPilot = false, label = '') => {
  return L.divIcon({
    className: 'custom-gis-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        background: ${isPilot ? '#1E3A8A' : '#FFFFFF'};
        color: ${isPilot ? '#FFFFFF' : color};
        border: 2px solid ${isPilot ? '#38BDF8' : color};
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        cursor: pointer;
        transform: translate(-50%, -50%);
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
          <path d="M10 6h4"/>
          <path d="M10 10h4"/>
          <path d="M10 14h4"/>
          <path d="M10 18h4"/>
        </svg>
        ${isPilot ? `
          <span style="
            position: absolute;
            top: -9px;
            right: -10px;
            background: #F59E0B;
            color: #000000;
            font-size: 8px;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 4px;
            border: 1px solid #FFFFFF;
            letter-spacing: 0.5px;
          ">PILOT</span>
        ` : ''}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

// Map Recenter Helper Component
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function GISExplorer() {
  const {
    selectedProperty,
    setSelectedProperty,
    enter3DView,
    setCurrentPage,
    setViewMode
  } = useApp();

  const [activeBuildingId, setActiveBuildingId] = useState('rv-block');
  const [mapCenter, setMapCenter] = useState([gisData.campus.latitude, gisData.campus.longitude]);
  const [mapZoom, setMapZoom] = useState(17);

  const campus = gisData.campus;
  const pilot = gisData.pilotBuilding;

  const handleSelectBuilding = (property) => {
    setActiveBuildingId(property.id);
    if (property.coordinates) {
      setMapCenter([property.coordinates.latitude, property.coordinates.longitude]);
      setMapZoom(18);
    }
  };

  const handleOpen3D = (property) => {
    if (property) {
      setSelectedProperty(property);
      enter3DView(property);
    } else {
      const rv = properties.find((p) => p.id === 'rv-block') || properties[0];
      setSelectedProperty(rv);
      enter3DView(rv);
    }
    setCurrentPage('explorer');
  };

  return (
    <div className="fade-in space-y-4 pb-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider flex items-center gap-1">
              <Globe size={11} /> OpenStreetMap Cadastre
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium mono">
              WGS84 ({campus.latitude.toFixed(4)}°N, {campus.longitude.toFixed(4)}°E)
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            GIS Explorer — Real-World Campus Spatial Anchoring
          </h1>
        </div>

        <button
          onClick={() => handleOpen3D(properties.find((p) => p.id === activeBuildingId))}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cipher-govblue text-white text-xs font-bold hover:bg-cipher-navy transition-all shadow-subtle self-start sm:self-auto group"
        >
          <Building2 size={15} />
          <span>Open 3D Digital Twin</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Visual Transition / Breadcrumb Flow Bar */}
      <div className="gov-card px-4 py-3 bg-white border border-cipher-border flex items-center justify-between flex-wrap gap-2 shadow-subtle">
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-cipher-navy overflow-x-auto">
          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-cipher-govblue border border-blue-200 flex items-center gap-1.5 shrink-0">
            <Globe size={13} />
            <span>1. GIS MAP</span>
          </span>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-cipher-navy border border-slate-200 shrink-0">
            2. SARANATHAN COLLEGE
          </span>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0 font-extrabold">
            3. RV BLOCK (PILOT)
          </span>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
          <span className="px-2.5 py-1 rounded-md bg-slate-50 text-cipher-muted border border-slate-200 shrink-0">
            4. 3D PROPERTY MODEL
          </span>
        </div>

        <div className="text-[11px] text-cipher-muted hidden xl:block font-medium">
          Geographic WGS84 Anchor ➔ Local Cartesian 3D ULPIN Extrusion
        </div>
      </div>

      {/* Main Grid: Leaflet Map (65%) + GIS Info & Buildings Directory (35%) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 min-h-[580px]">
        {/* Leaflet OpenStreetMap Container */}
        <div className="gov-card p-3 flex flex-col h-full min-h-[520px] bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-cipher-border">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-cipher-navy">
                OpenStreetMap GIS Cadastral Layer
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-cipher-muted">
              <button
                onClick={() => {
                  setMapCenter([campus.latitude, campus.longitude]);
                  setMapZoom(17);
                }}
                className="px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-cipher-navy font-semibold text-[11px] flex items-center gap-1"
              >
                <Compass size={12} /> Reset Campus View
              </button>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-300 relative z-10 shadow-inner">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', minHeight: '440px' }}
            >
              <ChangeMapView center={mapCenter} zoom={mapZoom} />

              {/* Free OpenStreetMap Tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {/* Campus Real-World Footprint Polygons and Markers */}
              {properties.map((prop) => {
                const isPilot = prop.id === 'rv-block';
                const isSelected = prop.id === activeBuildingId;

                return (
                  <React.Fragment key={prop.id}>
                    {/* Building Geographic Footprint Polygon */}
                    {prop.footprint && (
                      <Polygon
                        positions={prop.footprint}
                        pathOptions={{
                          color: isSelected ? '#1E40AF' : isPilot ? '#2563EB' : prop.stroke || '#475569',
                          fillColor: isSelected ? '#3B82F6' : prop.color || '#64748B',
                          fillOpacity: isSelected ? 0.65 : 0.4,
                          weight: isSelected ? 3 : isPilot ? 2.5 : 1.5,
                          dashArray: isPilot ? null : '3 3'
                        }}
                        eventHandlers={{
                          click: () => handleSelectBuilding(prop)
                        }}
                      >
                        <Tooltip sticky direction="top" className="custom-leaflet-tooltip">
                          <div className="font-bold text-xs">{prop.name}</div>
                          <div className="text-[10px] text-slate-500">{prop.propertyType}</div>
                          <div className="text-[9px] mono font-semibold text-blue-600">{prop.ulpin2D}</div>
                        </Tooltip>
                      </Polygon>
                    )}

                    {/* Building Marker & Interactive Popup */}
                    {prop.coordinates && (
                      <Marker
                        position={[prop.coordinates.latitude, prop.coordinates.longitude]}
                        icon={createCustomMarker(prop.color || '#2563EB', isPilot, prop.name)}
                        eventHandlers={{
                          click: () => handleSelectBuilding(prop)
                        }}
                      >
                        <Popup className="custom-gis-popup">
                          <div className="p-1 space-y-2 text-left min-w-[220px]">
                            {/* Header */}
                            <div>
                              <div className="text-[9px] uppercase font-bold text-blue-700 tracking-wider">
                                {campus.name}
                              </div>
                              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                                {prop.name}
                              </h3>
                              <p className="text-[10px] text-slate-500">{prop.propertyType}</p>
                            </div>

                            {/* Pilot Project Info */}
                            <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-semibold text-slate-600">Pilot Project:</span>
                                <span className="font-bold text-blue-600">VERTEX – 3D Mapping</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-semibold text-slate-600">Building:</span>
                                <span className="font-bold text-slate-900">{prop.name}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-semibold text-slate-600">2D ULPIN:</span>
                                <span className="font-mono text-[9px] font-bold text-slate-900">{prop.ulpin2D}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200">
                                <span className="font-semibold text-slate-600">Status:</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                                  {gisData.pilotBuilding.status}
                                </span>
                              </div>
                            </div>

                            {/* Open 3D Digital Twin Button */}
                            <button
                              onClick={() => handleOpen3D(prop)}
                              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Building2 size={14} />
                              <span>Open 3D Digital Twin</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>

          {/* Map Footer Note */}
          <div className="pt-2.5 mt-2 border-t border-cipher-border flex items-center justify-between text-[11px] text-cipher-muted">
            <span className="flex items-center gap-1">
              <Info size={13} className="text-cipher-govblue" />
              Click any campus building marker or polygon to view cadastral attributes.
            </span>
            <span className="font-mono text-[10px] text-cipher-navy font-bold">
              DATUM: WGS 84
            </span>
          </div>
        </div>

        {/* Right Column: GIS Anchor Info + Building Directory */}
        <div className="flex flex-col gap-4">
          {/* GIS Reference Card */}
          <GISInfoPanel />

          {/* Campus Buildings Directory */}
          <div className="gov-card p-4 space-y-3 bg-white shadow-card flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-cipher-border">
              <h3 className="text-xs font-bold text-cipher-navy uppercase tracking-wider">
                Campus Cadastral Buildings ({properties.length})
              </h3>
              <span className="text-[10px] text-cipher-muted">Click to Locate</span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {properties.map((p) => {
                const isSelected = p.id === activeBuildingId;
                const isPilot = p.id === 'rv-block';

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectBuilding(p)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-cipher-govblue shadow-subtle ring-2 ring-cipher-govblue/20'
                        : 'bg-slate-50/70 border-cipher-border hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-cipher-navy">{p.name}</span>
                        {isPilot && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            PILOT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-cipher-govblue mono font-bold mt-0.5">
                        {p.ulpin2D}
                      </div>
                      <div className="text-[10px] text-cipher-muted">
                        {p.floors} Floors · {p.buildingHeightM}m Height
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen3D(p);
                      }}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-cipher-govblue hover:text-white text-cipher-navy transition-colors shadow-2xs"
                      title={`Open ${p.name} in 3D`}
                    >
                      <Building2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

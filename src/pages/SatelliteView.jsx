// ============================================================================
// pages/SatelliteView.jsx
//
// Real-world satellite map of Saranathan College of Engineering, Trichy.
// Uses ESRI World Imagery (free, no API key) + react-leaflet.
// Overlays existing property polygons; click shows ULPIN details panel.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  useMap,
} from 'react-leaflet';
import {
  Satellite,
  X,
  MapPin,
  Building2,
  Hash,
  User,
  FileText,
  Ruler,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import properties from '../data/properties.js';
import { useApp } from '../context/AppContext.jsx';

// Saranathan College of Engineering real-world center (WGS84)
const CAMPUS_CENTER = [10.757172, 78.651348];
const DEFAULT_ZOOM = 18;

// ─── Prevents map from auto-flying when a polygon is selected ────────────────
function NoAutoZoom() {
  const map = useMap();
  useEffect(() => {
    map.doubleClickZoom.disable();
  }, [map]);
  return null;
}

// ─── Property Detail Side Panel ──────────────────────────────────────────────
function SatDetailPanel({ property, onClose, onView3D }) {
  const [copied, setCopied] = useState(false);

  if (!property) return null;

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const areaM2 = property.footprintWidthM && property.footprintDepthM
    ? (property.footprintWidthM * property.footprintDepthM).toLocaleString()
    : '—';

  const rows = [
    { icon: Hash,      label: 'Block Number',   value: property.blockNumber },
    { icon: Building2, label: 'Property Type',  value: property.propertyType },
    { icon: User,      label: 'Owner',          value: property.ownerName },
    { icon: FileText,  label: 'Survey No.',     value: property.surveyNumber },
    { icon: Ruler,     label: 'Footprint Area', value: `${areaM2} m²` },
    { icon: MapPin,    label: 'Floors',         value: property.floors },
  ];

  return (
    <div
      className="absolute top-12 right-4 z-[1000] w-80 bg-white rounded-2xl shadow-2xl border border-cipher-border overflow-hidden flex flex-col"
      style={{ maxHeight: 'calc(100% - 5rem)' }}
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 border-b border-cipher-border flex items-start justify-between gap-2"
        style={{ background: 'linear-gradient(135deg,#EFF6FF 0%,#F0FDF4 100%)' }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cipher-govblue flex items-center gap-1 mb-0.5">
            <CheckCircle2 size={11} className="text-emerald-600" />
            ULPIN Property Record
          </div>
          <h3 className="text-sm font-extrabold text-cipher-navy leading-tight truncate">
            {property.name}
          </h3>
          <p className="text-[11px] text-cipher-muted mt-0.5 truncate">
            {property.institution || 'Saranathan College of Engineering'}
          </p>
        </div>
        {property.blockNumber && (
          <span className="shrink-0 text-xs font-extrabold text-white bg-cipher-govblue rounded-lg px-2 py-1">
            #{property.blockNumber}
          </span>
        )}
        <button
          onClick={onClose}
          className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-cipher-muted hover:text-cipher-navy transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* ULPIN Badge */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-cipher-border flex items-center justify-between gap-2">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-cipher-muted mb-0.5">2D ULPIN</div>
          <span className="font-mono text-[13px] font-bold text-cipher-govblue tracking-widest">
            {property.ulpin2D}
          </span>
        </div>
        <button
          onClick={() => handleCopy(property.ulpin2D)}
          className="p-1.5 rounded-lg border border-cipher-border hover:border-cipher-govblue text-cipher-muted hover:text-cipher-govblue transition-all"
          title="Copy ULPIN"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        </button>
      </div>

      {/* Detail Rows */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5">
            <div className="shrink-0 w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center mt-0.5">
              <Icon size={11} className="text-cipher-govblue" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-cipher-muted uppercase tracking-wide">{label}</div>
              <div className="text-xs font-bold text-cipher-navy truncate">{value}</div>
            </div>
          </div>
        ))}

        {/* Building Facilities Summary */}
        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
          <div className="text-[9px] font-extrabold uppercase tracking-wider text-cipher-govblue">
            Facilities &amp; Usage
          </div>
          <div className="text-xs font-bold text-cipher-navy">
            {property.buildingType === 'Hostel' || property.id === 'boys-hostel'
              ? 'Residential Hostel & Living Quarters'
              : property.id === 'canteen'
              ? 'Dining & Food Services'
              : property.id === 'parking'
              ? 'Vehicle Parking & Infrastructure'
              : property.id === 'basketball-ground'
              ? 'Outdoor Sports Court'
              : 'Academic & Research Facilities'}
          </div>
          <p className="text-[10px] text-cipher-muted leading-relaxed">
            {property.buildingType === 'Hostel' || property.id === 'boys-hostel'
              ? 'Dormitories, Deluxe Rooms, Warden Office, Lounge & Study Rooms'
              : property.id === 'canteen'
              ? 'Main Dining Hall, Kitchen Prep & Service Counters'
              : property.id === 'parking'
              ? 'Covered Parking Bays & EV Outlets'
              : property.id === 'basketball-ground'
              ? 'Regulation Playing Court & Scoring Pavilion'
              : 'Classrooms, Laboratories & Seminar Halls'}
          </p>
        </div>

        {/* Spatial Audit Status */}
        <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Spatial Audit</div>
            <div className="text-xs font-bold text-emerald-800">CLEARED — No conflicts</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2 border-t border-cipher-border flex gap-2">
        <button
          onClick={() => onView3D(property)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cipher-govblue text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow"
        >
          View in 3D <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Individual Polygon Overlay ───────────────────────────────────────────────
function PropertyPolygon({ property, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false);

  const baseColor   = property.color  || '#3B82F6';
  const strokeColor = property.stroke || '#1D4ED8';

  const pathOptions = {
    color:       isSelected ? '#D97706' : hovered ? strokeColor : strokeColor,
    weight:      isSelected ? 3 : hovered ? 2.5 : 1.5,
    fillColor:   isSelected ? '#F59E0B' : baseColor,
    fillOpacity: isSelected ? 0.55 : hovered ? 0.42 : 0.22,
    opacity:     1,
  };

  return (
    <Polygon
      positions={property.footprint}
      pathOptions={pathOptions}
      eventHandlers={{
        click: (e) => {
          e.originalEvent.stopPropagation();
          onSelect(property);
        },
        mouseover: () => setHovered(true),
        mouseout:  () => setHovered(false),
      }}
    >
      <Tooltip
        sticky={false}
        direction="top"
        offset={[0, -4]}
        opacity={1}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1e3a5f', lineHeight: 1.3 }}>
          {property.blockNumber && (
            <span style={{ color: '#1D4ED8', fontWeight: 900, marginRight: 4 }}>#{property.blockNumber}</span>
          )}
          {property.name}
        </div>
        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{property.ulpin2D}</div>
      </Tooltip>
    </Polygon>
  );
}

// ─── Main Satellite View Page ─────────────────────────────────────────────────
export default function SatelliteView() {
  const { selectProperty, setCurrentPage } = useApp();
  const [selectedProp, setSelectedProp] = useState(null);

  const handleSelect = (prop) => {
    setSelectedProp((prev) => (prev?.id === prop.id ? null : prop));
  };

  const handleClose = () => setSelectedProp(null);

  const handleView3D = (prop) => {
    selectProperty(prop);
    setCurrentPage('explorer');
  };

  return (
    <div className="relative w-full h-full min-h-0 rounded-2xl overflow-hidden border border-cipher-border shadow-subtle fade-in" style={{ minHeight: '600px' }}>
      {/* Page Header Ribbon */}
      <div className="absolute top-0 left-0 right-0 z-[1001] flex items-center gap-3 px-4 py-2.5 bg-white/92 backdrop-blur border-b border-cipher-border">
        <div className="flex items-center gap-2 text-cipher-govblue">
          <Satellite size={16} />
          <span className="text-xs font-extrabold uppercase tracking-widest text-cipher-navy">
            Satellite View
          </span>
        </div>
        <div className="h-4 w-px bg-cipher-border mx-1" />
        <span className="text-[11px] text-cipher-muted">
          Saranathan College of Engineering · Tiruchirappalli, Tamil Nadu
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase tracking-wider">
            Live Satellite
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-cipher-govblue uppercase tracking-wider">
            ESRI Imagery
          </span>
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={CAMPUS_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={false}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        <NoAutoZoom />

        {/* ESRI World Imagery — satellite tiles, free, no API key */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN'
          maxZoom={22}
        />

        {/* Reference Labels overlay */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxZoom={22}
          opacity={0.65}
        />

        {/* Building polygon overlays */}
        {properties.map((prop) => (
          <PropertyPolygon
            key={prop.id}
            property={prop}
            isSelected={selectedProp?.id === prop.id}
            onSelect={handleSelect}
          />
        ))}
      </MapContainer>

      {/* Detail Side Panel */}
      <SatDetailPanel
        property={selectedProp}
        onClose={handleClose}
        onView3D={handleView3D}
      />

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white/90 backdrop-blur rounded-xl border border-cipher-border shadow-subtle px-3 py-2.5 text-[10px] space-y-1.5">
        <div className="font-extrabold text-cipher-navy text-[9px] uppercase tracking-wider mb-1.5">Legend</div>
        {[
          { color: '#3B82F6', stroke: '#1D4ED8', label: 'Academic Block' },
          { color: '#10B981', stroke: '#047857', label: 'Hostel / Residential' },
          { color: '#8B5CF6', stroke: '#6D28D9', label: 'Mechanical / Dept Block' },
          { color: '#F59E0B', stroke: '#D97706', label: 'Selected Building' },
          { color: '#64748B', stroke: '#334155', label: 'Parking / Amenity' },
        ].map(({ color, stroke, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-5 h-3 rounded inline-block border-2 shrink-0" style={{ background: color + '4D', borderColor: stroke }} />
            <span className="text-cipher-text">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

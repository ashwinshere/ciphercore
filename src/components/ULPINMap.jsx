import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import properties, { MAP_CENTER } from '../data/properties.js';
import PropertyPlot from './PropertyPlot.jsx';
import { MapPin, Box, ArrowRight, ShieldCheck, CheckCircle2, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

function MapFlyController({ selectedProperty }) {
  const map = useMap();

  useEffect(() => {
    if (selectedProperty && selectedProperty.coordinates) {
      map.flyTo(
        [selectedProperty.coordinates.latitude, selectedProperty.coordinates.longitude],
        18,
        { duration: 1.0 }
      );
    }
  }, [selectedProperty, map]);

  return null;
}

export default function ULPINMap() {
  const { selectedProperty, selectProperty } = useApp();

  const activeProp = selectedProperty || properties[0];

  return (
    <div className="fade-in h-full flex flex-col gap-4 pb-4 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real Satellite Base Layer
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium flex items-center gap-1">
              <MapPin size={12} className="text-cipher-govblue" />
              Saranathan College of Engineering Campus Layout
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            2D Geospatial Cadastral Map
          </h1>
        </div>
        
        {/* Quick Jump Bar for Ground-Truth Campus Buildings */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs font-semibold text-cipher-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Navigation size={12} /> Campus Blocks:
          </span>
          {properties.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProperty(p)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all border whitespace-nowrap ${
                activeProp.id === p.id
                  ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-subtle'
                  : 'bg-white text-cipher-navy border-cipher-border hover:bg-blue-50 hover:border-blue-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 bg-[#1E293B] border border-cipher-border rounded-xl shadow-subtle overflow-hidden relative flex flex-col min-h-[540px]">
        
        {/* Top-Left Instruction Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur border border-cipher-border rounded-xl p-3 shadow-card z-[1000] max-w-[260px]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-cipher-navy flex items-center gap-1.5">
              <MapPin size={14} className="text-cipher-govblue"/> Campus Cadastre
            </h3>
            <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              WGS 84
            </span>
          </div>
          <p className="text-[11px] text-cipher-muted leading-relaxed">
            Hover over any building to identify it. Click to open its 3D ULPIN digital twin.
          </p>
        </div>

        {/* Leaflet Satellite Map */}
        <div className="flex-1 w-full h-full min-h-[500px] z-0">
          <MapContainer
            center={MAP_CENTER}
            zoom={18}
            maxZoom={20}
            className="w-full h-full"
            style={{ zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={20}
            />

            <MapFlyController selectedProperty={activeProp} />

            {/* Render Campus Building Polygons */}
            {properties.map((prop) => (
              <PropertyPlot
                key={prop.id}
                property={prop}
                isSelected={activeProp?.id === prop.id}
                onClick={selectProperty}
              />
            ))}
          </MapContainer>
        </div>

        {/* Footer Bar */}
        <div className="p-2.5 bg-white border-t border-cipher-border text-xs flex flex-col sm:flex-row justify-between items-center gap-2 text-cipher-muted z-[1000]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>{properties.length} ground-truth campus structures aligned to satellite imagery at Saranathan College.</span>
          </span>
          <span className="mono font-semibold text-amber-600 text-[11px]">
            GEOMETRY STATUS: SATELLITE-ALIGNED PROTOTYPE
          </span>
        </div>
      </div>
    </div>
  );
}

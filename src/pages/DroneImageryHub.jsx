import React, { useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  ImageOverlay,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext.jsx';
import properties from '../data/properties.js';
import { gisData } from '../data/gisData.js';
import {
  Satellite,
  Upload,
  Layers,
  MapPin,
  Sliders,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  Eye,
  EyeOff,
  Navigation,
  Info,
  Maximize2
} from 'lucide-react';

const DRONE_MISSIONS = [
  {
    id: 'mission_01',
    name: 'Campus Master Aerial Orthomosaic 2025',
    surveyId: 'DRONE-TN-2025-081',
    propertyId: 'rv-block',
    ulpin: '29-01-001-000123',
    flightDate: '2025-02-28T10:15:00Z',
    altitudeAMSL: 110,
    gsdCm: 2.1,
    sensorModel: 'Hasselblad L2D-20c (4/3 CMOS 20MP)',
    headingDeg: 32,
    pitchDeg: -90,
    overlayBounds: [
      [10.755800, 78.649200], // SW
      [10.758800, 78.653800]  // NE
    ],
    // High-quality SVG-based GIS orthomosaic simulation overlay
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%230f3b26" fill-opacity="0.35"/><rect x="80" y="80" width="640" height="440" fill="%231e3a5f" fill-opacity="0.25" stroke="%2338bdf8" stroke-width="2" stroke-dasharray="8 8"/><text x="400" y="300" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold" fill-opacity="0.8">CAMPUS DRONE ORTHOMOSAIC LAYER (GSD 2.1 cm/px)</text><circle cx="400" cy="300" r="180" fill="none" stroke="%2338bdf8" stroke-width="1.5" stroke-opacity="0.6"/><line x1="100" y1="300" x2="700" y2="300" stroke="%2338bdf8" stroke-width="1" stroke-dasharray="4 4"/><line x1="400" y1="100" x2="400" y2="500" stroke="%2338bdf8" stroke-width="1" stroke-dasharray="4 4"/></svg>',
    coverageAreaAcres: 38.5,
    photogrammetryStatus: 'ORTHOMOSAIC_READY',
  },
  {
    id: 'mission_02',
    name: 'RV Block High-Res Cadastral Scan',
    surveyId: 'DRONE-TN-2025-082',
    propertyId: 'rv-block',
    ulpin: '29-01-001-000123',
    flightDate: '2025-02-28T14:30:00Z',
    altitudeAMSL: 65,
    gsdCm: 1.2,
    sensorModel: 'Sony Alpha 7R IV (61MP Full-Frame)',
    headingDeg: 32,
    pitchDeg: -75,
    overlayBounds: [
      [10.756800, 78.651400],
      [10.758200, 78.653400]
    ],
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500" viewBox="0 0 600 500"><rect width="600" height="500" fill="%232563eb" fill-opacity="0.25"/><rect x="50" y="50" width="500" height="400" fill="%23ffffff" fill-opacity="0.15" stroke="%2360a5fa" stroke-width="2"/><text x="300" y="250" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="16" font-weight="bold">RV BLOCK HIGH-RES DRONE SURVEY</text></svg>',
    coverageAreaAcres: 12.0,
    photogrammetryStatus: 'DENSE_CLOUD_GENERATED',
  }
];

export default function DroneImageryHub() {
  const { selectProperty, setCurrentPage } = useApp();
  const [selectedMissionId, setSelectedMissionId] = useState('mission_01');
  const [overlayOpacity, setOverlayOpacity] = useState(0.75);
  const [showParcels, setShowParcels] = useState(true);
  const [showFlightPath, setShowFlightPath] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);

  const activeMission = useMemo(() => {
    return DRONE_MISSIONS.find((m) => m.id === selectedMissionId) || DRONE_MISSIONS[0];
  }, [selectedMissionId]);

  const activeProperty = useMemo(() => {
    return properties.find((p) => p.id === activeMission.propertyId) || properties[3];
  }, [activeMission]);

  // Handle custom image upload
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setUploadedImage({
      name: file.name,
      url,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString(),
    });
  };

  // Simulated flight trajectory path
  const flightPathCoordinates = useMemo(() => {
    return [
      [10.755900, 78.649300],
      [10.758700, 78.649300],
      [10.758700, 78.650800],
      [10.755900, 78.650800],
      [10.755900, 78.652300],
      [10.758700, 78.652300],
      [10.758700, 78.653700],
      [10.755900, 78.653700],
    ];
  }, []);

  return (
    <div className="fade-in space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider flex items-center gap-1">
              <Satellite size={12} />
              Drone &amp; Aerial Photogrammetry Hub
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">UAV Georeferenced Imagery Layer</span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            Drone Imagery &amp; Orthomosaic Cadastral Layer
          </h1>
          <p className="text-xs text-cipher-muted mt-0.5">
            Overlay high-resolution georeferenced UAV orthomosaics, inspect flight telemetry EXIF data, and verify cadastral boundaries against aerial ground truth.
          </p>
        </div>

        {/* Upload Action Button */}
        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-bold shadow-card transition-all cursor-pointer self-start sm:self-auto">
          <Upload size={14} />
          <span>Upload Drone Image / Ortho</span>
          <input
            type="file"
            accept="image/*,.tif,.tiff"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Upload Banner if image uploaded */}
      {uploadedImage && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-cipher-navy text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Uploaded: <strong>{uploadedImage.name}</strong> ({uploadedImage.size}) — Georeferenced to active campus grid.</span>
          </div>
          <button onClick={() => setUploadedImage(null)} className="font-bold text-cipher-govblue hover:underline">Clear</button>
        </div>
      )}

      {/* Mission Selection Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2.5 rounded-xl border border-cipher-border shadow-subtle">
        <span className="text-[10px] font-bold text-cipher-muted uppercase px-2 shrink-0">Flight Missions:</span>
        {DRONE_MISSIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMissionId(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedMissionId === m.id
                ? 'bg-cipher-govblue text-white shadow-xs'
                : 'bg-slate-50 text-cipher-navy hover:bg-slate-100 border border-cipher-borderLight'
            }`}
          >
            {m.name} ({m.surveyId})
          </button>
        ))}
      </div>

      {/* Main Grid: Map Overlay (Left) + Flight Metadata Panel (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 min-h-[580px]">
        {/* Leaflet GIS Map with Drone Overlay */}
        <div className="relative rounded-2xl overflow-hidden border border-cipher-border shadow-card min-h-[520px]">
          {/* Floating Map Controls */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md p-2 rounded-xl border border-cipher-border shadow-md space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold text-cipher-navy uppercase flex items-center gap-1">
                <Sliders size={12} className="text-cipher-govblue" /> Ortho Opacity:
              </span>
              <span className="font-mono text-xs font-bold text-cipher-govblue">{Math.round(overlayOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-44 accent-cipher-govblue cursor-pointer"
            />
            <div className="pt-1.5 border-t border-cipher-border flex items-center justify-between gap-2">
              <button
                onClick={() => setShowParcels(!showParcels)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  showParcels ? 'bg-blue-50 text-cipher-govblue border border-blue-200' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {showParcels ? '✓ Cadastral Lines' : 'Hide Parcels'}
              </button>
              <button
                onClick={() => setShowFlightPath(!showFlightPath)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  showFlightPath ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {showFlightPath ? '✓ Flight Trajectory' : 'Hide Flight'}
              </button>
            </div>
          </div>

          <MapContainer
            center={[10.757172, 78.651348]}
            zoom={18}
            style={{ width: '100%', height: '100%', minHeight: '520px' }}
          >
            {/* Satellite Base Layer */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={22}
            />

            {/* Georeferenced Drone Orthomosaic Overlay */}
            <ImageOverlay
              url={uploadedImage ? uploadedImage.url : activeMission.imageUrl}
              bounds={activeMission.overlayBounds}
              opacity={overlayOpacity}
            />

            {/* UAV Flight Path Polyline */}
            {showFlightPath && (
              <Polyline
                positions={flightPathCoordinates}
                pathOptions={{
                  color: '#F59E0B',
                  weight: 2,
                  dashArray: '6 6',
                  opacity: 0.85,
                }}
              />
            )}

            {/* Cadastral Parcel Polygons */}
            {showParcels &&
              properties.map((prop) => (
                <Polygon
                  key={prop.id}
                  positions={prop.footprint}
                  pathOptions={{
                    color: prop.id === activeMission.propertyId ? '#F59E0B' : '#3B82F6',
                    weight: prop.id === activeMission.propertyId ? 3 : 1.5,
                    fillColor: prop.color || '#3B82F6',
                    fillOpacity: prop.id === activeMission.propertyId ? 0.45 : 0.2,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -5]}>
                    <div className="text-xs font-bold text-cipher-navy">{prop.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{prop.ulpin2D}</div>
                  </Tooltip>
                </Polygon>
              ))}
          </MapContainer>
        </div>

        {/* Right Drone Metadata Panel */}
        <aside className="gov-card p-4 flex flex-col justify-between gap-4 bg-white shadow-card overflow-y-auto">
          <div>
            <div className="pb-3 border-b border-cipher-border">
              <div className="text-[10px] uppercase font-bold tracking-wider text-cipher-govblue flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                UAV Aerial Mission Record
              </div>
              <h2 className="text-base font-extrabold text-cipher-navy mt-0.5 leading-tight">
                {activeMission.name}
              </h2>
              <p className="text-xs text-cipher-muted mt-1">
                Survey ID: <span className="mono font-bold text-cipher-navy">{activeMission.surveyId}</span>
              </p>
            </div>

            {/* Telemetry Grid */}
            <div className="my-3 space-y-2">
              <div className="text-[11px] font-bold text-cipher-navy uppercase tracking-wide">
                Flight Telemetry &amp; Photogrammetry
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-cipher-muted font-bold">FLIGHT ALTITUDE</div>
                  <div className="font-mono font-extrabold text-cipher-navy text-xs mt-0.5">
                    {activeMission.altitudeAMSL}m AGL
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-cipher-muted font-bold">GROUND SAMPLING (GSD)</div>
                  <div className="font-mono font-extrabold text-emerald-600 text-xs mt-0.5">
                    {activeMission.gsdCm} cm/px
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-cipher-muted font-bold">CAMERA SENSOR</div>
                  <div className="font-semibold text-cipher-navy text-[10px] mt-0.5 truncate">
                    {activeMission.sensorModel}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-cipher-muted font-bold">COVERAGE EXTENT</div>
                  <div className="font-mono font-bold text-cipher-navy text-[10px] mt-0.5">
                    {activeMission.coverageAreaAcres} Acres
                  </div>
                </div>
              </div>
            </div>

            {/* Photogrammetry Separation Notice */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1">
              <div className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-1">
                <Info size={12} className="text-amber-700" />
                Pipeline Separation Notice
              </div>
              <p className="text-[10px] text-amber-950 leading-relaxed">
                This layer displays <strong>Georeferenced 2D Orthomosaics</strong> for cadastral boundary verification. High-density 3D dense clouds and meshes are processed in the <strong>LiDAR &amp; Point Cloud</strong> module.
              </p>
            </div>

            {/* Matched Property Card */}
            <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cipher-govblue flex items-center justify-between">
                <span>Associated Land Parcel</span>
                <span className="text-emerald-700 bg-white px-1.5 py-0.2 rounded border border-blue-200 text-[9px]">Linked</span>
              </div>
              <div>
                <div className="font-bold text-xs text-cipher-navy">{activeProperty.name}</div>
                <div className="mono text-[11px] font-bold text-cipher-govblue mt-0.5">{activeProperty.ulpin2D}</div>
                <div className="text-[10px] text-cipher-muted mt-0.5">{activeProperty.surveyNumber} · {activeProperty.propertyType}</div>
              </div>
            </div>
          </div>

          {/* Action Link into 3D Digital Twin */}
          <div className="pt-2 border-t border-cipher-border space-y-2">
            <button
              onClick={() => {
                selectProperty(activeProperty);
                setCurrentPage('explorer');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-bold transition-all shadow-subtle cursor-pointer"
            >
              <Building2 size={14} />
              <span>Inspect 3D Digital Twin</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

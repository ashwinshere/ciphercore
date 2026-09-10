import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Printer,
  QrCode,
  Building2,
  MapPin,
  Ruler,
  Layers,
  Lock,
  Globe,
  Share2
} from 'lucide-react';
import { generateDigitalTwinCertificate } from '../utils/spatialFingerprint.js';

export default function SpatialIdentityModal({ isOpen, onClose, property, room, buildingData }) {
  const [cert, setCert] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedULPIN, setCopiedULPIN] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateDigitalTwinCertificate(property, room, buildingData).then(setCert);
    }
  }, [isOpen, property, room, buildingData]);

  if (!isOpen || !cert) return null;

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(cert.identity.spatialHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyULPIN = () => {
    navigator.clipboard?.writeText(cert.identity.ulpin3D);
    setCopiedULPIN(true);
    setTimeout(() => setCopiedULPIN(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-cipher-border shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-cipher-text hover:bg-slate-100 transition-colors"
          title="Close Certificate"
        >
          <X size={18} />
        </button>

        {/* Certificate Header Banner */}
        <div className="pb-4 border-b border-cipher-border flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-xl bg-cipher-navy text-white flex items-center justify-center shrink-0 shadow-subtle">
            <ShieldCheck size={26} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-cipher-navy tracking-tight text-lg">
                CIPHERCORE 3D SPATIAL IDENTITY
              </span>
              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                OFFICIALLY CERTIFIED
              </span>
            </div>
            <p className="text-xs text-cipher-muted mt-0.5">
              Government Land Administration &amp; Vertical Property Information System
            </p>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="my-4 space-y-3.5">
          {/* Official 3D ULPIN Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-cipher-border space-y-2">
            <div className="flex items-center justify-between text-[10px] text-cipher-muted uppercase font-bold">
              <span>Standardized 3D ULPIN Identifier</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[10px] normal-case">
                <CheckCircle2 size={12} /> Verified Spatial Record
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 bg-blue-50/80 p-2.5 rounded-lg border border-blue-200/80">
              <span className="mono text-sm font-extrabold text-cipher-govblue select-all break-all">
                {cert.identity.ulpin3D}
              </span>
              <button
                onClick={handleCopyULPIN}
                className="shrink-0 p-1.5 rounded bg-white text-cipher-govblue hover:bg-blue-100 transition-all shadow-2xs cursor-pointer"
                title="Copy 3D ULPIN"
              >
                {copiedULPIN ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Cryptographic 3D Volumetric Hash */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
              <span className="flex items-center gap-1 text-cyan-300">
                <Lock size={12} /> 3D Cadastral SHA-256 Hash
              </span>
              <span className="mono text-[9px] text-slate-500">Volumetric Fingerprint</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="mono text-xs font-bold text-cyan-200 select-all break-all">
                {cert.identity.spatialHash}
              </span>
              <button
                onClick={handleCopyHash}
                className="shrink-0 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Copy Hash"
              >
                {copiedHash ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Spatial & Physical Properties Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-cipher-muted font-bold uppercase block">PROPERTY NAME</span>
              <span className="font-bold text-cipher-navy mt-0.5 block truncate">{cert.identity.cadastralMetadata.roomName}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-cipher-muted font-bold uppercase block">2D LAND ULPIN</span>
              <span className="font-mono font-bold text-cipher-navy text-[11px] mt-0.5 block truncate">{cert.identity.ulpin2D}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-cipher-muted font-bold uppercase block">SURVEY NUMBER</span>
              <span className="font-mono font-bold text-cipher-navy text-[11px] mt-0.5 block">{cert.surveyNumber}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-cipher-muted font-bold uppercase block">FLOOR LEVEL &amp; STRATUM</span>
              <span className="font-bold text-cipher-navy mt-0.5 block">{cert.identity.cadastralMetadata.floorId} (+{cert.identity.cadastralMetadata.elevationM}m)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-cipher-muted font-bold uppercase block">FLOOR PARCEL AREA</span>
              <span className="font-mono font-extrabold text-cipher-govblue text-xs mt-0.5 block">{cert.identity.dimensions.floorAreaM2} m²</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] text-cipher-muted font-bold uppercase block">3D VOLUMETRIC EXTENT</span>
              <span className="font-mono font-extrabold text-cipher-navy text-xs mt-0.5 block">{cert.identity.dimensions.volumeM3} m³</span>
            </div>
          </div>

          {/* GIS Location & Geo Anchor */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] text-cipher-muted font-bold uppercase block">WGS84 GEOGRAPHIC ANCHOR</span>
              <span className="mono font-bold text-cipher-navy text-xs mt-0.5">
                {cert.identity.geographicAnchor.latitude.toFixed(6)}° N, {cert.identity.geographicAnchor.longitude.toFixed(6)}° E
              </span>
            </div>
            <span className="mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              EPSG:4326 · EGM96 Altitude
            </span>
          </div>
        </div>

        {/* Certificate Footer & Actions */}
        <div className="pt-3 border-t border-cipher-border flex items-center justify-between gap-3">
          <div className="text-[10px] text-cipher-muted">
            Issued on: <strong className="text-cipher-navy">{cert.issuedDate}</strong> · Cert ID: <span className="mono font-bold">{cert.certificateId}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-cipher-navy text-xs font-bold transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-bold transition-all cursor-pointer"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

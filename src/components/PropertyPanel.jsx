import React from 'react';
import { MapPin, Ruler, Layers, Hash, ArrowUp, ArrowDown, ShieldCheck, X, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { calculateArea } from '../utils/geometry.js';
import { detectVerticalStack } from '../utils/verticalAnalysis.js';

function Row({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-vertex-border/60 last:border-0">
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <Icon size={13} />
        {label}
      </div>
      <div className={`text-right text-xs text-slate-100 ${mono ? 'mono' : ''}`}>{value}</div>
    </div>
  );
}

export default function PropertyPanel() {
  const { selectedRoom, allRooms, selectRoom, buildingData } = useApp();

  if (!selectedRoom) {
    return (
      <aside className="glass rounded-xl p-5 w-full h-full flex flex-col items-center justify-center text-center text-slate-500">
        <Building2 size={30} className="mb-3 opacity-40" />
        <p className="text-sm">Select a room in the 3D model, floor map, or registry to view its property details.</p>
      </aside>
    );
  }

  const { above, below } = detectVerticalStack(selectedRoom, allRooms);
  const area = calculateArea(selectedRoom);

  return (
    <aside className="glass rounded-xl p-5 w-full h-full overflow-y-auto fade-in">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-vertex-cyan/80 font-semibold">
            Prototype Vertical Property Identifier
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">{selectedRoom.name}</h2>
        </div>
        <button
          onClick={() => selectRoom(null, { focus: false })}
          className="text-slate-500 hover:text-slate-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mono text-xs text-vertex-cyan bg-vertex-cyan/10 border border-vertex-cyan/30 rounded-lg px-3 py-2 mb-4 break-all">
        {selectedRoom.id}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-vertex-blue/20 text-vertex-blue border border-vertex-blue/30">
          {selectedRoom.type}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
            selectedRoom.officialReference
              ? 'bg-vertex-ok/15 text-vertex-ok border-vertex-ok/30'
              : 'bg-vertex-warn/15 text-vertex-warn border-vertex-warn/30'
          }`}
        >
          <ShieldCheck size={11} />
          {selectedRoom.officialReference ? 'Publicly Referenced Room No.' : 'Prototype Room'}
        </span>
      </div>

      <div className="mb-4">
        <Row icon={Building2} label="Building" value={`${buildingData.building.name}`} />
        <Row icon={Layers} label="Floor" value={selectedRoom.floorName} />
        <Row icon={Hash} label="Room No." value={selectedRoom.number} mono />
        <Row icon={Ruler} label="Area" value={`${area} m²`} />
        <Row icon={MapPin} label="Elevation" value={`${selectedRoom.elevation.toFixed(1)} m`} />
        <Row
          icon={MapPin}
          label="XYZ Coordinates"
          value={`X ${selectedRoom.x}, Y ${selectedRoom.elevation}, Z ${selectedRoom.y}`}
          mono
        />
        <Row icon={ShieldCheck} label="Data Confidence" value={selectedRoom.dataConfidence} />
      </div>

      <div className="mb-1">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">Vertical Relationships</h3>
        <button
          onClick={() => above && selectRoom(above.id)}
          disabled={!above}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg glass border border-vertex-border mb-2 disabled:opacity-40 hover:border-vertex-cyan/40 transition-colors text-left"
        >
          <span className="flex items-center gap-2 text-xs text-slate-300">
            <ArrowUp size={13} className="text-vertex-cyan" /> Above
          </span>
          <span className="text-xs mono text-slate-100">{above ? above.name : 'None (top floor)'}</span>
        </button>
        <button
          onClick={() => below && selectRoom(below.id)}
          disabled={!below}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg glass border border-vertex-border disabled:opacity-40 hover:border-vertex-cyan/40 transition-colors text-left"
        >
          <span className="flex items-center gap-2 text-xs text-slate-300">
            <ArrowDown size={13} className="text-vertex-cyan" /> Below
          </span>
          <span className="text-xs mono text-slate-100">{below ? below.name : 'None (ground floor)'}</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-500 mt-4 leading-relaxed border-t border-vertex-border/60 pt-3">
        Geometry shown is prototype spatial data generated for demonstration. It is not an official
        architectural floor plan and can be replaced with verified survey, CAD, BIM or GIS data.
      </p>
    </aside>
  );
}

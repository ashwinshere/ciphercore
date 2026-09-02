import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { generateVerticalPropertyId } from '../utils/propertyId.js';
import { CORRIDOR, STAIRCASE, BUILDING_BOUNDARY } from '../data/buildingData.js';
import PropertyPanel from '../components/PropertyPanel.jsx';
import { Layers, MapPin, CheckCircle2 } from 'lucide-react';

const PADDING = 4;

export default function FloorMapping() {
  const { buildingData, selectedRoom, selectRoom } = useApp();
  const [activeFloorId, setActiveFloorId] = useState(buildingData.floors[0].id);

  // Keep the 2D floor selector in sync if a room gets selected elsewhere.
  useEffect(() => {
    if (selectedRoom) setActiveFloorId(selectedRoom.floorId);
  }, [selectedRoom]);

  const floor = buildingData.floors.find((f) => f.id === activeFloorId);

  const viewBox = useMemo(() => {
    const w = BUILDING_BOUNDARY.xMax - BUILDING_BOUNDARY.xMin + PADDING * 2;
    const h = BUILDING_BOUNDARY.yMax - BUILDING_BOUNDARY.yMin + PADDING * 2;
    return `${BUILDING_BOUNDARY.xMin - PADDING} ${BUILDING_BOUNDARY.yMin - PADDING} ${w} ${h}`;
  }, []);

  return (
    <div className="fade-in h-full flex flex-col gap-4 pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              2D Cadastral Mapping
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">
              {buildingData.building.name} · Elevation +{floor.elevation.toFixed(1)}m
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            Building &amp; Floor Plans
          </h1>
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-1 rounded-lg border border-cipher-border shadow-subtle">
          {buildingData.floors.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFloorId(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shrink-0 ${
                activeFloorId === f.id
                  ? 'bg-cipher-govblue text-white shadow-subtle'
                  : 'text-cipher-muted hover:text-cipher-navy hover:bg-slate-50'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main View + Property Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 flex-1 min-h-[520px]">
        <div className="gov-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-cipher-border">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-cipher-navy">{floor.name} Cadastral Layout</span>
              <span className="text-xs text-cipher-muted">({floor.rooms.length} Units Surveyed)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-cipher-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-50 border border-cipher-govblue" /> Room
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-200" /> Corridor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-200 border border-amber-400" /> Core / Stair
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-[420px] rounded-lg bg-[#F8FAFC] border border-cipher-border overflow-hidden p-2 relative">
            <svg viewBox={viewBox} className="w-full h-full drop-shadow-xs" style={{ transform: 'scaleY(-1)' }}>
              {/* building boundary */}
              <rect
                x={BUILDING_BOUNDARY.xMin}
                y={BUILDING_BOUNDARY.yMin}
                width={BUILDING_BOUNDARY.xMax - BUILDING_BOUNDARY.xMin}
                height={BUILDING_BOUNDARY.yMax - BUILDING_BOUNDARY.yMin}
                fill="none"
                stroke="#CBD5E1"
                strokeDasharray="1.5 1.5"
                strokeWidth="0.2"
              />
              {/* corridor */}
              <rect
                x={CORRIDOR.x}
                y={CORRIDOR.y}
                width={CORRIDOR.width}
                height={CORRIDOR.depth}
                fill="#E2E8F0"
                opacity="0.9"
                stroke="#CBD5E1"
                strokeWidth="0.1"
              />
              {/* staircase / core */}
              <rect
                x={STAIRCASE.x}
                y={STAIRCASE.y}
                width={STAIRCASE.width}
                height={STAIRCASE.depth}
                fill="#FEF3C7"
                stroke="#F59E0B"
                strokeWidth="0.2"
              />
              <text
                x={STAIRCASE.x + STAIRCASE.width / 2}
                y={STAIRCASE.y + STAIRCASE.depth / 2}
                fontSize="1.1"
                fill="#B45309"
                fontWeight="bold"
                textAnchor="middle"
                transform={`scale(1,-1) translate(0, ${-2 * (STAIRCASE.y + STAIRCASE.depth / 2)})`}
              >
                CORE
              </text>

              {/* rooms */}
              {floor.rooms.map((room) => {
                const id = generateVerticalPropertyId(floor, room);
                const isSelected = selectedRoom?.id === id;
                return (
                  <g
                    key={id}
                    onClick={() => selectRoom(id, { focus: true })}
                    className="cursor-pointer transition-all"
                  >
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.depth}
                      fill={isSelected ? '#123B63' : '#EFF6FF'}
                      stroke={isSelected ? '#1E3A8A' : '#1E5A96'}
                      strokeWidth={isSelected ? '0.35' : '0.18'}
                      rx="0.2"
                    />
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.depth / 2 + 0.4}
                      fontSize="1.05"
                      fontWeight="bold"
                      fill={isSelected ? '#FFFFFF' : '#123B63'}
                      textAnchor="middle"
                      transform={`scale(1,-1) translate(0, ${-2 * (room.y + room.depth / 2 + 0.4)})`}
                    >
                      {room.name}
                    </text>
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.depth / 2 - 0.9}
                      fontSize="0.75"
                      fill={isSelected ? '#93C5FD' : '#64748B'}
                      textAnchor="middle"
                      transform={`scale(1,-1) translate(0, ${-2 * (room.y + room.depth / 2 - 0.9)})`}
                    >
                      {room.type}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] text-cipher-muted mt-3 pt-2 border-t border-cipher-borderLight">
            <span>Click any parcel polygon to view cadastral record and vertical relationships.</span>
            <span className="mono font-semibold text-cipher-navy">Grid: Metres (EPSG Prototype)</span>
          </div>
        </div>

        <div className="h-full min-h-[460px]">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
}

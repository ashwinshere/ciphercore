import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { generateVerticalPropertyId } from '../utils/propertyId.js';
import { CORRIDOR, STAIRCASE, BUILDING_BOUNDARY } from '../data/buildingData.js';
import PropertyPanel from '../components/PropertyPanel.jsx';
import { LayoutGrid } from 'lucide-react';

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
    <div className="fade-in h-full flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <LayoutGrid size={18} className="text-vertex-cyan" />
          Floor-wise Property Mapping
        </h1>
        <p className="text-xs text-slate-500">2D top-down plan auto-generated from room coordinate data.</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {buildingData.floors.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFloorId(f.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeFloorId === f.id
                ? 'bg-vertex-cyan text-vertex-bg border-vertex-cyan font-semibold'
                : 'glass text-slate-300 border-vertex-border hover:border-vertex-cyan/40'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 flex-1 min-h-[520px]">
        <div className="glass rounded-xl border border-vertex-border p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">{floor.name}</span>
            <span className="text-[11px] text-slate-500">Elevation {floor.elevation.toFixed(1)} m</span>
          </div>
          <div className="flex-1 min-h-[420px] rounded-lg bg-[#040910] border border-vertex-border overflow-hidden">
            <svg viewBox={viewBox} className="w-full h-full" style={{ transform: 'scaleY(-1)' }}>
              {/* building boundary */}
              <rect
                x={BUILDING_BOUNDARY.xMin}
                y={BUILDING_BOUNDARY.yMin}
                width={BUILDING_BOUNDARY.xMax - BUILDING_BOUNDARY.xMin}
                height={BUILDING_BOUNDARY.yMax - BUILDING_BOUNDARY.yMin}
                fill="none"
                stroke="#1b2c44"
                strokeDasharray="1 1"
                strokeWidth="0.15"
              />
              {/* corridor */}
              <rect
                x={CORRIDOR.x}
                y={CORRIDOR.y}
                width={CORRIDOR.width}
                height={CORRIDOR.depth}
                fill="#14304a"
                opacity="0.6"
              />
              {/* staircase / core */}
              <rect
                x={STAIRCASE.x}
                y={STAIRCASE.y}
                width={STAIRCASE.width}
                height={STAIRCASE.depth}
                fill="#f59e0b"
                opacity="0.25"
                stroke="#f59e0b"
                strokeWidth="0.15"
              />
              <text
                x={STAIRCASE.x + STAIRCASE.width / 2}
                y={STAIRCASE.y + STAIRCASE.depth / 2}
                fontSize="1.1"
                fill="#f59e0b"
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
                  <g key={id} onClick={() => selectRoom(id, { focus: true })} className="cursor-pointer">
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.depth}
                      fill={isSelected ? '#22d3ee' : '#3b82f6'}
                      opacity={isSelected ? 0.55 : 0.25}
                      stroke={isSelected ? '#67e8f9' : '#3b82f6'}
                      strokeWidth="0.15"
                    />
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.depth / 2}
                      fontSize="1"
                      fill={isSelected ? '#ecfeff' : '#cbd5e1'}
                      textAnchor="middle"
                      transform={`scale(1,-1) translate(0, ${-2 * (room.y + room.depth / 2)})`}
                    >
                      {room.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">
            Click any room to select it — selection stays in sync with the 3D Explorer and Property Panel.
          </p>
        </div>

        <div className="h-full min-h-[400px]">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
}

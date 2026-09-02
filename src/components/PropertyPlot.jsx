import React, { useState } from 'react';
import { Polygon, Tooltip } from 'react-leaflet';

export default function PropertyPlot({ property, isSelected, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Polygon
      positions={property.footprint}
      pathOptions={{
        color: isHovered ? '#2563EB' : (isSelected ? '#3B82F6' : 'transparent'),
        fillColor: '#2563EB',
        fillOpacity: isHovered ? 0.12 : (isSelected ? 0.05 : 0),
        weight: isHovered ? 2.5 : (isSelected ? 1.5 : 0),
        opacity: isHovered ? 0.9 : (isSelected ? 0.5 : 0),
      }}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
        click: () => onClick(property),
      }}
    >
      {/* Tooltip only appears on hover — shows building name & 2D ULPIN */}
      {isHovered && (
        <Tooltip direction="top" offset={[0, -10]} opacity={0.95} sticky>
          <div className="text-center px-2 py-1 min-w-[130px]">
            <div className="font-extrabold text-cipher-navy text-xs tracking-tight">
              {property.name}
            </div>
            <div className="text-[11px] text-cipher-govblue mono font-semibold mt-0.5">
              2D ULPIN: {property.ulpin2D}
            </div>
          </div>
        </Tooltip>
      )}
    </Polygon>
  );
}

import React, { useState, useMemo, useRef } from 'react';
import { Search, X, CheckCircle2, ChevronRight, Building2, Box, ArrowRight, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function SearchBar() {
  const { allRooms, selectRoom, buildingData, setSelectedProperty, properties, enter3DView, setCurrentPage } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    // Normalize query (e.g., "rv 403", "rv403", "rv-403", "403", "ulpin")
    const rawQ = query.trim().toLowerCase();
    const compactQ = rawQ.replace(/[\s\-_]/g, '');

    return allRooms
      .filter((r) => {
        const nameClean = r.name.toLowerCase().replace(/[\s\-_]/g, '');
        const idClean = r.id.toLowerCase().replace(/[\s\-_]/g, '');
        const typeClean = r.type.toLowerCase();
        const floorClean = (r.floorName || '').toLowerCase();
        const bldNameClean = (buildingData?.building?.name || '').toLowerCase();

        return (
          r.name.toLowerCase().includes(rawQ) ||
          nameClean.includes(compactQ) ||
          r.id.toLowerCase().includes(rawQ) ||
          idClean.includes(compactQ) ||
          typeClean.includes(rawQ) ||
          floorClean.includes(rawQ) ||
          bldNameClean.includes(rawQ)
        );
      })
      .slice(0, 8);
  }, [query, allRooms, buildingData]);

  const locateIn3D = (room) => {
    // If room belongs to a different building property, ensure it's selected
    if (room.buildingId && properties) {
      const prop = properties.find((p) => p.id === room.buildingId);
      if (prop) setSelectedProperty(prop);
    }
    selectRoom(room.id, { focus: true, navigate: true });
    setCurrentPage('explorer');
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-cipher-bg border border-cipher-border hover:border-slate-300 focus-within:border-cipher-govblue focus-within:bg-white focus-within:ring-2 focus-within:ring-cipher-govblue/15 transition-all shadow-subtle">
        <Search size={15} className="text-cipher-muted shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) locateIn3D(results[0]);
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Search e.g. 'RV 403', 'TN-TRY-SCE...', ULPIN or Lab..."
          className="bg-transparent outline-none text-xs text-cipher-text placeholder:text-cipher-muted w-full font-normal"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-cipher-muted hover:text-cipher-text p-0.5"
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute top-full mt-1.5 w-full min-w-[340px] max-w-lg bg-white border border-cipher-border rounded-xl shadow-elevated overflow-hidden z-50 fade-in divide-y divide-cipher-border">
          <div className="px-3.5 py-2 bg-slate-50 flex items-center justify-between text-[11px] font-bold text-cipher-muted">
            <span className="flex items-center gap-1.5">
              <Box size={13} className="text-cipher-govblue" />
              <span>Matching 3D Properties ({results.length})</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Press Enter to Locate</span>
          </div>

          {results.length > 0 ? (
            results.map((room) => (
              <div
                key={room.id}
                onClick={() => locateIn3D(room)}
                className="w-full flex items-center justify-between p-3 hover:bg-blue-50/70 transition-colors text-left group cursor-pointer"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-cipher-navy group-hover:text-cipher-govblue">
                      {room.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-cipher-muted font-medium border border-slate-200">
                      {room.type}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-cipher-govblue font-bold border border-blue-200">
                      {buildingData?.building?.name || 'RV Block'} · {room.floorShortName}
                    </span>
                  </div>
                  <div className="text-[11px] text-cipher-govblue mono font-bold truncate mt-1">
                    {room.id}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    locateIn3D(room);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-1 shrink-0"
                >
                  <Box size={12} />
                  <span>Locate in 3D</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-cipher-muted space-y-1">
              <p className="font-semibold text-cipher-navy">No cadastral properties found</p>
              <p className="text-[11px]">No results matching "{query}". Try searching "RV 403", "BH 101", or "Laboratory".</p>
            </div>
          )}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

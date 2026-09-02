import React, { useState, useMemo, useRef } from 'react';
import { Search, X, CheckCircle2, ChevronRight, Building } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function SearchBar() {
  const { allRooms, selectRoom } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allRooms
      .filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.number.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.floorName && r.floorName.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, allRooms]);

  const pick = (room) => {
    selectRoom(room.id, { focus: true, navigate: true });
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
            if (e.key === 'Enter' && results[0]) pick(results[0]);
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder="Search by ULPIN, Survey Number or Property ID..."
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
        <div className="absolute top-full mt-1.5 w-full bg-white border border-cipher-border rounded-lg shadow-elevated overflow-hidden z-50 fade-in divide-y divide-cipher-border">
          <div className="px-3 py-2 bg-slate-50 flex items-center justify-between text-[11px] font-semibold text-cipher-muted">
            <span>Search Results ({results.length})</span>
            <span className="text-[10px] text-slate-400">Press Enter to select</span>
          </div>

          {results.length > 0 ? (
            results.map((room) => (
              <button
                key={room.id}
                onClick={() => pick(room)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-blue-50/60 transition-colors text-left group"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-cipher-navy group-hover:text-cipher-govblue">
                      {room.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-cipher-muted font-medium">
                      {room.type}
                    </span>
                    {room.officialReference && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-cipher-success font-medium border border-emerald-200">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-cipher-muted mono truncate mt-0.5">
                    {room.id}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="text-[11px] font-medium text-cipher-muted bg-slate-100 px-2 py-0.5 rounded">
                    {room.floorShortName}
                  </span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-cipher-govblue" />
                </div>
              </button>
            ))
          ) : (
            <div className="p-5 text-center text-xs text-cipher-muted">
              No cadastral units found matching <span className="font-semibold text-cipher-text">"{query}"</span>
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

import React, { useState, useMemo, useRef } from 'react';
import { Search, X } from 'lucide-react';
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
          r.type.toLowerCase().includes(q)
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
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-vertex-border focus-within:border-vertex-cyan/50 transition-colors">
        <Search size={14} className="text-slate-500" />
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
          placeholder="Search RV 403 or TN-TRY-SCE-RV-F04-R403..."
          className="bg-transparent outline-none text-xs text-slate-100 placeholder:text-slate-500 w-full"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-200">
            <X size={13} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 w-full glass border border-vertex-border rounded-lg shadow-panel overflow-hidden z-40 fade-in">
          {results.map((room) => (
            <button
              key={room.id}
              onClick={() => pick(room)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-vertex-cyan/10 transition-colors text-left"
            >
              <div>
                <div className="text-xs text-slate-100 font-medium">{room.name}</div>
                <div className="text-[10px] text-slate-500 mono">{room.id}</div>
              </div>
              <span className="text-[10px] text-slate-500">{room.floorShortName}</span>
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}

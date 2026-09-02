import React, { useMemo, useState } from 'react';
import { Search, ArrowUpDown, Database } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { calculateArea } from '../utils/geometry.js';

const COLUMNS = [
  { key: 'id', label: 'Property ID' },
  { key: 'name', label: 'Room' },
  { key: 'floorShortName', label: 'Floor' },
  { key: 'type', label: 'Type' },
  { key: 'area', label: 'Area (m²)' },
  { key: 'elevation', label: 'Elevation (m)' },
  { key: 'status', label: 'Status' },
];

export default function RegistryTable() {
  const { allRooms, selectRoom } = useApp();
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    return allRooms.map((r) => ({
      ...r,
      area: calculateArea(r),
      status: r.officialReference ? 'Referenced' : 'Prototype',
    }));
  }, [allRooms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? rows.filter(
          (r) =>
            r.id.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q) ||
            r.floorShortName.toLowerCase().includes(q)
        )
      : rows;
    list = [...list].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [rows, query, sortKey, sortAsc]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database size={19} className="text-vertex-cyan" />
          Property Registry
        </h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-vertex-border">
          <Search size={13} className="text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter registry..."
            className="bg-transparent outline-none text-xs text-slate-100 placeholder:text-slate-500 w-52"
          />
        </div>
      </div>

      <div className="glass rounded-xl border border-vertex-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-vertex-border bg-white/5">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left px-4 py-3 font-semibold text-slate-400 uppercase tracking-wide cursor-pointer select-none hover:text-vertex-cyan whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={10} className="opacity-50" />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => selectRoom(row.id, { navigate: true })}
                  className="border-b border-vertex-border/50 hover:bg-vertex-cyan/5 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 mono text-vertex-cyan whitespace-nowrap">{row.id}</td>
                  <td className="px-4 py-2.5 text-slate-100 font-medium whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{row.floorShortName}</td>
                  <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">{row.type}</td>
                  <td className="px-4 py-2.5 text-slate-300 mono">{row.area}</td>
                  <td className="px-4 py-2.5 text-slate-300 mono">{row.elevation.toFixed(1)}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        row.status === 'Referenced'
                          ? 'bg-vertex-ok/15 text-vertex-ok border-vertex-ok/30'
                          : 'bg-vertex-warn/15 text-vertex-warn border-vertex-warn/30'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">No properties match "{query}".</div>
        )}
      </div>
      <p className="text-[11px] text-slate-500">
        Showing {filtered.length} of {rows.length} properties.
      </p>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Search, ArrowUpDown, Database, ShieldCheck, Download, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { calculateArea } from '../utils/geometry.js';

const COLUMNS = [
  { key: 'id', label: 'ULPIN Identifier' },
  { key: 'name', label: 'Cadastral Unit' },
  { key: 'floorShortName', label: 'Level' },
  { key: 'type', label: 'Property Usage' },
  { key: 'area', label: 'Parcel Area' },
  { key: 'elevation', label: 'Elevation' },
  { key: 'status', label: 'Cadastral Status' },
];

export default function RegistryTable() {
  const { allRooms, selectRoom, buildingData } = useApp();
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    return allRooms.map((r) => ({
      ...r,
      area: calculateArea(r),
      status: r.officialReference ? 'Verified' : 'Pilot Survey',
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
    <div className="fade-in space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              Official Ledger
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">
              {buildingData.building.name} ({buildingData.building.district})
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight flex items-center gap-2">
            <Database size={20} className="text-cipher-govblue" />
            ULPIN Property Registry
          </h1>
        </div>

        {/* Filter Input */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-cipher-border shadow-subtle focus-within:border-cipher-govblue focus-within:ring-2 focus-within:ring-cipher-govblue/15 transition-all">
          <Search size={14} className="text-cipher-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter records..."
            className="bg-transparent outline-none text-xs text-cipher-text placeholder:text-cipher-muted w-48 sm:w-60"
          />
        </div>
      </div>

      {/* High-density Government Records Table */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-cipher-border text-cipher-muted uppercase tracking-wider font-semibold">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="px-4 py-3 cursor-pointer select-none hover:text-cipher-navy hover:bg-slate-100/70 transition-colors whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      {col.label}
                      <ArrowUpDown size={11} className="opacity-40" />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cipher-borderLight">
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => selectRoom(row.id, { navigate: true })}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 mono font-semibold text-cipher-govblue whitespace-nowrap">
                    {row.id}
                  </td>
                  <td className="px-4 py-3 font-bold text-cipher-navy whitespace-nowrap">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-cipher-text whitespace-nowrap">
                    <span className="bg-slate-100 text-cipher-muted px-2 py-0.5 rounded text-[11px] font-medium">
                      {row.floorShortName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cipher-text whitespace-nowrap">
                    {row.type}
                  </td>
                  <td className="px-4 py-3 text-cipher-navy mono whitespace-nowrap font-medium">
                    {row.area} m²
                  </td>
                  <td className="px-4 py-3 text-cipher-muted mono whitespace-nowrap">
                    +{row.elevation.toFixed(1)} m
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        row.status === 'Verified'
                          ? 'bg-emerald-50 text-cipher-success border-emerald-200'
                          : 'bg-slate-100 text-cipher-muted border-slate-200'
                      }`}
                    >
                      <ShieldCheck size={11} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cipher-govblue group-hover:underline">
                      Inspect <ChevronRight size={13} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-cipher-muted text-sm">
            No properties found matching <span className="font-semibold text-cipher-navy">"{query}"</span>.
          </div>
        )}

        <div className="px-4 py-2.5 bg-slate-50 border-t border-cipher-border flex items-center justify-between text-xs text-cipher-muted">
          <span>Showing <strong className="text-cipher-navy font-semibold">{filtered.length}</strong> of {rows.length} indexed records</span>
          <span className="text-[11px]">Click any row to open 3D property view</span>
        </div>
      </div>
    </div>
  );
}

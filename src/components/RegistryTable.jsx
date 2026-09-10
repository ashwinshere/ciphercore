import React, { useMemo, useState } from 'react';
import {
  Search,
  ArrowUpDown,
  Database,
  ShieldCheck,
  Download,
  ChevronRight,
  Lock,
  FileCheck2,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { calculateArea } from '../utils/geometry.js';
import SpatialIdentityModal from './SpatialIdentityModal.jsx';

const COLUMNS = [
  { key: 'id', label: '3D ULPIN Identifier' },
  { key: 'name', label: 'Cadastral Unit' },
  { key: 'floorShortName', label: 'Level' },
  { key: 'type', label: 'Property Usage' },
  { key: 'area', label: 'Parcel Area' },
  { key: 'elevation', label: 'Elevation' },
  { key: 'status', label: 'Cadastral Status' },
];

export default function RegistryTable() {
  const { allRooms, selectRoom, buildingData, selectedProperty } = useApp();
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedCertRoom, setSelectedCertRoom] = useState(null);

  const rows = useMemo(() => {
    return allRooms.map((r) => ({
      ...r,
      area: calculateArea(r),
      status: 'Verified 3D Cadastre',
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

  // Export full ledger as CSV
  const handleExportCSV = () => {
    const headers = ['3D_ULPIN', 'Unit_Name', 'Floor', 'Property_Type', 'Area_m2', 'Elevation_m', 'Status'];
    const csvRows = filtered.map((r) => [
      `"${r.id}"`,
      `"${r.name}"`,
      `"${r.floorShortName}"`,
      `"${r.type}"`,
      r.area,
      r.elevation,
      `"${r.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CIPHERCORE_3D_ULPIN_Ledger_${buildingData.building.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fade-in space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider">
              Official Government Ledger
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">
              {buildingData.building.name} ({buildingData.building.district})
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight flex items-center gap-2">
            <Database size={20} className="text-cipher-govblue" />
            3D ULPIN Cadastral Property Registry
          </h1>
        </div>

        {/* Filter Input & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-cipher-border shadow-subtle focus-within:border-cipher-govblue focus-within:ring-2 focus-within:ring-cipher-govblue/15 transition-all">
            <Search size={14} className="text-cipher-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by ULPIN, Room, Type..."
              className="bg-transparent outline-none text-xs text-cipher-text placeholder:text-cipher-muted w-48 sm:w-60"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-cipher-border hover:bg-slate-50 text-cipher-navy text-xs font-semibold shadow-subtle transition-all cursor-pointer"
            title="Download CSV Ledger"
          >
            <Download size={13} className="text-cipher-govblue" />
            <span>Export CSV</span>
          </button>
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
                <th className="px-4 py-3 text-right">3D Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cipher-borderLight">
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-blue-50/50 transition-colors group"
                >
                  <td
                    onClick={() => selectRoom(row.id, { navigate: true })}
                    className="px-4 py-3 mono font-bold text-cipher-govblue whitespace-nowrap cursor-pointer hover:underline"
                  >
                    {row.id}
                  </td>
                  <td
                    onClick={() => selectRoom(row.id, { navigate: true })}
                    className="px-4 py-3 font-bold text-cipher-navy whitespace-nowrap cursor-pointer"
                  >
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-cipher-success border-emerald-200">
                      <ShieldCheck size={11} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCertRoom(row);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-cipher-govblue border border-blue-200 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <Lock size={11} />
                      <span>Certificate</span>
                    </button>
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
          <span className="text-[11px]">Click 3D ULPIN to focus in 3D Explorer</span>
        </div>
      </div>

      {/* Spatial Certificate Modal */}
      <SpatialIdentityModal
        isOpen={!!selectedCertRoom}
        onClose={() => setSelectedCertRoom(null)}
        property={selectedProperty}
        room={selectedCertRoom}
        buildingData={buildingData}
      />
    </div>
  );
}

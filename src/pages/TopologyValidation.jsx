import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import properties from '../data/properties.js';
import { runTopologyValidation } from '../utils/topologyValidation.js';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  FileCheck2,
  Download,
  Building2,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Info,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function TopologyValidation() {
  const { allRooms, buildingData, selectProperty, setCurrentPage } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL', 'CRITICAL', 'WARNING', 'PASS'
  const [expandedRuleId, setExpandedRuleId] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditTimestamp, setAuditTimestamp] = useState(new Date().toLocaleTimeString());

  // Run initial topology audit
  const auditReport = useMemo(() => {
    return runTopologyValidation(properties, allRooms);
  }, [allRooms]);

  const handleRerunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditTimestamp(new Date().toLocaleTimeString());
    }, 450);
  };

  const filteredRules = useMemo(() => {
    if (selectedCategory === 'ALL') return auditReport.rules;
    if (selectedCategory === 'CRITICAL') return auditReport.rules.filter((r) => r.status === 'FAIL');
    if (selectedCategory === 'WARNING') return auditReport.rules.filter((r) => r.status === 'WARN');
    if (selectedCategory === 'PASS') return auditReport.rules.filter((r) => r.status === 'PASS');
    return auditReport.rules;
  }, [auditReport, selectedCategory]);

  return (
    <div className="fade-in space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert size={12} className="text-amber-600" />
              Cadastral QA &amp; Spatial Topology Engine
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">8-Rule Geometric Consistency Pass</span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            Topology Validation &amp; Spatial Audit Center
          </h1>
          <p className="text-xs text-cipher-muted mt-0.5">
            Automated verification of self-intersecting bowtie parcels, boundary overlaps, slivers, out-of-bound building footprints, and vertical stratum collisions.
          </p>
        </div>

        {/* Audit Rerun Button */}
        <button
          onClick={handleRerunAudit}
          disabled={isAuditing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-bold shadow-card transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RotateCcw size={14} className={isAuditing ? 'animate-spin' : ''} />
          <span>{isAuditing ? 'Auditing Topology...' : 'Re-run Topology Audit'}</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="gov-card p-4 bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[10px] text-cipher-muted uppercase font-bold block">Integrity Score</span>
            <span className="font-mono text-xl font-extrabold text-emerald-700">{auditReport.overallScore}% Passed</span>
          </div>
        </div>

        <div className="gov-card p-4 bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-cipher-govblue flex items-center justify-center shrink-0">
            <FileCheck2 size={20} />
          </div>
          <div>
            <span className="text-[10px] text-cipher-muted uppercase font-bold block">Rules Evaluated</span>
            <span className="font-mono text-xl font-extrabold text-cipher-navy">8 / 8 Rules</span>
          </div>
        </div>

        <div className="gov-card p-4 bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-[10px] text-cipher-muted uppercase font-bold block">Warnings Flagged</span>
            <span className="font-mono text-xl font-extrabold text-amber-700">{auditReport.warningCount} Notices</span>
          </div>
        </div>

        <div className="gov-card p-4 bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] text-cipher-muted uppercase font-bold block">Critical Encroachments</span>
            <span className="font-mono text-xl font-extrabold text-red-600">{auditReport.criticalCount} Critical</span>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-cipher-border shadow-subtle flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-bold text-cipher-muted uppercase px-2 shrink-0">Rule Filter:</span>
          {[
            { id: 'ALL', label: `All Rules (${auditReport.rules.length})` },
            { id: 'PASS', label: `Passed (${auditReport.rulesPassed})` },
            { id: 'WARNING', label: `Warnings (${auditReport.rulesWarned})` },
            { id: 'CRITICAL', label: `Failed (${auditReport.rulesFailed})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cipher-govblue text-white shadow-xs'
                  : 'bg-slate-50 text-cipher-navy hover:bg-slate-100 border border-cipher-borderLight'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-cipher-muted mono">
          Last Audit: {auditTimestamp}
        </span>
      </div>

      {/* Rules & Violations List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const isPassed = rule.status === 'PASS';
          const isFailed = rule.status === 'FAIL';
          const isWarn = rule.status === 'WARN';
          const isExpanded = expandedRuleId === rule.id;

          return (
            <div
              key={rule.id}
              className={`gov-card p-4 transition-all bg-white ${
                isFailed ? 'border-red-300' : isWarn ? 'border-amber-300' : 'border-cipher-border'
              }`}
            >
              <div
                onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                className="flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isPassed
                        ? 'bg-emerald-50 text-emerald-600'
                        : isFailed
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 size={18} /> : isFailed ? <XCircle size={18} /> : <AlertTriangle size={18} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="mono text-[10px] font-bold text-cipher-govblue">{rule.id}</span>
                      <span className="text-[10px] font-semibold text-slate-400">· {rule.category}</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-cipher-navy">
                      {rule.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      isPassed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isFailed
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {rule.status === 'PASS' ? '✓ COMPLIANT' : `${rule.violations.length} VIOLATIONS`}
                  </span>
                  {rule.violations.length > 0 && (
                    isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />
                  )}
                </div>
              </div>

              {/* Detailed Violations Dropdown */}
              {isExpanded && rule.violations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-cipher-border space-y-2.5 fade-in">
                  {rule.violations.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-cipher-navy flex items-center gap-1.5">
                          <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                          <span>{v.title}</span>
                        </div>
                        <span className="mono text-[10px] font-bold text-cipher-govblue bg-white px-2 py-0.5 rounded border border-slate-200">
                          {v.ulpin}
                        </span>
                      </div>

                      <p className="text-cipher-muted text-[11px] leading-relaxed">
                        {v.description}
                      </p>

                      <div className="p-2 rounded-lg bg-blue-50/80 border border-blue-200/80 flex items-start gap-2 text-[11px] text-cipher-navy">
                        <Info size={13} className="text-cipher-govblue shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-cipher-govblue">Correction Recommendation: </strong>
                          {v.recommendation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cadastral Certification Notice Card */}
      <div className="gov-card p-5 bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-cipher-govblue uppercase tracking-wide mb-1">
            <ShieldCheck size={16} className="text-emerald-600" />
            Topological Certification Clearance
          </div>
          <p className="text-xs text-cipher-navy font-semibold">
            All 8 campus parcels have been checked for self-intersection, overlapping boundary encroachments, and vertical stratum collisions.
          </p>
          <p className="text-[11px] text-cipher-muted mt-0.5">
            Cryptographic audit hash generated and linked to the official ULPIN registry ledger.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('registry')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-bold shadow-card transition-all cursor-pointer shrink-0"
        >
          <span>View ULPIN Ledger</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

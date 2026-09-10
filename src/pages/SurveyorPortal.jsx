import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getSurveys, SURVEY_STATUS } from '../services/surveyStore.js';
import AIGeneratorWizard from './AIGeneratorWizard.jsx';
import {
  Sparkles,
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  MapPin,
  ArrowRight,
  ShieldCheck,
  FileText,
  Eye,
  Sliders
} from 'lucide-react';

export default function SurveyorPortal() {
  const { setCurrentPage, selectProperty } = useApp();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'new_survey', 'pending', 'approved', 'ai_generator'
  const [surveys, setSurveys] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSurveys = () => {
    setSurveys(getSurveys());
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const pendingCount = useMemo(() => {
    return surveys.filter((s) => s.status === SURVEY_STATUS.PENDING_VERIFICATION).length;
  }, [surveys]);

  const approvedCount = useMemo(() => {
    return surveys.filter((s) => s.status === SURVEY_STATUS.APPROVED).length;
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ulpin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.surveyNumber && s.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (activeTab === 'pending') return s.status === SURVEY_STATUS.PENDING_VERIFICATION;
      if (activeTab === 'approved') return s.status === SURVEY_STATUS.APPROVED;
      if (activeTab === 'review') return s.status === SURVEY_STATUS.SURVEYOR_REVIEW || s.status === SURVEY_STATUS.DRAFT;

      return true;
    });
  }, [surveys, searchQuery, activeTab]);

  // If user requested wizard tab
  if (activeTab === 'new_survey' || activeTab === 'ai_generator') {
    return (
      <AIGeneratorWizard
        onCompleteSurvey={() => {
          loadSurveys();
          setActiveTab('all');
        }}
      />
    );
  }

  return (
    <div className="fade-in space-y-5 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} />
              Authorized Surveyor Hub
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">Digital Cadastral Survey Division</span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            AI Surveyor Portal — Floor Plan to 3D Cadastre
          </h1>
          <p className="text-xs text-cipher-muted mt-0.5">
            Register new building surveys, execute automated AI floor plan recognition, and submit preliminary 3D models for officer verification.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('new_survey')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-extrabold shadow-card transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={15} />
          <span>New Building Survey</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="gov-card p-4 bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-cipher-govblue flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <span className="text-[10px] text-cipher-muted uppercase font-bold block">Total Surveys</span>
            <span className="font-mono text-lg font-extrabold text-cipher-navy">{surveys.length} Registered</span>
          </div>
        </div>

        <div className="gov-card p-4 bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-cipher-muted uppercase font-bold block">Pending Verification</span>
            <span className="font-mono text-lg font-extrabold text-amber-700">{pendingCount} In Review</span>
          </div>
        </div>

        <div className="gov-card p-4 bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] text-cipher-muted uppercase font-bold block">Approved Buildings</span>
            <span className="font-mono text-lg font-extrabold text-emerald-700">{approvedCount} Certified</span>
          </div>
        </div>

        <div className="gov-card p-4 bg-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-[10px] text-cipher-muted uppercase font-bold block">AI Vector Engine</span>
            <span className="font-mono text-lg font-extrabold text-indigo-700">95.4% Accuracy</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-cipher-border shadow-subtle">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-xs'
                : 'bg-white text-cipher-navy border-cipher-border hover:bg-slate-50'
            }`}
          >
            My Surveys ({surveys.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-xs'
                : 'bg-white text-cipher-navy border-cipher-border hover:bg-slate-50'
            }`}
          >
            Pending Verification ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
              activeTab === 'approved'
                ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-xs'
                : 'bg-white text-cipher-navy border-cipher-border hover:bg-slate-50'
            }`}
          >
            Approved Buildings ({approvedCount})
          </button>
          <button
            onClick={() => setActiveTab('new_survey')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-cipher-govblue border border-blue-200 hover:bg-blue-100 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            AI Floor Plan Generator
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ULPIN, Name, Survey No..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-cipher-border text-xs text-cipher-navy focus:outline-none focus:border-cipher-govblue bg-slate-50/50"
          />
        </div>
      </div>

      {/* Survey Records Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurveys.map((survey) => {
          const isPending = survey.status === SURVEY_STATUS.PENDING_VERIFICATION;
          const isApproved = survey.status === SURVEY_STATUS.APPROVED;

          return (
            <div
              key={survey.id}
              className="gov-card p-4 bg-white flex flex-col justify-between hover:border-cipher-govblue transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="mono text-[10px] font-bold text-cipher-govblue px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {survey.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isPending
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {survey.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-cipher-navy group-hover:text-cipher-govblue transition-colors">
                  {survey.name}
                </h3>
                <div className="text-[11px] text-cipher-muted flex items-center gap-1 mt-1">
                  <MapPin size={11} className="text-cipher-govblue" />
                  <span className="truncate">{survey.propertyAddress}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-cipher-borderLight grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-cipher-muted uppercase font-bold block">2D ULPIN</span>
                    <span className="mono font-bold text-cipher-navy text-[11px] block truncate">{survey.ulpin}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-cipher-muted uppercase font-bold block">Built-up Area</span>
                    <span className="mono font-bold text-cipher-navy text-[11px] block">{survey.totalBuiltUpArea} m²</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-cipher-muted uppercase font-bold block">Floors</span>
                    <span className="font-bold text-cipher-navy text-[11px] block">{survey.numFloors} Spatial Floors</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-cipher-muted uppercase font-bold block">AI Confidence</span>
                    <span className="font-bold text-emerald-600 text-[11px] block">{survey.aiConfidence || 95.2}% Score</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-cipher-border flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {survey.surveyorName}
                </span>

                {isPending ? (
                  <button
                    onClick={() => setCurrentPage('pending-verification')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-cipher-govblue hover:bg-blue-100 text-xs font-bold transition-all"
                  >
                    <span>Inspect Review</span>
                    <ArrowRight size={12} />
                  </button>
                ) : isApproved ? (
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all"
                  >
                    <span>View in GIS Cadastre</span>
                    <ArrowRight size={12} />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('new_survey')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all"
                  >
                    <span>Edit Survey</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

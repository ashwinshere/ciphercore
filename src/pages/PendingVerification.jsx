import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getSurveys,
  updateSurveyStatus,
  SURVEY_STATUS
} from '../services/surveyStore.js';
import GeneratedBuildingViewer from '../three/GeneratedBuildingViewer.jsx';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building2,
  Layers,
  FileText,
  Check,
  X,
  Eye,
  RotateCcw,
  Sparkles,
  User,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function PendingVerification() {
  const { setCurrentPage, selectProperty } = useApp();
  const { user } = useAuth();

  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadSurveys = () => {
    const list = getSurveys();
    setSurveys(list);
    if (!selectedSurvey && list.length > 0) {
      // Pick first pending or first survey
      const pending = list.find((s) => s.status === SURVEY_STATUS.PENDING_VERIFICATION) || list[0];
      setSelectedSurvey(pending);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const pendingSurveys = useMemo(() => {
    return surveys.filter((s) => s.status === SURVEY_STATUS.PENDING_VERIFICATION);
  }, [surveys]);

  const approvedSurveys = useMemo(() => {
    return surveys.filter((s) => s.status === SURVEY_STATUS.APPROVED);
  }, [surveys]);

  const handleApprove = (survey) => {
    const updated = updateSurveyStatus(survey.id, SURVEY_STATUS.APPROVED, {
      verifiedBy: user?.name ? `${user.name} (${user.badge || 'GOV-OFFICER'})` : 'T. Anand, IAS (GOV-OFFICER-01)',
      verifiedAt: new Date().toISOString(),
      officerRemarks: reviewRemarks || 'Cadastral floor plan geometry verified against GIS satellite land parcel standards.',
    });

    setFeedbackMessage({
      type: 'success',
      title: 'Building Cadastre Approved & Verified!',
      text: `${survey.name} is now certified and permanently linked to ULPIN ${survey.ulpin}.`,
    });

    loadSurveys();
    setSelectedSurvey(updated);
    setReviewRemarks('');
  };

  const handleReject = (survey) => {
    const updated = updateSurveyStatus(survey.id, SURVEY_STATUS.SURVEYOR_REVIEW, {
      officerRemarks: reviewRemarks || 'Please re-verify wall thickness and room dimension bounds on Floor 01.',
    });

    setFeedbackMessage({
      type: 'warning',
      title: 'Correction Requested from Surveyor',
      text: `${survey.name} returned to surveyor review stage.`,
    });

    loadSurveys();
    setSelectedSurvey(updated);
    setReviewRemarks('');
  };

  return (
    <div className="fade-in space-y-5 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} />
              Officer Cadastral Verification Desk
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">Statutory Verification Workflow</span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            Pending Building Surveys &amp; AI Cadastre Verification
          </h1>
          <p className="text-xs text-cipher-muted mt-0.5">
            Review submitted 3D digital twins, AI floor plan vector detections, and authorize official ULPIN registry records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="mono text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
            <Clock size={13} />
            {pendingSurveys.length} Surveys Awaiting Verification
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            )}
            <div>
              <div className="font-extrabold text-xs">{feedbackMessage.title}</div>
              <div className="text-[11px] opacity-90 mt-0.5">{feedbackMessage.text}</div>
            </div>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
        {/* Left: Survey Queue List */}
        <div className="gov-card p-4 bg-white flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-cipher-border">
            <span className="text-xs font-bold text-cipher-navy uppercase tracking-wider">
              Submitted Surveys ({surveys.length})
            </span>
            <button onClick={loadSurveys} className="text-cipher-muted hover:text-cipher-govblue p-1" title="Refresh">
              <RotateCcw size={13} />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {surveys.map((srv) => {
              const isSel = selectedSurvey?.id === srv.id;
              const isPending = srv.status === SURVEY_STATUS.PENDING_VERIFICATION;
              const isApproved = srv.status === SURVEY_STATUS.APPROVED;

              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedSurvey(srv)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSel
                      ? 'bg-blue-50/90 border-cipher-govblue shadow-xs ring-2 ring-cipher-govblue/20'
                      : 'bg-white border-cipher-border hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-extrabold text-xs text-cipher-navy truncate">{srv.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {srv.status}
                    </span>
                  </div>

                  <div className="mono text-[10px] font-bold text-cipher-govblue break-all">
                    {srv.ulpin}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-cipher-muted mt-2 pt-1.5 border-t border-cipher-borderLight">
                    <span>{srv.numFloors} Floors · {srv.totalBuiltUpArea} m²</span>
                    <span className="font-semibold text-emerald-600">{srv.aiConfidence || 95.2}% AI Score</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Inspection & 3D Review */}
        {selectedSurvey ? (
          <div className="space-y-4">
            {/* Top Overview & Action Banner */}
            <div className="gov-card p-5 bg-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cipher-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cipher-govblue px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                      {selectedSurvey.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        selectedSurvey.status === SURVEY_STATUS.APPROVED
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {selectedSurvey.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-cipher-navy mt-1">
                    {selectedSurvey.name}
                  </h2>
                  <p className="text-xs text-cipher-muted flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-cipher-govblue" />
                    {selectedSurvey.propertyAddress}
                  </p>
                </div>

                {/* Verification Action Buttons */}
                {selectedSurvey.status === SURVEY_STATUS.PENDING_VERIFICATION && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(selectedSurvey)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-all cursor-pointer"
                    >
                      <X size={14} /> Request Correction
                    </button>
                    <button
                      onClick={() => handleApprove(selectedSurvey)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-subtle transition-all cursor-pointer"
                    >
                      <Check size={14} /> Approve &amp; Certify Record
                    </button>
                  </div>
                )}
              </div>

              {/* Inspection Specification Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-cipher-muted uppercase font-bold block">2D Land ULPIN</span>
                  <span className="mono font-bold text-cipher-navy mt-0.5 block truncate">{selectedSurvey.ulpin}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-cipher-muted uppercase font-bold block">Surveyor Record</span>
                  <span className="font-bold text-cipher-navy mt-0.5 block truncate">{selectedSurvey.surveyorName}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-cipher-muted uppercase font-bold block">Dimensions</span>
                  <span className="mono font-bold text-cipher-navy mt-0.5 block">
                    {selectedSurvey.buildingWidth}m × {selectedSurvey.buildingLength}m × {selectedSurvey.floorHeight * selectedSurvey.numFloors}m
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-cipher-muted uppercase font-bold block">AI Detection Confidence</span>
                  <span className="mono font-bold text-emerald-600 mt-0.5 block">{selectedSurvey.aiConfidence}% Certified</span>
                </div>
              </div>

              {/* Officer Remarks Input */}
              {selectedSurvey.status === SURVEY_STATUS.PENDING_VERIFICATION && (
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-cipher-navy uppercase block mb-1">
                    Officer Endorsement Remarks:
                  </label>
                  <input
                    type="text"
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="Enter official sign-off comments or spatial compliance notes..."
                    className="w-full px-3 py-2 rounded-lg border border-cipher-border text-xs text-cipher-navy focus:outline-none focus:border-cipher-govblue bg-white"
                  />
                </div>
              )}
            </div>

            {/* Interactive 3D Model Review */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cipher-navy uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-cipher-govblue" />
                  3D Digital Twin Verification View
                </span>
                <span className="text-[11px] text-cipher-muted">
                  Inspect multi-floor geometry before approving record
                </span>
              </div>

              <GeneratedBuildingViewer
                buildingGeometry={selectedSurvey.buildingGeometry}
                height="440px"
              />
            </div>
          </div>
        ) : (
          <div className="gov-card p-12 bg-white text-center flex flex-col items-center justify-center text-cipher-muted">
            <Building2 size={36} className="text-slate-300 mb-2" />
            <div className="font-bold text-sm text-cipher-navy">No Survey Selected</div>
            <p className="text-xs mt-1">Select a building survey from the queue to review its 3D cadastre.</p>
          </div>
        )}
      </div>
    </div>
  );
}

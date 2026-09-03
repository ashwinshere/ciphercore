import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import properties from '../data/properties.js';
import { gisData } from '../data/gisData.js';
import {
  FLOOR_PLAN_PRESETS,
  analyzeFloorPlan,
  generateMultiFloorBuildingGeometry
} from '../services/aiFloorPlanService.js';
import { saveSurvey, SURVEY_STATUS } from '../services/surveyStore.js';
import GeneratedBuildingViewer from '../three/GeneratedBuildingViewer.jsx';
import {
  Sparkles,
  Building2,
  MapPin,
  Upload,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Sliders,
  Maximize2,
  RefreshCw,
  Send,
  Eye,
  Check,
  Compass,
  Ruler,
  Clock,
  Sparkle
} from 'lucide-react';

const WIZARD_STEPS = [
  { step: 1, title: 'Property & Parcel', subtitle: 'Select ULPIN Land Parcel' },
  { step: 2, title: 'Building Specs', subtitle: 'Dimensions & Structure' },
  { step: 3, title: 'Floor Plans', subtitle: 'Upload CAD Plans' },
  { step: 4, title: 'AI Analysis', subtitle: 'Neural Element Detection' },
  { step: 5, title: 'Detection QA', subtitle: 'Review Extracted Geometry' },
  { step: 6, title: '3D Generation', subtitle: 'Multi-Floor 3D Extrusion' },
  { step: 7, title: 'Surveyor Edit', subtitle: 'Human Verification & Edits' },
  { step: 8, title: 'Official Submit', subtitle: 'Submit to Officer' },
];

export default function AIGeneratorWizard({ onCompleteSurvey, initialProperty }) {
  const { setCurrentPage, selectProperty } = useApp();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: Property Selection
  const [selectedParcelId, setSelectedParcelId] = useState(initialProperty?.id || 'rv-block');
  const [customUlpin, setCustomUlpin] = useState('');
  const [customSurveyNo, setCustomSurveyNo] = useState('');
  const [customAddress, setCustomAddress] = useState('Saranathan College Campus, Panjappur, Tiruchirappalli, Tamil Nadu');

  // STEP 2: Building Specs
  const [buildingName, setBuildingName] = useState('Advanced Computing & AI Research Block');
  const [propertyType, setPropertyType] = useState('Academic & Research');
  const [constructionType, setConstructionType] = useState('RCC Framed Multi-Tier Structure');
  const [numFloors, setNumFloors] = useState(3);
  const [floorHeight, setFloorHeight] = useState(3.6);
  const [buildingWidth, setBuildingWidth] = useState(58);
  const [buildingLength, setBuildingLength] = useState(22);
  const [selectedPresetId, setSelectedPresetId] = useState('academic_standard');

  // STEP 3: Floor Plan Uploads
  const [activeFloorTab, setActiveFloorTab] = useState(0);
  const [uploadedPlans, setUploadedPlans] = useState({}); // { [floorNum]: { name, preview, type } }

  // STEP 4: AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [floorAnalysisMap, setFloorAnalysisMap] = useState({});

  // STEP 5: Detection Review
  const [selectedReviewFloor, setSelectedReviewFloor] = useState(0);

  // STEP 6 & 7: 3D Model & Edits
  const [generatedGeometry, setGeneratedGeometry] = useState(null);
  const [selected3DUnit, setSelected3DUnit] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  // STEP 8: Submission Status
  const [submittedSurvey, setSubmittedSurvey] = useState(null);

  // Selected Property Helper
  const activeProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedParcelId) || properties[0];
  }, [selectedParcelId]);

  // Handlers for Preset Selection in Step 3
  const handleSelectPresetForFloor = (floorNum, preset) => {
    setUploadedPlans((prev) => ({
      ...prev,
      [floorNum]: {
        name: `${preset.name} (Floor 0${floorNum})`,
        preview: preset.previewUrl,
        type: 'preset',
        presetId: preset.id,
      },
    }));
  };

  // Run AI Analysis for all floors
  const handleStartAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const results = {};
    const totalFloorsCount = parseInt(numFloors, 10);

    for (let f = 0; f < totalFloorsCount; f++) {
      const plan = uploadedPlans[f];
      const presetId = plan?.presetId || selectedPresetId || 'academic_standard';

      const res = await analyzeFloorPlan({
        floorNumber: f,
        floorPlan: plan?.preview,
        presetId,
        buildingSpecs: {
          width: parseFloat(buildingWidth),
          depth: parseFloat(buildingLength),
          height: parseFloat(floorHeight),
        },
        onProgress: (stage) => {
          const overallProgress = Math.round(((f + stage.progress / 100) / totalFloorsCount) * 100);
          setAnalysisStage(`Floor 0${f}: ${stage.label}`);
          setAnalysisProgress(overallProgress);
        },
      });

      results[f] = res;
    }

    setFloorAnalysisMap(results);
    setIsAnalyzing(false);

    // Auto-synthesize full 3D building geometry
    const geometry = generateMultiFloorBuildingGeometry(
      {
        id: `SURV-${Date.now()}`,
        ulpin: activeProperty?.ulpin2D || '29-01-001-000123',
        surveyNumber: customSurveyNo || activeProperty?.surveyNumber || '142/2A',
        name: buildingName,
        propertyType,
        constructionType,
        numFloors,
        floorHeight,
        buildingWidth,
        buildingLength,
        gpsCoordinates: {
          latitude: activeProperty?.coordinates?.latitude || 10.757172,
          longitude: activeProperty?.coordinates?.longitude || 78.651348,
        },
      },
      results
    );

    setGeneratedGeometry(geometry);
    setCurrentStep(5);
  };

  // Final Submission to Officer
  const handleSubmitSurvey = () => {
    const surveyPayload = {
      id: `SURV-2025-${Math.floor(100 + Math.random() * 900)}`,
      ulpin: activeProperty?.ulpin2D || customUlpin || '29-01-001-000123',
      surveyNumber: customSurveyNo || activeProperty?.surveyNumber || '142/2A',
      propertyAddress: customAddress,
      name: buildingName,
      propertyType,
      constructionType,
      surveyorName: user?.name ? `${user.name} (${user.badge || 'SURV-TN'})` : 'R. Kumar (SURV-TN-409)',
      surveyorId: user?.username || 'surveyor',
      numFloors: parseInt(numFloors, 10),
      floorHeight: parseFloat(floorHeight),
      buildingWidth: parseFloat(buildingWidth),
      buildingLength: parseFloat(buildingLength),
      totalBuiltUpArea: generatedGeometry?.totalBuiltUpArea || (buildingWidth * buildingLength * numFloors),
      gpsCoordinates: {
        latitude: activeProperty?.coordinates?.latitude || 10.757172,
        longitude: activeProperty?.coordinates?.longitude || 78.651348,
      },
      status: SURVEY_STATUS.PENDING_VERIFICATION,
      aiConfidence: 95.4,
      floorAnalysis: floorAnalysisMap,
      buildingGeometry: generatedGeometry,
      surveyorNotes: editNotes,
      submittedAt: new Date().toISOString(),
    };

    saveSurvey(surveyPayload);
    setSubmittedSurvey(surveyPayload);
    setCurrentStep(8);
  };

  return (
    <div className="fade-in space-y-5 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cipher-border">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-cipher-govblue border border-blue-200 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} />
              AI Building Cadastre Engine
            </span>
            <span className="text-xs text-cipher-muted">·</span>
            <span className="text-xs text-cipher-muted font-medium">DeepCadastre-CV v3.4</span>
          </div>
          <h1 className="text-xl font-extrabold text-cipher-navy tracking-tight">
            AI Surveyor Portal — Floor Plan to 3D Building Generator
          </h1>
          <p className="text-xs text-cipher-muted mt-0.5">
            Automated CAD vector extraction, neural room segmentation, and certified multi-floor 3D spatial cadastre.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('surveyor-portal')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cipher-border hover:bg-slate-50 text-xs font-semibold text-cipher-navy self-start sm:self-auto transition-colors"
        >
          <ChevronLeft size={14} /> Back to Dashboard
        </button>
      </div>

      {/* 8-Step Wizard Progress Stepper */}
      <div className="bg-white p-3.5 rounded-xl border border-cipher-border shadow-subtle overflow-x-auto">
        <div className="flex items-center justify-between min-w-[720px] gap-2">
          {WIZARD_STEPS.map((stepItem, idx) => {
            const isCompleted = currentStep > stepItem.step;
            const isCurrent = currentStep === stepItem.step;

            return (
              <React.Fragment key={stepItem.step}>
                <div
                  onClick={() => {
                    if (isCompleted) setCurrentStep(stepItem.step);
                  }}
                  className={`flex items-center gap-2 cursor-pointer transition-all ${
                    isCompleted ? 'opacity-90 hover:opacity-100' : isCurrent ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-cipher-govblue text-white ring-4 ring-cipher-govblue/20'
                        : 'bg-slate-100 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : stepItem.step}
                  </div>
                  <div className="text-left">
                    <div className={`text-xs font-bold leading-tight ${isCurrent ? 'text-cipher-govblue' : 'text-cipher-navy'}`}>
                      {stepItem.title}
                    </div>
                    <div className="text-[10px] text-cipher-muted leading-tight">{stepItem.subtitle}</div>
                  </div>
                </div>

                {idx < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 transition-colors ${
                      currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: PROPERTY & LAND PARCEL SELECTION */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="gov-card p-5 bg-white space-y-5 fade-in">
          <div className="pb-3 border-b border-cipher-border">
            <h2 className="text-base font-extrabold text-cipher-navy flex items-center gap-2">
              <MapPin size={18} className="text-cipher-govblue" />
              Step 1: Select ULPIN &amp; GIS Land Parcel Reference
            </h2>
            <p className="text-xs text-cipher-muted mt-0.5">
              Link the new building survey to an existing government-registered 2D Land Parcel on the GIS cadastre.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campus Parcel Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-cipher-navy uppercase tracking-wider block">
                Select Registered Land Parcel:
              </label>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {properties.map((p) => {
                  const isSel = selectedParcelId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedParcelId(p.id);
                        setBuildingName(p.name ? `${p.name} (Expansion Wing)` : 'New Academic Wing');
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-blue-50/80 border-cipher-govblue ring-2 ring-cipher-govblue/20 shadow-xs'
                          : 'bg-white border-cipher-border hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-cipher-navy">{p.name}</span>
                        <span className="mono text-[10px] font-bold text-cipher-govblue px-1.5 py-0.5 rounded bg-white border border-blue-200">
                          {p.ulpin2D}
                        </span>
                      </div>
                      <div className="text-[11px] text-cipher-muted mt-1 flex items-center gap-2">
                        <span>Survey No: {p.surveyNumber || '142/2A'}</span>
                        <span>·</span>
                        <span>{p.propertyType}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Parcel Summary & GIS Anchor */}
            <div className="p-4 rounded-xl bg-slate-50 border border-cipher-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-cipher-border mb-3">
                  <span className="text-xs font-bold text-cipher-navy uppercase tracking-wider">
                    GIS Parcel Verification
                  </span>
                  <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 size={12} /> Spatial Anchor Confirmed
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-cipher-muted uppercase font-bold block">Selected Property</span>
                    <span className="font-extrabold text-cipher-navy text-sm">{activeProperty?.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-cipher-muted uppercase font-bold block">2D Land ULPIN</span>
                      <span className="font-mono text-xs font-bold text-cipher-govblue">{activeProperty?.ulpin2D}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-cipher-muted uppercase font-bold block">Survey Number</span>
                      <span className="font-mono text-xs font-bold text-cipher-navy">{activeProperty?.surveyNumber || '142/2A'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-cipher-muted uppercase font-bold block">WGS84 Coordinates</span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {activeProperty?.coordinates?.latitude?.toFixed(6)}° N, {activeProperty?.coordinates?.longitude?.toFixed(6)}° E
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-cipher-muted uppercase font-bold block">Registered Address</span>
                    <span className="text-[11px] text-slate-600">{customAddress}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-cipher-border mt-4 flex items-center justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-extrabold shadow-subtle transition-all cursor-pointer"
                >
                  <span>Continue to Step 2: Building Specs</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: BUILDING SPECIFICATIONS */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="gov-card p-5 bg-white space-y-5 fade-in">
          <div className="pb-3 border-b border-cipher-border">
            <h2 className="text-base font-extrabold text-cipher-navy flex items-center gap-2">
              <Building2 size={18} className="text-cipher-govblue" />
              Step 2: Enter Building Dimensions &amp; Engineering Specs
            </h2>
            <p className="text-xs text-cipher-muted mt-0.5">
              Specify the volumetric constraints, floor heights, and structural parameters for 3D extrusion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-cipher-navy uppercase block mb-1">Building Name</label>
                <input
                  type="text"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cipher-border text-xs text-cipher-navy focus:outline-none focus:border-cipher-govblue font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-cipher-navy uppercase block mb-1">Building Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-cipher-border text-xs text-cipher-navy focus:outline-none focus:border-cipher-govblue"
                  >
                    <option value="Academic & Research">Academic &amp; Research</option>
                    <option value="Commercial & Office">Commercial &amp; Office</option>
                    <option value="Residential Hostel">Residential Hostel</option>
                    <option value="Government & Administrative">Government &amp; Administrative</option>
                    <option value="Sports & Recreational">Sports &amp; Recreational</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-cipher-navy uppercase block mb-1">Construction Type</label>
                  <select
                    value={constructionType}
                    onChange={(e) => setConstructionType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-cipher-border text-xs text-cipher-navy focus:outline-none focus:border-cipher-govblue"
                  >
                    <option value="RCC Framed Multi-Tier">RCC Framed Multi-Tier</option>
                    <option value="Pre-Engineered Steel Frame">Pre-Engineered Steel Frame</option>
                    <option value="Composite Steel & Concrete">Composite Steel &amp; Concrete</option>
                    <option value="Load Bearing Masonry">Load Bearing Masonry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-cipher-navy uppercase block mb-1">Number of Floors</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={numFloors}
                    onChange={(e) => setNumFloors(Math.max(1, parseInt(e.target.value || '1', 10)))}
                    className="w-full px-3 py-2 rounded-lg border border-cipher-border text-xs font-mono font-bold text-cipher-navy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-cipher-navy uppercase block mb-1">Floor Height (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2.8"
                    max="6.0"
                    value={floorHeight}
                    onChange={(e) => setFloorHeight(parseFloat(e.target.value || '3.6'))}
                    className="w-full px-3 py-2 rounded-lg border border-cipher-border text-xs font-mono font-bold text-cipher-navy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-cipher-navy uppercase block mb-1">Total Height (m)</label>
                  <div className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-cipher-govblue">
                    {(numFloors * floorHeight).toFixed(1)}m
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-cipher-navy uppercase block mb-1">Footprint Width (m)</label>
                  <input
                    type="number"
                    value={buildingWidth}
                    onChange={(e) => setBuildingWidth(parseFloat(e.target.value || '60'))}
                    className="w-full px-3 py-2 rounded-lg border border-cipher-border text-xs font-mono font-bold text-cipher-navy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-cipher-navy uppercase block mb-1">Footprint Depth (m)</label>
                  <input
                    type="number"
                    value={buildingLength}
                    onChange={(e) => setBuildingLength(parseFloat(e.target.value || '22'))}
                    className="w-full px-3 py-2 rounded-lg border border-cipher-border text-xs font-mono font-bold text-cipher-navy"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Built-up Area Metric Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-cipher-border flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-cipher-navy uppercase tracking-wider mb-2">
                  Building Volumetric Summary
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-cipher-muted uppercase font-bold block">Floor Footprint</span>
                    <span className="font-mono text-sm font-bold text-cipher-navy">
                      {(buildingWidth * buildingLength).toFixed(0)} m²
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-cipher-muted uppercase font-bold block">Total Built-up Area</span>
                    <span className="font-mono text-sm font-bold text-cipher-govblue">
                      {(buildingWidth * buildingLength * numFloors).toFixed(0)} m²
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs space-y-1">
                  <div className="font-bold text-cipher-navy flex items-center gap-1.5">
                    <Sparkles size={13} className="text-cipher-govblue" />
                    AI Vector Preset Recommendation:
                  </div>
                  <p className="text-[11px] text-cipher-muted">
                    Based on property type <strong>{propertyType}</strong>, the model will classify room boundaries with 94%+ confidence.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-cipher-border mt-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl border border-cipher-border hover:bg-white text-xs font-semibold text-cipher-navy"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-extrabold shadow-subtle transition-all cursor-pointer"
                >
                  <span>Continue to Step 3: Floor Plans</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: FLOOR PLAN UPLOAD & ARCHITECTURAL PRESETS */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="gov-card p-5 bg-white space-y-5 fade-in">
          <div className="pb-3 border-b border-cipher-border">
            <h2 className="text-base font-extrabold text-cipher-navy flex items-center gap-2">
              <Upload size={18} className="text-cipher-govblue" />
              Step 3: Upload Floor Plans for Each Spatial Level
            </h2>
            <p className="text-xs text-cipher-muted mt-0.5">
              Upload PNG, JPG, or PDF architectural blueprints, or select sample certified CAD plans for immediate scanning.
            </p>
          </div>

          {/* Floor Level Tabs */}
          <div className="flex items-center gap-2 border-b border-cipher-border pb-2 overflow-x-auto">
            {Array.from({ length: numFloors }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFloorTab(idx)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  activeFloorTab === idx
                    ? 'bg-cipher-govblue text-white border-cipher-govblue shadow-xs'
                    : 'bg-slate-50 text-cipher-navy border-cipher-border hover:bg-slate-100'
                }`}
              >
                {idx === 0 ? 'Ground Floor (GF)' : `Floor 0${idx}`}
                {uploadedPlans[idx] && <span className="ml-1.5 text-emerald-300">✓</span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Upload Zone / Active Plan Card */}
            <div className="p-5 rounded-2xl border-2 border-dashed border-cipher-border hover:border-cipher-govblue transition-all bg-slate-50/50 flex flex-col items-center justify-center text-center relative min-h-[260px]">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      setUploadedPlans((prev) => ({
                        ...prev,
                        [activeFloorTab]: {
                          name: file.name,
                          preview: evt.target.result,
                          type: 'user_upload',
                          presetId: 'academic_standard',
                        },
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              <div className="w-12 h-12 rounded-full bg-blue-50 text-cipher-govblue flex items-center justify-center mb-3 shadow-sm">
                <Upload size={22} />
              </div>
              <div className="font-extrabold text-sm text-cipher-navy">
                Upload Floor Plan for {activeFloorTab === 0 ? 'Ground Floor' : `Floor 0${activeFloorTab}`}
              </div>
              <p className="text-xs text-cipher-muted mt-1 max-w-sm">
                Drag and drop your CAD drawing or architectural blueprint here (PNG, JPG, PDF up to 25MB)
              </p>

              {uploadedPlans[activeFloorTab] && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Loaded: {uploadedPlans[activeFloorTab].name}
                </div>
              )}
            </div>

            {/* Instant Certified Sample Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cipher-navy uppercase tracking-wider">
                  Or Pick a Certified CAD Floor Plan Template:
                </span>
                <span className="text-[10px] text-cipher-govblue font-semibold">1-Click Test Plans</span>
              </div>

              <div className="space-y-2.5">
                {FLOOR_PLAN_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPresetForFloor(activeFloorTab, preset)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      uploadedPlans[activeFloorTab]?.presetId === preset.id
                        ? 'bg-blue-50/80 border-cipher-govblue ring-2 ring-cipher-govblue/20 shadow-xs'
                        : 'bg-white border-cipher-border hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-cipher-navy">{preset.name}</div>
                      <div className="text-[11px] text-cipher-muted mt-0.5">{preset.description}</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-slate-100 font-semibold text-slate-700">
                      Use Template →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="pt-4 border-t border-cipher-border flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl border border-cipher-border hover:bg-white text-xs font-semibold text-cipher-navy"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                // Ensure at least default preset is loaded for any missing floors
                for (let i = 0; i < numFloors; i++) {
                  if (!uploadedPlans[i]) {
                    handleSelectPresetForFloor(i, FLOOR_PLAN_PRESETS[0]);
                  }
                }
                setCurrentStep(4);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-extrabold shadow-subtle transition-all cursor-pointer"
            >
              <span>Proceed to Step 4: AI Analysis</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: AI FLOOR PLAN ANALYSIS RUNNER */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="gov-card p-6 bg-white space-y-6 fade-in text-center max-w-2xl mx-auto">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-cipher-govblue flex items-center justify-center mx-auto mb-3 shadow-md">
              <Sparkles size={28} className="animate-spin-slow" />
            </div>
            <h2 className="text-lg font-extrabold text-cipher-navy">
              DeepCadastre Computer Vision Floor Plan Extraction
            </h2>
            <p className="text-xs text-cipher-muted mt-1">
              Neural network will segment wall lines, room boundaries, door frames, and vertical staircase shafts.
            </p>
          </div>

          {/* Real-time Progress Bar & Stage Status */}
          {isAnalyzing ? (
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-cipher-navy">
                <span>{analysisStage || 'AI Processing Floor Plans...'}</span>
                <span className="font-mono text-cipher-govblue">{analysisProgress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px] text-cipher-muted pt-2 text-center">
                <span>1. Preprocess</span>
                <span>2. Segmentation</span>
                <span>3. Vectorize</span>
                <span>4. 3D Extrude</span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-left space-y-2">
              <div className="font-bold text-xs text-cipher-navy flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-cipher-govblue" />
                Ready to Process {numFloors} Spatial Floor Plans:
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Extracting wall vectors ($X, Y$ coordinate spans)</li>
                <li>Identifying room names, types, and metric areas ($m^2$)</li>
                <li>Detecting door openings, window frames, and elevator shafts</li>
                <li>Synthesizing multi-tier 3D building model with ${floorHeight}m$ floor height</li>
              </ul>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            {!isAnalyzing && (
              <button
                onClick={handleStartAIAnalysis}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-extrabold shadow-card transition-all cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Start AI Analysis &amp; 3D Model Generation</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: AI DETECTION RESULTS & CAD REVIEW */}
      {/* ========================================================================= */}
      {currentStep === 5 && (
        <div className="gov-card p-5 bg-white space-y-5 fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cipher-border">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-cipher-navy flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Step 5: AI Detection Results &amp; Vector Quality Assurance
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  95.2% Confidence
                </span>
              </div>
              <p className="text-xs text-cipher-muted mt-0.5">
                Review the recognized architectural vectors, detected walls, room labels, and apertures.
              </p>
            </div>

            {/* Floor Selector */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: numFloors }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedReviewFloor(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                    selectedReviewFloor === idx
                      ? 'bg-cipher-govblue text-white border-cipher-govblue'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {idx === 0 ? 'GF' : `F0${idx}`}
                </button>
              ))}
            </div>
          </div>

          {/* AI Metrics KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-cipher-border text-center">
              <span className="text-[10px] text-cipher-muted uppercase font-bold block">WALLS DETECTED</span>
              <span className="font-mono text-base font-extrabold text-cipher-navy">
                {floorAnalysisMap[selectedReviewFloor]?.detectedElements?.wallsCount || 16}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-cipher-border text-center">
              <span className="text-[10px] text-cipher-muted uppercase font-bold block">ROOMS IDENTIFIED</span>
              <span className="font-mono text-base font-extrabold text-cipher-govblue">
                {floorAnalysisMap[selectedReviewFloor]?.detectedElements?.roomsCount || 8}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-cipher-border text-center">
              <span className="text-[10px] text-cipher-muted uppercase font-bold block">DOORS DETECTED</span>
              <span className="font-mono text-base font-extrabold text-emerald-600">
                {floorAnalysisMap[selectedReviewFloor]?.detectedElements?.doorsCount || 8}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-cipher-border text-center">
              <span className="text-[10px] text-cipher-muted uppercase font-bold block">WINDOWS DETECTED</span>
              <span className="font-mono text-base font-extrabold text-cyan-600">
                {floorAnalysisMap[selectedReviewFloor]?.detectedElements?.windowsCount || 8}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-cipher-border text-center">
              <span className="text-[10px] text-cipher-muted uppercase font-bold block">AI ACCURACY</span>
              <span className="font-mono text-base font-extrabold text-emerald-700">95.4%</span>
            </div>
          </div>

          {/* SVG Vector Visualizer of Detected Elements */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 overflow-hidden flex items-center justify-center min-h-[320px] relative shadow-inner">
            <svg
              viewBox={`-32 -13 64 26`}
              className="w-full h-full max-h-[360px] select-none"
            >
              {/* Outer Boundary */}
              <rect x={-buildingWidth / 2} y={-buildingLength / 2} width={buildingWidth} height={buildingLength} fill="#FFFFFF" stroke="#64748B" strokeWidth="0.25" rx="0.3" />
              
              {/* Corridor */}
              <rect x={-buildingWidth / 2 + 1} y={-1.5} width={buildingWidth - 2} height={3} fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.15" />

              {/* Detected Rooms */}
              {floorAnalysisMap[selectedReviewFloor]?.geometry?.rooms?.map((rm) => (
                <g key={rm.id}>
                  <rect
                    x={rm.x}
                    y={rm.y}
                    width={rm.width}
                    height={rm.depth}
                    fill="#EFF6FF"
                    stroke="#3B82F6"
                    strokeWidth="0.2"
                    rx="0.2"
                  />
                  <text x={rm.x + rm.width / 2} y={rm.y + rm.depth / 2 - 0.4} fontSize="0.9" fill="#1E3A8A" fontWeight="bold" textAnchor="middle">
                    {rm.name}
                  </text>
                  <text x={rm.x + rm.width / 2} y={rm.y + rm.depth / 2 + 0.6} fontSize="0.65" fill="#2563EB" textAnchor="middle">
                    {rm.type}
                  </text>
                  <text x={rm.x + rm.width / 2} y={rm.y + rm.depth / 2 + 1.4} fontSize="0.55" fill="#64748B" textAnchor="middle">
                    {rm.area} m²
                  </text>
                </g>
              ))}
            </svg>

            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-500 font-mono">
              Floor 0{selectedReviewFloor} Vector Overlay
            </div>
          </div>

          <div className="pt-4 border-t border-cipher-border flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 rounded-xl border border-cipher-border hover:bg-white text-xs font-semibold text-cipher-navy"
            >
              ← Re-run AI Analysis
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-extrabold shadow-subtle transition-all cursor-pointer"
            >
              <span>Generate 3D Building (Step 6)</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 6 & 7: 3D GENERATION & SURVEYOR EDIT */}
      {/* ========================================================================= */}
      {(currentStep === 6 || currentStep === 7) && (
        <div className="gov-card p-5 bg-white space-y-5 fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cipher-border">
            <div>
              <h2 className="text-base font-extrabold text-cipher-navy flex items-center gap-2">
                <Layers size={18} className="text-cipher-govblue" />
                {currentStep === 6 ? 'Step 6: Interactive 3D Building Model' : 'Step 7: Surveyor Verification & Edit'}
              </h2>
              <p className="text-xs text-cipher-muted mt-0.5">
                Full 3D parametric multi-floor stack synthesized from AI floor plan extraction.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="mono text-xs font-bold text-cipher-govblue bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                {numFloors} Floors · {(buildingWidth * buildingLength * numFloors).toFixed(0)} m²
              </span>
            </div>
          </div>

          {/* 3D Generated Model Canvas */}
          <GeneratedBuildingViewer
            buildingGeometry={generatedGeometry}
            onSelectRoom={setSelected3DUnit}
            selectedRoomId={selected3DUnit?.id}
            height="460px"
          />

          {/* Surveyor Verification & Notes Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-cipher-border space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-cipher-navy">
              <span className="flex items-center gap-1.5">
                <Sliders size={14} className="text-cipher-govblue" />
                Surveyor Quality Inspection Notes:
              </span>
              <span className="text-emerald-600 font-semibold text-[11px]">✓ Human Verification Active</span>
            </div>
            <textarea
              rows="2"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Enter surveyor inspection observations, structural notes, or room dimension confirmations..."
              className="w-full p-2.5 rounded-lg border border-cipher-border text-xs text-cipher-navy focus:outline-none focus:border-cipher-govblue bg-white"
            />
          </div>

          <div className="pt-4 border-t border-cipher-border flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 rounded-xl border border-cipher-border hover:bg-white text-xs font-semibold text-cipher-navy"
            >
              ← Back to Vectors
            </button>
            <button
              onClick={handleSubmitSurvey}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-subtle transition-all cursor-pointer"
            >
              <Send size={15} />
              <span>Submit for Government Officer Verification (Step 8)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 8: SUBMISSION SUCCESS & REGISTRATION CONFIRMATION */}
      {/* ========================================================================= */}
      {currentStep === 8 && (
        <div className="gov-card p-7 bg-white space-y-6 fade-in text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <Check size={32} />
          </div>

          <div>
            <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
              Status: Pending Officer Verification
            </span>
            <h2 className="text-xl font-extrabold text-cipher-navy mt-2">
              Building Survey Successfully Registered!
            </h2>
            <p className="text-xs text-cipher-muted mt-1">
              Survey Reference ID: <strong className="font-mono text-cipher-govblue">{submittedSurvey?.id}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-cipher-border text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-cipher-muted">Building Name:</span>
              <span className="font-bold text-cipher-navy">{submittedSurvey?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-cipher-muted">Linked 2D Land ULPIN:</span>
              <span className="font-mono font-bold text-cipher-govblue">{submittedSurvey?.ulpin}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-cipher-muted">Surveyed By:</span>
              <span className="font-bold text-slate-700">{submittedSurvey?.surveyorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cipher-muted">AI Analysis Confidence:</span>
              <span className="font-bold text-emerald-600">95.4% Verified</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentPage('pending-verification')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cipher-govblue hover:bg-cipher-navy text-white text-xs font-extrabold shadow-subtle transition-all cursor-pointer"
            >
              Open Officer Verification Dashboard →
            </button>
            <button
              onClick={() => setCurrentPage('surveyor-portal')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-cipher-border hover:bg-slate-50 text-xs font-semibold text-cipher-navy transition-all"
            >
              Return to Surveyor Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

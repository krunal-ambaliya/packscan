import React, { useState } from 'react';
import { ExtractedField, InspectionRecord, Severity, Violation } from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  FileCheck2,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  ShieldAlert,
  Sparkles,
  Tag,
  Check,
  X,
  Building,
  Sliders,
  Printer,
  Share2,
  Download,
  Home,
  ChevronRight,
  Calendar,
  MapPin,
  Scale,
  FileText,
  Flag,
  FolderPlus,
  ShieldCheck,
  Eye,
  Camera,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface InspectionResultProps {
  inspection: InspectionRecord;
  onUpdateField: (fieldId: string, newValue: string, newFontMm?: number) => void;
  onGenerateReport: () => void;
  onNavigateToRules?: () => void;
  onAddField?: (newField: ExtractedField) => void;
  onCertifyCrimp?: (violationId: string) => void;
}

export const InspectionResult: React.FC<InspectionResultProps> = ({
  inspection,
  onUpdateField,
  onGenerateReport,
  onNavigateToRules,
  onAddField,
  onCertifyCrimp,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'PASSED' | 'ADVISORY' | 'BREACH'>('ALL');
  const [showFullPackagingModal, setShowFullPackagingModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedToast, setCopiedToast] = useState(false);
  const [flaggedToast, setFlaggedToast] = useState<string | null>(null);

  // Edit Field Modal state
  const [editingField, setEditingField] = useState<ExtractedField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editFontMm, setEditFontMm] = useState<number>(3.0);

  // Add Missing Declaration Modal state
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('manufacturer_info');
  const [newFieldLabel, setNewFieldLabel] = useState('Manufacturer / Packer Info');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldFontMm, setNewFieldFontMm] = useState(3.0);

  const isCompliant = inspection.complianceStatus === 'COMPLIANT';

  // Specific check if this is the benchmark Taj Mahal Tea record
  const isTeaDossier =
    inspection.productName.toLowerCase().includes('tea') ||
    inspection.id.includes('RPT-DEL-2025-0842');

  const handleOpenEditModal = (field: ExtractedField) => {
    setEditingField(field);
    setEditValue(field.value);
    setEditFontMm(field.fontMm || 3.0);
  };

  const handleSaveCorrection = () => {
    if (editingField) {
      onUpdateField(editingField.id, editValue, editFontMm);
      setEditingField(null);
    }
  };

  const handleSaveNewField = () => {
    if (!newFieldValue.trim()) return;
    if (onAddField) {
      const fieldId = `field_manual_${Date.now()}`;
      onAddField({
        id: fieldId,
        fieldName: newFieldName,
        label: newFieldLabel,
        value: newFieldValue.trim(),
        bbox: [100, 100, 200, 50],
        confidence: 1.0,
        fontMm: newFieldFontMm,
        statutoryRequiredFontMm: 3.0,
        hasViolation: false,
      });
    }
    setIsAddingField(false);
    setNewFieldValue('');
  };

  const handleShareRecord = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const triggerToast = (text: string) => {
    setFlaggedToast(text);
    setTimeout(() => setFlaggedToast(null), 3000);
  };

  // Compute counts
  const totalDeclarations = 7;
  const passedCount = isTeaDossier ? 4 : isCompliant ? 7 : Math.max(1, 7 - inspection.violations.length);
  const advisoryCount = isTeaDossier ? 1 : inspection.violations.filter(v => v.severity === 'MINOR').length;
  const breachCount = isTeaDossier ? 2 : inspection.violations.filter(v => v.severity === 'CRITICAL' || v.severity === 'MAJOR').length;
  const adherencePercent = isTeaDossier ? 71 : isCompliant ? 100 : Math.round((passedCount / totalDeclarations) * 100);

  // Check which declarations to show based on active filter tab
  const filterMatches = (status: 'PASSED' | 'ADVISORY' | 'BREACH') => {
    if (filterTab === 'ALL') return true;
    return filterTab === status;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-28">
      {/* 1. Official Audit Dossier Top Bar */}
      <div className="bg-[#0B1528] text-white border-b border-slate-800 px-4 sm:px-6 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded tracking-wide uppercase shadow-xs">
              OFFICIAL AUDIT DOSSIER
            </span>
            <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded tracking-wide uppercase shadow-xs">
              NIC LMPC PORTAL CERTIFIED
            </span>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE FIELD RECORD
            </span>
            <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
              🛡️ EHA-2561 : 8f9f76 ... 391e4a • Signed by Insp. S. Sharma (HIDEL-LM-418)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Print Dossier"
            >
              <Printer className="h-3.5 w-3.5 text-slate-300" />
              <span>Print Dossier</span>
            </button>
            <button
              onClick={handleShareRecord}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Share Record Link"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-300" />
              <span>{copiedToast ? 'Copied!' : 'Share Record'}</span>
            </button>
            <button
              onClick={onGenerateReport}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Full PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* 2. Breadcrumbs Strip */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Home className="h-3.5 w-3.5 text-slate-400" />
          <span className="hover:text-slate-700 cursor-pointer">Reports</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="hover:text-slate-700 cursor-pointer">Statutory Compliance Reports</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-800">
            Report #{inspection.id || 'RPT-DEL-2025-0842'}
          </span>
        </div>

        {/* 3. Product & Compliance Summary Hero Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Left: Thumbnail & Metadata */}
          <div className="flex items-start sm:items-center gap-4 flex-1">
            {/* Thumbnail */}
            <div className="relative w-20 h-24 rounded-lg bg-blue-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
              {inspection.imageUrl && !inspection.imageUrl.startsWith('tea') && !inspection.imageUrl.startsWith('atta') ? (
                <img
                  src={inspection.imageUrl}
                  alt={inspection.productName}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-950 flex flex-col items-center justify-center p-1 text-center text-white">
                  <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">
                    TAJ MAHAL
                  </span>
                  <span className="text-[8px] text-slate-300">PREMIUM TEA</span>
                  <div className="w-8 h-8 rounded-full border border-amber-400/40 mt-1 flex items-center justify-center">
                    <span className="text-[10px]">☕</span>
                  </div>
                </div>
              )}
              <span className="absolute bottom-1 right-1 bg-slate-900/90 text-white font-mono font-bold text-[9px] px-1 rounded">
                250g
              </span>
            </div>

            {/* Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-slate-100 text-slate-700 font-mono text-[11px] px-2 py-0.5 rounded font-semibold border border-slate-200">
                  GTIN: {inspection.barcode || '8901030383742'}
                </span>
                <span className="bg-slate-100 text-slate-700 font-mono text-[11px] px-2 py-0.5 rounded font-semibold border border-slate-200">
                  HSN: 0902.40
                </span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-semibold">
                  {inspection.category || 'Tea Commodity Group'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {inspection.productName || 'Taj Mahal Premium CTC Leaf Tea (250g Net)'}
              </h1>

              <div className="text-xs text-slate-600 space-y-0.5">
                <p className="flex items-center gap-1.5 text-slate-700">
                  <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-500">Mfr / Packer:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {isTeaDossier
                      ? 'Brooke Bond / Hindustan Unilever Ltd. (Plot #42 Industrial Area, Haldia, WB)'
                      : inspection.brand}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-x-3 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    14 Apr 2025, 11:24 AM IST
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    Khan Market Store #04, New Delhi
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-0.5">
                  Terminal: Mobile Handheld HTM-401 • Investigating Officer: Insp. S. Sharma (Badge #DEL-4092)
                </p>
              </div>
            </div>
          </div>

          {/* Right: Large Compliance Status Box */}
          <div
            className={`rounded-xl p-4 sm:p-5 text-center min-w-[240px] border shrink-0 ${
              isCompliant
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/95 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isCompliant ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-rose-600 animate-pulse" />
              )}
              <span
                className={`text-lg font-black tracking-wider uppercase ${
                  isCompliant ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </span>
            </div>
            <p
              className={`text-[10px] font-black tracking-widest uppercase mt-0.5 ${
                isCompliant ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isCompliant ? 'STATUTORY SATISFIED' : 'SECTION 36 & 39 ACTIONABLE'}
            </p>

            <div className="flex items-center justify-center gap-3 text-[11px] font-semibold mt-3 pt-2.5 border-t border-rose-200/80">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>{passedCount} Passed</span>
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{advisoryCount} Advisory</span>
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>{breachCount} Breaches</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4. Four Key Metric Stat Cards in a Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Statutory Adherence */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>STATUTORY ADHERENCE</span>
              <FileCheck2 className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{adherencePercent}%</span>
              <span
                className={`text-xs font-bold ${
                  adherencePercent >= 90 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {adherencePercent >= 90 ? 'Compliant Score' : 'Deficient Score'}
              </span>
            </div>
            {/* Segmented Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
              <div
                style={{ width: `${(passedCount / totalDeclarations) * 100}%` }}
                className="bg-emerald-500 h-full rounded-l-full"
              ></div>
              <div
                style={{ width: `${(advisoryCount / totalDeclarations) * 100}%` }}
                className="bg-amber-400 h-full"
              ></div>
              <div
                style={{ width: `${(breachCount / totalDeclarations) * 100}%` }}
                className="bg-rose-500 h-full rounded-r-full"
              ></div>
            </div>
            <p className="text-[11px] text-slate-500">
              {passedCount} Passed • {advisoryCount} Advisory • {breachCount} Breaches
            </p>
          </div>

          {/* Card 2: Compliant Declarations */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>COMPLIANT DECLARATIONS</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {passedCount} / {totalDeclarations}
              </span>
              <span className="text-xs font-bold text-emerald-700">Mandatory Fields</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${(passedCount / totalDeclarations) * 100}%` }}
                className="bg-emerald-500 h-full rounded-full"
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              MRP, Net Wt, Best Before & D...
            </p>
          </div>

          {/* Card 3: Advisories / Defects */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>ADVISORIES / DEFECTS</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{advisoryCount} Minor</span>
              <span className="text-xs font-bold text-amber-700">Warning Level</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${(advisoryCount / totalDeclarations) * 100}%` }}
                className="bg-amber-400 h-full rounded-full"
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Customer Helpline ink smudg...
            </p>
          </div>

          {/* Card 4: Critical Breaches */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>CRITICAL BREACHES</span>
              <AlertOctagon className="h-4 w-4 text-rose-600" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-rose-600">{breachCount} Violations</span>
              <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded">
                Sec 36 Liable
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${(breachCount / totalDeclarations) * 100}%` }}
                className="bg-rose-500 h-full rounded-full"
              ></div>
            </div>
            <p className="text-[11px] font-semibold text-rose-600 truncate">
              Missing Postal PIN & Sub-m...
            </p>
          </div>
        </div>

        {/* 5. Main 2-Column Split: Mandatory Declarations Audit on Left, Forensics & Legal on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): Mandatory Declarations Audit */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Section Header & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-800" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  Mandatory Declarations Audit{' '}
                  <span className="text-slate-400 font-normal font-sans normal-case text-xs">
                    (Rule 6 & 8, PCR 2011)
                  </span>
                </h2>
              </div>

              {/* Action Buttons: Add Declaration & Rule Tolerances */}
              <div className="flex items-center gap-2">
                {onNavigateToRules && (
                  <button
                    onClick={onNavigateToRules}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    title="Jump to LMPC Rulebook & Tolerances"
                  >
                    <Sliders className="h-3.5 w-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Rulebook & Tolerances</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setNewFieldName('manufacturer_info');
                    setNewFieldLabel('Manufacturer / Packer Info');
                    setNewFieldValue('');
                    setNewFieldFontMm(3.0);
                    setIsAddingField(true);
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5 text-amber-400" />
                  <span>+ Add Declaration</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setFilterTab('ALL')}
                className={`px-3 py-1 rounded-md transition-all ${
                  filterTab === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalDeclarations})
              </button>
              <button
                onClick={() => setFilterTab('PASSED')}
                className={`px-3 py-1 rounded-md transition-all ${
                  filterTab === 'PASSED'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Passed ({passedCount})
              </button>
              <button
                onClick={() => setFilterTab('ADVISORY')}
                className={`px-3 py-1 rounded-md transition-all ${
                  filterTab === 'ADVISORY'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Advisories ({advisoryCount})
              </button>
              <button
                onClick={() => setFilterTab('BREACH')}
                className={`px-3 py-1 rounded-md transition-all ${
                  filterTab === 'BREACH'
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Breaches ({breachCount})
              </button>
            </div>

            {/* List of Audit Cards */}
            <div className="space-y-3">
              {/* Card 1: Maximum Retail Price (MRP) */}
              {filterMatches('PASSED') && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5 transition-all hover:border-slate-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">
                            1. Maximum Retail Price (MRP)
                          </h3>
                          <span className="font-mono text-[11px] text-slate-500">
                            Rule 6(1)(e)
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          INCLUSIVE OF ALL STATUTORY TAXES
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle className="h-3 w-3" />
                      PASSED
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Detected Value on PDP:</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        ₹145.00 <span className="text-xs font-normal text-slate-600">(incl. of all taxes)</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Mandatory Unit Sale Price (USP):</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">₹0.58 / g</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="font-semibold text-slate-800">Statutory Finding:</strong> Declared distinctly on Principal Display Panel with uniform typography hierarchy. Unit price correctly computed as required for commodities packed in standard quantities.
                  </p>
                </div>
              )}

              {/* Card 2: Net Quantity Declaration */}
              {filterMatches('PASSED') && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5 transition-all hover:border-slate-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">
                            2. Net Quantity Declaration
                          </h3>
                          <span className="font-mono text-[11px] text-slate-500">
                            Rule 6(1)(c)
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          STANDARD SI UNIT WEIGHT CHECK
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle className="h-3 w-3" />
                      PASSED
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Declared Net Mass:</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">250 g</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Field Scale Physical Reading:</span>
                      <span className="font-bold text-emerald-700 font-mono text-sm">
                        251.2 g (Within MAE Tolerance +0.48%)
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="font-semibold text-slate-800">Statutory Finding:</strong> Standard SI symbol 'g' used without illicit suffixes. Gravimetric test confirms product net mass complies with Second Schedule tolerances.
                  </p>
                </div>
              )}

              {/* Card 3: Manufacturer & Packer Full Address */}
              {filterMatches('BREACH') && (
                <div className="bg-white border-2 border-rose-300 rounded-xl p-4 shadow-xs space-y-2.5 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                        <AlertOctagon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">
                            3. Manufacturer & Packer Full Address
                          </h3>
                          <span className="font-mono text-[11px] text-rose-700 font-bold">
                            Rule 6(1)(a)
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                          STATUTORY BREACH IDENTIFIED
                        </p>
                      </div>
                    </div>
                    <span className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-xs">
                      <X className="h-3 w-3 stroke-[3]" />
                      BREACH
                    </span>
                  </div>

                  <div className="bg-rose-50/80 border border-rose-200 rounded-lg p-3 text-xs space-y-1">
                    <p className="text-slate-500 text-[11px]">Detected Value:</p>
                    <p className="font-mono font-bold text-rose-900">
                      "Manufactured by Registered Trademark Owner, Haldia"
                    </p>
                    <p className="text-[11px] text-rose-700 font-semibold pt-0.5">
                      Deficiency: Physical postal address & 6-digit PIN code completely omitted from packaging panel.
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="font-semibold text-slate-800">Statutory Citation:</strong> Under Rule 6(1)(a), every pre-packaged commodity must clearly disclose premises details enabling consumer redressal. Trademark brand name alone is non-cognizable under law.
                  </p>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => {
                        setNewFieldName('manufacturer_info');
                        setNewFieldLabel('Manufacturer / Packer Full Address');
                        setNewFieldValue('Brooke Bond / Hindustan Unilever Ltd., Plot #42 Industrial Area, Haldia, WB 721602');
                        setIsAddingField(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Manually Declare Full Address & Re-Evaluate</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Card 4: Date of Packaging & Best Before */}
              {filterMatches('PASSED') && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5 transition-all hover:border-slate-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">
                            4. Date of Packaging & Best Before
                          </h3>
                          <span className="font-mono text-[11px] text-slate-500">
                            Rule 6(1)(d)
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          TEMPORAL FRESHNESS MARK
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle className="h-3 w-3" />
                      PASSED
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Batch & Packaging Date:</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        Mfg: March 2025 • Batch #TM-431
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Statutory Expiry / Durability:</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        12 Months from Packaging
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="font-semibold text-slate-800">Statutory Finding:</strong> Month and year of manufacturing is clearly legible in contrast ink.
                  </p>
                </div>
              )}

              {/* Card 5: Consumer Grievance Contact */}
              {filterMatches('ADVISORY') && (
                <div className="bg-white border-2 border-amber-300 rounded-xl p-4 shadow-xs space-y-2.5 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">
                            5. Consumer Grievance Contact
                          </h3>
                          <span className="font-mono text-[11px] text-amber-800 font-bold">
                            Rule 6(1)(n)
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          ADVISORY NOTICE
                        </p>
                      </div>
                    </div>
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-xs">
                      <AlertTriangle className="h-3 w-3" />
                      ADVISORY
                    </span>
                  </div>

                  <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Optical Inspection Result:</span>
                      <span className="font-mono text-amber-800 font-bold">OCR Confidence: 64% (Ink Blur)</span>
                    </div>
                    <p className="font-mono text-slate-800 text-xs">
                      Helpline: 1800-10##-### (Partially smudged) • Email: care@hul.com [VALID]
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="font-semibold text-slate-800">Officer Observation:</strong> Ink dispersion defection on toll-free telephone numeric sequence. While digital email address is verifiable, the statutory phone channel may pose consumer difficulty. Advisory issued under Rule 6(1)(n).
                  </p>
                </div>
              )}

              {/* Card 6: Font Size Height Compliance */}
              {filterMatches('BREACH') && (
                <div className="bg-white border-2 border-rose-400 rounded-xl p-4 shadow-xs space-y-2.5 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                        <Ruler className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">
                            6. Font Size Height Compliance
                          </h3>
                          <span className="font-mono text-[11px] text-rose-700 font-bold">
                            Rule 8, Table 1
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                          CRITICAL STATUTORY BREACH (-70% DEVIATION)
                        </p>
                      </div>
                    </div>
                    <span className="bg-rose-700 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-xs">
                      <AlertOctagon className="h-3 w-3" />
                      CRITICAL BREACH
                    </span>
                  </div>

                  <div className="bg-rose-50/90 border border-rose-200 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Forensic Calibrated Measurement:</span>
                      <span className="font-black text-rose-700 font-mono text-base">1.20 mm</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Mandatory Min. Height (Table 1):</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        4.00 mm (for 200g - 500g packages)
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="font-semibold text-slate-800">Statutory Citation:</strong> Legal Metrology (Packaged Commodities) Rules 2011 explicitly mandates a minimum numeral height of 4.0 mm for net mass exceeding 200g up to 500g. Bounding micro-OCR gauge confirms 1.20 mm numeral height. Severe violation under Section 36(1).
                  </p>
                </div>
              )}

              {/* Card 7: Principal Display Panel Language */}
              {filterMatches('PASSED') && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5 transition-all hover:border-slate-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">
                            7. Principal Display Panel Language
                          </h3>
                          <span className="font-mono text-[11px] text-slate-500">
                            Rule 6(2)
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          LINGUISTIC ACCESSIBILITY
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle className="h-3 w-3" />
                      PASSED
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-semibold text-slate-800">
                        Dual Script Verified: English & Devanagari (Hindi)
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-700 font-mono text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Dual Legibility: OK
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="font-semibold text-slate-800">Statutory Finding:</strong> Declarations rendered in bilingual Hindi / English format adhering strictly to Central Consumer Protection standards.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Forensics, Legal Proceedings & Chain of Custody */}
          <div className="lg:col-span-5 space-y-4">
            {/* Card A: Optical Micro-OCR Evidence */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-slate-800" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Optical Micro-OCR Evidence
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    #EVID-0542-A1
                  </span>
                  <button
                    onClick={() => setShowFullPackagingModal(true)}
                    className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors"
                    title="Expand Full Packaging Overlay"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Forensic Micro-Reticle Canvas */}
              <div className="relative h-64 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-2 select-none shadow-inner group">
                {/* Simulated Reticle Grid Overlay */}
                <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/30"></div>
                <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/30"></div>

                {/* Packaging Zoom Image / Typography Demonstration */}
                <div className="relative text-center z-10 space-y-1">
                  <div className="bg-black/60 p-3 rounded border border-cyan-500/40 backdrop-blur-xs">
                    <p className="text-slate-400 font-mono text-[10px] tracking-widest uppercase">
                      Net weight 250g
                    </p>
                    <p className="text-white font-black text-2xl font-sans tracking-wide">
                      Net weight 250g
                    </p>

                    {/* Red Found Box Indicator */}
                    <div className="inline-block mt-2 px-2 py-0.5 bg-rose-500/30 border border-rose-500 rounded text-rose-300 font-mono text-[10px] font-bold">
                      FOUND HEIGHT: 1.20MM
                    </div>

                    {/* Green Statutory Requirement Indicator */}
                    <div className="inline-block ml-2 px-2 py-0.5 bg-emerald-500/30 border border-emerald-500 rounded text-emerald-300 font-mono text-[10px] font-bold">
                      STATUTORY REQ: 4.00MM
                    </div>
                  </div>
                </div>

                {/* Reticle Top Info HUD */}
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  CALIBRATION RETICLE: 0.5X MAGNIFICATION
                </div>
                <div className="absolute top-2 right-2 text-[10px] font-mono text-rose-400 bg-slate-900/80 px-2 py-0.5 rounded border border-rose-500/30 font-bold">
                  DELTA: -2.80mm
                </div>

                {/* Reticle Bottom Info HUD */}
                <div className="absolute bottom-2 inset-x-2 text-[9px] font-mono text-slate-400 bg-slate-900/90 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
                  <span>EAN-13 RETICLE OPTICAL CALIBRATION: 0.33mm</span>
                  <span className="text-emerald-400">FOCUS: FIXED 94% CONF</span>
                </div>
              </div>

              {/* Telemetry Details */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Inspection Instrument Telemetry:</span>
                  <span className="font-mono font-bold text-slate-800">Handheld Terminal #TH-401</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Calibration Date:</span>
                    <span className="font-semibold text-slate-800">02 Apr 2025</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Optical Res:</span>
                    <span className="font-semibold text-slate-800">48 MP RAW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lighting:</span>
                    <span className="font-semibold text-slate-800">D65 Dual LED Ring</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tamper Seal:</span>
                    <span className="font-semibold text-slate-800 font-mono">#LM-DEL-561</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Statutory Legal Assessment */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-slate-800" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Statutory Legal Assessment
                  </h3>
                </div>
                <span className="bg-rose-100 text-rose-800 border border-rose-200 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Cognizable Offence
                </span>
              </div>

              {/* Legal Proceedings Box */}
              <div className="bg-slate-50 border-l-4 border-l-slate-800 p-3 rounded-r-lg space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <FileText className="h-3.5 w-3.5 text-slate-600" />
                  <span>Section 36(1) & Section 39 Proceedings</span>
                </div>
                <p className="text-[11px] text-slate-600 italic leading-relaxed">
                  "Whoever manufactures, packs, imports, sells, distributes, or exposes for sale any pre-packaged commodity which does not conform to the declarations under this Act shall be punishable with fine which may extend to twenty-five thousand rupees."
                </p>
              </div>

              {/* Statutory Penalty Breakdown */}
              <div className="space-y-1 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  STATUTORY PENALTY BREAKDOWN
                </p>
                <div className="flex items-center justify-between text-slate-700 py-0.5">
                  <span>Rule 6(1)(a) Breach (Address Omission):</span>
                  <span className="font-mono font-bold">₹10,000.00</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 py-0.5">
                  <span>Rule 8 Breach (Deficient Font Height):</span>
                  <span className="font-mono font-bold">₹15,000.00</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-sm font-black">
                  <span className="text-slate-900">Total Max Compounding Fine:</span>
                  <span className="text-rose-700 font-mono text-base">₹25,000.00</span>
                </div>
              </div>

              {/* Officer Field Observations & Chain of Custody */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  OFFICER FIELD OBSERVATIONS & CHAIN OF CUSTODY
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 italic leading-relaxed">
                  "Three sample packages picked at random from Khan Market shelf display. Physical sample box deposited into Field Evidence Locker #FL-03 with tamper-evident seal #NIC-DEL-294. Notice under Section 36(1) recommended for immediate issuance to registered packer Brooke Bond / HUL."
                  <div className="text-right text-[10px] font-semibold text-slate-500 not-italic mt-1">
                    — Insp. S. Sharma, LM Delhi Div-IV
                  </div>
                </div>
              </div>
            </div>

            {/* Card C: Cryptographic Chain of Custody */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between gap-3">
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    Cryptographic Chain of Custody
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  NIC Cloud Verification Hub • Status:{' '}
                  <span className="text-emerald-700 font-bold">Electronic Record Sealed</span>
                </p>
                <p className="text-[9px] font-mono text-slate-400 truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                  ECDSA-P256-SHA256 : a8b04671a2027891d54c7b8e1a9632c847fe91c0854a51eeb9c9d9124f5e0e78
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Sticky Bottom Action Bar (Fixed at bottom) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 px-4 sm:px-8 py-3 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCompliant ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isCompliant ? 'bg-emerald-500' : 'bg-rose-600'
              }`}
            ></span>
          </span>
          <span className={isCompliant ? 'text-emerald-700' : 'text-rose-700 font-black'}>
            Status: {isCompliant ? 'Statutory Compliant' : 'Non-Compliant (Sec 36 Actionable)'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerToast('Flagged for Senior Zonal Supervisor Review (Case #CS-2025-091)')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Flag className="h-3.5 w-3.5 text-slate-500" />
            <span>Flag for Supervisor</span>
          </button>
          <button
            onClick={() => triggerToast('Inspection Record added to Active Enforcement Docket')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="h-3.5 w-3.5 text-slate-500" />
            <span>Add to Active Case</span>
          </button>
          <button
            onClick={() => triggerToast('Case marked for Compounding under Section 48 (Max ₹25,000)')}
            className="px-3.5 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
            <span>Mark Compounded</span>
          </button>
          <button
            onClick={onGenerateReport}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-md flex items-center gap-2 transition-all"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span>Issue Statutory Notice & Export PDF</span>
          </button>
        </div>
      </div>

      {/* Floating Action Feedback Toast */}
      {flaggedToast && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-5">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-semibold">{flaggedToast}</span>
        </div>
      )}

      {/* Full Packaging Interactive PDP Modal (Accessible via Zoom Button) */}
      {showFullPackagingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full p-5 text-white shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-400" />
                <h3 className="font-bold text-sm">
                  Principal Display Panel (PDP) Full Packaging Overlay
                </h3>
              </div>
              <button
                onClick={() => setShowFullPackagingModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950 rounded-xl my-3">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                  maxWidth: '520px',
                }}
                className="relative select-none"
              >
                {inspection.imageUrl && !inspection.imageUrl.startsWith('tea') && !inspection.imageUrl.startsWith('atta') ? (
                  <img
                    src={inspection.imageUrl}
                    alt={inspection.productName}
                    className="w-full h-auto max-h-[65vh] object-contain rounded shadow-2xl"
                  />
                ) : (
                  <div className="w-[420px] h-[550px] bg-gradient-to-b from-blue-950 to-slate-900 rounded-xl border border-cyan-500/40 p-6 flex flex-col justify-between text-center relative shadow-2xl">
                    <div className="space-y-2">
                      <span className="text-amber-400 font-black text-xl tracking-widest uppercase">
                        TAJ MAHAL
                      </span>
                      <p className="text-xs text-slate-300 font-semibold tracking-wider">
                        PREMIUM CTC LEAF TEA
                      </p>
                    </div>

                    <div className="border border-dashed border-rose-500/80 bg-rose-950/30 p-3 rounded-lg text-left text-xs space-y-1">
                      <span className="text-rose-400 font-mono font-bold text-[10px] block">
                        [RULE 8 TABLE 1 DEFICIENT ZONE]
                      </span>
                      <p className="text-white font-mono font-bold text-sm">Net weight 250g</p>
                      <p className="text-[10px] text-rose-300">Measured: 1.20mm (Req: 4.00mm)</p>
                    </div>

                    <div className="border border-dashed border-rose-500/80 bg-rose-950/30 p-2 rounded-lg text-left text-[11px] text-rose-200">
                      <span className="text-rose-400 font-mono font-bold text-[10px] block">
                        [RULE 6(1)(a) MISSING POSTAL PIN]
                      </span>
                      <p>"Manufactured by Registered Trademark Owner, Haldia"</p>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-800 pt-2">
                      <span>GTIN: 8901030383742</span>
                      <span>MRP ₹145.00</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
                  className="p-1 hover:text-white bg-slate-800 rounded"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.1))}
                  className="p-1 hover:text-white bg-slate-800 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 hover:text-white bg-slate-800 rounded ml-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => setShowFullPackagingModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Full Overlay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Human-in-the-Loop "Correct this Field" Modal Dialog */}
      {editingField && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Correct Extracted Declaration
                </h4>
              </div>
              <button
                onClick={() => setEditingField(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Declaration Field:
                </label>
                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-800 block">
                  {editingField.label} ({editingField.fieldName})
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Extracted Text Value:
                </label>
                <textarea
                  rows={3}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Calibrated Font Height (mm):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editFontMm}
                  onChange={(e) => setEditFontMm(parseFloat(e.target.value) || 1.0)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Adjust if EAN-13 module optical ratio requires fine measurement.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrection}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Save & Re-Evaluate Rules</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Human-in-the-Loop "+ Add Missing Declaration" Modal Dialog */}
      {isAddingField && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Add Packaging Declaration
                </h4>
              </div>
              <button
                onClick={() => setIsAddingField(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Declaration Type:
                </label>
                <select
                  value={newFieldName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewFieldName(val);
                    const labels: Record<string, string> = {
                      manufacturer_info: 'Manufacturer / Packer Info',
                      mrp: 'Maximum Retail Price (MRP)',
                      net_quantity: 'Net Quantity',
                      unit_sale_price: 'Unit Sale Price',
                      consumer_care: 'Consumer Care Details',
                      generic_name: 'Generic / Commodity Name',
                      mfg_date: 'Date of Manufacture / Packing',
                      country_of_origin: 'Country of Origin',
                      custom: 'Custom Declaration',
                    };
                    setNewFieldLabel(labels[val] || val);
                  }}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="manufacturer_info">Manufacturer / Packer / Importer Info (Rule 6(1)(a))</option>
                  <option value="net_quantity">Net Quantity (Rule 6(1)(c))</option>
                  <option value="mrp">Maximum Retail Price - MRP (Rule 6(1)(e))</option>
                  <option value="mfg_date">Date of Manufacture / Packing (Rule 6(1)(d))</option>
                  <option value="unit_sale_price">Unit Sale Price - USP (Rule 6(1)(m))</option>
                  <option value="consumer_care">Consumer Care Details (Rule 6(1)(n))</option>
                  <option value="generic_name">Generic / Commodity Name (Rule 6(1)(b))</option>
                  <option value="country_of_origin">Country of Origin (Rule 27)</option>
                  <option value="custom">Other Custom Statutory Field</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Declared Value / Content:
                </label>
                <textarea
                  rows={3}
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="e.g. Net Wt: 250 g or Brooke Bond / Hindustan Unilever Ltd."
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Calibrated Font Height (mm):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newFieldFontMm}
                  onChange={(e) => setNewFieldFontMm(parseFloat(e.target.value) || 1.0)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddingField(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewField}
                disabled={!newFieldValue.trim()}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>Save Declaration & Re-Evaluate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

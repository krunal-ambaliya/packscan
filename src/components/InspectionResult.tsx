import React, { useState } from 'react';
import { ExtractedField, InspectionRecord, Severity, Violation } from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  FileCheck2,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
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
  Camera,
  CheckCircle,
  HelpCircle,
  Hash,
} from 'lucide-react';

interface InspectionResultProps {
  inspection: InspectionRecord;
  onUpdateField: (fieldId: string, newValue: string, newFontMm?: number) => void;
  onGenerateReport: () => void;
  onNavigateToRules?: () => void;
  onAddField?: (newField: ExtractedField) => void;
  onCertifyCrimp?: (violationId: string) => void;
}

interface StatutoryCheckItem {
  id: string;
  ruleClause: string;
  title: string;
  subtitle: string;
  fieldKey: string;
  alternativeKeys?: string[];
  severityDefault: Severity;
  statutoryExpected: string;
}

const STATUTORY_CHECKLIST: StatutoryCheckItem[] = [
  {
    id: 'check-mrp',
    ruleClause: 'Rule 6(1)(e)',
    title: '1. Maximum Retail Price (MRP)',
    subtitle: 'INCLUSIVE OF ALL STATUTORY TAXES',
    fieldKey: 'mrp',
    alternativeKeys: ['mrp_full_text', 'price'],
    severityDefault: 'CRITICAL',
    statutoryExpected: 'Prominent monetary value prefixed with MRP Rs. or ₹ (incl. of all taxes)',
  },
  {
    id: 'check-net-qty',
    ruleClause: 'Rule 6(1)(c)',
    title: '2. Net Quantity Declaration',
    subtitle: 'STANDARD SI UNIT WEIGHT CHECK',
    fieldKey: 'net_quantity',
    alternativeKeys: ['weight', 'quantity', 'net_weight'],
    severityDefault: 'CRITICAL',
    statutoryExpected: 'Standard SI metric symbols (e.g. g, kg, ml, l) without illicit colloquial suffixes',
  },
  {
    id: 'check-mfr',
    ruleClause: 'Rule 6(1)(a)',
    title: '3. Manufacturer & Packer Full Address',
    subtitle: 'PREMISES & JURISDICTION IDENTIFIER',
    fieldKey: 'manufacturer_info',
    alternativeKeys: ['packer_info', 'mfr_address', 'manufacturer'],
    severityDefault: 'CRITICAL',
    statutoryExpected: 'Full physical premises address with city, state, and 6-digit postal PIN code',
  },
  {
    id: 'check-date',
    ruleClause: 'Rule 6(1)(d)',
    title: '4. Date of Packaging & Best Before',
    subtitle: 'TEMPORAL FRESHNESS & LOT MARK',
    fieldKey: 'mfg_date',
    alternativeKeys: ['manufacturing_date', 'date_declaration_template', 'best_before', 'pkg_date'],
    severityDefault: 'MAJOR',
    statutoryExpected: 'Month and year of manufacture/packing in contrast ink (MM/YYYY or DD/MM/YYYY)',
  },
  {
    id: 'check-usp',
    ruleClause: 'Rule 6(1)(m)',
    title: '5. Unit Sale Price (USP)',
    subtitle: 'STANDARDIZED CONSUMER METRIC PRICE',
    fieldKey: 'unit_sale_price',
    alternativeKeys: ['usp'],
    severityDefault: 'MAJOR',
    statutoryExpected: 'Price per gram/kilogram/milliliter/liter as mandated under Rule 6(1)(m)',
  },
  {
    id: 'check-care',
    ruleClause: 'Rule 6(1)(n)',
    title: '6. Consumer Grievance Contact',
    subtitle: 'REDRESSAL HELPLINE & EMAIL MANDATE',
    fieldKey: 'consumer_care',
    alternativeKeys: ['customer_care', 'grievance_cell', 'helpline'],
    severityDefault: 'MAJOR',
    statutoryExpected: 'Valid telephone/toll-free number and grievance email ID for consumer contact',
  },
  {
    id: 'check-font',
    ruleClause: 'Rule 8, Table 1',
    title: '7. Font Size Height Compliance',
    subtitle: 'OPTICAL METROLOGY (NUMERAL & LETTER HEIGHT)',
    fieldKey: 'font_size',
    alternativeKeys: ['font_height', 'numeral_height'],
    severityDefault: 'CRITICAL',
    statutoryExpected: 'Minimum numeral height based on pack weight tier per Table 1 standards',
  },
  {
    id: 'check-commodity',
    ruleClause: 'Rule 6(1)(b)',
    title: '8. Generic or Common Commodity Name',
    subtitle: 'CONSPICUOUS COMMODITY IDENTIFIER',
    fieldKey: 'commodity_name',
    alternativeKeys: ['generic_name', 'product_name'],
    severityDefault: 'MAJOR',
    statutoryExpected: 'Common or generic name of commodity conspicuously declared on packaging',
  },
];

export const InspectionResult: React.FC<InspectionResultProps> = ({
  inspection,
  onUpdateField,
  onGenerateReport,
  onNavigateToRules,
  onAddField,
  onCertifyCrimp,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'PASSED' | 'ADVISORY' | 'BREACH'>('ALL');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
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

  // Compute fine per violation based on statutory schedule
  const getViolationFine = (ruleClause: string, severity: Severity): number => {
    if (ruleClause.includes('6(1)(e)')) return 20000; // MRP
    if (ruleClause.includes('6(1)(a)')) return 10000; // Address
    if (ruleClause.includes('Rule 8')) return 15000;   // Font size
    if (ruleClause.includes('6(1)(c)')) return 10000; // Net quantity
    if (ruleClause.includes('6(1)(d)')) return 5000;  // Mfg Date
    if (ruleClause.includes('6(1)(n)') || ruleClause.includes('6(1)(f)')) return 5000; // Care
    if (severity === 'CRITICAL') return 15000;
    if (severity === 'MAJOR') return 7500;
    return 2000;
  };

  const totalCompoundingFine = inspection.violations.reduce(
    (sum, v) => sum + getViolationFine(v.ruleClause, v.severity),
    0
  );

  // Helper to find extracted field from inspection
  const findExtractedField = (fieldKey: string, altKeys: string[] = []): ExtractedField | undefined => {
    const allKeys = [fieldKey, ...altKeys];
    return inspection.extractedFields.find((f) =>
      allKeys.some((k) => f.fieldName.toLowerCase() === k.toLowerCase())
    );
  };

  // Helper to find violation for a field
  const findFieldViolation = (fieldKey: string, ruleClause: string, altKeys: string[] = []): Violation | undefined => {
    const allKeys = [fieldKey, ...altKeys];
    return inspection.violations.find((v) => {
      const matchField = allKeys.some((k) => v.field.toLowerCase() === k.toLowerCase());
      const matchClause = v.ruleClause.toLowerCase().includes(ruleClause.toLowerCase().split(',')[0].trim());
      return matchField || matchClause;
    });
  };

  // Build real dynamic checklist items
  const auditItems = STATUTORY_CHECKLIST.map((spec) => {
    const field = findExtractedField(spec.fieldKey, spec.alternativeKeys);
    const violation = findFieldViolation(spec.fieldKey, spec.ruleClause, spec.alternativeKeys);

    let status: 'PASSED' | 'ADVISORY' | 'BREACH' | 'CRITICAL BREACH' = 'PASSED';
    if (violation) {
      if (violation.severity === 'CRITICAL') status = 'CRITICAL BREACH';
      else if (violation.severity === 'MAJOR') status = 'BREACH';
      else status = 'ADVISORY';
    } else if (!field || field.value.includes('ABSENT') || field.value.includes('NOT DETECTED')) {
      status = spec.severityDefault === 'CRITICAL' ? 'CRITICAL BREACH' : 'BREACH';
    }

    return {
      spec,
      field,
      violation,
      status,
    };
  });

  // Calculate dynamic stats
  const totalChecked = auditItems.length;
  const passedItems = auditItems.filter((i) => i.status === 'PASSED');
  const advisoryItems = auditItems.filter((i) => i.status === 'ADVISORY');
  const breachItems = auditItems.filter((i) => i.status === 'BREACH' || i.status === 'CRITICAL BREACH');

  const passedCount = passedItems.length;
  const advisoryCount = advisoryItems.length;
  const breachCount = breachItems.length;
  const adherencePercent = totalChecked > 0 ? Math.round((passedCount / totalChecked) * 100) : 100;

  // Selected field for bounding box & reticle focus
  const highlightedField =
    inspection.extractedFields.find((f) => f.id === selectedFieldId) ||
    inspection.extractedFields[0];

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
        bbox: [80, 100, 300, 45],
        confidence: 1.0,
        fontMm: newFieldFontMm,
        statutoryRequiredFontMm: 2.5,
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

  // Format date helper
  const formattedScannedAt = inspection.scannedAt
    ? new Date(inspection.scannedAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Live Field Audit';

  // Net mass pill text
  const netQuantityValue =
    findExtractedField('net_quantity')?.value ||
    inspection.extractedFields.find((f) => f.fieldName.includes('quantity'))?.value ||
    'Pack';

  // Filter cards to display
  const filteredAuditItems = auditItems.filter((item) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'PASSED') return item.status === 'PASSED';
    if (filterTab === 'ADVISORY') return item.status === 'ADVISORY';
    if (filterTab === 'BREACH') return item.status === 'BREACH' || item.status === 'CRITICAL BREACH';
    return true;
  });

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
              🛡️ {inspection.id.slice(0, 8)}...{inspection.id.slice(-6)} • Signed by {inspection.officerEmail || 'Insp. S. Sharma'}
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
            Report #{inspection.id}
          </span>
        </div>

        {/* 3. Product & Compliance Summary Hero Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Left: Thumbnail & Real Metadata */}
          <div className="flex items-start sm:items-center gap-4 flex-1">
            {/* Thumbnail showing real uploaded image */}
            <div className="relative w-20 h-24 rounded-lg bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
              {inspection.imageUrl ? (
                <img
                  src={inspection.imageUrl}
                  alt={inspection.productName}
                  className="w-full h-full object-contain p-0.5 bg-slate-950"
                  onError={(e) => {
                    // Fallback visual if direct image link is broken
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className="absolute bottom-1 right-1 bg-slate-900/90 text-white font-mono font-bold text-[9px] px-1 rounded shadow">
                {netQuantityValue}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-slate-100 text-slate-700 font-mono text-[11px] px-2 py-0.5 rounded font-semibold border border-slate-200">
                  GTIN: {inspection.barcode || 'Not Specified'}
                </span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-semibold">
                  {inspection.category || 'Packaged Commodity'}
                </span>
                <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[11px] px-2 py-0.5 rounded font-semibold">
                  Jurisdiction: {inspection.state || 'Delhi NCR'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {inspection.productName || 'Audited Packaged Commodity'}
              </h1>

              <div className="text-xs text-slate-600 space-y-0.5">
                <p className="flex items-center gap-1.5 text-slate-700">
                  <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-500">Mfr / Packer:</span>{' '}
                  <span className="font-semibold text-slate-800 break-words">
                    {findExtractedField('manufacturer_info')?.value || inspection.brand || 'Declared on package'}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-x-3 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {formattedScannedAt}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {inspection.state} State Enforcement Div
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-0.5">
                  Inspection Terminal: Optical Metrology Scanner • Investigating Officer: {inspection.officerEmail || 'Enforcement Inspector'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Real Compliance Status Box */}
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
                {inspection.complianceStatus}
              </span>
            </div>
            <p
              className={`text-[10px] font-black tracking-widest uppercase mt-0.5 ${
                isCompliant ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isCompliant ? 'STATUTORY CONFORMITY' : 'SECTION 36 & 39 ACTIONABLE'}
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
                  adherencePercent >= 85 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {adherencePercent >= 85 ? 'Compliant Score' : 'Deficient Score'}
              </span>
            </div>
            {/* Segmented Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
              <div
                style={{ width: `${(passedCount / Math.max(1, totalChecked)) * 100}%` }}
                className="bg-emerald-500 h-full rounded-l-full"
              ></div>
              <div
                style={{ width: `${(advisoryCount / Math.max(1, totalChecked)) * 100}%` }}
                className="bg-amber-400 h-full"
              ></div>
              <div
                style={{ width: `${(breachCount / Math.max(1, totalChecked)) * 100}%` }}
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
                {passedCount} / {totalChecked}
              </span>
              <span className="text-xs font-bold text-emerald-700">Mandatory Fields</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${(passedCount / Math.max(1, totalChecked)) * 100}%` }}
                className="bg-emerald-500 h-full rounded-full"
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {passedItems.slice(0, 3).map((p) => p.spec.fieldKey).join(', ') || 'No passed fields yet'}
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
                style={{ width: `${(advisoryCount / Math.max(1, totalChecked)) * 100}%` }}
                className="bg-amber-400 h-full rounded-full"
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {advisoryCount > 0
                ? inspection.violations.filter((v) => v.severity === 'MINOR')[0]?.message || 'Minor advisory'
                : 'Zero minor advisories'}
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
                {breachCount > 0 ? 'Sec 36 Liable' : 'Compliant'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${(breachCount / Math.max(1, totalChecked)) * 100}%` }}
                className="bg-rose-500 h-full rounded-full"
              ></div>
            </div>
            <p className="text-[11px] font-semibold text-rose-600 truncate">
              {breachCount > 0
                ? inspection.violations.map((v) => v.ruleClause).join(', ')
                : 'Zero critical deficits'}
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
                All ({totalChecked})
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

            {/* Dynamic List of Audit Cards */}
            <div className="space-y-3">
              {filteredAuditItems.map(({ spec, field, violation, status }) => {
                const isViolation = status === 'BREACH' || status === 'CRITICAL BREACH';
                const isAdvisory = status === 'ADVISORY';
                const isPassed = status === 'PASSED';

                return (
                  <div
                    key={spec.id}
                    className={`bg-white border rounded-xl p-4 shadow-xs space-y-2.5 transition-all ${
                      isViolation
                        ? 'border-rose-300 ring-1 ring-rose-100'
                        : isAdvisory
                        ? 'border-amber-300 ring-1 ring-amber-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-700'
                              : isAdvisory
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isPassed ? (
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          ) : isAdvisory ? (
                            <AlertTriangle className="h-3.5 w-3.5" />
                          ) : (
                            <AlertOctagon className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs sm:text-sm font-black text-slate-900">
                              {spec.title}
                            </h3>
                            <span
                              className={`font-mono text-[11px] font-bold ${
                                isViolation ? 'text-rose-700' : isAdvisory ? 'text-amber-800' : 'text-slate-500'
                              }`}
                            >
                              {violation?.ruleClause || spec.ruleClause}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isViolation ? 'text-rose-600' : isAdvisory ? 'text-amber-700' : 'text-slate-400'
                            }`}
                          >
                            {spec.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 shadow-xs ${
                          status === 'CRITICAL BREACH'
                            ? 'bg-rose-700 text-white'
                            : status === 'BREACH'
                            ? 'bg-rose-600 text-white'
                            : status === 'ADVISORY'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        }`}
                      >
                        {isPassed ? <CheckCircle className="h-3 w-3" /> : <X className="h-3 w-3 stroke-[3]" />}
                        {status}
                      </span>
                    </div>

                    {/* Data Panel Box */}
                    <div
                      className={`rounded-lg p-3 text-xs space-y-1 ${
                        isViolation
                          ? 'bg-rose-50/80 border border-rose-200'
                          : isAdvisory
                          ? 'bg-amber-50/80 border border-amber-200'
                          : 'bg-slate-50 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-slate-500 block text-[11px]">
                            {isViolation ? 'Detection / Value:' : 'Detected Value on PDP:'}
                          </span>
                          <span className="font-bold text-slate-900 font-mono text-sm break-words">
                            {field?.value || violation?.actual || 'Absent on packaging surface'}
                          </span>
                        </div>
                        {field?.fontMm && (
                          <div className="text-right shrink-0">
                            <span className="text-slate-500 block text-[11px]">Calibrated Height:</span>
                            <span className="font-bold font-mono text-xs bg-black/10 px-2 py-0.5 rounded">
                              {field.fontMm} mm {field.confidence ? `(${Math.round(field.confidence * 100)}% conf)` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {violation?.message && (
                        <p className="text-[11px] font-semibold text-rose-700 pt-1 border-t border-rose-200/60">
                          Deficiency: {violation.message}
                        </p>
                      )}
                    </div>

                    {/* Statutory Finding / Citation */}
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong className="font-semibold text-slate-800">
                        {isViolation ? 'Statutory Citation:' : 'Statutory Finding:'}
                      </strong>{' '}
                      {violation?.expected || spec.statutoryExpected}
                    </p>

                    {/* Quick Officer Corrections */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      {field && (
                        <button
                          onClick={() => handleOpenEditModal(field)}
                          className="px-2 py-1 text-[10px] font-semibold text-slate-600 hover:text-amber-700 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded flex items-center gap-1 transition-colors"
                          title="Correct OCR value"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Correct OCR Reading</span>
                        </button>
                      )}

                      {/* Certify Crimp for Date */}
                      {(spec.fieldKey.includes('date') || violation?.ruleClause.includes('6(1)(d)')) && isViolation && onCertifyCrimp && (
                        <button
                          onClick={() => onCertifyCrimp(violation?.id || 'mfg_crimp')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1 shadow-xs"
                          title="Verify if date is thermally stamped on pouch seal"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Certify on Crimp / Seal</span>
                        </button>
                      )}

                      {/* Manually Declare Field if missing */}
                      {!field && (
                        <button
                          onClick={() => {
                            setNewFieldName(spec.fieldKey);
                            setNewFieldLabel(spec.title);
                            setNewFieldValue('');
                            setIsAddingField(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Manually Declare</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
                    #EVID-{inspection.id.slice(0, 6).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Real Packaging Interactive Micro-Reticle Canvas */}
              <div className="relative min-h-[280px] bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-2 select-none shadow-inner group">
                {/* Real Packaging Image */}
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                    width: '100%',
                    maxWidth: '420px',
                  }}
                  className="relative select-none flex items-center justify-center"
                >
                  {inspection.imageUrl ? (
                    <img
                      src={inspection.imageUrl}
                      alt="Scanned Packaging"
                      className="w-full h-auto max-h-[240px] object-contain rounded shadow-2xl"
                    />
                  ) : (
                    <div className="text-slate-500 text-xs py-10">No image available</div>
                  )}

                  {/* Bounding Boxes Layer */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {inspection.extractedFields.map((field) => {
                      const isSelected = selectedFieldId === field.id || highlightedField?.id === field.id;
                      const hasV = field.hasViolation || inspection.violations.some((v) => v.field === field.fieldName);
                      const boxColor = hasV ? '#ef4444' : '#10b981';

                      // Scale bounding box coordinates to percentage
                      const leftPct = (field.bbox[0] / 800) * 100;
                      const topPct = (field.bbox[1] / 1050) * 100;
                      const widthPct = (field.bbox[2] / 800) * 100;
                      const heightPct = (field.bbox[3] / 1050) * 100;

                      return (
                        <div
                          key={field.id}
                          style={{
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            width: `${widthPct}%`,
                            height: `${heightPct}%`,
                            borderColor: boxColor,
                            backgroundColor: isSelected
                              ? hasV
                                ? 'rgba(239, 68, 68, 0.25)'
                                : 'rgba(16, 185, 129, 0.25)'
                              : 'transparent',
                          }}
                          className={`absolute border-2 transition-all pointer-events-auto cursor-pointer rounded-xs ${
                            isSelected ? 'ring-2 ring-white shadow-lg' : ''
                          }`}
                          onClick={() => setSelectedFieldId(field.id)}
                          title={`${field.label}: ${field.value}`}
                        >
                          {isSelected && (
                            <div
                              style={{ backgroundColor: boxColor }}
                              className="absolute -top-5 left-0 text-[9px] font-bold text-white px-1.5 py-0.2 rounded shadow whitespace-nowrap"
                            >
                              {field.label} ({field.fontMm || 3.0}mm)
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reticle Top Info HUD */}
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400 bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/30">
                  CALIBRATION RETICLE: {zoomLevel.toFixed(1)}X MAGNIFICATION
                </div>
                {highlightedField?.fontMm && (
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-emerald-400 bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                    FOUND HEIGHT: {highlightedField.fontMm}mm
                  </div>
                )}

                {/* Reticle Bottom Info HUD */}
                <div className="absolute bottom-2 inset-x-2 text-[9px] font-mono text-slate-400 bg-slate-900/90 px-2 py-1 rounded border border-slate-800 flex items-center justify-between">
                  <span>EAN-13 RETICLE OPTICAL CALIBRATION: 0.33mm</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                      className="p-0.5 hover:text-white"
                      title="Zoom Out"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span>{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.2))}
                      className="p-0.5 hover:text-white"
                      title="Zoom In"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="p-0.5 hover:text-white ml-1"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Telemetry Details */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Inspection Instrument Telemetry:</span>
                  <span className="font-mono font-bold text-slate-800">Station #DOCA-AI-NODE</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Calibration Date:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(inspection.scannedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Processing Latency:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {inspection.metrics.processingTimeMs || 1250} ms
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jurisdiction:</span>
                    <span className="font-semibold text-slate-800">{inspection.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tamper Seal:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      #LM-{inspection.id.slice(0, 5).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: Real Statutory Legal Assessment */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-slate-800" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Statutory Legal Assessment
                  </h3>
                </div>
                <span
                  className={`font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    isCompliant
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {isCompliant ? 'Statutory Conformity' : 'Cognizable Offence'}
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

              {/* Real Statutory Penalty Breakdown */}
              <div className="space-y-1 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  STATUTORY PENALTY BREAKDOWN
                </p>
                {inspection.violations.length === 0 ? (
                  <div className="py-2 text-center text-emerald-800 font-semibold bg-emerald-50 rounded border border-emerald-200">
                    Zero deficits detected. No statutory compounding penalty applicable.
                  </div>
                ) : (
                  <>
                    {inspection.violations.map((v) => (
                      <div key={v.id} className="flex items-center justify-between text-slate-700 py-0.5">
                        <span className="truncate max-w-[240px]">
                          {v.ruleClause} ({v.field.replace(/_/g, ' ')}):
                        </span>
                        <span className="font-mono font-bold">
                          ₹{getViolationFine(v.ruleClause, v.severity).toLocaleString('en-IN')}.00
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-sm font-black">
                      <span className="text-slate-900">Total Compounding Fine:</span>
                      <span className="text-rose-700 font-mono text-base">
                        ₹{totalCompoundingFine.toLocaleString('en-IN')}.00
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Real Officer Field Observations */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  OFFICER FIELD OBSERVATIONS & CHAIN OF CUSTODY
                </p>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 italic leading-relaxed">
                  "{inspection.productName} ({inspection.brand || 'Audited Commodity'}) audited under LMPC Rules 2011 in {inspection.state} jurisdiction. {inspection.violations.length > 0 ? `Total ${inspection.violations.length} statutory deficits recorded. Notice under Section 36(1) recommended for issuance.` : 'Packaging verified compliant with statutory requirements.'}"
                  <div className="text-right text-[10px] font-semibold text-slate-500 not-italic mt-1">
                    — {inspection.officerEmail || 'Enforcement Inspector'}, DoCA {inspection.state}
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
                  ECDSA-SHA256 : {inspection.id.replace(/-/g, '')}a8b04671a2027891d54c7b8e1a9632c847fe91c08
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
          <span className={isCompliant ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
            Status: {isCompliant ? 'Statutory Compliant (All Declarations OK)' : `Non-Compliant (${inspection.violations.length} Actionable Deficits)`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerToast(`Flagged for Senior Zonal Supervisor Review (Case #${inspection.id.slice(0, 8)})`)}
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
            onClick={() => triggerToast(`Case marked for Compounding under Section 48 (Fine: ₹${totalCompoundingFine.toLocaleString('en-IN')})`)}
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
          <span className="font-semibold">{flaggedToast}</span>
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
                  placeholder="e.g. Net Wt: 50 g or Balaji Wafers Pvt Ltd, Rajkot"
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

import React, { useState, useRef } from 'react';
import { ExtractedField, InspectionRecord, Severity, Violation } from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  FileCheck2,
  FileDown,
  Info,
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
} from 'lucide-react';

interface InspectionResultProps {
  inspection: InspectionRecord;
  onUpdateField: (fieldId: string, newValue: string, newFontMm?: number) => void;
  onGenerateReport: () => void;
}

export const InspectionResult: React.FC<InspectionResultProps> = ({
  inspection,
  onUpdateField,
  onGenerateReport,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [bboxFilter, setBboxFilter] = useState<'ALL' | 'VIOLATIONS' | 'NONE'>('ALL');
  const [editingField, setEditingField] = useState<ExtractedField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editFontMm, setEditFontMm] = useState<number>(3.0);

  const isCompliant = inspection.complianceStatus === 'COMPLIANT';

  // Severity color maps
  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'MAJOR':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MINOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getBBoxColor = (field: ExtractedField) => {
    if (field.hasViolation) return '#ef4444'; // red
    return '#10b981'; // emerald
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Status Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
              isCompliant ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {isCompliant ? <CheckCircle2 className="h-7 w-7" /> : <AlertOctagon className="h-7 w-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {inspection.id}
              </span>
              <span
                className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isCompliant
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                }`}
              >
                {inspection.complianceStatus}
              </span>
              <span className="text-xs text-slate-400">| Jurisdiction: {inspection.state}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {inspection.productName}
            </h2>
            <p className="text-xs text-slate-500">
              {inspection.brand} • {inspection.category} • Barcode:{' '}
              <span className="font-mono font-bold text-slate-700">{inspection.barcode}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onGenerateReport}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
          >
            <FileCheck2 className="h-4 w-4 text-amber-400" />
            <span>Generate Form VI Statutory Notice</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas on Left, Structured Audit on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Annotated Packaging Canvas View (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col shadow-lg">
          {/* Canvas Controls Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-amber-400" />
                Principal Display Panel (PDP) Overlay
              </span>
              <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                EAN-13 Calibrated (0.33mm)
              </span>
            </div>

            {/* Filter Pill */}
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-[11px]">
              {(['ALL', 'VIOLATIONS', 'NONE'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBboxFilter(mode)}
                  className={`px-2 py-0.5 rounded font-medium transition-all ${
                    bboxFilter === mode
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'ALL' ? 'All Declarations' : mode === 'VIOLATIONS' ? 'Violations' : 'Hide'}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                className="p-1 hover:text-white hover:bg-slate-800 rounded"
                title="Zoom Out"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1 text-slate-300 font-semibold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                className="p-1 hover:text-white hover:bg-slate-800 rounded"
                title="Zoom In"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:text-white hover:bg-slate-800 rounded ml-1"
                title="Reset Zoom"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Interactive Packaging Canvas Container */}
          <div className="relative flex-1 min-h-[480px] bg-slate-950 rounded-xl overflow-auto p-4 flex items-center justify-center my-3 border border-slate-800/80">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease-out',
                width: '100%',
                maxWidth: '560px',
              }}
              className="relative select-none"
            >
              {/* Simulated Packaging Graphic Container */}
              <div className="w-full aspect-[3/4] bg-gradient-to-b from-amber-50 via-white to-amber-100/40 rounded-2xl border-4 border-amber-900/40 shadow-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                {/* Background Package Aesthetics */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700"></div>
                <div className="absolute right-3 top-6 opacity-10 font-black text-6xl text-slate-900 pointer-events-none">
                  FMCG
                </div>

                {/* Simulated Visual Retail Elements */}
                <div className="space-y-4 relative z-0">
                  {/* Brand & Product Header */}
                  <div className="border-b border-amber-300/60 pb-3">
                    <span className="text-[10px] uppercase tracking-widest font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                      {inspection.brand}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                      {inspection.productName}
                    </h3>
                  </div>

                  {/* Body Content Area */}
                  <div className="grid grid-cols-2 gap-3 text-slate-800 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Net Content
                      </span>
                      <span className="text-base font-black text-slate-900">
                        {inspection.extractedFields.find((f) => f.fieldName === 'net_quantity')?.value || '500 g'}
                      </span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Retail Price
                      </span>
                      <span className="text-base font-black text-slate-900">
                        {inspection.extractedFields.find((f) => f.fieldName === 'mrp')?.value || 'MRP Absent'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/90 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                    <p className="font-semibold text-slate-900">
                      {inspection.extractedFields.find((f) => f.fieldName === 'manufacturer_info')?.value ||
                        'Manufacturer declaration'}
                    </p>
                    <p className="text-slate-500">
                      Consumer Care: {inspection.extractedFields.find((f) => f.fieldName === 'consumer_care')?.value || 'Helpline Absent'}
                    </p>
                  </div>
                </div>

                {/* Footer Barcode Area */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 relative z-0">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-slate-800">
                      EAN-13: {inspection.barcode}
                    </span>
                    <p>Optical Target: 0.33mm standard module</p>
                  </div>
                  {/* Visual Barcode Graphic */}
                  <div className="flex items-center gap-[2px] h-9 bg-white p-1 rounded border border-slate-300">
                    {[4, 2, 6, 1, 3, 5, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 5, 2, 1, 4].map((w, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${w}px` }}
                        className="h-full bg-slate-900"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* SVG Bounding Boxes Overlay Layer */}
                {bboxFilter !== 'NONE' && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {inspection.extractedFields.map((field) => {
                      if (bboxFilter === 'VIOLATIONS' && !field.hasViolation) return null;

                      const isHovered = hoveredFieldId === field.id || selectedFieldId === field.id;
                      const boxColor = getBBoxColor(field);

                      // Convert mock pixel offsets to % placement within 800x1050 canonical frame
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
                            backgroundColor: isHovered
                              ? field.hasViolation
                                ? 'rgba(239, 68, 68, 0.25)'
                                : 'rgba(16, 185, 129, 0.25)'
                              : 'transparent',
                          }}
                          className={`absolute border-2 transition-all pointer-events-auto cursor-pointer rounded-sm ${
                            isHovered ? 'ring-2 ring-white shadow-lg' : ''
                          }`}
                          onClick={() => setSelectedFieldId(field.id)}
                          onMouseEnter={() => setHoveredFieldId(field.id)}
                          onMouseLeave={() => setHoveredFieldId(null)}
                        >
                          {/* Tag Label on Top */}
                          <div
                            style={{ backgroundColor: boxColor }}
                            className="absolute -top-5 left-0 text-[10px] font-bold text-white px-1.5 py-0.2 rounded shadow whitespace-nowrap flex items-center gap-1"
                          >
                            <span>{field.label}</span>
                            {field.fontMm && (
                              <span className="font-mono text-[9px] bg-black/30 px-1 rounded">
                                {field.fontMm}mm
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Canvas Footer Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                <span>Statutory Compliant</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                <span>Deficit / Violation Flagged</span>
              </span>
            </div>
            <span className="text-slate-500">Click any box to inspect & correct</span>
          </div>
        </div>

        {/* Right: Statutory Audit Side Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Statutory Violations Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span>Statutory Violations ({inspection.violations.length})</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Audited against LMPC Rules 2011
              </span>
            </div>

            {inspection.violations.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">100% LMPC Statutory Compliance</p>
                <p className="text-xs text-emerald-700">
                  All mandatory declarations conform to Legal Metrology Act, 2009 and Table 1 font size norms.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inspection.violations.map((violation) => (
                  <div
                    key={violation.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                          {violation.ruleClause}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getSeverityBadge(
                            violation.severity
                          )}`}
                        >
                          {violation.severity}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 capitalize">
                        {violation.field.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-900">{violation.message}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-slate-400 font-semibold block">Statutory Mandate:</span>
                        <span className="text-slate-700 font-medium">{violation.expected}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Actual Detection:</span>
                        <span className="text-rose-700 font-bold">{violation.actual}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extracted Declarations & Optical Font Metrology Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Ruler className="h-4 w-4 text-amber-600" />
                <span>Extracted Declarations & Font Metrology</span>
              </h3>
              <span className="text-[11px] text-slate-400">Rule 8 Height Check</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
              {inspection.extractedFields.map((field) => {
                const isHovered = hoveredFieldId === field.id || selectedFieldId === field.id;
                const fontUnderRequirement =
                  field.fontMm &&
                  field.statutoryRequiredFontMm &&
                  field.fontMm < field.statutoryRequiredFontMm;

                return (
                  <div
                    key={field.id}
                    onMouseEnter={() => setHoveredFieldId(field.id)}
                    onMouseLeave={() => setHoveredFieldId(null)}
                    className={`py-3 px-2 rounded-lg transition-colors flex items-start justify-between gap-3 ${
                      isHovered ? 'bg-amber-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {field.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {Math.round(field.confidence * 100)}% conf
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-700 break-words bg-slate-100/70 p-1.5 rounded">
                        {field.value}
                      </p>

                      {/* Font Metrology Pill */}
                      {field.fontMm && (
                        <div className="flex items-center gap-2 text-[11px] pt-0.5">
                          <span className="text-slate-500">Font Height:</span>
                          <span
                            className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                              fontUnderRequirement
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {field.fontMm} mm
                          </span>
                          {field.statutoryRequiredFontMm && (
                            <span className="text-slate-400 text-[10px]">
                              (Req: ≥{field.statutoryRequiredFontMm}mm)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Correct Field Action */}
                    <button
                      onClick={() => handleOpenEditModal(field)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors shrink-0"
                      title="Correct this extracted field"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

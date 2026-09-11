import React, { useState, useEffect } from 'react';
import { LMPC_RULES } from '../data/mockData';
import {
  BookOpen,
  Search,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Scale,
  ShieldCheck,
  Play,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Settings,
  RotateCcw,
  AlertTriangle,
  X,
  Check,
  Cpu,
  FlaskConical,
  Sliders,
} from 'lucide-react';
import { Severity } from '../types';

interface RuleItem {
  id: string;
  clause: string;
  field: string;
  title: string;
  description?: string;
  expected?: string;
  severity: string;
  check_type?: string;
  params?: Record<string, any>;
  enabled?: boolean;
  is_custom?: boolean;
}

export const RulesExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [rulesList, setRulesList] = useState<RuleItem[]>([]);
  const [loadingRules, setLoadingRules] = useState<boolean>(true);

  // Modal State for Adding Custom Rule
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [customClause, setCustomClause] = useState<string>('Rule Custom-1');
  const [customTitle, setCustomTitle] = useState<string>('Custom Packaging Requirement');
  const [customField, setCustomField] = useState<string>('net_quantity');
  const [customCheckType, setCustomCheckType] = useState<string>('presence');
  const [customParamValue, setCustomParamValue] = useState<string>('');
  const [customSeverity, setCustomSeverity] = useState<string>('MAJOR');
  const [customExpected, setCustomExpected] = useState<string>('Mandatory declaration must be specified.');

  // Sandbox Mode: 'sliders' or 'live_sku'
  const [sandboxMode, setSandboxMode] = useState<'sliders' | 'live_sku'>('live_sku');

  // Sliders State
  const [testWeightGrams, setTestWeightGrams] = useState<number>(50);
  const [testFontMm, setTestFontMm] = useState<number>(2.5);
  const [testMrpText, setTestMrpText] = useState<string>('Rs 10.00 (incl. of all taxes)');
  const [testNetQtyText, setTestNetQtyText] = useState<string>('50 g');
  const [testCountry, setTestCountry] = useState<string>('');
  const [isImported, setIsImported] = useState<boolean>(false);

  // Live SKU Declaration Tester State
  const [skuCommodity, setSkuCommodity] = useState<string>('Navratan Mix');
  const [skuMfg, setSkuMfg] = useState<string>(
    'BALAJI WAFERS PRIVATE LIMITED, REGD. OFFICE U1: SURVEY NO. 19, VAJDI, KALAWAD ROAD, DIST. RAJKOT-360021 GUJARAT - INDIA'
  );
  const [skuNetQty, setSkuNetQty] = useState<string>('50g');
  const [skuMrp, setSkuMrp] = useState<string>('Rs. 10.00');
  const [skuMrpFull, setSkuMrpFull] = useState<string>('MRP Rs. 10.00 (incl. of all taxes)');
  const [skuDate, setSkuDate] = useState<string>('');
  const [skuDateTemplate, setSkuDateTemplate] = useState<string>('PKD. : B. NO. : EXPIRY DATE :');
  const [skuCare, setSkuCare] = useState<string>(
    'Phone: +91-7069014141 | Email: CONTACT@BALAJIWAFERS.COM'
  );
  const [skuFontMm, setSkuFontMm] = useState<number>(3.0);

  const [testResult, setTestResult] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Fetch all rules on mount
  const fetchRules = async () => {
    try {
      setLoadingRules(true);
      const res = await fetch('/api/v1/rules');
      if (res.ok) {
        const data = await res.json();
        if (data.rules && Array.isArray(data.rules)) {
          setRulesList(data.rules);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch from /api/v1/rules, falling back to local list:', e);
    } finally {
      setLoadingRules(false);
    }

    const mapped: RuleItem[] = LMPC_RULES.map((r) => ({
      id: r.id,
      clause: r.clause,
      field: r.field,
      title: r.title,
      description: r.description,
      expected: r.expected,
      severity: r.severity,
      enabled: true,
      is_custom: false,
    }));
    setRulesList(mapped);
    setLoadingRules(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  // Toggle Rule Enabled/Disabled
  const handleToggleRule = async (ruleId: string, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    setRulesList((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: nextState } : r))
    );

    try {
      await fetch(`/api/v1/rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState }),
      });
    } catch (e) {
      console.error('Failed to toggle rule on server:', e);
    }
  };

  // Create Custom Rule
  const handleCreateCustomRule = async () => {
    if (!customClause.trim() || !customTitle.trim()) return;

    const payload: any = {
      clause: customClause,
      title: customTitle,
      field: customField,
      check_type: customCheckType,
      severity: customSeverity,
      expected: customExpected,
      params: {},
    };

    if (customCheckType === 'regex') {
      payload.params.pattern = customParamValue || '.*';
    } else if (customCheckType === 'min_font_mm') {
      payload.params.min_font_mm = parseFloat(customParamValue) || 1.5;
    } else if (customCheckType === 'contains') {
      payload.params.contains_text = customParamValue || '';
    }

    try {
      const res = await fetch('/api/v1/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rule) {
          setRulesList((prev) => [...prev, data.rule]);
        }
      }
    } catch (e) {
      console.error('Failed to create custom rule:', e);
    }

    setIsModalOpen(false);
    setCustomClause('Rule Custom-1');
    setCustomTitle('Custom Packaging Requirement');
    setCustomParamValue('');
  };

  // Delete Custom Rule
  const handleDeleteRule = async (ruleId: string) => {
    setRulesList((prev) => prev.filter((r) => r.id !== ruleId));
    try {
      await fetch(`/api/v1/rules/${ruleId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete rule on server:', e);
    }
  };

  // Run Live SKU Test against active rules
  const handleRunSkuTest = async () => {
    setIsEvaluating(true);
    const payload = {
      fields: {
        commodity_name: skuCommodity,
        manufacturer_info: skuMfg,
        net_quantity: skuNetQty,
        mrp: skuMrp,
        mrp_full_text: skuMrpFull,
        manufacturing_date: skuDate || undefined,
        date_declaration_template: skuDateTemplate || undefined,
        consumer_care: skuCare,
      },
      font_metrics: {
        mrp: skuFontMm,
        net_quantity: skuFontMm,
      },
      panel_info: { on_pdp: true },
    };

    try {
      const res = await fetch('/api/v1/rules/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (e) {
      console.error('Failed to evaluate rules in sandbox:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const getRequiredFontMm = (weightG: number): number => {
    if (weightG <= 50) return 1.0;
    if (weightG <= 100) return 1.5;
    if (weightG <= 200) return 2.0;
    if (weightG <= 500) return 2.5;
    if (weightG <= 1000) return 4.0;
    return 6.0;
  };

  const requiredFont = getRequiredFontMm(testWeightGrams);
  const fontCompliant = testFontMm >= requiredFont;

  const mrpTaxCompliant =
    testMrpText.toLowerCase().includes('incl') ||
    testMrpText.toLowerCase().includes('inclusive');

  const improperUnitMatches = testNetQtyText.match(/\b(gms|grams|kgs|litres|ltrs)\b/i);
  const netQtyUnitCompliant = !improperUnitMatches;
  const originCompliant = !isImported || (isImported && testCountry.trim().length > 0);

  const filteredRules = rulesList.filter((rule) => {
    const matchesSearch =
      rule.clause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.description && rule.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      rule.field.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      selectedSeverity === 'ALL' || rule.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gazette of India • Statutory Rule Repository & Custom Rule Studio
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            LMPC Rules, 2011 Statutory Rulebook & Sandbox
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic rule engine. Inspect, toggle statutory mandates, or create custom regional tolerances.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Rule / Tolerance</span>
        </button>
      </div>

      {/* Interactive Sandbox Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Interactive Deterministic Rule Sandbox</span>
                <span className="text-[11px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Live Engine Verification
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Verify package declarations, inspect OCR outputs, and test active rule thresholds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setSandboxMode('live_sku')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                sandboxMode === 'live_sku'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              <span>Full SKU Auditor</span>
            </button>
            <button
              onClick={() => setSandboxMode('sliders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                sandboxMode === 'sliders'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Metric Parameter Sliders</span>
            </button>
          </div>
        </div>

        {/* MODE 1: Full SKU Live Auditor */}
        {sandboxMode === 'live_sku' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 font-medium">
                Test commodity declarations against all active rules:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSkuCommodity('Navratan Mix');
                    setSkuMfg('BALAJI WAFERS PRIVATE LIMITED, REGD. OFFICE U1: SURVEY NO. 19, VAJDI, KALAWAD ROAD, DIST. RAJKOT-360021 GUJARAT - INDIA');
                    setSkuNetQty('50g');
                    setSkuMrp('Rs. 10.00');
                    setSkuMrpFull('MRP Rs. 10.00 (incl. of all taxes)');
                    setSkuDate('');
                    setSkuDateTemplate('PKD. : B. NO. : EXPIRY DATE :');
                    setSkuCare('Phone: +91-7069014141 | Email: CONTACT@BALAJIWAFERS.COM');
                    setSkuFontMm(3.0);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 text-[11px] font-semibold"
                >
                  Load Balaji Wafers 50g Sample
                </button>
                <button
                  onClick={() => {
                    setSkuCommodity('Aashirvaad Sharbati Atta');
                    setSkuMfg('ITC Limited, 37 J.L. Nehru Road, Kolkata WB 700071');
                    setSkuNetQty('5 kg');
                    setSkuMrp('Rs. 340.00');
                    setSkuMrpFull('MRP Rs. 340.00 (incl. of all taxes)');
                    setSkuDate('05/2024');
                    setSkuCare('1800-425-4444 | itccares@itc.in');
                    setSkuFontMm(6.2);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 text-[11px] font-semibold"
                >
                  Load 100% Compliant Sample
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Commodity Name</label>
                <input
                  type="text"
                  value={skuCommodity}
                  onChange={(e) => setSkuCommodity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Net Quantity</label>
                <input
                  type="text"
                  value={skuNetQty}
                  onChange={(e) => setSkuNetQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">MRP Value & Tax String</label>
                <input
                  type="text"
                  value={skuMrpFull}
                  onChange={(e) => setSkuMrpFull(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Packaging Font Height (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={skuFontMm}
                  onChange={(e) => setSkuFontMm(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Manufacturer Info (with PIN code)</label>
                <input
                  type="text"
                  value={skuMfg}
                  onChange={(e) => setSkuMfg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Consumer Care (Phone & Email)</label>
                <input
                  type="text"
                  value={skuCare}
                  onChange={(e) => setSkuCare(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Manufacturing Date (MM/YYYY)</label>
                <input
                  type="text"
                  placeholder="e.g. 05/2024 or leave empty"
                  value={skuDate}
                  onChange={(e) => setSkuDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-3 flex items-end justify-between gap-4">
                <div className="flex-1">
                  <label className="text-slate-400 block mb-1">Packaging Artwork Template Markers</label>
                  <input
                    type="text"
                    value={skuDateTemplate}
                    onChange={(e) => setSkuDateTemplate(e.target.value)}
                    placeholder="e.g. PKD. : B. NO. : EXPIRY DATE :"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <button
                  onClick={handleRunSkuTest}
                  disabled={isEvaluating}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>{isEvaluating ? 'Evaluating...' : 'Run Test Audit'}</span>
                </button>
              </div>
            </div>

            {/* Test Results Banner */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border ${
                  testResult.compliant
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-100'
                    : 'bg-rose-950/80 border-rose-700 text-rose-100'
                } space-y-3 animate-in fade-in duration-200 text-xs`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    {testResult.compliant ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <AlertOctagon className="h-5 w-5 text-rose-400" />
                    )}
                    <span className="font-bold text-sm">
                      Audit Result:{' '}
                      {testResult.compliant
                        ? '100% COMPLIANT'
                        : `${testResult.total_violations} STATUTORY DEFICITS FLAGGED`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/50">
                      Critical: {testResult.critical_count}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
                      Major: {testResult.major_count}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                      Minor: {testResult.minor_count}
                    </span>
                  </div>
                </div>

                {testResult.violations.length === 0 ? (
                  <p className="text-emerald-300 font-medium">
                    All declarations successfully conform to active LMPC statutory rules.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {testResult.violations.map((v: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700 flex items-start justify-between gap-3"
                      >
                        <div>
                          <span className="font-bold text-amber-300 mr-2">{v.rule_clause}</span>
                          <span className="text-slate-200">{v.message}</span>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Expected: <strong className="text-white">{v.expected}</strong> | Actual:{' '}
                            <span className="text-rose-300 font-mono">{v.actual}</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 shrink-0">
                          {v.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: Metric Parameter Sliders */}
        {sandboxMode === 'sliders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Rule 8 Font Metrology Tester */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">Rule 8 (Font Size Table 1)</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    fontCompliant ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                  }`}
                >
                  {fontCompliant ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Commodity Weight: {testWeightGrams} g</label>
                <input
                  type="range"
                  min="20"
                  max="2000"
                  step="10"
                  value={testWeightGrams}
                  onChange={(e) => setTestWeightGrams(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Optical Font Height: {testFontMm} mm</label>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.1"
                  value={testFontMm}
                  onChange={(e) => setTestFontMm(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                Statutory Requirement: <strong className="text-white">≥ {requiredFont} mm</strong> (Current: {testFontMm} mm)
              </p>
            </div>

            {/* Rule 18 MRP Tax Clause Tester */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">Rule 18 (MRP Tax Inclusion)</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    mrpTaxCompliant ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                  }`}
                >
                  {mrpTaxCompliant ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Printed MRP String:</label>
                <input
                  type="text"
                  value={testMrpText}
                  onChange={(e) => setTestMrpText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                Requires explicit inclusion of: <strong className="text-white">"(incl. of all taxes)"</strong>
              </p>
            </div>

            {/* Rule 22 Unit Pluralization Tester */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">Rule 22 (Unit Notation)</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    netQtyUnitCompliant ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                  }`}
                >
                  {netQtyUnitCompliant ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Printed Net Qty String:</label>
                <input
                  type="text"
                  value={testNetQtyText}
                  onChange={(e) => setTestNetQtyText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                Prohibits: <strong className="text-rose-400">"gms", "grams", "litres"</strong>. Only SI: <strong className="text-emerald-400">g, kg, ml, l</strong>.
              </p>
            </div>

            {/* Rule 27 Import Origin Tester */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">Rule 27 (Import Origin)</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    originCompliant ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                  }`}
                >
                  {originCompliant ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="importCheck"
                  checked={isImported}
                  onChange={(e) => setIsImported(e.target.checked)}
                  className="accent-amber-500"
                />
                <label htmlFor="importCheck" className="text-slate-300">
                  Is Imported Commodity
                </label>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Country of Origin:</label>
                <input
                  type="text"
                  disabled={!isImported}
                  placeholder={isImported ? 'e.g. Spain, Italy' : 'Domestic Product'}
                  value={testCountry}
                  onChange={(e) => setTestCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs disabled:opacity-40"
                />
              </div>
              <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                Mandatory for imported SKUs under Rule 27.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rules Directory Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search statutory clauses, rule titles, fields, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
          >
            <option value="ALL">All Severities ({rulesList.length})</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="MAJOR">Major Only</option>
            <option value="MINOR">Minor Only</option>
          </select>
        </div>
      </div>

      {/* Rules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => {
          const isCritical = rule.severity === 'CRITICAL';
          const isMajor = rule.severity === 'MAJOR';
          const isEnabled = rule.enabled !== false;

          return (
            <div
              key={rule.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-3 transition-all ${
                isEnabled
                  ? 'border-slate-200 hover:border-slate-300'
                  : 'border-slate-200 bg-slate-50/70 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {rule.clause}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : isMajor
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {rule.severity}
                  </span>
                  {rule.is_custom && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                      Custom Rule
                    </span>
                  )}
                </div>

                {/* Enable / Disable Toggle Switch */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleRule(rule.id, isEnabled)}
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    title={isEnabled ? 'Click to disable rule' : 'Click to enable rule'}
                  >
                    {isEnabled ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <span className="text-[11px]">Active</span>
                        <ToggleRight className="h-6 w-6 text-emerald-600" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400">
                        <span className="text-[11px]">Disabled</span>
                        <ToggleLeft className="h-6 w-6 text-slate-400" />
                      </span>
                    )}
                  </button>

                  {rule.is_custom && (
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Custom Rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">{rule.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {rule.description || `Audits declaration of '${rule.field}'.`}
              </p>

              {rule.expected && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-[11px] text-slate-700">
                  <span className="font-semibold text-slate-500 block">Statutory Standard Expected:</span>
                  <span className="font-medium text-slate-900">{rule.expected}</span>
                </div>
              )}

              {!isEnabled && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Rule is currently disabled — bypassed during live package inspection.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Rule Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-base">Add Custom Rule / Tolerance</h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rule Clause</label>
                  <input
                    type="text"
                    value={customClause}
                    onChange={(e) => setCustomClause(e.target.value)}
                    placeholder="e.g. Rule 6(1)(d) - Tolerance"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={customSeverity}
                    onChange={(e) => setCustomSeverity(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="MAJOR">MAJOR</option>
                    <option value="MINOR">MINOR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rule Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Mandatory Date on Packaging Seal"
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Field</label>
                  <select
                    value={customField}
                    onChange={(e) => setCustomField(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono"
                  >
                    <option value="mrp">mrp (Maximum Retail Price)</option>
                    <option value="net_quantity">net_quantity (Net Quantity)</option>
                    <option value="manufacturer_info">manufacturer_info (Manufacturer Address)</option>
                    <option value="manufacturing_date">manufacturing_date (Mfg Date)</option>
                    <option value="consumer_care">consumer_care (Helpline / Email)</option>
                    <option value="commodity_name">commodity_name (Product Name)</option>
                    <option value="country_of_origin">country_of_origin (Import Origin)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Check Type</label>
                  <select
                    value={customCheckType}
                    onChange={(e) => setCustomCheckType(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="presence">Presence (Must Not Be Empty)</option>
                    <option value="regex">Regex Pattern Match</option>
                    <option value="contains">Contains Substring Keyword</option>
                    <option value="min_font_mm">Minimum Font Height (mm)</option>
                  </select>
                </div>
              </div>

              {customCheckType !== 'presence' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {customCheckType === 'regex'
                      ? 'Regular Expression (Pattern)'
                      : customCheckType === 'contains'
                      ? 'Required Substring Keyword'
                      : 'Minimum Font Height (mm)'}
                  </label>
                  <input
                    type={customCheckType === 'min_font_mm' ? 'number' : 'text'}
                    step="0.1"
                    value={customParamValue}
                    onChange={(e) => setCustomParamValue(e.target.value)}
                    placeholder={
                      customCheckType === 'regex'
                        ? 'e.g. ^(0[1-9]|1[0-2])\\/20\\d{2}$'
                        : customCheckType === 'contains'
                        ? 'e.g. pvt ltd'
                        : 'e.g. 2.0'
                    }
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Statutory Expected Mandate</label>
                <textarea
                  rows={2}
                  value={customExpected}
                  onChange={(e) => setCustomExpected(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomRule}
                className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Save & Activate Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

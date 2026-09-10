import React, { useState } from 'react';
import { LMPC_RULES } from '../data/mockData';
import { BookOpen, Search, Sparkles, CheckCircle2, AlertOctagon, Scale, ShieldCheck, Play } from 'lucide-react';
import { Severity } from '../types';

export const RulesExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Interactive Sandbox State
  const [testWeightGrams, setTestWeightGrams] = useState<number>(750);
  const [testFontMm, setTestFontMm] = useState<number>(1.5);
  const [testMrpText, setTestMrpText] = useState<string>('Rs 120');
  const [testNetQtyText, setTestNetQtyText] = useState<string>('500 grams');
  const [testCountry, setTestCountry] = useState<string>('');
  const [isImported, setIsImported] = useState<boolean>(false);

  // Compute Rule 8 Minimum required font size based on Table 1
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

  // Rule 18 Tax Check
  const mrpTaxCompliant =
    testMrpText.toLowerCase().includes('incl') ||
    testMrpText.toLowerCase().includes('inclusive');

  // Rule 22 Unit Check
  const improperUnitMatches = testNetQtyText.match(/\b(gms|grams|kgs|litres|ltrs)\b/i);
  const netQtyUnitCompliant = !improperUnitMatches;

  // Rule 27 Origin Check
  const originCompliant = !isImported || (isImported && testCountry.trim().length > 0);

  const filteredRules = LMPC_RULES.filter((rule) => {
    const matchesSearch =
      rule.clause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.field.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      selectedSeverity === 'ALL' || rule.severity === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Gazette of India • Statutory Rule Repository
          </span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          LMPC Rules, 2011 Statutory Rulebook & Sandbox
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete codified statutory rulebook governing pre-packaged commodities under the Legal Metrology Act, 2009.
        </p>
      </div>

      {/* Interactive Sandbox Section for SIH Demonstrations */}
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
                  Real-Time Evaluation
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Test custom packaging measurements and declarations against the statutory engine
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">Zero Hallucinations Guarantee</span>
        </div>

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
      </div>

      {/* Rules Directory Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search LMPC statutory clauses, requirements, keywords..."
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
            <option value="ALL">All Severities ({LMPC_RULES.length})</option>
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

          return (
            <div
              key={rule.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
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
                </div>
                <span className="text-[11px] font-semibold text-slate-400 font-mono">
                  {rule.field}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">{rule.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-[11px] text-slate-700">
                <span className="font-semibold text-slate-500 block">Statutory Standard Expected:</span>
                <span className="font-medium text-slate-900">{rule.expected}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

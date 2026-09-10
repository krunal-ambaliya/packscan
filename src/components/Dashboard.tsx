import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ShieldCheck, AlertOctagon, TrendingUp, IndianRupee, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const VIOLATIONS_BY_CLAUSE_DATA = [
  { clause: 'Rule 8 (Font Size)', count: 310, severity: 'MAJOR', fill: '#f59e0b' },
  { clause: 'Rule 6(1)(e) (Missing MRP)', count: 240, severity: 'CRITICAL', fill: '#ef4444' },
  { clause: "Rule 18 (No 'incl. taxes')", count: 185, severity: 'MAJOR', fill: '#f59e0b' },
  { clause: 'Rule 6(1)(a) (Mfg Address)', count: 160, severity: 'CRITICAL', fill: '#ef4444' },
  { clause: 'Rule 22 (Improper Unit)', count: 130, severity: 'MINOR', fill: '#3b82f6' },
  { clause: 'Rule 27 (Missing Origin)', count: 95, severity: 'CRITICAL', fill: '#ef4444' },
  { clause: 'Rule 6(1)(f) (Consumer Care)', count: 75, severity: 'MAJOR', fill: '#f59e0b' },
];

const STATE_ENFORCEMENT_DATA = [
  { state: 'Maharashtra', scanned: 512, violations: 220, rate: 57 },
  { state: 'Delhi NCR', scanned: 460, violations: 168, rate: 63 },
  { state: 'Uttar Pradesh', scanned: 380, violations: 215, rate: 43 },
  { state: 'Karnataka', scanned: 310, violations: 98, rate: 68 },
  { state: 'Tamil Nadu', scanned: 290, violations: 85, rate: 71 },
  { state: 'Gujarat', scanned: 275, violations: 110, rate: 60 },
];

const AUDIT_TREND_DATA = [
  { date: 'Mon', audited: 180, violations: 65, compliant: 115 },
  { date: 'Tue', audited: 240, violations: 88, compliant: 152 },
  { date: 'Wed', audited: 310, violations: 118, compliant: 192 },
  { date: 'Thu', audited: 285, violations: 95, compliant: 190 },
  { date: 'Fri', audited: 350, violations: 125, compliant: 225 },
  { date: 'Sat', audited: 195, violations: 58, compliant: 137 },
  { date: 'Sun', audited: 110, violations: 32, compliant: 78 },
];

const SEVERITY_PIE_DATA = [
  { name: 'Critical (Rule 6a, 6e, 27)', value: 342, color: '#ef4444' },
  { name: 'Major (Rule 6b, 6d, 6f, 8, 18)', value: 512, color: '#f59e0b' },
  { name: 'Minor (Rule 22 unit notation)', value: 186, color: '#3b82f6' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Overview Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              National Legal Metrology Command Center
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Surveillance & Enforcement Analytics
          </h2>
        </div>
        <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-2">
          <span>Live Synchronized Stream:</span>
          <span className="font-mono font-bold text-slate-800">28 State Directorates</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Total Audited SKUs</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">2,840</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              +18.4% WoW
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Retail retail markets & quick commerce</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Deficit Rate (Non-Compliant)</span>
            <AlertOctagon className="h-4 w-4 text-rose-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 font-mono">36.6%</span>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              1,040 Flagged
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Under Legal Metrology Rules, 2011</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Critical Statutory Defaults</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">342</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Missing MRP/Origin
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Immediate Section 15 notices issued</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Penalties Compounding</span>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 font-mono">₹ 1.42 Cr</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Sec 36 Realized
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Compounding fee recoveries</p>
        </div>
      </div>

      {/* Primary Chart Row: Violations by Clause + Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bar Chart of Violations by Clause (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Statutory Violations by LMPC Rule Clause
              </h3>
              <p className="text-xs text-slate-500">
                Frequency distribution across audited retail packaging labels
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              Top Clause: Rule 8 Font Size
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={VIOLATIONS_BY_CLAUSE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="clause" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {VIOLATIONS_BY_CLAUSE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Severity Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Severity Breakdown</h3>
            <p className="text-xs text-slate-500">Legal criticality of identified deficiencies</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SEVERITY_PIE_DATA}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {SEVERITY_PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            {SEVERITY_PIE_DATA.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Chart Row: State Enforcement Heat + Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State-Wise Enforcement */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">State Legal Metrology Enforcement</h3>
              <p className="text-xs text-slate-500">Audited volume vs violation rate by state jurisdiction</p>
            </div>
            <Building2 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={STATE_ENFORCEMENT_DATA}
                margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="state" type="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="scanned" name="Audited SKUs" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                <Bar dataKey="violations" name="Violations Flagged" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Composed Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Inspection Volume & Compliance</h3>
              <p className="text-xs text-slate-500">7-day rolling operational workload</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={AUDIT_TREND_DATA} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="audited" name="Total Audited" stroke="#1e293b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="compliant" name="Compliant" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="violations" name="Violations" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

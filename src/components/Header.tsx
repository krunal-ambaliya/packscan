import React from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, UserCheck, Sparkles, Building2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  inspectionsCount: number;
  violationsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  activeTab,
  onTabChange,
  inspectionsCount,
  violationsCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Government Bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-300">Department of Consumer Affairs (DoCA)</span>
          <span className="text-slate-600">|</span>
          <span>Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono text-[11px] font-medium">
            Smart India Hackathon (SIH) 2024
          </span>
          <span className="text-slate-400 text-[11px]">Enforcement Portal v2.4</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Agency Info */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-900/30">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Pack<span className="text-amber-400">Scan</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700/50">
                LMPC 2011 AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Legal Metrology Automated Packaging Compliance System</p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="hidden md:flex items-center gap-4 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-400">Audited SKUs:</span>
            <span className="font-bold text-white font-mono">{inspectionsCount}</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span className="text-slate-400">Deficits Flagged:</span>
            <span className="font-bold text-rose-400 font-mono">{violationsCount}</span>
          </div>
        </div>

        {/* RBAC Role Selector & Officer Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200 flex items-center justify-end gap-1">
              <Building2 className="h-3 w-3 text-amber-400" />
              <span>{currentUser.name}</span>
            </div>
            <div className="text-[11px] text-slate-400">{currentUser.state} Jurisdiction</div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
            <UserCheck className="h-3.5 w-3.5 text-amber-400 ml-1.5" />
            <select
              value={currentUser.role}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none pr-1 py-0.5 cursor-pointer"
              title="Switch RBAC Security Role"
            >
              <option value="CENTRAL_OFFICER" className="bg-slate-900 text-white">Central Enforcement Officer</option>
              <option value="STATE_OFFICER" className="bg-slate-900 text-white">State Legal Metrology Inspector</option>
              <option value="ADMIN" className="bg-slate-900 text-white">System Administrator</option>
              <option value="VIEWER" className="bg-slate-900 text-white">Public / Citizen Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-slate-800/80 overflow-x-auto">
        {[
          { id: 'scan', label: 'Scan & Verify', icon: '🔍' },
          { id: 'result', label: 'Inspection Workspace', icon: '🎯' },
          { id: 'dashboard', label: 'National Dashboard', icon: '📊' },
          { id: 'history', label: 'SKU Registry', icon: '📋' },
          { id: 'report', label: 'Statutory Notice (Form VI)', icon: '⚖️' },
          { id: 'rules', label: 'LMPC Rulebook & Sandbox', icon: '📖' },
          { id: 'codebase', label: 'Monorepo Architecture & Pitch', icon: '⚡' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
                isActive
                  ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

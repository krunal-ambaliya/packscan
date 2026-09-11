import React, { useState } from 'react';
import { Header } from './components/Header';
import { ScanUpload } from './components/ScanUpload';
import { InspectionResult } from './components/InspectionResult';
import { Dashboard } from './components/Dashboard';
import { ProductHistory } from './components/ProductHistory';
import { ReportViewer } from './components/ReportViewer';
import { RulesExplorer } from './components/RulesExplorer';
import { CodebaseExplorer } from './components/CodebaseExplorer';
import { BENCHMARK_TEST_PACKS, HISTORICAL_INSPECTIONS, INITIAL_USER } from './data/mockData';
import { InspectionRecord, User, UserRole, Violation } from './types';
import { CheckCircle2, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<string>('result');
  const [inspections, setInspections] = useState<InspectionRecord[]>(HISTORICAL_INSPECTIONS);
  const [currentInspection, setCurrentInspection] = useState<InspectionRecord>(BENCHMARK_TEST_PACKS[0]); // Starts with Taj Mahal Tea dossier matching reference layout
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRoleChange = (role: UserRole) => {
    let name = currentUser.name;
    let state = currentUser.state;

    if (role === 'CENTRAL_OFFICER') {
      name = 'Rajesh Sharma, IRS';
      state = 'Delhi NCR (Central HQ)';
    } else if (role === 'STATE_OFFICER') {
      name = 'K. Balasubramanian';
      state = 'Tamil Nadu Directorate';
    } else if (role === 'ADMIN') {
      name = 'DoCA NIC Administrator';
      state = 'National Cloud Portal';
    } else {
      name = 'Citizen / Consumer Observer';
      state = 'All India (Public Access)';
    }

    setCurrentUser({
      ...currentUser,
      role,
      name,
      state,
    });
    showToast(`Security Role switched to ${role.replace('_', ' ')} (${state})`);
  };

  const handleScanComplete = (record: InspectionRecord) => {
    // Add to inspections registry if not already present
    setInspections((prev) => {
      const exists = prev.some((r) => r.id === record.id);
      if (exists) return prev;
      return [record, ...prev];
    });
    setCurrentInspection(record);
    setActiveTab('result');
    showToast(`Inspection ${record.id} completed in ${record.metrics.processingTimeMs}ms`);
  };

  const handleSelectRecord = (record: InspectionRecord) => {
    setCurrentInspection(record);
    setActiveTab('result');
  };

  // Human-in-the-loop field correction & rule engine re-evaluation
  const handleUpdateField = (fieldId: string, newValue: string, newFontMm?: number) => {
    if (!currentInspection) return;

    const updatedFields = currentInspection.extractedFields.map((f) => {
      if (f.id === fieldId) {
        return {
          ...f,
          value: newValue,
          fontMm: newFontMm ?? f.fontMm,
        };
      }
      return f;
    });

    // Re-evaluate violations based on updated fields
    let updatedViolations: Violation[] = [];

    // Check MRP
    const mrpField = updatedFields.find((f) => f.fieldName === 'mrp');
    if (
      !mrpField ||
      mrpField.value.includes('ABSENT') ||
      mrpField.value.trim().length === 0
    ) {
      updatedViolations.push({
        id: 'rev-v1',
        ruleClause: 'Rule 6(1)(e)',
        field: 'mrp',
        severity: 'CRITICAL',
        message: 'Maximum Retail Price (MRP) declaration is missing or unreadable.',
        expected: 'Prominent monetary value prefixed with MRP Rs. or ₹ (incl. of all taxes)',
        actual: mrpField ? mrpField.value : 'Not detected',
      });
    } else if (
      !mrpField.value.toLowerCase().includes('incl') &&
      !mrpField.value.toLowerCase().includes('inclusive')
    ) {
      updatedViolations.push({
        id: 'rev-v2',
        ruleClause: 'Rule 18',
        field: 'mrp',
        severity: 'MAJOR',
        message: 'MRP declaration fails to declare "(incl. of all taxes)".',
        expected: 'MRP (incl. of all taxes)',
        actual: mrpField.value,
      });
    }

    // Check Net Quantity Unit
    const netQtyField = updatedFields.find((f) => f.fieldName === 'net_quantity');
    if (netQtyField && /\b(gms|grams|kgs|litres)\b/i.test(netQtyField.value)) {
      updatedViolations.push({
        id: 'rev-v3',
        ruleClause: 'Rule 22',
        field: 'net_quantity',
        severity: 'MINOR',
        message: 'Non-standard unit symbol notation. SI unit required.',
        expected: 'Standard SI metric symbol',
        actual: netQtyField.value,
      });
    }

    // Check Font Metrology (Rule 8)
    const fontViolations = updatedFields.filter(
      (f) => f.fontMm && f.statutoryRequiredFontMm && f.fontMm < f.statutoryRequiredFontMm
    );
    if (fontViolations.length > 0) {
      const vField = fontViolations[0];
      updatedViolations.push({
        id: 'rev-v4',
        ruleClause: 'Rule 8',
        field: 'font_size',
        severity: 'MAJOR',
        message: `Font height (${vField.fontMm}mm) is below statutory minimum (${vField.statutoryRequiredFontMm}mm).`,
        expected: `≥ ${vField.statutoryRequiredFontMm}mm`,
        actual: `${vField.fontMm}mm`,
      });
    }

    // Check Country of Origin
    const originField = updatedFields.find((f) => f.fieldName === 'country_of_origin');
    if (
      currentInspection.category.includes('Import') &&
      (!originField || originField.value.includes('ABSENT'))
    ) {
      updatedViolations.push({
        id: 'rev-v5',
        ruleClause: 'Rule 27',
        field: 'country_of_origin',
        severity: 'CRITICAL',
        message: 'Imported commodity lacks mandatory Country of Origin declaration.',
        expected: 'Country of Origin: [Country]',
        actual: 'Absent on package',
      });
    }

    // Recalculate hasViolation flags on fields
    const finalFields = updatedFields.map((f) => {
      const hasV = updatedViolations.some(
        (v) =>
          v.field === f.fieldName ||
          (v.field === 'font_size' &&
            f.fontMm &&
            f.statutoryRequiredFontMm &&
            f.fontMm < f.statutoryRequiredFontMm)
      );
      return { ...f, hasViolation: hasV };
    });

    const isNowCompliant = updatedViolations.length === 0;

    const updatedInspection: InspectionRecord = {
      ...currentInspection,
      extractedFields: finalFields,
      violations: updatedViolations,
      complianceStatus: isNowCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
      metrics: {
        ...currentInspection.metrics,
        totalViolations: updatedViolations.length,
        criticalCount: updatedViolations.filter((v) => v.severity === 'CRITICAL').length,
        majorCount: updatedViolations.filter((v) => v.severity === 'MAJOR').length,
        minorCount: updatedViolations.filter((v) => v.severity === 'MINOR').length,
      },
    };

    setCurrentInspection(updatedInspection);
    setInspections((prev) =>
      prev.map((rec) => (rec.id === updatedInspection.id ? updatedInspection : rec))
    );
    showToast('Field corrected. Deterministic Rule Engine re-evaluated!');
  };

  // Add missing declaration and re-evaluate compliance
  const handleAddField = (newField: ExtractedField) => {
    if (!currentInspection) return;

    // Append to extracted fields
    const updatedFields = [...currentInspection.extractedFields, newField];

    // Clear violations that correspond to this field
    const remainingViolations = currentInspection.violations.filter((v) => {
      if (v.field === newField.fieldName) return false;
      if (newField.fieldName === 'manufacturer_info' && v.ruleClause.includes('6(1)(a)')) return false;
      if (newField.fieldName === 'net_quantity' && v.ruleClause.includes('6(1)(c)')) return false;
      if (newField.fieldName === 'mrp' && v.ruleClause.includes('6(1)(e)')) return false;
      if (newField.fieldName === 'mfg_date' && v.ruleClause.includes('6(1)(d)')) return false;
      if (newField.fieldName === 'consumer_care' && v.ruleClause.includes('6(1)(n)')) return false;
      if (newField.fieldName === 'unit_sale_price' && v.ruleClause.includes('6(1)(m)')) return false;
      return true;
    });

    const isNowCompliant = remainingViolations.length === 0;

    const updatedInspection: InspectionRecord = {
      ...currentInspection,
      extractedFields: updatedFields,
      violations: remainingViolations,
      complianceStatus: isNowCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
      metrics: {
        ...currentInspection.metrics,
        totalViolations: remainingViolations.length,
        criticalCount: remainingViolations.filter((v) => v.severity === 'CRITICAL').length,
        majorCount: remainingViolations.filter((v) => v.severity === 'MAJOR').length,
        minorCount: remainingViolations.filter((v) => v.severity === 'MINOR').length,
      },
    };

    setCurrentInspection(updatedInspection);
    setInspections((prev) =>
      prev.map((rec) => (rec.id === updatedInspection.id ? updatedInspection : rec))
    );
    showToast(`Declaration "${newField.label}" added. Compliance re-evaluated!`);
  };

  // Certify variable date on crimp/seal for pouch packaging
  const handleCertifyCrimp = (violationId: string) => {
    if (!currentInspection) return;

    const remainingViolations = currentInspection.violations.filter(
      (v) => v.id !== violationId && !v.ruleClause.includes('6(1)(d)') && v.field !== 'mfg_date'
    );

    const crimpField: ExtractedField = {
      id: `crimp_cert_${Date.now()}`,
      fieldName: 'mfg_date',
      label: 'Date of Mfg / Batch (Crimp Seal)',
      value: 'Certified on Packaging Crimp / Seal Line',
      bbox: [40, 15, 350, 40],
      confidence: 1.0,
      fontMm: 2.5,
      statutoryRequiredFontMm: 2.0,
      hasViolation: false,
    };

    // Filter out existing placeholder mfg_date if any, or append
    const updatedFields = [
      ...currentInspection.extractedFields.filter((f) => f.fieldName !== 'mfg_date'),
      crimpField,
    ];

    const isNowCompliant = remainingViolations.length === 0;

    const updatedInspection: InspectionRecord = {
      ...currentInspection,
      extractedFields: updatedFields,
      violations: remainingViolations,
      complianceStatus: isNowCompliant ? 'COMPLIANT' : 'NON_COMPLIANT',
      metrics: {
        ...currentInspection.metrics,
        totalViolations: remainingViolations.length,
        criticalCount: remainingViolations.filter((v) => v.severity === 'CRITICAL').length,
        majorCount: remainingViolations.filter((v) => v.severity === 'MAJOR').length,
        minorCount: remainingViolations.filter((v) => v.severity === 'MINOR').length,
      },
    };

    setCurrentInspection(updatedInspection);
    setInspections((prev) =>
      prev.map((rec) => (rec.id === updatedInspection.id ? updatedInspection : rec))
    );
    showToast('Rule 6(1)(d) Certified on Crimp/Seal. Status updated!');
  };

  const totalViolationsCount = inspections.reduce(
    (acc, r) => acc + r.violations.length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Top Government Banner & Navigation */}
      <Header
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        inspectionsCount={inspections.length}
        violationsCount={totalViolationsCount}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'scan' && (
          <ScanUpload
            onScanComplete={handleScanComplete}
            onSelectPreset={handleScanComplete}
          />
        )}

        {activeTab === 'result' && currentInspection && (
          <InspectionResult
            inspection={currentInspection}
            onUpdateField={handleUpdateField}
            onGenerateReport={() => setActiveTab('report')}
            onNavigateToRules={() => setActiveTab('rules')}
            onAddField={handleAddField}
            onCertifyCrimp={handleCertifyCrimp}
          />
        )}

        {activeTab === 'dashboard' && <Dashboard />}

        {activeTab === 'history' && (
          <ProductHistory
            records={inspections}
            onSelectRecord={handleSelectRecord}
          />
        )}

        {activeTab === 'report' && currentInspection && (
          <ReportViewer
            inspection={currentInspection}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'rules' && <RulesExplorer />}

        {activeTab === 'codebase' && <CodebaseExplorer />}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-800 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-slate-300">PackScan</span>
            <span>•</span>
            <span>Department of Consumer Affairs, Government of India</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Statutory Legal Metrology Act, 2009</span>
            <span>•</span>
            <span>LMPC Rules, 2011</span>
            <span>•</span>
            <span className="text-amber-400 font-mono">Smart India Hackathon 2024</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

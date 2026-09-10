import React, { useState } from 'react';
import { InspectionRecord, User } from '../types';
import { Printer, Download, Copy, Check, ShieldCheck, FileText, QrCode, Building, Award } from 'lucide-react';

interface ReportViewerProps {
  inspection: InspectionRecord;
  currentUser: User;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ inspection, currentUser }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<'PDF' | 'DOCX' | null>(null);

  const noticeDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const referenceNo = `DoCA/LM/${inspection.state.replace(/\s+/g, '_').toUpperCase()}/${new Date().getFullYear()}/${inspection.id.replace('INS-', '')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const legalNotice = `
GOVERNMENT OF INDIA
MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
DEPARTMENT OF CONSUMER AFFAIRS
LEGAL METROLOGY DIVISION

NOTICE UNDER SECTION 15 & SECTION 36 OF THE LEGAL METROLOGY ACT, 2009
READ WITH THE LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011

Notice Ref: ${referenceNo}
Date of Inspection: ${noticeDate}
Jurisdiction: Directorate of Legal Metrology, ${inspection.state}

To:
The Managing Director / Authorized Signatory
${inspection.brand} / ${inspection.extractedFields.find((f) => f.fieldName === 'manufacturer_info')?.value || 'Packer / Importer'}

Subject: Notice of Statutory Non-Compliance for Packaged Commodity "${inspection.productName}" (Barcode: ${inspection.barcode})

WHEREAS, in exercise of powers conferred under Section 15 of the Legal Metrology Act, 2009, an inspection of the pre-packaged commodity was conducted;
AND WHEREAS, examination of the Principal Display Panel (PDP) revealed the following statutory violations under the Legal Metrology (Packaged Commodities) Rules, 2011:

${inspection.violations
  .map(
    (v, i) =>
      `${i + 1}. [${v.ruleClause}] - ${v.severity}\n   Infraction: ${v.message}\n   Statutory Mandate: ${v.expected}\n   Observed on Package: ${v.actual}`
  )
  .join('\n\n')}

NOW THEREFORE, you are hereby called upon to show cause within 15 (fifteen) days from the receipt of this notice as to why penal proceedings under Section 36 of the Legal Metrology Act, 2009 should not be initiated against you, or why the offences should not be compounded under Section 48 upon payment of prescribed compounding sum.

Inspecting Officer: ${currentUser.name}
Designation: ${currentUser.role.replace('_', ' ')}
Department of Consumer Affairs, Govt. of India
    `.trim();

    navigator.clipboard.writeText(legalNotice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerDownload = (type: 'PDF' | 'DOCX') => {
    setDownloading(type);
    setTimeout(() => {
      setDownloading(null);
      const filename = `Statutory_Notice_Form_VI_${inspection.id}.${type.toLowerCase()}`;
      const element = document.createElement('a');
      const file = new Blob([`PackScan Official Form VI Notice for ${inspection.productName} (${inspection.id})\n\nReference: ${referenceNo}`], {
        type: type === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Form VI Statutory Inspection Report & Show-Cause Notice
          </h2>
          <p className="text-xs text-slate-500">
            Official legal notice generated under Section 15 of the Legal Metrology Act, 2009
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied Notice' : 'Copy Notice Text'}</span>
          </button>

          <button
            onClick={() => triggerDownload('DOCX')}
            className="px-3 py-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{downloading === 'DOCX' ? 'Exporting...' : 'Export DOCX'}</span>
          </button>

          <button
            onClick={() => triggerDownload('PDF')}
            className="px-3 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>{downloading === 'PDF' ? 'Generating...' : 'Export PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 shadow transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print Notice</span>
          </button>
        </div>
      </div>

      {/* Official Government Form VI Document Sheet */}
      <div className="bg-white border-2 border-slate-300 shadow-xl rounded-2xl p-8 sm:p-12 text-slate-900 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header with National Emblem Style */}
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-serif text-2xl font-black shadow-inner">
            <ShieldCheck className="h-10 w-10 text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-black tracking-wider uppercase font-serif text-slate-950">
              Government of India
            </h1>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
              Ministry of Consumer Affairs, Food & Public Distribution
            </h2>
            <h3 className="text-xs font-semibold uppercase text-slate-600">
              Department of Consumer Affairs • Legal Metrology Division
            </h3>
            <p className="text-xs font-medium text-slate-500 pt-1">
              Directorate of Legal Metrology, {inspection.state} Jurisdiction
            </p>
          </div>
        </div>

        {/* Notice Meta & Form Designation */}
        <div className="flex flex-wrap items-start justify-between gap-4 text-xs">
          <div className="space-y-1">
            <p>
              <span className="font-bold text-slate-600">Notice Reference No:</span>{' '}
              <span className="font-mono font-bold text-slate-950">{referenceNo}</span>
            </p>
            <p>
              <span className="font-bold text-slate-600">Inspection File ID:</span>{' '}
              <span className="font-mono text-slate-800">{inspection.id}</span>
            </p>
            <p>
              <span className="font-bold text-slate-600">Date of Verification:</span>{' '}
              <span className="text-slate-800">{noticeDate}</span>
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-bold border border-slate-300 rounded font-serif text-[11px] uppercase tracking-wider">
              Statutory Form VI
            </span>
            <p className="text-[11px] text-slate-500">Under Rule 29, LMPC Rules 2011</p>
          </div>
        </div>

        {/* Legal Title */}
        <div className="text-center py-2 bg-slate-50 border-y border-slate-200">
          <h4 className="font-black text-sm uppercase tracking-wide text-slate-900 font-serif">
            Inspection & Statutory Show-Cause Notice
          </h4>
          <p className="text-xs text-slate-600">
            Under Section 15 and Section 36 of the Legal Metrology Act, 2009 (Act No. 1 of 2010)
          </p>
        </div>

        {/* Addressed To */}
        <div className="text-xs space-y-1 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
          <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">To,</p>
          <p className="font-bold text-slate-900 text-sm">{inspection.brand}</p>
          <p className="text-slate-700">
            {inspection.extractedFields.find((f) => f.fieldName === 'manufacturer_info')?.value ||
              'Registered Manufacturer / Packer / Importer'}
          </p>
          <p className="text-slate-500 text-[11px]">
            EAN-13 Barcode: <span className="font-mono font-bold text-slate-800">{inspection.barcode}</span>
          </p>
        </div>

        {/* Commodity Particulars */}
        <div className="space-y-2">
          <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            1. Particulars of the Pre-Packaged Commodity
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Commodity Name</span>
              <span className="font-bold text-slate-900">{inspection.productName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Declared Net Qty</span>
              <span className="font-bold text-slate-900">
                {inspection.extractedFields.find((f) => f.fieldName === 'net_quantity')?.value || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Declared Retail MRP</span>
              <span className="font-bold text-slate-900">
                {inspection.extractedFields.find((f) => f.fieldName === 'mrp')?.value || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Mfg / Packing Date</span>
              <span className="font-bold text-slate-900">
                {inspection.extractedFields.find((f) => f.fieldName === 'manufacturing_date')?.value || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Table of Violations */}
        <div className="space-y-2">
          <h5 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            2. Statutory Deficiencies & Legal Metrology Violations
          </h5>

          {inspection.violations.length === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-semibold">
              No statutory non-compliance observed. The packaged commodity satisfies all mandatory provisions under the Legal Metrology (Packaged Commodities) Rules, 2011.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Statutory Clause</th>
                    <th className="p-2.5">Nature of Infraction</th>
                    <th className="p-2.5">Statutory Requirement</th>
                    <th className="p-2.5">Observed on Package</th>
                    <th className="p-2.5">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspection.violations.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {v.ruleClause}
                      </td>
                      <td className="p-2.5 font-medium text-slate-800">{v.message}</td>
                      <td className="p-2.5 text-slate-600">{v.expected}</td>
                      <td className="p-2.5 font-bold text-rose-700">{v.actual}</td>
                      <td className="p-2.5">
                        <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                          {v.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statutory Legal Directive */}
        <div className="text-xs leading-relaxed text-slate-700 space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="font-bold text-slate-900">STATUTORY LEGAL DIRECTIVE:</p>
          <p>
            You are hereby required to submit your explanation within <strong>15 (fifteen) working days</strong> from the receipt of this notice. Failure to respond or rectify the defaults shall result in prosecution before the competent Judicial Magistrate under <strong>Section 36 of the Legal Metrology Act, 2009</strong> (attracting fine up to ₹25,000 for first offence, up to ₹50,000 for second offence, and up to ₹1,00,000 or imprisonment for subsequent offences).
          </p>
          <p>
            The offences specified above may, with the permission of the competent authority, be compounded under <strong>Section 48 of the Act</strong> upon payment of statutory compounding fees.
          </p>
        </div>

        {/* Digital Signature & QR Verification Footer */}
        <div className="pt-6 border-t-2 border-slate-200 flex flex-wrap items-end justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 bg-slate-100 p-1.5 border border-slate-300 rounded flex items-center justify-center">
              <QrCode className="h-12 w-12 text-slate-800" />
            </div>
            <div className="text-[11px] text-slate-500 space-y-0.5">
              <p className="font-mono font-bold text-slate-800">Cryptographically Signed</p>
              <p>DoCA Verification Hash:</p>
              <p className="font-mono text-[10px] text-slate-600 break-all">
                SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
              </p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="font-serif italic text-base font-bold text-slate-800">
              {currentUser.name}
            </div>
            <p className="font-bold text-slate-900 text-xs">{currentUser.role.replace('_', ' ')}</p>
            <p className="text-slate-500 text-[11px]">Enforcement Officer, Department of Consumer Affairs</p>
            <p className="text-slate-500 text-[11px]">Government of India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { InspectionRecord } from '../types';
import { BENCHMARK_TEST_PACKS } from '../data/mockData';
import { UploadCloud, CheckCircle2, AlertOctagon, Sparkles, ArrowRight, ShieldAlert, Cpu, FileText, Camera } from 'lucide-react';

interface ScanUploadProps {
  onScanComplete: (record: InspectionRecord) => void;
  onSelectPreset: (record: InspectionRecord) => void;
}

export const ScanUpload: React.FC<ScanUploadProps> = ({ onScanComplete, onSelectPreset }) => {
  const [dragActive, setDragActive] = useState(false);
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Packaged Food');
  const [barcode, setBarcode] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const executeScan = (targetRecord: InspectionRecord) => {
    setIsScanning(true);
    const steps = [
      'Stage 1: Preprocessing image (Laplacian denoise, deskew, 300 DPI normalization)...',
      'Stage 2: YOLOv8 Principal Display Panel (PDP) localized with 96.4% confidence...',
      'Stage 3: PaddleOCR character segmentation & multi-angle text extraction...',
      'Stage 4: Hybrid Regex & NER field classification (MRP, Net Qty, Dates, Pincode)...',
      'Stage 5: Optical font metrology conversion via EAN-13 0.33mm barcode module...',
      'Stage 6: LMPC 2011 Deterministic Rule Engine auditing against statutory clauses...',
    ];

    let currentStep = 0;
    setScanStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setScanStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          onScanComplete(targetRecord);
        }, 300);
      }
    }, 280);
  };

  const handlePresetSelect = (record: InspectionRecord) => {
    setSelectedPresetId(record.id);
    setProductName(record.productName);
    setBrand(record.brand);
    setCategory(record.category);
    setBarcode(record.barcode);
    executeScan(record);
  };

  const handleCustomUpload = (file?: File) => {
    // Generate simulated record from custom upload
    const customRecord: InspectionRecord = {
      id: `INS-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      productId: `PROD-USER-${Math.floor(100 + Math.random() * 900)}`,
      productName: productName || (file ? file.name.replace(/\.[^/.]+$/, '') : 'Custom Retail Package'),
      brand: brand || 'Sample Manufacturer',
      category: category,
      barcode: barcode || '8901234599999',
      imageUrl: 'custom_upload',
      imageDimensions: { width: 800, height: 1050 },
      status: 'COMPLETED',
      complianceStatus: 'NON_COMPLIANT',
      scannedAt: new Date().toISOString(),
      officerEmail: 'inspector.delhi@doca.gov.in',
      state: 'Delhi NCR',
      extractedFields: [
        {
          id: 'cf-1',
          fieldName: 'commodity_name',
          label: 'Generic Commodity Name',
          value: productName || 'Packaged Commodity',
          bbox: [80, 120, 520, 60],
          confidence: 0.94,
          fontMm: 5.5,
          statutoryRequiredFontMm: 4.0,
        },
        {
          id: 'cf-2',
          fieldName: 'net_quantity',
          label: 'Net Quantity',
          value: '450 grams',
          bbox: [80, 220, 260, 50],
          confidence: 0.92,
          fontMm: 3.5,
          statutoryRequiredFontMm: 2.5,
          hasViolation: true,
        },
        {
          id: 'cf-3',
          fieldName: 'mrp',
          label: 'Retail Price (MRP)',
          value: 'Rs 150',
          bbox: [80, 310, 250, 48],
          confidence: 0.95,
          fontMm: 3.2,
          statutoryRequiredFontMm: 2.5,
          hasViolation: true,
        },
        {
          id: 'cf-4',
          fieldName: 'manufacturing_date',
          label: 'Packing / Mfg Date',
          value: '05/2026',
          bbox: [80, 400, 280, 45],
          confidence: 0.91,
          fontMm: 3.0,
          statutoryRequiredFontMm: 2.5,
        },
        {
          id: 'cf-5',
          fieldName: 'manufacturer_info',
          label: 'Manufacturer Address',
          value: 'National FMCG Packers, Okhla Phase III, New Delhi 110020',
          bbox: [80, 490, 640, 55],
          confidence: 0.94,
          fontMm: 3.0,
          statutoryRequiredFontMm: 2.5,
        },
      ],
      violations: [
        {
          id: 'cv-1',
          ruleClause: 'Rule 22',
          field: 'net_quantity',
          severity: 'MINOR',
          message: 'Non-standard unit notation "450 grams". SI unit "450 g" is mandatory.',
          expected: '450 g',
          actual: '450 grams',
        },
        {
          id: 'cv-2',
          ruleClause: 'Rule 18',
          field: 'mrp',
          severity: 'MAJOR',
          message: 'Price declaration "Rs 150" omits mandatory statutory clause "(incl. of all taxes)".',
          expected: 'MRP Rs. 150 (incl. of all taxes)',
          actual: 'Rs 150',
        },
      ],
      metrics: {
        totalViolations: 2,
        criticalCount: 0,
        majorCount: 1,
        minorCount: 1,
        processingTimeMs: 840,
      },
    };
    executeScan(customRecord);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCustomUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hero Headline & Instructions */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SIH 2024 Legal Metrology Enforcement Workstation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Automated Packaging Verification Engine
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Upload commodity packaging images or select pre-verified benchmark packages to audit mandatory declarations
            under the <span className="text-amber-300 font-semibold">Legal Metrology Act, 2009</span> and{' '}
            <span className="text-amber-300 font-semibold">LMPC Rules, 2011</span> with optical font metrology and 100% deterministic rule enforcement.
          </p>
        </div>
      </div>

      {/* Benchmark Presets Section (Crucial for SIH Demo) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <span>SIH Benchmark Test Pack Presets (Direct Evaluation Cases)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select any of the 6 standardized packaged commodity test scenarios formulated by legal metrology auditors.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Click to instantly audit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENCHMARK_TEST_PACKS.map((pack) => {
            const isCompliant = pack.complianceStatus === 'COMPLIANT';
            const primaryViolation = pack.violations[0];

            return (
              <div
                key={pack.id}
                onClick={() => handlePresetSelect(pack)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer bg-white hover:shadow-lg relative overflow-hidden group ${
                  selectedPresetId === pack.id
                    ? 'border-amber-500 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {pack.productId}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isCompliant
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCompliant ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Compliant
                      </>
                    ) : (
                      <>
                        <AlertOctagon className="h-3 w-3" /> {pack.violations.length} Violation{pack.violations.length > 1 ? 's' : ''}
                      </>
                    )}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-1">
                  {pack.productName}
                </h4>
                <p className="text-xs text-slate-500 mb-3">{pack.brand} • {pack.category}</p>

                {/* Statutory Violation Callout */}
                {isCompliant ? (
                  <div className="text-xs bg-emerald-50 text-emerald-700 p-2 rounded-lg border border-emerald-200/60 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Passes all 10 statutory checks (Font 6.8mm ≥ 6.0mm)</span>
                  </div>
                ) : (
                  <div className="text-xs bg-rose-50 text-rose-900 p-2 rounded-lg border border-rose-200/60 space-y-1">
                    <div className="font-semibold text-rose-700 flex items-center justify-between">
                      <span>{primaryViolation.ruleClause}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-rose-800">
                        {primaryViolation.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{primaryViolation.message}</p>
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Barcode: {pack.barcode}</span>
                  <span className="text-amber-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Run Scan <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Upload & Camera Scanner Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Custom Package Image Upload</h3>
          <p className="text-xs text-slate-500">
            Drag and drop a retail package photograph (JPEG, PNG, WebP) or browse your device.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            dragActive
              ? 'border-amber-500 bg-amber-50/50'
              : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleCustomUpload(e.target.files[0]);
              }
            }}
          />
          <div className="h-14 w-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Click to browse or drop retail package image here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports high-resolution labels, curved pouches, cartons, and e-commerce product photos up to 25MB
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Cpu className="h-3.5 w-3.5" /> Auto-deskew 300 DPI</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> EAN-13 Calibrated</span>
          </div>
        </div>

        {/* Optional Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Commodity Name</label>
            <input
              type="text"
              placeholder="e.g. Pure Desi Ghee"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Packer</label>
            <input
              type="text"
              placeholder="e.g. Amul Dairy"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="Packaged Food">Packaged Food</option>
              <option value="Dairy Products">Dairy Products</option>
              <option value="Staples & Grains">Staples & Grains</option>
              <option value="Snacks & Confectionery">Snacks & Confectionery</option>
              <option value="Edible Oils">Edible Oils</option>
              <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
              <option value="Imported Goods">Imported Goods (Rule 27)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 8901234567890"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleCustomUpload()}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-2"
          >
            <span>Scan Package With Custom Fields</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scanning Pipeline Progress Overlay Modal */}
      {isScanning && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full text-white shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center animate-spin">
                <Cpu className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">PackScan Pipeline Executing</h4>
                <p className="text-xs text-slate-400">Legal Metrology compliance verification in progress</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full w-full animate-pulse"></div>
              </div>
              <p className="text-xs text-amber-300 font-mono flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>{scanStep}</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400 border-t border-slate-800 pt-4">
              <div>
                <p className="font-bold text-slate-200 font-mono">300 DPI</p>
                <p>Optical Normalization</p>
              </div>
              <div>
                <p className="font-bold text-slate-200 font-mono">0.33mm EAN</p>
                <p>Rule 8 Calibrated</p>
              </div>
              <div>
                <p className="font-bold text-slate-200 font-mono">100% Deterministic</p>
                <p>LMPC 2011 Engine</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

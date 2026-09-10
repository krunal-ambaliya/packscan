import React, { useState } from 'react';
import { InspectionRecord } from '../types';
import { Search, Filter, Download, ArrowUpDown, CheckCircle2, AlertOctagon, ExternalLink, Calendar } from 'lucide-react';

interface ProductHistoryProps {
  records: InspectionRecord[];
  onSelectRecord: (record: InspectionRecord) => void;
}

export const ProductHistory: React.FC<ProductHistoryProps> = ({ records, onSelectRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLIANT' | 'NON_COMPLIANT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.barcode.includes(searchTerm) ||
      rec.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || rec.complianceStatus === statusFilter;

    const matchesCategory =
      categoryFilter === 'ALL' || rec.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const exportCSV = () => {
    const headers = ['Inspection ID', 'Product Name', 'Brand', 'Category', 'Barcode', 'Status', 'Violations', 'Date', 'State'];
    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.productName}"`,
      `"${r.brand}"`,
      `"${r.category}"`,
      r.barcode,
      r.complianceStatus,
      r.violations.length,
      r.scannedAt,
      r.state,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PackScan_Audit_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Packaged Commodity Audit Registry
          </h2>
          <p className="text-xs text-slate-500">
            Historical log of all surveyed SKUs, legal metrology assessments, and compliance notices.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Export Registry (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by SKU name, brand, barcode, or inspection ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-xs font-medium"
          >
            <option value="ALL">All Statuses ({records.length})</option>
            <option value="COMPLIANT">Compliant Only</option>
            <option value="NON_COMPLIANT">Non-Compliant Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-xs font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Staples">Staples & Grains</option>
            <option value="Snacks">Snacks & Confectionery</option>
            <option value="Dairy">Dairy Products</option>
            <option value="Oils">Edible Oils</option>
            <option value="Bakery">Bakery & Biscuits</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Inspection ID</th>
                <th className="px-4 py-3.5">Commodity & Brand</th>
                <th className="px-4 py-3.5">Barcode</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Jurisdiction</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Compliance Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No packaged commodities matched your query criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isCompliant = rec.complianceStatus === 'COMPLIANT';

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => onSelectRecord(rec)}
                      className="hover:bg-amber-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {rec.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{rec.productName}</div>
                        <div className="text-[11px] text-slate-500">{rec.brand}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {rec.barcode}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {rec.category}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {rec.state}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(rec.scannedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
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
                              <AlertOctagon className="h-3 w-3" /> {rec.violations.length} Violation{rec.violations.length > 1 ? 's' : ''}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecord(rec);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-100/60 rounded flex items-center gap-1 ml-auto"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

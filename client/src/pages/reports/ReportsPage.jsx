import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'sonner';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CheckCircle2,
  Table,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';

const ReportsPage = () => {
  const { business } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleExport = async (reportType = 'full') => {
    setDownloading(true);
    toast.info('Generating formatted Excel spreadsheet...');
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/reports/export?${params.toString()}`, {
        responseType: 'blob',
      });

      // Trigger browser file download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `StartUp_${business?.name || 'Store'}_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Excel workbook downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate Excel report.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Business Reports & Excel Exports</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export institutional-grade .xlsx spreadsheets formatted with executive KPI cards, transaction logs, inventory valuations, and expense sheets.
        </p>
      </div>

      {/* Date Range Selection Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
          <Calendar className="h-4 w-4 text-brand-500" />
          <span>Report Date Range (Optional)</span>
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-2xl">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Reset to All Time
            </button>
          </div>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Full Comprehensive Report */}
        <div className="rounded-2xl border border-brand-500/30 bg-white p-6 shadow-md dark:border-brand-500/20 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 mb-4">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              RECOMMENDED
            </span>
            <h3 className="mt-2 text-base font-extrabold text-slate-900 dark:text-white">
              Executive Multi-Sheet Business Workbook
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Complete multi-tab workbook (.xlsx) including Executive Summary KPI metrics, full Transaction journal, Product Inventory valuations, and Operating Expense audit.
            </p>

            <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Sheet 1: Executive Financial KPI Summary</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Sheet 2: Detailed Sales Transactions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Sheet 3: Inventory Stock & Cost Valuation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Sheet 4: Operating Expenses Breakdown</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleExport('full')}
              disabled={downloading}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-500 disabled:opacity-50 transition"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Building Spreadsheet...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export Full .XLSX Workbook</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Overview Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
              <Table className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Spreadsheet Engineering Standards
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Every export is generated natively on the server using ExcelJS to guarantee accounting accuracy, anti-injection hygiene, and clean formatting for external CPAs and BIR tax filings.
            </p>

            <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-slate-950">
              <div className="flex items-start space-x-2">
                <Sparkles className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Branded Formatting</p>
                  <p className="text-[11px] text-slate-500">Headers with brand fill, bold titles, and currency number formats (₱#,##0.00).</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Layers className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Freeze Panes & Auto-Filters</p>
                  <p className="text-[11px] text-slate-500">Top table headers are frozen with active Excel auto-filters for instant column sorting.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            Compliant with Microsoft Excel, Google Sheets, and Apple Numbers.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

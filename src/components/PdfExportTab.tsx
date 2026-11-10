import React, { useState } from 'react';
import { 
  FileDown, 
  Share2, 
  Printer, 
  Smartphone, 
  Check, 
  Download, 
  Upload, 
  FileCheck2
} from 'lucide-react';
import { Catalog, ExportFormat } from '../types';
import { downloadCatalogPdf, shareCatalogPdf } from '../utils/pdfGenerator';
import { exportAllCatalogsBackup, importCatalogsBackup } from '../db/storage';

interface PdfExportTabProps {
  catalog: Catalog;
  totalPages: number;
  onRefreshCatalogs: () => void;
}

export const PdfExportTab: React.FC<PdfExportTabProps> = ({
  catalog,
  totalPages,
  onRefreshCatalogs,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; status: string } | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      await downloadCatalogPdf(catalog, format, (current, total, status) => {
        setExportProgress({ current, total, status });
      });
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    try {
      const shared = await shareCatalogPdf(catalog, 'light', (current, total, status) => {
        setExportProgress({ current, total, status });
      });
      if (!shared) {
        await downloadCatalogPdf(catalog, 'light');
      }
    } catch (err: any) {
      console.error('Share error:', err);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleExportBackup = async () => {
    try {
      setBackupStatus('Preparing backup archive...');
      const backup = await exportAllCatalogsBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalog-express-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setBackupStatus('Backup downloaded successfully!');
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (err: any) {
      setBackupStatus('Backup failed: ' + err.message);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setBackupStatus('Importing catalogues & images...');
        const json = JSON.parse(event.target?.result as string);
        const count = await importCatalogsBackup(json);
        onRefreshCatalogs();
        setBackupStatus(`Successfully restored ${count} catalogue(s)!`);
        setTimeout(() => setBackupStatus(null), 3000);
      } catch (err: any) {
        setBackupStatus('Import error: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5 max-w-4xl animate-fade-in">
      {/* Overview & Paper Size Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Download your catalogue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {catalog.products.length} product(s) · {totalPages} page(s) · Ready for UK & International distribution
          </p>
        </div>

        {/* Paper Size: Strictly A4 for UK Market */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <FileCheck2 className="w-4 h-4 text-blue-600" />
          <div className="text-xs">
            <span className="font-bold text-slate-800">Paper size: </span>
            <span className="font-semibold text-blue-600">A4 (210 × 297 mm)</span>
          </div>
        </div>
      </div>

      {/* Progress Overlay */}
      {isExporting && exportProgress && (
        <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-700">{exportProgress.status}</span>
            <span className="font-mono font-semibold text-slate-600">
              {Math.round((exportProgress.current / exportProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-200"
              style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Export Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tier 1: Light PDF (WhatsApp & Email) */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-6 flex flex-col justify-between transition-all shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                Optimised ~1–3 MB
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Light PDF (WhatsApp & Email)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Small file with compressed images – quick to send on WhatsApp, email, Messenger, or Instagram DMs.
              </p>
            </div>

            <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>UK Standard A4 layout ({totalPages} {totalPages === 1 ? 'page' : 'pages'})</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant generation & compact file size</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 flex items-center gap-2">
            <button
              onClick={() => handleExport('light')}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              Download Light PDF
            </button>

            <button
              onClick={handleShare}
              disabled={isExporting}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
              title="Share via device menu"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier 2: Print PDF (High Resolution ~300 DPI) */}
        <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-6 flex flex-col justify-between transition-all shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                High Quality ~300 DPI
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">High Quality PDF (For Printing)</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                High-resolution images for printing at home or at a print shop, on standard A4 paper.
              </p>
            </div>

            <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Ultra-sharp typography & crisp vector rendering</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Full gallery lookbook & cover presentation</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleExport('print')}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Download High Quality PDF
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Backup & Move to Another Device</h4>
          <span className="text-[11px] text-slate-500 font-mono">JSON Format v2</span>
        </div>

        <p className="text-xs text-slate-500">
          Download this catalogue (with all photos) as a JSON backup file. Open Catalog Express on your other phone or computer and tap Import backup.
        </p>

        {backupStatus && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
            {backupStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Backup (.json)
          </button>

          <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

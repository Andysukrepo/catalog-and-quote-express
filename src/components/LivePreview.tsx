import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  RefreshCw
} from 'lucide-react';
import { Catalog } from '../types';
import { computeCatalogPages, renderCatalogPageToCanvas, PageDefinition } from '../utils/canvasRenderer';

interface LivePreviewProps {
  catalog: Catalog;
  currentPageIndex: number;
  onPageChange: (idx: number) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  catalog,
  currentPageIndex,
  onPageChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderSeqRef = useRef(0);

  // Memoize computed pages based strictly on catalog object
  const pages = useMemo(() => computeCatalogPages(catalog), [catalog]);
  const totalPages = pages.length;

  const safePageIndex = Math.max(0, Math.min(currentPageIndex, totalPages - 1));
  const currentPageDef = pages[safePageIndex] || pages[0];

  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !currentPageDef) return;

    const currentSeq = ++renderSeqRef.current;
    setIsRendering(true);

    renderCatalogPageToCanvas(canvas, catalog, currentPageDef, totalPages, 2)
      .catch((err) => {
        if (!isCancelled) console.error('Canvas render error:', err);
      })
      .finally(() => {
        if (!isCancelled && renderSeqRef.current === currentSeq) {
          setIsRendering(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [catalog, safePageIndex, totalPages]);

  const handlePrev = () => {
    if (safePageIndex > 0) onPageChange(safePageIndex - 1);
  };

  const handleNext = () => {
    if (safePageIndex < totalPages - 1) onPageChange(safePageIndex + 1);
  };

  const getPageTypeLabel = (p?: PageDefinition) => {
    if (!p) return 'Page';
    if (p.type === 'cover') return 'Front Cover';
    if (p.type === 'quote') return 'Quote & Estimate';
    if (p.type === 'back') return 'Back Cover';
    return `Page ${p.catalogPageIndex} (${p.products.length} Products)`;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col h-full shadow-xs">
      {/* Top Header of Preview */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">LIVE PREVIEW</span>
          {isRendering && <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-semibold text-slate-500">
            {totalPages} {totalPages === 1 ? 'page' : 'pages'} · A4
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            {getPageTypeLabel(currentPageDef)}
          </span>
        </div>
      </div>

      {/* Interactive A4 Document Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative bg-slate-50/60 rounded-lg my-2 sm:my-3 border border-slate-100">
        <div className="relative shadow-md rounded-xs overflow-hidden bg-white w-full max-w-[420px] lg:max-w-none max-h-[68vh] sm:max-h-[66vh] aspect-[210/297] flex items-center justify-center border border-slate-300">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block"
          />
        </div>
      </div>

      {/* Page Navigation & Strip */}
      <div className="pt-2 border-t border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={safePageIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            {safePageIndex + 1} / {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={safePageIndex === totalPages - 1}
            className="flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Page Dots Strip */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-0.5">
          {pages.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onPageChange(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === safePageIndex
                  ? 'w-6 bg-blue-600'
                  : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Jump to Page ${idx + 1} (${p.type})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Catalog, Product, Branding, DesignSettings } from './types';
import { 
  getAllCatalogs, 
  saveCatalog, 
  deleteCatalog, 
  seedInitialCatalogIfEmpty, 
  createNewCatalog,
  createSublimationDemoCatalog
} from './db/storage';
import { downloadCatalogPdf } from './utils/pdfGenerator';
import { computeCatalogPages } from './utils/canvasRenderer';

import { TopBar, ActiveTab } from './components/TopBar';
import { ProductsTab } from './components/ProductsTab';
import { BusinessTab } from './components/BusinessTab';
import { DesignTab } from './components/DesignTab';
import { PdfExportTab } from './components/PdfExportTab';
import { LivePreview } from './components/LivePreview';
import { CatalogListModal } from './components/CatalogListModal';
import { WalkthroughTourModal } from './components/WalkthroughTourModal';
import { Eye, ArrowLeft, FileDown } from 'lucide-react';

export default function App() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [currentCatalogId, setCurrentCatalogId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [previewPageIndex, setPreviewPageIndex] = useState<number>(0);

  const [isCatalogManagerOpen, setIsCatalogManagerOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isQuickExporting, setIsQuickExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh catalogs list without re-triggering mount loops
  const refreshCatalogs = useCallback(async () => {
    try {
      const list = await getAllCatalogs();
      setCatalogs(list);
    } catch (err) {
      console.error('Failed to refresh catalogs:', err);
    }
  }, []);

  // Initial load only once on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const active = await seedInitialCatalogIfEmpty();
        const list = await getAllCatalogs();
        if (isMounted) {
          setCatalogs(list);
          if (active) {
            setCurrentCatalogId(active.id);
          }
        }
      } catch (err) {
        console.error('Failed to load catalogs on mount:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentCatalog = catalogs.find((c) => c.id === currentCatalogId) || catalogs[0];

  // Helper to persist catalog changes
  const updateCurrentCatalog = useCallback(async (updated: Catalog) => {
    setCatalogs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    await saveCatalog(updated);
  }, []);

  const handleUpdateProducts = (products: Product[]) => {
    if (!currentCatalog) return;
    updateCurrentCatalog({
      ...currentCatalog,
      products,
    });
  };

  const handleUpdateBranding = (patch: Partial<Branding>) => {
    if (!currentCatalog) return;
    updateCurrentCatalog({
      ...currentCatalog,
      branding: { ...currentCatalog.branding, ...patch },
    });
  };

  const handleUpdateDesign = (patch: Partial<DesignSettings>) => {
    if (!currentCatalog) return;
    updateCurrentCatalog({
      ...currentCatalog,
      design: { ...currentCatalog.design, ...patch },
    });
  };

  // Catalog Management Handlers
  const handleCreateNewCatalog = async () => {
    const newCat = createNewCatalog(`Art Collection ${catalogs.length + 1}`);
    await saveCatalog(newCat);
    await refreshCatalogs();
    setCurrentCatalogId(newCat.id);
    setIsCatalogManagerOpen(false);
  };

  const handleDuplicateCatalog = async (id: string) => {
    const source = catalogs.find((c) => c.id === id);
    if (!source) return;
    const duplicated: Catalog = {
      ...source,
      id: 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: `${source.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      branding: { ...source.branding, catalogTitle: `${source.branding.catalogTitle} (Copy)` },
      products: source.products.map((p) => ({ ...p, id: 'prod_' + Math.random().toString(36).substring(2, 8) })),
    };
    await saveCatalog(duplicated);
    await refreshCatalogs();
  };

  const handleDeleteCatalog = async (id: string) => {
    await deleteCatalog(id);
    const list = await getAllCatalogs();
    setCatalogs(list);
    if (currentCatalogId === id && list.length > 0) {
      setCurrentCatalogId(list[0].id);
    }
  };

  const handleRenameCatalog = async (id: string, newTitle: string) => {
    const target = catalogs.find((c) => c.id === id);
    if (!target) return;
    const updated = { ...target, title: newTitle, branding: { ...target.branding, catalogTitle: newTitle } };
    await saveCatalog(updated);
    await refreshCatalogs();
  };

  const handleQuickExport = async () => {
    if (!currentCatalog) return;
    setIsQuickExporting(true);
    try {
      await downloadCatalogPdf(currentCatalog, 'light');
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    } finally {
      setIsQuickExporting(false);
    }
  };

  const handleLoadDemoCatalog = async () => {
    setIsLoading(true);
    try {
      const demoCat = await createSublimationDemoCatalog();
      const list = await getAllCatalogs();
      setCatalogs(list);
      setCurrentCatalogId(demoCat.id);
      setActiveTab('products');
    } catch (err) {
      console.error('Failed to load sublimation demo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileView('editor');
  };

  if (isLoading || !currentCatalog) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Catalog Express...</span>
        </div>
      </div>
    );
  }

  const computedPages = computeCatalogPages(currentCatalog);
  const totalPages = computedPages.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600/10 selection:text-blue-900">
      {/* Persistent Global Navigation */}
      <TopBar
        currentCatalog={currentCatalog}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        mobileView={mobileView}
        onSelectMobileView={(view) => setMobileView(view)}
        onOpenCatalogManager={() => setIsCatalogManagerOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onQuickExport={handleQuickExport}
        onLoadDemo={handleLoadDemoCatalog}
        isGeneratingPdf={isQuickExporting}
        totalProducts={currentCatalog.products.length}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start pb-20 lg:pb-6">
        {/* Left Column: Active Workspace Tab (7 cols on Desktop, toggled on mobile) */}
        <div className={`lg:col-span-7 xl:col-span-7 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {activeTab === 'products' && (
            <ProductsTab
              products={currentCatalog.products}
              currencySymbol={currentCatalog.design.currency === 'CUSTOM' ? currentCatalog.design.customCurrencySymbol || '' : currentCatalog.design.currency}
              onUpdateProducts={handleUpdateProducts}
            />
          )}

          {activeTab === 'business' && (
            <BusinessTab
              branding={currentCatalog.branding}
              onChange={handleUpdateBranding}
            />
          )}

          {activeTab === 'design' && (
            <DesignTab
              design={currentCatalog.design}
              onChange={handleUpdateDesign}
            />
          )}

          {activeTab === 'export' && (
            <PdfExportTab
              catalog={currentCatalog}
              totalPages={totalPages}
              onRefreshCatalogs={refreshCatalogs}
            />
          )}
        </div>

        {/* Right Column: Live Interactive Canvas Preview (5 cols on Desktop, sticky, toggled on mobile) */}
        <div className={`lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20 ${mobileView === 'editor' ? 'hidden lg:block' : 'block'}`}>
          {/* Mobile Back-to-Editor Quick Navigation Bar */}
          <div className="lg:hidden flex items-center justify-between bg-white p-2.5 px-3.5 rounded-xl border border-slate-200 shadow-2xs mb-3">
            <button
              onClick={() => setMobileView('editor')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Editor</span>
            </button>
            <span className="text-xs font-mono font-bold text-slate-600">
              Page {previewPageIndex + 1} of {totalPages}
            </span>
            <button
              onClick={handleQuickExport}
              disabled={isQuickExporting}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>

          <LivePreview
            catalog={currentCatalog}
            currentPageIndex={previewPageIndex}
            onPageChange={setPreviewPageIndex}
          />
        </div>
      </main>

      {/* Floating Mobile Preview Toggle Pill (Only on mobile when in editor mode) */}
      {mobileView === 'editor' && (
        <button
          onClick={() => setMobileView('preview')}
          className="lg:hidden fixed bottom-4 right-4 z-40 bg-slate-900 hover:bg-slate-800 text-white shadow-xl px-4 py-2.5 rounded-full flex items-center gap-2 font-bold text-xs border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
          title="View live A4 preview"
        >
          <Eye className="w-4 h-4 text-blue-400" />
          <span>Live Preview ({previewPageIndex + 1}/{totalPages})</span>
        </button>
      )}

      {/* Modals */}
      <CatalogListModal
        isOpen={isCatalogManagerOpen}
        onClose={() => setIsCatalogManagerOpen(false)}
        catalogs={catalogs}
        currentCatalogId={currentCatalog.id}
        onSelectCatalog={(id) => setCurrentCatalogId(id)}
        onCreateNew={handleCreateNewCatalog}
        onDuplicate={handleDuplicateCatalog}
        onDelete={handleDeleteCatalog}
        onRename={handleRenameCatalog}
        onRefreshList={refreshCatalogs}
      />

      <WalkthroughTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { 
  FolderKanban, 
  Building2, 
  Palette, 
  FileDown, 
  Eye, 
  ChevronDown, 
  Image as ImageIcon,
  Sparkles,
  Menu,
  X,
  MoreVertical
} from 'lucide-react';
import { Catalog } from '../types';

export type ActiveTab = 'products' | 'business' | 'design' | 'export';

export interface TopBarProps {
  currentCatalog: Catalog;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileView?: 'editor' | 'preview';
  onSelectMobileView?: (view: 'editor' | 'preview') => void;
  onOpenCatalogManager: () => void;
  onOpenTour?: () => void;
  onQuickExport: () => void;
  onLoadDemo?: () => void;
  isGeneratingPdf: boolean;
  totalProducts: number;
}

interface NavTabItem {
  id: ActiveTab;
  label: string;
  icon: any;
  badge?: number;
  isSpecial?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentCatalog,
  activeTab,
  setActiveTab,
  mobileView = 'editor',
  onSelectMobileView,
  onOpenCatalogManager,
  onOpenTour,
  onQuickExport,
  onLoadDemo,
  isGeneratingPdf,
  totalProducts,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs: NavTabItem[] = [
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'products', label: 'Products', icon: ImageIcon, badge: totalProducts },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'export', label: 'PDF Export', icon: FileDown },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    onSelectMobileView?.('editor');
    setIsMobileMenuOpen(false);
  };

  const handleMobilePreviewClick = () => {
    onSelectMobileView?.(mobileView === 'preview' ? 'editor' : 'preview');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-6 py-2 lg:py-2.5">
        {/* DESKTOP BAR (lg screens and up) */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          {/* Left: App Identity & Branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2.5">
              <img 
                src="/assets/aistudio/TMMLOGO_9668d369.png" 
                alt="This Man Makes" 
                className="w-8.5 h-8.5 rounded-full object-contain shrink-0"
              />
              <div className="min-w-0">
                <span className="text-sm font-bold text-slate-900 tracking-tight leading-none block">
                  Catalog and Quote Express by This Man Makes
                </span>
                <span className="text-[11px] text-slate-500 font-medium leading-tight block mt-0.5">
                  Create Printable Catalogs and Quotes
                </span>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 mx-1" />

            {/* Catalog Switcher Button */}
            <button
              onClick={onOpenCatalogManager}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-all text-xs font-semibold max-w-[210px] md:max-w-[260px] shadow-2xs cursor-pointer"
              title="Switch or manage catalogs"
            >
              <FolderKanban className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{currentCatalog.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
            </button>

            {/* Saved Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SAVED</span>
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/90 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                      isActive ? 'bg-slate-100 text-slate-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400 text-xs font-bold transition-all shadow-2xs group cursor-pointer"
                title="Interactive 180-second guided tour of Catalog & Quote Express"
              >
                <span className="text-sm">🎯</span>
                <span>180s Tour</span>
                <span className="px-1.5 py-0.2 bg-amber-200 text-amber-950 text-[10px] rounded uppercase font-extrabold tracking-wider">
                  3 MIN
                </span>
              </button>
            )}

            {onLoadDemo && (
              <button
                onClick={onLoadDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 hover:border-pink-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Load full 12-item demo collection"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                <span>Load Demo Content</span>
              </button>
            )}

            <button
              onClick={onQuickExport}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download A4 PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE & TABLET BAR (< lg screens) */}
        <div className="lg:hidden flex flex-col gap-2">
          {/* Top Row: Brand + Switcher + Action Icons + Menu */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img 
                src="/assets/aistudio/TMMLOGO_9668d369.png" 
                alt="This Man Makes" 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block truncate">
                  Catalog & Quote
                </span>
                <span className="text-[10px] text-slate-500 font-medium block truncate">
                  by This Man Makes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Compact Catalog Switcher */}
              <button
                onClick={onOpenCatalogManager}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium max-w-[120px] sm:max-w-[160px] truncate transition-colors cursor-pointer"
                title="Switch catalogue"
              >
                <FolderKanban className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate text-[11px] font-semibold">{currentCatalog.title}</span>
              </button>

              {/* Quick Tour Button */}
              {onOpenTour && (
                <button
                  onClick={onOpenTour}
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  title="180s Tour"
                >
                  <span className="text-xs">🎯</span>
                </button>
              )}

              {/* Quick PDF Export */}
              <button
                onClick={onQuickExport}
                disabled={isGeneratingPdf}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                title="Download A4 PDF"
              >
                {isGeneratingPdf ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline text-[11px]">PDF</span>
              </button>

              {/* More Actions Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="More actions"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bottom Row: Mobile Navigation Tabs Strip */}
          <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && mobileView === 'editor';
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="text-[11px] sm:text-xs truncate">{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="text-[10px] font-mono opacity-70">
                      ({tab.badge})
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Dedicated Live Preview Tab */}
            <button
              onClick={handleMobilePreviewClick}
              className={`flex-1 min-w-[75px] flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mobileView === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold">Preview</span>
            </button>
          </nav>

          {/* Mobile Dropdown Menu Sheet */}
          {isMobileMenuOpen && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 shadow-lg animate-fade-in mt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Quick Actions
              </div>

              {onLoadDemo && (
                <button
                  onClick={() => {
                    onLoadDemo();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-pink-700 text-xs font-bold border border-slate-200 transition-colors shadow-2xs cursor-pointer text-left"
                >
                  <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
                  <div>
                    <div>Load Sublimation Demo Content</div>
                    <div className="text-[10px] font-normal text-slate-500">12 pre-configured gift items & £ pricing</div>
                  </div>
                </button>
              )}

              {onOpenTour && (
                <button
                  onClick={() => {
                    onOpenTour();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-amber-900 text-xs font-bold border border-slate-200 transition-colors shadow-2xs cursor-pointer text-left"
                >
                  <span className="text-sm shrink-0">🎯</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>180s Guided Walkthrough</span>
                      <span className="px-1.5 py-0.2 bg-amber-200 text-amber-950 text-[9px] rounded font-mono font-extrabold">3 MIN</span>
                    </div>
                    <div className="text-[10px] font-normal text-slate-500">Learn all features in 5 quick steps</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenCatalogManager();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs cursor-pointer text-left"
              >
                <FolderKanban className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-bold">Manage & Backup Catalogues</div>
                  <div className="text-[10px] font-normal text-slate-500">Create, switch, duplicate, or export JSON</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Image as ImageIcon, 
  Palette, 
  Receipt, 
  FileDown, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Sparkles,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ActiveTab } from './TopBar';

interface WalkthroughTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
}

interface TourStep {
  id: number;
  tab: ActiveTab;
  badge: string;
  duration: string;
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  points: { title: string; desc: string }[];
  proTip: string;
  actionLabel?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    tab: 'business',
    badge: 'Step 1 of 5 · 35s',
    duration: '~35 seconds',
    title: 'Brand Identity & Direct Order Channels',
    subtitle: 'Upload your studio hallmark and configure direct customer order routes.',
    icon: Building2,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    points: [
      {
        title: 'Studio Hallmark / Brand Logo',
        desc: 'Upload transparent PNG, JPG, or SVG logos. Your round hallmark sits directly on the dark cover and headers with zero white boxes.'
      },
      {
        title: 'Studio Details & Cover Title',
        desc: 'Set your studio name ("This Man Makes"), tagline, front cover catalogue title, and edition/season subtitle.'
      },
      {
        title: 'Direct Inquiries & Socials',
        desc: 'Configure WhatsApp, Email, Instagram, Facebook, TikTok, and your UK showroom/dispatch address.'
      }
    ],
    proTip: 'Leave any social field empty to automatically hide it from the catalogue footer.'
  },
  {
    id: 2,
    tab: 'products',
    badge: 'Step 2 of 5 · 40s',
    duration: '~40 seconds',
    title: 'Sublimation & Gift Products Management',
    subtitle: 'Add items, configure £ GBP pricing, SKU codes, and reorder products seamlessly.',
    icon: ImageIcon,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    points: [
      {
        title: 'Sublimation Giftware Mockups',
        desc: 'Display high-resolution mockups for ceramic mugs, insulated tumblers, tees, tote bags, and cushions.'
      },
      {
        title: 'Pricing & Specifications',
        desc: 'Set prices in £ (GBP), assign SKU codes (e.g. MUG-001), specify categories, and list available sizes.'
      },
      {
        title: 'Instant Drag & Drop Reordering',
        desc: 'Drag the handle next to any product to change its position in the catalogue grid in real-time.'
      }
    ],
    proTip: 'Tap "Load Demo Content" in the top bar anytime to restore 12 pre-configured sublimation gift items.'
  },
  {
    id: 3,
    tab: 'design',
    badge: 'Step 3 of 5 · 35s',
    duration: '~35 seconds',
    title: 'Curated A4 Layouts & Color Palettes',
    subtitle: 'Choose between 4 professional grid formats and fine art color palettes.',
    icon: Palette,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    points: [
      {
        title: '4 Standard A4 Grid Layouts',
        desc: 'Switch between Grid 3×3 (9 items/page), Grid 2×2 (4 large items), Editorial List (5 rows with descriptions), and Exhibition Lookbook (1 hero item).'
      },
      {
        title: 'Fine Art Palettes & Custom Colors',
        desc: 'Select from Berry Night, Noir Atelier, Warm Terracotta, or pick custom hex colors for headings, accents, and backgrounds.'
      },
      {
        title: 'Typography & Photo Fit Mode',
        desc: 'Choose between Modern Sans, Classic Serif, Editorial, and Boutique font pairings. Toggle Contain vs. Cover photo bleed.'
      }
    ],
    proTip: 'Every layout strictly adheres to standard ISO 216 A4 dimensions (210 × 297 mm).'
  },
  {
    id: 4,
    tab: 'design',
    badge: 'Step 4 of 5 · 40s',
    duration: '~40 seconds',
    title: 'Official Quotation & Price Estimation Page',
    subtitle: 'Generate a dedicated commercial order schedule with No Minimum Required.',
    icon: Receipt,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    points: [
      {
        title: 'No Minimum Required Policy',
        desc: 'Minimum Order Quantity defaults to "No Minimum Required" so customers can order any quantity with complete confidence.'
      },
      {
        title: 'Itemised Pricing Schedule',
        desc: 'Automatically generates a structured table listing all items, SKUs, categories, and unit prices in £.'
      },
      {
        title: 'Commercial Terms & Client Sign-Off',
        desc: 'Set Quote Ref # (QT-2026-001), validity period, production turnaround (5–7 days), UK dispatch notes, and dual acceptance signature lines.'
      }
    ],
    proTip: 'The quote page integrates directly before the back cover in both live preview and PDF export.'
  },
  {
    id: 5,
    tab: 'export',
    badge: 'Step 5 of 5 · 30s',
    duration: '~30 seconds',
    title: 'Live Preview & High-Resolution A4 Export',
    subtitle: 'Review each page in real-time and download print-ready A4 PDF documents.',
    icon: FileDown,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    points: [
      {
        title: 'Real-Time A4 Live Preview',
        desc: 'Inspect your Front Cover, Product Pages, Official Quotation Schedule, and Back Cover with pixel accuracy.'
      },
      {
        title: 'Light PDF vs. 300 DPI Print PDF',
        desc: 'Download a lightweight compressed PDF for WhatsApp & email, or a crystal-clear 300 DPI version for commercial printers.'
      },
      {
        title: 'Complete Catalog Backups',
        desc: 'Export a full standalone JSON backup including all high-resolution product photos to restore or migrate anytime.'
      }
    ],
    proTip: 'Use the "Download A4 PDF" button in the top bar for instant 1-click export from any view.'
  }
];

export const WalkthroughTourModal: React.FC<WalkthroughTourModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Sync background tab to current tour step
      onSelectTab(TOUR_STEPS[currentStepIndex].tab);
    }
  }, [isOpen, currentStepIndex, onSelectTab]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onSelectTab(TOUR_STEPS[nextIdx].tab);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onSelectTab(TOUR_STEPS[prevIdx].tab);
    }
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
    onSelectTab(TOUR_STEPS[index].tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  180s Guided Walkthrough
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                  3 MIN TOUR
                </span>
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Catalog & Quote Express by This Man Makes
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close walkthrough"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar (5 Steps) */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-1">
            {TOUR_STEPS.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => handleJumpToStep(idx)}
                  className={`h-2 rounded-full transition-all flex-1 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 ring-2 ring-blue-300'
                      : isCompleted
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Step ${idx + 1}: ${step.title}`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-600 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentStep.duration}</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step Header */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${currentStep.iconBg} ${currentStep.iconColor} flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs`}>
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                {currentStep.badge}
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-600 leading-normal">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Key Feature Highlights */}
          <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            {currentStep.points.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-normal">
                  <span className="font-bold text-slate-900">{pt.title}: </span>
                  <span className="text-slate-600">{pt.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip Box */}
          <div className="flex items-start gap-2.5 bg-amber-50/80 p-3 rounded-lg border border-amber-200/90 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">PRO TIP: </span>
              <span>{currentStep.proTip}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Skip Walkthrough
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>{isLast ? 'Complete Tour & Start' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

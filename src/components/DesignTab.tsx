import React from 'react';
import { 
  Palette, 
  LayoutGrid, 
  Type, 
  Check, 
  BookOpen, 
  Columns3, 
  List, 
  Sliders,
  Receipt,
  Pipette,
  Sparkles
} from 'lucide-react';
import { DesignSettings, LayoutType, FontPreset } from '../types';
import { PALETTES } from '../db/storage';

const QUICK_ACCENTS = [
  { name: 'Berry Magenta', hex: '#FF0080' },
  { name: 'Warm Amber', hex: '#D97706' },
  { name: 'Luxury Gold', hex: '#B45309' },
  { name: 'British Racing Green', hex: '#1B4332' },
  { name: 'Forest Sage', hex: '#2D6A4F' },
  { name: 'Royal Cobalt', hex: '#2563EB' },
  { name: 'Midnight Navy', hex: '#0F172A' },
  { name: 'Velvet Plum', hex: '#7C3AED' },
  { name: 'Rose Coral', hex: '#F43F5E' },
  { name: 'Teal Emerald', hex: '#0D9488' },
  { name: 'Crimson Burgundy', hex: '#7B1113' },
  { name: 'Jet Obsidian', hex: '#111827' },
];

const isValidHex = (hex: string): boolean => {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
};

interface DesignTabProps {
  design: DesignSettings;
  onChange: (patch: Partial<DesignSettings>) => void;
}

const LAYOUTS: { id: LayoutType; name: string; desc: string; icon: any; count: string }[] = [
  { id: 'grid2', name: 'Grid 2×2 (Large)', desc: '4 prominent artworks per page. Balanced for wall art collections.', icon: LayoutGrid, count: '4 / page' },
  { id: 'grid3', name: 'Grid 3×3 (Compact)', desc: '9 items per page. Great for large volume catalogues & trade print shops.', icon: Columns3, count: '9 / page' },
  { id: 'list', name: 'Editorial List', desc: '5 rows per page with descriptions, specifications, and prices.', icon: List, count: '5 / page' },
  { id: 'lookbook', name: 'Exhibition Lookbook', desc: '1 hero artwork per page with curatorial gallery plaque.', icon: BookOpen, count: '1 / page' },
];

const FONTS: { id: FontPreset; name: string; sample: string; desc: string }[] = [
  { id: 'classic', name: 'Classic Serif', sample: 'Playfair Display', desc: 'Sophisticated & timeless museum aesthetic' },
  { id: 'modern', name: 'Modern Sans', sample: 'Plus Jakarta Sans', desc: 'Clean, legible Scandinavian design' },
  { id: 'editorial', name: 'Editorial Luxury', sample: 'Cinzel / Roman', desc: 'Architectural, high-end gallery finish' },
  { id: 'boutique', name: 'Boutique Grotesk', sample: 'Space Grotesk', desc: 'Contemporary creative studio character' },
];

const CURRENCIES = ['£', '¢'];

export const DesignTab: React.FC<DesignTabProps> = ({ design, onChange }) => {
  const handleSelectPalette = (paletteId: string) => {
    const p = PALETTES.find((item) => item.id === paletteId);
    if (!p) return;
    onChange({
      paletteId: p.id,
      primaryColor: p.primary,
      accentColor: p.accent,
      backgroundColor: p.bg,
      cardBackgroundColor: p.cardBg,
      borderColor: p.border,
    });
  };

  return (
    <div className="space-y-5 max-w-4xl animate-fade-in">
      {/* 1. Page Layout */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Catalogue Page Layout</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Standard A4 grid formats</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LAYOUTS.map((layout) => {
            const Icon = layout.icon;
            const isSelected = design.layout === layout.id;

            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => onChange({ layout: layout.id })}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {layout.count}
                    </span>
                  </div>
                  <h3 className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                    {layout.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    {layout.desc}
                  </p>
                </div>

                {isSelected && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Curated Colour Palettes & Custom Finishes */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Curated Colour Palette</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Themes</span>
        </div>

        {/* Theme Presets Grid + Custom Option */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {PALETTES.map((pal) => {
            const isSelected = design.paletteId === pal.id;

            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => handleSelectPalette(pal.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: pal.primary }} />
                  <span className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: pal.accent }} />
                  <span className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: pal.bg }} />
                </div>
                <div className="text-xs font-bold text-slate-800 truncate">{pal.name}</div>
              </button>
            );
          })}

          {/* Custom Theme Tile */}
          <button
            type="button"
            onClick={() => onChange({ paletteId: 'custom' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              design.paletteId === 'custom'
                ? 'bg-blue-50/50 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: design.primaryColor }} />
              <span className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: design.accentColor }} />
              <span className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: design.backgroundColor }} />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-800 truncate">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Custom</span>
            </div>
          </button>
        </div>

        {/* Custom Colour Picker Controls */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Pipette className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">Custom Colour Picker</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Click swatch to open colour wheel or type HEX
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Primary Heading */}
            <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <div 
                className="relative w-10 h-10 rounded-lg border border-slate-300 shadow-2xs shrink-0 cursor-pointer overflow-hidden group"
                style={{ backgroundColor: design.primaryColor }}
                title="Click to open colour picker for Primary Heading"
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                  <Pipette className="w-3.5 h-3.5 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <input
                  type="color"
                  value={isValidHex(design.primaryColor) ? design.primaryColor : '#18181B'}
                  onChange={(e) => onChange({ primaryColor: e.target.value, paletteId: 'custom' })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 block leading-tight truncate">
                  Primary Heading
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 truncate">
                  Titles & cover headlines
                </span>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-400 select-none">#</span>
                  <input
                    type="text"
                    value={design.primaryColor.replace(/^#/, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                      onChange({ primaryColor: '#' + val, paletteId: 'custom' });
                    }}
                    maxLength={6}
                    placeholder="18181B"
                    className="w-20 px-1.5 py-0.5 bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded text-xs font-mono font-bold text-slate-900 uppercase shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Accent / Price Colour */}
            <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <div 
                className="relative w-10 h-10 rounded-lg border border-slate-300 shadow-2xs shrink-0 cursor-pointer overflow-hidden group"
                style={{ backgroundColor: design.accentColor }}
                title="Click to open colour picker for Accent / Price Colour"
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                  <Pipette className="w-3.5 h-3.5 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <input
                  type="color"
                  value={isValidHex(design.accentColor) ? design.accentColor : '#B45309'}
                  onChange={(e) => onChange({ accentColor: e.target.value, paletteId: 'custom' })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 block leading-tight truncate">
                  Accent / Price Colour
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 truncate">
                  Prices, badges & highlights
                </span>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-400 select-none">#</span>
                  <input
                    type="text"
                    value={design.accentColor.replace(/^#/, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                      onChange({ accentColor: '#' + val, paletteId: 'custom' });
                    }}
                    maxLength={6}
                    placeholder="B45309"
                    className="w-20 px-1.5 py-0.5 bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded text-xs font-mono font-bold text-slate-900 uppercase shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Page Background */}
            <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <div 
                className="relative w-10 h-10 rounded-lg border border-slate-300 shadow-2xs shrink-0 cursor-pointer overflow-hidden group"
                style={{ backgroundColor: design.backgroundColor }}
                title="Click to open colour picker for Page Background"
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                  <Pipette className="w-3.5 h-3.5 text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <input
                  type="color"
                  value={isValidHex(design.backgroundColor) ? design.backgroundColor : '#FDFBF7'}
                  onChange={(e) => onChange({ backgroundColor: e.target.value, paletteId: 'custom' })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 block leading-tight truncate">
                  Page Background
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 truncate">
                  Cover & page canvas backdrop
                </span>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-400 select-none">#</span>
                  <input
                    type="text"
                    value={design.backgroundColor.replace(/^#/, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                      onChange({ backgroundColor: '#' + val, paletteId: 'custom' });
                    }}
                    maxLength={6}
                    placeholder="FDFBF7"
                    className="w-20 px-1.5 py-0.5 bg-white border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded text-xs font-mono font-bold text-slate-900 uppercase shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Accent Swatches Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-700">Quick Accent Swatches:</span>
              <span className="text-[10px] text-slate-400">(Tap to set accent/price colour)</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_ACCENTS.map((swatch) => (
                <button
                  key={swatch.name}
                  type="button"
                  onClick={() => onChange({ accentColor: swatch.hex, paletteId: 'custom' })}
                  className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs hover:scale-125 transition-transform cursor-pointer relative"
                  style={{ backgroundColor: swatch.hex }}
                  title={`${swatch.name} (${swatch.hex})`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Typography & Currency (UK Pound Default) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Typography & Currency (£ UK Default)</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Font Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Font Pairing
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange({ fontFamily: f.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    design.fontFamily === f.id
                      ? 'bg-blue-50/50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">{f.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{f.sample}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Currency & Photo Fit */}
          <div className="space-y-4">
            {/* Currency Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Currency Symbol
              </label>
              <div className="flex items-center gap-2">
                {CURRENCIES.map((cur) => {
                  const isSelected = (design.currency || '£') === cur;
                  return (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => onChange({ currency: cur })}
                      className={`w-14 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {cur}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Fit Mode */}
            <div className="pt-3">
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Artwork Photo Fit
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ photoFit: 'cover' })}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    design.photoFit === 'cover'
                      ? 'bg-blue-50/50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cover (Uniform bleed)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ photoFit: 'contain' })}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    design.photoFit === 'contain'
                      ? 'bg-blue-50/50 border-blue-600 text-blue-900 ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Contain (Show whole photo)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Cover & Back Page Options + Detail Toggles */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Cover, Back Page & Visibility Controls</h2>
          </div>
        </div>

        {/* Cover Decorative Pattern Selector */}
        <div className="space-y-2 pb-3 border-b border-slate-100">
          <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
            Cover Decorative Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'deco', name: 'Art Deco Geometric', desc: 'Stepped diamonds & notched luxury border' },
              { id: 'squares', name: 'Geometric Squares', desc: 'Overlapping square blocks & framing' },
              { id: 'minimal', name: 'Minimalist Frame', desc: 'Clean architectural hairline border' },
              { id: 'circles', name: 'Organic Circles', desc: 'Soft curved circular arcs' },
            ].map((p) => {
              const isSelected = (design.coverPattern || 'deco') === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange({ coverPattern: p.id as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-600 text-blue-900 ring-1 ring-blue-600 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={design.showCoverPage}
                onChange={(e) => onChange({ showCoverPage: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 border-slate-300"
              />
              <span>Generate Front Cover Page (Logo, Title, Season)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={design.showBackPage}
                onChange={(e) => onChange({ showBackPage: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 border-slate-300"
              />
              <span>Generate Back Page with Contact Info & Order Channel</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={design.footerShowPageNumbers}
                onChange={(e) => onChange({ footerShowPageNumbers: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 border-slate-300"
              />
              <span>Show Page Numbers in Footer</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={design.footerShowContact}
                onChange={(e) => onChange({ footerShowContact: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 border-slate-300"
              />
              <span>Show Contact Channels in Page Footers</span>
            </label>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={design.showPrice}
                onChange={(e) => onChange({ showPrice: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 border-slate-300"
              />
              <span>Show Product Prices</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={design.showSku}
                onChange={(e) => onChange({ showSku: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 border-slate-300"
              />
              <span>Show SKU Codes</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={design.showSizes}
                onChange={(e) => onChange({ showSizes: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 border-slate-300"
              />
              <span>Show Available Sizes</span>
            </label>
          </div>

          <div className="sm:col-span-2 pt-2">
            <label className="text-xs font-bold text-slate-700 mb-1.5 block uppercase tracking-wider">
              Back Cover Custom Message / Order Policy
            </label>
            <textarea
              value={design.backMessage}
              onChange={(e) => onChange({ backMessage: e.target.value })}
              rows={2}
              placeholder="e.g. Send us the product name (or SKU), the size and the quantity, and we will reply with the total and delivery time."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 5. Quote Section / Official Estimate Page */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Quote & Price Estimation Page</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Order Schedule & Official Price Quote</span>
        </div>

        <div className="space-y-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-blue-900 block">
                Generate Dedicated Quote Page in Catalogue
              </span>
              <span className="text-[11px] text-blue-700">
                Adds a formal itemised price schedule, turnaround times, and customer sign-off page to the PDF.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={design.showQuotePage ?? true}
                onChange={(e) => onChange({ showQuotePage: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {(design.showQuotePage ?? true) && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Quote Title (Header)
                  </label>
                  <input
                    type="text"
                    value={design.quoteTitle || ''}
                    onChange={(e) => onChange({ quoteTitle: e.target.value })}
                    placeholder="e.g. Official Quotation"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Quote Reference / Ref #
                  </label>
                  <input
                    type="text"
                    value={design.quoteReference || ''}
                    onChange={(e) => onChange({ quoteReference: e.target.value })}
                    placeholder="e.g. QT-2026-001"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Prepared For (Client / Account Name)
                  </label>
                  <input
                    type="text"
                    value={design.quoteClientName || ''}
                    onChange={(e) => onChange({ quoteClientName: e.target.value })}
                    placeholder="e.g. Client / Customer Account"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Client Company / Department
                  </label>
                  <input
                    type="text"
                    value={design.quoteClientCompany || ''}
                    onChange={(e) => onChange({ quoteClientCompany: e.target.value })}
                    placeholder="e.g. Retail Account / Design Studio"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Date of Issue
                  </label>
                  <input
                    type="text"
                    value={design.quoteDate || ''}
                    onChange={(e) => onChange({ quoteDate: e.target.value })}
                    placeholder="e.g. November 2026"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Price Validity Period
                  </label>
                  <input
                    type="text"
                    value={design.quoteValidity || ''}
                    onChange={(e) => onChange({ quoteValidity: e.target.value })}
                    placeholder="e.g. 30 Days from date of issue"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Production Lead Time & Turnaround
                  </label>
                  <input
                    type="text"
                    value={design.quoteLeadTime || ''}
                    onChange={(e) => onChange({ quoteLeadTime: e.target.value })}
                    placeholder="e.g. 5–7 working days from artwork confirmation"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Minimum Order Quantity (MOQ)
                  </label>
                  <input
                    type="text"
                    value={design.quoteMoq !== undefined && design.quoteMoq !== '' ? design.quoteMoq : 'No Minimum Required'}
                    onChange={(e) => onChange({ quoteMoq: e.target.value })}
                    placeholder="No Minimum Required"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Tiered Volume Discounts
                  </label>
                  <input
                    type="text"
                    value={design.quoteTierDiscounts || ''}
                    onChange={(e) => onChange({ quoteTierDiscounts: e.target.value })}
                    placeholder="e.g. 5% on 25+ units · 10% on 50+ units · 15% on 100+ units"
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={design.quotePaymentTerms || ''}
                    onChange={(e) => onChange({ quotePaymentTerms: e.target.value })}
                    placeholder="e.g. BACS / Direct Bank Transfer, Card, or PayPal. 50% deposit on order."
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    UK Delivery & Shipping Note
                  </label>
                  <input
                    type="text"
                    value={design.quoteDeliveryNote || ''}
                    onChange={(e) => onChange({ quoteDeliveryNote: e.target.value })}
                    placeholder="e.g. UK Tracked shipping via Royal Mail / DPD. Free UK delivery over £250."
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Quality Note / Disclaimer
                  </label>
                  <textarea
                    value={design.quoteNotes || ''}
                    onChange={(e) => onChange({ quoteNotes: e.target.value })}
                    rows={2}
                    placeholder="e.g. All custom sublimation prints are produced with commercial grade inks and substrates."
                    className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={design.quoteShowSignatures ?? true}
                      onChange={(e) => onChange({ quoteShowSignatures: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 border-slate-300"
                    />
                    <span>Include Authorized Signatory and Client Acceptance Sign-off lines</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

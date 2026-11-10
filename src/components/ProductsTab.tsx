import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon,
  RefreshCw,
  GripVertical
} from 'lucide-react';
import { Product, FrameFinish } from '../types';
import { compressImageFile, saveImage, filenameToTitle } from '../db/storage';

interface ProductsTabProps {
  products: Product[];
  currencySymbol: string;
  onUpdateProducts: (products: Product[]) => void;
}

const FRAME_OPTIONS: { id: FrameFinish; name: string; color: string }[] = [
  { id: 'natural_oak', name: 'Natural Solid Oak', color: '#B5885C' },
  { id: 'matte_black', name: 'Gallery Matte Black', color: '#18181B' },
  { id: 'white_wood', name: 'Nordic White Wood', color: '#E4E4E7' },
  { id: 'brushed_brass', name: 'Brushed Brass / Gold', color: '#D4AF37' },
  { id: 'floating_canvas', name: 'Floating Canvas Shadowbox', color: '#78716C' },
  { id: 'unframed', name: 'Print Only (Archival Tube)', color: '#A1A1AA' },
];

const SIZE_PRESETS = [
  'A4 · A3 · A2 · A1 (UK Standard)',
  '30×40cm · 50×70cm · 70×100cm',
  '40×50cm · 60×80cm · 100×140cm',
  '50×50cm · 70×70cm (Square)',
];

const MEDIUM_PRESETS = [
  'Archival Giclée Cotton Rag 310gsm',
  'Hahnemühle German Etching 310gsm',
  'Fine Art Matte Velvet Paper 270gsm',
  'Museum Heavyweight Cotton Canvas',
];

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  currencySymbol = '£',
  onUpdateProducts,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingProductId, setReplacingProductId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newProducts: Product[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      setUploadProgress(`Processing ${i + 1} of ${total}: ${file.name}...`);

      try {
        const { fullDataUrl, thumbDataUrl } = await compressImageFile(file, 1600, 0.88);
        const imageKey = 'art_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
        await saveImage(imageKey, fullDataUrl);

        const cleanTitle = filenameToTitle(file.name);

        newProducts.push({
          id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          title: cleanTitle,
          price: '185',
          sku: `UK-${Math.floor(100 + Math.random() * 900)}`,
          category: 'Wall Art Collection',
          sizes: 'A4 · A3 · A2 · A1',
          description: 'Printed in the UK on archival museum cotton rag paper with lightfast pigment inks.',
          imageKey,
          thumbnailUrl: thumbDataUrl,
          frameFinish: 'natural_oak',
          aspectRatio: '3:4',
          medium: 'Archival Giclée Cotton Rag 310gsm',
        });
      } catch (err) {
        console.error('Error importing file:', file.name, err);
      }
    }

    onUpdateProducts([...products, ...newProducts]);
    setIsUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReplacePhoto = (prodId: string) => {
    setReplacingProductId(prodId);
    replaceInputRef.current?.click();
  };

  const onReplaceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingProductId) return;

    try {
      const { fullDataUrl, thumbDataUrl } = await compressImageFile(file, 1600, 0.88);
      const imageKey = 'art_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      await saveImage(imageKey, fullDataUrl);

      const updated = products.map((p) => {
        if (p.id === replacingProductId) {
          return {
            ...p,
            imageKey,
            thumbnailUrl: thumbDataUrl,
          };
        }
        return p;
      });
      onUpdateProducts(updated);
    } catch (err) {
      console.error('Failed to replace photo:', err);
    } finally {
      setReplacingProductId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleUpdateProduct = (id: string, patch: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...patch } : p));
    onUpdateProducts(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= products.length) return;
    const copy = [...products];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    onUpdateProducts(copy);
  };

  const handleDelete = (id: string) => {
    onUpdateProducts(products.filter((p) => p.id !== id));
  };

  const handleAddManual = () => {
    const newProd: Product = {
      id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      title: 'New Fine Art Edition',
      price: '195',
      sku: `UK-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Limited Edition',
      sizes: 'A4 · A3 · A2',
      description: 'Handcrafted fine art print on museum-grade Hahnemühle paper.',
      imageKey: '',
      frameFinish: 'natural_oak',
      aspectRatio: '3:4',
      medium: 'Archival Giclée Cotton Rag 310gsm',
    };
    onUpdateProducts([newProd, ...products]);
  };

  return (
    <div className="space-y-5 max-w-4xl animate-fade-in">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleBatchUpload}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        onChange={onReplaceFileSelected}
        className="hidden"
      />

      {/* Top Batch Upload Zone (Clean Light UI matching Screenshot 5) */}
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`p-7 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
          isUploading 
            ? 'bg-blue-50/50 border-blue-400 cursor-wait' 
            : 'bg-white border-slate-300 hover:border-blue-600 hover:bg-slate-50/60 shadow-2xs'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            {isUploading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isUploading ? 'Uploading & Processing Products...' : 'Add Product Photos'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {uploadProgress || 'Select or drop multiple photos at once. Each file name automatically becomes the product title (you can edit it).'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-mono">
              JPEG, PNG, WebP up to 100 items
            </span>
          </div>
        </div>
      </div>

      {/* Action Header & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 px-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-700">Total Products:</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-md font-mono">
            {products.length} / 100
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddManual}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            Add Blank Item
          </button>

          {products.length > 0 && (
            isClearingAll ? (
              <div className="flex items-center gap-1.5 animate-fade-in bg-rose-50 p-1 px-2 rounded-lg border border-rose-200">
                <span className="text-[11px] font-bold text-rose-700">Clear all {products.length}?</span>
                <button
                  onClick={() => {
                    onUpdateProducts([]);
                    setIsClearingAll(false);
                  }}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-xs transition-colors"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setIsClearingAll(false)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsClearingAll(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-600 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )
          )}
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3.5">
          <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <h4 className="text-sm font-semibold text-slate-700">No products added yet</h4>
            <p className="text-xs text-slate-500 mt-1">Upload product photos above or click &apos;Load Demo Content&apos; in the top bar.</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            Upload Product Photos
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {products.map((product, idx) => {
            const isExpanded = !!expandedIds[product.id];

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden transition-all shadow-2xs"
              >
                {/* Main Product Card */}
                <div className="p-3">
                  {/* Row 1: Number, Thumbnail, Title, and Action Buttons */}
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    {/* Reorder Grip & Number */}
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-mono font-semibold pl-1 select-none shrink-0">
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 hidden sm:block" />
                      <span className="w-4 text-center">{idx + 1}</span>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 relative group flex items-center justify-center">
                      {product.imageKey ? (
                        <img
                          src={product.thumbnailUrl || product.imageKey}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                      <button
                        onClick={() => handleReplacePhoto(product.id)}
                        className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold transition-opacity cursor-pointer"
                        title="Replace Photo"
                      >
                        Change
                      </button>
                    </div>

                    {/* Title & Specs */}
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={product.title}
                        onChange={(e) => handleUpdateProduct(product.id, { title: e.target.value })}
                        className="font-semibold text-xs sm:text-sm text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white px-2 py-1 -ml-2 rounded border border-transparent focus:border-blue-600 focus:outline-none w-full truncate"
                        placeholder="Product Title"
                      />
                      <div className="hidden sm:flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                        {product.sku && <span className="font-mono text-[11px] text-slate-500">{product.sku}</span>}
                        {product.sizes && <span className="text-[11px] truncate max-w-[240px]">{product.sizes}</span>}
                      </div>
                    </div>

                    {/* Desktop-only Price & Details */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      {/* UK Price Input (£ / ¢) */}
                      <div className="flex items-center gap-1 shrink-0 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-slate-900">{currencySymbol}</span>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => handleUpdateProduct(product.id, { price: e.target.value })}
                          className="w-16 text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Details Toggle Button */}
                      <button
                        onClick={() => toggleExpand(product.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border cursor-pointer ${
                          isExpanded 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>Details</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Reorder and Delete Buttons */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === products.length - 1}
                        className="p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 sm:p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-0.5 cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2 on Mobile: Price Input, Specs, and Details Button */}
                  <div className="sm:hidden flex items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      {product.sku && (
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate">
                          {product.sku}
                        </span>
                      )}
                      {product.sizes && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                          {product.sizes}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Price on mobile */}
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-slate-900">{currencySymbol}</span>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => handleUpdateProduct(product.id, { price: e.target.value })}
                          className="w-14 text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>

                      <button
                        onClick={() => toggleExpand(product.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 border cursor-pointer ${
                          isExpanded 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>Details</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                        SKU / Catalogue Code
                      </label>
                      <input
                        type="text"
                        value={product.sku || ''}
                        onChange={(e) => handleUpdateProduct(product.id, { sku: e.target.value })}
                        placeholder="e.g. UK-104"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                        Category / Collection
                      </label>
                      <input
                        type="text"
                        value={product.category || ''}
                        onChange={(e) => handleUpdateProduct(product.id, { category: e.target.value })}
                        placeholder="e.g. Minimal Botanical"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                        Available Sizes (UK & Metric)
                      </label>
                      <input
                        type="text"
                        value={product.sizes || ''}
                        onChange={(e) => handleUpdateProduct(product.id, { sizes: e.target.value })}
                        placeholder="e.g. A4 · A3 · A2 · A1"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {SIZE_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleUpdateProduct(product.id, { sizes: preset })}
                            className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                          >
                            {preset.split('·')[0].trim()}...
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                        Frame / Presentation Finish
                      </label>
                      <select
                        value={product.frameFinish || 'natural_oak'}
                        onChange={(e) => handleUpdateProduct(product.id, { frameFinish: e.target.value as FrameFinish })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                      >
                        {FRAME_OPTIONS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                        Paper / Print Medium
                      </label>
                      <select
                        value={product.medium || MEDIUM_PRESETS[0]}
                        onChange={(e) => handleUpdateProduct(product.id, { medium: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                      >
                        {MEDIUM_PRESETS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                        Aspect Ratio
                      </label>
                      <select
                        value={product.aspectRatio || '3:4'}
                        onChange={(e) => handleUpdateProduct(product.id, { aspectRatio: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                      >
                        <option value="3:4">3:4 (Portrait Gallery Standard)</option>
                        <option value="4:3">4:3 (Landscape)</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="2:3">2:3 (Tall Poster)</option>
                        <option value="16:9">16:9 (Panoramic)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                        Product Description / Curatorial Notes
                      </label>
                      <textarea
                        value={product.description || ''}
                        onChange={(e) => handleUpdateProduct(product.id, { description: e.target.value })}
                        rows={2}
                        placeholder="Description, provenance, or framing recommendations..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

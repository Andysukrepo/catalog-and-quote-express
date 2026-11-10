import React, { useRef, useState, useEffect } from 'react';
import { 
  Building2, 
  Upload, 
  Trash2, 
  Phone, 
  Mail, 
  Instagram, 
  Globe, 
  MapPin, 
  Facebook,
  Image as ImageIcon
} from 'lucide-react';
import { Branding } from '../types';
import { compressLogoFile, saveImage, deleteImage, getImage } from '../db/storage';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-.88-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.83 4.49 6.3 6.3 0 0 0 1.86-4.5V8.55a8.28 8.28 0 0 0 4.84 1.55v-3.41h-.94Z" />
  </svg>
);

interface BusinessTabProps {
  branding: Branding;
  onChange: (updated: Partial<Branding>) => void;
}

export const BusinessTab: React.FC<BusinessTabProps> = ({ branding, onChange }) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (branding.logoKey) {
      if (branding.logoKey.startsWith('data:') || branding.logoKey.startsWith('http') || branding.logoKey.startsWith('/')) {
        setLogoPreviewUrl(branding.logoKey);
      } else {
        getImage(branding.logoKey).then((url) => {
          if (isMounted) setLogoPreviewUrl(url || null);
        });
      }
    } else {
      setLogoPreviewUrl(null);
    }
    return () => {
      isMounted = false;
    };
  }, [branding.logoKey]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fullDataUrl = await compressLogoFile(file, 800);
      const key = 'logo_' + Date.now();
      await saveImage(key, fullDataUrl);
      setLogoPreviewUrl(fullDataUrl);
      onChange({ logoKey: key });
    } catch (err) {
      console.error('Failed to upload logo:', err);
    }
  };

  const handleRemoveLogo = async () => {
    if (branding.logoKey) {
      await deleteImage(branding.logoKey);
      setLogoPreviewUrl(null);
      onChange({ logoKey: undefined });
    }
  };

  return (
    <div className="space-y-5 max-w-3xl animate-fade-in">
      {/* Brand Identity Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Brand Identity & Catalogue Header</h2>
        </div>

        {/* Logo Section */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200/90 flex items-center justify-center overflow-hidden shrink-0 relative shadow-2xs">
            {logoPreviewUrl ? (
              <img
                src={logoPreviewUrl}
                alt="Brand Logo"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <ImageIcon className="w-7 h-7 text-slate-400" />
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-800 block">Brand Logo / Studio Hallmark</span>
            <div className="flex items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Upload Logo
              </button>

              {branding.logoKey && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Supports transparent PNG, JPG, or SVG. Displayed cleanly without background boxes on front and back cover.</p>
          </div>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Business / Studio Name
            </label>
            <input
              type="text"
              value={branding.businessName}
              onChange={(e) => onChange({ businessName: e.target.value })}
              placeholder="e.g. This Man Makes"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Brand Tagline
            </label>
            <input
              type="text"
              value={branding.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="e.g. Custom gifts, made with love"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Catalogue Title (Front Cover)
            </label>
            <input
              type="text"
              value={branding.catalogTitle}
              onChange={(e) => onChange({ catalogTitle: e.target.value })}
              placeholder="e.g. Holiday Gift Collection"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Season / Edition Subtitle
            </label>
            <input
              type="text"
              value={branding.subtitle}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="e.g. Fall / Winter 2026"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Contact & Orders Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Phone className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Contact & Order Direct Channels</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp / Phone (Direct Inquiries)
            </label>
            <input
              type="text"
              value={branding.whatsapp}
              onChange={(e) => onChange({ whatsapp: e.target.value })}
              placeholder="+44 7911 123456"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Email Address
            </label>
            <input
              type="email"
              value={branding.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="orders@yourbrand.co.uk"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              Instagram Handle
            </label>
            <input
              type="text"
              value={branding.instagram}
              onChange={(e) => onChange({ instagram: e.target.value })}
              placeholder="@yourbrand"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Facebook className="w-3.5 h-3.5 text-blue-600" />
              Facebook Page / Username
            </label>
            <input
              type="text"
              value={branding.facebook || ''}
              onChange={(e) => onChange({ facebook: e.target.value })}
              placeholder="facebook.com/yourbrand or @yourbrand"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <TikTokIcon className="w-3.5 h-3.5 text-slate-800" />
              TikTok Handle
            </label>
            <input
              type="text"
              value={branding.tiktok || ''}
              onChange={(e) => onChange({ tiktok: e.target.value })}
              placeholder="@yourbrand"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              Website / Shop URL
            </label>
            <input
              type="text"
              value={branding.website}
              onChange={(e) => onChange({ website: e.target.value })}
              placeholder="www.yourbrand.co.uk"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-600" />
              Studio Location / Showroom Address
            </label>
            <input
              type="text"
              value={branding.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="London, UK - collection & UK delivery"
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none rounded-lg text-xs text-slate-900 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export type LayoutType = 'grid3' | 'grid2' | 'list' | 'lookbook';

export type FontPreset = 'modern' | 'classic' | 'editorial' | 'boutique';

export type FrameFinish = 
  | 'natural_oak' 
  | 'matte_black' 
  | 'white_wood' 
  | 'brushed_brass' 
  | 'floating_canvas' 
  | 'unframed';

export interface Product {
  id: string;
  title: string;
  price: string;
  sku?: string;
  category?: string;
  sizes?: string;
  description?: string;
  imageKey: string; // Key in IndexedDB or direct data URL / asset path
  thumbnailUrl?: string; // Precomputed small preview
  frameFinish?: FrameFinish;
  aspectRatio?: '3:4' | '4:3' | '1:1' | '2:3' | '16:9';
  medium?: string; // e.g. "Archival Giclée Print, 310gsm"
}

export interface Branding {
  businessName: string;
  tagline: string;
  catalogTitle: string;
  subtitle: string;
  logoKey?: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook?: string;
  tiktok?: string;
  website: string;
  address: string;
}

export interface PalettePreset {
  id: string;
  name: string;
  primary: string; // Primary text/accent dark
  accent: string;  // Accent warm tone
  bg: string;      // Background light tone
  cardBg: string;  // Product card background
  border: string;  // Delicate divider
}

export interface DesignSettings {
  layout: LayoutType;
  paletteId: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  borderColor: string;
  fontFamily: FontPreset;
  currency: string;
  customCurrencySymbol?: string;
  photoFit: 'contain' | 'cover';
  showCoverPage: boolean;
  showBackPage: boolean;
  backMessage: string;
  footerShowPageNumbers: boolean;
  footerShowContact: boolean;
  showPrice: boolean;
  showSku: boolean;
  showSizes: boolean;
  // Quote / Price Estimate Page
  showQuotePage?: boolean;
  quoteTitle?: string;
  quoteReference?: string;
  quoteClientName?: string;
  quoteClientCompany?: string;
  quoteDate?: string;
  quoteValidity?: string;
  quoteLeadTime?: string;
  quoteMoq?: string;
  quoteTierDiscounts?: string;
  quotePaymentTerms?: string;
  quoteDeliveryNote?: string;
  quoteNotes?: string;
  quoteShowSignatures?: boolean;
  coverPattern?: 'deco' | 'squares' | 'minimal' | 'circles';
}

export interface Catalog {
  id: string;
  title: string;
  updatedAt: number;
  createdAt: number;
  branding: Branding;
  design: DesignSettings;
  products: Product[];
}

export type ExportFormat = 'light' | 'print';

export interface CatalogExportBackup {
  version: 2;
  source: 'WallArt Catalog Express';
  timestamp: string;
  catalogs: Catalog[];
  images: Record<string, string>; // imageKey -> base64 dataUrl
}

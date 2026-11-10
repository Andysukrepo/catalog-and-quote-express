import { Catalog, CatalogExportBackup, PalettePreset, Product } from '../types';

const DB_NAME = 'catalog-express-v2';
const DB_VERSION = 1;

export const PALETTES: PalettePreset[] = [
  {
    id: 'nordic_monochrome',
    name: 'Nordic Gallery',
    primary: '#18181B',
    accent: '#B45309',
    bg: '#FDFBF7',
    cardBg: '#FFFFFF',
    border: '#E4E4E7',
  },
  {
    id: 'berry_night',
    name: 'Berry Night',
    primary: '#2B0D3D',
    accent: '#FF0080',
    bg: '#FAFAFD',
    cardBg: '#FFFFFF',
    border: '#E8E4EE',
  },
  {
    id: 'champagne_luxe',
    name: 'Champagne Luxe',
    primary: '#1C1917',
    accent: '#D97706',
    bg: '#FAF8F5',
    cardBg: '#FFFFFF',
    border: '#E7E5E4',
  },
  {
    id: 'botanical_sage',
    name: 'Atelier Sage',
    primary: '#14281D',
    accent: '#2D6A4F',
    bg: '#F5F7F5',
    cardBg: '#FFFFFF',
    border: '#D8E2DC',
  },
  {
    id: 'midnight_ink',
    name: 'Midnight Ink',
    primary: '#0F172A',
    accent: '#2563EB',
    bg: '#F8FAFC',
    cardBg: '#FFFFFF',
    border: '#E2E8F0',
  },
  {
    id: 'minimal_pure',
    name: 'Minimalist Studio',
    primary: '#09090B',
    accent: '#52525B',
    bg: '#FFFFFF',
    cardBg: '#FFFFFF',
    border: '#E4E4E7',
  },
];

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('catalogs')) {
          db.createObjectStore('catalogs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function saveCatalog(catalog: Catalog): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalogs', 'readwrite');
    const store = tx.objectStore('catalogs');
    const updated = { ...catalog, updatedAt: Date.now() };
    const req = store.put(updated);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getCatalog(id: string): Promise<Catalog | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalogs', 'readonly');
    const store = tx.objectStore('catalogs');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCatalogs(): Promise<Catalog[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalogs', 'readonly');
    const store = tx.objectStore('catalogs');
    const req = store.getAll();
    req.onsuccess = () => {
      const list: Catalog[] = req.result || [];
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCatalog(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalogs', 'readwrite');
    const store = tx.objectStore('catalogs');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveImage(key: string, dataUrl: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const req = store.put({ key, dataUrl });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getImage(key: string): Promise<string | undefined> {
  if (!key) return undefined;
  // If it's already an absolute or relative URL or data URL
  if (key.startsWith('data:') || key.startsWith('http') || key.startsWith('/')) {
    return key;
  }
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result?.dataUrl);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteImage(key: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Resize and compress user uploaded images into high-resolution and preview thumbnails
 */
export function compressImageFile(file: File, maxDimension = 1600, quality = 0.88): Promise<{ fullDataUrl: string; thumbDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // High quality full image
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failed'));
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const fullDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Thumbnail (max 380px)
        const thumbCanvas = document.createElement('canvas');
        const thumbMax = 380;
        let tWidth = img.width;
        let tHeight = img.height;
        if (tWidth > thumbMax || tHeight > thumbMax) {
          if (tWidth > tHeight) {
            tHeight = Math.round((tHeight * thumbMax) / tWidth);
            tWidth = thumbMax;
          } else {
            tWidth = Math.round((tWidth * thumbMax) / tHeight);
            tHeight = thumbMax;
          }
        }
        thumbCanvas.width = tWidth;
        thumbCanvas.height = tHeight;
        const tCtx = thumbCanvas.getContext('2d');
        if (tCtx) {
          tCtx.fillStyle = '#FFFFFF';
          tCtx.fillRect(0, 0, tWidth, tHeight);
          tCtx.drawImage(img, 0, 0, tWidth, tHeight);
        }
        const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.8);

        resolve({ fullDataUrl, thumbDataUrl });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Specifically compress/process brand logos: preserves PNG transparency, alpha channel, and SVGs
 */
export function compressLogoFile(file: File, maxDimension = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failed'));

        // Clear without white fill to preserve transparent alpha channel for round/transparent logos
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Keep as PNG so round logos and transparent backgrounds are never converted to solid white
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load logo'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Convert filename to clean title: removes extensions, dashes, numbers
 */
export function filenameToTitle(filename: string): string {
  let name = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  name = name.replace(/^[\d_-]+/, ''); // Remove leading numbers or prefix
  name = name.replace(/[_-]+/g, ' '); // Replace separators with spaces
  return name.trim().replace(/\b\w/g, (char) => char.toUpperCase());
}

import { 
  DEMO_SUBLIMATION_PRODUCTS, 
  generateSublimationMockup, 
  generateDemoLogo 
} from '../utils/sublimationMockups';

/**
 * Generate a new blank catalog
 */
export function createNewCatalog(title = 'New Sublimation Collection'): Catalog {
  const id = 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  return {
    id,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    branding: {
      businessName: 'This Man Makes',
      tagline: 'Custom gifts, made with love',
      catalogTitle: title,
      subtitle: 'Fall / Winter 2026',
      logoKey: '/assets/aistudio/TMMLOGO_9668d369.png',
      whatsapp: '+44 7911 123456',
      email: 'hello@tmm.co.uk',
      instagram: '@tmm.co.uk',
      facebook: 'facebook.com/thismanmakes',
      tiktok: '@thismanmakes',
      website: 'www.tmm.co.uk',
      address: 'London, UK - collection & UK delivery',
    },
    design: {
      layout: 'grid3',
      paletteId: 'berry_night',
      primaryColor: '#1e1b2e',
      accentColor: '#e11d74',
      backgroundColor: '#ffffff',
      cardBackgroundColor: '#f8fafc',
      borderColor: '#e2e8f0',
      fontFamily: 'modern',
      currency: '£',
      photoFit: 'contain',
      showCoverPage: true,
      showBackPage: true,
      backMessage: 'Send us the product name (or SKU), the size and the quantity, and we will reply with the total and delivery time.',
      footerShowPageNumbers: true,
      footerShowContact: true,
      showPrice: true,
      showSku: true,
      showSizes: true,
      // Quote Section defaults
      showQuotePage: true,
      quoteTitle: 'Official Quotation',
      quoteReference: 'QT-2026-001',
      quoteClientName: 'Client / Customer Account',
      quoteClientCompany: 'Retail Account / Design Studio',
      quoteDate: 'November 2026',
      quoteValidity: '30 Days from date of issue',
      quoteLeadTime: '5–7 working days from artwork confirmation',
      quoteMoq: 'No Minimum Required',
      quoteTierDiscounts: '5% on 25+ units · 10% on 50+ units · 15% on 100+ units',
      quotePaymentTerms: 'BACS / Direct Bank Transfer, Card, or PayPal. 50% deposit on order.',
      quoteDeliveryNote: 'UK Tracked shipping via Royal Mail / DPD. Free UK delivery over £250.',
      quoteNotes: 'All custom sublimation prints are produced with commercial grade inks and substrates.',
      quoteShowSignatures: true,
      coverPattern: 'deco',
    },
    products: [],
  };
}

/**
 * Create or reset to the full Sublimation Printing Demo Collection (Mugs, Tumblers, T-Shirts, Totes, Pillows)
 */
export async function createSublimationDemoCatalog(): Promise<Catalog> {
  const catalog = createNewCatalog('Holiday Gift Collection');
  catalog.title = 'Demo - Holiday Collection';
  catalog.branding.businessName = 'This Man Makes';
  catalog.branding.tagline = 'Custom gifts, made with love';
  catalog.branding.catalogTitle = 'Holiday Gift Collection';
  catalog.branding.subtitle = 'Fall / Winter 2026';
  catalog.branding.logoKey = '/assets/aistudio/TMMLOGO_9668d369.png';
  catalog.branding.whatsapp = '+44 7911 123456';
  catalog.branding.email = 'hello@tmm.co.uk';
  catalog.branding.instagram = '@tmm.co.uk';
  catalog.branding.facebook = 'facebook.com/thismanmakes';
  catalog.branding.tiktok = '@thismanmakes';
  catalog.branding.website = 'www.tmm.co.uk';
  catalog.branding.address = 'London, UK - collection & UK delivery';

  // Generate & save all 12 sublimation demo products
  const products: Product[] = [];
  for (let i = 0; i < DEMO_SUBLIMATION_PRODUCTS.length; i++) {
    const spec = DEMO_SUBLIMATION_PRODUCTS[i];
    const mockupDataUrl = generateSublimationMockup(spec, 800);
    const imgKey = `sublimation_${spec.sku.toLowerCase()}_${Date.now()}_${i}`;
    await saveImage(imgKey, mockupDataUrl);

    products.push({
      id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6) + '_' + i,
      title: spec.name,
      price: spec.price,
      sku: spec.sku,
      category: spec.cat,
      sizes: spec.sizes,
      description: spec.desc,
      imageKey: imgKey,
      thumbnailUrl: mockupDataUrl,
      aspectRatio: '1:1',
      medium: 'Sublimation Print',
    });
  }

  catalog.products = products;
  await saveCatalog(catalog);
  return catalog;
}

/**
 * Seed initial catalog with stunning sublimation demo content
 */
export async function seedInitialCatalogIfEmpty(): Promise<Catalog> {
  const existing = await getAllCatalogs();
  if (existing.length > 0 && existing[0].products.length > 0) {
    const active = existing[0];
    if (active.branding.businessName === 'Sunny Prints Co.' || !active.branding.logoKey) {
      active.branding.businessName = 'This Man Makes';
      active.branding.tagline = 'Custom gifts, made with love';
      active.branding.catalogTitle = 'Holiday Gift Collection';
      active.branding.subtitle = 'Fall / Winter 2026';
      active.branding.logoKey = '/assets/aistudio/TMMLOGO_9668d369.png';
      active.branding.whatsapp = '+44 7911 123456';
      active.branding.email = 'hello@tmm.co.uk';
      active.branding.instagram = '@tmm.co.uk';
      active.branding.facebook = 'facebook.com/thismanmakes';
      active.branding.tiktok = '@thismanmakes';
      active.branding.website = 'www.tmm.co.uk';
      active.branding.address = 'London, UK - collection & UK delivery';
      if (active.design.showQuotePage === undefined) {
        active.design.showQuotePage = true;
      }
      if (!active.design.quoteTitle || active.design.quoteTitle === 'Official Wholesale Quotation') {
        active.design.quoteTitle = 'Official Quotation';
      }
      if (!active.design.quoteReference) {
        active.design.quoteReference = 'QT-2026-001';
      }
      if (!active.design.quoteClientName || active.design.quoteClientName === 'Trade Buyer / Wholesale Account') {
        active.design.quoteClientName = 'Client / Customer Account';
      }
      if (!active.design.quoteClientCompany) {
        active.design.quoteClientCompany = 'Retail Account / Design Studio';
      }
      if (!active.design.quoteDate) {
        active.design.quoteDate = 'November 2026';
      }
      if (!active.design.quoteValidity) {
        active.design.quoteValidity = '30 Days from date of issue';
      }
      if (!active.design.quoteLeadTime) {
        active.design.quoteLeadTime = '5–7 working days from artwork confirmation';
      }
      if (!active.design.quoteMoq || active.design.quoteMoq.toLowerCase().includes('minimum required') || active.design.quoteMoq.includes('10 units')) {
        active.design.quoteMoq = 'No Minimum Required';
      }
      if (!active.design.quoteTierDiscounts) {
        active.design.quoteTierDiscounts = '5% on 25+ units · 10% on 50+ units · 15% on 100+ units';
      }
      if (!active.design.quotePaymentTerms) {
        active.design.quotePaymentTerms = 'BACS / Direct Bank Transfer, Card, or PayPal. 50% deposit on order.';
      }
      if (!active.design.quoteDeliveryNote) {
        active.design.quoteDeliveryNote = 'UK Tracked shipping via Royal Mail / DPD. Free UK delivery over £250.';
      }
      if (!active.design.quoteNotes) {
        active.design.quoteNotes = 'All custom sublimation prints are produced with commercial grade inks and substrates.';
      }
      if (active.design.quoteShowSignatures === undefined) {
        active.design.quoteShowSignatures = true;
      }
      if (!active.design.coverPattern || active.design.coverPattern === 'circles') {
        active.design.coverPattern = 'deco';
      }
      await saveCatalog(active);
    }
    return active;
  }

  return await createSublimationDemoCatalog();
}

/**
 * Export full backup as JSON
 */
export async function exportAllCatalogsBackup(): Promise<CatalogExportBackup> {
  const catalogs = await getAllCatalogs();
  const db = await getDB();
  const images: Record<string, string> = {};

  // Fetch all images from DB
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('images', 'readonly');
    const store = tx.objectStore('images');
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        images[cursor.key as string] = cursor.value.dataUrl;
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });

  return {
    version: 2,
    source: 'WallArt Catalog Express',
    timestamp: new Date().toISOString(),
    catalogs,
    images,
  };
}

/**
 * Import backup JSON
 */
export async function importCatalogsBackup(backup: CatalogExportBackup | any): Promise<number> {
  if (!backup || !backup.catalogs || !Array.isArray(backup.catalogs)) {
    throw new Error('Invalid catalog backup file format');
  }

  // Restore images if present
  if (backup.images && typeof backup.images === 'object') {
    for (const [key, dataUrl] of Object.entries(backup.images)) {
      if (typeof dataUrl === 'string') {
        await saveImage(key, dataUrl);
      }
    }
  }

  let count = 0;
  for (const cat of backup.catalogs) {
    if (cat.id && cat.title) {
      await saveCatalog(cat);
      count++;
    }
  }

  return count;
}

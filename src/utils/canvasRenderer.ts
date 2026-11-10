import { Catalog, Product } from '../types';
import { getImage } from '../db/storage';

export interface PageDefinition {
  type: 'cover' | 'products' | 'quote' | 'back';
  pageIndex: number;
  catalogPageIndex: number; // e.g. 1, 2, 3...
  products: Product[];
}

// Compute the pages of a catalog based on layout & toggles
export function computeCatalogPages(catalog: Catalog): PageDefinition[] {
  const pages: PageDefinition[] = [];
  let pageCounter = 1;

  if (catalog.design.showCoverPage) {
    pages.push({
      type: 'cover',
      pageIndex: 0,
      catalogPageIndex: pageCounter++,
      products: [],
    });
  }

  let itemsPerPage = 9; // Default 3x3
  if (catalog.design.layout === 'grid3') itemsPerPage = 9;
  else if (catalog.design.layout === 'grid2') itemsPerPage = 4;
  else if (catalog.design.layout === 'list') itemsPerPage = 5;
  else if (catalog.design.layout === 'lookbook') itemsPerPage = 1;

  const totalProducts = catalog.products.length;
  if (totalProducts === 0 && !catalog.design.showCoverPage && !catalog.design.showBackPage && !catalog.design.showQuotePage) {
    pages.push({
      type: 'products',
      pageIndex: pages.length,
      catalogPageIndex: pageCounter++,
      products: [],
    });
  } else {
    for (let i = 0; i < totalProducts; i += itemsPerPage) {
      pages.push({
        type: 'products',
        pageIndex: pages.length,
        catalogPageIndex: pageCounter++,
        products: catalog.products.slice(i, i + itemsPerPage),
      });
    }
  }

  // FORMAL QUOTE & ESTIMATE PAGE
  if (catalog.design.showQuotePage) {
    pages.push({
      type: 'quote',
      pageIndex: pages.length,
      catalogPageIndex: pageCounter++,
      products: catalog.products,
    });
  }

  if (catalog.design.showBackPage) {
    pages.push({
      type: 'back',
      pageIndex: pages.length,
      catalogPageIndex: pageCounter++,
      products: [],
    });
  }

  return pages;
}

// Preload and cache images
const imageCache = new Map<string, HTMLImageElement>();
export async function loadCachedImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image ${src}`));
    };
    img.src = src;
  });
}

export async function resolveImage(keyOrUrl: string): Promise<HTMLImageElement | null> {
  if (!keyOrUrl) return null;
  try {
    const resolvedUrl = await getImage(keyOrUrl);
    if (!resolvedUrl) return null;
    return await loadCachedImage(resolvedUrl);
  } catch (err) {
    console.warn('Error resolving image:', err);
    return null;
  }
}

function mixColors(color1: string, color2: string, weight: number): string {
  const d2h = (d: number) => Math.round(d).toString(16).padStart(2, '0');
  const h2d = (h: string) => parseInt(h, 16);
  const c1 = color1.replace('#', '');
  const c2 = color2.replace('#', '');
  const r1 = h2d(c1.substring(0, 2)), g1 = h2d(c1.substring(2, 4)), b1 = h2d(c1.substring(4, 6));
  const r2 = h2d(c2.substring(0, 2)), g2 = h2d(c2.substring(2, 4)), b2 = h2d(c2.substring(4, 6));
  const w = Math.max(0, Math.min(1, weight));
  const r = r1 * (1 - w) + r2 * w;
  const g = g1 * (1 - w) + g2 * w;
  const b = b1 * (1 - w) + b2 * w;
  return `#${d2h(r)}${d2h(g)}${d2h(b)}`;
}

function rrPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw a single catalog page onto HTMLCanvasElement with pixel precision
 */
export async function renderCatalogPageToCanvas(
  canvas: HTMLCanvasElement,
  catalog: Catalog,
  pageDef: PageDefinition,
  totalPages: number,
  scale = 2 // 2 for Retina sharpness
) {
  // A4 aspect ratio: 595.28 x 841.89 pt (Standard ISO 216 A4)
  const baseW = 595;
  const baseH = 842;
  const width = Math.round(baseW * scale);
  const height = Math.round(baseH * scale);

  // Render to offscreen canvas first (zero flicker / no blanking visible canvas while loading)
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  offCtx.save();
  offCtx.scale(scale, scale);

  const { design } = catalog;
  const primary = design.primaryColor || '#1e1b2e';
  const accent = design.accentColor || '#ff0080';
  const bg = '#ffffff';

  let fontHead = 'Plus Jakarta Sans, sans-serif';
  let fontBody = 'Plus Jakarta Sans, sans-serif';
  if (design.fontFamily === 'classic') {
    fontHead = 'Playfair Display, Georgia, serif';
  } else if (design.fontFamily === 'editorial') {
    fontHead = 'Cinzel, Georgia, serif';
  } else if (design.fontFamily === 'boutique') {
    fontHead = 'Space Grotesk, sans-serif';
    fontBody = 'Space Grotesk, sans-serif';
  }

  // COVER PAGE
  if (pageDef.type === 'cover') {
    await renderCoverPage(offCtx, catalog, baseW, baseH, fontHead, fontBody, primary, accent);
  }
  // QUOTE & ESTIMATE PAGE
  else if (pageDef.type === 'quote') {
    await renderQuotePage(offCtx, catalog, baseW, baseH, fontHead, fontBody, primary, accent, pageDef.catalogPageIndex, totalPages);
  }
  // BACK PAGE
  else if (pageDef.type === 'back') {
    await renderBackPage(offCtx, catalog, baseW, baseH, fontHead, fontBody, primary, accent);
  }
  // PRODUCT PAGES
  else {
    // 1. Page Background
    offCtx.fillStyle = bg;
    offCtx.fillRect(0, 0, baseW, baseH);

    // 2. Header Bar
    await renderHeader(offCtx, catalog, baseW, fontHead, fontBody, primary, accent);

    // 3. Footer Bar
    renderFooter(offCtx, catalog, pageDef.catalogPageIndex, totalPages, baseW, baseH, fontBody);

    // 4. Products Grid / List / Lookbook Content
    const topY = 62;
    const botY = baseH - 44;
    const contentH = botY - topY;
    const margin = 28;
    const contentW = baseW - margin * 2;

    if (pageDef.products.length === 0) {
      offCtx.fillStyle = '#94a3b8';
      offCtx.font = `14px ${fontBody}`;
      offCtx.textAlign = 'center';
      offCtx.fillText('No products added yet. Add product photos to begin.', baseW / 2, baseH / 2);
      offCtx.textAlign = 'left';
    } else if (design.layout === 'grid2') {
      await renderGrid(offCtx, catalog, pageDef.products, margin, topY, contentW, contentH, 2, 2, true, fontHead, fontBody, accent);
    } else if (design.layout === 'list') {
      await renderList(offCtx, catalog, pageDef.products, margin, topY, contentW, contentH, fontHead, fontBody, accent);
    } else if (design.layout === 'lookbook') {
      await renderLookbook(offCtx, catalog, pageDef.products[0], margin, topY, contentW, contentH, fontHead, fontBody, accent);
    } else {
      // Default: Grid 3x3
      await renderGrid(offCtx, catalog, pageDef.products, margin, topY, contentW, contentH, 3, 3, false, fontHead, fontBody, accent);
    }
  }

  offCtx.restore();

  // Atomically transfer the completed offscreen image onto the visible canvas
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(offscreen, 0, 0);
  }
}

/**
 * Render Decorative Cover Pattern: Art Deco Geometric, Modern Squares, Minimalist, or Circles
 */
function renderCoverPattern(
  ctx: CanvasRenderingContext2D,
  pattern: 'deco' | 'squares' | 'minimal' | 'circles',
  baseW: number,
  baseH: number,
  primary: string,
  accent: string
) {
  if (pattern === 'squares') {
    // 1. Modern Overlapping Geometric Squares & Rectangles
    // Top-Right Geometric Squares
    ctx.fillStyle = mixColors(accent, primary, 0.48);
    ctx.fillRect(baseW - 150, -40, 190, 190);

    ctx.fillStyle = mixColors(accent, primary, 0.28);
    ctx.fillRect(baseW - 100, 40, 140, 140);

    ctx.fillStyle = mixColors(accent, primary, 0.65);
    ctx.fillRect(baseW - 50, -10, 80, 80);

    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.45);
    ctx.lineWidth = 1.2;
    ctx.strokeRect(baseW - 180, -70, 210, 210);

    // Bottom-Left Geometric Squares
    ctx.fillStyle = mixColors(accent, primary, 0.55);
    ctx.fillRect(-40, baseH - 150, 180, 180);

    ctx.fillStyle = mixColors(accent, primary, 0.26);
    ctx.fillRect(30, baseH - 100, 130, 130);

    ctx.fillStyle = mixColors(accent, primary, 0.70);
    ctx.fillRect(-10, baseH - 50, 80, 80);

    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.4);
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-70, baseH - 180, 210, 210);

    // Modern crisp framing
    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.25);
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, baseW - 40, baseH - 40);
  } else if (pattern === 'circles') {
    // Legacy curved organic circles
    ctx.fillStyle = mixColors(accent, primary, 0.55);
    ctx.beginPath();
    ctx.arc(baseW * 0.95, baseH * 0.04, baseW * 0.46, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = mixColors(accent, primary, 0.35);
    ctx.beginPath();
    ctx.arc(baseW * 0.95, baseH * 0.04, baseW * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = mixColors(accent, primary, 0.72);
    ctx.beginPath();
    ctx.arc(baseW * 0.02, baseH * 1.0, baseW * 0.34, 0, Math.PI * 2);
    ctx.fill();
  } else if (pattern === 'minimal') {
    // Minimalist Studio (Double hairline frame)
    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.35);
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, baseW - 44, baseH - 44);
    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.18);
    ctx.lineWidth = 0.6;
    ctx.strokeRect(26, 26, baseW - 52, baseH - 52);
  } else {
    // Default: 'deco' - Luxury Art Deco Geometric
    // Top-Right Stepped Diamond Geometric Motif
    ctx.save();
    ctx.translate(baseW, 0);
    ctx.rotate(Math.PI / 4);

    ctx.fillStyle = mixColors(accent, primary, 0.45);
    ctx.fillRect(-160, -160, 320, 320);

    ctx.fillStyle = mixColors(accent, primary, 0.25);
    ctx.fillRect(-110, -110, 220, 220);

    ctx.fillStyle = mixColors(accent, primary, 0.65);
    ctx.fillRect(-70, -70, 140, 140);

    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.45);
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-190, -190, 380, 380);

    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.22);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-220, -220, 440, 440);
    ctx.restore();

    // Bottom-Left Stepped Diamond Geometric Motif
    ctx.save();
    ctx.translate(0, baseH);
    ctx.rotate(Math.PI / 4);

    ctx.fillStyle = mixColors(accent, primary, 0.52);
    ctx.fillRect(-150, -150, 300, 300);

    ctx.fillStyle = mixColors(accent, primary, 0.26);
    ctx.fillRect(-100, -100, 200, 200);

    ctx.fillStyle = mixColors(accent, primary, 0.70);
    ctx.fillRect(-60, -60, 120, 120);

    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.4);
    ctx.lineWidth = 1;
    ctx.strokeRect(-180, -180, 360, 360);
    ctx.restore();

    // Architectural Art Deco Notched Hairline Border
    const margin = 18;
    const notch = 14;
    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.35);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin + notch, margin);
    ctx.lineTo(baseW - margin - notch, margin);
    ctx.lineTo(baseW - margin, margin + notch);
    ctx.lineTo(baseW - margin, baseH - margin - notch);
    ctx.lineTo(baseW - margin - notch, baseH - margin);
    ctx.lineTo(margin + notch, baseH - margin);
    ctx.lineTo(margin, baseH - margin - notch);
    ctx.lineTo(margin, margin + notch);
    ctx.closePath();
    ctx.stroke();

    // Inner subtle hairline
    const margin2 = 23;
    const notch2 = 12;
    ctx.strokeStyle = mixColors(accent, '#ffffff', 0.18);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(margin2 + notch2, margin2);
    ctx.lineTo(baseW - margin2 - notch2, margin2);
    ctx.lineTo(baseW - margin2, margin2 + notch2);
    ctx.lineTo(baseW - margin2, baseH - margin2 - notch2);
    ctx.lineTo(baseW - margin2 - notch2, baseH - margin2);
    ctx.lineTo(margin2 + notch2, baseH - margin2);
    ctx.lineTo(margin2, baseH - margin2 - notch2);
    ctx.lineTo(margin2, margin2 + notch2);
    ctx.closePath();
    ctx.stroke();

    // Four corner decorative diamonds
    const drawCornerDiamond = (cx: number, cy: number, size: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = mixColors(accent, '#ffffff', 0.6);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    };
    drawCornerDiamond(margin + notch / 2, margin + notch / 2, 5);
    drawCornerDiamond(baseW - margin - notch / 2, margin + notch / 2, 5);
    drawCornerDiamond(margin + notch / 2, baseH - margin - notch / 2, 5);
    drawCornerDiamond(baseW - margin - notch / 2, baseH - margin - notch / 2, 5);
  }
}

/**
 * Cover Page (matching holiday-gift-collection-whatsapp_fec26188.pdf)
 */
async function renderCoverPage(
  ctx: CanvasRenderingContext2D,
  catalog: Catalog,
  baseW: number,
  baseH: number,
  fontHead: string,
  fontBody: string,
  primary: string,
  accent: string
) {
  const { branding, products } = catalog;

  // Dark background
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, baseW, baseH);

  // Decorative Cover Pattern (Art Deco Geometric, Modern Squares, Minimal, or Circles)
  const coverPattern = catalog.design.coverPattern || 'deco';
  renderCoverPattern(ctx, coverPattern, baseW, baseH, primary, accent);

  ctx.textAlign = 'center';
  let y = baseH * 0.22;

  // Logo on Cover (drawn directly without white background card, so round / transparent PNG logos blend seamlessly)
  if (branding.logoKey) {
    const logoImg = await resolveImage(branding.logoKey);
    if (logoImg) {
      const logoMaxW = 130, logoMaxH = 90;
      drawFittedImage(ctx, logoImg, baseW / 2 - logoMaxW / 2, y - 58, logoMaxW, logoMaxH, 'contain');
    }
    y += 58;
  } else {
    y += 24;
  }

  // All-caps Business Name
  ctx.fillStyle = mixColors(primary, '#ffffff', 0.85);
  ctx.font = `700 12px ${fontBody}`;
  ctx.fillText((branding.businessName || 'SUNNY PRINTS CO.').toUpperCase(), baseW / 2, y);
  y += 48;

  // Main Catalog Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 36px ${fontHead}`;
  ctx.fillText(branding.catalogTitle || 'Holiday Gift Collection', baseW / 2, y);
  y += 20;

  // Small centered accent bar
  ctx.fillStyle = accent;
  ctx.fillRect(baseW / 2 - 24, y, 48, 3.5);
  y += 28;

  // Season Pill Badge
  if (branding.subtitle) {
    const seasonText = branding.subtitle.toUpperCase();
    ctx.font = `700 11px ${fontBody}`;
    const tw = ctx.measureText(seasonText).width;
    const pw = tw + 32;
    const ph = 26;
    ctx.fillStyle = accent;
    rrPath(ctx, baseW / 2 - pw / 2, y - ph / 2, pw, ph, ph / 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(seasonText, baseW / 2, y + 0.5);
    ctx.textBaseline = 'alphabetic';
    y += 38;
  }

  // Short Tagline
  if (branding.tagline) {
    ctx.fillStyle = mixColors(primary, '#ffffff', 0.75);
    ctx.font = `13px ${fontBody}`;
    ctx.fillText(branding.tagline, baseW / 2, y);
  }

  // Bottom info (product count + contact)
  ctx.fillStyle = mixColors(primary, '#ffffff', 0.7);
  ctx.font = `10.5px ${fontBody}`;
  ctx.fillText(`${products.length} products`, baseW / 2, baseH - 82);

  ctx.fillStyle = '#ffffff';
  ctx.font = `10px ${fontBody}`;
  const row1 = [branding.whatsapp && `WhatsApp ${branding.whatsapp}`, branding.email].filter(Boolean).join(' · ');
  const socials = [branding.instagram, branding.facebook, branding.tiktok].filter(Boolean);
  const row2 = [...socials, branding.website].filter(Boolean).join(' · ');
  if (row1) ctx.fillText(row1, baseW / 2, baseH - 58);
  if (row2) ctx.fillText(row2, baseW / 2, baseH - 42);

  ctx.textAlign = 'left';
}

/**
 * Top Header for Product Pages
 */
async function renderHeader(
  ctx: CanvasRenderingContext2D,
  catalog: Catalog,
  baseW: number,
  fontHead: string,
  fontBody: string,
  primary: string,
  accent: string
) {
  const { branding } = catalog;
  const headH = 50;

  // Top dark banner
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, baseW, headH);

  // Bottom accent line
  ctx.fillStyle = accent;
  ctx.fillRect(0, headH, baseW, 2.5);

  let leftX = 28;

  // Header Logo (directly drawn without white background card)
  if (branding.logoKey) {
    const logoImg = await resolveImage(branding.logoKey);
    if (logoImg) {
      const logoW = 44, logoH = 34;
      drawFittedImage(ctx, logoImg, leftX, 8, logoW, logoH, 'contain');
      leftX += logoW + 10;
    }
  }

  // Business Name
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 14px ${fontHead}`;
  ctx.fillText(branding.businessName || 'Sunny Prints Co.', leftX, 30);

  // Right Header text (Catalog title & subtitle)
  const rightParts = [branding.catalogTitle, branding.subtitle].filter(Boolean).join(' · ');
  if (rightParts) {
    ctx.font = `10px ${fontBody}`;
    ctx.fillStyle = mixColors(primary, '#ffffff', 0.8);
    const rw = ctx.measureText(rightParts).width;
    ctx.fillText(rightParts, baseW - 28 - rw, 30);
  }
}

/**
 * Footer for Product Pages
 */
function renderFooter(
  ctx: CanvasRenderingContext2D,
  catalog: Catalog,
  pageIndex: number,
  totalPages: number,
  baseW: number,
  baseH: number,
  fontBody: string
) {
  const { branding, design } = catalog;
  const footY = baseH - 32;

  // Subtle separator line
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(28, footY);
  ctx.lineTo(baseW - 28, footY);
  ctx.stroke();

  ctx.font = `8.5px ${fontBody}`;
  ctx.fillStyle = '#64748b';

  // Left contact info
  if (design.footerShowContact) {
    const contactBits = [
      branding.whatsapp && `WhatsApp ${branding.whatsapp}`,
      branding.email,
      branding.instagram,
      branding.facebook,
      branding.tiktok,
      branding.website
    ].filter(Boolean).join(' · ');
    ctx.fillText(contactBits, 28, footY + 16);
  }

  // Right page number
  if (design.footerShowPageNumbers) {
    const pageText = `Page ${pageIndex} of ${totalPages}`;
    const pw = ctx.measureText(pageText).width;
    ctx.font = `700 8.5px ${fontBody}`;
    ctx.fillText(pageText, baseW - 28 - pw, footY + 16);
  }
}

/**
 * Grid Layout (Supports 3x3 and 2x2 with sublimation product cards)
 */
async function renderGrid(
  ctx: CanvasRenderingContext2D,
  catalog: Catalog,
  items: Product[],
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
  isBig: boolean,
  fontHead: string,
  fontBody: string,
  accent: string
) {
  const gap = isBig ? 16 : 11;
  const cw = (w - (cols - 1) * gap) / cols;
  const ch = (h - (rows - 1) * gap) / rows;
  const pad = isBig ? 10 : 7;
  const textH = isBig ? 72 : 46;

  for (let i = 0; i < items.length && i < cols * rows; i++) {
    const p = items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = x + col * (cw + gap);
    const cy = y + row * (ch + gap);

    // Outer card container (Subtle light slate box matching PDF)
    ctx.fillStyle = '#f8fafc';
    rrPath(ctx, cx, cy, cw, ch, 8);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    rrPath(ctx, cx, cy, cw, ch, 8);
    ctx.stroke();

    // Inner White card for image
    const ix = cx + pad;
    const iy = cy + pad;
    const iw = cw - pad * 2;
    const ih = ch - pad * 2 - textH;

    ctx.fillStyle = '#ffffff';
    rrPath(ctx, ix, iy, iw, ih, 6);
    ctx.fill();

    // Draw sublimation product photo
    const img = await resolveImage(p.imageKey);
    if (img) {
      drawFittedImage(ctx, img, ix + 2, iy + 2, iw - 4, ih - 4, catalog.design.photoFit || 'contain');
    }

    // Product Title
    const ty = iy + ih + (isBig ? 18 : 13);
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 ${isBig ? '13px' : '10px'} ${fontHead}`;
    ctx.fillText(truncateText(ctx, p.title, iw), ix, ty);

    // Optional metadata row for large grid
    let by = ty + (isBig ? 16 : 14);
    if (isBig && p.sizes) {
      ctx.fillStyle = '#64748b';
      ctx.font = `9px ${fontBody}`;
      ctx.fillText(truncateText(ctx, p.sizes, iw), ix, by);
      by += 16;
    }

    // Price (left) and SKU (right)
    if (catalog.design.showPrice && p.price) {
      ctx.fillStyle = accent;
      ctx.font = `700 ${isBig ? '14px' : '11px'} ${fontBody}`;
      const priceText = formatPrice(p.price, catalog.design.currency, catalog.design.customCurrencySymbol);
      ctx.fillText(priceText, ix, by);
    }

    if (catalog.design.showSku && p.sku) {
      ctx.fillStyle = '#64748b';
      ctx.font = `700 ${isBig ? '8.5px' : '7.5px'} ${fontBody}`;
      const skuText = p.sku.startsWith('SKU') ? p.sku : `SKU ${p.sku}`;
      const sw = ctx.measureText(skuText).width;
      ctx.fillText(skuText, ix + iw - sw, by);
    }
  }
}

/**
 * Editorial List Layout
 */
async function renderList(
  ctx: CanvasRenderingContext2D,
  catalog: Catalog,
  items: Product[],
  x: number,
  y: number,
  w: number,
  h: number,
  fontHead: string,
  fontBody: string,
  accent: string
) {
  const rows = 5;
  const gap = 10;
  const rowH = (h - gap * (rows - 1)) / rows;

  for (let i = 0; i < items.length && i < rows; i++) {
    const p = items[i];
    const ry = y + i * (rowH + gap);

    // Card background
    ctx.fillStyle = '#ffffff';
    rrPath(ctx, x, ry, w, rowH, 8);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.6;
    rrPath(ctx, x, ry, w, rowH, 8);
    ctx.stroke();

    // Product thumbnail
    const thumbPad = 8;
    const thumbSize = rowH - thumbPad * 2;
    const img = await resolveImage(p.imageKey);
    if (img) {
      drawFittedImage(ctx, img, x + thumbPad, ry + thumbPad, thumbSize, thumbSize, 'contain');
    }

    // Details column
    const textX = x + thumbSize + thumbPad * 2 + 10;
    const textW = w - (textX - x) - 80;

    ctx.fillStyle = '#0f172a';
    ctx.font = `700 13px ${fontHead}`;
    ctx.fillText(truncateText(ctx, p.title, textW), textX, ry + 22);

    let infoY = ry + 40;
    ctx.fillStyle = '#64748b';
    ctx.font = `9.5px ${fontBody}`;
    const specs = [p.category, p.sizes && `Sizes: ${p.sizes}`, p.sku && `SKU ${p.sku}`].filter(Boolean);
    if (specs.length > 0) {
      ctx.fillText(truncateText(ctx, specs.join('   ·   '), textW), textX, infoY);
      infoY += 16;
    }

    if (p.description) {
      ctx.fillStyle = '#475569';
      ctx.font = `9px ${fontBody}`;
      ctx.fillText(truncateText(ctx, p.description, textW + 60), textX, infoY);
    }

    // Price on right
    if (catalog.design.showPrice && p.price) {
      ctx.fillStyle = accent;
      ctx.font = `700 15px ${fontBody}`;
      const priceText = formatPrice(p.price, catalog.design.currency, catalog.design.customCurrencySymbol);
      const prW = ctx.measureText(priceText).width;
      ctx.fillText(priceText, x + w - 16 - prW, ry + rowH / 2 + 5);
    }
  }
}

/**
 * Lookbook Hero Layout
 */
async function renderLookbook(
  ctx: CanvasRenderingContext2D,
  catalog: Catalog,
  p: Product | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  fontHead: string,
  fontBody: string,
  accent: string
) {
  if (!p) return;

  const heroH = h * 0.62;
  ctx.fillStyle = '#ffffff';
  rrPath(ctx, x, y, w, heroH, 8);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.6;
  rrPath(ctx, x, y, w, heroH, 8);
  ctx.stroke();

  const img = await resolveImage(p.imageKey);
  if (img) {
    drawFittedImage(ctx, img, x + 16, y + 16, w - 32, heroH - 32, 'contain');
  }

  // Gallery Plaque / Info Card below
  const plaqueY = y + heroH + 24;
  ctx.fillStyle = '#0f172a';
  ctx.font = `700 24px ${fontHead}`;
  ctx.fillText(p.title, x, plaqueY + 24);

  if (catalog.design.showPrice && p.price) {
    ctx.fillStyle = accent;
    ctx.font = `700 22px ${fontBody}`;
    const priceText = formatPrice(p.price, catalog.design.currency, catalog.design.customCurrencySymbol);
    const prW = ctx.measureText(priceText).width;
    ctx.fillText(priceText, x + w - prW, plaqueY + 24);
  }

  // Accent divider line
  ctx.fillStyle = accent;
  ctx.fillRect(x, plaqueY + 36, 46, 3);

  // Meta row
  ctx.fillStyle = '#64748b';
  ctx.font = `11px ${fontBody}`;
  const meta = [p.category, p.sizes && `Sizes: ${p.sizes}`, p.sku && `SKU ${p.sku}`].filter(Boolean);
  ctx.fillText(meta.join('   |   '), x, plaqueY + 58);

  // Description
  if (p.description) {
    ctx.fillStyle = '#334155';
    ctx.font = `10.5px ${fontBody}`;
    wrapText(ctx, p.description, x, plaqueY + 80, w - 30, 16);
  }
}

/**
 * Back Page (matching holiday-gift-collection-whatsapp_fec26188.pdf Page 4)
 */
async function renderBackPage(
  ctx: CanvasRenderingContext2D,
  catalog: Catalog,
  baseW: number,
  baseH: number,
  fontHead: string,
  fontBody: string,
  primary: string,
  accent: string
) {
  const { branding, design } = catalog;
  const bandH = baseH * 0.38;

  // Upper dark band
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, baseW, bandH);

  // Decorative circles in band
  ctx.fillStyle = mixColors(accent, primary, 0.7);
  ctx.beginPath();
  ctx.arc(baseW * 0.06, bandH * 0.1, baseW * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = mixColors(accent, primary, 0.55);
  ctx.beginPath();
  ctx.arc(baseW * 0.96, bandH * 0.65, bandH * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // "Ready to order?" Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 34px ${fontHead}`;
  ctx.fillText('Ready to order?', baseW / 2, bandH * 0.44);

  ctx.fillStyle = mixColors(primary, '#ffffff', 0.85);
  ctx.font = `12.5px ${fontBody}`;
  ctx.fillText("Message us - we'll reply as soon as possible.", baseW / 2, bandH * 0.44 + 26);

  // Order On WhatsApp Pill Button
  const bw = 330, bh = 58;
  const bx = baseW / 2 - bw / 2;
  const by = bandH - bh / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  rrPath(ctx, bx, by + 3, bw, bh, 29);
  ctx.fill();

  // Button background
  ctx.fillStyle = accent;
  rrPath(ctx, bx, by, bw, bh, 29);
  ctx.fill();

  // Button text
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 13.5px ${fontBody}`;
  ctx.fillText('ORDER ON WHATSAPP', baseW / 2, by + 24);

  ctx.font = `500 12px ${fontBody}`;
  ctx.fillText(branding.whatsapp || '+44 7911 123456', baseW / 2, by + 42);

  // Instruction Message below button
  let y = bandH + bh / 2 + 36;
  ctx.fillStyle = '#475569';
  ctx.font = `11px ${fontBody}`;
  const msg = design.backMessage || 'Send us the product name (or SKU), the size and the quantity, and we will reply with the total and delivery time.';
  wrapText(ctx, msg, baseW / 2, y, baseW - 120, 16);
  y += 50;

  // Contact list rows
  const rows: [string, string][] = [
    ['WHATSAPP / PHONE', branding.whatsapp],
    ['EMAIL', branding.email],
    ['INSTAGRAM', branding.instagram],
    ['FACEBOOK', branding.facebook || ''],
    ['TIKTOK', branding.tiktok || ''],
    ['WEBSITE', branding.website],
    ['ADDRESS', branding.address]
  ].filter(([_, v]) => Boolean(v && v.trim())) as [string, string][];

  const step = Math.min(42, (baseH - 140 - y) / Math.max(1, rows.length));
  rows.forEach(([label, val], idx) => {
    const yy = y + idx * step;
    ctx.fillStyle = accent;
    ctx.font = `700 8px ${fontBody}`;
    ctx.fillText(label, baseW / 2, yy);

    ctx.fillStyle = '#0f172a';
    ctx.font = `500 12.5px ${fontBody}`;
    ctx.fillText(val, baseW / 2, yy + 15);
  });

  // Bottom Logo & Signature
  const botLineY = baseH - 86;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(80, botLineY);
  ctx.lineTo(baseW - 80, botLineY);
  ctx.stroke();

  if (branding.logoKey) {
    const logoImg = await resolveImage(branding.logoKey);
    if (logoImg) {
      drawFittedImage(ctx, logoImg, baseW / 2 - 50, botLineY + 10, 100, 26, 'contain');
    }
  }

  ctx.fillStyle = '#0f172a';
  ctx.font = `700 14px ${fontHead}`;
  ctx.fillText(branding.businessName || 'Sunny Prints Co.', baseW / 2, baseH - 34);

  if (branding.tagline) {
    ctx.fillStyle = '#64748b';
    ctx.font = `9.5px ${fontBody}`;
    ctx.fillText(branding.tagline, baseW / 2, baseH - 20);
  }

  ctx.textAlign = 'left';
}

/**
 * Formal Quote & Pricing Schedule Page for Wholesale & Commercial Orders
 */
async function renderQuotePage(
  ctx: CanvasRenderingContext2D,
  catalog: Catalog,
  baseW: number,
  baseH: number,
  fontHead: string,
  fontBody: string,
  primary: string,
  accent: string,
  catalogPageIndex: number,
  totalPages: number
) {
  const { branding, design, products } = catalog;
  const currency = design.currency === 'CUSTOM' ? (design.customCurrencySymbol || '£') : (design.currency || '£');

  // 1. Page Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, baseW, baseH);

  // 2. Header Bar
  const headH = 50;
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, baseW, headH);
  ctx.fillStyle = accent;
  ctx.fillRect(0, headH, baseW, 2.5);

  let leftX = 28;
  if (branding.logoKey) {
    const logoImg = await resolveImage(branding.logoKey);
    if (logoImg) {
      drawFittedImage(ctx, logoImg, leftX, 8, 42, 34, 'contain');
      leftX += 52;
    }
  }

  // Business Name
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 13px ${fontHead}`;
  ctx.fillText(branding.businessName || 'This Man Makes', leftX, 30);

  // Right Header Text: Quote Title (ensure no "wholesale")
  const rawQuoteTitle = design.quoteTitle || 'Official Quotation';
  const cleanQuoteTitle = rawQuoteTitle.replace(/wholesale\s*/gi, '').trim() || 'OFFICIAL QUOTATION';
  const quoteTitle = cleanQuoteTitle.toUpperCase();
  ctx.font = `700 10.5px ${fontBody}`;
  ctx.fillStyle = mixColors(primary, '#ffffff', 0.9);
  const qtw = ctx.measureText(quoteTitle).width;
  ctx.fillText(quoteTitle, baseW - 28 - qtw, 30);

  // 3. Client & Quotation Meta Summary Box (Two cards side by side)
  const metaY = 66;
  const cardW = (baseW - 56 - 12) / 2;
  const cardH = 74;

  // Left Card: Prepared For / Client Info
  ctx.fillStyle = '#f8fafc';
  rrPath(ctx, 28, metaY, cardW, cardH, 8);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = `700 8px ${fontBody}`;
  ctx.fillText('PREPARED FOR / CLIENT ACCOUNT', 38, metaY + 17);

  ctx.fillStyle = '#0f172a';
  ctx.font = `700 11.5px ${fontHead}`;
  const rawClient = design.quoteClientName || 'Client / Customer Account';
  const clientName = rawClient.replace(/wholesale\s*/gi, '').trim() || 'Client / Customer Account';
  ctx.fillText(clientName, 38, metaY + 34);

  ctx.fillStyle = '#64748b';
  ctx.font = `9px ${fontBody}`;
  const clientSub = [design.quoteClientCompany, branding.address && 'UK Regional Delivery'].filter(Boolean).join(' · ') || 'Customer Account Order Schedule';
  ctx.fillText(clientSub, 38, metaY + 48);
  ctx.fillText(`Issued By: ${branding.businessName || 'This Man Makes'} (${branding.email || branding.whatsapp || 'Direct Channel'})`, 38, metaY + 62);

  // Right Card: Reference, Date, Terms
  const rightCardX = 28 + cardW + 12;
  ctx.fillStyle = '#f8fafc';
  rrPath(ctx, rightCardX, metaY, cardW, cardH, 8);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = `700 8px ${fontBody}`;
  ctx.fillText('QUOTATION SPECIFICATION', rightCardX + 14, metaY + 17);

  ctx.fillStyle = '#0f172a';
  ctx.font = `700 12px ${fontBody}`;
  const refText = design.quoteReference || 'QT-2026-001';
  ctx.fillText(`Ref: ${refText}`, rightCardX + 14, metaY + 34);

  ctx.fillStyle = '#475569';
  ctx.font = `9.5px ${fontBody}`;
  ctx.fillText(`Date: ${design.quoteDate || 'November 2026'}`, rightCardX + 14, metaY + 48);
  const curLabel = currency === '£' ? '£ (GBP)' : currency;
  ctx.fillText(`Validity: ${design.quoteValidity || '30 Days from issue'} · Currency: ${curLabel}`, rightCardX + 14, metaY + 62);

  // 4. Products Schedule Table
  let tableY = 152;
  ctx.fillStyle = '#0f172a';
  ctx.font = `700 11px ${fontHead}`;
  ctx.fillText('ITEMISED PRODUCT PRICING SCHEDULE', 28, tableY);

  // Badge on the right
  ctx.fillStyle = '#f1f5f9';
  const countBadgeText = `${products.length} Products Quoted`;
  ctx.font = `700 8.5px ${fontBody}`;
  const cbw = ctx.measureText(countBadgeText).width + 16;
  rrPath(ctx, baseW - 28 - cbw, tableY - 12, cbw, 18, 4);
  ctx.fill();
  ctx.fillStyle = '#334155';
  ctx.fillText(countBadgeText, baseW - 28 - cbw + 8, tableY);

  tableY += 8;

  // Table Column Definitions
  const colX = {
    num: 28,
    name: 52,
    sku: 252,
    cat: 322,
    size: 400,
    price: baseW - 28,
  };

  // Table Header Bar
  const thH = 20;
  ctx.fillStyle = mixColors(primary, '#ffffff', 0.08);
  rrPath(ctx, 28, tableY, baseW - 56, thH, 4);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.font = `700 8px ${fontBody}`;
  ctx.fillText('#', colX.num + 6, tableY + 13);
  ctx.fillText('PRODUCT DESCRIPTION', colX.name, tableY + 13);
  ctx.fillText('SKU', colX.sku, tableY + 13);
  ctx.fillText('CATEGORY', colX.cat, tableY + 13);
  ctx.fillText('SIZES / SPECS', colX.size, tableY + 13);
  ctx.textAlign = 'right';
  ctx.fillText('UNIT PRICE', colX.price - 8, tableY + 13);
  ctx.textAlign = 'left';

  tableY += thH;

  // Up to 11 product rows fit comfortably
  const maxRows = 11;
  const rowH = 20;
  const itemsToShow = products.slice(0, maxRows);

  itemsToShow.forEach((item, idx) => {
    const ry = tableY + idx * rowH;
    // Row background alternation
    if (idx % 2 === 1) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(28, ry, baseW - 56, rowH);
    }
    // Bottom hairline
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(28, ry + rowH);
    ctx.lineTo(baseW - 28, ry + rowH);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = `600 8.5px ${fontBody}`;
    ctx.fillText(`${idx + 1}`, colX.num + 6, ry + 13);

    ctx.fillStyle = '#0f172a';
    ctx.font = `600 9px ${fontBody}`;
    ctx.fillText(truncateText(ctx, item.title, 190), colX.name, ry + 13);

    ctx.fillStyle = '#475569';
    ctx.font = `500 8px ${fontBody}`;
    ctx.fillText(item.sku || `ITEM-${String(idx + 1).padStart(3, '0')}`, colX.sku, ry + 13);

    ctx.fillText(truncateText(ctx, item.category || 'Giftware', 70), colX.cat, ry + 13);
    ctx.fillText(truncateText(ctx, item.sizes || 'Standard', 80), colX.size, ry + 13);

    // Price
    ctx.textAlign = 'right';
    ctx.fillStyle = accent;
    ctx.font = `700 9.5px ${fontBody}`;
    ctx.fillText(`${currency}${item.price}`, colX.price - 8, ry + 13);
    ctx.textAlign = 'left';
  });

  // If there are more items than maxRows
  if (products.length > maxRows) {
    const extraY = tableY + maxRows * rowH;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(28, extraY, baseW - 56, rowH);
    ctx.fillStyle = '#64748b';
    ctx.font = `italic 8.5px ${fontBody}`;
    ctx.fillText(`+ ${products.length - maxRows} additional catalogue product lines included in full order schedule...`, colX.name, extraY + 13);
  }

  // Summary Row after table
  const rowsCount = Math.min(products.length, maxRows) + (products.length > maxRows ? 1 : 0);
  const summaryY = tableY + Math.max(1, rowsCount) * rowH + 6;

  ctx.fillStyle = '#f8fafc';
  rrPath(ctx, 28, summaryY, baseW - 56, 24, 6);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = '#334155';
  ctx.font = `600 8.5px ${fontBody}`;
  ctx.fillText(`Catalogue Range: ${products.length} Products Available`, 38, summaryY + 16);

  ctx.fillStyle = accent;
  ctx.font = `700 8.5px ${fontBody}`;
  const rawMoq = design.quoteMoq || 'No Minimum Required';
  const moqText = (rawMoq.includes('10 units') || rawMoq.toLowerCase().includes('minimum required')) ? 'No Minimum Required' : rawMoq;
  const moqBadge = `Order Policy: ${moqText}`;
  ctx.fillText(moqBadge, 220, summaryY + 16);

  // Pricing highlight
  const prices = products.map((p) => parseFloat(p.price) || 0).filter((p) => p > 0);
  const minP = prices.length > 0 ? Math.min(...prices).toFixed(2) : '12.00';
  const maxP = prices.length > 0 ? Math.max(...prices).toFixed(2) : '28.00';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = `700 8.5px ${fontBody}`;
  ctx.fillText(`Price Spectrum: ${currency}${minP} – ${currency}${maxP}`, baseW - 38, summaryY + 16);
  ctx.textAlign = 'left';

  // 5. Commercial Terms & Conditions Cards
  const termsY = summaryY + 34;
  ctx.fillStyle = '#0f172a';
  ctx.font = `700 10.5px ${fontHead}`;
  ctx.fillText('COMMERCIAL TERMS & ORDER CONDITIONS', 28, termsY);

  const tCardW = (baseW - 56 - 12) / 2;
  const tCardH = 108;
  const tCardsY = termsY + 8;

  // Left Terms Card: Discounts & Lead Time
  ctx.fillStyle = '#ffffff';
  rrPath(ctx, 28, tCardsY, tCardW, tCardH, 8);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = `700 8px ${fontBody}`;
  ctx.fillText('VOLUME DISCOUNTS & PRODUCTION TIMELINE', 38, tCardsY + 16);

  ctx.fillStyle = '#0f172a';
  ctx.font = `600 9px ${fontBody}`;
  ctx.fillText('Tiered Bulk Volume Pricing:', 38, tCardsY + 31);

  ctx.fillStyle = '#334155';
  ctx.font = `8.5px ${fontBody}`;
  const tiers = design.quoteTierDiscounts || '5% on 25+ units · 10% on 50+ units · 15% on 100+ units';
  wrapText(ctx, tiers, 38, tCardsY + 44, tCardW - 24, 12);

  ctx.fillStyle = '#0f172a';
  ctx.font = `600 9px ${fontBody}`;
  ctx.fillText('Turnaround & Production Time:', 38, tCardsY + 70);

  ctx.fillStyle = '#334155';
  ctx.font = `8.5px ${fontBody}`;
  const lead = design.quoteLeadTime || '5–7 working days from artwork confirmation';
  ctx.fillText(truncateText(ctx, lead, tCardW - 24), 38, tCardsY + 84);
  ctx.fillText(`Minimum Order: ${moqText}`, 38, tCardsY + 98);

  // Right Terms Card: Payment & Shipping
  const tCardRightX = 28 + tCardW + 12;
  ctx.fillStyle = '#ffffff';
  rrPath(ctx, tCardRightX, tCardsY, tCardW, tCardH, 8);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = `700 8px ${fontBody}`;
  ctx.fillText('PAYMENT TERMS & UK DISPATCH', tCardRightX + 14, tCardsY + 16);

  ctx.fillStyle = '#0f172a';
  ctx.font = `600 9px ${fontBody}`;
  ctx.fillText('Payment Terms:', tCardRightX + 14, tCardsY + 31);

  ctx.fillStyle = '#334155';
  ctx.font = `8.5px ${fontBody}`;
  const pay = design.quotePaymentTerms || 'BACS / Direct Bank Transfer, Card, or PayPal. 50% deposit on order.';
  wrapText(ctx, pay, tCardRightX + 14, tCardsY + 44, tCardW - 28, 12);

  ctx.fillStyle = '#0f172a';
  ctx.font = `600 9px ${fontBody}`;
  ctx.fillText('Shipping & Delivery:', tCardRightX + 14, tCardsY + 70);

  ctx.fillStyle = '#334155';
  ctx.font = `8.5px ${fontBody}`;
  const ship = design.quoteDeliveryNote || 'UK Tracked shipping via Royal Mail / DPD. Free UK delivery over £250.';
  wrapText(ctx, ship, tCardRightX + 14, tCardsY + 84, tCardW - 28, 12);

  // 6. Acceptance & Signatures Block
  const sigY = tCardsY + tCardH + 14;
  if (design.quoteShowSignatures !== false) {
    ctx.fillStyle = '#0f172a';
    ctx.font = `700 10px ${fontHead}`;
    ctx.fillText('ORDER CONFIRMATION & CLIENT AUTHORIZATION', 28, sigY);

    const sigBoxW = (baseW - 56 - 12) / 2;
    const sigBoxH = 64;
    const sigBoxY = sigY + 6;

    // Supplier box
    ctx.fillStyle = '#fafafa';
    rrPath(ctx, 28, sigBoxY, sigBoxW, sigBoxH, 6);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = `700 7.5px ${fontBody}`;
    ctx.fillText('AUTHORIZED SUPPLIER SIGNATORY', 38, sigBoxY + 15);

    ctx.fillStyle = '#0f172a';
    ctx.font = `600 8.5px ${fontBody}`;
    ctx.fillText(branding.businessName || 'This Man Makes', 38, sigBoxY + 28);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(38, sigBoxY + 50);
    ctx.lineTo(28 + sigBoxW - 14, sigBoxY + 50);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = `7.5px ${fontBody}`;
    ctx.fillText('Authorized Signature / Date', 38, sigBoxY + 59);

    // Client box
    ctx.fillStyle = '#fafafa';
    rrPath(ctx, 28 + sigBoxW + 12, sigBoxY, sigBoxW, sigBoxH, 6);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = `700 7.5px ${fontBody}`;
    ctx.fillText('CLIENT ORDER ACCEPTANCE', 28 + sigBoxW + 24, sigBoxY + 15);

    ctx.fillStyle = '#0f172a';
    ctx.font = `600 8.5px ${fontBody}`;
    ctx.fillText(clientName, 28 + sigBoxW + 24, sigBoxY + 28);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(28 + sigBoxW + 24, sigBoxY + 50);
    ctx.lineTo(baseW - 40, sigBoxY + 50);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = `7.5px ${fontBody}`;
    ctx.fillText('Client Signature & Official Stamp / Date', 28 + sigBoxW + 24, sigBoxY + 59);
  }

  // 7. Footer
  renderFooter(ctx, catalog, catalogPageIndex, totalPages, baseW, baseH, fontBody);
}

function drawFittedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  targetW: number,
  targetH: number,
  fit: 'contain' | 'cover'
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) return;

  const targetRatio = targetW / targetH;
  const imgRatio = imgW / imgH;

  let dw = targetW;
  let dh = targetH;
  let dx = x;
  let dy = y;

  if (fit === 'contain') {
    if (imgRatio > targetRatio) {
      dw = targetW;
      dh = targetW / imgRatio;
      dy = y + (targetH - dh) / 2;
    } else {
      dh = targetH;
      dw = targetH * imgRatio;
      dx = x + (targetW - dw) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    let sx = 0;
    let sy = 0;
    let sw = imgW;
    let sh = imgH;
    if (imgRatio > targetRatio) {
      sw = imgH * targetRatio;
      sx = (imgW - sw) / 2;
    } else {
      sh = imgW / targetRatio;
      sy = (imgH - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, targetW, targetH);
  }
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

export function formatPrice(val: string, currency: string, customSymbol?: string): string {
  if (!val) return '';
  const num = val.replace(/[^0-9.]/g, '');
  const sym = currency === 'CUSTOM' ? customSymbol || '' : currency;
  return `${sym}${num}`;
}

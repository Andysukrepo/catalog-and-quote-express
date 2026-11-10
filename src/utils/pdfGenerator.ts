import { jsPDF } from 'jspdf';
import { Catalog, ExportFormat } from '../types';
import { computeCatalogPages, renderCatalogPageToCanvas } from './canvasRenderer';

export interface PdfProgressCallback {
  (current: number, total: number, status: string): void;
}

/**
 * Generates an A4 PDF catalog from the provided catalog model.
 * Produces pixel-perfect output matching the interactive preview canvas.
 */
export async function generateCatalogPdf(
  catalog: Catalog,
  format: ExportFormat = 'light',
  onProgress?: PdfProgressCallback
): Promise<Blob> {
  const pages = computeCatalogPages(catalog);
  const total = pages.length;

  // jsPDF A4 in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Set document metadata
  pdf.setProperties({
    title: catalog.branding.catalogTitle || catalog.title,
    subject: catalog.branding.subtitle || 'Wall Art Catalog',
    author: catalog.branding.businessName,
    creator: 'WallArt Catalog Express',
  });

  // Export resolution & JPEG quality
  // 'light' => scale 2.0 (approx 150 DPI), compression 0.8
  // 'print' => scale 3.2 (approx 300 DPI), compression 0.94
  const scale = format === 'print' ? 3.0 : 1.8;
  const quality = format === 'print' ? 0.92 : 0.78;

  const hiddenCanvas = document.createElement('canvas');

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress(i + 1, total, `Rendering page ${i + 1} of ${total}...`);
    }

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    // Render page to canvas
    await renderCatalogPageToCanvas(hiddenCanvas, catalog, pages[i], total, scale);

    // Convert canvas to image data
    const imgData = hiddenCanvas.toDataURL('image/jpeg', quality);

    // Add image filling the exact A4 page (210 x 297 mm)
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  if (onProgress) {
    onProgress(total, total, 'Finalizing PDF document...');
  }

  return pdf.output('blob');
}

/**
 * Triggers a download of the generated PDF in the browser
 */
export async function downloadCatalogPdf(
  catalog: Catalog,
  format: ExportFormat = 'light',
  onProgress?: PdfProgressCallback
): Promise<void> {
  const blob = await generateCatalogPdf(catalog, format, onProgress);
  const cleanTitle = (catalog.branding.catalogTitle || catalog.title || 'Catalog')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  const filename = `${cleanTitle}-${format}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Share via Web Share API if supported
 */
export async function shareCatalogPdf(
  catalog: Catalog,
  format: ExportFormat = 'light',
  onProgress?: PdfProgressCallback
): Promise<boolean> {
  const blob = await generateCatalogPdf(catalog, format, onProgress);
  const cleanTitle = catalog.branding.catalogTitle || catalog.title || 'Catalog';
  const filename = `${cleanTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}.pdf`;
  const file = new File([blob], filename, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: cleanTitle,
        text: `${catalog.branding.businessName} - ${cleanTitle}`,
        files: [file],
      });
      return true;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Error sharing:', e);
      }
      return false;
    }
  }
  return false;
}

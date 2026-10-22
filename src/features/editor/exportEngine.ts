import { CanvasDimensions } from '@/components/ui/CanvasResizeControl';
import {
  JerseyDesign,
  GarmentView,
  ExportOptions,
  EditorElement,
  BatchRosterItem,
} from './editorTypes';

/**
 * Converts inches to canvas pixels based on target DPI.
 */
export function inchesToPx(inches: number, dpi: number): number {
  return Math.round(inches * dpi);
}

/**
 * Converts dimensions to inches regardless of original unit.
 */
export function getDimensionsInInches(dimensions: CanvasDimensions): {
  widthInches: number;
  heightInches: number;
} {
  const { width, height, unit, dpi } = dimensions;
  switch (unit) {
    case 'in':
      return { widthInches: width, heightInches: height };
    case 'cm':
      return { widthInches: width / 2.54, heightInches: height / 2.54 };
    case 'mm':
      return { widthInches: width / 25.4, heightInches: height / 25.4 };
    case 'px':
      return { widthInches: width / dpi, heightInches: height / dpi };
    default:
      return { widthInches: width, heightInches: height };
  }
}

/**
 * Resolves element text by substituting dynamic binding keys if roster data is provided.
 */
export function resolveElementText(
  element: EditorElement,
  overrideRosterItem?: BatchRosterItem
): string {
  if (!overrideRosterItem) {
    return element.text;
  }

  if (element.bindingKey === 'player_name' || element.type === 'dynamic_name') {
    return overrideRosterItem.name;
  }
  if (element.bindingKey === 'player_number' || element.type === 'dynamic_number') {
    return overrideRosterItem.number;
  }
  return element.text;
}

/**
 * Renders jersey vector mockup paths onto an HTML5 Canvas 2D Context.
 */
function drawMockupToCanvas(
  ctx: CanvasRenderingContext2D,
  design: JerseyDesign,
  view: GarmentView,
  canvasWidth: number,
  canvasHeight: number
) {
  const { primaryColor, collarColor, trimColor, accentColor, showSeams } = design.mockup;
  const sx = canvasWidth / 1000;
  const sy = canvasHeight / 1400;

  ctx.save();
  ctx.scale(sx, sy);

  // Left sleeve
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(330, 190);
  ctx.lineTo(90, 350);
  ctx.lineTo(170, 510);
  ctx.lineTo(320, 420);
  ctx.closePath();
  ctx.fill();

  // Left cuff trim
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.moveTo(90, 350);
  ctx.lineTo(76, 362);
  ctx.lineTo(156, 522);
  ctx.lineTo(170, 510);
  ctx.closePath();
  ctx.fill();

  // Right sleeve
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(670, 190);
  ctx.lineTo(910, 350);
  ctx.lineTo(830, 510);
  ctx.lineTo(680, 420);
  ctx.closePath();
  ctx.fill();

  // Right cuff trim
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.moveTo(910, 350);
  ctx.lineTo(924, 362);
  ctx.lineTo(844, 522);
  ctx.lineTo(830, 510);
  ctx.closePath();
  ctx.fill();

  // Torso base
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.moveTo(330, 190);
  ctx.bezierCurveTo(390, 195, 610, 195, 670, 190);
  ctx.lineTo(680, 420);
  ctx.bezierCurveTo(675, 580, 690, 980, 700, 1280);
  ctx.bezierCurveTo(600, 1310, 400, 1310, 300, 1280);
  ctx.bezierCurveTo(310, 980, 325, 580, 320, 420);
  ctx.closePath();
  ctx.fill();

  // Side panels (accent color)
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(320, 420);
  ctx.bezierCurveTo(340, 600, 345, 950, 340, 1285);
  ctx.lineTo(300, 1280);
  ctx.bezierCurveTo(310, 980, 325, 580, 320, 420);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(680, 420);
  ctx.bezierCurveTo(660, 600, 655, 950, 660, 1285);
  ctx.lineTo(700, 1280);
  ctx.bezierCurveTo(690, 980, 675, 580, 680, 420);
  ctx.closePath();
  ctx.fill();

  // Hem trim
  ctx.fillStyle = trimColor;
  ctx.beginPath();
  ctx.moveTo(300, 1280);
  ctx.bezierCurveTo(400, 1310, 600, 1310, 700, 1280);
  ctx.lineTo(702, 1295);
  ctx.bezierCurveTo(600, 1325, 400, 1325, 298, 1295);
  ctx.closePath();
  ctx.fill();

  // Collar
  ctx.fillStyle = collarColor;
  if (view === 'front') {
    ctx.beginPath();
    ctx.moveTo(390, 192);
    ctx.bezierCurveTo(420, 220, 460, 270, 500, 310);
    ctx.bezierCurveTo(540, 270, 580, 220, 610, 192);
    ctx.lineTo(630, 190);
    ctx.bezierCurveTo(590, 230, 540, 300, 500, 335);
    ctx.bezierCurveTo(460, 300, 410, 230, 370, 190);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(385, 190);
    ctx.bezierCurveTo(440, 170, 560, 170, 615, 190);
    ctx.lineTo(618, 208);
    ctx.bezierCurveTo(560, 190, 440, 190, 382, 208);
    ctx.closePath();
    ctx.fill();

    if (showSeams) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(328, 320);
      ctx.bezierCurveTo(440, 350, 560, 350, 672, 320);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  ctx.restore();
}

/**
 * Core raster rendering function: Renders a single jersey design to an HTML5 canvas.
 */
export async function renderJerseyToCanvas(
  design: JerseyDesign,
  view: GarmentView,
  options: ExportOptions,
  rosterItem?: BatchRosterItem
): Promise<HTMLCanvasElement> {
  const { widthInches, heightInches } = getDimensionsInInches(design.dimensions);
  const dpi = options.dpi || design.dimensions.dpi || 300;

  // Compute pixel dimensions
  const pixelWidth = inchesToPx(widthInches, dpi);
  const pixelHeight = inchesToPx(heightInches, dpi);

  const canvas = document.createElement('canvas');
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  const ctx = canvas.getContext('2d', { alpha: options.transparentBg && options.format !== 'jpg' });
  if (!ctx) {
    throw new Error('Unable to create canvas 2D rendering context');
  }

  // 1. Background fill
  if (!options.transparentBg || options.format === 'jpg') {
    ctx.fillStyle = options.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);
  } else {
    ctx.clearRect(0, 0, pixelWidth, pixelHeight);
  }

  // 2. Mockup Garment Outline (if included)
  if (options.includeMockup) {
    drawMockupToCanvas(ctx, design, view, pixelWidth, pixelHeight);
  }

  // 3. Render design elements in active view sorted by zIndex
  const activeElements = design.elements
    .filter((el) => el.visible && (el.view === view || el.view === 'both'))
    .sort((a, b) => a.zIndex - b.zIndex);

  for (const el of activeElements) {
    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;

    // Convert element physical coordinates (inches) to canvas pixels
    const elX = inchesToPx(el.x, dpi);
    const elY = inchesToPx(el.y, dpi);
    const elW = inchesToPx(el.width, dpi);
    const elH = inchesToPx(el.height, dpi);
    const centerX = elX + elW / 2;
    const centerY = elY + elH / 2;

    // Handle Rotation
    if (el.rotation) {
      ctx.translate(centerX, centerY);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    if (el.type === 'shape') {
      // Shape rendering
      ctx.fillStyle = el.fillColor;
      if (el.shapeType === 'circle') {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, elW / 2, elH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(elX, elY, elW, elH);
      }

      if (el.strokeEnabled && el.strokeColor && el.strokeWidth) {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = Math.max(1, (el.strokeWidth * dpi) / 72);
        if (el.shapeType === 'circle') {
          ctx.stroke();
        } else {
          ctx.strokeRect(elX, elY, elW, elH);
        }
      }
    } else {
      // Text rendering (Static text, Dynamic Player Name, Dynamic Player Number)
      let displayText = resolveElementText(el, rosterItem);
      if (el.textTransform === 'uppercase') {
        displayText = displayText.toUpperCase();
      } else if (el.textTransform === 'lowercase') {
        displayText = displayText.toLowerCase();
      }

      // Convert font size from points to canvas pixels
      const fontSizePx = Math.round((el.fontSize * dpi) / 72);
      const fontWeight = el.fontWeight || 'bold';
      const fontFamily = el.fontFamily || 'Inter, sans-serif';

      ctx.font = `${fontWeight} ${fontSizePx}px "${fontFamily}", sans-serif`;
      ctx.textBaseline = 'middle';

      // Alignment handling
      let drawX = centerX;
      if (el.textAlign === 'left') {
        ctx.textAlign = 'left';
        drawX = elX;
      } else if (el.textAlign === 'right') {
        ctx.textAlign = 'right';
        drawX = elX + elW;
      } else {
        ctx.textAlign = 'center';
        drawX = centerX;
      }

      // Stroke pass (rendered behind fill for crisp sportswear typography)
      if (el.strokeEnabled && el.strokeColor && el.strokeWidth) {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = Math.max(1, (el.strokeWidth * dpi) / 72);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(displayText, drawX, centerY);
      }

      // Fill pass
      ctx.fillStyle = el.fillColor || '#FFFFFF';
      ctx.fillText(displayText, drawX, centerY);
    }

    ctx.restore();
  }

  return canvas;
}

/**
 * Builds a standalone, 100% valid PDF 1.4 binary file embedding a high-resolution JPEG raster
 * with physical dimensions in points (72 pt per inch).
 */
export function buildPdfFromJpegBlob(
  jpegBytes: Uint8Array,
  imageWidthPx: number,
  imageHeightPx: number,
  widthInInches: number,
  heightInInches: number
): Uint8Array {
  const ptWidth = Math.round(widthInInches * 72);
  const ptHeight = Math.round(heightInInches * 72);

  // Encode PDF header and objects
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let currentOffset = 0;

  const addStr = (str: string) => {
    const bytes = encoder.encode(str);
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  const header = `%PDF-1.4\n%\xe2\xe3\xcf\xd3\n`;
  addStr(header);

  const offsets: number[] = [];

  // Obj 1: Catalog
  offsets.push(currentOffset);
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  addStr(obj1);

  // Obj 2: Pages
  offsets.push(currentOffset);
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  addStr(obj2);

  // Obj 3: Page
  offsets.push(currentOffset);
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptWidth} ${ptHeight}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`;
  addStr(obj3);

  // Obj 4: Content Stream (scale and draw image)
  offsets.push(currentOffset);
  const contentStream = `q\n${ptWidth} 0 0 ${ptHeight} 0 0 cm\n/Im1 Do\nQ\n`;
  const obj4 = `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;
  addStr(obj4);

  // Obj 5: XObject Image
  offsets.push(currentOffset);
  const obj5Prefix = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imageWidthPx} /Height ${imageHeightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
  addStr(obj5Prefix);
  chunks.push(jpegBytes);
  currentOffset += jpegBytes.length;
  const obj5Suffix = `\nendstream\nendobj\n`;
  addStr(obj5Suffix);

  // Cross-reference table
  const xrefOffset = currentOffset;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  addStr(xref + trailer);

  // Combine all Uint8Array chunks
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const merged = new Uint8Array(totalLength);
  let pos = 0;
  for (const c of chunks) {
    merged.set(c, pos);
    pos += c.length;
  }
  return merged;
}

/**
 * Main export function: Generates Blob for requested format (PNG, JPG, PDF).
 */
export async function exportJersey(
  design: JerseyDesign,
  view: GarmentView,
  options: ExportOptions,
  rosterItem?: BatchRosterItem
): Promise<{ blob: Blob; filename: string; mimeType: string }> {
  const canvas = await renderJerseyToCanvas(design, view, options, rosterItem);
  const { widthInches, heightInches } = getDimensionsInInches(design.dimensions);

  // Suffix label
  const itemLabel = rosterItem ? `_${rosterItem.number}_${rosterItem.name.replace(/\s+/g, '_')}` : '';
  const viewLabel = `_${view.toUpperCase()}`;
  const baseName = `${design.name.replace(/\s+/g, '_')}${viewLabel}${itemLabel}`;

  if (options.format === 'png') {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Failed to create PNG blob'));
          resolve({
            blob,
            filename: `${baseName}_${options.dpi}DPI.png`,
            mimeType: 'image/png',
          });
        },
        'image/png'
      );
    });
  }

  if (options.format === 'jpg') {
    const quality = options.jpegQuality ?? 0.92;
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Failed to create JPG blob'));
          resolve({
            blob,
            filename: `${baseName}_${options.dpi}DPI_q${Math.round(quality * 100)}.jpg`,
            mimeType: 'image/jpeg',
          });
        },
        'image/jpeg',
        quality
      );
    });
  }

  if (options.format === 'pdf') {
    // Generate high quality JPEG raster first to embed in PDF
    const jpegBlob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Failed to create raster for PDF'));
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });

    const arrayBuf = await jpegBlob.arrayBuffer();
    const jpegBytes = new Uint8Array(arrayBuf);
    const pdfBytes = buildPdfFromJpegBlob(
      jpegBytes,
      canvas.width,
      canvas.height,
      widthInches,
      heightInches
    );

    const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    return {
      blob: pdfBlob,
      filename: `${baseName}_PrintReady_300DPI.pdf`,
      mimeType: 'application/pdf',
    };
  }

  throw new Error(`Unsupported export format: ${options.format}`);
}

/**
 * Triggers a native browser file download for a generated Blob.
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Batch Personalization Helper:
 * Iterates through roster items, personalizes design with dynamic player name and number,
 * exports each item, and executes progress callbacks.
 */
export async function renderBatchPersonalized(
  design: JerseyDesign,
  roster: BatchRosterItem[],
  options: ExportOptions,
  onProgress?: (current: number, total: number, itemName: string) => void
): Promise<Array<{ filename: string; blob: Blob }>> {
  const results: Array<{ filename: string; blob: Blob }> = [];
  const total = roster.length;

  for (let i = 0; i < total; i++) {
    const item = roster[i];
    if (onProgress) {
      onProgress(i + 1, total, `${item.name} (#${item.number})`);
    }

    const exported = await exportJersey(design, options.view === 'both' ? 'back' : options.view, options, item);
    results.push({
      filename: exported.filename,
      blob: exported.blob,
    });
  }

  return results;
}

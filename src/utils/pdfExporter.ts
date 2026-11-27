import { jsPDF } from 'jspdf';
import { ALBUM_FONTS, ALBUM_THEMES } from '../constants/albumStyles';
import {
  AlbumFont,
  AlbumPageEntry,
  AlbumPhoto,
  ExportOptions,
} from '../types/album';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지를 불러오지 못했습니다: ${src}`));
    img.src = src;
  });
}

async function ensureFontsLoaded(font: AlbumFont): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  await document.fonts.ready;
  const specs = [
    ...ALBUM_FONTS[font].loadSpecs,
    '500 22px "JetBrains Mono"',
  ];
  await Promise.all(specs.map((spec) => document.fonts.load(spec).catch(() => [])));
  await document.fonts.ready;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines?: number
): string[] {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    let currentLine = '';
    const chars = Array.from(paragraph);

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine.length > 0) {
        const lastSpace = currentLine.lastIndexOf(' ');
        if (lastSpace > Math.floor(currentLine.length * 0.55)) {
          lines.push(currentLine.slice(0, lastSpace));
          currentLine = currentLine.slice(lastSpace + 1) + char;
        } else {
          lines.push(currentLine);
          currentLine = char === ' ' ? '' : char;
        }
      } else {
        currentLine = testLine;
      }

      if (maxLines && lines.length >= maxLines) {
        break;
      }
    }

    if (currentLine && (!maxLines || lines.length < maxLines)) {
      lines.push(currentLine);
    }

    if (maxLines && lines.length >= maxLines) {
      break;
    }
  }

  if (maxLines && lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }

  return lines;
}

function drawCoverPage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ExportOptions,
  totalPages: number
) {
  const palette = ALBUM_THEMES[options.theme];
  const fontCfg = ALBUM_FONTS[options.font];
  const s = fontCfg.scale;
  const isLandscape = width > height;

  ctx.fillStyle = palette.pageBg;
  ctx.fillRect(0, 0, width, height);

  const margin = isLandscape ? 120 : 110;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Subtle top page indicator inside cover frame
  ctx.fillStyle = palette.textMuted;
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(
    `01 / ${String(totalPages).padStart(2, '0')}`,
    width - margin - 52,
    margin + 44
  );

  const contentW = width - margin * 2 - 180;
  const titleSize = Math.round((isLandscape ? 88 : 84) * s);
  const titleLineH = Math.round(titleSize * 1.28);
  const subtitleSize = Math.round((isLandscape ? 36 : 36) * s);
  const subtitleLineH = Math.round(subtitleSize * 1.45);
  const metaSize = Math.round((isLandscape ? 28 : 28) * s);

  const titleText = options.cover.title.trim() || '나의 사진 앨범';
  ctx.font = `700 ${titleSize}px ${fontCfg.canvasFamily}`;
  const titleLines = wrapText(ctx, titleText, contentW, 3);

  const subtitleText = options.cover.subtitle.trim();
  ctx.font = `400 ${subtitleSize}px ${fontCfg.canvasFamily}`;
  const subtitleLines = subtitleText ? wrapText(ctx, subtitleText, contentW * 0.85, 2) : [];

  const hasMeta = Boolean(options.cover.author.trim() || options.cover.date.trim());

  const totalBlockHeight =
    titleLines.length * titleLineH +
    (subtitleLines.length > 0 ? 28 + subtitleLines.length * subtitleLineH : 0) +
    (hasMeta ? 88 + metaSize : 0);

  let cursorY = Math.round((height - totalBlockHeight) / 2) - 10;

  // Cover Title (Large)
  ctx.fillStyle = palette.textPrimary;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `700 ${titleSize}px ${fontCfg.canvasFamily}`;
  for (const line of titleLines) {
    ctx.fillText(line, width / 2, cursorY);
    cursorY += titleLineH;
  }

  // Cover Subtitle
  if (subtitleLines.length > 0) {
    cursorY += 28;
    ctx.fillStyle = palette.textSecondary;
    ctx.font = `400 ${subtitleSize}px ${fontCfg.canvasFamily}`;
    for (const line of subtitleLines) {
      ctx.fillText(line, width / 2, cursorY);
      cursorY += subtitleLineH;
    }
  }

  // Short horizontal divider + Name & Date
  if (hasMeta) {
    cursorY += 44;
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 56, cursorY);
    ctx.lineTo(width / 2 + 56, cursorY);
    ctx.stroke();

    cursorY += 36;
    const metaParts = [options.cover.author.trim(), options.cover.date.trim()].filter(Boolean);
    ctx.fillStyle = palette.textSecondary;
    ctx.font = `600 ${metaSize}px ${fontCfg.canvasFamily}`;
    ctx.fillText(metaParts.join('  ·  '), width / 2, cursorY);
  }
}

function drawPhotoPage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  photo: AlbumPhoto,
  img: HTMLImageElement,
  pageNumber: number,
  totalPages: number,
  options: ExportOptions
) {
  const palette = ALBUM_THEMES[options.theme];
  const fontCfg = ALBUM_FONTS[options.font];
  const s = fontCfg.scale;
  const isLandscape = width > height;

  ctx.fillStyle = palette.pageBg;
  ctx.fillRect(0, 0, width, height);

  const padX = isLandscape ? 140 : 120;
  const padTop = isLandscape ? 105 : 120;
  const padBottom = isLandscape ? 105 : 120;

  // Running Header
  ctx.fillStyle = palette.textMuted;
  ctx.font = `500 ${Math.round(22 * Math.min(s, 1.1))}px ${fontCfg.canvasFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(options.cover.title.trim() || '모노그래프 앨범', padX, padTop - 52);

  ctx.textAlign = 'right';
  ctx.font = '500 22px "JetBrains Mono", monospace';
  const pageLabel = `${String(pageNumber).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`;
  ctx.fillText(pageLabel, width - padX, padTop - 52);

  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padX, padTop - 16);
  ctx.lineTo(width - padX, padTop - 16);
  ctx.stroke();

  const contentW = width - padX * 2;
  const captionAreaHeight = isLandscape ? 300 : 390;
  const imageAreaTop = padTop + 18;
  const imageAreaHeight = height - imageAreaTop - padBottom - captionAreaHeight;

  // Subtle archival mat frame
  ctx.fillStyle = palette.matBg;
  ctx.fillRect(padX, imageAreaTop, contentW, imageAreaHeight);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(padX, imageAreaTop, contentW, imageAreaHeight);

  const innerPad = 24;
  const maxImgW = contentW - innerPad * 2;
  const maxImgH = imageAreaHeight - innerPad * 2;
  const scale = Math.min(maxImgW / img.width, maxImgH / img.height);
  const drawW = Math.round(img.width * scale);
  const drawH = Math.round(img.height * scale);
  const drawX = Math.round(padX + (contentW - drawW) / 2);
  const drawY = Math.round(imageAreaTop + (imageAreaHeight - drawH) / 2);

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.strokeStyle = palette.photoBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(drawX, drawY, drawW, drawH);

  // Caption Zone
  const captionTop = imageAreaTop + imageAreaHeight + (isLandscape ? 40 : 52);
  const captionWidth = Math.min(contentW, isLandscape ? 1720 : contentW);
  const captionX = padX;

  const titleSize = Math.round((isLandscape ? 42 : 44) * s);
  const titleLineH = Math.round(titleSize * 1.32);
  const descSize = Math.round((isLandscape ? 26 : 28) * s);
  const descLineH = Math.round(descSize * 1.5);

  const titleText = photo.title.trim() || `사진 ${pageNumber - 1}`;
  ctx.fillStyle = palette.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `700 ${titleSize}px ${fontCfg.canvasFamily}`;

  const titleLines = wrapText(ctx, titleText, captionWidth, 2);
  let cursorY = captionTop;
  for (const line of titleLines) {
    ctx.fillText(line, captionX, cursorY);
    cursorY += titleLineH;
  }

  const descText = photo.description.trim();
  if (descText) {
    cursorY += 12;
    ctx.fillStyle = palette.textSecondary;
    ctx.font = `400 ${descSize}px ${fontCfg.canvasFamily}`;
    const maxDescLines = isLandscape ? 4 : 6;
    const descLines = wrapText(ctx, descText, captionWidth, maxDescLines);
    for (const line of descLines) {
      if (line === '') {
        cursorY += Math.round(descLineH * 0.5);
      } else {
        ctx.fillText(line, captionX, cursorY);
        cursorY += descLineH;
      }
    }
  }
}

function drawEndingPage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: ExportOptions,
  totalPages: number
) {
  const palette = ALBUM_THEMES[options.theme];
  const fontCfg = ALBUM_FONTS[options.font];
  const s = fontCfg.scale;
  const isLandscape = width > height;

  ctx.fillStyle = palette.pageBg;
  ctx.fillRect(0, 0, width, height);

  const margin = isLandscape ? 120 : 110;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Page index
  ctx.fillStyle = palette.textMuted;
  ctx.font = '500 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(
    `${String(totalPages).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`,
    width - margin - 52,
    margin + 44
  );

  const contentW = Math.min(width - margin * 2 - 220, isLandscape ? 1560 : 1240);
  const messageSize = Math.round((isLandscape ? 40 : 42) * s);
  const messageLineH = Math.round(messageSize * 1.65);
  const metaSize = Math.round(26 * s);

  const messageText =
    options.ending.message.trim() || '함께 바라본 모든 순간에 감사를 남깁니다.';

  ctx.font = `400 ${messageSize}px ${fontCfg.canvasFamily}`;
  const messageLines = wrapText(ctx, messageText, contentW, 8);

  const hasMeta = Boolean(options.cover.author.trim() || options.cover.date.trim());
  const blockHeight =
    messageLines.length * messageLineH + (hasMeta ? 96 + metaSize : 0);

  let cursorY = Math.round((height - blockHeight) / 2);

  ctx.fillStyle = palette.textPrimary;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `400 ${messageSize}px ${fontCfg.canvasFamily}`;

  for (const line of messageLines) {
    if (line === '') {
      cursorY += Math.round(messageLineH * 0.5);
    } else {
      ctx.fillText(line, width / 2, cursorY);
      cursorY += messageLineH;
    }
  }

  if (hasMeta) {
    cursorY += 48;
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 44, cursorY);
    ctx.lineTo(width / 2 + 44, cursorY);
    ctx.stroke();

    cursorY += 36;
    const metaParts = [options.cover.author.trim(), options.cover.date.trim()].filter(Boolean);
    ctx.fillStyle = palette.textMuted;
    ctx.font = `500 ${metaSize}px ${fontCfg.canvasFamily}`;
    ctx.fillText(metaParts.join('  ·  '), width / 2, cursorY);
  }
}

async function renderPageToCanvas(
  page: AlbumPageEntry,
  pageNumber: number,
  totalPages: number,
  options: ExportOptions
): Promise<HTMLCanvasElement> {
  const isLandscape = options.orientation === 'landscape';
  const canvasWidth = isLandscape ? 2480 : 1754;
  const canvasHeight = isLandscape ? 1754 : 2480;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('렌더링 컨텍스트를 생성하지 못했습니다.');
  }

  if (page.kind === 'cover') {
    drawCoverPage(ctx, canvasWidth, canvasHeight, options, totalPages);
  } else if (page.kind === 'photo') {
    const img = await loadImage(page.photo.src);
    drawPhotoPage(
      ctx,
      canvasWidth,
      canvasHeight,
      page.photo,
      img,
      pageNumber,
      totalPages,
      options
    );
  } else {
    drawEndingPage(ctx, canvasWidth, canvasHeight, options, totalPages);
  }

  return canvas;
}

function buildPageSequence(photos: AlbumPhoto[]): AlbumPageEntry[] {
  const pages: AlbumPageEntry[] = [{ kind: 'cover' }];
  photos.forEach((photo, idx) => {
    pages.push({ kind: 'photo', photo, photoIndex: idx });
  });
  pages.push({ kind: 'ending' });
  return pages;
}

function sanitizeBaseName(fileName: string, fallback: string): string {
  return (
    (fileName || fallback)
      .trim()
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\.(pdf|png)$/i, '') || '모노그래프_앨범'
  );
}

function triggerDataUrlDownload(dataUrl: string, downloadName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportAlbumToPdf(
  photos: AlbumPhoto[],
  options: ExportOptions,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (photos.length === 0) {
    throw new Error('내보낼 사진이 없습니다.');
  }

  await ensureFontsLoaded(options.font);

  const pages = buildPageSequence(photos);
  const doc = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = doc.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderPageToCanvas(pages[i], i + 1, pages.length, options);
    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    if (i > 0) {
      doc.addPage('a4', options.orientation);
    }
    doc.addImage(imgDataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    onProgress?.(i + 1, pages.length);
  }

  const safeBaseName = sanitizeBaseName(options.fileName, options.cover.title);
  doc.save(`${safeBaseName}.pdf`);
}

export async function exportSinglePageToPng(
  page: AlbumPageEntry,
  pageNumber: number,
  totalPages: number,
  options: ExportOptions
): Promise<void> {
  await ensureFontsLoaded(options.font);
  const canvas = await renderPageToCanvas(page, pageNumber, totalPages, options);
  const pngUrl = canvas.toDataURL('image/png');
  const safeBaseName = sanitizeBaseName(options.fileName, options.cover.title);
  const pageTag =
    page.kind === 'cover'
      ? '표지'
      : page.kind === 'ending'
        ? '마무리'
        : `${String(pageNumber).padStart(2, '0')}`;
  triggerDataUrlDownload(pngUrl, `${safeBaseName}_${pageTag}.png`);
}

export async function exportAllPagesToPng(
  photos: AlbumPhoto[],
  options: ExportOptions,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (photos.length === 0) {
    throw new Error('내보낼 사진이 없습니다.');
  }

  await ensureFontsLoaded(options.font);
  const pages = buildPageSequence(photos);
  const safeBaseName = sanitizeBaseName(options.fileName, options.cover.title);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const canvas = await renderPageToCanvas(page, i + 1, pages.length, options);
    const pngUrl = canvas.toDataURL('image/png');
    const suffix =
      page.kind === 'cover'
        ? '01_표지'
        : page.kind === 'ending'
          ? `${String(i + 1).padStart(2, '0')}_마무리`
          : `${String(i + 1).padStart(2, '0')}`;

    triggerDataUrlDownload(pngUrl, `${safeBaseName}_${suffix}.png`);
    onProgress?.(i + 1, pages.length);

    if (i < pages.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 160));
    }
  }
}

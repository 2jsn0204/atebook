import React, { useEffect, useState } from 'react';
import { Download, FileImage, Loader2, X } from 'lucide-react';
import { ALBUM_FONTS, ALBUM_THEMES } from '../constants/albumStyles';
import {
  AlbumFont,
  AlbumPageEntry,
  AlbumPhoto,
  AlbumTheme,
  CoverData,
  EndingData,
  ExportOptions,
  PageOrientation,
} from '../types/album';
import {
  exportAlbumToPdf,
  exportAllPagesToPng,
  exportSinglePageToPng,
} from '../utils/pdfExporter';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: AlbumPhoto[];
  cover: CoverData;
  ending: EndingData;
  currentPage: AlbumPageEntry;
  currentPageNumber: number;
  orientation: PageOrientation;
  onOrientationChange: (orientation: PageOrientation) => void;
  theme: AlbumTheme;
  font: AlbumFont;
}

type ExportFormat = 'pdf' | 'png-current' | 'png-all';

export function PdfExportModal({
  isOpen,
  onClose,
  photos,
  cover,
  ending,
  currentPage,
  currentPageNumber,
  orientation,
  onOrientationChange,
  theme,
  font,
}: PdfExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [fileName, setFileName] = useState(cover.title || '모노그래프_앨범');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFileName(cover.title.trim() || '모노그래프_앨범');
      setErrorMessage(null);
      setProgress(null);
    }
  }, [isOpen, cover.title]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExporting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExporting, onClose]);

  if (!isOpen) return null;

  const totalPages = photos.length + 2;
  const themeMeta = ALBUM_THEMES[theme];
  const fontMeta = ALBUM_FONTS[font];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExporting || photos.length === 0) return;

    setIsExporting(true);
    setErrorMessage(null);

    const options: ExportOptions = {
      cover,
      ending,
      orientation,
      theme,
      font,
      fileName,
    };

    try {
      if (format === 'pdf') {
        setProgress({ current: 0, total: totalPages });
        await exportAlbumToPdf(photos, options, (current, total) => {
          setProgress({ current, total });
        });
      } else if (format === 'png-current') {
        setProgress({ current: 0, total: 1 });
        await exportSinglePageToPng(currentPage, currentPageNumber, totalPages, options);
        setProgress({ current: 1, total: 1 });
      } else {
        setProgress({ current: 0, total: totalPages });
        await exportAllPagesToPng(photos, options, (current, total) => {
          setProgress({ current, total });
        });
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : '파일을 생성하는 중 오류가 발생했습니다.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/45 backdrop-blur-[2px]"
      onClick={() => {
        if (!isExporting) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl border border-zinc-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div>
            <h2 id="export-modal-title" className="font-serif text-lg font-bold text-zinc-900">
              앨범 저장하기
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">
              총 {totalPages}쪽 (표지 + 사진 {photos.length}장 + 마무리) · {themeMeta.label} · {fontMeta.label}
            </p>
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            aria-label="닫기"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <span className="block text-xs font-medium text-zinc-700 mb-1.5">저장 형식</span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-lg">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setFormat('pdf')}
                className={`py-2 px-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  format === 'pdf'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                PDF 전체 앨범
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setFormat('png-current')}
                className={`py-2 px-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  format === 'png-current'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                PNG 현재 쪽
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setFormat('png-all')}
                className={`py-2 px-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  format === 'png-all'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                PNG 전체 쪽
              </button>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-zinc-700 mb-1.5">용지 방향</span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-lg">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onOrientationChange('landscape')}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  orientation === 'landscape'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                가로형 (A4 Landscape)
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onOrientationChange('portrait')}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  orientation === 'portrait'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                세로형 (A4 Portrait)
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="export-file-name" className="block text-xs font-medium text-zinc-700 mb-1.5">
              저장할 파일명
            </label>
            <div className="flex items-center">
              <input
                id="export-file-name"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={isExporting}
                className="w-full px-3.5 py-2.5 text-sm rounded-l-lg border border-r-0 border-zinc-300 text-zinc-900 focus:border-blue-600 focus:outline-none disabled:bg-zinc-50"
              />
              <span className="px-3.5 py-2.5 text-sm font-mono text-zinc-500 bg-zinc-50 border border-zinc-300 rounded-r-lg">
                {format === 'pdf' ? '.pdf' : '.png'}
              </span>
            </div>
          </div>

          {errorMessage && (
            <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {errorMessage}
            </p>
          )}

          {isExporting && progress && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>
                  {format === 'pdf' ? 'PDF 페이지 생성 중...' : 'PNG 이미지 생성 중...'}
                </span>
                <span className="font-mono tabular-nums">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-150"
                  style={{
                    width: `${Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
            <button
              type="button"
              disabled={isExporting}
              onClick={onClose}
              className="px-4 py-2.5 min-h-[40px] rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 transition-colors whitespace-nowrap"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 disabled:bg-zinc-700 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
                  <span>생성 중...</span>
                </>
              ) : format === 'pdf' ? (
                <>
                  <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>PDF 다운로드</span>
                </>
              ) : (
                <>
                  <FileImage className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>PNG 다운로드</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileImage,
  ImagePlus,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AlbumPageSheet } from './components/AlbumPageSheet';
import { CoverPageSheet } from './components/CoverPageSheet';
import { EmptyDropzone } from './components/EmptyDropzone';
import { EndingPageSheet } from './components/EndingPageSheet';
import { PageFilmstrip } from './components/PageFilmstrip';
import { PdfExportModal } from './components/PdfExportModal';
import { TopBar } from './components/TopBar';
import { ALBUM_FONTS, ALBUM_THEMES } from './constants/albumStyles';
import { createSamplePhotos } from './data/samplePhotos';
import {
  AlbumFont,
  AlbumPageEntry,
  AlbumPhoto,
  AlbumTheme,
  CoverData,
  EndingData,
  PageOrientation,
} from './types/album';
import { exportSinglePageToPng } from './utils/pdfExporter';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function stripExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, '');
}

const THEME_OPTIONS: AlbumTheme[] = ['white', 'beige', 'navy'];
const FONT_OPTIONS: AlbumFont[] = ['gothic', 'myeongjo', 'handwriting'];

export default function App() {
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  // Page sequence when photos.length > 0:
  // 0 = Cover, 1..photos.length = Photos, photos.length + 1 = Ending
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [cover, setCover] = useState<CoverData>({
    title: '나의 사진 앨범',
    subtitle: '한 장씩 천천히 꺼내 보는 기억',
    author: '',
    date: new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
    }),
  });
  const [ending, setEnding] = useState<EndingData>({
    message: '이 앨범에 담긴 순간들이 오래도록 따뜻한 기억으로 남기를 바랍니다.',
  });
  const [orientation, setOrientation] = useState<PageOrientation>('landscape');
  const [theme, setTheme] = useState<AlbumTheme>('white');
  const [font, setFont] = useState<AlbumFont>('myeongjo');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isWorkspaceDragging, setIsWorkspaceDragging] = useState(false);
  const [isQuickPngSaving, setIsQuickPngSaving] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<AlbumPhoto[]>(photos);
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      for (const photo of photosRef.current) {
        if (photo.isObjectUrl) {
          URL.revokeObjectURL(photo.src);
        }
      }
    };
  }, []);

  const pages = useMemo<AlbumPageEntry[]>(() => {
    if (photos.length === 0) return [];
    const list: AlbumPageEntry[] = [{ kind: 'cover' }];
    photos.forEach((photo, idx) => {
      list.push({ kind: 'photo', photo, photoIndex: idx });
    });
    list.push({ kind: 'ending' });
    return list;
  }, [photos]);

  const totalPages = pages.length;

  const handleFilesSelected = useCallback((fileList: FileList | File[]) => {
    const imageFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith('image/')
    );
    if (imageFiles.length === 0) return;

    const newPhotos: AlbumPhoto[] = imageFiles.map((file) => ({
      id: generateId(),
      src: URL.createObjectURL(file),
      fileName: file.name,
      title: stripExtension(file.name),
      description: '',
      isObjectUrl: true,
    }));

    setPhotos((prev) => {
      const firstNewPageIndex = prev.length + 1;
      const next = [...prev, ...newPhotos];
      setDirection(1);
      setCurrentPageIndex(firstNewPageIndex);
      return next;
    });
  }, []);

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLoadSamples = useCallback(() => {
    setPhotos((prev) => {
      for (const p of prev) {
        if (p.isObjectUrl) URL.revokeObjectURL(p.src);
      }
      return createSamplePhotos();
    });
    setCover({
      title: '빛과 고요의 기록',
      subtitle: '천천히 걸으며 마주한 네 번의 풍경',
      author: '모노그래프',
      date: '2026년 11월',
    });
    setEnding({
      message: '머물렀던 빛의 온도와 고요한 숨결을 이 마지막 페이지에 남겨둡니다.',
    });
    setDirection(1);
    setCurrentPageIndex(0);
  }, []);

  const handleClearAll = useCallback(() => {
    setPhotos((prev) => {
      for (const p of prev) {
        if (p.isObjectUrl) URL.revokeObjectURL(p.src);
      }
      return [];
    });
    setCurrentPageIndex(0);
  }, []);

  const handleUpdateCover = useCallback((patch: Partial<CoverData>) => {
    setCover((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleUpdateEnding = useCallback((patch: Partial<EndingData>) => {
    setEnding((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleUpdatePhoto = useCallback(
    (id: string, patch: Partial<Pick<AlbumPhoto, 'title' | 'description'>>) => {
      setPhotos((prev) =>
        prev.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo))
      );
    },
    []
  );

  const handleRemovePhoto = useCallback((photoIndexToRemove: number) => {
    const removedPageIndex = photoIndexToRemove + 1;
    setPhotos((prev) => {
      const target = prev[photoIndexToRemove];
      if (target?.isObjectUrl) {
        URL.revokeObjectURL(target.src);
      }
      const next = prev.filter((_, i) => i !== photoIndexToRemove);
      setCurrentPageIndex((curr) => {
        if (next.length === 0) return 0;
        const maxPageIdx = next.length + 1;
        if (curr > removedPageIndex) return curr - 1;
        if (curr > maxPageIdx) return maxPageIdx;
        return curr;
      });
      return next;
    });
  }, []);

  const handleMovePhoto = useCallback((photoIndex: number, moveDir: 'prev' | 'next') => {
    setPhotos((prev) => {
      const targetPhotoIndex = moveDir === 'prev' ? photoIndex - 1 : photoIndex + 1;
      if (targetPhotoIndex < 0 || targetPhotoIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(photoIndex, 1);
      next.splice(targetPhotoIndex, 0, moved);
      setCurrentPageIndex(targetPhotoIndex + 1);
      return next;
    });
  }, []);

  const goToPageIndex = useCallback(
    (nextIdx: number) => {
      if (nextIdx < 0 || nextIdx >= totalPages || nextIdx === currentPageIndex) return;
      setDirection(nextIdx > currentPageIndex ? 1 : -1);
      setCurrentPageIndex(nextIdx);
    },
    [currentPageIndex, totalPages]
  );

  const goPrev = useCallback(() => {
    if (currentPageIndex > 0) {
      setDirection(-1);
      setCurrentPageIndex((i) => Math.max(0, i - 1));
    }
  }, [currentPageIndex]);

  const goNext = useCallback(() => {
    if (currentPageIndex < totalPages - 1) {
      setDirection(1);
      setCurrentPageIndex((i) => Math.min(totalPages - 1, i + 1));
    }
  }, [currentPageIndex, totalPages]);

  useEffect(() => {
    if (totalPages === 0 || isExportModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, isExportModalOpen, goPrev, goNext]);

  const handleWorkspaceDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (photos.length === 0) return;
    e.preventDefault();
    if (!isWorkspaceDragging) setIsWorkspaceDragging(true);
  };

  const handleWorkspaceDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (photos.length === 0) return;
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsWorkspaceDragging(false);
  };

  const handleWorkspaceDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (photos.length === 0) return;
    e.preventDefault();
    setIsWorkspaceDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const safePageIndex = Math.min(currentPageIndex, Math.max(0, totalPages - 1));
  const currentPage = pages[safePageIndex];
  const canGoPrev = safePageIndex > 0;
  const canGoNext = safePageIndex < totalPages - 1;

  const handleQuickPngDownload = async () => {
    if (!currentPage || isQuickPngSaving) return;
    setIsQuickPngSaving(true);
    try {
      await exportSinglePageToPng(currentPage, safePageIndex + 1, totalPages, {
        cover,
        ending,
        orientation,
        theme,
        font,
        fileName: cover.title || '모노그래프_앨범',
      });
    } finally {
      setIsQuickPngSaving(false);
    }
  };

  return (
    <div
      id="top"
      className="min-h-screen flex flex-col bg-[#F4F4F2] text-zinc-900 relative"
      onDragOver={handleWorkspaceDragOver}
      onDragLeave={handleWorkspaceDragLeave}
      onDrop={handleWorkspaceDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(e.target.files);
          }
          e.target.value = '';
        }}
      />

      <TopBar
        photoCount={photos.length}
        onAddPhotosClick={triggerFilePicker}
        onLoadSamples={handleLoadSamples}
        onClearAll={handleClearAll}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {isWorkspaceDragging && (
        <div className="fixed inset-0 z-40 bg-zinc-900/35 backdrop-blur-[2px] flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-white border-2 border-dashed border-blue-600 rounded-2xl px-10 py-8 text-center shadow-xl">
            <p className="font-serif text-xl font-semibold text-zinc-900">
              여기에 사진을 놓아 앨범에 추가하세요
            </p>
            <p className="text-sm text-zinc-500 mt-1">
              추가된 사진은 한 쪽에 한 장씩 순서대로 붙습니다
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {photos.length === 0 ? (
          <EmptyDropzone
            onFilesSelected={handleFilesSelected}
            onTriggerFilePicker={triggerFilePicker}
            onLoadSamples={handleLoadSamples}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            {/* Workspace Style & Format Toolbar */}
            <div className="max-w-5xl w-full mx-auto px-4 sm:px-8 pt-5 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200/80">
                {/* 3 Album Color Mood Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500 mr-1 whitespace-nowrap">
                    분위기
                  </span>
                  <div
                    role="group"
                    aria-label="앨범 색 분위기 선택"
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    {THEME_OPTIONS.map((themeId) => {
                      const t = ALBUM_THEMES[themeId];
                      const isActive = theme === themeId;
                      return (
                        <button
                          key={themeId}
                          type="button"
                          onClick={() => setTheme(themeId)}
                          aria-pressed={isActive}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-medium transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                            isActive
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              backgroundColor: t.swatch,
                              borderColor: isActive ? 'rgba(255,255,255,0.4)' : t.swatchBorder,
                            }}
                            className="w-3.5 h-3.5 rounded-sm border shrink-0"
                          />
                          <span>
                            {t.label}({t.mood})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3 Font Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500 mr-1 whitespace-nowrap">
                    글꼴
                  </span>
                  <div
                    role="group"
                    aria-label="앨범 글꼴 선택"
                    className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg"
                  >
                    {FONT_OPTIONS.map((fontId) => {
                      const f = ALBUM_FONTS[fontId];
                      const isActive = font === fontId;
                      return (
                        <button
                          key={fontId}
                          type="button"
                          onClick={() => setFont(fontId)}
                          aria-pressed={isActive}
                          style={{ fontFamily: f.cssFamily }}
                          className={`px-3 py-1.5 min-h-[32px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                            isActive
                              ? 'bg-white text-zinc-900 shadow-sm'
                              : 'text-zinc-600 hover:text-zinc-900'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Orientation + Quick PNG Save + Mobile Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    role="group"
                    aria-label="페이지 방향 선택"
                    className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg"
                  >
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        orientation === 'landscape'
                          ? 'bg-white text-zinc-900 shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      가로형
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        orientation === 'portrait'
                          ? 'bg-white text-zinc-900 shadow-sm'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      세로형
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isQuickPngSaving}
                    onClick={handleQuickPngDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-white border border-zinc-200 hover:border-zinc-400 text-xs font-medium text-zinc-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <FileImage className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{isQuickPngSaving ? '저장 중...' : '이 쪽 PNG'}</span>
                  </button>

                  <div className="flex md:hidden items-center gap-1.5">
                    <button
                      type="button"
                      onClick={triggerFilePicker}
                      aria-label="사진 추가"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-700 hover:text-zinc-900 whitespace-nowrap"
                    >
                      <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>추가</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      aria-label="전체 비우기"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Single-Page Album Stage with Prev / Next Buttons */}
            <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-2 flex items-center justify-center gap-4 lg:gap-8">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev}
                aria-label="이전 페이지"
                className="hidden lg:inline-flex flex-col items-center justify-center gap-1.5 w-20 py-4 rounded-xl bg-white border border-zinc-200/90 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:bg-white disabled:cursor-not-allowed transition-all shrink-0 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs font-medium whitespace-nowrap">이전</span>
              </button>

              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  {currentPage && (
                    <motion.div
                      key={
                        currentPage.kind === 'photo'
                          ? currentPage.photo.id
                          : currentPage.kind
                      }
                      initial={{ opacity: 0, x: direction * 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -18 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {currentPage.kind === 'cover' && (
                        <CoverPageSheet
                          cover={cover}
                          totalPages={totalPages}
                          orientation={orientation}
                          theme={theme}
                          font={font}
                          onUpdateCover={handleUpdateCover}
                        />
                      )}

                      {currentPage.kind === 'photo' && (
                        <AlbumPageSheet
                          photo={currentPage.photo}
                          pageNumber={safePageIndex + 1}
                          totalPages={totalPages}
                          albumTitle={cover.title}
                          orientation={orientation}
                          theme={theme}
                          font={font}
                          onUpdatePhoto={handleUpdatePhoto}
                        />
                      )}

                      {currentPage.kind === 'ending' && (
                        <EndingPageSheet
                          ending={ending}
                          cover={cover}
                          totalPages={totalPages}
                          orientation={orientation}
                          theme={theme}
                          font={font}
                          onUpdateEnding={handleUpdateEnding}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                aria-label="다음 페이지"
                className="hidden lg:inline-flex flex-col items-center justify-center gap-1.5 w-20 py-4 rounded-xl bg-white border border-zinc-200/90 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-30 disabled:hover:border-zinc-200 disabled:hover:bg-white disabled:cursor-not-allowed transition-all shrink-0 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
                <span className="text-xs font-medium whitespace-nowrap">다음</span>
              </button>
            </div>

            {/* Mobile/Tablet Prev · Page Counter · Next Bar */}
            <div className="max-w-5xl w-full mx-auto px-4 sm:px-8 pt-4 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={goPrev}
                disabled={!canGoPrev}
                className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg bg-white border border-zinc-200 text-sm font-medium text-zinc-800 hover:border-zinc-400 disabled:opacity-35 disabled:cursor-not-allowed transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>이전</span>
              </button>

              <span className="font-mono text-xs text-zinc-500 tabular-nums px-2">
                {String(safePageIndex + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
              </span>

              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg bg-white border border-zinc-200 text-sm font-medium text-zinc-800 hover:border-zinc-400 disabled:opacity-35 disabled:cursor-not-allowed transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <span>다음</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Bottom Page Filmstrip */}
            <PageFilmstrip
              photos={photos}
              cover={cover}
              ending={ending}
              theme={theme}
              font={font}
              currentPageIndex={safePageIndex}
              onSelectPageIndex={goToPageIndex}
              onMovePhoto={handleMovePhoto}
              onRemovePhoto={handleRemovePhoto}
              onAddPhotosClick={triggerFilePicker}
            />
          </div>
        )}
      </main>

      {currentPage && (
        <PdfExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          photos={photos}
          cover={cover}
          ending={ending}
          currentPage={currentPage}
          currentPageNumber={safePageIndex + 1}
          orientation={orientation}
          onOrientationChange={setOrientation}
          theme={theme}
          font={font}
        />
      )}
    </div>
  );
}

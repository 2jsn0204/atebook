import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { ALBUM_FONTS, ALBUM_THEMES } from '../constants/albumStyles';
import {
  AlbumFont,
  AlbumPhoto,
  AlbumTheme,
  CoverData,
  EndingData,
} from '../types/album';

interface PageFilmstripProps {
  photos: AlbumPhoto[];
  cover: CoverData;
  ending: EndingData;
  theme: AlbumTheme;
  font: AlbumFont;
  currentPageIndex: number;
  onSelectPageIndex: (pageIndex: number) => void;
  onMovePhoto: (photoIndex: number, direction: 'prev' | 'next') => void;
  onRemovePhoto: (photoIndex: number) => void;
  onAddPhotosClick: () => void;
}

export function PageFilmstrip({
  photos,
  cover,
  ending,
  theme,
  font,
  currentPageIndex,
  onSelectPageIndex,
  onMovePhoto,
  onRemovePhoto,
  onAddPhotosClick,
}: PageFilmstripProps) {
  const palette = ALBUM_THEMES[theme];
  const fontCfg = ALBUM_FONTS[font];

  const totalPages = photos.length + 2;
  const endingPageIndex = photos.length + 1;
  const isPhotoSelected =
    currentPageIndex >= 1 && currentPageIndex <= photos.length;
  const selectedPhotoIndex = currentPageIndex - 1;

  return (
    <section
      aria-label="페이지 목록"
      className="max-w-5xl w-full mx-auto px-4 sm:px-8 pt-4 pb-10"
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">전체 페이지</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            표지 + 사진 {photos.length}장 + 마무리 (총 {totalPages}쪽)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={!isPhotoSelected || selectedPhotoIndex === 0}
            onClick={() => onMovePhoto(selectedPhotoIndex, 'prev')}
            aria-label="현재 사진을 앞으로 이동"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70 disabled:opacity-35 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>앞으로</span>
          </button>
          <button
            type="button"
            disabled={!isPhotoSelected || selectedPhotoIndex === photos.length - 1}
            onClick={() => onMovePhoto(selectedPhotoIndex, 'next')}
            aria-label="현재 사진을 뒤로 이동"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70 disabled:opacity-35 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span>뒤로</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="filmstrip-scroll flex items-stretch gap-3 overflow-x-auto pb-2 pt-1">
        {/* Cover Page Tile */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => onSelectPageIndex(0)}
            aria-label={`1페이지 표지: ${cover.title || '나의 사진 앨범'}`}
            aria-current={currentPageIndex === 0 ? 'page' : undefined}
            className={`w-24 sm:w-28 rounded-lg bg-white p-1.5 border text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              currentPageIndex === 0
                ? 'border-zinc-900 ring-2 ring-zinc-900/15'
                : 'border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <div
              style={{
                backgroundColor: palette.pageBg,
                borderColor: palette.border,
                color: palette.textPrimary,
                fontFamily: fontCfg.cssFamily,
              }}
              className="w-full h-16 sm:h-[72px] rounded border flex flex-col items-center justify-center px-2 text-center mb-1.5 overflow-hidden"
            >
              <span className="text-[11px] font-bold leading-tight line-clamp-2">
                {cover.title.trim() || '표지'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 px-0.5">
              <span className="font-mono text-[11px] text-zinc-500 tabular-nums shrink-0">
                01
              </span>
              <span className="text-[11px] font-medium text-zinc-700 truncate">
                표지
              </span>
            </div>
          </button>
        </div>

        {/* Photo Page Tiles */}
        {photos.map((photo, photoIdx) => {
          const pageIndex = photoIdx + 1;
          const isActive = pageIndex === currentPageIndex;
          return (
            <div key={photo.id} className="relative group shrink-0">
              <button
                type="button"
                onClick={() => onSelectPageIndex(pageIndex)}
                aria-label={`${pageIndex + 1}페이지: ${photo.title || photo.fileName}`}
                aria-current={isActive ? 'page' : undefined}
                className={`w-24 sm:w-28 rounded-lg bg-white p-1.5 border text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'border-zinc-900 ring-2 ring-zinc-900/15'
                    : 'border-zinc-200 hover:border-zinc-400'
                }`}
              >
                <div
                  style={{ backgroundColor: palette.matBg }}
                  className="w-full h-16 sm:h-[72px] rounded overflow-hidden flex items-center justify-center mb-1.5"
                >
                  <img
                    src={photo.src}
                    alt={photo.title || `썸네일 ${photoIdx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-1 px-0.5">
                  <span className="font-mono text-[11px] text-zinc-500 tabular-nums shrink-0">
                    {String(pageIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-zinc-700 truncate">
                    {photo.title.trim() || '제목 없음'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePhoto(photoIdx);
                }}
                aria-label={`${pageIndex + 1}페이지 사진 삭제`}
                title="이 사진 삭제"
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity shadow-sm hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}

        {/* Ending Page Tile */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => onSelectPageIndex(endingPageIndex)}
            aria-label={`${totalPages}페이지 마무리`}
            aria-current={currentPageIndex === endingPageIndex ? 'page' : undefined}
            className={`w-24 sm:w-28 rounded-lg bg-white p-1.5 border text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              currentPageIndex === endingPageIndex
                ? 'border-zinc-900 ring-2 ring-zinc-900/15'
                : 'border-zinc-200 hover:border-zinc-400'
            }`}
          >
            <div
              style={{
                backgroundColor: palette.pageBg,
                borderColor: palette.border,
                color: palette.textSecondary,
                fontFamily: fontCfg.cssFamily,
              }}
              className="w-full h-16 sm:h-[72px] rounded border flex flex-col items-center justify-center px-2 text-center mb-1.5 overflow-hidden"
            >
              <span className="text-[10px] leading-snug line-clamp-2">
                {ending.message.trim() || '마무리 문구'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 px-0.5">
              <span className="font-mono text-[11px] text-zinc-500 tabular-nums shrink-0">
                {String(totalPages).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-medium text-zinc-700 truncate">
                마무리
              </span>
            </div>
          </button>
        </div>

        {/* Add More Photos Tile */}
        <button
          type="button"
          onClick={onAddPhotosClick}
          className="w-24 sm:w-28 min-h-[104px] rounded-lg border border-dashed border-zinc-300 hover:border-zinc-500 bg-white/60 hover:bg-white flex flex-col items-center justify-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span className="text-xs font-medium whitespace-nowrap">사진 추가</span>
        </button>
      </div>
    </section>
  );
}

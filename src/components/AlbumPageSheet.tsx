import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { ALBUM_FONTS, ALBUM_THEMES } from '../constants/albumStyles';
import { AlbumFont, AlbumPhoto, AlbumTheme, PageOrientation } from '../types/album';

interface AlbumPageSheetProps {
  photo: AlbumPhoto;
  pageNumber: number;
  totalPages: number;
  albumTitle: string;
  orientation: PageOrientation;
  theme: AlbumTheme;
  font: AlbumFont;
  onUpdatePhoto: (id: string, patch: Partial<Pick<AlbumPhoto, 'title' | 'description'>>) => void;
}

export function AlbumPageSheet({
  photo,
  pageNumber,
  totalPages,
  albumTitle,
  orientation,
  theme,
  font,
  onUpdatePhoto,
}: AlbumPageSheetProps) {
  const [imgError, setImgError] = useState(false);

  const palette = ALBUM_THEMES[theme];
  const fontCfg = ALBUM_FONTS[font];
  const isLandscape = orientation === 'landscape';
  const isHandwriting = font === 'handwriting';
  const pageNumberLabel = `${String(pageNumber).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`;

  return (
    <article
      aria-label={`${pageNumber}번째 앨범 페이지`}
      style={{
        backgroundColor: palette.pageBg,
        borderColor: palette.border,
        color: palette.textPrimary,
      }}
      className={`w-full mx-auto border rounded-lg shadow-[0_14px_40px_-14px_rgba(24,24,27,0.12)] transition-[max-width,background-color,border-color,color] duration-200 ${
        isLandscape ? 'max-w-[880px]' : 'max-w-[580px]'
      }`}
    >
      <div className="p-5 sm:p-8 lg:p-10 flex flex-col">
        {/* Quiet Running Header */}
        <div
          style={{ borderColor: palette.border }}
          className="flex items-center justify-between gap-4 pb-3 mb-5 border-b transition-colors duration-200"
        >
          <span
            style={{
              color: palette.textMuted,
              fontFamily: fontCfg.cssFamily,
            }}
            className="text-xs font-medium truncate max-w-[70%]"
          >
            {albumTitle.trim() || '모노그래프 앨범'}
          </span>
          <span
            style={{ color: palette.textMuted }}
            className="font-mono text-xs tabular-nums shrink-0"
          >
            {pageNumberLabel}
          </span>
        </div>

        {/* Single Photo Frame */}
        <div
          style={{
            backgroundColor: palette.matBg,
            borderColor: palette.border,
          }}
          className={`w-full border rounded-sm overflow-hidden flex items-center justify-center p-3 sm:p-5 transition-colors duration-200 ${
            isLandscape
              ? 'h-[260px] sm:h-[360px] lg:h-[420px]'
              : 'h-[320px] sm:h-[430px] lg:h-[480px]'
          }`}
        >
          {imgError ? (
            <div className="flex flex-col items-center justify-center text-center px-4 py-8">
              <ImageOff
                className="w-8 h-8 mb-2"
                style={{ color: palette.textMuted }}
                aria-hidden="true"
              />
              <p style={{ color: palette.textPrimary }} className="text-sm font-medium">
                {photo.fileName}
              </p>
              <p style={{ color: palette.textMuted }} className="text-xs mt-1">
                이미지를 불러올 수 없습니다
              </p>
            </div>
          ) : (
            <img
              key={photo.id}
              src={photo.src}
              alt={photo.title || photo.fileName || `사진 ${pageNumber}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="max-w-full max-h-full w-auto h-auto object-contain shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
            />
          )}
        </div>

        {/* Editable Per-Photo Title & Description */}
        <div
          style={{ fontFamily: fontCfg.cssFamily }}
          className="mt-6 pt-1 space-y-2.5"
        >
          <div>
            <label htmlFor={`photo-title-${photo.id}`} className="sr-only">
              사진 제목
            </label>
            <input
              id={`photo-title-${photo.id}`}
              type="text"
              value={photo.title}
              onChange={(e) => onUpdatePhoto(photo.id, { title: e.target.value })}
              placeholder="이 사진의 제목을 입력하세요"
              style={{ color: palette.textPrimary }}
              className={`w-full font-semibold bg-transparent border-b border-transparent focus:outline-none py-1 transition-colors ${
                palette.isDark
                  ? 'placeholder:text-slate-400/55 hover:border-slate-500/40 focus:border-blue-400'
                  : 'placeholder:text-zinc-300 hover:border-zinc-300/80 focus:border-blue-600'
              } ${
                isHandwriting
                  ? 'text-2xl sm:text-3xl'
                  : 'text-lg sm:text-2xl'
              }`}
            />
          </div>

          <div>
            <label htmlFor={`photo-desc-${photo.id}`} className="sr-only">
              사진 설명
            </label>
            <textarea
              id={`photo-desc-${photo.id}`}
              value={photo.description}
              onChange={(e) => onUpdatePhoto(photo.id, { description: e.target.value })}
              placeholder="사진에 담긴 기억이나 짧은 설명을 적어보세요..."
              rows={isLandscape ? 2 : 3}
              style={{ color: palette.textSecondary }}
              className={`w-full leading-relaxed bg-transparent border border-transparent rounded-md px-0 focus:px-2.5 py-1.5 focus:outline-none resize-none transition-all ${
                palette.isDark
                  ? 'placeholder:text-slate-400/50 hover:border-slate-500/40 focus:border-blue-400 focus:bg-slate-900/30'
                  : 'placeholder:text-zinc-300 hover:border-zinc-300/80 focus:border-blue-600 focus:bg-black/[0.02]'
              } ${
                isHandwriting
                  ? 'text-lg sm:text-xl'
                  : 'text-sm sm:text-[15px]'
              }`}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

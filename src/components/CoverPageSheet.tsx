import { ALBUM_FONTS, ALBUM_THEMES } from '../constants/albumStyles';
import { AlbumFont, AlbumTheme, CoverData, PageOrientation } from '../types/album';

interface CoverPageSheetProps {
  cover: CoverData;
  totalPages: number;
  orientation: PageOrientation;
  theme: AlbumTheme;
  font: AlbumFont;
  onUpdateCover: (patch: Partial<CoverData>) => void;
}

export function CoverPageSheet({
  cover,
  totalPages,
  orientation,
  theme,
  font,
  onUpdateCover,
}: CoverPageSheetProps) {
  const palette = ALBUM_THEMES[theme];
  const fontCfg = ALBUM_FONTS[font];
  const isLandscape = orientation === 'landscape';
  const isHandwriting = font === 'handwriting';
  const pageNumberLabel = `01 / ${String(totalPages).padStart(2, '0')}`;

  return (
    <article
      aria-label="앨범 표지 페이지"
      style={{
        backgroundColor: palette.pageBg,
        borderColor: palette.border,
        color: palette.textPrimary,
      }}
      className={`w-full mx-auto border rounded-lg shadow-[0_14px_40px_-14px_rgba(24,24,27,0.12)] transition-[max-width,background-color,border-color,color] duration-200 ${
        isLandscape ? 'max-w-[880px]' : 'max-w-[580px]'
      }`}
    >
      <div className="p-6 sm:p-10 lg:p-12">
        <div
          style={{ borderColor: palette.border }}
          className={`border rounded-sm flex flex-col justify-between p-6 sm:p-10 transition-colors duration-200 ${
            isLandscape
              ? 'min-h-[420px] sm:min-h-[520px] lg:min-h-[560px]'
              : 'min-h-[500px] sm:min-h-[600px] lg:min-h-[640px]'
          }`}
        >
          {/* Top quiet cover header */}
          <div className="flex items-center justify-between gap-4">
            <span
              style={{ color: palette.textMuted }}
              className="text-xs font-medium tracking-wide"
            >
              표지
            </span>
            <span
              style={{ color: palette.textMuted }}
              className="font-mono text-xs tabular-nums shrink-0"
            >
              {pageNumberLabel}
            </span>
          </div>

          {/* Center Large Cover Typography */}
          <div
            style={{ fontFamily: fontCfg.cssFamily }}
            className="my-auto py-8 flex flex-col items-center text-center max-w-2xl mx-auto w-full"
          >
            <div className="w-full mb-4">
              <label htmlFor="cover-title" className="sr-only">
                앨범 제목
              </label>
              <textarea
                id="cover-title"
                rows={2}
                value={cover.title}
                onChange={(e) => onUpdateCover({ title: e.target.value })}
                placeholder="앨범 제목을 입력하세요"
                style={{
                  color: palette.textPrimary,
                  caretColor: palette.textPrimary,
                }}
                className={`w-full text-center font-bold bg-transparent border-b border-transparent focus:outline-none resize-none leading-[1.22] transition-colors ${
                  palette.isDark
                    ? 'placeholder:text-slate-400/60 hover:border-slate-500/40 focus:border-blue-400'
                    : 'placeholder:text-zinc-300 hover:border-zinc-300/80 focus:border-blue-600'
                } ${
                  isHandwriting
                    ? 'text-4xl sm:text-5xl lg:text-[56px]'
                    : 'text-3xl sm:text-4xl lg:text-[46px]'
                }`}
              />
            </div>

            <div className="w-full max-w-xl mb-8">
              <label htmlFor="cover-subtitle" className="sr-only">
                앨범 부제
              </label>
              <input
                id="cover-subtitle"
                type="text"
                value={cover.subtitle}
                onChange={(e) => onUpdateCover({ subtitle: e.target.value })}
                placeholder="부제를 입력하세요 (예: 함께 걸었던 계절의 기록)"
                style={{
                  color: palette.textSecondary,
                }}
                className={`w-full text-center bg-transparent border-b border-transparent focus:outline-none py-1 transition-colors ${
                  palette.isDark
                    ? 'placeholder:text-slate-400/55 hover:border-slate-500/40 focus:border-blue-400'
                    : 'placeholder:text-zinc-300 hover:border-zinc-300/80 focus:border-blue-600'
                } ${
                  isHandwriting
                    ? 'text-xl sm:text-2xl'
                    : 'text-base sm:text-xl'
                }`}
              />
            </div>

            <div
              style={{ backgroundColor: palette.border }}
              className="w-16 h-[1.5px] mb-7 transition-colors"
              aria-hidden="true"
            />

            {/* Name & Date */}
            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label
                  htmlFor="cover-author"
                  style={{ color: palette.textMuted }}
                  className="block text-[11px] mb-1 font-sans"
                >
                  이름
                </label>
                <input
                  id="cover-author"
                  type="text"
                  value={cover.author}
                  onChange={(e) => onUpdateCover({ author: e.target.value })}
                  placeholder="만든 이 이름"
                  style={{
                    color: palette.textPrimary,
                    borderColor: palette.border,
                  }}
                  className={`w-full text-center font-semibold bg-transparent border-b py-1.5 focus:outline-none transition-colors ${
                    palette.isDark
                      ? 'placeholder:text-slate-400/55 focus:border-blue-400'
                      : 'placeholder:text-zinc-300 focus:border-blue-600'
                  } ${isHandwriting ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}
                />
              </div>

              <div>
                <label
                  htmlFor="cover-date"
                  style={{ color: palette.textMuted }}
                  className="block text-[11px] mb-1 font-sans"
                >
                  날짜
                </label>
                <input
                  id="cover-date"
                  type="text"
                  value={cover.date}
                  onChange={(e) => onUpdateCover({ date: e.target.value })}
                  placeholder="예: 2026년 11월"
                  style={{
                    color: palette.textPrimary,
                    borderColor: palette.border,
                  }}
                  className={`w-full text-center font-semibold bg-transparent border-b py-1.5 focus:outline-none transition-colors ${
                    palette.isDark
                      ? 'placeholder:text-slate-400/55 focus:border-blue-400'
                      : 'placeholder:text-zinc-300 focus:border-blue-600'
                  } ${isHandwriting ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}
                />
              </div>
            </div>
          </div>

          <div className="text-center">
            <span
              style={{ color: palette.textMuted }}
              className="text-xs font-mono tabular-nums"
            >
              {totalPages - 2} PHOTOGRAPHS
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

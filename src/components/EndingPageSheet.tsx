import { ALBUM_FONTS, ALBUM_THEMES } from '../constants/albumStyles';
import {
  AlbumFont,
  AlbumTheme,
  CoverData,
  EndingData,
  PageOrientation,
} from '../types/album';

interface EndingPageSheetProps {
  ending: EndingData;
  cover: CoverData;
  totalPages: number;
  orientation: PageOrientation;
  theme: AlbumTheme;
  font: AlbumFont;
  onUpdateEnding: (patch: Partial<EndingData>) => void;
}

export function EndingPageSheet({
  ending,
  cover,
  totalPages,
  orientation,
  theme,
  font,
  onUpdateEnding,
}: EndingPageSheetProps) {
  const palette = ALBUM_THEMES[theme];
  const fontCfg = ALBUM_FONTS[font];
  const isLandscape = orientation === 'landscape';
  const isHandwriting = font === 'handwriting';
  const pageNumberLabel = `${String(totalPages).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`;
  const metaParts = [cover.author.trim(), cover.date.trim()].filter(Boolean);

  return (
    <article
      aria-label="앨범 마무리 페이지"
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
          <div className="flex items-center justify-between gap-4">
            <span
              style={{ color: palette.textMuted }}
              className="text-xs font-medium tracking-wide"
            >
              마무리
            </span>
            <span
              style={{ color: palette.textMuted }}
              className="font-mono text-xs tabular-nums shrink-0"
            >
              {pageNumberLabel}
            </span>
          </div>

          <div
            style={{ fontFamily: fontCfg.cssFamily }}
            className="my-auto py-8 flex flex-col items-center text-center max-w-xl mx-auto w-full"
          >
            <label htmlFor="ending-message" className="sr-only">
              마무리 문구
            </label>
            <textarea
              id="ending-message"
              rows={4}
              value={ending.message}
              onChange={(e) => onUpdateEnding({ message: e.target.value })}
              placeholder="앨범을 닫으며 남기고 싶은 마무리 문구를 적어보세요..."
              style={{
                color: palette.textPrimary,
              }}
              className={`w-full text-center bg-transparent border rounded-lg p-3 focus:outline-none resize-none leading-relaxed transition-colors ${
                palette.isDark
                  ? 'border-transparent placeholder:text-slate-400/60 hover:border-slate-500/40 focus:border-blue-400'
                  : 'border-transparent placeholder:text-zinc-300 hover:border-zinc-300/80 focus:border-blue-600'
              } ${
                isHandwriting
                  ? 'text-2xl sm:text-3xl'
                  : 'text-lg sm:text-2xl'
              }`}
            />

            {metaParts.length > 0 && (
              <>
                <div
                  style={{ backgroundColor: palette.border }}
                  className="w-12 h-[1.5px] my-6"
                  aria-hidden="true"
                />
                <p
                  style={{ color: palette.textMuted }}
                  className={isHandwriting ? 'text-lg sm:text-xl' : 'text-sm'}
                >
                  {metaParts.join(' · ')}
                </p>
              </>
            )}
          </div>

          <div className="text-center">
            <span
              style={{ color: palette.textMuted }}
              className="text-xs font-medium"
            >
              {cover.title.trim() || '모노그래프 앨범'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

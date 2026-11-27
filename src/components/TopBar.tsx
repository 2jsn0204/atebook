import { Download } from 'lucide-react';

interface TopBarProps {
  photoCount: number;
  onAddPhotosClick: () => void;
  onLoadSamples: () => void;
  onClearAll: () => void;
  onOpenExportModal: () => void;
}

export function TopBar({
  photoCount,
  onAddPhotosClick,
  onLoadSamples,
  onClearAll,
  onOpenExportModal,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#F4F4F2]/92 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => e.preventDefault()}
          className="font-serif text-lg sm:text-xl font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          모노그래프
        </a>

        <nav
          aria-label="앨범 작업 메뉴"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600"
        >
          <button
            type="button"
            onClick={onAddPhotosClick}
            className="py-2 hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            사진 추가
          </button>
          <button
            type="button"
            onClick={onLoadSamples}
            className="py-2 hover:text-zinc-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            샘플 불러오기
          </button>
          {photoCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="py-2 text-zinc-500 hover:text-red-600 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              전체 비우기
            </button>
          )}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            disabled={photoCount === 0}
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>PDF · PNG 저장</span>
          </button>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { ImagePlus, Images } from 'lucide-react';

interface EmptyDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onTriggerFilePicker: () => void;
  onLoadSamples: () => void;
}

export function EmptyDropzone({
  onFilesSelected,
  onTriggerFilePicker,
  onLoadSamples,
}: EmptyDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-center py-2">
          <p className="text-xs font-medium text-zinc-500 tracking-wide mb-3">
            아카이브 포토북 스튜디오
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-zinc-900 leading-[1.2] text-balance mb-5">
            한 쪽에 한 장씩,
            <br />
            이야기를 담은 사진 앨범
          </h1>
          <p className="text-base text-zinc-600 leading-relaxed max-w-xl mb-8">
            여러 장의 사진을 한 번에 올리면 페이지마다 한 장씩 배치된 앨범이 바로 만들어집니다.
            각 사진의 제목과 설명을 자유롭게 적고, 한 장씩 넘겨본 뒤 PDF로 저장해 보세요.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button
              type="button"
              onClick={onTriggerFilePicker}
              className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[44px] rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <ImagePlus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>사진 여러 장 올리기</span>
            </button>

            <button
              type="button"
              onClick={onLoadSamples}
              className="inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Images className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>샘플 사진 4장으로 체험하기</span>
            </button>
          </div>

          <div className="pt-6 border-t border-zinc-200/90 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500">
            <span>다중 사진 업로드</span>
            <span aria-hidden="true">·</span>
            <span>페이지당 1장 자동 배치</span>
            <span aria-hidden="true">·</span>
            <span>사진별 제목 및 설명 편집</span>
            <span aria-hidden="true">·</span>
            <span>고화질 A4 PDF 저장</span>
          </div>
        </div>

        <div className="lg:col-span-6 flex">
          <div
            role="button"
            tabIndex={0}
            aria-label="사진 파일 여러 장을 끌어다 놓거나 클릭해서 선택하기"
            onClick={onTriggerFilePicker}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTriggerFilePicker();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full min-h-[340px] sm:min-h-[420px] rounded-2xl bg-white border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 ${
              isDragging
                ? 'border-blue-600 bg-blue-50/40'
                : 'border-zinc-300 hover:border-zinc-400'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-5 text-zinc-700">
              <ImagePlus className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="font-serif text-lg font-semibold text-zinc-900 mb-2">
              {isDragging ? '여기에 사진을 놓으세요' : '사진을 이곳으로 끌어다 놓으세요'}
            </p>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed mb-5">
              JPG, PNG, WEBP 등 여러 장을 동시에 선택하면 순서대로 한 쪽에 한 장씩 담깁니다.
            </p>
            <span className="text-xs font-medium text-blue-600 underline underline-offset-4">
              파일 탐색기에서 사진 고르기
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

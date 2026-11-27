export type PageOrientation = 'landscape' | 'portrait';

export type AlbumTheme = 'white' | 'beige' | 'navy';

export type AlbumFont = 'gothic' | 'myeongjo' | 'handwriting';

export interface AlbumPhoto {
  id: string;
  src: string;
  fileName: string;
  title: string;
  description: string;
  isObjectUrl: boolean;
  width?: number;
  height?: number;
}

export interface CoverData {
  title: string;
  subtitle: string;
  author: string;
  date: string;
}

export interface EndingData {
  message: string;
}

export type AlbumPageEntry =
  | { kind: 'cover' }
  | { kind: 'photo'; photo: AlbumPhoto; photoIndex: number }
  | { kind: 'ending' };

export interface ExportOptions {
  cover: CoverData;
  ending: EndingData;
  orientation: PageOrientation;
  theme: AlbumTheme;
  font: AlbumFont;
  fileName: string;
}

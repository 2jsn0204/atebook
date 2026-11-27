import { AlbumFont, AlbumTheme } from '../types/album';

export interface ThemePalette {
  id: AlbumTheme;
  label: string;
  mood: string;
  swatch: string;
  swatchBorder: string;
  pageBg: string;
  matBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  placeholder: string;
  border: string;
  photoBorder: string;
  isDark: boolean;
}

export const ALBUM_THEMES: Record<AlbumTheme, ThemePalette> = {
  white: {
    id: 'white',
    label: '흰색',
    mood: '깔끔',
    swatch: '#FFFFFF',
    swatchBorder: '#D4D4D8',
    pageBg: '#FFFFFF',
    matBg: '#FAF9F7',
    textPrimary: '#18181B',
    textSecondary: '#52525B',
    textMuted: '#71717A',
    placeholder: '#A1A1AA',
    border: '#E4E4E7',
    photoBorder: 'rgba(24, 24, 27, 0.08)',
    isDark: false,
  },
  beige: {
    id: 'beige',
    label: '베이지',
    mood: '따뜻한 종이',
    swatch: '#F3ECE0',
    swatchBorder: '#D6C8B2',
    pageBg: '#F6F1E7',
    matBg: '#ECE4D4',
    textPrimary: '#2A2118',
    textSecondary: '#5B4D3E',
    textMuted: '#7D6D5B',
    placeholder: '#A49582',
    border: '#DFD4C1',
    photoBorder: 'rgba(42, 33, 24, 0.12)',
    isDark: false,
  },
  navy: {
    id: 'navy',
    label: '네이비',
    mood: '차분함',
    swatch: '#132238',
    swatchBorder: '#2A4266',
    pageBg: '#132238',
    matBg: '#1B2E4B',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    placeholder: '#64748B',
    border: '#2A4266',
    photoBorder: 'rgba(248, 250, 252, 0.14)',
    isDark: true,
  },
};

export interface FontConfig {
  id: AlbumFont;
  label: string;
  cssFamily: string;
  canvasFamily: string;
  loadSpecs: string[];
  scale: number;
}

export const ALBUM_FONTS: Record<AlbumFont, FontConfig> = {
  gothic: {
    id: 'gothic',
    label: '고딕',
    cssFamily: '"Noto Sans KR", "Plus Jakarta Sans", sans-serif',
    canvasFamily: '"Noto Sans KR", "Plus Jakarta Sans", sans-serif',
    loadSpecs: [
      '400 28px "Noto Sans KR"',
      '600 44px "Noto Sans KR"',
      '700 84px "Noto Sans KR"',
    ],
    scale: 1,
  },
  myeongjo: {
    id: 'myeongjo',
    label: '명조',
    cssFamily: '"Noto Serif KR", Georgia, serif',
    canvasFamily: '"Noto Serif KR", Georgia, serif',
    loadSpecs: [
      '400 28px "Noto Serif KR"',
      '600 44px "Noto Serif KR"',
      '700 84px "Noto Serif KR"',
    ],
    scale: 1,
  },
  handwriting: {
    id: 'handwriting',
    label: '손글씨',
    cssFamily: '"Gaegu", cursive, sans-serif',
    canvasFamily: '"Gaegu", cursive, sans-serif',
    loadSpecs: [
      '400 34px "Gaegu"',
      '700 54px "Gaegu"',
      '700 96px "Gaegu"',
    ],
    scale: 1.18,
  },
};

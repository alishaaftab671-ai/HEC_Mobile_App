import { TextStyle } from 'react-native';

/**
 * HEC eServices design system.
 * Palette: HEC Green (official #009049) / Deep Forest / Gold Accent / Ice White
 * Hierarchy: FOREST+WHITE foundation -> HEC GREEN primary interaction -> MINT support -> GOLD micro-accent.
 */
export const colors = {
  navy: '#0A1E52',
  navySoft: '#1A3572',
  navyMuted: '#44598F',

  green: '#009049',
  greenDark: '#006B36',
  greenDeep: '#05382A',
  greenSoft: '#DCF3EA',

  mantis: '#4FC98F',
  mantisSoft: '#E5F7EF',

  lime: '#FFD84D',
  limeSoft: '#FFF6DC',

  background: '#F2F5FB',
  surface: '#FFFFFF',

  textPrimary: '#0C1B3D',
  textSecondary: '#48587A',
  textMuted: '#8593AC',

  border: '#E1E7F2',
  borderStrong: '#C4CEE0',

  error: '#DE3D63',
  errorBg: '#FCE9EE',
  warning: '#B47714',
  warningBg: '#FCF3DF',
  success: '#00A870',

  overlay: 'rgba(6, 16, 44, 0.6)',
} as const;

/** Signature gradients for headers and hero cards (pass directly to LinearGradient). */
export const gradients = {
  header: ['#05382A', '#075940', '#0A7A50'] as const,
  green: ['#009049', '#0BA85B'] as const,
  gold: ['#FFD84D', '#FFAF45'] as const,
  mint: ['#E5F7EF', '#DCF3EA'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const typography: Record<string, TextStyle> = {
  titleXL: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
  h1: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  h2: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  h3: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textSecondary },
  bodyStrong: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  small: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  smallStrong: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
};

export const shadow = {
  card: {
    shadowColor: '#0B3B2A',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#0B3B2A',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

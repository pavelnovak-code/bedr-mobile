// BEDR Design System – barvy z test.bedr.cz + dark mode
// Fonty: Poppins (headings) + Inter (body)

// ═══════════════════════════════════════════════════════
//  LIGHT COLORS (default)
// ═══════════════════════════════════════════════════════
export type ColorScheme = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  success: string;
  warning: string;
  danger: string;
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  white: string;
  black: string;
  overlay: string;
  cardHover: string;
};

export const lightColors: ColorScheme = {
  primary:      '#006085',
  primaryDark:  '#004e6e',
  primaryLight: '#e0f4fb',
  accent:       '#f5a623',   // zlatá/oranžová CTA z webu
  accentLight:  '#fff8ed',

  success: '#22c55e',
  warning: '#d97706',
  danger:  '#ef4444',

  bg:     '#f4f8fa',
  card:   '#ffffff',
  text:   '#1f1e1e',
  muted:  '#6b7a8d',
  border: '#e2e8f0',

  white: '#ffffff',
  black: '#000000',

  // Speciální
  overlay: 'rgba(0,0,0,0.5)',
  cardHover: '#f8fafc',
};

// ═══════════════════════════════════════════════════════
//  DARK COLORS
// ═══════════════════════════════════════════════════════
export const darkColors: ColorScheme = {
  primary:      '#009bcb',   // světlejší pro kontrast
  primaryDark:  '#006085',
  primaryLight: '#0c344b',
  accent:       '#f5a623',
  accentLight:  '#2d2010',

  success: '#22c55e',
  warning: '#f59e0b',
  danger:  '#ef4444',

  bg:     '#0F172A',
  card:   '#1E293B',
  text:   '#F1F5F9',
  muted:  '#94A3B8',
  border: '#334155',

  white: '#ffffff',
  black: '#000000',

  overlay: 'rgba(0,0,0,0.7)',
  cardHover: '#263548',
} as const;

// Výchozí export — přepíše se dynamicky přes ThemeContext
export let colors = lightColors;

// ═══════════════════════════════════════════════════════
//  GRADIENTS
// ═══════════════════════════════════════════════════════
export const gradients = {
  primary: ['#006085', '#004e6e'] as const,
  hero:    ['#006085', '#0F172A'] as const,
  energy:  ['#f5a623', '#d4921e'] as const,
  sport:   ['#006085', '#009bcb'] as const,
  dark:    ['#0F172A', '#1E293B'] as const,
} as const;

// ═══════════════════════════════════════════════════════
//  FONTS (custom — Poppins + Inter)
// ═══════════════════════════════════════════════════════
export const fonts = {
  regular:     'BedrInter-Regular',
  medium:      'BedrInter-Medium',
  semiBold:    'BedrInter-SemiBold',
  bold:        'BedrInter-Bold',
  heading:     'BedrPoppins-SemiBold',
  headingBold: 'BedrPoppins-Bold',
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

// ═══════════════════════════════════════════════════════
//  SPACING
// ═══════════════════════════════════════════════════════
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// ═══════════════════════════════════════════════════════
//  BORDER RADIUS (zaoblenější pro hravost)
// ═══════════════════════════════════════════════════════
export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ═══════════════════════════════════════════════════════
//  SHADOWS (tinted — primary barva)
// ═══════════════════════════════════════════════════════
export const shadows = {
  sm: {
    shadowColor: '#006085',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#006085',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#006085',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

// ═══════════════════════════════════════════════════════
//  TYPOGRAPHY PRESETS
// ═══════════════════════════════════════════════════════
export const typography = {
  h1: { fontFamily: fonts.headingBold, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.heading, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  button: { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20 },
} as const;

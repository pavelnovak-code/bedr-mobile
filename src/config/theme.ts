// Design tokens portované z web CSS variables (public/css/style.css)

export const colors = {
  primary:   '#006085',
  primaryDark: '#004e6e',
  primaryLight: '#e0f4fb',
  accent:    '#e84545',

  success: '#16a34a',
  warning: '#d97706',
  danger:  '#dc2626',

  bg:     '#eef2f5',
  card:   '#ffffff',
  text:   '#1a1a2e',
  muted:  '#6b7280',
  border: '#d1d5db',

  white: '#ffffff',
  black: '#000000',
} as const;

// Systémové fonty (Inter je default na iOS 17+, Roboto na Androidu)
// Fallback přes fontWeight — React Native vybere správnou variantu automaticky
import { Platform } from 'react-native';

const systemFont = Platform.OS === 'ios' ? 'System' : 'Roboto';

export const fonts = {
  regular: systemFont,
  medium:  systemFont,
  semiBold: systemFont,
  bold:    systemFont,
  heading: systemFont,
  headingBold: systemFont,
} as const;

// Font weight mapování (použít spolu s fontFamily)
export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 5,
  md: 8,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const typography = {
  h1: { fontFamily: fonts.headingBold, fontSize: 26, lineHeight: 32, color: colors.text },
  h2: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 26, color: colors.text },
  h3: { fontFamily: fonts.heading, fontSize: 17, lineHeight: 22, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.text },
  bodySm: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
  label: { fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18, color: colors.muted },
  button: { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20 },
} as const;

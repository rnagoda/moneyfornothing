/**
 * Typography Configuration for Money For Nothing
 * Uses Roboto Mono for clean sans-serif monospace aesthetic
 *
 * TO REVERT TO COURIER PRIME (serif monospace):
 * 1. Change font names below from 'RobotoMono-*' to 'CourierPrime-*'
 * 2. Update App.tsx to load CourierPrime fonts instead of RobotoMono
 */

// Font family names
// expo-font loads fonts by key name, so we use the same names across platforms
export const fonts = {
  // Roboto Mono - sans-serif (current)
  regular: 'RobotoMono-Regular',
  bold: 'RobotoMono-Bold',
  italic: 'RobotoMono-Italic',
  // Courier Prime - serif (backup)
  // regular: 'CourierPrime-Regular',
  // bold: 'CourierPrime-Bold',
  // italic: 'CourierPrime-Italic',
} as const;

// Font sizes
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  hero: 32,
  header: 20,
} as const;

// Line heights
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
} as const;

export type FontSizeKey = keyof typeof fontSizes;

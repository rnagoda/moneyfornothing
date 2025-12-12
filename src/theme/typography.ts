/**
 * Typography Configuration for Money For Nothing
 * Uses Courier Prime for retro monospace aesthetic
 */

import { Platform } from 'react-native';

// Font family names
export const fonts = {
  regular: Platform.select({
    web: '"Courier Prime", "Courier New", Courier, monospace',
    default: 'CourierPrime-Regular',
  }),
  bold: Platform.select({
    web: '"Courier Prime", "Courier New", Courier, monospace',
    default: 'CourierPrime-Bold',
  }),
  italic: Platform.select({
    web: '"Courier Prime", "Courier New", Courier, monospace',
    default: 'CourierPrime-Italic',
  }),
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

/**
 * Spacing Constants for Money For Nothing
 * Consistent spacing throughout the app
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const borderRadius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
} as const;

export const borderWidth = {
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

export type SpacingKey = keyof typeof spacing;

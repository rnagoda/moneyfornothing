/**
 * Color Constants for Money For Nothing
 * Retro terminal aesthetic: dark background, light text
 */

export const colors = {
  // Primary colors
  background: '#222222',
  text: '#cccccc',

  // Accent colors
  accent: '#88cc88', // Green for positive values
  warning: '#cc8888', // Red for negative values
  muted: '#666666', // Dimmed text

  // UI element colors
  border: '#444444',
  borderLight: '#666666',
  inputBackground: '#1a1a1a',
  buttonBackground: '#333333',
  buttonPressed: '#444444',

  // Status colors
  paid: '#88cc88', // Green for paid bills
  unpaid: '#cccccc', // Default for unpaid
  progress: '#88cc88', // Progress bar fill
  progressBackground: '#333333', // Progress bar track

  // Transparency
  overlay: 'rgba(0, 0, 0, 0.85)',
} as const;

export type ColorKey = keyof typeof colors;

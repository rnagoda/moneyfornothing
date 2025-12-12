/**
 * Web-specific styles for constraining layout width
 */

import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

// Maximum width for web layout (mimics phone width)
export const WEB_MAX_WIDTH = 600;

// Outer container that fills the screen with dark background
export const webOuterContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
  ...(Platform.OS === 'web' && {
    alignItems: 'center',
  }),
};

// Inner container that constrains content width on web
export const webInnerContainer: ViewStyle = {
  flex: 1,
  width: '100%',
  ...(Platform.OS === 'web' && {
    maxWidth: WEB_MAX_WIDTH,
  }),
};

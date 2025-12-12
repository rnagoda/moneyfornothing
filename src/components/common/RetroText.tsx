/**
 * RetroText - Styled monospace text component
 */

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, FontSizeKey } from '../../theme';

interface RetroTextProps extends TextProps {
  size?: FontSizeKey;
  color?: string;
  bold?: boolean;
  muted?: boolean;
  accent?: boolean;
  warning?: boolean;
  center?: boolean;
}

export function RetroText({
  children,
  size = 'md',
  color,
  bold = false,
  muted = false,
  accent = false,
  warning = false,
  center = false,
  style,
  ...props
}: RetroTextProps) {
  const textColor = color
    ? color
    : warning
      ? colors.warning
      : accent
        ? colors.accent
        : muted
          ? colors.muted
          : colors.text;

  return (
    <Text
      style={[
        styles.base,
        {
          fontSize: fontSizes[size],
          color: textColor,
          fontFamily: bold ? fonts.bold : fonts.regular,
          fontWeight: bold ? 'bold' : 'normal',
          textAlign: center ? 'center' : 'left',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.regular,
  },
});

/**
 * RetroButton - ASCII-style button component [ LABEL ]
 */

import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../theme';
import { RetroText } from './RetroText';

interface RetroButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function RetroButton({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled,
  style,
  ...props
}: RetroButtonProps) {
  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant, !!disabled);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        pressed && !disabled && styles.pressed,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...props}
    >
      <RetroText
        style={[sizeStyles.text, variantStyles.text, disabled && styles.disabledText]}
        bold
      >
        [ {label.toUpperCase()} ]
      </RetroText>
    </Pressable>
  );
}

function getSizeStyles(size: 'sm' | 'md' | 'lg'): { button: ViewStyle; text: TextStyle } {
  switch (size) {
    case 'sm':
      return {
        button: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
        text: { fontSize: fontSizes.sm },
      };
    case 'lg':
      return {
        button: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
        text: { fontSize: fontSizes.lg },
      };
    default:
      return {
        button: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
        text: { fontSize: fontSizes.md },
      };
  }
}

function getVariantStyles(
  variant: 'primary' | 'secondary' | 'danger',
  disabled: boolean
): { button: ViewStyle; text: TextStyle } {
  if (disabled) {
    return {
      button: { backgroundColor: colors.buttonBackground, borderColor: colors.border },
      text: { color: colors.muted },
    };
  }

  switch (variant) {
    case 'secondary':
      return {
        button: { backgroundColor: 'transparent', borderWidth: 0 },
        text: { color: colors.text },
      };
    case 'danger':
      return {
        button: { backgroundColor: colors.buttonBackground, borderColor: colors.warning },
        text: { color: colors.warning },
      };
    default:
      return {
        button: { backgroundColor: colors.buttonBackground, borderColor: colors.borderLight },
        text: { color: colors.text },
      };
  }
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.buttonPressed,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.muted,
  },
});

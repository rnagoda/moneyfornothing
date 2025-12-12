/**
 * RetroInput - Styled text input component
 */

import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../theme';
import { RetroText } from './RetroText';

interface RetroInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const RetroInput = forwardRef<TextInput, RetroInputProps>(
  ({ label, error, containerStyle, style, ...props }, ref) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <RetroText size="sm" muted style={styles.label}>
            {label}
          </RetroText>
        )}
        <TextInput
          ref={ref}
          style={[styles.input, error && styles.inputError, style]}
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
          {...props}
        />
        {error && (
          <RetroText size="sm" warning style={styles.error}>
            {error}
          </RetroText>
        )}
      </View>
    );
  }
);

RetroInput.displayName = 'RetroInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.warning,
  },
  error: {
    marginTop: spacing.xs,
  },
});

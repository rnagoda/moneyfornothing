/**
 * EditableField - Reusable inline editing component
 * Displays a value that can be tapped to edit, with cancel button
 */

import React from 'react';
import { View, TextInput, Pressable, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../theme';
import { RetroText } from './RetroText';

interface EditableFieldProps {
  /** Current display value */
  value: string;
  /** Whether this field is currently being edited */
  isEditing: boolean;
  /** Current edit input value */
  editValue: string;
  /** Called when edit value changes */
  onChangeEditValue: (value: string) => void;
  /** Called when user taps to start editing */
  onStartEditing: () => void;
  /** Called when editing is saved (blur/submit) */
  onSave: () => void;
  /** Called when editing is cancelled */
  onCancel: () => void;
  /** Input type - affects keyboard and styling */
  type?: 'text' | 'currency';
  /** Text size for display mode */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show muted text style */
  muted?: boolean;
  /** Whether to show strikethrough (e.g., for paid bills) */
  strikethrough?: boolean;
  /** Max length for text input */
  maxLength?: number;
  /** Custom style for the display text */
  textStyle?: TextStyle;
  /** Custom style for the container */
  style?: ViewStyle;
}

export function EditableField({
  value,
  isEditing,
  editValue,
  onChangeEditValue,
  onStartEditing,
  onSave,
  onCancel,
  type = 'text',
  size = 'md',
  muted = false,
  strikethrough = false,
  maxLength = 32,
  textStyle,
  style,
}: EditableFieldProps) {
  if (isEditing) {
    return (
      <View style={[styles.editRow, style]}>
        <TextInput
          style={type === 'currency' ? styles.editInputSmall : styles.editInput}
          value={editValue}
          onChangeText={onChangeEditValue}
          autoFocus
          onBlur={onSave}
          onSubmitEditing={onSave}
          keyboardType={type === 'currency' ? 'numeric' : 'default'}
          maxLength={maxLength}
        />
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <RetroText size="sm" muted>
            [X]
          </RetroText>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable onPress={onStartEditing} style={style}>
      <RetroText
        size={size}
        muted={muted}
        style={[strikethrough && styles.strikethrough, textStyle]}
      >
        {value}
      </RetroText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.sm,
  },
  editInputSmall: {
    width: 100,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.xs,
    textAlign: 'right',
  },
  cancelButton: {
    padding: spacing.sm,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});

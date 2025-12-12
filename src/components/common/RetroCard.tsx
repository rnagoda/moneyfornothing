/**
 * RetroCard - Card container with optional ASCII border
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText } from './RetroText';

interface RetroCardProps {
  children: ReactNode;
  title?: string;
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function RetroCard({ children, title, onPress, style, noPadding = false }: RetroCardProps) {
  const content = (
    <View style={[styles.card, noPadding && styles.noPadding, style]}>
      {title && (
        <RetroText bold size="lg" style={styles.title}>
          {title}
        </RetroText>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  noPadding: {
    padding: 0,
  },
  title: {
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});

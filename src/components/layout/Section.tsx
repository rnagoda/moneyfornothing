/**
 * Section - Labeled section container for dashboard
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText } from '../common/RetroText';

interface SectionProps {
  title: string;
  children: ReactNode;
  onPress?: () => void;
  rightContent?: ReactNode;
  style?: ViewStyle;
}

export function Section({ title, children, onPress, rightContent, style }: SectionProps) {
  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <RetroText size="sm" muted>
          ── {title.toUpperCase()} ──
        </RetroText>
        {rightContent}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
        accessibilityRole="button"
        accessibilityLabel={`${title} section, tap to edit`}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});

/**
 * Header - App header with title, version, and current month
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText } from '../common/RetroText';
import { formatMonth } from '../../utils/formatters';

interface HeaderProps {
  versionString: string;
  currentMonth?: string; // Format: "YYYY-MM"
  style?: ViewStyle;
}

export function Header({ versionString, currentMonth, style }: HeaderProps) {
  const displayMonth = currentMonth ? formatMonth(currentMonth) : formatMonth();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleRow}>
        <RetroText size="xxl" bold>
          MONEY FOR NOTHING
        </RetroText>
      </View>
      <View style={styles.infoRow}>
        <RetroText size="sm" muted>
          {versionString}
        </RetroText>
        <RetroText size="sm" muted>
          {displayMonth}
        </RetroText>
      </View>
      <View style={styles.divider}>
        <RetroText muted numberOfLines={1}>
          {'─'.repeat(100)}
        </RetroText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  titleRow: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  divider: {
    overflow: 'hidden',
  },
});

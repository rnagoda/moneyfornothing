/**
 * ProgressBar - Retro ASCII-style progress bar
 * Uses characters like ▓▓▓░░░ for visual effect
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../theme';
import { RetroText } from '../common/RetroText';

interface ProgressBarProps {
  progress: number; // 0-100
  width?: number; // Character width of the bar
  showPercentage?: boolean;
  label?: string;
  style?: ViewStyle;
}

// ASCII progress characters
const FILLED_CHAR = '▓';
const EMPTY_CHAR = '░';

export function ProgressBar({
  progress,
  width = 20,
  showPercentage = true,
  label,
  style,
}: ProgressBarProps) {
  // Clamp progress to 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const filledCount = Math.round((clampedProgress / 100) * width);
  const emptyCount = width - filledCount;

  const filledBar = FILLED_CHAR.repeat(filledCount);
  const emptyBar = EMPTY_CHAR.repeat(emptyCount);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <RetroText size="sm" muted style={styles.label}>
          {label}
        </RetroText>
      )}
      <View style={styles.barContainer}>
        <RetroText style={styles.bracket}>[</RetroText>
        <RetroText style={styles.filled}>{filledBar}</RetroText>
        <RetroText style={styles.empty}>{emptyBar}</RetroText>
        <RetroText style={styles.bracket}>]</RetroText>
        {showPercentage && (
          <RetroText style={styles.percentage}>{Math.round(clampedProgress)}%</RetroText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bracket: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.border,
  },
  filled: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.progress,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.progressBackground,
  },
  percentage: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.text,
    marginLeft: spacing.sm,
  },
});

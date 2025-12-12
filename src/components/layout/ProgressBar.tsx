/**
 * ProgressBar - Progress bar that fills available width
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText } from '../common/RetroText';

interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  label?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  showPercentage = true,
  label,
  style,
}: ProgressBarProps) {
  // Clamp progress to 0-100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, style]}>
      {label && (
        <RetroText size="sm" muted style={styles.label}>
          {label}
        </RetroText>
      )}
      <View style={styles.barContainer}>
        <View style={styles.barWrapper}>
          <View style={styles.barBackground}>
            <View style={[styles.barFilled, { width: `${clampedProgress}%` }]} />
          </View>
        </View>
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
  barWrapper: {
    flex: 1,
    marginRight: spacing.sm,
  },
  barBackground: {
    height: 16,
    backgroundColor: colors.progressBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  barFilled: {
    height: '100%',
    backgroundColor: colors.progress,
  },
  percentage: {
    color: colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
});

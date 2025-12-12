/**
 * DescentGraph - Background visualization showing descent from income to remaining cash
 * Renders as a faded series of bars descending from left to right
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface DescentGraphProps {
  /** Total default income (starting point, 100% height) */
  totalIncome: number;
  /** Current remaining cash (ending point, percentage height) */
  currentRemaining: number;
  /** Number of bars to render */
  barCount?: number;
}

export function DescentGraph({
  totalIncome,
  currentRemaining,
  barCount = 20,
}: DescentGraphProps) {

  // Don't render if no income is set
  if (totalIncome <= 0) {
    return null;
  }

  // Calculate the end percentage (clamped between 0 and 100)
  // If remaining is negative, we'll show 0%
  // If remaining is greater than income, we'll cap at 100%
  const endPercentage = Math.max(0, Math.min(100, (currentRemaining / totalIncome) * 100));

  // Generate bars with linearly interpolated heights
  // Start at 100% (top of container), end at endPercentage
  const bars = [];
  for (let i = 0; i < barCount; i++) {
    // Linear interpolation from 100% to endPercentage
    const progress = i / (barCount - 1);
    const heightPercent = 100 - (100 - endPercentage) * progress;

    bars.push(
      <View
        key={i}
        style={[
          styles.bar,
          {
            height: `${heightPercent}%`,
            flex: 1,
          },
        ]}
      />
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {bars}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'flex-end',
    opacity: 0.12, // Very faded to not interfere with text
  },
  bar: {
    backgroundColor: colors.text, // Light grey instead of green for better contrast
    marginHorizontal: 1,
  },
});

/**
 * SparkLine - Retro spark line chart using Unicode block characters
 */

import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors, spacing, fontSizes } from '../../theme';
import { RetroText } from '../common/RetroText';

// Unicode block characters for spark line (1/8 to 8/8 height)
const BLOCK_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

// All month abbreviations
const ALL_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface SparkLineProps {
  data: number[];
  labels?: string[];
  mode?: 'compact' | 'full';
  showLabels?: boolean;
  showCurrentValue?: boolean;
  currentValue?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Map a value to a block character based on min/max range
 */
function valueToBlock(value: number, min: number, max: number): string {
  if (max === min) return BLOCK_CHARS[BLOCK_CHARS.length - 1];

  // Normalize to 0-7 range
  const normalized = Math.round(((value - min) / (max - min)) * 7);
  const clamped = Math.max(0, Math.min(7, normalized));
  return BLOCK_CHARS[clamped];
}

export function SparkLine({
  data,
  labels,
  mode = 'compact',
  showLabels = false,
  showCurrentValue = false,
  currentValue,
  onPress,
  style,
}: SparkLineProps) {
  if (data.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <RetroText muted size="sm">No history data</RetroText>
      </View>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const blocks = data.map(value => valueToBlock(value, min, max));

  const isCompact = mode === 'compact';

  // For full mode with labels, render as columns for proper alignment
  if (!isCompact && showLabels && labels && labels.length > 0) {
    // Find which months we have data for
    const dataMonths = new Set(labels);

    // Build display: show "..." for months before first data, then data months
    const firstDataMonth = labels[0];
    const firstMonthIndex = ALL_MONTHS.indexOf(firstDataMonth);
    const hasLeadingGap = firstMonthIndex > 0;

    const content = (
      <View style={[styles.container, style]}>
        {showCurrentValue && currentValue !== undefined && (
          <RetroText size="lg" accent bold style={styles.currentValue}>
            ${currentValue.toLocaleString()}
          </RetroText>
        )}

        <View style={styles.columnsContainer}>
          {/* Show "..." if there are months before our data */}
          {hasLeadingGap && (
            <View style={styles.column}>
              <RetroText style={styles.barText} muted>
                {' '}
              </RetroText>
              <RetroText size="xs" muted style={styles.columnLabel}>
                ...
              </RetroText>
            </View>
          )}

          {/* Render each data point as a column */}
          {blocks.map((block, index) => (
            <View key={index} style={styles.column}>
              <RetroText style={styles.barText} accent>
                {block}
              </RetroText>
              <RetroText size="xs" muted style={styles.columnLabel}>
                {labels[index]}
              </RetroText>
            </View>
          ))}
        </View>
      </View>
    );

    if (onPress) {
      return (
        <Pressable onPress={onPress} style={styles.pressable}>
          {content}
        </Pressable>
      );
    }

    return content;
  }

  // Compact mode: render as a single line of characters
  const fontSize = fontSizes.xl;
  const letterSpacing = 14; // Wide spacing to fill screen width

  const content = (
    <View style={[styles.container, style]}>
      {showCurrentValue && currentValue !== undefined && (
        <RetroText size="sm" accent bold style={styles.currentValue}>
          ${currentValue.toLocaleString()}
        </RetroText>
      )}

      <View style={styles.chartContainer}>
        <RetroText
          style={[
            styles.sparkLine,
            { fontSize, letterSpacing },
          ]}
          accent
        >
          {blocks.join('')}
        </RetroText>
      </View>

      {isCompact && onPress && (
        <RetroText size="xs" muted style={styles.hint}>
          Tap to expand
        </RetroText>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pressable: {
    width: '100%',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  sparkLine: {
    color: colors.accent,
    lineHeight: undefined, // Let the blocks determine height
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  column: {
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  barText: {
    fontSize: fontSizes.xxl,
    color: colors.accent,
  },
  columnLabel: {
    marginTop: 2,
  },
  currentValue: {
    marginBottom: spacing.sm,
  },
  hint: {
    marginTop: spacing.xs,
  },
});

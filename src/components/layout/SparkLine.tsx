/**
 * SparkLine - Retro spark line chart using Unicode block characters
 */

import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors, spacing, fontSizes } from '../../theme';
import { RetroText } from '../common/RetroText';

// Unicode block characters for spark line (1/8 to 8/8 height)
const BLOCK_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

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
  const fontSize = isCompact ? fontSizes.xl : fontSizes.xxl;
  const letterSpacing = isCompact ? 6 : 8; // Wider spacing for better readability

  const content = (
    <View style={[styles.container, style]}>
      {showCurrentValue && currentValue !== undefined && (
        <RetroText size={isCompact ? 'sm' : 'lg'} accent bold style={styles.currentValue}>
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

      {showLabels && labels && labels.length > 0 && (
        <View style={styles.labelsContainer}>
          {labels.map((label, index) => (
            <RetroText
              key={index}
              size="xs"
              muted
              style={[
                styles.label,
                { width: fontSize + letterSpacing },
              ]}
            >
              {label}
            </RetroText>
          ))}
        </View>
      )}

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
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  label: {
    textAlign: 'center',
  },
  currentValue: {
    marginBottom: spacing.sm,
  },
  hint: {
    marginTop: spacing.xs,
  },
});

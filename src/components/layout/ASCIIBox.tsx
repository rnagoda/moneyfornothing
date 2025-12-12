/**
 * ASCIIBox - Configurable ASCII border box
 * Creates retro-style box borders using ASCII characters
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../theme';
import { RetroText } from '../common/RetroText';

interface ASCIIBoxProps {
  children: ReactNode;
  title?: string;
  style?: ViewStyle;
  variant?: 'single' | 'double';
}

// ASCII box drawing characters
const BOX_CHARS = {
  single: {
    topLeft: '+',
    topRight: '+',
    bottomLeft: '+',
    bottomRight: '+',
    horizontal: '-',
    vertical: '|',
  },
  double: {
    topLeft: '#',
    topRight: '#',
    bottomLeft: '#',
    bottomRight: '#',
    horizontal: '=',
    vertical: '|',
  },
};

export function ASCIIBox({ children, title, style, variant = 'single' }: ASCIIBoxProps) {
  const chars = BOX_CHARS[variant];

  return (
    <View style={[styles.container, style]}>
      {/* Top border */}
      <View style={styles.borderRow}>
        <RetroText style={styles.borderChar}>{chars.topLeft}</RetroText>
        <View style={styles.horizontalLine}>
          {title ? (
            <>
              <RetroText style={styles.borderChar}>
                {chars.horizontal.repeat(2)} {title.toUpperCase()}{' '}
              </RetroText>
              <View style={styles.fillLine}>
                <RetroText style={styles.borderChar} numberOfLines={1}>
                  {chars.horizontal.repeat(100)}
                </RetroText>
              </View>
            </>
          ) : (
            <RetroText style={styles.borderChar} numberOfLines={1}>
              {chars.horizontal.repeat(100)}
            </RetroText>
          )}
        </View>
        <RetroText style={styles.borderChar}>{chars.topRight}</RetroText>
      </View>

      {/* Content with side borders */}
      <View style={styles.contentRow}>
        <RetroText style={styles.borderChar}>{chars.vertical}</RetroText>
        <View style={styles.content}>{children}</View>
        <RetroText style={styles.borderChar}>{chars.vertical}</RetroText>
      </View>

      {/* Bottom border */}
      <View style={styles.borderRow}>
        <RetroText style={styles.borderChar}>{chars.bottomLeft}</RetroText>
        <View style={styles.horizontalLine}>
          <RetroText style={styles.borderChar} numberOfLines={1}>
            {chars.horizontal.repeat(100)}
          </RetroText>
        </View>
        <RetroText style={styles.borderChar}>{chars.bottomRight}</RetroText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  borderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  borderChar: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.border,
    lineHeight: fontSizes.md * 1.2,
  },
  horizontalLine: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fillLine: {
    flex: 1,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
});

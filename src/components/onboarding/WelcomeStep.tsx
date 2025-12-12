/**
 * WelcomeStep - First step of setup wizard
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText, RetroButton } from '../common';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <RetroText size="xxl" bold center>
          MONEY FOR NOTHING
        </RetroText>

        <RetroText center style={styles.tagline}>
          Simple finance tracking
        </RetroText>

        <View style={styles.description}>
          <RetroText muted style={styles.paragraph}>
            This wizard will help you set up your financial tracking:
          </RetroText>

          <View style={styles.list}>
            <RetroText muted>• Configure your income sources</RetroText>
            <RetroText muted>• Add your recurring bills</RetroText>
            <RetroText muted>• Set up savings accounts</RetroText>
          </View>

          <RetroText muted style={styles.paragraph}>
            At the start of each month, your income will reset to defaults and all bills will be
            marked unpaid.
          </RetroText>
        </View>
      </View>

      <View style={styles.actions}>
        <RetroButton label="Get Started" onPress={onNext} size="lg" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  tagline: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  description: {
    marginTop: spacing.xl,
  },
  paragraph: {
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  list: {
    marginLeft: spacing.lg,
    marginBottom: spacing.lg,
  },
  actions: {
    paddingTop: spacing.lg,
  },
});

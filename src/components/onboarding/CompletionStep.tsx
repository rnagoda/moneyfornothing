/**
 * CompletionStep - Final step with summary
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText, RetroButton } from '../common';
import { useIncome, useBills, useSavings } from '../../hooks';
import { formatCurrency } from '../../utils/formatters';

interface CompletionStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function CompletionStep({ onComplete, onBack }: CompletionStepProps) {
  const { income, total: incomeTotal } = useIncome();
  const { bills, totalDue } = useBills();
  const { savings, total: savingsTotal } = useSavings();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <RetroText size="lg" bold center>
          SETUP COMPLETE!
        </RetroText>
        <RetroText muted center style={styles.description}>
          Here's a summary of what you've configured:
        </RetroText>

        {/* Income Summary */}
        <View style={styles.section}>
          <RetroText bold style={styles.sectionTitle}>
            ── INCOME ──
          </RetroText>
          {income.map(inc => (
            <View key={inc.id} style={styles.row}>
              <RetroText muted>{inc.name}</RetroText>
              <RetroText>{formatCurrency(inc.defaultAmount)}</RetroText>
            </View>
          ))}
          <View style={styles.totalRow}>
            <RetroText bold>Total Monthly Income</RetroText>
            <RetroText bold accent>
              {formatCurrency(incomeTotal)}
            </RetroText>
          </View>
        </View>

        {/* Bills Summary */}
        <View style={styles.section}>
          <RetroText bold style={styles.sectionTitle}>
            ── BILLS ──
          </RetroText>
          {bills.length > 0 ? (
            <>
              {bills.map(bill => (
                <View key={bill.id} style={styles.row}>
                  <RetroText muted>{bill.name}</RetroText>
                  <RetroText>{formatCurrency(bill.amount)}</RetroText>
                </View>
              ))}
              <View style={styles.totalRow}>
                <RetroText bold>Total Monthly Bills</RetroText>
                <RetroText bold warning>
                  {formatCurrency(totalDue)}
                </RetroText>
              </View>
            </>
          ) : (
            <RetroText muted size="sm">
              No bills configured yet
            </RetroText>
          )}
        </View>

        {/* Savings Summary */}
        <View style={styles.section}>
          <RetroText bold style={styles.sectionTitle}>
            ── SAVINGS ──
          </RetroText>
          {savings.length > 0 ? (
            <>
              {savings.map(sav => (
                <View key={sav.id} style={styles.row}>
                  <RetroText muted>{sav.name}</RetroText>
                  <RetroText>{formatCurrency(sav.amount)}</RetroText>
                </View>
              ))}
              <View style={styles.totalRow}>
                <RetroText bold>Total Savings</RetroText>
                <RetroText bold accent>
                  {formatCurrency(savingsTotal)}
                </RetroText>
              </View>
            </>
          ) : (
            <RetroText muted size="sm">
              No savings configured yet
            </RetroText>
          )}
        </View>

        {/* Net Summary */}
        <View style={styles.netSection}>
          <RetroText muted size="sm">
            Expected monthly remainder:
          </RetroText>
          <RetroText size="xl" bold accent={incomeTotal >= totalDue} warning={incomeTotal < totalDue}>
            {formatCurrency(incomeTotal - totalDue)}
          </RetroText>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <RetroButton label="Back" variant="secondary" onPress={onBack} />
        <RetroButton label="Start Tracking" onPress={onComplete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  description: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
  },
  netSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

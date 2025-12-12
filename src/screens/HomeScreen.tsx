/**
 * HomeScreen - Main dashboard for Money For Nothing
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { colors, spacing } from '../theme';
import { RetroText, RetroButton, RetroCard } from '../components/common';
import { ProgressBar, DescentGraph } from '../components/layout';
import { useIncome, useBills, useSavings, useTusUltimosPesos, useMonthlyReset } from '../hooks';
import { useAppContext } from '../context/AppContext';
import { formatCurrency, formatMonth } from '../utils/formatters';
import { IncomeModal } from '../components/modals/IncomeModal';
import { BillsModal } from '../components/modals/BillsModal';
import { SavingsModal } from '../components/modals/SavingsModal';

interface HomeScreenProps {
  onOpenSettings?: () => void;
}

export function HomeScreen({ onOpenSettings }: HomeScreenProps) {
  const { state } = useAppContext();
  const { income, total: incomeTotal, defaultTotal: defaultIncomeTotal } = useIncome();
  const { bills, totalDue, totalPaid, progress } = useBills();
  const { savings, total: savingsTotal } = useSavings();
  const { amount: tusUltimosPesos, isNegative } = useTusUltimosPesos();
  const { checkAndReset } = useMonthlyReset();

  // Modal states
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [billsModalVisible, setBillsModalVisible] = useState(false);
  const [savingsModalVisible, setSavingsModalVisible] = useState(false);

  // Check for monthly reset on mount
  useEffect(() => {
    checkAndReset();
  }, [checkAndReset]);

  const displayMonth = formatMonth(state.appState.lastSessionMonth);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <RetroText size="xl" bold>
            MONEY FOR NOTHING
          </RetroText>
          <RetroText size="sm" muted>
            {displayMonth}
          </RetroText>
        </View>
        {onOpenSettings && (
          <RetroButton label="Settings" variant="secondary" size="sm" onPress={onOpenSettings} />
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Main Amount */}
        <RetroCard>
          <View style={styles.heroContainer}>
            <DescentGraph
              totalIncome={defaultIncomeTotal}
              currentRemaining={tusUltimosPesos}
            />
            <View style={styles.heroAmount}>
              <RetroText size="hero" bold warning={isNegative} accent={!isNegative}>
                {formatCurrency(tusUltimosPesos)}
              </RetroText>
            </View>
          </View>
          <RetroText muted size="sm" style={styles.cashRemainingLabel}>
            CASH REMAINING
          </RetroText>
        </RetroCard>

        {/* Income Section */}
        <RetroCard title="Income" onPress={() => setIncomeModalVisible(true)}>
          <View style={styles.row}>
            <RetroText muted size="sm">
              Total:
            </RetroText>
            <RetroText bold>{formatCurrency(incomeTotal)}</RetroText>
          </View>
          {income.map(inc => (
            <View key={inc.id} style={styles.row}>
              <RetroText muted size="sm">
                {inc.name}
              </RetroText>
              <RetroText size="sm">{formatCurrency(inc.currentAmount)}</RetroText>
            </View>
          ))}
          <RetroText muted size="xs" style={styles.tapHint}>
            Tap to edit
          </RetroText>
        </RetroCard>

        {/* Bills Section */}
        <RetroCard title="Bills" onPress={() => setBillsModalVisible(true)}>
          <ProgressBar progress={progress} />
          <View style={styles.row}>
            <RetroText muted size="sm">
              Due:
            </RetroText>
            <RetroText>{formatCurrency(totalDue)}</RetroText>
          </View>
          <View style={styles.row}>
            <RetroText muted size="sm">
              Paid:
            </RetroText>
            <RetroText accent>{formatCurrency(totalPaid)}</RetroText>
          </View>
          <View style={styles.row}>
            <RetroText muted size="sm">
              Progress:
            </RetroText>
            <RetroText size="sm">
              {bills.filter(b => b.paid).length}/{bills.length} bills
            </RetroText>
          </View>
          <RetroText muted size="xs" style={styles.tapHint}>
            Tap to edit
          </RetroText>
        </RetroCard>

        {/* Savings Section */}
        <RetroCard title="Savings" onPress={() => setSavingsModalVisible(true)}>
          <View style={styles.row}>
            <RetroText muted size="sm">
              Total:
            </RetroText>
            <RetroText bold>{formatCurrency(savingsTotal)}</RetroText>
          </View>
          {savings.map(sav => (
            <View key={sav.id} style={styles.row}>
              <RetroText muted size="sm">
                {sav.name}
              </RetroText>
              <RetroText size="sm">{formatCurrency(sav.amount)}</RetroText>
            </View>
          ))}
          {savings.length === 0 && (
            <RetroText muted size="sm">
              No savings accounts yet
            </RetroText>
          )}
          <RetroText muted size="xs" style={styles.tapHint}>
            Tap to edit
          </RetroText>
        </RetroCard>

        {/* Version */}
        <View style={styles.versionContainer}>
          <RetroText muted size="xs">
            {state.appState.versionString}
          </RetroText>
        </View>
      </ScrollView>

      {/* Modals */}
      <IncomeModal visible={incomeModalVisible} onClose={() => setIncomeModalVisible(false)} />
      <BillsModal visible={billsModalVisible} onClose={() => setBillsModalVisible(false)} />
      <SavingsModal visible={savingsModalVisible} onClose={() => setSavingsModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  heroContainer: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 80,
    justifyContent: 'center',
  },
  heroAmount: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cashRemainingLabel: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tapHint: {
    marginTop: spacing.sm,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

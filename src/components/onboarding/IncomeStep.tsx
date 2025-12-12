/**
 * IncomeStep - Configure income/paychecks
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { spacing, colors } from '../../theme';
import { RetroText, RetroButton, RetroInput } from '../common';
import { useIncome } from '../../hooks';
import { parseCurrency } from '../../utils/formatters';

interface IncomeStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function IncomeStep({ onNext, onBack }: IncomeStepProps) {
  const { income, updateName, updateDefaultAmount, updateCurrentAmount } = useIncome();

  // Single paycheck amount for both paychecks
  const [paycheckAmount, setPaycheckAmount] = useState(
    income[0]?.defaultAmount ? income[0].defaultAmount.toString() : ''
  );

  const handleNext = async () => {
    const amount = parseCurrency(paycheckAmount);

    if (amount <= 0) {
      Alert.alert('Income Required', 'Please enter your paycheck amount.');
      return;
    }

    // Apply the same amount to both paychecks
    if (income[0]) {
      await updateDefaultAmount(income[0].id, amount);
      await updateCurrentAmount(income[0].id, amount);
    }

    if (income[1]) {
      await updateDefaultAmount(income[1].id, amount);
      await updateCurrentAmount(income[1].id, amount);
    }

    onNext();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <RetroText size="lg" bold>
          CONFIGURE INCOME
        </RetroText>
        <RetroText muted style={styles.description}>
          Enter your regular paycheck amount. This app assumes two paychecks per month with the
          same amount. Both will reset to this value at the start of each month.
        </RetroText>

        <View style={styles.form}>
          <RetroInput
            label="Paycheck Amount"
            value={paycheckAmount}
            onChangeText={setPaycheckAmount}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <RetroText muted size="sm" style={styles.hint}>
            If your paychecks vary, enter your typical amount. You can adjust individual paychecks
            later from the home screen.
          </RetroText>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <RetroButton label="Back" variant="secondary" onPress={onBack} />
        <RetroButton label="Next" onPress={handleNext} />
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
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  hint: {
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

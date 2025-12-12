/**
 * SavingsStep - Add savings accounts
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText, RetroButton, RetroInput } from '../common';
import { useSavings } from '../../hooks';
import { formatCurrency, parseCurrency } from '../../utils/formatters';

interface SavingsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function SavingsStep({ onNext, onBack }: SavingsStepProps) {
  const { savings, addSavings, deleteSavings } = useSavings();

  const [newSavingsName, setNewSavingsName] = useState('');
  const [newSavingsAmount, setNewSavingsAmount] = useState('');

  const handleAddSavings = async () => {
    const name = newSavingsName.trim();
    const amount = parseCurrency(newSavingsAmount);

    if (!name) {
      Alert.alert('Error', 'Please enter a savings name');
      return;
    }
    if (amount < 0) {
      Alert.alert('Error', 'Amount cannot be negative');
      return;
    }

    await addSavings(name, amount);
    setNewSavingsName('');
    setNewSavingsAmount('');
  };

  const handleDeleteSavings = (id: string, name: string) => {
    Alert.alert('Delete Savings', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSavings(id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <RetroText size="lg" bold>
          ADD SAVINGS ACCOUNTS
        </RetroText>
        <RetroText muted style={styles.description}>
          Track your savings accounts and balances. These do not reset monthly - they're for
          tracking your long-term savings.
        </RetroText>

        {/* Current savings list */}
        {savings.length > 0 && (
          <View style={styles.savingsList}>
            <RetroText muted size="sm" style={styles.listHeader}>
              YOUR SAVINGS:
            </RetroText>
            {savings.map(item => (
              <View key={item.id} style={styles.savingsItem}>
                <View style={styles.savingsInfo}>
                  <RetroText>{item.name}</RetroText>
                  <RetroText muted size="sm">
                    {formatCurrency(item.amount)}
                  </RetroText>
                </View>
                <Pressable
                  onPress={() => handleDeleteSavings(item.id, item.name)}
                  style={styles.deleteButton}
                >
                  <RetroText warning size="sm">
                    [X]
                  </RetroText>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Add new savings form */}
        <View style={styles.addForm}>
          <RetroText bold style={styles.formTitle}>
            Add Savings Account
          </RetroText>
          <RetroInput
            label="Account Name"
            value={newSavingsName}
            onChangeText={setNewSavingsName}
            placeholder="e.g., Emergency Fund, Vacation"
            maxLength={32}
          />
          <RetroInput
            label="Current Balance"
            value={newSavingsAmount}
            onChangeText={setNewSavingsAmount}
            placeholder="0.00"
            keyboardType="numeric"
          />
          <RetroButton label="Add Savings" variant="secondary" onPress={handleAddSavings} fullWidth />
        </View>

        <RetroText muted size="sm" style={styles.hint}>
          You can skip this step and add savings later from the main screen.
        </RetroText>
      </ScrollView>

      <View style={styles.actions}>
        <RetroButton label="Back" variant="secondary" onPress={onBack} />
        <RetroButton label={savings.length > 0 ? 'Next' : 'Skip'} onPress={onNext} />
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
  savingsList: {
    marginBottom: spacing.xl,
  },
  listHeader: {
    marginBottom: spacing.sm,
  },
  savingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  savingsInfo: {
    flex: 1,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  addForm: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  formTitle: {
    marginBottom: spacing.md,
  },
  hint: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

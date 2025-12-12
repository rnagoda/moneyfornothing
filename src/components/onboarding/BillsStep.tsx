/**
 * BillsStep - Add recurring bills
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText, RetroButton, RetroInput } from '../common';
import { useBills } from '../../hooks';
import { formatCurrency, parseCurrency } from '../../utils/formatters';

interface BillsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function BillsStep({ onNext, onBack }: BillsStepProps) {
  const { bills, addBill, deleteBill } = useBills();

  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');

  const handleAddBill = async () => {
    const name = newBillName.trim();
    const amount = parseCurrency(newBillAmount);

    if (!name) {
      Alert.alert('Error', 'Please enter a bill name');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    await addBill(name, amount);
    setNewBillName('');
    setNewBillAmount('');
  };

  const handleDeleteBill = (id: string, name: string) => {
    Alert.alert('Delete Bill', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteBill(id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <RetroText size="lg" bold>
          ADD YOUR BILLS
        </RetroText>
        <RetroText muted style={styles.description}>
          Add your recurring monthly bills. These will reset to unpaid at the start of each month.
        </RetroText>

        {/* Current bills list */}
        {bills.length > 0 && (
          <View style={styles.billsList}>
            <RetroText muted size="sm" style={styles.listHeader}>
              YOUR BILLS:
            </RetroText>
            {bills.map(bill => (
              <View key={bill.id} style={styles.billItem}>
                <View style={styles.billInfo}>
                  <RetroText>{bill.name}</RetroText>
                  <RetroText muted size="sm">
                    {formatCurrency(bill.amount)}
                  </RetroText>
                </View>
                <Pressable
                  onPress={() => handleDeleteBill(bill.id, bill.name)}
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

        {/* Add new bill form */}
        <View style={styles.addForm}>
          <RetroText bold style={styles.formTitle}>
            Add a Bill
          </RetroText>
          <RetroInput
            label="Bill Name"
            value={newBillName}
            onChangeText={setNewBillName}
            placeholder="e.g., Rent, Electric, Internet"
            maxLength={32}
          />
          <RetroInput
            label="Amount"
            value={newBillAmount}
            onChangeText={setNewBillAmount}
            placeholder="0.00"
            keyboardType="numeric"
          />
          <RetroButton label="Add Bill" variant="secondary" onPress={handleAddBill} fullWidth />
        </View>

        <RetroText muted size="sm" style={styles.hint}>
          You can skip this step and add bills later from the main screen.
        </RetroText>
      </ScrollView>

      <View style={styles.actions}>
        <RetroButton label="Back" variant="secondary" onPress={onBack} />
        <RetroButton label={bills.length > 0 ? 'Next' : 'Skip'} onPress={onNext} />
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
  billsList: {
    marginBottom: spacing.xl,
  },
  listHeader: {
    marginBottom: spacing.sm,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  billInfo: {
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

/**
 * BillsModal - Manage bills with sections for progress, unpaid, and paid
 */

import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { colors, fonts, fontSizes, spacing } from '../../theme';
import { RetroText, RetroButton, RetroInput, RetroCard } from '../common';
import { ProgressBar } from '../layout';
import { useBills } from '../../hooks';
import { formatCurrency, parseCurrency } from '../../utils/formatters';
import type { Bill } from '../../types';

interface BillsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface EditingState {
  id: string | null;
  field: 'name' | 'amount' | null;
  value: string;
}

export function BillsModal({ visible, onClose }: BillsModalProps) {
  const { bills, totalDue, totalPaid, progress, addBill, updateBill, togglePaid, deleteBill } =
    useBills();

  const [editing, setEditing] = useState<EditingState>({
    id: null,
    field: null,
    value: '',
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newBillName, setNewBillName] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');

  // Separate bills into paid and unpaid
  const unpaidBills = bills.filter(bill => !bill.paid);
  const paidBills = bills.filter(bill => bill.paid);
  const unpaidTotal = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

  const startEditing = (item: Bill, field: 'name' | 'amount') => {
    const value = field === 'name' ? item.name : item.amount.toString();
    setEditing({ id: item.id, field, value });
  };

  const saveEditing = async () => {
    if (!editing.id || !editing.field) return;

    if (editing.field === 'name') {
      const trimmed = editing.value.trim();
      if (trimmed) {
        await updateBill(editing.id, { name: trimmed });
      }
    } else {
      const amount = parseCurrency(editing.value);
      if (amount > 0) {
        await updateBill(editing.id, { amount });
      }
    }

    setEditing({ id: null, field: null, value: '' });
  };

  const cancelEditing = () => {
    setEditing({ id: null, field: null, value: '' });
  };

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
    setIsAdding(false);
  };

  const handleDeleteBill = (item: Bill) => {
    Alert.alert('Delete Bill', `Are you sure you want to delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteBill(item.id),
      },
    ]);
  };

  const renderBillItem = (item: Bill) => (
    <View key={item.id} style={styles.billItem}>
      {/* Paid checkbox */}
      <Pressable
        onPress={() => togglePaid(item.id)}
        style={styles.checkbox}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.paid }}
      >
        <RetroText>{item.paid ? '[X]' : '[ ]'}</RetroText>
      </Pressable>

      {/* Bill details */}
      <View style={styles.billDetails}>
        {/* Name */}
        {editing.id === item.id && editing.field === 'name' ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInput}
              value={editing.value}
              onChangeText={value => setEditing(prev => ({ ...prev, value }))}
              autoFocus
              onBlur={saveEditing}
              onSubmitEditing={saveEditing}
              maxLength={32}
            />
            <Pressable onPress={cancelEditing} style={styles.cancelButton}>
              <RetroText size="sm" muted>
                [X]
              </RetroText>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => startEditing(item, 'name')}>
            <RetroText style={item.paid && styles.paidText}>{item.name}</RetroText>
          </Pressable>
        )}

        {/* Amount */}
        {editing.id === item.id && editing.field === 'amount' ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInputSmall}
              value={editing.value}
              onChangeText={value => setEditing(prev => ({ ...prev, value }))}
              autoFocus
              onBlur={saveEditing}
              onSubmitEditing={saveEditing}
              keyboardType="numeric"
            />
            <Pressable onPress={cancelEditing} style={styles.cancelButton}>
              <RetroText size="sm" muted>
                [X]
              </RetroText>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => startEditing(item, 'amount')}>
            <RetroText size="sm" muted style={item.paid && styles.paidText}>
              {formatCurrency(item.amount)}
            </RetroText>
          </Pressable>
        )}
      </View>

      {/* Delete button */}
      <Pressable
        onPress={() => handleDeleteBill(item)}
        style={styles.deleteButton}
        accessibilityLabel={`Delete ${item.name}`}
      >
        <RetroText warning size="sm">
          DEL
        </RetroText>
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <RetroText size="xl" bold>
              BILLS
            </RetroText>
            <View style={styles.headerButtons}>
              <Pressable onPress={() => setIsAdding(true)} style={styles.addHeaderButton}>
                <RetroText>[ + ]</RetroText>
              </Pressable>
              <RetroButton label="Close" variant="secondary" size="sm" onPress={onClose} />
            </View>
          </View>

          <ScrollView style={styles.content}>
            {/* Progress Card */}
            <RetroCard title="Progress">
              <ProgressBar progress={progress} />
              <View style={styles.summaryRow}>
                <RetroText muted size="sm">
                  Total Due:
                </RetroText>
                <RetroText size="sm">{formatCurrency(totalDue)}</RetroText>
              </View>
            </RetroCard>

            {/* Unpaid Bills Card */}
            <RetroCard>
              <View style={styles.cardTitleRow}>
                <RetroText bold size="lg">Unpaid</RetroText>
                <RetroText bold size="lg" warning>{formatCurrency(unpaidTotal)}</RetroText>
              </View>
              {unpaidBills.length > 0 ? (
                unpaidBills.map(renderBillItem)
              ) : (
                <RetroText muted size="sm" center>
                  All bills paid!
                </RetroText>
              )}

              {/* Add new bill form */}
              {isAdding && (
                <View style={styles.addForm}>
                  <RetroInput
                    label="Bill Name"
                    value={newBillName}
                    onChangeText={setNewBillName}
                    placeholder="e.g., Rent"
                    maxLength={32}
                  />
                  <RetroInput
                    label="Amount"
                    value={newBillAmount}
                    onChangeText={setNewBillAmount}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                  <View style={styles.addFormButtons}>
                    <RetroButton
                      label="Cancel"
                      variant="secondary"
                      size="sm"
                      onPress={() => setIsAdding(false)}
                    />
                    <RetroButton label="Add Bill" size="sm" onPress={handleAddBill} />
                  </View>
                </View>
              )}
            </RetroCard>

            {/* Paid Bills Card */}
            <RetroCard>
              <View style={styles.cardTitleRow}>
                <RetroText bold size="lg">Paid</RetroText>
                <RetroText bold size="lg" accent>{formatCurrency(totalPaid)}</RetroText>
              </View>
              {paidBills.length > 0 ? (
                paidBills.map(renderBillItem)
              ) : (
                <RetroText muted size="sm" center>
                  No bills paid yet
                </RetroText>
              )}
            </RetroCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addHeaderButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  billDetails: {
    flex: 1,
  },
  paidText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.sm,
  },
  editInputSmall: {
    width: 100,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.text,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.xs,
    textAlign: 'right',
  },
  cancelButton: {
    padding: spacing.sm,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  addForm: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});

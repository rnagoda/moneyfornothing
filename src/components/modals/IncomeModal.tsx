/**
 * IncomeModal - Edit income with inline editing, add/delete support
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
import { RetroText, RetroButton, RetroInput } from '../common';
import { useIncome } from '../../hooks';
import { formatCurrency, parseCurrency } from '../../utils/formatters';
import type { Income } from '../../types';

interface IncomeModalProps {
  visible: boolean;
  onClose: () => void;
}

interface EditingState {
  id: string | null;
  field: 'name' | 'currentAmount' | 'defaultAmount' | null;
  value: string;
}

export function IncomeModal({ visible, onClose }: IncomeModalProps) {
  const {
    income,
    total,
    addIncome,
    updateCurrentAmount,
    updateDefaultAmount,
    updateName,
    deleteIncome,
    resetToDefaults,
  } = useIncome();

  const [editing, setEditing] = useState<EditingState>({
    id: null,
    field: null,
    value: '',
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');

  const startEditing = (item: Income, field: 'name' | 'currentAmount' | 'defaultAmount') => {
    let value: string;
    if (field === 'name') {
      value = item.name;
    } else if (field === 'currentAmount') {
      value = item.currentAmount.toString();
    } else {
      value = item.defaultAmount.toString();
    }
    setEditing({ id: item.id, field, value });
  };

  const saveEditing = async () => {
    if (!editing.id || !editing.field) return;

    if (editing.field === 'name') {
      const trimmed = editing.value.trim();
      if (trimmed) {
        await updateName(editing.id, trimmed);
      }
    } else if (editing.field === 'currentAmount') {
      const amount = parseCurrency(editing.value);
      if (amount >= 0) {
        await updateCurrentAmount(editing.id, amount);
      }
    } else if (editing.field === 'defaultAmount') {
      const amount = parseCurrency(editing.value);
      if (amount >= 0) {
        await updateDefaultAmount(editing.id, amount);
      }
    }

    setEditing({ id: null, field: null, value: '' });
  };

  const cancelEditing = () => {
    setEditing({ id: null, field: null, value: '' });
  };

  const handleAddIncome = async () => {
    const name = newIncomeName.trim();
    const amount = parseCurrency(newIncomeAmount);

    if (!name) {
      Alert.alert('Error', 'Please enter an income name');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    await addIncome(name, amount);
    setNewIncomeName('');
    setNewIncomeAmount('');
    setIsAdding(false);
  };

  const handleDeleteIncome = (item: Income) => {
    // Don't allow deleting the two main paychecks
    if (item.paycheckNumber) {
      Alert.alert('Cannot Delete', 'The two main paychecks cannot be deleted.');
      return;
    }

    Alert.alert('Delete Income', `Are you sure you want to delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteIncome(item.id),
      },
    ]);
  };

  const handleResetToDefaults = async () => {
    await resetToDefaults();
  };

  // Separate paychecks from other income
  const paychecks = income.filter(inc => inc.paycheckNumber);
  const otherIncome = income.filter(inc => !inc.paycheckNumber);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <RetroText size="xl" bold>
              INCOME
            </RetroText>
            <RetroButton label="Close" variant="secondary" size="sm" onPress={onClose} />
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <RetroText>Total Income:</RetroText>
              <RetroText bold accent>
                {formatCurrency(total)}
              </RetroText>
            </View>
          </View>

          <ScrollView style={styles.content}>
            {/* Paychecks Section */}
            <RetroText muted size="sm" style={styles.sectionHeader}>
              PAYCHECKS
            </RetroText>
            {paychecks.map(item => (
              <View key={item.id} style={styles.incomeItem}>
                <View style={styles.incomeDetails}>
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
                      <RetroText bold>{item.name}</RetroText>
                    </Pressable>
                  )}

                  {/* Current Amount */}
                  <View style={styles.amountRow}>
                    <RetroText muted size="sm">
                      Current:
                    </RetroText>
                    {editing.id === item.id && editing.field === 'currentAmount' ? (
                      <TextInput
                        style={styles.editInputSmall}
                        value={editing.value}
                        onChangeText={value => setEditing(prev => ({ ...prev, value }))}
                        autoFocus
                        onBlur={saveEditing}
                        onSubmitEditing={saveEditing}
                        keyboardType="numeric"
                      />
                    ) : (
                      <Pressable onPress={() => startEditing(item, 'currentAmount')}>
                        <RetroText>{formatCurrency(item.currentAmount)}</RetroText>
                      </Pressable>
                    )}
                  </View>

                  {/* Default Amount */}
                  <View style={styles.amountRow}>
                    <RetroText muted size="sm">
                      Default:
                    </RetroText>
                    {editing.id === item.id && editing.field === 'defaultAmount' ? (
                      <TextInput
                        style={styles.editInputSmall}
                        value={editing.value}
                        onChangeText={value => setEditing(prev => ({ ...prev, value }))}
                        autoFocus
                        onBlur={saveEditing}
                        onSubmitEditing={saveEditing}
                        keyboardType="numeric"
                      />
                    ) : (
                      <Pressable onPress={() => startEditing(item, 'defaultAmount')}>
                        <RetroText size="sm" muted>
                          {formatCurrency(item.defaultAmount)}
                        </RetroText>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {/* Other Income Section */}
            <RetroText muted size="sm" style={styles.sectionHeader}>
              OTHER INCOME
            </RetroText>
            {otherIncome.length > 0 ? (
              otherIncome.map(item => (
                <View key={item.id} style={styles.incomeItem}>
                  <View style={styles.incomeDetails}>
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
                        <RetroText>{item.name}</RetroText>
                      </Pressable>
                    )}

                    {/* Current Amount */}
                    <View style={styles.amountRow}>
                      <RetroText muted size="sm">
                        Current:
                      </RetroText>
                      {editing.id === item.id && editing.field === 'currentAmount' ? (
                        <TextInput
                          style={styles.editInputSmall}
                          value={editing.value}
                          onChangeText={value => setEditing(prev => ({ ...prev, value }))}
                          autoFocus
                          onBlur={saveEditing}
                          onSubmitEditing={saveEditing}
                          keyboardType="numeric"
                        />
                      ) : (
                        <Pressable onPress={() => startEditing(item, 'currentAmount')}>
                          <RetroText>{formatCurrency(item.currentAmount)}</RetroText>
                        </Pressable>
                      )}
                    </View>

                    {/* Default Amount */}
                    <View style={styles.amountRow}>
                      <RetroText muted size="sm">
                        Default:
                      </RetroText>
                      {editing.id === item.id && editing.field === 'defaultAmount' ? (
                        <TextInput
                          style={styles.editInputSmall}
                          value={editing.value}
                          onChangeText={value => setEditing(prev => ({ ...prev, value }))}
                          autoFocus
                          onBlur={saveEditing}
                          onSubmitEditing={saveEditing}
                          keyboardType="numeric"
                        />
                      ) : (
                        <Pressable onPress={() => startEditing(item, 'defaultAmount')}>
                          <RetroText size="sm" muted>
                            {formatCurrency(item.defaultAmount)}
                          </RetroText>
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Delete button for other income */}
                  <Pressable
                    onPress={() => handleDeleteIncome(item)}
                    style={styles.deleteButton}
                    accessibilityLabel={`Delete ${item.name}`}
                  >
                    <RetroText warning size="sm">
                      DEL
                    </RetroText>
                  </Pressable>
                </View>
              ))
            ) : (
              <RetroText muted size="sm" style={styles.emptyText}>
                No additional income sources
              </RetroText>
            )}

            {/* Add new income form */}
            {isAdding ? (
              <View style={styles.addForm}>
                <RetroInput
                  label="Income Name"
                  value={newIncomeName}
                  onChangeText={setNewIncomeName}
                  placeholder="e.g., Side Hustle, Rental"
                  maxLength={32}
                />
                <RetroInput
                  label="Monthly Amount (Default)"
                  value={newIncomeAmount}
                  onChangeText={setNewIncomeAmount}
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
                  <RetroButton label="Add Income" size="sm" onPress={handleAddIncome} />
                </View>
              </View>
            ) : (
              <RetroButton
                label="Add Other Income"
                variant="secondary"
                onPress={() => setIsAdding(true)}
                style={styles.addButton}
              />
            )}

            <View style={styles.actions}>
              <RetroButton
                label="Reset All to Defaults"
                variant="secondary"
                onPress={handleResetToDefaults}
              />
            </View>
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
  summary: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  incomeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  incomeDetails: {
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
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
  emptyText: {
    paddingVertical: spacing.md,
  },
  addForm: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  addButton: {
    marginTop: spacing.lg,
  },
  actions: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
});

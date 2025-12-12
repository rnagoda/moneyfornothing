/**
 * SavingsModal - Manage savings with inline editing
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
import { SparkLine } from '../layout';
import { SavingsHistoryModal } from './SavingsHistoryModal';
import { useSavings } from '../../hooks';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, parseCurrency } from '../../utils/formatters';
import type { Savings } from '../../types';

interface SavingsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface EditingState {
  id: string | null;
  field: 'name' | 'amount' | null;
  value: string;
}

export function SavingsModal({ visible, onClose }: SavingsModalProps) {
  const { savings, total, addSavings, updateSavings, deleteSavings } = useSavings();
  const { state } = useAppContext();

  const [editing, setEditing] = useState<EditingState>({
    id: null,
    field: null,
    value: '',
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newSavingsName, setNewSavingsName] = useState('');
  const [newSavingsAmount, setNewSavingsAmount] = useState('');
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // Get savings history for spark line
  const history = state.appState.savingsHistory ?? [];
  const historyData = history.map(entry => entry.total);
  const hasHistory = historyData.length > 0;

  const startEditing = (item: Savings, field: 'name' | 'amount') => {
    const value = field === 'name' ? item.name : item.amount.toString();
    setEditing({ id: item.id, field, value });
  };

  const saveEditing = async () => {
    if (!editing.id || !editing.field) return;

    if (editing.field === 'name') {
      const trimmed = editing.value.trim();
      if (trimmed) {
        await updateSavings(editing.id, { name: trimmed });
      }
    } else {
      const amount = parseCurrency(editing.value);
      if (amount >= 0) {
        await updateSavings(editing.id, { amount });
      }
    }

    setEditing({ id: null, field: null, value: '' });
  };

  const cancelEditing = () => {
    setEditing({ id: null, field: null, value: '' });
  };

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
    setIsAdding(false);
  };

  const handleDeleteSavings = (item: Savings) => {
    Alert.alert('Delete Savings', `Are you sure you want to delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSavings(item.id),
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <RetroText size="xl" bold>
              SAVINGS
            </RetroText>
            <RetroButton label="Close" variant="secondary" size="sm" onPress={onClose} />
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <RetroText>Total Savings:</RetroText>
              <RetroText bold accent>
                {formatCurrency(total)}
              </RetroText>
            </View>
          </View>

          {/* Savings History Spark Line */}
          {hasHistory && (
            <View style={styles.historySection}>
              <RetroText size="sm" muted style={styles.historyLabel}>
                SAVINGS HISTORY
              </RetroText>
              <SparkLine
                data={historyData}
                mode="compact"
                onPress={() => setHistoryModalVisible(true)}
              />
            </View>
          )}

          <ScrollView style={styles.content}>
            {savings.map(item => (
              <View key={item.id} style={styles.savingsItem}>
                {/* Savings details */}
                <View style={styles.savingsDetails}>
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
                      <RetroText size="sm" muted>
                        {formatCurrency(item.amount)}
                      </RetroText>
                    </Pressable>
                  )}
                </View>

                {/* Delete button */}
                <Pressable
                  onPress={() => handleDeleteSavings(item)}
                  style={styles.deleteButton}
                  accessibilityLabel={`Delete ${item.name}`}
                >
                  <RetroText warning size="sm">
                    DEL
                  </RetroText>
                </Pressable>
              </View>
            ))}

            {savings.length === 0 && (
              <RetroText muted center style={styles.emptyText}>
                No savings accounts yet
              </RetroText>
            )}

            {/* Add new savings form */}
            {isAdding ? (
              <View style={styles.addForm}>
                <RetroInput
                  label="Savings Name"
                  value={newSavingsName}
                  onChangeText={setNewSavingsName}
                  placeholder="e.g., Emergency Fund"
                  maxLength={32}
                />
                <RetroInput
                  label="Amount"
                  value={newSavingsAmount}
                  onChangeText={setNewSavingsAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
                <View style={styles.addFormButtons}>
                  <RetroButton label="Cancel" variant="secondary" size="sm" onPress={() => setIsAdding(false)} />
                  <RetroButton label="Add Savings" size="sm" onPress={handleAddSavings} />
                </View>
              </View>
            ) : (
              <RetroButton
                label="Add New Savings"
                variant="secondary"
                onPress={() => setIsAdding(true)}
                style={styles.addButton}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Savings History Modal */}
      <SavingsHistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
      />
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
  historySection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyLabel: {
    marginBottom: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  savingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  savingsDetails: {
    flex: 1,
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
    paddingVertical: spacing.xl,
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
});

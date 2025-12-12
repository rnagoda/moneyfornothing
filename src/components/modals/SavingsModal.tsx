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
} from 'react-native';
import { colors, fonts, fontSizes, spacing, webOuterContainer, webInnerContainer, modalStyles } from '../../theme';
import { RetroText, RetroButton, RetroInput } from '../common';
import { SparkLine } from '../layout';
import { useSavings } from '../../hooks';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency, parseCurrency } from '../../utils/formatters';
import type { Savings } from '../../types';

/**
 * Get month abbreviation from YYYY-MM format
 */
function getMonthAbbr(monthStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNum = parseInt(monthStr.split('-')[1], 10);
  return months[monthNum - 1] || monthStr;
}

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

  // Get savings history for spark line
  const history = state.appState.savingsHistory ?? [];
  const historyData = history.map(entry => entry.total);
  const historyLabels = history.map(entry => getMonthAbbr(entry.month));
  const hasHistory = historyData.length > 0;

  // Calculate growth percentage and label
  let growthPercent: number | null = null;
  let growthLabel = '';
  if (history.length >= 2) {
    const oldest = history[0];
    const newest = history[history.length - 1];
    if (oldest.total > 0) {
      growthPercent = Math.round(((newest.total - oldest.total) / oldest.total) * 100);
    }
    // Determine label based on whether we have 12 months
    if (history.length >= 12) {
      growthLabel = '12-month growth';
    } else {
      growthLabel = `Growth since ${getMonthAbbr(oldest.month)}`;
    }
  }

  const startEditing = (item: Savings, field: 'name' | 'amount') => {
    // For amounts, start with empty field for quicker entry
    const value = field === 'name' ? item.name : '';
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
      <View style={webOuterContainer}>
        <SafeAreaView style={[modalStyles.container, webInnerContainer]}>
          <KeyboardAvoidingView
            style={modalStyles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={modalStyles.header}>
            <RetroText size="xl" bold>
              SAVINGS
            </RetroText>
            <View style={modalStyles.headerButtons}>
              <Pressable onPress={() => setIsAdding(true)} style={modalStyles.addHeaderButton}>
                <RetroText>[ + ]</RetroText>
              </Pressable>
              <RetroButton label="Close" variant="secondary" size="sm" onPress={onClose} />
            </View>
          </View>

          <View style={modalStyles.summary}>
            <View style={modalStyles.summaryRow}>
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
                labels={historyLabels}
                mode="full"
                showLabels
              />
              {growthPercent !== null && (
                <View style={styles.growthRow}>
                  <RetroText size="sm" muted>
                    {growthLabel}:
                  </RetroText>
                  <RetroText
                    size="sm"
                    bold
                    accent={growthPercent >= 0}
                    warning={growthPercent < 0}
                  >
                    {growthPercent >= 0 ? '+' : ''}{growthPercent}%
                  </RetroText>
                </View>
              )}
            </View>
          )}

          <ScrollView style={modalStyles.content}>
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
                  style={modalStyles.deleteButton}
                  accessibilityLabel={`Delete ${item.name}`}
                >
                  <RetroText warning size="sm">
                    DEL
                  </RetroText>
                </Pressable>
              </View>
            ))}

            {savings.length === 0 && (
              <RetroText muted center style={modalStyles.emptyText}>
                No savings accounts yet
              </RetroText>
            )}

            {/* Add new savings form */}
            {isAdding && (
              <View style={modalStyles.addForm}>
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
                <View style={modalStyles.addFormButtons}>
                  <RetroButton label="Cancel" variant="secondary" size="sm" onPress={() => setIsAdding(false)} />
                  <RetroButton label="Add Savings" size="sm" onPress={handleAddSavings} />
                </View>
              </View>
            )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  historySection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyLabel: {
    marginBottom: spacing.xs,
  },
  growthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
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
});

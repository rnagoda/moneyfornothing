/**
 * Shared Modal Styles
 * Common styles used across BillsModal, IncomeModal, SavingsModal
 */

import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const modalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },

  // Header styles
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

  // Summary section
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

  // List item styles
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemDetails: {
    flex: 1,
  },

  // Action buttons
  deleteButton: {
    padding: spacing.sm,
  },
  checkbox: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },

  // Add form styles
  addForm: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addFormInline: {
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

  // Card title with right-aligned value
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  // Section headers
  sectionHeader: {
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },

  // Empty state
  emptyText: {
    paddingVertical: spacing.md,
  },

  // Actions section
  actions: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
});

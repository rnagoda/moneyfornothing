/**
 * SavingsHistoryModal - Full-screen savings history visualization
 */

import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Pressable,
} from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText, RetroButton } from '../common';
import { SparkLine } from '../layout';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

interface SavingsHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Get month abbreviation from YYYY-MM format
 */
function getMonthAbbr(monthStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthNum = parseInt(monthStr.split('-')[1], 10);
  return months[monthNum - 1] || monthStr;
}

export function SavingsHistoryModal({ visible, onClose }: SavingsHistoryModalProps) {
  const { state } = useAppContext();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const history = state.appState.savingsHistory ?? [];
  const data = history.map(entry => entry.total);
  const labels = history.map(entry => getMonthAbbr(entry.month));

  // Get selected entry details
  const selectedEntry = selectedIndex !== null ? history[selectedIndex] : null;
  const latestEntry = history.length > 0 ? history[history.length - 1] : null;
  const displayEntry = selectedEntry || latestEntry;

  // Calculate growth if we have at least 2 entries
  let growthPercent: number | null = null;
  if (history.length >= 2) {
    const oldest = history[0].total;
    const newest = history[history.length - 1].total;
    if (oldest > 0) {
      growthPercent = Math.round(((newest - oldest) / oldest) * 100);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <RetroText size="xl" bold>
            SAVINGS HISTORY
          </RetroText>
          <RetroButton label="Close" variant="secondary" size="sm" onPress={onClose} />
        </View>

        <View style={styles.content}>
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <RetroText muted center>
                No savings history yet.
              </RetroText>
              <RetroText muted center size="sm" style={styles.emptyHint}>
                History is captured at the start of each new month.
              </RetroText>
            </View>
          ) : (
            <>
              {/* Current/Selected Value Display */}
              <View style={styles.valueDisplay}>
                {displayEntry && (
                  <>
                    <RetroText size="sm" muted>
                      {selectedEntry ? getMonthAbbr(selectedEntry.month) : 'Latest'} Total
                    </RetroText>
                    <RetroText size="xxl" bold accent>
                      {formatCurrency(displayEntry.total)}
                    </RetroText>
                  </>
                )}
              </View>

              {/* Spark Line Chart */}
              <View style={styles.chartSection}>
                <SparkLine
                  data={data}
                  labels={labels}
                  mode="full"
                  showLabels
                />
              </View>

              {/* Interactive month selector */}
              <View style={styles.monthSelector}>
                <RetroText size="sm" muted style={styles.selectorHint}>
                  Tap a month to see details:
                </RetroText>
                <View style={styles.monthButtons}>
                  {history.map((entry, index) => (
                    <Pressable
                      key={entry.month}
                      style={[
                        styles.monthButton,
                        selectedIndex === index && styles.monthButtonSelected,
                      ]}
                      onPress={() => setSelectedIndex(selectedIndex === index ? null : index)}
                    >
                      <RetroText
                        size="xs"
                        style={selectedIndex === index ? styles.monthTextSelected : undefined}
                      >
                        {getMonthAbbr(entry.month)}
                      </RetroText>
                      <RetroText
                        size="xs"
                        muted={selectedIndex !== index}
                        accent={selectedIndex === index}
                      >
                        {formatCurrency(entry.total)}
                      </RetroText>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Growth indicator */}
              {growthPercent !== null && (
                <View style={styles.growthSection}>
                  <RetroText size="sm" muted>
                    Total Growth:
                  </RetroText>
                  <RetroText
                    size="lg"
                    bold
                    accent={growthPercent >= 0}
                    warning={growthPercent < 0}
                  >
                    {growthPercent >= 0 ? '+' : ''}{growthPercent}%
                  </RetroText>
                </View>
              )}
            </>
          )}
        </View>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHint: {
    marginTop: spacing.md,
  },
  valueDisplay: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  chartSection: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  monthSelector: {
    paddingVertical: spacing.lg,
  },
  selectorHint: {
    marginBottom: spacing.md,
  },
  monthButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  monthButton: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minWidth: 70,
  },
  monthButtonSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.buttonBackground,
  },
  monthTextSelected: {
    color: colors.accent,
  },
  growthSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
});

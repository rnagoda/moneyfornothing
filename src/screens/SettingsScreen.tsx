/**
 * SettingsScreen - App settings and configuration
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView, Alert, Platform, StatusBar } from 'react-native';
import { colors, spacing, webOuterContainer, webInnerContainer } from '../theme';
import { RetroText, RetroButton, RetroCard } from '../components/common';
import { useAppContext } from '../context/AppContext';
import { exportToCSV, selectAndParseCSV } from '../utils/csv';
import { getStorage } from '../storage';

interface SettingsScreenProps {
  onClose: () => void;
  onRunSetupWizard: () => void;
}

export function SettingsScreen({ onClose, onRunSetupWizard }: SettingsScreenProps) {
  const { state, dispatch } = useAppContext();

  const handleExportCSV = async () => {
    try {
      await exportToCSV(state);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export your data.');
    }
  };

  const handleImportCSV = async () => {
    // On web, we need to open file picker directly from user action (not from Alert callback)
    // due to browser security restrictions. We'll show confirmation after file selection.
    if (Platform.OS === 'web') {
      try {
        const result = await selectAndParseCSV();

        // User cancelled file picker
        if (result.cancelled) {
          return;
        }

        // Parsing failed
        if (!result.success || !result.data) {
          Alert.alert('Import Failed', result.error || 'Could not import the CSV file.');
          return;
        }

        // Show confirmation after file is selected (on web)
        const confirmImport = window.confirm(
          'This will replace ALL your current data with the imported data. This cannot be undone. Continue?'
        );

        if (!confirmImport) {
          return;
        }

        // Save to storage
        const storage = await getStorage();
        await storage.saveAllData(result.data);

        // Update app state
        dispatch({ type: 'IMPORT_DATA', payload: result.data });

        Alert.alert(
          'Import Successful',
          `Imported ${result.data.income.length} income sources, ${result.data.bills.length} bills, and ${result.data.savings.length} savings items.`
        );
      } catch (error) {
        console.error('Import error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        Alert.alert('Import Failed', `Could not import the CSV file: ${errorMessage}`);
      }
    } else {
      // On mobile, show confirmation first (file picker works from callbacks)
      Alert.alert(
        'Import Data',
        'This will replace ALL your current data with the imported data. This cannot be undone. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await selectAndParseCSV();

                // User cancelled
                if (result.cancelled) {
                  return;
                }

                // Parsing failed
                if (!result.success || !result.data) {
                  Alert.alert('Import Failed', result.error || 'Could not import the CSV file.');
                  return;
                }

                // Save to storage
                const storage = await getStorage();
                await storage.saveAllData(result.data);

                // Update app state
                dispatch({ type: 'IMPORT_DATA', payload: result.data });

                Alert.alert(
                  'Import Successful',
                  `Imported ${result.data.income.length} income sources, ${result.data.bills.length} bills, and ${result.data.savings.length} savings items.`
                );
              } catch (error) {
                console.error('Import error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                Alert.alert('Import Failed', `Could not import the CSV file: ${errorMessage}`);
              }
            },
          },
        ]
      );
    }
  };

  const handleRunSetupWizard = () => {
    // On web, use window.confirm since Alert callbacks don't work properly
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('This will restart the setup process. Continue?');
      if (confirmed) {
        onRunSetupWizard();
      }
    } else {
      Alert.alert('Run Setup Wizard', 'This will restart the setup process. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: onRunSetupWizard,
        },
      ]);
    }
  };

  return (
    <View style={webOuterContainer}>
      <SafeAreaView style={[styles.container, webInnerContainer]}>
        <View style={styles.header}>
          <RetroText size="xl" bold>
            SETTINGS
          </RetroText>
          <RetroButton label="Close" variant="secondary" size="sm" onPress={onClose} />
        </View>

        <View style={styles.content}>
        {/* Data Section */}
        <RetroCard title="Data">
          <RetroButton
            label="Export to CSV"
            variant="secondary"
            onPress={handleExportCSV}
            fullWidth
            style={styles.button}
          />
          <RetroText muted size="sm" style={styles.helpText}>
            Download all your data as a spreadsheet
          </RetroText>
          <RetroButton
            label="Import from CSV"
            variant="secondary"
            onPress={handleImportCSV}
            fullWidth
            style={styles.importButton}
          />
          <RetroText muted size="sm" style={styles.helpText}>
            Load data from a previously exported file
          </RetroText>
        </RetroCard>

        {/* Setup Section */}
        <RetroCard title="Setup">
          <RetroButton
            label="Run Setup Wizard"
            variant="secondary"
            onPress={handleRunSetupWizard}
            fullWidth
            style={styles.button}
          />
          <RetroText muted size="sm" style={styles.helpText}>
            Reconfigure your income, bills, and savings
          </RetroText>
        </RetroCard>

        {/* About Section */}
        <RetroCard title="About">
          <View style={styles.aboutRow}>
            <RetroText muted size="sm">
              Version:
            </RetroText>
            <RetroText size="sm">{state.appState.versionString}</RetroText>
          </View>
          <View style={styles.aboutRow}>
            <RetroText muted size="sm">
              Platform:
            </RetroText>
            <RetroText size="sm">{Platform.OS}</RetroText>
          </View>
          <RetroText muted size="xs" style={styles.copyright}>
            A simple finance tracker
          </RetroText>
        </RetroCard>

        {/* Web Security Warning */}
        {Platform.OS === 'web' && (
          <RetroCard>
            <RetroText warning size="sm" bold>
              SECURITY NOTICE
            </RetroText>
            <RetroText muted size="xs" style={styles.warningText}>
              Your data is stored locally in this browser. Clearing browser data will delete your
              financial information. Consider using the Export feature to backup your data
              regularly.
            </RetroText>
          </RetroCard>
        )}
        </View>
      </SafeAreaView>
    </View>
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
  button: {
    marginBottom: spacing.sm,
  },
  importButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  helpText: {
    marginTop: spacing.xs,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  copyright: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  warningText: {
    marginTop: spacing.sm,
    lineHeight: 18,
  },
});

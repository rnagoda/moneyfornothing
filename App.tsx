/**
 * Money For Nothing - Main App Entry Point
 */

// Polyfill for crypto.getRandomValues() - MUST be first import
import 'react-native-get-random-values';

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { AppProvider, useAppContext } from './src/context/AppContext';
import { getStorage } from './src/storage';
import { colors, webOuterContainer, webInnerContainer } from './src/theme';
import { RetroText } from './src/components/common';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SetupWizard } from './src/components/onboarding';
import type { AppData } from './src/types';

// Main App Content (needs to be inside AppProvider)
function AppContent() {
  const { state, dispatch } = useAppContext();
  const [showSettings, setShowSettings] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Check if we need to show the setup wizard
  useEffect(() => {
    if (!state.appState.hasCompletedSetup) {
      setShowSetupWizard(true);
    }
  }, [state.appState.hasCompletedSetup]);

  const handleSetupComplete = () => {
    setShowSetupWizard(false);
  };

  const handleRunSetupWizard = () => {
    setShowSettings(false);
    // Reset setup flag to show wizard
    dispatch({ type: 'SET_SETUP_COMPLETED', payload: false });
    setShowSetupWizard(true);
  };

  // Show setup wizard if needed
  if (showSetupWizard) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <>
      <HomeScreen onOpenSettings={() => setShowSettings(true)} />

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSettings(false)}
      >
        <SettingsScreen
          onClose={() => setShowSettings(false)}
          onRunSetupWizard={handleRunSetupWizard}
        />
      </Modal>
    </>
  );
}

// Root App Component
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedData, setLoadedData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load fonts and data
  useEffect(() => {
    async function initialize() {
      try {
        // Load custom fonts
        // Currently using Roboto Mono (sans-serif monospace)
        // To revert to Courier Prime (serif monospace), change the font files below
        // and update src/theme/typography.ts to use 'CourierPrime-*' names
        try {
          await Font.loadAsync({
            // Roboto Mono - sans-serif monospace (current)
            'RobotoMono-Regular': require('./assets/fonts/RobotoMono-Regular.ttf'),
            'RobotoMono-Bold': require('./assets/fonts/RobotoMono-Bold.ttf'),
            'RobotoMono-Italic': require('./assets/fonts/RobotoMono-Italic.ttf'),
            // Courier Prime - serif monospace (backup, uncomment to use)
            // 'CourierPrime-Regular': require('./assets/fonts/CourierPrime-Regular.ttf'),
            // 'CourierPrime-Bold': require('./assets/fonts/CourierPrime-Bold.ttf'),
            // 'CourierPrime-Italic': require('./assets/fonts/CourierPrime-Italic.ttf'),
          });
        } catch (fontError) {
          // Fonts not found - will use system fallback
          console.log('Custom fonts not loaded, using system fonts');
        }

        // Initialize storage and load data
        const storage = await getStorage();
        const data = await storage.loadAllData();
        setLoadedData(data);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize app');
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  // Show loading screen
  if (isLoading) {
    return (
      <View style={webOuterContainer}>
        <View style={[styles.loadingContainer, webInnerContainer]}>
            <StatusBar style="light" />
            <RetroText size="xl" bold>
              MONEY FOR NOTHING
            </RetroText>
            <ActivityIndicator size="large" color={colors.text} style={styles.spinner} />
            <RetroText muted size="sm">
              Loading...
            </RetroText>
        </View>
      </View>
    );
  }

  // Show error screen
  if (error) {
    return (
      <View style={webOuterContainer}>
        <View style={[styles.loadingContainer, webInnerContainer]}>
          <StatusBar style="light" />
          <RetroText warning size="lg">
            ERROR
          </RetroText>
          <RetroText muted style={styles.errorText}>
            {error}
          </RetroText>
        </View>
      </View>
    );
  }

  return (
    <View style={webOuterContainer}>
      <View style={webInnerContainer}>
        <AppProvider initialData={loadedData ?? undefined}>
          <StatusBar style="light" />
          <AppContent />
        </AppProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinner: {
    marginVertical: 20,
  },
  errorText: {
    marginTop: 10,
    textAlign: 'center',
  },
});

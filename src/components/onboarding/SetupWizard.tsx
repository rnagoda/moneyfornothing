/**
 * SetupWizard - Guided onboarding flow for new users
 */

import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../theme';
import { RetroText } from '../common';
import { ProgressBar } from '../layout';
import { WelcomeStep } from './WelcomeStep';
import { IncomeStep } from './IncomeStep';
import { BillsStep } from './BillsStep';
import { SavingsStep } from './SavingsStep';
import { CompletionStep } from './CompletionStep';
import { useAppContext } from '../../context/AppContext';
import { getStorage } from '../../storage';

interface SetupWizardProps {
  onComplete: () => void;
}

type WizardStep = 'welcome' | 'income' | 'bills' | 'savings' | 'completion';

const STEPS: WizardStep[] = ['welcome', 'income', 'bills', 'savings', 'completion'];

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const { dispatch } = useAppContext();

  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const goToNextStep = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleComplete = async () => {
    // Mark setup as completed
    dispatch({ type: 'SET_SETUP_COMPLETED', payload: true });

    // Persist to storage
    const storage = await getStorage();
    const appState = await storage.getAppState();
    if (appState) {
      await storage.saveAppState({ ...appState, hasCompletedSetup: true });
    }

    onComplete();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={goToNextStep} />;
      case 'income':
        return <IncomeStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case 'bills':
        return <BillsStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case 'savings':
        return <SavingsStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case 'completion':
        return <CompletionStep onComplete={handleComplete} onBack={goToPreviousStep} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <RetroText size="lg" bold center>
          SETUP WIZARD
        </RetroText>
        <ProgressBar progress={progress} showPercentage={false} />
        <RetroText size="sm" muted center>
          Step {stepIndex + 1} of {STEPS.length}
        </RetroText>
      </View>
      <View style={styles.content}>{renderStep()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
  },
});

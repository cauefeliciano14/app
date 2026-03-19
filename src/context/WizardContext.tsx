import React, { createContext, useContext, useState } from 'react';
import { loadCreationState } from '../utils/persistence';

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------
interface WizardContextValue {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  currentPhase: number;
  setCurrentPhase: (phase: number) => void;
  isPortraitModalOpen: boolean;
  setIsPortraitModalOpen: (open: boolean) => void;
  showTooltip: boolean;
  setShowTooltip: (show: boolean) => void;
  goToStep: (n: number) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedState = React.useMemo(() => loadCreationState(), []);

  const [currentStep, setCurrentStep] = useState(savedState?.currentStep ?? 0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const goToStep = (n: number) => {
    setCurrentStep(n);
  };

  const value: WizardContextValue = {
    currentStep,
    setCurrentStep,
    currentPhase,
    setCurrentPhase,
    isPortraitModalOpen,
    setIsPortraitModalOpen,
    showTooltip,
    setShowTooltip,
    goToStep,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error('useWizard must be used within a <WizardProvider>');
  }
  return ctx;
}

import React, { createContext, useContext, useState } from 'react';
import { loadCreationState } from '../utils/persistence';

interface WizardContextValue {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isPortraitModalOpen: boolean;
  setIsPortraitModalOpen: (open: boolean) => void;
  goToStep: (n: number) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedState = React.useMemo(() => loadCreationState(), []);

  const [currentStep, setCurrentStep] = useState(savedState?.currentStep ?? 0);
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);

  const goToStep = (n: number) => {
    setCurrentStep(n);
  };

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        isPortraitModalOpen,
        setIsPortraitModalOpen,
        goToStep,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error('useWizard must be used within a <WizardProvider>');
  }
  return ctx;
}

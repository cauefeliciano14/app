import React, { createContext, useContext, useMemo, useState } from 'react';
import { loadCreationState } from '../utils/persistence';

interface WizardContextValue {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isPortraitModalOpen: boolean;
  setIsPortraitModalOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  summaryCollapsed: boolean;
  setSummaryCollapsed: (collapsed: boolean) => void;
  goToStep: (n: number) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedState = useMemo(() => loadCreationState(), []);

  const [currentStep, setCurrentStep] = useState(savedState?.currentStep ?? 0);
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(savedState?.shellState?.sidebarCollapsed ?? false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(savedState?.shellState?.summaryCollapsed ?? false);

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
        sidebarCollapsed,
        setSidebarCollapsed,
        summaryCollapsed,
        setSummaryCollapsed,
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

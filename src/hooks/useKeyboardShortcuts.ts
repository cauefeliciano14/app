import { useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  currentStep: number;
  goToStep: (step: number) => void;
  maxStep?: number;
  isModalOpen?: boolean;
}

const INTERACTIVE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

export function useKeyboardShortcuts({
  currentStep,
  goToStep,
  maxStep = 5,
  isModalOpen = false,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (INTERACTIVE_TAGS.has(tag)) return;

      if (e.key === 'ArrowLeft' && currentStep > 0) {
        e.preventDefault();
        goToStep(currentStep - 1);
      }

      if (e.key === 'ArrowRight' && currentStep < maxStep) {
        e.preventDefault();
        goToStep(currentStep + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, goToStep, maxStep, isModalOpen]);
}

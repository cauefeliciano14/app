import React from 'react';
import { StepHeader } from '../StepHeader';
import { ValidationBanner } from '../ValidationBanner';
import styles from './StepLayout.module.css';

export interface StepLayoutProps {
  /** Callback invoked when the user clicks "Back". Omit to hide the back button. */
  onPrev?: () => void;
  /** Callback invoked when the user clicks "Advance". */
  onNext: () => void;
  /** Whether the advance button is enabled. */
  canAdvance: boolean;
  /** The 1-based active step index for the progress bar. */
  activeStep: number;
  /** Jump to a step when the user clicks a progress-bar node. */
  onStepClick: (step: number) => void;
  /** The current character name. */
  characterName: string;
  /** Setter for the character name. */
  setCharacterName: (name: string) => void;
  /** The current portrait filename (or null). */
  portrait: string | null;
  /** Callback when the portrait avatar is clicked. */
  onPortraitClick: () => void;
  /** Map from step number to selected value label (for progress bar). */
  selections: Record<number, string>;
  /**
   * Validation errors shown in a banner between the header and children.
   * If omitted or empty, no banner is rendered (step can render its own
   * ValidationBanner inside children for scroll-area placement).
   */
  errors?: string[];
  /** Custom bottom margin on the hr separator. Defaults to '16px'. */
  hrMarginBottom?: string;
  /** Child content rendered after the header + optional banner. */
  children: React.ReactNode;
}

const STEP_LABELS: Record<number, string> = {
  1: 'Classe',
  2: 'Origem',
  3: 'Espécie',
  4: 'Atributos',
  5: 'Equipamento',
  6: 'Ficha',
};

export const StepLayout: React.FC<StepLayoutProps> = ({
  onPrev,
  onNext,
  canAdvance,
  activeStep,
  onStepClick,
  characterName,
  setCharacterName,
  portrait,
  onPortraitClick,
  selections,
  errors,
  hrMarginBottom = '16px',
  children,
}) => {
  return (
    <div className="step-container" aria-label={STEP_LABELS[activeStep] ?? `Etapa ${activeStep}`}>
      <StepHeader
        onPrev={onPrev}
        onNext={onNext}
        canAdvance={canAdvance}
        activeStep={activeStep}
        onStepClick={onStepClick}
        characterName={characterName}
        setCharacterName={setCharacterName}
        portrait={portrait}
        onPortraitClick={onPortraitClick}
        selections={selections}
      />
      <hr className={styles.separator} style={{ marginBottom: hrMarginBottom }} />
      {errors && errors.length > 0 && <ValidationBanner errors={errors} />}
      {children}
    </div>
  );
};

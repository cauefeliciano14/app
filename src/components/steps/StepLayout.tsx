import React from 'react';
import { StepHeader } from '../StepHeader';
import { ValidationBanner } from '../ValidationBanner';
import { StepSidebar } from '../../features/creator/navigation/StepSidebar';
import { CharacterSummaryPanel } from '../../features/creator/summary/CharacterSummaryPanel';
import shellStyles from '../../features/creator/layout/CreatorShell.module.css';
import styles from './StepLayout.module.css';

export interface StepLayoutProps {
  onPrev?: () => void;
  onNext: () => void;
  canAdvance: boolean;
  activeStep: number;
  onStepClick?: (step: number) => void;
  characterName: string;
  setCharacterName: (name: string) => void;
  portrait: string | null;
  onPortraitClick: () => void;
  selections?: Record<number, string>;
  errors?: string[];
  hrMarginBottom?: string;
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
  characterName,
  setCharacterName,
  portrait,
  onPortraitClick,
  errors,
  hrMarginBottom = '16px',
  children,
}) => {
  return (
    <div className="step-container" aria-label={STEP_LABELS[activeStep] ?? `Etapa ${activeStep}`}>
      <div className={shellStyles.shell}>
        <aside className={shellStyles.sidebar}>
          <StepSidebar />
        </aside>

        <main className={shellStyles.main}>
          <div className={shellStyles.mainInner}>
            <StepHeader
              onPrev={onPrev}
              onNext={onNext}
              canAdvance={canAdvance}
              characterName={characterName}
              setCharacterName={setCharacterName}
              portrait={portrait}
              onPortraitClick={onPortraitClick}
            />
            <hr className={styles.separator} style={{ marginBottom: hrMarginBottom }} />
            {errors && errors.length > 0 && <ValidationBanner errors={errors} />}
            <div className={styles.content}>{children}</div>
          </div>
        </main>

        <aside className={shellStyles.summary}>
          <CharacterSummaryPanel />
        </aside>
      </div>
    </div>
  );
};

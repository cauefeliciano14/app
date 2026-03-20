import React, { useState } from 'react';
import { StepHeader } from '../StepHeader';
import { ValidationBanner } from '../ValidationBanner';
import { StepSidebar } from '../../features/creator/navigation/StepSidebar';
import { CharacterSummaryPanel } from '../../features/creator/summary/CharacterSummaryPanel';
import { ChoiceImpact } from '../../features/creator/ChoiceImpact';
import shellStyles from '../../features/creator/layout/CreatorShell.module.css';
import styles from './StepLayout.module.css';
import { useCharacter } from '../../context/CharacterContext';
import { useWizard } from '../../context/WizardContext';

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

const IMPACT_STEPS = new Set([0, 2, 3, 4]);

const COLLAPSED_STEP_LABELS = ['Cl', 'Or', 'Es', 'At', 'Eq', 'Fi'];

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);
  const { validationResult } = useCharacter();
  const { currentStep, setCurrentStep } = useWizard();

  const shellClass = [
    shellStyles.shell,
    sidebarCollapsed && summaryCollapsed ? shellStyles.shellBothCollapsed :
      sidebarCollapsed ? shellStyles.shellSidebarCollapsed :
        summaryCollapsed ? shellStyles.shellSummaryCollapsed : '',
  ].filter(Boolean).join(' ');

  const pendingMap: Record<string, number> = {
    class: validationResult.byStep.class.length,
    background: validationResult.byStep.background.length,
    species: validationResult.byStep.species.length,
    attributes: validationResult.byStep.attributes.length,
    equipment: validationResult.byStep.equipment.length,
    sheet: validationResult.errors.length,
  };

  const pendingKeys = ['class', 'background', 'species', 'attributes', 'equipment', 'sheet'];

  return (
    <div className="step-container" aria-label={STEP_LABELS[activeStep] ?? `Etapa ${activeStep}`}>
      <div className={shellClass}>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside
          className={`${shellStyles.sidebar} ${sidebarCollapsed ? shellStyles.sidebarCollapsed : ''}`}
        >
          {sidebarCollapsed ? (
            <div className={shellStyles.collapsedStrip}>
              <button
                className={shellStyles.collapsedExpandBtn}
                onClick={() => setSidebarCollapsed(false)}
                title="Expandir etapas"
                aria-label="Expandir barra de etapas"
              >
                ›
              </button>
              {COLLAPSED_STEP_LABELS.map((abbr, i) => {
                const pk = pendingKeys[i];
                const pending = pendingMap[pk] ?? 0;
                const complete = pk === 'sheet'
                  ? validationResult.isValid
                  : pending === 0 && i < currentStep;
                const active = currentStep === i;

                const dotClass = active
                  ? shellStyles.collapsedDotActive
                  : complete
                    ? shellStyles.collapsedDotComplete
                    : pending > 0
                      ? shellStyles.collapsedDotPending
                      : shellStyles.collapsedDotIdle;

                return (
                  <button
                    key={i}
                    className={`${shellStyles.collapsedStepDot} ${dotClass}`}
                    onClick={() => setCurrentStep(i)}
                    title={`Ir para etapa ${i + 1}`}
                    aria-label={`Etapa ${i + 1}`}
                  >
                    {complete ? '✓' : pending > 0 ? pending : abbr}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <button
                className={shellStyles.collapseToggle}
                onClick={() => setSidebarCollapsed(true)}
                title="Recolher etapas"
                aria-label="Recolher barra de etapas"
              >
                ‹
              </button>
              <StepSidebar />
            </>
          )}
        </aside>

        {/* ── Main ───────────────────────────────────────────────────────── */}
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
            {IMPACT_STEPS.has(activeStep) && <ChoiceImpact step={activeStep} />}
            <div className={styles.content}>{children}</div>
          </div>
        </main>

        {/* ── Summary ────────────────────────────────────────────────────── */}
        <aside
          className={`${shellStyles.summary} ${summaryCollapsed ? shellStyles.summaryCollapsed : ''}`}
        >
          {summaryCollapsed ? (
            <div className={shellStyles.collapsedStrip}>
              <button
                className={shellStyles.collapsedExpandBtn}
                onClick={() => setSummaryCollapsed(false)}
                title="Expandir resumo"
                aria-label="Expandir painel de resumo"
              >
                ‹
              </button>
            </div>
          ) : (
            <>
              <button
                className={shellStyles.collapseToggle}
                onClick={() => setSummaryCollapsed(true)}
                title="Recolher resumo"
                aria-label="Recolher painel de resumo"
              >
                ›
              </button>
              <CharacterSummaryPanel />
            </>
          )}
        </aside>

      </div>
    </div>
  );
};

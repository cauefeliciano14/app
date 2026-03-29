import { lazy, Suspense } from 'react';
import { useWizard } from '../../context/WizardContext';
import { useCharacter } from '../../context/CharacterContext';
import styles from './AccordionWizard.module.css';
import languagesData from '../../data/languages.json';

const ClassSelectionStep = lazy(() => import('../../components/steps/ClassSelectionStep').then(m => ({ default: m.ClassSelectionStep })));
const BackgroundStep = lazy(() => import('../../components/steps/BackgroundStep').then(m => ({ default: m.BackgroundStep })));
const SpeciesStep = lazy(() => import('../../components/steps/SpeciesStep').then(m => ({ default: m.SpeciesStep })));
const AttributesStepWrapper = lazy(() => import('../../components/steps/AttributesStepWrapper').then(m => ({ default: m.AttributesStepWrapper })));
const EquipmentStepWrapper = lazy(() => import('../../components/steps/EquipmentStepWrapper').then(m => ({ default: m.EquipmentStepWrapper })));
const CharacterSheetStep = lazy(() => import('../../components/steps/CharacterSheetStep').then(m => ({ default: m.CharacterSheetStep })));

const STEPS = [
  { label: 'Classe', icon: '⚔️' },
  { label: 'Origem', icon: '📜' },
  { label: 'Espécie', icon: '🧝' },
  { label: 'Atributos', icon: '🎲' },
  { label: 'Equipamento', icon: '🛡️' },
  { label: 'Ficha', icon: '📋' },
];

const STEP_KEYS = ['class', 'background', 'species', 'attributes', 'equipment'] as const;

export function AccordionWizard({ onReset }: { onReset: () => void }) {
  const { currentStep, goToStep } = useWizard();
  const { character, selectedBackground, validationResult } = useCharacter();

  const isStepDone = (index: number): boolean => {
    const key = STEP_KEYS[index];
    if (!key) return false;
    const issues = validationResult.byStep[key];
    if (!issues || issues.length === 0) {
      // Also check that something was actually selected
      if (key === 'class') return !!character.characterClass;
      if (key === 'background') return !!selectedBackground;
      if (key === 'species') return !!character.species;
      if (key === 'attributes') return true;
      if (key === 'equipment') return true;
    }
    return false;
  };

  const handleToggle = (index: number) => {
    goToStep(currentStep === index ? index : index);
  };

  return (
    <div className={styles.accordion}>
      {STEPS.map((step, index) => {
        const isOpen = currentStep === index;
        const isDone = isStepDone(index);

        return (
          <div key={index} className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
            <button
              className={`${styles.header} ${isOpen ? styles.headerOpen : ''} ${isDone ? styles.headerDone : ''}`}
              onClick={() => handleToggle(index)}
              aria-expanded={isOpen}
            >
              <span className={styles.icon}>{step.icon}</span>
              <span className={styles.label}>{step.label}</span>
              {isDone && <span className={styles.checkmark}>✓</span>}
              <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
            </button>

            {isOpen && (
              <div className={styles.body}>
                <Suspense fallback={<div className={styles.loading}>Carregando...</div>}>
                  {index === 0 && <ClassSelectionStep onReset={onReset} languagesData={languagesData} />}
                  {index === 1 && <BackgroundStep />}
                  {index === 2 && <SpeciesStep languagesData={languagesData} />}
                  {index === 3 && <AttributesStepWrapper />}
                  {index === 4 && <EquipmentStepWrapper />}
                  {index === 5 && <CharacterSheetStep />}
                </Suspense>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

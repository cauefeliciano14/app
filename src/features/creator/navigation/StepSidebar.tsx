import { useWizard } from '../../../context/WizardContext';
import { useCharacter } from '../../../context/CharacterContext';
import patterns from '../../../styles/panelPatterns.module.css';
import styles from './StepSidebar.module.css';

const ITEMS = [
  { index: 0, label: 'Classe', key: 'class' },
  { index: 1, label: 'Origem', key: 'background' },
  { index: 2, label: 'Espécie', key: 'species' },
  { index: 3, label: 'Atributos', key: 'attributes' },
  { index: 4, label: 'Equipamento', key: 'equipment' },
  { index: 5, label: 'Ficha', key: 'sheet' },
] as const;

export function StepSidebar() {
  const { currentStep, setCurrentStep } = useWizard();
  const { validationResult } = useCharacter();

  const pendingMap = {
    class: validationResult.byStep.class.length,
    background: validationResult.byStep.background.length,
    species: validationResult.byStep.species.length,
    attributes: validationResult.byStep.attributes.length,
    equipment: validationResult.byStep.equipment.length,
    sheet: validationResult.errors.length,
  };

  return (
    <div className={styles.root}>
      <div className={patterns.sectionTitle}>Etapas</div>

      <label className={styles.jumpLabel}>
        <span className={styles.jumpCaption}>Ir para etapa</span>
        <select
          className="premium-select"
          aria-label="Ir para etapa"
          value={currentStep}
          onChange={(e) => setCurrentStep(Number(e.target.value))}
        >
          {ITEMS.map((item) => {
            const pending = pendingMap[item.key];

            return (
              <option key={item.label} value={item.index}>
                {item.index + 1}. {item.label}{pending > 0 ? ` · ${pending} pendência${pending > 1 ? 's' : ''}` : ''}
              </option>
            );
          })}
        </select>
      </label>

      <div className={styles.detailList}>
          {ITEMS.map((item) => {
            const active = currentStep === item.index;
            const pending = pendingMap[item.key];
            const complete = item.key === 'sheet' ? validationResult.isValid : pending === 0 && item.index < currentStep;
            const badgeClass = complete
              ? styles.badgeComplete
              : pending > 0
                ? styles.badgePending
                : styles.badgeIdle;

            return (
              <button
                key={item.label}
                onClick={() => setCurrentStep(item.index)}
                className={`${styles.navButton} ${active ? styles.navButtonActive : ''}`.trim()}
              >
                <div className={styles.navHeader}>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={`${patterns.pill} ${styles.stepBadge} ${badgeClass}`.trim()}>
                    {complete ? '✓' : pending > 0 ? pending : item.index + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
    </div>
  );
}

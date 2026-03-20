import { useMemo } from 'react';
import { useCharacter } from '../../../context/CharacterContext';
import { useWizard } from '../../../context/WizardContext';
import styles from './CharacterSummaryPanel.module.css';

const STEP_LABELS: Record<string, string> = {
  class: 'Classe',
  background: 'Origem',
  species: 'Espécie',
  attributes: 'Atributos',
  equipment: 'Equipamento',
};

const STEP_INDEX: Record<string, number> = {
  class: 0,
  background: 1,
  species: 2,
  attributes: 3,
  equipment: 4,
};

export function CharacterSummaryPanel() {
  const { validationResult } = useCharacter();
  const { setCurrentStep } = useWizard();

  const pendingItems = useMemo(
    () => Object.entries(validationResult.byStep)
      .filter(([, issues]) => issues.length > 0)
      .map(([key, issues]) => ({
        key,
        label: STEP_LABELS[key] ?? key,
        count: Array.from(new Set(issues)).length,
        stepIndex: STEP_INDEX[key] ?? -1,
      })),
    [validationResult.byStep],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <div className={styles.sectionTitle}>Resumo</div>
      </div>

      <div className={styles.pendenciasCard}>
        <div className={styles.pendenciasHeader}>
          <div className={styles.pendenciasTitle}>Pendências</div>
          {pendingItems.length > 0 && (
            <span className={styles.pendenciasHint}>clique para ir</span>
          )}
        </div>

        {pendingItems.length > 0 ? (
          <div className={styles.pendingList}>
            {pendingItems.map((item) => (
              <button
                key={item.key}
                className={styles.pendingRow}
                onClick={() => { if (item.stepIndex >= 0) setCurrentStep(item.stepIndex); }}
                title={`Ir para ${item.label}`}
                disabled={item.stepIndex < 0}
              >
                <span className={styles.pendingLabel}>{item.label}</span>
                <span className={styles.pendingCount}>{item.count}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.pendenciasResolved}>✓ Tudo resolvido!</p>
        )}
      </div>
    </div>
  );
}

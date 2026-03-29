import { useMemo } from 'react';
import { useWizard } from '../../../context/WizardContext';
import { useCharacter } from '../../../context/CharacterContext';
import { useSound } from '../../../context/SoundContext';
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

const STEP_KEYS = ['class', 'background', 'species', 'attributes', 'equipment'] as const;

export function StepSidebar() {
  const { currentStep, setCurrentStep } = useWizard();
  const { validationResult } = useCharacter();
  const { soundEnabled, toggleSound } = useSound();

  const pendingMap = {
    class: validationResult.byStep.class.length,
    background: validationResult.byStep.background.length,
    species: validationResult.byStep.species.length,
    attributes: validationResult.byStep.attributes.length,
    equipment: validationResult.byStep.equipment.length,
    sheet: validationResult.errors.length,
  };

  const completionInfo = useMemo(() => {
    const completedSteps = STEP_KEYS.filter(key => pendingMap[key] === 0).length;
    const total = STEP_KEYS.length;
    const percent = Math.round((completedSteps / total) * 100);
    return { completedSteps, total, percent };
  }, [
    pendingMap.class, pendingMap.background, pendingMap.species,
    pendingMap.attributes, pendingMap.equipment,
  ]);

  return (
    <div className={styles.root}>
      <div className={patterns.sectionTitle}>Etapas</div>

      {/* ── Progress bar ── */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>
            {completionInfo.percent === 100 ? 'Pronto!' : `${completionInfo.completedSteps}/${completionInfo.total} etapas`}
          </span>
          <span className={styles.progressPercent}>{completionInfo.percent}%</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={`${styles.progressFill} ${completionInfo.percent === 100 ? styles.progressFillComplete : ''}`}
            style={{ width: `${completionInfo.percent}%` }}
          />
        </div>
      </div>

      <div className={styles.detailList}>
        {ITEMS.map((item) => {
          const active = currentStep === item.index;
          const pending = pendingMap[item.key];
          const complete = item.key === 'sheet'
            ? validationResult.isValid
            : pending === 0 && item.index < currentStep;

          const badgeClass = complete
            ? styles.badgeComplete
            : pending > 0
              ? styles.badgePending
              : styles.badgeIdle;

          let subtitle: string | null = null;
          if (complete) {
            subtitle = 'Concluída';
          } else if (active) {
            subtitle = 'Em andamento';
          }

          const subtitleClass = complete
            ? styles.navSubtitleDone
            : styles.navSubtitlePending;

          return (
            <button
              key={item.label}
              onClick={() => setCurrentStep(item.index)}
              className={`${styles.navButton} ${active ? styles.navButtonActive : ''}`.trim()}
            >
              <div className={styles.navHeader}>
                <div className={styles.navLabelGroup}>
                  <span className={styles.navLabel}>{item.label}</span>
                  {subtitle && (
                    <span className={`${styles.navSubtitle} ${subtitleClass}`}>{subtitle}</span>
                  )}
                </div>
                <span className={`${patterns.pill} ${styles.stepBadge} ${badgeClass}`.trim()}>
                  {complete ? '✓' : pending > 0 ? pending : item.index + 1}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={toggleSound}
        className={styles.soundToggle}
        title={soundEnabled ? 'Desativar sons' : 'Ativar sons'}
        aria-label={soundEnabled ? 'Desativar sons' : 'Ativar sons'}
      >
        {soundEnabled ? '🔊' : '🔇'} Sons {soundEnabled ? 'on' : 'off'}
      </button>
    </div>
  );
}

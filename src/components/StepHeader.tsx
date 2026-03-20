import styles from './StepHeader.module.css';

export interface StepHeaderProps {
  onPrev?: () => void;
  onNext: () => void;
  canAdvance: boolean;
  characterName: string;
  setCharacterName: (name: string) => void;
  portrait: string | null;
  onPortraitClick: () => void;
}

export const StepHeader = ({
  onPrev,
  onNext,
  canAdvance,
}: StepHeaderProps) => {


  return (
    <div className={styles.wrapper}>
      <div className={styles.mainRow}>
        <div style={{ flex: 1 }} />
        {/* Navigation */}
        <div className={styles.navButtons}>
          {onPrev ? (
            <button onClick={onPrev} className={styles.btnBack}>
              ‹ Voltar
            </button>
          ) : (
             <div className={styles.spacer} />
          )}
          <button
            onClick={onNext}
            className={`${styles.btnAdvance} ${!canAdvance ? styles.btnAdvanceDisabled : ''}`}
            disabled={!canAdvance}
          >
            Avançar ›
          </button>
        </div>
      </div>
    </div>
  );
};

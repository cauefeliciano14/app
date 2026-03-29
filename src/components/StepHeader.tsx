import { useState } from 'react';
import styles from './StepHeader.module.css';

export interface StepHeaderProps {
  onPrev?: () => void;
  onNext: () => void;
  canAdvance: boolean;
  characterName: string;
  setCharacterName: (name: string) => void;
  portrait: string | null;
  onPortraitClick: () => void;
  isResetMode?: boolean;
  onReset?: () => void;
}

export const StepHeader = ({
  onPrev,
  onNext,
  canAdvance,
  isResetMode,
  onReset,
}: StepHeaderProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
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
            {isResetMode ? (
              <button
                onClick={() => setShowConfirm(true)}
                className={styles.btnReset}
              >
                ✦ Criar novo Personagem
              </button>
            ) : (
              <button
                onClick={onNext}
                className={`${styles.btnAdvance} ${!canAdvance ? styles.btnAdvanceDisabled : ''}`}
                disabled={!canAdvance}
              >
                Avançar ›
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmação */}
      {showConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>⚠️</div>
            <h3 className={styles.modalTitle}>Criar novo personagem?</h3>
            <p className={styles.modalDesc}>
              Todo o progresso atual será perdido e você começará a criação do zero. Esta ação não pode ser desfeita.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancel}
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.modalConfirm}
                onClick={() => { setShowConfirm(false); onReset?.(); }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

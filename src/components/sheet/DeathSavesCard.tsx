import type { CharacterPlayState } from '../../types/playState';
import styles from './DeathSavesCard.module.css';

interface DeathSavesCardProps {
  deathSaves: CharacterPlayState['deathSaves'];
  onUpdate: (deathSaves: CharacterPlayState['deathSaves']) => void;
}

export function DeathSavesCard({ deathSaves, onUpdate }: DeathSavesCardProps) {
  const isStable = deathSaves.successes >= 3;
  const isDead = deathSaves.failures >= 3;

  const toggleSuccess = (index: number) => {
    if (isDead || isStable) return;
    const newSuccesses = index < deathSaves.successes
      ? index
      : index + 1;
    onUpdate({ ...deathSaves, successes: Math.min(3, newSuccesses) });
  };

  const toggleFailure = (index: number) => {
    if (isDead || isStable) return;
    const newFailures = index < deathSaves.failures
      ? index
      : index + 1;
    onUpdate({ ...deathSaves, failures: Math.min(3, newFailures) });
  };

  const handleReset = () => {
    onUpdate({ successes: 0, failures: 0 });
  };

  return (
    <div className={styles.container}>
      {/* Sucesso */}
      <div className={styles.row}>
        <span className={styles.label}>Sucesso</span>
        <div className={styles.checks}>
          {[0, 1, 2].map(i => (
            <div
              key={`s-${i}`}
              className={i < deathSaves.successes ? styles.checkSuccess : styles.check}
              onClick={() => toggleSuccess(i)}
              role="checkbox"
              aria-checked={i < deathSaves.successes}
              aria-label={`Sucesso ${i + 1}`}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleSuccess(i); }}
            >
              {i < deathSaves.successes ? '✓' : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Falha */}
      <div className={styles.row}>
        <span className={styles.label}>Falha</span>
        <div className={styles.checks}>
          {[0, 1, 2].map(i => (
            <div
              key={`f-${i}`}
              className={i < deathSaves.failures ? styles.checkFailure : styles.check}
              onClick={() => toggleFailure(i)}
              role="checkbox"
              aria-checked={i < deathSaves.failures}
              aria-label={`Falha ${i + 1}`}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleFailure(i); }}
            >
              {i < deathSaves.failures ? '✕' : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      {isStable && <div className={styles.statusStable}>✓ Estabilizado!</div>}
      {isDead && <div className={styles.statusDead}>✕ Morto</div>}

      {/* Reset */}
      {(deathSaves.successes > 0 || deathSaves.failures > 0) && (
        <button onClick={handleReset} className={styles.resetBtn}>
          Resetar
        </button>
      )}
    </div>
  );
}

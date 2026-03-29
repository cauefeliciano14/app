import type { DerivedSavingThrow } from '../../rules/types/DerivedSheet';
import { signedMod } from '../../utils/format';
import styles from './SavingThrowsCard.module.css';

interface SavingThrowsCardProps {
  derivedSavingThrows: DerivedSavingThrow[];
  onSaveClick?: (save: DerivedSavingThrow) => void;
}

export function SavingThrowsCard({ derivedSavingThrows, onSaveClick }: SavingThrowsCardProps) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {derivedSavingThrows.map(st => {
          const shortLabel = st.label.substring(0, 3).toUpperCase();
          return (
            <div
              key={st.attribute}
              className={`${styles.row} ${st.proficient ? styles.rowProficient : ''}`}
              onClick={() => onSaveClick?.(st)}
              role={onSaveClick ? 'button' : undefined}
              tabIndex={onSaveClick ? 0 : undefined}
              onKeyDown={onSaveClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onSaveClick(st); } : undefined}
              style={onSaveClick ? { cursor: 'pointer' } : undefined}
            >
              <span className={`${styles.label} ${st.proficient ? styles.labelProficient : ''}`}>{shortLabel}</span>
              <span className={`${styles.value} ${st.proficient ? styles.valueProficient : ''}`}>
                {signedMod(st.modifier)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

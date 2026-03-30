import styles from './ExhaustionTracker.module.css';

interface ExhaustionTrackerProps {
  level: number;
  onChange: (level: number) => void;
}

const MAX_EXHAUSTION = 10;

export function ExhaustionTracker({ level, onChange }: ExhaustionTrackerProps) {
  const handlePipClick = (pip: number) => {
    // Clicar no pip ativo desativa (volta para pip - 1)
    onChange(pip === level ? pip - 1 : pip);
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>EXAUSTÃO</span>
      <div className={styles.pips}>
        {Array.from({ length: MAX_EXHAUSTION }, (_, i) => (
          <button
            key={i}
            className={i < level ? styles.pipActive : styles.pip}
            onClick={() => handlePipClick(i + 1)}
            title={`Exaustão nível ${i + 1}`}
          />
        ))}
      </div>
      <span className={styles.levelText}>{level}/{MAX_EXHAUSTION}</span>
      {level > 0 && (
        <span className={styles.penalty}>−{level} d20</span>
      )}
    </div>
  );
}

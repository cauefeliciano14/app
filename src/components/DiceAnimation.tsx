import { useState, useEffect, useRef } from 'react';
import styles from './DiceAnimation.module.css';

interface DiceAnimationProps {
  diceCount?: number;
}

export function DiceAnimation({ diceCount = 4 }: DiceAnimationProps) {
  const [faces, setFaces] = useState<number[]>(() =>
    Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 6))
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFaces(Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 6)));
    }, 80);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [diceCount]);

  return (
    <div className={styles.container}>
      <div className={styles.diceRow}>
        {faces.map((face, i) => (
          <div key={i} className={styles.die}>{face}</div>
        ))}
      </div>
      <span className={styles.label}>Rolando...</span>
    </div>
  );
}

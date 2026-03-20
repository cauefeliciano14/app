import React, { useMemo } from 'react';
import styles from './ValidationBanner.module.css';

export const ValidationBanner: React.FC<{ errors: string[] }> = ({ errors }) => {
  const uniqueErrors = useMemo(() => Array.from(new Set(errors)), [errors]);

  if (uniqueErrors.length === 0) return null;

  const visibleErrors = uniqueErrors.slice(0, 2);
  const hiddenCount = uniqueErrors.length - visibleErrors.length;

  return (
    <div className={styles.banner} role="alert">
      <div className={styles.title}>Pendências ({uniqueErrors.length})</div>
      {visibleErrors.map((err) => (
        <div key={err} className={styles.errorItem}>
          • {err}
        </div>
      ))}
      {hiddenCount > 0 ? (
        <div className={styles.moreItems}>+{hiddenCount} pendência{hiddenCount > 1 ? 's' : ''} adicional{hiddenCount > 1 ? 'is' : ''}.</div>
      ) : null}
    </div>
  );
};

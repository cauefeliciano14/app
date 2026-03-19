import React from 'react';
import styles from './ValidationBanner.module.css';

export const ValidationBanner: React.FC<{ errors: string[] }> = ({ errors }) => {
  if (errors.length === 0) return null;
  return (
    <div className={styles.banner} role="alert">
      <div className={styles.title}>
        Pendências ({errors.length})
      </div>
      {errors.map((err, i) => (
        <div key={i} className={styles.errorItem}>
          • {err}
        </div>
      ))}
    </div>
  );
};

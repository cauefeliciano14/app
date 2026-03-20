import React, { useMemo, useState } from 'react';
import styles from './ValidationBanner.module.css';

const DEFAULT_VISIBLE_ERRORS = 4;

export const ValidationBanner: React.FC<{ errors: string[] }> = ({ errors }) => {
  const uniqueErrors = useMemo(() => Array.from(new Set(errors)), [errors]);
  const [expanded, setExpanded] = useState(false);

  if (uniqueErrors.length === 0) return null;

  const visibleErrors = expanded ? uniqueErrors : uniqueErrors.slice(0, DEFAULT_VISIBLE_ERRORS);
  const hiddenCount = uniqueErrors.length - visibleErrors.length;

  return (
    <div className={styles.banner} role="alert">
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Pendências ({uniqueErrors.length})</div>
          <div className={styles.subtitle}>Resolva os pontos abaixo para avançar com segurança.</div>
        </div>
        {uniqueErrors.length > DEFAULT_VISIBLE_ERRORS ? (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? 'Ver menos' : `Ver todas (${uniqueErrors.length})`}
          </button>
        ) : null}
      </div>

      <ul className={styles.list}>
        {visibleErrors.map((err) => (
          <li key={err} className={styles.errorItem}>
            {err}
          </li>
        ))}
      </ul>

      {hiddenCount > 0 ? (
        <div className={styles.moreItems}>
          +{hiddenCount} pendência{hiddenCount > 1 ? 's' : ''} oculta{hiddenCount > 1 ? 's' : ''}. Use “Ver todas” para revisar a lista completa.
        </div>
      ) : null}
    </div>
  );
};

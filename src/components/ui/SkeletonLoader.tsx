import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  rows?: number;
  variant?: 'catalog' | 'card' | 'list';
  className?: string;
}

export function SkeletonLoader({ rows = 4, variant = 'catalog', className }: SkeletonLoaderProps) {
  return (
    <div className={`${styles.skeleton} ${className ?? ''}`}>
      {variant === 'catalog' && (
        <>
          <div className={styles.catalogTitle} />
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.catalogRow}>
              <div className={styles.catalogName} />
              <div className={styles.catalogDesc} />
              <div className={styles.catalogBadge} />
            </div>
          ))}
        </>
      )}

      {variant === 'card' && (
        <div className={styles.cardGrid}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.cardItem} />
          ))}
        </div>
      )}

      {variant === 'list' && (
        <>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={i % 3 === 2 ? styles.listRowShort : styles.listRow} />
          ))}
        </>
      )}
    </div>
  );
}

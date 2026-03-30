import { useState, type ReactNode } from 'react';
import styles from './CollapsibleSection.module.css';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  /** Se true, sempre exibe expandido (para desktop) */
  forceOpen?: boolean;
}

export function CollapsibleSection({ title, defaultOpen = false, children, forceOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (forceOpen) {
    return <>{children}</>;
  }

  return (
    <div className={styles.section}>
      <button
        className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        <span className={styles.toggleTitle}>{title}</span>
        <span className={styles.toggleIcon}>{isOpen ? '▾' : '▸'}</span>
      </button>
      {isOpen && (
        <div className={styles.content}>{children}</div>
      )}
    </div>
  );
}

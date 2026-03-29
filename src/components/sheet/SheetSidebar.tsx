import { useEffect } from 'react';
import styles from './SheetSidebar.module.css';

interface SheetSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function SheetSidebar({ isOpen, onClose, title, subtitle, children }: SheetSidebarProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h3 className={styles.headerTitle}>{title}</h3>
            {subtitle && <span className={styles.headerSubtitle}>{subtitle}</span>}
          </div>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </aside>
    </>
  );
}

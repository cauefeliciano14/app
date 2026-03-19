import { useEffect, useId, useCallback } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export interface ModalProps {
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** Called when the user requests to close (ESC key or click-outside). */
  onClose: () => void;
  /** Optional heading rendered inside the panel. */
  title?: string;
  /** Modal body content. */
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const titleId = useId();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop — click to close */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Dialog panel */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        {...(title ? { 'aria-labelledby': titleId } : {})}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </>,
    document.body,
  );
};

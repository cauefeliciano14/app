import { useEffect } from 'react';
import styles from './RestModal.module.css';

interface RestModalProps {
  type: 'short' | 'long';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RestModal({ type, isOpen, onClose, onConfirm }: RestModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLong = type === 'long';

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>
          {isLong ? 'Descanso Longo' : 'Descanso Curto'}
        </h2>
        <div className={styles.body}>
          {isLong ? (
            <>
              <p>Ao realizar um Descanso Longo, você recupera:</p>
              <ul>
                <li>Todos os Pontos de Vida</li>
                <li>Todos os Espaços de Magia</li>
                <li>Inspiração Heróica</li>
                <li>Condições removidas</li>
              </ul>
            </>
          ) : (
            <>
              <p>Ao realizar um Descanso Curto, você pode:</p>
              <ul>
                <li>Gastar Dados de Vida para recuperar PV</li>
                <li>Recuperar habilidades de descanso curto</li>
              </ul>
            </>
          )}
          <p style={{ marginTop: 12 }}>Deseja prosseguir?</p>
        </div>
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            Confirmar {isLong ? 'Descanso Longo' : 'Descanso Curto'}
          </button>
        </div>
      </div>
    </div>
  );
}

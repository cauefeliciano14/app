import { Modal } from './ui/Modal';
import styles from './ComparisonModal.module.css';

interface ComparisonRow {
  label: string;
  value: string;
}

interface ComparisonItem {
  name: string;
  rows: ComparisonRow[];
}

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemA: ComparisonItem | null;
  itemB: ComparisonItem | null;
}

export function ComparisonModal({ isOpen, onClose, title, itemA, itemB }: ComparisonModalProps) {
  if (!isOpen) return null;

  const renderColumn = (item: ComparisonItem | null, other: ComparisonItem | null) => {
    if (!item) {
      return (
        <div className={styles.column}>
          <div className={styles.emptyColumn}>Selecione um item para comparar</div>
        </div>
      );
    }

    return (
      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <div className={styles.columnTitle}>{item.name}</div>
        </div>
        {item.rows.map((row, i) => {
          const otherRow = other?.rows[i];
          const isDifferent = otherRow && otherRow.value !== row.value;
          return (
            <div key={row.label} className={`${styles.row} ${isDifferent ? styles.highlight : ''}`}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={styles.rowValue}>{row.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className={styles.instructions}>
        Compare as diferenças lado a lado. Linhas destacadas indicam valores distintos.
      </p>
      <div className={styles.grid}>
        {renderColumn(itemA, itemB)}
        {renderColumn(itemB, itemA)}
      </div>
    </Modal>
  );
}

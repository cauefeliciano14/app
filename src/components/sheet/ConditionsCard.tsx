import { useState } from 'react';
import { D6_CONDITIONS } from '../../rules/calculators/sheet';
import styles from './ConditionsCard.module.css';

interface ConditionsCardProps {
  activeConditions: string[];
  concentratingOn?: string | null;
  onAdd: (condition: string) => void;
  onRemove: (condition: string) => void;
  onStopConcentrating?: () => void;
}

export function ConditionsCard({
  activeConditions,
  concentratingOn,
  onAdd,
  onRemove,
  onStopConcentrating,
}: ConditionsCardProps) {
  const [selected, setSelected] = useState('');

  const available = D6_CONDITIONS.filter(c => !activeConditions.includes(c));

  const handleAdd = () => {
    if (selected && !activeConditions.includes(selected)) {
      onAdd(selected);
      setSelected('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pillList}>
        {activeConditions.length === 0 && !concentratingOn && (
          <div className={styles.emptyText}>Adicionar ativas...</div>
        )}
        {concentratingOn && (
          <div className={`${styles.pill} ${styles.concentrationPill}`} title="Concentração Ativa">
            <span className={styles.pillText}>Concentração: {concentratingOn}</span>
            {onStopConcentrating && (
              <button onClick={onStopConcentrating} className={styles.removeBtn}>✕</button>
            )}
          </div>
        )}
        {activeConditions.map(c => (
          <div key={c} className={styles.pill}>
            <span className={`${styles.pillText} glossary-term`} data-glossary={c}>{c}</span>
            <button onClick={() => onRemove(c)} className={styles.removeBtn}>✕</button>
          </div>
        ))}
      </div>

      <div className={styles.addRow}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className={styles.select}
        >
          <option value="">Adicionar condição…</option>
          {available.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!selected}
          className={styles.addBtn}
        >
          +
        </button>
      </div>
    </div>
  );
}

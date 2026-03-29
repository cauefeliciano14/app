import { useState } from 'react';
import styles from './DefensesCard.module.css';

const COMMON_DEFENSES = [
  'Resistência a Fogo', 'Resistência a Frio', 'Resistência a Raio',
  'Resistência a Ácido', 'Resistência a Veneno', 'Resistência a Necrótico',
  'Imunidade a Encantamento', 'Imunidade a Veneno', 'Imunidade a Medo',
  'Imunidade a Paralisia', 'Imunidade a Charme',
];

interface DefensesCardProps {
  derivedDefenses?: string[];
  activeDefenses: string[];
  onAdd: (defense: string) => void;
  onRemove: (defense: string) => void;
}

export function DefensesCard({ derivedDefenses = [], activeDefenses, onAdd, onRemove }: DefensesCardProps) {
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');

  const available = COMMON_DEFENSES.filter(d => !activeDefenses.includes(d));

  const handleAdd = () => {
    const value = custom.trim() || selected;
    if (value && !activeDefenses.includes(value)) {
      onAdd(value);
      setSelected('');
      setCustom('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pillList}>
        {derivedDefenses.map(d => (
          <div key={d} className={styles.pillDerived}>{d}</div>
        ))}

        {activeDefenses.map(d => (
          <div key={d} className={styles.pillActive}>
            <span className={styles.pillActiveText}>{d}</span>
            <button onClick={() => onRemove(d)} className={styles.removeBtn}>✕</button>
          </div>
        ))}

        {activeDefenses.length === 0 && derivedDefenses.length === 0 && (
          <div className={styles.emptyText}>Adicionar defesas...</div>
        )}
      </div>

      <div className={styles.addRow}>
        <select
          value={selected}
          onChange={e => { setSelected(e.target.value); setCustom(''); }}
          className={styles.select}
        >
          <option value="">Defesa comum…</option>
          {available.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!selected && !custom.trim()}
          className={styles.addBtn}
        >
          +
        </button>
      </div>
      <input
        value={custom}
        onChange={e => { setCustom(e.target.value); setSelected(''); }}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="Ou escreva defesa personalizada…"
        className={styles.customInput}
      />
    </div>
  );
}

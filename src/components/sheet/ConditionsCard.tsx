import { useState } from 'react';
import { D6_CONDITIONS } from '../../rules/calculators/sheet';

interface ConditionsCardProps {
  activeConditions: string[];
  onAdd: (condition: string) => void;
  onRemove: (condition: string) => void;
}

export function ConditionsCard({ activeConditions, onAdd, onRemove }: ConditionsCardProps) {
  const [selected, setSelected] = useState('');

  const available = D6_CONDITIONS.filter(c => !activeConditions.includes(c));

  const handleAdd = () => {
    if (selected && !activeConditions.includes(selected)) {
      onAdd(selected);
      setSelected('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {activeConditions.length === 0 && (
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Adicionar ativas...</div>
        )}
        {activeConditions.map(c => (
          <div key={c} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(248,113,113,0.15)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '12px',
            padding: '2px 8px',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#f1f5f9' }}>{c}</span>
            <button
              onClick={() => onRemove(c)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                padding: '0 2px',
                fontSize: '0.7rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: selected ? '#f1f5f9' : '#64748b',
            padding: '4px 8px',
            fontSize: '0.8rem',
          }}
        >
          <option value="">Adicionar condição…</option>
          {available.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!selected}
          style={{
            background: 'rgba(167,139,250,0.15)',
            border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: '6px',
            color: selected ? '#a78bfa' : '#475569',
            padding: '4px 10px',
            fontSize: '0.8rem',
            cursor: selected ? 'pointer' : 'default',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

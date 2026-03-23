import { useState } from 'react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      {/* Lista combinada de defesas para simplificar o layout conforme referência "Normal" ou pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {derivedDefenses.map(d => (
          <div key={d} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '2px 8px',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{d}</span>
          </div>
        ))}

        {activeDefenses.map(d => (
          <div key={d} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(56,189,248,0.12)',
            border: '1px solid rgba(56,189,248,0.3)',
            borderRadius: '12px',
            padding: '2px 8px',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#f1f5f9' }}>{d}</span>
            <button
              onClick={() => onRemove(d)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
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
        
        {activeDefenses.length === 0 && derivedDefenses.length === 0 && (
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Adicionar defesas...</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
        <select
          value={selected}
          onChange={e => { setSelected(e.target.value); setCustom(''); }}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: selected ? '#f1f5f9' : '#64748b',
            padding: '4px 8px',
            fontSize: '0.78rem',
          }}
        >
          <option value="">Defesa comum…</option>
          {available.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!selected && !custom.trim()}
          style={{
            background: 'rgba(56,189,248,0.12)',
            border: '1px solid rgba(56,189,248,0.3)',
            borderRadius: '6px',
            color: (selected || custom.trim()) ? '#38bdf8' : '#475569',
            padding: '4px 10px',
            fontSize: '0.8rem',
            cursor: (selected || custom.trim()) ? 'pointer' : 'default',
          }}
        >
          +
        </button>
      </div>
      <input
        value={custom}
        onChange={e => { setCustom(e.target.value); setSelected(''); }}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="Ou escreva defesa personalizada…"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px',
          color: '#f1f5f9',
          padding: '4px 8px',
          fontSize: '0.78rem',
        }}
      />
    </div>
  );
}

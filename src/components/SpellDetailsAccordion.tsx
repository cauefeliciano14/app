import React, { useState } from 'react';
import allSpellsData from '../data/spells/spells_all.json';

interface SpellDetail {
  name: string;
  level: string;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
}

const spellIndex: Record<string, SpellDetail> = {};
(allSpellsData as SpellDetail[]).forEach((s) => {
  spellIndex[s.name] = s;
});

export const SpellDetailsAccordion: React.FC<{ spellName: string }> = ({ spellName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const spell = spellIndex[spellName];

  if (!spell) return null;

  return (
    <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
      <details
        style={{
          width: '100%',
        }}
        onToggle={(e) => setIsOpen(e.currentTarget.open)}
        className="spell-details-accordion"
      >
        <summary style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#e2e8f0',
          cursor: 'pointer',
          userSelect: 'none',
          listStyle: 'none', // Remove default triangle in some browsers
        }}>
          <span>Detalhes da Magia</span>
          <span style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: '0.75rem',
            color: '#94a3b8'
          }}>▼</span>
        </summary>

        <div style={{ marginTop: '12px', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6 }}>
          <div style={{ color: '#a1a1aa', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '10px' }}>
            {spell.level === 'Truque' ? `Truque de ${spell.school}` : `${spell.level}, ${spell.school}`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: '0.75rem', marginBottom: '12px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Conjuração:</span> <span style={{ color: '#e2e8f0' }}>{spell.castingTime}</span>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Alcance:</span> <span style={{ color: '#e2e8f0' }}>{spell.range}</span>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Componentes:</span> <span style={{ color: '#e2e8f0' }}>{spell.components}</span>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Duração:</span> <span style={{ color: '#e2e8f0' }}>{spell.duration}</span>
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{spell.description}</div>
        </div>
      </details>
      <style>{`
        .spell-details-accordion summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </div>
  );
};

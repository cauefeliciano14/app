import React from 'react';
import allSpellsData from '../data/spells/spells_all.json';
import { ContextualOverlay } from './ui/ContextualOverlay';

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
(allSpellsData as SpellDetail[]).forEach(s => {
  spellIndex[s.name] = s;
});

export const SpellTooltip: React.FC<{ spellName: string; anchorRect?: DOMRect | null }> = ({ spellName, anchorRect }) => {
  const spell = spellIndex[spellName];
  if (!spell) return null;

  return (
    <ContextualOverlay anchorRect={anchorRect} width={380} title={spell.name}>
      <div style={{ color: '#a1a1aa', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '10px' }}>
        {spell.level === 'Truque' ? `Truque de ${spell.school}` : `${spell.level}, ${spell.school}`}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: '0.75rem', marginBottom: '14px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
        <span style={{ color: '#64748b', fontWeight: 600 }}>Conjuração:</span> <span style={{ color: '#e2e8f0' }}>{spell.castingTime}</span>
        <span style={{ color: '#64748b', fontWeight: 600 }}>Alcance:</span> <span style={{ color: '#e2e8f0' }}>{spell.range}</span>
        <span style={{ color: '#64748b', fontWeight: 600 }}>Componentes:</span> <span style={{ color: '#e2e8f0' }}>{spell.components}</span>
        <span style={{ color: '#64748b', fontWeight: 600 }}>Duração:</span> <span style={{ color: '#e2e8f0' }}>{spell.duration}</span>
      </div>
      <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6 }}>{spell.description}</div>
    </ContextualOverlay>
  );
};

export { spellIndex };
export type { SpellDetail };

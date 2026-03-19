import React from 'react';
import { createPortal } from 'react-dom';
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
(allSpellsData as SpellDetail[]).forEach(s => {
  spellIndex[s.name] = s;
});

export const SpellTooltip: React.FC<{ spellName: string; anchorRect?: DOMRect | null }> = ({ spellName }) => {
  const spell = spellIndex[spellName];
  if (!spell) return null;

  return createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, pointerEvents: 'none' }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(17, 18, 24, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(249,115,22,0.4)',
        borderRadius: '12px',
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '400px',
        zIndex: 9999,
        boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 20px rgba(249,115,22,0.15)',
        pointerEvents: 'none',
        animation: 'tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        <style>
          {`
            @keyframes tooltipFadeIn {
              from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
              to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
          `}
        </style>
        <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <div style={{ color: '#f97316', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.3px', textTransform: 'uppercase' }}>{spell.name}</div>
          <div style={{ color: '#a1a1aa', fontSize: '0.75rem', fontStyle: 'italic', marginTop: '2px' }}>
            {spell.level === 'Truque' ? `Truque de ${spell.school}` : `${spell.level}, ${spell.school}`}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: '0.75rem', marginBottom: '14px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Conjuração:</span> <span style={{ color: '#e2e8f0' }}>{spell.castingTime}</span>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Alcance:</span> <span style={{ color: '#e2e8f0' }}>{spell.range}</span>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Componentes:</span> <span style={{ color: '#e2e8f0' }}>{spell.components}</span>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Duração:</span> <span style={{ color: '#e2e8f0' }}>{spell.duration}</span>
        </div>
        <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6, textAlign: 'justify' }}>
          {spell.description}
        </div>
      </div>
    </>,
    document.body
  );
};

export { spellIndex };
export type { SpellDetail };

import React, { useState } from 'react';
import css from './equipment.module.css';

interface PreparedSpellsProps {
  learnedCantrips: string[];
  preparedSpells: string[];
  allSpells: any[];
  onRemoveCantrip: (name: string) => void;
  onRemoveSpell: (name: string) => void;
}

const separator: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255,255,255,0.06)',
  margin: '8px 0',
};

const detailLabel: React.CSSProperties = {
  color: 'var(--text-faint)',
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue: React.CSSProperties = {
  color: 'var(--text-body)',
  fontSize: '0.85rem',
  fontWeight: 500,
};

const schoolColor = (school: string) => {
  const map: Record<string, string> = {
    'Abjuração': '#3b82f6', 'Conjuração': '#f59e0b', 'Adivinhação': '#a855f7',
    'Encantamento': '#ec4899', 'Evocação': '#ef4444', 'Ilusão': '#8b5cf6',
    'Necromancia': '#6b7280', 'Transmutação': '#22c55e',
  };
  return map[school] || '#94a3b8';
};

export const PreparedSpells: React.FC<PreparedSpellsProps> = ({
  learnedCantrips, preparedSpells, allSpells, onRemoveCantrip, onRemoveSpell,
}) => {
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);
  const findSpell = (name: string) => allSpells.find(s => s.name === name);

  if (learnedCantrips.length === 0 && preparedSpells.length === 0) {
    return (
      <p style={{ color: 'var(--text-faint)', fontSize: '0.9rem', margin: 0 }}>
        Você não possui nenhuma magia preparada no momento. Aprenda e prepare magias da sua lista de magias disponíveis abaixo.
      </p>
    );
  }

  const renderSpellRow = (name: string, isCantrip: boolean) => {
    const spell = findSpell(name);
    const isExpanded = expandedSpell === name;
    const onRemove = isCantrip ? () => onRemoveCantrip(name) : () => onRemoveSpell(name);

    return (
      <div key={name} style={{
        background: 'var(--surface-row-alt)', borderRadius: '6px',
        border: '1px solid var(--border-faint)', overflow: 'hidden',
      }}>
        <div
          onClick={() => setExpandedSpell(isExpanded ? null : name)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--text-bright)', fontWeight: 500, fontSize: '0.9rem' }}>{name}</span>
            {spell?.school && (
              <span className={css.tagPill} style={{ color: schoolColor(spell.school), background: `${schoolColor(spell.school)}15` }}>
                {spell.school}
              </span>
            )}
          </div>
          {!isExpanded && (
            <button onClick={e => { e.stopPropagation(); onRemove(); }} className={`${css.btnSmall} ${css.btnDanger}`} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              Remover
            </button>
          )}
        </div>

        {isExpanded && spell && (
          <div style={{ padding: '0 12px 12px 12px', display: 'flex', flexDirection: 'column' }}>
            {/* School & level */}
            <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              {spell.school && <span style={{ color: schoolColor(spell.school) }}>{spell.school}</span>}
              {isCantrip ? ' \u00B7 Truque' : ' \u00B7 N\u00EDvel 1'}
            </div>
            <div style={separator} />

            {/* Detail grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', padding: '4px 0' }}>
              {spell.castingTime && (
                <div>
                  <div style={detailLabel}>Tempo de Conjura\u00E7\u00E3o</div>
                  <div style={detailValue}>{spell.castingTime}</div>
                </div>
              )}
              {spell.range && (
                <div>
                  <div style={detailLabel}>Alcance</div>
                  <div style={detailValue}>{spell.range}</div>
                </div>
              )}
              {spell.components && (
                <div>
                  <div style={detailLabel}>Componentes</div>
                  <div style={detailValue}>{spell.components}</div>
                </div>
              )}
              {spell.duration && (
                <div>
                  <div style={detailLabel}>Dura\u00E7\u00E3o</div>
                  <div style={detailValue}>{spell.duration}</div>
                </div>
              )}
            </div>

            {/* Description */}
            {spell.description && (
              <>
                <div style={separator} />
                <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: 0, lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto' }}>
                  {spell.description}
                </p>
              </>
            )}

            {/* Remove button centered */}
            <div style={separator} />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
              <button onClick={onRemove} className={`${css.btnSmall} ${css.btnDanger}`} style={{ padding: '8px 24px', fontSize: '0.82rem' }}>
                Remover {isCantrip ? 'Truque' : 'Magia'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {learnedCantrips.length > 0 && (
        <div>
          <h5 style={{ margin: '0 0 8px 0', color: 'var(--color-magic)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Truques ({learnedCantrips.length})
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {learnedCantrips.map(c => renderSpellRow(c, true))}
          </div>
        </div>
      )}
      {preparedSpells.length > 0 && (
        <div>
          <h5 style={{ margin: '0 0 8px 0', color: 'var(--color-info)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Magias Preparadas ({preparedSpells.length})
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {preparedSpells.map(s => renderSpellRow(s, false))}
          </div>
        </div>
      )}
    </div>
  );
};

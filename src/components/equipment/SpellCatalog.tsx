import React, { useState, useMemo } from 'react';
import css from './equipment.module.css';

interface SpellCatalogProps {
  classId: string;
  learnedCantrips: string[];
  preparedSpells: string[];
  onLearnCantrip: (name: string) => void;
  onPrepareSpell: (name: string) => void;
  onRemoveCantrip: (name: string) => void;
  onRemoveSpell: (name: string) => void;
  allSpells: any[];
  maxCantrips: number;
  maxPrepared: number;
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

export const SpellCatalog: React.FC<SpellCatalogProps> = ({
  classId: _classId, learnedCantrips, preparedSpells,
  onLearnCantrip, onPrepareSpell, onRemoveCantrip, onRemoveSpell,
  allSpells, maxCantrips, maxPrepared,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  const cantrips = useMemo(() => allSpells.filter(s => s.level === 'Truque' || s.level === 0), [allSpells]);
  const level1Spells = useMemo(() => allSpells.filter(s => s.level === 1 || s.level === '1'), [allSpells]);

  const totalKnown = learnedCantrips.length + preparedSpells.length;

  const filtered = useMemo(() => {
    let list = levelFilter === '0' ? cantrips : levelFilter === '1' ? level1Spells : [...cantrips, ...level1Spells];
    if (searchQuery) {
      list = list.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [cantrips, level1Spells, levelFilter, searchQuery]);

  const schoolColor = (school: string) => {
    const map: Record<string, string> = {
      'Abjuração': '#3b82f6', 'Conjuração': '#f59e0b', 'Adivinhação': '#a855f7',
      'Encantamento': '#ec4899', 'Evocação': '#ef4444', 'Ilusão': '#8b5cf6',
      'Necromancia': '#6b7280', 'Transmutação': '#22c55e',
    };
    return map[school] || '#94a3b8';
  };

  const levelPill = (value: string, label: string) => {
    const isActive = levelFilter === value;
    return (
      <button
        onClick={() => setLevelFilter(value)}
        style={{
          padding: '5px 14px',
          borderRadius: '16px',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          border: isActive ? '1px solid var(--color-magic)' : '1px solid rgba(255,255,255,0.12)',
          background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
          color: isActive ? 'var(--color-magic)' : 'var(--text-dim)',
          transition: 'all var(--transition-fast)',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Limits info */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: 'var(--color-magic)', fontSize: '0.85rem', fontWeight: 600 }}>
          Truques: {learnedCantrips.length}/{maxCantrips}
        </span>
        <span style={{ color: 'var(--color-info)', fontSize: '0.85rem', fontWeight: 600 }}>
          Magias Preparadas: {preparedSpells.length}/{maxPrepared}
        </span>
        <span style={{ color: 'var(--text-faint)', fontSize: '0.82rem' }}>
          ({totalKnown} Conhecidos)
        </span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-faint)' }}>&#128269;</span>
        <input
          type="text"
          placeholder="Nome da magia..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={css.inputStyle}
        />
      </div>

      {/* Level filters */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {levelPill('all', 'Todos')}
        {levelPill('0', '0')}
        {levelPill('1', '1')}
      </div>

      {/* Count */}
      <div style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>{filtered.length} magias dispon\u00EDveis</div>

      {/* Spell list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '500px', overflowY: 'auto' }}>
        {filtered.map((spell, i) => {
          const isCantrip = spell.level === 'Truque' || spell.level === 0;
          const isLearned = isCantrip ? learnedCantrips.includes(spell.name) : preparedSpells.includes(spell.name);
          const isExpanded = expandedSpell === spell.name;
          const limitReached = isCantrip
            ? learnedCantrips.length >= maxCantrips
            : preparedSpells.length >= maxPrepared;

          return (
            <div key={spell.name} className={i % 2 === 0 ? css.rowEven : css.rowOdd} style={{ borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer' }}
                onClick={() => setExpandedSpell(isExpanded ? null : spell.name)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <span style={{ color: 'var(--text-bright)', fontSize: '0.88rem', fontWeight: 500 }}>{spell.name}</span>
                  {spell.school && (
                    <span className={css.tagPill} style={{ color: schoolColor(spell.school), background: `${schoolColor(spell.school)}15` }}>
                      {spell.school}
                    </span>
                  )}
                </div>
                {isLearned ? (
                  <button
                    onClick={e => { e.stopPropagation(); isCantrip ? onRemoveCantrip(spell.name) : onRemoveSpell(spell.name); }}
                    className={`${css.btnSmall} ${css.btnSuccess}`}
                    style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                  >
                    {isCantrip ? '\u2713 Aprendido' : '\u2713 Preparado'}
                  </button>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); isCantrip ? onLearnCantrip(spell.name) : onPrepareSpell(spell.name); }}
                    disabled={limitReached}
                    className={`${css.btnSmall} ${css.btnPrimary}`}
                    style={{
                      padding: '4px 12px',
                      fontSize: '0.78rem',
                      opacity: limitReached ? 0.4 : 1,
                      cursor: limitReached ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isCantrip ? 'Aprender' : 'Preparar'}
                  </button>
                )}
              </div>

              {isExpanded && (
                <div style={{ padding: '4px 12px 12px 12px', display: 'flex', flexDirection: 'column' }}>
                  {/* School & level */}
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                    {spell.school && <span style={{ color: schoolColor(spell.school) }}>{spell.school}</span>}
                    {isCantrip ? ' \u00B7 Truque' : ' \u00B7 Magia de 1\u00BA N\u00EDvel'}
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { inputStyle, tagPill, btnSmall, rowAlt } from './equipmentStyles';

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
  color: '#64748b',
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue: React.CSSProperties = {
  color: '#cbd5e1',
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
          border: isActive ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.12)',
          background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
          color: isActive ? '#a78bfa' : '#94a3b8',
          transition: 'all 0.15s',
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
        <span style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600 }}>
          Truques: {learnedCantrips.length}/{maxCantrips}
        </span>
        <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>
          Magias Preparadas: {preparedSpells.length}/{maxPrepared}
        </span>
        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
          ({totalKnown} Conhecidos)
        </span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }}>🔍</span>
        <input
          type="text"
          placeholder="Nome da magia..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Level filters */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {levelPill('all', 'Todos')}
        {levelPill('0', '0')}
        {levelPill('1', '1')}
      </div>

      {/* Count */}
      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{filtered.length} magias disponíveis</div>

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
            <div key={spell.name} style={{ ...rowAlt(i), borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer' }}
                onClick={() => setExpandedSpell(isExpanded ? null : spell.name)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <span style={{ color: '#f1f5f9', fontSize: '0.88rem', fontWeight: 500 }}>{spell.name}</span>
                  {spell.school && (
                    <span style={{ ...tagPill, color: schoolColor(spell.school), background: `${schoolColor(spell.school)}15` }}>
                      {spell.school}
                    </span>
                  )}
                </div>
                {isLearned ? (
                  <button
                    onClick={e => { e.stopPropagation(); isCantrip ? onRemoveCantrip(spell.name) : onRemoveSpell(spell.name); }}
                    style={{ ...btnSmall('success'), padding: '4px 12px', fontSize: '0.78rem' }}
                  >
                    {isCantrip ? '✓ Aprendido' : '✓ Preparado'}
                  </button>
                ) : (
                  <button
                    onClick={e => { e.stopPropagation(); isCantrip ? onLearnCantrip(spell.name) : onPrepareSpell(spell.name); }}
                    disabled={limitReached}
                    style={{
                      ...btnSmall('primary'),
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
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                    {spell.school && <span style={{ color: schoolColor(spell.school) }}>{spell.school}</span>}
                    {isCantrip ? ' · Truque' : ' · Magia de 1º Nível'}
                  </div>
                  <div style={separator} />

                  {/* Detail grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', padding: '4px 0' }}>
                    {spell.castingTime && (
                      <div>
                        <div style={detailLabel}>Tempo de Conjuração</div>
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
                        <div style={detailLabel}>Duração</div>
                        <div style={detailValue}>{spell.duration}</div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {spell.description && (
                    <>
                      <div style={separator} />
                      <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto' }}>
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

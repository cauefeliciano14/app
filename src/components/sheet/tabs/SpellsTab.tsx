import { useMemo, useState } from 'react';
import type { DerivedSheet } from '../../../rules/types/DerivedSheet';
import type { CharacterPlayState } from '../../../types/playState';
import spellsAll from '../../../data/spells/spells_all.json';

const ABILITY_LABELS: Record<string, string> = {
  inteligencia: 'Inteligência', sabedoria: 'Sabedoria', carisma: 'Carisma',
  forca: 'Força', destreza: 'Destreza', constituicao: 'Constituição',
};

function signedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface SpellsTabProps {
  derivedSheet: DerivedSheet;
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
  learnedCantrips: string[];
  preparedSpells: string[];
}


const SPELL_LEVEL_MAP = new Map<string, string>();
for (const sp of spellsAll as Array<{ name: string; level: string }>) {
  SPELL_LEVEL_MAP.set(sp.name, sp.level);
}

const CIRCLE_ORDER = [
  'Truque', '1º Círculo', '2º Círculo', '3º Círculo', '4º Círculo',
  '5º Círculo', '6º Círculo', '7º Círculo', '8º Círculo', '9º Círculo',
];

export function SpellsTab({
  derivedSheet,
  playState,
  onUpdatePlayState,
  learnedCantrips,
  preparedSpells,
}: SpellsTabProps) {
  const [circleFilter, setCircleFilter] = useState<string>('all');

  const racialCantrips = derivedSheet.racialCantrips ?? [];
  const bonusCantrips = derivedSheet.bonusCantrips ?? [];
  const bonusPreparedSpells = derivedSheet.bonusPreparedSpells ?? [];

  const groupedPrepared = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const name of preparedSpells) {
      const circle = SPELL_LEVEL_MAP.get(name) ?? '?';
      if (!groups[circle]) groups[circle] = [];
      groups[circle].push(name);
    }
    return groups;
  }, [preparedSpells]);

  const availableCircles = useMemo(() => {
    const circles = new Set<string>();
    if (learnedCantrips.length > 0 || bonusCantrips.length > 0) circles.add('Truque');
    for (const c of Object.keys(groupedPrepared)) circles.add(c);
    if (bonusPreparedSpells.length > 0) circles.add('1º Círculo');
    return CIRCLE_ORDER.filter(c => circles.has(c));
  }, [groupedPrepared, learnedCantrips, bonusCantrips, bonusPreparedSpells]);

  if (!derivedSheet.isCaster && bonusCantrips.length === 0 && bonusPreparedSpells.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#475569',
        fontSize: '0.9rem',
      }}>
        Esta classe não conjura magias.
      </div>
    );
  }

  const slots = derivedSheet.spellSlots ?? {};
  const slotLevels = Object.keys(slots)
    .map(Number)
    .filter(l => (slots as Record<number, number>)[l] > 0)
    .sort((a, b) => a - b);

  const handleSpendSlot = (level: number) => {
    onUpdatePlayState(prev => ({
      ...prev,
      spentSpellSlots: {
        ...prev.spentSpellSlots,
        [level]: (prev.spentSpellSlots[level] ?? 0) + 1,
      },
    }));
  };

  const handleRestoreSlot = (level: number) => {
    onUpdatePlayState(prev => ({
      ...prev,
      spentSpellSlots: {
        ...prev.spentSpellSlots,
        [level]: Math.max(0, (prev.spentSpellSlots[level] ?? 0) - 1),
      },
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        background: 'transparent',
        padding: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <StatPill label="ATRIBUTO DE CONJURAÇÃO" value={ABILITY_LABELS[derivedSheet.spellcastingAbility ?? ''] ?? '—'} />
        <StatPill label="CD DE MAGIA" value={String(derivedSheet.spellSaveDC ?? 0)} />
        <StatPill label="BÔNUS DE ATAQUE MÁGICO" value={signedMod(derivedSheet.spellAttackBonus ?? 0)} />
        <StatPill label="MAGIAS PREPARADAS" value={String(derivedSheet.preparedSpellCount ?? 0)} />
        <StatPill label="TRUQUES CONHECIDOS" value={String(derivedSheet.cantripsKnown ?? 0)} />
        {bonusCantrips.length > 0 && <StatPill label="TRUQUES EXTRAS" value={String(bonusCantrips.length)} />}
        {bonusPreparedSpells.length > 0 && <StatPill label="MAGIAS EXTRAS" value={String(bonusPreparedSpells.length)} />}
      </div>

      {slotLevels.length > 0 && (
        <div style={{
          background: 'rgba(17,18,24,0.6)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          padding: '12px 14px',
        }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '10px' }}>
            ESPAÇOS DE MAGIA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {slotLevels.map(level => {
              const total = (slots as Record<number, number>)[level] ?? 0;
              const spent = playState.spentSpellSlots[level] ?? 0;
              const remaining = total - spent;
              return (
                <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '60px' }}>
                    {level}º círculo
                  </span>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {Array.from({ length: total }, (_, i) => (
                      <div key={i} style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '2px solid rgba(167,139,250,0.4)',
                        background: i < remaining ? 'rgba(167,139,250,0.4)' : 'transparent',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#475569', minWidth: '40px' }}>
                    {remaining}/{total}
                  </span>
                  <button onClick={() => handleSpendSlot(level)} disabled={remaining <= 0} style={slotButtonStyle(remaining > 0, 'rgba(248,113,113,0.15)', 'rgba(248,113,113,0.2)', '#f87171')}>
                    Gastar
                  </button>
                  <button onClick={() => handleRestoreSlot(level)} disabled={spent <= 0} style={slotButtonStyle(spent > 0, 'rgba(74,222,128,0.1)', 'rgba(74,222,128,0.2)', '#4ade80')}>
                    Restaurar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {availableCircles.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCircleFilter('all')}
            style={filterPillStyle(circleFilter === 'all')}
          >
            Todos
          </button>
          {availableCircles.map(c => (
            <button key={c} onClick={() => setCircleFilter(c)} style={filterPillStyle(circleFilter === c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {learnedCantrips.length > 0 && (circleFilter === 'all' || circleFilter === 'Truque') && (
        <SpellList
          title="TRUQUES"
          subtitle="Aprendidos pela classe; contam no limite normal."
          spells={learnedCantrips}
          accent="#fbbf24"
        />
      )}

      {racialCantrips.length > 0 && (circleFilter === 'all' || circleFilter === 'Truque') && (
        <SpellList
          title="TRUQUES RACIAIS"
          subtitle="Origem racial/específica; não contam no limite de truques da classe."
          spells={racialCantrips}
          accent="#22c55e"
          badge="Racial"
        />
      )}

      {bonusCantrips.filter((spell) => spell.source === 'talent').length > 0 && (circleFilter === 'all' || circleFilter === 'Truque') && (
        <SpellList
          title="TRUQUES DE TALENTO"
          subtitle="Concedidos por talentos de origem/específicos."
          spells={bonusCantrips.filter((spell) => spell.source === 'talent').map((spell) => `${spell.name} — ${spell.origin}`)}
          accent="#38bdf8"
          badge="Talento"
        />
      )}

      {CIRCLE_ORDER.filter(c => c !== 'Truque' && groupedPrepared[c]).map(circle => {
        if (circleFilter !== 'all' && circleFilter !== circle) return null;
        return (
          <SpellList
            key={circle}
            title={circle.toUpperCase()}
            spells={groupedPrepared[circle]}
            accent="#a78bfa"
          />
        );
      })}

      {groupedPrepared['?'] && (circleFilter === 'all' || circleFilter === '?') && (
        <SpellList 
          title="MAGIAS PREPARADAS" 
          spells={groupedPrepared['?']} 
          accent="#a78bfa" 
        />
      )}

      {bonusPreparedSpells.length > 0 && (circleFilter === 'all' || circleFilter === '1º Círculo') && (
        <SpellList
          title="MAGIAS EXTRA"
          subtitle="Preparadas por traços raciais ou talentos."
          spells={bonusPreparedSpells.map((spell) => `${spell.name} — ${spell.origin}`)}
          accent="#34d399"
          badge="Extra"
        />
      )}

      {learnedCantrips.length === 0 && bonusCantrips.length === 0 && preparedSpells.length === 0 && bonusPreparedSpells.length === 0 && (
        <div style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
          Nenhuma magia selecionada.
        </div>
      )}

    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'left', minWidth: '80px' }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '2px', fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f1f5f9' }}>{value}</div>
    </div>
  );
}

function SpellList({
  title,
  subtitle,
  spells,
  accent,
  badge,
}: {
  title: string;
  subtitle?: string;
  spells: string[];
  accent: string;
  badge?: string;
}) {
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  return (
    <div style={{
      background: 'rgba(17,18,24,0.6)',
      border: 'none',
      borderLeft: `2px solid ${accent}`,
      borderRadius: '4px',
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', marginBottom: subtitle ? '4px' : '8px' }}>
        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em' }}>
          {title}
        </div>
        {badge && (
          <span style={{
            background: `${accent}1a`,
            border: `1px solid ${accent}33`,
            borderRadius: '999px',
            color: accent,
            fontSize: '0.68rem',
            fontWeight: 600,
            padding: '2px 8px',
          }}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>
          {subtitle}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {spells.map(s => {
          const rawName = s.split(' — ')[0].trim();
          const isExpanded = expandedSpell === s;

          if (isExpanded) {
            const spellInfo = (spellsAll as any[]).find(sp => sp.name === rawName);
            return (
              <div
                key={`exp-${s}`}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.35)',
                  border: `1px solid ${accent}40`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginTop: '4px',
                  animation: 'fadeIn 0.2s ease-out',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <div style={{ color: accent, fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{s}</div>
                    {spellInfo && (
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                        {spellInfo.level === 'Truque' ? `Truque de ${spellInfo.school}` : `${spellInfo.level}, ${spellInfo.school}`}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setExpandedSpell(null)}
                    style={{ 
                      background: 'rgba(255,255,255,0.06)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '6px',
                      color: '#cbd5e1', 
                      cursor: 'pointer', 
                      fontSize: '0.75rem', 
                      padding: '5px 12px',
                      fontWeight: 600,
                      transition: 'background 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#cbd5e1'; }}
                  >
                    Recolher ▲
                  </button>
                </div>

                {spellInfo ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: '8px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Conjuração:</span> <span style={{ color: '#e2e8f0' }}>{spellInfo.castingTime}</span>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Alcance:</span> <span style={{ color: '#e2e8f0' }}>{spellInfo.range}</span>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Componentes:</span> <span style={{ color: '#e2e8f0' }}>{spellInfo.components}</span>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Duração:</span> <span style={{ color: '#e2e8f0' }}>{spellInfo.duration}</span>
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {spellInfo.description}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Detalhes não encontrados.</div>
                )}
              </div>
            );
          }

          return (
            <span key={s} 
              onClick={() => setExpandedSpell(s)}
              style={{
                background: `${accent}1a`,
                border: `1px solid ${accent}33`,
                borderRadius: '6px',
                color: accent,
                padding: '4px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s, transform 0.1s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}2a`; e.currentTarget.style.borderColor = `${accent}55`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${accent}1a`; e.currentTarget.style.borderColor = `${accent}33`; }}
            >
              {s}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function filterPillStyle(active: boolean) {
  return {
    background: active ? '#991b1b' : 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: active ? '#ffffff' : '#94a3b8',
    padding: '4px 8px',
    fontSize: '0.7rem',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'background 0.2s',
  } as const;
}

function slotButtonStyle(enabled: boolean, background: string, border: string, color: string) {
  return {
    background: enabled ? background : 'rgba(255,255,255,0.03)',
    border: `1px solid ${enabled ? border : '#7f1d1d'}`,
    borderRadius: '4px',
    color: enabled ? color : '#475569',
    padding: '2px 8px',
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    cursor: enabled ? 'pointer' : 'default',
  } as const;
}

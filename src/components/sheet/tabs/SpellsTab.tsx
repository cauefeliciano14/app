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
  onManageSpells: () => void;
  learnedCantrips: string[];
  preparedSpells: string[];
}

const CIRCLE_ORDER = [
  'Truque', '1º Círculo', '2º Círculo', '3º Círculo', '4º Círculo',
  '5º Círculo', '6º Círculo', '7º Círculo', '8º Círculo', '9º Círculo',
];

export function SpellsTab({
  derivedSheet,
  playState,
  onUpdatePlayState,
  onManageSpells,
  learnedCantrips,
  preparedSpells,
}: SpellsTabProps) {
  const [circleFilter, setCircleFilter] = useState<string>('all');

  // Build name → level lookup from spells_all.json
  const spellLevelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const sp of spellsAll as Array<{ name: string; level: string }>) {
      map.set(sp.name, sp.level);
    }
    return map;
  }, []);

  // Group prepared spells by circle
  const groupedPrepared = useMemo(() => {
    const groups: Record<string, string[]> = {};
    for (const name of preparedSpells) {
      const circle = spellLevelMap.get(name) ?? '?';
      if (!groups[circle]) groups[circle] = [];
      groups[circle].push(name);
    }
    return groups;
  }, [preparedSpells, spellLevelMap]);

  // Available circles for filter pills (sorted)
  const availableCircles = useMemo(() => {
    const circles = new Set<string>();
    if (learnedCantrips.length > 0) circles.add('Truque');
    for (const c of Object.keys(groupedPrepared)) circles.add(c);
    return CIRCLE_ORDER.filter(c => circles.has(c));
  }, [learnedCantrips, groupedPrepared]);

  if (!derivedSheet.isCaster) {
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
      {/* Header stats */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        background: 'rgba(17,18,24,0.6)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '12px 14px',
      }}>
        <StatPill label="Atributo" value={ABILITY_LABELS[derivedSheet.spellcastingAbility ?? ''] ?? '—'} />
        <StatPill label="Bônus de Ataque" value={signedMod(derivedSheet.spellAttackBonus ?? 0)} />
        <StatPill label="CD de Resistência" value={String(derivedSheet.spellSaveDC ?? 0)} />
        <StatPill label="Magias Preparadas" value={String(derivedSheet.preparedSpellCount ?? 0)} />
        <StatPill label="Truques" value={String(derivedSheet.cantripsKnown ?? 0)} />
      </div>

      {/* Spell slots */}
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
                  <button
                    onClick={() => handleSpendSlot(level)}
                    disabled={remaining <= 0}
                    style={{
                      background: remaining > 0 ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(248,113,113,0.2)',
                      borderRadius: '5px',
                      color: remaining > 0 ? '#f87171' : '#475569',
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      cursor: remaining > 0 ? 'pointer' : 'default',
                    }}
                  >
                    Gastar
                  </button>
                  <button
                    onClick={() => handleRestoreSlot(level)}
                    disabled={spent <= 0}
                    style={{
                      background: spent > 0 ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(74,222,128,0.2)',
                      borderRadius: '5px',
                      color: spent > 0 ? '#4ade80' : '#475569',
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      cursor: spent > 0 ? 'pointer' : 'default',
                    }}
                  >
                    Restaurar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Circle filter pills */}
      {availableCircles.length > 1 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCircleFilter('all')}
            style={{
              background: circleFilter === 'all' ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${circleFilter === 'all' ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '20px',
              color: circleFilter === 'all' ? '#a78bfa' : '#94a3b8',
              padding: '4px 12px',
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            Todos
          </button>
          {availableCircles.map(c => (
            <button
              key={c}
              onClick={() => setCircleFilter(c)}
              style={{
                background: circleFilter === c ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${circleFilter === c ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '20px',
                color: circleFilter === c ? '#a78bfa' : '#94a3b8',
                padding: '4px 12px',
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Cantrips */}
      {learnedCantrips.length > 0 && (circleFilter === 'all' || circleFilter === 'Truque') && (
        <SpellList title="TRUQUES" spells={learnedCantrips} accent="#fbbf24" />
      )}

      {/* Prepared spells grouped by circle */}
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

      {/* Unknown circle fallback */}
      {groupedPrepared['?'] && (circleFilter === 'all' || circleFilter === '?') && (
        <SpellList title="MAGIAS PREPARADAS" spells={groupedPrepared['?']} accent="#a78bfa" />
      )}

      {learnedCantrips.length === 0 && preparedSpells.length === 0 && (
        <div style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
          Nenhuma magia selecionada.
        </div>
      )}

      {/* Manage button */}
      <button
        onClick={onManageSpells}
        style={{
          background: 'rgba(167,139,250,0.1)',
          border: '1px solid rgba(167,139,250,0.25)',
          borderRadius: '8px',
          color: '#a78bfa',
          padding: '10px',
          fontSize: '0.85rem',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Gerenciar Magias
      </button>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center', minWidth: '80px' }}>
      <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9' }}>{value}</div>
    </div>
  );
}

function SpellList({ title, spells, accent }: { title: string; spells: string[]; accent: string }) {
  return (
    <div style={{
      background: 'rgba(17,18,24,0.6)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {spells.map(s => (
          <span key={s} style={{
            background: `rgba(${accent === '#fbbf24' ? '251,191,36' : '167,139,250'},0.1)`,
            border: `1px solid ${accent}33`,
            borderRadius: '6px',
            color: accent,
            padding: '3px 10px',
            fontSize: '0.8rem',
          }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

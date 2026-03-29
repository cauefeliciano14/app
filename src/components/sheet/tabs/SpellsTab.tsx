import { useMemo, useState } from 'react';
import type { DerivedSheet } from '../../../rules/types/DerivedSheet';
import type { CharacterPlayState } from '../../../types/playState';
import { signedMod } from '../../../utils/format';
import spellsAll from '../../../data/spells/spells_all.json';
import styles from './SpellsTab.module.css';

const ABILITY_LABELS: Record<string, string> = {
  inteligencia: 'Inteligência', sabedoria: 'Sabedoria', carisma: 'Carisma',
  forca: 'Força', destreza: 'Destreza', constituicao: 'Constituição',
};

interface SpellsTabProps {
  derivedSheet: DerivedSheet;
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
  learnedCantrips: string[];
  preparedSpells: string[];
  onUpdatePreparedSpells?: (spells: string[]) => void;
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
  onUpdatePreparedSpells,
}: SpellsTabProps) {
  const [circleFilter, setCircleFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [showAddSpell, setShowAddSpell] = useState(false);
  const [addSearch, setAddSearch] = useState('');

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

  // Search results from full spell list for "add" modal
  const addSearchResults = useMemo(() => {
    if (addSearch.trim().length < 2) return [];
    const q = addSearch.toLowerCase();
    return (spellsAll as any[])
      .filter(sp => sp.name.toLowerCase().includes(q) && !preparedSpells.includes(sp.name))
      .slice(0, 12);
  }, [addSearch, preparedSpells]);

  const handleUnprepare = (spellName: string) => {
    onUpdatePreparedSpells?.(preparedSpells.filter(s => s !== spellName));
  };

  const handleAddSpell = (spellName: string) => {
    if (!preparedSpells.includes(spellName)) {
      onUpdatePreparedSpells?.([...preparedSpells, spellName]);
    }
    setAddSearch('');
  };

  if (!derivedSheet.isCaster && bonusCantrips.length === 0 && bonusPreparedSpells.length === 0) {
    return <div className={styles.emptyText}>Esta classe não conjura magias.</div>;
  }

  const slots = derivedSheet.spellSlots ?? {};
  const slotLevels = Object.keys(slots).map(Number).filter(l => (slots as Record<number, number>)[l] > 0).sort((a, b) => a - b);

  const handleSpendSlot = (level: number) => {
    onUpdatePlayState(prev => ({
      ...prev,
      spentSpellSlots: { ...prev.spentSpellSlots, [level]: (prev.spentSpellSlots[level] ?? 0) + 1 },
    }));
  };

  const handleRestoreSlot = (level: number) => {
    onUpdatePlayState(prev => ({
      ...prev,
      spentSpellSlots: { ...prev.spentSpellSlots, [level]: Math.max(0, (prev.spentSpellSlots[level] ?? 0) - 1) },
    }));
  };

  const canEditSpells = !!onUpdatePreparedSpells;
  const q = searchText.toLowerCase();

  const filterSpells = (spells: string[]) =>
    q ? spells.filter(s => s.toLowerCase().includes(q)) : spells;

  return (
    <div className={styles.container}>
      {/* Spell stats */}
      <div className={styles.statsRow}>
        <StatPill label="ATRIBUTO DE CONJURAÇÃO" value={ABILITY_LABELS[derivedSheet.spellcastingAbility ?? ''] ?? '—'} />
        <StatPill label="CD DE MAGIA" value={String(derivedSheet.spellSaveDC ?? 0)} />
        <StatPill label="BÔNUS DE ATAQUE MÁGICO" value={signedMod(derivedSheet.spellAttackBonus ?? 0)} />
        <StatPill label="MAGIAS PREPARADAS" value={String(derivedSheet.preparedSpellCount ?? 0)} />
        <StatPill label="TRUQUES CONHECIDOS" value={String(derivedSheet.cantripsKnown ?? 0)} />
      </div>

      {/* Spell slots */}
      {slotLevels.length > 0 && (
        <div className={styles.slotsCard}>
          <div className={styles.slotsTitle}>ESPAÇOS DE MAGIA</div>
          <div className={styles.slotsList}>
            {slotLevels.map(level => {
              const total = (slots as Record<number, number>)[level] ?? 0;
              const spent = playState.spentSpellSlots[level] ?? 0;
              const remaining = total - spent;
              return (
                <div key={level} className={styles.slotRow}>
                  <span className={styles.slotLevel}>{level}º círculo</span>
                  <div className={styles.slotDots}>
                    {Array.from({ length: total }, (_, i) => (
                      <div key={i} className={i < remaining ? styles.slotDotFilled : styles.slotDot} />
                    ))}
                  </div>
                  <span className={styles.slotCount}>{remaining}/{total}</span>
                  <button onClick={() => handleSpendSlot(level)} disabled={remaining <= 0} className={styles.slotSpendBtn}>Gastar</button>
                  <button onClick={() => handleRestoreSlot(level)} disabled={spent <= 0} className={styles.slotRestoreBtn}>Restaurar</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Concentration banner */}
      {playState.concentratingOn && (
        <div className={styles.concentrationBanner}>
          <span className={styles.concentrationIcon}>◉</span>
          <span className={styles.concentrationText}>
            Concentrando em: <strong>{playState.concentratingOn}</strong>
          </span>
          <button
            className={styles.concentrationEndBtn}
            onClick={() => onUpdatePlayState(prev => ({ ...prev, concentratingOn: null }))}
          >
            Encerrar
          </button>
        </div>
      )}

      {/* Search bar */}
      <div className={styles.searchRow}>
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Buscar magia…"
          className={styles.searchInput}
        />
        {canEditSpells && (
          <button onClick={() => setShowAddSpell(v => !v)} className={styles.addSpellBtn}>
            {showAddSpell ? '✕ Fechar' : '＋ Adicionar Magia'}
          </button>
        )}
      </div>

      {/* Add spell search */}
      {showAddSpell && (
        <div className={styles.addSpellPanel}>
          <input
            type="text"
            value={addSearch}
            onChange={e => setAddSearch(e.target.value)}
            placeholder="Buscar na lista completa de magias…"
            className={styles.searchInput}
            autoFocus
          />
          {addSearchResults.length > 0 && (
            <div className={styles.addSpellResults}>
              {addSearchResults.map((sp: any) => (
                <div key={sp.name} className={styles.addSpellResult} onClick={() => handleAddSpell(sp.name)}>
                  <span className={styles.addSpellName}>{sp.name}</span>
                  <span className={styles.addSpellMeta}>{sp.level} · {sp.school}</span>
                </div>
              ))}
            </div>
          )}
          {addSearch.length >= 2 && addSearchResults.length === 0 && (
            <div className={styles.emptyText}>Nenhuma magia encontrada.</div>
          )}
        </div>
      )}

      {/* Circle filter */}
      {availableCircles.length > 1 && !q && (
        <div className={styles.filterBar}>
          <button onClick={() => setCircleFilter('all')} className={circleFilter === 'all' ? styles.filterBtnActive : styles.filterBtn}>Todos</button>
          {availableCircles.map(c => (
            <button key={c} onClick={() => setCircleFilter(c)} className={circleFilter === c ? styles.filterBtnActive : styles.filterBtn}>{c}</button>
          ))}
        </div>
      )}

      {/* Spell lists */}
      {learnedCantrips.length > 0 && (circleFilter === 'all' || circleFilter === 'Truque') && filterSpells(learnedCantrips).length > 0 && (
        <SpellList title="TRUQUES" spells={filterSpells(learnedCantrips)} accent="#fbbf24" />
      )}
      {racialCantrips.length > 0 && (circleFilter === 'all' || circleFilter === 'Truque') && filterSpells(racialCantrips).length > 0 && (
        <SpellList title="TRUQUES RACIAIS" spells={filterSpells(racialCantrips)} accent="#22c55e" badge="Racial" />
      )}
      {bonusCantrips.filter(s => s.source === 'talent').length > 0 && (circleFilter === 'all' || circleFilter === 'Truque') && (
        <SpellList
          title="TRUQUES DE TALENTO"
          spells={filterSpells(bonusCantrips.filter(s => s.source === 'talent').map(s => `${s.name} — ${s.origin}`))}
          accent="#38bdf8" badge="Talento"
          concentratingOn={playState.concentratingOn}
          onSetConcentration={name => onUpdatePlayState(prev => ({ ...prev, concentratingOn: name }))}
        />
      )}

      {CIRCLE_ORDER.filter(c => c !== 'Truque' && groupedPrepared[c]).map(circle => {
        if (!q && circleFilter !== 'all' && circleFilter !== circle) return null;
        const filtered = filterSpells(groupedPrepared[circle]);
        if (filtered.length === 0) return null;
        return (
          <SpellList
            key={circle}
            title={circle.toUpperCase()}
            spells={filtered}
            accent="#a78bfa"
            canRemove={canEditSpells}
            onRemove={handleUnprepare}
            concentratingOn={playState.concentratingOn}
            onSetConcentration={name => onUpdatePlayState(prev => ({ ...prev, concentratingOn: name }))}
          />
        );
      })}

      {groupedPrepared['?'] && (circleFilter === 'all' || circleFilter === '?') && filterSpells(groupedPrepared['?']).length > 0 && (
        <SpellList
          title="MAGIAS PREPARADAS"
          spells={filterSpells(groupedPrepared['?'])}
          accent="#a78bfa"
          canRemove={canEditSpells}
          onRemove={handleUnprepare}
          concentratingOn={playState.concentratingOn}
          onSetConcentration={name => onUpdatePlayState(prev => ({ ...prev, concentratingOn: name }))}
        />
      )}

      {bonusPreparedSpells.length > 0 && (circleFilter === 'all' || circleFilter === '1º Círculo') && (
        <SpellList
          title="MAGIAS EXTRA"
          subtitle="Preparadas por traços raciais ou talentos."
          spells={filterSpells(bonusPreparedSpells.map(s => `${s.name} — ${s.origin}`))}
          accent="#34d399" badge="Extra"
          concentratingOn={playState.concentratingOn}
          onSetConcentration={name => onUpdatePlayState(prev => ({ ...prev, concentratingOn: name }))}
        />
      )}

      {learnedCantrips.length === 0 && bonusCantrips.length === 0 && preparedSpells.length === 0 && bonusPreparedSpells.length === 0 && !showAddSpell && (
        <div className={styles.emptySpells}>Nenhuma magia selecionada.</div>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statPill}>
      <div className={styles.statPillLabel}>{label}</div>
      <div className={styles.statPillValue}>{value}</div>
    </div>
  );
}

function SpellList({
  title, subtitle, spells, accent, badge, canRemove, onRemove,
  concentratingOn, onSetConcentration,
}: {
  title: string; subtitle?: string; spells: string[]; accent: string;
  badge?: string; canRemove?: boolean; onRemove?: (name: string) => void;
  concentratingOn?: string | null; onSetConcentration?: (name: string | null) => void;
}) {
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  const getSpellTags = (spellName: string) => {
    const info = (spellsAll as any[]).find(sp => sp.name === spellName);
    if (!info) return { isRitual: false, isConcentration: false };
    return {
      isRitual: typeof info.castingTime === 'string' && info.castingTime.toLowerCase().includes('ritual'),
      isConcentration: typeof info.duration === 'string' && info.duration.toLowerCase().includes('concentra'),
    };
  };

  return (
    <div className={styles.spellSection} style={{ '--accent': accent } as React.CSSProperties}>
      <div className={styles.spellSectionHeader} style={{ marginBottom: subtitle ? '4px' : '8px' }}>
        <div className={styles.spellSectionTitle}>{title}</div>
        {badge && (
          <span className={styles.spellBadge} style={{ background: `${accent}1a`, border: `1px solid ${accent}33`, color: accent }}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <div className={styles.spellSectionSubtitle}>{subtitle}</div>}
      <div className={styles.spellGrid}>
        {spells.map(s => {
          const rawName = s.split(' — ')[0].trim();
          const isExpanded = expandedSpell === s;

          if (isExpanded) {
            const spellInfo = (spellsAll as any[]).find(sp => sp.name === rawName);
            return (
              <div key={`exp-${s}`} className={styles.spellExpanded} style={{ border: `1px solid ${accent}40` }}>
                <div className={styles.spellExpandedHeader}>
                  <div>
                    <div className={styles.spellExpandedName} style={{ color: accent }}>{s}</div>
                    {spellInfo && (
                      <div className={styles.spellExpandedMeta}>
                        {spellInfo.level === 'Truque' ? `Truque de ${spellInfo.school}` : `${spellInfo.level}, ${spellInfo.school}`}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {(() => {
                      const spellInfoHere = (spellsAll as any[]).find(sp => sp.name === rawName);
                      const isConc = typeof spellInfoHere?.duration === 'string' && spellInfoHere.duration.toLowerCase().includes('concentra');
                      if (!isConc || !onSetConcentration) return null;
                      const isActive = concentratingOn === rawName;
                      return (
                        <button
                          onClick={e => { e.stopPropagation(); onSetConcentration(isActive ? null : rawName); }}
                          className={isActive ? styles.concentratingActiveBtn : styles.concentratingBtn}
                          title={isActive ? 'Encerrar concentração' : 'Iniciar concentração nesta magia'}
                        >
                          {isActive ? '◉ Concentrando' : '◎ Concentrar'}
                        </button>
                      );
                    })()}
                    {canRemove && onRemove && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(rawName); }}
                        className={styles.unprepareBtn}
                        title="Remover da lista de preparadas"
                      >
                        Remover
                      </button>
                    )}
                    <button onClick={() => setExpandedSpell(null)} className={styles.collapseBtn}>Recolher ▲</button>
                  </div>
                </div>
                {spellInfo ? (
                  <>
                    <div className={styles.spellTags}>
                      {typeof spellInfo.castingTime === 'string' && spellInfo.castingTime.toLowerCase().includes('ritual') && (
                        <span className={styles.tagRitual}>Ritual</span>
                      )}
                      {typeof spellInfo.duration === 'string' && spellInfo.duration.toLowerCase().includes('concentra') && (
                        <span className={styles.tagConcentration}>Concentração</span>
                      )}
                    </div>
                    <div className={styles.spellDetails}>
                      <span className={styles.spellDetailLabel}>Conjuração:</span>
                      <span className={styles.spellDetailValue}>{spellInfo.castingTime}</span>
                      <span className={styles.spellDetailLabel}>Alcance:</span>
                      <span className={styles.spellDetailValue}>{spellInfo.range}</span>
                      <span className={styles.spellDetailLabel}>Componentes:</span>
                      <span className={styles.spellDetailValue}>{spellInfo.components}</span>
                      <span className={styles.spellDetailLabel}>Duração:</span>
                      <span className={styles.spellDetailValue}>{spellInfo.duration}</span>
                    </div>
                    <div className={styles.spellDescription}>{spellInfo.description}</div>
                  </>
                ) : (
                  <div className={styles.spellNotFound}>Detalhes não encontrados.</div>
                )}
              </div>
            );
          }

          return (
            <span key={s} onClick={() => setExpandedSpell(s)} className={styles.spellPill}
              style={{ background: `${accent}1a`, border: `1px solid ${accent}33`, color: accent }}>
              {s}
              {(() => {
                const tags = getSpellTags(rawName);
                return (
                  <>
                    {tags.isRitual && <span className={styles.tagRitualSmall} title="Ritual">R</span>}
                    {tags.isConcentration && <span className={styles.tagConcentrationSmall} title="Concentração">C</span>}
                  </>
                );
              })()}
            </span>
          );
        })}
      </div>
    </div>
  );
}

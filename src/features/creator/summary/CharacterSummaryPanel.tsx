import { useMemo, useState } from 'react';
import { useCharacter } from '../../../context/CharacterContext';
import patterns from '../../../styles/panelPatterns.module.css';
import styles from './CharacterSummaryPanel.module.css';

const ATTRS = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'] as const;
const LABELS: Record<(typeof ATTRS)[number], string> = {
  forca: 'FOR',
  destreza: 'DES',
  constituicao: 'CON',
  inteligencia: 'INT',
  sabedoria: 'SAB',
  carisma: 'CAR',
};

const LIST_PREVIEW_COUNT = 3;
const ISSUE_PREVIEW_COUNT = 3;

export function CharacterSummaryPanel() {
  const { character, selectedBackground, derivedSheet, validationResult, characterLevel } = useCharacter();
  const mainPendencies = validationResult.errors.slice(0, 5);
  const identityLine = [character.characterClass?.name, selectedBackground?.name, character.species?.name].filter(Boolean).join(' • ');

  const quickFacts = useMemo(
    () => [
      { label: 'Nível', value: String(characterLevel ?? derivedSheet.level ?? 1) },
      { label: 'CA', value: String(derivedSheet.armorClass) },
      { label: 'PV', value: String(derivedSheet.maxHP) },
      { label: 'Desloc.', value: derivedSheet.speed || '—' },
    ],
    [characterLevel, derivedSheet.armorClass, derivedSheet.level, derivedSheet.maxHP, derivedSheet.speed],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
            Resumo persistente
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className={`profile-placeholder ${character.portrait ? 'has-image' : ''}`} style={{ width: '54px', height: '54px', minWidth: '54px' }}>
              {character.portrait ? <img src={`/imgs/portrait_caracter/${character.portrait}`} alt={character.name || 'Retrato'} className="profile-image" /> : null}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{character.name || 'Sem nome'}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.4 }}>{identityLine || 'Sem identidade principal definida'}</div>
    <div className={patterns.stackSm}>
      <div className={patterns.stackSm}>
        <div className={patterns.sectionTitle}>Resumo persistente</div>
        <div className={styles.header}>
          <div className={`profile-placeholder ${character.portrait ? 'has-image' : ''} ${styles.portrait}`.trim()}>
            {character.portrait ? <img src={`/imgs/portrait_caracter/${character.portrait}`} alt={character.name || 'Retrato'} className="profile-image" /> : null}
          </div>
          <div>
            <div className={styles.name}>{character.name || 'Sem nome'}</div>
            <div className={styles.subtitle}>
              {character.characterClass?.name ?? 'Sem classe'} • {selectedBackground?.name ?? 'Sem origem'} • {character.species?.name ?? 'Sem espécie'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          {quickFacts.map((fact) => (
            <SummaryPill key={fact.label} label={fact.label} value={fact.value} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0, maxHeight: '100%', overflowY: 'auto', paddingRight: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
            {ATTRS.map((attr) => (
              <div key={attr} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.64rem', letterSpacing: '0.08em' }}>{LABELS[attr]}</div>
                <div style={{ color: '#fff', fontWeight: 700 }}>{derivedSheet.finalAttributes[attr] ?? 0}</div>
              </div>
            ))}
      <div className={patterns.responsiveGrid3}>
        {ATTRS.map((attr) => (
          <div key={attr} className={styles.statCard}>
            <div className={styles.statLabel}>{LABELS[attr]}</div>
            <div className={styles.statValue}>{derivedSheet.finalAttributes[attr] ?? 0}</div>
          </div>

          <SummaryIssues items={mainPendencies} />
          <SummaryList title="Idiomas" items={derivedSheet.languages} empty="Nenhum idioma extra." defaultOpen={false} previewCount={LIST_PREVIEW_COUNT} />
          <SummaryList title="Perícias" items={derivedSheet.skillProficiencies} empty="Nenhuma perícia definida." defaultOpen={false} previewCount={LIST_PREVIEW_COUNT} />
        </div>
      <div className={patterns.responsiveGrid2}>
        <SummaryPill label="CA" value={String(derivedSheet.armorClass)} />
        <SummaryPill label="PV" value={String(derivedSheet.maxHP)} />
      </div>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.summaryPillCard}>
      <div className={styles.pillLabel}>{label}</div>
      <div className={styles.pillValue}>{value}</div>
    </div>
  );
}

function SummaryList({
  title,
  items,
  empty,
  defaultOpen = true,
  previewCount = LIST_PREVIEW_COUNT,
}: {
  title: string;
  items: string[];
  empty: string;
  defaultOpen?: boolean;
  previewCount?: number;
}) {
  const visibleItems = items.slice(0, previewCount);
  const hiddenItems = items.slice(previewCount);
  const hiddenCount = hiddenItems.length;
  const shouldExpand = hiddenCount > 0;
  const [isExpanded, setIsExpanded] = useState(defaultOpen && shouldExpand);

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 12px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: items.length === 0 ? 0 : '10px' }}>
        <span style={{ color: '#f8fafc', fontWeight: 700 }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {hiddenCount > 0 ? (
            <span style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: '999px', padding: '2px 8px', color: '#cbd5e1', fontSize: '0.72rem', fontWeight: 700 }}>
              +{hiddenCount}
            </span>
          ) : null}
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{items.length}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{empty}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {visibleItems.map((item) => (
              <span key={item} style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.22)', borderRadius: '999px', padding: '4px 8px', fontSize: '0.75rem', color: '#fed7aa' }}>
    <details open={defaultOpen} className={patterns.panelCardCompact}>
      <summary className={styles.detailsSummary}>
        <span className={styles.detailsTitle}>{title}</span>
        <span className={styles.detailsCount}>{items.length}</span>
      </summary>
      <div className={styles.detailsBody}>
        {items.length === 0 ? (
          <div className={styles.emptyText}>{empty}</div>
        ) : (
          <div className={patterns.wrapRow}>
            {items.map((item) => (
              <span key={item} className={`${patterns.pill} ${patterns.pillAccent}`.trim()}>
                {item}
              </span>
            ))}
            {!isExpanded && hiddenCount > 0 ? (
              <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: '999px', padding: '4px 8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                +{hiddenCount}
              </span>
            ) : null}
          </div>

          {isExpanded ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {hiddenItems.map((item) => (
                <span key={item} style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: '999px', padding: '4px 8px', fontSize: '0.75rem', color: '#e2e8f0' }}>
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          {shouldExpand ? (
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              style={{
                alignSelf: 'flex-start',
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: '#94a3b8',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              {isExpanded ? 'Mostrar menos' : 'Expandir lista'}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SummaryIssues({ items }: { items: string[] }) {
  const visibleItems = items.slice(0, ISSUE_PREVIEW_COUNT);
  const hiddenCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <details open style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#f8fafc', fontWeight: 700 }}>Pendências principais</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {hiddenCount > 0 ? (
            <span style={{ background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.18)', borderRadius: '999px', padding: '2px 8px', color: '#fdba74', fontSize: '0.72rem', fontWeight: 700 }}>
              +{hiddenCount}
            </span>
          ) : null}
          <span style={{ color: items.length === 0 ? '#4ade80' : '#fb923c', fontSize: '0.75rem', fontWeight: 700 }}>
            {items.length === 0 ? 'OK' : items.length}
          </span>
        </div>
    <details open className={patterns.panelCardCompact}>
      <summary className={styles.detailsSummary}>
        <span className={styles.detailsTitle}>Pendências principais</span>
        <span className={`${patterns.pill} ${styles.detailsCount} ${items.length === 0 ? patterns.pillSuccess : patterns.pillAccent}`.trim()}>
          {items.length === 0 ? 'OK' : items.length}
        </span>
      </summary>
      <div className={styles.detailsBody}>
        {items.length === 0 ? (
          <div className={styles.issueOk}>Personagem pronto para a ficha final.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.5 }}>
              {visibleItems.map((error) => <li key={error}>{error}</li>)}
            </ul>
            {hiddenCount > 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.76rem' }}>
                +{hiddenCount} pendência(s) adicional(is) mantidas condensadas para reduzir ruído visual.
              </div>
            ) : null}
          </div>
          <ul className={styles.issueList}>
            {items.map((error) => <li key={error}>{error}</li>)}
          </ul>
        )}
      </div>
    </details>
  );
}

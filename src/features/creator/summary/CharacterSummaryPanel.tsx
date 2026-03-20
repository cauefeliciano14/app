import { useMemo } from 'react';
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

export function CharacterSummaryPanel() {
  const { derivedSheet, validationResult, characterLevel } = useCharacter();
  const mainPendencies = validationResult.errors.slice(0, 5);

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
    <div className={patterns.stackSm}>
      <div className={patterns.sectionTitle}>Resumo persistente</div>

      <div className={patterns.responsiveGrid2}>
        {quickFacts.map((fact) => (
          <SummaryPill key={fact.label} label={fact.label} value={fact.value} />
        ))}
      </div>

      <div className={patterns.responsiveGrid3}>
        {ATTRS.map((attr) => (
          <div key={attr} className={styles.statCard}>
            <div className={styles.statLabel}>{LABELS[attr]}</div>
            <div className={styles.statValue}>{derivedSheet.finalAttributes[attr] ?? 0}</div>
          </div>
        ))}
      </div>

      <SummaryIssues items={mainPendencies} />
      <SummaryList title="Idiomas" items={derivedSheet.languages} empty="Nenhum idioma extra." />
      <SummaryList title="Perícias" items={derivedSheet.skillProficiencies} empty="Nenhuma perícia definida." />
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

function SummaryList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <details open className={patterns.panelCardCompact}>
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
          </div>
        )}
      </div>
    </details>
  );
}

function SummaryIssues({ items }: { items: string[] }) {
  return (
    <details open className={patterns.panelCardCompact}>
      <summary className={styles.detailsSummary}>
        <span className={styles.detailsTitle}>Pendências principais</span>
        <span className={`${patterns.pill} ${items.length === 0 ? patterns.pillSuccess : patterns.pillAccent}`.trim()}>
          {items.length === 0 ? 'OK' : items.length}
        </span>
      </summary>
      <div className={styles.detailsBody}>
        {items.length === 0 ? (
          <div className={styles.issueOk}>Personagem pronto para a ficha final.</div>
        ) : (
          <ul className={styles.issueList}>
            {items.map((error) => <li key={error}>{error}</li>)}
          </ul>
        )}
      </div>
    </details>
  );
}

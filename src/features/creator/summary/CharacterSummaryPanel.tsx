import { useMemo } from 'react';
import { useCharacter } from '../../../context/CharacterContext';
import { ContextualPopover } from '../../../components/ui/ContextualPopover';
import { getLanguageDisplayNames } from '../../../utils/languagePresentation';
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

  const displayLanguages = useMemo(() => getLanguageDisplayNames(derivedSheet.languages), [derivedSheet.languages]);

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
      <div className={styles.titleRow}>
        <div className={patterns.sectionTitle}>Resumo persistente</div>
        <ContextualPopover label="Seleção" title="Ajuda rápida" variant="chip" align="right">
          <ul className={styles.popoverList}>
            <li>Clique no retrato no cabeçalho para abrir o seletor visual.</li>
            <li>As escolhas principais continuam salvas mesmo quando você navega entre etapas.</li>
            <li>Use os atalhos abaixo só quando precisar revisar pendências, idiomas ou perícias.</li>
          </ul>
        </ContextualPopover>
      </div>

      <div className={styles.header}>
        <div className={`profile-placeholder ${character.portrait ? 'has-image' : ''} ${styles.portrait}`.trim()}>
          {character.portrait ? (
            <img
              src={`/imgs/portrait_caracter/${character.portrait}`}
              alt={character.name ? `Retrato de ${character.name}` : 'Retrato do personagem'}
              className="profile-image"
            />
          ) : null}
        </div>
        <div>
          <div className={styles.name}>{character.name || 'Sem nome'}</div>
          <div className={styles.subtitle}>{identityLine || 'Sem identidade principal definida'}</div>
        </div>
      </div>

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

      <div className={styles.contextActions}>
        <SummaryContextChip
          label="Pendências"
          count={mainPendencies.length === 0 ? 'OK' : String(mainPendencies.length)}
          tone={mainPendencies.length === 0 ? 'success' : 'accent'}
        >
          {mainPendencies.length === 0 ? (
            <div className={styles.issueOk}>Personagem pronto para a ficha final.</div>
          ) : (
            <ul className={styles.popoverList}>
              {mainPendencies.map((error) => <li key={error}>{error}</li>)}
            </ul>
          )}
        </SummaryContextChip>

        <SummaryContextChip label="Idiomas" count={String(derivedSheet.languages.length)}>
          {derivedSheet.languages.length === 0 ? (
            <div className={styles.emptyText}>Nenhum idioma extra.</div>
          ) : (
            <div className={patterns.wrapRow}>
              {derivedSheet.languages.map((item) => (
                <span key={item} className={`${patterns.pill} ${patterns.pillAccent}`.trim()}>
                  {item}
                </span>
              ))}
            </div>
          )}
        </SummaryContextChip>

        <SummaryContextChip label="Perícias" count={String(derivedSheet.skillProficiencies.length)}>
          {derivedSheet.skillProficiencies.length === 0 ? (
            <div className={styles.emptyText}>Nenhuma perícia definida.</div>
          ) : (
            <div className={patterns.wrapRow}>
              {derivedSheet.skillProficiencies.map((item) => (
                <span key={item} className={`${patterns.pill} ${patterns.pillAccent}`.trim()}>
                  {item}
                </span>
              ))}
            </div>
          )}
        </SummaryContextChip>
      </div>
      <SummaryIssues items={mainPendencies} />
      <SummaryList title="Idiomas" items={displayLanguages} empty="Nenhum idioma extra." />
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

function SummaryContextChip({
  label,
  count,
  children,
  tone = 'default',
}: {
  label: string;
  count: string;
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'success';
}) {
  return (
    <div className={styles.contextChipCard}>
      <div className={styles.contextChipHeader}>
        <span className={styles.contextChipLabel}>{label}</span>
        <span className={`${styles.contextChipCount} ${styles[`tone${tone[0].toUpperCase()}${tone.slice(1)}`]}`.trim()}>{count}</span>
      </div>
      <ContextualPopover label="Ver" title={label} variant="chip" align="right">
        {children}
      </ContextualPopover>
    </div>
  );
}

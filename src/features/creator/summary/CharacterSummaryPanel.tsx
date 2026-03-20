import { useCharacter } from '../../../context/CharacterContext';
import patterns from '../../../styles/panelPatterns.module.css';
import styles from './CharacterSummaryPanel.module.css';

export function CharacterSummaryPanel() {
  const { character, selectedBackground, derivedSheet, characterLevel } = useCharacter();
  const identityLine = [character.characterClass?.name, selectedBackground?.name, character.species?.name]
    .filter(Boolean)
    .join(' • ');

  const quickFacts = [
    { label: 'Nível', value: String(characterLevel ?? derivedSheet.level ?? 1) },
    { label: 'CA', value: String(derivedSheet.armorClass) },
    { label: 'PV', value: String(derivedSheet.maxHP) },
  ];

  return (
    <div className={patterns.stackSm}>
      <div className={patterns.sectionTitle}>Resumo persistente</div>

      <div className={styles.header}>
        <div className={`profile-placeholder ${character.portrait ? 'has-image' : ''} ${styles.portrait}`.trim()}>
          {character.portrait ? (
            <img
              src={`/imgs/portrait_caracter/${character.portrait}`}
              alt={character.name || 'Retrato'}
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

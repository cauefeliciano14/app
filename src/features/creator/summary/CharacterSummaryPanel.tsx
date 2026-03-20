import { useMemo } from 'react';
import { useCharacter } from '../../../context/CharacterContext';
import styles from './CharacterSummaryPanel.module.css';

export function CharacterSummaryPanel() {
  const { character, selectedBackground, derivedSheet, characterLevel } = useCharacter();

  const identityItems = useMemo(
    () => [
      { label: 'Nome', value: character.name || 'Sem nome' },
      { label: 'Classe', value: character.characterClass?.name || 'Não definida' },
      { label: 'Origem', value: selectedBackground?.name || 'Não definida' },
      { label: 'Espécie', value: character.species?.name || 'Não definida' },
    ],
    [character.characterClass?.name, character.name, character.species?.name, selectedBackground?.name],
  );

  const quickFacts = [
    { label: 'Nível', value: String(characterLevel ?? derivedSheet.level ?? 1) },
    { label: 'CA', value: String(derivedSheet.armorClass) },
    { label: 'PV', value: String(derivedSheet.maxHP) },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.sectionTitle}>Resumo persistente</div>

      <div className={styles.identityCard}>
        <div className={styles.identityTitle}>Identidade resumida</div>
        <dl className={styles.identityList}>
          {identityItems.map((item) => (
            <div key={item.label} className={styles.identityRow}>
              <dt className={styles.identityLabel}>{item.label}</dt>
              <dd className={styles.identityValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className={styles.quickFactsGrid}>
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

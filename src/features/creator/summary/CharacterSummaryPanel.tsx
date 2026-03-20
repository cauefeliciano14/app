import { useMemo } from 'react';
import { useCharacter } from '../../../context/CharacterContext';
import { HelpTooltip } from '../../../components/ui/HelpTooltip';
import { getLanguageDisplayNames } from '../../../utils/languagePresentation';
import styles from './CharacterSummaryPanel.module.css';

const STEP_LABELS: Record<string, string> = {
  class: 'Classe',
  background: 'Origem',
  species: 'Espécie',
  attributes: 'Atributos',
  equipment: 'Equipamento',
};

export function CharacterSummaryPanel() {
  const { character, selectedBackground, derivedSheet, characterLevel, validationResult } = useCharacter();

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

  const coreStats = useMemo(
    () => [
      ['FOR', derivedSheet.finalAttributes.forca],
      ['DES', derivedSheet.finalAttributes.destreza],
      ['CON', derivedSheet.finalAttributes.constituicao],
      ['INT', derivedSheet.finalAttributes.inteligencia],
      ['SAB', derivedSheet.finalAttributes.sabedoria],
      ['CAR', derivedSheet.finalAttributes.carisma],
    ],
    [derivedSheet.finalAttributes],
  );

  const presentedLanguages = useMemo(() => getLanguageDisplayNames(derivedSheet.languages), [derivedSheet.languages]);
  const keySkills = useMemo(() => derivedSheet.skillProficiencies.slice(0, 6), [derivedSheet.skillProficiencies]);

  const pendingItems = useMemo(
    () => Object.entries(validationResult.byStep)
      .filter(([_, issues]) => issues.length > 0)
      .map(([key, issues]) => ({
        key,
        label: STEP_LABELS[key] ?? key,
        count: Array.from(new Set(issues)).length,
      })),
    [validationResult.byStep],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <div className={styles.sectionTitle}>Resumo persistente</div>
      </div>

      <div className={styles.identityCard}>
        <div className={styles.cardHeader}>
          <div className={styles.identityTitle}>Identidade resumida</div>
          {character.characterClass?.description ? (
            <HelpTooltip label="Resumo da classe" title={character.characterClass.name} variant="chip" align="right">
              {character.characterClass.description}
            </HelpTooltip>
          ) : null}
        </div>

        {character.portrait ? <img src={character.portrait} alt="Retrato atual do personagem" className={styles.portraitPreview} /> : null}

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
        {quickFacts.map((fact) => <SummaryPill key={fact.label} label={fact.label} value={fact.value} />)}
      </div>

      <div className={styles.identityCard}>
        <div className={styles.cardHeader}>
          <div className={styles.identityTitle}>Atributos finais</div>
          <HelpTooltip label="Impacto em tempo real" title="Atualização imediata" align="right">
            Sempre mostramos os atributos finais após bônus de origem e quaisquer efeitos já refletidos pelo engine.
          </HelpTooltip>
        </div>
        <div className={styles.quickFactsGrid}>
          {coreStats.map(([label, value]) => <SummaryPill key={label} label={String(label)} value={String(value)} />)}
        </div>
      </div>

      <div className={styles.identityCard}>
        <div className={styles.cardHeader}>
          <div className={styles.identityTitle}>Perícias e idiomas</div>
        </div>

        {keySkills.length > 0 ? (
          <ul className={styles.tagList}>
            {keySkills.map((skill) => <li key={skill} className={styles.tagItem}>{skill}</li>)}
          </ul>
        ) : (
          <p className={styles.emptyState}>Nenhuma perícia consolidada ainda.</p>
        )}

        <div className={styles.supportRow}>
          <div>
            <div className={styles.identityTitle}>Idiomas conhecidos</div>
            <p className={styles.supportingText}>Os nomes exibidos já estão localizados para leitura rápida.</p>
          </div>
        </div>

        {presentedLanguages.length > 0 ? (
          <ul className={styles.tagList}>
            {presentedLanguages.map((language) => <li key={language} className={styles.tagItem}>{language}</li>)}
          </ul>
        ) : (
          <p className={styles.emptyState}>Nenhum idioma adicional selecionado.</p>
        )}
      </div>

      <div className={styles.identityCard}>
        <div className={styles.cardHeader}>
          <div className={styles.identityTitle}>Pendências principais</div>
        </div>

        {pendingItems.length > 0 ? (
          <div className={styles.tagList}>
            {pendingItems.map((item) => (
              <span key={item.key} className={styles.tagItem}>
                {item.label} · {item.count}
              </span>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Nenhuma pendência aberta no momento.</p>
        )}
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

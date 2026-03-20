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

  const presentedLanguages = useMemo(
    () => getLanguageDisplayNames(derivedSheet.languages),
    [derivedSheet.languages],
  );

  const pendingItems = useMemo(
    () => Object.entries(validationResult.byStep)
      .filter(([_, issues]) => issues.length > 0)
      .map(([key, issues]) => ({
        key,
        label: STEP_LABELS[key] ?? key,
        count: issues.length,
        sample: issues[0],
      })),
    [validationResult.byStep],
  );

  const classSummary = character.characterClass?.description ?? 'Selecione uma classe para exibir um resumo curto aqui.';
  const portraitSummary = character.portrait
    ? 'O retrato atual é apenas visual e pode ser trocado a qualquer momento pela miniatura do cabeçalho.'
    : 'Escolha um retrato quando quiser definir a identidade visual do personagem. Isso não altera regras nem escolhas mecânicas.';

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <div className={styles.sectionTitle}>Resumo persistente</div>
        <HelpTooltip label="O que fica fixo" title="Somente o essencial" align="right">
          Este painel mantém apenas identidade e números rápidos. Explicações de impacto imediato, pendências detalhadas e ajuda auxiliar agora aparecem sob demanda.
        </HelpTooltip>
      </div>

      <div className={styles.identityCard}>
        <div className={styles.cardHeader}>
          <div className={styles.identityTitle}>Identidade resumida</div>
          <div className={styles.headerActions}>
            <HelpTooltip label="Resumo da classe" title={character.characterClass?.name ?? 'Classe não definida'} variant="chip" align="right">
              {classSummary}
            </HelpTooltip>
            <HelpTooltip label="Retrato" title="Ajuda sobre retrato" variant="chip" align="right">
              {portraitSummary}
            </HelpTooltip>
          </div>
        </div>

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

      <div className={styles.identityCard}>
        <div className={styles.cardHeader}>
          <div className={styles.identityTitle}>Pendências e apoio contextual</div>
          <HelpTooltip label="Pendências" title="Como ler esta área" align="right">
            Mostramos apenas a contagem de pendências em aberto. Abra o tooltip de cada item para ver o primeiro alerta e use a navegação lateral para ir direto à etapa correspondente.
          </HelpTooltip>
        </div>

        {pendingItems.length > 0 ? (
          <div className={styles.tagList}>
            {pendingItems.map((item) => (
              <HelpTooltip key={item.key} label={`${item.label} · ${item.count}`} title={`Pendências em ${item.label}`} variant="chip" align="right">
                {item.sample}
              </HelpTooltip>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Nenhuma pendência aberta no momento.</p>
        )}

        <div className={styles.supportRow}>
          <div>
            <div className={styles.identityTitle}>Idiomas conhecidos</div>
            <p className={styles.supportingText}>Os nomes exibidos já estão localizados para leitura rápida.</p>
          </div>
          <HelpTooltip label="Idiomas" title="Como interpretar" align="right">
            O motor mantém IDs internos para validação. Aqui você vê os nomes prontos para leitura; se não houver itens, ainda não existe idioma adicional selecionado.
          </HelpTooltip>
        </div>

        {presentedLanguages.length > 0 ? (
          <ul className={styles.tagList}>
            {presentedLanguages.map((language) => (
              <li key={language} className={styles.tagItem}>
                {language}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>Nenhum idioma adicional selecionado.</p>
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

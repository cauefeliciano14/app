import { useMemo, useRef, useEffect, useState } from 'react';
import { useCharacter } from '../../../context/CharacterContext';
import { useWizard } from '../../../context/WizardContext';
import { getLanguageDisplayNames } from '../../../utils/languagePresentation';
import styles from './CharacterSummaryPanel.module.css';

const STEP_LABELS: Record<string, string> = {
  class: 'Classe',
  background: 'Origem',
  species: 'Espécie',
  attributes: 'Atributos',
  equipment: 'Equipamento',
};

const STEP_INDEX: Record<string, number> = {
  class: 0,
  background: 1,
  species: 2,
  attributes: 3,
  equipment: 4,
};

export function CharacterSummaryPanel() {
  const { character, selectedBackground, derivedSheet, characterLevel, validationResult } = useCharacter();
  const { setCurrentStep } = useWizard();

  // ── Reactive flash detection ───────────────────────────────────────────────
  const prevDerivedRef = useRef<typeof derivedSheet | null>(null);
  const prevClassIdRef = useRef<string | undefined>(undefined);
  const [flashedSections, setFlashedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const prev = prevDerivedRef.current;
    const currClassId = character.characterClass?.id;

    if (prev === null) {
      prevDerivedRef.current = derivedSheet;
      prevClassIdRef.current = currClassId;
      return;
    }

    const changed = new Set<string>();
    if (prev.maxHP !== derivedSheet.maxHP) changed.add('hp');
    if (prev.armorClass !== derivedSheet.armorClass) changed.add('ca');
    if (JSON.stringify(prev.finalAttributes) !== JSON.stringify(derivedSheet.finalAttributes)) {
      changed.add('attributes');
    }
    if (JSON.stringify(prev.skillProficiencies) !== JSON.stringify(derivedSheet.skillProficiencies)) {
      changed.add('skills');
    }
    if (JSON.stringify(prev.languages) !== JSON.stringify(derivedSheet.languages)) {
      changed.add('languages');
    }
    if (prevClassIdRef.current !== currClassId) changed.add('identity');

    prevDerivedRef.current = derivedSheet;
    prevClassIdRef.current = currClassId;

    if (changed.size === 0) return;

    setFlashedSections(changed);
    const t = setTimeout(() => setFlashedSections(new Set()), 1500);
    return () => clearTimeout(t);
  }, [derivedSheet, character.characterClass?.id]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const quickFacts = [
    { label: 'Nível', value: String(characterLevel ?? derivedSheet.level ?? 1), flash: false },
    { label: 'CA', value: String(derivedSheet.armorClass), flash: flashedSections.has('ca') },
    { label: 'PV', value: String(derivedSheet.maxHP), flash: flashedSections.has('hp') },
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

  const presentedLanguages = useMemo(
    () => getLanguageDisplayNames(derivedSheet.languages),
    [derivedSheet.languages],
  );
  const keySkills = useMemo(() => derivedSheet.skillProficiencies.slice(0, 6), [derivedSheet.skillProficiencies]);

  const pendingItems = useMemo(
    () => Object.entries(validationResult.byStep)
      .filter(([, issues]) => issues.length > 0)
      .map(([key, issues]) => ({
        key,
        label: STEP_LABELS[key] ?? key,
        count: Array.from(new Set(issues)).length,
        stepIndex: STEP_INDEX[key] ?? -1,
      })),
    [validationResult.byStep],
  );

  const totalPending = pendingItems.reduce((sum, item) => sum + item.count, 0);

  const identityFlash = flashedSections.has('identity');
  const attrFlash = flashedSections.has('attributes');
  const skillsFlash = flashedSections.has('skills') || flashedSections.has('languages');

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <div className={styles.sectionTitle}>Resumo</div>
        {totalPending > 0 && (
          <span className={styles.pendingBadge}>{totalPending} pendente{totalPending > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className={`${styles.identityCard} ${identityFlash ? styles.flashHighlight : ''}`}>
        <div className={styles.identityHeader}>
          <div className={styles.identityAvatar}>
            {character.portrait
              ? <img src={character.portrait} alt="Retrato" className={styles.avatarImg} />
              : <div className={styles.avatarPlaceholder}>⚔</div>
            }
          </div>
          <div className={styles.identityInfo}>
            <div className={styles.identityName}>{character.name || 'Sem nome'}</div>
            <div className={styles.identityChips}>
              {character.characterClass?.name
                ? <span className={styles.chipClass}>{character.characterClass.name}</span>
                : <span className={styles.chipEmpty}>Classe</span>
              }
              {character.species?.name
                ? <span className={styles.chipSecondary}>{character.species.name}</span>
                : <span className={styles.chipEmpty}>Espécie</span>
              }
            </div>
            <div className={styles.identityOrigin}>
              {selectedBackground?.name || <em>Origem não definida</em>}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.quickFactsGrid}>
        {quickFacts.map((fact) => (
          <SummaryPill key={fact.label} label={fact.label} value={fact.value} flash={fact.flash} />
        ))}
      </div>

      <div className={`${styles.identityCard} ${attrFlash ? styles.flashHighlight : ''}`}>
        <div className={styles.cardHeader}>
          <div className={styles.identityTitle}>Atributos finais</div>
        </div>
        <div className={styles.quickFactsGrid}>
          {coreStats.map(([label, value]) => (
            <SummaryPill key={label} label={String(label)} value={String(value)} />
          ))}
        </div>
      </div>

      <div className={`${styles.identityCard} ${skillsFlash ? styles.flashHighlight : ''}`}>
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

        {presentedLanguages.length > 0 && (
          <>
            <div className={styles.subLabel}>Idiomas</div>
            <ul className={styles.tagList}>
              {presentedLanguages.map((language) => (
                <li key={language} className={styles.tagItem}>{language}</li>
              ))}
            </ul>
          </>
        )}
      </div>

    </div>
  );
}

function SummaryPill({ label, value, flash }: { label: string; value: string; flash?: boolean }) {
  return (
    <div className={`${styles.summaryPillCard} ${flash ? styles.flashHighlight : ''}`}>
      <div className={styles.pillLabel}>{label}</div>
      <div className={styles.pillValue}>{value}</div>
    </div>
  );
}

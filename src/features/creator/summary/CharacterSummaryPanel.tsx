import { useMemo, useRef, useEffect, useState } from 'react';
import { useCharacter } from '../../../context/CharacterContext';
import { useWizard } from '../../../context/WizardContext';
import { getLanguageDisplayNames } from '../../../utils/languagePresentation';
import { FANTASY_NAMES } from '../../../data/fantasyNames';
import styles from './CharacterSummaryPanel.module.css';

const STEP_LABELS: Record<string, string> = {
  class: 'Classe',
  background: 'Origem',
  species: 'Espécie',
  attributes: 'Atributos',
  equipment: 'Equipamento',
};

const ATTR_ABBREV: Record<string, string> = {
  forca: 'FOR', destreza: 'DES', constituicao: 'CON',
  inteligencia: 'INT', sabedoria: 'SAB', carisma: 'CAR',
};

const STEP_INDEX: Record<string, number> = {
  class: 0,
  background: 1,
  species: 2,
  attributes: 3,
  equipment: 4,
};

export function CharacterSummaryPanel() {
  const { character, setCharacter, selectedBackground, derivedSheet, characterLevel, validationResult } = useCharacter();
  const { setCurrentStep, setIsPortraitModalOpen } = useWizard();

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const generateAndShow = () => {
    if (suggestionsOpen) {
      setSuggestionsOpen(false);
      return;
    }
    const shuffled = [...FANTASY_NAMES].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 5));
    setSuggestionsOpen(true);
  };

  const pickSuggestion = (name: string) => {
    setCharacter((prev: any) => ({ ...prev, name }));
    setSuggestionsOpen(false);
  };

  useEffect(() => {
    if (!suggestionsOpen) return;
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [suggestionsOpen]);

  useEffect(() => {
    if (!suggestionsOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSuggestionsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [suggestionsOpen]);

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

  const keySkills = useMemo(
    () => derivedSheet.skills
      .filter(s => s.proficient)
      .slice(0, 6)
      .map(s => `${s.label} (${ATTR_ABBREV[s.attribute] ?? s.attribute.slice(0, 3).toUpperCase()})`),
    [derivedSheet.skills],
  );

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

  const identityFlash = flashedSections.has('identity');
  const attrFlash = flashedSections.has('attributes');
  const skillsFlash = flashedSections.has('skills') || flashedSections.has('languages');

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <div className={styles.sectionTitle}>Resumo</div>
      </div>

      <div className={`${styles.identityCard} ${identityFlash ? styles.flashHighlight : ''}`}>
        <div className={styles.identityHeader}>
          <button
            type="button"
            className={`${styles.identityAvatar} ${character.portrait ? styles.avatarFilled : ''}`.trim()}
            onClick={() => setIsPortraitModalOpen(true)}
            aria-label="Escolher retrato do personagem"
            style={{ cursor: 'pointer', outline: 'none', padding: 0 }}
          >
            {character.portrait
              ? <img src={`/imgs/portrait_caracter/${character.portrait}`} alt="Retrato" className={styles.avatarImg} />
              : <div className={styles.avatarPlaceholder}>+</div>
            }
          </button>
          
          <div className={styles.identityInfo} style={{ position: 'relative' }}>
            <div className={styles.nameInputRow} ref={suggestionsRef}>
              <input
                type="text"
                className={styles.characterNameInput}
                value={character.name || ''}
                onChange={(e) => setCharacter((prev: any) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do personagem"
                aria-label="Nome do personagem"
              />
              <button
                type="button"
                className={`${styles.suggestBtn} ${suggestionsOpen ? styles.suggestBtnActive : ''}`}
                onClick={generateAndShow}
                title="Sugerir nomes"
              >
                ✦
              </button>
              {suggestionsOpen && (
                <div className={styles.suggestionsDropdown} role="listbox">
                  {suggestions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      role="option"
                      className={styles.suggestionItem}
                      onClick={() => pickSuggestion(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.identityMetaList}>
              <div className={styles.identityMetaRow}>
                <span className={styles.identityMetaLabel}>Classe</span>
                <span className={character.characterClass?.name ? styles.identityMetaValuePrimary : styles.identityMetaValueEmpty}>
                  {character.characterClass?.name || 'Não definida'}
                </span>
              </div>
              <div className={styles.identityMetaRow}>
                <span className={styles.identityMetaLabel}>Origem</span>
                <span className={selectedBackground?.name ? styles.identityMetaValue : styles.identityMetaValueEmpty}>
                  {selectedBackground?.name || 'Não definida'}
                </span>
              </div>
              <div className={styles.identityMetaRow}>
                <span className={styles.identityMetaLabel}>Espécie</span>
                <span className={character.species?.name ? styles.identityMetaValue : styles.identityMetaValueEmpty}>
                  {character.species?.name || 'Não definida'}
                </span>
              </div>
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

      {pendingItems.length > 0 && (
        <div className={`${styles.identityCard} ${styles.pendingCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.pendingTitle}>Pendências ({pendingItems.length})</div>
              <p className={styles.pendingDescription}>Resolva os pontos abaixo para avançar com segurança.</p>
            </div>
            <span className={styles.pendingHint}>clique para ir</span>
          </div>
          <div className={styles.pendingList}>
            {pendingItems.map((item) => (
              <button
                key={item.key}
                className={styles.pendingRow}
                onClick={() => { if (item.stepIndex >= 0) setCurrentStep(item.stepIndex); }}
                title={`Ir para ${item.label}`}
                disabled={item.stepIndex < 0}
              >
                <span className={styles.pendingLabel}>{item.label}</span>
                <span className={styles.pendingCount}>{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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

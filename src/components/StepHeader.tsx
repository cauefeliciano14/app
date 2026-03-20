import { useState, useRef, useEffect } from 'react';
import { FANTASY_NAMES } from '../data/fantasyNames';
import styles from './StepHeader.module.css';

export interface StepHeaderProps {
  onPrev?: () => void;
  onNext: () => void;
  canAdvance: boolean;
  characterName: string;
  setCharacterName: (name: string) => void;
  portrait: string | null;
  onPortraitClick: () => void;
}

export const StepHeader = ({
  onPrev,
  onNext,
  canAdvance,
  characterName,
  setCharacterName,
  portrait,
  onPortraitClick,
}: StepHeaderProps) => {
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
    setCharacterName(name);
    setSuggestionsOpen(false);
  };

  // Close on outside click
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

  // Close on Escape
  useEffect(() => {
    if (!suggestionsOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSuggestionsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [suggestionsOpen]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.mainRow}>
        {/* Portrait */}
        <button
          type="button"
          className={`${styles.portraitButton} ${portrait ? styles.portraitButtonFilled : ''}`.trim()}
          onClick={onPortraitClick}
          aria-label="Escolher retrato do personagem"
        >
          {portrait ? (
            <img
              src={`/imgs/portrait_caracter/${portrait}`}
              alt={characterName ? `Retrato de ${characterName}` : 'Retrato do personagem'}
              className={styles.portraitImage}
            />
          ) : (
            <span className={styles.portraitPlaceholder}>+</span>
          )}
        </button>

        {/* Name + suggestions */}
        <div className={styles.nameArea}>
          <div className={styles.nameInputRow}>
            <input
              id="character-name-input"
              type="text"
              className={styles.characterNameInput}
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Nome do personagem"
              aria-label="Nome do personagem"
            />
            <div className={styles.suggestionsWrap} ref={suggestionsRef}>
              <button
                type="button"
                className={`${styles.suggestBtn} ${suggestionsOpen ? styles.suggestBtnActive : ''}`}
                onClick={generateAndShow}
                title="Sugerir nomes"
                aria-expanded={suggestionsOpen}
              >
                ✦ Sugerir
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
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.navButtons}>
          {onPrev ? (
            <button onClick={onPrev} className={styles.btnBack}>
              ‹ Voltar
            </button>
          ) : (
            <div className={styles.spacer} />
          )}
          <button
            onClick={onNext}
            className={`${styles.btnAdvance} ${!canAdvance ? styles.btnAdvanceDisabled : ''}`}
            disabled={!canAdvance}
          >
            Avançar ›
          </button>
        </div>
      </div>
    </div>
  );
};

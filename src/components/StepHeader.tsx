import React, { useState } from 'react';
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

  const generateNames = () => {
    const shuffled = [...FANTASY_NAMES].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.topRow}>
        {onPrev ? (
          <button onClick={onPrev} className={styles.btnBack}>
            &laquo; Voltar
          </button>
        ) : (
          <div className={styles.spacer} />
        )}

        <div className={styles.advanceArea}>
          <button
            onClick={onNext}
            className={canAdvance ? styles.btnAdvance : `${styles.btnAdvance} ${styles.btnAdvanceDisabled}`}
            disabled={!canAdvance}
          >
            Avançar &raquo;
          </button>
        </div>
      </div>

      <div className={styles.identityRow}>
        <div className={styles.portraitColumn}>
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
              <span className={styles.portraitPlaceholder}>Sem retrato</span>
            )}
          </button>
          <span className={styles.portraitLabel}>Retrato</span>
        </div>

        <div className={styles.nameColumn}>
          <label className={styles.characterNameLabel} htmlFor="character-name-input">
            Nome do personagem
          </label>
          <input
            id="character-name-input"
            type="text"
            className={styles.characterNameInput}
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Digite o nome do personagem"
          />
          <div className={styles.suggestionsContainer}>
            <button type="button" className={styles.suggestionsLink} onClick={generateNames}>
              Mostrar sugestões{suggestions.length > 0 ? ':' : ''}
            </button>

            {suggestions.length > 0 && (
              <div className={styles.suggestionsDisplay}>
                {suggestions.map((suggestion, index) => (
                  <React.Fragment key={suggestion}>
                    <button
                      type="button"
                      className={styles.suggestionItem}
                      onClick={() => setCharacterName(suggestion)}
                    >
                      {suggestion}
                    </button>
                    {index < suggestions.length - 1 ? <span className={styles.suggestionSeparator}>•</span> : null}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

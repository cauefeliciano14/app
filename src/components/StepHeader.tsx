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
          <button
            onClick={onPrev}
            className={styles.btnBack}
          >
            &laquo; Voltar
          </button>
        ) : <div className={styles.spacer} />}

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

      {showName && (
        <div className="header-name-container">
          <div
            className={`profile-placeholder ${portrait ? 'has-image' : ''}`}
            onClick={onPortraitClick}
            title="Escolher retrato do personagem"
          >
            {portrait && (
              <img
                src={`/imgs/portrait_caracter/${portrait}`}
                alt={characterName ? `Retrato de ${characterName}` : 'Retrato do personagem'}
                className="profile-image"
              />
            )}
          </div>
      <div className="header-name-container">
        <div
          className={`profile-placeholder ${portrait ? 'has-image' : ''}`}
          onClick={onPortraitClick}
          title="Escolher retrato do personagem"
        >
          {portrait && <img src={`/imgs/portrait_caracter/${portrait}`} alt="Portrait" className="profile-image" />}
        </div>

        <div className="name-input-column">
          <label className="character-name-label">Nome do Personagem</label>
          <input
            type="text"
            className="character-name-input"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Digite o nome..."
          />
          <div className="suggestions-container">
            <button className="suggestions-link" onClick={generateNames}>
              MOSTRAR SUGESTÕES{suggestions.length > 0 ? ':' : ''}
            </button>

            {suggestions.length > 0 && (
              <div className="suggestions-display">
                {suggestions.map((s, i) => (
                  <React.Fragment key={s}>
                    <span
                      className="suggestion-item"
                      onClick={() => setCharacterName(s)}
                    >
                      {s}
                    </span>
                    {i < suggestions.length - 1 ? <span className="suggestion-separator">•</span> : ''}
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

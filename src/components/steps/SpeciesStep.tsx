import React from "react";
import speciesData from "../../data/species.json";
import { SpeciesDetails } from "../SpeciesDetails";
import { StepLayout } from "./StepLayout";
import styles from "./StepLayout.module.css";
import { useCharacter } from "../../context/CharacterContext";
import { useWizard } from "../../context/WizardContext";
import type languagesDataType from "../../data/languages.json";

export interface SpeciesStepProps {
  languagesData: typeof languagesDataType;
}

export const SpeciesStep: React.FC<SpeciesStepProps> = ({ languagesData }) => {
  const {
    character,
    setCharacter,
    handleSelectSpecies,
    validationResult,
  } = useCharacter();

  const { setCurrentStep, setIsPortraitModalOpen } = useWizard();

  const validationErrors = validationResult.byStep.species;
  const canAdvance = validationErrors.length === 0;

  return (
    <StepLayout
      onPrev={() => setCurrentStep(1)}
      onNext={() => setCurrentStep(3)}
      canAdvance={canAdvance}
      characterName={character.name}
      setCharacterName={(n: string) =>
        setCharacter((prev) => ({ ...prev, name: n }))
      }
      portrait={character.portrait}
      onPortraitClick={() => setIsPortraitModalOpen(true)}
      impactSection="species"
    >
      <div className={styles.stepContent}>
        <div className={styles.sectionIntro}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionIcon}>✦</span>
            <span>Escolha sua Espécie: Raça</span>
          </div>
          <p className={styles.sectionDescription}>
            A espécie define traços inatos e escolhas raciais. Selecione uma opção para abrir uma visão mais fluida, com as informações principais e os detalhes específicos lado a lado.
          </p>
        </div>

        <div className={styles.selectionLayout}>
          <div className={styles.selectionRail} style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {speciesData.species.map((sp: any) => {
              const isSelected = character.species?.id === sp.id;
              return (
                <button
                  key={sp.id}
                  style={{ minHeight: '44px', padding: '10px 12px' }}
                  type="button"
                  className={`${styles.selectionButton} ${isSelected ? styles.selectionButtonActive : ""}`.trim()}
                  onClick={() => handleSelectSpecies(sp)}
                >
                  <span className={styles.selectionButtonName}>{sp.name}</span>
                  {isSelected && <span className={styles.selectionButtonMarker}>✓</span>}
                </button>
              );
            })}
          </div>

          <div className={styles.selectionDetails}>
            {character.species ? (
              <SpeciesDetails
                character={character}
                setCharacter={setCharacter}
                species={character.species}
                languagesData={languagesData}
              />
            ) : (
              <div className={`${styles.selectionPlaceholder} ${styles.placeholderPanel}`}>
                <span
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "8px",
                    opacity: 0.5,
                    filter: "grayscale(0.3)",
                  }}
                >
                  👤
                </span>
                <p style={{ margin: "0 0 4px", color: "var(--text-secondary)", fontSize: "0.95rem", fontWeight: 600 }}>
                  Nenhuma espécie selecionada
                </p>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.5, maxWidth: "28rem" }}>
                  Escolha uma espécie ao lado para ver traços raciais, linhagens e idiomas disponíveis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

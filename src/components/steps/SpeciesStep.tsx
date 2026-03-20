import React from "react";
import speciesData from "../../data/species.json";
import { SpeciesDetails } from "../SpeciesDetails";
import { ValidationBanner } from "../ValidationBanner";
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
    stepSelections,
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
      activeStep={3}
      onStepClick={setCurrentStep}
      characterName={character.name}
      setCharacterName={(n: string) =>
        setCharacter((prev) => ({ ...prev, name: n }))
      }
      portrait={character.portrait}
      onPortraitClick={() => setIsPortraitModalOpen(true)}
      selections={stepSelections}
      impactSection="species"
    >
      <div className={styles.stepContent}>
        <ValidationBanner errors={validationErrors} />
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
          <div className={styles.selectionRail}>
            {speciesData.species.map((sp: any) => {
              const isSelected = character.species?.id === sp.id;
              return (
                <button
                  key={sp.id}
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
              <div className={styles.selectionPlaceholder}>
                <span
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "12px",
                    opacity: 0.5,
                  }}
                >
                  👤
                </span>
                <p style={{ margin: 0 }}>
                  Selecione uma espécie para ver os detalhes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

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
    >
      <div className={styles.stepContent}>
        <ValidationBanner errors={validationErrors} />
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "1.4rem",
              color: "#f1f5f9",
              margin: "0 0 8px 0",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: "#f97316" }}>✦</span> Escolha sua Espécie:
            Raça
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              margin: 0,
              lineHeight: 1.6,
              maxWidth: "900px",
            }}
          >
            Sua espécie define traços inatos e características raciais.
            Selecione uma raça abaixo para ver todos os seus traços.
          </p>
        </div>

        {/* Species Layout: 2 Columns */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Left Column: Species List */}
          <div
            style={{
              flex: "1 1 240px",
              maxWidth: "300px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {speciesData.species.map((sp: any) => {
              const isSelected = character.species?.id === sp.id;
              return (
                <div
                  key={sp.id}
                  onClick={() => handleSelectSpecies(sp)}
                  style={{
                    background: isSelected ? "#f97316" : "#1a1b23",
                    border: isSelected
                      ? "1px solid #f97316"
                      : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: isSelected
                      ? "0 4px 20px rgba(249,115,22,0.25)"
                      : "none",
                    transform: isSelected
                      ? "translateY(-2px)"
                      : "translateY(0)",
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor =
                        "rgba(249,115,22,0.5)";
                      e.currentTarget.style.background =
                        "rgba(249,115,22,0.04)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background = "#1a1b23";
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      color: isSelected ? "#ffffff" : "#e2e8f0",
                      fontWeight: isSelected ? "700" : "500",
                      letterSpacing: "0.2px",
                    }}
                  >
                    {sp.name}
                  </h3>
                  {isSelected && (
                    <span style={{ color: "#fff", fontSize: "1rem" }}>✦</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Species Details */}
          <div
            style={{
              flex: "2 1 400px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {character.species ? (
              <SpeciesDetails
                character={character}
                setCharacter={setCharacter}
                species={character.species}
                languagesData={languagesData}
              />
            ) : (
              <div
                style={{
                  height: "300px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(17, 18, 24, 0.4)",
                  borderRadius: "12px",
                  border: "1px dashed rgba(255,255,255,0.1)",
                  color: "#64748b",
                }}
              >
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

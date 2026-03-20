import React from "react";
import { AttributesStep } from "../AttributesStep";
import { ValidationBanner } from "../ValidationBanner";
import { StepLayout } from "./StepLayout";
import styles from "./StepLayout.module.css";
import { useCharacter } from "../../context/CharacterContext";
import { useWizard } from "../../context/WizardContext";

export const AttributesStepWrapper: React.FC = () => {
  const {
    character,
    setCharacter,
    getAttributeBonus,
    selectedBackground,
    stepSelections,
    validationResult,
  } = useCharacter();

  const { setCurrentStep, setIsPortraitModalOpen } = useWizard();

  const validationErrors = validationResult.byStep.attributes;
  const canAdvance = validationErrors.length === 0;

  return (
    <StepLayout
      onPrev={() => setCurrentStep(2)}
      onNext={() => setCurrentStep(4)}
      canAdvance={canAdvance}
      activeStep={4}
      onStepClick={setCurrentStep}
      characterName={character.name}
      setCharacterName={(n) => setCharacter((prev) => ({ ...prev, name: n }))}
      portrait={character.portrait}
      onPortraitClick={() => setIsPortraitModalOpen(true)}
      selections={stepSelections}
    >
      <div className={styles.stepContent}>
        <ValidationBanner errors={validationErrors} />
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
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
              <span style={{ color: "#f97316" }}>✦</span> Atributos do
              Personagem
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.6,
                maxWidth: "600px",
              }}
            >
              Escolha o método para determinar seus pontos base. Bônus do
              antecedente serão adicionados a estes valores.
            </p>
          </div>
        </div>

        <AttributesStep
          character={character}
          setCharacter={setCharacter}
          getAttributeBonus={getAttributeBonus}
          selectedBackground={selectedBackground}
        />
      </div>
    </StepLayout>
  );
};

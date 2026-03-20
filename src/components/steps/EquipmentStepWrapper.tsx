import React from "react";
import { EquipmentStep } from "../EquipmentStep";
import { StepLayout } from "./StepLayout";
import styles from "./StepLayout.module.css";
import { useCharacter } from "../../context/CharacterContext";
import { useWizard } from "../../context/WizardContext";

export const EquipmentStepWrapper: React.FC = () => {
  const {
    character,
    setCharacter,
    selectedBackground,
    derivedSheet,
    stepSelections,
    validationResult,
  } = useCharacter();

  const { setCurrentStep, setIsPortraitModalOpen } = useWizard();

  const validationErrors = validationResult.byStep.equipment;
  const canAdvance = validationErrors.length === 0;

  return (
    <StepLayout
      onPrev={() => setCurrentStep(3)}
      onNext={() => setCurrentStep(5)}
      canAdvance={canAdvance}
      activeStep={5}
      onStepClick={setCurrentStep}
      characterName={character.name}
      setCharacterName={(n: string) =>
        setCharacter((prev) => ({ ...prev, name: n }))
      }
      portrait={character.portrait}
      onPortraitClick={() => setIsPortraitModalOpen(true)}
      selections={stepSelections}
      impactSection="equipment"
    >
      <div className={styles.stepContent}>
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
            <span style={{ color: "#f97316" }}>✦</span> Equipamento Inicial
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
            Confira tudo o que seu personagem carrega no início de sua aventura.
          </p>
        </div>

        <EquipmentStep
          character={character}
          selectedBackground={selectedBackground}
          updateEquipment={(updater) =>
            setCharacter((prev) => ({
              ...prev,
              equipment: updater(prev.equipment),
            }))
          }
          updateSpells={(updater) =>
            setCharacter((prev) => ({ ...prev, spells: updater(prev.spells) }))
          }
          derivedSheet={derivedSheet}
        />
      </div>
    </StepLayout>
  );
};

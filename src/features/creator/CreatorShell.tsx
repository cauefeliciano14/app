import { useEffect, useState, useRef } from 'react';
import languagesData from '../../data/languages.json';
import { CREATION_STORAGE_KEY, CREATION_STATE_VERSION } from '../../utils/persistence';
import { useCharacter } from '../../context/CharacterContext';
import { useWizard } from '../../context/WizardContext';
import { ClassSelectionStep } from '../../components/steps/ClassSelectionStep';
import { BackgroundStep } from '../../components/steps/BackgroundStep';
import { SpeciesStep } from '../../components/steps/SpeciesStep';
import { AttributesStepWrapper } from '../../components/steps/AttributesStepWrapper';
import { EquipmentStepWrapper } from '../../components/steps/EquipmentStepWrapper';
import { CharacterSheetStep } from '../../components/steps/CharacterSheetStep';
import { PortraitPickerModal } from './portrait/PortraitPickerModal';
import styles from './layout/CreatorShell.module.css';

export function CreatorShell() {
  const {
    character,
    setCharacter,
    selectedBackground,
    attrChoiceMode,
    attrPlus1,
    attrPlus2,
    derivedSheet,
    playState,
    setPlayState,
    handleResetCharacter,
  } = useCharacter();
  const { currentStep, setCurrentStep, isPortraitModalOpen, setIsPortraitModalOpen } = useWizard();

  const [showSaved, setShowSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstSave = useRef(true);

  useEffect(() => {
    localStorage.setItem(CREATION_STORAGE_KEY, JSON.stringify({
      version: CREATION_STATE_VERSION,
      character,
      currentStep,
      auxiliaryState: { selectedBackground, attrChoiceMode, attrPlus1, attrPlus2 },
    }));

    // Skip the very first save (on mount) to avoid showing "Salvo" on load
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setShowSaved(true);
    saveTimerRef.current = setTimeout(() => setShowSaved(false), 2200);
  }, [character, currentStep, selectedBackground, attrChoiceMode, attrPlus1, attrPlus2]);

  useEffect(() => {
    if (currentStep === 5 && playState.currentHp === 0 && derivedSheet.maxHP > 0) {
      setPlayState(prev => ({ ...prev, currentHp: derivedSheet.maxHP }));
    }
  }, [currentStep, playState.currentHp, derivedSheet.maxHP, setPlayState]);

  const handleFullReset = () => {
    handleResetCharacter();
    setCurrentStep(0);
  };

  return (
    <div className={`layout-container ${styles.shellFrame}`}>
      {showSaved && <div className="saved-indicator">● Salvo</div>}
      <div className="animate-fade-in" key={currentStep}>
        {currentStep === 0 && <ClassSelectionStep onReset={handleFullReset} languagesData={languagesData} />}
        {currentStep === 1 && <BackgroundStep />}
        {currentStep === 2 && <SpeciesStep languagesData={languagesData} />}
        {currentStep === 3 && <AttributesStepWrapper />}
        {currentStep === 4 && <EquipmentStepWrapper />}
        {currentStep === 5 && <CharacterSheetStep />}
      </div>

      {isPortraitModalOpen && (
        <PortraitPickerModal
          currentPortrait={character.portrait}
          onClose={() => setIsPortraitModalOpen(false)}
          onSelect={(portrait) => {
            setCharacter((prev) => ({ ...prev, portrait }));
            setIsPortraitModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

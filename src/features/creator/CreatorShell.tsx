import { useEffect } from 'react';
import languagesData from '../../data/languages.json';
import { PORTRAITS } from '../../data/portraits';
import { CREATION_STORAGE_KEY, CREATION_STATE_VERSION } from '../../utils/persistence';
import { useCharacter } from '../../context/CharacterContext';
import { useWizard } from '../../context/WizardContext';
import { ClassSelectionStep } from '../../components/steps/ClassSelectionStep';
import { BackgroundStep } from '../../components/steps/BackgroundStep';
import { SpeciesStep } from '../../components/steps/SpeciesStep';
import { AttributesStepWrapper } from '../../components/steps/AttributesStepWrapper';
import { EquipmentStepWrapper } from '../../components/steps/EquipmentStepWrapper';
import { CharacterSheetStep } from '../../components/steps/CharacterSheetStep';

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

  useEffect(() => {
    localStorage.setItem(CREATION_STORAGE_KEY, JSON.stringify({
      version: CREATION_STATE_VERSION,
      character,
      currentStep,
      auxiliaryState: { selectedBackground, attrChoiceMode, attrPlus1, attrPlus2 },
    }));
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
    <div className="layout-container" style={{ maxWidth: '1400px' }}>
      <div className="animate-fade-in" key={currentStep}>
        {currentStep === 0 && <ClassSelectionStep onReset={handleFullReset} languagesData={languagesData} />}
        {currentStep === 1 && <BackgroundStep />}
        {currentStep === 2 && <SpeciesStep languagesData={languagesData} />}
        {currentStep === 3 && <AttributesStepWrapper />}
        {currentStep === 4 && <EquipmentStepWrapper />}
        {currentStep === 5 && <CharacterSheetStep />}
      </div>

      {isPortraitModalOpen && (
        <div className="tooltip-overlay" onClick={() => setIsPortraitModalOpen(false)}>
          <div className="class-tooltip" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px' }}>
              <h2 style={{ color: '#f97316', marginBottom: '20px' }}>Escolha seu Retrato</h2>
              <div className="portrait-grid">
                {PORTRAITS.map((p) => (
                  <div
                    key={p}
                    className={`portrait-item ${character.portrait === p ? 'selected' : ''}`}
                    onClick={() => {
                      setCharacter(prev => ({ ...prev, portrait: p }));
                      setIsPortraitModalOpen(false);
                    }}
                  >
                    <img src={`/imgs/portrait_caracter/${p}`} alt="Opção de retrato do personagem" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

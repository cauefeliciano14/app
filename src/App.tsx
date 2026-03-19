import { useEffect } from 'react'
import languagesData from './data/languages.json'
import { GlossaryTooltipProvider } from './components/GlossaryTooltip'
import { PORTRAITS } from './data/portraits'
import { CREATION_STORAGE_KEY, CREATION_STATE_VERSION } from './utils/persistence'
import './index.css'

import { CharacterProvider, useCharacter } from './context/CharacterContext'
import { WizardProvider, useWizard } from './context/WizardContext'

import { ClassSelectionStep } from './components/steps/ClassSelectionStep'
import { BackgroundStep } from './components/steps/BackgroundStep'
import { SpeciesStep } from './components/steps/SpeciesStep'
import { AttributesStepWrapper } from './components/steps/AttributesStepWrapper'
import { EquipmentStepWrapper } from './components/steps/EquipmentStepWrapper'
import { CharacterSheetStep } from './components/steps/CharacterSheetStep'

function WizardRouter() {
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

  const {
    currentStep,
    setCurrentStep,
    isPortraitModalOpen,
    setIsPortraitModalOpen,
    setShowTooltip,
  } = useWizard();

  // Persist character creation state to localStorage
  useEffect(() => {
    localStorage.setItem(CREATION_STORAGE_KEY, JSON.stringify({
      version: CREATION_STATE_VERSION,
      character,
      currentStep,
      auxiliaryState: { selectedBackground, attrChoiceMode, attrPlus1, attrPlus2 },
    }));
  }, [character, currentStep, selectedBackground, attrChoiceMode, attrPlus1, attrPlus2]);

  // Initialize currentHp to maxHP when first entering the sheet (step 5)
  useEffect(() => {
    if (currentStep === 5 && playState.currentHp === 0 && derivedSheet.maxHP > 0) {
      setPlayState(prev => ({ ...prev, currentHp: derivedSheet.maxHP }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // ESC key closes tooltip
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTooltip(false);
        setIsPortraitModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setShowTooltip, setIsPortraitModalOpen]);

  // Full reset that also clears the wizard step
  const handleFullReset = () => {
    handleResetCharacter();
    setCurrentStep(0);
  };

  return (
    <div className="layout-container" style={{ maxWidth: '1200px' }}>
      <div className="animate-fade-in" key={currentStep}>
        {currentStep === 0 && <ClassSelectionStep onReset={handleFullReset} languagesData={languagesData} />}
        {currentStep === 1 && <BackgroundStep />}
        {currentStep === 2 && <SpeciesStep languagesData={languagesData} />}
        {currentStep === 3 && <AttributesStepWrapper />}
        {currentStep === 4 && <EquipmentStepWrapper />}
        {currentStep === 5 && <CharacterSheetStep />}
      </div>

      {/* Portrait Selection Modal */}
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
                    <img src={`/imgs/portrait_caracter/${p}`} alt={p} />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setIsPortraitModalOpen(false)}
                style={{ marginTop: '20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <CharacterProvider>
      <WizardProvider>
        <GlossaryTooltipProvider>
          <WizardRouter />
        </GlossaryTooltipProvider>
      </WizardProvider>
    </CharacterProvider>
  );
}

export default App

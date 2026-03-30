import { GlossaryTooltipProvider } from './components/GlossaryTooltip';
import { CharacterProvider } from './context/CharacterContext';
import { WizardProvider } from './context/WizardContext';
import { ChangeHistoryProvider } from './context/ChangeHistoryContext';
import { SoundProvider } from './context/SoundContext';
import { DiceProvider } from './context/DiceContext';
import { ThemeProvider } from './context/ThemeContext';
import { DiceTrayOverlay } from './components/dice3d/DiceTrayOverlay';
import { CreatorShell } from './features/creator/CreatorShell';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <ChangeHistoryProvider>
          <CharacterProvider>
            <WizardProvider>
              <DiceProvider>
                <GlossaryTooltipProvider>
                  <CreatorShell />
                  <DiceTrayOverlay />
                </GlossaryTooltipProvider>
              </DiceProvider>
            </WizardProvider>
          </CharacterProvider>
        </ChangeHistoryProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;

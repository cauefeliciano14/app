import { GlossaryTooltipProvider } from './components/GlossaryTooltip';
import { CharacterProvider } from './context/CharacterContext';
import { WizardProvider } from './context/WizardContext';
import { ChangeHistoryProvider } from './context/ChangeHistoryContext';
import { SoundProvider } from './context/SoundContext';
import { CreatorShell } from './features/creator/CreatorShell';
import './index.css';

function App() {
  return (
    <SoundProvider>
      <ChangeHistoryProvider>
        <CharacterProvider>
          <WizardProvider>
            <GlossaryTooltipProvider>
              <CreatorShell />
            </GlossaryTooltipProvider>
          </WizardProvider>
        </CharacterProvider>
      </ChangeHistoryProvider>
    </SoundProvider>
  );
}

export default App;

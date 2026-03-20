import { GlossaryTooltipProvider } from './components/GlossaryTooltip';
import { CharacterProvider } from './context/CharacterContext';
import { WizardProvider } from './context/WizardContext';
import { CreatorShell } from './features/creator/CreatorShell';
import './index.css';

function App() {
  return (
    <CharacterProvider>
      <WizardProvider>
        <GlossaryTooltipProvider>
          <CreatorShell />
        </GlossaryTooltipProvider>
      </WizardProvider>
    </CharacterProvider>
  );
}

export default App;

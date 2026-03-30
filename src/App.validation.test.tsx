import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './App';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const CREATION_STORAGE_KEY = 'dnd_creation_state';
const CREATION_STATE_VERSION = 1;

const baseCharacter = {
  name: '',
  portrait: null,
  species: null,
  characterClass: null,
  choices: {},
  talentSelections: {},
  languages: ['common'],
  attributes: {
    method: null,
    base: { forca: 8, destreza: 8, constituicao: 8, inteligencia: 8, sabedoria: 8, carisma: 8 },
    backgroundBonus: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
    final: { forca: 8, destreza: 8, constituicao: 8, inteligencia: 8, sabedoria: 8, carisma: 8 },
    modifiers: { forca: -1, destreza: -1, constituicao: -1, inteligencia: -1, sabedoria: -1, carisma: -1 },
  },
  equipment: {
    classOption: null,
    backgroundOption: null,
    startingEquipmentAdded: false,
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    equippedArmorId: null,
    hasShieldEquipped: false,
  },
  spells: {
    learnedCantrips: [],
    preparedSpells: [],
  },
};

function seedCreationState(currentStep: number) {
  window.localStorage.setItem(
    CREATION_STORAGE_KEY,
    JSON.stringify({
      version: CREATION_STATE_VERSION,
      currentStep,
      character: baseCharacter,
      auxiliaryState: {
        selectedBackground: null,
        attrChoiceMode: '',
        attrPlus1: '',
        attrPlus2: '',
      },
    })
  );
}

// Pre-import lazy modules so React.lazy resolves synchronously
beforeAll(async () => {
  await Promise.all([
    import('./components/steps/ClassSelectionStep'),
    import('./components/steps/BackgroundStep'),
    import('./components/steps/SpeciesStep'),
    import('./components/steps/AttributesStepWrapper'),
    import('./components/steps/EquipmentStepWrapper'),
    import('./components/steps/CharacterSheetStep'),
  ]);
});

async function renderAppAtStep(step: number) {
  seedCreationState(step);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  await act(async () => {
    root.render(<App />);
  });

  // Flush lazy imports
  await act(async () => {
    await new Promise(r => setTimeout(r, 0));
  });

  return {
    container,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

beforeAll(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = '';
});

describe('App validation banners by creation step', () => {

  it('keeps the persistent summary visible on the class step', async () => {
    const view = await renderAppAtStep(0);

    expect(view.container.textContent).toContain('Resumo');
    expect(view.container.textContent).toContain('Atributos finais');
    expect(view.container.textContent).toContain('Pendências');

    view.cleanup();
  });

  it('renders the class step as stable master-detail without hidden subphase copy', async () => {
    const view = await renderAppAtStep(0);

    expect(view.container.textContent).toContain('Classe');
    expect(view.container.textContent).toContain('Escolha sua Classe');
    expect(view.container.textContent).toContain('Escolha uma classe ao lado para ver atributos primários');

    view.cleanup();
  });
  it('shows class pending errors on step 0 before the class list', async () => {
    const view = await renderAppAtStep(0);

    const html = view.container.innerHTML;
    expect(html.indexOf('Classe')).toBeGreaterThan(-1);
    expect(html.indexOf('Escolha uma classe ao lado')).toBeGreaterThan(-1);

    view.cleanup();
  });

  it('shows background pending errors on step 1 without requiring the sheet page', async () => {
    const view = await renderAppAtStep(1);

    expect(view.container.textContent).toContain('Escolha sua Origem: Antecedente');
    expect(view.container.textContent).toContain('Escolha um antecedente ao lado');

    view.cleanup();
  });

  it('shows species pending errors on step 2 without requiring the sheet page', async () => {
    const view = await renderAppAtStep(2);

    expect(view.container.textContent).toContain('Escolha sua Espécie: Raça');
    expect(view.container.textContent).toContain('Escolha uma espécie ao lado');

    view.cleanup();
  });

  it('shows attribute pending errors on step 3 without requiring the sheet page', async () => {
    const view = await renderAppAtStep(3);

    expect(view.container.textContent).toContain('Atributos do Personagem');

    view.cleanup();
  });
});

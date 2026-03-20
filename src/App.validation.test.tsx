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

function renderAppAtStep(step: number) {
  seedCreationState(step);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(<App />);
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
});

afterEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = '';
});

describe('App validation banners by creation step', () => {
  it('shows class pending errors on step 0 before the class list', () => {
    const view = renderAppAtStep(0);

    const html = view.container.innerHTML;
    expect(html.indexOf('Escolha uma classe para começar a criação do personagem.')).toBeGreaterThan(-1);
    expect(html.indexOf('Escolha uma classe para começar a criação do personagem.')).toBeLessThan(
      html.indexOf('Selecione uma classe para ver tudo o que muda na ficha imediatamente.')
    );

    view.cleanup();
  });

  it('shows background pending errors on step 1 without requiring the sheet page', () => {
    const view = renderAppAtStep(1);

    expect(view.container.textContent).toContain('Escolha um antecedente para liberar os benefícios de origem.');
    expect(view.container.textContent).toContain('Escolha sua Origem: Antecedente');

    view.cleanup();
  });

  it('shows species pending errors on step 2 without requiring the sheet page', () => {
    const view = renderAppAtStep(2);

    expect(view.container.textContent).toContain('Escolha uma espécie para definir os traços do personagem.');
    expect(view.container.textContent).toContain('Escolha sua Espécie: Raça');

    view.cleanup();
  });

  it('shows attribute pending errors on step 3 without requiring the sheet page', () => {
    const view = renderAppAtStep(3);

    expect(view.container.textContent).toContain('Escolha um método para definir os atributos do personagem.');
    expect(view.container.textContent).toContain('Atributos do Personagem');

    view.cleanup();
  });
});

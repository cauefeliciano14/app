import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { CharacterSheetPage } from './CharacterSheetPage';
import { deriveSheet } from '../../rules/engine';
import type { CharacterChoices } from '../../rules/types/CharacterChoices';
import { DEFAULT_PLAY_STATE } from '../../types/playState';

// @ts-expect-error jsdom test env flag for React act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function makeChoices(overrides: Partial<CharacterChoices>): CharacterChoices {
  return {
    classId: null,
    backgroundId: null,
    speciesId: null,
    attributeMethod: 'standard',
    baseAttributes: {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10,
    },
    backgroundBonusDistribution: null,
    equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    spellSelections: { cantrips: [], prepared: [] },
    talentSelections: {},
    languageSelections: ['common'],
    featureChoices: {},
    characterDetails: { name: 'Teste', portrait: null },
    ...overrides,
  };
}

function renderSheet(choices: CharacterChoices, spellState?: { learnedCantrips?: string[]; preparedSpells?: string[] }) {
  const derivedSheet = deriveSheet(choices);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(
      <CharacterSheetPage
        characterName="Teste"
        portrait={null}
        speciesName="Espécie Teste"
        className="Classe Teste"
        characterLevel={choices.level ?? 1}
        derivedSheet={derivedSheet}
        playState={DEFAULT_PLAY_STATE}
        onUpdatePlayState={() => {}}
        classFeatures={[]}
        speciesTraits={[]}
        inventory={[]}
        learnedCantrips={spellState?.learnedCantrips ?? choices.spellSelections.cantrips}
        preparedSpells={spellState?.preparedSpells ?? choices.spellSelections.prepared}
        backgroundName="Antecedente Teste"
        backgroundDescription="Descrição"
        backgroundSkills={[]}
        backgroundTool=""
        backgroundEquipment=""
        equippedArmorId={null}
        hasShieldEquipped={false}
        onEquipArmor={() => {}}
        onEquipShield={() => {}}
      />
    );
  });

  return {
    container,
    derivedSheet,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

function clickTab(container: HTMLElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find(node => node.textContent?.trim() === label) as HTMLButtonElement | undefined;
  if (!button) throw new Error(`Tab "${label}" não encontrada`);
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('CharacterSheetPage racial/species derived display', () => {
  it('mostra truque racial de alto-elfo na aba de magias sem consumir o limite de classe', () => {
    const view = renderSheet(makeChoices({
      classId: 'mago',
      speciesId: 'elfo',
      speciesLineage: 'alto-elfo',
      speciesChoices: { cantrip: 'Prestidigitação' },
      spellSelections: { cantrips: ['Raio de Gelo'], prepared: [] },
    }));

    clickTab(view.container, 'Magias');

    expect(view.derivedSheet.racialCantrips).toContain('Prestidigitação');
    expect(view.container.textContent).toContain('TRUQUES RACIAIS');
    expect(view.container.textContent).toContain('Origem racial/específica');
    expect(view.container.textContent).toContain('Prestidigitação');
    expect(view.container.textContent).toContain('Truques de Classe');
    expect(view.container.textContent).toContain(String(view.derivedSheet.cantripsKnown ?? 0));

    view.cleanup();
  });

  it('mostra a perícia extra do humano nas proficiências da ficha', () => {
    const view = renderSheet(makeChoices({
      classId: 'guerreiro',
      backgroundId: 'soldado',
      speciesId: 'humano',
      speciesChoices: { skill: 'Percepção' },
      featureChoices: {
        'guerreiro-skill-1': 'Atletismo',
        'guerreiro-skill-2': 'Intimidação',
      },
    }));

    expect(view.derivedSheet.skillProficiencies).toContain('Percepção');
    expect(view.container.textContent).toContain('PROFICIÊNCIAS E IDIOMAS');
    expect(view.container.textContent).toContain('PERÍCIAS');
    expect(view.container.textContent).toContain('Percepção');

    view.cleanup();
  });

  it('mostra a resistência derivada do draconato na ficha', () => {
    const view = renderSheet(makeChoices({
      classId: 'guerreiro',
      speciesId: 'draconato',
      speciesChoices: { draconato: 'vermelho' },
    }));

    expect(view.derivedSheet.derivedDefenses).toContain('Resistência a Ígneo');
    expect(view.container.textContent).toContain('DEFESAS E RESISTÊNCIAS');
    expect(view.container.textContent).toContain('DERIVADAS');
    expect(view.container.textContent).toContain('Resistência a Ígneo');

    view.cleanup();
  });
});

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { EquipmentStep } from './EquipmentStep';
import { calculateAC } from '../rules/calculators/combat';
import type { DerivedSheet } from '../rules/types/DerivedSheet';

// @ts-expect-error jsdom test env flag for React act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const baseDerivedSheet: DerivedSheet = {
  level: 1,
  finalAttributes: {},
  modifiers: { destreza: 2, constituicao: 0, sabedoria: 0 },
  maxHP: 10,
  hitDie: 'd10',
  initiative: 2,
  armorClass: 12,
  proficiencyBonus: 2,
  speed: '9 m',
  specialSenses: [],
  skillProficiencies: [],
  weaponProficiencies: [],
  armorProficiencies: ['Armadura Leve', 'Armadura Média', 'Armadura Pesada', 'Escudo'],
  savingThrowProficiencies: [],
  toolProficiencies: [],
  languages: [],
  skills: [],
  derivedSavingThrows: [],
  passivePerception: 10,
  passiveInvestigation: 10,
  passiveInsight: 10,
  weaponAttacks: [],
  isCaster: false,
  racialCantrips: [],
  derivedDefenses: [],
};

function createCharacter(equipmentOverrides: Record<string, any> = {}) {
  return {
    characterClass: { id: 'guerreiro', name: 'Guerreiro' },
    equipment: {
      classOption: null,
      backgroundOption: null,
      startingEquipmentAdded: true,
      inventory: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      equippedArmorId: null,
      hasShieldEquipped: false,
      ...equipmentOverrides,
    },
    spells: {
      learnedCantrips: [],
      preparedSpells: [],
    },
  };
}

function renderHarness(initialEquipment: Record<string, any>) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(<Harness initialCharacter={createCharacter(initialEquipment)} />);
  });

  return {
    container,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

function Harness({
  initialCharacter,
}: {
  initialCharacter: any;
}) {
  const [character, setCharacter] = React.useState(initialCharacter);

  const updateEquipment = (updater: (prev: any) => any) => {
    setCharacter((prevCharacter: any) => ({
      ...prevCharacter,
      equipment: updater(prevCharacter.equipment),
    }));
  };

  const updateSpells = (updater: (prev: any) => any) => {
    setCharacter((prevCharacter: any) => ({
      ...prevCharacter,
      spells: updater(prevCharacter.spells),
    }));
  };

  const armorClass = calculateAC({
    dexModifier: baseDerivedSheet.modifiers.destreza,
    equippedArmorId: character.equipment.equippedArmorId ?? undefined,
    hasShield: character.equipment.hasShieldEquipped,
    classId: character.characterClass.id,
    conModifier: baseDerivedSheet.modifiers.constituicao,
    wisModifier: baseDerivedSheet.modifiers.sabedoria,
    armorProficiencies: baseDerivedSheet.armorProficiencies,
  });

  return (
    <div>
      <div data-testid="armor-class">{armorClass}</div>
      <div data-testid="equipped-armor">{character.equipment.equippedArmorId ?? 'none'}</div>
      <div data-testid="shield-equipped">{String(character.equipment.hasShieldEquipped)}</div>
      <EquipmentStep
        character={character}
        selectedBackground={{ id: 'soldado', name: 'Soldado' }}
        updateEquipment={updateEquipment}
        updateSpells={updateSpells}
        derivedSheet={{ ...baseDerivedSheet, armorClass }}
      />
    </div>
  );
}

function clickButton(container: HTMLElement, label: string, index = 0) {
  const buttons = Array.from(container.querySelectorAll('button')).filter(
    button => button.textContent?.trim() === label
  );
  const button = buttons[index] as HTMLButtonElement | undefined;
  if (!button) {
    throw new Error(`Button "${label}" not found`);
  }

  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function clickText(container: HTMLElement, text: string, index = 0) {
  const elements = Array.from(container.querySelectorAll('div, span')).filter(
    element => element.textContent?.trim() === text
  );
  const element = elements[index] as HTMLElement | undefined;
  if (!element) {
    throw new Error(`Text "${text}" not found`);
  }

  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function openInventoryItem(container: HTMLElement, itemName: string) {
  clickText(container, 'Inventário');
  clickText(container, itemName);
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('EquipmentStep equipped state sanitization', { timeout: 20000 }, () => {
  it('clears equipped armor when removing the equipped armor item', () => {
    const view = renderHarness({
      inventory: [{ id: 'armor-1', name: 'Armadura de Couro', quantity: 1 }],
      equippedArmorId: 'couro',
    });

    openInventoryItem(view.container, 'Armadura de Couro');
    clickButton(view.container, 'Remover Item');

    expect(view.container.querySelector('[data-testid="equipped-armor"]')?.textContent).toBe('none');
    expect(view.container.querySelector('[data-testid="armor-class"]')?.textContent).toBe('12');

    view.cleanup();
  });

  it('clears equipped shield when removing the equipped shield item', () => {
    const view = renderHarness({
      inventory: [{ id: 'shield-1', name: 'Escudo', quantity: 1 }],
      hasShieldEquipped: true,
    });

    openInventoryItem(view.container, 'Escudo');
    clickButton(view.container, 'Remover Item');

    expect(view.container.querySelector('[data-testid="shield-equipped"]')?.textContent).toBe('false');
    expect(view.container.querySelector('[data-testid="armor-class"]')?.textContent).toBe('12');

    view.cleanup();
  });

  it('clears equipped state when decrementing quantity to zero', () => {
    const view = renderHarness({
      inventory: [{ id: 'armor-1', name: 'Armadura de Couro', quantity: 1 }],
      equippedArmorId: 'couro',
    });

    clickText(view.container, 'Inventário');
    clickButton(view.container, '-');

    expect(view.container.querySelector('[data-testid="equipped-armor"]')?.textContent).toBe('none');
    expect(view.container.querySelector('[data-testid="armor-class"]')?.textContent).toBe('12');

    view.cleanup();
  });

  it('recalculates AC immediately after removing equipped armor and shield', () => {
    const view = renderHarness({
      inventory: [
        { id: 'armor-1', name: 'Armadura de Couro', quantity: 1 },
        { id: 'shield-1', name: 'Escudo', quantity: 1 },
      ],
      equippedArmorId: 'couro',
      hasShieldEquipped: true,
    });

    expect(view.container.querySelector('[data-testid="armor-class"]')?.textContent).toBe('15');

    openInventoryItem(view.container, 'Armadura de Couro');
    clickButton(view.container, 'Remover Item', 0);
    expect(view.container.querySelector('[data-testid="armor-class"]')?.textContent).toBe('14');

    view.cleanup();
  });
});

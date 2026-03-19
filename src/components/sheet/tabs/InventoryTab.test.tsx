import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InventoryTab } from './InventoryTab';
import { DEFAULT_PLAY_STATE, type CharacterPlayState } from '../../../types/playState';

// @ts-expect-error jsdom test env flag for React act
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type InventoryItem = {
  name: string;
  quantity?: number;
  notes?: string;
  cost?: string;
};

function renderHarness(ui: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  act(() => {
    root.render(ui);
  });

  return {
    container,
    cleanup: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

function clickButton(container: HTMLElement, label: string, index = 0) {
  const buttons = Array.from(container.querySelectorAll('button')).filter(
    button => button.textContent?.trim() === label,
  );
  const button = buttons[index] as HTMLButtonElement | undefined;

  if (!button) {
    throw new Error(`Button "${label}" not found`);
  }

  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function getEquipButtons(container: HTMLElement) {
  return Array.from(container.querySelectorAll('button')).filter(
    button => ['Equipado', 'Equipar'].includes(button.textContent?.trim() ?? ''),
  );
}

function InventoryHarness({
  initialInventory,
  initialPlayState,
  initialEquippedArmorId = null,
  initialHasShieldEquipped = false,
}: {
  initialInventory: InventoryItem[];
  initialPlayState?: CharacterPlayState;
  initialEquippedArmorId?: string | null;
  initialHasShieldEquipped?: boolean;
}) {
  const [inventory, setInventory] = React.useState(initialInventory);
  const [playState, setPlayState] = React.useState<CharacterPlayState>(initialPlayState ?? DEFAULT_PLAY_STATE);
  const [equippedArmorId, setEquippedArmorId] = React.useState<string | null>(initialEquippedArmorId);
  const [hasShieldEquipped, setHasShieldEquipped] = React.useState(initialHasShieldEquipped);

  return (
    <div>
      <button
        onClick={() => {
          setInventory(prev => prev.filter(item => item.name !== 'Armadura de Couro'));
          setEquippedArmorId(prev => (prev === 'couro' ? null : prev));
        }}
      >
        Remove leather
      </button>
      <InventoryTab
        inventory={inventory}
        playState={playState}
        onUpdatePlayState={setPlayState}
        onManageEquipment={() => undefined}
        equippedArmorId={equippedArmorId}
        hasShieldEquipped={hasShieldEquipped}
        onEquipArmor={setEquippedArmorId}
        onEquipShield={setHasShieldEquipped}
      />
    </div>
  );
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('InventoryTab authoritative equipped state', () => {
  it('shows only one armor as visually equipped even if playState lists multiple armor names', () => {
    const view = renderHarness(
      <InventoryHarness
        initialInventory={[
          { name: 'Armadura de Couro', quantity: 1 },
          { name: 'Cota de Malha', quantity: 1 },
        ]}
        initialEquippedArmorId="couro"
        initialPlayState={{
          ...DEFAULT_PLAY_STATE,
          equippedItemIds: ['Armadura de Couro', 'Cota de Malha'],
        }}
      />,
    );

    const equipButtons = getEquipButtons(view.container);
    expect(equipButtons.map(button => button.textContent?.trim())).toEqual(['Equipado', 'Equipar']);

    view.cleanup();
  });

  it('shows shield equipped based on hasShieldEquipped instead of playState.equippedItemIds', () => {
    const view = renderHarness(
      <InventoryHarness
        initialInventory={[{ name: 'Escudo', quantity: 1 }]}
        initialHasShieldEquipped={true}
        initialPlayState={{
          ...DEFAULT_PLAY_STATE,
          equippedItemIds: [],
        }}
      />,
    );

    expect(getEquipButtons(view.container).map(button => button.textContent?.trim())).toEqual(['Equipado']);

    view.cleanup();
  });

  it('cleans the visual equipped marker after removing the equipped armor from inventory', () => {
    const view = renderHarness(
      <InventoryHarness
        initialInventory={[{ name: 'Armadura de Couro', quantity: 1 }]}
        initialEquippedArmorId="couro"
        initialPlayState={{
          ...DEFAULT_PLAY_STATE,
          equippedItemIds: ['Armadura de Couro'],
        }}
      />,
    );

    expect(getEquipButtons(view.container).map(button => button.textContent?.trim())).toEqual(['Equipado']);

    clickButton(view.container, 'Remove leather');

    expect(getEquipButtons(view.container)).toHaveLength(0);
    expect(view.container.textContent).toContain('Inventário vazio.');

    view.cleanup();
  });
});

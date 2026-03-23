export interface CustomAction {
  id: string;
  name: string;
  type: 'action' | 'bonus' | 'reaction' | 'other' | 'limited';
  description: string;
}

export interface CharacterPlayState {
  currentHp: number;
  maxHpOverride: number | null;
  tempHp: number;
  heroicInspiration: boolean;
  activeConditions: string[];
  activeDefenses: string[];
  deathSaves: { successes: number; failures: number };
  spentSpellSlots: Record<number, number>;
  equippedItemIds: string[];
  attunedItemIds: string[];
  customActions: CustomAction[];
  notes: string;
  extras: string;
}

export const DEFAULT_PLAY_STATE: CharacterPlayState = {
  currentHp: 0,
  maxHpOverride: null,
  tempHp: 0,
  heroicInspiration: false,
  activeConditions: [],
  activeDefenses: [],
  deathSaves: { successes: 0, failures: 0 },
  spentSpellSlots: {},
  equippedItemIds: [],
  attunedItemIds: [],
  customActions: [],
  notes: '',
  extras: '',
};

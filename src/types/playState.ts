export interface CustomAction {
  id: string;
  name: string;
  type: 'action' | 'bonus' | 'reaction' | 'other' | 'limited';
  description: string;
  maxUses?: number;
  usesSpent?: number;
  resetOn?: 'short' | 'long';
}

export interface CustomCounter {
  id: string;
  name: string;
  current: number;
  max: number;
  resetOn: 'short' | 'long' | 'manual';
}

export interface Container {
  id: string;
  name: string;
  capacityKg: number;
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
  spentHitDice: number;
  equippedItemIds: string[];
  attunedItemIds: string[];
  customActions: CustomAction[];
  notes: string;
  extras: string;
  diceHistory: Array<{
    label: string;
    total: number;
    type: 'check' | 'save' | 'attack' | 'damage';
    timestamp: number;
  }>;
  /** XP acumulado */
  xp: number;
  /** Habilidades com Expertise (proficiência dupla) */
  expertiseSkills: string[];
  /** Contadores de recursos de classe e personalizados */
  customCounters: CustomCounter[];
  /** Itens adicionados manualmente na ficha */
  sheetItems: Array<{ id: string; name: string; quantity: number; notes?: string; weight?: number; containerId?: string }>;
  /** Containers (mochilas, sacos, etc.) */
  containers: Container[];
  /** Nome da magia em concentração ativa (null = nenhuma) */
  concentratingOn: string | null;
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
  spentHitDice: 0,
  equippedItemIds: [],
  attunedItemIds: [],
  customActions: [],
  notes: '',
  extras: '',
  diceHistory: [],
  xp: 0,
  expertiseSkills: [],
  customCounters: [],
  sheetItems: [],
  containers: [],
  concentratingOn: null,
};

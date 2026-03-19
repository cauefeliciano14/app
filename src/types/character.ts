export interface Selection {
  id: string;
  name: string;
  description: string;
  [key: string]: any;
}

export interface Character {
  name: string;
  portrait: string | null;
  species: Selection | null;
  characterClass: Selection | null;
  choices: Record<string, string>;
  talentSelections: Record<string, Record<string, string>>;
  languages: string[];
  attributes: {
    method: "standard" | "random" | "pointBuy" | null;
    base: Record<string, number>;
    backgroundBonus: Record<string, number>;
    final: Record<string, number>;
    modifiers: Record<string, number>;
    randomRolls?: Array<{
      dice: number[];
      dropped: number;
      total: number;
      assignedTo: string | null;
    }>;
    pointBuySpent?: number;
  };
  equipment: {
    classOption: 'A' | 'B' | null;
    backgroundOption: 'A' | 'B' | null;
    startingEquipmentAdded: boolean;
    inventory: any[];
    currency: { cp: number; sp: number; ep: number; gp: number; pp: number; };
    equippedArmorId: string | null;
    hasShieldEquipped: boolean;
  };
  spells: {
    learnedCantrips: string[];
    preparedSpells: string[];
  };
}

export const DEFAULT_CHARACTER: Character = {
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
    modifiers: { forca: -1, destreza: -1, constituicao: -1, inteligencia: -1, sabedoria: -1, carisma: -1 }
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
  }
};

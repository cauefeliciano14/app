export type AttributeKey =
  | 'forca'
  | 'destreza'
  | 'constituicao'
  | 'inteligencia'
  | 'sabedoria'
  | 'carisma';

export type AttributeMethod = 'standard' | 'random' | 'pointBuy';

export interface BackgroundBonusDistribution {
  mode: '+2/+1' | '+1/+1/+1';
  distribution: Partial<Record<AttributeKey, number>>;
}

export interface ValidationInventoryItem {
  name: string;
  quantity?: number;
  source?: string;
  isStartingGear?: boolean;
}

export interface CharacterChoices {
  level?: number;
  classId: string | null;
  classLevels?: Array<{ classId: string; className: string; level: number }>;
  backgroundId: string | null;
  speciesId: string | null;
  speciesLineage?: string;
  speciesChoices?: Record<string, string>;
  attributeMethod: AttributeMethod | null;
  baseAttributes: Record<AttributeKey, number>;
  backgroundBonusDistribution: BackgroundBonusDistribution | null;
  equippedArmorId?: string;
  hasShield?: boolean;
  backgroundChoices?: {
    toolProficiency?: string;
  };
  equipmentChoices: { classOption: 'A' | 'B' | null; backgroundOption: 'A' | 'B' | null };
  inventory?: ValidationInventoryItem[];
  inventoryWeapons?: string[];
  spellSelections: { cantrips: string[]; prepared: string[] };
  talentSelections: Record<string, Record<string, string>>;
  languageSelections: string[];
  featureChoices: Record<string, string>;
  characterDetails: { name: string; portrait: string | null };
}

export const EMPTY_BASE_ATTRIBUTES: Record<AttributeKey, number> = {
  forca: 8,
  destreza: 8,
  constituicao: 8,
  inteligencia: 8,
  sabedoria: 8,
  carisma: 8,
};

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  'forca',
  'destreza',
  'constituicao',
  'inteligencia',
  'sabedoria',
  'carisma',
];

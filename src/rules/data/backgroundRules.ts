import backgroundsJson from '../../data/backgrounds.json';
import type { AttributeKey } from '../types/CharacterChoices';

export interface BackgroundData {
  id: string;
  name: string;
  /** Os 3 atributos nos quais podem ser distribuídos os bônus de antecedente */
  allowedBonusAttributes: AttributeKey[];
  talent: string;
  skillProficiencies: string[];
  toolProficiency: string;
  equipment: string;
}

interface RawBackground {
  id: string;
  name: string;
  attributeValues: string[];
  talent: string;
  skillProficiencies: string[];
  toolProficiency: string;
  equipment: string;
}

// Mapeamento dos nomes JSON para AttributeKey tipado
const ATTR_NAME_MAP: Record<string, AttributeKey> = {
  forca:        'forca',
  destreza:     'destreza',
  constituicao: 'constituicao',
  inteligencia: 'inteligencia',
  sabedoria:    'sabedoria',
  carisma:      'carisma',
};

function parseAllowedAttributes(values: string[]): AttributeKey[] {
  return values
    .map(v => ATTR_NAME_MAP[v])
    .filter((v): v is AttributeKey => v !== undefined);
}

// Carregar e transformar os dados
const rawList = (backgroundsJson as { backgrounds: RawBackground[] }).backgrounds;

const BACKGROUND_MAP: Map<string, BackgroundData> = new Map(
  rawList.map(b => [
    b.id,
    {
      id: b.id,
      name: b.name,
      allowedBonusAttributes: parseAllowedAttributes(b.attributeValues),
      talent: b.talent,
      skillProficiencies: b.skillProficiencies,
      toolProficiency: b.toolProficiency,
      equipment: b.equipment,
    },
  ])
);

export function getBackgroundData(backgroundId: string): BackgroundData | null {
  return BACKGROUND_MAP.get(backgroundId) ?? null;
}

export function getAllowedBonusAttributes(backgroundId: string): AttributeKey[] {
  return BACKGROUND_MAP.get(backgroundId)?.allowedBonusAttributes ?? [];
}

export function getBackgroundTalent(backgroundId: string): string | null {
  return BACKGROUND_MAP.get(backgroundId)?.talent ?? null;
}

export function getBackgroundSkillProficiencies(backgroundId: string): string[] {
  return BACKGROUND_MAP.get(backgroundId)?.skillProficiencies ?? [];
}

export function getBackgroundToolProficiency(backgroundId: string): string | null {
  const raw = BACKGROUND_MAP.get(backgroundId)?.toolProficiency;
  return raw ?? null;
}

export function isValidBackground(backgroundId: string): boolean {
  return BACKGROUND_MAP.has(backgroundId);
}

export function getAllBackgrounds(): BackgroundData[] {
  return Array.from(BACKGROUND_MAP.values());
}

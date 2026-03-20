import type { AttributeKey } from '../types/CharacterChoices';
import type { DerivedSkill, DerivedSavingThrow, WeaponAttack } from '../types/DerivedSheet';

// ---------------------------------------------------------------------------
// Tabela completa de perícias com atributo base
// ---------------------------------------------------------------------------

export const ALL_SKILLS: Array<{ label: string; attribute: AttributeKey }> = [
  { label: 'Acrobacia',         attribute: 'destreza' },
  { label: 'Arcanismo',         attribute: 'inteligencia' },
  { label: 'Atletismo',         attribute: 'forca' },
  { label: 'Atuação',           attribute: 'carisma' },
  { label: 'Enganação',         attribute: 'carisma' },
  { label: 'Furtividade',       attribute: 'destreza' },
  { label: 'História',          attribute: 'inteligencia' },
  { label: 'Intimidação',       attribute: 'carisma' },
  { label: 'Intuição',          attribute: 'sabedoria' },
  { label: 'Investigação',      attribute: 'inteligencia' },
  { label: 'Lidar com Animais', attribute: 'sabedoria' },
  { label: 'Medicina',          attribute: 'sabedoria' },
  { label: 'Natureza',          attribute: 'inteligencia' },
  { label: 'Percepção',         attribute: 'sabedoria' },
  { label: 'Persuasão',         attribute: 'carisma' },
  { label: 'Prestidigitação',   attribute: 'destreza' },
  { label: 'Religião',          attribute: 'inteligencia' },
  { label: 'Sobrevivência',     attribute: 'sabedoria' },
];

// ---------------------------------------------------------------------------
// Tabela de salvaguardas
// ---------------------------------------------------------------------------

export const SAVING_THROW_LABELS: Array<{ label: string; attribute: AttributeKey }> = [
  { label: 'Força',        attribute: 'forca' },
  { label: 'Destreza',     attribute: 'destreza' },
  { label: 'Constituição', attribute: 'constituicao' },
  { label: 'Inteligência', attribute: 'inteligencia' },
  { label: 'Sabedoria',    attribute: 'sabedoria' },
  { label: 'Carisma',      attribute: 'carisma' },
];

// ---------------------------------------------------------------------------
// Condições D&D 2024
// ---------------------------------------------------------------------------

export const D6_CONDITIONS: string[] = [
  'Amedrontado', 'Agarrado', 'Atordoado', 'Caído',
  'Cego', 'Enfeitiçado', 'Envenenado', 'Exausto',
  'Incapacitado', 'Invisível', 'Paralisado', 'Petrificado',
  'Restringido', 'Surdo',
];

// ---------------------------------------------------------------------------
// Derivar perícias
// ---------------------------------------------------------------------------

/**
 * Retorna lista tipada de 18 perícias com valor calculado e flag de proficiência.
 * skillProficiencies usa labels como "Atletismo", "Percepção".
 */
export function deriveSkills(
  modifiers: Record<string, number>,
  proficiencyBonus: number,
  skillProficiencies: string[]
): DerivedSkill[] {
  return ALL_SKILLS.map(({ label, attribute }) => {
    const attrMod = modifiers[attribute] ?? 0;
    const proficient = skillProficiencies.includes(label);
    return {
      label,
      attribute,
      modifier: attrMod + (proficient ? proficiencyBonus : 0),
      proficient,
    };
  });
}

// ---------------------------------------------------------------------------
// Derivar salvaguardas
// ---------------------------------------------------------------------------

/**
 * Retorna 6 salvaguardas com valor calculado e flag de proficiência.
 * savingThrowProficiencies usa labels como "Força", "Constituição".
 */
export function deriveSavingThrows(
  modifiers: Record<string, number>,
  proficiencyBonus: number,
  savingThrowProficiencies: string[]
): DerivedSavingThrow[] {
  return SAVING_THROW_LABELS.map(({ label, attribute }) => {
    const attrMod = modifiers[attribute] ?? 0;
    const proficient = savingThrowProficiencies.includes(label);
    return {
      label,
      attribute,
      modifier: attrMod + (proficient ? proficiencyBonus : 0),
      proficient,
    };
  });
}

// ---------------------------------------------------------------------------
// Derivar passivas (10 + modificador da perícia)
// ---------------------------------------------------------------------------

export function derivePassives(skills: DerivedSkill[]): {
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
} {
  const percepcao  = skills.find(s => s.label === 'Percepção')?.modifier ?? 0;
  const investigacao = skills.find(s => s.label === 'Investigação')?.modifier ?? 0;
  const intuicao   = skills.find(s => s.label === 'Intuição')?.modifier ?? 0;
  return {
    passivePerception:    10 + percepcao,
    passiveInvestigation: 10 + investigacao,
    passiveInsight:       10 + intuicao,
  };
}

// ---------------------------------------------------------------------------
// Ataque Desarmado
// ---------------------------------------------------------------------------

export function deriveUnarmedAttack(strMod: number, profBonus: number, damageDice = '1'): WeaponAttack {
  return {
    weaponName: 'Ataque Desarmado',
    attackBonus: strMod + profBonus,
    damageBonus: strMod,
    damageDice,
    damageType: 'Contundente',
    isFinesse: false,
    range: 'Corpo a Corpo',
    properties: [],
    actionType: 'attack',
  };
}

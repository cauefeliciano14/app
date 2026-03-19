import classDetailsJson from '../../data/classDetails.json';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

export interface ClassHPData {
  hitDieLabel: string;
  level1BaseHp: number;
  fixedHpPerLevel: number;
}

export interface ClassProficiencyData {
  savingThrows: string[];
  skillChoicePool: string[];
  skillChoiceCount: number;
  weaponProficiencies: string[];
  armorProficiencies: string[];
}

export interface ClassSpellcastingData {
  isCaster: boolean;
  spellcastingAbility?: string;
  /** full caster = 1, half caster = 0.5, pact = 'pact', non-caster = 0 */
  castingProgression: 1 | 0.5 | 'pact' | 0;
  cantripsKnownByLevel: number[];     // índice = nível-1 (20 entradas)
  preparedSpellsByLevel?: number[];   // para classes que preparam (índice = nível-1)
  spellSlotsKnownByLevel?: number[];  // para Bruxo/Feiticeiro que "conhecem"
}

// ---------------------------------------------------------------------------
// HP por classe — fonte autoritativa (migrado de App.tsx CLASS_HP_DATA)
// ---------------------------------------------------------------------------

export const CLASS_HP_DATA: Record<string, ClassHPData> = {
  barbaro:    { hitDieLabel: '1d12', level1BaseHp: 12, fixedHpPerLevel: 7 },
  guardiao:   { hitDieLabel: '1d10', level1BaseHp: 10, fixedHpPerLevel: 6 },
  guerreiro:  { hitDieLabel: '1d10', level1BaseHp: 10, fixedHpPerLevel: 6 },
  paladino:   { hitDieLabel: '1d10', level1BaseHp: 10, fixedHpPerLevel: 6 },
  bardo:      { hitDieLabel: '1d8',  level1BaseHp: 8,  fixedHpPerLevel: 5 },
  bruxo:      { hitDieLabel: '1d8',  level1BaseHp: 8,  fixedHpPerLevel: 5 },
  clerigo:    { hitDieLabel: '1d8',  level1BaseHp: 8,  fixedHpPerLevel: 5 },
  druida:     { hitDieLabel: '1d8',  level1BaseHp: 8,  fixedHpPerLevel: 5 },
  ladino:     { hitDieLabel: '1d8',  level1BaseHp: 8,  fixedHpPerLevel: 5 },
  monge:      { hitDieLabel: '1d8',  level1BaseHp: 8,  fixedHpPerLevel: 5 },
  feiticeiro: { hitDieLabel: '1d6',  level1BaseHp: 6,  fixedHpPerLevel: 4 },
  mago:       { hitDieLabel: '1d6',  level1BaseHp: 6,  fixedHpPerLevel: 4 },
};

// ---------------------------------------------------------------------------
// Proficiências estruturadas por classe
// ---------------------------------------------------------------------------

export const CLASS_PROFICIENCY_DATA: Record<string, ClassProficiencyData> = {
  barbaro: {
    savingThrows: ['Força', 'Constituição'],
    skillChoicePool: ['Atletismo', 'Intimidação', 'Lidar com Animais', 'Natureza', 'Percepção', 'Sobrevivência'],
    skillChoiceCount: 2,
    weaponProficiencies: ['Armas Simples', 'Armas Marciais'],
    armorProficiencies: ['Armadura Leve', 'Armadura Média', 'Escudo'],
  },
  bardo: {
    savingThrows: ['Destreza', 'Carisma'],
    skillChoicePool: ['Acrobacia', 'Atletismo', 'Atuação', 'Enganação', 'História', 'Intuição', 'Intimidação', 'Investigação', 'Medicina', 'Natureza', 'Percepção', 'Persuasão', 'Prestidigitação', 'Religião', 'Sobrevivência'],
    skillChoiceCount: 3,
    weaponProficiencies: ['Armas Simples', 'Bestas de Mão', 'Espadas Longas', 'Rapieiras', 'Espadas Curtas'],
    armorProficiencies: ['Armadura Leve'],
  },
  bruxo: {
    savingThrows: ['Sabedoria', 'Carisma'],
    skillChoicePool: ['Arcanismo', 'Enganação', 'História', 'Intimidação', 'Investigação', 'Natureza', 'Religião'],
    skillChoiceCount: 2,
    weaponProficiencies: ['Armas Simples'],
    armorProficiencies: ['Armadura Leve'],
  },
  clerigo: {
    savingThrows: ['Sabedoria', 'Carisma'],
    skillChoicePool: ['História', 'Intuição', 'Medicina', 'Persuasão', 'Religião'],
    skillChoiceCount: 2,
    weaponProficiencies: ['Armas Simples'],
    armorProficiencies: ['Armadura Leve', 'Armadura Média', 'Escudo'],
  },
  druida: {
    savingThrows: ['Inteligência', 'Sabedoria'],
    skillChoicePool: ['Arcanismo', 'Atletismo', 'Intuição', 'Lidar com Animais', 'Medicina', 'Natureza', 'Percepção', 'Religião', 'Sobrevivência'],
    skillChoiceCount: 2,
    weaponProficiencies: ['Armas Simples'],
    armorProficiencies: ['Armadura Leve', 'Armadura Média', 'Escudo'],
  },
  feiticeiro: {
    savingThrows: ['Constituição', 'Carisma'],
    skillChoicePool: ['Arcanismo', 'Enganação', 'Intuição', 'Intimidação', 'Persuasão', 'Religião'],
    skillChoiceCount: 2,
    weaponProficiencies: ['Armas Simples'],
    armorProficiencies: [],
  },
  guardiao: {
    savingThrows: ['Força', 'Destreza'],
    skillChoicePool: ['Atletismo', 'Intuição', 'Investigação', 'Lidar com Animais', 'Natureza', 'Percepção', 'Prestidigitação', 'Sobrevivência', 'Furtividade'],
    skillChoiceCount: 3,
    weaponProficiencies: ['Armas Simples', 'Armas Marciais'],
    armorProficiencies: ['Armadura Leve', 'Armadura Média', 'Escudo'],
  },
  guerreiro: {
    savingThrows: ['Força', 'Constituição'],
    skillChoicePool: ['Acrobacia', 'Atletismo', 'História', 'Intuição', 'Intimidação', 'Percepção', 'Prestidigitação', 'Sobrevivência'],
    skillChoiceCount: 2,
    weaponProficiencies: ['Armas Simples', 'Armas Marciais'],
    armorProficiencies: ['Armadura Leve', 'Armadura Média', 'Armadura Pesada', 'Escudo'],
  },
  ladino: {
    savingThrows: ['Destreza', 'Inteligência'],
    skillChoicePool: ['Acrobacia', 'Atletismo', 'Atuação', 'Enganação', 'Furtividade', 'Intimidação', 'Investigação', 'Percepção', 'Persuasão', 'Prestidigitação'],
    skillChoiceCount: 4,
    weaponProficiencies: ['Armas Simples', 'Bestão de Mão', 'Espadas Longas', 'Rapieiras', 'Espadas Curtas'],
    armorProficiencies: ['Armadura Leve'],
  },
  mago: {
    savingThrows: ['Inteligência', 'Sabedoria'],
    skillChoicePool: ['Arcanismo', 'História', 'Intuição', 'Investigação', 'Medicina', 'Religião'],
    skillChoiceCount: 2,
    weaponProficiencies: ['Adagas', 'Dardos', 'Fundas', 'Cajados', 'Bestas Leves'],
    armorProficiencies: [],
  },
  monge: {
    savingThrows: ['Força', 'Destreza'],
    skillChoicePool: ['Acrobacia', 'Atletismo', 'História', 'Intuição', 'Religião', 'Furtividade'],
    skillChoiceCount: 2,
    weaponProficiencies: ['Armas Simples', 'Espadas Curtas'],
    armorProficiencies: [],
  },
  paladino: {
    savingThrows: ['Sabedoria', 'Carisma'],
    skillChoicePool: ['Atletismo', 'Intuição', 'Intimidação', 'Medicina', 'Persuasão', 'Religião'],
    skillChoiceCount: 2,
    weaponProficiencies: ['Armas Simples', 'Armas Marciais'],
    armorProficiencies: ['Armadura Leve', 'Armadura Média', 'Armadura Pesada', 'Escudo'],
  },
};

// ---------------------------------------------------------------------------
// Conjuração por classe
// Cantrips conhecidos por nível (índice 0 = nível 1, ..., índice 19 = nível 20)
// ---------------------------------------------------------------------------

export const CLASS_SPELLCASTING_DATA: Record<string, ClassSpellcastingData> = {
  barbaro:    { isCaster: false, castingProgression: 0, cantripsKnownByLevel: Array(20).fill(0) },
  guerreiro:  { isCaster: false, castingProgression: 0, cantripsKnownByLevel: Array(20).fill(0) },
  monge:      { isCaster: false, castingProgression: 0, cantripsKnownByLevel: Array(20).fill(0) },
  ladino:     { isCaster: false, castingProgression: 0, cantripsKnownByLevel: Array(20).fill(0) },

  bardo: {
    isCaster: true,
    spellcastingAbility: 'carisma',
    castingProgression: 1,
    cantripsKnownByLevel: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    // Bardo prepara magias (D&D 2024): 4 no nível 1, sobe pela tabela
    preparedSpellsByLevel: [4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],
  },
  clerigo: {
    isCaster: true,
    spellcastingAbility: 'sabedoria',
    castingProgression: 1,
    cantripsKnownByLevel: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
    // Clérigo: WIS mod + nível (calculado dinamicamente)
  },
  druida: {
    isCaster: true,
    spellcastingAbility: 'sabedoria',
    castingProgression: 1,
    cantripsKnownByLevel: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    // Druida: WIS mod + nível (calculado dinamicamente)
  },
  feiticeiro: {
    isCaster: true,
    spellcastingAbility: 'carisma',
    castingProgression: 1,
    cantripsKnownByLevel: [4,4,4,5,5,5,6,6,6,7,7,7,7,7,7,7,7,7,7,7],
    // Feiticeiro conhece magias (não prepara): 2 no nível 1
    spellSlotsKnownByLevel: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,15,15,15,15,15,15],
  },
  guardiao: {
    isCaster: true,
    spellcastingAbility: 'sabedoria',
    castingProgression: 0.5,
    cantripsKnownByLevel: Array(20).fill(0),
    // Guardião: tabela fixa conforme PHB 2024 ("Magias Preparadas" column) — 2 no nível 1
    preparedSpellsByLevel: [2,3,4,4,5,5,6,6,7,7,7,7,7,7,7,7,7,7,7,7],
  },
  mago: {
    isCaster: true,
    spellcastingAbility: 'inteligencia',
    castingProgression: 1,
    cantripsKnownByLevel: [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
    // Mago: INT mod + nível (calculado dinamicamente)
  },
  paladino: {
    isCaster: true,
    spellcastingAbility: 'carisma',
    castingProgression: 0.5,
    cantripsKnownByLevel: Array(20).fill(0),
    // Paladino: CHA mod + floor(level/2), mínimo 1
    preparedSpellsByLevel: [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],
  },
  bruxo: {
    isCaster: true,
    spellcastingAbility: 'carisma',
    castingProgression: 'pact',
    cantripsKnownByLevel: [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
    // Bruxo conhece magias: 2 no nível 1
    spellSlotsKnownByLevel: [2,3,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
  },
};

// ---------------------------------------------------------------------------
// Acessores
// ---------------------------------------------------------------------------

export function getClassHPData(classId: string): ClassHPData | null {
  return CLASS_HP_DATA[classId] ?? null;
}

export function getClassProficiencyData(classId: string): ClassProficiencyData | null {
  return CLASS_PROFICIENCY_DATA[classId] ?? null;
}

export function getClassSpellcastingData(classId: string): ClassSpellcastingData | null {
  return CLASS_SPELLCASTING_DATA[classId] ?? null;
}

export function getClassDetails(classId: string): Record<string, unknown> | null {
  const details = classDetailsJson as Record<string, unknown>;
  return (details[classId] as Record<string, unknown>) ?? null;
}

export function isValidClass(classId: string): boolean {
  return classId in CLASS_HP_DATA;
}

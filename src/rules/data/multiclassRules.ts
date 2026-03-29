import type { ClassLevel } from '../../types/multiclass';
import type { SpellSlots } from '../types/DerivedSheet';

// ---------------------------------------------------------------------------
// Pré-requisitos de Multiclasse (PHB 2024)
// Para multiclassar, o personagem precisa de 13+ no(s) atributo(s) listados
// tanto da classe ATUAL quanto da classe NOVA.
// ---------------------------------------------------------------------------

export const MULTICLASS_PREREQUISITES: Record<string, string[]> = {
  barbaro:    ['forca'],
  bardo:      ['carisma'],
  bruxo:      ['carisma'],
  clerigo:    ['sabedoria'],
  druida:     ['sabedoria'],
  feiticeiro: ['carisma'],
  guardiao:   ['destreza', 'sabedoria'], // ambos >= 13
  guerreiro:  ['forca'],                 // ou destreza (usa o maior)
  ladino:     ['destreza'],
  mago:       ['inteligencia'],
  monge:      ['destreza', 'sabedoria'], // ambos >= 13
  paladino:   ['forca', 'carisma'],      // ambos >= 13
};

// Guerreiro aceita FOR ou DES >= 13
export function checkMulticlassPrerequisite(
  classId: string,
  modifiers: Record<string, number>,
  attributes: Record<string, number>,
): boolean {
  const reqs = MULTICLASS_PREREQUISITES[classId];
  if (!reqs) return false;

  if (classId === 'guerreiro') {
    return (attributes['forca'] ?? 0) >= 13 || (attributes['destreza'] ?? 0) >= 13;
  }

  return reqs.every(attr => (attributes[attr] ?? 0) >= 13);
}

// ---------------------------------------------------------------------------
// Proficiências ganhas ao multiclassar (subconjunto reduzido)
// ---------------------------------------------------------------------------

export const MULTICLASS_PROFICIENCIES: Record<string, { armor: string[]; weapons: string[]; skills: number }> = {
  barbaro:    { armor: ['Escudo'],             weapons: ['Arma Simples', 'Arma Marcial'], skills: 0 },
  bardo:      { armor: [],                     weapons: [],                                skills: 1 },
  bruxo:      { armor: [],                     weapons: [],                                skills: 0 },
  clerigo:    { armor: ['Armadura Leve', 'Armadura Média', 'Escudo'], weapons: [], skills: 0 },
  druida:     { armor: [],                     weapons: [],                                skills: 0 },
  feiticeiro: { armor: [],                     weapons: [],                                skills: 0 },
  guardiao:   { armor: ['Armadura Leve', 'Armadura Média', 'Escudo'], weapons: ['Arma Simples', 'Arma Marcial'], skills: 1 },
  guerreiro:  { armor: ['Armadura Leve', 'Armadura Média', 'Escudo'], weapons: ['Arma Simples', 'Arma Marcial'], skills: 0 },
  ladino:     { armor: ['Armadura Leve'],      weapons: [],                                skills: 1 },
  mago:       { armor: [],                     weapons: [],                                skills: 0 },
  monge:      { armor: [],                     weapons: ['Arma Simples'],                  skills: 0 },
  paladino:   { armor: ['Armadura Leve', 'Armadura Média', 'Escudo'], weapons: ['Arma Simples', 'Arma Marcial'], skills: 0 },
};

// ---------------------------------------------------------------------------
// Tabela de Spell Slots Multiclasse (PHB 2024)
// Índice = casterLevel - 1 (0-19)
// ---------------------------------------------------------------------------

const MULTICLASS_SPELL_SLOT_TABLE: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // caster level 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
];

// Progressão de conjuração por classe
const CASTING_PROGRESSION: Record<string, number> = {
  bardo: 1, clerigo: 1, druida: 1, feiticeiro: 1, mago: 1,  // full caster
  guardiao: 0.5, paladino: 0.5,                              // half caster
  // bruxo usa Pact Magic (separado), não entra na tabela multiclasse
};

/**
 * Calcula o nível efetivo de conjurador para multiclasse.
 * Full casters contam 1:1, half casters contam 1:2 (arredondado para baixo).
 * Bruxo NÃO entra neste cálculo (usa Pact Magic separado).
 */
export function getMulticlassCasterLevel(classLevels: ClassLevel[]): number {
  let total = 0;
  for (const cl of classLevels) {
    const prog = CASTING_PROGRESSION[cl.classId] ?? 0;
    if (prog === 1) total += cl.level;
    else if (prog === 0.5) total += Math.floor(cl.level / 2);
  }
  return total;
}

/**
 * Retorna spell slots para multiclasse baseado no caster level combinado.
 */
export function getMulticlassSpellSlots(casterLevel: number): SpellSlots | null {
  if (casterLevel <= 0) return null;
  const idx = Math.max(0, Math.min(casterLevel - 1, 19));
  const row = MULTICLASS_SPELL_SLOT_TABLE[idx];
  const slots: SpellSlots = {};
  for (let i = 0; i < 9; i++) {
    if (row[i] > 0) (slots as any)[i + 1] = row[i];
  }
  return slots;
}

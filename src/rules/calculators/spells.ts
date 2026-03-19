import { getClassSpellcastingData } from '../data/classRules';
import type { SpellSlots } from '../types/DerivedSheet';

// ---------------------------------------------------------------------------
// Identificação de conjurador
// ---------------------------------------------------------------------------

export function isCaster(classId: string): boolean {
  return getClassSpellcastingData(classId)?.isCaster ?? false;
}

export function getSpellcastingAbility(classId: string): string | null {
  return getClassSpellcastingData(classId)?.spellcastingAbility ?? null;
}

// ---------------------------------------------------------------------------
// Truques conhecidos
// ---------------------------------------------------------------------------

export function getCantripsKnown(classId: string, level: number): number {
  const data = getClassSpellcastingData(classId);
  if (!data?.isCaster) return 0;
  const idx = Math.max(0, Math.min(level - 1, 19));
  return data.cantripsKnownByLevel[idx] ?? 0;
}

// ---------------------------------------------------------------------------
// Espaços de Magia
// Tabela completa por classe e nível (D&D 2024)
// ---------------------------------------------------------------------------

/**
 * Tabela de espaços de magia para conjuradores completos (Bardo, Clérigo, Druida,
 * Feiticeiro, Mago).
 * Índice = nível-1; valor = [1º,2º,3º,4º,5º,6º,7º,8º,9º]
 */
const FULL_CASTER_SPELL_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // nível 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // nível 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // nível 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // nível 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // nível 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // nível 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // nível 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // nível 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // nível 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // nível 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // nível 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // nível 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // nível 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // nível 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // nível 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // nível 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // nível 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // nível 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // nível 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // nível 20
];

/**
 * Tabela de espaços para meio-conjuradores (Guardião, Paladino).
 * Eles não têm espaços no nível 1 do padrão 2014, mas no D&D 2024
 * Paladino E Guardião têm espaços desde nível 1 (PHB 2024).
 */
const HALF_CASTER_SPELL_SLOTS: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // nível 1
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // nível 2
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // nível 3
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // nível 4
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // nível 5
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // nível 6
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // nível 7
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // nível 8
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // nível 9
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // nível 10
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // nível 11
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // nível 12
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // nível 13
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // nível 14
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // nível 15
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // nível 16
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // nível 17
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // nível 18
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // nível 19
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // nível 20
];

/**
 * Espaços de Magia do Pacto (Bruxo).
 * Todos os espaços são do nível máximo disponível.
 * [quantidade, nível_do_espaço]
 */
const WARLOCK_PACT_SLOTS: Array<[number, number]> = [
  [1, 1], // nível 1
  [2, 1], // nível 2
  [2, 2], // nível 3
  [2, 2], // nível 4
  [2, 3], // nível 5
  [2, 3], // nível 6
  [2, 4], // nível 7
  [2, 4], // nível 8
  [2, 5], // nível 9
  [2, 5], // nível 10
  [3, 5], // nível 11
  [3, 5], // nível 12
  [3, 5], // nível 13
  [3, 5], // nível 14
  [3, 5], // nível 15
  [3, 5], // nível 16
  [4, 5], // nível 17
  [4, 5], // nível 18
  [4, 5], // nível 19
  [4, 5], // nível 20
];

function slotsArrayToRecord(arr: number[]): SpellSlots {
  const slots: SpellSlots = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 0) {
      (slots as Record<number, number>)[i + 1] = arr[i];
    }
  }
  return slots;
}

/**
 * Retorna os espaços de magia para a classe e nível.
 * Retorna null para não-conjuradores.
 */
export function getSpellSlots(classId: string, level: number): SpellSlots | null {
  const data = getClassSpellcastingData(classId);
  if (!data?.isCaster) return null;

  const idx = Math.max(0, Math.min(level - 1, 19));

  if (data.castingProgression === 1) {
    return slotsArrayToRecord(FULL_CASTER_SPELL_SLOTS[idx]);
  }

  if (data.castingProgression === 0.5) {
    return slotsArrayToRecord(HALF_CASTER_SPELL_SLOTS[idx]);
  }

  if (data.castingProgression === 'pact') {
    const [qty, slotLevel] = WARLOCK_PACT_SLOTS[idx];
    const slots: SpellSlots = {};
    (slots as Record<number, number>)[slotLevel] = qty;
    return slots;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Magias preparadas
// ---------------------------------------------------------------------------

/**
 * Retorna o número de magias preparadas para o nível 1 (ou nível fornecido).
 *
 * Regras por classe:
 * - Mago: INT mod + nível (mínimo 1)
 * - Clérigo/Druida: WIS mod + nível (mínimo 1)
 * - Paladino: CHA mod + floor(nível/2), mínimo 1
 * - Guardião: preparedSpellsByLevel fixo da tabela (2 no nível 1)
 * - Bardo: preparedSpellsByLevel fixo da tabela (4 no nível 1)
 * - Bruxo/Feiticeiro: spellSlotsKnownByLevel fixo (não preparam, conhecem)
 */
export function getPreparedSpellCount(
  classId: string,
  level: number,
  spellcastingAbilityModifier: number
): number {
  const data = getClassSpellcastingData(classId);
  if (!data?.isCaster) return 0;

  const idx = Math.max(0, Math.min(level - 1, 19));

  switch (classId) {
    case 'mago':
    case 'clerigo':
    case 'druida':
      // Mod + nível, mínimo 1
      return Math.max(1, spellcastingAbilityModifier + level);

    case 'paladino':
      // CHA mod + floor(nível/2), mínimo 1
      return Math.max(1, spellcastingAbilityModifier + Math.floor(level / 2));

    case 'guardiao':
    case 'bardo':
      // Tabela fixa
      return data.preparedSpellsByLevel?.[idx] ?? 0;

    case 'bruxo':
    case 'feiticeiro':
      // Conhecem (não preparam) — retornar o total de magias conhecidas
      return data.spellSlotsKnownByLevel?.[idx] ?? 0;

    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// CD e Bônus de Ataque Mágico
// ---------------------------------------------------------------------------

/** CD de magia = 8 + mod atributo de conjuração + BP */
export function calculateSpellSaveDC(
  spellcastingAbilityModifier: number,
  proficiencyBonus: number
): number {
  return 8 + spellcastingAbilityModifier + proficiencyBonus;
}

/** Bônus de ataque mágico = mod atributo de conjuração + BP */
export function calculateSpellAttackBonus(
  spellcastingAbilityModifier: number,
  proficiencyBonus: number
): number {
  return spellcastingAbilityModifier + proficiencyBonus;
}

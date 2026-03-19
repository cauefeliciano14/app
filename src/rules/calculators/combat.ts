import { getClassHPData } from '../data/classRules';
import { getArmorById, getArmorByName } from '../data/armorRules';
import { getWeaponByName } from '../data/weaponRules';
import type { WeaponAttack } from '../types/DerivedSheet';

// ---------------------------------------------------------------------------
// Pontos de Vida
// ---------------------------------------------------------------------------

/**
 * Calcula o máximo de PV no nível informado.
 * Nível 1: base_hp + mod_CON
 * Nível 2+: (base_hp + mod_CON) + (nível - 1) * (hp_fixo + mod_CON)
 */
export function calculateMaxHP(
  classId: string,
  level: number,
  conModifier: number
): number {
  const data = getClassHPData(classId);
  if (!data) return 0;

  if (level <= 1) {
    return data.level1BaseHp + conModifier;
  }

  return (
    (data.level1BaseHp + conModifier) +
    (level - 1) * (data.fixedHpPerLevel + conModifier)
  );
}

// ---------------------------------------------------------------------------
// Iniciativa
// ---------------------------------------------------------------------------

/** Iniciativa = modificador de Destreza */
export function calculateInitiative(dexModifier: number): number {
  return dexModifier;
}

// ---------------------------------------------------------------------------
// Classe de Armadura
// ---------------------------------------------------------------------------

/**
 * Calcula a CA considerando armadura equipada, escudo e classe.
 *
 * Sem armadura (padrão): 10 + mod DEX
 * Bárbaro sem armadura: 10 + mod DEX + mod CON  (classId='barbaro', conModifier fornecido)
 * Monge sem armadura:   10 + mod DEX + mod WIS  (classId='monge', wisModifier fornecido)
 * Armadura leve:        base + mod DEX
 * Armadura média:       base + min(mod DEX, 2)
 * Armadura pesada:      base (sem DEX)
 * Escudo:               +2 (acumulativo)
 */
export function calculateAC(params: {
  dexModifier: number;
  equippedArmorId?: string;
  hasShield?: boolean;
  classId?: string;
  conModifier?: number;
  wisModifier?: number;
}): number {
  const { dexModifier, equippedArmorId, hasShield, classId, conModifier, wisModifier } = params;

  let ac = 0;

  if (equippedArmorId) {
    // Tentar por ID primeiro, depois por nome
    const armor = getArmorById(equippedArmorId) ?? getArmorByName(equippedArmorId);

    if (armor && armor.type !== 'shield') {
      if (armor.type === 'light') {
        ac = armor.baseAC + dexModifier;
      } else if (armor.type === 'medium') {
        ac = armor.baseAC + Math.min(dexModifier, 2);
      } else {
        // heavy: sem bônus de DEX
        ac = armor.baseAC;
      }
    } else {
      // Armadura não encontrada — CA sem armadura
      ac = unarmoredAC(classId, dexModifier, conModifier, wisModifier);
    }
  } else {
    ac = unarmoredAC(classId, dexModifier, conModifier, wisModifier);
  }

  if (hasShield) {
    ac += 2;
  }

  return ac;
}

function unarmoredAC(
  classId: string | undefined,
  dexModifier: number,
  conModifier: number | undefined,
  wisModifier: number | undefined
): number {
  if (classId === 'barbaro' && conModifier !== undefined) {
    return 10 + dexModifier + conModifier; // Defesa sem Armadura
  }
  if (classId === 'monge' && wisModifier !== undefined) {
    return 10 + dexModifier + wisModifier; // Defesa sem Armadura do Monge
  }
  return 10 + dexModifier;
}

// ---------------------------------------------------------------------------
// Ataques
// ---------------------------------------------------------------------------

/** Bônus de ataque corpo a corpo: mod Força + BP (ou DEX se finesse e DEX > STR) */
export function calculateMeleeAttackBonus(
  strModifier: number,
  proficiencyBonus: number,
  isFinesse = false,
  dexModifier = 0
): number {
  const abilityMod = isFinesse
    ? Math.max(strModifier, dexModifier)
    : strModifier;
  return abilityMod + proficiencyBonus;
}

/** Bônus de ataque à distância: mod Destreza + BP */
export function calculateRangedAttackBonus(
  dexModifier: number,
  proficiencyBonus: number
): number {
  return dexModifier + proficiencyBonus;
}

/**
 * Constrói os dados de ataque para uma arma, incluindo bônus de ataque e dano.
 * Retorna null se a arma não for encontrada.
 */
export function buildWeaponAttack(
  weaponName: string,
  strModifier: number,
  dexModifier: number,
  proficiencyBonus: number
): WeaponAttack | null {
  const weapon = getWeaponByName(weaponName);
  if (!weapon) return null;

  let attackBonus: number;
  let damageBonus: number;

  if (weapon.isRanged) {
    attackBonus = calculateRangedAttackBonus(dexModifier, proficiencyBonus);
    damageBonus = dexModifier;
  } else if (weapon.isFinesse) {
    const mod = Math.max(strModifier, dexModifier);
    attackBonus = mod + proficiencyBonus;
    damageBonus = mod;
  } else {
    attackBonus = calculateMeleeAttackBonus(strModifier, proficiencyBonus);
    damageBonus = strModifier;
  }

  return {
    weaponName: weapon.name,
    attackBonus,
    damageBonus,
    damageDice: weapon.damageDice,
    damageType: weapon.damageType,
    isFinesse: weapon.isFinesse,
    range: weapon.range,
    properties: weapon.properties
      .split(',')
      .map(p => p.trim())
      .filter(Boolean),
    actionType: 'attack' as const,
  };
}

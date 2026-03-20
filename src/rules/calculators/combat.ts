import { getWeaponByName } from '../data/weaponRules';
import { getClassHPData } from '../data/classRules';
import type { WeaponAttack } from '../types/DerivedSheet';
import { hasArmorTraining, hasWeaponProficiency, resolveEquippedArmor } from '../utils/equipment';

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

export function calculateInitiative(dexModifier: number): number {
  return dexModifier;
}

export function calculateAC(params: {
  dexModifier: number;
  equippedArmorId?: string;
  hasShield?: boolean;
  classId?: string;
  conModifier?: number;
  wisModifier?: number;
  armorProficiencies?: string[];
}): number {
  const { dexModifier, equippedArmorId, hasShield, classId, conModifier, wisModifier, armorProficiencies = [] } = params;

  const equippedArmor = resolveEquippedArmor(equippedArmorId);
  const canUseArmor = hasArmorTraining(equippedArmor, armorProficiencies);

  let ac = canUseArmor && equippedArmor && equippedArmor.type !== 'shield'
    ? equippedArmor.baseAC + (equippedArmor.maxDexBonus === null ? dexModifier : Math.min(dexModifier, equippedArmor.maxDexBonus))
    : unarmoredAC(classId, dexModifier, conModifier, wisModifier);

  const canUseShield = hasShield && armorProficiencies.includes('Escudo');
  if (canUseShield) {
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
    return 10 + dexModifier + conModifier;
  }
  if (classId === 'monge' && wisModifier !== undefined) {
    return 10 + dexModifier + wisModifier;
  }
  return 10 + dexModifier;
}

export function calculateMeleeAttackBonus(
  strModifier: number,
  proficiencyBonus: number,
  isFinesse = false,
  dexModifier = 0,
  isProficient = true
): number {
  const abilityMod = isFinesse
    ? Math.max(strModifier, dexModifier)
    : strModifier;
  return abilityMod + (isProficient ? proficiencyBonus : 0);
}

export function calculateRangedAttackBonus(
  dexModifier: number,
  proficiencyBonus: number,
  isProficient = true
): number {
  return dexModifier + (isProficient ? proficiencyBonus : 0);
}

export function buildWeaponAttack(
  weaponName: string,
  strModifier: number,
  dexModifier: number,
  proficiencyBonus: number,
  weaponProficiencies: string[] = []
): WeaponAttack | null {
  const weapon = getWeaponByName(weaponName);
  if (!weapon) return null;

  const isProficient = hasWeaponProficiency(weaponName, weaponProficiencies);
  let attackBonus: number;
  let damageBonus: number;

  if (weapon.isRanged) {
    attackBonus = calculateRangedAttackBonus(dexModifier, proficiencyBonus, isProficient);
    damageBonus = dexModifier;
  } else if (weapon.isFinesse) {
    const mod = Math.max(strModifier, dexModifier);
    attackBonus = mod + (isProficient ? proficiencyBonus : 0);
    damageBonus = mod;
  } else {
    attackBonus = calculateMeleeAttackBonus(strModifier, proficiencyBonus, false, dexModifier, isProficient);
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

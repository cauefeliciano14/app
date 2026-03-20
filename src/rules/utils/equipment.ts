import { getArmorById, getArmorByName, type ArmorEntry } from '../data/armorRules';
import { getWeaponByName, type WeaponEntry } from '../data/weaponRules';
import type { ValidationInventoryItem } from '../types/CharacterChoices';

export function getArmorTrainingLabel(armor: ArmorEntry): string {
  switch (armor.type) {
    case 'light':
      return 'Armadura Leve';
    case 'medium':
      return 'Armadura Média';
    case 'heavy':
      return 'Armadura Pesada';
    case 'shield':
      return 'Escudo';
  }
}

export function hasArmorTraining(armor: ArmorEntry | null | undefined, armorProficiencies: string[] = []): boolean {
  if (!armor) return false;
  return armorProficiencies.includes(getArmorTrainingLabel(armor));
}

export function resolveEquippedArmor(equippedArmorId?: string): ArmorEntry | null {
  if (!equippedArmorId) return null;
  return getArmorById(equippedArmorId) ?? getArmorByName(equippedArmorId);
}

export function hasArmorInInventory(inventory: ValidationInventoryItem[], equippedArmorId?: string): boolean {
  if (!equippedArmorId) return false;
  return inventory.some((item) => {
    const armor = getArmorByName(item.name);
    return Boolean(armor && armor.type !== 'shield' && armor.id === equippedArmorId);
  });
}

export function hasShieldInInventory(inventory: ValidationInventoryItem[]): boolean {
  return inventory.some((item) => getArmorByName(item.name)?.type === 'shield');
}

export function sanitizeEquipmentState<T extends {
  inventory: Array<{ name: string; quantity?: number }>;
  equippedArmorId: string | null;
  hasShieldEquipped: boolean;
}>(equipment: T): T {
  const normalizedInventory = equipment.inventory.filter((item) => (item.quantity ?? 1) > 0);
  const nextEquippedArmorId = equipment.equippedArmorId && hasArmorInInventory(normalizedInventory, equipment.equippedArmorId)
    ? equipment.equippedArmorId
    : null;
  const nextHasShieldEquipped = equipment.hasShieldEquipped && hasShieldInInventory(normalizedInventory);
  const inventoryUnchanged = normalizedInventory.length === equipment.inventory.length
    && normalizedInventory.every((item, index) => item === equipment.inventory[index]);

  if (
    inventoryUnchanged
    && nextEquippedArmorId === equipment.equippedArmorId
    && nextHasShieldEquipped === equipment.hasShieldEquipped
  ) {
    return equipment;
  }

  return {
    ...equipment,
    inventory: normalizedInventory,
    equippedArmorId: nextEquippedArmorId,
    hasShieldEquipped: nextHasShieldEquipped,
  };
}

function getWeaponTrainingLabels(weapon: WeaponEntry): string[] {
  const labels = [weapon.name];
  if (weapon.category === 'simpleMelee' || weapon.category === 'simpleRanged') {
    labels.push('Armas Simples');
  }
  if (weapon.category === 'martialMelee' || weapon.category === 'martialRanged') {
    labels.push('Armas Marciais');
  }
  return labels;
}

export function hasWeaponProficiency(weaponName: string, weaponProficiencies: string[] = []): boolean {
  const weapon = getWeaponByName(weaponName);
  if (!weapon) return false;
  return getWeaponTrainingLabels(weapon).some((label) => weaponProficiencies.includes(label));
}

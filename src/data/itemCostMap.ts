import equipmentJson from './equipment.json';
import weaponsData from './weapons.json';
import armorJson from './armor.json';

export const ITEM_COST_MAP = new Map<string, string>();
{
  const gearItems = (equipmentJson as any).adventuringGear ?? [];
  for (const item of gearItems) {
    if (item.name && item.cost) ITEM_COST_MAP.set(item.name, item.cost);
  }
  for (const category of ['simpleMelee', 'simpleRanged', 'martialMelee', 'martialRanged'] as const) {
    for (const item of (weaponsData as any)[category] ?? []) {
      if (item.name && item.cost) ITEM_COST_MAP.set(item.name, item.cost);
    }
  }
  for (const category of ['lightArmor', 'mediumArmor', 'heavyArmor', 'shield'] as const) {
    for (const item of (armorJson as any)[category] ?? []) {
      if (item.name && item.cost) ITEM_COST_MAP.set(item.name, item.cost);
    }
  }
}

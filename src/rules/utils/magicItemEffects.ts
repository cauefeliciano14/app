import magicItems from '../../data/magicItems.json';

export interface MagicItemEffects {
  acBonus: number;
  acBonusUnarmored: number;
  savingThrowBonus: number;
  spellAttackBonus: number;
  spellDCBonus: number;
}

const EMPTY_EFFECTS: MagicItemEffects = {
  acBonus: 0,
  acBonusUnarmored: 0,
  savingThrowBonus: 0,
  spellAttackBonus: 0,
  spellDCBonus: 0,
};

interface MagicItemEntry {
  name: string;
  effects?: Partial<MagicItemEffects>;
}

export function aggregateMagicItemEffects(attunedItemIds: string[]): MagicItemEffects {
  if (!attunedItemIds.length) return EMPTY_EFFECTS;

  const result = { ...EMPTY_EFFECTS };

  for (const itemName of attunedItemIds) {
    const item = (magicItems as MagicItemEntry[]).find(m => m.name === itemName);
    if (!item?.effects) continue;
    result.acBonus += item.effects.acBonus ?? 0;
    result.acBonusUnarmored += item.effects.acBonusUnarmored ?? 0;
    result.savingThrowBonus += item.effects.savingThrowBonus ?? 0;
    result.spellAttackBonus += item.effects.spellAttackBonus ?? 0;
    result.spellDCBonus += item.effects.spellDCBonus ?? 0;
  }

  return result;
}

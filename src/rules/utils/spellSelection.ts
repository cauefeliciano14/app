import type { CharacterChoices } from '../types/CharacterChoices';
import { getFinalAttributes, calculateAllModifiers } from '../calculators/attributes';
import { getCantripsKnown, getPreparedSpellCount, getSpellcastingAbility, isCaster } from '../calculators/spells';

export interface SpellSelectionRequirement {
  isCaster: boolean;
  requiredCantrips: number;
  requiredPreparedSpells: number;
  mode: 'prepared-dynamic' | 'prepared-fixed' | 'known' | 'none';
}

export function getSpellSelectionRequirement(choices: Pick<CharacterChoices, 'classId' | 'level' | 'baseAttributes' | 'backgroundBonusDistribution'>): SpellSelectionRequirement {
  const classId = choices.classId ?? '';
  const level = choices.level ?? 1;

  if (!classId || !isCaster(classId)) {
    return { isCaster: false, requiredCantrips: 0, requiredPreparedSpells: 0, mode: 'none' };
  }

  const ability = getSpellcastingAbility(classId);
  const finalAttributes = getFinalAttributes(choices.baseAttributes, choices.backgroundBonusDistribution);
  const modifiers = calculateAllModifiers(finalAttributes);
  const abilityModifier = ability ? (modifiers[ability] ?? 0) : 0;
  const requiredCantrips = getCantripsKnown(classId, level);
  const requiredPreparedSpells = getPreparedSpellCount(classId, level, abilityModifier);

  let mode: SpellSelectionRequirement['mode'] = 'prepared-fixed';
  if (['clerigo', 'druida', 'mago', 'paladino'].includes(classId)) {
    mode = 'prepared-dynamic';
  } else if (['bruxo', 'feiticeiro'].includes(classId)) {
    mode = 'known';
  }

  return { isCaster: true, requiredCantrips, requiredPreparedSpells, mode };
}

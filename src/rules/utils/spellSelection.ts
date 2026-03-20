import type { CharacterChoices } from '../types/CharacterChoices';
import { getFinalAttributes, calculateAllModifiers } from '../calculators/attributes';
import { getCantripsKnown, getPreparedSpellCount, getSpellcastingAbility, isCaster } from '../calculators/spells';
import allSpellsData from '../../data/spells/spells_all.json';

export interface SpellSelectionRequirement {
  isCaster: boolean;
  requiredCantrips: number;
  requiredPreparedSpells: number;
  mode: 'prepared-dynamic' | 'prepared-fixed' | 'known' | 'none';
}

interface SpellReference {
  name: string;
  level: string | number;
  classes?: string[];
}

const CLASS_NAME_BY_ID: Record<string, string> = {
  bardo: 'Bardo',
  bruxo: 'Bruxo',
  clerigo: 'Clérigo',
  druida: 'Druida',
  feiticeiro: 'Feiticeiro',
  guardiao: 'Guardião',
  mago: 'Mago',
  paladino: 'Paladino',
};

const CLASS_SPELLS_BY_ID = Object.entries(CLASS_NAME_BY_ID).reduce<Record<string, SpellReference[]>>((acc, [classId, className]) => {
  acc[classId] = (allSpellsData as SpellReference[]).filter((spell) => spell.classes?.includes(className));
  return acc;
}, {});

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

export function getValidSpellNames(classId: string, level: 'cantrip' | 1): Set<string> {
  const spells = CLASS_SPELLS_BY_ID[classId] ?? [];

  return new Set(
    spells
      .filter((spell) => {
        if (level === 'cantrip') {
          return spell.level === 'Truque' || spell.level === 0;
        }

        return spell.level === 1 || spell.level === '1' || spell.level === '1º Círculo';
      })
      .map((spell) => spell.name),
  );
}

import type { CharacterChoices } from '../types/CharacterChoices';
import type { DerivedSheet } from '../types/DerivedSheet';

import { getClassHPData } from '../data/classRules';
import { getBackgroundTalent } from '../data/backgroundRules';
import { getSpeciesLevelOneEffects } from '../data/speciesRules';
import { applyTalentEffects } from '../data/talentRules';

import {
  getFinalAttributes,
  calculateAllModifiers,
} from '../calculators/attributes';

import {
  getProficiencyBonus,
  getClassBaseProficiencies,
  getBackgroundProficiencies,
  getChosenSkillProficiencies,
  mergeProficiencies,
} from '../calculators/proficiency';

import {
  calculateMaxHP,
  calculateInitiative,
  calculateAC,
  buildWeaponAttack,
} from '../calculators/combat';

import {
  isCaster,
  getSpellcastingAbility,
  getCantripsKnown,
  getSpellSlots,
  getPreparedSpellCount,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
} from '../calculators/spells';

import {
  deriveSkills,
  deriveSavingThrows,
  derivePassives,
  deriveUnarmedAttack,
} from '../calculators/sheet';

function addUnique(target: string[], values: string[] = []) {
  values.forEach((value) => {
    if (value && !target.includes(value)) target.push(value);
  });
}

function normalizeSpeciesChoices(choices: CharacterChoices): Record<string, string> {
  return {
    ...(choices.speciesChoices ?? {}),
    ...(choices.featureChoices ?? {}),
    skill: choices.speciesChoices?.skill ?? choices.featureChoices?.['humano-skill'] ?? choices.featureChoices?.['elfo-skill'],
    cantrip: choices.speciesChoices?.cantrip ?? choices.featureChoices?.['elfo-cantrip'],
    draconato: choices.speciesChoices?.draconato ?? choices.featureChoices?.draconato,
    elfo: choices.speciesChoices?.elfo ?? choices.speciesLineage ?? choices.featureChoices?.elfo,
    gnomo: choices.speciesChoices?.gnomo ?? choices.speciesLineage ?? choices.featureChoices?.gnomo,
    golias: choices.speciesChoices?.golias ?? choices.speciesLineage ?? choices.featureChoices?.golias,
    tiferino: choices.speciesChoices?.tiferino ?? choices.speciesLineage ?? choices.featureChoices?.tiferino,
  };
}

export function deriveSheet(choices: CharacterChoices): DerivedSheet {
  const classId = choices.classId ?? '';
  const backgroundId = choices.backgroundId ?? '';
  const speciesId = choices.speciesId ?? '';
  const level = choices.level ?? 1;

  const profBonus = getProficiencyBonus(level);
  const originTalent = backgroundId ? getBackgroundTalent(backgroundId) ?? undefined : undefined;
  const humanTalent = speciesId === 'humano' ? (choices.featureChoices['humano-talent'] ?? choices.speciesChoices?.talent) : undefined;
  const originTalentSelections = originTalent ? choices.talentSelections[originTalent] : undefined;
  const humanTalentSelections = humanTalent ? choices.talentSelections[humanTalent] : undefined;

  const appliedOriginTalent = applyTalentEffects(originTalent, originTalentSelections, 'background', level, profBonus);
  const appliedHumanTalent = applyTalentEffects(humanTalent, humanTalentSelections, 'species', level, profBonus);
  const appliedTalentEffects = [appliedOriginTalent, appliedHumanTalent].filter(Boolean);

  const rawFinalAttributes = getFinalAttributes(
    choices.baseAttributes,
    choices.backgroundBonusDistribution
  );

  const finalAttributes = { ...rawFinalAttributes } as Record<string, number>;
  for (const appliedTalent of appliedTalentEffects) {
    for (const [attribute, bonus] of Object.entries(appliedTalent?.attributeBonuses ?? {})) {
      finalAttributes[attribute] = (finalAttributes[attribute] ?? 0) + (bonus ?? 0);
    }
  }

  const modifiers = calculateAllModifiers(finalAttributes);

  const conMod = modifiers['constituicao'] ?? 0;
  const speciesChoices = normalizeSpeciesChoices(choices);
  const speciesEffects = speciesId ? getSpeciesLevelOneEffects(speciesId, speciesChoices) : undefined;

  const speciesHpBonus = (speciesEffects?.maxHpBonusPerLevel ?? 0) * level;
  const talentHpBonus = appliedTalentEffects.reduce((sum, effect) => sum + (effect?.maxHpBonus ?? 0), 0);
  const maxHP = (classId ? calculateMaxHP(classId, level, conMod) : 0) + speciesHpBonus + talentHpBonus;
  const hitDie = getClassHPData(classId)?.hitDieLabel ?? '—';

  const dexMod = modifiers['destreza'] ?? 0;
  const initiativeBase = calculateInitiative(dexMod);
  const initiativeBonusFromTalents = appliedTalentEffects.reduce((sum, effect) => sum + (effect?.initiativeBonus ?? 0), 0);
  const initiative = initiativeBase + initiativeBonusFromTalents;

  const classProfs = getClassBaseProficiencies(classId);
  const bgProfs = getBackgroundProficiencies(backgroundId);
  const chosenSkills = getChosenSkillProficiencies(classId, choices.featureChoices);
  const merged = mergeProficiencies(classProfs, bgProfs);

  addUnique(merged.skills, chosenSkills);
  addUnique(merged.skills, speciesEffects?.skillProficiencies);

  for (const appliedTalent of appliedTalentEffects) {
    addUnique(merged.skills, appliedTalent?.skillProficiencies);
    addUnique(merged.tools, appliedTalent?.toolProficiencies);
    addUnique(merged.savingThrows, appliedTalent?.savingThrowProficiencies);
  }

  if (choices.backgroundChoices?.toolProficiency) {
    const chosenTool = choices.backgroundChoices.toolProficiency;
    const bgDefaultTool = bgProfs.tools[0];
    const idx = merged.tools.indexOf(bgDefaultTool);
    if (idx >= 0) {
      merged.tools[idx] = chosenTool;
    } else if (!merged.tools.includes(chosenTool)) {
      merged.tools.push(chosenTool);
    }
  }

  const wisMod = modifiers['sabedoria'] ?? 0;
  const armorClass = calculateAC({
    dexModifier: dexMod,
    equippedArmorId: choices.equippedArmorId,
    hasShield: choices.hasShield,
    classId,
    conModifier: conMod,
    wisModifier: wisMod,
    armorProficiencies: merged.armorCategories,
  });

  const speed = speciesEffects?.speed ?? '9 metros';
  const specialSenses = [...(speciesEffects?.specialSenses ?? [])];
  const derivedDefenses = [...(speciesEffects?.derivedDefenses ?? [])];
  const racialCantrips = [...(speciesEffects?.racialCantrips ?? [])];
  const bonusCantrips: DerivedSheet['bonusCantrips'] = [];
  const bonusPreparedSpells: DerivedSheet['bonusPreparedSpells'] = [];
  const derivedTraits: DerivedSheet['derivedTraits'] = [];
  const activeTalents: DerivedSheet['activeTalents'] = [];

  for (const cantrip of racialCantrips) {
    bonusCantrips.push({ name: cantrip, source: 'species', origin: speciesId });
  }
  for (const spell of speciesEffects?.preparedSpells ?? []) {
    bonusPreparedSpells.push({ name: spell, source: 'species', origin: speciesId });
  }
  addUnique(derivedTraits, speciesEffects?.notes);

  for (const appliedTalent of appliedTalentEffects) {
    if (!appliedTalent) continue;
    activeTalents.push({
      name: appliedTalent.name,
      source: appliedTalent.source,
      notes: appliedTalent.notes ?? [],
    });
    addUnique(derivedDefenses, appliedTalent.derivedDefenses);
    addUnique(derivedTraits, appliedTalent.notes);
    for (const cantrip of appliedTalent.cantrips ?? []) {
      bonusCantrips.push({ name: cantrip, source: 'talent', origin: appliedTalent.name });
    }
    for (const spell of appliedTalent.preparedSpells ?? []) {
      bonusPreparedSpells.push({ name: spell, source: 'talent', origin: appliedTalent.name });
    }
  }

  const skills = deriveSkills(modifiers, profBonus, merged.skills);
  const derivedSavingThrows = deriveSavingThrows(modifiers, profBonus, merged.savingThrows);
  const { passivePerception, passiveInvestigation, passiveInsight } = derivePassives(skills);

  const strMod = modifiers['forca'] ?? 0;
  const computedWeaponAttacks = [] as DerivedSheet['weaponAttacks'];
  const unarmedDamageDice = appliedTalentEffects.find((effect) => effect?.unarmedDamageDice)?.unarmedDamageDice;
  computedWeaponAttacks.push(deriveUnarmedAttack(strMod, profBonus, unarmedDamageDice));

  for (const weaponName of choices.inventoryWeapons ?? []) {
    const atk = buildWeaponAttack(weaponName, strMod, dexMod, profBonus, merged.weaponCategories);
    if (atk) computedWeaponAttacks.push(atk);
  }

  const casterFlag = classId ? isCaster(classId) : false;
  let spellcastingAbility: string | undefined;
  let spellSaveDC: number | undefined;
  let spellAttackBonus: number | undefined;
  let spellSlots: DerivedSheet['spellSlots'];
  let preparedSpellCount: number | undefined;
  let cantripsKnown: number | undefined;

  if (casterFlag && classId) {
    const abilityKey = getSpellcastingAbility(classId);
    spellcastingAbility = abilityKey ?? undefined;
    const abilityMod = abilityKey ? (modifiers[abilityKey] ?? 0) : 0;

    spellSaveDC = calculateSpellSaveDC(abilityMod, profBonus);
    spellAttackBonus = calculateSpellAttackBonus(abilityMod, profBonus);
    spellSlots = getSpellSlots(classId, level) ?? undefined;
    preparedSpellCount = getPreparedSpellCount(classId, level, abilityMod);
    cantripsKnown = getCantripsKnown(classId, level);
  } else {
    // Check if any talent provides spellcasting (like Iniciado em Magia)
    const talentWithSpells = appliedTalentEffects.find(t => t?.spellcastingAbility);
    if (talentWithSpells && talentWithSpells.spellcastingAbility) {
      spellcastingAbility = talentWithSpells.spellcastingAbility;
      const abilityMod = modifiers[spellcastingAbility] ?? 0;
      spellSaveDC = calculateSpellSaveDC(abilityMod, profBonus);
      spellAttackBonus = calculateSpellAttackBonus(abilityMod, profBonus);
    }
  }

  const languages = choices.languageSelections ?? [];

  return {
    level,
    finalAttributes,
    modifiers,
    maxHP,
    hitDie,
    initiative,
    armorClass,
    proficiencyBonus: profBonus,
    speed,
    specialSenses,
    skillProficiencies: merged.skills,
    weaponProficiencies: merged.weaponCategories,
    armorProficiencies: merged.armorCategories,
    savingThrowProficiencies: merged.savingThrows,
    toolProficiencies: merged.tools,
    languages,
    skills,
    derivedSavingThrows,
    passivePerception,
    passiveInvestigation,
    passiveInsight,
    weaponAttacks: computedWeaponAttacks,
    isCaster: casterFlag,
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus,
    spellSlots,
    preparedSpellCount,
    cantripsKnown,
    racialCantrips,
    bonusCantrips,
    bonusPreparedSpells,
    derivedDefenses,
    derivedTraits,
    originTalent,
    activeTalents,
  };
}

export type { CharacterChoices } from '../types/CharacterChoices';
export type { DerivedSheet } from '../types/DerivedSheet';

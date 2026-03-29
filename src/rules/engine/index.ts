import type { CharacterChoices } from '../types/CharacterChoices';
import type { DerivedSheet } from '../types/DerivedSheet';

import { getClassHPData } from '../data/classRules';
import { getBackgroundTalent } from '../data/backgroundRules';
import { getSpeciesLevelOneEffects, getSpeciesData } from '../data/speciesRules';
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

import { aggregateMagicItemEffects } from '../utils/magicItemEffects';
import { getMulticlassCasterLevel, getMulticlassSpellSlots } from '../data/multiclassRules';

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

/** Classes e níveis mínimos que conferem Jack of All Trades */
const JACK_OF_ALL_TRADES_CLASSES: Record<string, number> = {
  bardo: 2,
};

/** Classes e níveis mínimos que conferem Expertise (e quantas perícias) */
const EXPERTISE_CLASSES: Record<string, { level: number; count: number }> = {
  ladino: { level: 1, count: 2 },
  bardo:  { level: 3, count: 2 },
};

export function deriveSheet(choices: CharacterChoices, expertiseSkills: string[] = [], attunedItemIds: string[] = []): DerivedSheet {
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

  // Computar breakdowns de atributos
  const attributeBreakdowns: Record<string, { label: string; value: number }[]> = {};
  for (const attr of Object.keys(choices.baseAttributes)) {
    const rows: { label: string; value: number }[] = [];
    rows.push({ label: 'Base', value: choices.baseAttributes[attr] ?? 0 });
    if (choices.backgroundBonusDistribution) {
      const bonus = choices.backgroundBonusDistribution.distribution[attr as keyof typeof choices.backgroundBonusDistribution.distribution];
      if (bonus && bonus > 0) {
        rows.push({ label: 'Antecedente', value: bonus });
      }
    }
    for (const appliedTalent of appliedTalentEffects) {
      const talentBonus = appliedTalent?.attributeBonuses?.[attr];
      if (talentBonus && talentBonus > 0) {
        rows.push({ label: appliedTalent.name, value: talentBonus });
      }
    }
    attributeBreakdowns[attr] = rows;
  }

  const conMod = modifiers['constituicao'] ?? 0;
  const speciesChoices = normalizeSpeciesChoices(choices);
  const speciesEffects = speciesId ? getSpeciesLevelOneEffects(speciesId, speciesChoices) : undefined;

  const speciesHpBonus = (speciesEffects?.maxHpBonusPerLevel ?? 0) * level;
  const talentHpBonus = appliedTalentEffects.reduce((sum, effect) => sum + (effect?.maxHpBonus ?? 0), 0);

  const classLevels = choices.classLevels;
  const isMulticlass = classLevels && classLevels.length > 1;

  let maxHP: number;
  if (isMulticlass) {
    // Multiclass: first class level 1 uses full HP, rest use fixedHpPerLevel
    maxHP = classLevels.reduce((sum, cl) => sum + calculateMaxHP(cl.classId, cl.level, conMod), 0);
  } else {
    maxHP = classId ? calculateMaxHP(classId, level, conMod) : 0;
  }
  maxHP += speciesHpBonus + talentHpBonus;

  const hitDie = isMulticlass
    ? classLevels.map(cl => { const d = getClassHPData(cl.classId); return d ? `${cl.level}${d.hitDieLabel}` : ''; }).filter(Boolean).join(' + ')
    : (getClassHPData(classId)?.hitDieLabel ?? '—');

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
  const fightingStyleChoice =
    choices.featureChoices?.['guerreiro-estilo-luta'] ??
    choices.featureChoices?.['guardiao-estilo-luta'] ??
    choices.featureChoices?.['paladino-estilo-luta'];
  const hasDefensivo = fightingStyleChoice === 'Defensivo';

  const magicEffects = aggregateMagicItemEffects(attunedItemIds);

  const baseAC = calculateAC({
    dexModifier: dexMod,
    equippedArmorId: choices.equippedArmorId,
    hasShield: choices.hasShield,
    classId,
    conModifier: conMod,
    wisModifier: wisMod,
    armorProficiencies: merged.armorCategories,
  });
  const isUnarmored = !choices.equippedArmorId;
  const armorClass = baseAC
    + (hasDefensivo ? 1 : 0)
    + magicEffects.acBonus
    + (isUnarmored ? magicEffects.acBonusUnarmored : 0);

  const speciesData = speciesId ? getSpeciesData(speciesId) : null;
  const creatureSize = speciesData?.vitalInfo?.size ?? 'Médio';
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

  const jackOfAllTradesMinLevel = JACK_OF_ALL_TRADES_CLASSES[classId] ?? Infinity;
  const jackOfAllTrades = level >= jackOfAllTradesMinLevel;

  const expertiseClassConfig = EXPERTISE_CLASSES[classId];
  const classGrantsExpertise = expertiseClassConfig ? level >= expertiseClassConfig.level : false;
  const activeExpertiseSkills = classGrantsExpertise ? expertiseSkills : [];

  const skills = deriveSkills(modifiers, profBonus, merged.skills, activeExpertiseSkills, jackOfAllTrades);
  const derivedSavingThrows = deriveSavingThrows(modifiers, profBonus, merged.savingThrows).map(st => ({
    ...st,
    modifier: st.modifier + magicEffects.savingThrowBonus,
  }));
  const { passivePerception, passiveInvestigation, passiveInsight } = derivePassives(skills);

  const strMod = modifiers['forca'] ?? 0;
  const computedWeaponAttacks = [] as DerivedSheet['weaponAttacks'];
  const unarmedDamageDice = appliedTalentEffects.find((effect) => effect?.unarmedDamageDice)?.unarmedDamageDice;
  computedWeaponAttacks.push(deriveUnarmedAttack(strMod, profBonus, unarmedDamageDice));

  for (const weaponName of choices.inventoryWeapons ?? []) {
    const atk = buildWeaponAttack(weaponName, strMod, dexMod, profBonus, merged.weaponCategories);
    if (atk) computedWeaponAttacks.push(atk);
  }

  const casterFlag = isMulticlass
    ? classLevels.some(cl => isCaster(cl.classId))
    : (classId ? isCaster(classId) : false);
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

    spellSaveDC = calculateSpellSaveDC(abilityMod, profBonus) + magicEffects.spellDCBonus;
    spellAttackBonus = calculateSpellAttackBonus(abilityMod, profBonus) + magicEffects.spellAttackBonus;

    // Multiclass spell slots: use combined caster level table
    if (isMulticlass) {
      const mcCasterLevel = getMulticlassCasterLevel(classLevels);
      spellSlots = (mcCasterLevel > 0 ? getMulticlassSpellSlots(mcCasterLevel) : null) ?? undefined;
    } else {
      spellSlots = getSpellSlots(classId, level) ?? undefined;
    }

    preparedSpellCount = getPreparedSpellCount(classId, level, abilityMod);
    cantripsKnown = getCantripsKnown(classId, level);
  } else if (isMulticlass) {
    // Non-caster primary class but multiclass may include a caster class
    const casterClass = classLevels.find(cl => isCaster(cl.classId));
    if (casterClass) {
      const abilityKey = getSpellcastingAbility(casterClass.classId);
      spellcastingAbility = abilityKey ?? undefined;
      const abilityMod = abilityKey ? (modifiers[abilityKey] ?? 0) : 0;
      spellSaveDC = calculateSpellSaveDC(abilityMod, profBonus) + magicEffects.spellDCBonus;
      spellAttackBonus = calculateSpellAttackBonus(abilityMod, profBonus) + magicEffects.spellAttackBonus;
      const mcCasterLevel = getMulticlassCasterLevel(classLevels);
      spellSlots = (mcCasterLevel > 0 ? getMulticlassSpellSlots(mcCasterLevel) : null) ?? undefined;
      preparedSpellCount = getPreparedSpellCount(casterClass.classId, casterClass.level, abilityMod);
      cantripsKnown = getCantripsKnown(casterClass.classId, casterClass.level);
    } else {
      // Check talents
      const talentWithSpells = appliedTalentEffects.find(t => t?.spellcastingAbility);
      if (talentWithSpells && talentWithSpells.spellcastingAbility) {
        spellcastingAbility = talentWithSpells.spellcastingAbility;
        const abilityMod = modifiers[spellcastingAbility] ?? 0;
        spellSaveDC = calculateSpellSaveDC(abilityMod, profBonus) + magicEffects.spellDCBonus;
        spellAttackBonus = calculateSpellAttackBonus(abilityMod, profBonus) + magicEffects.spellAttackBonus;
      }
    }
  } else {
    // Check if any talent provides spellcasting (like Iniciado em Magia)
    const talentWithSpells = appliedTalentEffects.find(t => t?.spellcastingAbility);
    if (talentWithSpells && talentWithSpells.spellcastingAbility) {
      spellcastingAbility = talentWithSpells.spellcastingAbility;
      const abilityMod = modifiers[spellcastingAbility] ?? 0;
      spellSaveDC = calculateSpellSaveDC(abilityMod, profBonus) + magicEffects.spellDCBonus;
      spellAttackBonus = calculateSpellAttackBonus(abilityMod, profBonus) + magicEffects.spellAttackBonus;
    }
  }

  const languages = choices.languageSelections ?? [];

  return {
    level,
    finalAttributes,
    modifiers,
    attributeBreakdowns,
    maxHP,
    hitDie,
    initiative,
    armorClass,
    proficiencyBonus: profBonus,
    speed,
    creatureSize,
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
    classGrantsExpertise,
    expertiseCount: expertiseClassConfig?.count ?? 0,
    jackOfAllTrades,
    classLevels: classLevels ?? undefined,
  };
}

export type { CharacterChoices } from '../types/CharacterChoices';
export type { DerivedSheet } from '../types/DerivedSheet';

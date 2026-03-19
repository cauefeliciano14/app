import type { CharacterChoices } from '../types/CharacterChoices';
import type { DerivedSheet } from '../types/DerivedSheet';

import { getClassHPData } from '../data/classRules';
import { getBackgroundTalent } from '../data/backgroundRules';
import { getSpeciesSpeed, getSpecialSenses } from '../data/speciesRules';

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

// ---------------------------------------------------------------------------
// deriveSheet — função principal do engine
// ---------------------------------------------------------------------------

/**
 * Recebe todas as escolhas do personagem e retorna a ficha derivada completa.
 * Determinística: mesma entrada → mesma saída.
 *
 * Nota: validação agora é separada — use validateChoices() independentemente.
 */
const DRACONIC_RESISTANCE_BY_LINEAGE: Record<string, string> = {
  azul: 'Resistência a Elétrico',
  branco: 'Resistência a Gélido',
  bronze: 'Resistência a Elétrico',
  cobre: 'Resistência a Ácido',
  latas: 'Resistência a Ígneo',
  negro: 'Resistência a Ácido',
  ouro: 'Resistência a Ígneo',
  prata: 'Resistência a Gélido',
  verde: 'Resistência a Venenoso',
  vermelho: 'Resistência a Ígneo',
};

export function deriveSheet(choices: CharacterChoices): DerivedSheet {

  // Atributos
  const finalAttributes = getFinalAttributes(
    choices.baseAttributes,
    choices.backgroundBonusDistribution
  );
  const modifiers = calculateAllModifiers(finalAttributes);

  const classId = choices.classId ?? '';
  const backgroundId = choices.backgroundId ?? '';
  const speciesId = choices.speciesId ?? '';
  const level = choices.level ?? 1;

  // Proficiência
  const profBonus = getProficiencyBonus(level);

  // HP
  const conMod = modifiers['constituicao'] ?? 0;
  const maxHP = classId ? calculateMaxHP(classId, level, conMod) : 0;
  const hitDie = getClassHPData(classId)?.hitDieLabel ?? '—';

  // Iniciativa
  const dexMod = modifiers['destreza'] ?? 0;
  const initiative = calculateInitiative(dexMod);

  // CA
  const wisMod = modifiers['sabedoria'] ?? 0;
  const armorClass = calculateAC({
    dexModifier: dexMod,
    equippedArmorId: choices.equippedArmorId,
    hasShield: choices.hasShield,
    classId,
    conModifier: conMod,
    wisModifier: wisMod,
  });

  // Proficiências
  const classProfs = getClassBaseProficiencies(classId);
  const bgProfs = getBackgroundProficiencies(backgroundId);
  const chosenSkills = getChosenSkillProficiencies(classId, choices.featureChoices);
  const merged = mergeProficiencies(classProfs, bgProfs);

  for (const skill of chosenSkills) {
    if (!merged.skills.includes(skill)) {
      merged.skills.push(skill);
    }
  }

  // Substituir ferramenta genérica do antecedente pela escolha real
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

  // Velocidade e sentidos (da espécie)
  const speed = speciesId ? getSpeciesSpeed(speciesId) : '9 metros';
  const specialSenses = speciesId ? getSpecialSenses(speciesId) : [];

  // Efeitos de espécie (apenas efeitos sustentados pelos dados e exibidos na ficha)
  const racialCantrips: string[] = [];
  const derivedDefenses: string[] = [];
  if (speciesId && choices.speciesChoices) {
    // Humano: perícia extra
    if (speciesId === 'humano' && choices.speciesChoices['skill']) {
      const extraSkill = choices.speciesChoices['skill'];
      if (!merged.skills.includes(extraSkill)) {
        merged.skills.push(extraSkill);
      }
    }
    // Elfo alto-elfo: truque racial (não conta no limite de classe)
    if (speciesId === 'elfo' && choices.speciesLineage === 'alto-elfo' && choices.speciesChoices['cantrip']) {
      racialCantrips.push(choices.speciesChoices['cantrip']);
    }

    // Draconato: resistência permanente conforme a herança dracônica escolhida
    if (speciesId === 'draconato') {
      const draconicLineage = choices.speciesChoices['draconato'];
      const derivedResistance = draconicLineage ? DRACONIC_RESISTANCE_BY_LINEAGE[draconicLineage] : undefined;
      if (derivedResistance) {
        derivedDefenses.push(derivedResistance);
      }
    }
  }

  // Perícias derivadas tipadas
  const skills = deriveSkills(modifiers, profBonus, merged.skills);

  // Salvaguardas derivadas tipadas
  const derivedSavingThrows = deriveSavingThrows(modifiers, profBonus, merged.savingThrows);

  // Passivas
  const { passivePerception, passiveInvestigation, passiveInsight } = derivePassives(skills);

  // Ataques de armas
  const strMod = modifiers['forca'] ?? 0;

  const computedWeaponAttacks = [] as DerivedSheet['weaponAttacks'];

  // Sempre incluir ataque desarmado
  computedWeaponAttacks.push(deriveUnarmedAttack(strMod, profBonus));

  // Armas do inventário
  for (const weaponName of choices.inventoryWeapons ?? []) {
    const atk = buildWeaponAttack(weaponName, strMod, dexMod, profBonus);
    if (atk) computedWeaponAttacks.push(atk);
  }

  // Magia
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
  }

  // Talento de origem
  const originTalent = backgroundId ? getBackgroundTalent(backgroundId) ?? undefined : undefined;

  // Idiomas: mesclando do antecedente + seleções do jogador
  const languages = choices.languageSelections ?? [];

  return {
    level,
    finalAttributes: finalAttributes as Record<string, number>,
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
    derivedDefenses,
    originTalent,
  };
}

// Re-exportar tipos para conveniência
export type { CharacterChoices } from '../types/CharacterChoices';
export type { DerivedSheet } from '../types/DerivedSheet';

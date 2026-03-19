import { getClassProficiencyData } from '../data/classRules';
import { getBackgroundSkillProficiencies, getBackgroundToolProficiency } from '../data/backgroundRules';

// ---------------------------------------------------------------------------
// Bônus de Proficiência
// ---------------------------------------------------------------------------

/** Tabela padrão de Bônus de Proficiência (D&D 2024) */
const PROFICIENCY_BONUS_TABLE: number[] = [
  2, 2, 2, 2,   // níveis 1–4
  3, 3, 3, 3,   // níveis 5–8
  4, 4, 4, 4,   // níveis 9–12
  5, 5, 5, 5,   // níveis 13–16
  6, 6, 6, 6,   // níveis 17–20
];

export function getProficiencyBonus(level: number): number {
  const idx = Math.max(0, Math.min(level - 1, 19));
  return PROFICIENCY_BONUS_TABLE[idx];
}

// ---------------------------------------------------------------------------
// Estrutura de proficiências
// ---------------------------------------------------------------------------

export interface Proficiencies {
  skills: string[];
  weaponCategories: string[];
  armorCategories: string[];
  savingThrows: string[];
  tools: string[];
}

function emptyProficiencies(): Proficiencies {
  return {
    skills: [],
    weaponCategories: [],
    armorCategories: [],
    savingThrows: [],
    tools: [],
  };
}

/** Merge de múltiplos sets de proficiências, sem duplicatas */
export function mergeProficiencies(...sets: Proficiencies[]): Proficiencies {
  const merged = emptyProficiencies();
  for (const s of sets) {
    for (const skill of s.skills) {
      if (!merged.skills.includes(skill)) merged.skills.push(skill);
    }
    for (const w of s.weaponCategories) {
      if (!merged.weaponCategories.includes(w)) merged.weaponCategories.push(w);
    }
    for (const a of s.armorCategories) {
      if (!merged.armorCategories.includes(a)) merged.armorCategories.push(a);
    }
    for (const st of s.savingThrows) {
      if (!merged.savingThrows.includes(st)) merged.savingThrows.push(st);
    }
    for (const t of s.tools) {
      if (!merged.tools.includes(t)) merged.tools.push(t);
    }
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Proficiências por classe
// ---------------------------------------------------------------------------

/**
 * Retorna as proficiências base da classe (sem perícias escolhidas pelo usuário).
 * As perícias escolhidas são adicionadas pelo engine ao ler featureChoices.
 */
export function getClassBaseProficiencies(classId: string): Proficiencies {
  const data = getClassProficiencyData(classId);
  if (!data) return emptyProficiencies();
  return {
    skills: [], // perícias escolhidas pelo usuário, não as do pool
    weaponCategories: data.weaponProficiencies,
    armorCategories: data.armorProficiencies,
    savingThrows: data.savingThrows,
    tools: [],
  };
}

// ---------------------------------------------------------------------------
// Proficiências por antecedente
// ---------------------------------------------------------------------------

export function getBackgroundProficiencies(backgroundId: string): Proficiencies {
  const skills = getBackgroundSkillProficiencies(backgroundId);
  const tool = getBackgroundToolProficiency(backgroundId);
  return {
    skills,
    weaponCategories: [],
    armorCategories: [],
    savingThrows: [],
    tools: tool ? [tool] : [],
  };
}

// ---------------------------------------------------------------------------
// Perícias escolhidas (de featureChoices do personagem)
// ---------------------------------------------------------------------------

/**
 * Extrai as perícias escolhidas pelo usuário para a classe
 * a partir do mapa de featureChoices.
 */
export function getChosenSkillProficiencies(
  classId: string,
  featureChoices: Record<string, string>
): string[] {
  const data = getClassProficiencyData(classId);
  if (!data) return [];

  const chosen: string[] = [];
  // As chaves de escolha de perícia têm o padrão "{classId}-skill-{n}"
  for (let i = 1; i <= data.skillChoiceCount; i++) {
    const key = `${classId}-skill-${i}`;
    const value = featureChoices[key];
    if (value && !chosen.includes(value)) {
      chosen.push(value);
    }
  }
  return chosen;
}

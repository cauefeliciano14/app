/**
 * Mapeamento de sinergias classe ↔ antecedente baseado em atributos primários
 * e proficiências complementares do D&D 5e (2024).
 */
export const CLASS_BG_SYNERGIES: Record<string, string[]> = {
  barbaro:   ['soldado', 'andarilho', 'marinheiro', 'guia'],
  bardo:     ['artista', 'charlatao', 'nobre', 'escriba'],
  bruxo:     ['charlatao', 'sabio', 'criminoso', 'eremita'],
  clerigo:   ['acolito', 'eremita', 'nobre', 'guarda'],
  druida:    ['eremita', 'andarilho', 'guia', 'fazendeiro'],
  feiticeiro:['nobre', 'eremita', 'artista', 'sabio'],
  guardiao:  ['soldado', 'guarda', 'nobre', 'fazendeiro'],
  guerreiro: ['soldado', 'nobre', 'marinheiro', 'guarda'],
  ladino:    ['criminoso', 'charlatao', 'andarilho', 'artesao'],
  mago:      ['acolito', 'sabio', 'eremita', 'escriba'],
  monge:     ['eremita', 'acolito', 'andarilho', 'guia'],
  paladino:  ['soldado', 'acolito', 'nobre', 'guarda'],
};

/** Verifica se um antecedente é recomendado para uma classe */
export function isSynergy(classId: string | undefined, bgId: string): boolean {
  if (!classId) return false;
  return CLASS_BG_SYNERGIES[classId]?.includes(bgId) ?? false;
}

/** Verifica se uma classe é recomendada para um antecedente */
export function isClassSynergyForBg(bgId: string | undefined, classId: string): boolean {
  if (!bgId) return false;
  return CLASS_BG_SYNERGIES[classId]?.includes(bgId) ?? false;
}

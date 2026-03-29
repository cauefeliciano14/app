/**
 * Constantes de atributos compartilhadas por múltiplos componentes.
 * Centraliza ATTR_KEYS, ATTR_ABBR e ATTR_META para evitar duplicações.
 */

export const ATTR_KEYS = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'] as const;

export type AttrKey = typeof ATTR_KEYS[number];

export const ATTR_ABBR: Record<string, string> = {
  forca: 'FOR',
  destreza: 'DES',
  constituicao: 'CON',
  inteligencia: 'INT',
  sabedoria: 'SAB',
  carisma: 'CAR',
};

export const ATTR_META: Record<string, { full: string; abbr: string; icon: string; desc: string }> = {
  forca:        { full: 'Força',        abbr: 'FOR', icon: '⚔️', desc: 'Poder físico e força bruta.' },
  destreza:     { full: 'Destreza',     abbr: 'DES', icon: '🏹', desc: 'Agilidade, reflexos e equilíbrio.' },
  constituicao: { full: 'Constituição', abbr: 'CON', icon: '🛡️', desc: 'Resistência, saúde e vitalidade.' },
  inteligencia: { full: 'Inteligência', abbr: 'INT', icon: '📖', desc: 'Raciocínio, memória e conhecimento.' },
  sabedoria:    { full: 'Sabedoria',    abbr: 'SAB', icon: '🦉', desc: 'Percepção, intuição e sintonização.' },
  carisma:      { full: 'Carisma',      abbr: 'CAR', icon: '✨', desc: 'Personalidade, influência e persuasão.' },
};

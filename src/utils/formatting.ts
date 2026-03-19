export const ATTRIBUTE_MAP: Record<string, string> = {
  'Atletismo': 'FOR',
  'Acrobacia': 'DES', 'Furtividade': 'DES', 'Prestidigitação': 'DES',
  'Arcanismo': 'INT', 'História': 'INT', 'Investigação': 'INT', 'Natureza': 'INT', 'Religião': 'INT',
  'Adestrar Animais': 'SAB', 'Lidar com Animais': 'SAB', 'Intuição': 'SAB', 'Medicina': 'SAB', 'Percepção': 'SAB', 'Sobrevivência': 'SAB',
  'Atuação': 'CAR', 'Enganação': 'CAR', 'Intimidação': 'CAR', 'Persuasão': 'CAR'
};

export const formatDice = (text: string) => text.replace(/\b[Dd]\d+\b/g, (match) => match.toLowerCase());

export const formatSkill = (skill: string) => {
  const attr = ATTRIBUTE_MAP[skill];
  if (!attr) return skill;
  return `${skill} (${attr})`;
};

export const getSkillParts = (skillWithAttr: string) => {
  // Handles both "Pericia" and "Pericia (ATTR)"
  const match = skillWithAttr.match(/^([^(]+)(?:\s*\(([^)]+)\))?$/);
  if (!match) return { name: skillWithAttr, attr: '' };
  return { name: match[1].trim(), attr: match[2] || ATTRIBUTE_MAP[match[1].trim()] || '' };
};

// ─── Keyword Highlighting ────────────────────────────────────────────────────

import { GLOSSARY } from '../data/glossary';

const HIGHLIGHT_KEYWORDS: string[] = Object.keys(GLOSSARY);

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Sort longest-first to prevent partial matches
const sortedKeywords = [...HIGHLIGHT_KEYWORDS].sort((a, b) => b.length - a.length);
const keywordRegex = new RegExp(`\\b(${sortedKeywords.map(escapeRegex).join('|')})\\b`, 'g');

export const highlightKeywords = (text: string): string => {
  const withDice = formatDice(text);
  return withDice.replace(keywordRegex, '<span class="glossary-term" data-glossary="$&" style="color:#e2e8f0;font-weight:600;border-bottom:1px dotted rgba(249,115,22,0.4);cursor:help">$&</span>');
};

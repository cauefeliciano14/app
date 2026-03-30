export interface DiceTheme {
  id: string;
  label: string;
  faceColor: string;
  numberColor: string;
  emissive: string;
}

export const DICE_THEMES: DiceTheme[] = [
  { id: 'crimson', label: 'Carmesim', faceColor: '#8b1a1a', numberColor: '#ffd700', emissive: '#330808' },
  { id: 'midnight', label: 'Meia-Noite', faceColor: '#1a1a4e', numberColor: '#e0e0ff', emissive: '#0a0a2a' },
  { id: 'emerald', label: 'Esmeralda', faceColor: '#0d5e3a', numberColor: '#e0ffe0', emissive: '#042e1a' },
  { id: 'gold', label: 'Ouro', faceColor: '#6b5a1f', numberColor: '#fff8dc', emissive: '#352d0f' },
  { id: 'obsidian', label: 'Obsidiana', faceColor: '#1a1a1a', numberColor: '#c0c0c0', emissive: '#0a0a0a' },
];

export function getTheme(id: string): DiceTheme {
  return DICE_THEMES.find(t => t.id === id) ?? DICE_THEMES[0];
}

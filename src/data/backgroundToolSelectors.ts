import { ARTISAN_TOOLS, MUSICAL_INSTRUMENTS, GAMING_SETS } from './talentChoiceConfig';

export const BACKGROUND_TOOL_SELECTORS: Record<string, { label: string; options: string[] }> = {
  artesao: { label: "Ferramentas de Artesão", options: ARTISAN_TOOLS },
  artista: { label: "Instrumento Musical",    options: MUSICAL_INSTRUMENTS },
  guarda:  { label: "Kit de Jogos",           options: GAMING_SETS },
  nobre:   { label: "Kit de Jogos",           options: GAMING_SETS },
  soldado: { label: "Kit de Jogos",           options: GAMING_SETS },
};

export const BACKGROUNDS_WITH_TOOL_SELECTOR = new Set([
  'artesao', 'artista', 'guarda', 'nobre', 'soldado',
]);

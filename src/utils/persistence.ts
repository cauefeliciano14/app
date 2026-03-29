import type { Character } from '../types/character';
import type { CharacterPlayState } from '../types/playState';
import { DEFAULT_PLAY_STATE } from '../types/playState';

export const CREATION_STORAGE_KEY = 'dnd_creation_state';
export const CREATION_STATE_VERSION = 1;
export const CHARACTERS_LIST_KEY = 'dnd_characters_list';
export const ACTIVE_CHARACTER_KEY = 'dnd_active_character_id';

export interface CreationStateSnapshot {
  character: Character;
  currentStep: number;
  auxiliaryState?: any;
  shellState?: {
    sidebarCollapsed?: boolean;
    summaryCollapsed?: boolean;
  };
}

export function loadCreationState(): CreationStateSnapshot | null {
  try {
    const raw = localStorage.getItem(CREATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CREATION_STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ── Multi-character management ──────────────────────────────────────────────

export interface SavedCharacterMeta {
  id: string;
  name: string;
  className: string;
  speciesName: string;
  level: number;
  portrait: string | null;
  savedAt: number;
}

export interface SavedCharacter extends SavedCharacterMeta {
  creationSnapshot: CreationStateSnapshot;
  playState: CharacterPlayState;
  selectedBackgroundId?: string | null;
  attrChoiceMode?: string;
  attrPlus1?: string;
  attrPlus2?: string;
}

export function listSavedCharacters(): SavedCharacterMeta[] {
  try {
    const raw = localStorage.getItem(CHARACTERS_LIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedCharacterMeta[];
  } catch {
    return [];
  }
}

export function loadSavedCharacter(id: string): SavedCharacter | null {
  try {
    const raw = localStorage.getItem(`dnd_char_${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as SavedCharacter;
  } catch {
    return null;
  }
}

export function saveCharacter(saved: SavedCharacter): void {
  try {
    localStorage.setItem(`dnd_char_${saved.id}`, JSON.stringify(saved));
    const list = listSavedCharacters();
    const meta: SavedCharacterMeta = {
      id: saved.id,
      name: saved.name,
      className: saved.className,
      speciesName: saved.speciesName,
      level: saved.level,
      portrait: saved.portrait,
      savedAt: saved.savedAt,
    };
    const idx = list.findIndex(c => c.id === saved.id);
    if (idx >= 0) list[idx] = meta;
    else list.push(meta);
    localStorage.setItem(CHARACTERS_LIST_KEY, JSON.stringify(list));
  } catch {
    // storage quota exceeded — ignore
  }
}

export function deleteCharacter(id: string): void {
  try {
    localStorage.removeItem(`dnd_char_${id}`);
    const list = listSavedCharacters().filter(c => c.id !== id);
    localStorage.setItem(CHARACTERS_LIST_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function getActiveCharacterId(): string | null {
  return localStorage.getItem(ACTIVE_CHARACTER_KEY);
}

export function setActiveCharacterId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_CHARACTER_KEY, id);
  else localStorage.removeItem(ACTIVE_CHARACTER_KEY);
}

export function makeEmptyPlayState(): CharacterPlayState {
  return { ...DEFAULT_PLAY_STATE };
}

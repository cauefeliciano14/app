import type { Character } from '../types/character';

export const CREATION_STORAGE_KEY = 'dnd_creation_state';
export const CREATION_STATE_VERSION = 1;

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

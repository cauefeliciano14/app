import { CLASS_OPTION_IDS_BY_CLASS, ALL_CLASS_OPTION_IDS, KNOWN_SPECIES_IDS } from '../data/classOptionIds';
import { BACKGROUNDS_WITH_TOOL_SELECTOR } from '../data/backgroundToolSelectors';

export function normalizeFeatureChoices(
  rawChoices: Record<string, string>,
  currentClassId: string | null,
  currentSpeciesId: string | null,
  currentBackgroundId: string | null,
): Record<string, string> {
  const normalized: Record<string, string> = {};
  const currentClassOptionIds = currentClassId ? (CLASS_OPTION_IDS_BY_CLASS[currentClassId] ?? new Set<string>()) : new Set<string>();
  const currentSpeciesPrefix = currentSpeciesId ? `${currentSpeciesId}-` : null;
  const allowToolChoice = Boolean(currentBackgroundId && BACKGROUNDS_WITH_TOOL_SELECTOR.has(currentBackgroundId));

  for (const [key, value] of Object.entries(rawChoices)) {
    if (!value) continue;

    if (ALL_CLASS_OPTION_IDS.has(key)) {
      if (currentClassOptionIds.has(key)) normalized[key] = value;
      continue;
    }

    if (KNOWN_SPECIES_IDS.has(key)) {
      if (key === currentSpeciesId) normalized[key] = value;
      continue;
    }

    if ([...KNOWN_SPECIES_IDS].some((speciesId) => key.startsWith(`${speciesId}-`))) {
      if (currentSpeciesPrefix && key.startsWith(currentSpeciesPrefix)) normalized[key] = value;
      continue;
    }

    if (key === 'toolProficiency') {
      if (allowToolChoice) normalized[key] = value;
      continue;
    }

    normalized[key] = value;
  }

  return normalized;
}

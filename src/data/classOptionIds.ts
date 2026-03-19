import classDetailsData from './classDetails.json';

export const KNOWN_SPECIES_IDS = new Set([
  'draconato', 'elfo', 'gnomo', 'golias', 'tiferino', 'aasimar', 'humano',
]);

export const CLASS_OPTION_IDS_BY_CLASS = Object.fromEntries(
  Object.entries(classDetailsData as Record<string, { options?: Array<{ id: string }> }>).map(([classId, details]) => [
    classId,
    new Set((details.options ?? []).map((option) => option.id)),
  ])
) as Record<string, Set<string>>;

export const ALL_CLASS_OPTION_IDS = new Set(
  Object.values(CLASS_OPTION_IDS_BY_CLASS).flatMap((ids) => Array.from(ids))
);

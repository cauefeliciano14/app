import speciesJson from '../../data/species.json';

interface RawSpecies {
  id: string;
  name: string;
  vitalInfo: { type: string; size: string; speed: string };
  racialTraits: Array<{ title: string; description: string }>;
}

const SPECIES_MAP: Map<string, RawSpecies> = new Map(
  (speciesJson as { species: RawSpecies[] }).species.map(s => [s.id, s])
);

export function getSpeciesData(speciesId: string): RawSpecies | null {
  return SPECIES_MAP.get(speciesId) ?? null;
}

export function getSpeciesSpeed(speciesId: string): string {
  return getSpeciesData(speciesId)?.vitalInfo.speed ?? '9 metros';
}

export function getSpecialSenses(speciesId: string): string[] {
  const species = getSpeciesData(speciesId);
  if (!species) return [];
  return species.racialTraits
    .filter(t => /visão|sentido|percep/i.test(t.title))
    .map(t => {
      // "Visão no Escuro" + "Você tem Visão no Escuro com um alcance de 18 metros." → "Visão no Escuro (18 m)"
      const alcance = t.description.match(/alcance de ([\d,]+ metros)/i);
      return alcance ? `${t.title} (${alcance[1]})` : t.title;
    });
}

export function getSpeciesTraits(speciesId: string): Array<{ title: string; description: string }> {
  return getSpeciesData(speciesId)?.racialTraits ?? [];
}

export function getSpeciesName(speciesId: string): string {
  return getSpeciesData(speciesId)?.name ?? speciesId;
}

import speciesJson from '../../data/species.json';

interface RawSpeciesTrait {
  title: string;
  description: string;
}

interface RawLineageChoice {
  id: string;
  name: string;
  description: string;
  mechanics?: string;
  nv1?: string;
  nv3?: string;
  nv5?: string;
}

interface RawSpecies {
  id: string;
  name: string;
  vitalInfo: { type: string; size: string; speed: string };
  racialTraits: RawSpeciesTrait[];
  lineage?: {
    title: string;
    description: string;
    choices: RawLineageChoice[];
  };
}

export interface SpeciesLevelOneEffects {
  speed?: string;
  specialSenses?: string[];
  derivedDefenses?: string[];
  skillProficiencies?: string[];
  racialCantrips?: string[];
  preparedSpells?: string[];
  notes?: string[];
  maxHpBonusPerLevel?: number;
}

const SPECIES_MAP: Map<string, RawSpecies> = new Map(
  (speciesJson as { species: RawSpecies[] }).species.map(s => [s.id, s])
);

const DRACONIC_RESISTANCE_BY_LINEAGE: Record<string, string> = {
  azul: 'Resistência a Elétrico',
  branco: 'Resistência a Gélido',
  bronze: 'Resistência a Elétrico',
  cobre: 'Resistência a Ácido',
  latas: 'Resistência a Ígneo',
  negro: 'Resistência a Ácido',
  ouro: 'Resistência a Ígneo',
  prata: 'Resistência a Gélido',
  verde: 'Resistência a Venenoso',
  vermelho: 'Resistência a Ígneo',
};

const TIEFLING_EFFECTS_BY_LINEAGE: Record<string, Pick<SpeciesLevelOneEffects, 'derivedDefenses' | 'racialCantrips'>> = {
  abissal: {
    derivedDefenses: ['Resistência a Venenoso'],
    racialCantrips: ['Rajada de Veneno'],
  },
  ctonico: {
    derivedDefenses: ['Resistência a Necrótico'],
    racialCantrips: ['Toque Necrótico'],
  },
  infernal: {
    derivedDefenses: ['Resistência a Ígneo'],
    racialCantrips: ['Raio de Fogo'],
  },
};

const GNOME_EFFECTS_BY_LINEAGE: Record<string, Pick<SpeciesLevelOneEffects, 'racialCantrips' | 'preparedSpells'>> = {
  'gnomo-do-bosque': {
    racialCantrips: ['Ilusão Menor'],
    preparedSpells: ['Falar com Animais'],
  },
  'gnomo-das-rochas': {
    racialCantrips: ['Prestidigitação Arcana', 'Reparar'],
  },
};

const ELF_EFFECTS_BY_LINEAGE: Record<string, SpeciesLevelOneEffects> = {
  'alto-elfo': {
    notes: ['Escolha 1 truque de Mago após cada Descanso Longo.'],
  },
  drow: {
    specialSenses: ['Visão no Escuro (36 metros)'],
    racialCantrips: ['Luzes Dançantes'],
  },
  'elfo-silvestre': {
    speed: '10,5 metros',
    racialCantrips: ['Arte Druídica'],
  },
};

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
    .filter(t => /visão|sentido/i.test(t.title))
    .map(t => {
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

function unique(values: string[] = []): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function getSpeciesLevelOneEffects(speciesId: string, choices: Record<string, string> = {}): SpeciesLevelOneEffects {
  const baseEffects: SpeciesLevelOneEffects = {
    speed: getSpeciesSpeed(speciesId),
    specialSenses: getSpecialSenses(speciesId),
    derivedDefenses: [],
    skillProficiencies: [],
    racialCantrips: [],
    preparedSpells: [],
    notes: [],
  };

  switch (speciesId) {
    case 'aasimar':
      baseEffects.derivedDefenses?.push('Resistência a Necrótico', 'Resistência a Radiante');
      baseEffects.racialCantrips?.push('Luz');
      break;
    case 'anao':
      baseEffects.derivedDefenses?.push('Resistência a Venenoso', 'Vantagem contra Envenenado');
      baseEffects.maxHpBonusPerLevel = 1;
      break;
    case 'draconato': {
      const lineage = choices.draconato;
      const resistance = lineage ? DRACONIC_RESISTANCE_BY_LINEAGE[lineage] : undefined;
      if (resistance) baseEffects.derivedDefenses?.push(resistance);
      break;
    }
    case 'elfo': {
      const lineage = choices.elfo;
      const skill = choices.skill;
      if (skill) baseEffects.skillProficiencies?.push(skill);
      const lineageEffects = lineage ? ELF_EFFECTS_BY_LINEAGE[lineage] : undefined;
      if (lineageEffects?.speed) baseEffects.speed = lineageEffects.speed;
      if (lineageEffects?.specialSenses?.length) baseEffects.specialSenses = lineageEffects.specialSenses;
      if (lineageEffects?.racialCantrips?.length) baseEffects.racialCantrips?.push(...lineageEffects.racialCantrips);
      if (lineage === 'alto-elfo' && choices.cantrip) baseEffects.racialCantrips?.push(choices.cantrip);
      if (lineageEffects?.notes?.length) baseEffects.notes?.push(...lineageEffects.notes);
      break;
    }
    case 'gnomo': {
      const lineage = choices.gnomo;
      const lineageEffects = lineage ? GNOME_EFFECTS_BY_LINEAGE[lineage] : undefined;
      if (lineageEffects?.racialCantrips?.length) baseEffects.racialCantrips?.push(...lineageEffects.racialCantrips);
      if (lineageEffects?.preparedSpells?.length) baseEffects.preparedSpells?.push(...lineageEffects.preparedSpells);
      break;
    }
    case 'humano':
      if (choices.skill) baseEffects.skillProficiencies?.push(choices.skill);
      break;
    case 'tiferino': {
      const lineage = choices.tiferino;
      const lineageEffects = lineage ? TIEFLING_EFFECTS_BY_LINEAGE[lineage] : undefined;
      if (lineageEffects?.derivedDefenses?.length) baseEffects.derivedDefenses?.push(...lineageEffects.derivedDefenses);
      baseEffects.racialCantrips?.push('Taumaturgia');
      if (lineageEffects?.racialCantrips?.length) baseEffects.racialCantrips?.push(...lineageEffects.racialCantrips);
      break;
    }
    default:
      break;
  }

  return {
    ...baseEffects,
    specialSenses: unique(baseEffects.specialSenses),
    derivedDefenses: unique(baseEffects.derivedDefenses),
    skillProficiencies: unique(baseEffects.skillProficiencies),
    racialCantrips: unique(baseEffects.racialCantrips),
    preparedSpells: unique(baseEffects.preparedSpells),
    notes: unique(baseEffects.notes),
  };
}

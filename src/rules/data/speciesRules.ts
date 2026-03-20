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

const GNOME_EFFECTS_BY_LINEAGE: Record<string, Pick<SpeciesLevelOneEffects, 'racialCantrips' | 'preparedSpells' | 'notes'>> = {
  'gnomo-do-bosque': {
    racialCantrips: ['Ilusão Menor'],
    preparedSpells: ['Falar com Animais'],
    notes: ['Falar com Animais fica sempre preparada e pode ser conjurada sem espaço de magia um número de vezes igual ao bônus de proficiência por Descanso Longo.'],
  },
  'gnomo-das-rochas': {
    racialCantrips: ['Prestidigitação Arcana', 'Reparar'],
    notes: ['Pode fabricar um pequeno dispositivo mecânico ao conjurar Prestidigitação Arcana por 10 minutos.'],
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

const GOLIATH_NOTES_BY_LINEAGE: Record<string, string> = {
  gelo: 'Arrepio do Gelo: ao acertar um ataque, causa +1d6 de dano Gélido e reduz o deslocamento do alvo em 3m até o início do seu próximo turno.',
  fogo: 'Queimadura de Fogo: ao acertar um ataque, causa +1d10 de dano Ígneo adicional.',
  pedra: 'Resistência da Pedra: reação para reduzir dano em 1d12 + modificador de Constituição.',
  nuvens: 'Salto da Nuvem: ação bônus para se teleportar até 9 metros para um espaço visível desocupado.',
  colina: 'Tombo da Colina: ao acertar uma criatura Grande ou menor, pode deixá-la Caída.',
  tempestade: 'Trovão da Tempestade: reação para causar 1d8 de dano Trovejante a uma criatura que lhe causou dano a até 18 metros.',
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
      baseEffects.notes?.push('Mãos Curativas: uma vez por Descanso Longo, cura 2d4 PV no nível 1.');
      break;
    case 'anao':
      baseEffects.derivedDefenses?.push('Resistência a Venenoso', 'Vantagem contra Envenenado');
      baseEffects.specialSenses?.push('Sismiconsciência (18 metros, por 10 minutos ao tocar pedra)');
      baseEffects.notes?.push('Conhecimento de Pedras: como ação bônus, ganha Sismiconsciência por 10 minutos ao tocar pedra.');
      baseEffects.maxHpBonusPerLevel = 1;
      break;
    case 'draconato': {
      const lineage = choices.draconato;
      const resistance = lineage ? DRACONIC_RESISTANCE_BY_LINEAGE[lineage] : undefined;
      if (resistance) baseEffects.derivedDefenses?.push(resistance);
      baseEffects.notes?.push('Ataque de Sopro: substitui um ataque por cone de 4,5m ou linha de 9m que causa 1d10 do tipo da herança.');
      break;
    }
    case 'elfo': {
      const lineage = choices.elfo;
      const skill = choices.skill;
      if (skill) baseEffects.skillProficiencies?.push(skill);
      baseEffects.notes?.push('Ancestralidade Feérica: vantagem para evitar ou encerrar a condição Enfeitiçado.', 'Transe: completa Descanso Longo em 4 horas.');
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
      baseEffects.notes?.push('Astúcia de Gnomo: vantagem em salvaguardas de Inteligência, Sabedoria e Carisma.');
      if (lineageEffects?.racialCantrips?.length) baseEffects.racialCantrips?.push(...lineageEffects.racialCantrips);
      if (lineageEffects?.preparedSpells?.length) baseEffects.preparedSpells?.push(...lineageEffects.preparedSpells);
      if (lineageEffects?.notes?.length) baseEffects.notes?.push(...lineageEffects.notes);
      break;
    }
    case 'golias': {
      baseEffects.notes?.push(
        'Porte Poderoso: vantagem para encerrar a condição Imobilizado e conta como um tamanho maior para capacidade de carga.',
      );
      const lineage = choices.golias;
      const lineageNote = lineage ? GOLIATH_NOTES_BY_LINEAGE[lineage] : undefined;
      if (lineageNote) baseEffects.notes?.push(lineageNote);
      break;
    }
    case 'humano':
      if (choices.skill) baseEffects.skillProficiencies?.push(choices.skill);
      baseEffects.notes?.push('Eficiente: ganha Inspiração Heroica ao completar um Descanso Longo.');
      break;
    case 'orc':
      baseEffects.notes?.push(
        'Pico de Adrenalina: ação bônus para Correr e ganhar PV temporários iguais ao bônus de proficiência.',
        'Vigor Implacável: ao cair a 0 PV, fica com 1 PV uma vez por Descanso Longo.',
      );
      break;
    case 'pequenino':
      baseEffects.notes?.push(
        'Corajoso: vantagem para evitar ou encerrar a condição Amedrontado.',
        'Agilidade Pequenina: pode se mover pelo espaço de criaturas maiores.',
        'Sorte: ao tirar 1 em um d20 de um teste d20, pode jogar novamente o dado.',
        'Furtividade Natural: pode se esconder atrás de uma criatura maior.',
      );
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

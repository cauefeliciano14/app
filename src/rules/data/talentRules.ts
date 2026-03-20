import type { AttributeKey } from '../types/CharacterChoices';
import { ALL_TOOLS, SKILLS } from '../../data/talentChoiceConfig';

export interface AppliedTalentEffect {
  name: string;
  source: 'background' | 'species';
  skillProficiencies?: string[];
  toolProficiencies?: string[];
  savingThrowProficiencies?: string[];
  cantrips?: string[];
  preparedSpells?: string[];
  derivedDefenses?: string[];
  notes?: string[];
  initiativeBonus?: number;
  maxHpBonus?: number;
  unarmedDamageDice?: string;
  attributeBonuses?: Partial<Record<AttributeKey, number>>;
}

const ATTRIBUTE_LABEL_TO_KEY: Record<string, AttributeKey> = {
  Força: 'forca',
  Destreza: 'destreza',
  Constituição: 'constituicao',
  Inteligência: 'inteligencia',
  Sabedoria: 'sabedoria',
  Carisma: 'carisma',
};

function unique(values: string[] = []): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function applyTalentEffects(
  talentName: string | undefined,
  selections: Record<string, string> | undefined,
  source: AppliedTalentEffect['source'],
  level: number,
  proficiencyBonus: number,
): AppliedTalentEffect | null {
  if (!talentName) return null;

  const effect: AppliedTalentEffect = {
    name: talentName,
    source,
    skillProficiencies: [],
    toolProficiencies: [],
    savingThrowProficiencies: [],
    cantrips: [],
    preparedSpells: [],
    derivedDefenses: [],
    notes: [],
    attributeBonuses: {},
  };

  switch (talentName) {
    case 'Alerta':
      effect.initiativeBonus = proficiencyBonus;
      effect.notes?.push('Soma o bônus de proficiência na iniciativa.');
      break;
    case 'Artifista':
    case 'Artífice':
      effect.toolProficiencies?.push(selections?.tool1 ?? '', selections?.tool2 ?? '', selections?.tool3 ?? '');
      effect.notes?.push('Desconto de 20% em itens não mágicos.', 'Pode fabricar 1 item simples ao fim de um Descanso Longo.');
      break;
    case 'Curandeiro':
      effect.notes?.push('Médico de Combate com Kit de Curandeiro.', 'Pode repetir resultados 1 em cura.');
      break;
    case 'Habilidoso':
      [selections?.pick1, selections?.pick2, selections?.pick3].filter(Boolean).forEach((pick) => {
        if (!pick) return;
        if (SKILLS.includes(pick)) effect.skillProficiencies?.push(pick);
        if (ALL_TOOLS.includes(pick)) effect.toolProficiencies?.push(pick);
      });
      break;
    case 'Iniciado em Magia (Clérigo)':
    case 'Iniciado em Magia (Druida)':
    case 'Iniciado em Magia (Mago)':
    case 'Iniciado em Magia':
      effect.cantrips?.push(selections?.cantrip1 ?? '', selections?.cantrip2 ?? '');
      if (selections?.level1Spell) effect.preparedSpells?.push(selections.level1Spell);
      effect.notes?.push('1 magia de 1º círculo preparada pelo talento (1 uso grátis por Descanso Longo).');
      break;
    case 'Músico':
      effect.toolProficiencies?.push(selections?.inst1 ?? '', selections?.inst2 ?? '', selections?.inst3 ?? '');
      effect.notes?.push('Pode conceder Inspiração Heroica a aliados após descanso.');
      break;
    case 'Sortudo':
      effect.notes?.push(`Pontos de Sorte: ${proficiencyBonus} por Descanso Longo.`);
      break;
    case 'Valentão de Taverna':
      effect.unarmedDamageDice = '1d4';
      effect.notes?.push('Proficiência com armas improvisadas.', 'Ataque desarmado causa 1d4 + Força e pode empurrar 1,5m uma vez por turno.');
      break;
    case 'Vigoroso':
      effect.maxHpBonus = level * 2;
      effect.notes?.push(`PV máximos +${level * 2}.`);
      break;
    case 'Resiliente': {
      const chosenAttribute = selections?.ability;
      const key = chosenAttribute ? ATTRIBUTE_LABEL_TO_KEY[chosenAttribute] : undefined;
      if (key) {
        effect.attributeBonuses![key] = 1;
        if (chosenAttribute) effect.savingThrowProficiencies?.push(chosenAttribute);
      }
      break;
    }
    case 'Resistente':
      if (selections?.damageType) effect.derivedDefenses?.push(`Resistência a ${selections.damageType}`);
      break;
    case 'Telecinético':
    case 'Telepático': {
      const chosenAttribute = selections?.ability;
      const key = chosenAttribute ? ATTRIBUTE_LABEL_TO_KEY[chosenAttribute] : undefined;
      if (key) effect.attributeBonuses![key] = 1;
      effect.notes?.push(talentName === 'Telecinético' ? 'Empurrão telecinético como Ação Bônus.' : 'Comunicação telepática a até 18m.');
      break;
    }
    case 'Especialista em Perícia':
      if (selections?.skill) effect.notes?.push(`Especialização em ${selections.skill}.`);
      break;
    default:
      break;
  }

  effect.skillProficiencies = unique(effect.skillProficiencies);
  effect.toolProficiencies = unique(effect.toolProficiencies);
  effect.savingThrowProficiencies = unique(effect.savingThrowProficiencies);
  effect.cantrips = unique(effect.cantrips);
  effect.preparedSpells = unique(effect.preparedSpells);
  effect.derivedDefenses = unique(effect.derivedDefenses);
  effect.notes = unique(effect.notes);

  return effect;
}

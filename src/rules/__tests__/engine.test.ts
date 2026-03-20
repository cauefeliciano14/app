import { describe, it, expect } from 'vitest';
import { deriveSheet } from '../engine/index';
import type { CharacterChoices } from '../types/CharacterChoices';

// ---------------------------------------------------------------------------
// Helper para construir choices mínimas válidas
// ---------------------------------------------------------------------------
function makeChoices(overrides: Partial<CharacterChoices>): CharacterChoices {
  return {
    classId: null,
    backgroundId: null,
    speciesId: null,
    attributeMethod: 'standard',
    baseAttributes: {
      forca: 10, destreza: 10, constituicao: 10,
      inteligencia: 10, sabedoria: 10, carisma: 10,
    },
    backgroundBonusDistribution: null,
    equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    spellSelections: { cantrips: [], prepared: [] },
    talentSelections: {},
    languageSelections: [],
    featureChoices: {},
    characterDetails: { name: '', portrait: null },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// GOLDEN TEST 1 — Guerreiro Humano (Soldado)
// STR 16 / DEX 10 / CON 14 / INT 10 / WIS 10 / CHA 10
// Background soldado: +2/+1 em FOR e CON (or allowedAttributes verificar)
// Após bônus: STR 16, CON 14 (assumindo os bônus já estão nos base attrs)
//
// MaxHP: 10 (guerreiro base) + 2 (CON mod) = 12
// Iniciativa: +0 (DEX 10 → mod 0)
// CA sem armadura: 10 + 0 = 10
// Bônus Proficiência: +2
// Não é conjurador
// ---------------------------------------------------------------------------
describe('Golden Test 1 — Guerreiro Humano (Soldado)', () => {
  const choices = makeChoices({
    classId: 'guerreiro',
    backgroundId: 'soldado',
    speciesId: 'humano',
    attributeMethod: 'standard',
    baseAttributes: {
      forca: 16, destreza: 10, constituicao: 14,
      inteligencia: 10, sabedoria: 10, carisma: 10,
    },
    backgroundBonusDistribution: null, // bônus já incluídos nos base attrs
    featureChoices: {
      'guerreiro-skill-1': 'Atletismo',
      'guerreiro-skill-2': 'Intimidação',
    },
  });

  const sheet = deriveSheet(choices);

  it('MaxHP = 12 (base 10 + CON mod 2)', () => expect(sheet.maxHP).toBe(12));
  it('Iniciativa = 0 (DEX 10)', () => expect(sheet.initiative).toBe(0));
  it('CA sem armadura = 10', () => expect(sheet.armorClass).toBe(10));
  it('Bônus de Proficiência = +2', () => expect(sheet.proficiencyBonus).toBe(2));
  it('Não é conjurador', () => expect(sheet.isCaster).toBe(false));
  it('Sem espaços de magia', () => expect(sheet.spellSlots).toBeUndefined());
  it('Modificador de Força = +3', () => expect(sheet.modifiers['forca']).toBe(3));
  it('Modificador de Constituição = +2', () => expect(sheet.modifiers['constituicao']).toBe(2));
  it('Hit Die = 1d10', () => expect(sheet.hitDie).toBe('1d10'));
  it('Tem proficiência em armadura pesada', () => expect(sheet.armorProficiencies).toContain('Armadura Pesada'));
  it('Salvaguardas de Força e Constituição', () => {
    expect(sheet.savingThrowProficiencies).toContain('Força');
    expect(sheet.savingThrowProficiencies).toContain('Constituição');
  });
  it('Tem perícia Atletismo', () => {
    expect(sheet.skillProficiencies.some(s => s.includes('Atletismo'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GOLDEN TEST 2 — Mago Elfo (Sábio)
// STR 8 / DEX 14 / CON 12 / INT 16 / WIS 10 / CHA 10
// MaxHP: 6 + 1 (CON mod) = 7
// CA sem armadura: 10 + 2 = 12
// Iniciativa: +2
// SpellSaveDC: 8 + 3 (INT mod) + 2 (BP) = 13
// SpellAttackBonus: 3 + 2 = +5
// Magias preparadas: 3 (INT mod) + 1 (nível) = 4
// Truques: 3
// ---------------------------------------------------------------------------
describe('Golden Test 2 — Mago Elfo (Sábio)', () => {
  const choices = makeChoices({
    classId: 'mago',
    backgroundId: 'sabio',
    speciesId: 'elfo',
    baseAttributes: {
      forca: 8, destreza: 14, constituicao: 12,
      inteligencia: 16, sabedoria: 10, carisma: 10,
    },
    backgroundBonusDistribution: null,
    featureChoices: {
      'mago-skill-1': 'Arcanismo',
      'mago-skill-2': 'História',
    },
  });

  const sheet = deriveSheet(choices);

  it('MaxHP = 7 (base 6 + CON mod 1)', () => expect(sheet.maxHP).toBe(7));
  it('CA sem armadura = 12 (10 + DEX +2)', () => expect(sheet.armorClass).toBe(12));
  it('Iniciativa = +2', () => expect(sheet.initiative).toBe(2));
  it('Bônus de Proficiência = +2', () => expect(sheet.proficiencyBonus).toBe(2));
  it('É conjurador', () => expect(sheet.isCaster).toBe(true));
  it('Atributo de conjuração: inteligencia', () => expect(sheet.spellcastingAbility).toBe('inteligencia'));
  it('Spell Save DC = 13', () => expect(sheet.spellSaveDC).toBe(13));
  it('Spell Attack Bonus = +5', () => expect(sheet.spellAttackBonus).toBe(5));
  it('Magias preparadas = 4 (INT+3 + nível 1)', () => expect(sheet.preparedSpellCount).toBe(4));
  it('Truques conhecidos = 3', () => expect(sheet.cantripsKnown).toBe(3));
  it('2 espaços de 1º círculo no nível 1', () => expect(sheet.spellSlots?.[1]).toBe(2));
  it('Hit Die = 1d6', () => expect(sheet.hitDie).toBe('1d6'));
  it('Modificador de INT = +3', () => expect(sheet.modifiers['inteligencia']).toBe(3));
});

// ---------------------------------------------------------------------------
// GOLDEN TEST 3 — Paladino Anão (Guarda)
// STR 16 / DEX 8 / CON 14 / INT 10 / WIS 10 / CHA 14
// MaxHP: 10 + 2 (CON mod) = 12
// CA sem armadura: 10 + (-1) = 9
// Iniciativa: -1 (DEX 8 → mod -1)
// BP: +2
// SpellSaveDC: 8 + 2 (CHA mod) + 2 (BP) = 12
// Magias preparadas paladino: CHA mod (2) + floor(1/2) (0) = 2, mín 1 → 2
// ---------------------------------------------------------------------------
describe('Golden Test 3 — Paladino Anão (Guarda)', () => {
  const choices = makeChoices({
    classId: 'paladino',
    backgroundId: 'guarda',
    speciesId: 'anao',
    baseAttributes: {
      forca: 16, destreza: 8, constituicao: 14,
      inteligencia: 10, sabedoria: 10, carisma: 14,
    },
    backgroundBonusDistribution: null,
    featureChoices: {
      'paladino-skill-1': 'Atletismo',
      'paladino-skill-2': 'Religião',
    },
  });

  const sheet = deriveSheet(choices);

  it('MaxHP = 13 (base 10 + CON mod 2 + tenacidade anã)', () => expect(sheet.maxHP).toBe(13));
  it('Iniciativa = +1 (DEX 8 + talento Alerta)', () => expect(sheet.initiative).toBe(1));
  it('CA sem armadura = 9 (10 - 1)', () => expect(sheet.armorClass).toBe(9));
  it('Bônus de Proficiência = +2', () => expect(sheet.proficiencyBonus).toBe(2));
  it('É conjurador', () => expect(sheet.isCaster).toBe(true));
  it('Atributo de conjuração: carisma', () => expect(sheet.spellcastingAbility).toBe('carisma'));
  it('Spell Save DC = 12', () => expect(sheet.spellSaveDC).toBe(12));
  it('Magias preparadas = 2', () => expect(sheet.preparedSpellCount).toBe(2));
  it('Truques conhecidos = 0 (Paladino)', () => expect(sheet.cantripsKnown).toBe(0));
  it('2 espaços de 1º círculo (D&D 2024)', () => expect(sheet.spellSlots?.[1]).toBe(2));
  it('Hit Die = 1d10', () => expect(sheet.hitDie).toBe('1d10'));
  it('Tem proficiência em armadura pesada', () => expect(sheet.armorProficiencies).toContain('Armadura Pesada'));
  it('Salvaguardas de Sabedoria e Carisma', () => {
    expect(sheet.savingThrowProficiencies).toContain('Sabedoria');
    expect(sheet.savingThrowProficiencies).toContain('Carisma');
  });
});

// ---------------------------------------------------------------------------
// GOLDEN TEST 4 — Ladino Pequenino (Criminoso)
// STR 8 / DEX 16 / CON 12 / INT 12 / WIS 10 / CHA 10
// MaxHP: 8 + 1 (CON mod) = 9
// CA sem armadura: 10 + 3 = 13
// Iniciativa: +3
// BP: +2
// Não é conjurador
// ---------------------------------------------------------------------------
describe('Golden Test 4 — Ladino Pequenino (Criminoso)', () => {
  const choices = makeChoices({
    classId: 'ladino',
    backgroundId: 'criminoso',
    speciesId: 'pequenino',
    baseAttributes: {
      forca: 8, destreza: 16, constituicao: 12,
      inteligencia: 12, sabedoria: 10, carisma: 10,
    },
    backgroundBonusDistribution: null,
    featureChoices: {
      'ladino-skill-1': 'Furtividade',
      'ladino-skill-2': 'Prestidigitação',
      'ladino-skill-3': 'Acrobacia',
      'ladino-skill-4': 'Enganação',
    },
  });

  const sheet = deriveSheet(choices);

  it('MaxHP = 9 (base 8 + CON mod 1)', () => expect(sheet.maxHP).toBe(9));
  it('CA sem armadura = 13 (10 + DEX +3)', () => expect(sheet.armorClass).toBe(13));
  it('Iniciativa = +5 (DEX + talento Alerta)', () => expect(sheet.initiative).toBe(5));
  it('Bônus de Proficiência = +2', () => expect(sheet.proficiencyBonus).toBe(2));
  it('Não é conjurador', () => expect(sheet.isCaster).toBe(false));
  it('Hit Die = 1d8', () => expect(sheet.hitDie).toBe('1d8'));
  it('Modificador de Destreza = +3', () => expect(sheet.modifiers['destreza']).toBe(3));
  it('Salvaguardas de Destreza e Inteligência', () => {
    expect(sheet.savingThrowProficiencies).toContain('Destreza');
    expect(sheet.savingThrowProficiencies).toContain('Inteligência');
  });
});

// ---------------------------------------------------------------------------
// GOLDEN TEST 5 — Clérigo Tieferino (Eremita)
// STR 10 / DEX 10 / CON 14 / INT 10 / WIS 16 / CHA 12
// MaxHP: 8 + 2 (CON mod) = 10
// CA sem armadura: 10 + 0 = 10
// Iniciativa: +0
// BP: +2
// SpellSaveDC: 8 + 3 (WIS mod) + 2 (BP) = 13
// SpellAttackBonus: 3 + 2 = +5
// Magias preparadas: WIS mod (3) + nível (1) = 4
// Truques: 3
// ---------------------------------------------------------------------------
describe('Golden Test 5 — Clérigo Tieferino (Eremita)', () => {
  const choices = makeChoices({
    classId: 'clerigo',
    backgroundId: 'eremita',
    speciesId: 'tiferino',
    baseAttributes: {
      forca: 10, destreza: 10, constituicao: 14,
      inteligencia: 10, sabedoria: 16, carisma: 12,
    },
    backgroundBonusDistribution: null,
    featureChoices: {
      'clerigo-skill-1': 'Intuição',
      'clerigo-skill-2': 'Religião',
    },
  });

  const sheet = deriveSheet(choices);

  it('MaxHP = 10 (base 8 + CON mod 2)', () => expect(sheet.maxHP).toBe(10));
  it('CA sem armadura = 10', () => expect(sheet.armorClass).toBe(10));
  it('Iniciativa = +0', () => expect(sheet.initiative).toBe(0));
  it('Bônus de Proficiência = +2', () => expect(sheet.proficiencyBonus).toBe(2));
  it('É conjurador', () => expect(sheet.isCaster).toBe(true));
  it('Atributo de conjuração: sabedoria', () => expect(sheet.spellcastingAbility).toBe('sabedoria'));
  it('Spell Save DC = 13', () => expect(sheet.spellSaveDC).toBe(13));
  it('Spell Attack Bonus = +5', () => expect(sheet.spellAttackBonus).toBe(5));
  it('Magias preparadas = 4 (WIS+3 + nível 1)', () => expect(sheet.preparedSpellCount).toBe(4));
  it('Truques conhecidos = 3', () => expect(sheet.cantripsKnown).toBe(3));
  it('2 espaços de 1º círculo', () => expect(sheet.spellSlots?.[1]).toBe(2));
  it('Hit Die = 1d8', () => expect(sheet.hitDie).toBe('1d8'));
  it('Modificador de Sabedoria = +3', () => expect(sheet.modifiers['sabedoria']).toBe(3));
  it('Salvaguardas de Sabedoria e Carisma', () => {
    expect(sheet.savingThrowProficiencies).toContain('Sabedoria');
    expect(sheet.savingThrowProficiencies).toContain('Carisma');
  });
  it('Tem escudo de proficiência', () => expect(sheet.armorProficiencies).toContain('Escudo'));
});

// ===========================================================================
// Testes de CA com armadura equipada / escudo / defesa sem armadura
// ===========================================================================

describe('CA com armadura equipada', () => {
  it('sem armadura equipada → CA = 10 + DEX', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'guerreiro',
      baseAttributes: { forca: 10, destreza: 14, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 },
    }));
    expect(sheet.armorClass).toBe(12); // 10 + 2
  });

  it('com couro equipado (leve) → CA = 11 + DEX', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'guerreiro',
      baseAttributes: { forca: 10, destreza: 14, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 },
      equippedArmorId: 'couro',
    }));
    expect(sheet.armorClass).toBe(13); // 11 + 2
  });

  it('com cota_de_placas equipada (pesada) → CA fixa 16, ignora DEX', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'guerreiro',
      baseAttributes: { forca: 10, destreza: 16, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 },
      equippedArmorId: 'cota_de_placas',
    }));
    expect(sheet.armorClass).toBe(16); // CA fixa 16
  });

  it('com escudo → CA +2', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'guerreiro',
      baseAttributes: { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 },
      hasShield: true,
    }));
    expect(sheet.armorClass).toBe(12); // 10 + 0 + 2
  });

  it('com armadura pesada + escudo → CA fixa + 2', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'guerreiro',
      baseAttributes: { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 },
      equippedArmorId: 'cota_de_placas',
      hasShield: true,
    }));
    expect(sheet.armorClass).toBe(18); // 16 + 2
  });
});

describe('Defesa sem armadura — Bárbaro', () => {
  it('sem armadura → 10 + DEX + CON', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'barbaro',
      baseAttributes: { forca: 16, destreza: 14, constituicao: 16, inteligencia: 8, sabedoria: 10, carisma: 8 },
    }));
    expect(sheet.armorClass).toBe(15); // 10 + 2(DEX) + 3(CON)
  });

  it('com escudo → 10 + DEX + CON + 2', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'barbaro',
      baseAttributes: { forca: 16, destreza: 14, constituicao: 16, inteligencia: 8, sabedoria: 10, carisma: 8 },
      hasShield: true,
    }));
    expect(sheet.armorClass).toBe(17); // 10 + 2 + 3 + 2
  });
});

describe('Defesa sem armadura — Monge', () => {
  it('sem armadura → 10 + DEX + WIS', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'monge',
      baseAttributes: { forca: 10, destreza: 16, constituicao: 10, inteligencia: 10, sabedoria: 16, carisma: 8 },
    }));
    expect(sheet.armorClass).toBe(16); // 10 + 3(DEX) + 3(WIS)
  });
});

// ===========================================================================
// Escolha de ferramenta do antecedente reflete na ficha
// ===========================================================================
describe('Ferramenta do antecedente escolhida', () => {
  it('soldado com ferramenta escolhida → reflete em toolProficiencies', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'guerreiro',
      backgroundId: 'soldado',
      backgroundChoices: {
        toolProficiency: 'Kit de Jogos de Baralho',
      },
    }));
    expect(sheet.toolProficiencies).toContain('Kit de Jogos de Baralho');
  });
});

// ===========================================================================
// Escolhas de espécie — humano perícia extra, elfo truque racial
// ===========================================================================
describe('Escolhas de espécie no engine', () => {

  it('aasimar recebe resistências celestiais e truque Luz', () => {
    const sheet = deriveSheet(makeChoices({ speciesId: 'aasimar' }));
    expect(sheet.derivedDefenses).toEqual(expect.arrayContaining(['Resistência a Necrótico', 'Resistência a Radiante']));
    expect(sheet.racialCantrips).toContain('Luz');
  });

  it('gnomo do bosque ganha magia preparada racial sustentada na ficha', () => {
    const sheet = deriveSheet(makeChoices({
      speciesId: 'gnomo',
      speciesLineage: 'gnomo-do-bosque',
      featureChoices: { gnomo: 'gnomo-do-bosque' },
    }));
    expect(sheet.racialCantrips).toContain('Ilusão Menor');
    expect(sheet.bonusPreparedSpells).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Falar com Animais', source: 'species' }),
    ]));
  });

  it('talento Habilidoso adiciona perícias e ferramentas à ficha', () => {
    const sheet = deriveSheet(makeChoices({
      backgroundId: 'charlatao',
      talentSelections: {
        Habilidoso: {
          pick1: 'Percepção',
          pick2: 'Ferramentas de Ladrão',
          pick3: 'Atletismo',
        },
      },
    }));
    expect(sheet.skillProficiencies).toEqual(expect.arrayContaining(['Percepção', 'Atletismo']));
    expect(sheet.toolProficiencies).toContain('Ferramentas de Ladrão');
  });

  it('iniciado em magia adiciona truques e magia preparada extra', () => {
    const sheet = deriveSheet(makeChoices({
      backgroundId: 'acolito',
      talentSelections: {
        'Iniciado em Magia (Clérigo)': {
          spellcastingAbility: 'Sabedoria',
          cantrip1: 'Luz',
          cantrip2: 'Taumaturgia',
          level1Spell: 'Bênção',
        },
      },
    }));
    expect(sheet.bonusCantrips).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Luz', source: 'talent' }),
      expect.objectContaining({ name: 'Taumaturgia', source: 'talent' }),
    ]));
    expect(sheet.bonusPreparedSpells).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Bênção', source: 'talent' }),
    ]));
  });
  it('humano com perícia extra → aparece em skillProficiencies', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'guerreiro',
      backgroundId: 'soldado',
      speciesId: 'humano',
      speciesChoices: { skill: 'Percepção' },
      featureChoices: {
        'guerreiro-skill-1': 'Atletismo',
        'guerreiro-skill-2': 'Intimidação',
      },
    }));
    expect(sheet.skillProficiencies.some(s => s.includes('Percepção'))).toBe(true);
  });

  it('elfo alto-elfo com cantrip → aparece em racialCantrips', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'mago',
      speciesId: 'elfo',
      speciesLineage: 'alto-elfo',
      speciesChoices: { cantrip: 'Prestidigitação' },
    }));
    expect(sheet.racialCantrips).toContain('Prestidigitação');
  });

  it('elfo da floresta → racialCantrips vazio', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'guardiao',
      speciesId: 'elfo',
      speciesLineage: 'elfo-da-floresta',
    }));
    expect(sheet.racialCantrips).toHaveLength(0);
  });

  it('draconato vermelho → resistência derivada aparece em derivedDefenses', () => {
    const sheet = deriveSheet(makeChoices({
      classId: 'guerreiro',
      speciesId: 'draconato',
      speciesChoices: { draconato: 'vermelho' },
    }));
    expect(sheet.derivedDefenses).toContain('Resistência a Ígneo');
  });

  it('golias com ancestralidade escolhida → traço derivado aparece na ficha', () => {
    const sheet = deriveSheet(makeChoices({
      speciesId: 'golias',
      speciesChoices: { golias: 'pedra' },
      featureChoices: { golias: 'pedra' },
    }));
    expect(sheet.derivedTraits).toEqual(expect.arrayContaining([
      expect.stringContaining('Porte Poderoso'),
      expect.stringContaining('Resistência da Pedra'),
    ]));
  });

  it('orc → traços de nível 1 ficam registrados como efeitos derivados', () => {
    const sheet = deriveSheet(makeChoices({ speciesId: 'orc' }));
    expect(sheet.specialSenses).toContain('Visão no Escuro (36 metros)');
    expect(sheet.derivedTraits).toEqual(expect.arrayContaining([
      expect.stringContaining('Pico de Adrenalina'),
      expect.stringContaining('Vigor Implacável'),
    ]));
  });

  it('pequenino → traços raciais relevantes aparecem como efeitos derivados', () => {
    const sheet = deriveSheet(makeChoices({ speciesId: 'pequenino' }));
    expect(sheet.derivedTraits).toEqual(expect.arrayContaining([
      expect.stringContaining('Corajoso'),
      expect.stringContaining('Sorte'),
      expect.stringContaining('Furtividade Natural'),
    ]));
  });

  it('anão → adiciona PV por nível e sentido especial de sismiconsciência', () => {
    const sheet = deriveSheet(makeChoices({ speciesId: 'anao' }));
    expect(sheet.maxHP).toBe(1);
    expect(sheet.specialSenses).toContain('Sismiconsciência (18 metros, por 10 minutos ao tocar pedra)');
  });

  it('humano com Atacante Selvagem → talento aplicado gera nota derivada', () => {
    const sheet = deriveSheet(makeChoices({
      speciesId: 'humano',
      featureChoices: {
        'humano-talent': 'Atacante Selvagem',
      },
    }));
    expect(sheet.activeTalents).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Atacante Selvagem', source: 'species' }),
    ]));
    expect(sheet.derivedTraits).toEqual(expect.arrayContaining([
      expect.stringContaining('rolar os dados de dano da arma duas vezes'),
    ]));
  });
});

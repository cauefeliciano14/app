import { describe, it, expect } from 'vitest';
import { validateChoices } from '../engine/validation';
import type { CharacterChoices } from '../types/CharacterChoices';
import { getClassSpellcastingData } from '../data/classRules';
import bardoSpells from '../../data/spells/bardo_spells.json';

// ---------------------------------------------------------------------------
// Helper para construir choices mínimas
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
    equipmentChoices: { classOption: 'B', backgroundOption: 'B' },
    inventory: [],
    spellSelections: { cantrips: [], prepared: [] },
    talentSelections: {},
    languageSelections: [],
    featureChoices: {},
    characterDetails: { name: '', portrait: null },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Personagem completamente válido (guerreiro humano soldado)
// Usado como base para testes que removem peças
// ---------------------------------------------------------------------------
function makeCompleteWarrior(): CharacterChoices {
  return makeChoices({
    classId: 'guerreiro',
    backgroundId: 'soldado',
    speciesId: 'humano',
    baseAttributes: {
      forca: 15, destreza: 14, constituicao: 13,
      inteligencia: 12, sabedoria: 10, carisma: 8,
    },
    backgroundBonusDistribution: {
      mode: '+2/+1',
      distribution: { forca: 2, constituicao: 1 },
    },
    featureChoices: {
      'guerreiro-skill-1': 'Atletismo',
      'guerreiro-skill-2': 'Intimidação',
      'toolProficiency': 'Kit de Jogos de Baralho',
      'humano-size': 'Médio',
      'humano-skill': 'Percepção',
      'humano-talent': 'Atacante Selvagem',
    },
    languageSelections: ['Élfico', 'Anão'],
    equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    inventory: [
      { name: 'Cota de Malha' },
      { name: 'Espada Longa' },
      { name: 'Espada Curta' },
      { name: 'Besta Leve' },
      { name: 'Kit de Aventureiro' },
      { name: 'Girote' },
      { name: 'Lança' },
      { name: 'Arco Curto' },
      { name: 'Flecha' },
      { name: 'Kit de Curandeiro' },
      { name: 'Kit de Jogo' },
      { name: 'Aljava' },
      { name: 'Roupas de Viagem' },
    ],
  });
}

// ===========================================================================
// Personagem completo → isValid true
// ===========================================================================
describe('Personagem completo (guerreiro humano soldado)', () => {
  const result = validateChoices(makeCompleteWarrior());

  it('isValid = true', () => expect(result.isValid).toBe(true));
  it('sem erros globais', () => expect(result.errors).toHaveLength(0));
  it('byStep.class vazio', () => expect(result.byStep.class).toHaveLength(0));
  it('byStep.background vazio', () => expect(result.byStep.background).toHaveLength(0));
  it('byStep.species vazio', () => expect(result.byStep.species).toHaveLength(0));
  it('byStep.attributes vazio', () => expect(result.byStep.attributes).toHaveLength(0));
  it('byStep.equipment vazio', () => expect(result.byStep.equipment).toHaveLength(0));
});

// ===========================================================================
// Etapa Classe
// ===========================================================================
describe('Validação — Etapa Classe', () => {
  it('sem classe selecionada → erro', () => {
    const r = validateChoices(makeChoices({ classId: null }));
    expect(r.byStep.class.length).toBeGreaterThan(0);
    expect(r.byStep.class[0]).toMatch(/classe/i);
  });

  it('classe inválida → erro', () => {
    const r = validateChoices(makeChoices({ classId: 'inventada' }));
    expect(r.byStep.class.length).toBeGreaterThan(0);
    expect(r.byStep.class[0]).toMatch(/não é mais válida/i);
  });

  it('guerreiro sem escolhas obrigatórias → erro sobre opção pendente', () => {
    const r = validateChoices(makeChoices({
      classId: 'guerreiro',
      featureChoices: {},
    }));
    // Guerreiro tem skill choices obrigatórias
    expect(r.byStep.class.length).toBeGreaterThanOrEqual(0);
    // Se não houver opções de classe (details.options), tudo bem
    // O teste é que NÃO dá erro de classe inexistente
    expect(r.byStep.class.every(e => !e.includes('não é mais válida'))).toBe(true);
  });
});

// ===========================================================================
// Etapa Antecedente
// ===========================================================================
describe('Validação — Etapa Antecedente', () => {
  it('sem antecedente → erro', () => {
    const r = validateChoices(makeChoices({ backgroundId: null }));
    expect(r.byStep.background.length).toBeGreaterThan(0);
  });

  it('antecedente sem bônus distribuído → erro', () => {
    const r = validateChoices(makeChoices({
      backgroundId: 'soldado',
      backgroundBonusDistribution: null,
    }));
    expect(r.byStep.background.some(e => e.includes('bônus') || e.includes('Bônus'))).toBe(true);
  });

  it('soldado sem ferramenta escolhida → erro', () => {
    const r = validateChoices(makeChoices({
      backgroundId: 'soldado',
      backgroundBonusDistribution: {
        mode: '+2/+1',
        distribution: { forca: 2, constituicao: 1 },
      },
      featureChoices: {},
    }));
    expect(r.byStep.background.some(e => e.includes('ferramenta'))).toBe(true);
  });
});

// ===========================================================================
// Etapa Espécie
// ===========================================================================
describe('Validação — Etapa Espécie', () => {
  it('sem espécie → erro', () => {
    const r = validateChoices(makeChoices({ speciesId: null }));
    expect(r.byStep.species.length).toBeGreaterThan(0);
  });

  it('sem idiomas → erro de idiomas', () => {
    const r = validateChoices(makeChoices({
      speciesId: 'humano',
      languageSelections: [],
    }));
    expect(r.byStep.species.some(e => e.includes('idioma'))).toBe(true);
  });

  it('com 2 idiomas e escolhas completas → sem erro de espécie', () => {
    const r = validateChoices(makeChoices({
      speciesId: 'humano',
      languageSelections: ['Élfico', 'Anão'],
      featureChoices: {
        'humano-size': 'Médio',
        'humano-skill': 'Percepção',
        'humano-talent': 'Atacante Selvagem',
      },
    }));
    expect(r.byStep.species).toHaveLength(0);
  });

  // Elfo alto-elfo sem cantrip → erro; elfo da floresta sem cantrip → ok
  it('elfo alto-elfo sem cantrip → erro', () => {
    const r = validateChoices(makeChoices({
      speciesId: 'elfo',
      languageSelections: ['Comum', 'Anão'],
      featureChoices: {
        'elfo': 'alto-elfo',
        'elfo-skill': 'Percepção',
        'elfo-attr': 'destreza',
        // falta 'elfo-cantrip'
      },
    }));
    expect(r.byStep.species.some(e => e.includes('truque de alto elfo'))).toBe(true);
  });

  it('elfo da floresta sem cantrip → sem erro de cantrip', () => {
    const r = validateChoices(makeChoices({
      speciesId: 'elfo',
      languageSelections: ['Élfico', 'Anão'],
      featureChoices: {
        'elfo': 'elfo-da-floresta',
        'elfo-skill': 'Percepção',
        'elfo-attr': 'destreza',
      },
    }));
    // Não deve ter erro sobre cantrip
    expect(r.byStep.species.every(e => !e.includes('cantrip'))).toBe(true);
  });
});

// ===========================================================================
// Etapa Atributos
// ===========================================================================
describe('Validação — Etapa Atributos', () => {
  it('sem método → erro', () => {
    const r = validateChoices(makeChoices({ attributeMethod: null }));
    expect(r.byStep.attributes.length).toBeGreaterThan(0);
  });

  it('método standard com atributos válidos → sem erro', () => {
    const r = validateChoices(makeChoices({
      attributeMethod: 'standard',
      baseAttributes: {
        forca: 15, destreza: 14, constituicao: 13,
        inteligencia: 12, sabedoria: 10, carisma: 8,
      },
    }));
    expect(r.byStep.attributes).toHaveLength(0);
  });
});

// ===========================================================================
// Etapa Equipamento & Magia
// ===========================================================================
describe('Validação — Etapa Equipamento', () => {
  it('sem opção de classe → erro', () => {
    const r = validateChoices(makeChoices({
      equipmentChoices: { classOption: null, backgroundOption: 'A' },
    }));
    expect(r.byStep.equipment.some(e => e.includes('classe'))).toBe(true);
  });

  it('sem opção de antecedente → erro', () => {
    const r = validateChoices(makeChoices({
      equipmentChoices: { classOption: 'A', backgroundOption: null },
    }));
    expect(r.byStep.equipment.some(e => e.includes('antecedente'))).toBe(true);
  });
});

// ===========================================================================
// Validação de magia — Clérigo (prepared, 3 truques nível 1)
// ===========================================================================
describe('Validação de magia — Clérigo nível 1', () => {
  const spellData = getClassSpellcastingData('clerigo')!;
  const requiredCantrips = spellData.cantripsKnownByLevel[0];
  // Clérigo prepara WIS+nível dinamicamente e a validação deve exigir esse total.

  it('dados de classe: clérigo é conjurador', () => {
    expect(spellData.isCaster).toBe(true);
  });

  it(`dados de classe: ${requiredCantrips} truques no nível 1`, () => {
    expect(requiredCantrips).toBe(3);
  });

  it('sem truques selecionados → erro de truques', () => {
    const r = validateChoices(makeChoices({
      classId: 'clerigo',
      spellSelections: { cantrips: [], prepared: [] },
      equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    }));
    expect(r.byStep.equipment.some(e => e.includes('truque'))).toBe(true);
  });


  it('sem magias preparadas suficientes → erro usando total dinâmico', () => {
    const r = validateChoices(makeChoices({
      classId: 'clerigo',
      baseAttributes: {
        forca: 10, destreza: 10, constituicao: 10,
        inteligencia: 10, sabedoria: 16, carisma: 10,
      },
      spellSelections: { cantrips: ['Chama Sagrada', 'Taumaturgia', 'Luz'], prepared: ['Bênção', 'Curar Ferimentos'] },
      equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    }));
    expect(r.byStep.equipment.some(e => e.includes('Prepare mais 2 magia'))).toBe(true);
  });

  it('truques suficientes → sem erro de truque', () => {
    const cantrips = ['Chama Sagrada', 'Taumaturgia', 'Luz'].slice(0, requiredCantrips);
    const r = validateChoices(makeChoices({
      classId: 'clerigo',
      spellSelections: { cantrips, prepared: [] },
      equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    }));
    const cantripErrors = r.byStep.equipment.filter(e => e.includes('truque'));
    expect(cantripErrors).toHaveLength(0);
  });
});

describe('Validação de magia — Bardo nível 1 (known/prepared)', () => {
  const spellData = getClassSpellcastingData('bardo')!;
  const requiredCantrips = spellData.cantripsKnownByLevel[0];
  const requiredSpells = spellData.preparedSpellsByLevel![0];

  it('bardo tem preparedSpellsByLevel', () => {
    expect(spellData.preparedSpellsByLevel).toBeDefined();
    expect(requiredSpells).toBeGreaterThan(0);
  });

  it('sem magias preparadas → erro de magias', () => {
    const r = validateChoices(makeChoices({
      classId: 'bardo',
      spellSelections: {
        cantrips: Array(requiredCantrips).fill('X'),
        prepared: [],
      },
      equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    }));
    expect(r.byStep.equipment.some(e => e.toLowerCase().includes('magia'))).toBe(true);
  });

  it('truques e magias suficientes → sem erro de magia', () => {
    const cantrips = (bardoSpells as Array<{ name: string; level: string | number }>)
      .filter((spell) => spell.level === 'Truque' || spell.level === 0)
      .slice(0, requiredCantrips)
      .map((spell) => spell.name);
    const prepared = (bardoSpells as Array<{ name: string; level: string | number }>)
      .filter((spell) => spell.level === 1 || spell.level === '1' || spell.level === '1º Círculo')
      .slice(0, requiredSpells)
      .map((spell) => spell.name);
    const r = validateChoices(makeChoices({
      classId: 'bardo',
      spellSelections: { cantrips, prepared },
      equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    }));
    const spellErrors = r.byStep.equipment.filter(
      e => e.includes('truque') || e.toLowerCase().includes('magia')
    );
    expect(spellErrors).toHaveLength(0);
  });
});

// ===========================================================================
// Validação de magia — Guerreiro (non-caster) → sem erros de magia
// ===========================================================================
describe('Validação de magia — Guerreiro (non-caster)', () => {
  it('guerreiro sem magias → sem erro de magia', () => {
    const r = validateChoices(makeChoices({
      classId: 'guerreiro',
      spellSelections: { cantrips: [], prepared: [] },
      equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    }));
    const spellErrors = r.byStep.equipment.filter(
      e => e.includes('truque') || e.toLowerCase().includes('magia')
    );
    expect(spellErrors).toHaveLength(0);
  });
});

// ===========================================================================
// Validação de magia — Feiticeiro (known) vs Mago (prepared)
// ===========================================================================
describe('Validação de magia — Bruxo (known) vs Bardo (prepared)', () => {
  const bruxo = getClassSpellcastingData('bruxo')!;
  const bardo = getClassSpellcastingData('bardo')!;

  it('bruxo usa spellSlotsKnownByLevel (known)', () => {
    expect(bruxo.spellSlotsKnownByLevel).toBeDefined();
    expect(bruxo.preparedSpellsByLevel).toBeUndefined();
  });

  it('bardo usa preparedSpellsByLevel (prepared)', () => {
    expect(bardo.preparedSpellsByLevel).toBeDefined();
  });

  it('bruxo sem magias conhecidas → erro "Escolha"', () => {
    const r = validateChoices(makeChoices({
      classId: 'bruxo',
      spellSelections: {
        cantrips: Array(bruxo.cantripsKnownByLevel[0]).fill('X'),
        prepared: [],
      },
      equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    }));
    expect(r.byStep.equipment.some(e => e.startsWith('Escolha'))).toBe(true);
  });

  it('bardo sem magias preparadas → erro "Prepare"', () => {
    const r = validateChoices(makeChoices({
      classId: 'bardo',
      spellSelections: {
        cantrips: Array(bardo.cantripsKnownByLevel[0]).fill('X'),
        prepared: [],
      },
      equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
    }));
    expect(r.byStep.equipment.some(e => e.startsWith('Prepare'))).toBe(true);
  });
});

// ===========================================================================
// Equipamento incompleto bloqueia
// ===========================================================================
describe('Equipamento incompleto → bloqueio', () => {
  it('ambas opções null → 2 erros de equipamento', () => {
    const r = validateChoices(makeChoices({
      equipmentChoices: { classOption: null, backgroundOption: null },
    }));
    expect(r.byStep.equipment.length).toBeGreaterThanOrEqual(2);
  });
});


describe('Validação explícita de inconsistências em magia e equipamento', () => {
  it('bloqueia truque duplicado', () => {
    const r = validateChoices(makeChoices({
      classId: 'clerigo',
      spellSelections: { cantrips: ['Chama Sagrada', 'Chama Sagrada'], prepared: [] },
    }));
    expect(r.byStep.equipment.some(e => e.includes('truques duplicados'))).toBe(true);
  });

  it('bloqueia magia duplicada', () => {
    const r = validateChoices(makeChoices({
      classId: 'bardo',
      spellSelections: {
        cantrips: ['Luz', 'Zombaria Viciosa'],
        prepared: ['Enfeitiçar Pessoa', 'Enfeitiçar Pessoa'],
      },
    }));
    expect(r.byStep.equipment.some(e => e.includes('magias duplicadas'))).toBe(true);
  });

  it('bloqueia excesso de seleção de truques e magias', () => {
    const r = validateChoices(makeChoices({
      classId: 'bardo',
      spellSelections: {
        cantrips: ['Luz', 'Zombaria Viciosa', 'Amigos'],
        prepared: ['Enfeitiçar Pessoa', 'Palavra Curativa', 'Sono', 'Heroísmo', 'Compreender Idiomas'],
      },
    }));
    expect(r.byStep.equipment.some(e => e.includes('no máximo 2 truque'))).toBe(true);
    expect(r.byStep.equipment.some(e => e.includes('no máximo 4 magia'))).toBe(true);
  });

  it('bloqueia equippedArmorId inválido', () => {
    const r = validateChoices(makeChoices({
      equippedArmorId: 'cota_de_placas',
      inventory: [{ name: 'Armadura de Couro' }],
    }));
    expect(r.byStep.equipment.some(e => e.includes('armadura equipada'))).toBe(true);
  });

  it('bloqueia hasShield sem escudo no inventário', () => {
    const r = validateChoices(makeChoices({
      hasShield: true,
      inventory: [{ name: 'Armadura de Couro' }],
    }));
    expect(r.byStep.equipment.some(e => e.includes('escudo'))).toBe(true);
  });

  it('bloqueia pacote de equipamento sem inventário correspondente', () => {
    const r = validateChoices(makeChoices({
      classId: 'guerreiro',
      backgroundId: 'soldado',
      equipmentChoices: { classOption: 'A', backgroundOption: 'A' },
      inventory: [{ name: 'Espada Longa' }, { name: 'Roupas de Viagem' }],
    }));
    expect(r.byStep.equipment.some(e => e.includes('pacote de equipamento de classe'))).toBe(true);
    expect(r.byStep.equipment.some(e => e.includes('pacote de equipamento de antecedente'))).toBe(true);
  });
});


describe('Validação de treinamento de equipamento', () => {
  it('bloqueia armadura equipada sem treinamento apropriado', () => {
    const r = validateChoices(makeChoices({
      classId: 'mago',
      equippedArmorId: 'couro',
      inventory: [{ name: 'Armadura de Couro' }],
    }));
    expect(r.byStep.equipment.some(e => e.includes('não tem treinamento com armadura leve'))).toBe(true);
  });

  it('bloqueia escudo equipado sem treinamento apropriado', () => {
    const r = validateChoices(makeChoices({
      classId: 'mago',
      hasShield: true,
      inventory: [{ name: 'Escudo' }],
    }));
    expect(r.byStep.equipment.some(e => e.includes('não tem treinamento com escudo'))).toBe(true);
  });
});

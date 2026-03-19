import { describe, it, expect } from 'vitest';
import {
  getProficiencyBonus,
  getClassBaseProficiencies,
  getBackgroundProficiencies,
  mergeProficiencies,
  getChosenSkillProficiencies,
} from '../calculators/proficiency';

// ---------------------------------------------------------------------------
// getProficiencyBonus
// ---------------------------------------------------------------------------
describe('getProficiencyBonus', () => {
  it('nível 1 → +2', () => expect(getProficiencyBonus(1)).toBe(2));
  it('nível 4 → +2', () => expect(getProficiencyBonus(4)).toBe(2));
  it('nível 5 → +3', () => expect(getProficiencyBonus(5)).toBe(3));
  it('nível 8 → +3', () => expect(getProficiencyBonus(8)).toBe(3));
  it('nível 9 → +4', () => expect(getProficiencyBonus(9)).toBe(4));
  it('nível 12 → +4', () => expect(getProficiencyBonus(12)).toBe(4));
  it('nível 13 → +5', () => expect(getProficiencyBonus(13)).toBe(5));
  it('nível 17 → +6', () => expect(getProficiencyBonus(17)).toBe(6));
  it('nível 20 → +6', () => expect(getProficiencyBonus(20)).toBe(6));
});

// ---------------------------------------------------------------------------
// getClassBaseProficiencies
// ---------------------------------------------------------------------------
describe('getClassBaseProficiencies', () => {
  it('guerreiro tem armadura pesada', () => {
    const profs = getClassBaseProficiencies('guerreiro');
    expect(profs.armorCategories).toContain('Armadura Pesada');
  });

  it('guerreiro tem salvaguardas de Força e Constituição', () => {
    const profs = getClassBaseProficiencies('guerreiro');
    expect(profs.savingThrows).toContain('Força');
    expect(profs.savingThrows).toContain('Constituição');
  });

  it('mago não tem proficiência em armadura', () => {
    const profs = getClassBaseProficiencies('mago');
    expect(profs.armorCategories).toHaveLength(0);
  });

  it('mago tem salvaguardas de Inteligência e Sabedoria', () => {
    const profs = getClassBaseProficiencies('mago');
    expect(profs.savingThrows).toContain('Inteligência');
    expect(profs.savingThrows).toContain('Sabedoria');
  });

  it('clerigo tem escudo', () => {
    const profs = getClassBaseProficiencies('clerigo');
    expect(profs.armorCategories).toContain('Escudo');
  });

  it('classe desconhecida retorna proficiências vazias', () => {
    const profs = getClassBaseProficiencies('inexistente');
    expect(profs.skills).toHaveLength(0);
    expect(profs.savingThrows).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getBackgroundProficiencies
// ---------------------------------------------------------------------------
describe('getBackgroundProficiencies', () => {
  it('soldado tem perícias de Atletismo e Intimidação', () => {
    const profs = getBackgroundProficiencies('soldado');
    expect(profs.skills).toContain('Atletismo (FOR)');
    expect(profs.skills).toContain('Intimidação (CAR)');
  });

  it('sabio tem perícias de Arcanismo e História', () => {
    const profs = getBackgroundProficiencies('sabio');
    expect(profs.skills).toContain('Arcanismo (INT)');
    expect(profs.skills).toContain('História (INT)');
  });

  it('antecedente desconhecido retorna vazio', () => {
    const profs = getBackgroundProficiencies('inexistente');
    expect(profs.skills).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// mergeProficiencies
// ---------------------------------------------------------------------------
describe('mergeProficiencies', () => {
  it('merge sem duplicatas', () => {
    const a = { skills: ['Atletismo', 'Percepção'], weaponCategories: ['Armas Simples'], armorCategories: [], savingThrows: [], tools: [] };
    const b = { skills: ['Percepção', 'Furtividade'], weaponCategories: ['Armas Marciais'], armorCategories: [], savingThrows: [], tools: [] };
    const merged = mergeProficiencies(a, b);
    expect(merged.skills).toHaveLength(3);
    expect(merged.skills).toContain('Atletismo');
    expect(merged.skills).toContain('Percepção');
    expect(merged.skills).toContain('Furtividade');
    expect(merged.weaponCategories).toHaveLength(2);
  });

  it('merge de três sets funciona', () => {
    const a = { skills: ['A'], weaponCategories: [], armorCategories: [], savingThrows: ['Força'], tools: [] };
    const b = { skills: ['B'], weaponCategories: [], armorCategories: [], savingThrows: ['Destreza'], tools: [] };
    const c = { skills: ['A'], weaponCategories: [], armorCategories: [], savingThrows: ['Força'], tools: ['Ferramentas'] };
    const merged = mergeProficiencies(a, b, c);
    expect(merged.skills).toHaveLength(2);
    expect(merged.savingThrows).toHaveLength(2);
    expect(merged.tools).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// getChosenSkillProficiencies
// ---------------------------------------------------------------------------
describe('getChosenSkillProficiencies', () => {
  it('extrai perícias escolhidas do guerreiro (2 perícias)', () => {
    const choices = {
      'guerreiro-skill-1': 'Atletismo',
      'guerreiro-skill-2': 'Percepção',
    };
    const skills = getChosenSkillProficiencies('guerreiro', choices);
    expect(skills).toContain('Atletismo');
    expect(skills).toContain('Percepção');
    expect(skills).toHaveLength(2);
  });

  it('não duplica perícias iguais', () => {
    const choices = {
      'guerreiro-skill-1': 'Atletismo',
      'guerreiro-skill-2': 'Atletismo',
    };
    const skills = getChosenSkillProficiencies('guerreiro', choices);
    expect(skills).toHaveLength(1);
  });
});

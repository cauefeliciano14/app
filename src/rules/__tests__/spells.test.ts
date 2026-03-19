import { describe, it, expect } from 'vitest';
import {
  isCaster,
  getSpellcastingAbility,
  getCantripsKnown,
  getSpellSlots,
  getPreparedSpellCount,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
} from '../calculators/spells';

// ---------------------------------------------------------------------------
// isCaster
// ---------------------------------------------------------------------------
describe('isCaster', () => {
  it('mago é conjurador', () => expect(isCaster('mago')).toBe(true));
  it('clerigo é conjurador', () => expect(isCaster('clerigo')).toBe(true));
  it('bardo é conjurador', () => expect(isCaster('bardo')).toBe(true));
  it('bruxo é conjurador', () => expect(isCaster('bruxo')).toBe(true));
  it('paladino é conjurador', () => expect(isCaster('paladino')).toBe(true));
  it('guardiao é conjurador', () => expect(isCaster('guardiao')).toBe(true));
  it('guerreiro não é conjurador', () => expect(isCaster('guerreiro')).toBe(false));
  it('barbaro não é conjurador', () => expect(isCaster('barbaro')).toBe(false));
  it('ladino não é conjurador', () => expect(isCaster('ladino')).toBe(false));
  it('monge não é conjurador', () => expect(isCaster('monge')).toBe(false));
});

// ---------------------------------------------------------------------------
// getSpellcastingAbility
// ---------------------------------------------------------------------------
describe('getSpellcastingAbility', () => {
  it('mago usa inteligencia', () => expect(getSpellcastingAbility('mago')).toBe('inteligencia'));
  it('clerigo usa sabedoria', () => expect(getSpellcastingAbility('clerigo')).toBe('sabedoria'));
  it('druida usa sabedoria', () => expect(getSpellcastingAbility('druida')).toBe('sabedoria'));
  it('bardo usa carisma', () => expect(getSpellcastingAbility('bardo')).toBe('carisma'));
  it('feiticeiro usa carisma', () => expect(getSpellcastingAbility('feiticeiro')).toBe('carisma'));
  it('bruxo usa carisma', () => expect(getSpellcastingAbility('bruxo')).toBe('carisma'));
  it('paladino usa carisma', () => expect(getSpellcastingAbility('paladino')).toBe('carisma'));
  it('guardiao usa sabedoria', () => expect(getSpellcastingAbility('guardiao')).toBe('sabedoria'));
  it('guerreiro retorna null', () => expect(getSpellcastingAbility('guerreiro')).toBeNull());
});

// ---------------------------------------------------------------------------
// getCantripsKnown — nível 1
// ---------------------------------------------------------------------------
describe('getCantripsKnown nível 1', () => {
  it('mago: 3 truques', () => expect(getCantripsKnown('mago', 1)).toBe(3));
  it('clerigo: 3 truques', () => expect(getCantripsKnown('clerigo', 1)).toBe(3));
  it('bardo: 2 truques', () => expect(getCantripsKnown('bardo', 1)).toBe(2));
  it('bruxo: 2 truques', () => expect(getCantripsKnown('bruxo', 1)).toBe(2));
  it('feiticeiro: 4 truques', () => expect(getCantripsKnown('feiticeiro', 1)).toBe(4));
  it('druida: 2 truques', () => expect(getCantripsKnown('druida', 1)).toBe(2));
  it('paladino: 0 truques', () => expect(getCantripsKnown('paladino', 1)).toBe(0));
  it('guardiao: 0 truques', () => expect(getCantripsKnown('guardiao', 1)).toBe(0));
  it('guerreiro: 0 truques', () => expect(getCantripsKnown('guerreiro', 1)).toBe(0));
});

// ---------------------------------------------------------------------------
// getSpellSlots — nível 1
// ---------------------------------------------------------------------------
describe('getSpellSlots nível 1', () => {
  it('mago nível 1: 2 espaços de 1º círculo', () => {
    const slots = getSpellSlots('mago', 1);
    expect(slots?.[1]).toBe(2);
    expect(slots?.[2]).toBeUndefined();
  });

  it('clerigo nível 1: 2 espaços de 1º círculo', () => {
    const slots = getSpellSlots('clerigo', 1);
    expect(slots?.[1]).toBe(2);
  });

  it('bardo nível 1: 2 espaços de 1º círculo', () => {
    const slots = getSpellSlots('bardo', 1);
    expect(slots?.[1]).toBe(2);
  });

  it('paladino nível 1: 2 espaços de 1º círculo (D&D 2024)', () => {
    const slots = getSpellSlots('paladino', 1);
    expect(slots?.[1]).toBe(2);
  });

  it('guardiao nível 1: 2 espaços de 1º círculo (D&D 2024)', () => {
    const slots = getSpellSlots('guardiao', 1);
    expect(slots?.[1]).toBe(2);
  });

  it('bruxo nível 1: 1 espaço de pacto de 1º', () => {
    const slots = getSpellSlots('bruxo', 1);
    expect(slots?.[1]).toBe(1);
  });

  it('guerreiro retorna null', () => expect(getSpellSlots('guerreiro', 1)).toBeNull());

  it('mago nível 5: tem 3 de 1º, 2 de 2º e 2 de 3º', () => {
    const slots = getSpellSlots('mago', 5);
    expect(slots?.[1]).toBe(4);
    expect(slots?.[2]).toBe(3);
    expect(slots?.[3]).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getPreparedSpellCount — nível 1
// ---------------------------------------------------------------------------
describe('getPreparedSpellCount nível 1', () => {
  it('mago INT+3, nível 1 → 4 magias', () => {
    expect(getPreparedSpellCount('mago', 1, 3)).toBe(4); // 3+1=4
  });

  it('mago INT-1, nível 1 → 1 magia (mínimo 1)', () => {
    expect(getPreparedSpellCount('mago', 1, -1)).toBe(1);
  });

  it('clerigo WIS+3, nível 1 → 4 magias', () => {
    expect(getPreparedSpellCount('clerigo', 1, 3)).toBe(4);
  });

  it('druida WIS+2, nível 1 → 3 magias', () => {
    expect(getPreparedSpellCount('druida', 1, 2)).toBe(3);
  });

  it('paladino CHA+2, nível 1 → max(1, 2+0)=2', () => {
    // floor(1/2)=0; 2+0=2
    expect(getPreparedSpellCount('paladino', 1, 2)).toBe(2);
  });

  it('paladino CHA+0, nível 1 → 1 (mínimo)', () => {
    expect(getPreparedSpellCount('paladino', 1, 0)).toBe(1);
  });

  it('bardo nível 1 → 4 (tabela fixa)', () => {
    expect(getPreparedSpellCount('bardo', 1, 3)).toBe(4);
  });

  it('guardiao nível 1 → 2 (tabela fixa)', () => {
    expect(getPreparedSpellCount('guardiao', 1, 3)).toBe(2);
  });

  it('bruxo nível 1 → 2 (conhece)', () => {
    expect(getPreparedSpellCount('bruxo', 1, 3)).toBe(2);
  });

  it('feiticeiro nível 1 → 2 (conhece)', () => {
    expect(getPreparedSpellCount('feiticeiro', 1, 3)).toBe(2);
  });

  it('guerreiro → 0', () => {
    expect(getPreparedSpellCount('guerreiro', 1, 3)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateSpellSaveDC
// ---------------------------------------------------------------------------
describe('calculateSpellSaveDC', () => {
  it('mod+3, BP+2 → CD 13', () => expect(calculateSpellSaveDC(3, 2)).toBe(13));
  it('mod+0, BP+2 → CD 10', () => expect(calculateSpellSaveDC(0, 2)).toBe(10));
  it('mod+4, BP+3 → CD 15', () => expect(calculateSpellSaveDC(4, 3)).toBe(15));
});

// ---------------------------------------------------------------------------
// calculateSpellAttackBonus
// ---------------------------------------------------------------------------
describe('calculateSpellAttackBonus', () => {
  it('mod+3, BP+2 → +5', () => expect(calculateSpellAttackBonus(3, 2)).toBe(5));
  it('mod+0, BP+2 → +2', () => expect(calculateSpellAttackBonus(0, 2)).toBe(2));
});

import { describe, it, expect } from 'vitest';
import {
  calculateModifier,
  calculatePointBuyCost,
  calculateTotalPointCost,
  applyBackgroundBonus,
  getFinalAttributes,
  validateBonusDistribution,
  isAttributesStepComplete,
  POINT_BUY_BUDGET,
} from '../calculators/attributes';
import type { AttributeKey, BackgroundBonusDistribution } from '../types/CharacterChoices';

// ---------------------------------------------------------------------------
// calculateModifier
// ---------------------------------------------------------------------------
describe('calculateModifier', () => {
  it('score 10 → modifier 0', () => expect(calculateModifier(10)).toBe(0));
  it('score 11 → modifier 0', () => expect(calculateModifier(11)).toBe(0));
  it('score 12 → modifier +1', () => expect(calculateModifier(12)).toBe(1));
  it('score 13 → modifier +1', () => expect(calculateModifier(13)).toBe(1));
  it('score 14 → modifier +2', () => expect(calculateModifier(14)).toBe(2));
  it('score 16 → modifier +3', () => expect(calculateModifier(16)).toBe(3));
  it('score 18 → modifier +4', () => expect(calculateModifier(18)).toBe(4));
  it('score 20 → modifier +5', () => expect(calculateModifier(20)).toBe(5));
  it('score 8 → modifier -1', () => expect(calculateModifier(8)).toBe(-1));
  it('score 7 → modifier -2', () => expect(calculateModifier(7)).toBe(-2));
  it('score 1 → modifier -5', () => expect(calculateModifier(1)).toBe(-5));
});

// ---------------------------------------------------------------------------
// calculatePointBuyCost
// ---------------------------------------------------------------------------
describe('calculatePointBuyCost', () => {
  it('score 8 → 0 pts', () => expect(calculatePointBuyCost(8)).toBe(0));
  it('score 9 → 1 pt', () => expect(calculatePointBuyCost(9)).toBe(1));
  it('score 13 → 5 pts', () => expect(calculatePointBuyCost(13)).toBe(5));
  it('score 14 → 7 pts', () => expect(calculatePointBuyCost(14)).toBe(7));
  it('score 15 → 9 pts', () => expect(calculatePointBuyCost(15)).toBe(9));
});

// ---------------------------------------------------------------------------
// calculateTotalPointCost + POINT_BUY_BUDGET
// ---------------------------------------------------------------------------
describe('calculateTotalPointCost', () => {
  it('array padrão redistribuído deve caber no budget', () => {
    // [15,14,13,12,10,8] custa 9+7+5+4+2+0 = 27
    const attrs = { forca: 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, carisma: 8 };
    expect(calculateTotalPointCost(attrs)).toBe(POINT_BUY_BUDGET);
  });

  it('todos os atributos em 8 → 0 pontos', () => {
    const attrs = { forca: 8, destreza: 8, constituicao: 8, inteligencia: 8, sabedoria: 8, carisma: 8 };
    expect(calculateTotalPointCost(attrs)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// applyBackgroundBonus
// ---------------------------------------------------------------------------
describe('applyBackgroundBonus', () => {
  it('aplica bônus corretamente', () => {
    const base = { forca: 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, carisma: 8 };
    const bonus = { forca: 2, destreza: 1 };
    const result = applyBackgroundBonus(base, bonus);
    expect(result.forca).toBe(17);
    expect(result.destreza).toBe(15);
    expect(result.constituicao).toBe(13); // sem bônus
  });

  it('cap em 20 — não ultrapassa', () => {
    const base = { forca: 19, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 };
    const bonus = { forca: 2 };
    const result = applyBackgroundBonus(base, bonus);
    expect(result.forca).toBe(20); // 19+2=21 → capped a 20
  });

  it('sem bônus deixa o valor igual', () => {
    const base = { forca: 14, destreza: 12, constituicao: 10, inteligencia: 10, sabedoria: 8, carisma: 8 };
    const result = applyBackgroundBonus(base, {});
    expect(result).toEqual(base);
  });
});

// ---------------------------------------------------------------------------
// getFinalAttributes
// ---------------------------------------------------------------------------
describe('getFinalAttributes', () => {
  const base: Record<AttributeKey, number> = {
    forca: 15, destreza: 14, constituicao: 13, inteligencia: 10, sabedoria: 10, carisma: 8,
  };

  it('modo +2/+1 aplica corretamente', () => {
    const dist: BackgroundBonusDistribution = {
      mode: '+2/+1',
      distribution: { forca: 2, destreza: 1 },
    };
    const result = getFinalAttributes(base, dist);
    expect(result.forca).toBe(17);
    expect(result.destreza).toBe(15);
  });

  it('modo +1/+1/+1 aplica corretamente', () => {
    const dist: BackgroundBonusDistribution = {
      mode: '+1/+1/+1',
      distribution: { forca: 1, destreza: 1, constituicao: 1 },
    };
    const result = getFinalAttributes(base, dist);
    expect(result.forca).toBe(16);
    expect(result.destreza).toBe(15);
    expect(result.constituicao).toBe(14);
  });

  it('sem distribuição retorna base', () => {
    const result = getFinalAttributes(base, null);
    expect(result).toEqual(base);
  });

  it('cap em 20 é respeitado', () => {
    const highBase: Record<AttributeKey, number> = {
      forca: 19, destreza: 8, constituicao: 8, inteligencia: 8, sabedoria: 8, carisma: 8,
    };
    const dist: BackgroundBonusDistribution = {
      mode: '+2/+1',
      distribution: { forca: 2, destreza: 1 },
    };
    const result = getFinalAttributes(highBase, dist);
    expect(result.forca).toBe(20); // 19+2=21 → capped
    expect(result.destreza).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// validateBonusDistribution
// ---------------------------------------------------------------------------
describe('validateBonusDistribution', () => {
  const allowed: AttributeKey[] = ['inteligencia', 'sabedoria', 'carisma'];

  it('modo +2/+1 válido — passa', () => {
    const dist: BackgroundBonusDistribution = {
      mode: '+2/+1',
      distribution: { inteligencia: 2, sabedoria: 1 },
    };
    expect(validateBonusDistribution(dist, allowed).valid).toBe(true);
  });

  it('modo +1/+1/+1 válido — passa', () => {
    const dist: BackgroundBonusDistribution = {
      mode: '+1/+1/+1',
      distribution: { inteligencia: 1, sabedoria: 1, carisma: 1 },
    };
    expect(validateBonusDistribution(dist, allowed).valid).toBe(true);
  });

  it('atributo não permitido — falha', () => {
    const dist: BackgroundBonusDistribution = {
      mode: '+2/+1',
      distribution: { forca: 2, sabedoria: 1 },
    };
    const result = validateBonusDistribution(dist, allowed);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('forca'))).toBe(true);
  });

  it('modo +1/+1/+1 com apenas 2 atributos — falha', () => {
    const dist: BackgroundBonusDistribution = {
      mode: '+1/+1/+1',
      distribution: { inteligencia: 1, sabedoria: 1 },
    };
    const result = validateBonusDistribution(dist, allowed);
    expect(result.valid).toBe(false);
  });

  it('modo +2/+1 com dois +2 — falha', () => {
    const dist: BackgroundBonusDistribution = {
      mode: '+2/+1',
      distribution: { inteligencia: 2, sabedoria: 2 },
    };
    const result = validateBonusDistribution(dist, allowed);
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isAttributesStepComplete
// ---------------------------------------------------------------------------
describe('isAttributesStepComplete', () => {
  it('point buy com 27 pontos — completo', () => {
    const attrs = { forca: 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, carisma: 8 };
    expect(isAttributesStepComplete({ method: 'pointBuy', base: attrs })).toBe(true);
  });

  it('point buy com menos de 27 pontos — incompleto', () => {
    const attrs = { forca: 8, destreza: 8, constituicao: 8, inteligencia: 8, sabedoria: 8, carisma: 8 };
    expect(isAttributesStepComplete({ method: 'pointBuy', base: attrs })).toBe(false);
  });

  it('array padrão distribuído corretamente — completo', () => {
    const attrs = { forca: 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, carisma: 8 };
    expect(isAttributesStepComplete({ method: 'standard', base: attrs })).toBe(true);
  });

  it('array padrão com valor errado — incompleto', () => {
    const attrs = { forca: 15, destreza: 14, constituicao: 13, inteligencia: 11, sabedoria: 10, carisma: 8 };
    expect(isAttributesStepComplete({ method: 'standard', base: attrs })).toBe(false);
  });

  it('método null — incompleto', () => {
    const attrs = { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, carisma: 10 };
    expect(isAttributesStepComplete({ method: null, base: attrs })).toBe(false);
  });
});

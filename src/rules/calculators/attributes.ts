/**
 * Calculadora de atributos — fonte autoritativa de todas as operações
 * com pontuações e modificadores de atributo.
 *
 * As funções originais de src/utils/attributeUtils.ts são re-exportadas daqui;
 * attributeUtils.ts passa a importar deste módulo para manter compatibilidade.
 */

import type { AttributeKey, BackgroundBonusDistribution } from '../types/CharacterChoices';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;
export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;
export const ATTRIBUTE_SCORE_MAX = 20;

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

// ---------------------------------------------------------------------------
// Modificador
// ---------------------------------------------------------------------------

/** Calcula o modificador de um atributo: floor((score - 10) / 2) */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// ---------------------------------------------------------------------------
// Rolagem aleatória
// ---------------------------------------------------------------------------

/** Rola 4d6, descarta o menor, retorna resultado detalhado */
export function roll4d6DropLowest(): { dice: number[]; dropped: number; total: number } {
  const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  const minIndex = dice.reduce(
    (minIdx, curr, idx, arr) => (curr < arr[minIdx] ? idx : minIdx),
    0
  );
  const dropped = dice[minIndex];
  const filtered = dice.filter((_, idx) => idx !== minIndex);
  const total = filtered.reduce((acc, curr) => acc + curr, 0);
  return { dice, dropped, total };
}

// ---------------------------------------------------------------------------
// Point Buy
// ---------------------------------------------------------------------------

/** Custo em pontos de compra para uma pontuação (8–15) */
export function calculatePointBuyCost(score: number): number {
  return POINT_BUY_COSTS[score] ?? 0;
}

/** Custo total de todos os atributos no Point Buy */
export function calculateTotalPointCost(attributes: Record<string, number>): number {
  return Object.values(attributes).reduce(
    (sum, score) => sum + calculatePointBuyCost(score),
    0
  );
}

// ---------------------------------------------------------------------------
// Bônus de antecedente
// ---------------------------------------------------------------------------

/**
 * Aplica o bônus de antecedente ao conjunto base de atributos.
 * Regra obrigatória: valor final <= 20.
 */
export function applyBackgroundBonus(
  base: Record<string, number>,
  bonus: Record<string, number>
): Record<string, number> {
  const final: Record<string, number> = {};
  for (const attr of Object.keys(base)) {
    const total = base[attr] + (bonus[attr] ?? 0);
    final[attr] = Math.min(ATTRIBUTE_SCORE_MAX, total);
  }
  return final;
}

/**
 * Aplica uma distribuição de bônus estruturada (BackgroundBonusDistribution)
 * ao conjunto base, respeitando o cap de 20.
 */
export function getFinalAttributes(
  base: Record<AttributeKey, number>,
  bonusDistribution: BackgroundBonusDistribution | null
): Record<AttributeKey, number> {
  const final = { ...base };
  if (!bonusDistribution) return final;

  for (const [attr, bonus] of Object.entries(bonusDistribution.distribution)) {
    if (bonus && attr in final) {
      const key = attr as AttributeKey;
      final[key] = Math.min(ATTRIBUTE_SCORE_MAX, (final[key] ?? 0) + bonus);
    }
  }
  return final;
}

/**
 * Calcula todos os modificadores a partir dos atributos finais.
 */
export function calculateAllModifiers(
  attributes: Record<string, number>
): Record<string, number> {
  const mods: Record<string, number> = {};
  for (const [key, score] of Object.entries(attributes)) {
    mods[key] = calculateModifier(score);
  }
  return mods;
}

// ---------------------------------------------------------------------------
// Validação de distribuição de bônus
// ---------------------------------------------------------------------------

export interface BonusValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Valida que a distribuição de bônus de antecedente está correta:
 * - Somente atributos permitidos pelo antecedente
 * - Modo +2/+1: um atributo recebe +2 e outro +1 (ou o mesmo recebe os dois)
 * - Modo +1/+1/+1: exatamente três atributos recebem +1
 */
export function validateBonusDistribution(
  distribution: BackgroundBonusDistribution,
  allowedAttributes: AttributeKey[]
): BonusValidationResult {
  const errors: string[] = [];
  const { mode, distribution: dist } = distribution;

  const entries = Object.entries(dist).filter(([, v]) => v && v > 0) as [AttributeKey, number][];

  // Verificar atributos permitidos
  for (const [attr] of entries) {
    if (!allowedAttributes.includes(attr)) {
      errors.push(`Atributo "${attr}" não é permitido por este antecedente.`);
    }
  }

  const totalBonus = entries.reduce((sum, [, v]) => sum + v, 0);

  if (mode === '+2/+1') {
    if (totalBonus !== 3) {
      errors.push(`Modo +2/+1 requer bônus total de 3. Atual: ${totalBonus}.`);
    }
    const values = entries.map(([, v]) => v).sort();
    const validCombos = JSON.stringify([1, 2]);
    const validSingle = entries.length === 1 && totalBonus === 3; // não permitido — deve ser dois atributos distintos
    if (validSingle || JSON.stringify(values) !== validCombos) {
      if (!validSingle) {
        // aceitar somente [1,2] (um +1 e um +2)
        if (JSON.stringify(values) !== validCombos) {
          errors.push('Modo +2/+1 requer exatamente um atributo com +2 e outro com +1.');
        }
      }
    }
  } else if (mode === '+1/+1/+1') {
    if (totalBonus !== 3) {
      errors.push(`Modo +1/+1/+1 requer bônus total de 3. Atual: ${totalBonus}.`);
    }
    if (entries.length !== 3 || entries.some(([, v]) => v !== 1)) {
      errors.push('Modo +1/+1/+1 requer exatamente três atributos diferentes com +1 cada.');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Validação de completude dos atributos
// ---------------------------------------------------------------------------

/** Verifica se o step de atributos está completo, conforme o método escolhido */
export function isAttributesStepComplete(attrs: {
  method: string | null;
  base: Record<string, number>;
  randomRolls?: Array<{ assignedTo?: string | null }>;
  pointBuySpent?: number;
}): boolean {
  if (!attrs || !attrs.method) return false;

  if (attrs.method === 'pointBuy') {
    return calculateTotalPointCost(attrs.base) === POINT_BUY_BUDGET;
  }

  if (attrs.method === 'standard') {
    const required = [...STANDARD_ARRAY].sort();
    const current = Object.values(attrs.base as Record<string, number>).sort();
    return JSON.stringify(required) === JSON.stringify(current);
  }

  if (attrs.method === 'random') {
    const baseValues = Object.values(attrs.base as Record<string, number>);
    if (baseValues.length < 6 || !baseValues.every(v => v > 0)) return false;
    if (attrs.randomRolls && attrs.randomRolls.length >= 6) {
      const assignedAttrs = new Set(
        attrs.randomRolls.filter(r => r.assignedTo).map(r => r.assignedTo)
      );
      return assignedAttrs.size >= 6;
    }
    return false;
  }

  return false;
}

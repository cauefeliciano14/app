export type AdvantageMode = 'normal' | 'advantage' | 'disadvantage';

export interface DiceRollResult {
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  isCritical: boolean;
  isFumble: boolean;
  label: string;
  type: 'check' | 'save' | 'attack' | 'damage';
  advantageMode?: AdvantageMode;
  discardedRoll?: number;
}

export function rollDice(
  sides: number,
  count: number = 1,
  modifier: number = 0,
): { rolls: number[]; total: number } {
  const rolls = Array.from({ length: count }, () =>
    Math.floor(Math.random() * sides) + 1,
  );
  const total = rolls.reduce((sum, r) => sum + r, 0) + modifier;
  return { rolls, total };
}

export function rollD20Check(
  modifier: number,
  label: string,
  type: DiceRollResult['type'] = 'check',
  advantageMode: AdvantageMode = 'normal',
): DiceRollResult {
  if (advantageMode === 'normal') {
    const { rolls, total } = rollDice(20, 1, modifier);
    return {
      formula: `1d20${modifier >= 0 ? '+' : ''}${modifier}`,
      rolls,
      modifier,
      total,
      isCritical: rolls[0] === 20,
      isFumble: rolls[0] === 1,
      label,
      type,
      advantageMode,
    };
  }

  const roll1 = Math.floor(Math.random() * 20) + 1;
  const roll2 = Math.floor(Math.random() * 20) + 1;
  const chosen = advantageMode === 'advantage' ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
  const discarded = advantageMode === 'advantage' ? Math.min(roll1, roll2) : Math.max(roll1, roll2);
  const total = chosen + modifier;
  const modeLabel = advantageMode === 'advantage' ? 'Vantagem' : 'Desvantagem';

  return {
    formula: `2d20${advantageMode === 'advantage' ? 'kh1' : 'kl1'}${modifier >= 0 ? '+' : ''}${modifier} (${modeLabel})`,
    rolls: [chosen],
    modifier,
    total,
    isCritical: chosen === 20,
    isFumble: chosen === 1,
    label,
    type,
    advantageMode,
    discardedRoll: discarded,
  };
}

export function rollDamage(
  diceFormula: string,
  label: string,
): DiceRollResult {
  const match = diceFormula.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) {
    return {
      formula: diceFormula, rolls: [0], modifier: 0, total: 0,
      isCritical: false, isFumble: false, label, type: 'damage',
    };
  }
  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  const mod = match[3] ? parseInt(match[3]) : 0;
  const { rolls, total } = rollDice(sides, count, mod);
  return {
    formula: diceFormula,
    rolls,
    modifier: mod,
    total,
    isCritical: false,
    isFumble: false,
    label,
    type: 'damage',
  };
}

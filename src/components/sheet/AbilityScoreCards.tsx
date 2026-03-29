import { signedMod } from '../../utils/format';
import { CalculationTooltip } from '../ui/CalculationTooltip';
import type { AttributeBreakdownRow } from '../../rules/types/DerivedSheet';
import styles from './AbilityScoreCards.module.css';

const ABILITY_LABELS: Array<{ key: string; label: string; abbr: string }> = [
  { key: 'forca', label: 'Força', abbr: 'FOR' },
  { key: 'destreza', label: 'Destreza', abbr: 'DES' },
  { key: 'constituicao', label: 'Constituição', abbr: 'CON' },
  { key: 'inteligencia', label: 'Inteligência', abbr: 'INT' },
  { key: 'sabedoria', label: 'Sabedoria', abbr: 'SAB' },
  { key: 'carisma', label: 'Carisma', abbr: 'CAR' },
];

interface AbilityScoreCardsProps {
  finalAttributes: Record<string, number>;
  modifiers: Record<string, number>;
  attributeBreakdowns?: Record<string, AttributeBreakdownRow[]>;
  onAbilityClick?: (key: string, label: string, score: number, modifier: number) => void;
}

export function AbilityScoreCards({ finalAttributes, modifiers, attributeBreakdowns, onAbilityClick }: AbilityScoreCardsProps) {
  return (
    <div className={styles.grid}>
      {ABILITY_LABELS.map(({ key, label }) => {
        const score = finalAttributes[key] ?? 8;
        const mod = modifiers[key] ?? 0;
        const breakdown = attributeBreakdowns?.[key];

        const card = (
          <div
            key={key}
            className={styles.box}
            onClick={() => onAbilityClick?.(key, label, score, mod)}
            role={onAbilityClick ? 'button' : undefined}
            tabIndex={onAbilityClick ? 0 : undefined}
            onKeyDown={onAbilityClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onAbilityClick(key, label, score, mod); } : undefined}
          >
            <div className={styles.label}>{label}</div>
            <div className={styles.modifier}>{signedMod(mod)}</div>
            <div className={styles.scoreBadge}>{score}</div>
          </div>
        );

        if (!breakdown || breakdown.length <= 1) return <div key={key}>{card}</div>;

        return (
          <CalculationTooltip
            key={key}
            title={label}
            breakdown={breakdown}
            total={score}
            totalLabel="Pontuação"
          >
            {card}
          </CalculationTooltip>
        );
      })}
    </div>
  );
}

import type { DiceRollResult } from '../../utils/diceRoller';
import { signedMod } from '../../utils/format';
import styles from './DiceResultPanel.module.css';

interface DiceResultPanelProps {
  result: DiceRollResult;
  damageResult?: DiceRollResult;
  damageType?: string;
  onReroll: () => void;
  onRerollDamage?: () => void;
}

export function DiceResultPanel({
  result,
  damageResult,
  damageType,
  onReroll,
  onRerollDamage,
}: DiceResultPanelProps) {
  const d20 = result.rolls[0];
  const d20Class = result.isCritical
    ? styles.d20Critical
    : result.isFumble
      ? styles.d20Fumble
      : styles.d20Value;

  return (
    <div className={styles.panel}>
      <div className={styles.label}>{result.label}</div>
      <div className={styles.formula}>{result.formula}</div>

      <div className={d20Class}>{d20}</div>

      {result.isCritical && <div className={styles.critLabel}>Acerto Crítico!</div>}
      {result.isFumble && <div className={styles.fumbleLabel}>Falha Crítica!</div>}

      <div className={styles.modLine}>
        {d20} {result.modifier >= 0 ? '+' : ''} {result.modifier}
      </div>

      <hr className={styles.divider} />

      <div className={styles.total}>{result.total}</div>
      <div className={styles.totalLabel}>Total</div>

      {damageResult && (
        <div className={styles.damageSection}>
          <div className={styles.damageSectionTitle}>Dano</div>
          <div className={styles.damageRolls}>
            {damageResult.formula} → [{damageResult.rolls.join(', ')}]
            {damageResult.modifier !== 0 && ` ${signedMod(damageResult.modifier)}`}
          </div>
          <div className={styles.damageTotal}>{damageResult.total}</div>
          {damageType && <div className={styles.damageType}>{damageType}</div>}
          {onRerollDamage && (
            <button onClick={onRerollDamage} className={styles.rollBtn} style={{ marginTop: 8 }}>
              Rolar Dano Novamente
            </button>
          )}
        </div>
      )}

      <div className={damageResult ? styles.rollBtnRow : undefined}>
        <button onClick={onReroll} className={styles.rollBtn}>
          {damageResult ? 'Rolar Acerto' : 'Rolar Novamente'}
        </button>
      </div>
    </div>
  );
}

/* Ability detail panel — shown when clicking an ability score */

interface AbilityDetailPanelProps {
  abilityName: string;
  score: number;
  modifier: number;
  relatedSkills: Array<{ label: string; modifier: number; proficient: boolean }>;
  savingThrow?: { modifier: number; proficient: boolean };
  onRollSkill: (label: string, modifier: number) => void;
  onRollSave: (modifier: number) => void;
}

export function AbilityDetailPanel({
  abilityName,
  score,
  modifier,
  relatedSkills,
  savingThrow,
  onRollSkill,
  onRollSave,
}: AbilityDetailPanelProps) {
  return (
    <div className={styles.abilityDetail}>
      <div className={styles.abilityStats}>
        <div className={styles.abilityStat}>
          <div className={styles.abilityStatValue}>{score}</div>
          <div className={styles.abilityStatLabel}>Score</div>
        </div>
        <div className={styles.abilityStat}>
          <div className={styles.abilityStatValue}>{signedMod(modifier)}</div>
          <div className={styles.abilityStatLabel}>Modificador</div>
        </div>
      </div>

      {savingThrow && (
        <div className={styles.relatedSection}>
          <div className={styles.relatedTitle}>Teste de Resistência</div>
          <div
            className={styles.relatedRow}
            onClick={() => onRollSave(savingThrow.modifier)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onRollSave(savingThrow.modifier); }}
          >
            <span className={styles.relatedName}>
              {abilityName}
              {savingThrow.proficient && <span className={styles.profBadge}>PROF</span>}
            </span>
            <span className={styles.relatedBonus}>{signedMod(savingThrow.modifier)}</span>
          </div>
        </div>
      )}

      {relatedSkills.length > 0 && (
        <div className={styles.relatedSection}>
          <div className={styles.relatedTitle}>Perícias Relacionadas</div>
          {relatedSkills.map(skill => (
            <div
              key={skill.label}
              className={styles.relatedRow}
              onClick={() => onRollSkill(skill.label, skill.modifier)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onRollSkill(skill.label, skill.modifier); }}
            >
              <span className={styles.relatedName}>
                {skill.label}
                {skill.proficient && <span className={styles.profBadge}>PROF</span>}
              </span>
              <span className={styles.relatedBonus}>{signedMod(skill.modifier)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Attack detail panel */

interface AttackDetailPanelProps {
  weaponName: string;
  range: string;
  properties: string[];
  hitResult: DiceRollResult;
  damageResult: DiceRollResult;
  damageType: string;
  onRerollHit: () => void;
  onRerollDamage: () => void;
}

export function AttackDetailPanel({
  weaponName: _weaponName,
  range: _range,
  properties,
  hitResult,
  damageResult,
  damageType,
  onRerollHit,
  onRerollDamage,
}: AttackDetailPanelProps) {
  const d20 = hitResult.rolls[0];
  const d20Class = hitResult.isCritical
    ? styles.d20Critical
    : hitResult.isFumble
      ? styles.d20Fumble
      : styles.d20Value;

  return (
    <div className={styles.panel}>
      {properties.length > 0 && (
        <div className={styles.attackProps}>
          {properties.map(p => (
            <span key={p} className={styles.attackProp}>{p}</span>
          ))}
        </div>
      )}

      <div className={styles.label} style={{ marginTop: 12 }}>Acerto</div>
      <div className={styles.formula}>{hitResult.formula}</div>
      <div className={d20Class}>{d20}</div>

      {hitResult.isCritical && <div className={styles.critLabel}>Acerto Crítico!</div>}
      {hitResult.isFumble && <div className={styles.fumbleLabel}>Falha Crítica!</div>}

      <div className={styles.modLine}>
        {d20} {hitResult.modifier >= 0 ? '+' : ''} {hitResult.modifier}
      </div>

      <hr className={styles.divider} />
      <div className={styles.total}>{hitResult.total}</div>
      <div className={styles.totalLabel}>Total Acerto</div>

      <button onClick={onRerollHit} className={styles.rollBtn}>Rolar Acerto Novamente</button>

      <div className={styles.damageSection}>
        <div className={styles.damageSectionTitle}>Dano</div>
        <div className={styles.damageRolls}>
          {damageResult.formula} → [{damageResult.rolls.join(', ')}]
          {damageResult.modifier !== 0 && ` ${signedMod(damageResult.modifier)}`}
        </div>
        <div className={styles.damageTotal}>{damageResult.total}</div>
        <div className={styles.damageType}>{damageType}</div>

        <button onClick={onRerollDamage} className={styles.rollBtn} style={{ marginTop: 8 }}>
          Rolar Dano Novamente
        </button>
      </div>
    </div>
  );
}

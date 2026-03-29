import type { DerivedSkill } from '../../rules/types/DerivedSheet';
import { signedMod } from '../../utils/format';
import { ATTR_ABBR } from '../../utils/attributeConstants';
import { CalculationTooltip } from '../ui/CalculationTooltip';
import styles from './SkillsCard.module.css';

const ATTR_NAMES: Record<string, string> = {
  forca: 'Força', destreza: 'Destreza', constituicao: 'Constituição',
  inteligencia: 'Inteligência', sabedoria: 'Sabedoria', carisma: 'Carisma',
};

function buildSkillBreakdown(skill: DerivedSkill) {
  const rows: Array<{ label: string; value: number | string }> = [
    { label: `Mod. ${ATTR_NAMES[skill.attribute] ?? skill.attribute}`, value: skill.baseAbilityMod },
  ];
  if (skill.proficiencyValue > 0) {
    const profLabel = skill.expertise
      ? 'Expertise (×2)'
      : skill.halfProficient
        ? 'Jack of All Trades (½)'
        : 'Proficiência';
    rows.push({ label: profLabel, value: skill.proficiencyValue });
  }
  return rows;
}

interface SkillsCardProps {
  skills: DerivedSkill[];
  onSkillClick?: (skill: DerivedSkill) => void;
  expertiseSkills?: string[];
  onToggleExpertise?: (skillLabel: string) => void;
  canGrantExpertise?: boolean;
  expertiseCount?: number;
}

export function SkillsCard({
  skills,
  onSkillClick,
  expertiseSkills = [],
  onToggleExpertise,
  canGrantExpertise = false,
  expertiseCount = 0,
}: SkillsCardProps) {
  const usedExpertise = expertiseSkills.length;
  const remainingExpertise = expertiseCount - usedExpertise;

  return (
    <div>
      {canGrantExpertise && (
        <div className={styles.expertiseHeader}>
          <span className={styles.expertiseLabel}>EXPERTISE</span>
          <span className={styles.expertiseCount}>
            {usedExpertise}/{expertiseCount} selecionadas
          </span>
        </div>
      )}

      <div className={styles.headerRow}>
        <span className={styles.headerProf}>PROF</span>
        <span className={styles.headerMod}>MOD</span>
        <span className={styles.headerSkill}>PERÍCIA</span>
        <span className={styles.headerBonus}>BÔNUS</span>
      </div>

      {skills.map(skill => (
        <div
          key={skill.label}
          className={styles.skillRow}
          onClick={() => onSkillClick?.(skill)}
          role={onSkillClick ? 'button' : undefined}
          tabIndex={onSkillClick ? 0 : undefined}
          onKeyDown={onSkillClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onSkillClick(skill); } : undefined}
        >
          <div className={styles.profCol}>
            {skill.expertise ? (
              <div
                className={`${styles.profDot} ${styles.profDotExpertise}`}
                title="Expertise"
                onClick={canGrantExpertise ? (e) => { e.stopPropagation(); onToggleExpertise?.(skill.label); } : undefined}
                role={canGrantExpertise ? 'button' : undefined}
              />
            ) : skill.proficient ? (
              <div
                className={`${styles.profDot} ${styles.profDotFilled}`}
                title={canGrantExpertise && remainingExpertise > 0 ? 'Clique para adicionar Expertise' : undefined}
                onClick={canGrantExpertise && remainingExpertise > 0 ? (e) => { e.stopPropagation(); onToggleExpertise?.(skill.label); } : undefined}
                role={canGrantExpertise && remainingExpertise > 0 ? 'button' : undefined}
              />
            ) : skill.halfProficient ? (
              <div className={`${styles.profDot} ${styles.profDotHalf}`} title="Jack of All Trades (½ proficiência)" />
            ) : (
              <div className={`${styles.profDot} ${styles.profDotEmpty}`} />
            )}
          </div>
          <span className={styles.attrLabel}>
            {ATTR_ABBR[skill.attribute] ?? skill.attribute}
          </span>
          <span className={`${styles.skillName} ${skill.expertise ? styles.skillNameExpertise : ''}`}>
            {skill.label}
          </span>
          <CalculationTooltip
            title={skill.label}
            breakdown={buildSkillBreakdown(skill)}
            total={skill.modifier}
          >
            <div className={`${styles.bonusBox} ${skill.expertise ? styles.bonusBoxExpertise : ''}`}>
              {signedMod(skill.modifier)}
            </div>
          </CalculationTooltip>
        </div>
      ))}
    </div>
  );
}

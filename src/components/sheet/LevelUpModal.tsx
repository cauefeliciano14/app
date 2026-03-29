import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { getClassHPData } from '../../rules/data/classRules';
import { getSpellSlots } from '../../rules/calculators/spells';
import { getProficiencyBonus } from '../../rules/calculators/proficiency';
import type { DerivedSheet, SpellSlots } from '../../rules/types/DerivedSheet';
import type { ClassLevel } from '../../types/multiclass';
import classDetailsData from '../../data/classDetails.json';
import styles from './LevelUpModal.module.css';

interface Feature {
  level: number;
  name: string;
  description: string;
}

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newLevel: number, levelUpClassId?: string) => void;
  currentLevel: number;
  classId: string;
  className: string;
  classFeatures: Feature[];
  derivedSheet: DerivedSheet;
  classLevels?: ClassLevel[];
}

const SPELL_CIRCLE_LABELS = ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°'];

function diffSpellSlots(current: SpellSlots | null | undefined, next: SpellSlots | null | undefined): string[] {
  if (!next) return [];
  const changes: string[] = [];
  for (let i = 1; i <= 9; i++) {
    const cur = (current as any)?.[i] ?? 0;
    const nxt = (next as any)?.[i] ?? 0;
    if (nxt > cur) {
      changes.push(`${SPELL_CIRCLE_LABELS[i - 1]} círculo: ${cur} → ${nxt}`);
    }
  }
  return changes;
}

function getFeaturesForClass(cId: string): Feature[] {
  const details = classDetailsData[cId as keyof typeof classDetailsData] as any;
  if (!details?.features) return [];
  return details.features.map((f: any) => ({
    level: f.level ?? 1,
    name: f.name ?? '',
    description: typeof f.description === 'string' ? f.description.replace(/<[^>]+>/g, '') : '',
  }));
}

export function LevelUpModal({
  isOpen,
  onClose,
  onConfirm,
  currentLevel,
  classId,
  className,
  classFeatures,
  derivedSheet,
  classLevels,
}: LevelUpModalProps) {
  const isMulticlass = classLevels && classLevels.length > 1;
  const [selectedClassId, setSelectedClassId] = useState<string>(classId);

  // Resolve which class is being leveled up
  const activeClassId = isMulticlass ? selectedClassId : classId;
  const activeClassEntry = isMulticlass
    ? classLevels.find(cl => cl.classId === activeClassId)
    : undefined;
  const activeClassName = isMulticlass
    ? (activeClassEntry?.className ?? className)
    : className;
  const activeClassLevel = isMulticlass
    ? (activeClassEntry?.level ?? 0)
    : currentLevel;
  const newClassLevel = activeClassLevel + 1;
  const newTotalLevel = currentLevel + 1;

  // HP from the class being leveled
  const hpData = getClassHPData(activeClassId);
  const conMod = derivedSheet.modifiers['constituicao'] ?? 0;
  const hpGain = hpData ? hpData.fixedHpPerLevel + conMod : 0;
  const hitDie = hpData?.hitDieLabel ?? '?';

  // Features for the class being leveled at its new class level
  const activeFeaturesAll = isMulticlass ? getFeaturesForClass(activeClassId) : classFeatures;
  const newFeatures = activeFeaturesAll.filter(f => f.level === newClassLevel);

  // Proficiency bonus uses total character level
  const oldProf = getProficiencyBonus(currentLevel);
  const newProf = getProficiencyBonus(newTotalLevel);
  const profChanged = newProf > oldProf;

  // Spell slots (single class uses own table; multiclass recalculated by engine)
  const oldSlots = isMulticlass ? null : getSpellSlots(activeClassId, currentLevel);
  const newSlots = isMulticlass ? null : getSpellSlots(activeClassId, newTotalLevel);
  const slotChanges = diffSpellSlots(oldSlots, newSlots);

  const hasASI = newFeatures.some(f =>
    f.name.toLowerCase().includes('aumento') ||
    f.name.toLowerCase().includes('atributo') ||
    f.description.toLowerCase().includes('aumento no valor de atributo')
  );

  const hasSubclass = newFeatures.some(f =>
    f.name.toLowerCase().includes('subclasse') ||
    f.description.toLowerCase().includes('subclasse')
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Subir para Nível ${newTotalLevel}`}>
      <div className={styles.content}>
        {/* Multiclass: class picker */}
        {isMulticlass ? (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>QUAL CLASSE SUBIR?</div>
            <select
              className={styles.classSelect}
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
            >
              {classLevels.map(cl => (
                <option key={cl.classId} value={cl.classId}>
                  {cl.className} (nível {cl.level} → {cl.level + 1})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className={styles.classLabel}>{className}</div>
        )}

        {/* HP */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>PONTOS DE VIDA</div>
          <div className={styles.statRow}>
            <span className={styles.statIcon}>&#10084;&#65039;</span>
            <span>+{hpGain} PV</span>
            <span className={styles.statDetail}>({hitDie}: {hpData?.fixedHpPerLevel ?? '?'} + CON {conMod >= 0 ? '+' : ''}{conMod})</span>
          </div>
        </div>

        {/* Proficiency */}
        {profChanged && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>BONUS DE PROFICIENCIA</div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>&#128200;</span>
              <span>+{oldProf} → +{newProf}</span>
            </div>
          </div>
        )}

        {/* Spell Slots (single class only — multiclass recalculated by engine) */}
        {slotChanges.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>ESPACOS DE MAGIA</div>
            {slotChanges.map((change, i) => (
              <div key={i} className={styles.statRow}>
                <span className={styles.statIcon}>&#10024;</span>
                <span>{change}</span>
              </div>
            ))}
          </div>
        )}
        {isMulticlass && (
          <div className={styles.section}>
            <div className={styles.emptyNote}>Espacos de magia serao recalculados pela tabela de multiclasse.</div>
          </div>
        )}

        {/* New Features */}
        {newFeatures.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>NOVAS CARACTERISTICAS ({activeClassName} Nv.{newClassLevel})</div>
            {newFeatures.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureName}>{f.name}</div>
                <div className={styles.featureDesc}>{f.description.replace(/<[^>]+>/g, '').slice(0, 200)}{f.description.length > 200 ? '...' : ''}</div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts */}
        {hasASI && (
          <div className={styles.alert}>
            <strong>Talento / Aumento de Atributo</strong> disponivel neste nivel. Escolha na aba de Caracteristicas.
          </div>
        )}
        {hasSubclass && (
          <div className={styles.alertSub}>
            <strong>Subclasse</strong> disponivel neste nivel. Escolha na etapa de Classe.
          </div>
        )}

        {/* Nothing new */}
        {newFeatures.length === 0 && !profChanged && slotChanges.length === 0 && !isMulticlass && (
          <div className={styles.section}>
            <div className={styles.emptyNote}>Nenhuma nova caracteristica neste nivel (apenas HP).</div>
          </div>
        )}

        <button className={styles.confirmBtn} onClick={() => onConfirm(newTotalLevel, isMulticlass ? activeClassId : undefined)}>
          Subir para Nivel {newTotalLevel}{isMulticlass ? ` (${activeClassName} ${newClassLevel})` : ''}
        </button>
      </div>
    </Modal>
  );
}

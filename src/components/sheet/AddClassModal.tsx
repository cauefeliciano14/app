import { useMemo } from 'react';
import { Modal } from '../ui/Modal';
import classesSummary from '../../data/classesSummary.json';
import { checkMulticlassPrerequisite, MULTICLASS_PREREQUISITES } from '../../rules/data/multiclassRules';
import type { ClassLevel } from '../../types/multiclass';
import type { DerivedSheet } from '../../rules/types/DerivedSheet';
import styles from './AddClassModal.module.css';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClass: (classId: string, className: string) => void;
  currentClassLevels: ClassLevel[];
  derivedSheet: DerivedSheet;
}

const ATTR_LABELS: Record<string, string> = {
  forca: 'FOR', destreza: 'DES', constituicao: 'CON',
  inteligencia: 'INT', sabedoria: 'SAB', carisma: 'CAR',
};

export function AddClassModal({
  isOpen,
  onClose,
  onAddClass,
  currentClassLevels,
  derivedSheet,
}: AddClassModalProps) {
  const existingClassIds = useMemo(
    () => new Set(currentClassLevels.map(c => c.classId)),
    [currentClassLevels]
  );

  const classes = useMemo(() => {
    return (classesSummary as Array<{ id: string; name: string; description: string }>).map(cls => {
      const alreadyHas = existingClassIds.has(cls.id);
      const meetsPrereq = checkMulticlassPrerequisite(
        cls.id,
        derivedSheet.modifiers,
        derivedSheet.finalAttributes,
      );
      // Also check current classes meet their own prerequisites
      const currentClassesMeetPrereq = currentClassLevels.every(cl =>
        checkMulticlassPrerequisite(cl.classId, derivedSheet.modifiers, derivedSheet.finalAttributes)
      );
      const prereqAttrs = MULTICLASS_PREREQUISITES[cls.id] ?? [];
      const prereqLabel = prereqAttrs.map(a => `${ATTR_LABELS[a] ?? a} 13+`).join(', ');

      return {
        ...cls,
        alreadyHas,
        canAdd: !alreadyHas && meetsPrereq && currentClassesMeetPrereq,
        prereqLabel,
        meetsPrereq,
      };
    });
  }, [existingClassIds, currentClassLevels, derivedSheet]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Classe (Multiclasse)">
      <div className={styles.list}>
        {classes.map(cls => (
          <button
            key={cls.id}
            className={`${styles.classRow} ${cls.canAdd ? '' : styles.disabled}`}
            disabled={!cls.canAdd}
            onClick={() => { onAddClass(cls.id, cls.name); onClose(); }}
            title={cls.alreadyHas ? 'Já possui esta classe' : !cls.meetsPrereq ? `Pré-requisito: ${cls.prereqLabel}` : undefined}
          >
            <div className={styles.className}>{cls.name}</div>
            <div className={styles.classDesc}>{cls.description.slice(0, 80)}...</div>
            <div className={styles.prereq}>
              {cls.alreadyHas ? (
                <span className={styles.prereqMet}>Já possui</span>
              ) : cls.meetsPrereq ? (
                <span className={styles.prereqMet}>{cls.prereqLabel}</span>
              ) : (
                <span className={styles.prereqFail}>{cls.prereqLabel}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

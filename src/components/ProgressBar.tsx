import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  activeStep?: number;
  onStepClick?: (stepIndex: number) => void;
  selections?: Record<number, string>;
}

export const ProgressBar = ({ activeStep = 1, onStepClick, selections }: ProgressBarProps) => {
  const steps = [
    { num: 1, label: 'Classe' },
    { num: 2, label: 'Origem' },
    { num: 3, label: 'Espécie' },
    { num: 4, label: 'Atributos' },
    { num: 5, label: 'Equipamento' },
    { num: 6, label: 'Ficha' }
  ];

  return (
    <div className={styles.container} role="navigation" aria-label="Etapas de criação">
      <div className={styles.track}>
        {steps.map((s, i) => {
          const isActive   = s.num === activeStep;
          const isComplete = s.num < activeStep;
          const isClickable = (isComplete || s.num <= activeStep) && !!onStepClick;
          const selectionName = selections?.[s.num];

          return (
            <React.Fragment key={s.num}>
              {/* Step item */}
              <div
                onClick={() => isClickable && onStepClick!(s.num - 1)}
                className={[
                  styles.stepItem,
                  isClickable ? styles.stepItemClickable : '',
                  (isActive || isComplete) ? styles.stepItemVisible : '',
                ].join(' ')}
                {...(isActive ? { 'aria-current': 'step' as const } : {})}
              >
                {/* Badge circle */}
                <div className={[
                  styles.badge,
                  isActive ? styles.badgeActive : '',
                  isComplete ? styles.badgeComplete : '',
                ].join(' ')}>
                  {isComplete ? '\u2713' : s.num}
                </div>
                {/* Label */}
                <span className={[
                  styles.label,
                  isActive ? styles.labelActive : '',
                  isComplete ? styles.labelComplete : '',
                ].join(' ')}>
                  {s.label}
                </span>
                {/* Selection name (below label for completed steps) */}
                {isComplete && selectionName && (
                  <span className={styles.selectionName}>
                    {selectionName}
                  </span>
                )}
              </div>
              {/* Line connector */}
              {i < steps.length - 1 && (
                <div className={[
                  styles.connector,
                  s.num < activeStep ? styles.connectorComplete : '',
                ].join(' ')} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

import { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import { useDice } from '../../context/DiceContext';
import type { DieType } from './diceGeometries';
import { getDieFaces } from './diceGeometries';
import styles from './DiceTrayOverlay.module.css';

const DiceTray = lazy(() => import('./DiceTray').then(m => ({ default: m.DiceTray })));

export function DiceTrayOverlay() {
  const { currentRoll, settled, dismiss, themeId, webglAvailable } = useDice();
  const isVisible = currentRoll !== null;

  // Build dice array for 3D scene
  const diceArray = useMemo(() => {
    if (!currentRoll) return [];
    const arr: Array<{ type: DieType; id: string }> = [];
    let idx = 0;
    for (const spec of currentRoll.dice) {
      for (let i = 0; i < spec.count; i++) {
        arr.push({ type: spec.type, id: `${spec.type}-${idx++}` });
      }
    }
    return arr;
  }, [currentRoll]);

  // Fallback 2D animation state
  const [fallbackFaces, setFallbackFaces] = useState<number[]>([]);
  useEffect(() => {
    if (!isVisible || webglAvailable || settled) return;
    const interval = setInterval(() => {
      setFallbackFaces(diceArray.map(d => Math.floor(Math.random() * getDieFaces(d.type)) + 1));
    }, 80);
    return () => clearInterval(interval);
  }, [isVisible, webglAvailable, settled, diceArray]);

  // Auto-dismiss after 5 seconds once settled
  useEffect(() => {
    if (!settled) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [settled, dismiss]);

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ''}`}>
      <div className={styles.trayContainer}>
        {/* 3D Canvas or 2D Fallback */}
        <div className={styles.canvasWrapper}>
          {isVisible && webglAvailable && (
            <Suspense fallback={
              <div className={styles.fallbackDice}>
                <span className={styles.waiting}>Carregando dados...</span>
              </div>
            }>
              <DiceTray
                dice={diceArray}
                themeId={themeId}
                onAllSettled={() => {/* handled by DiceContext timeout */}}
              />
            </Suspense>
          )}
          {isVisible && !webglAvailable && (
            <div className={styles.fallbackDice}>
              {diceArray.map((d, i) => (
                <div
                  key={d.id}
                  className={settled ? styles.fallbackDieSettled : styles.fallbackDie}
                >
                  {settled
                    ? (currentRoll?.results[i] ?? '?')
                    : (fallbackFaces[i] ?? '?')
                  }
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {currentRoll && (
          <div className={styles.resultSection}>
            <div className={styles.label}>{currentRoll.label}</div>
            <div className={styles.formula}>{currentRoll.formula}</div>

            {settled ? (
              <>
                <div className={styles.diceResults}>
                  {currentRoll.results.map((val, i) => {
                    const die = diceArray[i];
                    const maxFace = die ? getDieFaces(die.type) : 20;
                    const className = val === maxFace ? styles.dieResultCritical
                      : val === 1 ? styles.dieResultFumble
                        : styles.dieResult;
                    return <span key={i} className={className}>{val}</span>;
                  })}
                </div>
                <div className={styles.totalRow}>
                  <span className={styles.total}>{currentRoll.total}</span>
                </div>
              </>
            ) : (
              <span className={styles.waiting}>Rolando...</span>
            )}

            <div className={styles.actions}>
              <button onClick={dismiss} className={styles.dismissBtn}>Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

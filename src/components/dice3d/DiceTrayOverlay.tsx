import { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useDice } from '../../context/DiceContext';
import type { DieType } from './diceGeometries';
import { getDieFaces } from './diceGeometries';
import styles from './DiceTrayOverlay.module.css';

const DiceTray = lazy(() => import('./DiceTray').then(m => ({ default: m.DiceTray })));

type CritType = 'nat20' | 'fumble' | null;

export function DiceTrayOverlay() {
  const { currentRoll, settled, markSettled, dismiss, themeId, webglAvailable } = useDice();
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

  const results = currentRoll?.results ?? [];

  // Detectar Nat20 / Critical Fail (apenas d20)
  const critType: CritType = useMemo(() => {
    if (!currentRoll || !settled) return null;
    for (let i = 0; i < diceArray.length; i++) {
      if (diceArray[i].type === 'd20') {
        if (currentRoll.results[i] === 20) return 'nat20';
        if (currentRoll.results[i] === 1) return 'fumble';
      }
    }
    return null;
  }, [currentRoll, settled, diceArray]);

  // Efeito de confete para Nat20
  useEffect(() => {
    if (critType !== 'nat20') return;
    const duration = 1500;
    const end = Date.now() + duration;
    const colors = ['#ffd700', '#f97316', '#fbbf24', '#ffffff'];
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [critType]);

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

  const trayClass = [
    styles.trayContainer,
    settled && critType === 'nat20' ? styles.critSuccess : '',
    settled && critType === 'fumble' ? styles.critFail : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ''}`}>
      <div className={trayClass}>
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
                results={results}
                themeId={themeId}
                onAllSettled={markSettled}
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

        {/* Indicador Nat20 / Fumble */}
        {settled && critType === 'nat20' && (
          <div className={styles.critBanner}>ACERTO CRÍTICO!</div>
        )}
        {settled && critType === 'fumble' && (
          <div className={styles.fumbleBanner}>FALHA CRÍTICA</div>
        )}

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

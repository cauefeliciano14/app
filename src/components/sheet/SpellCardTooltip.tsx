import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import spellsAll from '../../data/spells/spells_all.json';
import styles from './SpellCardTooltip.module.css';

interface SpellData {
  name: string;
  level: string;
  school: string;
  classes: string[];
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
}

const spellMap = new Map<string, SpellData>();
for (const sp of spellsAll as SpellData[]) {
  spellMap.set(sp.name, sp);
}

const HOVER_DELAY = 250;

interface SpellCardTooltipProps {
  spellName: string;
  children: React.ReactNode;
}

export function SpellCardTooltip({ spellName, children }: SpellCardTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spell = spellMap.get(spellName);

  const show = useCallback(() => {
    if (!spell) return;
    timerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const panelWidth = 320;
        let left = rect.left;
        left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12));
        let top = rect.bottom + 8;
        if (top + 300 > window.innerHeight) {
          top = Math.max(12, rect.top - 300);
        }
        setPosition({ top, left });
      }
      setIsVisible(true);
    }, HOVER_DELAY);
  }, [spell]);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!spell) return <>{children}</>;

  const isRitual = spell.castingTime.toLowerCase().includes('ritual');
  const isConcentration = spell.duration.toLowerCase().includes('concentra');

  return (
    <>
      <span
        ref={triggerRef}
        className={styles.wrapper}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {children}
      </span>
      {isVisible && position &&
        createPortal(
          <div className={styles.panel} style={{ top: position.top, left: position.left }}>
            <div className={styles.header}>
              <div className={styles.name}>{spell.name}</div>
              <div className={styles.meta}>
                {spell.level === 'Truque' ? `Truque de ${spell.school}` : `${spell.level}, ${spell.school}`}
              </div>
              {(isRitual || isConcentration) && (
                <div className={styles.tags}>
                  {isRitual && <span className={styles.tagRitual}>Ritual</span>}
                  {isConcentration && <span className={styles.tagConcentration}>Concentração</span>}
                </div>
              )}
            </div>
            <div className={styles.detailsGrid}>
              <span className={styles.detailLabel}>Conjuração:</span>
              <span className={styles.detailValue}>{spell.castingTime}</span>
              <span className={styles.detailLabel}>Alcance:</span>
              <span className={styles.detailValue}>{spell.range}</span>
              <span className={styles.detailLabel}>Componentes:</span>
              <span className={styles.detailValue}>{spell.components}</span>
              <span className={styles.detailLabel}>Duração:</span>
              <span className={styles.detailValue}>{spell.duration}</span>
            </div>
            <div className={styles.description}>
              {spell.description.length > 300
                ? spell.description.slice(0, 300) + '…'
                : spell.description}
            </div>
          </div>,
          document.body,
        )
      }
    </>
  );
}

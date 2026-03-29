import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './CalculationTooltip.module.css';

export interface BreakdownRow {
  label: string;
  value: number | string;
}

interface CalculationTooltipProps {
  /** Título exibido no topo do tooltip */
  title?: string;
  /** Linhas de breakdown (label + valor) */
  breakdown: BreakdownRow[];
  /** Valor total (exibido abaixo do divisor) */
  total: number | string;
  /** Label do total */
  totalLabel?: string;
  /** Elemento trigger (o filho que recebe hover) */
  children: ReactNode;
  /** Desativar o tooltip */
  disabled?: boolean;
}

const HOVER_DELAY = 200;

export function CalculationTooltip({
  title,
  breakdown,
  total,
  totalLabel = 'Total',
  children,
  disabled = false,
}: CalculationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (disabled) return;
    hoverTimerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const panelWidth = 240;
        let left = rect.left + rect.width / 2 - panelWidth / 2;
        // Manter dentro da viewport
        left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12));
        const top = rect.bottom + 8;
        setPosition({ top, left });
      }
      setIsVisible(true);
    }, HOVER_DELAY);
  }, [disabled]);

  const hide = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className={styles.wrapper}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <div className={styles.trigger}>{children}</div>
      </div>
      {isVisible && position &&
        createPortal(
          <div className={styles.panel} style={{ top: position.top, left: position.left }}>
            {title && <div className={styles.title}>{title}</div>}
            <div className={styles.table}>
              {breakdown.map((row, i) => (
                <div key={i} className={styles.row}>
                  <span className={styles.rowLabel}>{row.label}</span>
                  <span className={styles.rowValue}>
                    {typeof row.value === 'number' && row.value >= 0 ? `+${row.value}` : row.value}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.divider} />
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>{totalLabel}</span>
              <span className={styles.totalValue}>
                {typeof total === 'number' && total >= 0 ? `+${total}` : total}
              </span>
            </div>
          </div>,
          document.body,
        )
      }
    </>
  );
}

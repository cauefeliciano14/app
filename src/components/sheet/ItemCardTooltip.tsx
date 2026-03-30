import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import magicItems from '../../data/magicItems.json';
import styles from './ItemCardTooltip.module.css';

interface MagicItem {
  name: string;
  category: string;
  rarity: string;
  attunement: string | null;
  description: string;
  baseItem: string | null;
}

const itemMap = new Map<string, MagicItem>();
for (const item of magicItems as MagicItem[]) {
  itemMap.set(item.name, item);
}

const RARITY_CLASS: Record<string, string> = {
  comum: styles.rarityComum,
  incomum: styles.rarityIncomum,
  raro: styles.rarityRaro,
  'muito raro': styles.rarityMuitoRaro,
  lendário: styles.rarityLendario,
};

const RARITY_BORDER: Record<string, string> = {
  comum: 'rgba(148,163,184,0.3)',
  incomum: 'rgba(34,197,94,0.3)',
  raro: 'rgba(59,130,246,0.3)',
  'muito raro': 'rgba(168,85,247,0.3)',
  lendário: 'rgba(249,115,22,0.3)',
};

const RARITY_NAME_COLOR: Record<string, string> = {
  comum: '#94a3b8',
  incomum: '#22c55e',
  raro: '#3b82f6',
  'muito raro': '#a855f7',
  lendário: '#f97316',
};

const HOVER_DELAY = 250;

interface ItemCardTooltipProps {
  itemName: string;
  children: React.ReactNode;
}

export function ItemCardTooltip({ itemName, children }: ItemCardTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const item = itemMap.get(itemName);

  const show = useCallback(() => {
    if (!item) return;
    timerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const panelWidth = 300;
        let left = rect.left;
        left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12));
        let top = rect.bottom + 8;
        if (top + 280 > window.innerHeight) {
          top = Math.max(12, rect.top - 280);
        }
        setPosition({ top, left });
      }
      setIsVisible(true);
    }, HOVER_DELAY);
  }, [item]);

  const hide = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  if (!item) return <>{children}</>;

  const rarity = item.rarity?.toLowerCase() ?? 'comum';
  const borderColor = RARITY_BORDER[rarity] ?? 'rgba(255,255,255,0.1)';
  const nameColor = RARITY_NAME_COLOR[rarity] ?? 'var(--text-bright)';

  return (
    <>
      <span ref={triggerRef} className={styles.wrapper} onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </span>
      {isVisible && position &&
        createPortal(
          <div className={styles.panel} style={{ top: position.top, left: position.left, borderColor }}>
            <div className={styles.header}>
              <div className={styles.name} style={{ color: nameColor }}>{item.name}</div>
              <div className={styles.meta}>
                <span className={`${styles.rarityBadge} ${RARITY_CLASS[rarity] ?? ''}`}>{item.rarity}</span>
                <span className={styles.category}>{item.category}</span>
              </div>
            </div>
            {item.attunement && (
              <div className={styles.attunement}>(requer sintonia{item.attunement !== 'true' ? ` — ${item.attunement}` : ''})</div>
            )}
            <div className={styles.description}>
              {item.description.length > 350
                ? item.description.slice(0, 350) + '…'
                : item.description}
            </div>
          </div>,
          document.body,
        )
      }
    </>
  );
}

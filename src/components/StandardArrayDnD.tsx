import React, { useState, useRef, useCallback } from 'react';
import { ATTR_KEYS, ATTR_META } from '../utils/attributeConstants';
import styles from './StandardArrayDnD.module.css';

const STD_VALUES = [15, 14, 13, 12, 10, 8];

interface StandardArrayDnDProps {
  base: Record<string, number>;
  onUpdate: (newBase: Record<string, number>) => void;
}

export function StandardArrayDnD({ base, onUpdate }: StandardArrayDnDProps) {
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [overSlot, setOverSlot] = useState<string | null>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Compute unassigned values
  const assignedValues = ATTR_KEYS.map(k => base[k]).filter(v => v > 0);

  // Compute proper pool: each value used once
  const getPool = () => {
    const used = [...assignedValues];
    const available: number[] = [];
    for (const v of STD_VALUES) {
      const idx = used.indexOf(v);
      if (idx >= 0) {
        used.splice(idx, 1);
      } else {
        available.push(v);
      }
    }
    return available;
  };

  const availablePool = getPool();

  const handleDragStart = useCallback((value: number) => {
    setDragValue(value);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, attr: string) => {
    e.preventDefault();
    setOverSlot(attr);
  }, []);

  const handleDragLeave = useCallback(() => {
    setOverSlot(null);
  }, []);

  const handleDrop = useCallback((attr: string) => {
    if (dragValue === null) return;
    const newBase = { ...base, [attr]: dragValue };
    onUpdate(newBase);
    setDragValue(null);
    setOverSlot(null);
  }, [dragValue, base, onUpdate]);

  const handleRemove = useCallback((attr: string) => {
    const newBase = { ...base, [attr]: 0 };
    onUpdate(newBase);
  }, [base, onUpdate]);

  return (
    <div className={styles.container}>
      {/* Pool */}
      <div className={styles.pool}>
        <span className={styles.poolLabel}>Valores:</span>
        {availablePool.length > 0 ? (
          availablePool.map((value, i) => (
            <div
              key={`${value}-${i}`}
              className={styles.chip}
              draggable
              onDragStart={() => handleDragStart(value)}
              title={`Arraste ${value} para um atributo`}
            >
              {value}
            </div>
          ))
        ) : (
          <span className={styles.poolEmpty}>Todos os valores atribuídos</span>
        )}
      </div>

      {/* Slots */}
      <div className={styles.slotsGrid}>
        {ATTR_KEYS.map(attr => {
          const value = base[attr];
          const isFilled = value > 0;
          const isOver = overSlot === attr;

          const slotClass = isOver
            ? styles.slotOver
            : isFilled
            ? styles.slotFilled
            : styles.slot;

          return (
            <div
              key={attr}
              ref={el => { slotRefs.current[attr] = el; }}
              className={slotClass}
              onDragOver={e => handleDragOver(e, attr)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(attr)}
            >
              <div className={styles.slotHeader}>
                <span className={styles.slotIcon}>{ATTR_META[attr].icon}</span>
                <span className={styles.slotAbbr}>{ATTR_META[attr].abbr}</span>
              </div>
              {isFilled ? (
                <span
                  className={styles.slotValue}
                  onClick={() => handleRemove(attr)}
                  title="Clique para remover"
                >
                  {value}
                </span>
              ) : (
                <span className={styles.slotEmpty}>--</span>
              )}
              {!isFilled && <span className={styles.slotHint}>Solte aqui</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

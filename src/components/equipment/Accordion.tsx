import React, { useRef, useEffect, useState } from 'react';
import css from './equipment.module.css';

interface AccordionProps {
  title: string;
  badge?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  incomplete?: boolean;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ title, badge, isOpen, onToggle, incomplete, children }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  // Re-measure when children change while open
  useEffect(() => {
    if (isOpen && bodyRef.current) {
      const id = requestAnimationFrame(() => {
        if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [children, isOpen]);

  return (
    <div className={`${css.accordionWrap} ${incomplete ? css.accordionWrapIncomplete : ''}`}>
      <div onClick={onToggle} className={css.summaryBase}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          {incomplete && (
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-accent)', color: '#000', fontWeight: 900, fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</span>
          )}
          <span>{title}</span>
          {badge && <span style={{ marginLeft: '4px' }}>{badge}</span>}
        </div>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-faint)',
          fontWeight: 400,
          transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
          display: 'inline-block',
        }}>&#9662;</span>
      </div>
      <div style={{
        maxHeight: height !== undefined ? height : (isOpen ? 'none' : 0),
        overflow: 'hidden',
        transition: 'max-height 0.25s ease',
      }}>
        <div ref={bodyRef} style={{ padding: '0 16px 16px 16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { GLOSSARY } from '../data/glossary';
import { ContextualOverlay } from './ui/ContextualOverlay';

export const GlossaryTooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.glossary-term') as HTMLElement | null;
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      const term = target.getAttribute('data-glossary');
      if (term && GLOSSARY[term]) {
        setActiveTerm(term);
        setAnchorRect(target.getBoundingClientRect());
      }
      return;
    }
    setActiveTerm(null);
    setAnchorRect(null);
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [handleClick]);

  useEffect(() => {
    if (!activeTerm) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setActiveTerm(null); setAnchorRect(null); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeTerm]);

  return (
    <>
      {children}
      {activeTerm && (
        <ContextualOverlay anchorRect={anchorRect} width={380} title={activeTerm} onClose={() => { setActiveTerm(null); setAnchorRect(null); }}>
          <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.65 }}>{GLOSSARY[activeTerm]}</div>
        </ContextualOverlay>
      )}
    </>
  );
};

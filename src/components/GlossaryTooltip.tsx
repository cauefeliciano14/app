import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY } from '../data/glossary';

export const GlossaryTooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.glossary-term') as HTMLElement | null;
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      const term = target.getAttribute('data-glossary');
      if (term && GLOSSARY[term]) {
        setActiveTerm(term);
      }
      return;
    }
    // Click outside → close
    if (activeTerm) {
      setActiveTerm(null);
    }
  }, [activeTerm]);

  useEffect(() => {
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [handleClick]);

  // Close on Escape
  useEffect(() => {
    if (!activeTerm) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveTerm(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeTerm]);

  return (
    <>
      {children}
      {activeTerm && <GlossaryModal term={activeTerm} onClose={() => setActiveTerm(null)} />}
    </>
  );
};

const GlossaryModal: React.FC<{ term: string; onClose: () => void }> = ({ term, onClose }) => {
  const definition = GLOSSARY[term];
  if (!definition) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998 }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(17, 18, 24, 0.97)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(249,115,22,0.4)',
        borderRadius: '12px',
        padding: '16px 20px',
        minWidth: '280px',
        maxWidth: '380px',
        zIndex: 9999,
        boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 20px rgba(249,115,22,0.12)',
        animation: 'glossaryFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        <style>{`
          @keyframes glossaryFadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}</style>

        {/* Header */}
        <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#f97316', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
            {term}
          </div>
          <div
            onClick={onClose}
            style={{ color: '#64748b', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '2px 6px', borderRadius: '4px' }}
          >
            ✕
          </div>
        </div>

        {/* Definition */}
        <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.65, textAlign: 'justify' }}>
          {definition}
        </div>
      </div>
    </>,
    document.body
  );
};

import React from 'react';
import { createPortal } from 'react-dom';

interface ContextualOverlayProps {
  anchorRect?: DOMRect | null;
  width?: number;
  children: React.ReactNode;
  title?: string;
  onClose?: () => void;
}

export function ContextualOverlay({ anchorRect, width = 360, children, title, onClose }: ContextualOverlayProps) {
  const top = anchorRect ? Math.min(anchorRect.bottom + 10, window.innerHeight - 20) : 20;
  const left = anchorRect ? Math.min(anchorRect.left, window.innerWidth - width - 20) : window.innerWidth - width - 20;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top,
        left,
        width,
        maxHeight: anchorRect ? 'min(420px, calc(100vh - 40px))' : 'calc(100vh - 40px)',
        overflowY: 'auto',
        background: 'rgba(17,18,24,0.96)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(249,115,22,0.3)',
        borderRadius: '14px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
        zIndex: 9999,
        padding: '16px 18px',
      }}
    >
      {(title || onClose) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
          <div style={{ color: '#f97316', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase' }}>{title}</div>
          {onClose ? <button onClick={onClose} style={{ background: 'transparent', color: '#94a3b8', padding: 0 }}>✕</button> : null}
        </div>
      )}
      {children}
    </div>,
    document.body,
  );
}

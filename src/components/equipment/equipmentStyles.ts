import React from 'react';

export const accordionWrap: React.CSSProperties = {
  background: 'rgba(30, 32, 45, 0.4)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '10px',
  overflow: 'hidden',
};

export const summaryBase: React.CSSProperties = {
  padding: '14px 16px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#f1f5f9',
  listStyle: 'none',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  userSelect: 'none',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 10px 10px 38px',
  background: '#111218',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#f1f5f9',
  outline: 'none',
  fontSize: '0.9rem',
};

export const pillButton = (active: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  background: active ? '#f97316' : 'rgba(255,255,255,0.05)',
  color: active ? '#fff' : '#cbd5e1',
  transition: 'all 0.15s',
});

export const cardBg: React.CSSProperties = {
  background: '#13141b',
  border: '1px solid rgba(255,255,255,0.02)',
  borderRadius: '8px',
  padding: '16px',
};

export const rowAlt = (i: number): React.CSSProperties => ({
  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
});

export const tagPill: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  color: '#94a3b8',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.7rem',
};

export const btnSmall = (variant: 'primary' | 'danger' | 'success' | 'ghost' = 'primary'): React.CSSProperties => {
  const colors = {
    primary: { bg: '#f97316', color: '#fff' },
    danger: { bg: 'rgba(239,68,68,0.2)', color: '#fca5a5' },
    success: { bg: 'rgba(34,197,94,0.2)', color: '#86efac' },
    ghost: { bg: 'rgba(255,255,255,0.05)', color: '#cbd5e1' },
  };
  const c = colors[variant];
  return {
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: c.bg,
    color: c.color,
    transition: 'opacity 0.15s',
  };
};

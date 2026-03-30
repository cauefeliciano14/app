const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  action:   { label: 'Ação',        color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)' },
  bonus:    { label: 'Ação Bônus',  color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
  reaction: { label: 'Reação',      color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)' },
  attack:   { label: 'Ataque',      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)' },
  other:    { label: 'Outro',       color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
  limited:  { label: 'Limitado',    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
};

interface ActionTypeBadgeProps {
  type: string;
}

export function ActionTypeBadge({ type }: ActionTypeBadgeProps) {
  const config = BADGE_CONFIG[type] ?? BADGE_CONFIG.other;
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.55rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '1px 6px',
        borderRadius: '4px',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
}

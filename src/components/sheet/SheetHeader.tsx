
interface SheetHeaderProps {
  name: string;
  portrait: string | null;
  speciesName: string;
  className: string;
  level: number;
}

export function SheetHeader({ name, portrait, speciesName, className, level }: SheetHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      background: 'rgba(17, 18, 24, 0.6)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #1e1f2e, #2a2b3d)',
        border: '2px solid rgba(167,139,250,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {portrait ? (
          <img
            src={`/imgs/portrait_caracter/${portrait}`}
            alt={name || 'Retrato'}
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          '🧙'
        )}
      </div>
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
          {name || 'Sem Nome'}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
          Nível {level} &nbsp;·&nbsp; {speciesName || '—'} &nbsp;·&nbsp; {className || '—'}
        </div>
      </div>
    </div>
  );
}

import type { DerivedSavingThrow } from '../../rules/types/DerivedSheet';

function signedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface SavingThrowsCardProps {
  derivedSavingThrows: DerivedSavingThrow[];
}

export function SavingThrowsCard({ derivedSavingThrows }: SavingThrowsCardProps) {
  return (
    <div style={{
      background: 'rgba(17,18,24,0.6)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
        SALVAGUARDAS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {derivedSavingThrows.map(st => (
          <div key={st.attribute} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: `2px solid ${st.proficient ? '#a78bfa' : 'rgba(255,255,255,0.15)'}`,
              background: st.proficient ? '#a78bfa' : 'transparent',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', flex: 1 }}>{st.label}</span>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: st.proficient ? '#a78bfa' : '#cbd5e1',
              minWidth: '28px',
              textAlign: 'right',
            }}>
              {signedMod(st.modifier)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

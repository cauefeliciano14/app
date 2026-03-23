import type { DerivedSavingThrow } from '../../rules/types/DerivedSheet';

function signedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface SavingThrowsCardProps {
  derivedSavingThrows: DerivedSavingThrow[];
}

export function SavingThrowsCard({ derivedSavingThrows }: SavingThrowsCardProps) {
  return (
    <div style={{ padding: '8px 4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
        {derivedSavingThrows.map(st => {
          const isProf = st.proficient;
          const shortLabel = st.label.substring(0, 3).toUpperCase();
          
          return (
            <div key={st.attribute} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              position: 'relative',
              height: '36px',
            }}>
              {/* Hexagon Border Hack Horizontal */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: isProf ? '#991b1b' : '#7f1d1d',
                clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)',
                zIndex: 1,
              }} />
              <div style={{
                position: 'absolute',
                inset: '2px',
                background: 'rgba(14, 14, 18, 0.95)',
                clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)',
                zIndex: 2,
              }} />

              <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', padding: '0 14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9' }}>
                  {shortLabel}
                </span>
                
                <div style={{
                  color: isProf ? '#f87171' : '#e2e8f0',
                  fontSize: '1rem',
                  fontWeight: 900
                }}>
                  {signedMod(st.modifier)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

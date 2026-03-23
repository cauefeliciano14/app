
const ABILITY_LABELS: Array<{ key: string; label: string; abbr: string }> = [
  { key: 'forca', label: 'Força', abbr: 'FOR' },
  { key: 'destreza', label: 'Destreza', abbr: 'DES' },
  { key: 'constituicao', label: 'Constituição', abbr: 'CON' },
  { key: 'inteligencia', label: 'Inteligência', abbr: 'INT' },
  { key: 'sabedoria', label: 'Sabedoria', abbr: 'SAB' },
  { key: 'carisma', label: 'Carisma', abbr: 'CAR' },
];

function signedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface AbilityScoreCardsProps {
  finalAttributes: Record<string, number>;
  modifiers: Record<string, number>;
}

export function AbilityScoreCards({ finalAttributes, modifiers }: AbilityScoreCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', alignItems: 'stretch' }}>
      {ABILITY_LABELS.map(({ key, label }) => {
        const score = finalAttributes[key] ?? 8;
        const mod = modifiers[key] ?? 0;
        return (
          <div key={key} style={{
            position: 'relative',
            width: '64px',
            height: '76px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Hexagon Border Hack */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: '#991b1b',
              clipPath: 'polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%)',
              zIndex: 1,
            }} />
            <div style={{
              position: 'absolute',
              inset: '2px',
              background: 'rgba(14, 14, 18, 0.95)',
              clipPath: 'polygon(50% 0%, 100% 15%, 100% 85%, 50% 100%, 0% 85%, 0% 15%)',
              zIndex: 2,
            }} />
            
            {/* Inner Content */}
            <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-8px' }}>
               <div style={{ fontSize: '0.5rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '2px', textTransform: 'uppercase' }}>
                 {label}
               </div>
               <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>
                 {signedMod(mod)}
               </div>
            </div>

            {/* Base Oval Badge */}
            <div style={{ 
              position: 'absolute', 
              bottom: '-6px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              background: 'rgba(14, 14, 18, 1)',
              color: '#f87171',
              fontSize: '0.75rem',
              fontWeight: 900,
              borderRadius: '24px',
              padding: '2px 8px',
              border: '1px solid #991b1b',
              boxShadow: '0 2px 4px rgba(0,0,0,0.8)',
              zIndex: 4,
            }}>
              {score}
            </div>
          </div>
        );
      })}
    </div>
  );
}

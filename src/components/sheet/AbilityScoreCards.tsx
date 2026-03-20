
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(76px, 1fr))', gap: '8px', alignItems: 'stretch' }}>
      {ABILITY_LABELS.map(({ key, abbr }) => {
        const score = finalAttributes[key] ?? 8;
        const mod = modifiers[key] ?? 0;
        return (
          <div key={key} style={{
            background: 'rgba(17, 18, 24, 0.6)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            padding: '10px 14px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '80px',
            minWidth: 0,
          }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
              {abbr}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa', lineHeight: 1 }}>
              {signedMod(mod)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>
              {score}
            </div>
          </div>
        );
      })}
    </div>
  );
}

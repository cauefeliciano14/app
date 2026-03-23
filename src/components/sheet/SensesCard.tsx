
interface SensesCardProps {
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
  specialSenses: string[];
}

export function SensesCard({
  passivePerception,
  passiveInvestigation,
  passiveInsight,
  specialSenses,
}: SensesCardProps) {
  return (
    <div style={{ padding: '8px 4px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SenseRow label="PERCEPÇÃO PASSIVA" value={passivePerception} />
        <SenseRow label="INVESTIGAÇÃO PASSIVA" value={passiveInvestigation} />
        <SenseRow label="INTUIÇÃO PASSIVA" value={passiveInsight} />
        
        {specialSenses.length > 0 && (
          <div style={{ 
            marginTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '8px',
            textAlign: 'center'
          }}>
            {specialSenses.map(s => (
              <div key={s} style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SenseRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'flex-start',
      position: 'relative',
      height: '36px',
    }}>
      {/* Hexagon Border Hack Horizontal */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: '#7f1d1d',
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

      <div style={{ position: 'relative', zIndex: 3, display: 'flex', gap: '12px', width: '100%', alignItems: 'center', padding: '0 14px' }}>
        <div style={{
          color: '#e2e8f0',
          fontSize: '1rem',
          fontWeight: 900
        }}>
          {value}
        </div>
        
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9' }}>
          {label}
        </span>
      </div>
    </div>
  );
}


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
    <div style={{
      background: 'rgba(17,18,24,0.6)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
        SENTIDOS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <SenseRow label="Percepção Passiva" value={passivePerception} />
        <SenseRow label="Investigação Passiva" value={passiveInvestigation} />
        <SenseRow label="Intuição Passiva" value={passiveInsight} />
        {specialSenses.map(s => (
          <div key={s} style={{ fontSize: '0.82rem', color: '#38bdf8', marginTop: '2px' }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function SenseRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1' }}>{value}</span>
    </div>
  );
}

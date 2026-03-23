
interface BackgroundTabProps {
  backgroundName?: string;
  backgroundDescription?: string;
  backgroundSkills?: string[];
  backgroundTool?: string;
  backgroundEquipment?: string;
  originTalent?: string;
}

export function BackgroundTab({
  backgroundName,
  backgroundDescription,
  backgroundSkills,
  backgroundTool,
  backgroundEquipment,
  originTalent,
}: BackgroundTabProps) {
  if (!backgroundName) {
    return (
      <div style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', padding: '24px' }}>
        Nenhum antecedente selecionado.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{
        background: 'rgba(17,18,24,0.6)',
        border: 'none',
        borderLeft: '2px solid #991b1b',
        borderRadius: '4px',
        padding: '12px 14px',
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px', textTransform: 'uppercase' }}>
          {backgroundName}
        </div>
        {backgroundDescription && (
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
            {backgroundDescription}
          </div>
        )}

        {backgroundSkills && backgroundSkills.length > 0 && (
          <InfoRow label="SKILLS" value={backgroundSkills.join(', ')} />
        )}
        {backgroundTool && (
          <InfoRow label="TOOLS" value={backgroundTool} />
        )}
        {backgroundEquipment && (
          <InfoRow label="EQUIPMENT" value={backgroundEquipment} />
        )}
        {originTalent && (
          <InfoRow label="ORIGIN FEAT" value={originTalent} accent="#a78bfa" />
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.78rem', color: '#64748b', minWidth: '110px', flexShrink: 0, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color: accent ?? '#cbd5e1' }}>{value}</span>
    </div>
  );
}

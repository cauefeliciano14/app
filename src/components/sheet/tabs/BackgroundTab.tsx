
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
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '12px 14px',
      }}>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>
          {backgroundName}
        </div>
        {backgroundDescription && (
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '12px' }}>
            {backgroundDescription}
          </div>
        )}

        {backgroundSkills && backgroundSkills.length > 0 && (
          <InfoRow label="Perícias" value={backgroundSkills.join(', ')} />
        )}
        {backgroundTool && (
          <InfoRow label="Ferramenta" value={backgroundTool} />
        )}
        {backgroundEquipment && (
          <InfoRow label="Equipamento" value={backgroundEquipment} />
        )}
        {originTalent && (
          <InfoRow label="Talento de Origem" value={originTalent} accent="#a78bfa" />
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.78rem', color: '#64748b', minWidth: '110px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color: accent ?? '#cbd5e1' }}>{value}</span>
    </div>
  );
}

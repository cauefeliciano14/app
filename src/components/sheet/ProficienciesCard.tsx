
interface ProficienciesCardProps {
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  languages: string[];
}

function ProfSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
        {items.join(', ')}
      </div>
    </div>
  );
}

export function ProficienciesCard({
  armorProficiencies,
  weaponProficiencies,
  toolProficiencies,
  languages,
}: ProficienciesCardProps) {
  return (
    <div style={{
      background: 'rgba(17,18,24,0.6)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
        PROFICIÊNCIAS E IDIOMAS
      </div>
      <ProfSection title="ARMADURAS" items={armorProficiencies} />
      <ProfSection title="ARMAS" items={weaponProficiencies} />
      <ProfSection title="FERRAMENTAS" items={toolProficiencies} />
      <ProfSection title="IDIOMAS" items={languages} />
    </div>
  );
}

import { getLanguageDisplayNames } from '../../utils/languagePresentation';

interface ProficienciesCardProps {
  skillProficiencies: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  languages: string[];
}

function ProfSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '0.7rem', color: '#f1f5f9', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '6px', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
        {items.join(', ')}
      </div>
    </div>
  );
}

export function ProficienciesCard({
  skillProficiencies,
  armorProficiencies,
  weaponProficiencies,
  toolProficiencies,
  languages,
}: ProficienciesCardProps) {
  const presentedLanguages = getLanguageDisplayNames(languages);

  return (
    <div>
      <ProfSection title="PERÍCIAS" items={skillProficiencies} />
      <ProfSection title="ARMADURAS" items={armorProficiencies} />
      <ProfSection title="ARMAS" items={weaponProficiencies} />
      <ProfSection title="FERRAMENTAS" items={toolProficiencies} />
      <ProfSection title="IDIOMAS" items={presentedLanguages} />
    </div>
  );
}

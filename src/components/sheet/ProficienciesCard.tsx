import { getLanguageDisplayNames } from '../../utils/languagePresentation';
import styles from './ProficienciesCard.module.css';

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
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.sectionItems}>{items.join(', ')}</div>
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
    <div className={styles.container}>
      <ProfSection title="PERÍCIAS" items={skillProficiencies} />
      <ProfSection title="ARMADURAS" items={armorProficiencies} />
      <ProfSection title="ARMAS" items={weaponProficiencies} />
      <ProfSection title="FERRAMENTAS" items={toolProficiencies} />
      <ProfSection title="IDIOMAS" items={presentedLanguages} />
    </div>
  );
}

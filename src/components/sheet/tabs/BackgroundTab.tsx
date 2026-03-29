import styles from './BackgroundTab.module.css';

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
    return <div className={styles.emptyText}>Nenhum antecedente selecionado.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.title}>{backgroundName}</div>
        {backgroundDescription && (
          <div className={styles.description}>{backgroundDescription}</div>
        )}

        {backgroundSkills && backgroundSkills.length > 0 && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>SKILLS</span>
            <span className={styles.infoValue}>{backgroundSkills.join(', ')}</span>
          </div>
        )}
        {backgroundTool && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>TOOLS</span>
            <span className={styles.infoValue}>{backgroundTool}</span>
          </div>
        )}
        {backgroundEquipment && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>EQUIPMENT</span>
            <span className={styles.infoValue}>{backgroundEquipment}</span>
          </div>
        )}
        {originTalent && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>ORIGIN FEAT</span>
            <span className={styles.infoValueAccent}>{originTalent}</span>
          </div>
        )}
      </div>
    </div>
  );
}

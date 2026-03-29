import styles from './SensesCard.module.css';

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
    <div className={styles.container}>
      <div className={styles.list}>
        <SenseRow label="Percepção Passiva" value={passivePerception} />
        <SenseRow label="Investigação Passiva" value={passiveInvestigation} />
        <SenseRow label="Intuição Passiva" value={passiveInsight} />

        {specialSenses.length > 0 && (
          <div className={styles.specialSenses}>
            {specialSenses.map(s => (
              <div key={s} className={styles.specialSense}>{s}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SenseRow({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.row}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

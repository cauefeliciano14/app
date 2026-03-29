import { useChangeHistory } from '../context/ChangeHistoryContext';
import styles from './TimelinePanel.module.css';

function formatRelativeTime(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 10) return 'agora';
  if (diff < 60) return `${diff}s atrás`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  return `${hours}h atrás`;
}

const DOT_CLASS: Record<string, string> = {
  class: styles.dotClass,
  background: styles.dotBackground,
  species: styles.dotSpecies,
  attribute: styles.dotAttribute,
  equipment: styles.dotEquipment,
  name: styles.dotName,
  portrait: styles.dotPortrait,
};

export function TimelinePanel() {
  const { entries } = useChangeHistory();

  if (entries.length === 0) {
    return <p className={styles.empty}>Nenhuma alteração registrada.</p>;
  }

  return (
    <div className={styles.timeline}>
      {entries.slice(0, 15).map(entry => (
        <div key={entry.id} className={styles.entry}>
          <div className={`${styles.dot} ${DOT_CLASS[entry.type] || ''}`} />
          <div className={styles.description}>{entry.description}</div>
          <div className={styles.time}>{formatRelativeTime(entry.timestamp)}</div>
        </div>
      ))}
    </div>
  );
}

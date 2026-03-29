import type { ClassLevel } from '../../types/multiclass';
import styles from './SheetHeader.module.css';

interface SheetHeaderProps {
  name: string;
  portrait: string | null;
  speciesName: string;
  className: string;
  level: number;
  creatureSize?: string;
  alignment?: string | null;
  subclassName?: string;
  classLevels?: ClassLevel[];
}

export function SheetHeader({
  name, portrait, speciesName, className, level, creatureSize, alignment, subclassName, classLevels,
}: SheetHeaderProps) {
  /** Extrai apenas o rótulo curto do tamanho (ex: "Médio" de "Médio (1,2-2,1m)") */
  const sizeLabel = creatureSize?.split('(')[0]?.trim() ?? '';

  const isMulticlass = classLevels && classLevels.length > 1;
  const classDisplay = isMulticlass
    ? classLevels.map(cl => `${cl.className} ${cl.level}`).join(' / ')
    : `${className || '—'}${subclassName ? ` (${subclassName})` : ''}`;

  return (
    <div className={styles.container}>
      <div className={styles.portrait}>
        {portrait ? (
          <img
            src={`/imgs/portrait_caracter/${portrait}`}
            alt={name || 'Retrato'}
            className={styles.portraitImg}
          />
        ) : (
          '🧙'
        )}
      </div>
      <div>
        <div className={styles.name}>{name || 'Sem Nome'}</div>
        <div className={styles.meta}>
          Nível {level} &nbsp;·&nbsp; {speciesName || '—'} &nbsp;·&nbsp; {classDisplay}
          {sizeLabel && <>&nbsp;·&nbsp;<span className={styles.sizeBadge}>{sizeLabel}</span></>}
        </div>
        {alignment && (
          <div className={styles.metaSub}>{alignment}</div>
        )}
      </div>
    </div>
  );
}

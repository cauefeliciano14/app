import { useState } from 'react';
import type { ActiveTalentSummary } from '../../../rules/types/DerivedSheet';
import { ParsedRuleText } from '../../ui/RuleTooltip';
import styles from './FeaturesTraitsTab.module.css';

interface Feature {
  level: number;
  name: string;
  description: string;
}

interface Trait {
  title: string;
  description: string;
}

interface FeaturesTraitsTabProps {
  classFeatures: Feature[];
  speciesTraits: Trait[];
  originTalent?: string;
  activeTalents?: ActiveTalentSummary[];
  derivedTraits?: string[];
  backgroundName?: string;
  backgroundSkills?: string[];
  backgroundTool?: string;
  characterLevel: number;
}

export function FeaturesTraitsTab({
  classFeatures,
  speciesTraits,
  originTalent,
  activeTalents = [],
  derivedTraits = [],
  backgroundName,
  backgroundSkills,
  backgroundTool,
  characterLevel,
}: FeaturesTraitsTabProps) {
  const [searchText, setSearchText] = useState('');
  const activeFeatures = classFeatures.filter(f => f.level <= characterLevel);
  const q = searchText.toLowerCase();

  const filterFeatures = (features: Feature[]) =>
    q ? features.filter(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)) : features;
  const filterTraits = (traits: Trait[]) =>
    q ? traits.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : traits;

  const filteredFeatures = filterFeatures(activeFeatures);
  const filteredTraits = filterTraits(speciesTraits);

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="Buscar características…"
        className={styles.searchInput}
      />

      {filteredFeatures.length > 0 && (
        <Section title="CARACTERÍSTICAS DE CLASSE">
          <div className={styles.featureList}>
            {filteredFeatures.map((f, i) => (
              <FeatureEntry key={i} title={f.name} badge={`Nível ${f.level}`} description={f.description} />
            ))}
          </div>
        </Section>
      )}

      {filteredTraits.length > 0 && (
        <Section title="TRAÇOS DE ESPÉCIE">
          <div className={styles.featureList}>
            {filteredTraits.map((t, i) => (
              <FeatureEntry key={i} title={t.title} description={t.description} />
            ))}
          </div>
        </Section>
      )}

      {(activeTalents.length > 0 || originTalent) && (
        <Section title="FEITAS/TALENTOS APLICADOS">
          {activeTalents.map((talent) => (
            <div key={`${talent.source}-${talent.name}`} className={styles.talentEntry}>
              <div className={styles.talentName}>
                {talent.name}
                <span className={styles.talentSource}>
                  {talent.source === 'background' ? 'ANTECEDENTE' : 'ESPÉCIE'}
                </span>
              </div>
              {talent.notes.length > 0 && (
                <ul className={styles.talentNotes}>
                  {talent.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              )}
            </div>
          ))}
          {activeTalents.length === 0 && originTalent && (
            <div className={styles.originTalent}>{originTalent}</div>
          )}
        </Section>
      )}

      {derivedTraits.length > 0 && (
        <Section title="EFEITOS DERIVADOS">
          <ul className={styles.derivedList}>
            {derivedTraits.map((trait) => <li key={trait}><ParsedRuleText text={trait} /></li>)}
          </ul>
        </Section>
      )}

      {backgroundName && (
        <Section title="ANTECEDENTE">
          <div className={styles.bgName}>{backgroundName}</div>
          {backgroundSkills && backgroundSkills.length > 0 && (
            <div className={styles.bgDetail}>
              <span className={styles.bgDetailLabel}>Perícias: </span>
              {backgroundSkills.join(', ')}
            </div>
          )}
          {backgroundTool && (
            <div className={styles.bgDetailMargin}>
              <span className={styles.bgDetailLabel}>Ferramentas: </span>
              {backgroundTool}
            </div>
          )}
        </Section>
      )}

      {filteredFeatures.length === 0 && filteredTraits.length === 0 && !originTalent && activeTalents.length === 0 && derivedTraits.length === 0 && (
        <div className={styles.emptyText}>Nenhuma característica disponível.</div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function FeatureEntry({ title, badge, description }: { title: string; badge?: string; description: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = description.length > 120;
  const shown = expanded || !long ? description : description.slice(0, 120) + '…';

  return (
    <div className={styles.featureEntry}>
      <div className={styles.featureHeader}>
        <span className={styles.featureTitle}>{title}</span>
        {badge && <span className={styles.featureBadge}>{badge}</span>}
      </div>
      <div className={styles.featureDesc}>
        <ParsedRuleText text={shown} />
        {long && (
          <button onClick={() => setExpanded(prev => !prev)} className={styles.moreBtn}>
            {expanded ? 'MENOS' : 'MAIS'}
          </button>
        )}
      </div>
    </div>
  );
}

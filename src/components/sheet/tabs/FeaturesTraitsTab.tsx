import { useState } from 'react';
import type { ActiveTalentSummary } from '../../../rules/types/DerivedSheet';

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
  const activeFeatures = classFeatures.filter(f => f.level <= characterLevel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {activeFeatures.length > 0 && (
        <Section title="CARACTERÍSTICAS DE CLASSE">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeFeatures.map((f, i) => (
              <FeatureEntry key={i} title={f.name} badge={`Nível ${f.level}`} description={f.description} />
            ))}
          </div>
        </Section>
      )}

      {speciesTraits.length > 0 && (
        <Section title="TRAÇOS DE ESPÉCIE">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {speciesTraits.map((t, i) => (
              <FeatureEntry key={i} title={t.title} description={t.description} />
            ))}
          </div>
        </Section>
      )}

      {(activeTalents.length > 0 || originTalent) && (
        <Section title="FEITAS/TALENTOS APLICADOS">
          {activeTalents.map((talent) => (
            <div key={`${talent.source}-${talent.name}`} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 700 }}>
                {talent.name}
                <span style={{ color: '#64748b', fontSize: '0.65rem', marginLeft: '8px', fontWeight: 600 }}>
                  {talent.source === 'background' ? 'ANTECEDENTE' : 'ESPÉCIE'}
                </span>
              </div>
              {talent.notes.length > 0 && (
                <ul style={{ margin: '4px 0 0 16px', color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {talent.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              )}
            </div>
          ))}
          {activeTalents.length === 0 && originTalent && (
            <div style={{ fontSize: '0.88rem', color: '#f1f5f9', fontWeight: 500 }}>{originTalent}</div>
          )}
        </Section>
      )}

      {derivedTraits.length > 0 && (
        <Section title="EFEITOS DERIVADOS">
          <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6 }}>
            {derivedTraits.map((trait) => <li key={trait}>{trait}</li>)}
          </ul>
        </Section>
      )}

      {backgroundName && (
        <Section title="ANTECEDENTE">
          <div style={{ fontSize: '0.88rem', color: '#f1f5f9', marginBottom: '6px', fontWeight: 700 }}>
            {backgroundName}
          </div>
          {backgroundSkills && backgroundSkills.length > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              <span style={{ color: '#64748b', fontWeight: 700 }}>Perícias: </span>
              {backgroundSkills.join(', ')}
            </div>
          )}
          {backgroundTool && (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              <span style={{ color: '#64748b', fontWeight: 700 }}>Ferramentas: </span>
              {backgroundTool}
            </div>
          )}
        </Section>
      )}

      {activeFeatures.length === 0 && speciesTraits.length === 0 && !originTalent && activeTalents.length === 0 && derivedTraits.length === 0 && (
        <div style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', padding: '24px' }}>
          Nenhuma característica disponível.
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(17,18,24,0.6)',
      border: 'none',
      borderLeft: '2px solid #991b1b',
      borderRadius: '4px',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '10px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function FeatureEntry({ title, badge, description }: { title: string; badge?: string; description: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = description.length > 120;
  const shown = expanded || !long ? description : description.slice(0, 120) + '…';

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '4px',
      padding: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
        <span style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 700 }}>{title}</span>
        {badge && (
          <span style={{
            fontSize: '0.65rem',
            color: '#a78bfa',
            background: 'rgba(167,139,250,0.1)',
            border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: '4px',
            padding: '1px 6px',
          }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
        {shown}
        {long && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: '#991b1b',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: '0.75rem',
            }}
          >
            {expanded ? 'MENOS' : 'MAIS'}
          </button>
        )}
      </div>
    </div>
  );
}

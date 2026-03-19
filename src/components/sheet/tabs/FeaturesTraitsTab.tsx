import { useState } from 'react';

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
  backgroundName?: string;
  backgroundSkills?: string[];
  backgroundTool?: string;
  characterLevel: number;
}

export function FeaturesTraitsTab({
  classFeatures,
  speciesTraits,
  originTalent,
  backgroundName,
  backgroundSkills,
  backgroundTool,
  characterLevel,
}: FeaturesTraitsTabProps) {
  const activeFeatures = classFeatures.filter(f => f.level <= characterLevel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Class features */}
      {activeFeatures.length > 0 && (
        <Section title="CARACTERÍSTICAS DE CLASSE">
          {activeFeatures.map((f, i) => (
            <FeatureEntry key={i} title={f.name} badge={`Nível ${f.level}`} description={f.description} />
          ))}
        </Section>
      )}

      {/* Species traits */}
      {speciesTraits.length > 0 && (
        <Section title="TRAÇOS DE ESPÉCIE">
          {speciesTraits.map((t, i) => (
            <FeatureEntry key={i} title={t.title} description={t.description} />
          ))}
        </Section>
      )}

      {/* Origin talent */}
      {originTalent && (
        <Section title="TALENTO DE ORIGEM">
          <div style={{ fontSize: '0.88rem', color: '#f1f5f9', fontWeight: 500 }}>
            {originTalent}
          </div>
        </Section>
      )}

      {/* Background */}
      {backgroundName && (
        <Section title="ANTECEDENTE">
          <div style={{ fontSize: '0.88rem', color: '#f1f5f9', marginBottom: '6px', fontWeight: 500 }}>
            {backgroundName}
          </div>
          {backgroundSkills && backgroundSkills.length > 0 && (
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              <span style={{ color: '#64748b' }}>Perícias: </span>
              {backgroundSkills.join(', ')}
            </div>
          )}
          {backgroundTool && (
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
              <span style={{ color: '#64748b' }}>Ferramenta: </span>
              {backgroundTool}
            </div>
          )}
        </Section>
      )}

      {activeFeatures.length === 0 && speciesTraits.length === 0 && !originTalent && (
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
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '10px' }}>
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
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
        <span style={{ fontSize: '0.88rem', color: '#f1f5f9', fontWeight: 600 }}>{title}</span>
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
      <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
        {shown}
        {long && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: '#a78bfa',
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: '0.78rem',
            }}
          >
            {expanded ? 'Menos' : 'Mais'}
          </button>
        )}
      </div>
    </div>
  );
}

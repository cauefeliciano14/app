import type { DerivedSkill } from '../../rules/types/DerivedSheet';

const ATTR_ABBR: Record<string, string> = {
  forca: 'FOR', destreza: 'DES', constituicao: 'CON',
  inteligencia: 'INT', sabedoria: 'SAB', carisma: 'CAR',
};

function signedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface SkillsCardProps {
  skills: DerivedSkill[];
}

export function SkillsCard({ skills }: SkillsCardProps) {
  return (
    <div style={{
      background: 'rgba(17,18,24,0.6)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '8px' }}>
        PERÍCIAS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {skills.map(skill => (
          <div key={skill.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: `2px solid ${skill.proficient ? '#a78bfa' : 'rgba(255,255,255,0.15)'}`,
              background: skill.proficient ? '#a78bfa' : 'transparent',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', flex: 1 }}>{skill.label}</span>
            <span style={{ fontSize: '0.7rem', color: '#475569', marginRight: '4px' }}>
              {ATTR_ABBR[skill.attribute] ?? skill.attribute}
            </span>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: skill.proficient ? '#a78bfa' : '#cbd5e1',
              minWidth: '28px',
              textAlign: 'right',
            }}>
              {signedMod(skill.modifier)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

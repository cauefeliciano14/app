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
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Helper Header Line */}
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '8px', paddingRight: '12px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', width: '38px', letterSpacing: '0.05em' }}>PROF</span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', width: '40px', letterSpacing: '0.05em' }}>MOD</span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', flex: 1, letterSpacing: '0.05em' }}>PERÍCIA</span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', width: '44px', textAlign: 'center', letterSpacing: '0.05em' }}>BÔNUS</span>
        </div>

        {skills.map(skill => (
          <div key={skill.label} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '4px 8px',
            background: 'transparent',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
          }}>
            
            {/* Prof Circle */}
            <div style={{ width: '38px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: skill.proficient ? 'none' : '2px solid rgba(255,255,255,0.2)',
                background: skill.proficient ? '#dc2626' : 'transparent',
                boxShadow: skill.proficient ? '0 0 10px rgba(220, 38, 38, 0.8)' : 'none',
              }} />
            </div>
            
            {/* Attribute Base (gray) */}
            <span style={{ fontSize: '0.75rem', color: '#64748b', width: '40px', fontWeight: 800 }}>
              {ATTR_ABBR[skill.attribute] ?? skill.attribute}
            </span>
            
            {/* Skill Name */}
            <span style={{ fontSize: '0.9rem', color: '#e2e8f0', flex: 1, fontWeight: 700 }}>
              {skill.label}
            </span>
            
            {/* Bonus Box (Red Outline) */}
            <div style={{
              width: '44px',
              border: '1px solid #7f1d1d',
              borderRadius: '4px',
              background: 'rgba(0,0,0,0.6)',
              textAlign: 'center',
              padding: '4px 0',
              fontSize: '1rem',
              fontWeight: 900,
              color: '#f1f5f9'
            }}>
              {signedMod(skill.modifier)}
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Character, CharacterAppearance, PersonalityTraits } from '../../../types/character';
import styles from './IdentityFieldsPanel.module.css';

const LIFESTYLES = [
  'Miserável',
  'Esquálido',
  'Pobre',
  'Modesto',
  'Confortável',
  'Rico',
  'Aristocrático',
];

interface IdentityFieldsPanelProps {
  character: Character;
  onUpdateCharacter: (updater: (prev: Character) => Character) => void;
}

export function IdentityFieldsPanel({ character, onUpdateCharacter }: IdentityFieldsPanelProps) {

  const updateAppearance = (field: keyof CharacterAppearance, value: string) => {
    onUpdateCharacter(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value },
    }));
  };

  const updatePersonality = (field: keyof PersonalityTraits, value: string) => {
    onUpdateCharacter(prev => ({
      ...prev,
      personalityTraits: { ...prev.personalityTraits, [field]: value },
    }));
  };

  const updateField = (field: 'faith' | 'lifestyle' | 'backstory' | 'organizations', value: string) => {
    onUpdateCharacter(prev => ({ ...prev, [field]: value }));
  };

  /** Indica se um grupo tem algum campo preenchido */
  const hasAppearance = Object.values(character.appearance ?? {}).some(v => v.trim());
  const hasPersonality = Object.values(character.personalityTraits ?? {}).some(v => v.trim());
  const hasBackstory = !!character.backstory?.trim();
  const hasExtras = !!character.faith?.trim() || !!character.lifestyle?.trim() || !!character.organizations?.trim();

  return (
    <div className={styles.panel}>

      {/* ── Aparência Física ── */}
      <details className={styles.fieldGroup}>
        <summary className={styles.collapsibleSummary}>
          <div className={styles.groupTitle}>
            <span className={styles.groupIcon}>👤</span> Aparência
            {hasAppearance && <span className={styles.filledIndicator} />}
          </div>
          <span className={styles.chevron}>▾</span>
        </summary>
        <div className={styles.collapsibleBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Altura</label>
              <input
                className={styles.fieldInput}
                value={character.appearance?.height ?? ''}
                onChange={e => updateAppearance('height', e.target.value)}
                placeholder="1,75m"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Peso</label>
              <input
                className={styles.fieldInput}
                value={character.appearance?.weight ?? ''}
                onChange={e => updateAppearance('weight', e.target.value)}
                placeholder="70kg"
              />
            </div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Cor dos Olhos</label>
              <input
                className={styles.fieldInput}
                value={character.appearance?.eyeColor ?? ''}
                onChange={e => updateAppearance('eyeColor', e.target.value)}
                placeholder="Castanhos"
              />
            </div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Cor do Cabelo</label>
              <input
                className={styles.fieldInput}
                value={character.appearance?.hairColor ?? ''}
                onChange={e => updateAppearance('hairColor', e.target.value)}
                placeholder="Negro"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Cor da Pele</label>
              <input
                className={styles.fieldInput}
                value={character.appearance?.skinColor ?? ''}
                onChange={e => updateAppearance('skinColor', e.target.value)}
                placeholder="Moreno"
              />
            </div>
          </div>
        </div>
      </details>

      {/* ── Personalidade ── */}
      <details className={styles.fieldGroup}>
        <summary className={styles.collapsibleSummary}>
          <div className={styles.groupTitle}>
            <span className={styles.groupIcon}>💭</span> Personalidade
            {hasPersonality && <span className={styles.filledIndicator} />}
          </div>
          <span className={styles.chevron}>▾</span>
        </summary>
        <div className={styles.collapsibleBody}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Traços de Personalidade</label>
            <textarea
              className={styles.fieldTextarea}
              value={character.personalityTraits?.traits ?? ''}
              onChange={e => updatePersonality('traits', e.target.value)}
              placeholder="Eu sempre tenho um plano para quando as coisas dão errado..."
              rows={2}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Ideais</label>
            <textarea
              className={styles.fieldTextarea}
              value={character.personalityTraits?.ideals ?? ''}
              onChange={e => updatePersonality('ideals', e.target.value)}
              placeholder="Liberdade. Correntes são feitas para serem quebradas."
              rows={2}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Vínculos</label>
            <textarea
              className={styles.fieldTextarea}
              value={character.personalityTraits?.bonds ?? ''}
              onChange={e => updatePersonality('bonds', e.target.value)}
              placeholder="Eu devo minha vida ao sacerdote que me acolheu quando meus pais morreram."
              rows={2}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Defeitos</label>
            <textarea
              className={styles.fieldTextarea}
              value={character.personalityTraits?.flaws ?? ''}
              onChange={e => updatePersonality('flaws', e.target.value)}
              placeholder="Eu não consigo resistir a um rosto bonito."
              rows={2}
            />
          </div>
        </div>
      </details>

      {/* ── Backstory ── */}
      <details className={styles.fieldGroup}>
        <summary className={styles.collapsibleSummary}>
          <div className={styles.groupTitle}>
            <span className={styles.groupIcon}>📜</span> História
            {hasBackstory && <span className={styles.filledIndicator} />}
          </div>
          <span className={styles.chevron}>▾</span>
        </summary>
        <div className={styles.collapsibleBody}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Backstory</label>
            <textarea
              className={styles.fieldTextarea}
              style={{ minHeight: '80px' }}
              value={character.backstory ?? ''}
              onChange={e => updateField('backstory', e.target.value)}
              placeholder="Conte a história do seu personagem: de onde veio, o que o motiva, eventos marcantes..."
              rows={4}
            />
          </div>
        </div>
      </details>

      {/* ── Fé, Estilo de Vida, Organizações ── */}
      <details className={styles.fieldGroup}>
        <summary className={styles.collapsibleSummary}>
          <div className={styles.groupTitle}>
            <span className={styles.groupIcon}>⚔</span> Outros
            {hasExtras && <span className={styles.filledIndicator} />}
          </div>
          <span className={styles.chevron}>▾</span>
        </summary>
        <div className={styles.collapsibleBody}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Fé / Divindade</label>
              <input
                className={styles.fieldInput}
                value={character.faith ?? ''}
                onChange={e => updateField('faith', e.target.value)}
                placeholder="Tymora, Pelor..."
              />
            </div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Estilo de Vida</label>
              <select
                className={styles.fieldSelect}
                value={character.lifestyle ?? ''}
                onChange={e => updateField('lifestyle', e.target.value)}
              >
                <option value="">— Escolher —</option>
                {LIFESTYLES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Organizações / Aliados</label>
            <textarea
              className={styles.fieldTextarea}
              value={character.organizations ?? ''}
              onChange={e => updateField('organizations', e.target.value)}
              placeholder="Nomes de guildas, facções, aliados importantes..."
              rows={2}
            />
          </div>
        </div>
      </details>

    </div>
  );
}

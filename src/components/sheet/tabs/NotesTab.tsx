import { useState } from 'react';
import type { CharacterAppearance, PersonalityTraits, CharacterIdentityUpdate } from '../../../types/character';
import styles from './NotesTab.module.css';

interface NotesTabProps {
  notes: string;
  onUpdateNotes: (notes: string) => void;
  backstory?: string;
  appearance?: CharacterAppearance;
  personalityTraits?: PersonalityTraits;
  faith?: string;
  lifestyle?: string;
  organizations?: string;
  alignment?: string | null;
  onUpdateIdentity?: (update: CharacterIdentityUpdate) => void;
}

const ALIGNMENTS = [
  'Leal e Bom', 'Neutro e Bom', 'Caótico e Bom',
  'Leal e Neutro', 'Neutro', 'Caótico e Neutro',
  'Leal e Mau', 'Neutro e Mau', 'Caótico e Mau',
];

const LIFESTYLES = [
  'Miserável', 'Pobre', 'Modesto', 'Confortável', 'Rico', 'Aristocrático',
];

const APPEARANCE_FIELDS: Array<[keyof CharacterAppearance, string]> = [
  ['height', 'Altura'],
  ['weight', 'Peso'],
  ['eyeColor', 'Olhos'],
  ['hairColor', 'Cabelo'],
  ['skinColor', 'Pele'],
];

const PERSONALITY_FIELDS: Array<[keyof PersonalityTraits, string, string]> = [
  ['traits', 'Traços de Personalidade', 'Como você age, fala e se comporta…'],
  ['ideals', 'Ideais', 'O que você acredita e valoriza…'],
  ['bonds', 'Vínculos', 'Com quem ou o que você se importa…'],
  ['flaws', 'Defeitos', 'Suas fraquezas e falhas…'],
];

export function NotesTab({
  notes,
  onUpdateNotes,
  backstory = '',
  appearance = { height: '', weight: '', eyeColor: '', hairColor: '', skinColor: '' },
  personalityTraits = { traits: '', ideals: '', bonds: '', flaws: '' },
  faith = '',
  lifestyle = '',
  organizations = '',
  alignment = null,
  onUpdateIdentity,
}: NotesTabProps) {
  const [activeSection, setActiveSection] = useState<string>('identity');
  const canEdit = !!onUpdateIdentity;

  return (
    <div className={styles.container}>
      {/* Sub-nav */}
      <div className={styles.subNav}>
        {[{ id: 'identity', label: 'Identidade' }, { id: 'notes', label: 'Notas Livres' }].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={activeSection === s.id ? styles.subNavBtnActive : styles.subNavBtn}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Identity Section ── */}
      {activeSection === 'identity' && (
        <div className={styles.identityGrid}>

          {/* Aparência */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>👤 Aparência Física</div>
            <div className={styles.traitGrid}>
              {APPEARANCE_FIELDS.map(([field, label]) => (
                <div key={field} className={styles.traitItem}>
                  <label className={styles.traitLabel}>{label}</label>
                  {canEdit ? (
                    <input
                      className={styles.traitInput}
                      value={appearance[field] ?? ''}
                      onChange={e => onUpdateIdentity!({ appearance: { [field]: e.target.value } })}
                      placeholder={label}
                    />
                  ) : (
                    <span className={styles.traitValue}>{appearance[field] || '—'}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detalhes */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>⚔ Detalhes</div>

            <div className={styles.traitItem} style={{ marginBottom: 10 }}>
              <label className={styles.traitLabel}>Alinhamento</label>
              {canEdit ? (
                <select
                  className={styles.traitSelect}
                  value={alignment ?? ''}
                  onChange={e => onUpdateIdentity!({ alignment: e.target.value || null })}
                >
                  <option value="">— Escolher —</option>
                  {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : (
                <span className={styles.traitValue}>{alignment || '—'}</span>
              )}
            </div>

            <div className={styles.traitItem} style={{ marginBottom: 10 }}>
              <label className={styles.traitLabel}>Fé / Divindade</label>
              {canEdit ? (
                <input
                  className={styles.traitInput}
                  value={faith}
                  onChange={e => onUpdateIdentity!({ faith: e.target.value })}
                  placeholder="Ex: Tyr, Selûne, nenhuma…"
                />
              ) : (
                <span className={styles.traitValue}>{faith || '—'}</span>
              )}
            </div>

            <div className={styles.traitItem}>
              <label className={styles.traitLabel}>Estilo de Vida</label>
              {canEdit ? (
                <select
                  className={styles.traitSelect}
                  value={lifestyle}
                  onChange={e => onUpdateIdentity!({ lifestyle: e.target.value })}
                >
                  <option value="">— Escolher —</option>
                  {LIFESTYLES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              ) : (
                <span className={styles.traitValue}>{lifestyle || '—'}</span>
              )}
            </div>
          </div>

          {/* Personalidade */}
          <div className={styles.cardWide}>
            <div className={styles.cardTitle}>💭 Personalidade</div>
            <div className={styles.personalityGrid}>
              {PERSONALITY_FIELDS.map(([field, label, placeholder]) => (
                <div key={field} className={styles.personBlock}>
                  <div className={styles.personLabel}>{label}</div>
                  {canEdit ? (
                    <textarea
                      className={styles.personTextarea}
                      value={personalityTraits[field] ?? ''}
                      onChange={e => onUpdateIdentity!({ personalityTraits: { [field]: e.target.value } })}
                      placeholder={placeholder}
                      rows={2}
                    />
                  ) : (
                    <div className={styles.personText}>{personalityTraits[field] || '—'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Backstory */}
          <div className={styles.cardWide}>
            <div className={styles.cardTitle}>📜 História Pessoal</div>
            {canEdit ? (
              <textarea
                className={styles.backstoryTextarea}
                value={backstory}
                onChange={e => onUpdateIdentity!({ backstory: e.target.value })}
                placeholder="A história do seu personagem, de onde vem, o que o motiva…"
                rows={6}
              />
            ) : (
              <div className={styles.backstoryText}>{backstory || '—'}</div>
            )}
          </div>

          {/* Organizações */}
          <div className={styles.cardWide}>
            <div className={styles.cardTitle}>🏰 Organizações & Aliados</div>
            {canEdit ? (
              <textarea
                className={styles.backstoryTextarea}
                value={organizations}
                onChange={e => onUpdateIdentity!({ organizations: e.target.value })}
                placeholder="Guildas, ordens, aliados, inimigos…"
                rows={3}
              />
            ) : (
              <div className={styles.backstoryText}>{organizations || '—'}</div>
            )}
          </div>

        </div>
      )}

      {/* ── Notes Section ── */}
      {activeSection === 'notes' && (
        <>
          <div className={styles.hint}>
            Anotações livres sobre seu personagem, sessões, objetivos, etc.
          </div>
          <textarea
            value={notes}
            onChange={e => onUpdateNotes(e.target.value)}
            placeholder="Escreva suas anotações aqui…"
            className={styles.textarea}
          />
        </>
      )}
    </div>
  );
}

import React, { useState, useRef } from 'react';
import magoSpells from '../data/spells/mago_spells.json';
import talentsData from '../data/talents.json';
import { highlightKeywords } from '../utils/formatting';
import { TalentChoiceSection, checkTalentComplete } from './TalentChoices';

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_MAP: Record<string, string> = {
  aasimar: 'aasimar', anao: 'anoes', draconato: 'draconatos', elfo: 'elfos',
  gnomo: 'gnomos', golias: 'golias', humano: 'humanos', orc: 'orcs',
  pequenino: 'pequeninos', tiferino: 'tiferinos',
};

const ALL_SKILLS = [
  'Acrobacia','Arcanismo','Atletismo','Atuação','Enganação','Furtividade',
  'História','Intimidação','Intuição','Investigação','Lidar com Animais',
  'Medicina','Natureza','Percepção','Persuasão','Prestidigitação','Religião','Sobrevivência',
];

const ATTR_OPTIONS = ['Carisma', 'Inteligência', 'Sabedoria'];

const wizardCantrips = (magoSpells as any[]).filter(s => s.level === 'Truque');
const originTalents = (talentsData as any).talents.filter((t: any) => t.category === 'Origem');

// ─── Shared Styles ────────────────────────────────────────────────────────────

const accordionWrap: React.CSSProperties = {
  background: 'rgba(30, 32, 45, 0.4)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '10px',
  overflow: 'hidden',
};

const summaryBase: React.CSSProperties = {
  padding: '14px 16px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#f1f5f9',
  listStyle: 'none',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  userSelect: 'none',
};

const selectStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  background: '#111218',
  border: '1px solid rgba(255,255,255,0.2)',
  color: '#fff',
  width: '100%',
};

const tableWrap: React.CSSProperties = {
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.08)',
  marginBottom: '14px',
};

const thStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9',
  fontWeight: 700,
  background: 'rgba(255,255,255,0.05)',
  fontSize: '0.82rem',
  textAlign: 'left',
};

const tdStyle = (i: number): React.CSSProperties => ({
  padding: '7px 14px',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  color: '#e2e8f0',
  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
  fontSize: '0.82rem',
});

// ─── Reusable sub-components ──────────────────────────────────────────────────

const badgeCircle = (
  <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#f97316', color: '#000', fontWeight: 900, fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</span>
);

const Accordion: React.FC<{ title: string; badge?: React.ReactNode; incomplete?: boolean; children: React.ReactNode }> = ({ title, badge, incomplete, children }) => (
  <details style={{ ...accordionWrap, border: incomplete ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.06)' }}>
    <summary style={summaryBase}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        {incomplete && badgeCircle}
        <span>{title}</span>
      </div>
      <span className="accordion-chevron" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{badge ?? '▾'}</span>
    </summary>
    <div style={{ padding: '0 16px 16px 16px' }}>{children}</div>
  </details>
);

const SubSection: React.FC<{ title: string; incomplete?: boolean; children: React.ReactNode }> = ({ title, incomplete, children }) => (
  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
      {incomplete && badgeCircle}
      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
    </div>
    {children}
  </div>
);

const ExpandableText: React.FC<{ text: string }> = ({ text }) => {
  const [open, setOpen] = useState(false);
  const LIMIT = 220;
  const needsTrunc = text.length > LIMIT;
  return (
    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
      <div style={{ position: 'relative', overflow: 'hidden', maxHeight: open || !needsTrunc ? 'none' : '80px' }}>
        <span dangerouslySetInnerHTML={{ __html: highlightKeywords(text) }} />
        {!open && needsTrunc && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, transparent, rgba(30,32,45,0.95))' }} />
        )}
      </div>
      {needsTrunc && (
        <button onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', padding: '4px 0', fontSize: '0.8rem' }}>
          {open ? 'esconder' : 'ler mais...'}
        </button>
      )}
    </div>
  );
};

const DescText: React.FC<{ text: string; style?: React.CSSProperties }> = ({ text, style }) => (
  <>{text.split('\n\n').map((para, i) => (
    <p key={i} style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6, ...style }} dangerouslySetInnerHTML={{ __html: highlightKeywords(para) }} />
  ))}</>
);

const ConfirmBox: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(16,185,129,0.06)', border: '1px dashed rgba(16,185,129,0.25)', borderRadius: '8px', fontSize: '0.85rem', color: '#10b981' }}>
    ✓ {text}
  </div>
);

const SelectWithConfirm: React.FC<{
  placeholder: string; value: string; options: string[];
  onChange: (v: string) => void; confirmText?: string;
}> = ({ placeholder, value, options, onChange, confirmText }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <select className="premium-select" value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {value && confirmText && <ConfirmBox text={confirmText} />}
  </div>
);

// ─── Species trait sections ───────────────────────────────────────────────────

type ChoiceProps = { choices: Record<string, string>; setChoice: (k: string, v: string) => void };

/** Draconato — Herança Dracônica */
const DraconatoLineage: React.FC<{ species: any } & ChoiceProps> = ({ species, choices, setChoice }) => {
  const selected = species.lineage.choices.find((c: any) => c.id === choices['draconato']);
  return (
    <Accordion title={species.lineage.title} incomplete={!choices['draconato']}>
      <DescText text={species.lineage.description} style={{ marginBottom: '14px' }} />
      <div style={tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Dragão</th><th style={thStyle}>Tipo de Dano</th></tr></thead>
          <tbody>
            {species.lineage.choices.map((c: any, i: number) => (
              <tr key={c.id} style={{ background: choices['draconato'] === c.id ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
                <td style={tdStyle(i)}>{c.name.replace(/\s*\(.*\)/, '')}</td>
                <td style={{ ...tdStyle(i), color: '#f97316' }}>{c.mechanics}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <select className="premium-select" value={choices['draconato'] || ''} onChange={e => setChoice('draconato', e.target.value)} style={selectStyle}>
        <option value="">Selecione sua Herança Dracônica...</option>
        {species.lineage.choices.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {selected && <ConfirmBox text={`Você tem um ancestral Dragão ${selected.name.replace(/\s*\(.*\)/, '')}.`} />}
    </Accordion>
  );
};

/** Elfo — Linhagem Élfica */
const ElfoLinhagem: React.FC<{ species: any } & ChoiceProps> = ({ species, choices, setChoice }) => {
  const selectedLineage = species.lineage.choices.find((c: any) => c.id === choices['elfo']);
  const isAltoElfo = choices['elfo'] === 'alto-elfo';
  const selectedCantrip = wizardCantrips.find(s => s.name === choices['elfo-cantrip']);

  return (
    <Accordion title={species.lineage.title} incomplete={!choices['elfo']}>
      <DescText text={species.lineage.description} style={{ marginBottom: '14px' }} />
      <div style={tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Linhagem</th><th style={thStyle}>Nível 1</th><th style={thStyle}>Nível 3</th><th style={thStyle}>Nível 5</th></tr></thead>
          <tbody>
            {species.lineage.choices.map((c: any, i: number) => (
              <tr key={c.id} style={{ background: choices['elfo'] === c.id ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
                <td style={tdStyle(i)}>{c.name}</td>
                <td style={{ ...tdStyle(i), color: '#94a3b8', fontSize: '0.78rem' }}>{c.nv1}</td>
                <td style={{ ...tdStyle(i), color: '#94a3b8', fontSize: '0.78rem' }}>{c.nv3}</td>
                <td style={{ ...tdStyle(i), color: '#94a3b8', fontSize: '0.78rem' }}>{c.nv5}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <select className="premium-select" value={choices['elfo'] || ''} onChange={e => setChoice('elfo', e.target.value)} style={selectStyle}>
        <option value="">Selecione sua Linhagem Élfica...</option>
        {species.lineage.choices.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {selectedLineage && (
        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{selectedLineage.name}</p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords(selectedLineage.description) }} />
        </div>
      )}
      {selectedLineage && (
        <SubSection title="Magia da Linhagem Élfica" incomplete={!choices['elfo-attr'] || (isAltoElfo && !choices['elfo-cantrip'])}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords('Ao escolher sua Linhagem Élfica, e ao atingir os níveis 3 e 5, você aprende uma magia de círculo superior, conforme indicado na tabela. Essa magia está sempre preparada e pode ser conjurada uma vez sem usar um espaço de magia, restaurando essa capacidade ao completar um Descanso Longo. Além disso, você pode conjurá-la usando qualquer espaço de magia apropriado que possua. Inteligência, Sabedoria ou Carisma é seu atributo de conjuração para as magias que você conjura com este traço (escolha o atributo quando selecionar a linhagem).') }} />
          <select className="premium-select" value={choices['elfo-attr'] || ''} onChange={e => setChoice('elfo-attr', e.target.value)} style={selectStyle}>
            <option value="">Escolha seu atributo de conjuração...</option>
            {ATTR_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {choices['elfo-attr'] && <ConfirmBox text={`Suas magias da Linhagem ${selectedLineage.name} usam ${choices['elfo-attr']}.`} />}
          {isAltoElfo && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.83rem', color: '#94a3b8' }}>Como Alto Elfo, você aprende um truque da lista de Mago:</p>
              <select className="premium-select" value={choices['elfo-cantrip'] || ''} onChange={e => setChoice('elfo-cantrip', e.target.value)} style={selectStyle}>
                <option value="">– Escolha uma Magia –</option>
                {wizardCantrips.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              {selectedCantrip && (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>
                    {selectedCantrip.name} <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.78rem' }}>({selectedCantrip.school})</span>
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {[['Tempo', selectedCantrip.castingTime], ['Alcance', selectedCantrip.range], ['Duração', selectedCantrip.duration]].map(([k, v]) => (
                      <span key={k} style={{ fontSize: '0.75rem', color: '#94a3b8' }}><strong style={{ color: '#f1f5f9' }}>{k}:</strong> {v}</span>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords(selectedCantrip.description) }} />
                </div>
              )}
            </div>
          )}
        </SubSection>
      )}
    </Accordion>
  );
};

/** Elfo — Sentidos Aguçados */
const ElfoSentidos: React.FC<ChoiceProps> = ({ choices, setChoice }) => (
  <Accordion title="Sentidos Aguçados" badge={choices['elfo-skill'] ? '✓' : '▾'} incomplete={!choices['elfo-skill']}>
    <p style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords('Você tem proficiência na perícia Intuição, Percepção ou Sobrevivência.') }} />
    <SelectWithConfirm
      placeholder="Selecione sua perícia..."
      value={choices['elfo-skill'] || ''}
      options={['Intuição', 'Percepção', 'Sobrevivência']}
      onChange={v => setChoice('elfo-skill', v)}
      confirmText={choices['elfo-skill'] ? `Proficiência em ${choices['elfo-skill']} adquirida.` : undefined}
    />
  </Accordion>
);

/** Gnomo — Linhagem Gnômica */
const GnomoLinhagem: React.FC<{ species: any } & ChoiceProps> = ({ species, choices, setChoice }) => {
  const selectedLineage = species.lineage.choices.find((c: any) => c.id === choices['gnomo']);
  return (
    <Accordion title={species.lineage.title} incomplete={!choices['gnomo']}>
      <DescText text={species.lineage.description} style={{ marginBottom: '14px' }} />
      {species.lineage.choices.map((c: any) => (
        <div key={c.id} style={{ marginBottom: '14px' }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{c.name}</p>
          <ExpandableText text={c.description} />
        </div>
      ))}
      <select className="premium-select" value={choices['gnomo'] || ''} onChange={e => setChoice('gnomo', e.target.value)} style={{ ...selectStyle, marginTop: '4px' }}>
        <option value="">Escolha uma Linhagem...</option>
        {species.lineage.choices.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {selectedLineage && <ConfirmBox text={`${selectedLineage.name} selecionado.`} />}
      {selectedLineage && (
        <SubSection title="Magia da Linhagem Gnômica" incomplete={!choices['gnomo-attr']}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords('Independentemente da Linhagem Gnômica que você escolher, Inteligência, Sabedoria ou Carisma é seu atributo de conjuração para as magias que você conjura com este traço.') }} />
          <select className="premium-select" value={choices['gnomo-attr'] || ''} onChange={e => setChoice('gnomo-attr', e.target.value)} style={selectStyle}>
            <option value="">Escolha seu atributo de conjuração...</option>
            {ATTR_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {choices['gnomo-attr'] && <ConfirmBox text={`Suas magias da Linhagem dos ${selectedLineage.name}s usam ${choices['gnomo-attr']}.`} />}
        </SubSection>
      )}
    </Accordion>
  );
};

/** Golias — Ancestralidade Gigante */
const GoliaAncestralidade: React.FC<{ species: any } & ChoiceProps> = ({ species, choices, setChoice }) => {
  const selected = species.lineage.choices.find((c: any) => c.id === choices['golias']);
  return (
    <Accordion title={species.lineage.title} incomplete={!choices['golias']}>
      <DescText text={species.lineage.description} style={{ marginBottom: '14px' }} />
      {species.lineage.choices.map((c: any) => (
        <div key={c.id} style={{ marginBottom: '10px' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#f1f5f9', fontSize: '0.88rem' }}>{c.name}</p>
          <p style={{ margin: 0, fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: highlightKeywords(c.description) }} />
        </div>
      ))}
      <select className="premium-select" value={choices['golias'] || ''} onChange={e => setChoice('golias', e.target.value)} style={{ ...selectStyle, marginTop: '6px' }}>
        <option value="">Escolha sua Ancestralidade...</option>
        {species.lineage.choices.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {selected && <ConfirmBox text={`${selected.name}: ${selected.description}`} />}
    </Accordion>
  );
};

/** Humano — Tamanho */
const HumanoTamanho: React.FC<ChoiceProps> = ({ choices, setChoice }) => (
  <Accordion title="Tamanho" badge={choices['humano-size'] ? '✓' : '▾'} incomplete={!choices['humano-size']}>
    <p style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords('Seu tamanho é Médio (cerca de 1,20–2,10 metros de altura) ou Pequeno (cerca de 0,60–1,20 metro de altura), escolhido ao selecionar esta espécie.') }} />
    <SelectWithConfirm placeholder="Selecione seu tamanho..." value={choices['humano-size'] || ''}
      options={['Médio', 'Pequeno']} onChange={v => setChoice('humano-size', v)}
      confirmText={choices['humano-size'] ? `Tamanho ${choices['humano-size']} selecionado.` : undefined} />
  </Accordion>
);

/** Humano — Hábil */
const HumanoHabil: React.FC<ChoiceProps> = ({ choices, setChoice }) => (
  <Accordion title="Hábil" badge={choices['humano-skill'] ? '✓' : '▾'} incomplete={!choices['humano-skill']}>
    <p style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords('Você adquire proficiência em uma perícia à sua escolha.') }} />
    <SelectWithConfirm placeholder="Escolha uma perícia..." value={choices['humano-skill'] || ''}
      options={ALL_SKILLS} onChange={v => setChoice('humano-skill', v)}
      confirmText={choices['humano-skill'] ? `Proficiência em ${choices['humano-skill']} adquirida.` : undefined} />
  </Accordion>
);

/** Humano — Versátil */
const HumanoVersatil: React.FC<ChoiceProps & { character: any; setCharacter: any }> = ({ choices, setChoice, character, setCharacter }) => {
  const selectedTalent = originTalents.find((t: any) => t.name === choices['humano-talent']);
  const talentName = choices['humano-talent'];
  const talentSelections = talentName ? (character.talentSelections?.[talentName] ?? {}) : {};
  const talentComplete = talentName ? checkTalentComplete(talentName, talentSelections) : false;
  const allTalentSelections = Object.values(character.talentSelections ?? {}).flatMap((selection: any) => Object.values(selection ?? {}));

  return (
    <Accordion title="Versátil" badge={talentName && talentComplete ? '✓' : '▾'} incomplete={!talentName || !talentComplete}>
      <p style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords('Você adquire um talento de Origem à sua escolha.') }} />
      <select className="premium-select" value={talentName || ''} onChange={e => setChoice('humano-talent', e.target.value)} style={selectStyle}>
        <option value="">Escolha um Talento de Origem...</option>
        {originTalents.map((t: any) => <option key={t.id} value={t.name}>{t.name}</option>)}
      </select>
      {selectedTalent && (
        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{selectedTalent.name}</p>
          {(selectedTalent.benefits as string[]).map((b: string, i: number) => (
            <p key={i} style={{ margin: i < selectedTalent.benefits.length - 1 ? '0 0 6px 0' : '0', fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords(b) }} />
          ))}
        </div>
      )}
      {talentName && (
        <SubSection title="Escolhas do talento" incomplete={!talentComplete}>
          <TalentChoiceSection
            talentName={talentName}
            selections={talentSelections}
            onChange={(newSelections) => setCharacter((prev: any) => ({
              ...prev,
              talentSelections: {
                ...prev.talentSelections,
                [talentName]: newSelections,
              },
            }))}
            allSelections={allTalentSelections as string[]}
          />
          {!talentComplete && (
            <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', color: '#f97316', lineHeight: 1.5 }}>
              Complete todas as escolhas obrigatórias deste talento para liberar o avanço da etapa de espécie.
            </p>
          )}
        </SubSection>
      )}
    </Accordion>
  );
};

/** Tiferino — Tamanho */
const TiferinoTamanho: React.FC<ChoiceProps> = ({ choices, setChoice }) => (
  <Accordion title="Tamanho" badge={choices['tiferino-size'] ? '✓' : '▾'} incomplete={!choices['tiferino-size']}>
    <p style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords('Seu tamanho é Médio (cerca de 1,20–2,10 metros de altura) ou Pequeno (cerca de 0,90–1,20 metro de altura), escolhido ao selecionar esta espécie.') }} />
    <SelectWithConfirm placeholder="Selecione seu tamanho..." value={choices['tiferino-size'] || ''}
      options={['Médio', 'Pequeno']} onChange={v => setChoice('tiferino-size', v)}
      confirmText={choices['tiferino-size'] ? `Tamanho ${choices['tiferino-size']} selecionado.` : undefined} />
  </Accordion>
);

/** Tiferino — Legado Ínfero */
const TiferinoLegado: React.FC<{ species: any } & ChoiceProps> = ({ species, choices, setChoice }) => {
  const selectedLegacy = species.lineage.choices.find((c: any) => c.id === choices['tiferino']);
  return (
    <Accordion title={species.lineage.title} incomplete={!choices['tiferino']}>
      <DescText text={species.lineage.description} style={{ marginBottom: '14px' }} />
      <div style={tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Legado</th><th style={thStyle}>Nível 1</th><th style={thStyle}>Nível 3</th><th style={thStyle}>Nível 5</th></tr></thead>
          <tbody>
            {species.lineage.choices.map((c: any, i: number) => (
              <tr key={c.id} style={{ background: choices['tiferino'] === c.id ? 'rgba(249,115,22,0.1)' : 'transparent' }}>
                <td style={tdStyle(i)}>{c.name}</td>
                <td style={{ ...tdStyle(i), color: '#94a3b8', fontSize: '0.78rem' }}>{c.nv1}</td>
                <td style={{ ...tdStyle(i), color: '#94a3b8', fontSize: '0.78rem' }}>{c.nv3}</td>
                <td style={{ ...tdStyle(i), color: '#94a3b8', fontSize: '0.78rem' }}>{c.nv5}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <select className="premium-select" value={choices['tiferino'] || ''} onChange={e => setChoice('tiferino', e.target.value)} style={selectStyle}>
        <option value="">Selecione seu Legado Ínfero...</option>
        {species.lineage.choices.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {selectedLegacy && (
        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{selectedLegacy.name}</p>
          <ExpandableText text={selectedLegacy.description} />
        </div>
      )}
      {selectedLegacy && (
        <SubSection title="Magia de Legado Ínfero" incomplete={!choices['tiferino-attr']}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords('Ao escolher seu Legado Ínfero, e ao atingir os níveis de personagem 3 e 5, você aprende magias de círculo superior, conforme indicado na tabela. Essas magias estão sempre preparadas e podem ser conjuradas uma vez sem usar um espaço de magia, sendo restauradas quando completa um Descanso Longo. Além disso, você pode conjurá-las utilizando qualquer espaço de magia que possua do círculo correspondente. Inteligência, Sabedoria ou Carisma é seu atributo de conjuração para essas magias (escolha um atributo ao selecionar o legado).') }} />
          <select className="premium-select" value={choices['tiferino-attr'] || ''} onChange={e => setChoice('tiferino-attr', e.target.value)} style={selectStyle}>
            <option value="">Escolha seu atributo de conjuração...</option>
            {ATTR_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {choices['tiferino-attr'] && <ConfirmBox text={`Suas magias de Legado ${selectedLegacy.name} usam ${choices['tiferino-attr']}.`} />}
        </SubSection>
      )}
    </Accordion>
  );
};

/** Aasimar — Tamanho */
const AasimarTamanho: React.FC<ChoiceProps> = ({ choices, setChoice }) => (
  <Accordion title="Tamanho" badge={choices['aasimar-size'] ? '✓' : '▾'} incomplete={!choices['aasimar-size']}>
    <p style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords('Seu tamanho é Médio (cerca de 1,20–2,10 metros de altura) ou Pequeno (cerca de 0,60–1,20 metro de altura), escolhido ao selecionar esta espécie.') }} />
    <SelectWithConfirm placeholder="Selecione seu tamanho..." value={choices['aasimar-size'] || ''}
      options={['Médio', 'Pequeno']} onChange={v => setChoice('aasimar-size', v)}
      confirmText={choices['aasimar-size'] ? `Tamanho ${choices['aasimar-size']} selecionado.` : undefined} />
  </Accordion>
);

/** Aasimar — Revelação Celestial (informativo, sem dropdown) */
const AasimarRevelacao: React.FC<{ species: any }> = ({ species }) => (
  <Accordion title="Revelação Celestial">
    <DescText text={species.lineage.description} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
      {species.lineage.choices.map((c: any) => (
        <div key={c.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{c.name}</p>
          <p style={{ margin: 0, fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords(c.description) }} />
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {c.mechanics.split(',').map((m: string) => (
              <span key={m} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#94a3b8' }}>{m.trim()}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Accordion>
);

/** Generic trait accordion */
const TraitAccordion: React.FC<{ trait: any }> = ({ trait }) => (
  <Accordion title={trait.title}>
    <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightKeywords(trait.description) }} />
  </Accordion>
);

/** Aasimar / other generic lineage */
const GenericLineage: React.FC<{ species: any } & ChoiceProps> = ({ species, choices, setChoice }) => {
  const sel = species.lineage.choices.find((c: any) => c.id === choices[species.id]);
  return (
    <Accordion title={species.lineage.title} incomplete={!choices[species.id]}>
      <DescText text={species.lineage.description} style={{ marginBottom: '12px' }} />
      <select className="premium-select" value={choices[species.id] || ''} onChange={e => setChoice(species.id, e.target.value)} style={selectStyle}>
        <option value="" disabled>Selecione sua {species.lineage.title}...</option>
        {species.lineage.choices.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {sel && (
        <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(16,185,129,0.05)', border: '1px dashed rgba(16,185,129,0.2)', borderRadius: '8px' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ {sel.name} selecionado.</span>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#cbd5e1' }}>{sel.description}</p>
          <div style={{ marginTop: '6px', fontSize: '0.75rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {sel.mechanics.split(',').map((m: string) => (
              <span key={m} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8' }}>{m.trim()}</span>
            ))}
          </div>
        </div>
      )}
    </Accordion>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface SpeciesDetailsProps {
  character: any;
  setCharacter: any;
  species: any;
  languagesData: any;
}

export const SpeciesDetails: React.FC<SpeciesDetailsProps> = ({ character, setCharacter, species, languagesData }) => {
  if (!species) return null;

  const imageRef = useRef<HTMLDivElement>(null);
  const [parallaxX, setParallaxX] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallaxX(-x * 30);  // opposite direction, max 15px
    setParallaxY(-y * 30);
  };

  const handleMouseLeave = () => {
    setParallaxX(0);
    setParallaxY(0);
  };

  const choices: Record<string, string> = character.choices || {};

  const setChoice = (key: string, val: string) =>
    setCharacter((prev: any) => ({ ...prev, choices: { ...prev.choices, [key]: val } }));

  const handleLangDropdown = (index: 0 | 1, newId: string) => {
    setCharacter((prev: any) => {
      const auto = prev.languages.filter((l: string) => ['common', 'thieves-cant', 'druidic'].includes(l));
      const manual = prev.languages.filter((l: string) => !['common', 'thieves-cant', 'druidic'].includes(l));
      const updated = [...manual];
      if (newId === '') { updated.splice(index, 1); } else { updated[index] = newId; }
      return { ...prev, languages: [...auto, ...updated.filter(Boolean)] };
    });
  };

  const manualLangs = character.languages.filter((l: string) => !['common', 'thieves-cant', 'druidic'].includes(l));
  const classLangs: string[] = [];
  if (character.languages.includes('thieves-cant')) classLangs.push('thieves-cant');
  if (character.languages.includes('druidic')) classLangs.push('druidic');

  const allLangs = [...(languagesData.common || []), ...(languagesData.rare || [])];
  const selectableLangs = (languagesData.common || []).filter((l: any) => !['common', 'thieves-cant', 'druidic'].includes(l.id));

  // Darkvision card
  const darkvisionTrait = species.racialTraits.find((t: any) => t.title === 'Visão no Escuro');
  let darkvisionValue = '—';
  if (darkvisionTrait) {
    const m = darkvisionTrait.description.match(/(\d+)\s*metros?/i);
    darkvisionValue = m ? `${m[1]} metros` : 'Sim';
  }

  // Traits summary
  const allTraitTitles: string[] = species.racialTraits.map((t: any) => t.title);
  const traitsListText = allTraitTitles.length > 1
    ? allTraitTitles.slice(0, -1).join(', ') + ' e ' + allTraitTitles[allTraitTitles.length - 1]
    : allTraitTitles[0] || '';

  // Traits that are handled by special components (excluded from generic accordion rendering)
  const specialTraits: Record<string, string[]> = {
    aasimar: ['Visão no Escuro'],
    elfo: ['Visão no Escuro'],
    humano: ['Visão no Escuro'],
    tiferino: ['Visão no Escuro'],
  };
  const alwaysExclude = ['Visão no Escuro'];
  const excludedTraitNames = specialTraits[species.id] || alwaysExclude;

  const imageSrc = `/imgs/portrait_races/${IMAGE_MAP[species.id] ?? species.id}.png`;

  const infoCardStyle: React.CSSProperties = {
    background: 'rgba(30, 32, 45, 0.4)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex', flexDirection: 'column', gap: '4px',
  };

  return (
    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Hero: image (left) + name/desc/cards (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 200px) 1fr', gap: '18px', alignItems: 'start' }}>
        {/* Image */}
        <div ref={imageRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ aspectRatio: '3/4', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0 }}>
          <img src={imageSrc} alt={species.name}
            style={{ width: '115%', height: '115%', objectFit: 'cover', objectPosition: 'center center', transform: `translate(calc(-7.5% + ${parallaxX}px), calc(-7.5% + ${parallaxY}px))`, transition: 'transform 0.3s ease-out', willChange: 'transform' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(17,18,24,1), transparent)' }} />
        </div>

        {/* Name + description + traits summary + info cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2vw, 1.9rem)', color: '#fff', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>{species.name}</h2>
            {species.description && (
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.65, margin: '0 0 8px 0' }}>{species.description}</p>
            )}
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
              <span style={{ color: '#f97316', fontWeight: 600 }}>Traços de {species.name}:</span>{' '}{traitsListText}
            </p>
          </div>

          {/* 4 Info Cards — 2×2 grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              ['Tipo de Criatura', species.vitalInfo.type],
              ['Tamanho', species.vitalInfo.size],
              ['Deslocamento', species.vitalInfo.speed],
              ['Visão no Escuro', darkvisionValue],
            ].map(([label, value]) => (
              <div key={label} style={infoCardStyle}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: '0.84rem', color: '#f1f5f9', fontWeight: 500, lineHeight: 1.4 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Species-specific + per-trait rendering ── */}

      {/* Tamanho goes first for species that need it */}
      {species.id === 'aasimar' && <AasimarTamanho choices={choices} setChoice={setChoice} />}
      {species.id === 'humano' && <HumanoTamanho choices={choices} setChoice={setChoice} />}
      {species.id === 'tiferino' && <TiferinoTamanho choices={choices} setChoice={setChoice} />}

      {/* Lineage/ancestry sections (before or between traits) */}
      {species.id === 'aasimar' && species.lineage && <AasimarRevelacao species={species} />}
      {species.id === 'draconato' && species.lineage && <DraconatoLineage species={species} choices={choices} setChoice={setChoice} />}
      {species.id === 'elfo' && species.lineage && <ElfoLinhagem species={species} choices={choices} setChoice={setChoice} />}
      {species.id === 'gnomo' && species.lineage && <GnomoLinhagem species={species} choices={choices} setChoice={setChoice} />}
      {species.id === 'golias' && species.lineage && <GoliaAncestralidade species={species} choices={choices} setChoice={setChoice} />}
      {species.id === 'tiferino' && species.lineage && <TiferinoLegado species={species} choices={choices} setChoice={setChoice} />}
      {/* Generic lineage (for species without specific component) */}
      {species.lineage && !['aasimar', 'draconato', 'elfo', 'gnomo', 'golias', 'tiferino'].includes(species.id) && (
        <GenericLineage species={species} choices={choices} setChoice={setChoice} />
      )}

      {/* Per-trait accordions — respects species.json order, injects special components */}
      {species.racialTraits
        .filter((t: any) => !excludedTraitNames.includes(t.title))
        .map((trait: any) => {
          if (species.id === 'elfo' && trait.title === 'Sentidos Aguçados') {
            return <ElfoSentidos key={trait.title} choices={choices} setChoice={setChoice} />;
          }
          if (species.id === 'humano' && trait.title === 'Hábil') {
            return <HumanoHabil key={trait.title} choices={choices} setChoice={setChoice} />;
          }
          if (species.id === 'humano' && trait.title === 'Versátil') {
            return <HumanoVersatil key={trait.title} choices={choices} setChoice={setChoice} character={character} setCharacter={setCharacter} />;
          }
          return <TraitAccordion key={trait.title} trait={trait} />;
        })
      }

      {/* Languages accordion */}
      <details style={{ ...accordionWrap, border: manualLangs.length < 2 ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.06)' }}>
        <summary style={summaryBase}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            {manualLangs.length < 2 && badgeCircle}
            <span>Idiomas</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: manualLangs.length === 2 ? '#10b981' : '#64748b', fontWeight: 400 }}>
            {manualLangs.length === 2 ? '✓ 2 selecionados' : `${manualLangs.length}/2 escolhidos ▾`}
          </span>
        </summary>
        <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            Seu personagem conhece pelo menos três idiomas: <strong style={{ color: '#f1f5f9' }}>Comum</strong> e mais dois idiomas à sua escolha da tabela abaixo.
          </p>
          {classLangs.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {classLangs.map(l => (
                <span key={l} style={{ padding: '5px 12px', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '20px', fontSize: '0.8rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ {allLangs.find((x: any) => x.id === l)?.name || l}
                  <span style={{ fontSize: '0.65rem', background: '#f97316', color: '#000', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Da Classe</span>
                </span>
              ))}
            </div>
          )}
          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr><th style={thStyle}>Idioma</th><th style={thStyle}>Origem</th></tr>
              </thead>
              <tbody>
                {(languagesData.common || []).map((lang: any, i: number) => (
                  <tr key={lang.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '7px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#e2e8f0' }}>{lang.name}</td>
                    <td style={{ padding: '7px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#94a3b8' }}>{lang.origin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {([0, 1] as const).map(idx => (
              <select key={idx} className="premium-select"
                value={manualLangs[idx] || ''}
                onChange={e => handleLangDropdown(idx, e.target.value)}
                style={{ ...selectStyle, border: manualLangs[idx] ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.15)', color: manualLangs[idx] ? '#fff' : '#64748b' }}
              >
                <option value="">– Escolha um idioma comum –</option>
                {selectableLangs
                  .filter((l: any) => !manualLangs.includes(l.id) || manualLangs[idx] === l.id)
                  .map((lang: any) => <option key={lang.id} value={lang.id}>{lang.name}</option>)}
              </select>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: manualLangs.length === 2 ? '#10b981' : '#f97316', textAlign: 'right' }}>
            {manualLangs.length === 2 ? '✓ 2 idiomas selecionados' : `Escolha mais ${2 - manualLangs.length} idioma${2 - manualLangs.length > 1 ? 's' : ''}`}
          </div>
        </div>
      </details>

    </div>
  );
};

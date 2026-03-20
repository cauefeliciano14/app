import { useCharacter } from '../../../context/CharacterContext';

const ATTRS = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'] as const;
const LABELS: Record<(typeof ATTRS)[number], string> = {
  forca: 'FOR',
  destreza: 'DES',
  constituicao: 'CON',
  inteligencia: 'INT',
  sabedoria: 'SAB',
  carisma: 'CAR',
};

export function CharacterSummaryPanel() {
  const { character, selectedBackground, derivedSheet, validationResult } = useCharacter();
  const mainPendencies = validationResult.errors.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
          Resumo persistente
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={`profile-placeholder ${character.portrait ? 'has-image' : ''}`} style={{ width: '54px', height: '54px', minWidth: '54px' }}>
            {character.portrait ? <img src={`/imgs/portrait_caracter/${character.portrait}`} alt={character.name || 'Retrato'} className="profile-image" /> : null}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{character.name || 'Sem nome'}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
              {character.characterClass?.name ?? 'Sem classe'} • {selectedBackground?.name ?? 'Sem origem'} • {character.species?.name ?? 'Sem espécie'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
        {ATTRS.map((attr) => (
          <div key={attr} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.64rem', letterSpacing: '0.08em' }}>{LABELS[attr]}</div>
            <div style={{ color: '#fff', fontWeight: 700 }}>{derivedSheet.finalAttributes[attr] ?? 0}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
        <SummaryPill label="CA" value={String(derivedSheet.armorClass)} />
        <SummaryPill label="PV" value={String(derivedSheet.maxHP)} />
      </div>

      <SummaryList title="Idiomas" items={derivedSheet.languages} empty="Nenhum idioma extra." defaultOpen={false} />
      <SummaryList title="Perícias" items={derivedSheet.skillProficiencies} empty="Nenhuma perícia definida." defaultOpen={false} />
      <SummaryIssues items={mainPendencies} />
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 12px' }}>
      <div style={{ color: '#94a3b8', fontSize: '0.65rem', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function SummaryList({ title, items, empty, defaultOpen = true }: { title: string; items: string[]; empty: string; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#f8fafc', fontWeight: 700 }}>{title}</span>
        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{items.length}</span>
      </summary>
      <div style={{ padding: '0 12px 12px' }}>
        {items.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{empty}</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {items.map((item) => (
              <span key={item} style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.22)', borderRadius: '999px', padding: '4px 8px', fontSize: '0.75rem', color: '#fed7aa' }}>
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

function SummaryIssues({ items }: { items: string[] }) {
  return (
    <details open style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#f8fafc', fontWeight: 700 }}>Pendências principais</span>
        <span style={{ color: items.length === 0 ? '#4ade80' : '#fb923c', fontSize: '0.75rem', fontWeight: 700 }}>
          {items.length === 0 ? 'OK' : items.length}
        </span>
      </summary>
      <div style={{ padding: '0 12px 12px' }}>
        {items.length === 0 ? (
          <div style={{ color: '#4ade80', fontSize: '0.82rem' }}>Personagem pronto para a ficha final.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.5 }}>
            {items.map((error) => <li key={error}>{error}</li>)}
          </ul>
        )}
      </div>
    </details>
  );
}


interface NotesTabProps {
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

export function NotesTab({ notes, onUpdateNotes }: NotesTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
        Anotações livres sobre seu personagem, história, objetivos, etc.
      </div>
      <textarea
        value={notes}
        onChange={e => onUpdateNotes(e.target.value)}
        placeholder="Escreva suas anotações aqui…"
        style={{
          background: 'rgba(17,18,24,0.6)',
          border: 'none',
          borderLeft: '2px solid #991b1b',
          borderRadius: '4px',
          color: '#f1f5f9',
          fontSize: '0.88rem',
          lineHeight: 1.6,
          padding: '12px 14px',
          resize: 'vertical',
          minHeight: '200px',
          outline: 'none',
        }}
      />
    </div>
  );
}


interface ExtrasTabProps {
  extras: string;
  onUpdateExtras: (extras: string) => void;
}

export function ExtrasTab({ extras, onUpdateExtras }: ExtrasTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
        Espaço livre para companions, counters, condições especiais, recursos de classe, etc.
      </div>
      <textarea
        value={extras}
        onChange={e => onUpdateExtras(e.target.value)}
        placeholder="Extras, contadores, companions…"
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

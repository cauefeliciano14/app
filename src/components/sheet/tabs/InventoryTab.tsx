import type { CharacterPlayState } from '../../../types/playState';

interface InventoryItem {
  name: string;
  quantity?: number;
  notes?: string;
  cost?: string;
}

interface InventoryTabProps {
  inventory: InventoryItem[];
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
  onManageEquipment: () => void;
}

export function InventoryTab({
  inventory,
  playState,
  onUpdatePlayState,
  onManageEquipment,
}: InventoryTabProps) {
  const toggleEquipped = (itemName: string) => {
    onUpdatePlayState(prev => {
      const equipped = prev.equippedItemIds.includes(itemName)
        ? prev.equippedItemIds.filter(id => id !== itemName)
        : [...prev.equippedItemIds, itemName];
      return { ...prev, equippedItemIds: equipped };
    });
  };

  const toggleAttuned = (itemName: string) => {
    onUpdatePlayState(prev => {
      const attuned = prev.attunedItemIds.includes(itemName)
        ? prev.attunedItemIds.filter(id => id !== itemName)
        : [...prev.attunedItemIds, itemName];
      return { ...prev, attunedItemIds: attuned };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {inventory.length === 0 ? (
        <div style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', padding: '24px' }}>
          Inventário vazio.
        </div>
      ) : (
        <div style={{
          background: 'rgba(17,18,24,0.6)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 40px 60px 80px 80px',
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            {['ITEM', 'QTD', 'CUSTO', 'EQUIPADO', 'SINTON.'].map(h => (
              <div key={h} style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.08em' }}>
                {h}
              </div>
            ))}
          </div>
          {inventory.map((item, i) => {
            const isEquipped = playState.equippedItemIds.includes(item.name);
            const isAttuned = playState.attunedItemIds.includes(item.name);
            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 40px 60px 80px 80px',
                padding: '8px 14px',
                borderBottom: i < inventory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>{item.name}</div>
                  {item.notes && (
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '1px' }}>{item.notes}</div>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.quantity ?? 1}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.cost ?? '—'}</div>
                <button
                  onClick={() => toggleEquipped(item.name)}
                  style={{
                    background: isEquipped ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isEquipped ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '5px',
                    color: isEquipped ? '#a78bfa' : '#64748b',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    width: '68px',
                  }}
                >
                  {isEquipped ? 'Equipado' : 'Equipar'}
                </button>
                <button
                  onClick={() => toggleAttuned(item.name)}
                  style={{
                    background: isAttuned ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isAttuned ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '5px',
                    color: isAttuned ? '#fbbf24' : '#64748b',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    width: '68px',
                  }}
                >
                  {isAttuned ? 'Sinton.' : 'Sintonizar'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onManageEquipment}
        style={{
          background: 'rgba(56,189,248,0.1)',
          border: '1px solid rgba(56,189,248,0.25)',
          borderRadius: '8px',
          color: '#38bdf8',
          padding: '10px',
          fontSize: '0.85rem',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Gerenciar Inventário
      </button>
    </div>
  );
}

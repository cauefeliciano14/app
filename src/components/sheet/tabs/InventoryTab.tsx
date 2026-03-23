import type { CharacterPlayState } from '../../../types/playState';
import { getArmorByName } from '../../../rules/data/armorRules';

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
  equippedArmorId?: string | null;
  hasShieldEquipped?: boolean;
  onEquipArmor?: (armorId: string | null) => void;
  onEquipShield?: (equipped: boolean) => void;
}

export function InventoryTab({
  inventory,
  playState,
  onUpdatePlayState,
  equippedArmorId,
  hasShieldEquipped = false,
  onEquipArmor,
  onEquipShield,
}: InventoryTabProps) {
  const toggleEquipped = (itemName: string) => {
    const armorEntry = getArmorByName(itemName);

    if (armorEntry?.type === 'shield') {
      onEquipShield?.(!hasShieldEquipped);
      return;
    }

    if (armorEntry) {
      const isCurrentlyEquipped = equippedArmorId === armorEntry.id;
      onEquipArmor?.(isCurrentlyEquipped ? null : armorEntry.id);
      return;
    }

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
          border: 'none',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 40px 60px 84px 84px',
            padding: '4px 8px',
            background: 'transparent',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            gap: '8px'
          }}>
            {['ITEM', 'QTD', 'CUSTO', 'EQUIP.', 'SINTONIZ.'].map(h => (
              <div key={h} style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>
                {h}
              </div>
            ))}
          </div>
          {inventory.map((item, i) => {
            const armorEntry = getArmorByName(item.name);
            const isEquipped = armorEntry
              ? armorEntry.type === 'shield'
                ? hasShieldEquipped
                : armorEntry.id === equippedArmorId
              : playState.equippedItemIds.includes(item.name);
            const isAttuned = playState.attunedItemIds.includes(item.name);
            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 40px 60px 84px 84px',
                padding: '8px',
                borderBottom: i < inventory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 700 }}>{item.name}</div>
                  {item.notes && (
                    <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '1px' }}>{item.notes}</div>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.quantity ?? 1}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.cost ?? '—'}</div>
                <button
                  onClick={() => toggleEquipped(item.name)}
                  style={{
                    background: isEquipped ? '#991b1b' : 'transparent',
                    border: `1px solid ${isEquipped ? '#991b1b' : '#7f1d1d'}`,
                    borderRadius: '4px',
                    color: isEquipped ? '#ffffff' : '#94a3b8',
                    padding: '3px 8px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '74px',
                  }}
                >
                  {isEquipped ? 'EQUIPADO' : 'EQUIPAR'}
                </button>
                <button
                  onClick={() => toggleAttuned(item.name)}
                  style={{
                    background: isAttuned ? '#b45309' : 'transparent',
                    border: `1px solid ${isAttuned ? '#b45309' : '#7f1d1d'}`,
                    borderRadius: '4px',
                    color: isAttuned ? '#ffffff' : '#94a3b8',
                    padding: '3px 8px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '82px',
                  }}
                >
                  {isAttuned ? 'SINTONIZ.' : 'SINTONIZAR'}
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

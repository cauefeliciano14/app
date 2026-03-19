import React, { useState } from 'react';
import { tagPill, btnSmall } from './equipmentStyles';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  isStartingGear?: boolean;
  source?: string;
  itemBase?: any;
}

interface InventorySectionProps {
  inventory: InventoryItem[];
  onRemoveItem: (id: string) => void;
  onChangeQuantity: (id: string, delta: number) => void;
}

const separator: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255,255,255,0.06)',
  margin: '8px 0',
};

const detailLabel: React.CSSProperties = {
  color: '#64748b',
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const detailValue: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: '0.85rem',
  fontWeight: 500,
};

const inferTags = (item: InventoryItem): string[] => {
  const tags: string[] = [];
  const base = item.itemBase;
  if (!base) return tags;

  const name = (base.name || item.name || '').toLowerCase();
  const desc = (base.description || '').toLowerCase();
  const cat = (base.category || '').toLowerCase();
  const props = (base.properties || '').toLowerCase();

  if (cat.includes('arma') || base.damage) tags.push('COMBATE');
  if (base.damage) tags.push('DANO');
  if (cat.includes('armadura') || base.ac) tags.push('DEFESA');
  if (desc.includes('cura') || desc.includes('heal') || name.includes('poção de cura')) tags.push('CURA');
  if (desc.includes('utilidade') || cat.includes('equipamento') || cat.includes('ferramenta')) tags.push('UTILIDADE');
  if (props.includes('arremesso') || props.includes('munição') || cat.includes('munição')) tags.push('DISTÂNCIA');
  if (base.isMagic) tags.push('MÁGICO');

  return [...new Set(tags)];
};

const tagColor = (tag: string): { bg: string; color: string } => {
  const map: Record<string, { bg: string; color: string }> = {
    'COMBATE': { bg: 'rgba(239,68,68,0.15)', color: '#fca5a5' },
    'DANO': { bg: 'rgba(249,115,22,0.15)', color: '#fdba74' },
    'DEFESA': { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
    'CURA': { bg: 'rgba(34,197,94,0.15)', color: '#86efac' },
    'UTILIDADE': { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
    'DISTÂNCIA': { bg: 'rgba(168,85,247,0.15)', color: '#c4b5fd' },
    'MÁGICO': { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  };
  return map[tag] || { bg: 'rgba(255,255,255,0.08)', color: '#94a3b8' };
};

export const InventorySection: React.FC<InventorySectionProps> = ({ inventory, onRemoveItem, onChangeQuantity }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (inventory.length === 0) {
    return (
      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
        Você não possui nenhum item no seu inventário. Adicione Equipamento Inicial acima ou adicione itens da lista abaixo.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {inventory.map((item, i) => {
        const isOpen = expandedId === item.id;
        const base = item.itemBase;
        const tags = inferTags(item);
        return (
          <div key={item.id} style={{
            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.04)',
            overflow: 'hidden',
          }}>
            {/* Header row */}
            <div
              onClick={() => setExpandedId(isOpen ? null : item.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</span>
                {base?.type && (
                  <span style={{ ...tagPill, flexShrink: 0 }}>{base.type}</span>
                )}
                {item.isStartingGear && (
                  <span style={{ ...tagPill, background: 'rgba(249,115,22,0.15)', color: '#f97316', flexShrink: 0 }}>Inicial</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                <button onClick={() => onChangeQuantity(item.id, -1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.8rem' }}>-</button>
                <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.85rem', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => onChangeQuantity(item.id, 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.8rem' }}>+</button>
              </div>
            </div>

            {/* Expanded details — D&D Beyond style */}
            {isOpen && (
              <div style={{ padding: '0 12px 14px 12px', display: 'flex', flexDirection: 'column' }}>
                {/* Item type & subtype header */}
                {base && (
                  <>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '2px' }}>
                      {base.category && <span>{base.category}</span>}
                      {base.type && base.type !== base.category && <span> · {base.type}</span>}
                      {base.isMagic && base.rarity && <span> · <span style={{ color: '#a78bfa' }}>{base.rarity}</span></span>}
                    </div>
                    <div style={separator} />
                  </>
                )}

                {/* Detail grid: Weight, Cost, Source */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', padding: '4px 0' }}>
                  {base?.weight && (
                    <div>
                      <div style={detailLabel}>Peso</div>
                      <div style={detailValue}>{base.weight}</div>
                    </div>
                  )}
                  {base?.cost && (
                    <div>
                      <div style={detailLabel}>Custo</div>
                      <div style={detailValue}>{base.cost}</div>
                    </div>
                  )}
                  {base?.damage && (
                    <div>
                      <div style={detailLabel}>Dano</div>
                      <div style={detailValue}>{base.damage}</div>
                    </div>
                  )}
                  {base?.ac && (
                    <div>
                      <div style={detailLabel}>CA</div>
                      <div style={detailValue}>{base.ac}</div>
                    </div>
                  )}
                  {item.source && (
                    <div>
                      <div style={detailLabel}>Fonte</div>
                      <div style={detailValue}>{item.source === 'class' ? 'Classe' : item.source === 'bg' ? 'Origem' : 'Comprado'}</div>
                    </div>
                  )}
                </div>

                {/* Properties */}
                {base?.properties && base.properties !== '—' && (
                  <>
                    <div style={separator} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {base.properties.split(', ').map((p: string) => (
                        <span key={p} style={tagPill}>{p}</span>
                      ))}
                    </div>
                  </>
                )}

                {/* Attunement */}
                {base?.attunement && (
                  <>
                    <div style={separator} />
                    <div style={{ color: '#a78bfa', fontSize: '0.82rem', fontStyle: 'italic' }}>
                      {base.attunement}
                    </div>
                  </>
                )}

                {/* Description */}
                {base?.description && (
                  <>
                    <div style={separator} />
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, lineHeight: 1.6, maxHeight: '150px', overflowY: 'auto' }}>
                      {typeof base.description === 'string' && base.description.length > 600
                        ? base.description.slice(0, 600) + '...'
                        : base.description}
                    </p>
                  </>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <>
                    <div style={separator} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {tags.map(tag => {
                        const tc = tagColor(tag);
                        return (
                          <span key={tag} style={{ background: tc.bg, color: tc.color, padding: '2px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Remove button — centered */}
                <div style={separator} />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                  <button onClick={() => onRemoveItem(item.id)} style={{ ...btnSmall('danger'), padding: '8px 24px', fontSize: '0.82rem' }}>
                    Remover Item
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

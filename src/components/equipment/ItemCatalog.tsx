import React, { useState, useMemo } from 'react';
import weaponsData from '../../data/weapons.json';
import armorData from '../../data/armor.json';
import equipmentData from '../../data/equipment.json';
import toolsData from '../../data/tools.json';
import magicItemsData from '../../data/magicItems.json';
import css from './equipment.module.css';

interface ItemCatalogProps {
  onAddItem: (item: any) => void;
}

const CATEGORY_FILTERS = ['Todos', 'Arma', 'Armadura', 'Equipamento', 'Ferramenta', 'Poção', 'Anel', 'Bastão', 'Pergaminho', 'Cajado', 'Varinha', 'Maravilhoso'];

const buildAllItems = (): any[] => {
  const items: any[] = [];

  // Weapons
  const addWeapons = (arr: any[], type: string) => arr.forEach(w => items.push({ ...w, category: 'Arma', type, isMagic: false }));
  addWeapons(weaponsData.simpleMelee, 'Arma Simples Corpo a Corpo');
  addWeapons(weaponsData.simpleRanged, 'Arma Simples à Distância');
  addWeapons(weaponsData.martialMelee, 'Arma Marcial Corpo a Corpo');
  addWeapons(weaponsData.martialRanged, 'Arma Marcial à Distância');

  // Armor
  (armorData as any).lightArmor?.forEach((a: any) => items.push({ ...a, category: 'Armadura', type: 'Armadura Leve', isMagic: false }));
  (armorData as any).mediumArmor?.forEach((a: any) => items.push({ ...a, category: 'Armadura', type: 'Armadura Média', isMagic: false }));
  (armorData as any).heavyArmor?.forEach((a: any) => items.push({ ...a, category: 'Armadura', type: 'Armadura Pesada', isMagic: false }));
  (armorData as any).shield?.forEach((a: any) => items.push({ ...a, category: 'Armadura', type: 'Escudo', isMagic: false }));

  // Adventuring Gear
  (equipmentData as any).adventuringGear?.forEach((e: any) => items.push({ ...e, category: 'Equipamento', type: 'Equipamento de Aventureiro', isMagic: false }));
  (equipmentData as any).ammunition?.forEach((e: any) => items.push({ ...e, category: 'Equipamento', type: 'Munição', isMagic: false }));
  (equipmentData as any).arcaneFocus?.forEach((e: any) => items.push({ ...e, category: 'Equipamento', type: 'Foco Arcano', isMagic: false }));
  (equipmentData as any).druidicFocus?.forEach((e: any) => items.push({ ...e, category: 'Equipamento', type: 'Foco Druídico', isMagic: false }));
  (equipmentData as any).holySymbol?.forEach((e: any) => items.push({ ...e, category: 'Equipamento', type: 'Símbolo Sagrado', isMagic: false }));

  // Tools
  (toolsData as any).artisanTools?.forEach((t: any) => items.push({ ...t, category: 'Ferramenta', type: 'Ferramenta de Artesão', isMagic: false }));
  (toolsData as any).otherTools?.forEach((t: any) => items.push({ ...t, category: 'Ferramenta', type: 'Outra Ferramenta', isMagic: false }));

  // Magic Items
  magicItemsData.forEach((m: any) => items.push({
    name: m.name,
    category: m.category,
    type: m.category,
    cost: m.rarity,
    weight: '',
    description: m.description,
    rarity: m.rarity,
    attunement: m.attunement,
    baseItem: m.baseItem,
    isMagic: true,
  }));

  return items;
};

export const ItemCatalog: React.FC<ItemCatalogProps> = ({ onAddItem }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [showMagic, setShowMagic] = useState(true);
  const [showCommon, setShowCommon] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState('todos');

  const allItems = useMemo(buildAllItems, []);

  const RARITY_FILTERS = ['todos', 'comum', 'incomum', 'raro', 'muito raro', 'lendário', 'artefato'];

  const filtered = useMemo(() => {
    return allItems.filter(item => {
      if (activeFilter !== 'Todos' && item.category !== activeFilter) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (!showMagic && item.isMagic) return false;
      if (!showCommon && !item.isMagic) return false;
      if (rarityFilter !== 'todos' && item.isMagic && item.rarity !== rarityFilter) return false;
      if (rarityFilter !== 'todos' && !item.isMagic) return false;
      return true;
    });
  }, [allItems, activeFilter, searchQuery, showMagic, showCommon, rarityFilter]);

  const rarityColor = (rarity: string) => {
    const map: Record<string, string> = {
      'comum': '#94a3b8', 'incomum': '#22c55e', 'raro': '#3b82f6',
      'muito raro': '#a855f7', 'lendário': '#f59e0b', 'artefato': '#ef4444', 'varia': '#64748b',
    };
    return map[rarity] || '#94a3b8';
  };

  const separator: React.CSSProperties = {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    margin: '8px 0',
  };

  const detailLabel: React.CSSProperties = {
    color: 'var(--text-faint)',
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  const detailValue: React.CSSProperties = {
    color: 'var(--text-body)',
    fontSize: '0.85rem',
    fontWeight: 500,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-faint)' }}>&#128269;</span>
        <input
          type="text"
          placeholder="Buscar item..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={css.inputStyle}
        />
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {CATEGORY_FILTERS.map(f => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isActive ? '1px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.12)',
                background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                color: isActive ? 'var(--color-accent)' : 'var(--text-dim)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Checkboxes */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.82rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showCommon} onChange={e => setShowCommon(e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} /> Comum
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.82rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showMagic} onChange={e => setShowMagic(e.target.checked)} style={{ accentColor: 'var(--color-magic)' }} /> Mágico
        </label>
      </div>

      {/* Rarity filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {RARITY_FILTERS.map(r => {
          const isActive = rarityFilter === r;
          const color = r === 'todos' ? 'var(--text-dim)' : rarityColor(r);
          return (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              style={{
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isActive ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? `${color}18` : 'transparent',
                color: isActive ? color : 'var(--text-faint)',
                transition: 'all var(--transition-fast)',
                textTransform: 'capitalize',
              }}
            >
              {r}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <div style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>{filtered.length} itens encontrados</div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '500px', overflowY: 'auto' }}>
        {filtered.slice(0, 100).map((item, i) => {
          const isExpanded = expandedItem === `${item.name}-${i}`;
          return (
            <div key={`${item.name}-${i}`} className={i % 2 === 0 ? css.rowEven : css.rowOdd} style={{ borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer' }}
                onClick={() => setExpandedItem(isExpanded ? null : `${item.name}-${i}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <span style={{ color: 'var(--text-bright)', fontSize: '0.88rem', fontWeight: 500 }}>{item.name}</span>
                  <span style={{ color: 'var(--text-faint)', fontSize: '0.72rem', flexShrink: 0 }}>{item.type}</span>
                  {item.isMagic && item.rarity && (
                    <span style={{
                      color: rarityColor(item.rarity),
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      background: `${rarityColor(item.rarity)}18`,
                      border: `1px solid ${rarityColor(item.rarity)}40`,
                      borderRadius: '4px',
                      padding: '1px 6px',
                      textTransform: 'capitalize',
                    }}>
                      {item.rarity}
                    </span>
                  )}
                  {item.isMagic && item.attunement && (
                    <span title={item.attunement} style={{ fontSize: '0.72rem', color: '#b45309', flexShrink: 0 }}>S</span>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onAddItem(item); }}
                  style={{
                    padding: '4px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid var(--color-success-border)',
                    background: 'rgba(34,197,94,0.12)',
                    color: 'var(--color-success-light)',
                    transition: 'all var(--transition-fast)',
                    flexShrink: 0,
                  }}
                >
                  ADD
                </button>
              </div>

              {isExpanded && (
                <div style={{ padding: '4px 12px 12px 12px', display: 'flex', flexDirection: 'column' }}>
                  {/* Type header */}
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '2px' }}>
                    {item.category}
                    {item.type && item.type !== item.category && <span> · {item.type}</span>}
                  </div>
                  <div style={separator} />

                  {/* Detail grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', padding: '4px 0' }}>
                    {item.cost && (
                      <div>
                        <div style={detailLabel}>Custo</div>
                        <div style={detailValue}>{item.cost}</div>
                      </div>
                    )}
                    {item.weight && (
                      <div>
                        <div style={detailLabel}>Peso</div>
                        <div style={detailValue}>{item.weight}</div>
                      </div>
                    )}
                    {item.damage && (
                      <div>
                        <div style={detailLabel}>Dano</div>
                        <div style={detailValue}>{item.damage}</div>
                      </div>
                    )}
                    {item.ac && (
                      <div>
                        <div style={detailLabel}>CA</div>
                        <div style={detailValue}>{item.ac}</div>
                      </div>
                    )}
                  </div>

                  {/* Properties */}
                  {item.properties && item.properties !== '\u2014' && (
                    <>
                      <div style={separator} />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.properties.split(', ').map((p: string) => (
                          <span key={p} className={css.tagPill}>{p}</span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Attunement */}
                  {item.attunement && (
                    <>
                      <div style={separator} />
                      <div style={{ color: 'var(--color-magic)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                        {item.attunement}
                      </div>
                    </>
                  )}

                  {/* Description */}
                  {item.description && (
                    <>
                      <div style={separator} />
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5, maxHeight: '150px', overflowY: 'auto' }}>
                        {typeof item.description === 'string' && item.description.length > 500
                          ? item.description.slice(0, 500) + '...'
                          : item.description}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length > 100 && (
          <div style={{ color: 'var(--text-faint)', fontSize: '0.8rem', padding: '12px', textAlign: 'center' }}>
            Mostrando 100 de {filtered.length} itens. Refine sua busca para ver mais.
          </div>
        )}
      </div>
    </div>
  );
};

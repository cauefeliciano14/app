import React, { useState } from 'react';
import { getEquipmentForClass, getEquipmentForBackground, kitContents, itemSubChoices } from '../../data/equipmentData';
import css from './equipment.module.css';

interface StartingEquipmentProps {
  classId: string;
  className: string;
  bgId: string;
  bgName: string;
  currentClassOption: 'A' | 'B' | null;
  currentBgOption: 'A' | 'B' | null;
  startingEquipmentAdded: boolean;
  onCommit: (classOption: 'A' | 'B' | null, bgOption: 'A' | 'B' | null, subChoices: Record<string, string>) => void;
}

export const StartingEquipment: React.FC<StartingEquipmentProps> = ({
  classId, className, bgId, bgName,
  currentClassOption, currentBgOption, startingEquipmentAdded,
  onCommit,
}) => {
  const classEq = getEquipmentForClass(classId);
  const bgEq = getEquipmentForBackground(bgId);

  const [tempClassOption, setTempClassOption] = useState<'A' | 'B' | null>(currentClassOption);
  const [tempBgOption, setTempBgOption] = useState<'A' | 'B' | null>(currentBgOption);
  const [subChoices, setSubChoices] = useState<Record<string, string>>({});

  const handleClear = () => {
    setTempClassOption(null);
    setTempBgOption(null);
    setSubChoices({});
  };

  const canCommit = tempClassOption !== null || tempBgOption !== null;

  // Find items that need sub-choices
  const getItemsNeedingChoices = (items: string[]): string[] => {
    return items.filter(item => itemSubChoices[item]);
  };

  const classItemsNeedingChoices = tempClassOption === 'A' ? getItemsNeedingChoices(classEq.optionA.items) : [];
  const bgItemsNeedingChoices = tempBgOption === 'A' ? getItemsNeedingChoices(bgEq.optionA.items) : [];

  // Find kit items in option A to show contents
  const getKitItems = (items: string[]): string[] => {
    return items.filter(item => kitContents[item]);
  };

  const classKitItems = tempClassOption === 'A' ? getKitItems(classEq.optionA.items) : [];
  const bgKitItems = tempBgOption === 'A' ? getKitItems(bgEq.optionA.items) : [];

  const optionStyle = (selected: boolean, otherSelected: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
    padding: '10px 12px', borderRadius: '6px',
    background: selected ? 'var(--color-accent-bg-hover)' : 'transparent',
    border: selected ? '1px solid var(--color-accent-border)' : '1px solid var(--border-faint)',
    opacity: selected ? 1 : otherSelected ? 0.35 : 0.6,
    transition: 'all var(--transition-fast)',
  });

  const renderKitInfo = (kitItems: string[]) => (
    kitItems.map(kit => (
      <div key={kit} style={{ background: 'var(--color-accent-bg)', border: '1px solid var(--border-accent-subtle)', borderRadius: '6px', padding: '10px 12px', marginTop: '8px' }}>
        <span style={{ color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: 600 }}>{kit}:</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginLeft: '6px' }}>{kitContents[kit]}</span>
      </div>
    ))
  );

  const renderSubChoices = (items: string[], prefix: string) => (
    items.map(item => (
      <div key={`${prefix}-${item}`} style={{ marginTop: '8px' }}>
        <label style={{ color: 'var(--text-dim)', fontSize: '0.82rem', display: 'block', marginBottom: '4px' }}>
          Escolha para <strong style={{ color: 'var(--text-bright)' }}>{item}</strong>:
        </label>
        <select
          value={subChoices[`${prefix}-${item}`] || ''}
          onChange={e => setSubChoices(prev => ({ ...prev, [`${prefix}-${item}`]: e.target.value }))}
          style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-input)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: '100%', fontSize: '0.85rem' }}
        >
          <option value="">Selecione...</option>
          {itemSubChoices[item].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    ))
  );

  if (startingEquipmentAdded) {
    return (
      <div style={{ color: 'var(--color-success-light)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{'\u2713'}</span>
        <span>Equipamento inicial já adicionado ao inventário.</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Class Equipment */}
      <div className={css.cardBg}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px' }}>
          Equipamento de {className || 'Classe'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={optionStyle(tempClassOption === 'A', tempClassOption === 'B')} onClick={() => setTempClassOption(tempClassOption === 'A' ? null : 'A')}>
            <input type="checkbox" checked={tempClassOption === 'A'} readOnly style={{ marginTop: '3px', accentColor: 'var(--color-accent)' }} />
            <span style={{ color: tempClassOption === 'A' ? 'var(--text-bright)' : 'var(--text-dim)', lineHeight: 1.4, fontSize: '0.9rem' }}>
              (A) {classEq.optionA.description}
            </span>
          </div>
          {tempClassOption === 'A' && classKitItems.length > 0 && renderKitInfo(classKitItems)}
          {tempClassOption === 'A' && classItemsNeedingChoices.length > 0 && renderSubChoices(classItemsNeedingChoices, 'class')}

          <div style={{ paddingLeft: '32px', color: 'var(--text-faint)', fontSize: '0.78rem', fontStyle: 'italic' }}>OU</div>

          <div style={optionStyle(tempClassOption === 'B', tempClassOption === 'A')} onClick={() => setTempClassOption(tempClassOption === 'B' ? null : 'B')}>
            <input type="checkbox" checked={tempClassOption === 'B'} readOnly style={{ accentColor: 'var(--color-accent)' }} />
            <span style={{ color: tempClassOption === 'B' ? 'var(--text-bright)' : 'var(--text-dim)', fontSize: '0.9rem' }}>
              (B) {classEq.optionB.description}
            </span>
          </div>
        </div>
      </div>

      {/* Background Equipment */}
      <div className={css.cardBg}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px' }}>
          Equipamento de {bgName || 'Origem'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={optionStyle(tempBgOption === 'A', tempBgOption === 'B')} onClick={() => setTempBgOption(tempBgOption === 'A' ? null : 'A')}>
            <input type="checkbox" checked={tempBgOption === 'A'} readOnly style={{ marginTop: '3px', accentColor: 'var(--color-accent)' }} />
            <span style={{ color: tempBgOption === 'A' ? 'var(--text-bright)' : 'var(--text-dim)', lineHeight: 1.4, fontSize: '0.9rem' }}>
              (A) {bgEq.optionA.description}
            </span>
          </div>
          {tempBgOption === 'A' && bgKitItems.length > 0 && renderKitInfo(bgKitItems)}
          {tempBgOption === 'A' && bgItemsNeedingChoices.length > 0 && renderSubChoices(bgItemsNeedingChoices, 'bg')}

          <div style={{ paddingLeft: '32px', color: 'var(--text-faint)', fontSize: '0.78rem', fontStyle: 'italic' }}>OU</div>

          <div style={optionStyle(tempBgOption === 'B', tempBgOption === 'A')} onClick={() => setTempBgOption(tempBgOption === 'B' ? null : 'B')}>
            <input type="checkbox" checked={tempBgOption === 'B'} readOnly style={{ accentColor: 'var(--color-accent)' }} />
            <span style={{ color: tempBgOption === 'B' ? 'var(--text-bright)' : 'var(--text-dim)', fontSize: '0.9rem' }}>
              (B) {bgEq.optionB.description}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onCommit(tempClassOption, tempBgOption, subChoices)}
          disabled={!canCommit}
          className={`${css.btnSmall} ${css.btnPrimary}`}
          style={{
            padding: '10px 20px',
            fontSize: '0.9rem',
            opacity: canCommit ? 1 : 0.4,
            cursor: canCommit ? 'pointer' : 'not-allowed',
          }}
        >
          Adicionar Equipamento Inicial
        </button>
        <button onClick={handleClear} className={`${css.btnSmall} ${css.btnGhost}`} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
          Limpar
        </button>
      </div>
    </div>
  );
};

import { useState } from 'react';
import type { WeaponAttack } from '../../../rules/types/DerivedSheet';
import type { CharacterPlayState, CustomAction } from '../../../types/playState';

type FilterId = 'all' | 'attack' | 'action' | 'bonus' | 'reaction' | 'other' | 'limited';

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all',      label: 'TODAS' },
  { id: 'attack',   label: 'ATAQUE' },
  { id: 'action',   label: 'AÇÃO' },
  { id: 'bonus',    label: 'AÇÃO BÔNUS' },
  { id: 'reaction', label: 'REAÇÃO' },
  { id: 'other',    label: 'OUTRO' },
  { id: 'limited',  label: 'USO LIMITADO' },
];

const TYPE_LABELS: Record<string, string> = {
  action: 'Ação', bonus: 'Ação Bônus', reaction: 'Reação', other: 'Outro',
};

function signedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface ActionsTabProps {
  weaponAttacks: WeaponAttack[];
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
}

export function ActionsTab({ weaponAttacks, playState, onUpdatePlayState }: ActionsTabProps) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<CustomAction['type']>('action');
  const [formDesc, setFormDesc] = useState('');

  const filteredAttacks = filter === 'all' || filter === 'attack' ? weaponAttacks : [];
  const filteredCustom = playState.customActions.filter(
    a => filter === 'all' || a.type === filter
  );

  const handleAddCustom = () => {
    if (!formName.trim()) return;
    const newAction: CustomAction = {
      id: `ca-${Date.now()}`,
      name: formName.trim(),
      type: formType,
      description: formDesc.trim(),
    };
    onUpdatePlayState(prev => ({ ...prev, customActions: [...prev.customActions, newAction] }));
    setFormName('');
    setFormDesc('');
    setFormType('action');
    setShowForm(false);
  };

  const handleRemoveCustom = (id: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      customActions: prev.customActions.filter(a => a.id !== id),
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Filter Menu Bar (Dashboard Style) */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              background: filter === f.id ? '#991b1b' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: filter === f.id ? '#ffffff' : '#94a3b8',
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Weapon attacks table */}
      {filteredAttacks.length > 0 && (
        <div style={{
          background: 'rgba(17,18,24,0.6)',
          border: 'none',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(120px, 1fr) 60px 60px 80px',
            padding: '2px 8px 4px 8px',
            background: 'transparent',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            gap: '8px'
          }}>
            {['ATAQUE', 'ALCANCE', 'ACERTO/CD', 'DANO'].map((h, i) => (
              <div key={h} style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textAlign: i > 0 ? 'center' : 'left' }}>
                {h}
              </div>
            ))}
          </div>
          {filteredAttacks.map((atk, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(120px, 1fr) 60px 60px 80px',
              padding: '8px',
              borderBottom: i < filteredAttacks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 700 }}>{atk.weaponName}</div>
                {atk.properties.length > 0 && (
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    {atk.properties.join(', ')}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>{atk.range}</div>
              
              <div style={{ textAlign: 'center' }}>
                <span style={{ 
                  display: 'inline-block',
                  border: '1px solid #991b1b',
                  borderRadius: '20px',
                  padding: '1px 8px',
                  fontSize: '0.8rem', 
                  fontWeight: 900, 
                  color: '#f1f5f9',
                  background: 'rgba(0,0,0,0.5)'
                }}>
                  {signedMod(atk.attackBonus)}
                </span>
              </div>
              
              <div style={{ fontSize: '0.75rem', color: '#f1f5f9', textAlign: 'center', border: '1px solid #7f1d1d', background: 'rgba(0,0,0,0.4)', borderRadius: '4px', padding: '2px 0' }}>
                {atk.damageDice !== '1' ? atk.damageDice : '1'}{atk.damageBonus !== 0 ? ` ${signedMod(atk.damageBonus)}` : ''}
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: '4px' }}>{atk.damageType.substring(0,3)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom actions */}
      {filteredCustom.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredCustom.map(ca => (
            <div key={ca.id} style={{
              background: 'rgba(17,18,24,0.6)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '0.88rem', color: '#f1f5f9', fontWeight: 600 }}>{ca.name}</span>
                  <span style={{
                    fontSize: '0.62rem',
                    color: '#a78bfa',
                    background: 'rgba(167,139,250,0.1)',
                    border: '1px solid rgba(167,139,250,0.2)',
                    borderRadius: '4px',
                    padding: '1px 6px',
                  }}>
                    {TYPE_LABELS[ca.type] ?? ca.type}
                  </span>
                </div>
                {ca.description && (
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>{ca.description}</div>
                )}
              </div>
              <button
                onClick={() => handleRemoveCustom(ca.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: '2px 4px',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {filteredAttacks.length === 0 && filteredCustom.length === 0 && (
        <div style={{ color: '#475569', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
          Nenhuma ação nesta categoria.
        </div>
      )}

      {/* Add custom action */}
      {showForm ? (
        <div style={{
          background: 'rgba(17,18,24,0.6)',
          border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 600, letterSpacing: '0.08em' }}>
            NOVA AÇÃO PERSONALIZADA
          </div>
          <input
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="Nome da ação"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#f1f5f9',
              padding: '6px 10px',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <select
            value={formType}
            onChange={e => setFormType(e.target.value as CustomAction['type'])}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#f1f5f9',
              padding: '6px 10px',
              fontSize: '0.85rem',
            }}
          >
            <option value="action">Ação</option>
            <option value="bonus">Ação Bônus</option>
            <option value="reaction">Reação</option>
            <option value="other">Outro</option>
          </select>
          <textarea
            value={formDesc}
            onChange={e => setFormDesc(e.target.value)}
            placeholder="Descrição (opcional)"
            rows={2}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#f1f5f9',
              padding: '6px 10px',
              fontSize: '0.82rem',
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAddCustom}
              disabled={!formName.trim()}
              style={{
                flex: 1,
                background: formName.trim() ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${formName.trim() ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '6px',
                color: formName.trim() ? '#a78bfa' : '#475569',
                padding: '6px 12px',
                fontSize: '0.82rem',
                cursor: formName.trim() ? 'pointer' : 'default',
                fontWeight: 600,
              }}
            >
              Adicionar
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '6px',
                color: '#64748b',
                padding: '6px 12px',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: '#64748b',
            padding: '8px',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          ＋ Ação Personalizada
        </button>
      )}
    </div>
  );
}

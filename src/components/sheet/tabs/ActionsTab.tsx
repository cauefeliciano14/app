import { useState } from 'react';
import type { WeaponAttack } from '../../../rules/types/DerivedSheet';
import type { CharacterPlayState, CustomAction } from '../../../types/playState';

type FilterId = 'all' | 'attack' | 'action' | 'bonus' | 'reaction' | 'other';

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all',      label: 'Tudo' },
  { id: 'attack',   label: 'Ataques' },
  { id: 'action',   label: 'Ação' },
  { id: 'bonus',    label: 'Ação Bônus' },
  { id: 'reaction', label: 'Reação' },
  { id: 'other',    label: 'Outro' },
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
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              background: filter === f.id ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f.id ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '20px',
              color: filter === f.id ? '#a78bfa' : '#94a3b8',
              padding: '4px 12px',
              fontSize: '0.78rem',
              cursor: 'pointer',
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
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 80px 80px',
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            {['NOME', 'ALCANCE', 'ATAQUE', 'DANO'].map(h => (
              <div key={h} style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.08em' }}>
                {h}
              </div>
            ))}
          </div>
          {filteredAttacks.map((atk, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 80px 80px',
              padding: '10px 14px',
              borderBottom: i < filteredAttacks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 500 }}>{atk.weaponName}</div>
                {atk.properties.length > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>
                    {atk.properties.join(', ')}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{atk.range}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8' }}>
                {signedMod(atk.attackBonus)}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#fbbf24' }}>
                {atk.damageDice !== '1' ? atk.damageDice : '1'}{atk.damageBonus !== 0 ? ` ${signedMod(atk.damageBonus)}` : ''}
                <span style={{ fontSize: '0.7rem', color: '#475569', marginLeft: '4px' }}>{atk.damageType}</span>
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

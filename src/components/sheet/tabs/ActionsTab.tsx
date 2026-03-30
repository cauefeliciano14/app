import { useState } from 'react';
import type { WeaponAttack } from '../../../rules/types/DerivedSheet';
import type { CharacterPlayState, CustomAction } from '../../../types/playState';
import { signedMod } from '../../../utils/format';
import { ActionTypeBadge } from '../../ui/ActionTypeBadge';
import styles from './ActionsTab.module.css';

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
  action: 'Ação', bonus: 'Ação Bônus', reaction: 'Reação', other: 'Outro', limited: 'Uso Limitado',
};

const RESET_LABELS: Record<string, string> = {
  short: 'Descanso Curto', long: 'Descanso Longo',
};

interface ActionsTabProps {
  weaponAttacks: WeaponAttack[];
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
  onAttackClick?: (attack: WeaponAttack) => void;
}

export function ActionsTab({ weaponAttacks, playState, onUpdatePlayState, onAttackClick }: ActionsTabProps) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<CustomAction['type']>('action');
  const [formDesc, setFormDesc] = useState('');
  const [formMaxUses, setFormMaxUses] = useState('');
  const [formResetOn, setFormResetOn] = useState<'short' | 'long'>('long');

  const filteredAttacks = filter === 'all' || filter === 'attack' ? weaponAttacks : [];
  const filteredCustom = playState.customActions.filter(
    a => filter === 'all' || a.type === filter
  );

  const handleAddCustom = () => {
    if (!formName.trim()) return;
    const maxUses = parseInt(formMaxUses, 10) || undefined;
    const newAction: CustomAction = {
      id: `ca-${Date.now()}`,
      name: formName.trim(),
      type: formType,
      description: formDesc.trim(),
      maxUses,
      usesSpent: 0,
      resetOn: maxUses ? formResetOn : undefined,
    };
    onUpdatePlayState(prev => ({ ...prev, customActions: [...prev.customActions, newAction] }));
    setFormName(''); setFormDesc(''); setFormType('action');
    setFormMaxUses(''); setShowForm(false);
  };

  const handleRemoveCustom = (id: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      customActions: prev.customActions.filter(a => a.id !== id),
    }));
  };

  const handleSpendUse = (id: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      customActions: prev.customActions.map(a =>
        a.id === id && a.maxUses !== undefined
          ? { ...a, usesSpent: Math.min((a.usesSpent ?? 0) + 1, a.maxUses) }
          : a
      ),
    }));
  };

  const handleRestoreUse = (id: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      customActions: prev.customActions.map(a =>
        a.id === id ? { ...a, usesSpent: Math.max(0, (a.usesSpent ?? 0) - 1) } : a
      ),
    }));
  };

  return (
    <div className={styles.container}>
      {/* Filter bar */}
      <div className={styles.filterBar}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={filter === f.id ? styles.filterBtnActive : styles.filterBtn}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Weapon attacks table */}
      {filteredAttacks.length > 0 && (
        <div className={styles.attackTable}>
          <div className={styles.attackHeader}>
            <div className={styles.attackHeaderCell}>ATAQUE</div>
            <div className={styles.attackHeaderCellCenter}>ALCANCE</div>
            <div className={styles.attackHeaderCellCenter}>ACERTO/CD</div>
            <div className={styles.attackHeaderCellCenter}>DANO</div>
          </div>
          {filteredAttacks.map((atk, i) => (
            <div
              key={i}
              className={styles.attackRow}
              onClick={() => onAttackClick?.(atk)}
              role={onAttackClick ? 'button' : undefined}
              tabIndex={onAttackClick ? 0 : undefined}
              onKeyDown={onAttackClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onAttackClick(atk); } : undefined}
              style={onAttackClick ? { cursor: 'pointer' } : undefined}
            >
              <div>
                <div className={styles.weaponName}>
                  {atk.weaponName}
                  {' '}<ActionTypeBadge type={atk.actionType} />
                </div>
                {atk.properties.length > 0 && (
                  <div className={styles.weaponProps}>{atk.properties.join(', ')}</div>
                )}
              </div>
              <div className={styles.attackRange}>{atk.range}</div>
              <div style={{ textAlign: 'center' }}>
                <span className={styles.attackBonus}>{signedMod(atk.attackBonus)}</span>
              </div>
              <div className={styles.damageDice}>
                {atk.damageDice !== '1' ? atk.damageDice : '1'}{atk.damageBonus !== 0 ? ` ${signedMod(atk.damageBonus)}` : ''}
                <span className={styles.damageType}>{atk.damageType.substring(0, 3)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom actions */}
      {filteredCustom.length > 0 && (
        <div className={styles.customList}>
          {filteredCustom.map(ca => {
            const remaining = ca.maxUses !== undefined ? ca.maxUses - (ca.usesSpent ?? 0) : null;
            return (
              <div key={ca.id} className={styles.customCard}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span className={styles.customName}>{ca.name}</span>
                    <ActionTypeBadge type={ca.type} />
                    {ca.resetOn && (
                      <span className={styles.resetBadge}>{RESET_LABELS[ca.resetOn]}</span>
                    )}
                  </div>
                  {ca.description && <div className={styles.customDesc}>{ca.description}</div>}
                  {ca.maxUses !== undefined && (
                    <div className={styles.usesRow}>
                      <span className={styles.usesLabel}>Usos:</span>
                      <div className={styles.usesDots}>
                        {Array.from({ length: ca.maxUses }, (_, i) => (
                          <div
                            key={i}
                            className={i < (remaining ?? 0) ? styles.useDotFilled : styles.useDotEmpty}
                          />
                        ))}
                      </div>
                      <span className={styles.usesCount}>{remaining}/{ca.maxUses}</span>
                      <button
                        onClick={() => handleSpendUse(ca.id)}
                        disabled={(remaining ?? 0) <= 0}
                        className={styles.useBtn}
                      >
                        Usar
                      </button>
                      <button
                        onClick={() => handleRestoreUse(ca.id)}
                        disabled={(ca.usesSpent ?? 0) <= 0}
                        className={styles.restoreBtn}
                      >
                        Restaurar
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => handleRemoveCustom(ca.id)} className={styles.removeBtn}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {filteredAttacks.length === 0 && filteredCustom.length === 0 && (
        <div className={styles.emptyText}>Nenhuma ação nesta categoria.</div>
      )}

      {/* Add custom action */}
      {showForm ? (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>NOVA AÇÃO PERSONALIZADA</div>
          <input
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="Nome da ação"
            className={styles.formInput}
          />
          <select
            value={formType}
            onChange={e => setFormType(e.target.value as CustomAction['type'])}
            className={styles.formSelect}
          >
            <option value="action">Ação</option>
            <option value="bonus">Ação Bônus</option>
            <option value="reaction">Reação</option>
            <option value="other">Outro</option>
            <option value="limited">Uso Limitado</option>
          </select>
          <div className={styles.formRow}>
            <input
              type="number"
              min="0"
              value={formMaxUses}
              onChange={e => setFormMaxUses(e.target.value)}
              placeholder="Usos máx. (opcional)"
              className={styles.formInput}
              style={{ flex: 1 }}
            />
            {formMaxUses && parseInt(formMaxUses, 10) > 0 && (
              <select
                value={formResetOn}
                onChange={e => setFormResetOn(e.target.value as 'short' | 'long')}
                className={styles.formSelect}
                style={{ flex: 1 }}
              >
                <option value="short">Desc. Curto</option>
                <option value="long">Desc. Longo</option>
              </select>
            )}
          </div>
          <textarea
            value={formDesc}
            onChange={e => setFormDesc(e.target.value)}
            placeholder="Descrição (opcional)"
            rows={2}
            className={styles.formTextarea}
          />
          <div className={styles.formActions}>
            <button
              onClick={handleAddCustom}
              disabled={!formName.trim()}
              className={styles.formSubmitBtn}
            >
              Adicionar
            </button>
            <button onClick={() => setShowForm(false)} className={styles.formCancelBtn}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className={styles.addBtn}>
          ＋ Ação Personalizada
        </button>
      )}
    </div>
  );
}

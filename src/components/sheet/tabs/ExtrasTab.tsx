import { useState } from 'react';
import type { CharacterPlayState, CustomCounter } from '../../../types/playState';
import { getDefaultClassCounters } from '../../../data/classResources';
import styles from './ExtrasTab.module.css';

interface ExtrasTabProps {
  extras: string;
  onUpdateExtras: (extras: string) => void;
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
  classId?: string;
  characterLevel?: number;
}

const RESET_LABELS: Record<CustomCounter['resetOn'], string> = {
  short: 'Desc. Curto',
  long: 'Desc. Longo',
  manual: 'Manual',
};

export function ExtrasTab({ extras, onUpdateExtras, playState, onUpdatePlayState, classId, characterLevel = 1 }: ExtrasTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formMax, setFormMax] = useState('1');
  const [formReset, setFormReset] = useState<CustomCounter['resetOn']>('long');

  const counters = playState.customCounters ?? [];

  const defaultCounters = classId ? getDefaultClassCounters(classId, characterLevel) : [];
  const missingDefaults = defaultCounters.filter(d => !counters.some(c => c.id === d.id));

  const handleAddClassResources = () => {
    if (missingDefaults.length === 0) return;
    onUpdatePlayState(prev => ({
      ...prev,
      customCounters: [...(prev.customCounters ?? []), ...missingDefaults],
    }));
  };

  const handleAddCounter = () => {
    if (!formName.trim()) return;
    const max = Math.max(1, parseInt(formMax, 10) || 1);
    const newCounter: CustomCounter = {
      id: `ctr-${Date.now()}`,
      name: formName.trim(),
      current: max,
      max,
      resetOn: formReset,
    };
    onUpdatePlayState(prev => ({ ...prev, customCounters: [...(prev.customCounters ?? []), newCounter] }));
    setFormName(''); setFormMax('1'); setShowForm(false);
  };

  const updateCounter = (id: string, delta: number) => {
    onUpdatePlayState(prev => ({
      ...prev,
      customCounters: (prev.customCounters ?? []).map(c =>
        c.id === id ? { ...c, current: Math.max(0, Math.min(c.max, c.current + delta)) } : c
      ),
    }));
  };

  const removeCounter = (id: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      customCounters: (prev.customCounters ?? []).filter(c => c.id !== id),
    }));
  };

  const resetCounter = (id: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      customCounters: (prev.customCounters ?? []).map(c =>
        c.id === id ? { ...c, current: c.max } : c
      ),
    }));
  };

  return (
    <div className={styles.container}>

      {/* ── Contadores de Recursos ── */}
      <div className={styles.sectionTitle}>CONTADORES DE RECURSOS</div>

      {counters.length > 0 && (
        <div className={styles.counterList}>
          {counters.map(ctr => (
            <div key={ctr.id} className={styles.counterCard}>
              <div className={styles.counterTop}>
                <span className={styles.counterName}>{ctr.name}</span>
                <span className={styles.counterReset}>{RESET_LABELS[ctr.resetOn]}</span>
                <button onClick={() => resetCounter(ctr.id)} className={styles.counterResetBtn} title="Restaurar">↺</button>
                <button onClick={() => removeCounter(ctr.id)} className={styles.counterRemoveBtn} title="Remover">✕</button>
              </div>
              <div className={styles.counterDots}>
                {Array.from({ length: ctr.max }, (_, i) => (
                  <div
                    key={i}
                    className={i < ctr.current ? styles.dotFilled : styles.dotEmpty}
                    onClick={() => updateCounter(ctr.id, i < ctr.current ? -(ctr.current - i) : (i - ctr.current + 1))}
                    role="button"
                    title={i < ctr.current ? 'Clique para gastar até este' : 'Clique para restaurar até este'}
                  />
                ))}
              </div>
              <div className={styles.counterControls}>
                <button onClick={() => updateCounter(ctr.id, -1)} disabled={ctr.current <= 0} className={styles.counterBtn}>−</button>
                <span className={styles.counterValue}>{ctr.current}<span className={styles.counterMax}>/{ctr.max}</span></span>
                <button onClick={() => updateCounter(ctr.id, 1)} disabled={ctr.current >= ctr.max} className={styles.counterBtn}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {missingDefaults.length > 0 && !showForm && (
        <button onClick={handleAddClassResources} className={styles.addClassBtn}>
          ⚔ Adicionar recursos de {classId} (nível {characterLevel})
        </button>
      )}

      {showForm ? (
        <div className={styles.counterForm}>
          <input
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="Nome do recurso (ex: Ki Points, Rages)"
            className={styles.formInput}
          />
          <div className={styles.formRow}>
            <input
              type="number"
              min="1"
              value={formMax}
              onChange={e => setFormMax(e.target.value)}
              placeholder="Máximo"
              className={styles.formInput}
              style={{ flex: 1 }}
            />
            <select
              value={formReset}
              onChange={e => setFormReset(e.target.value as CustomCounter['resetOn'])}
              className={styles.formSelect}
              style={{ flex: 1 }}
            >
              <option value="long">Desc. Longo</option>
              <option value="short">Desc. Curto</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <button onClick={handleAddCounter} disabled={!formName.trim()} className={styles.formSubmitBtn}>
              Adicionar
            </button>
            <button onClick={() => setShowForm(false)} className={styles.formCancelBtn}>Cancelar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className={styles.addBtn}>
          ＋ Novo Contador
        </button>
      )}

      {/* ── Notas Extras ── */}
      <div className={styles.sectionTitle} style={{ marginTop: '16px' }}>NOTAS EXTRAS</div>
      <div className={styles.hint}>
        Companions, condições especiais, informações de sessão, etc.
      </div>
      <textarea
        value={extras}
        onChange={e => onUpdateExtras(e.target.value)}
        placeholder="Extras, companions…"
        className={styles.textarea}
      />
    </div>
  );
}

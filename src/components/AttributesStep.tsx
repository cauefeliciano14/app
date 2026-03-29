import React, { useEffect, useState } from 'react';
import { calculateModifier, roll4d6DropLowest, calculateTotalPointCost, applyBackgroundBonus } from '../utils/attributeUtils';
import { ATTR_KEYS, ATTR_META } from '../utils/attributeConstants';
import classAttributeSuggestions from '../data/classAttributeSuggestions';
import { StandardArrayDnD } from './StandardArrayDnD';
import { DiceAnimation } from './DiceAnimation';
import { useSound } from '../context/SoundContext';


const STD_VALUES = [15, 14, 13, 12, 10, 8];

const POINT_BUY_OPTIONS = [
  { value: 8,  label: '8' },
  { value: 9,  label: '9 (-1 pto)' },
  { value: 10, label: '10 (-2 pts)' },
  { value: 11, label: '11 (-3 pts)' },
  { value: 12, label: '12 (-4 pts)' },
  { value: 13, label: '13 (-5 pts)' },
  { value: 14, label: '14 (-7 pts)' },
  { value: 15, label: '15 (-9 pts)' },
];

interface RollEntry {
  dice: number[];
  dropped: number;
  total: number;
  assignedTo: string | null;
}

interface AttributesStepProps {
  character: any;
  setCharacter: any;
  getAttributeBonus: (attr: string) => number;
  selectedBackground: any;
}

export const AttributesStep = React.memo(
  ({ character, setCharacter, getAttributeBonus, selectedBackground }: AttributesStepProps) => {
  const attrs = character.attributes;
  const [rollingSlots, setRollingSlots] = useState<Set<number>>(new Set());
  const [useDragMode, setUseDragMode] = useState(true);
  const { playSound } = useSound();

  // Sync background bonuses whenever they change
  useEffect(() => {
    const bgBonus: Record<string, number> = {};
    ATTR_KEYS.forEach(k => bgBonus[k] = getAttributeBonus(k));
    const hasChanged = ATTR_KEYS.some(k => bgBonus[k] !== (attrs.backgroundBonus[k] || 0));
    if (hasChanged) {
      const final = applyBackgroundBonus(attrs.base, bgBonus);
      const modifiers: Record<string, number> = {};
      ATTR_KEYS.forEach(k => modifiers[k] = calculateModifier(final[k]));
      setCharacter((prev: any) => ({
        ...prev,
        attributes: { ...prev.attributes, backgroundBonus: bgBonus, final, modifiers }
      }));
    }
  }, [getAttributeBonus]);

  const updateBase = (newBase: Record<string, number>) => {
    const final = applyBackgroundBonus(newBase, attrs.backgroundBonus);
    const modifiers: Record<string, number> = {};
    ATTR_KEYS.forEach(k => modifiers[k] = calculateModifier(final[k]));
    const pointBuySpent = calculateTotalPointCost(newBase);
    setCharacter((prev: any) => ({
      ...prev,
      attributes: { ...prev.attributes, base: newBase, final, modifiers, pointBuySpent }
    }));
  };

  const setMethod = (method: string | null) => {
    const defaultBase = method === 'pointBuy'
      ? Object.fromEntries(ATTR_KEYS.map(k => [k, 8]))
      : Object.fromEntries(ATTR_KEYS.map(k => [k, 0]));
    const final = applyBackgroundBonus(defaultBase, attrs.backgroundBonus);
    const modifiers: Record<string, number> = {};
    ATTR_KEYS.forEach(k => modifiers[k] = calculateModifier(final[k]));
    setCharacter((prev: any) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        method,
        base: defaultBase,
        final,
        modifiers,
        randomRolls: method === 'random' ? [] : undefined,
        pointBuySpent: method === 'pointBuy' ? 0 : undefined,
      }
    }));
  };

  const handleStandardApply = () => {
    const classId = character.characterClass?.id || 'guerreiro';
    const suggestion = classAttributeSuggestions[classId] || [15, 14, 13, 12, 10, 8];
    const newBase: Record<string, number> = {};
    ATTR_KEYS.forEach((k, idx) => { newBase[k] = suggestion[idx]; });
    updateBase(newBase);
  };

  const handlePointBuyChange = (attr: string, value: number) => {
    const newBase = { ...attrs.base, [attr]: value };
    if (calculateTotalPointCost(newBase) > 27) return;
    updateBase(newBase);
  };

  // --- Dice Rolls (flat, no groups) ---
  const rolls: RollEntry[] = attrs.randomRolls || [];

  const handleRollSlot = (slotIdx: number) => {
    setRollingSlots(prev => new Set([...prev, slotIdx]));
    playSound('dice-roll');
    setTimeout(() => {
      const result = roll4d6DropLowest();
      setCharacter((prev: any) => {
        const prevRolls: RollEntry[] = prev.attributes.randomRolls || [];
        const newRolls = [...prevRolls];
        newRolls[slotIdx] = { ...result, assignedTo: null };
        return { ...prev, attributes: { ...prev.attributes, randomRolls: newRolls } };
      });
      setRollingSlots(prev => { const s = new Set(prev); s.delete(slotIdx); return s; });
    }, 700);
  };

  const handleRollAll = () => {
    for (let i = 0; i < 6; i++) {
      if (!rolls[i]) handleRollSlot(i);
    }
  };

  const handleAssignRoll = (slotIdx: number, attrKey: string | null) => {
    setCharacter((prev: any) => {
      const prevRolls: RollEntry[] = prev.attributes.randomRolls || [];
      const newRolls = prevRolls.map((r: RollEntry, ri: number) =>
        ri === slotIdx ? { ...r, assignedTo: attrKey } : r
      );
      return { ...prev, attributes: { ...prev.attributes, randomRolls: newRolls } };
    });
  };

  const handleResetRolls = () => {
    const defaultBase = Object.fromEntries(ATTR_KEYS.map(k => [k, 0]));
    const final = applyBackgroundBonus(defaultBase, attrs.backgroundBonus);
    const modifiers: Record<string, number> = {};
    ATTR_KEYS.forEach(k => modifiers[k] = calculateModifier(final[k]));
    setCharacter((prev: any) => ({
      ...prev,
      attributes: { ...prev.attributes, randomRolls: [], base: defaultBase, final, modifiers }
    }));
  };

  const handleApplyRolls = () => {
    const newBase = Object.fromEntries(ATTR_KEYS.map(k => [k, 0]));
    rolls.forEach((r: RollEntry) => { if (r.assignedTo) newBase[r.assignedTo] = r.total; });
    updateBase(newBase);
  };

  const usedAttrs = new Set(rolls.filter((r: RollEntry) => r.assignedTo).map((r: RollEntry) => r.assignedTo));
  const canApplyRolls = rolls.length === 6 && usedAttrs.size === 6;
  const isAnyRolling = rollingSlots.size > 0;

  const pointsRemaining = 27 - (attrs.pointBuySpent || 0);
  const fmtMod = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`;

  // Common column header
  const ColHeaders = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '8px' }}>
      {ATTR_KEYS.map(attr => (
        <div key={attr} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: '700', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {ATTR_META[attr].abbr}
        </div>
      ))}
    </div>
  );

  // Common total row
  const TotalRow = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginTop: '8px' }}>
      {ATTR_KEYS.map(attr => {
        const base = attrs.base[attr];
        const final = base ? attrs.final[attr] : null;
        return (
          <div key={attr} style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
            TOTAL: <span style={{ color: final ? '#e2e8f0' : '#475569', fontWeight: 600 }}>
              {final || '--'}
            </span>
          </div>
        );
      })}
    </div>
  );

  // ==================== RENDER ====================

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* --- Seleção de Método --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <select
          className="premium-select"
          value={attrs.method || ''}
          onChange={e => setMethod(e.target.value || null)}
          style={{ flex: 1, minWidth: '220px', maxWidth: '320px' }}
        >
          <option value="">– Escolha um método de geração –</option>
          <option value="standard">Conjunto Padrão</option>
          <option value="random">Geração Aleatória</option>
          <option value="pointBuy">Custo de Pontos</option>
        </select>
        {attrs.method === 'standard' && (
          <button
            onClick={handleStandardApply}
            style={{ padding: '8px 16px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            Aplicar Sugestão da Classe
          </button>
        )}
      </div>

      {/* --- Estado Vazio --- */}
      {!attrs.method && (
        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(17,18,24,0.4)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p style={{ color: '#64748b', margin: 0 }}>Selecione um método de geração acima.</p>
        </div>
      )}

      {/* ===== CONJUNTO PADRÃO ===== */}
      {attrs.method === 'standard' && (() => {
        const usedVals = (attr: string) =>
          ATTR_KEYS.filter(k => k !== attr && attrs.base[k] !== 0).map(k => attrs.base[k]);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modo:</span>
              <button
                onClick={() => setUseDragMode(true)}
                style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, border: '1px solid', borderColor: useDragMode ? 'rgba(212,160,23,0.4)' : 'rgba(255,255,255,0.08)', borderRadius: '999px', background: useDragMode ? 'rgba(212,160,23,0.12)' : 'transparent', color: useDragMode ? '#d4a017' : '#75838b', cursor: 'pointer' }}
              >
                Arrastar
              </button>
              <button
                onClick={() => setUseDragMode(false)}
                style={{ padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600, border: '1px solid', borderColor: !useDragMode ? 'rgba(212,160,23,0.4)' : 'rgba(255,255,255,0.08)', borderRadius: '999px', background: !useDragMode ? 'rgba(212,160,23,0.12)' : 'transparent', color: !useDragMode ? '#d4a017' : '#75838b', cursor: 'pointer' }}
              >
                Selecionar
              </button>
            </div>

            {useDragMode ? (
              <StandardArrayDnD base={attrs.base} onUpdate={updateBase} />
            ) : (
              <div style={{ background: 'rgba(17,18,24,0.6)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '12px', padding: '16px', overflowX: 'auto' }}>
                <div style={{ minWidth: '480px' }}>
                  <ColHeaders />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                    {ATTR_KEYS.map(attr => (
                      <select
                        key={attr}
                        className="premium-select"
                        value={attrs.base[attr] || 0}
                        onChange={e => updateBase({ ...attrs.base, [attr]: Number(e.target.value) })}
                        style={{ width: '100%', textAlign: 'center' }}
                      >
                        <option value={0}>--</option>
                        {STD_VALUES.map(v => (
                          <option key={v} value={v} disabled={usedVals(attr).includes(v)}>
                            {v}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                  <TotalRow />
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ===== GERAÇÃO ALEATÓRIA ===== */}
      {attrs.method === 'random' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Linha de atributos atribuídos */}
          <div style={{ background: 'rgba(17,18,24,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', overflowX: 'auto' }}>
            <div style={{ minWidth: '480px' }}>
              <ColHeaders />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {ATTR_KEYS.map(attr => {
                  const base = attrs.base[attr];
                  return (
                    <div
                      key={attr}
                      style={{ height: '40px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '700', color: base ? '#e2e8f0' : '#475569' }}
                    >
                      {base || '--'}
                    </div>
                  );
                })}
              </div>
              <TotalRow />
            </div>
          </div>

          {/* Painel de Rolagem */}
          <div style={{ background: 'rgba(17,18,24,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
            {/* Header com botão Rolar Todos */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '0.9rem' }}>Rolagem de Dados</span>
              <button
                onClick={handleRollAll}
                disabled={rolls.length >= 6 || isAnyRolling}
                style={{ padding: '6px 14px', background: rolls.length >= 6 || isAnyRolling ? 'rgba(255,255,255,0.05)' : '#22c55e', color: rolls.length >= 6 || isAnyRolling ? '#64748b' : '#fff', border: 'none', borderRadius: '6px', cursor: rolls.length >= 6 || isAnyRolling ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
              >
                Rolar Todos
              </button>
            </div>

            {/* 6 slots horizontais — sem quebra de linha */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {Array.from({ length: 6 }).map((_, slotIdx) => {
                const roll = rolls[slotIdx];
                const isRolling = rollingSlots.has(slotIdx);

                if (isRolling) {
                  return <DiceAnimation key={slotIdx} diceCount={4} />;
                }

                if (roll) {
                  const droppedIdx = roll.dice.reduce((minI: number, curr: number, i: number, arr: number[]) => curr < arr[minI] ? i : minI, 0);
                  return (
                    <div key={slotIdx} style={{ minWidth: '120px', flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'rgba(17,18,24,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px' }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#e2e8f0' }}>{roll.total}</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {roll.dice.map((d: number, di: number) => (
                          <span
                            key={di}
                            style={{ width: '22px', height: '22px', borderRadius: '4px', background: di === droppedIdx ? '#475569' : '#3b82f6', color: '#fff', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                      <select
                        className="premium-select"
                        value={roll.assignedTo || ''}
                        onChange={e => handleAssignRoll(slotIdx, e.target.value || null)}
                        style={{ fontSize: '0.75rem', padding: '4px 24px 4px 6px', height: '28px', minWidth: '64px', width: '100%' }}
                      >
                        <option value="">--</option>
                        {ATTR_KEYS.map(k => (
                          <option key={k} value={k} disabled={usedAttrs.has(k) && roll.assignedTo !== k}>
                            {ATTR_META[k].abbr}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // Slot vazio — botão Rolar
                return (
                  <div key={slotIdx} style={{ minWidth: '120px', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '110px' }}>
                    <button
                      onClick={() => handleRollSlot(slotIdx)}
                      disabled={isAnyRolling}
                      style={{ padding: '10px 20px', background: isAnyRolling ? 'rgba(255,255,255,0.05)' : '#22c55e', color: isAnyRolling ? '#64748b' : '#fff', border: 'none', borderRadius: '8px', cursor: isAnyRolling ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.85rem', opacity: isAnyRolling ? 0.6 : 1 }}
                    >
                      ROLAR
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={handleResetRolls}
                style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}
              >
                REDEFINIR
              </button>
              <button
                onClick={handleApplyRolls}
                disabled={!canApplyRolls}
                style={{ padding: '6px 14px', background: canApplyRolls ? '#f97316' : 'rgba(255,255,255,0.05)', color: canApplyRolls ? '#fff' : '#64748b', border: canApplyRolls ? 'none' : '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', cursor: canApplyRolls ? 'pointer' : 'not-allowed', fontWeight: '700', fontSize: '0.8rem' }}
              >
                APLICAR VALORES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CUSTO DE PONTOS ===== */}
      {attrs.method === 'pointBuy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(17,18,24,0.6)', border: `1px solid ${pointsRemaining < 0 ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.2)'}`, borderRadius: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pontos Restantes</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: pointsRemaining < 0 ? '#ef4444' : '#f97316' }}>
              {pointsRemaining}/27
            </span>
          </div>

          <div style={{ background: 'rgba(17,18,24,0.6)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '12px', padding: '16px', overflowX: 'auto' }}>
            <div style={{ minWidth: '480px' }}>
              <ColHeaders />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {ATTR_KEYS.map(attr => (
                  <select
                    key={attr}
                    className="premium-select"
                    value={attrs.base[attr]}
                    onChange={e => handlePointBuyChange(attr, Number(e.target.value))}
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    {POINT_BUY_OPTIONS.map(opt => {
                      const wouldCost = calculateTotalPointCost({ ...attrs.base, [attr]: opt.value });
                      const tooExpensive = wouldCost > 27 && opt.value > attrs.base[attr];
                      return (
                        <option key={opt.value} value={opt.value} disabled={tooExpensive}>
                          {opt.label}
                        </option>
                      );
                    })}
                  </select>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginTop: '8px' }}>
                {ATTR_KEYS.map(attr => (
                  <div key={attr} style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                    TOTAL: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{attrs.final[attr]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CÁLCULO DE ATRIBUTOS ===== */}
      {attrs.method && (
        <>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />

          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#f1f5f9', fontWeight: 600 }}>
              Cálculo de Atributos
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Os cálculos, incluindo os valores base que você definiu acima, encontram-se abaixo. Você também pode substituir ou modificar quaisquer cálculos automáticos.
            </p>

            {/* Fileira 1: FOR, DES, CON — Fileira 2: INT, SAB, CAR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {ATTR_KEYS.map(attr => {
                const base = attrs.base[attr] || 0;
                const bonus = attrs.backgroundBonus[attr] || 0;
                const finalVal = base ? attrs.final[attr] : (bonus || null);
                const mod = base ? attrs.modifiers[attr] : (bonus ? calculateModifier(bonus) : null);
                const bgName = selectedBackground?.name;

                return (
                  <div key={attr} style={{ background: 'rgba(17,18,24,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                    {/* Cabeçalho do card */}
                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '7px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ fontSize: '0.95rem' }}>{ATTR_META[attr].icon}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                        {ATTR_META[attr].full}
                      </span>
                    </div>

                    {/* Linhas de dados */}
                    <div style={{ fontSize: '0.8rem' }}>
                      {/* Pontuação Total */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#94a3b8' }}>Pontuação Total</span>
                        <span style={{ fontWeight: '700', color: '#e2e8f0' }}>{finalVal ?? '--'}</span>
                      </div>

                      {/* Modificador — destaque */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px 6px 9px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(100,150,220,0.1)', borderLeft: '3px solid #6496ff' }}>
                        <span style={{ color: '#93b4ef', fontWeight: 600 }}>Modificador</span>
                        <span style={{ fontWeight: '800', color: mod !== null ? (mod >= 0 ? '#10b981' : '#ef4444') : '#64748b' }}>
                          {mod !== null ? fmtMod(mod) : '--'}
                        </span>
                      </div>

                      {/* Valor Base */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#94a3b8' }}>Valor Base</span>
                        <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{base || '--'}</span>
                      </div>

                      {/* Bônus */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#94a3b8' }}>Bônus</span>
                        <span style={{ fontWeight: '600', color: bonus > 0 ? '#f97316' : '#64748b' }}>
                          {bonus > 0 ? `+${bonus}` : '+0'}
                        </span>
                      </div>
                      {bonus > 0 && bgName && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 12px 5px 22px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(249,115,22,0.04)' }}>
                          <span style={{ color: '#64748b', fontSize: '0.72rem', lineHeight: 1.3 }}>{bgName}</span>
                          <span style={{ color: '#f97316', fontSize: '0.72rem', fontWeight: 600 }}>(+{bonus})</span>
                        </div>
                      )}

                      {/* Valor Definido */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: '#94a3b8' }}>Valor Definido</span>
                        <span style={{ fontWeight: '600', color: '#64748b' }}>0</span>
                      </div>

                      {/* Bônus Cumulativo */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px' }}>
                        <span style={{ color: '#94a3b8' }}>Bônus Cumulativo</span>
                        <span style={{ fontWeight: '600', color: '#64748b' }}>+0</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}, (prev, next) => {
  return (
    prev.getAttributeBonus === next.getAttributeBonus &&
    prev.selectedBackground?.id === next.selectedBackground?.id &&
    prev.character.attributes === next.character.attributes &&
    prev.character.characterClass?.id === next.character.characterClass?.id
  );
});

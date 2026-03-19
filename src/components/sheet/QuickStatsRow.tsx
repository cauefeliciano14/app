import { useState } from 'react';
import type { DerivedSheet } from '../../rules/types/DerivedSheet';
import type { CharacterPlayState } from '../../types/playState';

function signedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface QuickStatsRowProps {
  derivedSheet: DerivedSheet;
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
}

export function QuickStatsRow({ derivedSheet, playState, onUpdatePlayState }: QuickStatsRowProps) {
  const [hpInput, setHpInput] = useState('');
  const [tempInput, setTempInput] = useState('');
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [hdCount, setHdCount] = useState('1');

  const effectiveMaxHP = playState.maxHpOverride ?? derivedSheet.maxHP;

  const handleHeal = () => {
    const amount = parseInt(hpInput, 10);
    if (!isNaN(amount) && amount > 0) {
      onUpdatePlayState(prev => ({
        ...prev,
        currentHp: Math.min(prev.currentHp + amount, effectiveMaxHP),
      }));
      setHpInput('');
    }
  };

  const handleDamage = () => {
    const amount = parseInt(hpInput, 10);
    if (!isNaN(amount) && amount > 0) {
      onUpdatePlayState(prev => {
        const tempAbsorbed = Math.min(prev.tempHp, amount);
        const remaining = amount - tempAbsorbed;
        return {
          ...prev,
          tempHp: prev.tempHp - tempAbsorbed,
          currentHp: Math.max(0, prev.currentHp - remaining),
        };
      });
      setHpInput('');
    }
  };

  const handleSetTemp = () => {
    const amount = parseInt(tempInput, 10);
    if (!isNaN(amount) && amount >= 0) {
      onUpdatePlayState(prev => ({ ...prev, tempHp: amount }));
      setTempInput('');
    }
  };

  const handleLongRest = () => {
    onUpdatePlayState(prev => ({
      ...prev,
      currentHp: effectiveMaxHP,
      tempHp: 0,
      spentSpellSlots: {},
      activeConditions: [],
      deathSaves: { successes: 0, failures: 0 },
    }));
  };

  // Parse hit die size from derivedSheet.hitDie (e.g. "d8" → 8)
  const hitDieSize = parseInt((derivedSheet.hitDie ?? 'd8').replace('d', ''), 10) || 8;
  const conMod = derivedSheet.modifiers?.constituicao ?? 0;

  const handleShortRest = () => {
    const count = Math.max(1, parseInt(hdCount, 10) || 1);
    // Roll each hit die: average roll = ceil(hitDieSize / 2) for simplicity
    const rolled = Array.from({ length: count }, () => Math.floor(Math.random() * hitDieSize) + 1);
    const total = rolled.reduce((sum, r) => sum + r + conMod, 0);
    onUpdatePlayState(prev => ({
      ...prev,
      currentHp: Math.min(prev.currentHp + Math.max(1, total), effectiveMaxHP),
    }));
    setShortRestOpen(false);
    setHdCount('1');
  };

  const hpPercent = effectiveMaxHP > 0 ? (playState.currentHp / effectiveMaxHP) * 100 : 0;
  const hpColor = hpPercent > 50 ? '#4ade80' : hpPercent > 25 ? '#fbbf24' : '#f87171';

  const statCard = (label: string, value: string, accent?: string) => (
    <div style={{
      background: 'rgba(17, 18, 24, 0.6)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '8px 14px',
      textAlign: 'center',
      minWidth: '70px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: accent ?? '#f1f5f9' }}>
        {value}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Stat pills row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {statCard('PB', signedMod(derivedSheet.proficiencyBonus), '#38bdf8')}
        {statCard('VEL', derivedSheet.speed, '#4ade80')}
        {statCard('INIC', signedMod(derivedSheet.initiative), '#fbbf24')}
        {statCard('CA', String(derivedSheet.armorClass), '#a78bfa')}
        {statCard('DADO DE VIDA', derivedSheet.hitDie, '#f97316')}
      </div>

      {/* HP block */}
      <div style={{
        background: 'rgba(17, 18, 24, 0.6)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em' }}>PV</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 700, color: hpColor }}>
            {playState.currentHp}
          </span>
          <span style={{ color: '#475569' }}>/</span>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{effectiveMaxHP}</span>
          {playState.tempHp > 0 && (
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', marginLeft: '4px' }}>
              +{playState.tempHp} temp
            </span>
          )}
        </div>
        {/* HP bar */}
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '8px' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(hpPercent, 100)}%`,
            background: hpColor,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
        {/* HP input + buttons */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            type="number"
            min="0"
            value={hpInput}
            onChange={e => setHpInput(e.target.value)}
            placeholder="Qtd"
            style={{
              width: '60px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#f1f5f9',
              padding: '4px 8px',
              fontSize: '0.85rem',
            }}
          />
          <button
            onClick={handleHeal}
            style={{
              background: 'rgba(74,222,128,0.15)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: '6px',
              color: '#4ade80',
              padding: '4px 10px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Curar
          </button>
          <button
            onClick={handleDamage}
            style={{
              background: 'rgba(248,113,113,0.15)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: '6px',
              color: '#f87171',
              padding: '4px 10px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Dano
          </button>
        </div>
        {/* Temp HP */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
          <input
            type="number"
            min="0"
            value={tempInput}
            onChange={e => setTempInput(e.target.value)}
            placeholder="PV Temp"
            style={{
              width: '80px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#f1f5f9',
              padding: '4px 8px',
              fontSize: '0.8rem',
            }}
          />
          <button
            onClick={handleSetTemp}
            style={{
              background: 'rgba(56,189,248,0.15)',
              border: '1px solid rgba(56,189,248,0.3)',
              borderRadius: '6px',
              color: '#38bdf8',
              padding: '4px 10px',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Definir PV Temp
          </button>
        </div>
      </div>

      {/* Inspiration + Rest buttons row */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onUpdatePlayState(prev => ({ ...prev, heroicInspiration: !prev.heroicInspiration }))}
          style={{
            flex: 1,
            background: playState.heroicInspiration ? 'rgba(167,139,250,0.2)' : 'rgba(17,18,24,0.6)',
            border: `1px solid ${playState.heroicInspiration ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '8px',
            color: playState.heroicInspiration ? '#a78bfa' : '#64748b',
            padding: '6px 10px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          {playState.heroicInspiration ? '★' : '☆'} Inspiração
        </button>
        <button
          onClick={() => setShortRestOpen(prev => !prev)}
          style={{
            flex: 1,
            background: shortRestOpen ? 'rgba(251,191,36,0.15)' : 'rgba(17,18,24,0.6)',
            border: `1px solid ${shortRestOpen ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '8px',
            color: shortRestOpen ? '#fbbf24' : '#94a3b8',
            padding: '6px 10px',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Desc. Curto
        </button>
        <button
          onClick={handleLongRest}
          style={{
            flex: 1,
            background: 'rgba(17,18,24,0.6)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px',
            color: '#94a3b8',
            padding: '6px 10px',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
        >
          Desc. Longo
        </button>
      </div>

      {/* Short Rest panel */}
      {shortRestOpen && (
        <div style={{
          background: 'rgba(251,191,36,0.07)',
          border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: '10px',
          padding: '10px 14px',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.08em' }}>
            DESCANSO CURTO — DADOS DE VIDA
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
            Dado: {derivedSheet.hitDie} · Mod CON: {conMod >= 0 ? '+' : ''}{conMod}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              max="20"
              value={hdCount}
              onChange={e => setHdCount(e.target.value)}
              style={{
                width: '56px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#f1f5f9',
                padding: '4px 8px',
                fontSize: '0.85rem',
              }}
            />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>dado(s)</span>
            <button
              onClick={handleShortRest}
              style={{
                flex: 1,
                background: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: '6px',
                color: '#fbbf24',
                padding: '4px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Recuperar PV
            </button>
            <button
              onClick={() => setShortRestOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '4px 6px',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Death Saves — shown when HP = 0 */}
      {playState.currentHp === 0 && (
        <div style={{
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: '10px',
          padding: '10px 14px',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.08em' }}>
            SALVAGUARDAS DA MORTE
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <DeathSaveRow
              label="Sucessos"
              count={playState.deathSaves.successes}
              max={3}
              color="#4ade80"
              onChange={n => onUpdatePlayState(prev => ({
                ...prev,
                deathSaves: { ...prev.deathSaves, successes: n },
              }))}
            />
            <DeathSaveRow
              label="Falhas"
              count={playState.deathSaves.failures}
              max={3}
              color="#f87171"
              onChange={n => onUpdatePlayState(prev => ({
                ...prev,
                deathSaves: { ...prev.deathSaves, failures: n },
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DeathSaveRow({
  label, count, max, color, onChange,
}: {
  label: string; count: number; max: number; color: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(count === i + 1 ? i : i + 1)}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: `2px solid ${color}`,
              background: i < count ? color : 'transparent',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

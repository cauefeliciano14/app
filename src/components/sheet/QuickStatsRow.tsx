import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { DerivedSheet } from '../../rules/types/DerivedSheet';
import type { CharacterPlayState } from '../../types/playState';
import styles from './QuickStatsRow.module.css';

function signedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

interface QuickStatsRowProps {
  derivedSheet: DerivedSheet;
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
}

const statCardsGridStyle: CSSProperties = {
  display: 'grid',
  gap: '8px',
  alignItems: 'stretch',
  gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
};

const actionRowGridStyle: CSSProperties = {
  display: 'grid',
  gap: '8px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
};

const restPanelGridStyle: CSSProperties = {
  display: 'grid',
  gap: '6px',
  alignItems: 'center',
  gridTemplateColumns: 'repeat(auto-fit, minmax(56px, auto)) minmax(72px, auto) minmax(120px, 1fr) auto',
};

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

  const hitDieSize = parseInt((derivedSheet.hitDie ?? 'd8').replace('d', ''), 10) || 8;
  const conMod = derivedSheet.modifiers?.constituicao ?? 0;

  const handleShortRest = () => {
    const count = Math.max(1, parseInt(hdCount, 10) || 1);
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
      minWidth: 0,
      minHeight: '72px',
      display: 'grid',
      alignContent: 'center',
      justifyItems: 'center',
      gap: '2px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: accent ?? '#f1f5f9' }}>
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={{ color: accent }}>
        {value}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Stat pills row */}
      <div style={statCardsGridStyle}>
    <div className={styles.root}>
      <div className={styles.statRow}>
        {statCard('PB', signedMod(derivedSheet.proficiencyBonus), '#38bdf8')}
        {statCard('VEL', derivedSheet.speed, '#4ade80')}
        {statCard('INIC', signedMod(derivedSheet.initiative), '#fbbf24')}
        {statCard('CA', String(derivedSheet.armorClass), '#a78bfa')}
        {statCard('DADO DE VIDA', derivedSheet.hitDie, '#f97316')}
      </div>

      <div className={styles.panel}>
        <div className={styles.hpHeader}>
          <span className={styles.hpLabel}>PV</span>
          <span className={styles.hpCurrent} style={{ color: hpColor }}>
            {playState.currentHp}
          </span>
          <span className={styles.hpDivider}>/</span>
          <span className={styles.hpMax}>{effectiveMaxHP}</span>
          {playState.tempHp > 0 && (
            <span className={styles.tempValue}>+{playState.tempHp} temp</span>
          )}
        </div>
        <div className={styles.hpBar}>
          <div className={styles.hpFill} style={{ width: `${Math.min(hpPercent, 100)}%`, background: hpColor }} />
        </div>
        <div className={styles.inputRow}>
          <input
            type="number"
            min="0"
            value={hpInput}
            onChange={e => setHpInput(e.target.value)}
            placeholder="Qtd"
            className={`${styles.input} ${styles.inputSm}`.trim()}
          />
          <button onClick={handleHeal} className={`${styles.actionButton} ${styles.healButton}`.trim()}>
            Curar
          </button>
          <button onClick={handleDamage} className={`${styles.actionButton} ${styles.damageButton}`.trim()}>
            Dano
          </button>
        </div>
        <div className={`${styles.inlineRow} ${styles.spacedTop} ${styles.alignCenter}`.trim()}>
          <input
            type="number"
            min="0"
            value={tempInput}
            onChange={e => setTempInput(e.target.value)}
            placeholder="PV Temp"
            className={`${styles.input} ${styles.inputMd}`.trim()}
          />
          <button onClick={handleSetTemp} className={`${styles.actionButton} ${styles.tempButton}`.trim()}>
            Definir PV Temp
          </button>
        </div>
      </div>

      {/* Inspiration + Rest buttons row */}
      <div style={actionRowGridStyle}>
        <button
          onClick={() => onUpdatePlayState(prev => ({ ...prev, heroicInspiration: !prev.heroicInspiration }))}
          style={{
            background: playState.heroicInspiration ? 'rgba(167,139,250,0.2)' : 'rgba(17,18,24,0.6)',
            border: `1px solid ${playState.heroicInspiration ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '8px',
            color: playState.heroicInspiration ? '#a78bfa' : '#64748b',
            padding: '6px 10px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
            minHeight: '38px',
          }}
      <div className={styles.actionRow}>
        <button
          onClick={() => onUpdatePlayState(prev => ({ ...prev, heroicInspiration: !prev.heroicInspiration }))}
          className={`${styles.toggleButton} ${playState.heroicInspiration ? styles.toggleActiveInspiration : ''}`.trim()}
        >
          {playState.heroicInspiration ? '★' : '☆'} Inspiração
        </button>
        <button
          onClick={() => setShortRestOpen(prev => !prev)}
          style={{
            background: shortRestOpen ? 'rgba(251,191,36,0.15)' : 'rgba(17,18,24,0.6)',
            border: `1px solid ${shortRestOpen ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '8px',
            color: shortRestOpen ? '#fbbf24' : '#94a3b8',
            padding: '6px 10px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            minHeight: '38px',
          }}
        >
          Desc. Curto
        </button>
        <button
          onClick={handleLongRest}
          style={{
            background: 'rgba(17,18,24,0.6)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px',
            color: '#94a3b8',
            padding: '6px 10px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            minHeight: '38px',
          }}
        >
          className={`${styles.toggleButton} ${shortRestOpen ? styles.toggleActiveRest : ''}`.trim()}
        >
          Desc. Curto
        </button>
        <button onClick={handleLongRest} className={styles.toggleButton}>
          Desc. Longo
        </button>
      </div>

      {shortRestOpen && (
        <div className={styles.shortRestPanel}>
          <div className={`${styles.panelHeading} ${styles.headingWarning}`.trim()}>
            DESCANSO CURTO — DADOS DE VIDA
          </div>
          <div className={styles.shortRestMeta}>
            Dado: {derivedSheet.hitDie} · Mod CON: {conMod >= 0 ? '+' : ''}{conMod}
          </div>
          <div style={restPanelGridStyle}>
          <div className={`${styles.inlineRow} ${styles.alignCenter}`.trim()}>
            <input
              type="number"
              min="1"
              max="20"
              value={hdCount}
              onChange={e => setHdCount(e.target.value)}
              className={`${styles.input} ${styles.inputXs}`.trim()}
            />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>dado(s)</span>
            <button
              onClick={handleShortRest}
              style={{
                background: 'rgba(251,191,36,0.15)',
                border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: '6px',
                color: '#fbbf24',
                padding: '4px 10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600,
                minHeight: '34px',
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
                minHeight: '34px',
              }}
            >
            <span className={styles.shortRestLabel}>dado(s)</span>
            <button onClick={handleShortRest} className={`${styles.actionButton} ${styles.warningButton}`.trim()}>
              Recuperar PV
            </button>
            <button onClick={() => setShortRestOpen(false)} className={styles.closeButton}>
              ✕
            </button>
          </div>
        </div>
      )}

      {playState.currentHp === 0 && (
        <div className={styles.deathPanel}>
          <div className={`${styles.panelHeading} ${styles.headingDanger}`.trim()}>
            SALVAGUARDAS DA MORTE
          </div>
          <div className={styles.deathSavesRow}>
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
      <div className={`${styles.deathSaveLabel} ${styles.deathSaveCaption}`.trim()}>{label}</div>
      <div className={styles.deathDotRow}>
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(count === i + 1 ? i : i + 1)}
            className={styles.deathDot}
            style={{ border: `2px solid ${color}`, background: i < count ? color : 'transparent' }}
          />
        ))}
      </div>
    </div>
  );
}

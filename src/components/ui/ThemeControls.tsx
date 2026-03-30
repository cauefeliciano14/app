import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeMode } from '../../context/ThemeContext';
import styles from './ThemeControls.module.css';

/* ── Presets por classe de personagem ── */
const CLASS_PRESETS: Array<{ classId: string; label: string; hex: string }> = [
  { classId: 'guerreiro',  label: 'Guerreiro',  hex: '#c53131' },
  { classId: 'mago',       label: 'Mago',       hex: '#3b82f6' },
  { classId: 'ladino',     label: 'Ladino',     hex: '#6b7280' },
  { classId: 'clerigo',    label: 'Clérigo',    hex: '#f0d060' },
  { classId: 'druida',     label: 'Druida',     hex: '#22c55e' },
  { classId: 'bardo',      label: 'Bardo',      hex: '#a78bfa' },
  { classId: 'bruxo',      label: 'Bruxo',      hex: '#7c3aed' },
  { classId: 'feiticeiro', label: 'Feiticeiro', hex: '#ec4899' },
  { classId: 'paladino',   label: 'Paladino',   hex: '#f59e0b' },
  { classId: 'guardiao',   label: 'Guardião',   hex: '#059669' },
  { classId: 'barbaro',    label: 'Bárbaro',    hex: '#dc2626' },
  { classId: 'monge',      label: 'Monge',      hex: '#06b6d4' },
];

interface ThemeControlsProps {
  /** Classe ativa do personagem para destaque do preset */
  activeClassId?: string;
}

export function ThemeControls({ activeClassId }: ThemeControlsProps) {
  const {
    theme,
    toggleTheme,
    setTheme,
    accentColor,
    setAccentColor,
    useClassicFont,
    toggleClassicFont,
  } = useTheme();

  const [hexInput, setHexInput] = useState(accentColor ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Fechar ao clicar fora */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleHexSubmit = () => {
    const cleaned = hexInput.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      setAccentColor(cleaned);
    }
  };

  const handlePresetClick = (hex: string) => {
    setAccentColor(hex);
    setHexInput(hex);
  };

  const handleReset = () => {
    setAccentColor(null);
    setHexInput('');
  };

  return (
    <div className={styles.wrapper} ref={panelRef}>
      {/* Toggle button */}
      <button
        className={styles.triggerBtn}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Configurações de tema"
        title="Tema e Cores"
      >
        🎨
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Aparência</div>

          {/* ── Tema claro/escuro ── */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>TEMA</span>
            <div className={styles.themeToggleRow}>
              {(['dark', 'light'] as ThemeMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={`${styles.themeBtn} ${theme === mode ? styles.themeBtnActive : ''}`}
                >
                  {mode === 'dark' ? '🌙 Underdark' : '☀️ Pergaminho'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Cor de destaque ── */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>COR DE DESTAQUE</span>

            {/* Hex input + color input */}
            <div className={styles.hexRow}>
              <input
                type="color"
                value={accentColor ?? '#d4a017'}
                onChange={e => {
                  setAccentColor(e.target.value);
                  setHexInput(e.target.value);
                }}
                className={styles.colorInput}
                title="Escolher cor"
              />
              <input
                type="text"
                value={hexInput}
                onChange={e => setHexInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleHexSubmit(); }}
                onBlur={handleHexSubmit}
                placeholder="#d4a017"
                className={styles.hexTextInput}
                maxLength={7}
              />
              <button onClick={handleReset} className={styles.resetBtn} title="Resetar cor padrão">
                ↩
              </button>
            </div>

            {/* Presets por classe */}
            <div className={styles.presetGrid}>
              {CLASS_PRESETS.map(p => (
                <button
                  key={p.classId}
                  onClick={() => handlePresetClick(p.hex)}
                  className={`${styles.presetBtn} ${activeClassId === p.classId ? styles.presetBtnActive : ''}`}
                  title={p.label}
                  style={{ '--preset-color': p.hex } as React.CSSProperties}
                >
                  <span className={styles.presetSwatch} />
                  <span className={styles.presetLabel}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Fonte clássica ── */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>TIPOGRAFIA</span>
            <button
              onClick={toggleClassicFont}
              className={`${styles.themeBtn} ${useClassicFont ? styles.themeBtnActive : ''}`}
            >
              {useClassicFont ? '📜 Modo Clássico (Serif)' : '📝 Modo Moderno (Sans)'}
            </button>
          </div>

          {/* ── Preview ── */}
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Preview</span>
            <div
              className={styles.previewBox}
              style={{ '--preview-accent': accentColor ?? 'var(--color-accent)' } as React.CSSProperties}
            >
              <span className={styles.previewText}>Bola de Fogo — 8d6 dano</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

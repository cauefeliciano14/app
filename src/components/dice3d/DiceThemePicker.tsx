import { useDice } from '../../context/DiceContext';
import { DICE_THEMES } from './DiceThemes';
import styles from './DiceThemePicker.module.css';

export function DiceThemePicker() {
  const { themeId, setThemeId } = useDice();

  return (
    <div className={styles.container}>
      <div className={styles.label}>TEMA DOS DADOS</div>
      <div className={styles.grid}>
        {DICE_THEMES.map(theme => (
          <button
            key={theme.id}
            className={`${styles.swatch} ${theme.id === themeId ? styles.swatchActive : ''}`}
            onClick={() => setThemeId(theme.id)}
            title={theme.label}
            style={{ background: theme.faceColor, borderColor: theme.id === themeId ? theme.numberColor : 'transparent' }}
          >
            <span style={{ color: theme.numberColor, fontSize: '0.8rem', fontWeight: 700 }}>20</span>
          </button>
        ))}
      </div>
    </div>
  );
}

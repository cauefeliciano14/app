import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

/* ── Tipos ── */
export type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  /** Tema ativo ('dark' | 'light') */
  theme: ThemeMode;
  /** Alternar entre dark e light */
  toggleTheme: () => void;
  /** Definir tema explicitamente */
  setTheme: (mode: ThemeMode) => void;
  /** Cor de destaque customizada (hex) — aplicada via --color-user-accent */
  accentColor: string | null;
  /** Aplicar nova cor de destaque (null = reset para default) */
  setAccentColor: (hex: string | null) => void;
  /** Fonte para modo clássico (serif) */
  useClassicFont: boolean;
  /** Alternar fonte clássica */
  toggleClassicFont: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ── Chaves de localStorage ── */
const LS_THEME = 'helprpg-theme';
const LS_ACCENT = 'helprpg-accent';
const LS_CLASSIC_FONT = 'helprpg-classic-font';

/* ── Leitura segura do localStorage ── */
function readLS(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLS(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* silencioso em modo privado */
  }
}

function removeLS(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* silencioso */
  }
}

/* ── Resolve tema inicial sem flash ── */
function resolveInitialTheme(): ThemeMode {
  const stored = readLS(LS_THEME);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark'; // default: Underdark
}

/* ── Provider ── */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(resolveInitialTheme);
  const [accentColor, setAccentState] = useState<string | null>(
    () => readLS(LS_ACCENT),
  );
  const [useClassicFont, setClassicFont] = useState<boolean>(
    () => readLS(LS_CLASSIC_FONT) === 'true',
  );

  /* ── Aplica data-theme no <html> ── */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    writeLS(LS_THEME, theme);
  }, [theme]);

  /* ── Aplica cor de accent customizada ── */
  useEffect(() => {
    if (accentColor) {
      document.documentElement.style.setProperty('--color-user-accent', accentColor);
      writeLS(LS_ACCENT, accentColor);
    } else {
      document.documentElement.style.removeProperty('--color-user-accent');
      removeLS(LS_ACCENT);
    }
  }, [accentColor]);

  /* ── Aplica fonte clássica ── */
  useEffect(() => {
    if (useClassicFont) {
      document.documentElement.setAttribute('data-font', 'classic');
      writeLS(LS_CLASSIC_FONT, 'true');
    } else {
      document.documentElement.removeAttribute('data-font');
      removeLS(LS_CLASSIC_FONT);
    }
  }, [useClassicFont]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
  }, []);

  const setAccentColor = useCallback((hex: string | null) => {
    setAccentState(hex);
  }, []);

  const toggleClassicFont = useCallback(() => {
    setClassicFont(prev => !prev);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      accentColor,
      setAccentColor,
      useClassicFont,
      toggleClassicFont,
    }),
    [theme, toggleTheme, setTheme, accentColor, setAccentColor, useClassicFont, toggleClassicFont],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/* ── Hook ── */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

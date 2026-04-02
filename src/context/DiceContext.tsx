import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { DieType } from '../components/dice3d/diceGeometries';

export interface DiceSpec {
  type: DieType;
  count: number;
}

export interface DiceRollRequest {
  dice: DiceSpec[];
  label: string;
  results: number[];
  total: number;
  formula: string;
}

interface DiceContextValue {
  /** Disparar uma rolagem 3D. Resultados já devem vir pré-computados — o 3D é apenas visual. */
  roll: (request: DiceRollRequest) => void;
  /** Rolagem atual (null se nenhuma ativa) */
  currentRoll: DiceRollRequest | null;
  /** Se a animação 3D terminou */
  settled: boolean;
  /** Chamado pelo DiceTray quando todos os dados pararam */
  markSettled: () => void;
  /** Fechar o dice tray */
  dismiss: () => void;
  /** Tema de dados selecionado */
  themeId: string;
  /** Alterar tema */
  setThemeId: (id: string) => void;
  /** Se WebGL está disponível */
  webglAvailable: boolean;
}

const DiceContext = createContext<DiceContextValue | null>(null);

export function useDice() {
  const ctx = useContext(DiceContext);
  if (!ctx) throw new Error('useDice must be used within DiceProvider');
  return ctx;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function DiceProvider({ children }: { children: ReactNode }) {
  const [currentRoll, setCurrentRoll] = useState<DiceRollRequest | null>(null);
  const [settled, setSettled] = useState(false);
  const [themeId, setThemeId] = useState('crimson');
  const webglAvailable = useRef(detectWebGL()).current;
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const markSettled = useCallback(() => {
    setSettled(true);
  }, []);

  const roll = useCallback((request: DiceRollRequest) => {
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    setSettled(false);
    setCurrentRoll(request);

    if (!webglAvailable) {
      // Fallback 2D: mostrar resultado após breve delay
      safetyTimer.current = setTimeout(markSettled, 800);
    } else {
      // Safety timeout: se a física não resolver em 4s, forçar settled
      safetyTimer.current = setTimeout(markSettled, 4000);
    }
  }, [webglAvailable, markSettled]);

  const dismiss = useCallback(() => {
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    setCurrentRoll(null);
    setSettled(false);
  }, []);

  return (
    <DiceContext.Provider value={{ roll, currentRoll, settled, markSettled, dismiss, themeId, setThemeId, webglAvailable }}>
      {children}
    </DiceContext.Provider>
  );
}

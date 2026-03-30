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

  const roll = useCallback((request: DiceRollRequest) => {
    setSettled(false);
    setCurrentRoll(request);

    // Se não tem WebGL, mostrar resultado após breve delay (fallback 2D)
    if (!webglAvailable) {
      setTimeout(() => setSettled(true), 800);
    }
  }, [webglAvailable]);

  const dismiss = useCallback(() => {
    setCurrentRoll(null);
    setSettled(false);
  }, []);

  // Chamado pelo DiceTray quando todos os dados pararem
  const handleAllSettled = useCallback(() => {
    setSettled(true);
  }, []);

  return (
    <DiceContext.Provider value={{ roll, currentRoll, settled, dismiss, themeId, setThemeId, webglAvailable }}>
      {children}
    </DiceContext.Provider>
  );
}

/** Hook interno para o DiceTray obter o callback de settled */
export function useDiceSettled() {
  const [, setSettled] = useState(false);
  const ctx = useContext(DiceContext);
  // Retorna o setter do contexto real via o próprio contexto
  return ctx;
}

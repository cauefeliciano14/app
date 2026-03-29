import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export function useCompletionCelebration(isValid: boolean, onCelebrate?: () => void) {
  const hasCelebrated = useRef(false);

  useEffect(() => {
    if (isValid && !hasCelebrated.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#C53131', '#d4a017', '#f0f2f5', '#a78bfa', '#22c55e'],
          disableForReducedMotion: true,
        });
      }
      onCelebrate?.();
      hasCelebrated.current = true;
    }

    if (!isValid) {
      hasCelebrated.current = false;
    }
  }, [isValid, onCelebrate]);
}

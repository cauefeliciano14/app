import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

type SoundName = 'dice-roll' | 'paper-turn' | 'success';

interface SoundContextValue {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const SOUND_STORAGE_KEY = 'dnd_sound_enabled';

const SOUND_PATHS: Record<SoundName, string> = {
  'dice-roll': '/sounds/dice-roll.mp3',
  'paper-turn': '/sounds/paper-turn.mp3',
  'success': '/sounds/success.mp3',
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem(SOUND_STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const playSound = useCallback((name: SoundName) => {
    if (!soundEnabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const path = SOUND_PATHS[name];
    if (!audioCache.current[path]) {
      audioCache.current[path] = new Audio(path);
      audioCache.current[path].preload = 'auto';
    }
    const audio = audioCache.current[path];
    audio.currentTime = 0;
    audio.play().catch(() => { /* autoplay blocked, ignore */ });
  }, [soundEnabled]);

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within <SoundProvider>');
  return ctx;
}

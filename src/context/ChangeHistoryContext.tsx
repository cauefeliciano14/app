import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

export interface ChangeEntry {
  id: string;
  timestamp: number;
  type: 'class' | 'background' | 'species' | 'attribute' | 'equipment' | 'name' | 'portrait';
  description: string;
  previous?: string;
  current?: string;
}

interface ChangeHistoryContextValue {
  entries: ChangeEntry[];
  logChange: (entry: Omit<ChangeEntry, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const ChangeHistoryContext = createContext<ChangeHistoryContextValue | null>(null);

const MAX_ENTRIES = 50;

export const ChangeHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<ChangeEntry[]>([]);
  const counterRef = useRef(0);

  const logChange = useCallback((entry: Omit<ChangeEntry, 'id' | 'timestamp'>) => {
    counterRef.current += 1;
    const newEntry: ChangeEntry = {
      ...entry,
      id: `change-${counterRef.current}`,
      timestamp: Date.now(),
    };
    setEntries(prev => [newEntry, ...prev].slice(0, MAX_ENTRIES));
  }, []);

  const clearHistory = useCallback(() => setEntries([]), []);

  return (
    <ChangeHistoryContext.Provider value={{ entries, logChange, clearHistory }}>
      {children}
    </ChangeHistoryContext.Provider>
  );
};

export function useChangeHistory(): ChangeHistoryContextValue {
  const ctx = useContext(ChangeHistoryContext);
  if (!ctx) throw new Error('useChangeHistory must be used within <ChangeHistoryProvider>');
  return ctx;
}

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { deriveSheet } from '../rules/engine/index';
import { validateChoices } from '../rules/engine/validation';
import type { CharacterChoices, BackgroundBonusDistribution } from '../rules/types/CharacterChoices';
import type { DerivedSheet } from '../rules/types/DerivedSheet';
import type { ValidationResult } from '../rules/engine/validation';
import type { CharacterPlayState } from '../types/playState';
import { DEFAULT_PLAY_STATE } from '../types/playState';
import type { Character, Selection } from '../types/character';
import { DEFAULT_CHARACTER } from '../types/character';
import { BACKGROUNDS_WITH_TOOL_SELECTOR } from '../data/backgroundToolSelectors';
import { normalizeFeatureChoices } from '../utils/characterNormalization';
import {
  loadCreationState,
  CREATION_STORAGE_KEY,
  type SavedCharacter,
  saveCharacter,
  getActiveCharacterId,
  setActiveCharacterId
} from '../utils/persistence';
import { sanitizeEquipmentState } from '../rules/utils/equipment';

import { ATTR_META } from '../utils/attributeConstants';

// ---------------------------------------------------------------------------
// ATTR_METADATA constant (re-export para backward-compat)
// ---------------------------------------------------------------------------
export const ATTR_METADATA = ATTR_META;

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------
interface CharacterContextValue {
  activeCharacterId: string | null;
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
  selectedBackground: any;
  setSelectedBackground: (bg: any) => void;
  attrChoiceMode: '' | 'triple' | 'double';
  setAttrChoiceMode: (mode: '' | 'triple' | 'double') => void;
  attrPlus1: string;
  setAttrPlus1: (val: string) => void;
  attrPlus2: string;
  setAttrPlus2: (val: string) => void;
  characterLevel: number;
  setCharacterLevel: (level: number) => void;
  playState: CharacterPlayState;
  setPlayState: React.Dispatch<React.SetStateAction<CharacterPlayState>>;
  choices: CharacterChoices;
  derivedSheet: DerivedSheet;
  validationResult: ValidationResult;
  allSelections: string[];
  stepSelections: Record<number, string>;
  handleSelect: <K extends keyof Character>(field: K, value: Character[K]) => void;
  handleSelectSpecies: (sp: any) => void;
  handleChoiceChange: (featureId: string, choiceName: string) => void;
  handleTalentSelectionChange: (talentName: string, selections: Record<string, string>) => void;
  handleResetCharacter: () => void;
  handleLoadCharacter: (saved: SavedCharacter) => void;
  handleSelectClass: (cls: Selection) => void;
  getAttributeBonus: (attr: string) => number;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CharacterContext = createContext<CharacterContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedState = React.useMemo(() => loadCreationState(), []);
  
  const initialActiveId = React.useMemo(() => getActiveCharacterId(), []);
  const [activeCharacterId, setLocalActiveCharacterId] = useState<string | null>(initialActiveId);

  const updateActiveCharacterId = useCallback((id: string | null) => {
    setLocalActiveCharacterId(id);
    setActiveCharacterId(id);
  }, []);

  const [character, setCharacter] = useState<Character>(savedState?.character ?? DEFAULT_CHARACTER);
  const [selectedBackground, setSelectedBackground] = useState<any>(savedState?.auxiliaryState?.selectedBackground ?? null);
  const [attrChoiceMode, setAttrChoiceMode] = useState<'' | 'triple' | 'double'>(savedState?.auxiliaryState?.attrChoiceMode ?? '');
  const [attrPlus1, setAttrPlus1] = useState(savedState?.auxiliaryState?.attrPlus1 ?? '');
  const [attrPlus2, setAttrPlus2] = useState(savedState?.auxiliaryState?.attrPlus2 ?? '');
  const [characterLevel, setCharacterLevel] = useState(savedState?.auxiliaryState?.characterLevel ?? 1);
  const [playState, setPlayState] = useState<CharacterPlayState>(() => {
    try {
      const saved = localStorage.getItem('dnd_play_state');
      return saved ? (JSON.parse(saved) as CharacterPlayState) : DEFAULT_PLAY_STATE;
    } catch {
      return DEFAULT_PLAY_STATE;
    }
  });

  // -------------------------------------------------------------------------
  // Undo / Redo
  // -------------------------------------------------------------------------
  const MAX_UNDO = 30;
  const undoStack = useRef<Character[]>([]);
  const redoStack = useRef<Character[]>([]);
  const isUndoRedoAction = useRef(false);
  const prevCharRef = useRef<Character>(character);

  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      prevCharRef.current = character;
      return;
    }
    if (prevCharRef.current !== character) {
      undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), prevCharRef.current];
      redoStack.current = [];
      prevCharRef.current = character;
    }
  }, [character]);

  const [, forceRender] = useState(0);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    redoStack.current = [...redoStack.current, character];
    isUndoRedoAction.current = true;
    setCharacter(prev);
    forceRender(n => n + 1);
  }, [character, setCharacter]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current[redoStack.current.length - 1];
    redoStack.current = redoStack.current.slice(0, -1);
    undoStack.current = [...undoStack.current, character];
    isUndoRedoAction.current = true;
    setCharacter(next);
    forceRender(n => n + 1);
  }, [character, setCharacter]);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  // Ctrl+Z / Ctrl+Shift+Z global shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [undo, redo]);

  // -------------------------------------------------------------------------
  // Derived memos
  // -------------------------------------------------------------------------
  const choices = React.useMemo((): CharacterChoices => {
    let backgroundBonusDistribution: BackgroundBonusDistribution | null = null;
    if (selectedBackground && attrChoiceMode) {
      if (attrChoiceMode === 'triple') {
        const dist: Partial<Record<string, number>> = {};
        for (const attr of (selectedBackground.attributeValues as string[])) {
          dist[attr] = 1;
        }
        backgroundBonusDistribution = { mode: '+1/+1/+1', distribution: dist };
      } else if (attrChoiceMode === 'double' && attrPlus1 && attrPlus2) {
        backgroundBonusDistribution = {
          mode: '+2/+1',
          distribution: { [attrPlus2]: 2, [attrPlus1]: 1 },
        };
      }
    }

    const classId = character.characterClass?.id ?? null;
    const backgroundId = selectedBackground?.id ?? null;
    const speciesId = character.species?.id ?? null;
    const featureChoicesNormalized = normalizeFeatureChoices(character.choices, classId, speciesId, backgroundId);

    let speciesChoicesNormalized: Record<string, string> | undefined;
    if (speciesId) {
      const result: Record<string, string> = {};
      const prefix = `${speciesId}-`;
      for (const [key, value] of Object.entries(featureChoicesNormalized)) {
        if (key.startsWith(prefix)) {
          result[key.slice(prefix.length)] = value;
        }
      }
      if (Object.keys(result).length > 0) speciesChoicesNormalized = result;
    }

    const backgroundChoicesNormalized = backgroundId && BACKGROUNDS_WITH_TOOL_SELECTOR.has(backgroundId)
      ? { toolProficiency: featureChoicesNormalized.toolProficiency || undefined }
      : undefined;

    return {
      classId,
      backgroundId,
      speciesId,
      speciesLineage: speciesId ? featureChoicesNormalized[speciesId] ?? undefined : undefined,
      speciesChoices: speciesChoicesNormalized,
      attributeMethod: character.attributes.method,
      baseAttributes: character.attributes.base as CharacterChoices['baseAttributes'],
      backgroundBonusDistribution,
      equippedArmorId: character.equipment.equippedArmorId ?? undefined,
      hasShield: character.equipment.hasShieldEquipped,
      backgroundChoices: backgroundChoicesNormalized,
      equipmentChoices: {
        classOption: character.equipment.classOption,
        backgroundOption: character.equipment.backgroundOption,
      },
      inventory: character.equipment.inventory.map((item: any) => ({
        name: item.name as string,
        quantity: item.quantity as number | undefined,
        source: item.source as string | undefined,
        isStartingGear: item.isStartingGear as boolean | undefined,
      })),
      inventoryWeapons: character.equipment.inventory.map((item: any) => item.name as string),
      spellSelections: {
        cantrips: character.spells.learnedCantrips,
        prepared: character.spells.preparedSpells,
      },
      talentSelections: character.talentSelections,
      languageSelections: character.languages,
      featureChoices: featureChoicesNormalized,
      characterDetails: { name: character.name, portrait: character.portrait },
      level: characterLevel,
      classLevels: character.classLevels && character.classLevels.length > 0
        ? character.classLevels
        : classId ? [{ classId, className: character.characterClass?.name ?? '', level: characterLevel }] : undefined,
    };
  }, [
    character.characterClass,
    character.classLevels,
    character.species,
    character.attributes,
    character.equipment,
    character.spells,
    character.talentSelections,
    character.languages,
    character.choices,
    character.name,
    character.portrait,
    selectedBackground,
    attrChoiceMode,
    attrPlus1,
    attrPlus2,
    characterLevel,
  ]);

  const derivedSheet = React.useMemo(
    () => deriveSheet(choices, playState.expertiseSkills ?? [], playState.attunedItemIds ?? []),
    [choices, playState.expertiseSkills, playState.attunedItemIds]
  );
  const validationResult = React.useMemo(() => validateChoices(choices), [choices]);

  const allSelections = React.useMemo(() => {
    const baseChoices = Object.values(character.choices);
    const talentChoices = Object.values(character.talentSelections).flatMap(s => Object.values(s));
    const bgSkills = selectedBackground?.skillProficiencies || [];

    return [
      ...baseChoices,
      ...talentChoices,
      ...bgSkills,
      ...character.languages
    ].filter(Boolean) as string[];
  }, [character.choices, character.talentSelections, selectedBackground, character.languages]);

  const stepSelections: Record<number, string> = React.useMemo(() => {
    const s: Record<number, string> = {};
    if (character.characterClass?.name) s[1] = character.characterClass.name;
    if (selectedBackground?.name) s[2] = selectedBackground.name;
    if (character.species?.name) s[3] = character.species.name;
    return s;
  }, [character.characterClass, selectedBackground, character.species]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const getAttributeBonus = useCallback((attr: string) => {
    let bonus = 0;
    if (attrChoiceMode === 'triple') {
      if (selectedBackground?.attributeValues.includes(attr)) bonus += 1;
    } else if (attrChoiceMode === 'double') {
      if (attr === attrPlus1) bonus += 1;
      if (attr === attrPlus2) bonus += 2;
    }
    return bonus;
  }, [attrChoiceMode, selectedBackground, attrPlus1, attrPlus2]);

  const handleSelect = useCallback(<K extends keyof Character>(field: K, value: Character[K]) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectSpecies = useCallback((sp: any) => {
    setCharacter(prev => {
      const prevId = prev.species?.id;
      const newChoices = { ...prev.choices };
      if (prevId) {
        Object.keys(newChoices).forEach(key => {
          if (key === prevId || key.startsWith(prevId + '-')) delete newChoices[key];
        });
      }
      const autoLangs = prev.languages.filter(l => ['common', 'thieves-cant', 'druidic'].includes(l));
      return { ...prev, species: sp, choices: newChoices, languages: autoLangs };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleChoiceChange = useCallback((featureId: string, choiceName: string) => {
    setCharacter(prev => ({
      ...prev,
      choices: {
        ...prev.choices,
        [featureId]: choiceName
      }
    }));
  }, []);

  const handleTalentSelectionChange = useCallback((talentName: string, selections: Record<string, string>) => {
    setCharacter(prev => ({
      ...prev,
      talentSelections: {
        ...prev.talentSelections,
        [talentName]: selections
      }
    }));
  }, []);

  const handleSelectClass = useCallback((cls: Selection) => {
    handleSelect('characterClass', cls);
  }, [handleSelect]);

  const handleResetCharacter = useCallback(() => {
    setCharacter(DEFAULT_CHARACTER);
    setSelectedBackground(null);
    setAttrChoiceMode('');
    setAttrPlus1('');
    setAttrPlus2('');
    setCharacterLevel(1);
    setPlayState(DEFAULT_PLAY_STATE);
    updateActiveCharacterId(null);
    localStorage.removeItem(CREATION_STORAGE_KEY);
    localStorage.removeItem('dnd_play_state');
  }, [updateActiveCharacterId]);

  const handleLoadCharacter = useCallback((saved: SavedCharacter) => {
    updateActiveCharacterId(saved.id);
    if (saved.creationSnapshot) {
      const snap = saved.creationSnapshot;
      setCharacter(snap.character ?? DEFAULT_CHARACTER);
      const aux = snap.auxiliaryState ?? {};
      setSelectedBackground(aux.selectedBackground ?? null);
      setAttrChoiceMode(aux.attrChoiceMode ?? '');
      setAttrPlus1(aux.attrPlus1 ?? '');
      setAttrPlus2(aux.attrPlus2 ?? '');
      setCharacterLevel(aux.characterLevel ?? 1);
      // Persist to localStorage so engine picks it up
      localStorage.setItem(CREATION_STORAGE_KEY, JSON.stringify({ ...snap, version: 1 }));
    }
    if (saved.playState) {
      setPlayState(saved.playState);
      localStorage.setItem('dnd_play_state', JSON.stringify(saved.playState));
    }
  }, [updateActiveCharacterId]);

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  // Persist playState to localStorage
  useEffect(() => {
    localStorage.setItem('dnd_play_state', JSON.stringify(playState));
  }, [playState]);


  useEffect(() => {
    setCharacter(prev => {
      const nextEquipment = sanitizeEquipmentState(prev.equipment);
      return nextEquipment === prev.equipment ? prev : { ...prev, equipment: nextEquipment };
    });
  }, [character.equipment.inventory, character.equipment.equippedArmorId, character.equipment.hasShieldEquipped]);

  // Automatic Languages (Ladino -> Giria dos Ladroes, Druida -> Druidico)
  useEffect(() => {
    const classId = character.characterClass?.id;
    const autoLangs: string[] = [];
    if (classId === 'ladino') autoLangs.push('thieves-cant');
    if (classId === 'druida') autoLangs.push('druidic');

    setCharacter(prev => {
      const currentAutoLangs = prev.languages.filter(l => l === 'thieves-cant' || l === 'druidic');
      const needsUpdate = autoLangs.some(l => !prev.languages.includes(l)) ||
                          currentAutoLangs.some(l => !autoLangs.includes(l));

      if (!needsUpdate) return prev;

      const baseLangs = prev.languages.filter(l => l !== 'thieves-cant' && l !== 'druidic');
      return { ...prev, languages: [...new Set([...baseLangs, ...autoLangs])] };
    });
  }, [character.characterClass?.id]);

  // -------------------------------------------------------------------------
  // Auto-Generate ID for new characters
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!activeCharacterId && character.characterClass) {
      updateActiveCharacterId(crypto.randomUUID());
    }
  }, [activeCharacterId, character.characterClass, updateActiveCharacterId]);

  // -------------------------------------------------------------------------
  // Auto-Save character to multi-character storage
  // -------------------------------------------------------------------------
  useEffect(() => {
    // We only auto-save if an ID is active
    if (!activeCharacterId) return;

    // Throttle slightly if needed, but for now we'll just save on every typical character state change
    const name = character.name || 'Herói sem Nome';
    const classNameStr = character.characterClass?.name || 'Aventureiro';
    const speciesNameStr = character.species?.name || 'Convidado';

    const saved: SavedCharacter = {
      id: activeCharacterId,
      name,
      className: classNameStr,
      speciesName: speciesNameStr,
      level: characterLevel,
      portrait: character.portrait,
      savedAt: Date.now(),
      creationSnapshot: {
        character,
        currentStep: 0, // Currently step is pushed from WizardContext, but we fallback
        auxiliaryState: {
          selectedBackground,
          attrChoiceMode,
          attrPlus1,
          attrPlus2,
        }
      },
      playState: playState
    };

    saveCharacter(saved);
  }, [
    activeCharacterId,
    character,
    characterLevel,
    selectedBackground,
    attrChoiceMode,
    attrPlus1,
    attrPlus2,
    playState
  ]);

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------
  const value: CharacterContextValue = React.useMemo(() => ({
    activeCharacterId,
    character,
    setCharacter,
    selectedBackground,
    setSelectedBackground,
    attrChoiceMode,
    setAttrChoiceMode,
    attrPlus1,
    setAttrPlus1,
    attrPlus2,
    setAttrPlus2,
    characterLevel,
    setCharacterLevel,
    playState,
    setPlayState,
    choices,
    derivedSheet,
    validationResult,
    allSelections,
    stepSelections,
    handleSelect,
    handleSelectSpecies,
    handleChoiceChange,
    handleTalentSelectionChange,
    handleResetCharacter,
    handleLoadCharacter,
    handleSelectClass,
    getAttributeBonus,
    undo,
    redo,
    canUndo,
    canRedo,
  }), [
    activeCharacterId, character, selectedBackground, attrChoiceMode, attrPlus1, attrPlus2,
    characterLevel, playState, choices, derivedSheet, validationResult,
    allSelections, stepSelections, handleSelect, handleSelectSpecies,
    handleChoiceChange, handleTalentSelectionChange, handleResetCharacter,
    handleLoadCharacter, handleSelectClass, getAttributeBonus,
    undo, redo, canUndo, canRedo
  ]);

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useCharacter(): CharacterContextValue {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error('useCharacter must be used within a <CharacterProvider>');
  }
  return ctx;
}

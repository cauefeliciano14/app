import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { loadCreationState, CREATION_STORAGE_KEY } from '../utils/persistence';

// ---------------------------------------------------------------------------
// ATTR_METADATA constant
// ---------------------------------------------------------------------------
export const ATTR_METADATA: Record<string, { full: string; desc: string }> = {
  forca: { full: 'Força', desc: 'Poder físico e força bruta.' },
  destreza: { full: 'Destreza', desc: 'Agilidade, reflexos e equilíbrio.' },
  constituicao: { full: 'Constituição', desc: 'Resistência, saúde e vitalidade.' },
  inteligencia: { full: 'Inteligência', desc: 'Raciocínio, memória e conhecimento.' },
  sabedoria: { full: 'Sabedoria', desc: 'Percepção, intuição e sintonização.' },
  carisma: { full: 'Carisma', desc: 'Personalidade, influência e persuasão.' },
};

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------
interface CharacterContextValue {
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
  handleSelectClass: (cls: Selection) => void;
  getAttributeBonus: (attr: string) => number;
}

const CharacterContext = createContext<CharacterContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedState = React.useMemo(() => loadCreationState(), []);

  const [character, setCharacter] = useState<Character>(savedState?.character ?? DEFAULT_CHARACTER);
  const [selectedBackground, setSelectedBackground] = useState<any>(savedState?.auxiliaryState?.selectedBackground ?? null);
  const [attrChoiceMode, setAttrChoiceMode] = useState<'' | 'triple' | 'double'>(savedState?.auxiliaryState?.attrChoiceMode ?? '');
  const [attrPlus1, setAttrPlus1] = useState(savedState?.auxiliaryState?.attrPlus1 ?? '');
  const [attrPlus2, setAttrPlus2] = useState(savedState?.auxiliaryState?.attrPlus2 ?? '');
  const [characterLevel, setCharacterLevel] = useState(1);
  const [playState, setPlayState] = useState<CharacterPlayState>(() => {
    try {
      const saved = localStorage.getItem('dnd_play_state');
      return saved ? (JSON.parse(saved) as CharacterPlayState) : DEFAULT_PLAY_STATE;
    } catch {
      return DEFAULT_PLAY_STATE;
    }
  });

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
    };
  }, [
    character.characterClass,
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

  const derivedSheet = React.useMemo(() => deriveSheet(choices), [choices]);
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

  const stepSelections: Record<number, string> = {};
  if (character.characterClass?.name) stepSelections[1] = character.characterClass.name;
  if (selectedBackground?.name) stepSelections[2] = selectedBackground.name;
  if (character.species?.name) stepSelections[3] = character.species.name;

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const getAttributeBonus = (attr: string) => {
    let bonus = 0;
    if (attrChoiceMode === 'triple') {
      if (selectedBackground?.attributeValues.includes(attr)) bonus += 1;
    } else if (attrChoiceMode === 'double') {
      if (attr === attrPlus1) bonus += 1;
      if (attr === attrPlus2) bonus += 2;
    }
    return bonus;
  };

  const handleSelect = <K extends keyof Character>(field: K, value: Character[K]) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSpecies = (sp: any) => {
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
  };

  const handleChoiceChange = (featureId: string, choiceName: string) => {
    setCharacter(prev => ({
      ...prev,
      choices: {
        ...prev.choices,
        [featureId]: choiceName
      }
    }));
  };

  const handleTalentSelectionChange = (talentName: string, selections: Record<string, string>) => {
    setCharacter(prev => ({
      ...prev,
      talentSelections: {
        ...prev.talentSelections,
        [talentName]: selections
      }
    }));
  };

  const handleSelectClass = (cls: Selection) => {
    handleSelect('characterClass', cls);
  };

  const handleResetCharacter = () => {
    setCharacter(DEFAULT_CHARACTER);
    setSelectedBackground(null);
    setAttrChoiceMode('');
    setAttrPlus1('');
    setAttrPlus2('');
    setPlayState(DEFAULT_PLAY_STATE);
    localStorage.removeItem(CREATION_STORAGE_KEY);
    localStorage.removeItem('dnd_play_state');
  };

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  // Persist playState to localStorage
  useEffect(() => {
    localStorage.setItem('dnd_play_state', JSON.stringify(playState));
  }, [playState]);

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
  // Context value
  // -------------------------------------------------------------------------
  const value: CharacterContextValue = {
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
    handleSelectClass,
    getAttributeBonus,
  };

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

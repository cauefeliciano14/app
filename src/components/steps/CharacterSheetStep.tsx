import React, { useMemo } from 'react';
import classDetailsData from '../../data/classDetails.json';
import { CharacterSheetPage } from '../sheet/CharacterSheetPage';
import { CharacterManager } from '../CharacterManager';
import { StepLayout } from './StepLayout';
import { getSpeciesTraits, getSpeciesName } from '../../rules/data/speciesRules';
import { ITEM_COST_MAP } from '../../data/itemCostMap';
import { useCharacter } from '../../context/CharacterContext';
import { useWizard } from '../../context/WizardContext';
import type { CharacterIdentityUpdate } from '../../types/character';
import type { ClassLevel } from '../../types/multiclass';

export const CharacterSheetStep: React.FC = () => {
  const {
    character,
    setCharacter,
    characterLevel,
    setCharacterLevel,
    derivedSheet,
    playState,
    setPlayState,
    selectedBackground,
    validationResult,
    handleResetCharacter,
    handleLoadCharacter,
  } = useCharacter();

  const handleUpdateIdentity = (update: CharacterIdentityUpdate) => {
    setCharacter(prev => ({
      ...prev,
      ...(update.alignment !== undefined ? { alignment: update.alignment } : {}),
      ...(update.faith !== undefined ? { faith: update.faith } : {}),
      ...(update.lifestyle !== undefined ? { lifestyle: update.lifestyle } : {}),
      ...(update.backstory !== undefined ? { backstory: update.backstory } : {}),
      ...(update.organizations !== undefined ? { organizations: update.organizations } : {}),
      ...(update.appearance !== undefined ? { appearance: { ...prev.appearance, ...update.appearance } } : {}),
      ...(update.personalityTraits !== undefined ? { personalityTraits: { ...prev.personalityTraits, ...update.personalityTraits } } : {}),
    }));
  };

  const {
    setCurrentStep,
    setIsPortraitModalOpen,
  } = useWizard();

  const validationErrors = validationResult.errors;

  const handleFullReset = () => {
    handleResetCharacter();
    setCurrentStep(0);
  };

  const subclassName = character.choices[(character.characterClass?.id ?? '') + '-subclasse'] as string | undefined;

  // Derive classLevels (backwards compat: single class if field absent)
  const classLevels: ClassLevel[] = useMemo(() => {
    if (character.classLevels && character.classLevels.length > 0) {
      return character.classLevels;
    }
    if (character.characterClass?.id) {
      return [{ classId: character.characterClass.id, className: character.characterClass.name, level: characterLevel }];
    }
    return [];
  }, [character.classLevels, character.characterClass, characterLevel]);

  // Merge classFeatures from ALL classes (for multiclass)
  const classFeatures: Array<{ level: number; name: string; description: string }> = useMemo(() => {
    const features: Array<{ level: number; name: string; description: string }> = [];
    for (const cl of classLevels) {
      const details = classDetailsData[cl.classId as keyof typeof classDetailsData] as any;
      if (!details?.features) continue;
      for (const f of details.features) {
        features.push({
          level: f.level ?? 1,
          name: f.name ?? '',
          description: typeof f.description === 'string'
            ? f.description.replace(/<[^>]+>/g, '')
            : '',
        });
      }
    }
    return features;
  }, [classLevels]);

  const handleAddClass = (classId: string, className: string) => {
    const existing = character.classLevels && character.classLevels.length > 0
      ? character.classLevels
      : character.characterClass?.id
        ? [{ classId: character.characterClass.id, className: character.characterClass.name, level: characterLevel }]
        : [];
    const updated = [...existing, { classId, className, level: 1 }];
    setCharacter(prev => ({ ...prev, classLevels: updated }));
    // Total level increases by 1
    setCharacterLevel(characterLevel + 1);
  };

  const handleLevelUpClass = (levelUpClassId: string) => {
    // Increment the specific class's level within classLevels
    const existing = character.classLevels && character.classLevels.length > 0
      ? character.classLevels
      : character.characterClass?.id
        ? [{ classId: character.characterClass.id, className: character.characterClass.name, level: characterLevel }]
        : [];
    const updated = existing.map(cl =>
      cl.classId === levelUpClassId ? { ...cl, level: cl.level + 1 } : cl
    );
    setCharacter(prev => ({ ...prev, classLevels: updated }));
    // Note: total level (setCharacterLevel) is handled by CharacterSheetPage's onSetLevel
  };
  const speciesId = character.species?.id ?? '';
  const speciesTraits = getSpeciesTraits(speciesId);
  const speciesName = character.species?.name ?? getSpeciesName(speciesId);
  const bgSkillsRaw: string[] = selectedBackground?.skillProficiencies ?? [];
  const bgSkills = bgSkillsRaw.map((s: string) => s.replace(/\s*\([^)]*\)/g, '').trim());

  const handleUpdateCurrency = (currency: { cp: number; sp: number; ep: number; gp: number; pp: number }) => {
    setCharacter(prev => ({
      ...prev,
      equipment: { ...prev.equipment, currency },
    }));
  };

  return (
    <StepLayout
      onPrev={() => setCurrentStep(4)}
      onNext={() => {}}
      canAdvance={false}
      characterName={character.name}
      setCharacterName={(n: string) => setCharacter(prev => ({ ...prev, name: n }))}
      portrait={character.portrait}
      onPortraitClick={() => setIsPortraitModalOpen(true)}
      errors={validationErrors}
      isResetMode={true}
      onReset={handleFullReset}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <CharacterManager
          currentCharacter={{
            name: character.name,
            className: character.characterClass?.name ?? '',
            speciesName,
            level: characterLevel,
            portrait: character.portrait,
          }}
          onSaveCurrent={() => {}}
          onLoadCharacter={saved => { handleLoadCharacter(saved); }}
          onNewCharacter={handleFullReset}
        />
      </div>
      <CharacterSheetPage
        characterName={character.name}
        portrait={character.portrait}
        speciesName={speciesName}
        className={character.characterClass?.name ?? ''}
        characterLevel={characterLevel}
        derivedSheet={derivedSheet}
        playState={playState}
        onUpdatePlayState={setPlayState}
        classFeatures={classFeatures}
        speciesTraits={speciesTraits}
        inventory={character.equipment.inventory.map((item: any) => ({
          ...item,
          cost: item.cost ?? ITEM_COST_MAP.get(item.name),
        }))}
        learnedCantrips={character.spells.learnedCantrips}
        preparedSpells={character.spells.preparedSpells}
        onUpdatePreparedSpells={spells => setCharacter(prev => ({ ...prev, spells: { ...prev.spells, preparedSpells: spells } }))}
        backgroundName={selectedBackground?.name}
        backgroundDescription={selectedBackground?.description}
        backgroundSkills={bgSkills}
        backgroundTool={selectedBackground?.toolProficiency}
        backgroundEquipment={selectedBackground?.equipment}
        equippedArmorId={character.equipment.equippedArmorId}
        hasShieldEquipped={character.equipment.hasShieldEquipped}
        onEquipArmor={(armorId) => setCharacter(prev => ({ ...prev, equipment: { ...prev.equipment, equippedArmorId: armorId } }))}
        onEquipShield={(equipped) => setCharacter(prev => ({ ...prev, equipment: { ...prev.equipment, hasShieldEquipped: equipped } }))}
        alignment={character.alignment}
        currency={character.equipment.currency}
        onUpdateCurrency={handleUpdateCurrency}
        backstory={character.backstory}
        appearance={character.appearance}
        personalityTraits={character.personalityTraits}
        faith={character.faith}
        lifestyle={character.lifestyle}
        organizations={character.organizations}
        onUpdateIdentity={handleUpdateIdentity}
        onSetLevel={setCharacterLevel}
        classId={character.characterClass?.id}
        subclassName={subclassName}
        classLevels={classLevels}
        onAddClass={handleAddClass}
        onLevelUpClass={handleLevelUpClass}
      />
    </StepLayout>
  );
};

import React from 'react';
import classDetailsData from '../../data/classDetails.json';
import { CharacterSheetPage } from '../sheet/CharacterSheetPage';
import { StepLayout } from './StepLayout';
import { getSpeciesTraits, getSpeciesName } from '../../rules/data/speciesRules';
import { ITEM_COST_MAP } from '../../data/itemCostMap';
import { useCharacter } from '../../context/CharacterContext';
import { useWizard } from '../../context/WizardContext';

export const CharacterSheetStep: React.FC = () => {
  const {
    character,
    setCharacter,
    characterLevel,
    derivedSheet,
    playState,
    setPlayState,
    selectedBackground,
    stepSelections,
    validationResult,
  } = useCharacter();

  const {
    setCurrentStep,
    setIsPortraitModalOpen,
  } = useWizard();

  const validationErrors = validationResult.errors;

  const classDetails = classDetailsData[character.characterClass?.id as keyof typeof classDetailsData] as any;
  const classFeatures: Array<{ level: number; name: string; description: string }> =
    (classDetails?.features ?? []).map((f: any) => ({
      level: f.level ?? 1,
      name: f.name ?? '',
      description: typeof f.description === 'string'
        ? f.description.replace(/<[^>]+>/g, '')
        : '',
    }));
  const speciesId = character.species?.id ?? '';
  const speciesTraits = getSpeciesTraits(speciesId);
  const speciesName = character.species?.name ?? getSpeciesName(speciesId);
  const bgSkillsRaw: string[] = selectedBackground?.skillProficiencies ?? [];
  const bgSkills = bgSkillsRaw.map((s: string) => s.replace(/\s*\([^)]*\)/g, '').trim());

  return (
    <StepLayout
      onPrev={() => setCurrentStep(4)}
      onNext={() => {}}
      canAdvance={false}
      activeStep={6}
      onStepClick={setCurrentStep}
      characterName={character.name}
      setCharacterName={(n: string) => setCharacter(prev => ({ ...prev, name: n }))}
      portrait={character.portrait}
      onPortraitClick={() => setIsPortraitModalOpen(true)}
      selections={stepSelections}
      errors={validationErrors}
    >
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
        backgroundName={selectedBackground?.name}
        backgroundDescription={selectedBackground?.description}
        backgroundSkills={bgSkills}
        backgroundTool={selectedBackground?.toolProficiency}
        backgroundEquipment={selectedBackground?.equipment}
        equippedArmorId={character.equipment.equippedArmorId}
        hasShieldEquipped={character.equipment.hasShieldEquipped}
        onEquipArmor={(armorId) => setCharacter(prev => ({ ...prev, equipment: { ...prev.equipment, equippedArmorId: armorId } }))}
        onEquipShield={(equipped) => setCharacter(prev => ({ ...prev, equipment: { ...prev.equipment, hasShieldEquipped: equipped } }))}
      />
    </StepLayout>
  );
};

import type { CSSProperties } from 'react';
import type { DerivedSheet } from '../../rules/types/DerivedSheet';
import type { CharacterPlayState } from '../../types/playState';
import { SheetHeader } from './SheetHeader';
import { AbilityScoreCards } from './AbilityScoreCards';
import { QuickStatsRow } from './QuickStatsRow';
import { SavingThrowsCard } from './SavingThrowsCard';
import { SensesCard } from './SensesCard';
import { ProficienciesCard } from './ProficienciesCard';
import { SkillsCard } from './SkillsCard';
import { ConditionsCard } from './ConditionsCard';
import { DefensesCard } from './DefensesCard';
import { SheetTabs } from './SheetTabs';

interface Feature { level: number; name: string; description: string }
interface Trait { title: string; description: string }
interface InventoryItem { name: string; quantity?: number; notes?: string; cost?: string }

interface CharacterSheetPageProps {
  // Identity
  characterName: string;
  portrait: string | null;
  speciesName: string;
  className: string;
  characterLevel: number;

  // Derived data
  derivedSheet: DerivedSheet;

  // Live session state
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;

  // Navigation
  onGoToEquipment: () => void;
  onGoToSpells: () => void;

  // Raw character data for features/background/inventory tabs
  classFeatures: Feature[];
  speciesTraits: Trait[];
  inventory: InventoryItem[];
  learnedCantrips: string[];
  preparedSpells: string[];

  // Background details
  backgroundName?: string;
  backgroundDescription?: string;
  backgroundSkills?: string[];
  backgroundTool?: string;
  backgroundEquipment?: string;

  // Armor/shield equip state
  equippedArmorId?: string | null;
  hasShieldEquipped?: boolean;
  onEquipArmor?: (armorId: string | null) => void;
  onEquipShield?: (equipped: boolean) => void;
}

const pageGridStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const topRowGridStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
  alignItems: 'start',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
};

const abilityScoreCellStyle: CSSProperties = {
  minWidth: 0,
  gridColumn: 'span 2',
};

const sideColumnStackStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
  alignContent: 'start',
  minWidth: 0,
};

const secondaryRowGridStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
  alignItems: 'start',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
};

export function CharacterSheetPage({
  characterName,
  portrait,
  speciesName,
  className,
  characterLevel,
  derivedSheet,
  playState,
  onUpdatePlayState,
  onGoToEquipment,
  onGoToSpells,
  classFeatures,
  speciesTraits,
  inventory,
  learnedCantrips,
  preparedSpells,
  backgroundName,
  backgroundDescription,
  backgroundSkills,
  backgroundTool,
  backgroundEquipment,
  equippedArmorId,
  hasShieldEquipped,
  onEquipArmor,
  onEquipShield,
}: CharacterSheetPageProps) {
  const handleAddCondition = (condition: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      activeConditions: prev.activeConditions.includes(condition)
        ? prev.activeConditions
        : [...prev.activeConditions, condition],
    }));
  };

  const handleRemoveCondition = (condition: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      activeConditions: prev.activeConditions.filter(c => c !== condition),
    }));
  };

  const handleAddDefense = (defense: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      activeDefenses: prev.activeDefenses.includes(defense)
        ? prev.activeDefenses
        : [...prev.activeDefenses, defense],
    }));
  };

  const handleRemoveDefense = (defense: string) => {
    onUpdatePlayState(prev => ({
      ...prev,
      activeDefenses: prev.activeDefenses.filter(d => d !== defense),
    }));
  };

  return (
    <div style={pageGridStyle}>
      {/* Row 1: Header | Ability Scores | Quick Stats */}
      <div style={topRowGridStyle}>
        <div style={{ minWidth: 0 }}>
          <SheetHeader
            name={characterName}
            portrait={portrait}
            speciesName={speciesName}
            className={className}
            level={characterLevel}
          />
        </div>
        <div style={abilityScoreCellStyle}>
          <AbilityScoreCards
            finalAttributes={derivedSheet.finalAttributes}
            modifiers={derivedSheet.modifiers}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <QuickStatsRow
            derivedSheet={derivedSheet}
            playState={playState}
            onUpdatePlayState={onUpdatePlayState}
          />
        </div>
      </div>

      {/* Row 2: Left column | Skills | Right column */}
      <div style={secondaryRowGridStyle}>
        {/* Left: Saving Throws + Senses + Proficiencies */}
        <div style={sideColumnStackStyle}>
          <SavingThrowsCard derivedSavingThrows={derivedSheet.derivedSavingThrows} />
          <SensesCard
            passivePerception={derivedSheet.passivePerception}
            passiveInvestigation={derivedSheet.passiveInvestigation}
            passiveInsight={derivedSheet.passiveInsight}
            specialSenses={derivedSheet.specialSenses}
          />
          <ProficienciesCard
            skillProficiencies={derivedSheet.skillProficiencies}
            armorProficiencies={derivedSheet.armorProficiencies}
            weaponProficiencies={derivedSheet.weaponProficiencies}
            toolProficiencies={derivedSheet.toolProficiencies}
            languages={derivedSheet.languages}
          />
        </div>

        {/* Center: Skills */}
        <div style={{ minWidth: 0 }}>
          <SkillsCard skills={derivedSheet.skills} />
        </div>

        {/* Right: Conditions + Defenses */}
        <div style={sideColumnStackStyle}>
          <ConditionsCard
            activeConditions={playState.activeConditions}
            onAdd={handleAddCondition}
            onRemove={handleRemoveCondition}
          />
          <DefensesCard
            derivedDefenses={derivedSheet.derivedDefenses}
            activeDefenses={playState.activeDefenses}
            onAdd={handleAddDefense}
            onRemove={handleRemoveDefense}
          />
        </div>
      </div>

      {/* Row 3: Tabs */}
      <div style={{
        background: 'rgba(17,18,24,0.4)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '16px',
      }}>
        <SheetTabs
          derivedSheet={derivedSheet}
          playState={playState}
          onUpdatePlayState={onUpdatePlayState}
          onGoToEquipment={onGoToEquipment}
          onGoToSpells={onGoToSpells}
          classFeatures={classFeatures}
          speciesTraits={speciesTraits}
          inventory={inventory}
          learnedCantrips={learnedCantrips}
          preparedSpells={preparedSpells}
          characterLevel={characterLevel}
          backgroundName={backgroundName}
          backgroundDescription={backgroundDescription}
          backgroundSkills={backgroundSkills}
          backgroundTool={backgroundTool}
          backgroundEquipment={backgroundEquipment}
          equippedArmorId={equippedArmorId}
          hasShieldEquipped={hasShieldEquipped}
          onEquipArmor={onEquipArmor}
          onEquipShield={onEquipShield}
        />
      </div>
    </div>
  );
}

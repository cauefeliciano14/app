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
import styles from './CharacterSheetPage.module.css';

interface Feature { level: number; name: string; description: string }
interface Trait { title: string; description: string }
interface InventoryItem { name: string; quantity?: number; notes?: string; cost?: string }

interface CharacterSheetPageProps {
  characterName: string;
  portrait: string | null;
  speciesName: string;
  className: string;
  characterLevel: number;
  derivedSheet: DerivedSheet;
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
  classFeatures: Feature[];
  speciesTraits: Trait[];
  inventory: InventoryItem[];
  learnedCantrips: string[];
  preparedSpells: string[];
  backgroundName?: string;
  backgroundDescription?: string;
  backgroundSkills?: string[];
  backgroundTool?: string;
  backgroundEquipment?: string;
  equippedArmorId?: string | null;
  hasShieldEquipped?: boolean;
  onEquipArmor?: (armorId: string | null) => void;
  onEquipShield?: (equipped: boolean) => void;
}

export function CharacterSheetPage({
  characterName,
  portrait,
  speciesName,
  className,
  characterLevel,
  derivedSheet,
  playState,
  onUpdatePlayState,
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
    onUpdatePlayState((prev) => ({
      ...prev,
      activeConditions: prev.activeConditions.includes(condition)
        ? prev.activeConditions
        : [...prev.activeConditions, condition],
    }));
  };

  const handleRemoveCondition = (condition: string) => {
    onUpdatePlayState((prev) => ({
      ...prev,
      activeConditions: prev.activeConditions.filter((c) => c !== condition),
    }));
  };

  const handleAddDefense = (defense: string) => {
    onUpdatePlayState((prev) => ({
      ...prev,
      activeDefenses: prev.activeDefenses.includes(defense)
        ? prev.activeDefenses
        : [...prev.activeDefenses, defense],
    }));
  };

  const handleRemoveDefense = (defense: string) => {
    onUpdatePlayState((prev) => ({
      ...prev,
      activeDefenses: prev.activeDefenses.filter((d) => d !== defense),
    }));
  };

  return (
    <div className={styles.page}>
      <section className={styles.heroGrid}>
        <div className={styles.heroIdentity}>
          <SheetHeader
            name={characterName}
            portrait={portrait}
            speciesName={speciesName}
            className={className}
            level={characterLevel}
          />
        </div>
        <div className={styles.heroAbilities}>
          <AbilityScoreCards
            finalAttributes={derivedSheet.finalAttributes}
            modifiers={derivedSheet.modifiers}
          />
        </div>
        <div className={styles.heroStats}>
          <QuickStatsRow
            derivedSheet={derivedSheet}
            playState={playState}
            onUpdatePlayState={onUpdatePlayState}
          />
        </div>
      </section>

      <section className={styles.supportGrid}>
        <div className={styles.supportColumn}>
          <SavingThrowsCard derivedSavingThrows={derivedSheet.derivedSavingThrows} />
          <SensesCard
            passivePerception={derivedSheet.passivePerception}
            passiveInvestigation={derivedSheet.passiveInvestigation}
            passiveInsight={derivedSheet.passiveInsight}
            specialSenses={derivedSheet.specialSenses}
          />
        </div>

        <div className={styles.skillsColumn}>
          <SkillsCard skills={derivedSheet.skills} />
        </div>

        <div className={styles.supportColumn}>
          <ProficienciesCard
            skillProficiencies={derivedSheet.skillProficiencies}
            armorProficiencies={derivedSheet.armorProficiencies}
            weaponProficiencies={derivedSheet.weaponProficiencies}
            toolProficiencies={derivedSheet.toolProficiencies}
            languages={derivedSheet.languages}
          />
        </div>

        <div className={styles.supportColumn}>
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
      </section>

      <section className={styles.tabsCard}>
        <SheetTabs
          derivedSheet={derivedSheet}
          playState={playState}
          onUpdatePlayState={onUpdatePlayState}
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
      </section>
    </div>
  );
}

import { useState } from 'react';
import type { DerivedSheet } from '../../rules/types/DerivedSheet';
import type { CharacterPlayState } from '../../types/playState';
import type { WeaponAttack } from '../../rules/types/DerivedSheet';
import type { CharacterAppearance, PersonalityTraits, CharacterIdentityUpdate } from '../../types/character';
import { ActionsTab } from './tabs/ActionsTab';
import { SpellsTab } from './tabs/SpellsTab';
import { InventoryTab } from './tabs/InventoryTab';
import { FeaturesTraitsTab } from './tabs/FeaturesTraitsTab';
import { BackgroundTab } from './tabs/BackgroundTab';
import { NotesTab } from './tabs/NotesTab';
import { ExtrasTab } from './tabs/ExtrasTab';
import styles from './SheetTabs.module.css';

type TabId = 'actions' | 'spells' | 'inventory' | 'features' | 'background' | 'notes' | 'extras';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'actions',    label: 'Ações' },
  { id: 'spells',     label: 'Magias' },
  { id: 'inventory',  label: 'Inventário' },
  { id: 'features',   label: 'Características e Traços' },
  { id: 'background', label: 'Antecedente' },
  { id: 'notes',      label: 'Notas' },
  { id: 'extras',     label: 'Extras' },
];

interface Feature { level: number; name: string; description: string }
interface Trait { title: string; description: string }
interface InventoryItem { name: string; quantity?: number; notes?: string; cost?: string }

interface SheetTabsProps {
  derivedSheet: DerivedSheet;
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
  classFeatures: Feature[];
  speciesTraits: Trait[];
  inventory: InventoryItem[];
  learnedCantrips: string[];
  preparedSpells: string[];
  onUpdatePreparedSpells?: (spells: string[]) => void;
  characterLevel: number;
  equippedArmorId?: string | null;
  hasShieldEquipped?: boolean;
  onEquipArmor?: (armorId: string | null) => void;
  onEquipShield?: (equipped: boolean) => void;
  backgroundName?: string;
  backgroundDescription?: string;
  backgroundSkills?: string[];
  backgroundTool?: string;
  backgroundEquipment?: string;
  onAttackClick?: (attack: WeaponAttack) => void;
  currency?: { cp: number; sp: number; ep: number; gp: number; pp: number };
  onUpdateCurrency?: (currency: { cp: number; sp: number; ep: number; gp: number; pp: number }) => void;
  /** Campos de identidade para NotesTab */
  backstory?: string;
  appearance?: CharacterAppearance;
  personalityTraits?: PersonalityTraits;
  faith?: string;
  lifestyle?: string;
  organizations?: string;
  alignment?: string | null;
  onUpdateIdentity?: (update: CharacterIdentityUpdate) => void;
  classId?: string;
}

export function SheetTabs({
  derivedSheet,
  playState,
  onUpdatePlayState,
  classFeatures,
  speciesTraits,
  inventory,
  learnedCantrips,
  preparedSpells,
  onUpdatePreparedSpells,
  characterLevel,
  backgroundName,
  backgroundDescription,
  backgroundSkills,
  backgroundTool,
  backgroundEquipment,
  equippedArmorId,
  hasShieldEquipped,
  onEquipArmor,
  onEquipShield,
  onAttackClick,
  currency,
  onUpdateCurrency,
  backstory,
  appearance,
  personalityTraits,
  faith,
  lifestyle,
  organizations,
  alignment,
  onUpdateIdentity,
  classId,
}: SheetTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('actions');

  return (
    <div>
      {/* Tab bar */}
      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
          >
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.tabContent} key={activeTab}>
      {activeTab === 'actions' && (
        <ActionsTab
          weaponAttacks={derivedSheet.weaponAttacks}
          playState={playState}
          onUpdatePlayState={onUpdatePlayState}
          onAttackClick={onAttackClick}
        />
      )}
      {activeTab === 'spells' && (
        <SpellsTab
          derivedSheet={derivedSheet}
          playState={playState}
          onUpdatePlayState={onUpdatePlayState}
          learnedCantrips={learnedCantrips}
          preparedSpells={preparedSpells}
          onUpdatePreparedSpells={onUpdatePreparedSpells}
        />
      )}
      {activeTab === 'inventory' && (
        <InventoryTab
          inventory={inventory}
          playState={playState}
          onUpdatePlayState={onUpdatePlayState}
          equippedArmorId={equippedArmorId}
          hasShieldEquipped={hasShieldEquipped}
          onEquipArmor={onEquipArmor}
          onEquipShield={onEquipShield}
          currency={currency}
          onUpdateCurrency={onUpdateCurrency}
          carryingCapacity={(derivedSheet.finalAttributes?.forca ?? 10) * 7.5}
        />
      )}
      {activeTab === 'features' && (
        <FeaturesTraitsTab
          classFeatures={classFeatures}
          speciesTraits={speciesTraits}
          originTalent={derivedSheet.originTalent}
          activeTalents={derivedSheet.activeTalents}
          derivedTraits={derivedSheet.derivedTraits}
          backgroundName={backgroundName}
          backgroundSkills={backgroundSkills}
          backgroundTool={backgroundTool}
          characterLevel={characterLevel}
        />
      )}
      {activeTab === 'background' && (
        <BackgroundTab
          backgroundName={backgroundName}
          backgroundDescription={backgroundDescription}
          backgroundSkills={backgroundSkills}
          backgroundTool={backgroundTool}
          backgroundEquipment={backgroundEquipment}
          originTalent={derivedSheet.originTalent}
        />
      )}
      {activeTab === 'notes' && (
        <NotesTab
          notes={playState.notes}
          onUpdateNotes={notes => onUpdatePlayState(prev => ({ ...prev, notes }))}
          backstory={backstory}
          appearance={appearance}
          personalityTraits={personalityTraits}
          faith={faith}
          lifestyle={lifestyle}
          organizations={organizations}
          alignment={alignment}
          onUpdateIdentity={onUpdateIdentity}
        />
      )}
      {activeTab === 'extras' && (
        <ExtrasTab
          extras={playState.extras}
          onUpdateExtras={extras => onUpdatePlayState(prev => ({ ...prev, extras }))}
          playState={playState}
          onUpdatePlayState={onUpdatePlayState}
          classId={classId}
          characterLevel={characterLevel}
        />
      )}
      </div>
    </div>
  );
}

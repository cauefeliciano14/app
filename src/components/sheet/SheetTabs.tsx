import { useState } from 'react';
import type { DerivedSheet } from '../../rules/types/DerivedSheet';
import type { CharacterPlayState } from '../../types/playState';
import { ActionsTab } from './tabs/ActionsTab';
import { SpellsTab } from './tabs/SpellsTab';
import { InventoryTab } from './tabs/InventoryTab';
import { FeaturesTraitsTab } from './tabs/FeaturesTraitsTab';
import { BackgroundTab } from './tabs/BackgroundTab';
import { NotesTab } from './tabs/NotesTab';
import { ExtrasTab } from './tabs/ExtrasTab';

type TabId = 'actions' | 'spells' | 'inventory' | 'features' | 'background' | 'notes' | 'extras';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'actions',    label: 'Ações' },
  { id: 'spells',     label: 'Magias' },
  { id: 'inventory',  label: 'Inventário' },
  { id: 'features',   label: 'Características' },
  { id: 'background', label: 'Antecedente' },
  { id: 'notes',      label: 'Anotações' },
  { id: 'extras',     label: 'Extras' },
];

interface Feature { level: number; name: string; description: string }
interface Trait { title: string; description: string }
interface InventoryItem { name: string; quantity?: number; notes?: string; cost?: string }

interface SheetTabsProps {
  derivedSheet: DerivedSheet;
  playState: CharacterPlayState;
  onUpdatePlayState: (updater: (prev: CharacterPlayState) => CharacterPlayState) => void;
  // Character raw data for features/background tabs
  classFeatures: Feature[];
  speciesTraits: Trait[];
  inventory: InventoryItem[];
  learnedCantrips: string[];
  preparedSpells: string[];
  characterLevel: number;
  // Armor/shield equip state
  equippedArmorId?: string | null;
  hasShieldEquipped?: boolean;
  onEquipArmor?: (armorId: string | null) => void;
  onEquipShield?: (equipped: boolean) => void;
  backgroundName?: string;
  backgroundDescription?: string;
  backgroundSkills?: string[];
  backgroundTool?: string;
  backgroundEquipment?: string;
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
}: SheetTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('actions');

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: '2px',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '16px',
        paddingBottom: '1px',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(167,139,250,0.15)' : 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#a78bfa' : 'transparent'}`,
              color: activeTab === tab.id ? '#a78bfa' : '#64748b',
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'actions' && (
        <ActionsTab
          weaponAttacks={derivedSheet.weaponAttacks}
          playState={playState}
          onUpdatePlayState={onUpdatePlayState}
        />
      )}
      {activeTab === 'spells' && (
        <SpellsTab
          derivedSheet={derivedSheet}
          playState={playState}
          onUpdatePlayState={onUpdatePlayState}
          learnedCantrips={learnedCantrips}
          preparedSpells={preparedSpells}
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
        />
      )}
      {activeTab === 'features' && (
        <FeaturesTraitsTab
          classFeatures={classFeatures}
          speciesTraits={speciesTraits}
          originTalent={derivedSheet.originTalent}
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
        />
      )}
      {activeTab === 'extras' && (
        <ExtrasTab
          extras={playState.extras}
          onUpdateExtras={extras => onUpdatePlayState(prev => ({ ...prev, extras }))}
        />
      )}
    </div>
  );
}

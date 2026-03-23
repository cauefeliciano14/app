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
        gap: '24px',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '16px',
        paddingBottom: '8px',
        paddingLeft: '8px'
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #dc2626' : '2px solid transparent',
              color: activeTab === tab.id ? '#f1f5f9' : '#94a3b8',
              padding: '0 0 4px 0',
              fontSize: '0.95rem',
              fontWeight: activeTab === tab.id ? 800 : 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.1s',
            }}
          >
            {tab.label.toUpperCase()}
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

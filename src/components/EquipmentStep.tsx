import React, { useState, useEffect } from 'react';
import { classStartingSpells } from '../data/spellsData';
import { isCaster as engineIsCaster } from '../rules/calculators/spells';
import type { DerivedSheet } from '../rules/types/DerivedSheet';
import { getEquipmentForClass, getEquipmentForBackground } from '../data/equipmentData';
import { getArmorByName } from '../rules/data/armorRules';
import { sanitizeEquipmentState } from '../rules/utils/equipment';
import { Accordion } from './equipment/Accordion';
import { TabBar } from './equipment/TabBar';
import { StartingEquipment } from './equipment/StartingEquipment';
import { InventorySection } from './equipment/InventorySection';
import { ItemCatalog } from './equipment/ItemCatalog';
import { CurrencySection } from './equipment/CurrencySection';
import { PreparedSpells } from './equipment/PreparedSpells';
import { SpellCatalog } from './equipment/SpellCatalog';

interface EquipmentStepProps {
  character: any;
  selectedBackground: any;
  updateEquipment: (updater: (prev: any) => any) => void;
  updateSpells: (updater: (prev: any) => any) => void;
  derivedSheet: DerivedSheet;
}

export const EquipmentStep: React.FC<EquipmentStepProps> = ({ character, selectedBackground, updateEquipment, updateSpells, derivedSheet }) => {
  void derivedSheet;
  const classId = character.characterClass?.id || '';
  const bgId = selectedBackground?.id || '';
  const spellInfo = classStartingSpells[classId];
  const isCaster = engineIsCaster(classId);

  const [activeTab, setActiveTab] = useState('equipment');
  const [openAccordions, setOpenAccordions] = useState({
    starting: true, inventory: false, catalog: false, currency: false,
    prepared: false, spellCatalog: true,
  });

  const toggle = (key: keyof typeof openAccordions) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const equipmentState = character.equipment;
  const spellsState = character.spells;


  // Load class spells
  const [classSpells, setClassSpells] = useState<any[]>([]);
  const [spellsLoading, setSpellsLoading] = useState(false);
  useEffect(() => {
    if (isCaster && classId) {
      setSpellsLoading(true);
      import(`../data/spells/${classId}_spells.json`)
        .then(mod => { setClassSpells(mod.default || mod); setSpellsLoading(false); })
        .catch(() => { setClassSpells([]); setSpellsLoading(false); });
    } else {
      setClassSpells([]);
      setSpellsLoading(false);
    }
  }, [classId, isCaster]);

  // Pre-select starting spells when entering the step (each array checked independently)
  useEffect(() => {
    if (!isCaster || !spellInfo) return;
    updateSpells((prev: any) => ({
      ...prev,
      learnedCantrips: prev.learnedCantrips.length === 0 && spellInfo.cantrips.length > 0
        ? spellInfo.cantrips : prev.learnedCantrips,
      preparedSpells: prev.preparedSpells.length === 0 && spellInfo.level1.length > 0
        ? spellInfo.level1 : prev.preparedSpells,
    }));
  }, [classId]);

  // --- Equipment handlers ---
  const handleCommitStartingEquipment = (classOption: 'A' | 'B' | null, bgOption: 'A' | 'B' | null, subChoices: Record<string, string>) => {
    const classEq = getEquipmentForClass(classId);
    const bgEq = getEquipmentForBackground(bgId);

    updateEquipment((prev: any) => {
      const draft = { ...prev, inventory: [...prev.inventory], currency: { ...prev.currency } };

      // Add class equipment
      if (classOption === 'A') {
        draft.currency.gp += classEq.optionA.gold;
        classEq.optionA.items.forEach((itemName: string) => {
          // Resolve sub-choices
          const choiceKey = `class-${itemName}`;
          const resolvedName = subChoices[choiceKey] || itemName;
          draft.inventory.push({
            id: `start-${Date.now()}-${Math.random()}`,
            name: resolvedName,
            quantity: 1,
            isStartingGear: true,
            source: 'class',
          });
        });
      } else if (classOption === 'B') {
        draft.currency.gp += classEq.optionB.gold;
      }

      // Add background equipment
      if (bgOption === 'A') {
        draft.currency.gp += bgEq.optionA.gold;
        bgEq.optionA.items.forEach((itemName: string) => {
          const choiceKey = `bg-${itemName}`;
          const resolvedName = subChoices[choiceKey] || itemName;
          draft.inventory.push({
            id: `start-${Date.now()}-${Math.random()}`,
            name: resolvedName,
            quantity: 1,
            isStartingGear: true,
            source: 'bg',
          });
        });
      } else if (bgOption === 'B') {
        draft.currency.gp += bgEq.optionB.gold;
      }

      draft.classOption = classOption;
      draft.backgroundOption = bgOption;
      draft.startingEquipmentAdded = true;

      // Auto-equip: if the starting package contains exactly one armor, equip it.
      // If it contains a shield, equip that too.
      const armors: { id: string; name: string }[] = [];
      let hasShield = false;
      for (const item of draft.inventory) {
        const armor = getArmorByName(item.name);
        if (armor) {
          if (armor.type === 'shield') {
            hasShield = true;
          } else {
            armors.push({ id: armor.id, name: item.name });
          }
        }
      }
      if (armors.length === 1) {
        draft.equippedArmorId = armors[0].id;
      }
      draft.hasShieldEquipped = hasShield;

      return sanitizeEquipmentState({ ...draft, inventory: draft.inventory });
    });

    // Collapse starting, expand inventory
    setOpenAccordions(prev => ({ ...prev, starting: false, inventory: true }));
  };

  const handleAddItem = (item: any) => {
    updateEquipment((prev: any) => ({
      ...prev,
      inventory: [...prev.inventory, {
        id: `item-${Date.now()}-${Math.random()}`,
        name: item.name,
        quantity: 1,
        itemBase: item,
      }],
    }));
  };

  const handleRemoveItem = (id: string) => {
    updateEquipment((prev: any) => {
      const removedItem = prev.inventory.find((i: any) => i.id === id);
      const nextInventory = prev.inventory.filter((i: any) => i.id !== id);
      const nextEquipment = sanitizeEquipmentState({ ...prev, inventory: nextInventory });
      const removedArmor = removedItem ? getArmorByName(removedItem.name) : null;

      if (removedArmor?.type === 'shield' && prev.hasShieldEquipped) {
        nextEquipment.hasShieldEquipped = false;
      }

      if (removedArmor && removedArmor.type !== 'shield' && removedArmor.id === prev.equippedArmorId) {
        nextEquipment.equippedArmorId = null;
      }

      return nextEquipment;
    });
  };

  const handleChangeQuantity = (id: string, delta: number) => {
    updateEquipment((prev: any) => {
      const targetItem = prev.inventory.find((i: any) => i.id === id);
      const nextInventory = prev.inventory
        .map((i: any) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter((i: any) => i.quantity > 0);

      const nextEquipment = sanitizeEquipmentState({ ...prev, inventory: nextInventory });
      const removedArmor = targetItem && targetItem.quantity + delta <= 0 ? getArmorByName(targetItem.name) : null;

      if (removedArmor?.type === 'shield' && prev.hasShieldEquipped) {
        nextEquipment.hasShieldEquipped = false;
      }

      if (removedArmor && removedArmor.type !== 'shield' && removedArmor.id === prev.equippedArmorId) {
        nextEquipment.equippedArmorId = null;
      }

      return nextEquipment;
    });
  };

  const handleCurrencyChange = (coin: string, delta: number) => {
    updateEquipment((prev: any) => ({
      ...prev,
      currency: { ...prev.currency, [coin]: Math.max(0, prev.currency[coin] + delta) },
    }));
  };

  const handleCurrencySet = (coin: string, value: number) => {
    updateEquipment((prev: any) => ({
      ...prev,
      currency: { ...prev.currency, [coin]: value },
    }));
  };

  // --- Spell handlers ---
  const handleLearnCantrip = (name: string) => {
    updateSpells((prev: any) => ({
      ...prev,
      learnedCantrips: [...prev.learnedCantrips, name],
    }));
  };

  const handleRemoveCantrip = (name: string) => {
    updateSpells((prev: any) => ({
      ...prev,
      learnedCantrips: prev.learnedCantrips.filter((c: string) => c !== name),
    }));
  };

  const handlePrepareSpell = (name: string) => {
    updateSpells((prev: any) => ({
      ...prev,
      preparedSpells: [...prev.preparedSpells, name],
    }));
  };

  const handleRemoveSpell = (name: string) => {
    updateSpells((prev: any) => ({
      ...prev,
      preparedSpells: prev.preparedSpells.filter((s: string) => s !== name),
    }));
  };

  // --- Tabs ---
  const tabs = isCaster
    ? [{ id: 'equipment', label: 'Equipamentos' }, { id: 'spells', label: 'Magias' }]
    : [{ id: 'equipment', label: 'Equipamentos' }];

  const inventoryCount = equipmentState.inventory.length;
  const spellCount = spellsState.learnedCantrips.length + spellsState.preparedSpells.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'equipment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Accordion
            title="Equipamento Inicial"
            isOpen={openAccordions.starting}
            onToggle={() => toggle('starting')}
            incomplete={!equipmentState.startingEquipmentAdded}
            maxContentHeight={420}
          >
            <StartingEquipment
              classId={classId}
              className={character.characterClass?.name || ''}
              bgId={bgId}
              bgName={selectedBackground?.name || ''}
              currentClassOption={equipmentState.classOption}
              currentBgOption={equipmentState.backgroundOption}
              startingEquipmentAdded={equipmentState.startingEquipmentAdded}
              onCommit={handleCommitStartingEquipment}
            />
          </Accordion>

          <Accordion
            title="Inventário"
            badge={inventoryCount > 0 ? (
              <span style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                {inventoryCount}
              </span>
            ) : undefined}
            isOpen={openAccordions.inventory}
            onToggle={() => toggle('inventory')}
          >
            <InventorySection
              inventory={equipmentState.inventory}
              onRemoveItem={handleRemoveItem}
              onChangeQuantity={handleChangeQuantity}
              equippedArmorId={equipmentState.equippedArmorId}
              hasShieldEquipped={equipmentState.hasShieldEquipped}
              onEquipArmor={(armorId) => updateEquipment((prev: any) => ({ ...prev, equippedArmorId: armorId }))}
              onEquipShield={(equipped) => updateEquipment((prev: any) => ({ ...prev, hasShieldEquipped: equipped }))}
            />
          </Accordion>

          <Accordion
            title="Adicionar Itens"
            isOpen={openAccordions.catalog}
            onToggle={() => toggle('catalog')}
          >
            <ItemCatalog onAddItem={handleAddItem} />
          </Accordion>

          <Accordion
            title="Moeda"
            isOpen={openAccordions.currency}
            onToggle={() => toggle('currency')}
          >
            <CurrencySection
              currency={equipmentState.currency}
              onCurrencyChange={handleCurrencyChange}
              onCurrencySet={handleCurrencySet}
            />
          </Accordion>
        </div>
      )}

      {activeTab === 'spells' && isCaster && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Accordion
            title="Magias Preparadas"
            badge={spellCount > 0 ? (
              <span style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                {spellCount}
              </span>
            ) : undefined}
            isOpen={openAccordions.prepared}
            onToggle={() => toggle('prepared')}
          >
            <PreparedSpells
              learnedCantrips={spellsState.learnedCantrips}
              preparedSpells={spellsState.preparedSpells}
              allSpells={classSpells}
              onRemoveCantrip={handleRemoveCantrip}
              onRemoveSpell={handleRemoveSpell}
            />
          </Accordion>

          <Accordion
            title="Lista de Magias"
            isOpen={openAccordions.spellCatalog}
            onToggle={() => toggle('spellCatalog')}
          >
            {spellsLoading ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '16px 0', textAlign: 'center' }}>Carregando magias…</div>
            ) : (
              <SpellCatalog
                classId={classId}
                learnedCantrips={spellsState.learnedCantrips}
                preparedSpells={spellsState.preparedSpells}
                onLearnCantrip={handleLearnCantrip}
                onPrepareSpell={handlePrepareSpell}
                onRemoveCantrip={handleRemoveCantrip}
                onRemoveSpell={handleRemoveSpell}
                allSpells={classSpells}
                maxCantrips={derivedSheet.cantripsKnown ?? 0}
                maxPrepared={derivedSheet.preparedSpellCount ?? 0}
              />
            )}
          </Accordion>
        </div>
      )}
    </div>
  );
};

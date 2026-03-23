import { useState } from 'react';
import type { DerivedSheet } from '../../rules/types/DerivedSheet';
import type { CharacterPlayState } from '../../types/playState';
import { SheetHeader } from './SheetHeader';
import { AbilityScoreCards } from './AbilityScoreCards';
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

function signedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
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
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [hdCount, setHdCount] = useState('1');
  const [hpInput, setHpInput] = useState('');
  const [tempInput, setTempInput] = useState('');

  const effectiveMaxHP = playState.maxHpOverride ?? derivedSheet.maxHP;
  const hitDieSize = parseInt((derivedSheet.hitDie ?? 'd8').replace('d', ''), 10) || 8;
  const conMod = derivedSheet.modifiers?.constituicao ?? 0;

  const handleLongRest = () => {
    onUpdatePlayState(prev => ({
      ...prev,
      currentHp: effectiveMaxHP,
      tempHp: 0,
      spentSpellSlots: {},
      activeConditions: [],
      deathSaves: { successes: 0, failures: 0 },
    }));
  };

  const handleShortRest = () => {
    const count = Math.max(1, parseInt(hdCount, 10) || 1);
    const rolled = Array.from({ length: count }, () => Math.floor(Math.random() * hitDieSize) + 1);
    const total = rolled.reduce((sum, r) => sum + r + conMod, 0);
    onUpdatePlayState(prev => ({
      ...prev,
      currentHp: Math.min(prev.currentHp + Math.max(1, total), effectiveMaxHP),
    }));
    setShortRestOpen(false);
    setHdCount('1');
  };

  const handleHeal = () => {
    const amount = parseInt(hpInput, 10);
    if (!isNaN(amount) && amount > 0) {
      onUpdatePlayState(prev => ({
        ...prev,
        currentHp: Math.min(prev.currentHp + amount, effectiveMaxHP),
      }));
      setHpInput('');
    }
  };

  const handleDamage = () => {
    const amount = parseInt(hpInput, 10);
    if (!isNaN(amount) && amount > 0) {
      onUpdatePlayState(prev => {
        const tempAbsorbed = Math.min(prev.tempHp, amount);
        const remaining = amount - tempAbsorbed;
        return {
          ...prev,
          tempHp: prev.tempHp - tempAbsorbed,
          currentHp: Math.max(0, prev.currentHp - remaining),
        };
      });
      setHpInput('');
    }
  };

  const handleSetTemp = () => {
    const amount = parseInt(tempInput, 10);
    if (!isNaN(amount) && amount >= 0) {
      onUpdatePlayState(prev => ({ ...prev, tempHp: amount }));
      setTempInput('');
    }
  };

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

  const hpPercent = effectiveMaxHP > 0 ? (playState.currentHp / effectiveMaxHP) * 100 : 0;
  const hpColor = hpPercent > 50 ? '#4ade80' : hpPercent > 25 ? '#fbbf24' : '#f87171';

  const statCard = (label: string, value: string, isShield: boolean = false) => (
    <div
      style={{
        background: 'rgba(14, 14, 18, 0.9)',
        border: '2px solid #991b1b',
        borderRadius: isShield ? '16px 16px 4px 4px' : '4px',
        padding: '8px 10px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '76px',
        width: '76px',
        boxSizing: 'border-box',
        gap: '4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      
      {/* ===== TOP BAR (DASHBOARD SUPERIOR) ===== */}
      <div className={styles.topBar}>
        
        {/* ROW 1: Portrait e Rests */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '16px' }}>
          <SheetHeader
            name={characterName}
            portrait={portrait}
            speciesName={speciesName}
            className={className}
            level={characterLevel}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShortRestOpen(prev => !prev)}
              style={{
                background: shortRestOpen ? 'rgba(153,27,27,0.3)' : 'rgba(14,14,18,0.8)',
                border: `1px solid ${shortRestOpen ? '#dc2626' : '#991b1b'}`,
                borderRadius: '4px',
                color: shortRestOpen ? '#fca5a5' : '#e2e8f0',
                padding: '4px 16px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              DESCANSO CURTO
            </button>
            <button
              onClick={handleLongRest}
              style={{
                background: 'rgba(14,14,18,0.8)',
                border: '1px solid #991b1b',
                borderRadius: '4px',
                color: '#e2e8f0',
                padding: '4px 16px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              DESCANSO LONGO
            </button>
          </div>
        </div>

        {/* Short Rest Overlay */}
        {shortRestOpen && (
          <div className={styles.redBox} style={{ padding: '12px 16px', marginBottom: '16px' }}>
            <div className={styles.sectionHeader}>DESCANSO CURTO</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Dado(s):</span>
              <input type="number" min="1" value={hdCount} onChange={e => setHdCount(e.target.value)} style={{ width: '60px', background: 'rgba(0,0,0,0.3)', border: '1px solid #7f1d1d', borderRadius: '4px', color: '#f1f5f9', padding: '6px 10px' }} />
              <button onClick={handleShortRest} style={{ background: '#991b1b', border: 'none', borderRadius: '4px', color: 'white', padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>Recuperar PV</button>
            </div>
          </div>
        )}

        {/* ROW 2: Stats Row - Abilities, PB, Speed, Heroic Insp, HP */}
        <div className={styles.statsRow}>

          {/* Atributos */}
          <div style={{ width: '380px', display: 'flex', alignItems: 'center' }}>
            <AbilityScoreCards
              finalAttributes={derivedSheet.finalAttributes}
              modifiers={derivedSheet.modifiers}
            />
          </div>

          {/* PB + Speed */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {statCard('PROFICIÊNCIA', signedMod(derivedSheet.proficiencyBonus))}
            {statCard('DESLOCAMENTO', derivedSheet.speed + 'm')}
          </div>

          {/* Heroic Inspiration */}
          <div className={styles.redBox} style={{ width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 8px' }}>
            <div className={styles.sectionHeader} style={{ fontSize: '0.55rem', padding: '4px 6px' }}>INSP.<br/>HEROICA</div>
            <div style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid #7f1d1d' }}></div>
          </div>

          {/* HP Panel */}
          <div style={{ flex: 1 }}>
            <div className={styles.redBox} style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column' }}>
              <div className={styles.sectionHeader}>PONTOS DE VIDA</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                 <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>ATUAL</span>
                 <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>MÁXIMO</span>
                 <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>TEMP</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: hpColor }}>{playState.currentHp}</span>
                <span style={{ color: '#475569', fontSize: '1.2rem', fontWeight: 900 }}>/</span>
                <span style={{ fontSize: '1.3rem', color: '#cbd5e1', fontWeight: 800 }}>{effectiveMaxHP}</span>
                <span style={{ fontSize: '1.2rem', color: '#cbd5e1', fontWeight: 800 }}>{playState.tempHp > 0 ? playState.tempHp : '--'}</span>
              </div>

              <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '10px' }}>
                <div style={{ height: '100%', width: `${Math.min(hpPercent, 100)}%`, background: hpColor, borderRadius: '2px', transition: 'width 0.3s ease' }} />
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="number" min="0" value={hpInput} onChange={e => setHpInput(e.target.value)} style={{ width: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f1f5f9', padding: '4px 6px', fontSize: '0.8rem' }} />
                <button onClick={handleHeal} style={{ flex: 1, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '6px', color: '#4ade80', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Curar</button>
                <button onClick={handleDamage} style={{ flex: 1, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '6px', color: '#f87171', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Dano</button>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 3: Sub-Row - Iniciativa, AC, Defesas, Condições */}
        <div className={styles.subRow}>

          {/* Iniciativa + AC */}
          <div className={styles.subRowStatGroup}>
            {statCard('INICIATIVA', signedMod(derivedSheet.initiative))}
            {statCard('CLASSE ARMADURA', String(derivedSheet.armorClass), true)}
          </div>

          {/* Defesas + Condições */}
          <div className={styles.subRowPanels}>
            <div className={styles.redBox} style={{ flex: 1, padding: '16px 12px' }}>
              <div className={styles.sectionHeader}>DEFESAS</div>
              <DefensesCard
                derivedDefenses={derivedSheet.derivedDefenses}
                activeDefenses={playState.activeDefenses}
                onAdd={handleAddDefense}
                onRemove={handleRemoveDefense}
              />
            </div>
            <div className={styles.redBox} style={{ flex: 1, padding: '16px 12px' }}>
              <div className={styles.sectionHeader}>CONDIÇÕES</div>
              <ConditionsCard
                activeConditions={playState.activeConditions}
                onAdd={handleAddCondition}
                onRemove={handleRemoveCondition}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ===== BOTTOM PANELS (SUB-PAINÉIS) ===== */}
      <div className={styles.mainGrid} style={{ marginTop: '24px' }}>
        
        {/* Painel Esquerdo (Sub-painel 1) */}
        <div className={styles.colLeft}>
          <div className={styles.redBox}>
            <div className={styles.sectionHeader}>TESTES DE RESISTÊNCIA ⚙</div>
            <SavingThrowsCard derivedSavingThrows={derivedSheet.derivedSavingThrows} />
          </div>
          
          <div className={styles.redBox}>
            <div className={styles.sectionHeader}>SENTIDOS ⚙</div>
            <SensesCard
              passivePerception={derivedSheet.passivePerception}
              passiveInvestigation={derivedSheet.passiveInvestigation}
              passiveInsight={derivedSheet.passiveInsight}
              specialSenses={derivedSheet.specialSenses}
            />
          </div>
          
          <div className={styles.redBox}>
            <div className={styles.sectionHeader}>PROFICIÊNCIAS E TREINAMENTO ⚙</div>
            <ProficienciesCard
              skillProficiencies={derivedSheet.skillProficiencies}
              armorProficiencies={derivedSheet.armorProficiencies}
              weaponProficiencies={derivedSheet.weaponProficiencies}
              toolProficiencies={derivedSheet.toolProficiencies}
              languages={derivedSheet.languages}
            />
          </div>
        </div>

        {/* Painel Direito (Sub-painel 2 - Maior) */}
        {/* Usarei um agrupamento flex para Skins e Abas na direita, assumindo o restante da tela */}
        <div style={{ flex: 1, display: 'flex', gap: '16px', minWidth: 0 }}>
          
          {/* Coluna da Esquerda do Painel Direito (Skills) */}
          <div className={styles.redBox} style={{ width: '250px', flexShrink: 0 }}>
            <div className={styles.sectionHeader}>PERÍCIAS ⚙</div>
            <SkillsCard skills={derivedSheet.skills} />
          </div>

          {/* Coluna da Direita do Painel Direito (Tabs) */}
          <div className={styles.redBox} style={{ flex: 1, padding: '20px 12px', minWidth: '400px' }}>
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
          </div>
        </div>

      </div>
    </div>
  );
}

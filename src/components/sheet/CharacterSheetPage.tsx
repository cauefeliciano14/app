import { useCallback, useEffect, useRef, useState } from 'react';
import type { DerivedSheet, DerivedSkill, DerivedSavingThrow, WeaponAttack } from '../../rules/types/DerivedSheet';
import type { CharacterPlayState } from '../../types/playState';
import type { DiceRollResult, AdvantageMode } from '../../utils/diceRoller';
import type { CharacterAppearance, PersonalityTraits, CharacterIdentityUpdate } from '../../types/character';
import { rollD20Check, rollDamage } from '../../utils/diceRoller';
import { signedMod } from '../../utils/format';
import { ATTR_ABBR } from '../../utils/attributeConstants';
import { SheetHeader } from './SheetHeader';
import { AbilityScoreCards } from './AbilityScoreCards';
import { SavingThrowsCard } from './SavingThrowsCard';
import { SensesCard } from './SensesCard';
import { ProficienciesCard } from './ProficienciesCard';
import { SkillsCard } from './SkillsCard';
import { ConditionsCard } from './ConditionsCard';
import { DefensesCard } from './DefensesCard';
import { DeathSavesCard } from './DeathSavesCard';
import { SheetTabs } from './SheetTabs';
import { SheetSidebar } from './SheetSidebar';
import { DiceResultPanel, AbilityDetailPanel, AttackDetailPanel } from './DiceResultPanel';
import { RestModal } from './RestModal';
import { LevelUpModal } from './LevelUpModal';
import { AddClassModal } from './AddClassModal';
import type { ClassLevel } from '../../types/multiclass';
import styles from './CharacterSheetPage.module.css';

/* ── Sidebar state ── */
type SidebarState =
  | { type: 'skill'; skill: DerivedSkill; result: DiceRollResult }
  | { type: 'save'; save: DerivedSavingThrow; result: DiceRollResult }
  | { type: 'ability'; key: string; label: string; score: number; modifier: number }
  | { type: 'attack'; attack: WeaponAttack; hitResult: DiceRollResult; damageResult: DiceRollResult }
  | { type: 'history' }
  | null;

/* ── Types ── */
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
  onUpdatePreparedSpells?: (spells: string[]) => void;
  backgroundName?: string;
  backgroundDescription?: string;
  backgroundSkills?: string[];
  backgroundTool?: string;
  backgroundEquipment?: string;
  equippedArmorId?: string | null;
  hasShieldEquipped?: boolean;
  onEquipArmor?: (armorId: string | null) => void;
  onEquipShield?: (equipped: boolean) => void;
  alignment?: string | null;
  currency?: { cp: number; sp: number; ep: number; gp: number; pp: number };
  onUpdateCurrency?: (currency: { cp: number; sp: number; ep: number; gp: number; pp: number }) => void;
  /** Campos de identidade */
  backstory?: string;
  appearance?: CharacterAppearance;
  personalityTraits?: PersonalityTraits;
  faith?: string;
  lifestyle?: string;
  organizations?: string;
  onUpdateIdentity?: (update: CharacterIdentityUpdate) => void;
  onSetLevel?: (level: number) => void;
  classId?: string;
  subclassName?: string;
  classLevels?: ClassLevel[];
  onAddClass?: (classId: string, className: string) => void;
  onLevelUpClass?: (classId: string) => void;
}

const MAX_DICE_HISTORY = 20;

// XP necessário para cada nível (índice 0 = nível 1)
const XP_TABLE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < XP_TABLE.length; i++) {
    if (xp >= XP_TABLE[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 20);
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
  onUpdatePreparedSpells,
  backgroundName,
  backgroundDescription,
  backgroundSkills,
  backgroundTool,
  backgroundEquipment,
  equippedArmorId,
  hasShieldEquipped,
  onEquipArmor,
  onEquipShield,
  alignment,
  currency,
  onUpdateCurrency,
  backstory,
  appearance,
  personalityTraits,
  faith,
  lifestyle,
  organizations,
  onUpdateIdentity,
  onSetLevel,
  classId,
  subclassName,
  classLevels,
  onAddClass,
  onLevelUpClass,
}: CharacterSheetPageProps) {
  /* ── HP state ── */
  const [hpInput, setHpInput] = useState('');
  const [hpPulse, setHpPulse] = useState<'damage' | 'heal' | null>(null);
  const prevHpRef = useRef(playState.currentHp);

  /* ── Sidebar state ── */
  const [sidebar, setSidebar] = useState<SidebarState>(null);

  /* ── Rest modal state ── */
  const [restModal, setRestModal] = useState<'short' | 'long' | null>(null);
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [hdCount, setHdCount] = useState('1');

  /* ── Advantage mode ── */
  const [advantageMode, setAdvantageMode] = useState<AdvantageMode>('normal');

  /* ── XP state ── */
  const [xpInput, setXpInput] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const currentXP = playState.xp ?? 0;
  const xpLevel = getLevelFromXP(currentXP);
  const xpCurrentFloor = XP_TABLE[Math.min(xpLevel - 1, 19)] ?? 0;
  const xpNextCeil = XP_TABLE[Math.min(xpLevel, 19)] ?? XP_TABLE[19];
  const xpPercent = xpLevel >= 20 ? 100 : ((currentXP - xpCurrentFloor) / (xpNextCeil - xpCurrentFloor)) * 100;

  const handleAddXP = () => {
    const amount = parseInt(xpInput, 10);
    if (!isNaN(amount) && amount > 0) {
      onUpdatePlayState(prev => ({ ...prev, xp: (prev.xp ?? 0) + amount }));
      setXpInput('');
    }
  };

  /* ── HP pulse effect ── */
  useEffect(() => {
    if (playState.currentHp !== prevHpRef.current) {
      setHpPulse(playState.currentHp < prevHpRef.current ? 'damage' : 'heal');
      prevHpRef.current = playState.currentHp;
      const timer = setTimeout(() => setHpPulse(null), 600);
      return () => clearTimeout(timer);
    }
  }, [playState.currentHp]);

  const effectiveMaxHP = playState.maxHpOverride ?? derivedSheet.maxHP;
  const hitDieSize = parseInt((derivedSheet.hitDie ?? 'd8').replace('d', ''), 10) || 8;
  const conMod = derivedSheet.modifiers?.constituicao ?? 0;

  /* ── Hit Dice tracking ── */
  const totalHitDice = characterLevel;
  const availableHitDice = totalHitDice - (playState.spentHitDice ?? 0);

  /* ── Dice History helper ── */
  const addToHistory = useCallback((result: DiceRollResult) => {
    onUpdatePlayState(prev => ({
      ...prev,
      diceHistory: [
        { label: result.label, total: result.total, type: result.type, timestamp: Date.now() },
        ...(prev.diceHistory ?? []),
      ].slice(0, MAX_DICE_HISTORY),
    }));
  }, [onUpdatePlayState]);

  /* ── HP handlers ── */
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

  const handleTempHp = () => {
    const amount = parseInt(hpInput, 10);
    if (!isNaN(amount)) {
      onUpdatePlayState(prev => ({
        ...prev,
        tempHp: amount > 0 ? amount : 0,
      }));
      setHpInput('');
    }
  };

  /* ── Rest handlers ── */
  const handleLongRest = () => {
    onUpdatePlayState(prev => ({
      ...prev,
      currentHp: effectiveMaxHP,
      tempHp: 0,
      spentSpellSlots: {},
      activeConditions: [],
      heroicInspiration: true,
      deathSaves: { successes: 0, failures: 0 },
      spentHitDice: Math.max(0, (prev.spentHitDice ?? 0) - Math.floor(totalHitDice / 2)),
      customActions: prev.customActions.map(a =>
        a.resetOn === 'long' || a.resetOn === 'short' ? { ...a, usesSpent: 0 } : a
      ),
      customCounters: (prev.customCounters ?? []).map(c =>
        c.resetOn === 'long' || c.resetOn === 'short' ? { ...c, current: c.max } : c
      ),
    }));
    setRestModal(null);
  };

  const handleShortRest = () => {
    const count = Math.max(1, Math.min(parseInt(hdCount, 10) || 1, availableHitDice));
    if (count <= 0) return;
    const rolled = Array.from({ length: count }, () => Math.floor(Math.random() * hitDieSize) + 1);
    const total = rolled.reduce((sum, r) => sum + r + conMod, 0);
    onUpdatePlayState(prev => ({
      ...prev,
      currentHp: Math.min(prev.currentHp + Math.max(1, total), effectiveMaxHP),
      spentHitDice: (prev.spentHitDice ?? 0) + count,
      customActions: prev.customActions.map(a =>
        a.resetOn === 'short' ? { ...a, usesSpent: 0 } : a
      ),
      customCounters: (prev.customCounters ?? []).map(c =>
        c.resetOn === 'short' ? { ...c, current: c.max } : c
      ),
    }));
    setShortRestOpen(false);
    setHdCount('1');
  };

  /* ── Death Saves handler ── */
  const handleUpdateDeathSaves = useCallback((deathSaves: CharacterPlayState['deathSaves']) => {
    onUpdatePlayState(prev => ({ ...prev, deathSaves }));
  }, [onUpdatePlayState]);

  /* ── Condition / Defense handlers ── */
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

  /* ── Heroic Inspiration toggle ── */
  const toggleInspiration = () => {
    onUpdatePlayState(prev => ({ ...prev, heroicInspiration: !prev.heroicInspiration }));
  };

  /* ── Sidebar handlers ── */
  const closeSidebar = useCallback(() => setSidebar(null), []);

  const handleSkillClick = useCallback((skill: DerivedSkill) => {
    const abbr = ATTR_ABBR[skill.attribute] ?? skill.attribute;
    const result = rollD20Check(skill.modifier, `${skill.label} (${abbr})`, 'check', advantageMode);
    setSidebar({ type: 'skill', skill, result });
    addToHistory(result);
  }, [advantageMode, addToHistory]);

  const handleSaveClick = useCallback((save: DerivedSavingThrow) => {
    const result = rollD20Check(save.modifier, `Teste de Resistência (${save.label})`, 'save', advantageMode);
    setSidebar({ type: 'save', save, result });
    addToHistory(result);
  }, [advantageMode, addToHistory]);

  const handleAbilityClick = useCallback((key: string, label: string, score: number, modifier: number) => {
    setSidebar({ type: 'ability', key, label, score, modifier });
  }, []);

  const handleAttackClick = useCallback((attack: WeaponAttack) => {
    const dmgFormula = `${attack.damageDice}${attack.damageBonus !== 0 ? (attack.damageBonus > 0 ? '+' : '') + attack.damageBonus : ''}`;
    const hitResult = rollD20Check(attack.attackBonus, attack.weaponName, 'attack', advantageMode);
    const damageResult = rollDamage(dmgFormula, attack.weaponName);
    setSidebar({ type: 'attack', attack, hitResult, damageResult });
    addToHistory(hitResult);
    addToHistory(damageResult);
  }, [advantageMode, addToHistory]);

  /* ── Sidebar reroll helpers ── */
  const rerollSkill = () => {
    if (sidebar?.type === 'skill') {
      const abbr = ATTR_ABBR[sidebar.skill.attribute] ?? sidebar.skill.attribute;
      const result = rollD20Check(sidebar.skill.modifier, `${sidebar.skill.label} (${abbr})`, 'check', advantageMode);
      setSidebar({ ...sidebar, result });
      addToHistory(result);
    }
  };

  const rerollSave = () => {
    if (sidebar?.type === 'save') {
      const result = rollD20Check(sidebar.save.modifier, `Teste de Resistência (${sidebar.save.label})`, 'save', advantageMode);
      setSidebar({ ...sidebar, result });
      addToHistory(result);
    }
  };

  const rerollAttackHit = () => {
    if (sidebar?.type === 'attack') {
      const hitResult = rollD20Check(sidebar.attack.attackBonus, sidebar.attack.weaponName, 'attack', advantageMode);
      setSidebar({ ...sidebar, hitResult });
      addToHistory(hitResult);
    }
  };

  const rerollAttackDamage = () => {
    if (sidebar?.type === 'attack') {
      const atk = sidebar.attack;
      const dmgFormula = `${atk.damageDice}${atk.damageBonus !== 0 ? (atk.damageBonus > 0 ? '+' : '') + atk.damageBonus : ''}`;
      const damageResult = rollDamage(dmgFormula, atk.weaponName);
      setSidebar({ ...sidebar, damageResult });
      addToHistory(damageResult);
    }
  };

  /* Ability detail: roll from within ability sidebar */
  const handleAbilitySkillRoll = (label: string, modifier: number) => {
    const result = rollD20Check(modifier, label, 'check', advantageMode);
    const fakeSkill: DerivedSkill = { label, attribute: sidebar?.type === 'ability' ? sidebar.key : '', modifier, proficient: false };
    setSidebar({ type: 'skill', skill: fakeSkill, result });
    addToHistory(result);
  };

  const handleAbilitySaveRoll = (modifier: number) => {
    if (sidebar?.type === 'ability') {
      const result = rollD20Check(modifier, `Teste de Resistência (${sidebar.label})`, 'save', advantageMode);
      const fakeSave: DerivedSavingThrow = { label: sidebar.label, attribute: sidebar.key, modifier, proficient: false };
      setSidebar({ type: 'save', save: fakeSave, result });
      addToHistory(result);
    }
  };

  /* ── Derived values ── */
  const hpPercent = effectiveMaxHP > 0 ? (playState.currentHp / effectiveMaxHP) * 100 : 0;
  const hpColor = hpPercent > 50 ? '#4ade80' : hpPercent > 25 ? '#fbbf24' : '#f87171';

  /* ── Sidebar content renderer ── */
  const renderSidebarContent = () => {
    if (!sidebar) return null;

    switch (sidebar.type) {
      case 'skill':
        return (
          <DiceResultPanel
            result={sidebar.result}
            onReroll={rerollSkill}
          />
        );

      case 'save':
        return (
          <DiceResultPanel
            result={sidebar.result}
            onReroll={rerollSave}
          />
        );

      case 'ability': {
        const relatedSkills = derivedSheet.skills
          .filter(s => s.attribute === sidebar.key)
          .map(s => ({ label: s.label, modifier: s.modifier, proficient: s.proficient }));
        const savingThrow = derivedSheet.derivedSavingThrows.find(st => st.attribute === sidebar.key);
        return (
          <AbilityDetailPanel
            abilityName={sidebar.label}
            score={sidebar.score}
            modifier={sidebar.modifier}
            relatedSkills={relatedSkills}
            savingThrow={savingThrow ? { modifier: savingThrow.modifier, proficient: savingThrow.proficient } : undefined}
            onRollSkill={handleAbilitySkillRoll}
            onRollSave={handleAbilitySaveRoll}
          />
        );
      }

      case 'attack':
        return (
          <AttackDetailPanel
            weaponName={sidebar.attack.weaponName}
            range={sidebar.attack.range}
            properties={sidebar.attack.properties}
            hitResult={sidebar.hitResult}
            damageResult={sidebar.damageResult}
            damageType={sidebar.attack.damageType}
            onRerollHit={rerollAttackHit}
            onRerollDamage={rerollAttackDamage}
          />
        );

      case 'history':
        return (
          <div className={styles.historyList}>
            {(playState.diceHistory ?? []).length === 0 ? (
              <div className={styles.historyEmpty}>Nenhuma rolagem registrada.</div>
            ) : (
              (playState.diceHistory ?? []).map((entry, i) => (
                <div key={`${entry.timestamp}-${i}`} className={styles.historyEntry}>
                  <div className={styles.historyLabel}>{entry.label}</div>
                  <div className={styles.historyTotal}>{entry.total}</div>
                  <div className={styles.historyType}>{entry.type}</div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const sidebarTitle = sidebar
    ? sidebar.type === 'skill' ? sidebar.skill.label
      : sidebar.type === 'save' ? 'Teste de Resistência'
        : sidebar.type === 'ability' ? sidebar.label
          : sidebar.type === 'attack' ? sidebar.attack.weaponName
            : sidebar.type === 'history' ? 'Histórico de Rolagens'
              : ''
    : '';

  const sidebarSubtitle = sidebar
    ? sidebar.type === 'skill' ? `Teste de Perícia (${ATTR_ABBR[sidebar.skill.attribute] ?? sidebar.skill.attribute})`
      : sidebar.type === 'save' ? sidebar.save.label
        : sidebar.type === 'ability' ? `Score ${sidebar.score} · Modificador ${signedMod(sidebar.modifier)}`
          : sidebar.type === 'attack' ? `${sidebar.attack.range}`
            : sidebar.type === 'history' ? `Últimas ${(playState.diceHistory ?? []).length} rolagens`
              : undefined
    : undefined;

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
            creatureSize={derivedSheet.creatureSize}
            alignment={alignment}
            subclassName={subclassName}
            classLevels={classLevels}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Advantage Mode Toggle */}
            <div className={styles.advantageToggle}>
              {(['normal', 'advantage', 'disadvantage'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setAdvantageMode(mode)}
                  className={advantageMode === mode ? `${styles.advantageBtn} ${styles.advantageBtnActive}` : styles.advantageBtn}
                  title={mode === 'normal' ? 'Normal' : mode === 'advantage' ? 'Vantagem' : 'Desvantagem'}
                >
                  {mode === 'normal' ? '⚖' : mode === 'advantage' ? '▲' : '▼'}
                </button>
              ))}
            </div>
            {/* History button */}
            <button
              onClick={() => window.print()}
              className={styles.restBtn}
              title="Imprimir / Exportar PDF"
            >
              🖨 IMPRIMIR
            </button>
            <button
              onClick={() => setSidebar({ type: 'history' })}
              className={styles.restBtn}
              title="Histórico de Rolagens"
            >
              🎲 HISTÓRICO
            </button>
            <button
              onClick={() => setShortRestOpen(prev => !prev)}
              className={shortRestOpen ? `${styles.restBtn} ${styles.restBtnActive}` : styles.restBtn}
            >
              DESCANSO CURTO
            </button>
            <button
              onClick={() => setRestModal('long')}
              className={styles.restBtn}
            >
              DESCANSO LONGO
            </button>
          </div>
        </div>

        {/* Short Rest Overlay */}
        {shortRestOpen && (
          <div className={`${styles.redBox} ${styles.shortRestOverlay}`}>
            <div className={styles.sectionHeader}>DESCANSO CURTO</div>
            <div className={styles.shortRestControls}>
              <span className={styles.shortRestLabel}>
                Dado(s) de Vida ({derivedSheet.hitDie}):
              </span>
              <input
                type="number"
                min="1"
                max={availableHitDice}
                value={hdCount}
                onChange={e => setHdCount(e.target.value)}
                className={styles.shortRestInput}
              />
              <span className={styles.shortRestLabel}>
                Disponíveis: {availableHitDice}/{totalHitDice}
              </span>
              <button
                onClick={handleShortRest}
                className={styles.shortRestBtn}
                disabled={availableHitDice <= 0}
              >
                Recuperar PV
              </button>
            </div>
          </div>
        )}

        {/* ROW 2: Stats Row - Abilities, PB, Speed, Heroic Insp, HP */}
        <div className={styles.statsRow}>

          {/* Atributos */}
          <AbilityScoreCards
            finalAttributes={derivedSheet.finalAttributes}
            modifiers={derivedSheet.modifiers}
            attributeBreakdowns={derivedSheet.attributeBreakdowns}
            onAbilityClick={handleAbilityClick}
          />

          {/* Proficiency Bonus */}
          <div className={styles.statBox}>
            <div className={styles.statValue}>{signedMod(derivedSheet.proficiencyBonus)}</div>
            <div className={styles.statLabel}>Proficiência</div>
          </div>

          {/* Speed */}
          <div className={styles.statBox}>
            <div className={styles.statValueInline}>
              {derivedSheet.speed}<span className={styles.statUnit}>m</span>
            </div>
            <div className={styles.statLabel}>Deslocamento</div>
          </div>

          {/* Hit Dice */}
          <div className={styles.statBox} title={`${availableHitDice} de ${totalHitDice} dados de vida disponíveis`}>
            <div className={styles.statValue}>{availableHitDice}<span className={styles.statFraction}>/{totalHitDice}</span></div>
            <div className={styles.hitDiceDots}>
              {Array.from({ length: totalHitDice }, (_, i) => (
                <span key={i} className={i < availableHitDice ? styles.hdDotFilled : styles.hdDotSpent} />
              ))}
            </div>
            <div className={styles.statLabel}>
              Dados de Vida ({derivedSheet.hitDie})
            </div>
          </div>

          {/* Heroic Inspiration */}
          <div
            className={`${styles.heroicBox} ${playState.heroicInspiration ? styles.heroicBoxActive : ''}`}
            onClick={toggleInspiration}
            role="checkbox"
            aria-checked={playState.heroicInspiration}
            aria-label="Inspiração Heróica"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleInspiration(); }}
          >
            {playState.heroicInspiration && <span className={styles.heroicCheck}>✓</span>}
            <span className={styles.heroicLabel}>Insp.<br/>Heróica</span>
          </div>

          {/* HP Panel */}
          <div style={{ flex: 1 }}>
            <div
              className={`${styles.redBox} ${hpPulse === 'damage' ? styles.hpPulseDamage : hpPulse === 'heal' ? styles.hpPulseHeal : ''}`}
              style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column' }}
            >
              <div className={styles.hpHeader}>
                <div className={styles.sectionHeader}>PONTOS DE VIDA</div>
                <div className={styles.hpHeaderBtns}>
                  <input
                    type="number"
                    min="0"
                    value={hpInput}
                    onChange={e => setHpInput(e.target.value)}
                    className={styles.hpInput}
                  />
                  <button onClick={handleHeal} className={styles.healBtn}>Curar</button>
                  <button onClick={handleDamage} className={styles.damageBtn}>Dano</button>
                  <button onClick={handleTempHp} className={styles.tempBtn}>Temp</button>
                </div>
              </div>

              <div className={styles.hpLabels}>
                <span className={styles.hpLabel}>ATUAL</span>
                <span className={styles.hpLabel}>MÁXIMO</span>
                <span className={styles.hpLabel}>TEMP</span>
              </div>

              <div className={styles.hpValues}>
                <span className={styles.hpCurrent} style={{ color: hpColor }}>{playState.currentHp}</span>
                <span className={styles.hpSeparator}>/</span>
                <span className={styles.hpMax}>{effectiveMaxHP}</span>
                <span className={styles.hpTemp}>{playState.tempHp > 0 ? playState.tempHp : '--'}</span>
              </div>

              <div className={styles.hpBar}>
                <div className={styles.hpBarFill} style={{ width: `${Math.min(hpPercent, 100)}%`, background: hpColor }} />
              </div>
            </div>
          </div>

        </div>

        {/* ROW XP + LEVEL */}
        <div className={styles.xpRow}>
          {onSetLevel && (
            <div className={styles.levelCtrl}>
              <button
                className={styles.levelBtn}
                onClick={() => onSetLevel(Math.max(1, characterLevel - 1))}
                disabled={characterLevel <= 1}
                title="Diminuir nível"
              >−</button>
              <span className={styles.levelDisplay}>NIV {characterLevel}</span>
              <button
                className={styles.levelBtn}
                onClick={() => setShowLevelUp(true)}
                disabled={characterLevel >= 20}
                title="Aumentar nível"
              >+</button>
              {onAddClass && characterLevel >= 1 && (
                <button
                  className={styles.levelBtn}
                  onClick={() => setShowAddClass(true)}
                  title="Adicionar classe (multiclasse)"
                  style={{ marginLeft: 4, fontSize: '0.7rem', width: 'auto', padding: '0 6px' }}
                >+ Classe</button>
              )}
            </div>
          )}
          <span className={styles.xpLabel}>XP</span>
          <span className={styles.xpValue}>{currentXP.toLocaleString()}</span>
          <div className={styles.xpBarWrap}>
            <div className={styles.xpBarFill} style={{ width: `${Math.min(xpPercent, 100)}%` }} />
          </div>
          <span className={styles.xpMeta}>
            {xpLevel >= 20 ? 'Máx.' : `Próx. Nível: ${xpNextCeil.toLocaleString()} XP`}
          </span>
          <input
            type="number"
            min="0"
            value={xpInput}
            onChange={e => setXpInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddXP(); }}
            placeholder="+XP"
            className={styles.xpInput}
          />
          <button onClick={handleAddXP} className={styles.xpBtn}>Adicionar</button>
        </div>

        {/* ROW 3: Sub-Row - Iniciativa, AC, Death Saves, Defesas, Condições */}
        <div className={styles.subRow}>

          {/* Iniciativa + AC */}
          <div className={styles.subRowStatGroup}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{signedMod(derivedSheet.initiative)}</div>
              <div className={styles.statLabel}>INICIATIVA</div>
            </div>
            <div className={`${styles.statBox} ${styles.statBoxShield}`}>
              <div className={styles.statValue}>{derivedSheet.armorClass}</div>
              <div className={styles.statLabel}>CLASSE ARMADURA</div>
            </div>
          </div>

          {/* Death Saves + Defesas + Condições */}
          <div className={styles.subRowPanels}>
            {/* Death Saves */}
            <div className={styles.redBox} style={{ flex: 0.8, padding: '16px 12px' }}>
              <div className={styles.sectionHeader}>TESTES CONTRA A MORTE</div>
              <DeathSavesCard
                deathSaves={playState.deathSaves}
                onUpdate={handleUpdateDeathSaves}
              />
            </div>

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
                concentratingOn={playState.concentratingOn}
                onAdd={handleAddCondition}
                onRemove={handleRemoveCondition}
                onStopConcentrating={() => onUpdatePlayState(prev => ({ ...prev, concentratingOn: null }))}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ===== BOTTOM PANELS (SUB-PAINÉIS) ===== */}
      <div className={styles.mainGrid} style={{ marginTop: '24px' }}>

        {/* Painel Esquerdo */}
        <div className={styles.colLeft}>
          <div className={styles.redBox}>
            <div className={styles.sectionHeader}>TESTES DE RESISTÊNCIA ⚙</div>
            <SavingThrowsCard
              derivedSavingThrows={derivedSheet.derivedSavingThrows}
              onSaveClick={handleSaveClick}
            />
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

        {/* Painel Direito */}
        <div className={styles.bottomPanel}>

          {/* Skills */}
          <div className={`${styles.redBox} ${styles.skillsPanel}`}>
            <div className={styles.sectionHeader}>PERÍCIAS ⚙</div>
            <SkillsCard
              skills={derivedSheet.skills}
              onSkillClick={handleSkillClick}
              expertiseSkills={playState.expertiseSkills ?? []}
              canGrantExpertise={derivedSheet.classGrantsExpertise}
              expertiseCount={derivedSheet.expertiseCount}
              onToggleExpertise={(label) => {
                onUpdatePlayState(prev => {
                  const list = prev.expertiseSkills ?? [];
                  const next = list.includes(label)
                    ? list.filter(s => s !== label)
                    : list.length < derivedSheet.expertiseCount
                      ? [...list, label]
                      : list;
                  return { ...prev, expertiseSkills: next };
                });
              }}
            />
          </div>

          {/* Tabs */}
          <div className={`${styles.redBox} ${styles.tabsPanel}`}>
            <SheetTabs
              derivedSheet={derivedSheet}
              playState={playState}
              onUpdatePlayState={onUpdatePlayState}
              classFeatures={classFeatures}
              speciesTraits={speciesTraits}
              inventory={inventory}
              learnedCantrips={learnedCantrips}
              preparedSpells={preparedSpells}
              onUpdatePreparedSpells={onUpdatePreparedSpells}
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
              onAttackClick={handleAttackClick}
              currency={currency}
              onUpdateCurrency={onUpdateCurrency}
              backstory={backstory}
              appearance={appearance}
              personalityTraits={personalityTraits}
              faith={faith}
              lifestyle={lifestyle}
              organizations={organizations}
              alignment={alignment}
              onUpdateIdentity={onUpdateIdentity}
              classId={classId}
            />
          </div>
        </div>

      </div>

      {/* ===== SIDEBAR ===== */}
      <SheetSidebar
        isOpen={sidebar !== null}
        onClose={closeSidebar}
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
      >
        {renderSidebarContent()}
      </SheetSidebar>

      {/* ===== REST MODAL ===== */}
      <RestModal
        type={restModal ?? 'long'}
        isOpen={restModal !== null}
        onClose={() => setRestModal(null)}
        onConfirm={restModal === 'long' ? handleLongRest : handleShortRest}
      />

      {onSetLevel && classId && (
        <LevelUpModal
          isOpen={showLevelUp}
          onClose={() => setShowLevelUp(false)}
          onConfirm={(newLevel, levelUpClassId) => {
            if (levelUpClassId && onLevelUpClass) {
              onLevelUpClass(levelUpClassId);
            }
            onSetLevel(newLevel);
            setShowLevelUp(false);
          }}
          currentLevel={characterLevel}
          classId={classId}
          className={className}
          classFeatures={classFeatures}
          derivedSheet={derivedSheet}
          classLevels={classLevels}
        />
      )}

      {onAddClass && classLevels && (
        <AddClassModal
          isOpen={showAddClass}
          onClose={() => setShowAddClass(false)}
          onAddClass={(id, name) => { onAddClass(id, name); setShowAddClass(false); }}
          currentClassLevels={classLevels}
          derivedSheet={derivedSheet}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import bgData from './data/db.json'
import classDetailsData from './data/classDetails.json'
import weaponsData from './data/weapons.json'
import backgroundsData from './data/backgrounds.json'
import talentsData from './data/talents.json'
import speciesData from './data/species.json'
import languagesData from './data/languages.json'
import equipmentJson from './data/equipment.json'
import armorJson from './data/armor.json'
import { TalentChoiceSection, checkTalentComplete, countVisibleTalentChoices } from './components/TalentChoices'
import { SpellTooltip } from './components/SpellTooltip'
import { CANTRIPS_BY_LIST, ARTISAN_TOOLS, MUSICAL_INSTRUMENTS, GAMING_SETS } from './data/talentChoiceConfig'
import { ToolTooltip } from './components/ToolTooltip'
import { AttributesStep } from './components/AttributesStep'
import { SpeciesDetails } from './components/SpeciesDetails'
import { GlossaryTooltipProvider } from './components/GlossaryTooltip'
import { EquipmentStep } from './components/EquipmentStep'
// isAttributesStepComplete is now consumed inside validation.ts
import { deriveSheet } from './rules/engine/index'
import { validateChoices } from './rules/engine/validation'
import { calculateMaxHP as engineCalculateMaxHP } from './rules/calculators/combat'
import { getClassHPData } from './rules/data/classRules'
import type { CharacterChoices, BackgroundBonusDistribution } from './rules/types/CharacterChoices'
import { CharacterSheetPage } from './components/sheet/CharacterSheetPage'
import type { CharacterPlayState } from './types/playState'
import { DEFAULT_PLAY_STATE } from './types/playState'
import { getSpeciesTraits, getSpeciesName } from './rules/data/speciesRules'
import './index.css'

import { formatDice, ATTRIBUTE_MAP, getSkillParts } from './utils/formatting'

// Lookup map: item name → cost string (built once from all equipment sources)
const ITEM_COST_MAP = new Map<string, string>();
{
  const gearItems = (equipmentJson as any).adventuringGear ?? [];
  for (const item of gearItems) {
    if (item.name && item.cost) ITEM_COST_MAP.set(item.name, item.cost);
  }
  for (const category of ['simpleMelee', 'simpleRanged', 'martialMelee', 'martialRanged'] as const) {
    for (const item of (weaponsData as any)[category] ?? []) {
      if (item.name && item.cost) ITEM_COST_MAP.set(item.name, item.cost);
    }
  }
  for (const category of ['lightArmor', 'mediumArmor', 'heavyArmor', 'shield'] as const) {
    for (const item of (armorJson as any)[category] ?? []) {
      if (item.name && item.cost) ITEM_COST_MAP.set(item.name, item.cost);
    }
  }
}

const FANTASY_NAMES = [
  "Aelar", "Vaelis", "Thorin", "Lyra", "Kael", "Seraphine", "Dorian", "Nyx", "Brom", "Elira", 
  "Fenric", "Mirella", "Zephyr", "Talia", "Garruk", "Isolde", "Riven", "Althea", "Cedric", "Vex", 
  "Lorcan", "Selene", "Draven", "Arwen", "Malrik", "Ysolda", "Eldrin", "Kiera", "Haldor", "Nimue", 
  "Varian", "Maelis", "Torvin", "Calista", "Zarek", "Ophelia", "Ragnar", "Velora", "Faelar", "Brynn", 
  "Corwin", "Sylva", "Baelric", "Amaris", "Jareth", "Lunara", "Orin", "Thalia", "Keldor", "Miriel", 
  "Daeron", "Eira", "Hadrian", "Nerys", "Alaric", "Vanya", "Rowan", "Lilith", "Cassian", "Elowen", 
  "Durik", "Sable", "Theron", "Anwyn", "Bastian", "Naivara", "Lucan", "Freya", "Orrin", "Zinnia", 
  "Valtor", "Kaida", "Emric", "Soraya", "Tiber", "Aisla", "Renwick", "Ysara", "Leoric", "Ilyana", 
  "Magnus", "Rhea", "Aric", "Tessara", "Borik", "Myra", "Evander", "Siora", "Dain", "Vespera", 
  "Talion", "Aurelia", "Gideon", "Nymera", "Ulric", "Celesse", "Brann", "Ilvara", "Soren", "Ravena", 
  "Kaelen", "Morgana", "Darian", "Elsin", "Fenna", "Tyrael", "Orla", "Kharon", "Ithiel", "Merric", 
  "Azura", "Drogan", "Selka", "Lysander", "Morwen", "Brennar", "Elysia", "Thane", "Nuala", "Cassia", 
  "Viggo", "Amara", "Roderic", "Shaela", "Ardyn", "Velkyn", "Meridia", "Jorund", "Alina", "Tavian", 
  "Sylvara", "Borin", "Elara", "Noctis", "Perrin", "Aurek", "Virella", "Galen", "Selyra", "Hector", 
  "Minara", "Zorin", "Asha", "Cyran", "Belira", "Tristan", "Morga", "Eamon", "Faenra", "Rurik", 
  "Saelis", "Valen", "Isera", "Korin", "Delphine", "Alastor", "Neryssa", "Garron", "Elirae", "Marek", 
  "Liora", "Thera", "Baldric", "Syris", "Melis", "Ravik", "Aelira", "Halvar", "Tindra", "Caelan", 
  "Voren", "Ygritte", "Iskandar", "Mireth", "Toren", "Aveline", "Fenlan", "Sabira", "Jasker", "Nyra", 
  "Corlaith", "Baelor", "Zafira", "Lorien", "Mordai", "Elyndra", "Stellan", "Olivra", "Kasimir", "Vaera", 
  "Darius", "Ione", "Thalor", "Senna", "Beren", "Valka", "Cyric", "Elthea", "Rolan", "Saphira", 
  "Drystan", "Kallista", "Aeron", "Mireya", "Varric", "Talindra", "Jorik", "Elowyn", "Corbin", "Yselle", 
  "Lucien", "Maevis", "Tormund", "Ariadne", "Nolan", "Virel", "Briar", "Alis", "Dainor", "Erielle", 
  "Kaesor", "Luthien", "Baric", "Talyra", "Merrin", "Sigrid", "Orik", "Vasha", "Therin", "Illyra", 
  "Gorim", "Vaela", "Dacian", "Roswyn", "Eldric", "Nivara", "Zanric", "Iria", "Cassiel", "Velmira", 
  "Brogan", "Thaela", "Faustus", "Luneth", "Torvald", "Riona", "Caldor", "Sylvi", "Harkin", "Aenys", 
  "Varis", "Mirava", "Kestrel", "Ondine", "Halric", "Seris", "Bram", "Taryana", "Oberon", "Caelys", 
  "Ronan", "Ismeria", "Tarek", "Nym", "Veldrin", "Astra", "Jarik", "Lilwen", "Milo", "Rynna", 
  "Khaldor", "Esme", "Travor", "Ysoria", "Caspian", "Nerida", "Alden", "Vexa", "Berric", "Selkaia", 
  "Malthor", "Idris", "Taliah", "Rivena", "Donar", "Elmira", "Leif", "Zaria", "Caedmon", "Nessa", 
  "Falken", "Miris", "Aren", "Thessaly", "Volen", "Kyria", "Edric", "Lysara", "Torrek", "Anora", 
  "Kelric", "Sybil", "Merek", "Oriana", "Blaise", "Tirra", "Rhydian", "Elva", "Durgan", "Maera", 
  "Azriel", "Noa", "Hesper", "Calyx", "Tovin", "Rylia", "Malen", "Sorrel", "Jarven", "Xanthe", 
  "Varek", "Elaris", "Bodin", "Sarena", "Ivar", "Melora", "Zerin", "Tavia", "Ansel", "Vaelora", 
  "Haron", "Lyss", "Demeris", "Quilla", "Tarian", "Osric", "Mirel", "Kaevin", "Liorae", "Branik", 
  "Fiora", "Keldrin", "Zevra", "Armand", "Nyelle", "Thrain", "Aelene", "Corvus", "Daelia", "Rune", 
  "Serilda", "Morcant", "Yvaine", "Talos", "Eirlys", "Jovan", "Maelle", "Ragnarok", "Vireya", "Alar", 
  "Nyssa", "Bastion", "Cerys", "Dorin", "Ayla", "Faolan", "Maris", "Leovan", "Sylrin", "Grisel", 
  "Darok", "Eleni", "Tiberius", "Valira", "Nox", "Ruelle", "Hadar", "Mirevine", "Kaelor", "Siona", 
  "Brisa", "Malric", "Tahlia", "Gareth", "Isra", "Torlan", "Elisande", "Fenros", "Lirael", "Jorvan", 
  "Saela", "Vorn", "Celandine", "Radek", "Mylis", "Borek", "Anika", "Cairn", "Velis", "Drevan", 
  "Talisa", "Orlan", "Vireth", "Kelda", "Arthus", "Naeris", "Loric", "Brienne", "Storm", "Irisa", 
  "Daegon", "Meris", "Halden", "Sylene", "Zarekai", "Ivara", "Caius", "Maerwynn", "Bromir", "Aeris", 
  "Thalion", "Nisara", "Garric", "Elirah", "Valkor", "Selyne", "Renna", "Davor", "Ailith", "Torik", 
  "Valis", "Mirethiel", "Kaidaa", "Jarethor", "Eryn", "Dusk", "Amariel", "Halvor", "Nymeri", "Calen", 
  "Orsik", "Velira", "Tavianor", "Rhosyn", "Eldra", "Branikor", "Lucasta", "Varro", "Ilys", "Morrigan", 
  "Berenor", "Thyra", "Kain", "Elowis", "Dariane", "Rurikson", "Zephira", "Aldric", "Mirelle", "Vaeron", 
  "Kallor", "Selvara", "Torian", "Aurette", "Galenor", "Virela", "Drakar", "Illyth", "Caelia", "Roderan", 
  "Nyxara", "Balin", "Seren", "Mavrik", "Orelia", "Faeris", "Korrin", "Lysenna", "Varekhan", "Tirian", 
  "Elsinor", "Brynja", "Morthos", "Aevra", "Jastor", "Rinla", "Kaelith", "Vesper", "Druin", "Sylara", 
  "Havor", "Evania", "Orien", "Maelisra", "Therok", "Lioraen", "Brenor", "Sivra", "Korben", "Astraea", 
  "Aurel", "Cassiel", "Seraphion", "Ithur", "Valenor", "Elyas", "Seraphina", "Althea", "Lumiel", 
  "Caelia", "Isara", "Vaelora", "Solen", "Auriel", "Remiel", "Lys", "Eiren", "Sael", "Brokk", 
  "Durgan", "Thorik", "Barend", "Kharum", "Rurik", "Hilda", "Brynja", "Sigrun", "Dagna", "Torvi", 
  "Helga", "Brum", "Keld", "Durim", "Thrain", "Marn", "Orik", "Rhogar", "Vaerax", "Drakon", 
  "Zorvath", "Kyrash", "Tharion", "Saryndra", "Vashara", "Nyrissa", "Tazira", "Rhessia", "Kaivara", 
  "Zevrath", "Arjhan", "Veyr", "Khazir", "Dravax", "Soryx", "Eryndor", "Lythienne", "Elenwe", 
  "Myriel", "Lior", "Nyri", "Boddynock", "Nib", "Orryn", "Wrenk", "Tavin", "Fizzik", "Bimpnottin", 
  "Nissa", "Ellywick", "Pina", "Tinkra", "Vela", "Pip", "Tink", "Nix", "Fenn", "Biri", "Wizzle", 
  "Hekra", "Shura", "Torga", "Brynra", "Korr", "Rhok", "Varn", "Thokar", "Gorrin", "Harn", 
  "Tobin", "Alton", "Roscoe", "Nedda", "Poppy", "Marigold", "Tansy", "Ruby", "Elsi", "Cora", 
  "Sunny", "Ashby", "Merry", "Helena", "Mira", "Evelin", "Avery", "River", "Arden", "Grom", 
  "Urzak", "Mardok", "Thokk", "Brug", "Hargan", "Ogra", "Varka", "Druma", "Horga", "Mazga", 
  "Rokka", "Krag", "Vorg", "Ruk", "Drok", "Zag", "Murr", "Azrik", "Malvek", "Zephon", "Kairon", 
  "Nerezza", "Varix", "Lilistra", "Zariela", "Mirevra", "Ashen", "Hex", "Onyx", "Caelir", 
  "Ithran", "Melvar", "Elarion", "Arannis", "Velatha", "Erysse", "Thalira", "Aerin", "Ilaris", 
  "Syl", "Vaen", "Leth", "Miren", "Baern", "Kardum", "Morgran", "Tordek", "Fargrim", "Gudrun", 
  "Astrid", "Korva", "Brenna", "Ylga", "Dworra", "Storn", "Korrum", "Drum", "Bhal", "Kurn", 
  "Thold", "Xareth", "Dazriel", "Mephor", "Luceris", "Vaezor", "Calyxia", "Seriss", "Morvanna", 
  "Zafyra", "Nexa", "Cinder", "Thorn", "Ember", "Shade", "Vale"
];

interface Selection {
  id: string;
  name: string;
  description: string;
  [key: string]: any;
}

interface Character {
  name: string;
  portrait: string | null;
  species: Selection | null;
  characterClass: Selection | null;
  choices: Record<string, string>;
  talentSelections: Record<string, Record<string, string>>;
  languages: string[];
  attributes: {
    method: "standard" | "random" | "pointBuy" | null;
    base: Record<string, number>;
    backgroundBonus: Record<string, number>;
    final: Record<string, number>;
    modifiers: Record<string, number>;
    randomRolls?: Array<{
      dice: number[];
      dropped: number;
      total: number;
      assignedTo: string | null;
    }>;
    pointBuySpent?: number;
  };
  equipment: {
    classOption: 'A' | 'B' | null;
    backgroundOption: 'A' | 'B' | null;
    startingEquipmentAdded: boolean;
    inventory: any[];
    currency: { cp: number; sp: number; ep: number; gp: number; pp: number; };
    equippedArmorId: string | null;
    hasShieldEquipped: boolean;
  };
  spells: {
    learnedCantrips: string[];
    preparedSpells: string[];
  };
}

const FeatureExpandable = ({ 
  feature, 
  needsChoice = false, 
  options, 
  choices, 
  onChoiceChange,
  allSelections 
}: { 
  feature: any, 
  needsChoice?: boolean, 
  options?: Array<{id: string, name: string, choices: string[], choiceDetails?: Record<string, string>, showWhen?: {id: string, value: string}, sourceChoicesIds?: string[], spellSource?: string, isSpell?: boolean}>,
  choices?: Record<string, string>,
  onChoiceChange?: (id: string, val: string) => void,
  allSelections?: string[] 
}) => {
  const [showMore, setShowMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [hoveredSpell, setHoveredSpell] = useState<string | null>(null);
  const [hoveredSpellRect, setHoveredSpellRect] = useState<DOMRect | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && contentRef.current) {
      const fullHeight = contentRef.current.scrollHeight;
      setNeedsTruncation(fullHeight > 120);
    }
  }, [isOpen]);
  
  return (
    <details
      style={{
        background: '#1a1b23',
        borderRadius: '8px',
        border: needsChoice ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.05)',
        marginBottom: '8px',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
      onToggle={(e) => { setIsOpen(e.currentTarget.open); setShowMore(false); }}
    >
      <summary style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {needsChoice && (
            <div 
              style={{
                width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#f97316', 
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0,
                boxShadow: '0 0 8px rgba(249,115,22,0.4)'
              }}
              title="Ação Necessária"
            >
              !
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: '500' }}>{feature.name}</span>
            <span style={{ fontSize: '0.7rem', lineHeight: 1, display: 'block' }}>
              {options && (() => {
                const visibleOptions = options.filter(o => !o.showWhen || choices?.[o.showWhen.id] === o.showWhen.value);
                const totalOptions = visibleOptions.length;
                return totalOptions > 0 ? (
                  <span style={{ color: needsChoice ? '#f97316' : '#64748b' }}>{totalOptions} Escolha{totalOptions > 1 ? 's' : ''} — </span>
                ) : null;
              })()}
              <span style={{ color: '#94a3b8' }}>Nível {feature.level}</span>
            </span>
          </div>
        </div>
        <span className="summary-chevron" style={{ color: '#cbd5e1', fontSize: '0.8rem', opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
      </summary>
      
      {isOpen && (
        <div className="details-content" style={{ borderTop: needsChoice ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '14px 18px', color: '#d1d5db', fontSize: '0.85rem', lineHeight: '1.65', textAlign: 'left' }}>
          <div 
            ref={contentRef}
            style={!showMore && needsTruncation ? { 
              maxHeight: '120px', 
              overflow: 'hidden',
              maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
            } : {}}
            dangerouslySetInnerHTML={{ __html: feature.description }}
          />
          
          {needsTruncation && (
            <button 
              onClick={(e) => { e.preventDefault(); setShowMore(!showMore); }} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#94a3b8',
                fontWeight: '400', 
                fontStyle: 'italic',
                cursor: 'pointer', 
                padding: '0', 
                marginTop: '12px', 
                fontSize: '0.75rem',
                display: 'inline-block',
                opacity: 0.8,
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#cbd5e1'}
              onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              {showMore ? 'esconder' : 'ler mais...'}
            </button>
          )}

          {options && options.map(opt => {
            // showWhen: só renderiza se a condição for satisfeita
            if (opt.showWhen && choices?.[opt.showWhen.id] !== opt.showWhen.value) return null;

            const isWeaponMastery = opt.id.includes('weapon-mastery');
            const selectedWeaponName = choices?.[opt.id];

            // Helper to find weapon and mastery
            let selectedWeaponObj = null;
            if (isWeaponMastery && selectedWeaponName) {
               const allWeapons = [
                 ...weaponsData.simpleMelee,
                 ...weaponsData.martialMelee,
                 ...weaponsData.simpleRanged,
                 ...weaponsData.martialRanged
               ];
               selectedWeaponObj = allWeapons.find(w => w.name === selectedWeaponName);
            }

            // Computar a lista de escolhas efetiva
            const effectiveChoices: string[] = opt.sourceChoicesIds
              ? opt.sourceChoicesIds.map(id => choices?.[id]).filter(Boolean) as string[]
              : opt.spellSource
              ? (CANTRIPS_BY_LIST[opt.spellSource === 'druida' ? 'Druida' : 'Clérigo'] || [])
              : opt.choices;

            return (
              <div key={opt.id} style={{ marginTop: '10px' }}>
                <select
                  className="premium-select"
                  value={choices?.[opt.id] || ''}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    onChoiceChange?.(opt.id, newVal);
                    if (!newVal) {
                      options.forEach(o => {
                        if (o.showWhen?.id === opt.id) onChoiceChange?.(o.id, '');
                      });
                    }
                  }}
                >
                  <option value="">- {opt.name} -</option>
                  {(() => {
                    if (isWeaponMastery) {
                      const categories = [
                        { name: "Armas Simples (Corpo a Corpo)", data: weaponsData.simpleMelee },
                        { name: "Armas Marciais (Corpo a Corpo)", data: weaponsData.martialMelee },
                        { name: "Armas Simples (À Distância)", data: weaponsData.simpleRanged },
                        { name: "Armas Marciais (À Distância)", data: weaponsData.martialRanged }
                      ];

                      return categories.map(cat => {
                        const catChoices = opt.choices.filter(choice =>
                          cat.data.some((w: any) => w.name === choice) &&
                          !options.some(otherOpt => otherOpt.id !== opt.id && choices?.[otherOpt.id] === choice)
                        );

                        if (catChoices.length === 0) return null;

                          return (
                            <optgroup key={cat.name} label={cat.name}>
                              {catChoices.map(c => {
                                const isSelectedElsewhere = allSelections?.includes(c) && choices?.[opt.id] !== c;
                                const w = cat.data.find((weapon: any) => weapon.name === c);
                                const displayName = w ? `${w.name} (${w.mastery})` : c;

                                return (
                                  <option
                                    key={c}
                                    value={c}
                                    className={isSelectedElsewhere ? 'option-taken' : ''}
                                  >
                                    {isSelectedElsewhere ? '✓ ' : ''}{displayName}
                                  </option>
                                );
                              })}
                            </optgroup>
                          );
                      });
                    }

                      return effectiveChoices
                        .filter(c => !options.some(otherOpt => otherOpt.id !== opt.id && choices?.[otherOpt.id] === c))
                        .map(c => {
                          const isSelectedElsewhere = allSelections?.includes(c) && choices?.[opt.id] !== c;
                          return (
                            <option
                              key={c}
                              value={c}
                              className={isSelectedElsewhere ? 'option-taken' : ''}
                            >
                              {isSelectedElsewhere ? '✓ ' : ''}{c}
                            </option>
                          );
                        });
                  })()}
                </select>

                {isWeaponMastery && selectedWeaponObj && (
                  <div style={{ marginTop: '12px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #f97316', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      Maestria · <span style={{ color: '#94a3b8', textTransform: 'none', letterSpacing: 'normal', fontWeight: 400 }}>{selectedWeaponObj.name}s</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontStyle: 'italic', fontSize: '0.9rem' }}>{selectedWeaponObj.mastery}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: '1.6' }}>{(weaponsData.masteries as Record<string, string>)[selectedWeaponObj.mastery]}</span>
                    </div>
                  </div>
                )}

                {opt.choiceDetails && choices?.[opt.id] && opt.choiceDetails[choices[opt.id]] && (
                  <div style={{ marginTop: '12px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #f97316' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: opt.choiceDetails[choices[opt.id]] }} />
                  </div>
                )}

                {opt.isSpell && choices?.[opt.id] && (
                  <div
                    style={{ position: 'relative', display: 'inline-block', marginTop: '6px' }}
                    onMouseEnter={(e) => { setHoveredSpell(opt.id); setHoveredSpellRect(e.currentTarget.getBoundingClientRect()); }}
                    onMouseLeave={() => { setHoveredSpell(null); setHoveredSpellRect(null); }}
                  >
                    <span style={{ color: '#38bdf8', fontSize: '0.78rem', cursor: 'help', borderBottom: '1px dotted #38bdf8' }}>
                      Detalhes da Magia
                    </span>
                    {hoveredSpell === opt.id && <SpellTooltip spellName={choices[opt.id]} anchorRect={hoveredSpellRect} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </details>
  );
};

const ProgressBar = ({ activeStep = 1, onStepClick, selections }: { activeStep?: number, onStepClick?: (stepIndex: number) => void, selections?: Record<number, string> }) => {
  const steps = [
    { num: 1, label: 'Classe' },
    { num: 2, label: 'Origem' },
    { num: 3, label: 'Espécie' },
    { num: 4, label: 'Atributos' },
    { num: 5, label: 'Equipamento' },
    { num: 6, label: 'Ficha' }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      overflowX: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
        {steps.map((s, i) => {
          const isActive   = s.num === activeStep;
          const isComplete = s.num < activeStep;
          const isClickable = (isComplete || s.num <= activeStep) && !!onStepClick;
          const selectionName = selections?.[s.num];

          return (
            <React.Fragment key={s.num}>
              {/* Step item */}
              <div
                onClick={() => isClickable && onStepClick(s.num - 1)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: isClickable ? 'pointer' : 'default',
                  userSelect: 'none',
                  minWidth: '78px',
                  transition: 'opacity 0.2s',
                  opacity: (isActive || isComplete) ? 1 : 0.4
                }}
              >
                {/* Badge circle */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isComplete ? '0.75rem' : '0.78rem',
                  fontWeight: '700',
                  transition: 'all 0.25s ease',
                  flexShrink: 0,
                  background: isActive
                    ? 'linear-gradient(135deg, #f97316, #ea580c)'
                    : isComplete ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#fff' : (isComplete ? '#f97316' : '#64748b'),
                  border: isActive
                    ? '1px solid #f97316'
                    : isComplete ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isActive ? '0 0 10px rgba(249,115,22,0.4)' : 'none'
                }}>
                  {isComplete ? '✓' : s.num}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: '0.65rem',
                  color: isActive ? '#f97316' : (isComplete ? '#e2e8f0' : '#64748b'),
                  fontWeight: isActive ? '700' : '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {s.label}
                </span>
                {/* Selection name (below label for completed steps) */}
                {isComplete && selectionName && (
                  <span style={{
                    fontSize: '0.6rem',
                    color: '#f97316',
                    fontWeight: '600',
                    maxWidth: '78px',
                    textAlign: 'center',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '-2px'
                  }}>
                    {selectionName}
                  </span>
                )}
              </div>
              {/* Line connector — aligned to badge center (14px from top) */}
              {i < steps.length - 1 && (
                <div style={{
                  width: '30px',
                  height: '1px',
                  background: s.num < activeStep ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.1)',
                  marginTop: '14px',
                  zIndex: 0
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const StepHeader = ({
  onPrev,
  onNext,
  canAdvance,
  activeStep,
  onStepClick,
  characterName,
  setCharacterName,
  portrait,
  onPortraitClick,
  selections
}: {
  onPrev?: () => void,
  onNext: () => void,
  canAdvance: boolean,
  activeStep: number,
  onStepClick: (step: number) => void,
  characterName: string,
  setCharacterName: (name: string) => void,
  portrait: string | null,
  onPortraitClick: () => void,
  selections?: Record<number, string>
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const showName = (activeStep === 1 ? onPrev !== undefined : activeStep >= 2 && activeStep <= 5);

  const generateNames = () => {
    const shuffled = [...FANTASY_NAMES].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 3));
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '2px',
      padding: '8px 0', 
      marginBottom: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(13, 11, 20, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        {onPrev ? (
          <button
            onClick={onPrev}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#e2e8f0'; }}
          >
            &laquo; Voltar
          </button>
        ) : <div style={{ width: '85px' }} />}

        <div style={{ flex: 1, overflow: 'hidden', margin: '0 20px' }}>
          <ProgressBar activeStep={activeStep} onStepClick={onStepClick} selections={selections} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
          <button
            onClick={onNext}
            style={{ 
              background: canAdvance ? 'transparent' : 'rgba(249,115,22,0.1)', 
              border: canAdvance ? '1px solid rgba(249,115,22,0.6)' : '1px solid rgba(249,115,22,0.2)', 
              color: canAdvance ? '#f97316' : 'rgba(249,115,22,0.4)', 
              padding: '6px 16px', 
              borderRadius: '6px', 
              cursor: canAdvance ? 'pointer' : 'not-allowed', 
              fontSize: '0.85rem', 
              whiteSpace: 'nowrap', 
              transition: 'all 0.2s',
              fontWeight: '600'
            }}
            disabled={!canAdvance}
            onMouseOver={canAdvance ? (e) => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.background = 'rgba(249,115,22,0.15)'; } : undefined}
            onMouseOut={canAdvance ? (e) => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.6)'; e.currentTarget.style.background = 'transparent'; } : undefined}
          >
            Avançar &raquo;
          </button>
        </div>
      </div>

      {showName && (
        <div className="header-name-container">
          <div 
            className={`profile-placeholder ${portrait ? 'has-image' : ''}`} 
            onClick={onPortraitClick} 
            title="Escolher retrato do personagem"
          >
            {portrait && <img src={`/imgs/portrait_caracter/${portrait}`} alt="Portrait" className="profile-image" />}
          </div>
          
          <div className="name-input-column">
            <label className="character-name-label">Nome do Personagem</label>
            <input 
              type="text" 
              className="character-name-input"
              value={characterName} 
              onChange={(e) => setCharacterName(e.target.value)} 
              placeholder="Digite o nome..."
            />
            <div className="suggestions-container">
              <button className="suggestions-link" onClick={generateNames}>
                MOSTRAR SUGESTÕES{suggestions.length > 0 ? ':' : ''}
              </button>
              
              {suggestions.length > 0 && (
                <div className="suggestions-display">
                  {suggestions.map((s, i) => (
                    <React.Fragment key={s}>
                      <span 
                        className="suggestion-item"
                        onClick={() => setCharacterName(s)}
                      >
                        {s}
                      </span>
                      {i < suggestions.length - 1 ? <span className="suggestion-separator">•</span> : ''}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PORTRAITS = [
  "636377825624852932.jpeg", "636377826514551742.jpeg", "636377827176444845.jpeg", "636377833949480548.jpeg",
  "636377839599106511.jpeg", "636377857915951259.jpeg", "636377867384281406.jpeg", "636377868391760750.jpeg",
  "636377871028699922.jpeg", "636377871943393080.jpeg", "636377874944041516.jpeg", "636377876890901493.jpeg",
  "636377877456196384.jpeg", "636377877582054386.jpeg", "636377877674410295.jpeg", "636377877759190874.jpeg",
  "636377877865944857.jpeg", "636377878055945748.jpeg", "636377878213343631.jpeg", "636377878996638946.jpeg",
  "636377879578607062.jpeg", "636377880886891259.jpeg", "636377884703064507.jpeg", "636377885173419481.jpeg",
  "636377886134378166.jpeg", "636377886265995342.jpeg", "636377886571004913.jpeg", "636377888514060153.jpeg",
  "636377888642793044.jpeg", "636377891051966547.jpeg", "636377891294116113.jpeg", "636378331895705713.jpeg",
  "636378853439963263.png", "636378855296814599.png", "636378855806248172.png", "637170097263375910.jpeg",
  "637170097736922312.jpeg", "637196226861852965.jpeg", "637196228800489268.jpeg", "637202352456448988.jpeg",
  "637202352610942198.jpeg", "637202353208535995.jpeg", "637202353564632120.jpeg", "637202353794223452.jpeg",
  "637202354046178287.jpeg", "637202354764353703.jpeg", "637266679682747968.jpeg", "637266679981174423.jpeg",
  "637266683289187350.jpeg", "637266683480879145.jpeg", "637266684422095871.jpeg", "637266684910216543.jpeg",
  "637266685203729541.jpeg", "637266685562647414.jpeg", "637266687014601953.jpeg", "637266687423483546.jpeg",
  "637266687900441862.jpeg", "637266688135291719.jpeg", "637266688318749793.jpeg", "637266688504785945.jpeg",
  "637266688690538868.jpeg", "637266688886542959.jpeg", "637266689149095286.jpeg", "637357517635289233.jpeg",
  "637357518239240098.jpeg", "637357519042803901.jpeg", "637357523066079195.jpeg", "637357523687331880.jpeg",
  "637357523942176357.jpeg", "637357524189989802.jpeg", "637357524422189676.jpeg", "637357524585926395.jpeg",
  "637357525360018805.jpeg", "637357525528936231.jpeg", "637357525849673478.jpeg", "637357525999957386.jpeg",
  "637680847766640164.jpeg", "637708176479303035.jpeg", "637708177404586460.jpeg", "637708177497566513.jpeg",
  "637708177804446295.jpeg", "637708177963097060.jpeg", "637708178262916934.jpeg", "637708178397594823.jpeg",
  "637708178997388462.jpeg", "637708179251388330.jpeg", "637708179478968121.jpeg", "637744502674195302.jpeg",
  "637744503506093873.jpeg", "637744503662273830.jpeg", "637744503894243724.jpeg", "637744504124033836.jpeg",
  "637744504346023623.jpeg", "637744504583227151.jpeg", "637744504876556784.jpeg", "637744505285137802.jpeg",
  "637744505516767784.jpeg", "637744506252638883.jpeg", "637829133852582062.jpeg", "637829134054172050.jpeg",
  "637829134794751920.jpeg", "637829135102784480.jpeg", "637829135315000705.jpeg", "637829136053021184.jpeg",
  "637883136850537557.jpeg", "637883137011037481.jpeg", "637883137157657545.jpeg", "637883137288885511.jpeg",
  "637883137754025221.jpeg", "637883138368794733.jpeg", "637883138501574628.jpeg", "637883138862284457.jpeg",
  "637883139267182424.jpeg", "637883139529382159.jpeg", "637883852154076916.jpeg", "637883852792713895.jpeg",
  "637883856732430731.jpeg", "637883859980901774.jpeg", "637883860285622177.jpeg", "637883860583922242.jpeg",
  "637938037947217197.jpeg", "637938038118157263.jpeg", "637938038374827095.jpeg", "637938038545887113.jpeg",
  "637938038712637063.jpeg", "637938038922007035.jpeg", "637938039073967083.jpeg", "637938039574978472.jpeg",
  "637938039689518614.jpeg", "637938040562799128.jpeg", "637938040683929127.jpeg", "637938040823839035.jpeg",
  "637938041121798977.jpeg", "637938041601267804.jpeg", "637938041825707763.jpeg", "637938042166760494.jpeg",
  "637938042431400582.jpeg", "637938042653440359.jpeg", "637938042806450335.jpeg", "637938042966730216.jpeg",
  "637938043106960193.jpeg", "637938043408180065.jpeg", "637938043571520058.jpeg", "637938043740375632.jpeg",
  "637938044039095472.jpeg", "637962175270847444.jpeg", "637962218418212552.jpeg", "637962218585972547.jpeg",
  "637962218757142610.jpeg", "638059333649502040.jpeg", "638059333857982116.jpeg", "638059334010342258.jpeg",
  "638059334173892289.jpeg", "638059334461122492.jpeg", "638059334635702521.jpeg", "638127832001680133.jpeg",
  "638131269307094299.jpeg", "638131270118734206.jpeg", "638131271957183902.jpeg", "638131275112841405.jpeg",
  "638131283319098861.jpeg", "638131311517326847.jpeg", "638131312087476747.jpeg", "638131312901616337.jpeg",
  "638131313601925762.jpeg", "638131313859395655.jpeg", "638131314133785512.jpeg", "638131314341935463.jpeg",
  "638131314574955350.jpeg", "638131314792635207.jpeg", "638131315002705285.jpeg", "638131315315444999.jpeg",
  "638131315548044849.jpeg", "638131315738924762.jpeg", "638131315961294630.jpeg", "638131316154294587.jpeg",
  "638131316354954598.jpeg", "638131316641704428.jpeg", "638131316805034286.jpeg", "638131317037634113.jpeg",
  "638131317290535598.jpeg", "638131317502365367.jpeg", "638131317734505343.jpeg", "638131317947465248.jpeg",
  "638131318134325083.jpeg", "638265029033679241.jpeg", "638265029346738786.jpeg", "638265029596298523.jpeg",
  "638265029976687968.jpeg", "638265030446257356.jpeg", "638265030619669333.jpeg", "638265031037328700.jpeg",
  "638265031202618464.jpeg", "638265031397428243.jpeg", "638265031649189109.jpeg", "638265031871168992.jpeg",
  "638265032042117399.jpeg", "639070266970320833.jpeg", "639070267139930862.jpeg", "639070267193750910.jpeg",
  "639070269959165197.jpeg", "639070270840984613.jpeg", "639072100478929903.jpeg", "aasimar female 2.png",
  "aasimar female.png", "aasimar male 2.png", "aasimar male.png", "dark elf female ranger.jpg",
  "dark elf female rogue.jpg", "dark elf female.jpg", "dark elf male avenger.png", "dark elf male fighter 2.jpg",
  "dark elf male fighter.jpg", "dark elf male rogue 2.jpg", "dark elf male sorcerer.png", "download.jpg",
  "dragonborn female sorcerer.jpg", "dragonborn female.jpg", "dragonborn male fighter.jpg", "dragonborn male rogue.jpg",
  "dragonborn male sorcerer 2.jpg", "dragonborn male sorcerer.jpg", "dragonborn male wizard 2.jpg", "dragonborn male wizard.jpg",
  "dragonborn-female-1.png", "dragonborn-male-1.png", "dwarf male cleric.jpg", "dwarf male monk.jpg",
  "dwarf male.jpg", "dwarf-female-2.png", "dwarf-female.png", "dwarf-male-1.png",
  "dwarf-male-2.png", "dwarf-male-3.png", "dwarf-male-4.png", "dwarf-male-5.png",
  "dwarf-male-6.png", "dwarf-male-7.png", "dwarf-male-8.png", "eladrin-male.png",
  "elf female druid.jpg", "elf female ranger 2.jpg", "elf female ranger.jpg", "elf female warlock.jpg",
  "elf male ranger.jpg", "elf-drow-female.png", "elf-female-druid.png", "elf-male-1.png",
  "elf-male-3.png", "elf-male-4.png", "elf-male-5.png", "elf-male-wizard.png",
  "elf-male.png", "elf-ranger-female.png", "gnome male bard.jpg", "gnome male sorcerer.jpg",
  "gnome male wizard.jpg", "gnome male.jpg", "gnome-caster-male.png", "gnome-female.png",
  "gnome-male.png", "goliath male druid.jpg", "goliath-female.png", "goliath-male.png",
  "halfling female 2.jpg", "halfling female 3.jpg", "halfling female.jpg", "halfling male bard.jpg",
  "halfling male.jpg", "human female barbarian 2.jpg", "human female barbarian.png", "human female fighter.jpg",
  "human female sorcerer.jpg", "human female wizard.jpg", "human male artificer.jpg", "human male fighter.jpg",
  "human male monk.jpg", "human male ranger 2.jpg", "human male rogue.jpg", "human male sorcerer.jpg",
  "human male wizard 2.jpg", "human male wizard 3.jpg", "human male wizard 4.png", "human male wizard.jpg",
  "human-barbarian-male.png", "human-female-1.png", "human-female-2.png", "human-female-3.png",
  "human-female-monk.png", "human-female-paladin.png", "human-male-1.png", "human-male-2.png",
  "human-male-cleric.png", "human-male-paladin.png", "human-male-sorcerer.png", "orc female.jpg",
  "orc male barbarian 2.jpg", "orc male barbarian.jpg", "orc male fighter.jpg", "orc male warlock.jpg",
  "tiefling female 1.jpg", "tiefling female 2.jpg", "tiefling female sorcerer.jpg", "tiefling male sorcerer.jpg",
  "tiefling male.jpg", "tiefling-female-1.png", "tiefling-female.png", "tiefling-male-1.png",
  "tiefling-male-2.png", "tiefling-male-3.png", "wood elf female ranger 2.jpg", "wood elf female rogue.jpg",
];

// Backgrounds that require the user to choose a specific tool proficiency
const BACKGROUND_TOOL_SELECTORS: Record<string, { label: string; options: string[] }> = {
  artesao: { label: "Ferramentas de Artesão", options: ARTISAN_TOOLS },
  artista: { label: "Instrumento Musical",    options: MUSICAL_INSTRUMENTS },
  guarda:  { label: "Kit de Jogos",           options: GAMING_SETS },
  nobre:   { label: "Kit de Jogos",           options: GAMING_SETS },
  soldado: { label: "Kit de Jogos",           options: GAMING_SETS },
};

interface ToolProficiencyCardProps {
  selectedBackground: any;
  toolChoice: string;
  onToolChoiceChange: (val: string) => void;
}

const ToolProficiencyCard: React.FC<ToolProficiencyCardProps> = ({
  selectedBackground,
  toolChoice,
  onToolChoiceChange,
}) => {
  const [hovered, setHovered] = useState(false);
  const [hoveredToolRect, setHoveredToolRect] = useState<DOMRect | null>(null);
  const selector = BACKGROUND_TOOL_SELECTORS[selectedBackground.id];
  const isSelectable = !!selector;
  const displayedToolName = isSelectable ? toolChoice : selectedBackground.toolProficiency;
  const isIncomplete = isSelectable && !toolChoice;

  return (
    <div style={{
      background: 'rgba(249,115,22,0.05)',
      border: isIncomplete ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(249,115,22,0.15)',
      padding: '10px 14px',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      {/* Title row with optional ! badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {isIncomplete && (
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#f97316', color: '#000', fontWeight: 900, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</span>
        )}
        <span style={{ color: '#f97316', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Proficiências em Ferramentas
        </span>
      </div>

      {/* Dropdown for selectable origins */}
      {isSelectable && (
        <select
          className="premium-select"
          value={toolChoice}
          onChange={(e) => onToolChoiceChange(e.target.value)}
          style={{ fontSize: '0.85rem', width: '100%' }}
        >
          <option value="">— Escolha {selector.label} —</option>
          {selector.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {/* Hoverable chip with tooltip */}
      {displayedToolName && (
        <div
          style={{ position: 'relative', display: 'inline-block' }}
          onMouseEnter={(e) => { setHovered(true); setHoveredToolRect(e.currentTarget.getBoundingClientRect()); }}
          onMouseLeave={() => { setHovered(false); setHoveredToolRect(null); }}
        >
          <span style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600, cursor: 'help', borderBottom: '1px dotted rgba(226,232,240,0.4)' }}>
            {displayedToolName}
          </span>
          {hovered && <ToolTooltip toolName={displayedToolName} anchorRect={hoveredToolRect} />}
        </div>
      )}
    </div>
  );
};

const ValidationBanner: React.FC<{ errors: string[] }> = ({ errors }) => {
  if (errors.length === 0) return null;
  return (
    <div style={{
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '12px',
    }}>
      <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
        Pendências ({errors.length})
      </div>
      {errors.map((err, i) => (
        <div key={i} style={{ color: '#fca5a5', fontSize: '0.82rem', lineHeight: 1.5 }}>
          • {err}
        </div>
      ))}
    </div>
  );
};

const CREATION_STORAGE_KEY = 'dnd_creation_state';
const CREATION_STATE_VERSION = 1;

const DEFAULT_CHARACTER: Character = {
  name: '',
  portrait: null,
  species: null,
  characterClass: null,
  choices: {},
  talentSelections: {},
  languages: ['common'],
  attributes: {
    method: null,
    base: { forca: 8, destreza: 8, constituicao: 8, inteligencia: 8, sabedoria: 8, carisma: 8 },
    backgroundBonus: { forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0 },
    final: { forca: 8, destreza: 8, constituicao: 8, inteligencia: 8, sabedoria: 8, carisma: 8 },
    modifiers: { forca: -1, destreza: -1, constituicao: -1, inteligencia: -1, sabedoria: -1, carisma: -1 }
  },
  equipment: {
    classOption: null,
    backgroundOption: null,
    startingEquipmentAdded: false,
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    equippedArmorId: null,
    hasShieldEquipped: false,
  },
  spells: {
    learnedCantrips: [],
    preparedSpells: [],
  }
};

function loadCreationState(): { character: Character; currentStep: number; auxiliaryState?: any } | null {
  try {
    const raw = localStorage.getItem(CREATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CREATION_STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function App() {
  const savedState = React.useMemo(() => loadCreationState(), []);

  const [currentStep, setCurrentStep] = useState(savedState?.currentStep ?? 0);
  const [character, setCharacter] = useState<Character>(savedState?.character ?? DEFAULT_CHARACTER);
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Phase 2 states
  const [currentPhase, setCurrentPhase] = useState(1);
  const [characterLevel, setCharacterLevel] = useState(1);
  const [playState, setPlayState] = useState<CharacterPlayState>(() => {
    try {
      const saved = localStorage.getItem('dnd_play_state');
      return saved ? (JSON.parse(saved) as CharacterPlayState) : DEFAULT_PLAY_STATE;
    } catch {
      return DEFAULT_PLAY_STATE;
    }
  });

  // Origem step state
  // TODO: Migrar estes estados auxiliares para dentro de `character` no futuro
  const [selectedBackground, setSelectedBackground] = useState<any>(savedState?.auxiliaryState?.selectedBackground ?? null);
  const [attrChoiceMode, setAttrChoiceMode] = useState<'' | 'triple' | 'double'>(savedState?.auxiliaryState?.attrChoiceMode ?? '');
  const [attrPlus1, setAttrPlus1] = useState(savedState?.auxiliaryState?.attrPlus1 ?? '');
  const [attrPlus2, setAttrPlus2] = useState(savedState?.auxiliaryState?.attrPlus2 ?? '');

  // Atributos state
  const ATTR_METADATA: Record<string, { full: string, desc: string }> = {
    forca: { full: 'Força', desc: 'Poder físico e força bruta.' },
    destreza: { full: 'Destreza', desc: 'Agilidade, reflexos e equilíbrio.' },
    constituicao: { full: 'Constituição', desc: 'Resistência, saúde e vitalidade.' },
    inteligencia: { full: 'Inteligência', desc: 'Raciocínio, memória e conhecimento.' },
    sabedoria: { full: 'Sabedoria', desc: 'Percepção, intuição e sintonização.' },
    carisma: { full: 'Carisma', desc: 'Personalidade, influência e persuasão.' }
  };

  const getAttributeBonus = (attr: string) => {
    let bonus = 0;
    if (attrChoiceMode === 'triple') {
      if (selectedBackground?.attributeValues.includes(attr)) bonus += 1;
    } else if (attrChoiceMode === 'double') {
      if (attr === attrPlus1) bonus += 1;
      if (attr === attrPlus2) bonus += 2;
    }
    return bonus;
  };

  // ---------------------------------------------------------------------------
  // Derived Sheet — calculado pelo rules engine a partir do estado do personagem
  // ---------------------------------------------------------------------------
  // Construir choices uma vez — compartilhado entre derivação e validação
  const choices = React.useMemo((): CharacterChoices => {
    let backgroundBonusDistribution: BackgroundBonusDistribution | null = null;
    if (selectedBackground && attrChoiceMode) {
      if (attrChoiceMode === 'triple') {
        const dist: Partial<Record<string, number>> = {};
        for (const attr of (selectedBackground.attributeValues as string[])) {
          dist[attr] = 1;
        }
        backgroundBonusDistribution = { mode: '+1/+1/+1', distribution: dist };
      } else if (attrChoiceMode === 'double' && attrPlus1 && attrPlus2) {
        backgroundBonusDistribution = {
          mode: '+2/+1',
          distribution: { [attrPlus2]: 2, [attrPlus1]: 1 },
        };
      }
    }

    // Normalizar escolhas de espécie: chaves flat → objeto tipado
    const speciesId = character.species?.id ?? null;
    let speciesChoicesNormalized: Record<string, string> | undefined;
    if (speciesId) {
      const result: Record<string, string> = {};
      const prefix = speciesId + '-';
      for (const [key, value] of Object.entries(character.choices)) {
        if (key.startsWith(prefix)) {
          result[key.slice(prefix.length)] = value;
        }
      }
      if (Object.keys(result).length > 0) speciesChoicesNormalized = result;
    }

    return {
      classId: character.characterClass?.id ?? null,
      backgroundId: selectedBackground?.id ?? null,
      speciesId,
      speciesLineage: speciesId ? character.choices[speciesId] ?? undefined : undefined,
      speciesChoices: speciesChoicesNormalized,
      attributeMethod: character.attributes.method,
      baseAttributes: character.attributes.base as CharacterChoices['baseAttributes'],
      backgroundBonusDistribution,
      equippedArmorId: character.equipment.equippedArmorId ?? undefined,
      hasShield: character.equipment.hasShieldEquipped,
      backgroundChoices: {
        toolProficiency: character.choices["toolProficiency"] || undefined,
      },
      equipmentChoices: {
        classOption: character.equipment.classOption,
        backgroundOption: character.equipment.backgroundOption,
      },
      inventoryWeapons: character.equipment.inventory.map((item: any) => item.name as string),
      spellSelections: {
        cantrips: character.spells.learnedCantrips,
        prepared: character.spells.preparedSpells,
      },
      talentSelections: character.talentSelections,
      languageSelections: character.languages,
      featureChoices: character.choices,
      characterDetails: { name: character.name, portrait: character.portrait },
      level: characterLevel,
    };
  }, [
    character.characterClass,
    character.species,
    character.attributes,
    character.equipment,
    character.spells,
    character.talentSelections,
    character.languages,
    character.choices,
    character.name,
    character.portrait,
    selectedBackground,
    attrChoiceMode,
    attrPlus1,
    attrPlus2,
    characterLevel,
  ]);

  const derivedSheet = React.useMemo(() => deriveSheet(choices), [choices]);
  const validationResult = React.useMemo(() => validateChoices(choices), [choices]);

  // Persist playState to localStorage
  useEffect(() => {
    localStorage.setItem('dnd_play_state', JSON.stringify(playState));
  }, [playState]);

  const handleResetCharacter = () => {
    setCharacter(DEFAULT_CHARACTER);
    setCurrentStep(0);
    setSelectedBackground(null);
    setAttrChoiceMode('');
    setAttrPlus1('');
    setAttrPlus2('');
    setPlayState(DEFAULT_PLAY_STATE);
    localStorage.removeItem(CREATION_STORAGE_KEY);
    localStorage.removeItem('dnd_play_state');
  };

  // Persist character creation state to localStorage
  useEffect(() => {
    localStorage.setItem(CREATION_STORAGE_KEY, JSON.stringify({
      version: CREATION_STATE_VERSION,
      character,
      currentStep,
      auxiliaryState: { selectedBackground, attrChoiceMode, attrPlus1, attrPlus2 },
    }));
  }, [character, currentStep, selectedBackground, attrChoiceMode, attrPlus1, attrPlus2]);

  // Initialize currentHp to maxHP when first entering the sheet (step 5)
  useEffect(() => {
    if (currentStep === 5 && playState.currentHp === 0 && derivedSheet.maxHP > 0) {
      setPlayState(prev => ({ ...prev, currentHp: derivedSheet.maxHP }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Selections map for stepper display: step number → chosen name
  const stepSelections: Record<number, string> = {};
  if (character.characterClass?.name) stepSelections[1] = character.characterClass.name;
  if (selectedBackground?.name) stepSelections[2] = selectedBackground.name;
  if (character.species?.name) stepSelections[3] = character.species.name;

  const allSelections = React.useMemo(() => {
    const baseChoices = Object.values(character.choices);
    const talentChoices = Object.values(character.talentSelections).flatMap(s => Object.values(s));
    const bgSkills = selectedBackground?.skillProficiencies || [];
    
    return [
      ...baseChoices,
      ...talentChoices,
      ...bgSkills,
      ...character.languages
    ].filter(Boolean) as string[];
  }, [character.choices, character.talentSelections, selectedBackground, character.languages]);

  // Espécie step state


  const handleSelect = <K extends keyof Character>(field: K, value: Character[K]) => {
    setCharacter(prev => ({ ...prev, [field]: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSpecies = (sp: any) => {
    setCharacter(prev => {
      const prevId = prev.species?.id;
      const newChoices = { ...prev.choices };
      if (prevId) {
        Object.keys(newChoices).forEach(key => {
          if (key === prevId || key.startsWith(prevId + '-')) delete newChoices[key];
        });
      }
      const autoLangs = prev.languages.filter(l => ['common', 'thieves-cant', 'druidic'].includes(l));
      return { ...prev, species: sp, choices: newChoices, languages: autoLangs };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChoiceChange = (featureId: string, choiceName: string) => {
    setCharacter(prev => ({
      ...prev,
      choices: {
        ...prev.choices,
        [featureId]: choiceName
      }
    }));
  };

  // Automatic Languages (Ladino -> Gíria dos Ladrões, Druida -> Druídico)
  useEffect(() => {
    const classId = character.characterClass?.id;
    const autoLangs: string[] = [];
    if (classId === 'ladino') autoLangs.push('thieves-cant');
    if (classId === 'druida') autoLangs.push('druidic');

    setCharacter(prev => {
      const currentAutoLangs = prev.languages.filter(l => l === 'thieves-cant' || l === 'druidic');
      const needsUpdate = autoLangs.some(l => !prev.languages.includes(l)) || 
                          currentAutoLangs.some(l => !autoLangs.includes(l));
      
      if (!needsUpdate) return prev;

      // Keep only manually selected languages + mandatory 'common' + new autoLangs
      const baseLangs = prev.languages.filter(l => l !== 'thieves-cant' && l !== 'druidic');
      return { ...prev, languages: [...new Set([...baseLangs, ...autoLangs])] };
    });
  }, [character.characterClass?.id]);

  const handleTalentSelectionChange = (talentName: string, selections: Record<string, string>) => {
    setCharacter(prev => ({
      ...prev,
      talentSelections: {
        ...prev.talentSelections,
        [talentName]: selections
      }
    }));
  };

  const handleSelectClass = (cls: Selection) => {
    handleSelect('characterClass', cls);
    setShowTooltip(true);
  };

  const closeTooltip = () => {
    setShowTooltip(false);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTooltip();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <GlossaryTooltipProvider>
    <div className="layout-container" style={{ maxWidth: '1200px' }}>

      <div className="animate-fade-in" key={currentStep}>

        {/* Step 0: Class Selection */}
        {currentStep === 0 && (
          <div className="step-container">
            {currentPhase === 2 && character.characterClass ? (
              <>
                {/* Standardized header for Phase 2 */}
                <StepHeader 
                  onPrev={() => {
                    setCurrentPhase(1);
                    setCharacterLevel(1);
                    setCharacter(prev => ({ ...prev, choices: {} }));
                  }}
                  onNext={() => setCurrentStep(1)}
                  canAdvance={validationResult.byStep.class.length === 0}
                  activeStep={1}
                  onStepClick={setCurrentStep}
                  characterName={character.name}
                  setCharacterName={(n: string) => setCharacter(prev => ({ ...prev, name: n }))}
                  portrait={character.portrait}
                  onPortraitClick={() => setIsPortraitModalOpen(true)}
                selections={stepSelections}
                />
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 10px 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s ease-in-out', overflowY: 'auto', paddingRight: '12px', paddingBottom: '40px' }}>
                  <div style={{ padding: '0 0 12px 0' }} />

                  {/* Level and Stats Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={`/imgs/icone_classe/${character.characterClass.id}.png`} alt="Icon" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                      <h3 style={{ fontSize: '1.8rem', color: '#f97316', margin: 0 }}>{character.characterClass.name}</h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#cbd5e1', fontSize: '1.2rem', fontWeight: 'bold' }}>Nível</span>
                        {/* Escopo atual: criação nível 1 */}
                        <span className="premium-select" style={{ opacity: 0.6, pointerEvents: 'none' }}>1</span>
                      </div>

                      {/* Stats Box */}
                      <div style={{ background: '#111218', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
                        <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                          Max Pontos de Vida: <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>
                            {engineCalculateMaxHP(character.characterClass.id, characterLevel, derivedSheet.modifiers['constituicao'] ?? 0)}
                          </span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                          Dado de Vida: <span style={{ color: '#fff' }}>{getClassHPData(character.characterClass.id)?.hitDieLabel || '1d?'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Level 1 Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(() => {
                    const classId = character.characterClass.id;
                    const details = (classDetailsData as Record<string, { basicTraits: Record<string, string>; features?: Array<any>; options?: Array<any> }>)[classId];
                    if (!details) return null;

                    // Active traits based on selected level
                    const activeFeatures = (details.features || []).filter(f => f.level <= characterLevel);
                    return (
                      <>
                        <FeatureExpandable 
                          feature={{ 
                            name: `Traços Básicos de ${character.characterClass.name}`, 
                            level: 1, 
                            description: `<table style="width: 100%; border-collapse: collapse;">
                                <tbody>
                                  ${Object.entries(details.basicTraits).map(([key, val]) => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                      <td style="padding: 8px 12px; color: #f97316; font-weight: bold; width: 30%; font-size: 0.82rem; text-align: left;">${key}</td>
                                      <td style="padding: 8px 12px; color: #d1d5db; font-size: 0.82rem; text-align: left;">${val}</td>
                                    </tr>
                                  `).join('')}
                                </tbody>
                              </table>`
                          }} 
                          needsChoice={details.options && details.options.some((opt: any) => !character.choices[opt.id])}
                          options={details.options}
                          choices={character.choices}
                          onChoiceChange={handleChoiceChange}
                          allSelections={allSelections}
                        />
                        {activeFeatures.map((f, idx) => (
                          <FeatureExpandable 
                            key={idx} 
                            feature={f} 
                            needsChoice={f.options && f.options.some((opt: any) => !character.choices[opt.id])} 
                            options={f.options}
                            choices={character.choices}
                            onChoiceChange={handleChoiceChange}
                            allSelections={allSelections}
                          />
                        ))}
                      </>
                    );
                  })()}
                </div>

                {/* Higher Level Features Expandable Tray */}
                <details style={{ marginTop: '16px' }}>
                  <summary style={{ cursor: 'pointer', color: '#000', background: '#e2e8f0', padding: '8px 16px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
                    <span style={{ marginRight: '8px' }}>Disponível em níveis superiores</span>
                    <span className="plus-icon">+</span>
                  </summary>
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      const classId = character.characterClass.id;
                      const details = (classDetailsData as Record<string, { features?: Array<any> }>)[classId];
                      if (!details || !details.features) return null;

                      // Traits strictly above the given level
                      const higherFeatures = details.features.filter(f => f.level > characterLevel);
                      if (higherFeatures.length === 0) return <p style={{ color: '#94a3b8' }}>Nenhuma característica adicional cadastrada ainda.</p>;

                      return higherFeatures.map((f, idx) => (
                        <FeatureExpandable key={`hl-${idx}`} feature={f} allSelections={allSelections} />
                      ));
                    })()}
                  </div>
                  </details>

                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
                <h2 className="page-title" style={{ marginBottom: '16px', paddingBottom: 0, width: '100%' }}>Escolha sua classe:</h2>
                <div className="classes-grid" style={{ width: '100%' }}>
                  {bgData.classes.map((cls) => (
                    <div
                      key={cls.id}
                      className={`class-card ${character.characterClass?.id === cls.id ? 'selected' : ''}`}
                      onClick={() => handleSelectClass(cls)}
                    >
                      <div className="class-card-header">
                        <h3>{cls.name}</h3>
                        <div className="class-icon-placeholder">
                          <img
                            className={`class-icon-image ${character.characterClass?.id === cls.id ? 'selected' : ''}`}
                            src={`/imgs/icone_classe/${cls.id}.png`}
                            alt={`Ícone de ${cls.name}`}
                          />
                        </div>
                      </div>
                      <p>{cls.description}</p>
                      <div className="class-card-chevron">›</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleResetCharacter}
                  style={{
                    marginTop: '24px',
                    padding: '8px 20px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Novo Personagem
                </button>
              </div>
            )}

            {/* Tooltip Overlay — renderizado via portal fora do stacking context do animate-fade-in */}
            {showTooltip && character.characterClass && createPortal(
              <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <div className="tooltip-overlay" onClick={closeTooltip} style={{ position: 'absolute', inset: 0 }}></div>
                <div className="class-tooltip" style={{ maxWidth: '1050px', width: '100%', maxHeight: '90vh', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1001 }}>
                  <div style={{ background: '#111218', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <img src={`/imgs/icone_classe/${character.characterClass.id}.png`} alt="Icon" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                       <span style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '500' }}>Descrição da classe</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <button
                         onClick={() => { setCurrentPhase(2); closeTooltip(); }}
                         style={{
                           background: 'rgba(249, 115, 22, 0.1)',
                           border: '1px solid #f97316',
                           color: '#f97316',
                           fontWeight: '500',
                           padding: '6px 16px',
                           borderRadius: '6px',
                           fontSize: '0.9rem',
                           cursor: 'pointer',
                           transition: 'all 0.2s ease'
                         }}
                         onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(249, 115, 22, 0.2)'; }}
                         onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(249, 115, 22, 0.1)'; }}
                       >
                         Escolher classe
                       </button>
                       <button onClick={closeTooltip} style={{ background: 'transparent', padding: '0', color: '#a1a1aa', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                     </div>
                  </div>
                  <div style={{ padding: '32px 24px', overflowY: 'auto' }}>
                    {(() => {
                      const classId = character.characterClass!.id;
                      try {
                        const details = (classDetailsData as Record<string, { subtitle: string; basicTraits: Record<string, string>; features?: Array<{ name: string; level: number; description: string }> }>)[classId];
                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(500px, 2fr)', gap: '40px', alignItems: 'start' }}>
                            {/* Left Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <img
                                  src={`/imgs/descriçao_classe/${character.characterClass!.id}.png`}
                                  alt={`Descrição da classe ${character.characterClass!.name}`}
                                  style={{ width: '100%', display: 'block', borderRadius: '12px', objectFit: 'cover' }}
                                />
                            </div>

                            {/* Right Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {details && (
                                  <>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', marginBottom: '4px' }}>
                                      <h3 style={{ color: '#f97316', fontSize: '2.5rem', margin: '0', lineHeight: '1.2', fontWeight: '800' }}>
                                        {character.characterClass!.name}
                                      </h3>
                                      <p style={{ color: '#cbd5e1', fontSize: '1.15rem', margin: '0', fontStyle: 'italic', opacity: 0.9, lineHeight: '1.5' }}>
                                        {details.subtitle.replace(character.characterClass!.name + ". ", "").replace(character.characterClass!.name + " ", "")}
                                      </p>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'nowrap', marginBottom: '8px', background: 'rgba(26, 22, 37, 0.8)', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '12px', overflow: 'hidden' }}>
                                      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderRight: '1px solid rgba(249, 115, 22, 0.4)' }}>
                                        <span style={{ color: '#f97316', fontSize: '0.70rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Atributo Primário</span>
                                        <span style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{details.basicTraits['Atributo Primário'] || '-'}</span>
                                      </div>
                                      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderRight: '1px solid rgba(249, 115, 22, 0.4)' }}>
                                        <span style={{ color: '#f97316', fontSize: '0.70rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Dado de Vida</span>
                                        <span style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{details.basicTraits['Dado de Ponto de Vida']?.split(' ')[0] || '-'}</span>
                                      </div>
                                      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                                        <span style={{ color: '#f97316', fontSize: '0.70rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Salvaguardas</span>
                                        <span style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{details.basicTraits['Proficiência em Salvaguardas'] || details.basicTraits['Proficiência em Salvaguarda'] || '-'}</span>
                                      </div>
                                    </div>

                                    <details style={{ background: '#1a1b23', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                                      <summary style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                                          <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: '500' }}>Traços Básicos de {character.characterClass!.name}</span>
                                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Nível 1</span>
                                        </div>
                                        <span className="summary-chevron" style={{ color: '#cbd5e1', fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
                                      </summary>
                                      <div className="details-content" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                          <tbody>
                                            {Object.entries(details.basicTraits).map(([key, value], index) => (
                                              <tr key={key} style={{ 
                                                background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                                borderBottom: index < Object.keys(details.basicTraits).length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                              }}>
                                                <td style={{ 
                                                  width: '35%', 
                                                  color: '#f97316', 
                                                  fontWeight: '600', 
                                                  fontSize: '0.82rem',
                                                  padding: '8px 12px',
                                                  verticalAlign: 'top',
                                                  textAlign: 'left',
                                                  borderRight: '1px solid rgba(255,255,255,0.05)'
                                                }}>
                                                  {key}
                                                </td>
                                                <td style={{ 
                                                  width: '65%', 
                                                  color: '#d1d5db', 
                                                  fontSize: '0.82rem', 
                                                  lineHeight: '1.5',
                                                  padding: '8px 12px',
                                                  textAlign: 'left',
                                                  whiteSpace: 'pre-wrap'
                                                }}>
                                                  <div dangerouslySetInnerHTML={{ __html: formatDice(value as string)
                                                    .replace(new RegExp(`\\b(${Object.keys(ATTRIBUTE_MAP).join('|')})\\b`, 'g'), (m: string) => `<strong>${m}</strong> <span style="opacity:0.6; font-size: 0.75rem">(${ATTRIBUTE_MAP[m]})</span>`) 
                                                  }} />
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </details>

                                    {details.features && details.features.filter((f: any) => f.level === 1).map((feature: any, i: number) => (
                                      <FeatureExpandable key={i} feature={feature} />
                                    ))}
                                  </>
                                )}
                            </div>
                          </div>
                        );
                      } catch(e) {
                         console.error("Failed to load class details", e);
                         return null;
                      }
                    })()}
                  </div>
                </div>
              </div>
            , document.body)}
          </div>
        )}
        {/* Step 1: Origem */}
        {currentStep === 1 && (
          <div className="step-container">
            {/* Standardized header */}
            <StepHeader 
              onPrev={() => setCurrentStep(0)}
              onNext={() => setCurrentStep(2)}
              canAdvance={validationResult.byStep.background.length === 0}
              activeStep={2}
              onStepClick={setCurrentStep}
              characterName={character.name}
              setCharacterName={(n: string) => setCharacter(prev => ({ ...prev, name: n }))}
              portrait={character.portrait}
              onPortraitClick={() => setIsPortraitModalOpen(true)}
                selections={stepSelections}
            />
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 16px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '12px', paddingBottom: '40px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#f1f5f9', margin: '0 0 8px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#f97316' }}>✦</span> Escolha sua Origem: Antecedente
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.6, maxWidth: '900px' }}>
                  O antecedente do seu personagem consiste em um conjunto de características que refletem o lugar e a ocupação que mais o moldaram antes de começar sua vida de aventura. Escolha um dos pacotes abaixo para definir seu passado e receber seus benefícios essenciais.
                </p>
              </div>

              {/* Backgrounds Layout: 2 Columns */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* Left Column: Backgrounds List */}
                <div style={{ flex: '1 1 240px', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(backgroundsData.backgrounds as any[]).map((bg: any) => {
                    const isSelected = selectedBackground?.id === bg.id;
                    return (
                      <div
                        key={bg.id}
                        onClick={() => {
                          setSelectedBackground(bg);
                          window.scrollTo(0, 0);
                          setAttrChoiceMode('');
                          setAttrPlus1('');
                          setAttrPlus2('');
                          setCharacter(prev => ({
                            ...prev,
                            choices: { ...prev.choices, toolProficiency: '' }
                          }));
                        }}
                        style={{
                          background: isSelected ? '#f97316' : '#1a1b23',
                          border: isSelected ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? '0 4px 20px rgba(249,115,22,0.25)' : 'none',
                          transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)';
                            e.currentTarget.style.background = 'rgba(249,115,22,0.04)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.background = '#1a1b23';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: '0.95rem', color: isSelected ? '#ffffff' : '#e2e8f0', fontWeight: isSelected ? '700' : '500', letterSpacing: '0.2px' }}>
                          {bg.name}
                        </h3>
                        {isSelected && <span style={{ color: '#fff', fontSize: '1rem' }}>✦</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Background Details */}
                <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedBackground ? (
                    <div id="background-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.4s ease-in-out' }}>
                      
                      {/* Info Card */}
                      <div style={{ background: 'rgba(17, 18, 24, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.5rem', letterSpacing: '0.5px' }}>{selectedBackground.name}</h3>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>{selectedBackground.description}</p>
                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '8px 0' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '4px' }}>
                          <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)', padding: '10px 14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#f97316', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proficiências em Perícias</span>
                            <span style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              {selectedBackground.skillProficiencies.map((s: string) => {
                                const { name, attr } = getSkillParts(s);
                                return (
                                  <span key={s} style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <strong style={{ color: '#f97316' }}>{name}</strong> 
                                    {attr && <span style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 400 }}>({attr})</span>}
                                  </span>
                                );
                              })}
                            </span>
                          </div>
                          <ToolProficiencyCard
                            selectedBackground={selectedBackground}
                            toolChoice={character.choices["toolProficiency"] || ''}
                            onToolChoiceChange={(val) => handleChoiceChange("toolProficiency", val)}
                          />
                        </div>
                      </div>

                      {/* Talent Accordion */}
                      {(() => {
                        const talent = (talentsData.talents as any[]).find((t: any) => selectedBackground.talent === t.name || selectedBackground.talent.startsWith(t.name));
                        const isTalentChoicesComplete = checkTalentComplete(selectedBackground.talent, character.talentSelections[selectedBackground.talent]);
                        return (
                          <details style={{ background: 'rgba(17, 18, 24, 0.6)', backdropFilter: 'blur(8px)', border: isTalentChoicesComplete ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(249,115,22,0.5)', borderRadius: '10px' }}>
                            <summary style={{ padding: '12px 18px', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {!isTalentChoicesComplete && (
                                  <span
                                    title="Ação necessária no talento de origem"
                                    style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f97316', color: '#000', fontWeight: 900, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                  >!</span>
                                )}
                                <span>
                                  <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>{selectedBackground.talent}</span>
                                  <span style={{ fontSize: '0.7rem', lineHeight: 1, display: 'block' }}>
                                    {(() => {
                                      const visible = countVisibleTalentChoices(selectedBackground.talent, character.talentSelections[selectedBackground.talent]);
                                      return visible > 0 ? (
                                        <span style={{ color: isTalentChoicesComplete ? '#64748b' : '#f97316' }}>
                                          {visible} Escolha{visible > 1 ? 's' : ''} — 
                                        </span>
                                      ) : null;
                                    })()}
                                    <span style={{ color: '#64748b' }}>Talento de Origem</span>
                                  </span>
                                </span>
                              </span>
                              <span className="summary-chevron" style={{ color: '#f97316', fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
                            </summary>
                            <div style={{ padding: '0 18px 14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.8rem', margin: '10px 0 8px 0' }}>Benefícios do Talento</p>
                              {talent && talent.benefits.map((b: string, i: number) => {
                                let boldPart = '';
                                let restText = b;
                                
                                if (b.includes(': ')) {
                                  const splitIndex = b.indexOf(': ');
                                  boldPart = b.substring(0, splitIndex + 1);
                                  restText = b.substring(splitIndex + 2);
                                } else if (b.includes('. ')) {
                                  const splitIndex = b.indexOf('. ');
                                  boldPart = b.substring(0, splitIndex + 1);
                                  restText = b.substring(splitIndex + 2);
                                }
                                
                                return (
                                  <p key={i} style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0', lineHeight: 1.6 }}>
                                    {boldPart ? (
                                      <><strong style={{ color: '#e2e8f0', fontStyle: 'italic', fontWeight: 700 }}>{boldPart}</strong> {formatDice(restText)}</>
                                    ) : formatDice(b)}
                                  </p>
                                );
                              })}

                              <TalentChoiceSection
                                talentName={selectedBackground.talent}
                                selections={character.talentSelections[selectedBackground.talent] || {}}
                                onChange={(sels) => handleTalentSelectionChange(selectedBackground.talent, sels)}
                                allSelections={allSelections}
                              />
                            </div>
                          </details>
                        );
                      })()}

                      {/* Attribute Points Accordion */}
                      <details style={{ background: 'rgba(17, 18, 24, 0.6)', backdropFilter: 'blur(8px)', border: (attrChoiceMode && (attrChoiceMode === 'triple' || (attrPlus1 && attrPlus2))) ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(249,115,22,0.5)', borderRadius: '10px' }}>
                        <summary style={{ padding: '12px 18px', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {!(attrChoiceMode && (attrChoiceMode === 'triple' || (attrPlus1 && attrPlus2))) && (
                              <span
                                title="Escolha seu bônus de atributo"
                                style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f97316', color: '#000', fontWeight: 900, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                              >!</span>
                            )}
                            <span>
                              <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>Bônus de Atributo</span>
                              <span style={{ fontSize: '0.7rem', lineHeight: 1, display: 'block' }}>
                                <span style={{ color: (attrChoiceMode && (attrChoiceMode === 'triple' || (attrPlus1 && attrPlus2))) ? '#64748b' : '#f97316' }}>1 Escolha — </span>
                                <span style={{ color: '#64748b' }}>Antecedente</span>
                              </span>
                            </span>
                          </span>
                          <span className="summary-chevron" style={{ color: '#f97316', fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
                        </summary>
                        <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px 0', lineHeight: 1.6 }}>
                            O Antecedente <strong style={{ color: '#f1f5f9' }}>{selectedBackground.name}</strong> permite que você aumente atributos específicos.{' '}
                            Nenhum aumento pode elevar um atributo acima de 20.
                          </p>

                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Padrão de Bônus:</label>
                            <select
                              className="premium-select"
                              value={attrChoiceMode}
                              onChange={(e) => {
                                setAttrChoiceMode(e.target.value as '' | 'triple' | 'double');
                                setAttrPlus1('');
                                setAttrPlus2('');
                              }}
                            >
                              <option value="">— Escolher uma opção —</option>
                              <option value="triple">Três atributos: +1, +1, +1</option>
                              <option value="double">Dois atributos: +2, +1</option>
                            </select>
                          </div>

                          {attrChoiceMode === 'triple' && (
                            <div style={{ padding: '12px', background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '8px' }}>
                              <p style={{ color: '#f1f5f9', fontSize: '0.85rem', margin: 0 }}>
                                <span style={{ color: '#f97316', fontWeight: 'bold' }}>✓ Aplicado:</span> +1 em <strong style={{ color: '#fff' }}>{selectedBackground.attributeValues.map((a: string) => ATTR_METADATA[a]?.full || a).join(', ')}</strong>.
                              </p>
                            </div>
                          )}

                          {attrChoiceMode === 'double' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '180px' }}>
                                  <label style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginBottom: '6px' }}>
                                    Atributo para <span style={{ color: '#f97316', fontWeight: 'bold' }}>+1</span>:
                                  </label>
                                  <select
                                    className="premium-select"
                                    value={attrPlus1}
                                    onChange={(e) => setAttrPlus1(e.target.value)}
                                  >
                                    <option value="">— Escolha —</option>
                                    {selectedBackground.attributeValues.map((a: string) => (
                                      <option 
                                        key={a} 
                                        value={a} 
                                        disabled={a === attrPlus2}
                                        className={a === attrPlus2 ? 'option-taken' : ''}
                                      >
                                        {a === attrPlus2 ? '✓ ' : ''}{ATTR_METADATA[a]?.full || a}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div style={{ flex: 1, minWidth: '180px' }}>
                                  <label style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'block', marginBottom: '6px' }}>
                                    Atributo para <span style={{ color: '#f97316', fontWeight: 'bold' }}>+2</span>:
                                  </label>
                                  <select
                                    className="premium-select"
                                    value={attrPlus2}
                                    onChange={(e) => setAttrPlus2(e.target.value)}
                                  >
                                    <option value="">— Escolha —</option>
                                    {selectedBackground.attributeValues.map((a: string) => (
                                      <option 
                                        key={a} 
                                        value={a} 
                                        disabled={a === attrPlus1}
                                        className={a === attrPlus1 ? 'option-taken' : ''}
                                      >
                                        {a === attrPlus1 ? '✓ ' : ''}{ATTR_METADATA[a]?.full || a}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </details>
                      


                    </div>
                  ) : (
                    <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(17, 18, 24, 0.4)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', color: '#64748b' }}>
                      <span style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>📖</span>
                      <p style={{ margin: 0 }}>Selecione um antecedente para ver os detalhes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Species */}
        {currentStep === 2 && (
          <div className="step-container">
            {/* Standardized header */}
            <StepHeader 
              onPrev={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
              canAdvance={validationResult.byStep.species.length === 0}
              activeStep={3}
              onStepClick={setCurrentStep}
              characterName={character.name}
              setCharacterName={(n: string) => setCharacter(prev => ({ ...prev, name: n }))}
              portrait={character.portrait}
              onPortraitClick={() => setIsPortraitModalOpen(true)}
                selections={stepSelections}
            />
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 16px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '12px', paddingBottom: '40px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#f1f5f9', margin: '0 0 8px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#f97316' }}>✦</span> Escolha sua Espécie: Raça
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.6, maxWidth: '900px' }}>
                  Sua espécie define traços inatos e características raciais. Selecione uma raça abaixo para ver todos os seus traços.
                </p>
              </div>

              {/* Species Layout: 2 Columns */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* Left Column: Species List */}
                <div style={{ flex: '1 1 240px', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {speciesData.species.map((sp: any) => {
                    const isSelected = character.species?.id === sp.id;
                    return (
                      <div
                        key={sp.id}
                        onClick={() => handleSelectSpecies(sp)}
                        style={{
                          background: isSelected ? '#f97316' : '#1a1b23',
                          border: isSelected ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          boxShadow: isSelected ? '0 4px 20px rgba(249,115,22,0.25)' : 'none',
                          transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)';
                            e.currentTarget.style.background = 'rgba(249,115,22,0.04)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.background = '#1a1b23';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: '0.95rem', color: isSelected ? '#ffffff' : '#e2e8f0', fontWeight: isSelected ? '700' : '500', letterSpacing: '0.2px' }}>
                          {sp.name}
                        </h3>
                        {isSelected && <span style={{ color: '#fff', fontSize: '1rem' }}>✦</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Species Details */}
                <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {character.species ? (
                    <SpeciesDetails character={character} setCharacter={setCharacter} species={character.species} languagesData={languagesData} />
                  ) : (
                    <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(17, 18, 24, 0.4)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', color: '#64748b' }}>
                      <span style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>👤</span>
                      <p style={{ margin: 0 }}>Selecione uma espécie para ver os detalhes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Atributos */}
        {currentStep === 3 && (
          <div className="step-container">
            {/* Standardized header */}
              <StepHeader 
                onPrev={() => setCurrentStep(2)}
                onNext={() => setCurrentStep(4)}
                canAdvance={validationResult.byStep.attributes.length === 0}
                activeStep={4}
                onStepClick={setCurrentStep}
                characterName={character.name}
                setCharacterName={(n) => setCharacter(prev => ({ ...prev, name: n }))}
                portrait={character.portrait}
                onPortraitClick={() => setIsPortraitModalOpen(true)}
                selections={stepSelections}
              />
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 16px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '12px', paddingBottom: '40px' }}>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: '#f1f5f9', margin: '0 0 8px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#f97316' }}>✦</span> Atributos do Personagem
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.6, maxWidth: '600px' }}>
                    Escolha o método para determinar seus pontos base. Bônus do antecedente serão adicionados a estes valores.
                  </p>
                </div>
              </div>

              <AttributesStep character={character} setCharacter={setCharacter} getAttributeBonus={getAttributeBonus} selectedBackground={selectedBackground} />

            </div>
          </div>
        )}

        {/* Step 4: Equipamento */}
        {currentStep === 4 && (
          <div className="step-container">
            <StepHeader 
              onPrev={() => setCurrentStep(3)}
              onNext={() => setCurrentStep(5)}
              canAdvance={validationResult.byStep.equipment.length === 0}
              activeStep={5}
              onStepClick={setCurrentStep}
              characterName={character.name}
              setCharacterName={(n: string) => setCharacter(prev => ({ ...prev, name: n }))}
              portrait={character.portrait}
              onPortraitClick={() => setIsPortraitModalOpen(true)}
                selections={stepSelections}
            />
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 16px 0' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '12px', paddingBottom: '40px' }}>
              <ValidationBanner errors={validationResult.byStep.equipment} />
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#f1f5f9', margin: '0 0 8px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#f97316' }}>✦</span> Equipamento Inicial
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.6, maxWidth: '600px' }}>
                  Confira tudo o que seu personagem carrega no início de sua aventura.
                </p>
              </div>

              <EquipmentStep
                character={character}
                selectedBackground={selectedBackground}
                updateEquipment={(updater) => setCharacter(prev => ({ ...prev, equipment: updater(prev.equipment) }))}
                updateSpells={(updater) => setCharacter(prev => ({ ...prev, spells: updater(prev.spells) }))}
                derivedSheet={derivedSheet}
              />
            </div>
          </div>
        )}

        {/* Step 5: Ficha do Personagem */}
        {currentStep === 5 && (() => {
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
            <div className="step-container">
              <StepHeader
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
              />
              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 16px 0' }} />
              <ValidationBanner errors={validationResult.errors} />
              <CharacterSheetPage
                characterName={character.name}
                portrait={character.portrait}
                speciesName={speciesName}
                className={character.characterClass?.name ?? ''}
                characterLevel={characterLevel}
                derivedSheet={derivedSheet}
                playState={playState}
                onUpdatePlayState={setPlayState}
                onGoToEquipment={() => setCurrentStep(4)}
                onGoToSpells={() => setCurrentStep(4)}
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
            </div>
          );
        })()}

      </div>
      {/* Portrait Selection Modal */}
      {isPortraitModalOpen && (
        <div className="tooltip-overlay" onClick={() => setIsPortraitModalOpen(false)}>
          <div className="class-tooltip" style={{ maxWidth: '800px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px' }}>
              <h2 style={{ color: '#f97316', marginBottom: '20px' }}>Escolha seu Retrato</h2>
              <div className="portrait-grid">
                {PORTRAITS.map((p) => (
                  <div 
                    key={p} 
                    className={`portrait-item ${character.portrait === p ? 'selected' : ''}`}
                    onClick={() => {
                      setCharacter(prev => ({ ...prev, portrait: p }));
                      setIsPortraitModalOpen(false);
                    }}
                  >
                    <img src={`/imgs/portrait_caracter/${p}`} alt={p} />
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setIsPortraitModalOpen(false)}
                style={{ marginTop: '20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </GlossaryTooltipProvider>
  );
}

export default App

export interface SpellSlots {
  1?: number;
  2?: number;
  3?: number;
  4?: number;
  5?: number;
  6?: number;
  7?: number;
  8?: number;
  9?: number;
}

export interface WeaponAttack {
  weaponName: string;
  attackBonus: number;
  damageBonus: number;
  damageDice: string;
  damageType: string;
  isFinesse: boolean;
  range: string;
  properties: string[];
  actionType: 'attack' | 'action' | 'bonus' | 'reaction' | 'other';
}

export interface DerivedSkill {
  label: string;
  attribute: string;
  modifier: number;
  proficient: boolean;
  expertise: boolean;
  halfProficient: boolean;
  /** Modificador base do atributo (sem proficiência) */
  baseAbilityMod: number;
  /** Valor numérico do bônus de proficiência aplicado (0, half, full, ou double) */
  proficiencyValue: number;
}

export interface AttributeBreakdownRow {
  label: string;
  value: number;
}


export interface DerivedSavingThrow {
  label: string;
  attribute: string;
  modifier: number;
  proficient: boolean;
}


export interface DerivedSpellFeature {
  name: string;
  source: 'species' | 'talent';
  origin: string;
}

export interface ActiveTalentSummary {
  name: string;
  source: 'background' | 'species';
  notes: string[];
}

export interface DerivedSheet {
  // Nível
  level: number;

  // Atributos
  finalAttributes: Record<string, number>;
  modifiers: Record<string, number>;
  /** Breakdown de como cada atributo foi calculado (base + bônus) */
  attributeBreakdowns: Record<string, AttributeBreakdownRow[]>;

  // Combate
  maxHP: number;
  hitDie: string;
  initiative: number;
  armorClass: number;
  proficiencyBonus: number;

  // Velocidade, tamanho e sentidos
  speed: string;
  creatureSize: string;
  specialSenses: string[];

  // Proficiências e idiomas (valores internos usados pelo motor de regras)
  skillProficiencies: string[];
  weaponProficiencies: string[];
  armorProficiencies: string[];
  savingThrowProficiencies: string[];
  toolProficiencies: string[];
  languages: string[];

  // Derivados tipados (para a ficha)
  skills: DerivedSkill[];
  derivedSavingThrows: DerivedSavingThrow[];
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;

  // Ataques
  weaponAttacks: WeaponAttack[];

  // Magia
  isCaster: boolean;
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  spellSlots?: SpellSlots;
  preparedSpellCount?: number;
  cantripsKnown?: number;

  // Truques raciais (não contam no limite de classe)
  racialCantrips: string[];
  bonusCantrips: DerivedSpellFeature[];
  bonusPreparedSpells: DerivedSpellFeature[];

  // Resistências/defesas derivadas de efeitos permanentes da ficha
  derivedDefenses: string[];
  derivedTraits: string[];

  // Talentos/benefícios aplicados no motor
  originTalent?: string;
  activeTalents: ActiveTalentSummary[];

  /** Se a classe concede Expertise neste nível e quantas perícias pode ter */
  classGrantsExpertise: boolean;
  expertiseCount: number;
  /** Se a classe concede Jack of All Trades neste nível (Bardo nv 2+) */
  jackOfAllTrades: boolean;

  /** Breakdown de níveis por classe (multiclasse) */
  classLevels?: Array<{ classId: string; className: string; level: number }>;
}

// src/data/talentChoiceConfig.ts
// Spell lists are loaded from extracted JSON files (source: player_handbook_2024.docx)

export const ATTRIBUTES = [
  "Carisma",
  "Constituição",
  "Destreza",
  "Força",
  "Inteligência",
  "Sabedoria"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const SPELLCASTING_ATTRIBUTES = [
  "Carisma",
  "Inteligência",
  "Sabedoria"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const SKILLS = [
  "Acrobacia", "Adestrar Animais", "Arcanismo", "Atletismo", 
  "Atuação", "Enganação", "Furtividade", "História", 
  "Intimidação", "Intuição", "Investigação", "Medicina", 
  "Natureza", "Percepção", "Persuasão", "Prestidigitação", 
  "Religião", "Sobrevivência"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const ARTISAN_TOOLS = [
  "Ferramentas de Alvenaria", "Ferramentas de Calígrafo", "Ferramentas de Carpinteiro",
  "Ferramentas de Cartógrafo", "Ferramentas de Costureiro", "Ferramentas de Coureiro",
  "Ferramentas de Ferreiro", "Ferramentas de Joalheiro", "Ferramentas de Oleiro",
  "Ferramentas de Pintor", "Ferramentas de Sapateiro", "Ferramentas de Soprador de Vidro",
  "Ferramentas de Tecelão", "Ferramentas de Trabalhador em Madeira", "Suprimentos de Alquimista",
  "Suprimentos de Cervejeiro", "Utensílios de Cozinheiro"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const MUSICAL_INSTRUMENTS = [
  "Alaúde", "Charamela", "Flauta", "Flauta de Pã", "Lira", "Tambor", "Trombeta", "Violino", "Xilofone"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const GAMING_SETS = [
  "Dados",
  "Xadrez-do-Dragão",
  "Baralho",
  "Conjunto do Jogo dos Três Dragões"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const OTHER_TOOLS = [
  "Ferramentas de Ladrão", "Ferramentas de Navegador", "Ferramentas de Veneneiro",
  "Kit de Disfarce", "Kit de Falsificação", "Kit de Herbalismo"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const ALL_TOOLS = [...ARTISAN_TOOLS, ...MUSICAL_INSTRUMENTS, ...OTHER_TOOLS].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const DAMAGE_TYPES_ELEMENTAL = [
  "Ácido", "Elétrico", "Gélido", "Ígneo", "Trovejante"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const ALL_DAMAGE_TYPES = [
  "Ácido", "Contundente", "Cortante", "Elétrico", "Força", "Gélido", "Ígneo", 
  "Necrótico", "Perfurante", "Psíquico", "Radiante", "Trovejante", "Venenoso"
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

// --- Importação das listas de magia dos JSONs extraídos ---
import clericSpells from './spells/magic_initiate_cleric.json';
import druidSpells from './spells/magic_initiate_druid.json';
import wizardSpells from './spells/magic_initiate_wizard.json';

type SpellEntry = { name: string; level: string };

const getNames = (spells: SpellEntry[], level: string) =>
  spells
    .filter(s => s.level === level)
    .map(s => s.name)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const CANTRIPS_BY_LIST: Record<string, string[]> = {
  "Clérigo": getNames(clericSpells as SpellEntry[], 'Truque'),
  "Druida":  getNames(druidSpells as SpellEntry[], 'Truque'),
  "Mago":    getNames(wizardSpells as SpellEntry[], 'Truque'),
};

export const LEVEL1_SPELLS_BY_LIST: Record<string, string[]> = {
  "Clérigo": getNames(clericSpells as SpellEntry[], '1º Círculo'),
  "Druida":  getNames(druidSpells as SpellEntry[], '1º Círculo'),
  "Mago":    getNames(wizardSpells as SpellEntry[], '1º Círculo'),
};

// --- ESTRUTURAS DE DEFINIÇÃO ---

export type FieldType = 'select' | 'dependentSelect' | 'multiselect';

export interface TalentField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // Para selects estáticos simples
  optionGroups?: { label: string; options: string[] }[]; // Para selects com <optgroup>
  optionsResolver?: (selections: Record<string, any>) => string[]; // Para selects cujas opções dependem de outro campo
  dependsOn?: string; // Limpa este campo se o "dependsOn" mudar
  excludeSelectedFrom?: string[]; // Não permite escolher o mesmo valor já escolhido em outras keys (para campos isolados do mesmo tipo, ex: truque 1, truque 2)
  tooltip?: string;
  placeholder?: string;
  isSpell?: boolean; // Marca campos que são magias/truques para exibir tooltip com detalhes
  hiddenUntil?: string; // Esconde o campo até que o campo referenciado tenha um valor
}

export interface TalentChoiceDef {
  description: string;
  fields: TalentField[];
  summaryResolver: (selections: Record<string, any>) => string;
}

// --- CONFIGURAÇÃO PRINCIPAL ---

export const TALENT_CHOICES_CONFIG: Record<string, TalentChoiceDef> = {
  // TALENTOS DE ORIGEM
  "Artífice": {
    description: "Escolha 3 Ferramentas de Artesão diferentes para concluir este talento.",
    fields: [
      { key: "tool1", label: "Ferramenta 1", type: "select", options: ARTISAN_TOOLS, excludeSelectedFrom: ["tool2", "tool3"] },
      { key: "tool2", label: "Ferramenta 2", type: "select", options: ARTISAN_TOOLS, excludeSelectedFrom: ["tool1", "tool3"] },
      { key: "tool3", label: "Ferramenta 3", type: "select", options: ARTISAN_TOOLS, excludeSelectedFrom: ["tool1", "tool2"] }
    ],
    summaryResolver: (s) => [s.tool1, s.tool2, s.tool3].filter(Boolean).join(", ")
  },

  "Habilidoso": {
    description: "Escolha 3 Perícias ou Ferramentas (sem repetir) para concluir este talento.",
    fields: [
      {
        key: "pick1", label: "Escolha 1", type: "select", excludeSelectedFrom: ["pick2", "pick3"],
        optionGroups: [ { label: "Perícias", options: SKILLS }, { label: "Ferramentas", options: ALL_TOOLS } ]
      },
      {
        key: "pick2", label: "Escolha 2", type: "select", excludeSelectedFrom: ["pick1", "pick3"],
        optionGroups: [ { label: "Perícias", options: SKILLS }, { label: "Ferramentas", options: ALL_TOOLS } ]
      },
      {
        key: "pick3", label: "Escolha 3", type: "select", excludeSelectedFrom: ["pick1", "pick2"],
        optionGroups: [ { label: "Perícias", options: SKILLS }, { label: "Ferramentas", options: ALL_TOOLS } ]
      }
    ],
    summaryResolver: (s) => [s.pick1, s.pick2, s.pick3].filter(Boolean).join(", ")
  },

  "Iniciado em Magia (Clérigo)": {
    description: "",
    fields: [
      { key: "spellcastingAbility", label: "Atributo de Conjuração", type: "select", options: SPELLCASTING_ATTRIBUTES, placeholder: "- Escolha uma opção -" },
      { key: "cantrip1", label: "Truque 1", type: "select", options: CANTRIPS_BY_LIST["Clérigo"], excludeSelectedFrom: ["cantrip2"], placeholder: "- Escolha um truque -", isSpell: true, hiddenUntil: "spellcastingAbility" },
      { key: "cantrip2", label: "Truque 2", type: "select", options: CANTRIPS_BY_LIST["Clérigo"], excludeSelectedFrom: ["cantrip1"], placeholder: "- Escolha um truque -", isSpell: true, hiddenUntil: "spellcastingAbility" },
      { key: "level1Spell", label: "Magia (1º Círculo)", type: "select", options: LEVEL1_SPELLS_BY_LIST["Clérigo"], placeholder: "- Escolha uma magia -", isSpell: true, hiddenUntil: "spellcastingAbility" },
    ],
    summaryResolver: (s) => `Lista Clérigo; Truques: ${[s.cantrip1, s.cantrip2].filter(Boolean).join(", ")}; Magia: ${s.level1Spell}; Atr: ${s.spellcastingAbility}`
  },
  "Iniciado em Magia (Druida)": {
    description: "",
    fields: [
      { key: "spellcastingAbility", label: "Atributo de Conjuração", type: "select", options: SPELLCASTING_ATTRIBUTES, placeholder: "- Escolha uma opção -" },
      { key: "cantrip1", label: "Truque 1", type: "select", options: CANTRIPS_BY_LIST["Druida"], excludeSelectedFrom: ["cantrip2"], placeholder: "- Escolha um truque -", isSpell: true, hiddenUntil: "spellcastingAbility" },
      { key: "cantrip2", label: "Truque 2", type: "select", options: CANTRIPS_BY_LIST["Druida"], excludeSelectedFrom: ["cantrip1"], placeholder: "- Escolha um truque -", isSpell: true, hiddenUntil: "spellcastingAbility" },
      { key: "level1Spell", label: "Magia (1º Círculo)", type: "select", options: LEVEL1_SPELLS_BY_LIST["Druida"], placeholder: "- Escolha uma magia -", isSpell: true, hiddenUntil: "spellcastingAbility" },
    ],
    summaryResolver: (s) => `Lista Druida; Truques: ${[s.cantrip1, s.cantrip2].filter(Boolean).join(", ")}; Magia: ${s.level1Spell}; Atr: ${s.spellcastingAbility}`
  },
  "Iniciado em Magia (Mago)": {
    description: "",
    fields: [
      { key: "spellcastingAbility", label: "Atributo de Conjuração", type: "select", options: SPELLCASTING_ATTRIBUTES, placeholder: "- Escolha uma opção -" },
      { key: "cantrip1", label: "Truque 1", type: "select", options: CANTRIPS_BY_LIST["Mago"], excludeSelectedFrom: ["cantrip2"], placeholder: "- Escolha um truque -", isSpell: true, hiddenUntil: "spellcastingAbility" },
      { key: "cantrip2", label: "Truque 2", type: "select", options: CANTRIPS_BY_LIST["Mago"], excludeSelectedFrom: ["cantrip1"], placeholder: "- Escolha um truque -", isSpell: true, hiddenUntil: "spellcastingAbility" },
      { key: "level1Spell", label: "Magia (1º Círculo)", type: "select", options: LEVEL1_SPELLS_BY_LIST["Mago"], placeholder: "- Escolha uma magia -", isSpell: true, hiddenUntil: "spellcastingAbility" },
    ],
    summaryResolver: (s) => `Lista Mago; Truques: ${[s.cantrip1, s.cantrip2].filter(Boolean).join(", ")}; Magia: ${s.level1Spell}; Atr: ${s.spellcastingAbility}`
  },
  
  // Como D&D 2024 separou o "Iniciado em Magia" por lista, crio uma versão genérica para fallback se o talento for genérico
  "Iniciado em Magia": {
    description: "",
    fields: [
      { key: "spellList", label: "Lista de Magia", type: "select", options: ["Clérigo", "Druida", "Mago"], placeholder: "- Escolha uma lista -" },
      { key: "spellcastingAbility", label: "Atributo de Conjuração", type: "select", options: SPELLCASTING_ATTRIBUTES, placeholder: "- Escolha uma opção -" },
      { key: "cantrip1", label: "Truque 1", type: "dependentSelect", dependsOn: "spellList", optionsResolver: (s) => CANTRIPS_BY_LIST[s.spellList] || [], excludeSelectedFrom: ["cantrip2"], placeholder: "- Escolha um truque -", isSpell: true, hiddenUntil: "spellcastingAbility" },
      { key: "cantrip2", label: "Truque 2", type: "dependentSelect", dependsOn: "spellList", optionsResolver: (s) => CANTRIPS_BY_LIST[s.spellList] || [], excludeSelectedFrom: ["cantrip1"], placeholder: "- Escolha um truque -", isSpell: true, hiddenUntil: "spellcastingAbility" },
      { key: "level1Spell", label: "Magia (1º Círculo)", type: "dependentSelect", dependsOn: "spellList", optionsResolver: (s) => LEVEL1_SPELLS_BY_LIST[s.spellList] || [], placeholder: "- Escolha uma magia -", isSpell: true, hiddenUntil: "spellcastingAbility" },
    ],
    summaryResolver: (s) => `Lista ${s.spellList}; Truques: ${[s.cantrip1, s.cantrip2].filter(Boolean).join(", ")}; Magia: ${s.level1Spell}; Atr: ${s.spellcastingAbility}`
  },

  "Músico": {
    description: "Escolha 3 Instrumentos Musicais diferentes para concluir este talento.",
    fields: [
      { key: "inst1", label: "Instrumento 1", type: "select", options: MUSICAL_INSTRUMENTS, excludeSelectedFrom: ["inst2", "inst3"] },
      { key: "inst2", label: "Instrumento 2", type: "select", options: MUSICAL_INSTRUMENTS, excludeSelectedFrom: ["inst1", "inst3"] },
      { key: "inst3", label: "Instrumento 3", type: "select", options: MUSICAL_INSTRUMENTS, excludeSelectedFrom: ["inst1", "inst2"] }
    ],
    summaryResolver: (s) => [s.inst1, s.inst2, s.inst3].filter(Boolean).join(", ")
  },

  // TALENTOS GERAIS
  "Adepto Elemental": {
    description: "Escolha um tipo de dano elemental para dominar.",
    fields: [
      { key: "damageType", label: "Tipo de Dano", type: "select", options: DAMAGE_TYPES_ELEMENTAL }
    ],
    summaryResolver: (s) => `Dano: ${s.damageType}`
  },

  "Resiliente": {
    description: "Escolha um atributo para ganhar proficiência em salvaguarda.",
    fields: [
      { key: "ability", label: "Atributo", type: "select", options: ATTRIBUTES }
    ],
    summaryResolver: (s) => `Atributo: ${s.ability}`
  },

  "Resistente": {
    description: "Escolha um tipo de dano para ganhar resistência.",
    fields: [
      { key: "damageType", label: "Tipo de Dano", type: "select", options: ALL_DAMAGE_TYPES }
    ],
    summaryResolver: (s) => `Resistência: ${s.damageType}`
  },

  "Telecinético": {
    description: "Escolha um atributo mental para aumentar.",
    fields: [
      { key: "ability", label: "Atributo", type: "select", options: SPELLCASTING_ATTRIBUTES }
    ],
    summaryResolver: (s) => `Atributo aumentado: ${s.ability}`
  },

  "Telepático": {
    description: "Escolha um atributo mental para aumentar.",
    fields: [
      { key: "ability", label: "Atributo", type: "select", options: SPELLCASTING_ATTRIBUTES }
    ],
    summaryResolver: (s) => `Atributo aumentado: ${s.ability}`
  },

  "Especialista em Perícia": {
    description: "Escolha uma perícia na qual você já é proficiente para ganhar Especialização.",
    fields: [
      // No futuro, optionsResolver pode filtrar baseado nas proficiências atuais da ficha (passada via context ou params)
      // Por enquanto, mostraremos todas as perícias.
      { key: "skill", label: "Perícia", type: "select", options: SKILLS }
    ],
    summaryResolver: (s) => `Especialização: ${s.skill}`
  }
};

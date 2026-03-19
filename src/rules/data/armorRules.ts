/**
 * Tabela tipada de armaduras com valores de CA estruturados.
 * armor.json armazena CA como strings ("13 + modificador de Des (máx. 2)");
 * esta tabela é a fonte autoritativa para cálculos do engine.
 *
 * IDs correspondem aos nomes usados em equipmentData.ts e no inventário.
 */

export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';

export interface ArmorEntry {
  id: string;
  name: string;
  type: ArmorType;
  baseAC: number;
  /** null = DEX completa, número = máximo bônus de DEX (0 para pesada) */
  maxDexBonus: number | null;
  /** Requisito de Força para armadura pesada (null se não houver) */
  strengthRequirement: number | null;
  stealthDisadvantage: boolean;
}

export const ARMOR_TABLE: ArmorEntry[] = [
  // Armadura Leve
  { id: 'acolchoada',         name: 'Armadura Acolchoada',      type: 'light',  baseAC: 11, maxDexBonus: null, strengthRequirement: null, stealthDisadvantage: true  },
  { id: 'couro',              name: 'Armadura de Couro',         type: 'light',  baseAC: 11, maxDexBonus: null, strengthRequirement: null, stealthDisadvantage: false },
  { id: 'couro_batido',       name: 'Armadura de Couro Batido',  type: 'light',  baseAC: 12, maxDexBonus: null, strengthRequirement: null, stealthDisadvantage: false },

  // Armadura Média
  { id: 'peles',              name: 'Armadura de Peles',         type: 'medium', baseAC: 12, maxDexBonus: 2,    strengthRequirement: null, stealthDisadvantage: false },
  { id: 'cota_de_malha',      name: 'Cota de Malha',             type: 'medium', baseAC: 13, maxDexBonus: 2,    strengthRequirement: null, stealthDisadvantage: false },
  { id: 'cota_malha_parcial', name: 'Cota de Malha Parcial',     type: 'medium', baseAC: 14, maxDexBonus: 2,    strengthRequirement: null, stealthDisadvantage: false },
  { id: 'peitoral',           name: 'Peitoral',                  type: 'medium', baseAC: 14, maxDexBonus: 2,    strengthRequirement: null, stealthDisadvantage: false },
  { id: 'meia_armadura',      name: 'Meia Armadura',             type: 'medium', baseAC: 15, maxDexBonus: 2,    strengthRequirement: null, stealthDisadvantage: true  },

  // Armadura Pesada
  { id: 'argolas',            name: 'Armadura de Argolas',       type: 'heavy',  baseAC: 14, maxDexBonus: 0,    strengthRequirement: null, stealthDisadvantage: true  },
  { id: 'cota_de_placas',     name: 'Cota de Placas',            type: 'heavy',  baseAC: 16, maxDexBonus: 0,    strengthRequirement: 13,   stealthDisadvantage: true  },
  { id: 'armadura_de_placas', name: 'Armadura de Placas',        type: 'heavy',  baseAC: 18, maxDexBonus: 0,    strengthRequirement: 15,   stealthDisadvantage: true  },

  // Escudo
  { id: 'escudo',             name: 'Escudo',                    type: 'shield', baseAC: 2,  maxDexBonus: null, strengthRequirement: null, stealthDisadvantage: false },
];

const ARMOR_BY_ID: Map<string, ArmorEntry> = new Map(ARMOR_TABLE.map(a => [a.id, a]));

// Também indexar por nome (case-insensitive) para compatibilidade com equipmentData.ts
const ARMOR_BY_NAME: Map<string, ArmorEntry> = new Map(
  ARMOR_TABLE.map(a => [a.name.toLowerCase(), a])
);

export function getArmorById(id: string): ArmorEntry | null {
  return ARMOR_BY_ID.get(id) ?? null;
}

export function getArmorByName(name: string): ArmorEntry | null {
  return ARMOR_BY_NAME.get(name.toLowerCase()) ?? null;
}

export function isShield(id: string): boolean {
  return ARMOR_BY_ID.get(id)?.type === 'shield';
}

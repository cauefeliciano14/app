/**
 * Representa um efeito genérico de regra que pode ser aplicado ao personagem.
 * Preparado para expansão futura: subclasses, condições, itens mágicos, etc.
 */
export type RuleEffectType =
  | 'attribute_bonus'
  | 'proficiency_grant'
  | 'hp_bonus'
  | 'ac_override'
  | 'ac_bonus'
  | 'speed_bonus'
  | 'damage_bonus'
  | 'attack_bonus'
  | 'spell_slots_bonus'
  | 'feature_grant';

export interface RuleEffect {
  type: RuleEffectType;
  source: string; // ex: 'background:soldado', 'species:elfo', 'feature:defesa_sem_armadura'
  value?: number;
  attribute?: string;
  proficiencyName?: string;
  description?: string;
}

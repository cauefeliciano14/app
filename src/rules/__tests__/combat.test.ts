import { describe, it, expect } from 'vitest';
import {
  calculateMaxHP,
  calculateInitiative,
  calculateAC,
  calculateMeleeAttackBonus,
  calculateRangedAttackBonus,
  buildWeaponAttack,
} from '../calculators/combat';

// ---------------------------------------------------------------------------
// calculateMaxHP — nível 1 por classe
// ---------------------------------------------------------------------------
describe('calculateMaxHP', () => {
  it('barbaro nível 1, CON+2 → 14', () => expect(calculateMaxHP('barbaro', 1, 2)).toBe(14));
  it('barbaro nível 1, CON+0 → 12', () => expect(calculateMaxHP('barbaro', 1, 0)).toBe(12));
  it('guerreiro nível 1, CON+2 → 12', () => expect(calculateMaxHP('guerreiro', 1, 2)).toBe(12));
  it('guardiao nível 1, CON+2 → 12', () => expect(calculateMaxHP('guardiao', 1, 2)).toBe(12));
  it('paladino nível 1, CON+2 → 12', () => expect(calculateMaxHP('paladino', 1, 2)).toBe(12));
  it('bardo nível 1, CON+1 → 9', () => expect(calculateMaxHP('bardo', 1, 1)).toBe(9));
  it('clerigo nível 1, CON+2 → 10', () => expect(calculateMaxHP('clerigo', 1, 2)).toBe(10));
  it('druida nível 1, CON+2 → 10', () => expect(calculateMaxHP('druida', 1, 2)).toBe(10));
  it('ladino nível 1, CON+1 → 9', () => expect(calculateMaxHP('ladino', 1, 1)).toBe(9));
  it('monge nível 1, CON+1 → 9', () => expect(calculateMaxHP('monge', 1, 1)).toBe(9));
  it('feiticeiro nível 1, CON+1 → 7', () => expect(calculateMaxHP('feiticeiro', 1, 1)).toBe(7));
  it('mago nível 1, CON+1 → 7', () => expect(calculateMaxHP('mago', 1, 1)).toBe(7));

  it('classe desconhecida → 0', () => expect(calculateMaxHP('desconhecido', 1, 2)).toBe(0));

  it('guerreiro nível 2, CON+2 → 18 (10+2) + 1*(6+2)', () => {
    // Nível 1: 12; Nível 2: 12 + (6+2) = 20
    expect(calculateMaxHP('guerreiro', 2, 2)).toBe(20);
  });

  it('HP mínimo válido — CON negativo', () => {
    // barbaro nível 1, CON -1 → 12 + (-1) = 11
    expect(calculateMaxHP('barbaro', 1, -1)).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// calculateInitiative
// ---------------------------------------------------------------------------
describe('calculateInitiative', () => {
  it('DEX mod +3 → iniciativa +3', () => expect(calculateInitiative(3)).toBe(3));
  it('DEX mod -1 → iniciativa -1', () => expect(calculateInitiative(-1)).toBe(-1));
  it('DEX mod 0 → iniciativa 0', () => expect(calculateInitiative(0)).toBe(0));
});

// ---------------------------------------------------------------------------
// calculateAC
// ---------------------------------------------------------------------------
describe('calculateAC', () => {
  it('sem armadura, DEX+0 → CA 10', () => {
    expect(calculateAC({ dexModifier: 0 })).toBe(10);
  });

  it('sem armadura, DEX+3 → CA 13', () => {
    expect(calculateAC({ dexModifier: 3 })).toBe(13);
  });

  it('com escudo, DEX+0 → CA 12', () => {
    expect(calculateAC({ dexModifier: 0, hasShield: true, armorProficiencies: ['Escudo'] })).toBe(12);
  });

  it('barbaro sem armadura, DEX+2, CON+3 → CA 15 (Defesa sem Armadura)', () => {
    expect(calculateAC({ dexModifier: 2, classId: 'barbaro', conModifier: 3 })).toBe(15);
  });

  it('monge sem armadura, DEX+3, WIS+2 → CA 15 (Defesa sem Armadura)', () => {
    expect(calculateAC({ dexModifier: 3, classId: 'monge', wisModifier: 2 })).toBe(15);
  });

  it('cota_malha_parcial (armadura média), DEX+3 → CA 14+2=16', () => {
    expect(calculateAC({ dexModifier: 3, equippedArmorId: 'cota_malha_parcial', armorProficiencies: ['Armadura Média'] })).toBe(16);
  });

  it('armadura_de_placas (pesada), DEX+3 → CA 18 (sem DEX)', () => {
    expect(calculateAC({ dexModifier: 3, equippedArmorId: 'armadura_de_placas', armorProficiencies: ['Armadura Pesada'] })).toBe(18);
  });

  it('cota_de_placas (pesada) + escudo → CA 16+2=18', () => {
    expect(calculateAC({ dexModifier: 0, equippedArmorId: 'cota_de_placas', hasShield: true, armorProficiencies: ['Armadura Pesada', 'Escudo'] })).toBe(18);
  });

  it('couro (leve), DEX+3 → CA 11+3=14', () => {
    expect(calculateAC({ dexModifier: 3, equippedArmorId: 'couro', armorProficiencies: ['Armadura Leve'] })).toBe(14);
  });
});

// ---------------------------------------------------------------------------
// calculateMeleeAttackBonus
// ---------------------------------------------------------------------------
describe('calculateMeleeAttackBonus', () => {
  it('STR+3, BP+2 → +5', () => expect(calculateMeleeAttackBonus(3, 2)).toBe(5));
  it('STR+0, BP+2 → +2', () => expect(calculateMeleeAttackBonus(0, 2)).toBe(2));
  it('STR-1, BP+2 → +1', () => expect(calculateMeleeAttackBonus(-1, 2)).toBe(1));

  it('arma finesse: usa DEX quando DEX > STR', () => {
    // STR+1, DEX+4, BP+2 → finesse usa DEX → +6
    expect(calculateMeleeAttackBonus(1, 2, true, 4)).toBe(6);
  });

  it('arma finesse: usa STR quando STR > DEX', () => {
    // STR+4, DEX+1, BP+2 → finesse usa STR → +6
    expect(calculateMeleeAttackBonus(4, 2, true, 1)).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// calculateRangedAttackBonus
// ---------------------------------------------------------------------------
describe('calculateRangedAttackBonus', () => {
  it('DEX+3, BP+2 → +5', () => expect(calculateRangedAttackBonus(3, 2)).toBe(5));
  it('DEX-1, BP+2 → +1', () => expect(calculateRangedAttackBonus(-1, 2)).toBe(1));
});

// ---------------------------------------------------------------------------
// buildWeaponAttack
// ---------------------------------------------------------------------------
describe('buildWeaponAttack', () => {
  it('Adaga (finesse): STR+1, DEX+3, BP+2 → ataque +5, dano +3', () => {
    const atk = buildWeaponAttack('Adaga', 1, 3, 2, ['Armas Simples']);
    expect(atk).not.toBeNull();
    expect(atk!.attackBonus).toBe(5); // DEX(3) + BP(2) pois DEX>STR
    expect(atk!.damageBonus).toBe(3);
    expect(atk!.damageDice).toBe('1d4');
    expect(atk!.damageType).toBe('Perfurante');
  });

  it('Maça (corpo a corpo normal): STR+3, DEX+1, BP+2 → ataque +5', () => {
    const atk = buildWeaponAttack('Maça', 3, 1, 2, ['Armas Simples']);
    expect(atk).not.toBeNull();
    expect(atk!.attackBonus).toBe(5);
    expect(atk!.damageBonus).toBe(3);
  });

  it('Arco Curto (distância): DEX+3, BP+2 → ataque +5', () => {
    const atk = buildWeaponAttack('Arco Curto', 0, 3, 2, ['Armas Simples']);
    expect(atk).not.toBeNull();
    expect(atk!.attackBonus).toBe(5);
    expect(atk!.damageBonus).toBe(3);
  });

  it('arma desconhecida retorna null', () => {
    expect(buildWeaponAttack('Espada Fantástica', 3, 2, 2, ['Armas Simples'])).toBeNull();
  });
});

describe('novas regras de treinamento e proficiência', () => {
  it('ignora armadura e escudo sem treinamento apropriado', () => {
    expect(calculateAC({ dexModifier: 2, equippedArmorId: 'couro', hasShield: true, armorProficiencies: [] })).toBe(12);
  });

  it('arma sem proficiência não soma bônus de proficiência no ataque', () => {
    const atk = buildWeaponAttack('Espada Longa', 3, 1, 2, ['Armas Simples']);
    expect(atk).not.toBeNull();
    expect(atk!.attackBonus).toBe(3);
    expect(atk!.damageBonus).toBe(3);
  });
});

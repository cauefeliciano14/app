export const classStartingSpells: Record<string, { cantrips: string[], level1: string[], isCaster: boolean }> = {
  barbaro: { isCaster: false, cantrips: [], level1: [] },
  guerreiro: { isCaster: false, cantrips: [], level1: [] },
  monge: { isCaster: false, cantrips: [], level1: [] },
  ladino: { isCaster: false, cantrips: [], level1: [] },
  
  bardo: { isCaster: true, cantrips: ["Zombaria Viciosa", "Luz"], level1: ["Palavra Curativa", "Enfeitiçar Pessoa"] },
  bruxo: { isCaster: true, cantrips: ["Rajada Mística", "Toque Arrepiante"], level1: ["Bruxaria", "Braços de Hadar"] },
  clerigo: { isCaster: true, cantrips: ["Chama Sagrada", "Taumaturgia"], level1: ["Curar Ferimentos", "Bênção"] },
  druida: { isCaster: true, cantrips: ["Chicote de Espinhos", "Orientação"], level1: ["Curar Ferimentos", "Enredar"] },
  feiticeiro: { isCaster: true, cantrips: ["Raio de Fogo", "Luz", "Mãos Mágicas"], level1: ["Mísseis Mágicos", "Escudo Arcano"] },
  guardiao: { isCaster: true, cantrips: [], level1: ["Marca do Caçador", "Curar Ferimentos"] }, // Guardiao level 1 spells depend on 2024 rules, but starts with magic!
  mago: { isCaster: true, cantrips: ["Raio de Fogo", "Ilusão Menor", "Mãos Mágicas"], level1: ["Escudo Arcano", "Mísseis Mágicos", "Identificar", "Armadura Arcana"] },
  paladino: { isCaster: true, cantrips: [], level1: ["Destruição Colérica", "Heroísmo"] }
};

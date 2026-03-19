type AttributeSet = [number, number, number, number, number, number]; // forca, destreza, constituicao, inteligencia, sabedoria, carisma

const classAttributeSuggestions: Record<string, AttributeSet> = {
  barbaro: [15, 13, 14, 10, 12, 8],
  bardo: [8, 14, 12, 13, 10, 15],
  bruxo: [8, 14, 13, 12, 10, 15],
  clerigo: [14, 8, 13, 10, 15, 12],
  druida: [8, 12, 14, 13, 15, 10],
  feiticeiro: [10, 13, 14, 8, 12, 15],
  guardiao: [12, 15, 13, 8, 14, 10],
  guerreiro: [15, 14, 13, 8, 10, 12],
  ladino: [12, 15, 13, 14, 10, 8],
  mago: [8, 12, 13, 15, 14, 10],
  monge: [12, 15, 13, 10, 14, 8],
  paladino: [15, 10, 13, 8, 12, 14]
};

export default classAttributeSuggestions;

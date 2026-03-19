export interface EquipmentPackage {
  optionA: {
    items: string[];
    gold: number;
    description: string;
  };
  optionB: {
    gold: number;
    description: string;
  };
}

export const classEquipment: Record<string, EquipmentPackage> = {
  barbaro: { 
    optionA: { items: ["Machadinha", "Machadinha", "Machadinha", "Machadinha", "Machado Grande", "Kit de Aventureiro"], gold: 15, description: "4 Machadinhas, Machado Grande, Kit de Aventureiro e 15 PO" }, 
    optionB: { gold: 75, description: "75 PO" }
  },
  bardo: { 
    optionA: { items: ["Armadura de Couro", "Adaga", "Adaga", "Instrumento Musical", "Kit de Artista"], gold: 19, description: "Armadura de Couro, 2 Adagas, Instrumento Musical, Kit de Artista e 19 PO" }, 
    optionB: { gold: 90, description: "90 PO" }
  },
  bruxo: { 
    optionA: { items: ["Armadura de Couro", "Foice", "Adaga", "Adaga", "Foco Arcano", "Livro", "Kit de Erudito"], gold: 15, description: "Armadura de Couro, Foice, 2 Adagas, Foco Arcano (orbe), Livro (conhecimento oculto), Kit de Erudito e 15 PO" }, 
    optionB: { gold: 100, description: "100 PO" }
  },
  clerigo: { 
    optionA: { items: ["Cota de Malha Parcial", "Escudo", "Maça", "Símbolo Sagrado", "Kit de Sacerdote"], gold: 7, description: "Cota de Malha Parcial, Escudo, Maça, Símbolo Sagrado, Kit de Sacerdote e 7 PO" }, 
    optionB: { gold: 110, description: "110 PO" }
  },
  druida: { 
    optionA: { items: ["Armadura de Couro", "Escudo", "Foice", "Foco Druídico", "Kit de Explorador", "Kit de Herbalismo"], gold: 9, description: "Armadura de Couro, Escudo, Foice, Foco Druídico (Cajado), Kit de Explorador, Kit de Herbalismo, 9 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  feiticeiro: { 
    optionA: { items: ["Lança", "Adaga", "Adaga", "Foco Arcano", "Kit de Explorador de Masmorras"], gold: 28, description: "Lança, 2 Adagas, Foco Arcano (cristal), Kit de Explorador de Masmorras e 28 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  guardiao: { 
    optionA: { items: ["Couro Batido", "Cimitarra", "Espada Curta", "Arco Longo", "Aljava", "Flecha", "Foco Druídico", "Kit de Aventureiro"], gold: 7, description: "Armadura de Couro Batido, Cimitarra, Espada Curta, Arco Longo, 20 Flechas, Aljava, Foco Druídico (ramo de visco), Kit de Aventureiro e 7 PO" }, 
    optionB: { gold: 150, description: "150 PO" }
  },
  guerreiro: { 
    optionA: { items: ["Cota de Malha", "Espada Longa", "Espada Curta", "Besta Leve", "Kit de Aventureiro", "Girote"], gold: 15, description: "Cota de Malha, Espada Longa, Espada Curta, Besta Leve, 20 Virotes e Kit de Aventureiro e 15 PO (aproximado)" }, 
    optionB: { gold: 150, description: "150 PO" }
  },
  ladino: { 
    optionA: { items: ["Armadura de Couro", "Rapieira", "Arco Curto", "Aljava", "Flecha", "Ferramentas de Ladrão", "Kit de Ladrão"], gold: 18, description: "Armadura de Couro, Rapieira, Arco Curto, 20 Flechas, Aljava, Ferramentas de Ladrão, Kit de Ladrão e 18 PO" }, 
    optionB: { gold: 110, description: "110 PO" }
  },
  mago: { 
    optionA: { items: ["Bordão", "Livro de Magias", "Foco Arcano", "Kit de Erudito"], gold: 15, description: "Bordão, Livro de Magias, Foco Arcano, Kit de Erudito e 15 PO" }, 
    optionB: { gold: 75, description: "75 PO" }
  },
  monge: { 
    optionA: { items: ["Espada Curta", "Adaga", "Adaga", "Bolsa de Componentes", "Kit de Explorador de Masmorras"], gold: 10, description: "Espada Curta, 2 Adagas, Bolsa de Componentes, Kit de Explorador de Masmorras e 10 PO" }, 
    optionB: { gold: 60, description: "60 PO" }
  },
  paladino: { 
    optionA: { items: ["Espada Longa", "Escudo", "Cota de Malha", "Símbolo Sagrado", "Kit de Sacerdote"], gold: 40, description: "Espada Longa, Escudo, Cota de Malha, Símbolo Sagrado, Kit de Sacerdote e 40 PO" }, 
    optionB: { gold: 150, description: "150 PO" }
  }
};

export const backgroundEquipment: Record<string, EquipmentPackage> = {
  acolito: { 
    optionA: { items: ["Suprimentos de Calígrafo", "Livro", "Símbolo Sagrado", "Pergaminho", "Túnica"], gold: 8, description: "Suprimentos de Calígrafo, Livro (orações), Símbolo Sagrado, Pergaminho (10 folhas), Túnica, 8 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  andarilho: { 
    optionA: { items: ["Adaga", "Adaga", "Ferramentas de Ladrão", "Kit de Jogos", "Algibeira", "Algibeira", "Roupas de Viagem", "Saco de Dormir"], gold: 16, description: "2 Adagas, Ferramentas de Ladrão, Kit de Jogos (qualquer um), 2 Algibeiras, Roupas de Viagem, Saco de Dormir, 16 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  artesao: { 
    optionA: { items: ["Ferramentas de Artesão", "Algibeira", "Algibeira", "Roupas de Viagem"], gold: 32, description: "Ferramentas de Artesão, 2 Algibeiras, Roupas de Viagem, 32 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  artista: { 
    optionA: { items: ["Instrumento Musical", "Espelho", "Fantasia", "Fantasia", "Perfume", "Roupas de Viagem"], gold: 11, description: "Instrumento Musical, Espelho, 2 Fantasias, Perfume, Roupas de Viagem, 11 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  charlatao: { 
    optionA: { items: ["Kit de Falsificação", "Fantasia", "Roupas Finas"], gold: 15, description: "Kit de Falsificação, Fantasia, Roupas Finas, 15 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  criminoso: { 
    optionA: { items: ["Adaga", "Adaga", "Ferramentas de Ladrão", "Algibeira", "Algibeira", "Pé de Cabra", "Roupas de Viagem"], gold: 16, description: "2 Adagas, Ferramentas de Ladrão, 2 Algibeiras, Pé de Cabra, Roupas de Viagem, 16 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  eremita: { 
    optionA: { items: ["Cajado", "Kit de Herbalismo", "Lâmpada", "Livro", "Óleo", "Roupas de Viagem", "Saco de Dormir"], gold: 16, description: "Cajado, Kit de Herbalismo, Lâmpada, Livro (filosofia), Óleo (3 frascos), Roupas de Viagem, Saco de Dormir, 16 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  escriba: { 
    optionA: { items: ["Suprimentos de Calígrafo", "Lâmpada", "Óleo", "Pergaminho", "Roupas Finas"], gold: 23, description: "Suprimentos de Calígrafo, Lâmpada, Óleo (3 frascos), Pergaminho (12 folhas), Roupas Finas, 23 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  fazendeiro: { 
    optionA: { items: ["Foice", "Ferramentas de Carpinteiro", "Kit de Curandeiro", "Balde de Ferro", "Pá"], gold: 30, description: "Foice, Ferramentas de Carpinteiro, Kit de Curandeiro, Balde de Ferro, Pá, 30 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  guarda: { 
    optionA: { items: ["Lança", "Besta Leve", "Virote", "Kit de Jogo", "Aljava", "Grilhões", "Lanterna Coberta", "Roupas de Viagem"], gold: 12, description: "Lança, Besta Leve, 20 Virotes, Kit de Jogo, Aljava, Grilhões, Lanterna Coberta, Roupas de Viagem, 12 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  guia: { 
    optionA: { items: ["Arco Curto", "Flecha", "Ferramentas de Cartógrafo", "Aljava", "Roupas de Viagem", "Saco de Dormir", "Tenda"], gold: 3, description: "Arco Curto, 20 Flechas, Ferramentas de Cartógrafo, Aljava, Roupas de Viagem, Saco de Dormir, Tenda, 3 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  marinheiro: { 
    optionA: { items: ["Adaga", "Ferramentas de Navegador", "Corda", "Roupas de Viagem"], gold: 20, description: "Adaga, Ferramentas de Navegador, Corda, Roupas de Viagem, 20 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  mercador: { 
    optionA: { items: ["Ferramentas de Navegador", "Algibeira", "Algibeira", "Roupas de Viagem"], gold: 22, description: "Ferramentas de Navegador, 2 Algibeiras, Roupas de Viagem, 22 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  nobre: { 
    optionA: { items: ["Kit de Jogos", "Perfume", "Roupas Finas"], gold: 29, description: "Kit de Jogos, Perfume, Roupas Finas, 29 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  sabio: { 
    optionA: { items: ["Cajado", "Suprimentos de Calígrafo", "Livro", "Pergaminho", "Túnica"], gold: 8, description: "Cajado, Suprimentos de Calígrafo, Livro (história), Pergaminho (8 folhas), Túnica, 8 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  },
  soldado: { 
    optionA: { items: ["Lança", "Arco Curto", "Flecha", "Kit de Curandeiro", "Kit de Jogo", "Aljava", "Roupas de Viagem"], gold: 14, description: "Lança, Arco Curto, 20 Flechas, Kit de Curandeiro, Kit de Jogo, Aljava, Roupas de Viagem, 14 PO" }, 
    optionB: { gold: 50, description: "50 PO" }
  }
};

export const getEquipmentForClass = (classId: string) => classEquipment[classId] || {
  optionA: { items: [], gold: 0, description: "" },
  optionB: { gold: 0, description: "" }
};

export const getEquipmentForBackground = (bgId: string) => backgroundEquipment[bgId] || {
  optionA: { items: [], gold: 0, description: "" },
  optionB: { gold: 0, description: "" }
};

export const kitContents: Record<string, string> = {
  "Kit de Aventureiro": "Mochila, Saco de Dormir, 2 frascos de Óleo, 10 dias de Rações, Corda (15m), Caixa para Fogo, 10 Tochas e Cantil",
  "Kit de Explorador": "Mochila, Saco de Dormir, 2 frascos de Óleo, 10 dias de Rações, Corda (15m), Caixa para Fogo, 10 Tochas e Cantil",
  "Kit de Explorador de Masmorras": "Mochila, Pé de Cabra, Martelo, 10 Pítons, 10 Tochas, Caixa para Fogo, 10 dias de Rações, Cantil e Corda (15m)",
  "Kit de Sacerdote": "Mochila, Cobertor, 10 Velas, Caixa para Fogo, Caixa de Esmolas, 2 Incensos, Turíbulo, Vestimentas e Cantil",
  "Kit de Artista": "Mochila, Saco de Dormir, 2 Fantasias, 5 Velas, 5 dias de Rações, Cantil e Kit de Disfarce",
  "Kit de Erudito": "Mochila, Livro de Conhecimento, Tinta e Caneta Tinteiro, 10 Folhas de Pergaminho, Saquinho de Areia e Faca Pequena",
  "Kit de Ladrão": "Mochila, Saco de 1.000 Esferas de Metal, 3m de Linha, Sino, 5 Velas, Pé de Cabra, Martelo, 10 Pítons, Lanterna Coberta, 2 Frascos de Óleo, 5 Dias de Rações, Caixa para Fogo e Cantil",
  "Kit de Curandeiro": "Caixa com Bandagens, Pomadas e Talas (10 usos)",
  "Kit de Herbalismo": "Bolsa com Tesoura, Almofariz e Pilão, Frascos e Ervas para preparar remédios e antídotos",
  "Kit de Falsificação": "Tintas, Papéis, Pergaminhos, Canetas, Selos e Lacre para criar documentos falsos",
  "Kit de Disfarce": "Cosméticos, Tintura de Cabelo, Roupas Pequenas e Adereços para alterar aparência",
  "Kit de Jogos": "Conjunto de peças para um jogo específico",
};

export const itemSubChoices: Record<string, string[]> = {
  "Kit de Jogos": ["Baralho", "Dados de Osso", "Jogo de Damas", "Jogo de Xadrez Dracônico"],
  "Kit de Jogo": ["Baralho", "Dados de Osso", "Jogo de Damas", "Jogo de Xadrez Dracônico"],
  "Instrumento Musical": ["Alaúde", "Flauta", "Flauta de Pã", "Gaita de Foles", "Lira", "Tambor", "Trombeta", "Violino"],
  "Ferramentas de Artesão": [
    "Ferramentas de Carpinteiro", "Ferramentas de Cartógrafo", "Ferramentas de Coureiro",
    "Ferramentas de Entalhador", "Ferramentas de Ferreiro", "Ferramentas de Funileiro",
    "Ferramentas de Joalheiro", "Ferramentas de Oleiro", "Ferramentas de Pedreiro",
    "Ferramentas de Pintor", "Ferramentas de Sapateiro", "Ferramentas de Soprador de Vidro",
    "Ferramentas de Tecelão", "Suprimentos de Alquimista", "Suprimentos de Calígrafo",
    "Suprimentos de Cervejeiro", "Utensílios de Cozinheiro"
  ],
  "Foco Arcano": ["Bastão", "Cajado", "Cristal", "Orbe", "Varinha"],
  "Foco Druídico": ["Cajado", "Ramo de Visco", "Totem", "Varinha de Teixo"],
  "Símbolo Sagrado": ["Amuleto", "Emblema", "Relicário"],
};

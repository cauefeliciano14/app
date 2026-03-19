export interface Alignment {
  id: string;
  title: string;
  description: string;
}

export const alignmentsData: Alignment[] = [
  { id: "lb", title: "Leal e Bom (LB)", description: "Criaturas que fazem as coisas como é esperado da sociedade para o bem comum." },
  { id: "nb", title: "Neutro e Bom (NB)", description: "Aqueles que fazem o melhor que podem para ajudar aos outros com ou sem leis." },
  { id: "cb", title: "Caótico e Bom (CB)", description: "Agem de acordo com sua consciência, com pouca consideração por expectativas da sociedade." },
  { id: "ln", title: "Leal e Neutro (LN)", description: "Indivíduos que agem de acordo com as leis, tradições ou códigos pessoais de ordem." },
  { id: "n", title: "Neutro (N)", description: "Apenas fazem o que parece ser uma boa ideia e não preferem lados; pragmáticos." },
  { id: "cn", title: "Caótico e Neutro (CN)", description: "Seguem seus caprichos, valorizando a própria liberdade acima de tudo." },
  { id: "lm", title: "Leal e Mau (LM)", description: "Aceitam um sistema de forma metodológica, limitando a própria compaixão e infligindo o mal." },
  { id: "nm", title: "Neutro e Mau (NM)", description: "O tipo que faria o que for possível para se dar bem, sem se importar com quem se fere no processo." },
  { id: "cm", title: "Caótico e Mau (CM)", description: "Agem impulsionados por violência, ambição ilimitada e sede de sangue. Demônios." }
];

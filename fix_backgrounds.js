import { readFileSync, writeFileSync } from 'fs';

const filepath = 'c:/Users/cauef/OneDrive/Documents/App/react-app/src/data/backgrounds.json';
const data = JSON.parse(readFileSync(filepath, 'utf-8'));

const map = {
  "Força": "forca",
  "Destreza": "destreza",
  "Constituição": "constituicao",
  "Inteligência": "inteligencia",
  "Sabedoria": "sabedoria",
  "Carisma": "carisma"
};

data.backgrounds.forEach(bg => {
  if (bg.attributeValues) {
    bg.attributeValues = bg.attributeValues.map(v => map[v] || v);
  }
});

writeFileSync(filepath, JSON.stringify(data, null, 2));
console.log('Background attributes normalized!');

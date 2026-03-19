import fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = fs.readFileSync(path.join(__dirname, 'source/player_handbook.html'), 'utf-8');
const $ = cheerio.load(html);

const db = {
    species: [],
    classes: [],
    backgrounds: []
};

// 1. Extract Species (Raças)
const speciesH1 = $('h1').filter((i, el) => $(el).text().trim() === 'Descrições das Espécies').first();
let current = speciesH1.next();

while (current.length > 0 && current[0].tagName !== 'h1') {
    if (current[0].tagName === 'h3' && current.text().startsWith('Traços de ')) {
        const speciesName = current.text().replace('Traços de ', '').trim();
        const description = [];
        let nextEl = current.next();
        while (nextEl.length > 0 && !['h1', 'h2', 'h3'].includes(nextEl[0].tagName)) {
            description.push(nextEl.text().trim());
            nextEl = nextEl.next();
        }
        db.species.push({
            id: speciesName.toLowerCase().replace(/ /g, '-'),
            name: speciesName,
            description: description.join(' ')
        });
    }
    current = current.next();
}

// 2. Extract Classes
const knownClasses = ['Bárbaro', 'Bardo', 'Bruxo', 'Clérigo', 'Druida', 'Feiticeiro', 'Guardião', 'Guerreiro', 'Ladino', 'Mago', 'Monge', 'Paladino'];
for (const cls of knownClasses) {
    const classH1 = $('h1').filter((i, el) => $(el).text().trim() === cls).first();
    if (classH1.length > 0) {
        const description = [];
        let nextEl = classH1.next();
        while (nextEl.length > 0 && !['h1', 'h2'].includes(nextEl[0].tagName)) {
            if (nextEl[0].tagName === 'p') {
                description.push(nextEl.text().trim());
            }
            nextEl = nextEl.next();
        }
        db.classes.push({
            id: cls.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
            name: cls,
            description: description.join(' ').substring(0, 300) + '...'
        });
    }
}

// 3. Extract Backgrounds (Antecedentes)
const bgH1 = $('h1').filter((i, el) => $(el).text().trim() === 'Descrições dos Antecedentes').first();
current = bgH1.next();
while (current.length > 0 && current[0].tagName !== 'h1') {
    if (current[0].tagName === 'h3') {
        const bgName = current.text().trim();
        const description = [];
        let nextEl = current.next();
        while (nextEl.length > 0 && !['h1', 'h2', 'h3'].includes(nextEl[0].tagName)) {
            description.push(nextEl.text().trim());
            nextEl = nextEl.next();
        }
        db.backgrounds.push({
            id: bgName.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
            name: bgName,
            description: description.join(' ')
        });
    }
    current = current.next();
}

const dataDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(path.join(dataDir, 'db.json'), JSON.stringify(db, null, 2));
console.log('Database successfully extracted and saved to src/data/db.json');

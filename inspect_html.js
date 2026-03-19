import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('./source/player_handbook.html', 'utf-8');
const $ = cheerio.load(html);

// We find the H1 "Descrições das Espécies"
const speciesH1 = $('h1').filter((i, el) => $(el).text().trim() === 'Descrições das Espécies').first();

let result = [];
let current = speciesH1.next();

while (current.length > 0 && current[0].tagName !== 'h1') {
    if (current[0].tagName === 'h3') {
        result.push(current.text());
    }
    current = current.next();
}

console.log('Species found:', result);

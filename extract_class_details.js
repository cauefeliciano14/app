import fs from 'fs';
import * as cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = fs.readFileSync(path.join(__dirname, 'source/player_handbook.html'), 'utf-8');
const $ = cheerio.load(html);

const knownClasses = ['Bárbaro', 'Bardo', 'Bruxo', 'Clérigo', 'Druida', 'Feiticeiro', 'Guardião', 'Guerreiro', 'Ladino', 'Mago', 'Monge', 'Paladino'];
const details = {};

knownClasses.forEach(cls => {
    // Find the H1 for the class
    const h1 = $('h1').filter((i, el) => $(el).text().trim() === cls).first();
    if (!h1.length) return;

    let subtitle = '';
    let firstSentence = '';
    let basicTraits = {};

    let current = h1.next();

    // The text directly after might be a paragraph or h2 that has the subtitle
    // Then we look for a table or elements that say "Traços Básicos de..."
    let foundTable = false;

    while (current.length && current[0].tagName !== 'h1') {
        const text = current.text().trim();
        const tagName = current[0].tagName;

        if (!subtitle && tagName === 'p' && text.length < 100) {
           subtitle = text;
        } else if (!firstSentence && tagName === 'p' && text.length >= 100) {
           // We'll take the first few sentences as the first description
           firstSentence = text.split('. ')[0] + '.';
        }

        // Check for table containing Basic Traits
        // In the HTML generated from DOCX, tables are usually just <table> <tr> <td>
        if (tagName === 'table') {
            const tableText = current.text();
            if (tableText.includes('Atributo Primário') || tableText.includes('Dado de Ponto de Vida') || tableText.includes('Traços Básicos')) {
                foundTable = true;
                current.find('tr').each((i, tr) => {
                    const tds = $(tr).find('td, th');
                    if (tds.length >= 2) {
                        const key = $(tds[0]).text().trim().replace(/:/g, '');
                        const val = $(tds[1]).text().trim();
                        if (key && !key.toLowerCase().includes('traços básicos')) {
                            basicTraits[key] = val;
                        }
                    }
                });
            }
        }

        current = current.next();
    }

    details[cls.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "")] = {
        subtitle,
        firstSentence,
        basicTraits
    };
});

const dataDir = path.join(__dirname, 'src', 'data');
fs.writeFileSync(path.join(dataDir, 'classDetails.json'), JSON.stringify(details, null, 2));
console.log('Saved to src/data/classDetails.json');

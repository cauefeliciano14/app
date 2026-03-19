const fs = require('fs');
const path = require('path');

const filepath = path.join(
  'C:', 'Users', 'cauef', '.claude', 'projects',
  'c--Users-cauef-OneDrive-Documents-App',
  '41897a15-7211-44f3-b355-b4fa86fec3f0',
  'tool-results', 'toolu_01G1vxefjUNEMf5Xx5uDBXf8.txt'
);

const raw = fs.readFileSync(filepath, 'utf-8');
const rawLines = raw.split('\n');

// Strip "   N→" prefix
const cleaned = rawLines.map(line => {
  const m = line.match(/^\s*\d+→(.*)$/);
  return m ? m[1] : line.replace(/\r$/, '');
});

// Remove page number lines (standalone 3-digit numbers)
const lines = cleaned.filter(l => !/^\d{3}$/.test(l.trim()));

// Known non-item ALL-CAPS headers to skip
const skipHeaders = new Set([
  'AVATAR DA MORTE', 'MOSCA GIGANTE', 'UMA QUESTÃO DE INIMIZADE',
  'BARALHO DAS ILUSÕES', 'BARALHO DAS SURPRESAS',
  'FACES DO CUBO DE FORÇA', 'ALAVANCAS DO DISPOSITIVO DE KWALISH',
  'BOLSA DE TRUQUES BRONZE', 'BOLSA DE TRUQUES CINZA', 'BOLSA DE TRUQUES FERRUGEM',
  'PERGAMINHO DE MAGIA', 'EFEITO DA', 'VARINHA DAS', 'MARAVILHAS',
  'FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR', 'AÇÕES',
  'ITENS MÁGICOS DE A–Z',
]);

const categoryRe = /^(Arma|Armadura|Anel|Bastão|Bastao|Cajado|Varinha|Poção|Pocao|Pergaminho|Item maravilhoso)/i;

function isAllCapsHeader(line) {
  const s = line.trim();
  if (!s || s.length < 4) return false;
  if (skipHeaders.has(s)) return false;
  if (/^\d+$/.test(s.replace(/\s/g, ''))) return false;
  let hasLetter = false;
  for (const c of s) {
    if (/[a-záàâãéèêíïóôõúüç]/i.test(c)) {
      hasLetter = true;
      if (c !== c.toUpperCase()) return false;
    }
  }
  return hasLetter;
}

function isCategoryLine(line) {
  return categoryRe.test(line.trim());
}

// Find item starts
const itemStarts = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!isAllCapsHeader(line)) continue;

  // Collect multi-line name
  let nameLines = [line];
  let k = i + 1;
  while (k < lines.length) {
    const nl = lines[k].trim();
    if (isAllCapsHeader(nl) && !isCategoryLine(nl)) {
      // Check if AFTER this caps line there's a category -> this is name continuation
      if (k + 1 < lines.length && isCategoryLine(lines[k + 1].trim())) {
        nameLines.push(nl);
        k++;
        break;
      }
      // Check if joining makes sense
      nameLines.push(nl);
      k++;
    } else {
      break;
    }
  }

  // Now k should point to category line, or we check
  let catStart = k;
  if (catStart >= lines.length) continue;

  // Build category line (may span multiple lines)
  let catLine = lines[catStart].trim();
  if (!isCategoryLine(catLine)) continue;

  let catEnd = catStart + 1;
  while (catEnd < lines.length) {
    const next = lines[catEnd].trim();
    if (!next) break;
    if (isAllCapsHeader(next)) break;
    if (isCategoryLine(next)) break;
    // continuation of category line
    if (/^[\(+]/.test(next) || /sintoniza/i.test(next) || /^\(qualquer|^\(leve|^\(média|^\(pesada|^\(placas|^\(cota|^\(camisão|^\(brunea|^\(escudo|^\(adaga|^\(espada|^\(arco|^\(martelo|^\(maça|^\(malho|^\(tridente|^\(azagaia|^\(flecha|^\(cimitarra|^\(qualquer/i.test(next)) {
      catLine += ' ' + next;
      catEnd++;
    } else if (catLine.endsWith(',') || catLine.endsWith('(') || /\($/.test(catLine.trim())) {
      catLine += ' ' + next;
      catEnd++;
    } else {
      break;
    }
  }

  // Clean up category line - merge broken lines
  catLine = catLine.replace(/\s+/g, ' ').trim();
  // Fix broken line like "Arma\n(qualquer)"
  catLine = catLine.replace(/Arma\s+\(/g, 'Arma (');
  catLine = catLine.replace(/Armadura\s+\(/g, 'Armadura (');

  const fullName = nameLines.join(' ');
  itemStarts.push({ lineIdx: i, name: fullName, catLine, descStart: catEnd });
}

// Build items
const lowercaseWords = new Set(['de', 'do', 'da', 'dos', 'das', 'e', 'ou', 'contra', 'na', 'no', 'nos', 'nas', 'com', 'para']);

function toTitleCase(name) {
  return name.split(/\s+/).map((word, idx) => {
    const lower = word.toLowerCase();
    if (idx === 0) return lower.charAt(0).toUpperCase() + lower.slice(1);
    if (lowercaseWords.has(lower)) return lower;
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(' ');
}

function fixAccents(text) {
  return text
    .replace(/sintonizacao/gi, (m) => m[0] === 'S' ? 'Sintonização' : 'sintonização')
    .replace(/sintonizaçao/gi, 'sintonização')
    .replace(/pocao/gi, (m) => m[0] === 'P' ? 'Poção' : 'poção')
    .replace(/bastao/gi, (m) => m[0] === 'B' ? 'Bastão' : 'bastão')
    .replace(/lendario(?!s)/gi, 'lendário')
    .replace(/lendaria(?!s)/gi, 'lendária')
    .replace(/variavel/gi, 'variável');
}

function parseCategory(catLine) {
  catLine = fixAccents(catLine);
  const cl = catLine.toLowerCase();

  let category = '', baseItem = '', rarity = '', attunement = '';

  // Attunement
  const attMatch = catLine.match(/\(requer sintonização[^)]*\)/i);
  if (attMatch) attunement = attMatch[0];

  // Category
  if (/^Arma/i.test(catLine)) {
    category = 'Arma';
    const bm = catLine.match(/Arma\s*\(([^)]+)\)/i);
    if (bm) baseItem = bm[1].trim();
  } else if (/^Armadura/i.test(catLine)) {
    category = 'Armadura';
    const bm = catLine.match(/Armadura\s*\(([^)]+)\)/i);
    if (bm) baseItem = bm[1].trim();
  } else if (/^Anel/i.test(catLine)) {
    category = 'Anel';
  } else if (/^Bastão|^Bastao/i.test(catLine)) {
    category = 'Bastão';
  } else if (/^Cajado/i.test(catLine)) {
    category = 'Cajado';
  } else if (/^Varinha/i.test(catLine)) {
    category = 'Varinha';
  } else if (/^Poção|^Pocao/i.test(catLine)) {
    category = 'Poção';
  } else if (/^Pergaminho/i.test(catLine)) {
    category = 'Pergaminho';
  } else if (/^Item maravilhoso/i.test(catLine)) {
    category = 'Maravilhoso';
  }

  // Rarity
  if (/raridade variável/i.test(cl) || /raridade variavel/i.test(cl)) {
    rarity = 'varia';
  } else if (/raridade depende/i.test(cl)) {
    rarity = 'varia';
  } else if (/muito rar[ao]/i.test(cl)) {
    rarity = 'muito raro';
  } else if (/lendári[oa]|lendari[oa]/i.test(cl)) {
    rarity = 'lendário';
  } else if (/\brar[ao]\b/i.test(cl)) {
    rarity = 'raro';
  } else if (/incomum/i.test(cl)) {
    rarity = 'incomum';
  } else if (/\bcomum\b/i.test(cl)) {
    rarity = 'comum';
  } else if (/artefato/i.test(cl)) {
    rarity = 'artefato';
  }

  // Multiple rarities like "+1, +2, +3"
  if (rarity !== 'varia' && /\(\+1\)/.test(catLine) && /\(\+2\)/.test(catLine)) {
    rarity = 'varia';
  }

  // Trombeta do Valhalla special case
  if (/raro.*muito raro|raro \(prata/i.test(cl)) {
    rarity = 'varia';
  }

  // Bola de cristal: "muito raro ou lendário"
  if (/muito rar[ao].*lendári[oa]/i.test(cl)) {
    rarity = 'varia';
  }

  return { category, baseItem, rarity, attunement };
}

const results = [];
for (let idx = 0; idx < itemStarts.length; idx++) {
  const { lineIdx, name, catLine, descStart } = itemStarts[idx];
  const descEnd = idx + 1 < itemStarts.length ? itemStarts[idx + 1].lineIdx : lines.length;

  const descLines = [];
  for (let d = descStart; d < descEnd; d++) {
    const l = lines[d].trim();
    if (/^\d{3}$/.test(l)) continue;
    descLines.push(l);
  }
  // Trim trailing empties
  while (descLines.length && descLines[descLines.length - 1] === '') descLines.pop();

  const description = descLines.join('\n').trim();
  const titleName = toTitleCase(name);
  const { category, baseItem, rarity, attunement } = parseCategory(catLine);

  results.push({
    name: titleName,
    category,
    baseItem,
    rarity,
    attunement,
    description
  });
}

console.log(`Total items: ${results.length}`);
results.forEach((r, i) => console.log(`${i + 1}. ${r.name} [${r.category}] [${r.rarity}]`));

const outPath = path.join('C:', 'Users', 'cauef', 'OneDrive', 'Documents', 'App', 'react-app', 'src', 'data', 'magicItems.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
console.log(`\nWritten to ${outPath}`);

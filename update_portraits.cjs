const fs = require('fs');
const path = require('path');

const dirPath = 'c:/Users/cauef/OneDrive/Documents/App/react-app/public/imgs/portrait_caracter';
const appTsxPath = 'c:/Users/cauef/OneDrive/Documents/App/react-app/src/App.tsx';

const files = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isFile()).sort();

let lines = fs.readFileSync(appTsxPath, 'utf-8').split('\n');
const startIdx = lines.findIndex(l => l.includes('const PORTRAITS = ['));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('];'));

let arrContent = [];
for (let i = 0; i < files.length; i += 4) {
    const chunk = files.slice(i, i + 4);
    arrContent.push("  " + chunk.map(f => '"' + f + '"').join(', ') + ",");
}

lines.splice(startIdx + 1, endIdx - startIdx - 1, ...arrContent);
fs.writeFileSync(appTsxPath, lines.join('\n'));
console.log('Success! Added ' + files.length + ' portraits.');

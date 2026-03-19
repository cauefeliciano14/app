const fs = require('fs');
const path = require('path');

const dirPath = 'c:/Users/cauef/OneDrive/Documents/App/react-app/public/imgs/portrait_caracter';
const appTsxPath = 'c:/Users/cauef/OneDrive/Documents/App/react-app/src/App.tsx';

const files = fs.readdirSync(dirPath).filter(f => fs.statSync(path.join(dirPath, f)).isFile());
files.sort();

let arrContent = "const PORTRAITS = [\n";
for (let i = 0; i < files.length; i += 4) {
    const chunk = files.slice(i, i + 4);
    arrContent += "  " + chunk.map(f => `"${f}"`).join(', ') + ",\n";
}
arrContent = arrContent.trimEnd() + "\n];";

let content = fs.readFileSync(appTsxPath, 'utf-8');
content = content.replace(/const PORTRAITS = \[\s*[^\]]+\];/m, arrContent);

fs.writeFileSync(appTsxPath, content, 'utf-8');
console.log(`Updated App.tsx with ${files.length} images`);

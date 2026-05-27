// Auto-actualiza los conteos de preguntas en el README.
// Uso: node scripts/update-readme.js
//
// Reemplaza:
//   "- **NNN preguntas reales** extraídas..."
//   "34 de las NNN preguntas fueron generadas..."
// con los valores reales del banco actual.

const fs = require('fs');
const path = require('path');

const READMEPATH = path.resolve(__dirname, '..', 'README.md');
const QUESTIONSPATH = path.resolve(__dirname, '..', 'src', 'data', 'questions.js');

// Cargar QUESTIONS (es un módulo CommonJS export)
const { QUESTIONS } = require(QUESTIONSPATH);

const total      = QUESTIONS.length;
const real       = QUESTIONS.filter(q => q.source === 'exam').length;
const generated  = QUESTIONS.filter(q => q.source === 'generated').length;

let readme = fs.readFileSync(READMEPATH, 'utf8');
let changed = false;

// 1. "- **NNN preguntas reales** extraídas de..."
const realRe = /- \*\*\d+ preguntas reales\*\* extraídas/;
const realNew = `- **${real} preguntas reales** extraídas`;
if (realRe.test(readme) && !readme.includes(realNew)) {
  readme = readme.replace(realRe, realNew);
  changed = true;
  console.log(`✔ Reales: ${real}`);
}

// 2. "34 de las NNN preguntas fueron generadas..."
const totalRe = /(\d+) de las \d+ preguntas fueron generadas/;
const totalNew = `${generated} de las ${total} preguntas fueron generadas`;
if (totalRe.test(readme) && !readme.includes(totalNew)) {
  readme = readme.replace(totalRe, totalNew);
  changed = true;
  console.log(`✔ Total: ${total} | Generadas: ${generated}`);
}

if (changed) {
  fs.writeFileSync(READMEPATH, readme);
  console.log('README actualizado.');
} else {
  console.log('README ya está sincronizado.');
}

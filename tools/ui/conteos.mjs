// Chequeo: conteos.js expone GENERADAS y el registro lo publica como `generadas`.
//   node tools/ui/conteos.mjs
import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const materiasDir = path.join(raiz, 'src', 'materias');
const url = (...p) => pathToFileURL(path.join(materiasDir, ...p)).href;

const fallos = [];
const falla = (msg) => fallos.push(msg);

// metadata.js usa require() para los assets (lo resuelve Metro); en node basta un stub.
globalThis.require = (ruta) => String(ruta);

const conteos = await import(url('conteos.js'));
const { MATERIA_LIST } = await import(url('index.js'));
const { CONTEOS, GENERADAS } = conteos;

if (!GENERADAS || typeof GENERADAS !== 'object') {
  falla('conteos.js no exporta GENERADAS');
} else {
  const a = Object.keys(CONTEOS).sort().join(',');
  const b = Object.keys(GENERADAS).sort().join(',');
  if (a !== b) falla(`claves distintas: CONTEOS=[${a}] GENERADAS=[${b}]`);

  for (const id of Object.keys(CONTEOS)) {
    const archivo = path.join(materiasDir, id, 'questions.js');
    if (!fs.existsSync(archivo)) continue;
    const { QUESTIONS = [] } = await import(pathToFileURL(archivo).href);
    const real = QUESTIONS.filter((q) => q.source === 'generated').length;
    if (GENERADAS[id] !== real) falla(`${id}: GENERADAS=${GENERADAS[id]} real=${real}`);
  }
}

MATERIA_LIST.forEach((m, i) => {
  if (typeof m.generadas !== 'number') falla(`MATERIA_LIST[${i}] (${m.id}).generadas no definido`);
});

if (fallos.length) {
  console.error('FALLA conteos:\n' + fallos.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`OK conteos: ${MATERIA_LIST.length} materias, GENERADAS coincide con el banco`);

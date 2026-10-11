// Chequeo de D3: `cargarMateria(id)` devuelve la materia con la misma forma que su
// elemento de MATERIA_LIST (metadata, `preguntas`, `generadas` e `ilustracion`) más el banco.
//   node tools/ui/materia-cargada.mjs
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const url = (...p) => pathToFileURL(path.join(raiz, 'src', 'materias', ...p)).href;

// metadata.js usa require() para los assets (lo resuelve Metro); en node basta un stub.
globalThis.require = (ruta) => String(ruta);

const { MATERIA_LIST, cargarMateria } = await import(url('index.js'));

const fallos = [];
const falla = (msg) => fallos.push(msg);

for (const elemento of MATERIA_LIST) {
  const cargada = await cargarMateria(elemento.id);
  if (!cargada) { falla(`${elemento.id}: cargarMateria devolvió ${cargada}`); continue; }
  if (!cargada.ilustracion) { falla(`${elemento.id}: la materia cargada no trae \`ilustracion\``); continue; }
  if (cargada.ilustracion !== elemento.ilustracion) {
    falla(`${elemento.id}: \`ilustracion\` no es la de MATERIA_LIST`);
  }
  for (const [clave, valor] of Object.entries(elemento)) {
    if (clave === 'ilustracion') continue;
    if (cargada[clave] !== valor && JSON.stringify(cargada[clave]) !== JSON.stringify(valor)) {
      falla(`${elemento.id}: \`${clave}\` difiere entre la materia cargada y MATERIA_LIST`);
    }
  }
  if (!Array.isArray(cargada.QUESTIONS) || cargada.QUESTIONS.length === 0) {
    falla(`${elemento.id}: la materia cargada perdió el banco (QUESTIONS)`);
  }
  if (await cargarMateria(elemento.id) !== cargada) {
    falla(`${elemento.id}: la identidad del objeto no es estable entre cargas`);
  }
}

if (fallos.length) {
  console.error('FALLA materia-cargada:\n' + fallos.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`OK materia-cargada: ${MATERIA_LIST.length} materias con \`ilustracion\` y banco, identidad estable`);

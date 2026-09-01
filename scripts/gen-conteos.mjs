// Genera src/materias/conteos.js: cuántas preguntas tiene cada materia.
//
// La pantalla de selección muestra ese número, y es lo único que necesitaba de
// questions.js. Con el conteo precalculado, el banco entero deja de ser parte
// del arranque y pasa a cargarse recién cuando se elige la materia.
//
// El archivo generado va commiteado (para que `expo start` funcione sin pasos
// previos) y se regenera en `build:web`, así no puede quedar desfasado.
import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const materiasDir = path.join(raiz, 'src', 'materias');
const salida = path.join(materiasDir, 'conteos.js');

const ids = fs
  .readdirSync(materiasDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const conteos = {};
for (const id of ids) {
  const archivo = path.join(materiasDir, id, 'questions.js');
  if (!fs.existsSync(archivo)) continue;
  const mod = await import(pathToFileURL(archivo).href);
  conteos[id] = (mod.QUESTIONS || []).length;
}

const cuerpo = Object.entries(conteos)
  .map(([id, n]) => `  ${id}: ${n},`)
  .join('\n');

fs.writeFileSync(
  salida,
  `// GENERADO por scripts/gen-conteos.mjs — no editar a mano.\n` +
    `// Cantidad de preguntas por materia, para poder mostrarla sin cargar el banco.\n` +
    `export const CONTEOS = {\n${cuerpo}\n};\n`,
  'utf-8'
);

console.log(`conteos.js actualizado: ${JSON.stringify(conteos)}`);

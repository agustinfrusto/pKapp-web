// Paso de `build:web` (design.md D11, tarea 3.14c): valida la lista de avisos.
//
// Una lista inválida (tipos, valores cerrados, ids, fechas, más de 3 vigentes por pantalla
// en una fecha de borde) rompe el build: la interfaz no recorta ni valida.
//
// Uso: node scripts/verificar-avisos.mjs [ruta-a-avisos.js]   (por defecto src/avisos/avisos.js)
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ruta = process.argv[2] ? path.resolve(process.argv[2]) : path.join(RAIZ, 'src', 'avisos', 'avisos.js');

const { AVISOS, validarAvisos } = await import(pathToFileURL(ruta).href);
const errores = validarAvisos(AVISOS);
if (errores.length) {
  console.error(`verificar-avisos: la lista de avisos no es válida (${path.relative(RAIZ, ruta)}):`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`verificar-avisos: ${AVISOS.length} aviso(s) válidos`);

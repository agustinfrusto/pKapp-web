#!/usr/bin/env node
// Escribe `src/assets/filamentos.js` con el campo de la marca V5 «Fusiforme» y la regla vigente.
//
// La geometría sale de `openspec/changes/rediseno-plancha/diseno/marca-prototipos/generar.mjs`
// (variante V5), no se copia a mano. La regla se conserva tal cual está en el archivo. V0, el
// campo anterior, vive en `src/assets/filamentos-v0.js` para poder volver.
//
// Uso: node tools/ui/generar-filamentos.mjs
// Imprime la firma (trazos y FNV-1a de los `d`) que espera `tools/e2e/suites/materias.js`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DESTINO = path.join(RAIZ, 'src/assets/filamentos.js');
const PROTOTIPOS = path.join(RAIZ, 'openspec/changes/rediseno-plancha/diseno/marca-prototipos/generar.mjs');

const { construirVariantes } = await import(pathToFileURL(PROTOTIPOS).href);
const v5 = construirVariantes().find((v) => v.id === 'V5');

const fuente = fs.readFileSync(DESTINO, 'utf8');
const regla = fuente.slice(fuente.indexOf('// Regla graduada de la lámina'));

const valor = (v) => (typeof v === 'number' ? String(Number(v.toFixed(2))) : `'${v}'`);
const elemento = (e) => {
  const props = Object.entries(e.props).map(([k, v]) => `${k}: ${valor(v)}`).join(', ');
  return `    { tipo: '${e.tipo}', props: { ${props} }${e.tono ? `, tono: '${e.tono}'` : ''} },`;
};

const salida = `// Campo de filamentos de la pantalla de selección de materias (lámina de la cabecera).
// Marca V5 «Fusiforme»: un músculo abstracto de fibras que ondulan entre dos tendones; una
// fibra es el contorno \`acento\`. Generado por \`tools/ui/generar-filamentos.mjs\` desde
// \`openspec/changes/rediseno-plancha/diseno/marca-prototipos/\`; el campo anterior (V0) está en
// \`filamentos-v0.js\`. Mismo formato de datos que las ilustraciones de materia.
// Contrato en openspec/changes/rediseno-plancha/design.md (D2/D3).
export const ilustracion = {
  viewBox: '${v5.viewBox}',
  encuadre: '${v5.encuadre}', // estira a ancho x alto, como el boceto
  trazo: { ancho: 1, union: 'miter', extremo: 'butt' },
  elementos: [
${v5.elementos.map(elemento).join('\n')}
  ],
};

${regla}`;

fs.writeFileSync(DESTINO, salida);

const fnv = (txt) => {
  let h = 0x811c9dc5;
  for (const ch of txt) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16);
};
const firma = fnv(v5.elementos.map((e) => e.props.d).join('|'));
console.log(`filamentos.js: ${v5.elementos.length} trazos, firma ${v5.elementos.length}|${firma}`);

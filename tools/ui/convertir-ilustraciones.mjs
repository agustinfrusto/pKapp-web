// Convierte los SVG de las ilustraciones de materia a datos (design.md D2/D3, tarea 2.7).
//
// Lee openspec/changes/rediseno-plancha/diseno/svg/<id>.svg y escribe
// src/materias/<id>/ilustracion.js en el contrato de `Ilustracion`. Reutiliza `leerSvg`
// de convertir-glifos.mjs con `trazoPropio`: el `stroke-width` de cada elemento pasa a
// `props.strokeWidth` y el de la raíz a `trazo.ancho`.
//
// Uso:
//   node tools/ui/convertir-ilustraciones.mjs              regenera las 6 materias
//   node tools/ui/convertir-ilustraciones.mjs neuro cyr    regenera solo esas
//   node tools/ui/convertir-ilustraciones.mjs --stdout     imprime sin escribir
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { leerSvg } from './convertir-glifos.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIR_SVG = path.join(RAIZ, 'openspec', 'changes', 'rediseno-plancha', 'diseno', 'svg');
export const MATERIAS = ['bcyt', 'anatomia', 'neuro', 'cyr', 'dre', 'ryd'];
export const rutaSalida = (id, raiz = RAIZ) => path.join(raiz, 'src', 'materias', id, 'ilustracion.js');

export function leerMateria(id, dir = DIR_SVG) {
  return leerSvg(fs.readFileSync(path.join(dir, `${id}.svg`), 'utf8'), `${id}.svg`, { trazoPropio: true });
}

const lit = (v) => (typeof v === 'string' ? `'${v}'` : String(v));

export function generar(id, datos) {
  const t = datos.trazo;
  const inglete = t.limiteInglete !== undefined ? `, limiteInglete: ${t.limiteInglete}` : '';
  const lineas = [
    `// Ilustración de la materia ${id}: datos de trazo, sin JSX ni dependencias de plataforma.`,
    '// Contrato en openspec/changes/rediseno-plancha/design.md (D2/D3). El color lo pone Ilustracion.',
    '// GENERADO — no editar a mano.',
    `// Regenerar: node tools/ui/convertir-ilustraciones.mjs ${id}`,
    `// Fuente: openspec/changes/rediseno-plancha/diseno/svg/${id}.svg`,
    'export const ilustracion = {',
    `  viewBox: '${datos.viewBox}',`,
    `  trazo: { ancho: ${t.ancho}, union: '${t.union}', extremo: '${t.extremo}'${inglete} },`,
    '  elementos: [',
  ];
  for (const el of datos.elementos) {
    const props = Object.entries(el.props).map(([k, v]) => `${k}: ${lit(v)}`).join(', ');
    lineas.push(`    { tipo: '${el.tipo}', props: { ${props} } },`);
  }
  lineas.push('  ],', '};', '');
  return lineas.join('\n');
}

function esPrincipal() {
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (esPrincipal()) {
  const pedidas = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const ids = pedidas.length ? pedidas : MATERIAS;
  for (const id of ids) {
    if (!MATERIAS.includes(id)) throw new Error(`materia desconocida: ${id}`);
    const texto = generar(id, leerMateria(id));
    if (process.argv.includes('--stdout')) process.stdout.write(texto);
    else {
      fs.writeFileSync(rutaSalida(id), texto);
      console.log(`ILUSTRACION: ${rutaSalida(id)}`);
    }
  }
}

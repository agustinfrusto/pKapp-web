// Convierte los SVG de los glifos a datos (design.md D2, tarea 2.5).
//
// Lee openspec/changes/rediseno-plancha/diseno/svg/glifos/*.svg y escribe
// src/assets/glifos.js: { viewBox, trazo, elementos } por glifo, en el contrato de
// `Ilustracion`. Los atributos de la raíz (fill, stroke, aria-hidden…) no pasan a los
// datos: el color y la accesibilidad los pone el componente.
//
// Uso:
//   node tools/ui/convertir-glifos.mjs           regenera src/assets/glifos.js
//   node tools/ui/convertir-glifos.mjs --stdout  imprime el archivo sin escribirlo
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DIR_SVG = path.join(
  RAIZ, 'openspec', 'changes', 'rediseno-plancha', 'diseno', 'svg', 'glifos',
);
export const SALIDA = path.join(RAIZ, 'src', 'assets', 'glifos.js');

const ELEMENTOS = ['path', 'rect', 'circle'];
const NUMERICOS = new Set(['cx', 'cy', 'r', 'x', 'y', 'width', 'height']);
const ATRIBUTOS = { path: ['d'], rect: ['x', 'y', 'width', 'height'], circle: ['cx', 'cy', 'r'] };
const UNION = { miter: 'miter', round: 'round', bevel: 'bevel' };
const EXTREMO = { square: 'square', round: 'round', butt: 'butt' };

function atributos(etiqueta) {
  const salida = {};
  for (const [, k, v] of etiqueta.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)) salida[k] = v;
  return salida;
}

// Devuelve { viewBox, trazo, elementos } de un SVG de glifo; lanza si algo no encaja.
// Con `trazoPropio` (ilustraciones de materia) admite `stroke-width` por elemento y lo
// convierte a `props.strokeWidth`; los glifos lo rechazan (todos van al ancho de la raíz).
export function leerSvg(texto, nombre = '(svg)', { trazoPropio = false } = {}) {
  const raiz = texto.match(/<svg\b[^>]*>/);
  if (!raiz) throw new Error(`${nombre}: sin <svg>`);
  const r = atributos(raiz[0]);
  const ancho = Number(r['stroke-width']);
  if (!r.viewBox || !Number.isFinite(ancho)) throw new Error(`${nombre}: sin viewBox o stroke-width`);
  const union = UNION[r['stroke-linejoin']];
  const extremo = EXTREMO[r['stroke-linecap']];
  if (!union || !extremo) throw new Error(`${nombre}: stroke-linejoin o stroke-linecap no reconocido`);

  const cuerpo = texto.slice(raiz.index + raiz[0].length);
  const etiquetas = [...cuerpo.matchAll(/<([a-zA-Z]+)\b([^>]*)\/?>/g)].filter(([, t]) => t !== 'svg');
  const elementos = etiquetas.map(([, tipo, resto]) => {
    if (!ELEMENTOS.includes(tipo)) throw new Error(`${nombre}: elemento no admitido <${tipo}>`);
    const a = atributos(resto);
    const props = {};
    for (const k of ATRIBUTOS[tipo]) {
      if (a[k] === undefined) throw new Error(`${nombre}: <${tipo}> sin ${k}`);
      props[k] = NUMERICOS.has(k) ? Number(a[k]) : a[k];
    }
    if (trazoPropio && a['stroke-width'] !== undefined) {
      const w = Number(a['stroke-width']);
      if (!Number.isFinite(w)) throw new Error(`${nombre}: <${tipo}> con stroke-width no numérico`);
      props.strokeWidth = w;
    }
    const sobran = Object.keys(a).filter(
      (k) => !ATRIBUTOS[tipo].includes(k) && !(trazoPropio && k === 'stroke-width'),
    );
    if (sobran.length) throw new Error(`${nombre}: <${tipo}> con atributos no convertidos (${sobran})`);
    return { tipo, props };
  });
  if (elementos.length === 0) throw new Error(`${nombre}: sin elementos`);
  const trazo = { ancho, union, extremo };
  if (r['stroke-miterlimit'] !== undefined) trazo.limiteInglete = Number(r['stroke-miterlimit']);
  return { viewBox: r.viewBox, trazo, elementos };
}

export function leerTodos(dir = DIR_SVG) {
  const archivos = fs.readdirSync(dir).filter((f) => /^glifo-.+\.svg$/.test(f)).sort();
  const glifos = {};
  for (const f of archivos) {
    const id = f.replace(/\.svg$/, '');
    glifos[id] = leerSvg(fs.readFileSync(path.join(dir, f), 'utf8'), f);
  }
  return glifos;
}

const lit = (v) => (typeof v === 'string' ? `'${v}'` : String(v));

export function generar(glifos) {
  const lineas = [
    '// GENERADO — no editar a mano.',
    '// Regenerar: node tools/ui/convertir-glifos.mjs',
    '// Fuente: openspec/changes/rediseno-plancha/diseno/svg/glifos/*.svg',
    '//',
    '// Datos de los glifos en el contrato de `Ilustracion` (design.md D2): sin color',
    '// literal; el trazo se dibuja a 1,5 u en un viewBox de 16 y `Glifo` lo compensa',
    '// por tamaño (CD-9). Un archivo por glifo; el componente es src/components/Glifo.js.',
    '',
    'export const GLIFOS = {',
  ];
  for (const [id, g] of Object.entries(glifos)) {
    const t = g.trazo;
    lineas.push(`  '${id}': {`);
    lineas.push(`    viewBox: '${g.viewBox}',`);
    const inglete = t.limiteInglete !== undefined ? `, limiteInglete: ${t.limiteInglete}` : '';
    lineas.push(`    trazo: { ancho: ${t.ancho}, union: '${t.union}', extremo: '${t.extremo}'${inglete} },`);
    lineas.push('    elementos: [');
    for (const el of g.elementos) {
      const props = Object.entries(el.props).map(([k, v]) => `${k}: ${lit(v)}`).join(', ');
      lineas.push(`      { tipo: '${el.tipo}', props: { ${props} } },`);
    }
    lineas.push('    ],');
    lineas.push('  },');
  }
  lineas.push('};', '');
  return lineas.join('\n');
}

// ¿Es este el script que se ejecuta? Compara realpath de ambos lados: `import.meta.url`
// ya viene resuelto y `process.argv[1]` no (rutas con symlink, p. ej. /tmp en macOS).
function esPrincipal() {
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (esPrincipal()) {
  const texto = generar(leerTodos());
  if (process.argv.includes('--stdout')) {
    process.stdout.write(texto);
  } else {
    fs.writeFileSync(SALIDA, texto);
    console.log(`GLIFOS: ${SALIDA} (${Object.keys(leerTodos()).length} glifos)`);
  }
}

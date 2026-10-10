// Chequeo de contrato de las ilustraciones (design.md D2/D3, tarea 2.1).
//
// Valida los 7 objetos de datos (6 materias + campo de filamentos):
//   - cada elemento de MATERIA_LIST (src/materias/index.js, importado de verdad,
//     no leído como texto) trae una `ilustracion` válida;
//   - el index.js de la materia no la reexporta (el banco lazy no la lleva);
//   - claves de primer nivel, de `trazo`, de elemento y de `props` dentro de listas
//     blancas; `viewBox` presente, `trazo` completo, `elementos` no vacío;
//   - `tipo` dentro de la lista permitida, `encuadre` ∈ meet | slice | none;
//   - ningún valor string es un color literal (#, rgb/hsl…, nombre CSS).
//
// Uso:
//   node tools/ui/ilustraciones.mjs              chequea el árbol real
//   node tools/ui/ilustraciones.mjs --mutaciones corrobora que el chequeo falla ante
//                                                datos rotos (exit 1 si alguna pasa)
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const TIPOS = ['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon'];
const ENCUADRES = ['meet', 'slice', 'none'];
const CLAVES_DATOS = ['viewBox', 'trazo', 'elementos', 'encuadre'];
const CLAVES_TRAZO = ['ancho', 'union', 'extremo'];
const CLAVES_ELEMENTO = ['tipo', 'props', 'tono'];
// Geometría y trazo de SVG, en camelCase; `relleno: true` lo resuelve el componente.
const CLAVES_PROPS = [
  'd', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'width', 'height', 'transform',
  'strokeWidth', 'strokeOpacity', 'strokeDasharray', 'strokeDashoffset', 'opacity',
  'relleno',
];

const NOMBRES_CSS = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet ' +
    'brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan ' +
    'darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen ' +
    'darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey ' +
    'darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite ' +
    'forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew ' +
    'hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue ' +
    'lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon ' +
    'lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime ' +
    'limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple ' +
    'mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue ' +
    'mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid ' +
    'palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum ' +
    'powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen ' +
    'seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal ' +
    'thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen transparent currentcolor'
  ).split(' '),
);

function colorLiteral(v) {
  if (/#[0-9a-f]{3,8}\b/i.test(v)) return true;
  if (/\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(/i.test(v)) return true;
  return (v.match(/[a-z]+/gi) ?? []).some((w) => NOMBRES_CSS.has(w.toLowerCase()));
}

function valores(x, ruta, salida = []) {
  if (x !== null && typeof x === 'object') {
    for (const [k, v] of Object.entries(x)) valores(v, `${ruta}.${k}`, salida);
  } else {
    salida.push([ruta, x]);
  }
  return salida;
}

function validar(nombre, datos, falla) {
  if (!datos || typeof datos !== 'object') return falla(nombre, 'sin `ilustracion` válida');
  for (const k of Object.keys(datos)) {
    if (!CLAVES_DATOS.includes(k)) falla(nombre, `clave no admitida (${k})`);
  }
  if (typeof datos.viewBox !== 'string' || !/^(-?\d+(\.\d+)?\s+){3}-?\d+(\.\d+)?$/.test(datos.viewBox.trim())) {
    falla(nombre, `viewBox ausente o inválido (${JSON.stringify(datos.viewBox)})`);
  }
  if (datos.encuadre !== undefined && !ENCUADRES.includes(datos.encuadre)) {
    falla(nombre, `encuadre inválido (${JSON.stringify(datos.encuadre)})`);
  }
  const t = datos.trazo;
  if (!t || typeof t.ancho !== 'number' || typeof t.union !== 'string' || typeof t.extremo !== 'string') {
    falla(nombre, 'trazo debe ser { ancho:number, union:string, extremo:string }');
  }
  for (const k of Object.keys(t ?? {})) {
    if (!CLAVES_TRAZO.includes(k)) falla(`${nombre}.trazo`, `clave no admitida (${k})`);
  }
  if (!Array.isArray(datos.elementos) || datos.elementos.length === 0) {
    return falla(nombre, 'elementos vacío o ausente');
  }
  datos.elementos.forEach((el, i) => {
    const donde = `${nombre}.elementos[${i}]`;
    if (!el || typeof el !== 'object') return falla(donde, 'elemento inválido');
    for (const k of Object.keys(el)) {
      if (!CLAVES_ELEMENTO.includes(k)) falla(donde, `clave no admitida (${k})`);
    }
    if (!TIPOS.includes(el.tipo)) falla(donde, `tipo no permitido (${JSON.stringify(el.tipo)})`);
    if (el.tono !== undefined && el.tono !== 'acento') falla(donde, `tono inválido (${el.tono})`);
    if (!el.props || typeof el.props !== 'object') return falla(donde, 'props ausente');
    for (const [k, v] of Object.entries(el.props)) {
      if (!CLAVES_PROPS.includes(k)) falla(`${donde}.props`, `clave no admitida (${k}): el color y el estilo los pone el componente`);
      if (v !== null && typeof v === 'object') falla(`${donde}.props.${k}`, 'valor no primitivo');
    }
    if (el.props.relleno !== undefined && el.props.relleno !== true) falla(donde, '`relleno` solo admite true');
  });
  for (const [ruta, v] of valores(datos, nombre)) {
    if (typeof v === 'string' && colorLiteral(v)) falla(ruta, `color literal (${JSON.stringify(v)})`);
  }
}

// Copia a un directorio temporal lo que el registro necesita para importarse (sin los
// bancos de preguntas) y lo marca como ESM: el árbol real no declara "type": "module".
function aislar(raiz) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ilustraciones-'));
  fs.cpSync(path.join(raiz, 'src'), path.join(tmp, 'src'), {
    recursive: true,
    filter: (s) => !/(questions|topics)[^/]*\.js$|\.(png|jpe?g|ttf|woff2?)$/.test(s),
  });
  fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}');
  return tmp;
}

// Devuelve la lista de errores del árbol `raiz`.
async function chequear(raiz = RAIZ) {
  const errores = [];
  const falla = (donde, msg) => errores.push(`${donde}: ${msg}`);
  const tmp = aislar(raiz);
  // metadata.js usa require() para las imágenes; aquí solo importa que no rompa.
  globalThis.require = (p) => p;
  try {
    const registro = await import(pathToFileURL(path.join(tmp, 'src', 'materias', 'index.js')).href);
    const lista = registro.MATERIA_LIST;
    if (!Array.isArray(lista) || lista.length === 0) {
      falla('registro', 'MATERIA_LIST ausente o vacía');
    } else {
      for (const m of lista) {
        validar(m?.id ?? '(sin id)', m?.ilustracion, falla);
        const idx = path.join(raiz, 'src', 'materias', String(m?.id), 'index.js');
        if (fs.existsSync(idx) && /\bilustracion\b/.test(fs.readFileSync(idx, 'utf8'))) {
          falla(m.id, 'index.js no debe reexportar `ilustracion` (D3: la lleva el registro)');
        }
      }
    }
    const fil = await import(pathToFileURL(path.join(tmp, 'src', 'assets', 'filamentos.js')).href);
    validar('filamentos', fil.ilustracion, falla);
  } catch (e) {
    falla('carga', e.message);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  if (!fs.existsSync(path.join(raiz, 'src', 'components', 'Ilustracion.js'))) {
    falla('componente', 'falta src/components/Ilustracion.js');
  }
  return errores;
}

// --- mutaciones: cada una debe hacer fallar el chequeo --------------------------
const editar = (rel, fn) => (raiz) => {
  const p = path.join(raiz, rel);
  fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8')));
};
const PRIMER_PATH = "tipo: 'path', props: {";
const MUTACIONES = {
  "clave ajena en props (extra: 'lime')": editar('src/materias/bcyt/ilustracion.js', (s) =>
    s.replace(PRIMER_PATH, `${PRIMER_PATH} extra: 'lime',`)),
  "style anidado ({ color: 'lime' })": editar('src/materias/bcyt/ilustracion.js', (s) =>
    s.replace(PRIMER_PATH, `${PRIMER_PATH} style: { color: 'lime' },`)),
  'nombre CSS en un valor (rebeccapurple)': editar('src/materias/bcyt/ilustracion.js', (s) =>
    s.replace(PRIMER_PATH, `${PRIMER_PATH} strokeDasharray: 'rebeccapurple',`)),
  'clave de primer nivel ajena': editar('src/materias/bcyt/ilustracion.js', (s) =>
    s.replace("viewBox:", "extra: 1,\n  viewBox:")),
  'materia del registro sin ilustracion': editar('src/materias/index.js', (s) =>
    `${s}\nMATERIA_LIST[2] = { ...MATERIA_LIST[2], ilustracion: undefined };\n`),
  'materia nueva en el registro, sin ilustracion': editar('src/materias/index.js', (s) =>
    `${s}\nMATERIA_LIST.push({ id: 'nueva', name: 'Nueva' });\n`),
  'encuadre inválido': editar('src/assets/filamentos.js', (s) =>
    s.replace("encuadre: 'none'", "encuadre: 'stretch'")),
  'index.js de la materia reexporta ilustracion': editar('src/materias/bcyt/index.js', (s) =>
    `${s}\nexport { ilustracion } from './ilustracion.js';\n`),
};

async function mutaciones() {
  let mal = 0;
  const base = await chequear(RAIZ);
  console.log(`${base.length === 0 ? 'ok  ' : 'MAL '} base sin mutar: ${base.length} error(es)`);
  if (base.length) mal++;
  for (const [nombre, mutar] of Object.entries(MUTACIONES)) {
    const copia = fs.mkdtempSync(path.join(os.tmpdir(), 'mutacion-'));
    try {
      fs.cpSync(path.join(RAIZ, 'src'), path.join(copia, 'src'), { recursive: true });
      mutar(copia);
      const errs = await chequear(copia);
      const ok = errs.length > 0;
      if (!ok) mal++;
      console.log(`${ok ? 'ok  ' : 'MAL '} ${ok ? 'falla' : 'PASA (no detectada)'}: ${nombre}`);
    } finally {
      fs.rmSync(copia, { recursive: true, force: true });
    }
  }
  console.log(mal ? `MUTACIONES: ${mal} sin detectar` : `MUTACIONES: OK (${Object.keys(MUTACIONES).length} detectadas)`);
  return mal ? 1 : 0;
}

if (process.argv.includes('--mutaciones')) {
  process.exit(await mutaciones());
}
const errores = await chequear(RAIZ);
if (errores.length) {
  console.error(`ILUSTRACIONES: ${errores.length} error(es)`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('ILUSTRACIONES: OK (6 materias del registro + filamentos)');

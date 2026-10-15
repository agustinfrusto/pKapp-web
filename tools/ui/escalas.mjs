// Chequeo de contrato de las escalas Plancha (tokens.md d.1 y d.2, tarea 2.3).
//
//   - fontSize: cada paso de d.1 está en tailwind.config.js con tamaño, interlineado
//     y espaciado iguales (el bloque se lee de tokens.md, no se copia aquí);
//   - borderRadius: toda clave efectiva del tema resuelto (las de d.1 y las que trae
//     Tailwind, como xl/2xl/3xl) vale 0px; borderWidth 0/1/2/3 y DEFAULT 1px;
//     maxWidth.columna;
//   - colors: cada clave de plancha.claro como color plano y cada clave de
//     plancha.oscuro con sufijo D, con el valor de colores.js;
//   - colisión de clase: ninguna clave de color Plancha coincide con un color base de
//     Tailwind ni con un nombre de fontSize, spacing o maxWidth (`text-X` / `border-X` /
//     `w-X` serían ambiguas).
// Lo legado (colores, fontSize y sombras anteriores al rediseño) lo vigila legado.mjs.
//
// Uso: node tools/ui/escalas.mjs [--mutaciones]
//   --mutaciones: además aplica cada mutación conocida (hallazgos del Analista de
//   2.3) sobre una copia en memoria y exige que el chequeo falle con ella.
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TOKENS = path.join(RAIZ, 'openspec', 'diseno', 'tokens.md');
const require = createRequire(import.meta.url);
const resolveConfig = require('tailwindcss/resolveConfig');

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const copia = (o) => JSON.parse(JSON.stringify(o));

function verificar({ config, plancha, esperado }) {
  const fallos = [];
  const falla = (m) => fallos.push(m);
  const ext = config.theme.extend;

  // --- d.1: fontSize -----------------------------------------------------------------
  for (const [paso, def] of Object.entries(esperado.fontSize)) {
    const real = ext.fontSize && ext.fontSize[paso];
    if (!real) falla(`fontSize.${paso}: falta`);
    else if (!igual(real, def)) falla(`fontSize.${paso}: ${JSON.stringify(real)} != ${JSON.stringify(def)}`);
  }

  // --- d.1: radios, anchos ------------------------------------------------------------
  const tema = resolveConfig(config).theme;
  for (const k of Object.keys(esperado.borderRadius)) {
    if ((ext.borderRadius || {})[k] !== '0px') falla(`borderRadius.${k}: ${(ext.borderRadius || {})[k]} != 0px`);
  }
  for (const [k, v] of Object.entries(tema.borderRadius || {})) {
    if (v !== '0px') falla(`borderRadius.${k}: efectivo ${v} != 0px`);
  }
  if (!igual(ext.borderWidth, esperado.borderWidth)) {
    falla(`borderWidth: ${JSON.stringify(ext.borderWidth)} != ${JSON.stringify(esperado.borderWidth)}`);
  }
  if (!ext.maxWidth || ext.maxWidth.columna !== esperado.maxWidth.columna) {
    falla(`maxWidth.columna: ${ext.maxWidth && ext.maxWidth.columna} != ${esperado.maxWidth.columna}`);
  }

  // --- d.2: colores ---------------------------------------------------------------------
  const col = ext.colors || {};
  for (const [k, v] of Object.entries(plancha.claro)) {
    if (typeof col[k] !== 'string') falla(`colors.${k}: no es un color plano (${JSON.stringify(col[k])})`);
    else if (col[k] !== v) falla(`colors.${k}: ${col[k]} != ${v}`);
  }
  for (const [k, v] of Object.entries(plancha.oscuro)) {
    if (!igual(col[`${k}D`], v)) falla(`colors.${k}D: ${JSON.stringify(col[`${k}D`])} != ${JSON.stringify(v)}`);
  }
  // --- colisión de clase ------------------------------------------------------------------
  const base = resolveConfig({ ...config, theme: { ...config.theme, extend: { ...ext, colors: {} } } }).theme;
  const ocupados = new Map();
  const ocupa = (nombres, origen) => { for (const n of nombres) if (!ocupados.has(n)) ocupados.set(n, origen); };
  ocupa(Object.keys(base.colors || {}), 'color base de Tailwind');
  ocupa(Object.keys(tema.fontSize || {}), 'fontSize');
  ocupa(Object.keys(tema.spacing || {}), 'spacing');
  ocupa(Object.keys(tema.maxWidth || {}), 'maxWidth');
  const nombresPlancha = [
    ...Object.keys(plancha.claro),
    ...Object.keys(plancha.oscuro).map((k) => `${k}D`),
  ];
  for (const n of nombresPlancha) {
    if (ocupados.has(n)) falla(`colors.${n}: colisión de clase con ${ocupados.get(n)}`);
  }

  return fallos;
}

// --- entrada real: d.1 de tokens.md evaluado como literal de objeto ---------------------
const md = fs.readFileSync(TOKENS, 'utf8');
const sec = md.split(/^### d\.1 /m)[1];
const bloque = sec && /```js\n([\s\S]*?)```/.exec(sec);
if (!bloque) {
  console.error('FALLA: no se encontró el bloque js de tokens.md d.1');
  process.exit(1);
}

const real = {
  config: require(path.join(RAIZ, 'tailwind.config.js')),
  ...require(path.join(RAIZ, 'src', 'theme', 'colores.js')),
  esperado: vm.runInNewContext(`({${bloque[1]}})`),
};

const fallos = verificar(real);
if (fallos.length) {
  console.error(`escalas: ${fallos.length} fallo(s)`);
  for (const f of fallos) console.error(`  - ${f}`);
  process.exit(1);
}

// --- mutaciones: cada una debe hacer fallar el chequeo -----------------------------------
// Se mutan copias; `config` conserva los presets (funciones) y solo se clona `extend`.
const MUTACIONES = [
  ['M05 borderRadius.lg 0 -> 1px', (e) => { e.config.theme.extend.borderRadius.lg = '1px'; }],
  ['M06 borderRadius.xl ausente (Tailwind lo resuelve a 0.75rem)', (e) => { delete e.config.theme.extend.borderRadius.xl; }],
  ['M06b borderRadius.3xl ausente', (e) => { delete e.config.theme.extend.borderRadius['3xl']; }],
  ['M12b plancha.claro.fondo sin cablear en colors', (e) => { e.config.theme.extend.colors.fondo = '#000000'; }],
  ['M15c color Plancha con nombre de fontSize (xs)', (e) => {
    e.plancha.claro.xs = '#123456';
    e.config.theme.extend.colors.xs = '#123456';
  }],
  ['M15d color Plancha con nombre de maxWidth (columna)', (e) => {
    e.plancha.claro.columna = '#123456';
    e.config.theme.extend.colors.columna = '#123456';
  }],
  ['M15e color Plancha con nombre de spacing (px)', (e) => {
    e.plancha.claro.px = '#123456';
    e.config.theme.extend.colors.px = '#123456';
  }],
  ['M15f color Plancha con nombre de color base (white)', (e) => {
    e.plancha.claro.white = '#123456';
    e.config.theme.extend.colors.white = '#123456';
  }],
  ['M08 maxWidth.columna 448 -> 449px', (e) => { e.config.theme.extend.maxWidth.columna = '449px'; }],
];

let sinDetectar = 0;
for (const [nombre, mutar] of MUTACIONES) {
  const e = { ...real, config: { ...real.config, theme: { ...real.config.theme } } };
  e.config.theme.extend = copia(real.config.theme.extend);
  e.plancha = copia(real.plancha);
  mutar(e);
  const f = verificar(e);
  if (f.length === 0) {
    sinDetectar += 1;
    console.error(`  - mutación NO detectada: ${nombre}`);
  } else if (process.argv.includes('--mutaciones')) {
    console.log(`  detectada: ${nombre} (${f.length} fallo(s))`);
  }
}
if (sinDetectar) {
  console.error(`escalas: ${sinDetectar} mutación(es) sin detectar`);
  process.exit(1);
}

console.log(
  `escalas OK: ${Object.keys(real.esperado.fontSize).length} pasos, radios efectivos en 0, ` +
  `${Object.keys(real.plancha.claro).length} colores claros y ${Object.keys(real.plancha.oscuro).length} con sufijo D, ` +
  `sin colisiones, ${MUTACIONES.length} mutaciones detectadas`,
);

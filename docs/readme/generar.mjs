// Assets gráficos del README: portada (claro y oscuro), miniaturas de materia y láminas de
// las capturas de pantalla. Nada de esto es contenido de la app: es presentación.
//
//   node --no-warnings docs/readme/generar.mjs [--capturas <carpeta>]
//
// Portada y miniaturas salen solo de Node. Las láminas enmarcan las capturas crudas de
// `npm run screenshots -- --tema claro|oscuro --ancho 390 --salida <carpeta>`; sin
// `--capturas` se omiten. Las láminas piden `rsvg-convert` y `python3` con Pillow.
//
// Reglas (REFERENCIAS.md, tokens.md): solo colores de `plancha` (src/theme/colores.js), sin
// gradientes, sombras ni radios, y ningún <text>: GitHub sirve el SVG por <img>, que no carga
// fuentes, así que el texto se convierte a trazos desde los woff2 de IBM Plex (SIL OFL,
// src/assets/fuentes/OFL.txt) con trazos.mjs. Los datos que cambian (conteos, tamaños de
// examen) no se dibujan: viven como texto en el README.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { cargarFuente, trazar } from './trazos.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const require = createRequire(import.meta.url);
const { plancha } = require(path.join(RAIZ, 'src', 'theme', 'colores.js'));

const TEMAS = ['claro', 'oscuro'];
// Claves de `plancha` que usan estos gráficos; cualquier otro color aborta (verificarColores).
const CLAVES = ['fondo', 'superficie', 'tinta', 'tintaSec', 'linea', 'filete', 'acento', 'filamento'];
const SALIDA_SVG = AQUI;
const SALIDA_PNG = path.join(RAIZ, 'docs', 'screenshots');

const cargar = (archivo) => cargarFuente(path.join(RAIZ, 'src', 'assets', 'fuentes', archivo));
const SANS_SEMIBOLD = cargar('PlexSans-SemiBold.woff2');
const MONO = cargar('PlexMono-Regular.woff2');
const MONO_MEDIO = cargar('PlexMono-Medium.woff2');

const MATERIAS = ['bcyt', 'anatomia', 'neuro', 'cyr', 'dre', 'ryd'];

// Capturas: [archivo base, número, rótulo del cajetín]. El orden es el del flujo de uso.
const PANTALLAS = [
  ['01-materia-select', '01', 'MATERIAS'],
  ['02-home', '02', 'INICIO'],
  ['03-topic-select', '03', 'ELEGIR TEMA'],
  ['04-quiz', '04', 'PREGUNTA'],
  ['05-results', '05', 'RESULTADOS'],
  ['06-stats', '06', 'ESTADÍSTICAS'],
];

// --- utilidades ---------------------------------------------------------------------------

const num = (v, dec = 1) => {
  let s = String(+v.toFixed(dec));
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
const unir = (vs, dec) => vs.map((v) => num(v, dec)).reduce(
  (acc, s) => (acc === '' ? s : (s[0] === '-' ? acc + s : `${acc} ${s}`)), '');

const CABECERA = '<!-- Generado por docs/readme/generar.mjs. No editar a mano. -->';

function verificarColores(svg, tema, nombre) {
  const permitidos = new Set(CLAVES.map((k) => plancha[tema][k].toLowerCase()));
  for (const hex of svg.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) {
    if (!permitidos.has(hex.toLowerCase())) {
      throw new Error(`${nombre}: el color ${hex} no es un token de plancha.${tema}`);
    }
  }
  if (/<text|<style|@font-face|gradient|filter|<image|xlink:href="http/i.test(svg)) {
    throw new Error(`${nombre}: elemento no permitido en un SVG servido por <img>`);
  }
}

// Marcas de esquina (comun.md §6): cuatro, `linea`, 2 px, solo los dos lados que miran hacia
// afuera, lado 8, sobresalen 4 (`l`, `a`, `g`: lado, sobresalido y grosor; en las láminas de
// capturas van a 12, 6 y 3 porque la captura se reduce). `x0`, `y0`, `x1`, `y1`: esquinas
// exteriores de la lámina.
function marcasEsquina(x0, y0, x1, y1, { a = 4, l = 8, g = 2 } = {}) {
  return [
    `M${x0 - a} ${y0 - a}h${l}v${g}H${x0 - a + g}v${l - g}h-${g}z`,
    `M${x1 + a - l} ${y0 - a}h${l}v${l}h-${g}V${y0 - a + g}h-${l - g}z`,
    `M${x0 - a} ${y1 + a - l}h${g}v${l - g}h${l - g}v${g}H${x0 - a}z`,
    `M${x1 + a - g} ${y1 + a - l}h${g}v${l}h-${l}v-${g}h${l - g}z`,
  ].join('');
}

// --- campo de filamentos y regla -----------------------------------------------------------

// Escala las coordenadas de un path de `M` y `c` (el formato de filamentos.js) y las deja
// relativas desde posiciones ya redondeadas, para que el redondeo no se acumule.
function hornearPath(d, fx, fy, dx, dy, dec) {
  const toks = d.match(/[MmCc]|-?\d*\.?\d+/g);
  const k = 10 ** dec;
  const redondear = (v) => Math.round(v * k) / k;
  let i = 0; let cmd = null; let sx = 0; let sy = 0; let rx = 0; let ry = 0; let salida = '';
  const par = () => [Number(toks[i++]), Number(toks[i++])];
  while (i < toks.length) {
    if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
    if (cmd === 'M') {
      const [x, y] = par(); sx = x; sy = y;
      rx = redondear(dx + sx * fx); ry = redondear(dy + sy * fy);
      salida += `M${unir([rx, ry], dec)}`;
      cmd = 'L'; // un par extra tras M sería línea: filamentos.js no lo usa
    } else if (cmd === 'c') {
      const p = [par(), par(), par()].map(([x, y]) => [sx + x, sy + y]);
      const abs = p.map(([x, y]) => [redondear(dx + x * fx), redondear(dy + y * fy)]);
      const rel = abs.flatMap(([x, y]) => [x - rx, y - ry]);
      salida += `c${unir(rel, dec)}`;
      sx = p[2][0]; sy = p[2][1]; rx = abs[2][0]; ry = abs[2][1];
    } else {
      throw new Error(`filamentos.js: comando de path no soportado (${cmd})`);
    }
  }
  return salida;
}

async function importarDatos(archivo) {
  return (await import(pathToFileURL(path.join(RAIZ, archivo)).href)).ilustracion;
}

// --- portada ------------------------------------------------------------------------------

const PORTADA = {
  ancho: 980, margen: 6, campo: 236, regla: 10, cajetin: 76,
  grosor: 1.5, // el campo es 2,0 a 2,8 veces más grande que en el teléfono: el trazo sube 1,5×
};

function portada(tema, campo) {
  const c = plancha[tema];
  const { ancho, margen: m, campo: hc, regla: hr, cajetin: hj } = PORTADA;
  const ix = m + 1; // borde interior de la lámina
  const iw = ancho - 2 * m - 2;
  const yc = ix; // campo
  const y1 = yc + hc; // divisor 1
  const yr = y1 + 1; // regla
  const y2 = yr + hr; // divisor 2
  const yj = y2 + 1; // cajetín
  const yf = yj + hj; // borde interior inferior
  const alto = yf + 1 + m;
  const [, , vw, vh] = campo.viewBox.split(/\s+/).map(Number);
  const fx = iw / vw; const fy = hc / vh;

  const trazos = campo.elementos.map((el) => {
    const { d, strokeOpacity, strokeWidth } = el.props;
    const grosor = num(strokeWidth * PORTADA.grosor, 2);
    const base = `<path d="${hornearPath(d, fx, fy, ix, yc, 1)}" stroke-width="${grosor}"`;
    if (el.tono === 'acento') return `${base} stroke="${c.acento}"/>`;
    return `${base} stroke-opacity="${num(strokeOpacity, 2)}"/>`;
  }).join('\n');

  // Regla graduada (filamentos.js `regla`): marca cada 10 unidades de un viewBox de 348,
  // larga cada 50, estirada al ancho de la lámina; los trazos caen en medio píxel.
  const yb = yr + hr - 0.5;
  let regla = `M${ix} ${yb}h${iw}`;
  for (let u = 0; u <= 340; u += 10) {
    const x = ix + Math.round(u * fx) + 0.5;
    regla += `M${num(x)} ${num(yb)}v-${u % 50 === 0 ? 6.5 : 3.5}`;
  }

  // Cajetín: wordmark a la izquierda (paso `marca`), dos rótulos a la derecha (`rotulo`).
  const px = ix + 16; const pd = ix + iw - 16;
  const marca = trazar(SANS_SEMIBOLD, 'pKapp', { px: 48, x: px, y: yj + 51, espaciado: -0.48, dec: 1 });
  const r1 = trazar(MONO, 'VERSIÓN WEB · PKAPP.UY', { px: 12, x: pd, y: yj + 33, espaciado: 0.72, alinear: 'end', dec: 1 });
  const r2 = trazar(MONO, 'PREGUNTAS REALES DE ESFUNO', { px: 12, x: pd, y: yj + 51, espaciado: 0.72, alinear: 'end', dec: 1 });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
${CABECERA}
<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">
<rect x="${m + 0.5}" y="${m + 0.5}" width="${ancho - 2 * m - 1}" height="${alto - 2 * m - 1}" fill="${c.superficie}" stroke="${c.linea}"/>
<clipPath id="a"><rect x="${ix}" y="${yc}" width="${iw}" height="${hc}"/></clipPath>
<g clip-path="url(#a)" fill="none" stroke="${c.filamento}">
${trazos}
</g>
<path d="M${ix} ${y1 + 0.5}h${iw}M${ix} ${y2 + 0.5}h${iw}" fill="none" stroke="${c.filete}"/>
<path d="${regla}" fill="none" stroke="${c.tintaSec}"/>
<path d="${marcasEsquina(m, m, ancho - m, alto - m)}" fill="${c.linea}"/>
<path d="${marca.d}" fill="${c.tinta}"/>
<path d="${r1.d}${r2.d}" fill="${c.tintaSec}"/>
</svg>
`;
  verificarColores(svg, tema, `portada-${tema}`);
  return svg;
}

// --- miniaturas de materia ----------------------------------------------------------------

const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

// La ilustración (64 × 64) va en una celda de `superficie` con marco de `filete`, como la
// celda de miniatura de la tarjeta del selector. GitHub pinta de blanco el fondo de toda
// imagen y las filas pares de una tabla son grises: sin celda propia, la miniatura
// transparente dejaría un cuadro blanco suelto sobre la fila.
const CELDA = 72;

function miniatura(datos, tema) {
  const c = plancha[tema];
  const [, , vw, vh] = datos.viewBox.split(/\s+/).map(Number);
  const { ancho, union, extremo } = datos.trazo;
  const hijos = datos.elementos.map((el) => {
    const { relleno, ...props } = el.props;
    const attrs = Object.entries(props).map(([k, v]) => `${kebab(k)}="${v}"`).join(' ');
    return `<${el.tipo} ${attrs}${relleno ? ` fill="${c.filamento}"` : ''}/>`;
  }).join('\n');
  const dx = (CELDA - vw) / 2; const dy = (CELDA - vh) / 2;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
${CABECERA}
<svg xmlns="http://www.w3.org/2000/svg" width="${CELDA}" height="${CELDA}" viewBox="0 0 ${CELDA} ${CELDA}">
<rect x=".5" y=".5" width="${CELDA - 1}" height="${CELDA - 1}" fill="${c.superficie}" stroke="${c.filete}"/>
<g transform="translate(${dx} ${dy})" fill="none" stroke="${c.filamento}" stroke-width="${ancho}" stroke-linejoin="${union}" stroke-linecap="${extremo}">
${hijos}
</g>
</svg>
`;
  return svg;
}

// --- láminas de capturas ------------------------------------------------------------------

const LAMINA = { ancho: 640, margen: 12, marco: 2, fila: 52 };

function dimensionesPng(ruta) {
  const b = readFileSync(ruta);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error(`${ruta}: no es PNG`);
  return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
}

// Superposición de la lámina: marco, marcas de esquina y cajetín. El hueco de la captura
// queda transparente. Medidas en px del PNG final (2 px por px de CSS a 320 de ancho).
function superposicion(tema, numero, rotulo, altoCaptura) {
  const c = plancha[tema];
  const { ancho, margen: m, marco: f, fila } = LAMINA;
  const ix = m + f; const iw = ancho - 2 * ix;
  const yd = ix + altoCaptura; // divisor del cajetín
  const yj = yd + f;
  const yi = yj + fila;
  const alto = yi + f + m;
  const pad = 24;
  const valor = tema === 'claro' ? 'CLARO' : 'OSCURO';
  const rot = (t, fuente, x, alinear = 'start') => trazar(fuente, t, {
    px: 22, x, y: yj + 33, espaciado: 1.32, alinear, dec: 1,
  });
  const n = rot(numero, MONO_MEDIO, ix + pad);
  const r = rot(` · ${rotulo}`, MONO, n.fin);
  const vTema = rot(valor, MONO_MEDIO, ix + iw - pad, 'end');
  const lTema = rot('TEMA ', MONO, vTema.inicio, 'end');
  const xs = lTema.inicio - pad; // separador vertical de la celda de tema
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">
<path d="M${ix} ${yj}h${iw}v${fila}h-${iw}z" fill="${c.fondo}"/>
<path d="M${ix} ${yd}h${iw}v${f}h-${iw}zM${num(xs)} ${yj}h${f}v${fila}h-${f}z" fill="${c.filete}"/>
<path d="M${m} ${m}h${ancho - 2 * m}v${alto - 2 * m}H${m}zM${ix} ${ix}v${alto - 2 * ix}h${iw}V${ix}z" fill="${c.linea}" fill-rule="evenodd"/>
<path d="${marcasEsquina(m, m, ancho - m, alto - m, { a: 6, l: 12, g: 3 })}" fill="${c.linea}"/>
<path d="${n.d}" fill="${c.acento}"/>
<path d="${r.d}${lTema.d}" fill="${c.tintaSec}"/>
<path d="${vTema.d}" fill="${c.tinta}"/>
</svg>
`;
  verificarColores(svg, tema, `lamina-${numero}-${tema}`);
  return { svg, alto, x: ix, y: ix, ancho: iw };
}

const COMPONER_PY = `
import json, sys
from PIL import Image
for j in json.load(sys.stdin):
    ov = Image.open(j['overlay']).convert('RGBA')
    base = Image.new('RGBA', ov.size, (0, 0, 0, 0))
    shot = Image.open(j['raw']).convert('RGB').resize((j['ancho'], j['alto']), Image.LANCZOS)
    base.paste(shot, (j['x'], j['y']))
    out = Image.alpha_composite(base, ov)
    out.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(j['out'], optimize=True)
`;

function laminas(capturas) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'readme-laminas-'));
  const trabajos = [];
  try {
    for (const tema of TEMAS) {
      for (const [base, numero, rotulo] of PANTALLAS) {
        const raw = path.join(capturas, `${base}-390-${tema}.png`);
        if (!existsSync(raw)) throw new Error(`Falta la captura ${raw}`);
        const dim = dimensionesPng(raw);
        const interior = LAMINA.ancho - 2 * (LAMINA.margen + LAMINA.marco);
        const alto = Math.round((dim.alto * interior) / dim.ancho);
        const sup = superposicion(tema, numero, rotulo, alto);
        const svg = path.join(tmp, `${base}-${tema}.svg`);
        const png = path.join(tmp, `${base}-${tema}.png`);
        writeFileSync(svg, sup.svg);
        execFileSync('rsvg-convert', ['-o', png, svg]);
        trabajos.push({
          raw, overlay: png, ancho: interior, alto, x: sup.x, y: sup.y,
          out: path.join(SALIDA_PNG, tema === 'claro' ? `${base}.png` : `${base}-390-oscuro.png`),
        });
      }
    }
    execFileSync('python3', ['-I', '-c', COMPONER_PY], { input: JSON.stringify(trabajos) });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  return trabajos.map((t) => t.out);
}

// --- principal ----------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--capturas');
  const capturas = i >= 0 ? path.resolve(args[i + 1]) : null;
  const escritos = [];
  const escribir = (ruta, texto) => { writeFileSync(ruta, texto); escritos.push(ruta); };

  const campo = await importarDatos('src/assets/filamentos.js');
  for (const tema of TEMAS) escribir(path.join(SALIDA_SVG, `portada-${tema}.svg`), portada(tema, campo));

  mkdirSync(path.join(SALIDA_SVG, 'materias'), { recursive: true });
  for (const id of MATERIAS) {
    const datos = await importarDatos(`src/materias/${id}/ilustracion.js`);
    for (const tema of TEMAS) {
      const svg = miniatura(datos, tema);
      verificarColores(svg, tema, `${id}-${tema}`);
      escribir(path.join(SALIDA_SVG, 'materias', `${id}-${tema}.svg`), svg);
    }
  }

  if (capturas) {
    mkdirSync(SALIDA_PNG, { recursive: true });
    escritos.push(...laminas(capturas));
  } else {
    console.log('Sin --capturas: láminas de pantallas omitidas.');
  }
  for (const ruta of escritos) {
    console.log(`${String(readFileSync(ruta).length).padStart(7)} B  ${path.relative(RAIZ, ruta)}`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });

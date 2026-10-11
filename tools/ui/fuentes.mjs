// Chequeo de contrato de las fuentes (design.md D4, tarea 2.2).
//
//   - los 4 woff2 existen en src/assets/fuentes/ y suman <= 102.400 bytes;
//   - cada uno cubre el subset latin pedido (se lee la cmap del woff2, sin fonttools);
//   - cada regla @font-face que inyecta fuentes.web.js (se evalúa el módulo y se parsea
//     el CSS generado) tiene un font-family igual a uno de los 4 nombres registrados,
//     `font-display: swap` y apunta a su propio woff2; los 4 nombres, sin duplicados;
//   - las claves de fuentes.js y el fontFamily de tailwind.config.js son los mismos 4;
//   - los 4 ttf y la licencia OFL acompañan a los woff2.
//
// Uso: node tools/ui/fuentes.mjs
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import zlib from 'zlib';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = path.join(RAIZ, 'src', 'assets', 'fuentes');
const WEB = path.join(RAIZ, 'src', 'theme', 'fuentes.web.js');
const NATIVO = path.join(RAIZ, 'src', 'theme', 'fuentes.js');

const FUENTES = ['PlexSans-Regular', 'PlexSans-SemiBold', 'PlexMono-Regular', 'PlexMono-Medium'];
const PRESUPUESTO = 102400;

// ASCII imprimible, Latin-1 (á é í ó ú ü ñ Ñ ¿ ¡ « » ·), rayas, comillas, ≥ ≤.
const CODEPOINTS = [];
for (let c = 0x20; c <= 0x7e; c++) CODEPOINTS.push(c);
for (let c = 0xa1; c <= 0xff; c++) CODEPOINTS.push(c);
CODEPOINTS.push(0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2026, 0x2264, 0x2265);

// Tabla de tags conocidos del formato WOFF2 (índice de 6 bits).
const TAGS = (
  'cmap head hhea hmtx maxp name OS/2 post cvt  fpgm glyf loca prep CFF  VORG EBDT EBLC gasp ' +
  'hdmx kern LTSH PCLT VDMX vhea vmtx BASE GDEF GPOS GSUB EBSC JSTF MATH CBDT CBLC COLR CPAL ' +
  'SVG  sbix acnt avar bdat bloc bsln cvar fdsc feat fmtx fvar gvar hsty just lcar mort morx ' +
  'opbd prop trak Zapf Silf Glat Gloc Feat Sill'
).split(' ').filter(Boolean).map((t) => t.padEnd(4, ' '));

function leerBase128(buf, pos) {
  let valor = 0;
  for (let i = 0; i < 5; i++) {
    const b = buf[pos.i++];
    valor = valor * 128 + (b & 0x7f);
    if (!(b & 0x80)) return valor;
  }
  throw new Error('UIntBase128 inválido');
}

// Devuelve el Set de codepoints de la cmap de un woff2. La cmap no se transforma en
// WOFF2, así que basta descomprimir el flujo brotli y ubicarla por su offset.
function codepointsDeWoff2(buf) {
  if (buf.toString('latin1', 0, 4) !== 'wOF2') throw new Error('no es woff2');
  const numTables = buf.readUInt16BE(12);
  const pos = { i: 48 };
  const tablas = [];
  for (let n = 0; n < numTables; n++) {
    const flags = buf[pos.i++];
    const idx = flags & 0x3f;
    const tag = idx === 63 ? buf.toString('latin1', pos.i, (pos.i += 4)) : TAGS[idx];
    const version = flags >> 6;
    const orig = leerBase128(buf, pos);
    const transformada = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0;
    const largo = transformada ? leerBase128(buf, pos) : orig;
    tablas.push({ tag, largo });
  }
  const datos = zlib.brotliDecompressSync(buf.subarray(pos.i));
  let off = 0;
  let cmap = null;
  for (const t of tablas) {
    if (t.tag === 'cmap') cmap = datos.subarray(off, off + t.largo);
    off += t.largo;
  }
  if (!cmap) throw new Error('sin tabla cmap');

  const cps = new Set();
  const n = cmap.readUInt16BE(2);
  for (let r = 0; r < n; r++) {
    const o = cmap.readUInt32BE(4 + r * 8 + 4);
    const formato = cmap.readUInt16BE(o);
    if (formato === 4) {
      const seg = cmap.readUInt16BE(o + 6) / 2;
      const fin = o + 14;
      const ini = fin + seg * 2 + 2;
      const delta = ini + seg * 2;
      const rango = delta + seg * 2;
      for (let s = 0; s < seg; s++) {
        const c1 = cmap.readUInt16BE(ini + s * 2);
        const c2 = cmap.readUInt16BE(fin + s * 2);
        for (let c = c1; c <= c2 && c !== 0xffff; c++) {
          const ro = cmap.readUInt16BE(rango + s * 2);
          const d = cmap.readUInt16BE(delta + s * 2);
          let glifo;
          if (ro === 0) glifo = (c + d) & 0xffff;
          else {
            const g = cmap.readUInt16BE(rango + s * 2 + ro + (c - c1) * 2);
            glifo = g === 0 ? 0 : (g + d) & 0xffff;
          }
          if (glifo) cps.add(c);
        }
      }
    } else if (formato === 12) {
      const grupos = cmap.readUInt32BE(o + 12);
      for (let g = 0; g < grupos; g++) {
        const b = o + 16 + g * 12;
        const c1 = cmap.readUInt32BE(b);
        const c2 = cmap.readUInt32BE(b + 4);
        for (let c = c1; c <= c2; c++) cps.add(c);
      }
    }
  }
  return cps;
}

const errores = [];
const fallo = (m) => errores.push(m);
const existe = (p) => fs.existsSync(p);

let total = 0;
for (const nombre of FUENTES) {
  const woff = path.join(DIR, `${nombre}.woff2`);
  if (!existe(woff)) {
    fallo(`falta ${path.relative(RAIZ, woff)}`);
  } else {
    const buf = fs.readFileSync(woff);
    total += buf.length;
    try {
      const cps = codepointsDeWoff2(buf);
      const faltan = CODEPOINTS.filter((c) => !cps.has(c));
      if (faltan.length) {
        fallo(`${nombre}.woff2 no cubre: ${faltan.map((c) => 'U+' + c.toString(16).toUpperCase().padStart(4, '0')).join(' ')}`);
      }
    } catch (e) {
      fallo(`${nombre}.woff2 ilegible: ${e.message}`);
    }
  }
  if (!existe(path.join(DIR, `${nombre}.ttf`))) fallo(`falta ${nombre}.ttf (nativo)`);
}
if (total > PRESUPUESTO) fallo(`los woff2 suman ${total} B, el presupuesto es ${PRESUPUESTO} B`);
if (!existe(path.join(DIR, 'OFL.txt'))) fallo('falta src/assets/fuentes/OFL.txt');
if (!existe(path.join(DIR, 'README.md'))) fallo('falta src/assets/fuentes/README.md (comando de subset)');

// Compara una lista de nombres con los 4 registrados: exactos, sin duplicados.
function exigirNombres(origen, nombres) {
  for (const n of nombres) if (!FUENTES.includes(n)) fallo(`${origen}: nombre no registrado '${n}'`);
  for (const n of FUENTES) {
    const veces = nombres.filter((x) => x === n).length;
    if (veces === 0) fallo(`${origen}: no declara ${n}`);
    else if (veces > 1) fallo(`${origen}: declara ${n} ${veces} veces`);
  }
}

const sinComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// Ejecuta fuentes.web.js con un `document` de mentira y devuelve el CSS que inyecta:
// se parsean las reglas reales, no el texto del archivo (comentarios incluidos).
function cssDeWeb() {
  const fuente = fs.readFileSync(WEB, 'utf8').replace(/^export\s+/gm, '');
  let css = '';
  const document = {
    getElementById: () => null,
    createElement: () => ({}),
    head: { appendChild: (el) => { css += el.textContent; } },
  };
  const ctx = { document, require: (p) => p };
  vm.runInNewContext(`${fuente}\ncargarFuentes();`, ctx);
  return css;
}

if (!existe(WEB)) {
  fallo('falta src/theme/fuentes.web.js');
} else {
  try {
    const reglas = [...cssDeWeb().matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
    if (!reglas.length) fallo('fuentes.web.js no inyecta ninguna regla @font-face');
    const familias = [];
    for (const cuerpo of reglas) {
      const decl = (prop) => (cuerpo.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`)) || [])[1]?.trim();
      const familia = decl('font-family')?.replace(/^(['"])(.*)\1$/, '$2');
      const display = decl('font-display');
      familias.push(familia);
      if (display !== 'swap') fallo(`fuentes.web.js: ${familia} con font-display: ${display ?? '(ausente)'}, se exige swap`);
      const archivo = (decl('src')?.match(/url\(\s*['"]?([^'")]+)/) || [])[1];
      if (familia && path.basename(archivo || '') !== `${familia}.woff2`) {
        fallo(`fuentes.web.js: ${familia} apunta a ${archivo ? path.basename(archivo) : '(sin url)'}`);
      }
    }
    exigirNombres('fuentes.web.js', familias);
  } catch (e) {
    fallo(`fuentes.web.js no se pudo evaluar: ${e.message}`);
  }
}

if (!existe(NATIVO)) {
  fallo('falta src/theme/fuentes.js');
} else {
  const nativo = sinComentarios(fs.readFileSync(NATIVO, 'utf8'));
  const claves = [...nativo.matchAll(/['"]([^'"]+)['"]\s*:\s*require\(\s*['"]([^'"]+)['"]\s*\)/g)];
  exigirNombres('fuentes.js', claves.map((m) => m[1]));
  for (const [, nombre, archivo] of claves) {
    if (path.basename(archivo) !== `${nombre}.ttf`) fallo(`fuentes.js: ${nombre} apunta a ${path.basename(archivo)}`);
  }
}

const TAILWIND = path.join(RAIZ, 'tailwind.config.js');
if (!existe(TAILWIND)) {
  fallo('falta tailwind.config.js');
} else {
  try {
    const familias = createRequire(import.meta.url)(TAILWIND).theme.extend.fontFamily;
    exigirNombres('tailwind.config.js fontFamily', Object.values(familias).map((v) => v[0]));
  } catch (e) {
    fallo(`tailwind.config.js no se pudo leer: ${e.message}`);
  }
}

if (errores.length) {
  console.error('fuentes: FALLA');
  for (const e of errores) console.error('  - ' + e);
  process.exit(1);
}
console.log(`fuentes: OK (4 woff2, ${total} B de ${PRESUPUESTO} B)`);

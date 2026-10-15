#!/usr/bin/env node
// Lámina de las variantes de ilustración de las seis materias (change rediseno-plancha).
//
// Genera `variantes.html` (un solo archivo: CSS, fuentes y SVG inline) y, salvo con
// --sin-png, `variantes.png` (Chrome headless, claro y oscuro lado a lado, escala 2).
// Antes de generar verifica el contrato de datos de D2 sobre los 18 SVG.
//
// Entradas:
//   - src/theme/colores.js, export `plancha`   -> variables CSS de los dos temas;
//   - diseno/svg/<id>.svg                       -> la ilustración de hoy (fila de referencia);
//   - diseno/svg/variantes/<id>-{a,b,c}.svg     -> las tres familias;
//   - src/assets/fuentes/*.woff2                -> embebidas (la lámina no depende de la red);
//   - src/materias/<id>/metadata.js             -> nombre e id visible de cada tarjeta.
//
// Ningún valor de color se escribe en este archivo: todo sale de `plancha`.
// Reutiliza el Chrome y el cliente CDP del arnés e2e.
//
// Uso: node openspec/diseno/svg/variantes/variantes.mjs [--sin-png]

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SVG = path.resolve(AQUI, '..');
const RAIZ = path.resolve(AQUI, '..', '..', '..', '..');
const SALIDA_HTML = path.join(AQUI, 'variantes.html');
const SALIDA_PNG = path.join(AQUI, 'variantes.png');
const ANCHO_PANEL = 984;
const ESCALA = 2;

const require = createRequire(import.meta.url);
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function cargarModulo(ruta, reemplazos = []) {
  let texto = fs.readFileSync(ruta, 'utf8');
  for (const [re, por] of reemplazos) texto = texto.replace(re, por);
  return import('data:text/javascript;base64,' + Buffer.from(texto).toString('base64'));
}

// ---------------------------------------------------------------------------
// Materias, familias y verificación del contrato
// ---------------------------------------------------------------------------

// Orden de MATERIA_LIST (src/materias/index.js).
const textoIndice = fs.readFileSync(path.join(RAIZ, 'src/materias/index.js'), 'utf8');
const region = /MATERIA_LIST\s*=\s*\[([\s\S]*?)\]\s*\.map/.exec(textoIndice)[1];
const ORDEN = region.includes('[')
  ? [...region.matchAll(/\[\s*(\w+)\s*,/g)].map((m) => m[1])
  : region.split(',').map((s) => s.trim()).filter(Boolean);

const FAMILIAS = [
  { id: 'hoy', etiqueta: 'Hoy', nombre: 'Referencia', idea: 'las seis actuales', sufijo: '' },
  { id: 'a', etiqueta: 'A', nombre: 'Lámina', idea: 'figura anatómica, contorno y cota', sufijo: '-a' },
  { id: 'b', etiqueta: 'B', nombre: 'Trama', idea: 'red de conductos y ramas, escala al pie', sufijo: '-b' },
  { id: 'c', etiqueta: 'C', nombre: 'Corte', idea: 'sección con tono por rayado', sufijo: '-c' },
];
const archivo = (id, fam) => (fam.id === 'hoy' ? path.join(SVG, `${id}.svg`) : path.join(AQUI, `${id}${fam.sufijo}.svg`));

// Contrato de D2 (design.md) para una ilustración de materia.
const TIPOS = ['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon'];
const ATRIBUTOS = new Set([
  'd', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height',
  'stroke-width', 'stroke-dasharray', 'stroke-dashoffset',
]);
function verificar(ruta) {
  const texto = fs.readFileSync(ruta, 'utf8');
  const errores = [];
  if (/<g\b|<use\b|<defs\b|transform|<style|<text|<title|<desc|<image|<mask|<clipPath|gradient|filter/i.test(texto)) {
    errores.push('contiene g/use/defs/transform/style/text/title/desc/image/mask/clipPath/gradient/filter');
  }
  if (/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|opacity/i.test(texto)) errores.push('color literal u opacidad');
  const raiz = /<svg\b([^>]*)>/.exec(texto);
  if (!raiz || !/viewBox="0 0 64 64"/.test(raiz[1])) errores.push('viewBox distinto de 0 0 64 64');
  if (raiz && !/stroke="currentColor"/.test(raiz[1])) errores.push('falta stroke="currentColor" en la raíz');
  if (raiz && !/fill="none"/.test(raiz[1])) errores.push('falta fill="none" en la raíz');
  const cuerpo = texto.replace(/<svg\b[^>]*>/, '').replace(/<\/svg>/, '');
  for (const m of cuerpo.matchAll(/<(\w+)\b([^>]*?)\/?>/g)) {
    if (!TIPOS.includes(m[1])) errores.push(`elemento no permitido <${m[1]}>`);
    for (const a of m[2].matchAll(/([\w:-]+)\s*=/g)) {
      if (!ATRIBUTOS.has(a[1])) errores.push(`atributo no permitido ${a[1]} en <${m[1]}>`);
    }
  }
  if (errores.length) throw new Error(`${path.basename(ruta)}: ${[...new Set(errores)].join('; ')}`);
}
for (const id of ORDEN) for (const fam of FAMILIAS.filter((f) => f.id !== 'hoy')) verificar(archivo(id, fam));

// ---------------------------------------------------------------------------
// SVG -> <symbol>
// ---------------------------------------------------------------------------

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
function leerSvg(texto) {
  const limpio = texto.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '').trim();
  const m = /<svg\b([^>]*)>([\s\S]*)<\/svg>/i.exec(limpio);
  const attrs = {};
  for (const a of m[1].matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1]] = a[2];
  const pres = {};
  for (const k of ['fill', 'stroke', 'stroke-width', 'stroke-linejoin', 'stroke-linecap']) {
    if (attrs[k] !== undefined) pres[k] = attrs[k].replace(HEX, 'currentColor');
  }
  return { viewBox: attrs.viewBox, pres, interior: m[2].replace(HEX, 'currentColor').trim() };
}
const presAttrs = (p) => Object.entries(p).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
const sprite = `
<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0">
  ${ORDEN.flatMap((id) => FAMILIAS.map((fam) => {
    const s = leerSvg(fs.readFileSync(archivo(id, fam), 'utf8'));
    return `<symbol id="ilu-${id}-${fam.id}" viewBox="${esc(s.viewBox)}"><g ${presAttrs(s.pres)}>${s.interior}</g></symbol>`;
  })).join('\n  ')}
</svg>`;
const ilu = (id, fam, lado) =>
  `<svg class="ilu" width="${lado}" height="${lado}" aria-hidden="true" focusable="false"><use href="#ilu-${id}-${fam.id}"/></svg>`;

// ---------------------------------------------------------------------------
// Colores, fuentes y datos de las tarjetas
// ---------------------------------------------------------------------------

const { plancha } = require(path.join(RAIZ, 'src/theme/colores.js'));
const decl = (t) => Object.entries(t).map(([k, v]) => `--${k}:${v}`).join(';');
const bloqueColores = `:root,.tema-claro{${decl(plancha.claro)}}\n.tema-oscuro{${decl(plancha.oscuro)}}`;

const FUENTES = [
  ['IBM Plex Sans', 400, 'PlexSans-Regular.woff2'], ['IBM Plex Sans', 600, 'PlexSans-SemiBold.woff2'],
  ['IBM Plex Mono', 400, 'PlexMono-Regular.woff2'], ['IBM Plex Mono', 500, 'PlexMono-Medium.woff2'],
];
const fontFace = FUENTES.map(([fam, peso, f]) => {
  const b64 = fs.readFileSync(path.join(RAIZ, 'src/assets/fuentes', f)).toString('base64');
  return `@font-face{font-family:'${fam}';font-weight:${peso};font-style:normal;font-display:block;` +
    `src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
}).join('\n');

const MATERIAS = [];
for (const [i, id] of ORDEN.entries()) {
  const { metadata } = await cargarModulo(path.join(RAIZ, 'src/materias', id, 'metadata.js'), [[/require\([^)]*\)/g, 'null']]);
  MATERIAS.push({ id, name: metadata.name, idVisible: `${metadata.shortName} · ${String(i + 1).padStart(2, '0')}`, corto: metadata.shortName });
}

// ---------------------------------------------------------------------------
// Composición
// ---------------------------------------------------------------------------

const marcas = '<i class="mk mk-a"></i><i class="mk mk-b"></i><i class="mk mk-c"></i><i class="mk mk-d"></i>';

function rejilla() {
  const cab = `<span></span>${MATERIAS.map((m) => `<span class="t-rotulo c-sec rej-cab">${esc(m.corto)}</span>`).join('')}`;
  const filas = FAMILIAS.map((fam) => {
    const etq = `<div class="fam-etq"><span class="t-rotulo-medio ${fam.id === 'hoy' ? 'c-sec' : 'c-acento'}">${fam.etiqueta} · ${esc(fam.nombre)}</span><span class="t-detalle c-sec">${esc(fam.idea)}</span></div>`;
    const celdas = MATERIAS.map((m) => `
      <div class="fc ${fam.id === 'hoy' ? 'es-hoy' : 'es-fam'}">
        <div class="fc-grande">${ilu(m.id, fam, 112)}</div>
        <div class="fc-chicos"><span>${ilu(m.id, fam, 64)}</span><span>${ilu(m.id, fam, 48)}</span></div>
      </div>`).join('');
    return etq + celdas;
  }).join('');
  return `<div class="rej">${cab}${filas}</div>`;
}

function tarjeta(m, fam) {
  return `
<div class="lam tarj">
  ${marcas}
  <div class="tarj-fila">
    <div class="tarj-ilu">${ilu(m.id, fam, 48)}</div>
    <div class="tarj-txt"><span class="t-rotulo c-acento">${esc(m.idVisible)}</span><span class="t-item c-tinta">${esc(m.name)}</span></div>
  </div>
</div>`;
}

function selectores() {
  const cols = FAMILIAS.filter((f) => f.id !== 'hoy').map((fam) => `
  <div class="sel-col">
    <span class="t-rotulo-medio c-acento sel-tit">${fam.etiqueta} · ${esc(fam.nombre)}</span>
    ${MATERIAS.map((m) => tarjeta(m, fam)).join('')}
  </div>`).join('');
  return `<div class="sel">${cols}</div>`;
}

function panel(tema) {
  const t = plancha[tema];
  return `
<section class="panel tema-${tema}" aria-label="Tema ${tema}">
  <header class="p-cab">
    <span class="t-rotulo-medio c-tinta">Seis materias · tres familias de ilustración</span>
    <span class="t-rotulo c-sec">Tema ${tema} · trazo filamento ${esc(t.filamento)} · viewBox 0 0 64 64 · trazo 1,1</span>
  </header>
  <div class="sec">
    <div class="sec-rot t-rotulo c-acento">01 · Familias por materia · 112 px (ampliado), 64 px (Home, paso 16) y 48 px (selector, paso 12)</div>
    ${rejilla()}
  </div>
  <div class="sec">
    <div class="sec-rot t-rotulo c-acento">02 · Selector con cada familia completa · celda 64, ilustración 48 (paso 12)</div>
    ${selectores()}
  </div>
</section>`;
}

const ESTILOS = String.raw`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;border-radius:0;font-style:normal;text-decoration:none}
:root{--sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
body{font:400 15px/22px var(--sans);color:var(--tinta);background:var(--fondo);-webkit-font-smoothing:antialiased}
svg{display:block;flex:none}
.sprite{position:absolute;width:0;height:0;overflow:hidden}
.ilu{color:var(--filamento);fill:none;stroke:currentColor}

.t-item{font:600 16px/22px var(--sans)}
.t-detalle{font:400 13px/18px var(--sans)}
.t-rotulo{font:400 11px/16px var(--mono);letter-spacing:.66px;text-transform:uppercase}
.t-rotulo-medio{font:500 11px/16px var(--mono);letter-spacing:.66px;text-transform:uppercase}
.c-tinta{color:var(--tinta)}.c-sec{color:var(--tintaSec)}.c-acento{color:var(--acento)}

.lamina{display:flex;width:max-content}
.panel{width:__ANCHO__px;padding:24px;background:var(--fondo);color:var(--tinta);display:flex;flex-direction:column;gap:28px}
.panel + .panel{border-left:1px solid var(--linea)}
.p-cab{display:flex;flex-direction:column;gap:2px;padding-bottom:12px;border-bottom:1px solid var(--linea)}
.sec{display:flex;flex-direction:column;gap:10px}
.sec-rot{padding-bottom:6px;border-bottom:1px solid var(--filete)}

.rej{display:grid;grid-template-columns:112px repeat(6,130px);gap:8px 6px;align-items:start}
.rej-cab{text-align:center;padding-bottom:2px}
.fam-etq{display:flex;flex-direction:column;gap:2px;padding-top:6px}
.fc{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 0 6px;background:var(--superficie);border:1px solid var(--filete)}
.fc.es-fam{border-color:var(--linea)}
.fc-grande{width:112px;height:112px}
.fc-chicos{display:flex;align-items:center;gap:10px;height:64px}
.fc-chicos span{display:flex;align-items:center;justify-content:center}

.lam{position:relative;background:var(--superficie);border:1px solid var(--linea)}
.mk{position:absolute;width:8px;height:8px;border:0 solid var(--linea);pointer-events:none}
.mk-a{top:-5px;left:-5px;border-top-width:2px;border-left-width:2px}
.mk-b{top:-5px;right:-5px;border-top-width:2px;border-right-width:2px}
.mk-c{bottom:-5px;left:-5px;border-bottom-width:2px;border-left-width:2px}
.mk-d{bottom:-5px;right:-5px;border-bottom-width:2px;border-right-width:2px}

.sel{display:grid;grid-template-columns:repeat(3,1fr);gap:0 20px;padding:5px}
.sel-col{display:flex;flex-direction:column;gap:12px}
.sel-tit{padding-bottom:2px}
.tarj{display:block;width:100%}
.tarj-fila{display:flex}
.tarj-ilu{width:64px;flex:none;display:flex;align-items:center;justify-content:center;border-right:1px solid var(--filete);color:var(--filamento)}
.tarj-txt{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:4px;padding:8px 12px}
`.replace('__ANCHO__', String(ANCHO_PANEL));

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${ANCHO_PANEL * 2}">
<title>pKapp · variantes de ilustración de las seis materias</title>
<style>
${fontFace}
${bloqueColores}
${ESTILOS}
</style>
</head>
<body>
${sprite}
<main class="lamina">${panel('claro')}${panel('oscuro')}
</main>
</body>
</html>
`;
fs.writeFileSync(SALIDA_HTML, html);
console.log(`${path.relative(RAIZ, SALIDA_HTML)}  ${(html.length / 1024).toFixed(0)} KB`);

// ---------------------------------------------------------------------------
// PNG
// ---------------------------------------------------------------------------

if (!process.argv.includes('--sin-png')) {
  const { lanzarChrome } = require(path.join(RAIZ, 'tools/e2e/entorno.js'));
  const { conectarNavegador, esperar } = require(path.join(RAIZ, 'tools/e2e/cdp.js'));
  const puerto = 9300 + Math.floor(Math.random() * 500);
  const chrome = await lanzarChrome(puerto);
  const nav = await conectarNavegador(puerto);
  const problemas = [];
  try {
    const { targetId } = await nav.enviar('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await nav.enviar('Target.attachToTarget', { targetId, flatten: true });
    const cmd = (m, p = {}) => nav.enviar(m, p, sessionId);
    const evaluar = async (expr) => {
      const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
      return r.result.value;
    };
    nav.alEvento((m) => {
      if (m.sessionId !== sessionId) return;
      if (m.method === 'Runtime.exceptionThrown') problemas.push(`excepción: ${m.params.exceptionDetails.text}`);
      if (m.method === 'Runtime.consoleAPICalled' && ['error', 'assert'].includes(m.params.type)) {
        problemas.push(`console.${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description).join(' ')}`);
      }
    });
    await cmd('Page.enable');
    await cmd('Runtime.enable');
    await cmd('Emulation.setDeviceMetricsOverride',
      { width: ANCHO_PANEL * 2, height: 1000, deviceScaleFactor: ESCALA, mobile: false });
    await cmd('Page.navigate', { url: `file://${SALIDA_HTML}` });
    const hasta = Date.now() + 30000;
    for (;;) {
      const listo = await evaluar(`document.readyState === 'complete'`).catch(() => false);
      if (listo) break;
      if (Date.now() > hasta) throw new Error('la página no terminó de cargar');
      await esperar(150);
    }
    await evaluar(`Promise.all([
      document.fonts.load('400 15px "IBM Plex Sans"'), document.fonts.load('600 15px "IBM Plex Sans"'),
      document.fonts.load('400 11px "IBM Plex Mono"'), document.fonts.load('500 11px "IBM Plex Mono"'),
    ]).then(() => true)`);
    await evaluar(`document.fonts.ready.then(() => true)`);
    const cargadas = await evaluar(`[...document.fonts].filter((f) => f.status === 'loaded').length`);
    if (cargadas < FUENTES.length) problemas.push(`fuentes cargadas: ${cargadas} de ${FUENTES.length}`);
    await esperar(200);
    const { w, h } = await evaluar(`({
      w: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    })`);
    const { data } = await cmd('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: h, scale: 1 },
    });
    fs.writeFileSync(SALIDA_PNG, Buffer.from(data, 'base64'));
    console.log(`${path.relative(RAIZ, SALIDA_PNG)}  ${w}x${h} css · escala ${ESCALA} · fuentes ${cargadas}`);
    await nav.enviar('Target.closeTarget', { targetId });
  } finally {
    nav.cerrar();
    await chrome.cerrar();
  }
  if (problemas.length) {
    console.error('\nProblemas:\n' + problemas.map((p) => ' - ' + p).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Sin errores de consola ni excepciones.');
  }
}

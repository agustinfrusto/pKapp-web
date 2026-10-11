#!/usr/bin/env node
// Maqueta navegable de las pantallas del rediseño Plancha (change rediseno-plancha).
//
// Genera `maqueta.html` (un solo archivo, CSS y SVG inline) a partir de:
//   - src/theme/colores.js, export `plancha`  -> bloque de variables CSS (claro y oscuro);
//   - src/materias/*  (metadata, config, topics, questions, conteos) -> datos reales;
//   - diseno/svg/<id>.svg                      -> ilustraciones de materia;
//   - diseno/svg/glifos/                       -> glifos de §9 que existan; el resto
//                                                 queda como cuadrado de `filete` numerado;
//   - src/assets/filamentos.js                 -> campo de filamentos, variante V5 (solo MateriaSelect).
//
// La maqueta reproduce las fichas aprobadas de `diseno/pantallas/` (1.2 y 1.3), incluido el pedido
// de donación DON-P5 (aprobada por el usuario el 2026-10-11, todavía sin implementar: tarea 3.8).
// La figura 09 lo compara con DON-P1, el aspecto anterior.
// Las figuras E01 a E10 (solo a 1366 y 1920 px) dibujan el escritorio de la tarea 3.10: ESC-P0 a
// ESC-P8 y ESC-P10 a ESC-P12, aprobadas por el usuario el 2026-10-11 (ESC-P9, rechazada: AddQuestion
// va en una columna `lectura`). Mismos componentes, otra disposición.
// El selector de tema de AddQuestion es el desplegable de ADD-P3 (aprobada el 2026-10-11; lista plana
// mientras el parcial de cada tema no sea dato) y el campo de filamentos es V5 «Fusiforme» (elegida
// el 2026-10-11), que se lee de `src/assets/filamentos.js`.
// Los valores de color no se escriben en ninguna parte de este archivo: todo color sale de
// `plancha` y se referencia por variable CSS (`var(--tinta)`, ...). Los dos tokens que `plancha`
// todavía no tiene, `acentoFondo` y `acentoBanda` (nuevos, pendientes, solo DON-P5), se derivan
// de `acento`, `superficie` y `fondo`.
//
// Uso: node openspec/changes/rediseno-plancha/diseno/maqueta/generar.mjs

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DISENO = path.resolve(AQUI, '..');
const RAIZ = path.resolve(AQUI, '..', '..', '..', '..', '..');
// Solo para probar el cuadrado de glifo faltante sin tocar la carpeta real:
//   MAQUETA_GLIFOS=<carpeta vacía> MAQUETA_SALIDA=<archivo> node generar.mjs
const SALIDA = process.env.MAQUETA_SALIDA
  ? path.resolve(process.env.MAQUETA_SALIDA)
  : path.join(AQUI, 'maqueta.html');
const FECHA_FICHAS = '2026-10-10';

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad2 = (n) => String(n).padStart(2, '0');
const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

// Los archivos de datos exportan solo datos y no importan nada: se cargan desde su
// texto, sin depender de "type": "module" (misma técnica que tools/ui/ilustraciones.mjs).
async function cargarModulo(ruta, reemplazos = []) {
  let texto = fs.readFileSync(ruta, 'utf8');
  for (const [re, por] of reemplazos) texto = texto.replace(re, por);
  return import('data:text/javascript;base64,' + Buffer.from(texto).toString('base64'));
}

// ---------------------------------------------------------------------------
// Colores: bloque generado desde `plancha`
// ---------------------------------------------------------------------------

const { plancha } = require(path.join(RAIZ, 'src/theme/colores.js'));
const clavesClaro = Object.keys(plancha.claro);
const clavesOscuro = Object.keys(plancha.oscuro);
if (clavesClaro.join() !== clavesOscuro.join()) {
  throw new Error('plancha.claro y plancha.oscuro no tienen las mismas claves');
}

// Tokens NUEVOS que `colores.js` todavía no tiene (DonationBox.md f.4 y «Tokens nuevos»: nuevos,
// pendientes; el alta es del Ingeniero). Solo los usa DON-P5. Se derivan de tokens existentes, de
// modo que este archivo sigue sin escribir ningún color.
//   `acentoFondo`: tinte de `acento` con el patrón de `aciertoFondo` y `errorFondo`; es el «tinte B»
//                  de la exploración: 12 % de `acento` sobre `superficie` en claro, 15 % en oscuro.
//   `acentoBanda`: banda del encabezado. En claro vale lo mismo que `acento` (no cambia nada). En
//                  oscuro, 73 % de `acento` sobre `fondo`: contra la página mide 5,40:1, lo mismo
//                  que en claro, y «Volver a practicar» queda como la acción más fuerte.
const rgbDe = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hexDe = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const mezcla = (a, b, t) => { const A = rgbDe(a), B = rgbDe(b); return hexDe(A.map((v, i) => v * t + B[i] * (1 - t))); };
const TINTE_ACENTO = { claro: 0.12, oscuro: 0.15 };
const BANDA_OSCURO = 0.73;

function bloqueColores() {
  const decl = (t) => Object.entries(t).map(([k, v]) => `  --${k}: ${v};`).join('\n');
  const propuesto = (t, tema) => [
    `  --acentoFondo: ${mezcla(t.acento, t.superficie, TINTE_ACENTO[tema])}; /* nuevo, pendiente: no está en colores.js */`,
    `  --acentoBanda: ${tema === 'claro' ? t.acento : mezcla(t.acento, t.fondo, BANDA_OSCURO)}; /* nuevo, pendiente: no está en colores.js */`,
  ].join('\n');
  return [
    '/* >>> GENERADO por generar.mjs desde src/theme/colores.js (export plancha). No editar a mano. */',
    ':root,\nhtml[data-tema="claro"] {',
    decl(plancha.claro),
    propuesto(plancha.claro, 'claro'),
    '}',
    'html[data-tema="oscuro"] {',
    decl(plancha.oscuro),
    propuesto(plancha.oscuro, 'oscuro'),
    '}',
    '/* <<< FIN GENERADO */',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Datos reales
// ---------------------------------------------------------------------------

// Orden de MATERIA_LIST. Acepta las dos formas del registro: `[bcyt, anatomia, ...]` y
// `[[bcyt, bcytIlustracion], [anatomia, anatomiaIlustracion], ...]`.
const textoIndice = fs.readFileSync(path.join(RAIZ, 'src/materias/index.js'), 'utf8');
const regionLista = /MATERIA_LIST\s*=\s*\[([\s\S]*?)\]\s*\.map/.exec(textoIndice)[1];
const ordenMaterias = regionLista.includes('[')
  ? [...regionLista.matchAll(/\[\s*(\w+)\s*,/g)].map((m) => m[1])
  : regionLista.split(',').map((s) => s.trim()).filter(Boolean);
const { CONTEOS } = await cargarModulo(path.join(RAIZ, 'src/materias/conteos.js'));

const materias = [];
for (const [i, id] of ordenMaterias.entries()) {
  const dir = path.join(RAIZ, 'src/materias', id);
  const { metadata } = await cargarModulo(path.join(dir, 'metadata.js'), [[/require\([^)]*\)/g, 'null']]);
  const { config } = await cargarModulo(path.join(dir, 'config.js'));
  const { TOPICS } = await cargarModulo(path.join(dir, 'topics.js'));
  materias.push({
    ...metadata,
    config,
    TOPICS,
    preguntas: CONTEOS[id] ?? 0,
    numero: pad2(i + 1),
    idVisible: `${metadata.shortName} · ${pad2(i + 1)}`,
  });
}
const porId = Object.fromEntries(materias.map((m) => [m.id, m]));

async function cargarPreguntas(id) {
  const { QUESTIONS } = await cargarModulo(path.join(RAIZ, 'src/materias', id, 'questions.js'));
  return QUESTIONS;
}

// Copia de `dedupeQuestions` de TopicSelectScreen.js: el conteo por tema sale de ahí.
function dedupe(lista) {
  const vistos = new Set();
  const salida = [];
  for (const q of lista) {
    const opts = (q.options || []).map((o) => String(o).toLowerCase().replace(/\s+/g, ' ').trim());
    const correcta = opts[q.correctIndex] || '';
    const clave =
      String(q.question).toLowerCase().replace(/\s+/g, ' ').trim() +
      '||' + [...opts].sort().join('|') + '||' + correcta;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    salida.push(q);
  }
  return salida;
}

const PREGUNTAS = {
  cyr: await cargarPreguntas('cyr'),
  bcyt: await cargarPreguntas('bcyt'),
};
function conteoPorTema(id) {
  const base = dedupe(PREGUNTAS[id]);
  const porTema = new Map();
  for (const q of base) porTema.set(q.topic, (porTema.get(q.topic) || 0) + 1);
  return { total: base.length, porTema };
}

// ---------------------------------------------------------------------------
// SVG: ilustraciones, campo de filamentos y glifos
// ---------------------------------------------------------------------------

const HEX = /#[0-9a-fA-F]{3,8}\b/g;

function leerSvg(texto) {
  const limpio = texto
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<title[\s\S]*?<\/title>/gi, '')
    .replace(/<desc[\s\S]*?<\/desc>/gi, '')
    .trim();
  const m = /<svg\b([^>]*)>([\s\S]*)<\/svg>/i.exec(limpio);
  if (!m) return null;
  const attrs = {};
  for (const a of m[1].matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1]] = a[2];
  let viewBox = attrs.viewBox;
  if (!viewBox && attrs.width && attrs.height) viewBox = `0 0 ${parseFloat(attrs.width)} ${parseFloat(attrs.height)}`;
  if (!viewBox) return null;
  const pres = {};
  for (const clave of ['fill', 'stroke', 'stroke-width', 'stroke-linejoin', 'stroke-linecap', 'stroke-miterlimit']) {
    if (attrs[clave] !== undefined) pres[clave] = attrs[clave].replace(HEX, 'currentColor');
  }
  if (pres.fill === undefined) pres.fill = 'none';
  if (pres.stroke === undefined) pres.stroke = 'currentColor';
  return { viewBox, pres, interior: m[2].replace(HEX, 'currentColor').trim() };
}
const presAttrs = (p) => Object.entries(p).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');

// Ilustraciones de materia (diseno/svg/<id>.svg) -> <symbol> en el sprite.
const ilustraciones = {};
for (const m of materias) {
  const archivo = path.join(DISENO, 'svg', `${m.id}.svg`);
  if (fs.existsSync(archivo)) ilustraciones[m.id] = leerSvg(fs.readFileSync(archivo, 'utf8'));
}

// Campo de filamentos (src/assets/filamentos.js).
const { ilustracion: campo } = await cargarModulo(path.join(RAIZ, 'src/assets/filamentos.js'));
function elementoSvg(el) {
  const attrs = Object.entries(el.props)
    .filter(([k]) => k !== 'relleno')
    .map(([k, v]) => `${kebab(k)}="${esc(v)}"`).join(' ');
  const clase = el.tono === 'acento' ? ' class="cont"' : '';
  const relleno = el.props.relleno ? ' fill="currentColor"' : '';
  return `<${el.tipo}${clase} ${attrs}${relleno}/>`;
}
const campoSvg =
  `<svg viewBox="${campo.viewBox}" preserveAspectRatio="none" fill="none" stroke="currentColor" ` +
  `stroke-width="${campo.trazo.ancho}" stroke-linejoin="${campo.trazo.union}" stroke-linecap="${campo.trazo.extremo}" ` +
  `aria-hidden="true" focusable="false">${campo.elementos.map(elementoSvg).join('')}</svg>`;

// Inventario completo de comun.md §9 (35 glifos): [id, tamaño]. Los 27 primeros son los de 1.2;
// los 8 últimos, los de 1.3 (mensaje, banco reducido, trofeo, guardar, importar, correo,
// externo) y `glifo-eliminar` (1.4b).
const GLIFOS = [
  ['glifo-volver', 'grande'], ['glifo-chevron', 'chico'], ['glifo-cerrar', 'grande'],
  ['glifo-siguiente', 'grande'], ['glifo-acierto', 'chico'], ['glifo-error', 'chico'],
  ['glifo-intermedia', 'chico'], ['glifo-menos', 'chico'], ['glifo-mas', 'chico'],
  ['glifo-claro', 'chico'], ['glifo-oscuro', 'chico'], ['glifo-explicacion', 'chico'],
  ['glifo-reloj', 'chico'], ['glifo-reportar', 'chico'], ['glifo-origen-examen', 'chico'],
  ['glifo-origen-generada', 'chico'], ['glifo-origen-propia', 'chico'], ['glifo-practicar', 'grande'],
  ['glifo-examen', 'grande'], ['glifo-repasar', 'grande'], ['glifo-estadisticas', 'grande'],
  ['glifo-agregar', 'grande'], ['glifo-ajustes', 'grande'], ['glifo-aleatorio', 'grande'],
  ['glifo-revisar', 'chico'], ['glifo-reintentar', 'chico'], ['glifo-inicio', 'chico'],
  ['glifo-mensaje', 'chico'], ['glifo-banco-reducido', 'chico'], ['glifo-trofeo', 'chico'],
  ['glifo-guardar', 'chico'], ['glifo-importar', 'chico'], ['glifo-correo', 'chico'],
  ['glifo-externo', 'chico'], ['glifo-eliminar', 'grande'],
];
const TAM_GLIFO = Object.fromEntries(GLIFOS);
const INDICE_GLIFO = Object.fromEntries(GLIFOS.map(([id], i) => [id, pad2(i + 1)]));

const DIR_GLIFOS = process.env.MAQUETA_GLIFOS
  ? path.resolve(process.env.MAQUETA_GLIFOS)
  : path.join(DISENO, 'svg', 'glifos');
const archivosGlifo = new Map();
(function indexar(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) indexar(p);
    else if (e.name.endsWith('.svg')) archivosGlifo.set(e.name.slice(0, -4), p);
  }
})(DIR_GLIFOS);

const glifosLeidos = new Map();
for (const [id] of GLIFOS) {
  const ruta = archivosGlifo.get(id) ?? archivosGlifo.get(id.replace(/^glifo-/, ''));
  if (!ruta) continue;
  const svg = leerSvg(fs.readFileSync(ruta, 'utf8'));
  if (svg) glifosLeidos.set(id, svg);
}
const faltantes = new Set(GLIFOS.map(([id]) => id).filter((id) => !glifosLeidos.has(id)));
// Huella de los glifos leídos: permite saber con qué dibujos se generó cada tablero.
const huellaGlifos = createHash('sha1')
  .update([...glifosLeidos.entries()].map(([id, g]) => `${id}${g.viewBox}${JSON.stringify(g.pres)}${g.interior}`).join('\n'))
  .digest('hex').slice(0, 8);

// Los archivos de svg/glifos/ comparten viewBox 16 y trazo 1,5 u en la raíz; el componente
// `Glifo` de 3.x aplica `strokeWidth = 24 / lado` (NOTAS-GLIFOS.md §3 y §8) para que el
// trazo en pantalla sea 1,5 px a cualquier lado. La maqueta hace lo mismo.
// `lado` solo se pasa cuando el glifo se usa a un lado distinto del de su tamaño de §9.
function glifo(id, extra = '', lado) {
  const tam = TAM_GLIFO[id];
  if (!tam) throw new Error(`Glifo fuera del inventario: ${id}`);
  const clases = `g g-${tam}${extra ? ' ' + extra : ''}`;
  const svg = glifosLeidos.get(id);
  if (svg) {
    const px = lado ?? (tam === 'grande' ? 24 : 16);
    const pres = { ...svg.pres, 'stroke-width': String(+(24 / px).toFixed(3)) };
    return `<svg class="${clases}" viewBox="${esc(svg.viewBox)}" ${presAttrs(pres)} ` +
      `aria-hidden="true" focusable="false">${svg.interior}</svg>`;
  }
  return `<span class="${clases} g-falta" title="${id} · sin dibujar" aria-hidden="true">${INDICE_GLIFO[id]}</span>`;
}

function ilustracion(id, lado) {
  return `<svg class="ilu" width="${lado}" height="${lado}" aria-hidden="true" focusable="false">` +
    `<use href="#ilu-${id}"/></svg>`;
}

// ---------------------------------------------------------------------------
// Componentes compartidos (comun.md)
// ---------------------------------------------------------------------------

const marcas = '<i class="mk mk-a"></i><i class="mk mk-b"></i><i class="mk mk-c"></i><i class="mk mk-d"></i>';

// §2: control segmentado «Claro | Oscuro». El estado seleccionado lo da el tema de la página.
const controlTema = () => `
<div class="tema" role="radiogroup" aria-label="Modo oscuro">
  <button type="button" class="tema-op" role="radio" data-op="claro" data-set="tema:claro">${glifo('glifo-claro')}<span class="t-rotulo">Claro</span></button>
  <button type="button" class="tema-op" role="radio" data-op="oscuro" data-set="tema:oscuro">${glifo('glifo-oscuro')}<span class="t-rotulo">Oscuro</span></button>
</div>`;

// §1: HeaderMarca, 72 px en MateriaSelect y en Home (14 + 44 + 14).
const headerMarca = (izquierda) => `
<header class="cab"><div class="col cab-fila"><div class="cab-izq">${izquierda}</div>${controlTema()}</div></header>`;

// §3: barra interna del Stack. `volver` falso para Results.
const barraInterna = (titulo, volver = true) => `
<header class="barra-int"><div class="col barra-int-fila">${
  volver ? `<button type="button" class="k7 btn-volver" aria-label="Volver">${glifo('glifo-volver')}</button>` : ''
}<h1 class="t-titulo c-tinta">${esc(titulo)}</h1></div></header>`;

const rotuloSeccion = (texto, extra = '') =>
  `<div class="col"><div class="t-rotulo c-acento sec-rotulo ${extra}">${esc(texto)}</div></div>`;

const bandaDe = (pct, cortes) =>
  pct >= cortes[0] ? 'alta' : pct >= cortes[1] ? 'media' : 'baja';
const BANDA = {
  alta: { clase: 'c-acierto', glifo: 'glifo-acierto', var: 'acierto' },
  media: { clase: 'c-inter', glifo: 'glifo-intermedia', var: 'intermedia' },
  baja: { clase: 'c-error', glifo: 'glifo-error', var: 'error' },
};

// ---------------------------------------------------------------------------
// Componentes de 1.3 compartidos entre pantallas
// (Banners.md, DonationBox.md, comun.md §12)
// ---------------------------------------------------------------------------

const CORREO_SOPORTE = 'pkappsoporte@gmail.com';
// Montos y versión: se leen del código, la ficha no copia los valores (DonationBox.md d.1, Settings.md d.1).
const MONTOS = /DONATION_AMOUNTS\s*=\s*\[([^\]]*)\]/
  .exec(fs.readFileSync(path.join(RAIZ, 'src/utils/mercadopago.js'), 'utf8'))[1]
  .split(',').map((s) => s.trim()).filter(Boolean);
const VERSION = JSON.parse(fs.readFileSync(path.join(RAIZ, 'app.json'), 'utf8')).expo.version;

// K7 de `paso 11` en la esquina superior derecha del cuerpo, a ras del marco.
const cerrarEsquina = (nombre, claseGlifo = 'c-sec') =>
  `<button type="button" class="k7 cerrar-esq" aria-label="${esc(nombre)}">${glifo('glifo-cerrar', claseGlifo)}</button>`;

// Banners.md a.2: nota de borde izquierdo `acento`; banco reducido y nota del creador son el
// mismo componente con otro rótulo y otro glifo.
function nota({ g, rotulo, parrafos, descartable = false, contacto = '' }) {
  return `
<aside class="nota${descartable ? ' nota-cerrable' : ''}">
  ${descartable ? cerrarEsquina('Cerrar nota') : ''}
  <div class="nota-rot t-rotulo c-acento">${glifo(g)}<span>${esc(rotulo)}</span></div>
  ${parrafos.map((p) => `<p class="t-cuerpo c-tinta">${esc(p)}</p>`).join('')}
  ${contacto}
</aside>`;
}

const notaCreador = () => nota({
  g: 'glifo-mensaje',
  rotulo: 'Una nota del creador',
  descartable: true,
  parrafos: ['¡Hola! Estoy sumando las materias que faltan (Digestivo, Renal y Endócrino, y Reproductor y Desarrollo) y dándole una lavada de cara a la página. Van llegando de a poco, ¡gracias por la paciencia!'],
});

// BAN-P1: el correo pasa a botón K2 de acento con `glifo-correo`, debajo del texto.
const bancoReducido = () => nota({
  g: 'glifo-banco-reducido',
  rotulo: 'Banco más reducido',
  parrafos: [
    'Esta materia tiene menos preguntas que las anteriores porque tuve acceso a menos prototipos de examen.',
    'Si tenés material para aportar, escribime a',
  ],
  contacto: `<button type="button" class="k2 k2-acento btn-contacto t-cuerpo-fuerte">${glifo('glifo-correo')}<span>${CORREO_SOPORTE}</span></button>`,
});

// DonationBox.md a.2: un solo aspecto para `DonationBox` (persistente, con regla corta) y
// `DonationPrompt` (descartable); `celebratoria` desde `DONATION_WARM_SCORE`.
//
// `version`: 'p5' es el pedido de donación aprobado, DON-P5 (DonationBox.md a.2, b, c): marco
// `acento` de `border-2`, encabezado en banda `acentoBanda` con título y descartar en `fondo`,
// cuerpo y pie en `acentoFondo`, montos K2 de acento con relleno `superficie`. 'vigente' es
// DON-P1, el aspecto anterior, que solo dibuja la figura 09 para compararlo. Mismo copy, mismos
// montos, mismo destino.
function donacion({ celebratoria = false, descartable = false, regla = false, version = 'p5' } = {}) {
  const titulo = celebratoria ? '¡Gran resultado!' : 'Ayuda a mantener esta aplicación';
  const texto = celebratoria
    ? 'Si pKapp te está ayudando a llegar al examen, dale una mano para mantenerla (no es de Udelar):'
    : 'Esta web NO ES DE UDELAR y se mantiene por donaciones. Para hacerla posible:';
  const p5 = version === 'p5';
  const tituloHtml = `${celebratoria ? glifo('glifo-trofeo', p5 ? 'c-fondo' : 'c-acierto') : ''}<span>${esc(titulo)}</span>`;
  const reglaHtml = regla ? '<div class="don-regla"></div>' : '';
  if (p5) {
    return `
${reglaHtml}
<section class="lam don don5${descartable ? ' don5-cerrable' : ''}">
  ${marcas}
  ${descartable ? cerrarEsquina('Cerrar', 'c-fondo') : ''}
  <div class="don5-enc"><h3 class="don5-tit t-item c-fondo">${tituloHtml}</h3></div>
  <div class="don5-cuerpo">
    <p class="t-cuerpo c-tinta don5-txt">${esc(texto)}</p>
    <div class="don5-montos">${MONTOS.map((m) => `<button type="button" class="k2 k2-acento monto t-dato">$${esc(m)}</button>`).join('')}</div>
  </div>
  <div class="don5-pie t-rotulo c-sec">Vía Mercado Pago</div>
</section>`;
  }
  return `
${reglaHtml}
<section class="lam don${descartable ? ' don-cerrable' : ''}">
  ${marcas}
  ${descartable ? cerrarEsquina('Cerrar') : ''}
  <h3 class="don-tit t-item c-tinta">${tituloHtml}</h3>
  <p class="t-cuerpo c-tinta don-txt">${esc(texto)}</p>
  <div class="don-montos">${MONTOS.map((m) => `<button type="button" class="k3 monto t-dato">$${esc(m)}</button>`).join('')}</div>
  <div class="t-rotulo c-sec don-pie">Vía Mercado Pago</div>
</section>`;
}

// comun.md §12.2 (PAR-P1, PAR-P2): una casilla por parcial, llena la de la pregunta. Color del
// contenedor (`currentColor`): nunca `acierto`, `error` ni `intermedia`.
const marcaParcial = (llena) =>
  `<span class="parc-mk" aria-hidden="true">${[0, 1].map((i) => `<i${i === llena ? ' class="on"' : ''}></i>`).join('')}</span>`;

function insigniaParcial(materia, parcial) {
  const parciales = materia.config?.parciales;
  const idx = parciales ? parciales.findIndex((p) => p.id === parcial) : -1;
  if (idx < 0) return '';
  return `<span class="parc t-rotulo c-tinta">${marcaParcial(idx)}<span>${esc(parciales[idx].label)}</span></span>`;
}

// ---------------------------------------------------------------------------
// 01 · MateriaSelect
// ---------------------------------------------------------------------------

function tarjetaMateria(m, estado = 'reposo') {
  const clases = { reposo: '', presionada: ' es-pres', foco: ' es-foco', cargando: '', nodisp: ' es-nodisp' }[estado];
  const conteo = estado === 'nodisp'
    ? '<span class="t-rotulo">Próximamente</span>'
    : estado === 'cargando'
      ? '<span class="t-rotulo c-sec">Cargando…</span>'
      : `<span class="t-rotulo-medio c-tinta">${m.preguntas}</span> <span class="t-rotulo c-sec">preguntas</span>`;
  return `
<button type="button" class="lam k6 tarj${clases}" aria-label="${esc(m.name)}"${estado === 'nodisp' ? ' disabled' : ''}>
  ${marcas}
  <span class="tarj-fila">
    <span class="tarj-ilu">${ilustracion(m.id, 48)}</span>
    <span class="tarj-txt"><span class="t-rotulo c-acento">${esc(m.idVisible)}</span><span class="t-item c-tinta">${esc(m.name)}</span></span>
  </span>
  <span class="tarj-caj"><span class="celda">${conteo}</span><span class="celda t-rotulo c-sec">Banco real</span></span>
</button>`;
}

function reglaSvg() {
  return `<svg aria-hidden="true" focusable="false" width="100%" height="9">
    <rect width="100%" height="9" fill="url(#regla-menor)"/><rect width="100%" height="9" fill="url(#regla-mayor)"/></svg>`;
}

// Lámina de marca (MateriaSelect.md a.2): campo de filamentos, regla graduada y cajetín.
function laminaMarca() {
  return `
<section class="lam lamina">
  ${marcas}
  <div class="campo">${campoSvg}</div>
  <div class="regla">${reglaSvg()}</div>
  <div class="cajetin">
    <span class="t-marca c-tinta">pKapp</span>
    <span class="cajetin-der t-rotulo c-sec">Tus materias de ESFUNO<br>Elegí una para empezar</span>
  </div>
</section>`;
}

function pantallaMateriaSelect() {
  return `
<div class="pantalla" data-pantalla="MateriaSelect">
  ${headerMarca('<span class="t-rotulo c-sec">ESFUNO</span>')}
  <div class="col mt-1_5 mb-3">${laminaMarca()}</div>
  <div class="col mb-3">${notaCreador()}</div>
  <div class="col mt-1_5"><div class="lista">${materias.map((m) => tarjetaMateria(m)).join('')}</div></div>
  <div class="col mt-6">${donacion({ regla: true })}</div>
  <div class="relleno-10"></div>
</div>`;
}

// Variante de componente: estados de la tarjeta de materia (ficha MateriaSelect, c).
function pantallaEstadosTarjeta() {
  const m = porId.cyr;
  const fila = (rotulo, estado) => `
<div class="estado"><div class="t-rotulo c-sec estado-rot">${rotulo}</div>${tarjetaMateria(m, estado)}</div>`;
  return `
<div class="pantalla" data-pantalla="EstadosTarjeta">
  <div class="col estados">
    ${fila('Reposo', 'reposo')}
    ${fila('Presionado · inversión total', 'presionada')}
    ${fila('Foco de teclado', 'foco')}
    ${fila('Cargando', 'cargando')}
    ${fila('No disponible · available en falso', 'nodisp')}
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// 02 · Home
// ---------------------------------------------------------------------------

// Piezas de Home (Home.md a.1 a a.3). La disposición de teléfono las apila (`pantallaHome`) y la de
// escritorio las reparte entre una región lateral y una principal (ESC-P2).
function homePartes(m) {
  const preguntas = PREGUNTAS[m.id];
  const reales = preguntas.filter((q) => q.source === 'exam').length;
  const extra = preguntas.filter((q) => q.source === 'generated').length;
  const tamExamen = Math.min(m.config?.examSize || 75, preguntas.length);

  const acciones = [
    { g: 'glifo-practicar', t: 'Entrena Temas/Parciales', d: 'Crea tu propio test eligiendo temas o practica para los parciales', primaria: true },
    { g: 'glifo-examen', t: 'Modo examen', d: `${tamExamen} preguntas al azar como en el parcial real` },
    { g: 'glifo-repasar', t: 'Repasar fallos', d: 'Preguntas que te costaron antes' },
    { g: 'glifo-estadisticas', t: 'Mis estadísticas', d: '% de aciertos por tema, preguntas falladas' },
    { g: 'glifo-agregar', t: 'Agregar pregunta', d: 'Agregá tus propias preguntas al banco' },
    { g: 'glifo-ajustes', t: 'Ajustes', d: 'Filtrar fuente, resetear estadísticas' },
  ];
  const accion = (a) => `
<button type="button" class="k3 accion${a.primaria ? ' prim' : ''}">
  <span class="ico">${glifo(a.g)}</span>
  <span class="accion-txt"><span class="t-item c-tinta">${esc(a.t)}</span><span class="t-detalle c-sec">${esc(a.d)}</span></span>
  ${glifo('glifo-chevron', 'c-sec')}
</button>`;

  return {
    cambiar: `<button type="button" class="k2 btn-cambiar t-cuerpo-fuerte c-tinta" aria-label="Cambiar materia">${glifo('glifo-volver')}<span>Cambiar materia</span></button>`,
    tarjeta: `
<section class="lam mat-card">
  ${marcas}
  <div class="mat-card-ilu">${ilustracion(m.id, 64)}</div>
  <div class="mat-card-txt">
    <span class="t-rotulo c-acento">${esc(m.idVisible)}</span>
    <span class="t-titulo c-tinta">${esc(m.name)}</span>
    <span class="t-detalle c-sec">${reales} preguntas reales · ${extra} preguntas extra</span>
  </div>
</section>`,
    banner: m.bancoReducido ? bancoReducido() : '',
    acciones: acciones.map(accion).join(''),
    privacidad: '<p class="t-detalle c-sec nota-web">Tus estadísticas y preguntas se guardan localmente en tu navegador.<br>Se usan analíticas anónimas (sin cookies ni datos personales).</p>',
  };
}

function pantallaHome(m) {
  const p = homePartes(m);
  return `
<div class="pantalla" data-pantalla="Home">
  ${headerMarca(p.cambiar)}
  <div class="col mt-1_5">${p.tarjeta}</div>
  ${p.banner ? `<div class="col mt-3">${p.banner}</div>` : ''}
  ${rotuloSeccion('Plano / Acciones', 'sec-4')}
  <div class="col"><div class="lista">${p.acciones}</div></div>
  <div class="col mt-6">${p.privacidad}</div>
  <div class="relleno-8"></div>
</div>`;
}

// ---------------------------------------------------------------------------
// 03 · TopicSelect
// ---------------------------------------------------------------------------

// `fuente`: índice del filtro de fuente seleccionado (0 «Todas», 1 «Solo preguntas reales»,
// 2 «Solo generadas»). PAR-P2: los filtros de parcial llevan la marca delante del texto.
function panelFiltros(m, { timer = 0, fuente = 0 } = {}) {
  const filtro = (txt, sel, marca = '') =>
    `<button type="button" class="k4 filtro ${sel ? 't-cuerpo-fuerte sel' : 't-cuerpo c-tinta'}" aria-pressed="${sel}">${marca}${marca ? `<span>${esc(txt)}</span>` : esc(txt)}</button>`;
  const parciales = m.config?.parciales;
  const grupoParcial = parciales ? `
    <div class="divisor"></div>
    <div class="grupo"><div class="t-rotulo c-sec grupo-rot">Parcial</div>
      <div class="filtros">${filtro('Examen', true)}${parciales.map((p, i) => filtro(p.label, false, marcaParcial(i))).join('')}</div></div>` : '';
  const sinLimite = timer === 0;
  const fuentes = ['Todas', 'Solo preguntas reales', 'Solo generadas'];
  return `
<section class="panel">
  <div class="grupo"><div class="t-rotulo c-sec grupo-rot">Fuente</div>
    <div class="filtros">${fuentes.map((t, i) => filtro(t, i === fuente)).join('')}</div></div>
  ${grupoParcial}
  <div class="divisor"></div>
  <div class="grupo"><div class="t-rotulo c-sec grupo-rot">Temporizador</div>
    <div class="timer">
      <button type="button" class="k5 cuadrado" aria-label="Menos tiempo"${sinLimite ? ' disabled' : ''}>${glifo('glifo-menos')}</button>
      <span class="t-cuerpo-fuerte c-tinta timer-valor">${sinLimite ? 'Sin límite' : timer + ' min'}</span>
      <button type="button" class="k5 cuadrado" aria-label="Más tiempo">${glifo('glifo-mas')}</button>
    </div></div>
</section>`;
}

// `modo`: 'practice', 'exam' o 'vacio' (V4 de Vacios.md: «Solo generadas» deja cero temas).
// `escritorio`: disposición de escritorio (ESC-P3): los tres grupos del panel de filtros en una
// fila, la mezcla a ancho de hoja y la lista de temas en columnas (o la tarjeta «Modo Examen»).
// Mismo orden de DOM y mismo orden vertical que en el teléfono.
function pantallaTopicSelect(m, modo, escritorio = false) {
  const conteo = conteoPorTema(m.id);
  const vacio = modo === 'vacio';
  const total = vacio ? 0 : conteo.total;
  const porTema = vacio ? new Map() : conteo.porTema;
  const filas = Object.entries(m.TOPICS)
    .filter(([k]) => (porTema.get(k) || 0) > 0)
    .map(([k, nombre], i) => `
<button type="button" class="k7 fila-tema">
  <span class="t-rotulo c-sec fila-idx">${pad2(i + 1)}</span>
  <span class="fila-nom"><span class="t-item c-tinta">${esc(nombre)}</span><span class="t-detalle c-sec">${porTema.get(k)} preguntas</span></span>
  ${glifo('glifo-chevron', 'c-sec')}
</button>`).join('');
  const mezcla = `
<button type="button" class="k6 mezcla">
  ${glifo('glifo-aleatorio', 'c-acento')}
  <span class="mezcla-txt"><span class="t-rotulo c-acento">Mezcla</span><span class="t-item c-tinta">Todos los temas mezclados</span><span class="t-detalle c-sec">${total} preguntas</span></span>
</button>`;
  const sinTemas = '<p class="t-cuerpo c-sec">No hay preguntas disponibles con los filtros actuales.</p>';
  const tam = Math.min(m.config?.examSize || 75, total);
  const examen = `
<section class="lam examen">
  ${marcas}
  <h2 class="t-titulo c-tinta">Modo Examen</h2>
  <p class="t-cuerpo c-sec examen-sorteo">Se sortean ${tam} preguntas al azar de todos los temas, como en el examen real.</p>
  <p class="t-cuerpo-fuerte c-acento examen-disp">Disponibles: ${total} preguntas</p>
  <button type="button" class="k1 btn-examen t-cuerpo-fuerte">Comenzar examen</button>
</section>`;
  const filtros = panelFiltros(m, { fuente: vacio ? 2 : 0 });

  if (escritorio) {
    const cuerpo = modo === 'exam'
      ? `<div class="col mt-4">${examen}</div>`
      : `<div class="col mt-4">${mezcla}</div>
${rotuloSeccion('O elegí un tema específico:', 'sec-4')}
${vacio ? `<div class="col">${sinTemas}</div>` : `<div class="col"><div class="lista-temas lista-cols">${filas}</div></div>`}`;
    return `
<div class="pantalla esc" data-pantalla="TopicSelect-${modo}" data-hoja="rej">
  ${barraInterna('pKapp · Elegir tema')}
  <div class="col mt-4">${filtros}</div>
  ${cuerpo}
  <div class="relleno-8"></div>
</div>`;
  }

  const cuerpo = modo === 'exam'
    ? `<div class="col">${examen}</div>`
    : `<div class="col">${mezcla}</div>
${rotuloSeccion('O elegí un tema específico:', 'sec-4')}
${vacio ? `<div class="col">${sinTemas}</div>` : `<div class="col"><div class="lista-temas">${filas}</div></div>`}`;
  return `
<div class="pantalla" data-pantalla="TopicSelect-${modo}">
  ${barraInterna('pKapp · Elegir tema')}
  <div class="col mt-4">${filtros}</div>
  ${cuerpo}
  <div class="relleno-8"></div>
</div>`;
}

// ---------------------------------------------------------------------------
// 04 · Quiz
// ---------------------------------------------------------------------------

function chipOrigen(origen, examen) {
  if (origen === 'exam') return `<span class="chip chip-examen t-rotulo">${glifo('glifo-origen-examen')}<span>${esc(examen)}</span></span>`;
  if (origen === 'generated') return `<span class="chip chip-generada t-rotulo">${glifo('glifo-origen-generada')}<span>Práctica</span></span>`;
  return `<span class="chip chip-propia t-rotulo">${glifo('glifo-origen-propia')}<span>Tuya</span></span>`;
}

// `sinFeedback`: quiz con `hideFeedback` (ExamenEnCurso.md): sin marcas de acierto o error,
// sin explicación ni correcta revelada; la elegida va rellena y las demás apagadas.
function pantallaQuiz(opts) {
  const { materia, pregunta, indice, total, respuesta = null, tiempo = null, alerta = false, sinFeedback = false } = opts;
  const respondida = respuesta !== null;
  const contador = `${pad2(indice + 1)} / ${total}`;

  const progreso = total <= 40
    ? `<div class="progreso" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${indice + 1}">${
        Array.from({ length: total }, (_, i) => `<i${i <= indice ? ' class="on"' : ''}></i>`).join('')}</div>`
    : `<div class="progreso-barra" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${indice + 1}"><i style="width:${(((indice + 1) / total) * 100).toFixed(2)}%"></i></div>`;

  const bloqueTiempo = tiempo === null ? '' :
    `<span class="tiempo t-rotulo-medio${alerta ? ' alerta' : ''}">${glifo('glifo-reloj')}<span>${tiempo}</span></span>`;

  const opciones = pregunta.options.map((texto, idx) => {
    const letra = String.fromCharCode(65 + idx);
    let clase = '';
    let estado = '';
    let tipo = 't-cuerpo';
    if (respondida && sinFeedback) {
      if (idx === respuesta) { clase = ' elegida'; tipo = 't-cuerpo-fuerte'; } else { clase = ' apagada'; }
    } else if (respondida) {
      if (idx === pregunta.correctIndex) {
        clase = ' ok'; tipo = 't-cuerpo-fuerte';
        estado = `<span class="op-estado t-rotulo c-acierto">${glifo('glifo-acierto')}<span>Correcta</span></span>`;
      } else if (idx === respuesta) {
        clase = ' mal';
        estado = `<span class="op-estado t-rotulo c-error">${glifo('glifo-error')}<span>Incorrecta · tu respuesta</span></span>`;
      } else {
        clase = ' apagada';
      }
    }
    return `
<button type="button" class="k3 opcion${clase}"${respondida ? ' disabled' : ''}>
  <span class="op-letra t-dato">${letra}</span>
  <span class="op-txt"><span class="${tipo} op-texto">${esc(texto)}</span>${estado}</span>
</button>`;
  }).join('');

  const tema = materia.TOPICS[pregunta.topic] || pregunta.topic;
  return `
<div class="pantalla quiz" data-pantalla="Quiz">
  <header class="q-barra"><div class="col q-barra-fila">
    <button type="button" class="k7 q-cerrar" aria-label="Salir">${glifo('glifo-cerrar')}</button>
    ${progreso}
    <div class="q-cont"><span class="t-rotulo c-tinta">${contador}</span>${bloqueTiempo}</div>
  </div></header>
  <div class="q-scroll">
    <div class="col q-ctx"><div class="q-ctx-izq">${pregunta.parcial ? insigniaParcial(materia, pregunta.parcial) : ''}${chipOrigen(pregunta.source, pregunta.exam)}</div><span class="t-rotulo c-sec q-meta">${esc(materia.shortName)} · ${esc(tema)}</span></div>
    <div class="col"><section class="q-enunciado"><div class="t-rotulo c-sec">Enunciado</div><p class="t-titulo c-tinta">${esc(pregunta.question)}</p></section></div>
    <div class="col"><div class="q-opciones">${opciones}</div></div>
    ${respondida && sinFeedback ? `
    <div class="col"><p class="q-oculto t-rotulo c-sec">Resultado oculto hasta el final</p></div>` : ''}
    ${respondida && !sinFeedback ? `
    <div class="col"><aside class="q-nota"><div class="q-nota-rot t-rotulo c-acento">${glifo('glifo-explicacion')}<span>Nota / Explicación</span></div><p class="t-cuerpo c-tinta">${esc(pregunta.explanation)}</p></aside></div>` : ''}
    ${respondida ? `
    <div class="col q-reportar"><button type="button" class="k3 btn-reportar t-cuerpo-fuerte c-tinta">${glifo('glifo-reportar')}<span>Reportar pregunta</span></button></div>` : ''}
  </div>
  ${respondida ? `
  <footer class="q-inf"><div class="col"><button type="button" class="k1 q-sig t-cuerpo-fuerte"><span>Siguiente</span>${glifo('glifo-siguiente')}</button></div></footer>` : ''}
</div>`;
}

// Variante de componente: chips de origen (ficha Quiz, c.3).
function pantallaOrigen() {
  const fila = (rotulo, origen, nombre) => `
<div class="estado"><div class="t-rotulo c-sec estado-rot">${rotulo}</div>${chipOrigen(origen, nombre)}</div>`;
  return `
<div class="pantalla" data-pantalla="Origen">
  <div class="col estados">
    ${fila("Examen real · source 'exam'", 'exam', 'PROTOTIPO 1')}
    ${fila("Generada · source 'generated'", 'generated')}
    ${fila("Propia · source 'user'", 'user')}
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// 05 · Results
// ---------------------------------------------------------------------------

// getResultFeedback (ResultsScreen.js): cortes 90, 75, 60 y 50. Copy de la ficha (RESULTS-P2).
function feedback(pct) {
  if (pct >= 90) return { banda: 'alta', msg: '¡Excelente!.' };
  if (pct >= 75) return { banda: 'alta', msg: 'Muy bien. Vas por buen camino.' };
  if (pct >= 60) return { banda: 'media', msg: 'A repasar solo un poco más.' };
  if (pct >= 50) return { banda: 'media', msg: 'Seguí mejorando.' };
  return { banda: 'baja', msg: 'A estudiar fuerte. Vos podés.' };
}

// Trío de resultados y botones de Results (Results.md a.2): la figura 09 los reutiliza para
// mostrar el pedido de donación en su lugar, entre el trío y los botones.
function trioResults(correctas, total) {
  return `
<section class="lam trio">
  ${marcas}
  <div class="trio-celda"><span class="t-cifra c-acierto">${correctas}</span><span class="t-rotulo c-sec trio-rot">${glifo('glifo-acierto')}Correctas</span></div>
  <div class="trio-celda"><span class="t-cifra c-error">${total - correctas}</span><span class="t-rotulo c-sec trio-rot">${glifo('glifo-error')}Incorrectas</span></div>
  <div class="trio-celda"><span class="t-cifra c-tinta">${total}</span><span class="t-rotulo c-sec trio-rot">Total</span></div>
</section>`;
}

function botonesResults() {
  return `
<div class="botones">
  <button type="button" class="k2 k2-acento btn-res t-cuerpo-fuerte">${glifo('glifo-revisar')}<span>Revisar todas las respuestas</span></button>
  <button type="button" class="k1 btn-res t-cuerpo-fuerte">${glifo('glifo-reintentar')}<span>Volver a practicar</span></button>
  <button type="button" class="k2 btn-res t-cuerpo-fuerte c-tinta">${glifo('glifo-inicio')}<span>Inicio</span></button>
</div>`;
}

// Tarjeta de resultado (Results.md a.2). La reutiliza la disposición de escritorio (ESC-P5).
function tarjetaResultado({ respuestas, topic }) {
  const total = respuestas.length;
  const correctas = respuestas.filter(Boolean).length;
  const pct = total ? Math.round((correctas / total) * 100) : 0;
  const { banda, msg } = feedback(pct);
  const b = BANDA[banda];
  const tira = total <= 40 ? `
    <div class="tira" role="img" aria-label="Detalle por pregunta">${respuestas.map((ok) => `<i class="${ok ? 'c' : 'i'}"></i>`).join('')}</div>
    <div class="leyenda t-rotulo c-sec"><span><i class="sw sw-c"></i>Correcta</span><span><i class="sw sw-i"></i>Incorrecta</span></div>` : '';
  return `
<section class="lam res">
  ${marcas}
  <div class="t-rotulo c-sec res-rot">Resultado</div>
  <div class="res-pct ${b.clase}">${glifo(b.glifo, '', 24)}<span class="t-display">${pct}%</span></div>
  <div class="t-titulo c-tinta res-sub">${correctas} de ${total} correctas</div>
  <div class="t-cuerpo c-sec res-msg">${esc(msg)}</div>
  ${tira}
  <span class="chip chip-tema t-rotulo">${esc(topic)}</span>
</section>`;
}

// `pedido`: 'normal' | 'celebratoria' | null (sin pedido de donación: menos de DONATION_MIN_SCORE
// o no le toca por el 1 de cada 3).
function pantallaResults({ respuestas, topic, pedido = null }) {
  const total = respuestas.length;
  const correctas = respuestas.filter(Boolean).length;
  return `
<div class="pantalla" data-pantalla="Results">
  ${barraInterna('pKapp · Resultados', false)}
  <div class="col mt-4 mb-3">${tarjetaResultado({ respuestas, topic })}</div>
  <div class="col mb-3">${trioResults(correctas, total)}</div>
  ${pedido ? `<div class="col mb-3">${donacion({ celebratoria: pedido === 'celebratoria', descartable: true })}</div>` : ''}
  <div class="col mt-1_5">${botonesResults()}</div>
  <div class="relleno-8"></div>
</div>`;
}

// ---------------------------------------------------------------------------
// 06 · Stats
// ---------------------------------------------------------------------------

// Datos de muestra: no hay base local en la maqueta. Cada tema: [respuestas, aciertos].
// Los conteos de preguntas disponibles salen del banco real.
const STATS_MUESTRA = {
  'fisiologia-cardiaca': [17, 15],
  'electrocardiografia': [0, 0],
  'hemodinamia': [12, 9],
  'circulacion-regional': [11, 9],
  'mecanica-ventilatoria': [14, 10],
  'intercambio-gaseoso': [10, 5],
  'control-respiracion': [6, 4],
  'histologia-cyr': [13, 6],
};
// Más falladas de muestra: [índice de pregunta en el banco real de CyR, respuestas, aciertos].
const FALLADAS_MUESTRA = [
  ['histologia-cyr', 0, 3, 0],
  ['histologia-cyr', 1, 4, 1],
  ['intercambio-gaseoso', 0, 3, 1],
  ['control-respiracion', 0, 5, 2],
  ['intercambio-gaseoso', 1, 6, 3],
  ['mecanica-ventilatoria', 0, 3, 2],
  ['hemodinamia', 0, 4, 3],
  ['fisiologia-cardiaca', 0, 5, 4],
];

// Piezas de Stats (Stats.md a.2 a a.4). La disposición de teléfono las apila (`pantallaStats`) y la
// de escritorio las reparte entre regiones (ESC-P7); el orden de DOM es el mismo.
function statsPartes(m) {
  const { porTema } = conteoPorTema(m.id);
  const CORTES = [80, 60];
  const filas = [];
  let totalRespuestas = 0;
  let totalAciertos = 0;
  for (const [clave, nombre] of Object.entries(m.TOPICS)) {
    const t = porTema.get(clave) || 0;
    if (t === 0) continue;
    const [a, c] = STATS_MUESTRA[clave] || [0, 0];
    totalRespuestas += a;
    totalAciertos += c;
    if (a === 0) {
      filas.push(`
<div class="s-fila">
  <div class="s-enc"><span class="t-item c-tinta">${esc(nombre)}</span><span class="t-detalle c-sec s-sin">Sin practicar</span></div>
  <div class="t-detalle c-sec s-det">${t} preguntas disponibles</div>
</div>`);
      continue;
    }
    const pct = Math.round((c / a) * 100);
    const b = BANDA[bandaDe(pct, CORTES)];
    filas.push(`
<div class="s-fila">
  <div class="s-enc"><span class="t-item c-tinta">${esc(nombre)}</span>
    <span class="s-valor ${b.clase}">${glifo(b.glifo)}<span class="t-dato">${pct}%</span></span></div>
  <div class="pista"><i class="relleno" style="width:${pct}%;background:var(--${b.var})"></i><u class="marca-u" style="left:60%"></u><u class="marca-u" style="left:80%"></u></div>
  <div class="t-detalle c-sec s-det">${c} aciertos en ${a} respuestas · ${t} preguntas disponibles</div>
</div>`);
  }
  const pctGlobal = totalRespuestas ? Math.round((totalAciertos / totalRespuestas) * 100) : 0;
  const bg = BANDA[bandaDe(pctGlobal, CORTES)];

  const falladas = FALLADAS_MUESTRA.map(([tema, k, a, c], i) => {
    const q = PREGUNTAS[m.id].filter((x) => x.topic === tema)[k];
    const pct = Math.round((c / a) * 100);
    const b = BANDA[bandaDe(pct, CORTES)];
    return `
<div class="f-fila">
  <div class="f-enc"><span class="t-rotulo c-sec">#${i + 1}</span>
    <span class="s-valor ${b.clase}">${glifo(b.glifo)}<span class="t-rotulo-medio">${pct}% (${c}/${a})</span></span></div>
  <p class="t-cuerpo c-tinta f-enun">${esc(q.question)}</p>
  <p class="t-detalle c-sec f-tema">${esc(m.TOPICS[q.topic] || q.topic)}</p>
</div>`;
  }).join('');

  const item = (b, txt) => `<span class="ley-item ${b.clase}">${glifo(b.glifo)}<span class="t-rotulo c-sec">${txt}</span></span>`;
  return {
    global: `
<section class="lam glob">
  ${marcas}
  <div class="glob-rot ${bg.clase}">${glifo(bg.glifo)}<span class="t-rotulo c-sec">Aciertos globales</span></div>
  <div class="t-display glob-pct ${bg.clase}">${pctGlobal}%</div>
  <div class="t-cuerpo c-sec glob-det">${totalAciertos} aciertos de ${totalRespuestas} respuestas</div>
</section>`,
    leyenda: `<div class="leyenda-bandas">${item(BANDA.alta, '≥ 80 %')}${item(BANDA.media, '60–79 %')}${item(BANDA.baja, '&lt; 60 %')}</div>`,
    filas: filas.join(''),
    falladas,
  };
}

function pantallaStats(m) {
  const p = statsPartes(m);
  return `
<div class="pantalla" data-pantalla="Stats">
  ${barraInterna('pKapp · Estadísticas')}
  <div class="col mt-4 mb-3">${p.global}</div>
  ${rotuloSeccion('Por tema', 'sec-4')}
  <div class="col">${p.leyenda}</div>
  <div class="col"><div class="s-filas">${p.filas}</div></div>
  ${rotuloSeccion('Más falladas', 'sec-6')}
  <div class="col"><div class="f-filas">${p.falladas}</div></div>
  <div class="relleno-8"></div>
</div>`;
}

// ---------------------------------------------------------------------------
// 07 · AddQuestion (AddQuestion.md)
// ---------------------------------------------------------------------------

// `datos`: null (formulario inicial) o { tema, enunciado, opciones, correcta, explicacion,
// guardando }. Con 6 opciones «Agregar opción» no se muestra.
// Los grupos del formulario (AddQuestion.md a.1, bloques 2 a 6) se arman aparte. En escritorio el
// formulario va en una columna `lectura`, como el quiz (ESC-P9, rechazada: sin segunda columna).
// `abierto`: el selector de tema muestra su lámina (ADD-P3).
// Selector de tema (AddQuestion.md a.2, ADD-P3): disparador K3 y, abierto, lámina con filas K7.
// Lista plana: el parcial de cada tema todavía no es un dato (AddQuestion.md d.1).
function selectorTema(m, tema, { abierto = false, deshabilitado = false } = {}) {
  const nombre = m.TOPICS[tema] ?? 'Elegí un tema';
  const claves = Object.keys(m.TOPICS);
  const filas = Object.entries(m.TOPICS).map(([k, n], i) => {
    const elegida = k === tema;
    return `<button type="button" class="k7 desp-fila ${elegida ? 'sel t-cuerpo-fuerte' : 't-cuerpo c-tinta'}${i === claves.length - 1 ? ' ult' : ''}" role="option" aria-selected="${elegida}">${esc(n)}</button>`;
  }).join('');
  return `
<button type="button" class="k3 desp-disp${abierto ? ' abierto' : ''}" aria-haspopup="listbox" aria-expanded="${abierto}" aria-label="Tema: ${esc(nombre)}"${deshabilitado ? ' disabled' : ''}>
  <span class="t-cuerpo desp-nombre">${esc(nombre)}</span>${glifo('glifo-chevron', `c-sec ${abierto ? 'g-gira-arriba' : 'g-gira-abajo'}`)}
</button>${abierto ? `
<div class="lam desp-lam"><div class="desp-lista" role="listbox" aria-label="Tema">${filas}</div>${marcas}</div>` : ''}`;
}

function addPartes(m, datos = null) {
  const d = datos ?? {
    tema: Object.keys(m.TOPICS)[0], enunciado: '', opciones: ['', '', '', ''],
    correcta: null, explicacion: '', guardando: false,
  };
  const campo = (texto, ayuda, extra = '') => `
<div class="fld ${extra} ${texto ? 't-campo c-tinta' : 't-campo c-sec'}" role="textbox" aria-multiline="${extra.includes('fld-multi')}">${esc(texto || ayuda)}</div>`;
  const grupo = (rotulo, cuerpo, ultimo = false) => `
<div class="col${ultimo ? '' : ' add-grupo'}"><div class="t-rotulo c-sec add-rot">${esc(rotulo)}</div>${cuerpo}</div>`;

  const filas = d.opciones.map((texto, i) => {
    const letra = String.fromCharCode(65 + i);
    const marcada = d.correcta === i;
    return `
<div class="op-fila">
  <button type="button" class="k3 letra-k t-dato${marcada ? ' ok' : ''}" aria-label="Opción ${letra}, marcar como correcta" aria-pressed="${marcada}">${marcada ? glifo('glifo-acierto') : letra}</button>
  ${campo(texto, `Opción ${letra}`, 'fld-op')}
  <button type="button" class="k7 quitar" aria-label="Quitar opción ${letra}">${glifo('glifo-cerrar', 'c-sec')}</button>
</div>`;
  }).join('');

  const agregar = d.opciones.length < 6
    ? `<button type="button" class="k3 add-agregar t-cuerpo-fuerte">${glifo('glifo-mas')}<span>Agregar opción</span></button>` : '';
  const guardar = d.guardando
    ? '<button type="button" class="k1 add-guardar guardando t-cuerpo-fuerte" disabled>Guardando...</button>'
    : `<button type="button" class="k1 add-guardar t-cuerpo-fuerte">${glifo('glifo-guardar')}<span>Guardar pregunta</span></button>`;

  return {
    tema: grupo('Tema', selectorTema(m, d.tema, { abierto: !!d.abierto && !d.guardando, deshabilitado: d.guardando })),
    enunciado: grupo('Enunciado de la pregunta', campo(d.enunciado, 'Escribí la pregunta acá...', 'fld-multi')),
    opciones: grupo('Opciones de respuesta', `
    <p class="t-detalle c-sec add-ayuda"><span>Marcá con</span><span class="c-acierto">${glifo('glifo-acierto')}</span><span>cuál es la correcta</span></p>
    ${filas}${agregar}`),
    explicacion: grupo('Explicación (opcional)', campo(d.explicacion, 'Explicación que se mostrará después de responder...', 'fld-multi')),
    guardar: `<div class="col">${guardar}</div>`,
  };
}

function pantallaAddQuestion(m, datos = null) {
  const p = addPartes(m, datos);
  return `
<div class="pantalla" data-pantalla="AddQuestion">
  ${barraInterna('pKapp · Agregar pregunta')}
  <div class="mt-4"></div>
  ${p.tema}
  ${p.enunciado}
  ${p.opciones}
  ${p.explicacion}
  ${p.guardar}
  <div class="relleno-8"></div>
</div>`;
}

// ---------------------------------------------------------------------------
// 08 · Settings (Settings.md) y V3 de Vacios.md
// ---------------------------------------------------------------------------

function plegable(nombre, abierto, cuerpo) {
  return `
<button type="button" class="k3 pleg${abierto ? ' abierto' : ''}" aria-expanded="${abierto}">
  <span class="t-item c-tinta">${esc(nombre)}</span>
  <span class="pleg-der"><span class="t-cuerpo-fuerte c-acento">${abierto ? 'Ocultar' : 'Ver'}</span>${glifo('glifo-chevron', `c-acento ${abierto ? 'g-gira-arriba' : 'g-gira-abajo'}`)}</span>
</button>
${abierto ? `<div class="set-cuerpo">${cuerpo}</div>` : ''}`;
}

// `propias`: preguntas propias de muestra; `abiertos`: { preguntas, datos }; `ocultar`: hideFeedback.
// Devuelve los cuerpos de las cuatro secciones y `seccion`: la disposición de teléfono los apila
// (`pantallaSettings`) y la de escritorio pasa «Acerca de» a una región lateral derecha (ESC-P8).
function settingsPartes(m, { propias = [], abiertos = {}, ocultar = false } = {}) {
  const generadas = PREGUNTAS[m.id].filter((q) => q.source === 'generated').length;
  const examenes = PREGUNTAS[m.id].filter((q) => q.source === 'exam').length;
  const tuyas = propias.length;

  const seccion = (rotulo, cuerpo, clase) => `
<div class="col ${clase}"><div class="t-rotulo c-acento sec-rotulo">${esc(rotulo)}</div>${cuerpo}</div>`;

  const opcion = (txt, sel) =>
    `<button type="button" class="k4 t-rotulo ${sel ? 'sel' : 'c-tinta'}" role="radio" aria-checked="${sel}">${txt}</button>`;
  const cuestionario = `
<div class="set-panel set-fila">
  <div class="set-txt"><div class="t-item c-tinta">Ocultar resultado hasta el final</div><div class="t-detalle c-sec">Respondé sin ver si acertás. Al terminar, revisás todo junto.</div></div>
  <div class="seg-no" role="radiogroup" aria-label="Ocultar resultado hasta el final">${opcion('No', !ocultar)}${opcion('Sí', ocultar)}</div>
</div>`;

  const tarjeta = (q) => `
<article class="pq">
  <div class="pq-enc"><span class="t-rotulo c-acento">${esc(m.TOPICS[q.topic] || q.topic)}</span>
    <button type="button" class="k7 pq-del" aria-label="Eliminar pregunta">${glifo('glifo-eliminar', 'c-sec')}</button></div>
  <p class="t-cuerpo c-tinta pq-enun">${esc(q.question)}</p>
  <p class="t-detalle c-acierto pq-ok">${glifo('glifo-acierto')}<span>${esc(q.options[q.correctIndex])}</span></p>
</article>`;
  const vacioPropias = `
<div class="set-panel vac-compacto">
  <p class="t-detalle c-sec">No agregaste preguntas todavía. Usá "Agregar pregunta" en el menú principal.</p>
  <button type="button" class="k2 vac-btn t-cuerpo-fuerte">Agregar pregunta</button>
</div>`;
  const nombrePropias = `${tuyas} ${tuyas === 1 ? 'pregunta propia' : 'preguntas propias'}`;
  const cuerpoPropias = tuyas === 0 ? vacioPropias : `<div class="pq-lista">${propias.map(tarjeta).join('')}</div>`;

  const cuerpoDatos = `
<div class="set-panel">
  <p class="t-detalle c-sec set-resp">Descargá un respaldo de tu progreso para no perderlo o pasarlo a otro dispositivo.</p>
  <div class="set-botones">
    <button type="button" class="k3 btn-set t-cuerpo-fuerte">${glifo('glifo-guardar')}<span>Descargar respaldo</span></button>
    <button type="button" class="k1 btn-set t-cuerpo-fuerte">${glifo('glifo-importar')}<span>Importar respaldo</span></button>
  </div>
  <div class="divisor set-div"></div>
  <button type="button" class="k2 k2-peligro btn-set t-cuerpo-fuerte">Resetear estadísticas</button>
</div>`;

  const acerca = `
<div class="set-panel">
  <div class="acerca-fila"><span><span class="t-item c-tinta">pKapp</span> <span class="t-rotulo-medio c-sec">v${esc(VERSION)}</span></span><span class="t-detalle c-sec">Preparación para ESFUNO</span></div>
  <div class="acerca-franja">
    <div class="acerca-fila"><span class="t-rotulo c-sec">Banco de ${esc(m.name)}</span><span class="t-dato c-tinta">${examenes + generadas + tuyas}</span></div>
    <div class="t-detalle c-sec acerca-des">${examenes} de exámenes · ${generadas} generadas · ${tuyas} tuyas</div>
  </div>
  <div class="acerca-franja acerca-enlaces">
    <button type="button" class="k2 k2-acento btn-enlace t-cuerpo-fuerte">${glifo('glifo-correo')}<span>Reportar un error</span></button>
    <button type="button" class="k2 k2-acento btn-enlace t-cuerpo-fuerte"><span>Código fuente</span>${glifo('glifo-externo')}</button>
  </div>
</div>`;

  return {
    seccion,
    cuestionario,
    preguntas: plegable(nombrePropias, !!abiertos.preguntas, cuerpoPropias),
    datos: plegable('Respaldo y reseteo', !!abiertos.datos, cuerpoDatos),
    acerca,
  };
}

function pantallaSettings(m, opts = {}) {
  const p = settingsPartes(m, opts);
  return `
<div class="pantalla" data-pantalla="Settings">
  ${barraInterna('pKapp · Ajustes')}
  ${p.seccion('Cuestionario', p.cuestionario, 'mt-4 set-sec')}
  ${p.seccion('Mis preguntas', p.preguntas, 'set-sec')}
  ${p.seccion('Tus datos', p.datos, 'set-sec')}
  ${p.seccion('Acerca de', p.acerca, '')}
  <div class="relleno-8"></div>
</div>`;
}

// ---------------------------------------------------------------------------
// 10 · Revisión de respuestas (Revision.md)
// ---------------------------------------------------------------------------

// `respuestas`: [{ pregunta, ok, elegida }] en orden de respuesta. Con `soloIncorrectas`
// (REV-P1) se listan las falladas con su número original. Devuelve las piezas: la disposición de
// teléfono las apila (`pantallaRevision`) y la de escritorio las reparte en dos regiones (ESC-P6).
function revisionPartes(m, respuestas, { soloIncorrectas = false } = {}) {
  const total = respuestas.length;
  const correctas = respuestas.filter((r) => r.ok).length;
  const pct = Math.round((correctas / total) * 100);
  const lista = respuestas.map((r, i) => ({ ...r, n: i + 1 })).filter((r) => !soloIncorrectas || !r.ok);

  const tarjeta = (r) => {
    const q = r.pregunta;
    const est = r.ok
      ? { clase: 'c-acierto', g: 'glifo-acierto', t: 'Correcta', marco: 'ok' }
      : { clase: 'c-error', g: 'glifo-error', t: 'Incorrecta', marco: 'mal' };
    const filas = q.options.map((texto, idx) => {
      let clase = ' apagada';
      let tipo = 't-cuerpo c-sec';
      let linea = '';
      if (idx === q.correctIndex) {
        clase = ' ok'; tipo = 't-cuerpo-fuerte c-tinta';
        linea = `<span class="op-estado t-rotulo c-acierto">${glifo('glifo-acierto')}<span>Correcta</span></span>`;
      } else if (idx === r.elegida && !r.ok) {
        clase = ' mal'; tipo = 't-cuerpo c-tinta';
        linea = `<span class="op-estado t-rotulo c-error">${glifo('glifo-error')}<span>Incorrecta · tu respuesta</span></span>`;
      }
      return `
<div class="r-op${clase}"><span class="op-letra t-dato">${String.fromCharCode(65 + idx)}</span><span class="op-txt"><span class="${tipo}">${esc(texto)}</span>${linea}</span></div>`;
    }).join('');
    return `
<article class="r-card ${est.marco}">
  <div class="r-enc"><span class="t-rotulo c-sec">#${r.n}</span><span class="s-valor ${est.clase}">${glifo(est.g)}<span class="t-rotulo">${est.t}</span></span></div>
  <p class="t-cuerpo c-tinta r-enun">${esc(q.question)}</p>
  <div class="r-opts">${filas}</div>
  ${q.explanation ? `<aside class="q-nota"><div class="q-nota-rot t-rotulo c-acento">${glifo('glifo-explicacion')}<span>Nota / Explicación</span></div><p class="t-cuerpo c-tinta">${esc(q.explanation)}</p></aside>` : ''}
  <button type="button" class="k7 r-rep t-cuerpo-fuerte c-tinta">${glifo('glifo-reportar')}<span>Reportar pregunta</span></button>
</article>`;
  };

  const filtro = correctas < total ? `
<div class="r-filtro" role="radiogroup" aria-label="Mostrar">
  <button type="button" class="k4 filtro ${soloIncorrectas ? 't-cuerpo c-tinta' : 't-cuerpo-fuerte sel'}" role="radio" aria-checked="${!soloIncorrectas}">Todas</button>
  <button type="button" class="k4 filtro ${soloIncorrectas ? 't-cuerpo-fuerte sel' : 't-cuerpo c-tinta'}" role="radio" aria-checked="${soloIncorrectas}">Incorrectas</button>
</div>` : '';

  return {
    encabezado: `<h2 class="t-titulo c-tinta">Revisión completa</h2><p class="t-cuerpo c-sec r-resumen">${correctas} / ${total} aciertos (${pct}%)</p>`,
    volver: `<button type="button" class="k2 btn-cambiar t-cuerpo-fuerte c-tinta">${glifo('glifo-volver')}<span>Volver</span></button>`,
    filtro,
    lista: lista.map(tarjeta).join(''),
    finales: `<div class="r-final">
    <button type="button" class="k2 btn-res t-cuerpo-fuerte c-tinta">${glifo('glifo-volver')}<span>Volver</span></button>
    <button type="button" class="k1 btn-res t-cuerpo-fuerte">Inicio</button>
  </div>`,
  };
}

function pantallaRevision(m, respuestas, opts = {}) {
  const p = revisionPartes(m, respuestas, opts);
  return `
<div class="pantalla" data-pantalla="Revision">
  ${barraInterna('pKapp · Resultados', false)}
  <div class="col mt-4 mb-3">${p.encabezado}</div>
  <div class="col mb-3">${p.volver}</div>
  ${p.filtro ? `<div class="col mb-3">${p.filtro}</div>` : ''}
  <div class="col"><div class="r-lista">${p.lista}</div></div>
  <div class="col mt-4">${p.finales}</div>
  <div class="relleno-8"></div>
</div>`;
}

// ---------------------------------------------------------------------------
// 12 · Estados vacíos (Vacios.md): V1 y V2 como lámina vacía
// ---------------------------------------------------------------------------

// `escritorio`: la barra interna conserva la hoja de su pantalla (la del estado con datos, para que
// no salte al llegar los datos) y la lámina vacía va en una columna `lectura` centrada (ESC-P12).
function pantallaVacioLamina({ barra, glifoId, titulo, texto, escritorio = false }) {
  return `
<div class="pantalla${escritorio ? ' esc' : ''}" data-pantalla="Vacio"${escritorio ? ' data-hoja="rej"' : ''}>
  ${barraInterna(barra)}
  <div class="col${escritorio ? ' col-lec' : ''} mt-6"><section class="lam vac">
    ${marcas}
    ${glifo(glifoId, 'g-vacio c-sec', 48)}
    <h2 class="t-titulo c-tinta vac-tit">${esc(titulo)}</h2>
    <p class="t-cuerpo c-sec vac-txt">${esc(texto)}</p>
    <button type="button" class="k2 vac-btn t-cuerpo-fuerte">Practicar</button>
  </section></div>${escritorio ? '\n  <div class="relleno-8"></div>' : ''}
</div>`;
}

// ---------------------------------------------------------------------------
// Variantes de componente de 1.3: pedido de donación, avisos, marca de parcial
// ---------------------------------------------------------------------------

// Figura 09: DON-P1, el aspecto anterior del pedido de donación, y DON-P5, el aprobado (usuario,
// 2026-10-11), lado a lado. Cada columna dibuja la variante celebratoria sola y las otras dos en
// su contexto: MateriaSelect (persistente, tras la regla corta, bajo una tarjeta de materia) y
// Results de 60 a 79 % (descartable, entre el trío y los botones), para ver cómo se lee frente a
// sus vecinos y frente a «Volver a practicar».
function pantallaDonacion() {
  const rotulo = (texto) => `<div class="col don-rot"><div class="t-rotulo c-sec">${texto}</div></div>`;
  const aviso = '<div class="col"><p class="comp-aviso t-detalle c-tinta">'
    + '<span class="av-claro">Claro: la banda (5,40:1 contra la página) pesa un tercio de «Volver a practicar» (16,32:1): no compite.</span>'
    + '<span class="av-oscuro">Oscuro: la banda baja de 9,48:1 a 5,40:1 (acentoBanda), el mismo peso que en claro: un tercio de «Volver a practicar» (15,97:1). Ya no compite.</span>'
    + '</p></div>';
  const panel = (version) => `
<div class="pantalla" data-pantalla="Donacion" data-version="${version}">
  ${rotulo('Celebratoria · descartable (Results, desde 80 %)')}
  <div class="col">${donacion({ celebratoria: true, descartable: true, version })}</div>
  ${rotulo('En contexto · MateriaSelect: persistente, con regla corta')}
  <div class="col"><div class="lista">${tarjetaMateria(porId.cyr)}</div></div>
  <div class="col mt-6">${donacion({ regla: true, version })}</div>
  ${rotulo('En contexto · Results de 60 a 79 %: descartable, entre el trío y los botones')}
  ${version === 'p5' ? aviso : ''}
  <div class="col mb-3">${trioResults(15, 24)}</div>
  <div class="col mb-3">${donacion({ descartable: true, version })}</div>
  <div class="col mt-1_5">${botonesResults()}</div>
  <div class="relleno-8"></div>
</div>`;
  const columnas = [
    ['vigente', 'Antes · DON-P1'],
    ['p5', 'DON-P5 · aprobada (usuario, 2026-10-11) · tokens nuevos, pendientes: acentoFondo y acentoBanda'],
  ];
  return `
<div class="comparacion">
${columnas.map(([version, titulo]) => `  <div class="comp-col"><div class="comp-tit t-rotulo-medio c-tinta">${titulo}</div>${panel(version)}</div>`).join('\n')}
</div>`;
}

function pantallaAvisos() {
  const fila = (rotulo, html) => `
<div class="estado"><div class="t-rotulo c-sec estado-rot">${rotulo}</div>${html}</div>`;
  return `
<div class="pantalla" data-pantalla="Avisos">
  <div class="col estados">
    ${fila('Banner de banco reducido · Home, sin descartar', bancoReducido())}
    ${fila('Nota del creador · MateriaSelect, descartable', notaCreador())}
    ${fila('Nota de privacidad · Home, solo web', '<p class="t-detalle c-sec nota-web">Tus estadísticas y preguntas se guardan localmente en tu navegador.<br>Se usan analíticas anónimas (sin cookies ni datos personales).</p>')}
  </div>
</div>`;
}

function pantallaParcial(m) {
  const fila = (rotulo, html, clase = '') => `
<div class="estado"><div class="t-rotulo c-sec estado-rot">${rotulo}</div><div class="parc-caja ${clase}">${html}</div></div>`;
  const [p1, p2] = m.config.parciales;
  const filtro = (txt, sel, marca) =>
    `<span class="k4 filtro ${sel ? 't-cuerpo-fuerte sel' : 't-cuerpo c-tinta'}">${marca}<span>${esc(txt)}</span></span>`;
  return `
<div class="pantalla" data-pantalla="Parcial">
  <div class="col estados">
    ${fila(`Insignia · ${p1.label} (pregunta con parcial 'primero')`, insigniaParcial(m, 'primero'))}
    ${fila(`Insignia · ${p2.label} (pregunta con parcial 'segundo')`, insigniaParcial(m, 'segundo'))}
    ${fila('Filtro de parcial · en reposo', filtro(p1.label, false, marcaParcial(0)))}
    ${fila('Filtro de parcial · seleccionado', filtro(p2.label, true, marcaParcial(1)))}
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// 14 · Inventario de glifos (comun.md §9)
// ---------------------------------------------------------------------------

function pantallaGlifos() {
  const grupo = (rotulo, tam) => `
<div class="t-rotulo c-sec gl-rot">${rotulo}</div>
<div class="gl-grid">${GLIFOS.filter(([, t]) => t === tam).map(([id]) => `
  <div class="gl-celda"><span class="gl-dib">${glifo(id)}</span><span class="t-rotulo c-tinta">${esc(id.replace(/^glifo-/, ''))}</span></div>`).join('')}</div>`;
  return `
<div class="pantalla" data-pantalla="Glifos">
  <div class="col estados">
    ${grupo(`Grandes · paso 6 · ${GLIFOS.filter(([, t]) => t === 'grande').length}`, 'grande')}
    ${grupo(`Chicos · paso 4 · ${GLIFOS.filter(([, t]) => t === 'chico').length}`, 'chico')}
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// Escritorio (tarea 3.10): ESC-P0 a ESC-P8 y ESC-P10 a ESC-P12, aprobadas por el usuario el
// 2026-10-11; ESC-P9, rechazada (comun.md §7.2, tokens.md c.4). Figuras E01 a E10, visibles solo a
// 1366 y 1920 px.
// ---------------------------------------------------------------------------
//
// Reutilizan los componentes de arriba y cambian solo la disposición: el orden de DOM es el del
// teléfono. Una región lateral que antecede a la principal en el DOM va a su izquierda; la que la
// sigue (Ajustes, «Acerca de») va a su derecha. `data-hoja` fija el contenido de la superficie:
//   'lec'  columna de lectura (`lectura`)
//   'lat'  `hoja`: región lateral y región principal
//   'rej'  `hoja`; desde `amplio`, `hoja-amplia`, con una columna más de rejilla
// Ningún ancho se escribe acá: `lectura`, `lateral`, `hoja` y `hoja-amplia` son variables del CSS.

// Marca una pantalla ya armada como disposición de escritorio.
const escritorio = (html, hoja) =>
  html.replace(/<div class="pantalla([^"]*)"/, `<div class="pantalla$1 esc" data-hoja="${hoja}"`);

// E01 · MateriaSelect (MateriaSelect.md · Escritorio, ESC-P1)
function escMateriaSelect() {
  return `
<div class="pantalla esc" data-pantalla="MateriaSelect" data-hoja="rej">
  ${headerMarca('<span class="t-rotulo c-sec">ESFUNO</span>')}
  <div class="col mt-1_5"><div class="regiones">
    <div class="reg-lat">
      ${laminaMarca()}
      <div class="mt-3">${notaCreador()}</div>
    </div>
    <div class="reg-pri">
      <div class="rejilla">${materias.map((m) => tarjetaMateria(m)).join('')}</div>
      <div class="mt-6">${donacion({ regla: true })}</div>
    </div>
  </div></div>
  <div class="relleno-10"></div>
</div>`;
}

// E02 · Home (Home.md · Escritorio, ESC-P2)
function escHome(m) {
  const p = homePartes(m);
  return `
<div class="pantalla esc" data-pantalla="Home" data-hoja="rej">
  ${headerMarca(p.cambiar)}
  <div class="col mt-1_5"><div class="regiones">
    <div class="reg-lat">
      ${p.tarjeta}
      ${p.banner ? `<div class="mt-3">${p.banner}</div>` : ''}
    </div>
    <div class="reg-pri">
      <div class="t-rotulo c-acento sec-rotulo">Plano / Acciones</div>
      <div class="acc-lista">${p.acciones}</div>
      <div class="mt-6">${p.privacidad}</div>
    </div>
  </div></div>
  <div class="relleno-8"></div>
</div>`;
}

// E05 · Results (Results.md · Escritorio, ESC-P5): la tarjeta de resultado a la izquierda y, a su
// derecha, el trío, el pedido de donación (si toca) y los tres botones, en su orden.
function escResults({ respuestas, topic, pedido = null }) {
  const total = respuestas.length;
  const correctas = respuestas.filter(Boolean).length;
  return `
<div class="pantalla esc" data-pantalla="Results" data-hoja="lat">
  ${barraInterna('pKapp · Resultados', false)}
  <div class="col mt-4"><div class="regiones">
    <div class="reg-lat">${tarjetaResultado({ respuestas, topic })}</div>
    <div class="reg-pri">
      ${trioResults(correctas, total)}
      ${pedido ? `<div class="mt-3">${donacion({ celebratoria: pedido === 'celebratoria', descartable: true })}</div>` : ''}
      <div class="mt-3">${botonesResults()}</div>
    </div>
  </div></div>
  <div class="relleno-8"></div>
</div>`;
}

// E06 · Revisión (Revision.md · Escritorio, ESC-P6): el encabezado, «Volver» y el filtro a la
// izquierda; las tarjetas y los botones finales a la derecha. Misma hoja que el resumen de Results,
// para que la barra no salte al alternar las dos vistas.
function escRevision(m, respuestas, opts = {}) {
  const p = revisionPartes(m, respuestas, opts);
  return `
<div class="pantalla esc" data-pantalla="Revision" data-hoja="lat">
  ${barraInterna('pKapp · Resultados', false)}
  <div class="col mt-4"><div class="regiones">
    <div class="reg-lat">
      <div>${p.encabezado}</div>
      <div class="mt-3">${p.volver}</div>
      ${p.filtro ? `<div class="mt-3">${p.filtro}</div>` : ''}
    </div>
    <div class="reg-pri">
      <div class="r-lista">${p.lista}</div>
      <div class="mt-4">${p.finales}</div>
    </div>
  </div></div>
  <div class="relleno-8"></div>
</div>`;
}

// E07 · Stats (Stats.md · Escritorio, ESC-P7): la tarjeta global, «Por tema» y la leyenda a la
// izquierda (la leyenda es la clave de las marcas de las filas) y las filas a la derecha;
// «Más falladas» debajo, a ancho de hoja y en columnas.
function escStats(m) {
  const p = statsPartes(m);
  return `
<div class="pantalla esc" data-pantalla="Stats" data-hoja="rej">
  ${barraInterna('pKapp · Estadísticas')}
  <div class="col mt-4"><div class="regiones">
    <div class="reg-lat">
      ${p.global}
      <div class="t-rotulo c-acento sec-rotulo sec-4">Por tema</div>
      ${p.leyenda}
    </div>
    <div class="reg-pri"><div class="s-filas">${p.filas}</div></div>
  </div></div>
  <div class="col">
    <div class="t-rotulo c-acento sec-rotulo sec-6">Más falladas</div>
    <div class="f-filas">${p.falladas}</div>
  </div>
  <div class="relleno-8"></div>
</div>`;
}

// E08 · Settings (Settings.md · Escritorio, ESC-P8): las tres secciones de ajustes a la izquierda y
// «Acerca de» en una región lateral a la derecha (es la última del DOM).
function escSettings(m, opts) {
  const p = settingsPartes(m, opts);
  return `
<div class="pantalla esc" data-pantalla="Settings" data-hoja="lat">
  ${barraInterna('pKapp · Ajustes')}
  <div class="col"><div class="regiones">
    <div class="reg-pri">
      ${p.seccion('Cuestionario', p.cuestionario, 'mt-4 set-sec')}
      ${p.seccion('Mis preguntas', p.preguntas, 'set-sec')}
      ${p.seccion('Tus datos', p.datos, 'set-sec')}
    </div>
    <div class="reg-lat">${p.seccion('Acerca de', p.acerca, 'mt-4')}</div>
  </div></div>
  <div class="relleno-8"></div>
</div>`;
}

// E09 · AddQuestion (AddQuestion.md · Escritorio): una columna `lectura`, como el quiz. ESC-P9 (tema
// a la izquierda del enunciado) quedó rechazada: con el desplegable de ADD-P3 el tema mide una fila.
const escAddQuestion = (m, datos = null) => escritorio(pantallaAddQuestion(m, datos), 'lec');

// ---------------------------------------------------------------------------
// Tablero
// ---------------------------------------------------------------------------

const cyr = porId.cyr;
const bcyt = porId.bcyt;
const preguntasCyr = PREGUNTAS.cyr;
const qHistologia = preguntasCyr.find((q) => q.id === 'CYR-PROTOTIPO-1-Q25') ?? preguntasCyr[0];
const qFisiologia = preguntasCyr.find((q) => q.id === 'CYR-PROTOTIPO-1-Q27') ?? preguntasCyr[1];
const totalTema = conteoPorTema('cyr').porTema.get(qHistologia.topic) || 10;
const totalCyr = conteoPorTema('cyr').total;

// Datos de muestra de 1.3 (los textos son del banco real; que sean «propias», falladas o
// elegidas es de muestra: no hay base local en la maqueta).
const preguntasBcyt = PREGUNTAS.bcyt;
const porIdBcyt = (id) => {
  const q = preguntasBcyt.find((x) => x.id === id);
  if (!q) throw new Error(`Falta la pregunta de muestra ${id} en bcyt`);
  return q;
};
const qAgregar = porIdBcyt('2025-T1-Q15');
const qParcial1 = porIdBcyt('P1-LC-004');   // parcial 'primero'
const qParcial2 = porIdBcyt('2025-T1-Q14'); // parcial 'segundo'
// «Mis preguntas»: dos preguntas propias de muestra de CyR.
const PROPIAS = ['hemodinamia', 'intercambio-gaseoso'].map((tema) => preguntasCyr.find((q) => q.topic === tema));
// Revisión: cuatro respuestas de muestra, una por tema, con enunciado corto; fallan la 2.ª y la 4.ª.
const REV_MUESTRA = (() => {
  const vistos = new Set();
  const elegidas = [];
  for (const q of preguntasCyr) {
    if (vistos.has(q.topic) || q.question.length > 150 || q.options.some((o) => o.length > 90)) continue;
    vistos.add(q.topic);
    elegidas.push(q);
    if (elegidas.length === 4) break;
  }
  const ok = [true, false, true, false];
  return elegidas.map((pregunta, i) => ({
    pregunta, ok: ok[i], elegida: ok[i] ? pregunta.correctIndex : (pregunta.correctIndex + 1) % pregunta.options.length,
  }));
})();

const base = { materia: cyr, pregunta: qHistologia, indice: 4, total: totalTema };
const alto = [...Array(24)].map((_, i) => ![3, 9, 15, 20].includes(i));      // 20 de 24
const medio = [...Array(24)].map((_, i) => ![1, 4, 7, 10, 12, 15, 19, 22, 23].includes(i)); // 15 de 24
const bajo = [...Array(24)].map((_, i) => [0, 3, 6, 9, 12, 15, 18, 21, 22].includes(i));    // 9 de 24

const FIGURAS = [
  { id: '01', titulo: 'Selección de materias', ficha: 'MateriaSelect.md', html: pantallaMateriaSelect() },
  { id: '02', titulo: `Inicio de materia · ${cyr.shortName}`, ficha: 'Home.md', html: pantallaHome(cyr) },
  { id: '03a', titulo: `Elegir tema · practicar · ${bcyt.shortName}, con parcial`, ficha: 'TopicSelect.md · variante A', html: pantallaTopicSelect(bcyt, 'practice') },
  { id: '03b', titulo: `Elegir tema · modo examen · ${cyr.shortName}, sin parcial`, ficha: 'TopicSelect.md · variante B (TOPIC-P5)', html: pantallaTopicSelect(cyr, 'exam') },
  { id: '04a', titulo: 'Quiz · sin responder', ficha: 'Quiz.md · c.2 reposo', html: pantallaQuiz({ ...base }) },
  { id: '04b', titulo: 'Quiz · respondida correcta · temporizador normal', ficha: 'Quiz.md · c.2 correcta, c.4', html: pantallaQuiz({ ...base, respuesta: qHistologia.correctIndex, tiempo: '14:32' }) },
  { id: '04c', titulo: 'Quiz · respondida incorrecta con explicación', ficha: 'Quiz.md · c.2 incorrecta y apagada', html: pantallaQuiz({ ...base, respuesta: 0 }) },
  { id: '04d', titulo: 'Quiz · temporizador en alerta · barra continua', ficha: 'Quiz.md · c.4, QUIZ-P3, QUIZ-P4', html: pantallaQuiz({ materia: cyr, pregunta: qFisiologia, indice: 17, total: totalCyr, tiempo: '01:42', alerta: true }) },
  { id: '05a', titulo: 'Resultados · tramo alto · pedido de donación celebratorio', ficha: 'Results.md · d.1 · DonationBox.md', html: pantallaResults({ respuestas: alto, topic: 'Todos los temas', pedido: 'celebratoria' }) },
  { id: '05b', titulo: 'Resultados · tramo medio · pedido de donación', ficha: 'Results.md · d.1 · DonationBox.md', html: pantallaResults({ respuestas: medio, topic: qHistologia.topic, pedido: 'normal' }) },
  { id: '05c', titulo: 'Resultados · tramo bajo · sin pedido de donación', ficha: 'Results.md · d.1', html: pantallaResults({ respuestas: bajo, topic: 'Todos los temas' }) },
  { id: '06', titulo: `Estadísticas · ${cyr.shortName}`, ficha: 'Stats.md', html: pantallaStats(cyr) },
  { id: '01b', titulo: 'Tarjeta de materia · estados', ficha: 'MateriaSelect.md · c', html: pantallaEstadosTarjeta() },
  { id: '04e', titulo: 'Chip de origen de la pregunta', ficha: 'Quiz.md · c.3', html: pantallaOrigen() },
  // --- 1.3 -----------------------------------------------------------------
  { id: '07a', titulo: `Agregar pregunta · formulario inicial · ${cyr.shortName}`, ficha: 'AddQuestion.md · c.2 inicial (ADD-P3)', html: pantallaAddQuestion(cyr) },
  { id: '07b', titulo: `Agregar pregunta · completa, correcta marcada, guardando · ${bcyt.shortName}`, ficha: 'AddQuestion.md · c.1, c.2 (ADD-P2, ADD-P3)', html: pantallaAddQuestion(bcyt, {
    tema: qAgregar.topic, enunciado: qAgregar.question, opciones: qAgregar.options, correcta: qAgregar.correctIndex,
    explicacion: qAgregar.explanation, guardando: true }) },
  { id: '07c', titulo: `Agregar pregunta · selector de tema abierto · ${bcyt.shortName}, 27 temas`, ficha: 'AddQuestion.md · a.2, c.1, c.2 (ADD-P3)', html: pantallaAddQuestion(bcyt, { abierto: true,
    tema: Object.keys(bcyt.TOPICS)[0], enunciado: '', opciones: ['', '', '', ''], correcta: null, explicacion: '', guardando: false }) },
  { id: '08a', titulo: 'Ajustes · plegables cerrados · ocultar resultado en «No»', ficha: 'Settings.md · c.2 (SET-P1)', html: pantallaSettings(cyr, { propias: PROPIAS }) },
  { id: '08b', titulo: 'Ajustes · plegables abiertos · ocultar resultado en «Sí»', ficha: 'Settings.md · c.1, c.2 (SET-P1, SET-P2)', html: pantallaSettings(cyr, { propias: PROPIAS, abiertos: { preguntas: true, datos: true }, ocultar: true }) },
  { id: '09', clase: 'fig-doble', titulo: 'Pedido de donación · antes (DON-P1) y DON-P5, aprobada', ficha: 'DonationBox.md · a, b, c y f (DON-P5)', html: pantallaDonacion() },
  { id: '10a', titulo: 'Revisión de respuestas · todas', ficha: 'Revision.md · c.2 (REV-P1, REV-P2, REV-P3)', html: pantallaRevision(cyr, REV_MUESTRA) },
  { id: '10b', titulo: 'Revisión de respuestas · solo incorrectas', ficha: 'Revision.md · c.2 (REV-P1)', html: pantallaRevision(cyr, REV_MUESTRA, { soloIncorrectas: true }) },
  { id: '11a', titulo: `Examen en curso · sin responder · ${bcyt.shortName}, 2.º parcial`, ficha: 'ExamenEnCurso.md · c.2 reposo (PAR-P1)', html: pantallaQuiz({ materia: bcyt, pregunta: qParcial2, indice: 11, total: 40, sinFeedback: true }) },
  { id: '11b', titulo: `Examen en curso · respondida · ${bcyt.shortName}, 1.er parcial`, ficha: 'ExamenEnCurso.md · c.2 elegida (EXA-P1, PAR-P1)', html: pantallaQuiz({ materia: bcyt, pregunta: qParcial1, indice: 30, total: 75, respuesta: qParcial1.correctIndex === 0 ? 1 : 0, tiempo: '58:20', sinFeedback: true }) },
  { id: '11c', titulo: 'Marca de parcial · insignia y filtro', ficha: 'comun.md · §12.2, §12.3 (PAR-P1, PAR-P2)', html: pantallaParcial(bcyt) },
  { id: '12a', titulo: 'Vacío · estadísticas sin datos (V1)', ficha: 'Vacios.md · a.2 (VAC-P1, VAC-P2)', html: pantallaVacioLamina({
    barra: 'pKapp · Estadísticas', glifoId: 'glifo-estadisticas', titulo: 'Sin estadísticas todavía',
    texto: 'Hacé algunos quizzes y volvé a esta pantalla para ver tu progreso.' }) },
  { id: '12b', titulo: 'Vacío · repasar fallos sin falladas (V2)', ficha: 'Vacios.md · a.2 (VAC-P1, VAC-P2)', html: pantallaVacioLamina({
    barra: 'pKapp · Elegir tema', glifoId: 'glifo-repasar', titulo: 'Sin preguntas falladas',
    texto: 'Practicá un poco primero y volvé acá para repasar las que te cuesten.' }) },
  { id: '12c', titulo: 'Vacío · «Mis preguntas» sin preguntas propias (V3)', ficha: 'Vacios.md · a.3 (VAC-P2)', html: pantallaSettings(cyr, { abiertos: { preguntas: true } }) },
  { id: '12d', titulo: `Vacío · ningún tema con los filtros actuales (V4) · ${cyr.shortName}`, ficha: 'Vacios.md · a.4 (VAC-P3)', html: pantallaTopicSelect(cyr, 'vacio') },
  { id: '13', titulo: 'Avisos · banco reducido, nota del creador, privacidad', ficha: 'Banners.md · b, c (BAN-P1)', html: pantallaAvisos() },
  { id: '14', titulo: `Inventario de glifos · ${GLIFOS.length}`, ficha: 'comun.md · §9', html: pantallaGlifos() },
  // --- 3.10 · Escritorio: ESC-P0 a ESC-P8 y ESC-P10 a ESC-P12, aprobadas (usuario, 2026-10-11) ------
  // Solo se ven a 1366 px (corte `escritorio`) y a 1920 px (corte `amplio`); a 1280 px el tablero
  // sigue mostrando la columna única anterior al escritorio, para comparar.
  { id: 'E01', esc: true, titulo: 'Selección de materias', ficha: 'MateriaSelect.md · Escritorio (ESC-P1)', html: escMateriaSelect() },
  { id: 'E02', esc: true, titulo: `Inicio de materia · ${cyr.shortName}`, ficha: 'Home.md · Escritorio (ESC-P2)', html: escHome(cyr) },
  { id: 'E03a', esc: true, titulo: `Elegir tema · practicar · ${bcyt.shortName}, con parcial, 27 temas`, ficha: 'TopicSelect.md · Escritorio (ESC-P3)', html: pantallaTopicSelect(bcyt, 'practice', true) },
  { id: 'E03b', esc: true, titulo: `Elegir tema · modo examen · ${cyr.shortName}`, ficha: 'TopicSelect.md · Escritorio (ESC-P3)', html: pantallaTopicSelect(cyr, 'exam', true) },
  { id: 'E04a', esc: true, titulo: 'Quiz · sin responder', ficha: 'Quiz.md · Escritorio (ESC-P4)', html: escritorio(pantallaQuiz({ ...base }), 'lec') },
  { id: 'E04b', esc: true, titulo: 'Quiz · respondida incorrecta con explicación', ficha: 'Quiz.md · Escritorio (ESC-P4)', html: escritorio(pantallaQuiz({ ...base, respuesta: 0 }), 'lec') },
  { id: 'E04c', esc: true, titulo: `Examen en curso · respondida · ${bcyt.shortName}, 1.er parcial`, ficha: 'ExamenEnCurso.md · Escritorio (ESC-P4)', html: escritorio(pantallaQuiz({ materia: bcyt, pregunta: qParcial1, indice: 30, total: 75, respuesta: qParcial1.correctIndex === 0 ? 1 : 0, tiempo: '58:20', sinFeedback: true }), 'lec') },
  { id: 'E05a', esc: true, titulo: 'Resultados · tramo alto · pedido de donación celebratorio', ficha: 'Results.md · Escritorio (ESC-P5)', html: escResults({ respuestas: alto, topic: 'Todos los temas', pedido: 'celebratoria' }) },
  { id: 'E05b', esc: true, titulo: 'Resultados · tramo bajo · sin pedido de donación', ficha: 'Results.md · Escritorio (ESC-P5)', html: escResults({ respuestas: bajo, topic: 'Todos los temas' }) },
  { id: 'E06', esc: true, titulo: 'Revisión de respuestas · todas', ficha: 'Revision.md · Escritorio (ESC-P6)', html: escRevision(cyr, REV_MUESTRA) },
  { id: 'E07', esc: true, titulo: `Estadísticas · ${cyr.shortName}`, ficha: 'Stats.md · Escritorio (ESC-P7)', html: escStats(cyr) },
  { id: 'E08a', esc: true, titulo: 'Ajustes · plegables cerrados', ficha: 'Settings.md · Escritorio (ESC-P8)', html: escSettings(cyr, { propias: PROPIAS }) },
  { id: 'E08b', esc: true, titulo: 'Ajustes · plegables abiertos', ficha: 'Settings.md · Escritorio (ESC-P8)', html: escSettings(cyr, { propias: PROPIAS, abiertos: { preguntas: true, datos: true }, ocultar: true }) },
  { id: 'E09a', esc: true, titulo: `Agregar pregunta · completa, correcta marcada · ${bcyt.shortName}, 27 temas`, ficha: 'AddQuestion.md · Escritorio (ESC-P9 rechazada: columna `lectura`)', html: escAddQuestion(bcyt, {
    tema: qAgregar.topic, enunciado: qAgregar.question, opciones: qAgregar.options, correcta: qAgregar.correctIndex,
    explicacion: qAgregar.explanation, guardando: false }) },
  { id: 'E09b', esc: true, titulo: `Agregar pregunta · selector de tema abierto · ${bcyt.shortName}, 27 temas`, ficha: 'AddQuestion.md · Escritorio (ESC-P9 rechazada: columna `lectura`), ADD-P3', html: escAddQuestion(bcyt, { abierto: true,
    tema: Object.keys(bcyt.TOPICS)[0], enunciado: '', opciones: ['', '', '', ''], correcta: null, explicacion: '', guardando: false }) },
  { id: 'E10', esc: true, titulo: 'Vacío · estadísticas sin datos (V1)', ficha: 'Vacios.md · Escritorio (ESC-P12)', html: pantallaVacioLamina({
    barra: 'pKapp · Estadísticas', glifoId: 'glifo-estadisticas', titulo: 'Sin estadísticas todavía',
    texto: 'Hacé algunos quizzes y volvé a esta pantalla para ver tu progreso.', escritorio: true }) },
];

const figura = (f) => `
<figure class="fig${f.clase ? ` ${f.clase}` : ''}${f.esc ? ' fig-esc' : ''}" id="fig-${f.id}">
  <figcaption>
    <span class="t-rotulo-medio c-tinta">${f.id} · ${esc(f.titulo)}</span>
    <span class="fig-ficha c-sec">${esc(f.ficha)} · <span class="txt-ancho"></span> · <span class="txt-tema"></span></span>
  </figcaption>
  ${f.html}
</figure>`;

const navegacion = FIGURAS.map((f) => `<button type="button" class="seg-op t-rotulo ${f.esc ? 'nav-esc' : 'nav-vig'}" data-ir="fig-${f.id}">${f.id}</button>`).join('');

const panelFaltantes = faltantes.size === 0 ? '' : `
<section class="faltantes">
  <div class="t-rotulo-medio c-tinta">Glifos sin dibujar al generar · ${faltantes.size} de ${GLIFOS.length}</div>
  <p class="t-detalle c-sec">Cada cuadrado numerado del tablero ocupa el lugar de un glifo de comun.md §9 que todavía no existe en <code>diseno/svg/glifos/</code>. Al aparecer el archivo y volver a correr <code>generar.mjs</code>, el cuadrado se reemplaza por el dibujo.</p>
  <ul class="faltantes-lista">${GLIFOS.filter(([id]) => faltantes.has(id)).map(([id, tam]) =>
    `<li class="t-rotulo c-sec"><span class="g g-chico g-falta">${INDICE_GLIFO[id]}</span>${id} · ${tam}</li>`).join('')}</ul>
</section>`;

const sprite = `
<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0">
  <defs>
    <pattern id="regla-menor" width="10" height="9" patternUnits="userSpaceOnUse"><path d="M0.5 8.5 V5" fill="none" stroke="currentColor" stroke-width="1"/></pattern>
    <pattern id="regla-mayor" width="50" height="9" patternUnits="userSpaceOnUse"><path d="M0.5 8.5 V2" fill="none" stroke="currentColor" stroke-width="1"/></pattern>
  </defs>
  ${Object.entries(ilustraciones).map(([id, s]) =>
    `<symbol id="ilu-${id}" viewBox="${esc(s.viewBox)}"><g ${presAttrs(s.pres)}>${s.interior}</g></symbol>`).join('\n  ')}
</svg>`;

// ---------------------------------------------------------------------------
// Estilos (todo valor de color es una variable generada desde `plancha`)
// ---------------------------------------------------------------------------

const ESTILOS = String.raw`
/* ===== reinicio y base ===== */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;border-radius:0;font-style:normal;text-decoration:none}
:root{--sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace;--w:390px;--columna:448px}
html[data-ancho="768"]{--w:768px}
html[data-ancho="1280"]{--w:1280px}
html[data-ancho="1366"]{--w:1366px}
html[data-ancho="1920"]{--w:1920px}
html[data-tema="oscuro"]{color-scheme:dark}
html{background:var(--superficie)}
body{font:400 15px/22px var(--sans);color:var(--tinta);background:var(--superficie);-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:0;text-align:inherit;cursor:pointer;display:block}
button:disabled{cursor:default}
svg{display:block;flex:none}
code{font:400 12px/16px var(--mono)}
.sprite{position:absolute;width:0;height:0;overflow:hidden}

/* ===== tipografía (tokens.md b.2) ===== */
.t-marca{font:600 28px/28px var(--sans);letter-spacing:-.28px}
.t-titulo{font:600 18px/24px var(--sans)}
.t-item{font:600 16px/22px var(--sans)}
.t-cuerpo{font:400 15px/22px var(--sans)}
.t-cuerpo-fuerte{font:600 15px/22px var(--sans)}
.t-detalle{font:400 13px/18px var(--sans)}
.t-rotulo{font:400 11px/16px var(--mono);letter-spacing:.66px;text-transform:uppercase}
.t-rotulo-medio{font:500 11px/16px var(--mono);letter-spacing:.66px;text-transform:uppercase}
.t-campo{font:400 16px/22px var(--sans)}
.t-dato{font:500 16px/20px var(--mono)}
.t-cifra{font:500 26px/28px var(--mono)}
.t-display{font:500 72px/72px var(--mono);letter-spacing:-2.16px}
.c-tinta{color:var(--tinta)}.c-sec{color:var(--tintaSec)}.c-acento{color:var(--acento)}.c-fondo{color:var(--fondo)}
.c-acierto{color:var(--acierto)}.c-error{color:var(--error)}.c-inter{color:var(--intermedia)}.c-inact{color:var(--inactivo)}

/* ===== herramientas del tablero (no son parte de la app) ===== */
.herr{position:sticky;top:0;z-index:5;background:var(--fondo);border-bottom:1px solid var(--linea)}
.herr-fila{display:flex;flex-wrap:wrap;align-items:center;gap:10px 28px;padding:12px 24px}
.herr-grupo{display:flex;align-items:center;gap:10px}
.seg{display:inline-flex;flex-wrap:wrap;border:1px solid var(--linea)}
.seg-op{display:inline-flex;align-items:center;min-height:32px;padding:0 10px;color:var(--tinta);background:var(--fondo)}
html[data-ancho="390"] [data-set="ancho:390"],html[data-ancho="768"] [data-set="ancho:768"],html[data-ancho="1280"] [data-set="ancho:1280"],
html[data-ancho="1366"] [data-set="ancho:1366"],html[data-ancho="1920"] [data-set="ancho:1920"],
html[data-tema="claro"] .herr [data-set="tema:claro"],html[data-tema="oscuro"] .herr [data-set="tema:oscuro"]{background:var(--tinta);color:var(--fondo)}
.herr-nota{padding:0 24px 12px}

/* ===== tablero ===== */
.tablero{display:grid;grid-template-columns:repeat(auto-fill,calc(var(--w) + 2px));justify-content:start;align-items:start;gap:36px 24px;padding:24px}
.fig{display:flex;flex-direction:column;gap:8px;min-width:0;scroll-margin-top:72px}
.fig figcaption{display:flex;flex-direction:column;gap:2px}
.fig-ficha{font:400 11px/16px var(--mono);letter-spacing:.2px}
.txt-ancho::before{content:"390 px"}
html[data-ancho="768"] .txt-ancho::before{content:"768 px"}
html[data-ancho="1280"] .txt-ancho::before{content:"1280 px · columna única, antes del escritorio"}
html[data-ancho="1366"] .txt-ancho::before{content:"1366 px · escritorio (ESC)"}
html[data-ancho="1920"] .txt-ancho::before{content:"1920 px · amplio (ESC)"}
.txt-tema::before{content:"Claro"}
html[data-tema="oscuro"] .txt-tema::before{content:"Oscuro"}
.pantalla{box-sizing:content-box;width:var(--w);background:var(--fondo);color:var(--tinta);border:1px solid var(--borde);position:relative}
.quiz{min-height:844px}
.faltantes{margin:0 24px 36px;padding:16px;border:1px solid var(--filete);background:var(--superficie);display:flex;flex-direction:column;gap:10px}
.faltantes-lista{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:6px 16px}
.faltantes-lista li{display:flex;align-items:center;gap:8px}

/* ===== columna (comun.md §7) y espaciado (tokens.md c.3) ===== */
.col{width:100%;max-width:var(--columna);margin-inline:auto;padding-inline:20px}
.mt-1_5{margin-top:6px}.mt-3{margin-top:12px}.mt-4{margin-top:16px}.mt-6{margin-top:24px}.mb-3{margin-bottom:12px}
.relleno-8{height:32px}.relleno-10{height:40px}
.lista{display:flex;flex-direction:column;gap:10px}
.sec-rotulo{padding-bottom:8px}.sec-4{padding-top:16px}.sec-6{padding-top:24px}
.divisor{height:1px;background:var(--filete);margin-block:14px}
.estados{display:flex;flex-direction:column;gap:16px;padding-block:16px}
.estado{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.estado>.k6,.estado>.lam,.estado>.nota,.estado>.parc-caja{width:100%}

/* ===== glifos e ilustraciones ===== */
.g{flex:none}.g-grande{width:24px;height:24px}.g-chico{width:16px;height:16px}
.g-falta{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--filete);color:inherit;font:400 11px/1 var(--mono);letter-spacing:0}
.ilu{color:var(--filamento);fill:none;stroke:currentColor}

/* ===== marcas de esquina y lámina (comun.md §6) ===== */
.lam{position:relative;background:var(--superficie);border:1px solid var(--linea)}
.mk{position:absolute;width:8px;height:8px;border:0 solid var(--linea);pointer-events:none}
.mk-a{top:-5px;left:-5px;border-top-width:2px;border-left-width:2px}
.mk-b{top:-5px;right:-5px;border-top-width:2px;border-right-width:2px}
.mk-c{bottom:-5px;left:-5px;border-bottom-width:2px;border-left-width:2px}
.mk-d{bottom:-5px;right:-5px;border-bottom-width:2px;border-right-width:2px}

/* ===== clases de control (comun.md §5) ===== */
button:focus-visible{outline:2px solid var(--foco);outline-offset:2px}
.es-foco{outline:2px solid var(--foco);outline-offset:2px}
.k1{background:var(--tinta);color:var(--fondo);border:1px solid var(--tinta)}
.k2{background:var(--superficie);color:var(--tinta);border:1px solid var(--linea)}
.k2-acento{color:var(--acento);border-color:var(--acento)}
.k3,.k4{background:var(--superficie);color:var(--tinta);border:1px solid var(--borde)}
.k4.sel{background:var(--tinta);color:var(--fondo);border-color:var(--tinta)}
.k5{background:var(--superficie);color:var(--tinta);border:1px solid var(--linea)}
.k5:disabled{border-color:var(--filete);color:var(--inactivo)}
.k7{background:none;color:var(--tinta)}
@media (hover:hover){
  .k1:hover{outline:2px solid var(--linea);outline-offset:0}
  .k2:hover,.k5:not(:disabled):hover{outline:1px solid var(--linea);outline-offset:0}
  .k2-acento:hover{outline-color:var(--acento)}
  .k3:not(:disabled):hover,.k4:not(.sel):hover{border-color:var(--linea)}
  .k6:not(:disabled):hover,.k7:hover{outline:1px solid var(--linea);outline-offset:0}
}
.k1:active{background:var(--superficie);color:var(--tinta);border-color:var(--linea)}
.k2:active,.k5:not(:disabled):active,.k3:not(:disabled):active,.k4:active{background:var(--tinta);color:var(--fondo);border-color:var(--tinta)}
.k2:active *,.k3:not(:disabled):active *,.k4:active *,.k6:not(:disabled):active *,.k7:active *,.es-pres *{color:var(--fondo)}
.k6:not(:disabled):active,.k7:active,.es-pres{background:var(--tinta)}
.k6.es-nodisp{border-color:var(--filete)}
.k6.es-nodisp *{color:var(--inactivo)}

/* ===== HeaderMarca y control de tema (comun.md §1 y §2) ===== */
.cab-fila{display:flex;align-items:center;justify-content:space-between;padding-block:14px}
.cab-izq{display:flex;align-items:center;min-height:44px}
/* MAQUETA-P3 (aprobada): cada opción mide paso 11 (44 px) de alto útil; el contenedor suma su
   borde: 46 px, y la fila de HeaderMarca 14 + 46 + 14 = 74 px en MateriaSelect y en Home. */
.tema{display:inline-flex;height:46px;border:1px solid var(--linea);background:var(--fondo)}
.tema-op{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:44px;padding-inline:8px;background:var(--fondo);color:var(--tinta)}
html[data-tema="claro"] .tema-op[data-op="claro"],html[data-tema="oscuro"] .tema-op[data-op="oscuro"]{background:var(--tinta);color:var(--fondo)}
@media (hover:hover){.tema-op:hover{outline:1px solid var(--linea);outline-offset:-1px}}
.tema-op:active{background:var(--tinta);color:var(--fondo)}
.btn-cambiar{display:inline-flex;align-items:center;gap:8px;height:44px;padding-inline:12px;background:var(--fondo)}
/* comun.md §1.1: con menos de 360 px de ancho el botón de Home es solo glifo-volver, un cuadrado
   de paso 11; el texto queda como nombre accesible (aria-label). El criterio es el ancho de la
   pantalla (container query sobre .cab), no el contenido medido. */
.cab{container-type:inline-size}
@container (max-width:359.98px){
  .btn-cambiar{width:44px;padding-inline:0;justify-content:center}
  .btn-cambiar span{display:none}
}

/* ===== barra interna (comun.md §3) ===== */
.barra-int{background:var(--fondo);border-bottom:1px solid var(--linea)}
/* MAQUETA-P1 (aprobada): fila de contenido de paso 11 con y sin volver; 16 + 44 + 16 = 76 px. */
.barra-int-fila{display:flex;align-items:center;gap:14px;padding-block:16px;min-height:76px}
.btn-volver{width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex:none}
.barra-int h1{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ===== 01 MateriaSelect ===== */
.campo{height:112px;border-bottom:1px solid var(--filete);color:var(--filamento);overflow:hidden}
.campo svg{width:100%;height:100%}
.campo .cont{stroke:var(--acento)}
.regla{height:10px;border-bottom:1px solid var(--filete);color:var(--tintaSec)}
.regla svg{height:9px}
.cajetin{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 14px}
.cajetin-der{text-align:right}
.tarj{display:block;width:100%;text-align:left}
.tarj-fila{display:flex}
.tarj-ilu{width:64px;flex:none;display:flex;align-items:center;justify-content:center;border-right:1px solid var(--filete);color:var(--filamento)}
.tarj-txt{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:4px;padding:8px 12px}
.tarj-caj{display:flex;border-top:1px solid var(--filete)}
.celda{padding:6px 12px}
.celda+.celda{border-left:1px solid var(--filete)}

/* ===== 02 Home ===== */
.mat-card{display:grid;grid-template-columns:96px 1fr}
.mat-card-ilu{display:flex;align-items:center;justify-content:center;border-right:1px solid var(--filete);color:var(--filamento)}
.mat-card-txt{display:flex;flex-direction:column;gap:6px;padding:8px 12px}
.accion{display:flex;align-items:center;gap:14px;width:100%;padding:14px;text-align:left}
.accion.prim{border:2px solid var(--linea);padding:13px}
.accion-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.ico{width:40px;height:40px;flex:none;display:flex;align-items:center;justify-content:center;border:1px solid var(--filete);color:var(--tinta)}
.accion:active .ico{border-color:var(--fondo)}
.nota-web{text-align:center;padding-inline:4px}

/* ===== 03 TopicSelect ===== */
.panel{background:var(--superficie);border:1px solid var(--linea);padding:14px}
.grupo-rot{padding-bottom:8px}
.filtros{display:flex;flex-wrap:wrap;gap:8px}
.filtro{height:44px;padding-inline:12px;display:flex;align-items:center;gap:8px}
.timer{display:flex;align-items:center;gap:16px}
.cuadrado{width:44px;height:44px;display:flex;align-items:center;justify-content:center}
.timer-valor{min-width:80px;text-align:center}
.mezcla{display:flex;align-items:center;gap:12px;width:100%;margin-top:12px;padding:12px 14px;background:var(--superficie);border:2px solid var(--acento);text-align:left}
.mezcla-txt{display:flex;flex-direction:column;min-width:0}
.mezcla-txt>:first-child{margin-bottom:6px}
.mezcla-txt>:last-child{margin-top:4px}
.lista-temas{border-top:1px solid var(--linea)}
.fila-tema{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding-block:12px;border-bottom:1px solid var(--filete);text-align:left}
.fila-idx{width:22px;flex:none}
.fila-nom{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.examen{margin-top:12px;padding:16px;text-align:center;display:flex;flex-direction:column;align-items:center}
.examen-sorteo{margin-top:8px}
.examen-disp{margin-top:14px}
.btn-examen{margin-top:20px;padding:14px 32px}

/* ===== 04 Quiz ===== */
.q-barra{background:var(--fondo);border-bottom:1px solid var(--linea)}
.q-barra-fila{display:flex;align-items:center;gap:14px;padding-block:8px}
.q-cerrar{width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex:none}
.progreso{flex:1;min-width:0;display:flex;gap:2px;height:10px}
.progreso i{flex:1;display:block;border:1px solid var(--filete)}
.progreso i.on{background:var(--tinta);border-color:var(--tinta)}
.progreso-barra{flex:1;min-width:0;height:10px;border:1px solid var(--filete)}
.progreso-barra i{display:block;height:100%;background:var(--tinta)}
.q-cont{display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex:none}
.tiempo{display:inline-flex;align-items:center;gap:6px;padding:2px;color:var(--tinta)}
.tiempo.alerta{padding:0;border:2px solid var(--error);color:var(--error)}
.tiempo.alerta .g{padding:0}
.q-scroll{padding-bottom:96px}
.q-ctx{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;padding-top:16px;padding-bottom:12px}
.q-meta{text-align:right;min-width:0}
.chip{display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border:1px solid var(--linea);background:var(--superficie);color:var(--tinta);flex:none}
.chip-examen{border-color:var(--acento);color:var(--acento)}
.chip-generada{background:var(--tinta);border-color:var(--tinta);color:var(--fondo)}
.chip-tema{border-color:var(--acento);color:var(--acento)}
.q-enunciado{background:var(--superficie);border:1px solid var(--linea);padding:14px;display:flex;flex-direction:column;gap:6px}
.q-opciones{display:flex;flex-direction:column;gap:10px;padding-top:16px}
.opcion{display:flex;width:100%;text-align:left}
.op-letra{width:44px;flex:none;display:flex;align-items:center;justify-content:center;border-right:1px solid var(--filete);color:var(--tinta)}
.op-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding:12px}
.op-estado{display:flex;align-items:flex-start;gap:6px}
.opcion.ok{border:2px solid var(--acierto);background:var(--aciertoFondo)}
.opcion.ok .op-letra{background:var(--acierto);color:var(--fondo);border-right:2px solid var(--acierto)}
.opcion.mal{border:2px solid var(--error);background:var(--errorFondo)}
.opcion.mal .op-letra{background:var(--error);color:var(--fondo);border-right:2px solid var(--error)}
.opcion.apagada{border:1px solid var(--filete)}
.opcion.apagada .op-letra{color:var(--tintaSec)}
.opcion.apagada .op-texto{color:var(--tintaSec)}
.q-nota{margin-top:16px;background:var(--superficie);border:1px solid var(--filete);border-left:3px solid var(--acento);padding:14px;display:flex;flex-direction:column;gap:6px}
.q-nota-rot{display:flex;align-items:center;gap:6px}
.q-reportar{display:flex;justify-content:center;padding-top:14px}
.btn-reportar{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding-inline:16px}
.q-inf{position:absolute;left:0;right:0;bottom:0;background:var(--fondo);border-top:1px solid var(--linea);padding-top:12px;padding-bottom:16px}
.q-sig{display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 16px}

/* ===== 05 Results ===== */
.res{padding:16px}
.res-rot{padding-bottom:12px}
.res-pct{display:flex;align-items:center;gap:8px}
.res-pct .g{width:24px;height:24px}
.res-sub{margin-top:10px}
.res-msg{margin-top:6px}
.tira{display:flex;align-items:flex-end;gap:2px;margin-top:16px;margin-bottom:8px}
.tira i{flex:1;display:block}
.tira i.c{height:24px;background:var(--acierto)}
.tira i.i{height:12px;background:var(--error)}
.leyenda{display:flex;gap:16px;padding-bottom:14px}
.leyenda span{display:inline-flex;align-items:center;gap:6px}
.sw{display:inline-block;width:8px}
.sw-c{height:8px;background:var(--acierto)}
.sw-i{height:4px;background:var(--error)}
.res .chip{margin-top:0}
.trio{display:flex}
.trio-celda{flex:1;display:flex;flex-direction:column;align-items:center;padding-block:12px}
.trio-celda+.trio-celda{border-left:1px solid var(--filete)}
.trio-rot{display:inline-flex;align-items:center;gap:4px;margin-top:6px}
.botones{display:flex;flex-direction:column;gap:10px}
.btn-res{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px 16px}

/* ===== 06 Stats ===== */
.glob{padding:16px;text-align:center;display:flex;flex-direction:column;align-items:center}
.glob-rot{display:flex;align-items:center;gap:8px}
.glob-pct{margin-top:12px}
.glob-det{margin-top:8px}
.leyenda-bandas{display:flex;flex-wrap:wrap;gap:8px 16px;padding-bottom:8px}
.ley-item{display:inline-flex;align-items:center;gap:6px}
.s-fila{border-top:1px solid var(--filete);padding-block:12px}
.s-enc{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.s-valor{display:inline-flex;align-items:center;gap:6px;flex:none}
.pista{position:relative;height:8px;margin-block:8px 6px;background:var(--superficie);border:1px solid var(--filete)}
.relleno{position:absolute;left:0;top:0;bottom:0;display:block}
.marca-u{position:absolute;top:-4px;height:14px;width:0;border-left:1px solid var(--linea)}
.s-sin{flex:none;white-space:nowrap}
.s-fila .s-enc+.s-det{margin-top:4px}
.f-fila{border-top:1px solid var(--filete);padding-block:12px}
.f-enc{display:flex;justify-content:space-between;align-items:center;gap:12px}
.f-enun{margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.f-tema{margin-top:4px}

/* ===== 04 Quiz: insignia de parcial y sin retroalimentación (ExamenEnCurso.md, comun.md §12) ===== */
.q-ctx-izq{display:flex;flex-direction:column;align-items:flex-start;gap:4px}
.opcion.elegida{background:var(--tinta);border-color:var(--tinta);color:var(--fondo)}
.opcion.elegida .op-letra{color:var(--fondo);border-right-color:var(--filete)}
.q-oculto{margin-top:16px}
.parc{display:inline-flex;align-items:center;gap:6px}
.parc-mk{display:inline-flex;gap:2px;flex:none}
.parc-mk i{display:block;width:10px;height:10px;border:1px solid currentColor}
.parc-mk i.on{background:currentColor}
.parc-caja{display:flex;align-items:center}

/* ===== Notas y avisos (Banners.md) ===== */
.nota{position:relative;background:var(--superficie);border:1px solid var(--filete);border-left:3px solid var(--acento);padding:14px}
.nota-rot{display:flex;align-items:center;gap:6px;margin-bottom:8px}
/* Banners.md a.2: el encabezado reserva paso 8 (32 px) de alto mínimo; con el relleno superior
   (14 px) suma más que el objetivo de descartar (44 px) y el texto arranca debajo de él. */
.nota-cerrable .nota-rot{padding-right:44px;min-height:32px}
.nota p+p{margin-top:12px}
.btn-contacto{display:inline-flex;align-items:center;gap:8px;height:44px;padding-inline:16px;margin-top:12px;max-width:100%}
.cerrar-esq{position:absolute;top:0;right:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center}

/* ===== Pedido de donación (DonationBox.md) ===== */
.don{border-color:var(--acento);padding:14px}
.don-regla{width:40%;height:1px;background:var(--filete);margin:0 auto 16px;align-self:center}
.don-tit{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.don-cerrable .don-tit{padding-right:44px}
.don-txt{margin-bottom:14px}
.don-montos{display:flex;gap:8px;margin-bottom:12px}
.monto{flex:1;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center}
.don-pie{text-align:center}

/* DON-P5, pedido de donación aprobado (usuario, 2026-10-11). Marco acento de border-2 (las marcas
   de esquina siguen sobresaliendo paso 1 del borde exterior: 6 px con el marco de 2 px). El panel
   no lleva relleno propio por franjas: la banda del encabezado (acentoBanda), el cuerpo y el pie
   (acentoFondo) llevan el suyo. Los montos conservan el relleno superficie de K2: sobre el tinte
   quedan separados del panel. */
.don5{border-width:2px;padding:0;background:var(--acentoFondo)}
.don5 .mk-a{top:-6px;left:-6px}.don5 .mk-b{top:-6px;right:-6px}.don5 .mk-c{bottom:-6px;left:-6px}.don5 .mk-d{bottom:-6px;right:-6px}
.don5-enc{display:flex;align-items:center;min-height:44px;padding:8px 14px;background:var(--acentoBanda);border-bottom:1px solid var(--acentoBanda)}
.don5-tit{display:flex;align-items:center;gap:8px}
.don5-cerrable .don5-tit{padding-right:44px}
.don5-cuerpo{padding:14px}
.don5-txt{margin-bottom:14px}
.don5-montos{display:flex;gap:8px}
.don5-pie{border-top:1px solid var(--filete);padding:8px 14px;text-align:center}
/* K7 sobre la banda: foco, hover y presionado en fondo y acentoBanda. El contorno de foco va hacia
   adentro: a ras del marco, hacia afuera caería sobre el marco y la página. */
.don5 .cerrar-esq{color:var(--fondo)}
@media (hover:hover){.don5 .cerrar-esq:hover{outline-color:var(--fondo)}}
.don5 .cerrar-esq:focus-visible{outline-color:var(--fondo);outline-offset:-4px}
.don5 .cerrar-esq:active{background:var(--fondo)}
.don5 .cerrar-esq:active *{color:var(--acentoBanda)}

/* Figura 09: DON-P1 y DON-P5 lado a lado (ocupa dos columnas del tablero) */
.fig-doble{grid-column:span 2}
.comparacion{display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start}
.comp-col{display:flex;flex-direction:column;gap:8px;width:calc(var(--w) + 2px);min-width:0}
.comp-tit{min-height:48px}
.comp-aviso{padding-top:8px}
.av-oscuro{display:none}
html[data-tema="oscuro"] .av-oscuro{display:inline}
html[data-tema="oscuro"] .av-claro{display:none}
.don-rot{padding-top:16px;padding-bottom:8px}

/* ===== 07 AddQuestion ===== */
.add-rot{padding-bottom:8px}
.add-grupo{margin-bottom:24px}
/* ADD-P3: selector de tema desplegable. Disparador K3 (padding paso 3, alto mínimo paso 11) y, abierto,
   lámina de comun.md §6 con filas K7 de alto mínimo paso 11 en una región de alto máximo paso 80 y
   relleno paso 1. La fila elegida es la regla 2.9-10 de comun.md §5.2: fondo tinta, texto fondo. */
.desp-disp{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;padding:12px;text-align:left}
.desp-nombre{flex:1;min-width:0;overflow-wrap:anywhere}
.desp-disp.abierto{border-color:var(--linea)}
.desp-disp:disabled{border-color:var(--filete);color:var(--inactivo)}
.desp-disp:disabled .g{color:var(--inactivo)}
.desp-lam{margin-top:8px}
.desp-lista{max-height:320px;overflow-y:auto;padding:4px;overscroll-behavior:contain}
.desp-fila{display:flex;align-items:center;width:100%;min-height:44px;padding:8px 12px;text-align:left;border-bottom:1px solid var(--filete);overflow-wrap:anywhere}
.desp-fila.ult{border-bottom:0}
.desp-fila.sel,.desp-fila.sel:hover{background:var(--tinta);color:var(--fondo);outline:0}
.fld{width:100%;background:var(--superficie);border:1px solid var(--borde);padding:12px;color:var(--tinta);overflow-wrap:anywhere}
@media (hover:hover){.fld:hover{border-color:var(--linea)}}
.fld-multi{min-height:80px}
.fld-op{flex:1;min-width:0;width:auto;min-height:44px}
.op-fila{display:flex;align-items:flex-start;gap:8px}
.op-fila+.op-fila{margin-top:10px}
.letra-k{width:44px;height:44px;flex:none;display:flex;align-items:center;justify-content:center}
.letra-k.ok{background:var(--acierto);border:2px solid var(--acierto);color:var(--fondo)}
.quitar{width:44px;height:44px;flex:none;display:flex;align-items:center;justify-content:center}
.add-ayuda{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-bottom:10px}
.add-agregar{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:44px;margin-top:10px}
.add-guardar{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px 16px}
.add-guardar.guardando{background:var(--fondo);color:var(--inactivo);border-color:var(--filete)}

/* ===== 08 Settings ===== */
.set-sec{margin-bottom:32px}
.set-panel{background:var(--superficie);border:1px solid var(--linea);padding:14px}
.set-fila{display:flex;align-items:center;gap:14px}
.set-txt{flex:1;min-width:0}
.set-txt>.t-detalle{margin-top:4px}
.seg-no{display:inline-flex;flex:none;border:1px solid var(--linea);background:var(--superficie)}
.seg-no .k4{min-width:44px;height:44px;padding-inline:12px;display:flex;align-items:center;justify-content:center;border:0}
.pleg{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:44px;padding:12px 14px}
.pleg.abierto{border-color:var(--linea)}
.pleg-der{display:inline-flex;align-items:center;gap:8px;flex:none}
.g-gira-abajo{transform:rotate(90deg)}
.g-gira-arriba{transform:rotate(-90deg)}
.set-cuerpo{margin-top:10px}
.pq-lista{display:flex;flex-direction:column;gap:10px}
.pq{background:var(--superficie);border:1px solid var(--linea);padding:14px}
.pq-enc{display:flex;justify-content:space-between;align-items:center;gap:8px}
.pq-del{width:44px;height:44px;flex:none;display:flex;align-items:center;justify-content:center}
.pq-enun{margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pq-ok{display:flex;align-items:center;gap:8px;margin-top:6px}
.pq-ok span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.set-resp{margin-bottom:10px}
.set-botones{display:flex;flex-direction:column;gap:8px}
.btn-set{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:44px;padding:10px 16px}
.set-div{margin-block:12px}
.k2-peligro{color:var(--error);border-color:var(--error)}
@media (hover:hover){.k2-peligro:hover{outline-color:var(--error)}}
.k2-peligro:active{background:var(--error);color:var(--fondo);border-color:var(--error)}
.k2-peligro:active *{color:var(--fondo)}
.acerca-fila{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:4px 8px}
.acerca-franja{border-top:1px solid var(--filete);margin-top:12px;padding-top:12px}
.acerca-des{margin-top:4px}
.acerca-enlaces{display:flex;flex-wrap:wrap;gap:8px}
.btn-enlace{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:10px 16px;text-align:left}

/* ===== 10 Revisión ===== */
.r-resumen{margin-top:4px}
.r-filtro{display:flex;gap:8px}
.r-filtro .filtro{flex:1;justify-content:center}
.r-lista{display:flex;flex-direction:column;gap:10px}
.r-card{background:var(--superficie);border:1px solid var(--linea);padding:14px}
.r-card.ok{border-left:3px solid var(--acierto)}
.r-card.mal{border-left:3px solid var(--error)}
.r-enc{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
.r-enun{margin-bottom:12px}
.r-opts{display:flex;flex-direction:column;gap:10px}
.r-op{display:flex;background:var(--superficie);border:1px solid var(--filete)}
.r-op .op-letra{color:var(--tintaSec)}
.r-op .op-txt{padding:10px 12px}
.r-op.ok{border:2px solid var(--acierto);background:var(--aciertoFondo)}
.r-op.ok .op-letra{background:var(--acierto);color:var(--fondo);border-right:2px solid var(--acierto)}
.r-op.mal{border:2px solid var(--error);background:var(--errorFondo)}
.r-op.mal .op-letra{background:var(--error);color:var(--fondo);border-right:2px solid var(--error)}
.r-card .q-nota{margin-top:12px}
.r-rep{display:inline-flex;align-items:center;gap:8px;min-height:44px;margin-top:8px}
.r-final{display:flex;gap:10px}
.r-final>*{flex:1}

/* ===== 12 Estados vacíos ===== */
.vac{padding:14px;text-align:center;display:flex;flex-direction:column;align-items:center}
.g.g-vacio{width:48px;height:48px;margin-top:16px}
.vac-tit{margin-top:16px}
.vac-txt{margin-top:8px}
.vac-btn{margin-top:20px;margin-bottom:16px;height:44px;padding-inline:32px;display:flex;align-items:center}
.vac-compacto{text-align:center;display:flex;flex-direction:column;align-items:center}
.vac-compacto .vac-btn{margin-top:12px;margin-bottom:0}

/* ===== 14 Inventario de glifos ===== */
.gl-rot{padding:16px 0 8px}
.gl-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--filete);border-left:1px solid var(--filete)}
.gl-celda{display:flex;align-items:center;gap:10px;padding:10px 12px;min-width:0;border-right:1px solid var(--filete);border-bottom:1px solid var(--filete);overflow-wrap:anywhere}
.gl-dib{width:24px;height:24px;display:flex;align-items:center;justify-content:center;flex:none}

/* ===== 3.10 Escritorio · ESC-P0 a ESC-P12, aprobadas salvo ESC-P9 (comun.md §7.2, tokens.md c.4) =====
   Solo las figuras E01 a E10, a 1366 px (corte "escritorio", desde 1024 px) y a 1920 px (corte
   "amplio", desde 1440 px). Las cuatro medidas de ancho son las de tokens.md c.4. Margen lateral
   paso 8 (32 px) y separación entre regiones paso 8 (32 px); entre tarjetas de una rejilla,
   paso 2.5 (10 px), como en el teléfono. */
:root{--lectura:600px;--lateral:320px;--hoja:952px;--hoja-amplia:1440px}
.fig-esc{display:none}
html[data-ancho="1366"] .fig-esc,html[data-ancho="1920"] .fig-esc{display:flex}
html[data-ancho="1366"] .fig:not(.fig-esc),html[data-ancho="1920"] .fig:not(.fig-esc){display:none}
.nav-esc{display:none}
html[data-ancho="1366"] .nav-esc,html[data-ancho="1920"] .nav-esc{display:inline-flex}
html[data-ancho="1366"] .nav-vig,html[data-ancho="1920"] .nav-vig{display:none}

/* contenido: ancho por superficie y margen lateral de escritorio */
.esc{--columna:var(--hoja)}
.esc[data-hoja="lec"]{--columna:var(--lectura)}
html[data-ancho="1920"] .esc[data-hoja="rej"]{--columna:var(--hoja-amplia)}
.esc .col{width:calc(100% - 64px);max-width:var(--columna);padding-inline:0}
.esc.quiz{min-height:640px}
html[data-ancho="1920"] .esc.quiz{min-height:960px}

/* regiones: la lateral, de ancho fijo; la principal, flexible (hasta "lectura" en "hoja") */
.regiones{display:flex;align-items:flex-start;gap:32px}
.esc .regiones .col{width:auto;max-width:none;margin-inline:0}
.reg-lat{flex:none;width:var(--lateral);min-width:0}
.reg-pri{flex:1;min-width:0}
.reg-pri .mezcla,.reg-pri .examen{margin-top:0}

/* panel de filtros de TopicSelect: los grupos en una fila, separados por un filete vertical */
.esc .panel{display:flex;align-items:flex-start;gap:0}
.esc .panel .grupo{flex:1 1 0;min-width:0}
.esc .panel .grupo:last-child{flex:none}
.esc .panel .divisor{width:1px;height:auto;align-self:stretch;margin:0 14px}
.esc .examen{max-width:var(--lectura);margin-inline:auto}
.esc .col.col-lec{max-width:var(--lectura)}

/* rejilla de tarjetas: 2 columnas desde "escritorio", 3 desde "amplio"; paso 4 entre celdas */
.rejilla{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
html[data-ancho="1920"] .rejilla{grid-template-columns:repeat(3,minmax(0,1fr))}
.rejilla .tarj{display:flex;flex-direction:column;height:100%}
.rejilla .tarj-fila{flex:1}

/* acciones de Home: 1 columna en "escritorio", 2 desde "amplio" */
.acc-lista{display:flex;flex-direction:column;gap:10px}
html[data-ancho="1920"] .acc-lista{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}

/* listas de filas con flujo por columnas: el orden de DOM baja por la primera columna y sigue por
   la siguiente. Temas y «Más falladas»: 2 columnas en "escritorio" y 3 desde "amplio". Filas por
   tema de Estadísticas: 1 columna en "escritorio" y 2 desde "amplio" */
.lista-cols .fila-tema,.esc .s-fila,.esc .f-fila{break-inside:avoid}
.lista-cols{columns:2;column-gap:32px}
html[data-ancho="1920"] .lista-cols{columns:3}
.esc .f-filas{columns:2;column-gap:32px}
html[data-ancho="1920"] .esc .f-filas{columns:3}
html[data-ancho="1920"] .esc .s-filas{columns:2;column-gap:32px}
`;

// ---------------------------------------------------------------------------
// Script del tablero: ancho y tema por hash (#390-claro). Sin dependencias.
// ---------------------------------------------------------------------------

const SCRIPT = String.raw`
(function () {
  var raiz = document.documentElement;
  var estado = { ancho: '390', tema: 'claro' };
  function desdeHash() {
    var m = /^#(390|768|1280|1366|1920)-(claro|oscuro)$/.exec(location.hash);
    if (m) { estado.ancho = m[1]; estado.tema = m[2]; }
  }
  function aplicar() {
    raiz.setAttribute('data-ancho', estado.ancho);
    raiz.setAttribute('data-tema', estado.tema);
    document.querySelectorAll('.tema-op').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.getAttribute('data-op') === estado.tema));
    });
    document.querySelectorAll('.herr [data-set]').forEach(function (b) {
      var par = b.getAttribute('data-set').split(':');
      b.setAttribute('aria-pressed', String(estado[par[0]] === par[1]));
    });
  }
  document.addEventListener('click', function (ev) {
    var set = ev.target.closest('[data-set]');
    if (set) {
      var par = set.getAttribute('data-set').split(':');
      estado[par[0]] = par[1];
      location.hash = estado.ancho + '-' + estado.tema;
      aplicar();
      return;
    }
    var ir = ev.target.closest('[data-ir]');
    if (ir) {
      var el = document.getElementById(ir.getAttribute('data-ir'));
      if (el) el.scrollIntoView({ block: 'start' });
    }
  });
  window.addEventListener('hashchange', function () { desdeHash(); aplicar(); });
  desdeHash();
  aplicar();
})();
`;

// ---------------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------------

const html = `<!doctype html>
<html lang="es" data-ancho="390" data-tema="claro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="generar.mjs · glifos ${glifosLeidos.size}/${GLIFOS.length} · huella ${huellaGlifos}">
<title>pKapp · Rediseño Plancha · Maqueta de pantallas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
${bloqueColores()}
${ESTILOS}
</style>
</head>
<body>
${sprite}
<header class="herr">
  <div class="herr-fila">
    <span class="t-rotulo-medio c-tinta">pKapp · Rediseño Plancha · Maqueta de pantallas</span>
    <div class="herr-grupo"><span class="t-rotulo c-sec">Ancho</span>
      <span class="seg"><button type="button" class="seg-op t-rotulo" data-set="ancho:390">390</button><button type="button" class="seg-op t-rotulo" data-set="ancho:768">768</button><button type="button" class="seg-op t-rotulo" data-set="ancho:1280">1280</button><button type="button" class="seg-op t-rotulo" data-set="ancho:1366">1366</button><button type="button" class="seg-op t-rotulo" data-set="ancho:1920">1920</button></span></div>
    <div class="herr-grupo"><span class="t-rotulo c-sec">Tema</span>
      <span class="seg"><button type="button" class="seg-op t-rotulo" data-set="tema:claro">Claro</button><button type="button" class="seg-op t-rotulo" data-set="tema:oscuro">Oscuro</button></span></div>
    <div class="herr-grupo"><span class="t-rotulo c-sec">Ir a</span><span class="seg">${navegacion}</span></div>
  </div>
  <div class="herr-nota t-rotulo c-sec">Fieles a las fichas aprobadas (1.2 y 1.3) y al pedido de donación DON-P5, aprobado el 2026-10-11 y todavía sin implementar; la figura 09 lo compara con DON-P1 · tokens nuevos, pendientes: acentoFondo y acentoBanda (derivados de colores.js) · colores generados desde src/theme/colores.js · conteos, temas y preguntas reales; resultados, estadísticas, preguntas propias y respuestas de revisión son datos de muestra · El campo de filamentos de MateriaSelect es V5 «Fusiforme» (elegida el 2026-10-11) y el selector de tema de AddQuestion, el desplegable de ADD-P3 (aprobada el 2026-10-11) · A 1366 y 1920 px el tablero muestra solo E01 a E10, el escritorio ESC-P0 a ESC-P12 (tarea 3.10, aprobado el 2026-10-11; ESC-P9 rechazada: AddQuestion en una columna lectura); a 1280 px muestra la columna única anterior al escritorio, para comparar</div>
</header>
<main class="tablero">
${FIGURAS.map(figura).join('\n')}
</main>
${panelFaltantes}
<script>${SCRIPT}</script>
</body>
</html>
`;

fs.writeFileSync(SALIDA, html);

// Control: ningún valor hexadecimal fuera del bloque generado.
const sinBloque = html.replace(/\/\* >>> GENERADO[\s\S]*?<<< FIN GENERADO \*\//, '');
const sueltos = sinBloque.match(/#[0-9a-fA-F]{6}\b/g) || [];
console.log(`maqueta.html escrita (${(html.length / 1024).toFixed(1)} kB)`);
console.log(`figuras: ${FIGURAS.length} · glifos dibujados: ${glifosLeidos.size}/${GLIFOS.length} · huella ${huellaGlifos}`);
if (faltantes.size) console.log('glifos faltantes: ' + [...faltantes].join(', '));
if (sueltos.length) {
  console.error('ERROR: hexadecimales fuera del bloque generado: ' + sueltos.join(', '));
  process.exitCode = 1;
}

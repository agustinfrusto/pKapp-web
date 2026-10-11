#!/usr/bin/env node
// Maqueta navegable de las pantallas del rediseño Plancha (change rediseno-plancha).
//
// Genera `maqueta.html` (un solo archivo, CSS y SVG inline) a partir de:
//   - src/theme/colores.js, export `plancha`  -> bloque de variables CSS (claro y oscuro);
//   - src/materias/*  (metadata, config, topics, questions, conteos) -> datos reales;
//   - diseno/svg/<id>.svg                      -> ilustraciones de materia;
//   - diseno/svg/glifos/                       -> glifos de §9 que existan; el resto
//                                                 queda como cuadrado de `filete` numerado;
//   - src/assets/filamentos.js                 -> campo de filamentos (solo MateriaSelect).
//
// La maqueta reproduce las fichas aprobadas de `diseno/pantallas/`; no propone nada.
// Los valores de color no se escriben en ninguna parte de este archivo: todo color sale de
// `plancha` y se referencia por variable CSS (`var(--tinta)`, ...).
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

function bloqueColores() {
  const decl = (t) => Object.entries(t).map(([k, v]) => `  --${k}: ${v};`).join('\n');
  return [
    '/* >>> GENERADO por generar.mjs desde src/theme/colores.js (export plancha). No editar a mano. */',
    ':root,\nhtml[data-tema="claro"] {',
    decl(plancha.claro),
    '}',
    'html[data-tema="oscuro"] {',
    decl(plancha.oscuro),
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

// Glifos de comun.md §9 usados por las seis pantallas: [id, tamaño].
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

const reservado = (texto) =>
  `<div class="reservado t-rotulo c-sec">${esc(texto)} · ver 1.3</div>`;

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

function pantallaMateriaSelect() {
  return `
<div class="pantalla" data-pantalla="MateriaSelect">
  ${headerMarca('<span class="t-rotulo c-sec">ESFUNO</span>')}
  <div class="col mt-1_5 mb-3">
    <section class="lam lamina">
      ${marcas}
      <div class="campo">${campoSvg}</div>
      <div class="regla">${reglaSvg()}</div>
      <div class="cajetin">
        <span class="t-marca c-tinta">pKapp</span>
        <span class="cajetin-der t-rotulo c-sec">Tus materias de ESFUNO<br>Elegí una para empezar</span>
      </div>
    </section>
  </div>
  <div class="col mb-3">${reservado('Nota del creador (condicional, reaparece cada siete días)')}</div>
  <div class="col mt-1_5"><div class="lista">${materias.map((m) => tarjetaMateria(m)).join('')}</div></div>
  <div class="col mt-6">${reservado('Bloque de donación (origen materias)')}</div>
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

function pantallaHome(m) {
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

  return `
<div class="pantalla" data-pantalla="Home">
  ${headerMarca(`<button type="button" class="k2 btn-cambiar t-cuerpo-fuerte c-tinta">${glifo('glifo-volver')}<span>Cambiar materia</span></button>`)}
  <div class="col mt-1_5">
    <section class="lam mat-card">
      ${marcas}
      <div class="mat-card-ilu">${ilustracion(m.id, 64)}</div>
      <div class="mat-card-txt">
        <span class="t-rotulo c-acento">${esc(m.idVisible)}</span>
        <span class="t-titulo c-tinta">${esc(m.name)}</span>
        <span class="t-detalle c-sec">${reales} preguntas reales · ${extra} preguntas extra</span>
      </div>
    </section>
  </div>
  ${m.bancoReducido ? `<div class="col mt-3">${reservado('Banner de banco reducido')}</div>` : ''}
  ${rotuloSeccion('Plano / Acciones', 'sec-4')}
  <div class="col"><div class="lista">${acciones.map(accion).join('')}</div></div>
  <div class="col mt-6"><p class="t-detalle c-sec nota-web">Tus estadísticas y preguntas se guardan localmente en tu navegador.<br>Se usan analíticas anónimas (sin cookies ni datos personales).</p></div>
  <div class="relleno-8"></div>
</div>`;
}

// ---------------------------------------------------------------------------
// 03 · TopicSelect
// ---------------------------------------------------------------------------

function panelFiltros(m, { timer = 0 } = {}) {
  const filtro = (txt, sel) =>
    `<button type="button" class="k4 filtro ${sel ? 't-cuerpo-fuerte sel' : 't-cuerpo c-tinta'}" aria-pressed="${sel}">${esc(txt)}</button>`;
  const parciales = m.config?.parciales;
  const grupoParcial = parciales ? `
    <div class="divisor"></div>
    <div class="grupo"><div class="t-rotulo c-sec grupo-rot">Parcial</div>
      <div class="filtros">${filtro('Examen', true)}${parciales.map((p) => filtro(p.label, false)).join('')}</div></div>` : '';
  const sinLimite = timer === 0;
  return `
<section class="panel">
  <div class="grupo"><div class="t-rotulo c-sec grupo-rot">Fuente</div>
    <div class="filtros">${filtro('Todas', true)}${filtro('Solo preguntas reales', false)}${filtro('Solo generadas', false)}</div></div>
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

function pantallaTopicSelect(m, modo) {
  const { total, porTema } = conteoPorTema(m.id);
  const cuerpoPractica = () => {
    const filas = Object.entries(m.TOPICS)
      .filter(([k]) => (porTema.get(k) || 0) > 0)
      .map(([k, nombre], i) => `
<button type="button" class="k7 fila-tema">
  <span class="t-rotulo c-sec fila-idx">${pad2(i + 1)}</span>
  <span class="fila-nom"><span class="t-item c-tinta">${esc(nombre)}</span><span class="t-detalle c-sec">${porTema.get(k)} preguntas</span></span>
  ${glifo('glifo-chevron', 'c-sec')}
</button>`).join('');
    return `
<div class="col"><button type="button" class="k6 mezcla">
  ${glifo('glifo-aleatorio', 'c-acento')}
  <span class="mezcla-txt"><span class="t-rotulo c-acento">Mezcla</span><span class="t-item c-tinta">Todos los temas mezclados</span><span class="t-detalle c-sec">${total} preguntas</span></span>
</button></div>
${rotuloSeccion('O elegí un tema específico:', 'sec-4')}
<div class="col"><div class="lista-temas">${filas}</div></div>`;
  };
  const cuerpoExamen = () => {
    const tam = Math.min(m.config?.examSize || 75, total);
    return `
<div class="col"><section class="lam examen">
  ${marcas}
  <h2 class="t-titulo c-tinta">Modo Examen</h2>
  <p class="t-cuerpo c-sec examen-sorteo">Se sortean ${tam} preguntas al azar de todos los temas, como en el examen real.</p>
  <p class="t-cuerpo-fuerte c-acento examen-disp">Disponibles: ${total} preguntas</p>
  <button type="button" class="k1 btn-examen t-cuerpo-fuerte">Comenzar examen</button>
</section></div>`;
  };
  return `
<div class="pantalla" data-pantalla="TopicSelect-${modo}">
  ${barraInterna('pKapp · Elegir tema')}
  <div class="col mt-4">${panelFiltros(m)}</div>
  ${modo === 'practice' ? cuerpoPractica() : cuerpoExamen()}
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

function pantallaQuiz(opts) {
  const { materia, pregunta, indice, total, respuesta = null, tiempo = null, alerta = false } = opts;
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
    if (respondida) {
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
    <div class="col q-ctx">${chipOrigen(pregunta.source, pregunta.exam)}<span class="t-rotulo c-sec q-meta">${esc(materia.shortName)} · ${esc(tema)}</span></div>
    <div class="col"><section class="q-enunciado"><div class="t-rotulo c-sec">Enunciado</div><p class="t-titulo c-tinta">${esc(pregunta.question)}</p></section></div>
    <div class="col"><div class="q-opciones">${opciones}</div></div>
    ${respondida ? `
    <div class="col"><aside class="q-nota"><div class="q-nota-rot t-rotulo c-acento">${glifo('glifo-explicacion')}<span>Nota / Explicación</span></div><p class="t-cuerpo c-tinta">${esc(pregunta.explanation)}</p></aside></div>
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

function pantallaResults({ respuestas, topic }) {
  const total = respuestas.length;
  const correctas = respuestas.filter(Boolean).length;
  const pct = total ? Math.round((correctas / total) * 100) : 0;
  const { banda, msg } = feedback(pct);
  const b = BANDA[banda];
  const tira = total <= 40 ? `
    <div class="tira" role="img" aria-label="Detalle por pregunta">${respuestas.map((ok) => `<i class="${ok ? 'c' : 'i'}"></i>`).join('')}</div>
    <div class="leyenda t-rotulo c-sec"><span><i class="sw sw-c"></i>Correcta</span><span><i class="sw sw-i"></i>Incorrecta</span></div>` : '';
  return `
<div class="pantalla" data-pantalla="Results">
  ${barraInterna('pKapp · Resultados', false)}
  <div class="col mt-4 mb-3">
    <section class="lam res">
      ${marcas}
      <div class="t-rotulo c-sec res-rot">Resultado</div>
      <div class="res-pct ${b.clase}">${glifo(b.glifo, '', 24)}<span class="t-display">${pct}%</span></div>
      <div class="t-titulo c-tinta res-sub">${correctas} de ${total} correctas</div>
      <div class="t-cuerpo c-sec res-msg">${esc(msg)}</div>
      ${tira}
      <span class="chip chip-tema t-rotulo">${esc(topic)}</span>
    </section>
  </div>
  <div class="col mb-3">
    <section class="lam trio">
      ${marcas}
      <div class="trio-celda"><span class="t-cifra c-acierto">${correctas}</span><span class="t-rotulo c-sec trio-rot">${glifo('glifo-acierto')}Correctas</span></div>
      <div class="trio-celda"><span class="t-cifra c-error">${total - correctas}</span><span class="t-rotulo c-sec trio-rot">${glifo('glifo-error')}Incorrectas</span></div>
      <div class="trio-celda"><span class="t-cifra c-tinta">${total}</span><span class="t-rotulo c-sec trio-rot">Total</span></div>
    </section>
  </div>
  <div class="col mb-3">${reservado('Pedido de donación (condicional, solo web)')}</div>
  <div class="col mt-1_5"><div class="botones">
    <button type="button" class="k2 k2-acento btn-res t-cuerpo-fuerte">${glifo('glifo-revisar')}<span>Revisar todas las respuestas</span></button>
    <button type="button" class="k1 btn-res t-cuerpo-fuerte">${glifo('glifo-reintentar')}<span>Volver a practicar</span></button>
    <button type="button" class="k2 btn-res t-cuerpo-fuerte c-tinta">${glifo('glifo-inicio')}<span>Inicio</span></button>
  </div></div>
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

function pantallaStats(m) {
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
  return `
<div class="pantalla" data-pantalla="Stats">
  ${barraInterna('pKapp · Estadísticas')}
  <div class="col mt-4 mb-3">
    <section class="lam glob">
      ${marcas}
      <div class="glob-rot ${bg.clase}">${glifo(bg.glifo)}<span class="t-rotulo c-sec">Aciertos globales</span></div>
      <div class="t-display glob-pct ${bg.clase}">${pctGlobal}%</div>
      <div class="t-cuerpo c-sec glob-det">${totalAciertos} aciertos de ${totalRespuestas} respuestas</div>
    </section>
  </div>
  ${rotuloSeccion('Por tema', 'sec-4')}
  <div class="col"><div class="leyenda-bandas">${item(BANDA.alta, '≥ 80 %')}${item(BANDA.media, '60–79 %')}${item(BANDA.baja, '&lt; 60 %')}</div></div>
  <div class="col"><div class="s-filas">${filas.join('')}</div></div>
  ${rotuloSeccion('Más falladas', 'sec-6')}
  <div class="col"><div class="f-filas">${falladas}</div></div>
  <div class="relleno-8"></div>
</div>`;
}

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
  { id: '05a', titulo: 'Resultados · tramo alto', ficha: 'Results.md · d.1', html: pantallaResults({ respuestas: alto, topic: 'Todos los temas' }) },
  { id: '05b', titulo: 'Resultados · tramo medio', ficha: 'Results.md · d.1', html: pantallaResults({ respuestas: medio, topic: qHistologia.topic }) },
  { id: '05c', titulo: 'Resultados · tramo bajo', ficha: 'Results.md · d.1', html: pantallaResults({ respuestas: bajo, topic: 'Todos los temas' }) },
  { id: '06', titulo: `Estadísticas · ${cyr.shortName}`, ficha: 'Stats.md', html: pantallaStats(cyr) },
  { id: '01b', titulo: 'Tarjeta de materia · estados', ficha: 'MateriaSelect.md · c', html: pantallaEstadosTarjeta() },
  { id: '04e', titulo: 'Chip de origen de la pregunta', ficha: 'Quiz.md · c.3', html: pantallaOrigen() },
];

const figura = (f) => `
<figure class="fig" id="fig-${f.id}">
  <figcaption>
    <span class="t-rotulo-medio c-tinta">${f.id} · ${esc(f.titulo)}</span>
    <span class="fig-ficha c-sec">${esc(f.ficha)} · <span class="txt-ancho"></span> · <span class="txt-tema"></span></span>
  </figcaption>
  ${f.html}
</figure>`;

const navegacion = FIGURAS.map((f) => `<button type="button" class="seg-op t-rotulo" data-ir="fig-${f.id}">${f.id}</button>`).join('');

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
html[data-tema="claro"] .herr [data-set="tema:claro"],html[data-tema="oscuro"] .herr [data-set="tema:oscuro"]{background:var(--tinta);color:var(--fondo)}
.herr-nota{padding:0 24px 12px}

/* ===== tablero ===== */
.tablero{display:grid;grid-template-columns:repeat(auto-fill,calc(var(--w) + 2px));justify-content:start;align-items:start;gap:36px 24px;padding:24px}
.fig{display:flex;flex-direction:column;gap:8px;min-width:0;scroll-margin-top:72px}
.fig figcaption{display:flex;flex-direction:column;gap:2px}
.fig-ficha{font:400 11px/16px var(--mono);letter-spacing:.2px}
.txt-ancho::before{content:"390 px"}
html[data-ancho="768"] .txt-ancho::before{content:"768 px"}
html[data-ancho="1280"] .txt-ancho::before{content:"1280 px"}
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
.reservado{border:1px solid var(--filete);padding:12px 14px;text-align:center}
.sec-rotulo{padding-bottom:8px}.sec-4{padding-top:16px}.sec-6{padding-top:24px}
.divisor{height:1px;background:var(--filete);margin-block:14px}
.estados{display:flex;flex-direction:column;gap:16px;padding-block:16px}
.estado{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.estado>.k6{width:100%}

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
.tema{display:inline-flex;height:44px;border:1px solid var(--linea);background:var(--fondo)}
.tema-op{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:44px;padding-inline:8px;background:var(--fondo);color:var(--tinta)}
html[data-tema="claro"] .tema-op[data-op="claro"],html[data-tema="oscuro"] .tema-op[data-op="oscuro"]{background:var(--tinta);color:var(--fondo)}
@media (hover:hover){.tema-op:hover{outline:1px solid var(--linea);outline-offset:-1px}}
.tema-op:active{background:var(--tinta);color:var(--fondo)}
.btn-cambiar{display:inline-flex;align-items:center;gap:8px;height:44px;padding-inline:12px;background:var(--fondo)}

/* ===== barra interna (comun.md §3) ===== */
.barra-int{background:var(--fondo);border-bottom:1px solid var(--linea)}
.barra-int-fila{display:flex;align-items:center;gap:14px;padding-block:16px}
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
.filtro{height:44px;padding-inline:12px;display:flex;align-items:center}
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
`;

// ---------------------------------------------------------------------------
// Script del tablero: ancho y tema por hash (#390-claro). Sin dependencias.
// ---------------------------------------------------------------------------

const SCRIPT = String.raw`
(function () {
  var raiz = document.documentElement;
  var estado = { ancho: '390', tema: 'claro' };
  function desdeHash() {
    var m = /^#(390|768|1280)-(claro|oscuro)$/.exec(location.hash);
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
      <span class="seg"><button type="button" class="seg-op t-rotulo" data-set="ancho:390">390</button><button type="button" class="seg-op t-rotulo" data-set="ancho:768">768</button><button type="button" class="seg-op t-rotulo" data-set="ancho:1280">1280</button></span></div>
    <div class="herr-grupo"><span class="t-rotulo c-sec">Tema</span>
      <span class="seg"><button type="button" class="seg-op t-rotulo" data-set="tema:claro">Claro</button><button type="button" class="seg-op t-rotulo" data-set="tema:oscuro">Oscuro</button></span></div>
    <div class="herr-grupo"><span class="t-rotulo c-sec">Ir a</span><span class="seg">${navegacion}</span></div>
  </div>
  <div class="herr-nota t-rotulo c-sec">Fieles a las fichas aprobadas el ${FECHA_FICHAS} · colores generados desde src/theme/colores.js · conteos, temas y preguntas reales; resultados y estadísticas son datos de muestra</div>
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

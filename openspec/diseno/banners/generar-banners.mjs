#!/usr/bin/env node
// Prototipo de la tarea 3.14 (change rediseno-plancha): banners con varios mensajes.
//
// Genera `banners.html` (un solo archivo, CSS, SVG y JS inline) con BAN-P2, el carrusel
// automático con botón de pausa, funcionando de verdad. El usuario la eligió el 2026-10-11
// (Banners.md §3.14); BAN-P3 (uno a la vez, manual) y BAN-P4 (apilados) no se eligieron y
// salieron del prototipo en 3.14b. El estado manual que dibujaba BAN-P3 es el de BAN-P2 al
// terminar la vuelta o con movimiento reducido.
// Se ve en MateriaSelect y en Home, en claro y en oscuro, a 320, 390 y 1366 px (a 1366, la
// región lateral de ESC-P1 y ESC-P2), más una lámina de estados.
//
// Fuentes de verdad, como la maqueta de 3.x (`../maqueta/generar.mjs`, de la que copia lo mínimo):
//   - src/theme/colores.js, export `plancha`  -> variables CSS (ningún color se escribe acá);
//   - src/materias/*  (metadata, conteos)     -> tarjetas con datos reales;
//   - diseno/svg/<id>.svg                     -> ilustraciones de materia;
//   - diseno/svg/glifos/ y ./glifos/          -> glifos de comun.md §9 y los dos de BAN-P2;
//   - src/assets/filamentos.js                -> campo de filamentos (lámina de MateriaSelect).
//
// Los mensajes del prototipo salen de `MENSAJES`, una lista declarativa con los campos de
// `design.md` D11 (id, rótulo, glifo, párrafos, contacto, pantallas, descartable). El primero es el
// texto vigente de la nota del creador (`MateriaSelectScreen.js`); los otros dos son de muestra.
//
// Uso: node openspec/diseno/banners/generar-banners.mjs
// Sin dependencias. Sin red: las fuentes salen de src/assets/fuentes.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DISENO = path.resolve(AQUI, '..');
const RAIZ = path.resolve(AQUI, '..', '..', '..');
const SALIDA = path.join(AQUI, 'banners.html');
const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

async function cargarModulo(ruta, reemplazos = []) {
  let texto = fs.readFileSync(ruta, 'utf8');
  for (const [re, por] of reemplazos) texto = texto.replace(re, por);
  return import('data:text/javascript;base64,' + Buffer.from(texto).toString('base64'));
}

// ---------------------------------------------------------------------------
// Colores: generados desde `plancha`
// ---------------------------------------------------------------------------

const { plancha } = require(path.join(RAIZ, 'src/theme/colores.js'));
const decl = (t) => Object.entries(t).map(([k, v]) => `  --${k}: ${v};`).join('\n');
const BLOQUE_COLORES = [
  '/* >>> GENERADO por generar-banners.mjs desde src/theme/colores.js (export plancha). No editar a mano. */',
  ':root,\nhtml[data-tema="claro"] {', decl(plancha.claro), '}',
  'html[data-tema="oscuro"] {', decl(plancha.oscuro), '}',
  '/* <<< FIN GENERADO */',
].join('\n');

// ---------------------------------------------------------------------------
// Datos reales: materias y conteos
// ---------------------------------------------------------------------------

const textoIndice = fs.readFileSync(path.join(RAIZ, 'src/materias/index.js'), 'utf8');
const regionLista = /MATERIA_LIST\s*=\s*\[([\s\S]*?)\]\s*\.map/.exec(textoIndice)[1];
const ordenMaterias = [...regionLista.matchAll(/\[\s*(\w+)\s*,/g)].map((m) => m[1]);
const { CONTEOS } = await cargarModulo(path.join(RAIZ, 'src/materias/conteos.js'));
const pad2 = (n) => String(n).padStart(2, '0');

const materias = [];
for (const [i, id] of ordenMaterias.entries()) {
  const { metadata } = await cargarModulo(
    path.join(RAIZ, 'src/materias', id, 'metadata.js'), [[/require\([^)]*\)/g, 'null']]);
  materias.push({ ...metadata, preguntas: CONTEOS[id] ?? 0, idVisible: `${metadata.shortName} · ${pad2(i + 1)}` });
}
const porId = Object.fromEntries(materias.map((m) => [m.id, m]));

// ---------------------------------------------------------------------------
// SVG: ilustraciones, campo de filamentos y glifos (misma técnica que la maqueta)
// ---------------------------------------------------------------------------

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
function leerSvg(texto) {
  const limpio = texto
    .replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<title[\s\S]*?<\/title>/gi, '')
    .replace(/<desc[\s\S]*?<\/desc>/gi, '').trim();
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

const ilustraciones = {};
for (const m of materias) {
  const archivo = path.join(DISENO, 'svg', `${m.id}.svg`);
  if (fs.existsSync(archivo)) ilustraciones[m.id] = leerSvg(fs.readFileSync(archivo, 'utf8'));
}
const ilustracion = (id, lado) =>
  `<svg class="ilu" width="${lado}" height="${lado}" aria-hidden="true" focusable="false"><use href="#ilu-${id}"/></svg>`;

const { ilustracion: campo } = await cargarModulo(path.join(RAIZ, 'src/assets/filamentos.js'));
function elementoSvg(el) {
  const attrs = Object.entries(el.props).filter(([k]) => k !== 'relleno')
    .map(([k, v]) => `${kebab(k)}="${esc(v)}"`).join(' ');
  const clase = el.tono === 'acento' ? ' class="cont"' : '';
  return `<${el.tipo}${clase} ${attrs}${el.props.relleno ? ' fill="currentColor"' : ''}/>`;
}
const campoSvg =
  `<svg viewBox="${campo.viewBox}" preserveAspectRatio="none" fill="none" stroke="currentColor" ` +
  `stroke-width="${campo.trazo.ancho}" stroke-linejoin="${campo.trazo.union}" stroke-linecap="${campo.trazo.extremo}" ` +
  `aria-hidden="true" focusable="false">${campo.elementos.map(elementoSvg).join('')}</svg>`;

// Glifos: los de comun.md §9 que usan estas figuras; `glifo-pausar` y `glifo-reanudar` (BAN-P2,
// aprobada) ya están en el inventario y en diseno/svg/glifos/; la copia de ./glifos/ queda como
// fuente que lee la implementación y es el respaldo si falta la del inventario.
const GLIFOS = {
  'glifo-volver': 24, 'glifo-chevron': 16, 'glifo-cerrar': 24, 'glifo-claro': 16, 'glifo-oscuro': 16,
  'glifo-mensaje': 16, 'glifo-explicacion': 16, 'glifo-banco-reducido': 16, 'glifo-correo': 16,
  'glifo-practicar': 24, 'glifo-examen': 24, 'glifo-repasar': 24, 'glifo-estadisticas': 24,
  'glifo-agregar': 24, 'glifo-ajustes': 24, 'glifo-pausar': 16, 'glifo-reanudar': 16,
};
const glifosLeidos = new Map();
for (const id of Object.keys(GLIFOS)) {
  const ruta = [path.join(DISENO, 'svg', 'glifos', `${id}.svg`), path.join(AQUI, 'glifos', `${id}.svg`)]
    .find((r) => fs.existsSync(r));
  if (!ruta) throw new Error(`Falta el glifo ${id}`);
  glifosLeidos.set(id, leerSvg(fs.readFileSync(ruta, 'utf8')));
}
// `lado`: tamaño en px de la figura. Trazo visible de 1,5 px a cualquier lado: 24 / lado (CD-9).
function glifo(id, extra = '', lado) {
  const px = lado ?? GLIFOS[id];
  const svg = glifosLeidos.get(id);
  const pres = { ...svg.pres, 'stroke-width': String(+(24 / px).toFixed(3)) };
  return `<svg class="g ${px === 24 ? 'g-grande' : 'g-chico'}${extra ? ' ' + extra : ''}" viewBox="${esc(svg.viewBox)}" ` +
    `${presAttrs(pres)} aria-hidden="true" focusable="false">${svg.interior}</svg>`;
}

// ---------------------------------------------------------------------------
// Mensajes del prototipo (lista declarativa; campos del Ingeniero)
// ---------------------------------------------------------------------------

const CORREO = 'pkappsoporte@gmail.com';
const MENSAJES = [
  {
    id: 'nota-creador', rotulo: 'Una nota del creador', glifo: 'glifo-mensaje',
    // Texto vigente en src/screens/MateriaSelectScreen.js (commit 6dbb47a, 1.7.3).
    parrafos: ['¡Hola! Ya están las seis materias. Ahora estoy trabajando en la estética de la página, así que en las próximas semanas vas a ir viendo cambios en el diseño. ¡Gracias por la paciencia!'],
    pantallas: ['materias'], descartable: true,
  },
  {
    id: 'muestra-propias', rotulo: 'Novedades', glifo: 'glifo-explicacion',
    parrafos: ['Ya podés agregar tus propias preguntas y repasarlas con el filtro «Solo mías» del selector de temas.'],
    pantallas: ['materias', 'home'], descartable: true,
  },
  {
    id: 'muestra-contacto', rotulo: 'Ayudame a mejorar', glifo: 'glifo-mensaje',
    parrafos: ['Si encontraste un error en una pregunta o tenés una idea para la app, escribime a'],
    contacto: CORREO, pantallas: ['materias', 'home'], descartable: true,
  },
];
const SIN_CERRAR = {
  id: 'muestra-fija', rotulo: 'Aviso del sistema', glifo: 'glifo-mensaje',
  parrafos: ['Este mensaje no se puede descartar: se retira solo cuando vence su vigencia.'],
  pantallas: ['materias'], descartable: false,
};

// Banco reducido: queda aparte del sistema (siempre visible, sin descartar; D6).
const BANCO_REDUCIDO = {
  rotulo: 'Banco más reducido', glifo: 'glifo-banco-reducido',
  parrafos: [
    'Esta materia tiene menos preguntas que las anteriores porque tuve acceso a menos prototipos de examen.',
    'Si tenés material para aportar, escribime a',
  ],
  contacto: CORREO,
};

// ---------------------------------------------------------------------------
// Componentes de pantalla (copia mínima de la maqueta)
// ---------------------------------------------------------------------------

const marcas = '<i class="mk mk-a"></i><i class="mk mk-b"></i><i class="mk mk-c"></i><i class="mk mk-d"></i>';

const controlTema = () => `
<div class="tema" role="radiogroup" aria-label="Modo oscuro">
  <button type="button" class="tema-op" role="radio" data-op="claro">${glifo('glifo-claro')}<span class="t-rotulo">Claro</span></button>
  <button type="button" class="tema-op" role="radio" data-op="oscuro">${glifo('glifo-oscuro')}<span class="t-rotulo">Oscuro</span></button>
</div>`;
const headerMarca = (izquierda) => `
<header class="cab"><div class="col cab-fila"><div class="cab-izq">${izquierda}</div>${controlTema()}</div></header>`;

function tarjetaMateria(m) {
  return `
<button type="button" class="lam k6 tarj" aria-label="${esc(m.name)}">
  ${marcas}
  <span class="tarj-fila">
    <span class="tarj-ilu">${ilustracion(m.id, 48)}</span>
    <span class="tarj-txt"><span class="t-rotulo c-acento">${esc(m.idVisible)}</span><span class="t-item c-tinta">${esc(m.name)}</span></span>
  </span>
  <span class="tarj-caj"><span class="celda"><span class="t-rotulo-medio c-tinta">${m.preguntas}</span> <span class="t-rotulo c-sec">preguntas</span></span></span>
</button>`;
}

const reglaSvg = `<svg aria-hidden="true" focusable="false" width="100%" height="9">
  <rect width="100%" height="9" fill="url(#regla-menor)"/><rect width="100%" height="9" fill="url(#regla-mayor)"/></svg>`;
const laminaMarca = () => `
<section class="lam lamina">
  ${marcas}
  <div class="campo">${campoSvg}</div>
  <div class="regla">${reglaSvg}</div>
  <div class="cajetin">
    <span class="t-marca c-tinta">pKapp</span>
    <span class="cajetin-der t-rotulo c-sec">Tus materias de ESFUNO<br>Elegí una para empezar</span>
  </div>
</section>`;

function tarjetaHome(m) {
  return `
<section class="lam mat-card">
  ${marcas}
  <div class="mat-card-ilu">${ilustracion(m.id, 64)}</div>
  <div class="mat-card-txt">
    <span class="t-rotulo c-acento">${esc(m.idVisible)}</span>
    <span class="t-titulo c-tinta">${esc(m.name)}</span>
    <span class="t-detalle c-sec">${m.preguntas} preguntas reales</span>
  </div>
</section>`;
}
const ACCIONES = [
  { g: 'glifo-practicar', t: 'Entrena Temas/Parciales', d: 'Crea tu propio test eligiendo temas o practica para los parciales', primaria: true },
  { g: 'glifo-examen', t: 'Modo examen', d: '75 preguntas al azar como en el parcial real' },
  { g: 'glifo-repasar', t: 'Repasar fallos', d: 'Preguntas que te costaron antes' },
];
const accion = (a) => `
<button type="button" class="k3 accion${a.primaria ? ' prim' : ''}">
  <span class="ico">${glifo(a.g)}</span>
  <span class="accion-txt"><span class="t-item c-tinta">${esc(a.t)}</span><span class="t-detalle c-sec">${esc(a.d)}</span></span>
  ${glifo('glifo-chevron', 'c-sec')}
</button>`;
const cambiarMateria = `<button type="button" class="k2 btn-cambiar t-cuerpo-fuerte c-tinta" aria-label="Cambiar materia">${glifo('glifo-volver')}<span>Cambiar materia</span></button>`;

// ---------------------------------------------------------------------------
// Sistema de avisos (BAN-P2)
// ---------------------------------------------------------------------------

const cerrarEsquina = (nombre) =>
  `<button type="button" class="k7 cerrar-esq" aria-label="${esc(nombre)}">${glifo('glifo-cerrar', 'c-sec', 24)}</button>`;

const contactoBoton = (correo) =>
  `<button type="button" class="k2 k2-acento btn-contacto t-cuerpo-fuerte" aria-label="Escribir a ${esc(correo)}">${glifo('glifo-correo')}<span>${esc(correo)}</span></button>`;

// Cuerpo de un mensaje: Cerrar primero en el DOM (orden de foco = visual: Cerrar, contacto).
function cuerpo(m, { cerrar = '' } = {}) {
  return `${cerrar}
  <div class="nota-rot t-rotulo c-acento">${glifo(m.glifo)}<span>${esc(m.rotulo)}</span></div>
  ${m.parrafos.map((p) => `<p class="t-cuerpo c-tinta">${esc(p)}</p>`).join('')}
  ${m.contacto ? contactoBoton(m.contacto) : ''}`;
}

// «Uno solo»: la nota de siempre, sin pie ni contador (idéntica a hoy; D10).
const notaSola = (m, extra = '') => `
<aside class="nota${m.descartable ? ' nota-cerrable' : ''}"${extra}>${cuerpo(m, { cerrar: m.descartable ? cerrarEsquina('Cerrar nota') : '' })}
</aside>`;

const botonPausa = (pausado) => `
<button type="button" class="k2 btn-pausa t-cuerpo-fuerte c-tinta" aria-label="${pausado ? 'Reanudar avisos' : 'Pausar avisos'}">
  <span class="pa-g">${glifo(pausado ? 'glifo-reanudar' : 'glifo-pausar')}</span><span class="pa-t">${pausado ? 'Reanudar' : 'Pausar'}</span>
</button>`;
const pasoControl = (dir) =>
  `<button type="button" class="k5 car-paso-btn" data-paso="${dir}" aria-label="${dir < 0 ? 'Nota anterior' : 'Nota siguiente'}">` +
  `${glifo('glifo-chevron', dir < 0 ? 'giro-180' : '')}</button>`;
// `terminado`: la vuelta llegó a la última nota; no hay nada que pausar y desaparece «Pausar».
const pie = ({ terminado = false, pausado = false, i = 1, n }) => `
<div class="car-pie">
  ${terminado ? '<span class="car-hueco"></span>' : botonPausa(pausado)}
  <div class="car-paso">${pasoControl(-1)}<span class="car-cont t-rotulo c-sec" aria-label="Nota ${i} de ${n}">${i} de ${n}</span>${pasoControl(1)}</div>
</div>`;

// Una nota a la vez. Las N notas comparten una celda de rejilla: la región mide lo que la más alta
// y no salta al avanzar. `activo`: índice visible. `pausado`, `terminado` y `estatico`: para láminas.
function carrusel(lista, { activo = 0, pausado = false, terminado = false, estatico = false } = {}) {
  const n = lista.length;
  const slides = lista.map((m, k) => `
    <div class="slide${k === activo ? ' activo' : ''}${m.descartable ? ' cerrable' : ''}" role="group" aria-roledescription="nota" aria-label="${k + 1} de ${n}" tabindex="-1" data-id="${esc(m.id)}">${
      cuerpo(m, { cerrar: m.descartable ? cerrarEsquina('Cerrar nota') : '' })}
    </div>`).join('');
  return `
<section class="avisos avisos-car" data-modo="A" role="region" aria-roledescription="carrusel" aria-label="Avisos"${estatico ? ' data-estatico' : ''}>
  <div class="nota">
    <div class="car-slides" aria-live="${!pausado && !terminado ? 'off' : 'polite'}" aria-atomic="false">${slides}
    </div>${pie({ terminado, pausado, i: activo + 1, n })}
  </div>
</section>`;
}

// Región de avisos de una pantalla: 0 mensajes, nada (sin hueco); 1, la nota sola; 2 o más, el carrusel.
function avisos(pantalla, { lista = MENSAJES, opciones = {} } = {}) {
  const vigentes = lista.filter((m) => m.pantallas.includes(pantalla));
  if (!vigentes.length) return '';
  if (vigentes.length === 1) return `<div class="avisos avisos-uno" data-modo="uno">${notaSola(vigentes[0])}</div>`;
  return carrusel(vigentes, opciones);
}

const bancoReducido = () => `
<aside class="nota" data-banco-reducido>${cuerpo(BANCO_REDUCIDO)}
</aside>`;

// ---------------------------------------------------------------------------
// Pantallas
// ---------------------------------------------------------------------------

const rotuloSeccion = (t, extra = '') => `<div class="col"><div class="t-rotulo c-acento sec-rotulo ${extra}">${esc(t)}</div></div>`;

function pantallaMaterias(opciones) {
  return `
<div class="pantalla" data-pantalla="MateriaSelect">
  ${headerMarca('<span class="t-rotulo c-sec">ESFUNO</span>')}
  <div class="col mt-1_5 mb-3">${laminaMarca()}</div>
  <div class="col mb-3">${avisos('materias', { opciones })}</div>
  <div class="col mt-1_5"><div class="lista">${materias.slice(0, 2).map(tarjetaMateria).join('')}</div></div>
  <div class="relleno-6"></div>
</div>`;
}
function pantallaHome(opciones) {
  const av = avisos('home', { opciones });
  return `
<div class="pantalla" data-pantalla="Home">
  ${headerMarca(cambiarMateria)}
  <div class="col mt-1_5">${tarjetaHome(porId.cyr)}</div>
  <div class="col mt-3">${bancoReducido()}</div>
  ${av ? `<div class="col mt-3">${av}</div>` : ''}
  ${rotuloSeccion('Plano / Acciones', 'sec-4')}
  <div class="col"><div class="lista">${ACCIONES.map(accion).join('')}</div></div>
  <div class="relleno-6"></div>
</div>`;
}
function escMaterias(opciones) {
  return `
<div class="pantalla esc" data-pantalla="MateriaSelect">
  ${headerMarca('<span class="t-rotulo c-sec">ESFUNO</span>')}
  <div class="col mt-1_5"><div class="regiones">
    <div class="reg-lat">${laminaMarca()}<div class="mt-3">${avisos('materias', { opciones })}</div></div>
    <div class="reg-pri"><div class="rejilla">${materias.slice(0, 4).map(tarjetaMateria).join('')}</div></div>
  </div></div>
  <div class="relleno-6"></div>
</div>`;
}
function escHome(opciones) {
  const av = avisos('home', { opciones });
  return `
<div class="pantalla esc" data-pantalla="Home">
  ${headerMarca(cambiarMateria)}
  <div class="col mt-1_5"><div class="regiones">
    <div class="reg-lat">${tarjetaHome(porId.cyr)}<div class="mt-3">${bancoReducido()}</div>${av ? `<div class="mt-3">${av}</div>` : ''}</div>
    <div class="reg-pri"><div class="t-rotulo c-acento sec-rotulo">Plano / Acciones</div><div class="lista">${ACCIONES.map(accion).join('')}</div></div>
  </div></div>
  <div class="relleno-6"></div>
</div>`;
}

const fig = (id, titulo, sub, html) => `
<figure class="fig" id="fig-${id}">
  <figcaption><span class="t-rotulo-medio c-tinta">${esc(titulo)}</span><span class="t-rotulo c-sec">${sub}</span></figcaption>
  ${html}
</figure>`;

// Tableros por ancho: MateriaSelect y Home lado a lado (320 y 390) o apiladas (1366).
function tableroTelefono(ancho) {
  return `<div class="tab tab-${ancho}">
<section class="fila-tab"><h2 class="t-rotulo-medio c-tinta fila-tit">BAN-P2 · Carrusel automático · ${ancho} px</h2>
  <div class="tablero-col">
    ${fig(`ms-${ancho}`, 'MateriaSelect', 'N = 3 · avanza solo, con pausa', pantallaMaterias())}
    ${fig(`ho-${ancho}`, 'Home', 'N = 2 · el banco reducido queda aparte', pantallaHome())}
  </div></section>
</div>`;
}
function tableroEscritorio() {
  return `<div class="tab tab-1366">
<section class="fila-tab"><h2 class="t-rotulo-medio c-tinta fila-tit">BAN-P2 · Carrusel automático · 1366 px · región lateral (ESC-P1 y ESC-P2)</h2>
  <div class="tablero-fila">
    ${fig('ms-1366', 'MateriaSelect', 'N = 3 · ESC-P1', escMaterias())}
    ${fig('ho-1366', 'Home', 'N = 2 · ESC-P2', escHome())}
  </div></section>
</div>`;
}

// Región lateral de escritorio sola (ESC-P1 y ESC-P2): 320 px de ancho fijo desde 1024 px.
function tableroLateral() {
  const lat = (html) => `<div class="pantalla pantalla-lat"><div class="lat-int">${html}</div></div>`;
  const ms = lat(`${laminaMarca()}<div class="mt-3">${avisos('materias')}</div>`);
  const av = avisos('home');
  const ho = lat(`${tarjetaHome(porId.cyr)}<div class="mt-3">${bancoReducido()}</div>${av ? `<div class="mt-3">${av}</div>` : ''}`);
  return `<div class="tab tab-lateral">
<section class="fila-tab"><h2 class="t-rotulo-medio c-tinta fila-tit">BAN-P2 · región lateral · 320 px de ancho fijo (ESC-P1 y ESC-P2)</h2>
  <div class="tablero-col">
    ${fig('lat-ms', 'MateriaSelect', 'N = 3', ms)}
    ${fig('lat-ho', 'Home', 'N = 2', ho)}
  </div></section>
</div>`;
}

// ---------------------------------------------------------------------------
// Lámina de estados (390 px)
// ---------------------------------------------------------------------------

function laminaEstados() {
  const ESTADOS = ['reposo', 'hover', 'foco', 'presionado'];
  const clase = { reposo: '', hover: ' es-hover', foco: ' es-foco', presionado: ' es-pres' };
  // Cada control, en cada estado, sobre la superficie del pie donde vive.
  const controles = [
    ['Cerrar nota · K7', (e) => `<button type="button" class="k7 cerrar-fijo${clase[e]}" aria-label="Cerrar nota">${glifo('glifo-cerrar', 'c-sec', 24)}</button>`],
    ['Pausar · K2', (e) => `<button type="button" class="k2 btn-pausa t-cuerpo-fuerte c-tinta${clase[e]}"><span class="pa-g">${glifo('glifo-pausar')}</span><span class="pa-t">Pausar</span></button>`],
    ['Reanudar · K2', (e) => `<button type="button" class="k2 btn-pausa t-cuerpo-fuerte c-tinta${clase[e]}"><span class="pa-g">${glifo('glifo-reanudar')}</span><span class="pa-t">Reanudar</span></button>`],
    ['Anterior · K5', (e) => `<button type="button" class="k5 car-paso-btn${clase[e]}" aria-label="Nota anterior">${glifo('glifo-chevron', 'giro-180')}</button>`],
    ['Siguiente · K5', (e) => `<button type="button" class="k5 car-paso-btn${clase[e]}" aria-label="Nota siguiente">${glifo('glifo-chevron')}</button>`],
    ['Contacto · K2 acento', (e) => `<button type="button" class="k2 k2-acento btn-contacto btn-contacto-corto t-cuerpo-fuerte${clase[e]}">${glifo('glifo-correo')}<span>Escribir</span></button>`],
  ];
  const matriz = `
<div class="matriz">
  <div class="m-cab"></div>${ESTADOS.map((e) => `<div class="m-cab t-rotulo c-sec">${e}</div>`).join('')}
  ${controles.map(([nombre, dibujar]) => `
  <div class="m-fila t-rotulo c-tinta">${esc(nombre)}</div>${ESTADOS.map((e) => `<div class="m-celda">${dibujar(e)}</div>`).join('')}`).join('')}
</div>`;
  const tres = MENSAJES;
  const dos = MENSAJES.slice(0, 2);
  const region = (t, sub, html) => fig(`es-${t.replace(/\W+/g, '-').toLowerCase()}`, t, sub, `<div class="pantalla pantalla-corta"><div class="col mt-3 mb-3">${html}</div></div>`);
  return `<div class="tab tab-estados">
<section class="fila-tab"><h2 class="t-rotulo-medio c-tinta fila-tit">Matriz de estados de los controles · 390 px</h2>
  <div class="pantalla pantalla-matriz"><div class="matriz-int">${matriz}</div></div></section>
<section class="fila-tab"><h2 class="t-rotulo-medio c-tinta fila-tit">Estados de la región · 390 px</h2>
  <div class="tablero-col">
    ${region('Uno solo', 'sin pie ni contador: la nota de hoy', avisos('materias', { lista: [MENSAJES[0]] }))}
    ${region('Avanzando', '«Pausar» · aria-live off', carrusel(tres, { estatico: true }))}
    ${region('Pausado', '«Reanudar» · aria-live polite', carrusel(tres, { pausado: true, activo: 1, estatico: true }))}
    ${region('Vuelta terminada', 'sin «Pausar» · también con movimiento reducido', carrusel(tres, { terminado: true, activo: 2, estatico: true }))}
    ${region('Descartado uno', '«2 de 2» · tras cerrar uno de tres', carrusel(dos, { terminado: true, activo: 1, estatico: true }))}
    ${region('Sin descartar', 'descartable: false · sin ×', carrusel([SIN_CERRAR, MENSAJES[1], MENSAJES[2]], { estatico: true }))}
    ${fig('es-ultimo', 'Último descartado', 'el bloque desaparece sin hueco · el foco pasa a la primera tarjeta', `
<div class="pantalla pantalla-corta"><div class="col mt-3 mb-3">
  <aside class="nota nota-cerrable"><button type="button" class="k7 cerrar-esq es-pres" aria-label="Cerrar nota">${glifo('glifo-cerrar', 'c-sec', 24)}</button>
    <div class="nota-rot t-rotulo c-acento">${glifo('glifo-mensaje')}<span>Una nota del creador</span></div>
    <p class="t-cuerpo c-tinta">${esc(MENSAJES[0].parrafos[0])}</p></aside>
</div></div>`)}
    ${fig('es-ultimo-despues', 'Después', 'sin región ni hueco', `
<div class="pantalla pantalla-corta"><div class="col mt-3 mb-3">
  <div class="lista">${tarjetaMateria(materias[0]).replace('class="lam k6 tarj"', 'class="lam k6 tarj es-foco"')}${tarjetaMateria(materias[1])}</div>
</div></div>`)}
  </div></section>
</div>`;
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------

const ESTILOS = String.raw`
/* ===== reinicio y base ===== */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;border-radius:0;font-style:normal;text-decoration:none}
:root{--sans:'IBM Plex Sans',system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace;--columna:448px;--lectura:600px;--lateral:320px;--hoja:952px}
html[data-tema="oscuro"]{color-scheme:dark}
html{background:var(--superficie)}
body{font:400 15px/22px var(--sans);color:var(--tinta);background:var(--superficie);-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:0;text-align:inherit;cursor:pointer;display:block}
svg{display:block;flex:none}
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
.c-tinta{color:var(--tinta)}.c-sec{color:var(--tintaSec)}.c-acento{color:var(--acento)}.c-fondo{color:var(--fondo)}

/* ===== herramientas del tablero (no son parte de la app) ===== */
.herr{position:sticky;top:0;z-index:5;background:var(--fondo);border-bottom:1px solid var(--linea)}
.herr-fila{display:flex;flex-wrap:wrap;align-items:center;gap:10px 28px;padding:12px 24px}
.herr-grupo{display:flex;align-items:center;gap:10px}
.seg{display:inline-flex;flex-wrap:wrap;border:1px solid var(--linea)}
.seg-op{display:inline-flex;align-items:center;min-height:32px;padding:0 10px;color:var(--tinta);background:var(--fondo)}
.seg-op[aria-pressed="true"]{background:var(--tinta);color:var(--fondo)}
.herr-nota{padding:0 24px 12px;max-width:1100px}
.tab{display:none;padding:24px;flex-direction:column;gap:36px}
html[data-vista="320"] .tab-320,html[data-vista="390"] .tab-390,html[data-vista="1366"] .tab-1366,html[data-vista="lateral"] .tab-lateral,html[data-vista="estados"] .tab-estados{display:flex}
.fila-tit{padding-bottom:12px}
.tablero-col{display:flex;flex-wrap:wrap;gap:36px 24px;align-items:flex-start}
.tablero-fila{display:flex;flex-direction:column;gap:36px;align-items:flex-start}
.fig{display:flex;flex-direction:column;gap:8px;min-width:0}
.tab-320 .fig{width:322px}.tab-390 .fig,.tab-estados .fig{width:392px}.tab-lateral .fig{width:362px}
.fig figcaption{display:flex;flex-direction:column;gap:2px}
.pantalla{box-sizing:content-box;background:var(--fondo);color:var(--tinta);border:1px solid var(--borde);position:relative}
.tab-320 .pantalla{width:320px}.tab-390 .pantalla{width:390px}.tab-estados .pantalla{width:390px}
.tab-1366 .pantalla{width:1366px}
.pantalla-corta{min-height:0}

/* ===== columna (comun.md §7) y espaciado (tokens.md c.3) ===== */
.col{width:100%;max-width:var(--columna);margin-inline:auto;padding-inline:20px}
.mt-1_5{margin-top:6px}.mt-3{margin-top:12px}.mb-3{margin-bottom:12px}
.relleno-6{height:24px}
.lista{display:flex;flex-direction:column;gap:10px}
.sec-rotulo{padding-bottom:8px}.sec-4{padding-top:16px}

/* ===== glifos e ilustraciones ===== */
.g{flex:none}.g-grande{width:24px;height:24px}.g-chico{width:16px;height:16px}
.giro-180{transform:rotate(180deg)}
.ilu{color:var(--filamento);fill:none;stroke:currentColor}

/* ===== lámina y marcas de esquina (comun.md §6) ===== */
.lam{position:relative;background:var(--superficie);border:1px solid var(--linea)}
.mk{position:absolute;width:8px;height:8px;border:0 solid var(--linea);pointer-events:none}
.mk-a{top:-5px;left:-5px;border-top-width:2px;border-left-width:2px}
.mk-b{top:-5px;right:-5px;border-top-width:2px;border-right-width:2px}
.mk-c{bottom:-5px;left:-5px;border-bottom-width:2px;border-left-width:2px}
.mk-d{bottom:-5px;right:-5px;border-bottom-width:2px;border-right-width:2px}

/* ===== clases de control (comun.md §5) ===== */
button:focus-visible,.slide:focus-visible,.nota:focus-visible{outline:2px solid var(--foco);outline-offset:2px}
.es-foco{outline:2px solid var(--foco);outline-offset:2px}
.k2{background:var(--superficie);color:var(--tinta);border:1px solid var(--linea)}
.k2-acento{color:var(--acento);border-color:var(--acento)}
.k3{background:var(--superficie);color:var(--tinta);border:1px solid var(--borde)}
.k5{background:var(--superficie);color:var(--tinta);border:1px solid var(--linea)}
.k6{background:var(--superficie)}
.k7{background:none;color:var(--tinta)}
@media (hover:hover){
  .k2:hover,.k5:hover{outline:1px solid var(--linea);outline-offset:0}
  .k2-acento:hover{outline-color:var(--acento)}
  .k3:hover{border-color:var(--linea)}
  .k7:hover{outline:1px solid var(--linea);outline-offset:0}
}
.es-hover{outline:1px solid var(--linea);outline-offset:0}
.k2-acento.es-hover{outline-color:var(--acento)}
.k2:active,.k5:active,.k3:active,.es-pres.k2,.es-pres.k5{background:var(--tinta);color:var(--fondo);border-color:var(--tinta)}
.k2:active *,.k5:active *,.k3:active *,.k7:active *,.es-pres *{color:var(--fondo)}
.k7:active,.es-pres.k7{background:var(--tinta)}

/* ===== HeaderMarca y control de tema (comun.md §1 y §2) ===== */
.cab-fila{display:flex;align-items:center;justify-content:space-between;padding-block:14px}
.cab-izq{display:flex;align-items:center;min-height:44px}
.tema{display:inline-flex;height:46px;border:1px solid var(--linea);background:var(--fondo)}
.tema-op{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:44px;padding-inline:8px;background:var(--fondo);color:var(--tinta)}
html[data-tema="claro"] .tema-op[data-op="claro"],html[data-tema="oscuro"] .tema-op[data-op="oscuro"]{background:var(--tinta);color:var(--fondo)}
.btn-cambiar{display:inline-flex;align-items:center;gap:8px;height:44px;padding-inline:12px;background:var(--fondo)}
.pantalla{container-type:inline-size}
@container (max-width:359.98px){.btn-cambiar{width:44px;padding-inline:0;justify-content:center}.btn-cambiar span{display:none}}

/* ===== MateriaSelect y Home (copia mínima de la maqueta) ===== */
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
/* El texto del cajetín es el paso rotulo (11/16): el cuerpo, de 15/22, le sumaría 6 px de interlineado. */
.celda{flex:1;padding:6px 12px;font:400 11px/16px var(--mono)}
.mat-card{display:grid;grid-template-columns:96px 1fr}
.mat-card-ilu{display:flex;align-items:center;justify-content:center;border-right:1px solid var(--filete);color:var(--filamento)}
.mat-card-txt{display:flex;flex-direction:column;gap:6px;padding:8px 12px}
.accion{display:flex;align-items:center;gap:14px;width:100%;padding:14px;text-align:left}
.accion.prim{border:2px solid var(--linea);padding:13px}
.accion-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.ico{width:40px;height:40px;flex:none;display:flex;align-items:center;justify-content:center;border:1px solid var(--filete);color:var(--tinta)}

/* ===== Notas (Banners.md a.2) ===== */
.nota{position:relative;display:block;background:var(--superficie);border:1px solid var(--filete);border-left:3px solid var(--acento);padding:14px}
.nota-rot{display:flex;align-items:center;gap:6px;margin-bottom:8px}
.nota-cerrable .nota-rot,.slide.cerrable .nota-rot{padding-right:44px;min-height:32px}
.nota p+p{margin-top:12px}
.btn-contacto{display:inline-flex;align-items:center;gap:8px;height:44px;padding-inline:16px;margin-top:12px;max-width:100%}
.btn-contacto-corto{margin-top:0}
.cerrar-esq{position:absolute;top:0;right:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center}
.cerrar-fijo{width:44px;height:44px;display:flex;align-items:center;justify-content:center}

/* ===== Avisos con varios mensajes (3.14, BAN-P2) ===== */
/* A y B: la nota es el marco; el cuerpo de cada mensaje y el pie van dentro. Todos los mensajes
   comparten una celda de rejilla: la región mide lo que el más alto (sin JS ni medidas). */
.avisos-car .nota{padding:0}
.car-slides{display:grid}
.slide{grid-area:1/1;padding:14px;min-width:0;visibility:hidden;opacity:0}
/* Entra con un fundido de 150 ms (solo opacity; Tailwind: transition-opacity duration-150); la que
   sale se oculta al instante. Sin transform y sin mover el layout. */
.slide.activo{visibility:visible;opacity:1;transition:opacity 150ms cubic-bezier(.4,0,.2,1)}
.slide:focus-visible{outline-offset:-4px}
/* Pie: paso 2 vertical y paso 3.5 horizontal; controles de paso 11; paso 2 entre ellos. */
.car-pie{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 14px;border-top:1px solid var(--filete)}
.car-hueco{flex:1}
.car-paso{display:flex;align-items:center;gap:8px;margin-left:auto}
.car-paso-btn{width:44px;height:44px;display:flex;align-items:center;justify-content:center}
.car-cont{min-width:44px;text-align:center}
.btn-pausa{display:inline-flex;align-items:center;gap:8px;height:44px;padding-inline:16px}
.btn-pausa[hidden]{display:none}
/* Menos de 360 px: solo el glifo, como «Cambiar materia» (comun.md §1.1). El nombre accesible
   sigue siendo «Pausar avisos» o «Reanudar avisos». */
@container (max-width:359.98px){.btn-pausa{width:44px;padding-inline:0;justify-content:center}.btn-pausa .pa-t{display:none}}
/* Movimiento reducido: sin transición (el avance automático lo corta el script). */
@media (prefers-reduced-motion:reduce){.slide.activo{transition:none}}
html[data-reducir] .slide.activo{transition:none}
html[data-reducir] .btn-pausa{display:none}
@media (prefers-reduced-motion:reduce){.avisos-car .btn-pausa{display:none}}

/* ===== lámina de estados ===== */
.tab-estados .pantalla-matriz{width:auto}
.matriz-int{padding:20px}
.matriz{display:grid;grid-template-columns:200px repeat(4,150px);gap:8px;align-items:center}
.m-cab{padding-bottom:4px}
.m-celda{display:flex;align-items:center;justify-content:center;min-height:64px;background:var(--superficie);border:1px solid var(--filete)}
.pantalla-lat{width:360px}
.lat-int{padding:20px}

/* ===== escritorio (comun.md §7.2): región lateral de ancho fijo ===== */
.esc{--columna:var(--hoja)}
.esc .col{width:calc(100% - 64px);max-width:var(--columna);padding-inline:0}
.regiones{display:flex;align-items:flex-start;gap:32px}
.reg-lat{flex:none;width:var(--lateral);min-width:0}
.reg-pri{flex:1;min-width:0}
.rejilla{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.rejilla .tarj{display:flex;flex-direction:column;height:100%}
.rejilla .tarj-fila{flex:1}
`;

// ---------------------------------------------------------------------------
// Comportamiento del prototipo
// ---------------------------------------------------------------------------
//
// Lo que implementa el script es exactamente la regla de la ficha (Banners.md, 3.14):
//  - un temporizador por mensaje (setTimeout, no por cuadro) que solo cambia cuál es el activo;
//    la transición es CSS (opacity, 150 ms); recorre las notas una vez y se queda en la última;
//    la espera sale de `espera(el)`, la fórmula de Banners.md §3.14.3 (D11: el componente la
//    recibe por prop; acá la acelera ?rapido o ?x4, solo del prototipo);
//  - el avance se detiene con el puntero encima (se reanuda al salir, con una espera completa) y
//    con el foco de teclado dentro (pausa que solo termina con «Reanudar»);
//  - no avanza con la pestaña oculta ni con la región fuera de la vista;
//  - con movimiento reducido no hay avance ni transición;
//  - aria-live: «off» mientras avanza solo; «polite» cuando lo gobierna el usuario.
const SCRIPT = String.raw`
(function () {
  var raiz = document.documentElement;
  var params = new URLSearchParams(location.search);
  // ?rapido divide las esperas por 20 (pruebas); ?x4 las divide por 4 (demostración).
  var ESCALA = params.has('rapido') ? 0.05 : params.has('x4') ? 0.25 : 1;
  

  function reducido() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || raiz.hasAttribute('data-reducir');
  }
  function palabras(el) {
    var t = (el.querySelector('.nota-rot').textContent + ' ' +
      [].map.call(el.querySelectorAll('p'), function (p) { return p.textContent; }).join(' ')).trim();
    return t.split(/\s+/).length;
  }
  // 4 s de orientación + 0,35 s por palabra, entre 8 y 25 s.
  function espera(el) { return Math.min(25, Math.max(8, 4 + 0.35 * palabras(el))) * 1000 * ESCALA; }

  function siguienteFocoDespues(el) {
    var todos = [].slice.call(document.querySelectorAll('.pantalla button:not([disabled])')).filter(function (b) {
      return b.offsetParent !== null && !el.contains(b);
    });
    return todos.filter(function (b) {
      return el.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
    })[0];
  }

  function carrusel(reg) {
    var wrap = reg.querySelector('.car-slides');
    var cont = reg.querySelector('.car-cont');
    var pausa = reg.querySelector('.btn-pausa');
    var st = { i: 0, pausado: false, puntero: false, fuera: false, oculta: document.hidden, t: null };
    var slides = function () { return [].slice.call(wrap.querySelectorAll('.slide')); };
    // Recorre las notas una vez y se queda en la última: ahí no hay nada que pausar.
    var activo = function () { return !reducido() && slides().length > 1 && st.i < slides().length - 1; };
    var corre = function () { return activo() && !st.pausado && !st.puntero && !st.fuera && !st.oculta; };

    function pintar() {
      var arr = slides(), n = arr.length;
      arr.forEach(function (s, k) {
        s.classList.toggle('activo', k === st.i);
        s.setAttribute('aria-label', (k + 1) + ' de ' + n);
      });
      if (cont) { cont.textContent = (st.i + 1) + ' de ' + n; cont.setAttribute('aria-label', 'Nota ' + (st.i + 1) + ' de ' + n); }
      wrap.setAttribute('aria-live', corre() ? 'off' : 'polite');
      if (pausa) {
        var tenia = document.activeElement === pausa;
        pausa.hidden = !activo();
        if (pausa.hidden && tenia) { var ant = reg.querySelector('[data-paso="-1"]'); if (ant) ant.focus(); }
        var rotulo = st.pausado ? 'Reanudar' : 'Pausar';
        pausa.setAttribute('aria-label', rotulo + ' avisos');
        pausa.querySelector('.pa-t').textContent = rotulo;
        pausa.querySelector('.pa-g').innerHTML = st.pausado ? GLIFOS.reanudar : GLIFOS.pausar;
      }
    }
    function armar() {
      clearTimeout(st.t);
      if (!raiz.hasAttribute('data-congelar') && corre()) {
        st.t = setTimeout(function () { ir(st.i + 1); }, espera(slides()[st.i]));
      }
      pintar();
    }
    function ir(j) { st.i = j; armar(); }

    reg.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { st.puntero = true; armar(); } });
    reg.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { st.puntero = false; armar(); } });
    // Foco de teclado dentro: pausa que no termina sola (patrón de carrusel de la APG).
    reg.addEventListener('focusin', function (e) {
      if (!st.pausado && e.target.matches(':focus-visible')) { st.pausado = true; armar(); }
    });
    reg.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('btn-pausa')) { st.pausado = !st.pausado; armar(); return; }
      var paso = b.getAttribute('data-paso');
      if (paso) {
        var n = slides().length;
        st.pausado = true; // tomar el control manual detiene el avance
        ir((st.i + Number(paso) + n) % n);
        return;
      }
      if (b.classList.contains('cerrar-esq')) {
        var arr = slides(), s = b.closest('.slide'), k = arr.indexOf(s);
        s.remove();
        if (arr.length === 1) { quitar(reg); return; }
        if (arr.length === 2) { convertirEnNota(reg, slides()[0]); return; }
        st.i = Math.min(k, arr.length - 2);
        armar();
        slides()[st.i].focus();
      }
    });
    document.addEventListener('visibilitychange', function () { st.oculta = document.hidden; armar(); });
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', armar);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { st.fuera = !es[es.length - 1].isIntersecting; armar(); }, { threshold: 0.25 }).observe(reg);
    }
    reg.__armar = armar;
    armar();
  }

  // Un mensaje restante: vuelve a ser la nota de siempre (sin pie, sin contador, sin roles de carrusel).
  function convertirEnNota(reg, slide) {
    var nota = document.createElement('aside');
    nota.className = 'nota' + (slide.classList.contains('cerrable') ? ' nota-cerrable' : '');
    while (slide.firstChild) nota.appendChild(slide.firstChild);
    var contenedor = document.createElement('div');
    contenedor.className = 'avisos avisos-uno';
    contenedor.setAttribute('data-modo', 'uno');
    contenedor.appendChild(nota);
    reg.parentNode.replaceChild(contenedor, reg);
    nota.setAttribute('tabindex', '-1');
    nota.focus();
    var c = nota.querySelector('.cerrar-esq');
    if (c) c.addEventListener('click', function () { var sig = siguienteFocoDespues(contenedor); contenedor.remove(); if (sig) sig.focus(); });
  }
  function quitar(reg) {
    var sig = siguienteFocoDespues(reg);
    reg.remove();
    if (sig) sig.focus();
  }

  var GLIFOS = { pausar: '', reanudar: '' };
  function iniciar() {
    var p = document.querySelector('template#g-pausar'), r = document.querySelector('template#g-reanudar');
    GLIFOS.pausar = p.innerHTML; GLIFOS.reanudar = r.innerHTML;
    document.querySelectorAll('.avisos[data-modo]:not([data-estatico])').forEach(function (reg) {
      var modo = reg.getAttribute('data-modo');
      if (modo === 'A') carrusel(reg);
      else if (modo === 'uno') {
        var c = reg.querySelector('.cerrar-esq');
        if (c) c.addEventListener('click', function () { var sig = siguienteFocoDespues(reg); reg.remove(); if (sig) sig.focus(); });
      }
    });
  }

  // Estado del tablero: vista y tema por hash (#390-claro, #estados-oscuro).
  var estado = { vista: '390', tema: 'claro' };
  function desdeHash() {
    var m = /^#(320|390|1366|lateral|estados)-(claro|oscuro)$/.exec(location.hash);
    if (m) { estado.vista = m[1]; estado.tema = m[2]; }
  }
  function aplicar() {
    raiz.setAttribute('data-vista', estado.vista);
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
    var set = ev.target.closest('.herr [data-set]');
    if (set) {
      var par = set.getAttribute('data-set').split(':');
      estado[par[0]] = par[1];
      location.hash = estado.vista + '-' + estado.tema;
      aplicar();
      return;
    }
    var op = ev.target.closest('.tema-op');
    if (op) { estado.tema = op.getAttribute('data-op'); location.hash = estado.vista + '-' + estado.tema; aplicar(); return; }
    var sw = ev.target.closest('.herr [data-alt]');
    if (sw) {
      var a = sw.getAttribute('data-alt');
      if (a === 'reducir') { raiz.toggleAttribute('data-reducir'); sw.setAttribute('aria-pressed', String(raiz.hasAttribute('data-reducir'))); document.querySelectorAll('.avisos-car').forEach(function (r) { r.__armar && r.__armar(); }); }
      if (a === 'reiniciar') location.reload();
    }
  });
  window.addEventListener('hashchange', function () { desdeHash(); aplicar(); });
  desdeHash();
  aplicar();
  iniciar();
})();
`;

// ---------------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------------

const FUENTES = path.relative(AQUI, path.join(RAIZ, 'src/assets/fuentes')).split(path.sep).join('/');
const face = (familia, peso, archivo) =>
  `@font-face{font-family:'${familia}';font-weight:${peso};font-style:normal;font-display:block;src:url('${FUENTES}/${archivo}.woff2') format('woff2')}`;
const FACES = [
  face('IBM Plex Sans', 400, 'PlexSans-Regular'), face('IBM Plex Sans', 600, 'PlexSans-SemiBold'),
  face('IBM Plex Mono', 400, 'PlexMono-Regular'), face('IBM Plex Mono', 500, 'PlexMono-Medium'),
].join('\n');

const sprite = `
<svg class="sprite" aria-hidden="true" focusable="false" width="0" height="0">
  <defs>
    <pattern id="regla-menor" width="10" height="9" patternUnits="userSpaceOnUse"><path d="M0.5 8.5 V5" fill="none" stroke="currentColor" stroke-width="1"/></pattern>
    <pattern id="regla-mayor" width="50" height="9" patternUnits="userSpaceOnUse"><path d="M0.5 8.5 V2" fill="none" stroke="currentColor" stroke-width="1"/></pattern>
  </defs>
  ${Object.entries(ilustraciones).map(([id, s]) =>
    `<symbol id="ilu-${id}" viewBox="${esc(s.viewBox)}"><g ${presAttrs(s.pres)}>${s.interior}</g></symbol>`).join('\n  ')}
</svg>
<template id="g-pausar">${glifo('glifo-pausar')}</template>
<template id="g-reanudar">${glifo('glifo-reanudar')}</template>`;

const html = `<!doctype html>
<html lang="es" data-vista="390" data-tema="claro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>pKapp · Rediseño Plancha · 3.14 BAN-P2 · Banners con varios mensajes</title>
<style>
${FACES}
${BLOQUE_COLORES}
${ESTILOS}
</style>
</head>
<body>
${sprite}
<header class="herr">
  <div class="herr-fila">
    <span class="t-rotulo-medio c-tinta">pKapp · 3.14 · Banners con varios mensajes · BAN-P2, aprobada el 2026-10-11</span>
    <div class="herr-grupo"><span class="t-rotulo c-sec">Vista</span>
      <span class="seg"><button type="button" class="seg-op t-rotulo" data-set="vista:320">320</button><button type="button" class="seg-op t-rotulo" data-set="vista:390">390</button><button type="button" class="seg-op t-rotulo" data-set="vista:1366">1366</button><button type="button" class="seg-op t-rotulo" data-set="vista:lateral">Lateral</button><button type="button" class="seg-op t-rotulo" data-set="vista:estados">Estados</button></span></div>
    <div class="herr-grupo"><span class="t-rotulo c-sec">Tema</span>
      <span class="seg"><button type="button" class="seg-op t-rotulo" data-set="tema:claro">Claro</button><button type="button" class="seg-op t-rotulo" data-set="tema:oscuro">Oscuro</button></span></div>
    <div class="herr-grupo"><span class="t-rotulo c-sec">Prueba</span>
      <span class="seg"><button type="button" class="seg-op t-rotulo" data-alt="reducir" aria-pressed="false">Reducir movimiento</button><button type="button" class="seg-op t-rotulo" data-alt="reiniciar">Reiniciar</button></span></div>
  </div>
  <div class="herr-nota t-rotulo c-sec">Prototipo de diseño, no es la app · el primer mensaje es el texto vigente de la nota del creador; los otros dos son de muestra · el carrusel recorre las notas una vez, se queda en la última y se detiene con el puntero o el foco dentro (con ?x4 en la URL, cuatro veces más rápido) · «Reducir movimiento» simula prefers-reduced-motion · el banner de banco reducido de Home queda aparte, siempre visible</div>
</header>
<main>
${tableroTelefono(320)}
${tableroTelefono(390)}
${tableroEscritorio()}
${tableroLateral()}
${laminaEstados()}
</main>
<script>${SCRIPT}</script>
</body>
</html>
`;

fs.writeFileSync(SALIDA, html);

const sinBloque = html.replace(/\/\* >>> GENERADO[\s\S]*?<<< FIN GENERADO \*\//, '');
const sueltos = sinBloque.match(/#[0-9a-fA-F]{6}\b/g) || [];
const palabras = (m) => (m.rotulo + ' ' + m.parrafos.join(' ')).trim().split(/\s+/).length;
console.log(`banners.html escrita (${(html.length / 1024).toFixed(1)} kB)`);
for (const m of [...MENSAJES, BANCO_REDUCIDO]) {
  const n = palabras(m);
  console.log(`  ${(m.id || 'banco-reducido').padEnd(18)} ${String(n).padStart(3)} palabras · espera ${Math.min(25, Math.max(8, 4 + 0.35 * n)).toFixed(1)} s`);
}
if (sueltos.length) {
  console.error('ERROR: hexadecimales fuera del bloque generado: ' + sueltos.join(', '));
  process.exitCode = 1;
}

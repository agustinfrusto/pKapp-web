// Suite «home» del arnés end-to-end (ver ../README.md).

const { EN_MARCO, LADO_TACTIL, MEDIR_PANTALLA, PASO, TITULO_DEL_QUIZ, abrirMarco, clicEnMarco, entrarAMateria, irAHomeEnMarco } = require('./comunes');

async function atrasDelNavegador(pagina, base, t) {
  await entrarAMateria(pagina, base);

  await pagina.clic('Mis estadísticas');
  t.ok('ir a estadísticas', await pagina.esperarUrl('/estadisticas'), true);

  await pagina.evaluar('history.back()');
  t.ok('el atrás vuelve a /inicio en vez de salir de pKapp',
    await pagina.esperarUrl('/inicio'), true);
  t.ok('la app sigue viva', await pagina.evaluar('document.body.innerText.length > 20'), true);

  await pagina.evaluar('history.forward()');
  t.ok('el adelante vuelve a /estadisticas', await pagina.esperarUrl('/estadisticas'), true);
  await pagina.evaluar('history.back()');
  await pagina.esperarUrl('/inicio');
}

// área segura (0 en web) + paso 3.5 + (paso 11 + border arriba y abajo) + paso 3.5
const ALTO_HEADER = 3.5 * PASO + LADO_TACTIL + 2 + 3.5 * PASO;

async function altoDeHeaderIgual(pagina, base, t) {
  for (const ancho of [320, 390, 768]) {
    await abrirMarco(pagina, base, ancho);
    await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_PANTALLA)).header);
    const materia = await pagina.evaluar(MEDIR_PANTALLA);
    materia.marco = await pagina.evaluar(MEDIR_MARCO);
    await irAHomeEnMarco(pagina);
    await pagina.esperarA(async () => {
      const m = await pagina.evaluar(MEDIR_PANTALLA);
      return !!m.header && !!m.volver;
    });
    const home = await pagina.evaluar(MEDIR_PANTALLA);
    home.marco = await pagina.evaluar(MEDIR_MARCO);
    const mh = materia.header, hh = home.header;
    t.ok(`${ancho} px: hay header en MateriaSelect y en Home`, !!mh && !!hh, true);
    if (!mh || !hh) continue;
    t.ok(`${ancho} px: el header mide ${ALTO_HEADER} px en MateriaSelect`, mh.alto, ALTO_HEADER);
    t.ok(`${ancho} px: el header mide lo mismo en Home`, hh.alto, mh.alto);
    t.ok(`${ancho} px: hay un primer bloque debajo del header en las dos pantallas`,
      materia.bloque !== null && home.bloque !== null, true);
    // El primer bloque trae su propio marco (comun.md §1): se compara la ordenada de ese
    // marco y no la de la primera hoja, que depende de cómo centra su contenido cada pantalla.
    t.ok(`${ancho} px: el primer bloque debajo del header arranca en la misma ordenada (CD-19)`,
      home.marco, materia.marco);
  }
}

// Ordenada del primer elemento con borde visible bajo el header (el marco del primer bloque).
const MEDIR_MARCO = EN_MARCO(`
  const header = visibles('[data-testid="header-marca"]')[0];
  if (!header) return null;
  const piso = header.getBoundingClientRect().bottom - 0.5;
  const marcos = Array.from(d.querySelectorAll('*')).filter((n) => {
    if (n.closest('[data-testid="header-marca"]')) return false;
    const r = n.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.top < piso) return false;
    const c = w.getComputedStyle(n);
    return ['Top', 'Right', 'Bottom', 'Left'].some((l) => parseFloat(c['border' + l + 'Width']) > 0);
  });
  return marcos.length ? Math.min(...marcos.map((n) => n.getBoundingClientRect().top)) : null;
`);

// relleno `paso 4` arriba y abajo + fila de `paso 11` + filete `border` (área segura 0 en web)
const ALTO_BARRA = 4 * PASO + LADO_TACTIL + 4 * PASO + 1;

const MARGEN_LATERAL = 5 * PASO;      // paso 5

const MEDIR_BARRA = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const barra = visibles('[data-testid="barra-interna"]')[0];
  const titulo = visibles('[data-testid="barra-titulo"]')[0];
  const volver = visibles('[data-testid="barra-volver"]')[0];
  return {
    vista: w.innerWidth,
    desborda: desbordes().length > 0,
    barra: caja(barra),
    filete: barra ? w.getComputedStyle(barra).borderBottomWidth : null,
    titulo: caja(titulo),
    tituloTexto: titulo ? titulo.textContent.trim() : null,
    volver: caja(volver),
    volverNombre: volver ? volver.getAttribute('aria-label') : null,
    volverRol: volver ? volver.getAttribute('role') : null,
    hayTituloDelQuiz: d.body.innerText.includes(${JSON.stringify(TITULO_DEL_QUIZ)}),
    ruta: w.location.pathname,
  };
`);

const URL_EN_MARCO = EN_MARCO('return w.location.pathname;');

const esperarRutaEnMarco = (pagina, ruta) => pagina.esperarA(async () =>
  await pagina.evaluar(URL_EN_MARCO) === ruta);

// Desde /temas/practice, elige el tema más corto y llega al quiz dentro del marco.
async function irAlQuizEnMarco(pagina) {
  const elegido = await pagina.evaluar(EN_MARCO(`
    const temas = visibles('[tabindex]')
      .map((n) => ({ n, t: (n.innerText || '').trim().replace(/\\s+/g, ' ') }))
      .filter((x) => / \\d+ preguntas$/.test(x.t) && !x.t.includes('mezclados'));
    if (!temas.length) return null;
    temas.sort((a, b) =>
      parseInt(a.t.match(/(\\d+) preguntas$/)[1]) - parseInt(b.t.match(/(\\d+) preguntas$/)[1]));
    temas[0].n.scrollIntoView({ block: 'center' });
    const r = temas[0].n.getBoundingClientRect();
    return { total: parseInt(temas[0].t.match(/(\\d+) preguntas$/)[1], 10),
      x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  `));
  if (!elegido) return null;
  await pagina.clicEn(elegido.x, elegido.y);
  return (await esperarRutaEnMarco(pagina, '/quiz')) ? elegido.total : null;
}

// Responde la primera opción hasta terminar el quiz y llegar a /resultados.
async function terminarElQuizEnMarco(pagina, total) {
  for (let i = 0; i < total + 2; i++) {
    if (await pagina.evaluar(URL_EN_MARCO) !== '/quiz') break;
    const opcion = await pagina.evaluar(EN_MARCO(`
      const n = visibles('[tabindex]').find((x) => /^A\\s/.test((x.innerText || '').trim()));
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    `));
    if (opcion) await pagina.clicEn(opcion.x, opcion.y);
    await pagina.esperarA(async () => {
      const txt = (await pagina.evaluar(EN_MARCO('return d.body.innerText.toLowerCase();')));
      return txt.includes('siguiente') || txt.includes('ver resultados');
    }, { limite: 5000 });
    if (!await clicEnMarco(pagina, 'ver resultados')) await clicEnMarco(pagina, 'siguiente');
  }
  return esperarRutaEnMarco(pagina, '/resultados');
}

async function barraInternaConYSinVolver(pagina, base, t) {
  for (const ancho of [320, 768]) {
    await abrirMarco(pagina, base, ancho);
    t.ok(`${ancho} px: elegir la materia lleva a /inicio`, await irAHomeEnMarco(pagina), true);

    // Con volver: TopicSelect.
    await clicEnMarco(pagina, 'Entrena Temas/Parciales');
    t.ok(`${ancho} px: TopicSelect`, await esperarRutaEnMarco(pagina, '/temas/practice'), true);
    await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_BARRA)).barra, { limite: 3000 });
    const conVolver = await pagina.evaluar(MEDIR_BARRA);
    t.ok(`${ancho} px: TopicSelect tiene barra interna`, !!conVolver.barra, true);
    t.ok(`${ancho} px: la barra mide ${ALTO_BARRA} px con volver`, conVolver.barra && conVolver.barra.alto, ALTO_BARRA);
    t.ok(`${ancho} px: el filete inferior es de 1 px`, conVolver.filete, '1px');
    t.ok(`${ancho} px: la barra ocupa todo el ancho`,
      !!conVolver.barra && conVolver.barra.izq === 0 && conVolver.barra.ancho === conVolver.vista, true);
    t.ok(`${ancho} px: el volver es un botón con nombre accesible «Volver»`,
      conVolver.volverRol === 'button' && conVolver.volverNombre === 'Volver', true);
    t.ok(`${ancho} px: el volver mide 44 × 44`,
      !!conVolver.volver && conVolver.volver.ancho === LADO_TACTIL && conVolver.volver.alto === LADO_TACTIL, true);
    t.ok(`${ancho} px: el título lleva el copy de la ruta`, conVolver.tituloTexto, 'pKapp · Elegir tema');
    t.ok(`${ancho} px: paso 3.5 entre el volver y el título`,
      !!conVolver.volver && !!conVolver.titulo && conVolver.titulo.izq - conVolver.volver.der, 3.5 * PASO);
    t.ok(`${ancho} px: TopicSelect sin scroll horizontal`, conVolver.desborda, false);
    const ordenadaTitulo = conVolver.titulo && conVolver.titulo.arriba;

    // Quiz: sin barra interna ni título del Stack.
    const total = await irAlQuizEnMarco(pagina);
    t.ok(`${ancho} px: llega al quiz`, total !== null, true);
    if (total === null) continue;
    const quiz = await pagina.evaluar(MEDIR_BARRA);
    t.ok(`${ancho} px: el quiz no tiene barra interna del Stack`, quiz.barra, null);
    t.ok(`${ancho} px: el quiz no muestra el título «${TITULO_DEL_QUIZ}»`, quiz.hayTituloDelQuiz, false);
    t.ok(`${ancho} px: el quiz sin scroll horizontal`, quiz.desborda, false);

    // Sin volver: Results.
    t.ok(`${ancho} px: terminar el quiz lleva a /resultados`, await terminarElQuizEnMarco(pagina, total), true);
    await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_BARRA)).barra, { limite: 3000 });
    const sinVolver = await pagina.evaluar(MEDIR_BARRA);
    t.ok(`${ancho} px: Results tiene barra interna`, !!sinVolver.barra, true);
    t.ok(`${ancho} px: Results no muestra volver`, sinVolver.volver, null);
    t.ok(`${ancho} px: la barra mide lo mismo sin volver`,
      sinVolver.barra && sinVolver.barra.alto, conVolver.barra && conVolver.barra.alto);
    t.ok(`${ancho} px: el título de Results lleva el copy de la ruta`, sinVolver.tituloTexto, 'pKapp · Resultados');
    t.ok(`${ancho} px: el título no cambia de lugar vertical`,
      sinVolver.titulo && sinVolver.titulo.arriba, ordenadaTitulo);
    if (ancho < 448) {
      t.ok(`${ancho} px: sin volver el título arranca en el margen lateral paso 5`,
        sinVolver.titulo && sinVolver.titulo.izq, MARGEN_LATERAL);
    }
    t.ok(`${ancho} px: Results sin scroll horizontal`, sinVolver.desborda, false);
  }
}

async function volverDeLaBarra(pagina, base, t) {
  await abrirMarco(pagina, base, 390);
  await irAHomeEnMarco(pagina);
  await clicEnMarco(pagina, 'Entrena Temas/Parciales');
  await esperarRutaEnMarco(pagina, '/temas/practice');
  await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_BARRA)).volver, { limite: 3000 });
  const punto = await pagina.evaluar(EN_MARCO(`
    const n = visibles('[data-testid="barra-volver"]')[0];
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  `));
  t.ok('TopicSelect muestra el volver de la barra', !!punto, true);
  if (!punto) return;
  await pagina.clicEn(punto.x, punto.y);
  t.ok('el volver de la barra hace goBack a /inicio', await esperarRutaEnMarco(pagina, '/inicio'), true);
}

// ---------------------------------------------------------------------------
// Home migrada a la Plancha (tarea 3.3, ficha `diseno/pantallas/Home.md`)
// ---------------------------------------------------------------------------

const fs = require('fs');
const path = require('path');
const { plancha } = require('../../../src/theme/colores');
const { GLIFOS } = require('../../../src/assets/glifos');
const { CONTEOS, GENERADAS } = require('../../../src/materias/conteos');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const ORDEN_MATERIAS = ['bcyt', 'anatomia', 'neuro', 'cyr', 'dre', 'ryd'];

// Datos de cada materia sacados de sus archivos (metadata.js usa require() de assets,
// así que no se importa): nombre, id corto, banco reducido e ilustración.
const MATERIAS = ORDEN_MATERIAS.map((id, i) => {
  const meta = fs.readFileSync(path.join(RAIZ, 'src', 'materias', id, 'metadata.js'), 'utf8');
  return {
    id,
    nombre: meta.match(/\bname:\s*'([^']+)'/)[1],
    corto: meta.match(/\bshortName:\s*'([^']+)'/)[1],
    reducido: /\bbancoReducido:\s*true/.test(meta),
    numero: String(i + 1).padStart(2, '0'),
    ilustracion: require(`../../../src/materias/${id}/ilustracion`).ilustracion,
  };
});

const ACCIONES = [
  { clave: 'practicar', titulo: 'Entrena Temas/Parciales', glifo: 'glifo-practicar', ruta: '/temas/practice', primaria: true },
  { clave: 'examen', titulo: 'Modo examen', glifo: 'glifo-examen', ruta: '/temas/exam' },
  { clave: 'repasar', titulo: 'Repasar fallos', glifo: 'glifo-repasar', ruta: '/temas/failed' },
  { clave: 'estadisticas', titulo: 'Mis estadísticas', glifo: 'glifo-estadisticas', ruta: '/estadisticas' },
  { clave: 'agregar', titulo: 'Agregar pregunta', glifo: 'glifo-agregar', ruta: '/agregar' },
  { clave: 'ajustes', titulo: 'Ajustes', glifo: 'glifo-ajustes', ruta: '/ajustes' },
];

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const COLUMNA = 448;                  // max-w-columna
const CORREO_BANCO = 'pkappsoporte@gmail.com';

// Todo lo que mide la pantalla Home dentro del marco. Los testID de la ficha:
// home-tarjeta-materia, home-banco-reducido, home-rotulo-acciones, home-acciones,
// home-accion-<clave> y home-privacidad.
const LEER_HOME = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const uno = (id) => visibles('[data-testid="' + id + '"]')[0] || null;
  const estilo = (n, p) => (n ? w.getComputedStyle(n)[p] : null);
  const svgDe = (n) => {
    if (!n) return null;
    const s = n.getAttribute ? n : null;
    return {
      caja: caja(s),
      width: s.getAttribute('width'), height: s.getAttribute('height'),
      viewBox: s.getAttribute('viewBox'), par: s.getAttribute('preserveAspectRatio'),
      fill: s.getAttribute('fill'), stroke: s.getAttribute('stroke'),
      trazo: s.getAttribute('stroke-width'), union: s.getAttribute('stroke-linejoin'),
      extremo: s.getAttribute('stroke-linecap'), oculto: s.getAttribute('aria-hidden'),
      hijos: Array.from(s.children).map((c) => c.tagName.toLowerCase()),
      primerD: s.children[0] ? s.children[0].getAttribute('d') : null,
    };
  };
  const header = uno('header-marca');
  const tarjeta = uno('home-tarjeta-materia');
  const svgTarjeta = tarjeta ? tarjeta.querySelector('svg') : null;
  const banner = uno('home-banco-reducido');
  const rotulo = uno('home-rotulo-acciones');
  const privacidad = uno('home-privacidad');
  let scroller = null;
  for (let n = tarjeta; n; n = n.parentElement) {
    const o = w.getComputedStyle(n).overflowY;
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > 0) { scroller = n; break; }
  }
  const acciones = ${JSON.stringify(ACCIONES.map((a) => a.clave))}.map((clave) => {
    const el = uno('home-accion-' + clave);
    if (!el) return { clave, existe: false };
    const marco = el.firstElementChild;
    const svgs = Array.from(el.querySelectorAll('svg'));
    const cuadro = svgs[0] ? svgs[0].parentElement : null;
    const hojas = Array.from(el.querySelectorAll('div')).filter((n) =>
      n.children.length === 0 && n.textContent.trim() !== '');
    return {
      clave, existe: true,
      caja: caja(el),
      rol: el.getAttribute('role'),
      nombre: (el.getAttribute('aria-label') || el.textContent || '').trim(),
      fondo: estilo(marco, 'backgroundColor'),
      borde: estilo(marco, 'borderTopColor'),
      bordeAncho: estilo(marco, 'borderTopWidth'),
      radio: estilo(marco, 'borderTopLeftRadius'),
      sombra: estilo(el, 'boxShadow') + '|' + estilo(marco, 'boxShadow'),
      contorno: estilo(el, 'outlineWidth') + ' ' + estilo(el, 'outlineColor') + ' ' + estilo(el, 'outlineStyle'),
      cuadro: cuadro ? { caja: caja(cuadro), borde: estilo(cuadro, 'borderTopColor'), bordeAncho: estilo(cuadro, 'borderTopWidth') } : null,
      glifo: svgs[0] ? svgDe(svgs[0]) : null,
      chevron: svgs[1] ? svgDe(svgs[1]) : null,
      titulo: hojas[0] ? { texto: hojas[0].textContent.trim(), caja: caja(hojas[0]), color: estilo(hojas[0], 'color') } : null,
      descripcion: hojas[1] ? { texto: hojas[1].textContent.trim(), caja: caja(hojas[1]), color: estilo(hojas[1], 'color'),
        tamano: estilo(hojas[1], 'fontSize') } : null,
    };
  });
  return {
    vista: w.innerWidth,
    desborda: desbordes().length > 0,
    header: caja(header),
    tarjeta: tarjeta ? {
      caja: caja(tarjeta), texto: tarjeta.textContent.trim(),
      borde: estilo(tarjeta.firstElementChild, 'borderTopColor'),
      fondo: estilo(tarjeta.firstElementChild, 'backgroundColor'),
      marcas: visibles('[data-testid="marca-esquina"]').filter((m) => tarjeta.contains(m)).length,
    } : null,
    ilustracion: svgDe(svgTarjeta),
    celda: svgTarjeta ? {
      caja: caja(svgTarjeta.parentElement),
      filete: estilo(svgTarjeta.parentElement, 'borderRightWidth'),
      fileteColor: estilo(svgTarjeta.parentElement, 'borderRightColor'),
    } : null,
    banner: banner ? {
      caja: caja(banner), texto: banner.textContent.trim(),
      bordeIzq: estilo(banner, 'borderLeftWidth'),
      bordeIzqColor: estilo(banner, 'borderLeftColor'),
      glifos: Array.from(banner.querySelectorAll('svg')).map(svgDe),
      boton: (function () {
        const b = banner.querySelector('[role="button"]');
        return b ? { caja: caja(b), nombre: b.getAttribute('aria-label'), texto: b.textContent.trim() } : null;
      })(),
    } : null,
    rotulo: rotulo ? {
      caja: caja(rotulo), texto: rotulo.textContent.trim(), color: estilo(rotulo, 'color'),
      mayusculas: estilo(rotulo, 'textTransform'), tamano: estilo(rotulo, 'fontSize'),
    } : null,
    privacidad: privacidad ? { caja: caja(privacidad), texto: privacidad.textContent.trim() } : null,
    listaAcciones: caja(uno('home-acciones')),
    acciones,
    relleno: scroller && privacidad ? scroller.scrollHeight
      - (privacidad.getBoundingClientRect().bottom - scroller.getBoundingClientRect().top + scroller.scrollTop) : null,
    imagenes: visibles('img').length,
    textoVisible: d.body.innerText,
    cambiar: (function () {
      const b = visibles('[aria-label="Cambiar materia"]')[0];
      return b ? { caja: caja(b), texto: b.innerText.trim(), rol: b.getAttribute('role') } : null;
    })(),
    tema: caja(visibles('[role="radiogroup"]')[0]),
  };
`);

async function entrarAHome(pagina, base, ancho, materia, alto = 800) {
  await abrirMarco(pagina, base, ancho, alto);
  // Las últimas tarjetas quedan bajo el pliegue del marco: se traen a la vista antes de tocar.
  const punto = await pagina.evaluar(EN_MARCO(`
    const t = ${JSON.stringify(materia.nombre.toLowerCase())};
    const c = visibles('[tabindex]').filter((n) => (n.textContent || '').toLowerCase().includes(t));
    if (!c.length) return null;
    c.sort((a, b) => a.textContent.length - b.textContent.length);
    c[0].scrollIntoView({ block: 'center' });
    const r = c[0].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  `));
  if (!punto) return false;
  await pagina.clicEn(punto.x, punto.y);
  const llego = await esperarRutaEnMarco(pagina, '/inicio');
  if (llego) {
    await pagina.esperarA(async () => (await pagina.evaluar(LEER_HOME)).tarjeta !== null, { limite: 8000 });
  }
  return llego;
}

const leerHome = (pagina) => pagina.evaluar(LEER_HOME);

// Centro de un elemento del marco, tras traerlo a la vista.
const PUNTO = (sel) => EN_MARCO(`
  const n = visibles(${JSON.stringify(sel)})[0];
  if (!n) return null;
  n.scrollIntoView({ block: 'center' });
  const r = n.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
`);

async function tocar(pagina, sel) {
  const p = await pagina.evaluar(PUNTO(sel));
  if (!p) return false;
  await pagina.clicEn(p.x, p.y);
  return true;
}

const BCYT = MATERIAS[0];

// Contrato de atributos del <svg> de la ilustración (D2/D3): los de los datos de la materia.
function comprobarIlustracion(t, rotulo, il, datos, color) {
  t.ok(`${rotulo}: hay una ilustración dentro de la tarjeta`, !!il, true);
  if (!il) return;
  t.ok(`${rotulo}: lado paso 16 (64 px)`, `${il.width}×${il.height}`, '64×64');
  t.ok(`${rotulo}: viewBox y preserveAspectRatio`, `${il.viewBox}|${il.par}`, `${datos.viewBox}|xMidYMid meet`);
  t.ok(`${rotulo}: sin relleno (fill none)`, il.fill, 'none');
  t.ok(`${rotulo}: trazo en el color filamento del tema`, il.stroke, color);
  t.ok(`${rotulo}: stroke-width de los datos`, il.trazo, String(datos.trazo.ancho));
  t.ok(`${rotulo}: stroke-linejoin y stroke-linecap de los datos`,
    `${il.union}|${il.extremo}`, `${datos.trazo.union}|${datos.trazo.extremo}`);
  t.ok(`${rotulo}: aria-hidden="true"`, il.oculto, 'true');
  t.ok(`${rotulo}: hijos en el orden de los datos`,
    il.hijos.join(','), datos.elementos.map((e) => e.tipo).join(','));
}

async function homeTarjetaDeMateria(pagina, base, t) {
  const T = plancha.claro;
  const vistos = new Set();
  for (const m of MATERIAS) {
    t.ok(`${m.id}: elegir la materia lleva a /inicio`, await entrarAHome(pagina, base, 390, m), true);
    const h = await leerHome(pagina);
    t.ok(`${m.id}: hay tarjeta de materia`, h.tarjeta !== null, true);
    if (!h.tarjeta) continue;
    comprobarIlustracion(t, `${m.id}`, h.ilustracion, m.ilustracion, T.filamento);
    if (h.ilustracion) vistos.add(h.ilustracion.primerD);
    t.ok(`${m.id}: la celda de ilustración mide paso 24 (96 px) de ancho`, h.celda && h.celda.caja.ancho, 96);
    t.ok(`${m.id}: filete derecho de la celda`,
      h.celda && `${h.celda.filete} ${h.celda.fileteColor}`, `1px ${rgb(T.filete)}`);
    t.ok(`${m.id}: la ilustración queda centrada en la celda`,
      !!h.ilustracion && !!h.celda
        && Math.abs((h.ilustracion.caja.izq + h.ilustracion.caja.der) / 2
          - (h.celda.caja.izq + h.celda.caja.der - 1) / 2) <= 1, true);
    t.ok(`${m.id}: cuerpo en superficie con borde linea`,
      `${h.tarjeta.fondo}|${h.tarjeta.borde}`, `${rgb(T.superficie)}|${rgb(T.linea)}`);
    t.ok(`${m.id}: cuatro marcas de esquina`, h.tarjeta.marcas, 4);
    t.ok(`${m.id}: id «${m.corto} · ${m.numero}»`, h.tarjeta.texto.includes(`${m.corto} · ${m.numero}`), true);
    t.ok(`${m.id}: nombre de la materia`, h.tarjeta.texto.includes(m.nombre), true);

    // Origen visible: preguntas reales y extra por separado, no un número fundido.
    const conteo = h.tarjeta.texto.match(/(\d+) preguntas reales · (\d+) preguntas extra/);
    t.ok(`${m.id}: «N preguntas reales · M preguntas extra»`, !!conteo, true);
    if (conteo) {
      t.ok(`${m.id}: preguntas extra = generadas del banco`, Number(conteo[2]), GENERADAS[m.id]);
      t.ok(`${m.id}: reales + extra = total del banco`, Number(conteo[1]) + Number(conteo[2]), CONTEOS[m.id]);
    }
    t.ok(`${m.id}: sin imágenes PNG en la pantalla`, h.imagenes, 0);
  }
  t.ok('las seis materias dibujan una ilustración distinta', vistos.size, 6);
}

async function homeBancoReducido(pagina, base, t) {
  const T = plancha.claro;
  for (const m of MATERIAS) {
    await entrarAHome(pagina, base, 390, m);
    const h = await leerHome(pagina);
    if (!m.reducido) {
      t.ok(`${m.id}: sin banner de banco reducido`, h.banner, null);
      continue;
    }
    t.ok(`${m.id}: banner de banco reducido visible`, h.banner !== null, true);
    if (!h.banner || !h.tarjeta || !h.rotulo) continue;
    t.ok(`${m.id}: banner paso 3 debajo de la tarjeta`, h.banner.caja.arriba - h.tarjeta.caja.abajo, 3 * PASO);
    t.ok(`${m.id}: rótulo paso 4 debajo del banner`, h.rotulo.caja.arriba - h.banner.caja.abajo, 4 * PASO);
    t.ok(`${m.id}: margen lateral paso 5`, h.banner.caja.izq, 5 * PASO);
    t.ok(`${m.id}: banner con rótulo «Banco más reducido»`, /banco más reducido/i.test(h.banner.texto), true);
    t.ok(`${m.id}: banner con el texto de main`,
      h.banner.texto.includes('Esta materia tiene menos preguntas que las anteriores porque tuve acceso a menos prototipos de examen.'), true);
    t.ok(`${m.id}: banner con borde izquierdo acento border-3`,
      `${h.banner.bordeIzq} ${h.banner.bordeIzqColor}`, `3px ${rgb(T.acento)}`);
    t.ok(`${m.id}: banner con glifo-banco-reducido chico (16 px) y sin emoji`,
      h.banner.glifos.some((g) => g && g.width === '16') && !h.banner.texto.includes('📉'), true);
    t.ok(`${m.id}: contacto es un botón con nombre «Escribir a pkappsoporte@gmail.com»`,
      !!h.banner.boton && h.banner.boton.nombre === 'Escribir a pkappsoporte@gmail.com'
        && h.banner.boton.texto === 'pkappsoporte@gmail.com', true);
    t.ok(`${m.id}: contacto de al menos 44 px de alto`, !!h.banner.boton && h.banner.boton.caja.alto >= LADO_TACTIL, true);
    t.ok(`${m.id}: el banner no se descarta (sin botón de cerrar)`,
      !h.banner.texto.toLowerCase().includes('cerrar nota'), true);
  }
}

async function homeRotuloYAcciones(pagina, base, t) {
  const T = plancha.claro;
  t.ok('elegir la materia lleva a /inicio', await entrarAHome(pagina, base, 390, BCYT), true);
  const h = await leerHome(pagina);
  t.ok('hay rótulo «Plano / Acciones»', !!h.rotulo && h.rotulo.texto === 'Plano / Acciones', true);
  if (h.rotulo && h.tarjeta) {
    t.ok('rótulo en acento', h.rotulo.color, rgb(T.acento));
    t.ok('rótulo en mayúsculas por CSS, paso rotulo (11 px)', `${h.rotulo.mayusculas} ${h.rotulo.tamano}`, 'uppercase 11px');
    t.ok('rótulo paso 4 debajo de la tarjeta (sin banner)', h.rotulo.caja.arriba - h.tarjeta.caja.abajo, 4 * PASO);
    t.ok('rótulo con margen lateral paso 5', h.rotulo.caja.izq, 5 * PASO);
  }
  t.ok('tarjeta paso 1.5 debajo del header', !!h.tarjeta && !!h.header && h.tarjeta.caja.arriba - h.header.abajo, 1.5 * PASO);
  t.ok('tarjeta con margen lateral paso 5', !!h.tarjeta && h.tarjeta.caja.izq, 5 * PASO);

  t.ok('hay seis acciones', h.acciones.filter((a) => a.existe).length, 6);
  let previa = h.rotulo ? h.rotulo.caja.abajo : null;
  ACCIONES.forEach((a, i) => {
    const r = h.acciones[i];
    if (!r || !r.existe) return;
    t.ok(`acción ${i + 1} «${a.titulo}»: título`, r.titulo && r.titulo.texto, a.titulo);
    t.ok(`acción ${i + 1}: botón con nombre accesible que contiene «${a.titulo}»`,
      r.rol === 'button' && r.nombre.includes(a.titulo), true);
    if (previa !== null) {
      t.ok(`acción ${i + 1}: ${i === 0 ? 'paso 2 debajo del rótulo' : 'paso 2.5 debajo de la anterior'}`,
        r.caja.arriba - previa, (i === 0 ? 2 : 2.5) * PASO);
    }
    previa = r.caja.abajo;
    t.ok(`acción ${i + 1}: alto de al menos 44 px`, r.caja.alto >= LADO_TACTIL, true);
    t.ok(`acción ${i + 1}: ancho de la columna menos paso 5 a cada lado`, r.caja.ancho, 390 - 2 * 5 * PASO);

    // Cuadro de glifo (paso 10) con glifo grande (paso 6), del inventario.
    t.ok(`acción ${i + 1}: cuadro de glifo de 40 × 40`,
      !!r.cuadro && `${r.cuadro.caja.ancho}×${r.cuadro.caja.alto}`, '40×40');
    t.ok(`acción ${i + 1}: cuadro con marco filete border`,
      !!r.cuadro && `${r.cuadro.bordeAncho} ${r.cuadro.borde}`, `1px ${rgb(T.filete)}`);
    t.ok(`acción ${i + 1}: glifo de 24 px, en tinta, oculto a lectores`,
      !!r.glifo && `${r.glifo.width}|${r.glifo.stroke}|${r.glifo.oculto}`, `24|${T.tinta}|true`);
    const formaDe = (id) => GLIFOS[id].elementos.map((e) => e.tipo).join(',');
    t.ok(`acción ${i + 1}: dibuja ${a.glifo}`,
      !!r.glifo && `${r.glifo.viewBox}|${r.glifo.hijos.join(',')}`, `${GLIFOS[a.glifo].viewBox}|${formaDe(a.glifo)}`);
    t.ok(`acción ${i + 1}: chevron chico (16 px) en tintaSec`,
      !!r.chevron && `${r.chevron.width}|${r.chevron.stroke}`, `16|${T.tintaSec}`);
    t.ok(`acción ${i + 1}: chevron dibuja glifo-chevron`,
      !!r.chevron && `${r.chevron.viewBox}|${r.chevron.hijos.join(',')}`,
      `${GLIFOS['glifo-chevron'].viewBox}|${formaDe('glifo-chevron')}`);

    // Relleno interno paso 3.5 en las cuatro caras (más el borde del control).
    const borde = a.primaria ? 2 : 1;
    if (r.cuadro) {
      t.ok(`acción ${i + 1}: relleno izquierdo paso 3.5`, r.cuadro.caja.izq - r.caja.izq, borde + 3.5 * PASO);
    }
    if (r.titulo) {
      t.ok(`acción ${i + 1}: paso 3.5 entre el cuadro y el texto`,
        !!r.cuadro && r.titulo.caja.izq - r.cuadro.caja.der, 3.5 * PASO);
    }
    if (r.titulo && r.descripcion) {
      t.ok(`acción ${i + 1}: paso 1 entre título y descripción`, r.descripcion.caja.arriba - r.titulo.caja.abajo, PASO);
      t.ok(`acción ${i + 1}: título en tinta y descripción en tintaSec`,
        `${r.titulo.color}|${r.descripcion.color}`, `${rgb(T.tinta)}|${rgb(T.tintaSec)}`);
    }

    // Estado de reposo (K3): primaria con linea border-2; secundarias con borde border.
    t.ok(`acción ${i + 1}: fondo superficie`, r.fondo, rgb(T.superficie));
    t.ok(`acción ${i + 1}: ${a.primaria ? 'primaria: borde linea border-2' : 'secundaria: borde borde border'}`,
      `${r.bordeAncho} ${r.borde}`, a.primaria ? `2px ${rgb(T.linea)}` : `1px ${rgb(T.borde)}`);
    t.ok(`acción ${i + 1}: sin radio ni sombra`, `${r.radio}|${r.sombra}`, '0px|none|none');
  });

  // Sin emoji ni flecha de texto, sin PNG, sin baldosa clara.
  t.ok('sin PNG en la pantalla', h.imagenes, 0);
  t.ok('sin emoji, chevron ni flecha de texto',
    /\p{Extended_Pictographic}|›|←/u.test(h.textoVisible), false);

  if (h.acciones.length === 6 && h.acciones[5].existe && h.privacidad) {
    t.ok('nota de privacidad paso 6 debajo de la última acción',
      h.privacidad.caja.arriba - h.acciones[5].caja.abajo, 6 * PASO);
    t.ok('nota de privacidad con margen lateral paso 6', h.privacidad.caja.izq >= 6 * PASO, true);
    t.ok('nota de privacidad con las dos oraciones',
      h.privacidad.texto.includes('Tus estadísticas y preguntas se guardan localmente en tu navegador.')
        && h.privacidad.texto.includes('Se usan analíticas anónimas (sin cookies ni datos personales).'), true);
    t.ok('relleno inferior del scroll de paso 8', h.relleno, 8 * PASO);
  } else {
    t.ok('hay nota de privacidad', !!h.privacidad, true);
  }
}

async function homeNavegacion(pagina, base, t) {
  await entrarAHome(pagina, base, 390, BCYT);
  for (const a of ACCIONES) {
    const toco = await tocar(pagina, `[data-testid="home-accion-${a.clave}"]`);
    t.ok(`«${a.titulo}»: un toque`, toco, true);
    if (!toco) continue;
    const navego = await esperarRutaEnMarco(pagina, a.ruta);
    t.ok(`«${a.titulo}» navega a ${a.ruta}`, navego, true);
    if (!navego) continue;
    await pagina.evaluar(EN_MARCO('w.history.back(); return true;'));
    t.ok(`«${a.titulo}»: el atrás vuelve a /inicio`, await esperarRutaEnMarco(pagina, '/inicio'), true);
    await pagina.esperarA(async () => (await leerHome(pagina)).tarjeta !== null, { limite: 5000 });
  }

  // «Cambiar materia» vuelve al selector con un toque.
  t.ok('«Cambiar materia»: un toque', await tocar(pagina, '[aria-label="Cambiar materia"]'), true);
  t.ok('«Cambiar materia» vuelve al selector', await esperarRutaEnMarco(pagina, '/'), true);

  // La navegación sigue siendo requestAnimationFrame + navigate con los mismos parámetros,
  // y la pantalla no emite eventos ni conserva lo retirado.
  const fuente = fs.readFileSync(path.join(RAIZ, 'src', 'screens', 'HomeScreen.js'), 'utf8');
  const nav = (fuente.match(/requestAnimationFrame\(\(\) => navigation\.navigate\(/g) || []).length;
  t.ok('seis acciones y «Cambiar materia» navegan con requestAnimationFrame', nav >= 7, true);
  t.ok("modos «practice», «exam» y «failed» en los mismos parámetros",
    ["mode: 'practice'", "mode: 'exam'", "mode: 'failed'"].every((p) => fuente.includes(p)), true);
  t.ok('sin track(...) en HomeScreen.js', /\btrack\(/.test(fuente), false);
  t.ok('sin PNG, sombras, Image ni clases legadas en HomeScreen.js',
    /assets\/[a-z]+\.png|sombras|\bImage\b|rounded-|(?:bg|text|border)-(?:slate|brand|white|muted|accent|success|danger|warning)|activeOpacity|TouchableOpacity/
      .test(fuente), false);
}

// El arnés (cdp.js) no expone «botón abajo sin soltar»: se baja y se suelta con eventos del
// mouse sobre el elemento que está bajo el punto, que es lo que escucha el responder de RNW.
const EVENTO_MOUSE = (tipo, x, y, buttons) => `
  const n = d.elementFromPoint(${x}, ${y}) || d.body;
  n.dispatchEvent(new MouseEvent('${tipo}', { bubbles: true, cancelable: true, composed: true,
    view: w, button: 0, buttons: ${buttons}, clientX: ${x}, clientY: ${y} }));
  return true;
`;
const BAJAR_BOTON = (x, y) => EN_MARCO(EVENTO_MOUSE('mousedown', x, y, 1));
const SOLTAR_BOTON = (x, y) => EN_MARCO(EVENTO_MOUSE('mouseup', x, y, 0));

async function homeEstadosK(pagina, base, t) {
  const T = plancha.claro;
  await entrarAHome(pagina, base, 390, BCYT);
  const sel = (clave) => `[data-testid="home-accion-${clave}"]`;
  const leer = async (clave) => (await leerHome(pagina)).acciones.find((a) => a.clave === clave);

  // Hover (web con puntero): secundaria cambia el borde a linea; primaria suma contorno linea.
  for (const [clave, primaria] of [['examen', false], ['practicar', true]]) {
    const p = await pagina.evaluar(PUNTO(sel(clave)));
    t.ok(`hay acción «${clave}» para el hover`, p !== null, true);
    if (!p) continue;
    await pagina.moverA(p.x, p.y);
    await new Promise((r) => setTimeout(r, 120));
    const r = await leer(clave);
    if (primaria) {
      t.ok('primaria con hover: borde linea y contorno linea 1 px',
        `${r.borde}|${r.contorno}`, `${rgb(T.linea)}|1px ${rgb(T.linea)} solid`);
    } else {
      t.ok('secundaria con hover: el borde pasa a linea, mismo grosor',
        `${r.bordeAncho} ${r.borde}`, `1px ${rgb(T.linea)}`);
    }
    await pagina.moverA(1, 1);
  }

  // Presionado (K3): el botón del mouse abajo y sin soltar invierte el control y todo su
  // contenido: fondo y borde tinta; título, descripción, glifo y chevron en fondo.
  for (const [clave, primaria] of [['examen', false], ['practicar', true]]) {
    const p = await pagina.evaluar(PUNTO(sel(clave)));
    t.ok(`hay acción «${clave}» para el presionado`, p !== null, true);
    if (!p) continue;
    await pagina.moverA(p.x, p.y);
    await pagina.evaluar(BAJAR_BOTON(p.x, p.y));
    await new Promise((r) => setTimeout(r, 150));
    const r = await leer(clave);
    const tipo = primaria ? 'primaria' : 'secundaria';
    t.ok(`${tipo} presionada: fondo y borde en tinta`, `${r.fondo}|${r.borde}`, `${rgb(T.tinta)}|${rgb(T.tinta)}`);
    t.ok(`${tipo} presionada: título en fondo`, !!r.titulo && r.titulo.color, rgb(T.fondo));
    t.ok(`${tipo} presionada: descripción en fondo`, !!r.descripcion && r.descripcion.color, rgb(T.fondo));
    t.ok(`${tipo} presionada: glifo en fondo`, !!r.glifo && r.glifo.stroke, T.fondo);
    t.ok(`${tipo} presionada: chevron en fondo`, !!r.chevron && r.chevron.stroke, T.fondo);
    // Se suelta fuera del control: el responder cancela y no navega.
    await pagina.evaluar(SOLTAR_BOTON(1, 1));
    await pagina.moverA(1, 1);
    await new Promise((r) => setTimeout(r, 120));
    t.ok(`${tipo} presionada: soltar fuera no navega`, await pagina.evaluar(URL_EN_MARCO), '/inicio');
  }

  // Foco con Tab real: contorno foco border-2 separado paso 0.5, llega a las seis acciones.
  await pagina.evaluar(EN_MARCO('document.activeElement && document.activeElement.blur(); return true;'));
  const alcanzadas = new Set();
  for (let i = 0; i < 30 && alcanzadas.size < ACCIONES.length; i++) {
    await pagina.tecla('Tab');
    const foco = await pagina.evaluar(EN_MARCO(`
      const a = d.activeElement;
      const id = a && a.getAttribute('data-testid');
      if (!id || !id.startsWith('home-accion-')) return null;
      const c = w.getComputedStyle(a);
      return { id, ancho: c.outlineWidth, color: c.outlineColor, sep: c.outlineOffset };
    `));
    if (foco) {
      alcanzadas.add(foco.id);
      t.ok(`${foco.id}: foco con contorno foco, border-2 y paso 0.5`,
        `${foco.ancho} ${foco.color} ${foco.sep}`, `2px ${rgb(T.foco)} ${0.5 * PASO}px`);
    }
  }
  t.ok('las seis acciones son parada de Tab', alcanzadas.size, ACCIONES.length);
}

async function homeOscuro(pagina, base, t) {
  const T = plancha.oscuro;
  await entrarAHome(pagina, base, 390, BCYT);
  t.ok('elegir «Oscuro» en el control de tema', await clicEnMarco(pagina, 'oscuro'), true);
  await pagina.esperarA(async () => {
    const h = await leerHome(pagina);
    return !!h.tarjeta && h.tarjeta.fondo === rgb(T.superficie);
  }, { limite: 5000 });
  const h = await leerHome(pagina);
  t.ok('oscuro: tarjeta en superficieD con borde lineaD',
    !!h.tarjeta && `${h.tarjeta.fondo}|${h.tarjeta.borde}`, `${rgb(T.superficie)}|${rgb(T.linea)}`);
  comprobarIlustracion(t, 'oscuro', h.ilustracion, BCYT.ilustracion, T.filamento);
  t.ok('oscuro: rótulo en acentoD', !!h.rotulo && h.rotulo.color, rgb(T.acento));
  const ejemplo = h.acciones[1];
  t.ok('oscuro: acción en superficieD sin baldosa clara',
    !!ejemplo && ejemplo.fondo, rgb(T.superficie));
  t.ok('oscuro: cuadro de glifo con filete oscuro y glifo en tintaD',
    !!ejemplo && !!ejemplo.cuadro && !!ejemplo.glifo
      && `${ejemplo.cuadro.borde}|${ejemplo.glifo.stroke}`, `${rgb(T.filete)}|${T.tinta}`);
  t.ok('oscuro: borde secundario bordeD y primario lineaD',
    `${h.acciones[1].borde}|${h.acciones[0].borde}`, `${rgb(T.borde)}|${rgb(T.linea)}`);
  t.ok('oscuro: sin imágenes PNG', h.imagenes, 0);
}

// Corte de 360 px (comun.md §1.1) y desborde a 320, 360, 390, 768 y 1023 (bajo el corte `escritorio`).
async function homeAnchos(pagina, base, t) {
  for (const ancho of [320, 359, 360, 390, 768, 1023]) {
    t.ok(`${ancho} px: entra a Home`, await entrarAHome(pagina, base, ancho, MATERIAS[2]), true);
    const h = await leerHome(pagina);
    t.ok(`${ancho} px: sin scroll horizontal`, h.desborda, false);
    t.ok(`${ancho} px: hay botón «Cambiar materia»`, h.cambiar !== null, true);
    if (h.cambiar) {
      const conTexto = ancho >= 360;
      t.ok(`${ancho} px: «Cambiar materia» ${conTexto ? 'con glifo y texto' : 'solo como glifo'}`,
        h.cambiar.texto, conTexto ? 'Cambiar materia' : '');
      t.ok(`${ancho} px: «Cambiar materia» es un botón de al menos 44 × 44`,
        h.cambiar.rol === 'button' && h.cambiar.caja.alto >= LADO_TACTIL && h.cambiar.caja.ancho >= LADO_TACTIL, true);
      if (!conTexto) {
        t.ok(`${ancho} px: el cuadrado mide paso 11`, `${h.cambiar.caja.ancho}×${h.cambiar.caja.alto}`, `${LADO_TACTIL}×${LADO_TACTIL}`);
      }
    }
    const columna = Math.min(ancho, COLUMNA);
    const izq = (ancho - columna) / 2 + 5 * PASO;
    t.ok(`${ancho} px: tarjeta con margen lateral paso 5 dentro de la columna`, !!h.tarjeta && h.tarjeta.caja.izq, izq);
    t.ok(`${ancho} px: tarjeta del ancho de la columna menos paso 5 a cada lado`,
      !!h.tarjeta && h.tarjeta.caja.ancho, columna - 2 * 5 * PASO);
    t.ok(`${ancho} px: la celda de ilustración conserva paso 24`, !!h.celda && h.celda.caja.ancho, 24 * PASO);
    t.ok(`${ancho} px: las seis acciones en una sola columna`,
      h.acciones.every((a) => a.existe && a.caja.izq === h.acciones[0].caja.izq), true);
    for (const a of h.acciones) {
      if (!a.existe) continue;
      t.ok(`${ancho} px: «${a.titulo && a.titulo.texto}» conserva cuadro (40) y chevron (16)`,
        !!a.cuadro && !!a.chevron && `${a.cuadro.caja.ancho}|${a.chevron.width}`, '40|16');
    }
    if (ancho <= 360) {
      t.ok(`${ancho} px: la tarjeta de materia no recorta el texto`,
        !!h.tarjeta && h.tarjeta.texto.includes(MATERIAS[2].nombre), true);
    }
  }
}

// Escritorio (Home.md «Escritorio», ESC-P2; Banners.md «Escritorio», ESC-P11; comun.md §7.2).
// Los valores se escriben acá a propósito: son el contrato de la ficha.
const ESC = { corte: 1024, amplio: 1440, lateral: 320, hoja: 952, hojaAmplia: 1440 };
const SEPARACION = 8 * PASO;   // paso 8: margen lateral de la hoja y entre regiones
const CELDA = 4 * PASO;        // paso 4: entre celdas de la rejilla de acciones
const BAJO_BANNER = 3 * PASO;  // paso 3: del banner a la tarjeta
const AL_PIE = 6 * PASO;       // paso 6: de las acciones a la nota de privacidad

const SONDA_FOCO = EN_MARCO(`
  const a = d.activeElement;
  if (!a || a === d.body) return null;
  // Ordenada en la pantalla, no en la ventana: Tab desplaza el scroll para mostrar el foco.
  let scroll = 0;
  for (let n = a.parentElement; n; n = n.parentElement) {
    const o = w.getComputedStyle(n).overflowY;
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight) { scroll = n.scrollTop; break; }
  }
  const r = a.getBoundingClientRect();
  return { id: a.getAttribute('data-testid') || '', nombre: a.getAttribute('aria-label') || '',
    x: r.left, y: r.top + scroll };
`);


// Paradas de Tab de Home que se comparan con el orden visual: nombre o testID.
const PARADAS = ['Cambiar materia', `Escribir a ${CORREO_BANCO}`, ...ACCIONES.map((a) => `home-accion-${a.clave}`)];

// Mide la página (no la ventana) para tres reglas de escritorio de comun.md §7.2:
//  - Anclado: ninguna región queda fija (sin `sticky` ni `fixed` en la hoja y sus ancestros
//    hasta el scroll) y, con la página desplazada, cada región se mueve lo que el scroll.
//  - Foco: ningún ancestro de un control enfocable, bajo el scroll, recorta su contorno, y el
//    contorno (4 px) cabe en los cuatro bordes del contenido.
//  - Orden: coordenadas de cada parada relativas a la página, para compararlas con Tab.
const SONDA_PAGINA = EN_MARCO(`
  const paradas = ${JSON.stringify(PARADAS)};
  const buscar = (nombre) => {
    if (nombre.startsWith('home-accion-')) return visibles('[data-testid="' + nombre + '"]')[0] || null;
    return visibles('[aria-label="' + nombre + '"]')[0] || null;
  };
  const tarjeta = visibles('[data-testid="home-tarjeta-materia"]')[0];
  const acciones = visibles('[data-testid="home-acciones"]')[0];
  if (!tarjeta || !acciones) return null;
  let scroller = null;
  for (let n = tarjeta.parentElement; n; n = n.parentElement) {
    const o = w.getComputedStyle(n).overflowY;
    if (o === 'auto' || o === 'scroll') { scroller = n; break; }
  }
  if (!scroller) return null;
  const raiz = scroller.getBoundingClientRect();
  const alto = () => scroller.scrollTop;
  const pagina = (n) => { const r = n.getBoundingClientRect(); return { x: r.left, y: r.top + alto() - raiz.top, ab: r.bottom + alto() - raiz.top, der: r.right }; };

  // Hoja: el ancestro común más bajo de la tarjeta y de las acciones.
  let hoja = tarjeta.parentElement;
  while (hoja && !hoja.contains(acciones)) hoja = hoja.parentElement;
  const fijos = [];
  const posicion = (n) => w.getComputedStyle(n).position;
  const revisar = (n) => { const p = posicion(n); if (p === 'sticky' || p === 'fixed') fijos.push(n.getAttribute('data-testid') || n.tagName); };
  for (let n = hoja; n && n !== scroller; n = n.parentElement) revisar(n);
  hoja.querySelectorAll('*').forEach(revisar);

  const paradasEl = paradas.map((nombre) => ({ nombre, el: buscar(nombre) }));
  const tema = visibles('[role="radio"]');
  const enfocables = paradasEl.map((p) => p.el).filter(Boolean).concat(tema);
  const recortan = [];
  for (const el of enfocables) {
    for (let n = el.parentElement; n && n !== scroller; n = n.parentElement) {
      const s = w.getComputedStyle(n);
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') {
        recortan.push((el.getAttribute('data-testid') || el.getAttribute('aria-label') || el.tagName)
          + ' <- ' + (n.getAttribute('data-testid') || n.tagName) + ' ' + s.overflowX + '/' + s.overflowY);
      }
    }
  }
  const FOCO = 4;
  const fuera = enfocables.filter((el) => {
    const p = pagina(el);
    return p.x - FOCO < raiz.left || p.der + FOCO > raiz.right || p.y - FOCO < 0 || p.ab + FOCO > scroller.scrollHeight;
  }).map((el) => el.getAttribute('data-testid') || el.getAttribute('aria-label'));

  const posiciones = paradasEl.filter((p) => p.el).map((p) => ({ nombre: p.nombre, ...pagina(p.el) }));
  const regiones = [tarjeta, acciones].map((n) => pagina(n).y);
  const maximo = scroller.scrollHeight - scroller.clientHeight;
  return { fijos, recortan, fuera, posiciones, regiones, maximo, vistaX: raiz.left };
`);

const SONDA_SCROLL = (y) => EN_MARCO(`
  const t = visibles('[data-testid="home-tarjeta-materia"]')[0];
  let s = null;
  for (let n = t.parentElement; n; n = n.parentElement) {
    const o = w.getComputedStyle(n).overflowY;
    if (o === 'auto' || o === 'scroll') { s = n; break; }
  }
  s.scrollTop = ${y};
  const a = visibles('[data-testid="home-acciones"]')[0];
  return { scroll: s.scrollTop, tarjeta: t.getBoundingClientRect().top, acciones: a.getBoundingClientRect().top };
`);

// Recorre Tab desde el principio y devuelve, en orden, «Cambiar materia», el contacto del
// banner y las seis acciones (el control de tema y lo demás no entran en la comparación).
async function recorrerFoco(pagina) {
  // Se parte de «Cambiar materia»: tras elegir el tema, el foco quedó en su control.
  await pagina.evaluar(EN_MARCO(`
    const b = visibles('[aria-label="Cambiar materia"]')[0];
    if (b) b.focus();
    return true;
  `));
  const vistos = [];
  const inicial = await pagina.evaluar(SONDA_FOCO);
  if (inicial) vistos.push(inicial);
  for (let i = 0; i < 40; i++) {
    await pagina.tecla('Tab');
    const f = await pagina.evaluar(SONDA_FOCO);
    if (!f) continue;
    if (f.nombre === 'Cambiar materia' || f.nombre.startsWith('Escribir a') || f.id.startsWith('home-accion-')) {
      vistos.push(f);
    }
    if (f.id === 'home-accion-ajustes') break;
  }
  return vistos;
}

async function capturar(pagina, ancho, alto, nombre) {
  if (!process.env.PKAPP_CAPTURAS) return;
  const dir = path.join(RAIZ, 'openspec', 'changes', 'rediseno-plancha', 'evidencia', 'despues', '3.11c');
  fs.mkdirSync(dir, { recursive: true });
  await pagina.enviar('Emulation.setDeviceMetricsOverride',
    { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });
  await new Promise((r) => setTimeout(r, 400));
  const r = await pagina.enviar('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(dir, nombre), Buffer.from(r.data, 'base64'));
}

async function homeEscritorio(pagina, base, t) {
  const reducida = MATERIAS.find((m) => m.reducido);
  // 1280, 1439 y 1440 miden los bordes del corte `amplio` (1440): 1439 una columna, 1440 dos.
  const casos = [[1023, 800, ['claro']], [1024, 768, ['claro', 'oscuro']],
    [1280, 800, ['claro']], [1366, 768, ['claro', 'oscuro']], [1439, 800, ['claro']],
    [1440, 900, ['claro']], [1920, 1080, ['claro', 'oscuro']]];
  for (const [ancho, alto, temas] of casos) {
    for (const tema of temas) {
      const cuando = (m) => `${ancho} px ${tema}: ${m}`;
      // El puntero del arnés se mueve en la ventana de la página: tiene que abarcar el marco.
      await pagina.enviar('Emulation.setDeviceMetricsOverride',
        { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });
      t.ok(cuando('entra a Home'), await entrarAHome(pagina, base, ancho, reducida, alto), true);
      if (tema === 'oscuro') {
        await clicEnMarco(pagina, 'oscuro');
        await pagina.esperarA(async () => {
          const h = await leerHome(pagina);
          return !!h.tarjeta && h.tarjeta.fondo === rgb(plancha.oscuro.superficie);
        }, { limite: 5000 });
      }
      const h = await leerHome(pagina);
      const de = ancho >= ESC.corte;
      const acc = h.acciones;
      t.ok(cuando('hay tarjeta, banner, rótulo, seis acciones y nota de privacidad'),
        !!h.tarjeta && !!h.banner && !!h.rotulo && !!h.privacidad && acc.every((a) => a.existe), true);
      if (!h.tarjeta || !h.banner || !h.rotulo || !h.privacidad || !acc.every((a) => a.existe)) continue;
      t.ok(cuando('sin scroll horizontal'), h.desborda, false);

      // 44 × 44 en todo lo que se toca
      t.ok(cuando('acciones, «Cambiar materia» y contacto del banner de al menos 44 × 44'),
        acc.every((a) => a.caja.alto >= LADO_TACTIL && a.caja.ancho >= LADO_TACTIL)
          && !!h.cambiar && h.cambiar.caja.alto >= LADO_TACTIL && h.cambiar.caja.ancho >= LADO_TACTIL
          && !!h.banner.boton && h.banner.boton.caja.alto >= LADO_TACTIL, true);

      const util = Math.min(ancho >= ESC.amplio ? ESC.hojaAmplia : ESC.hoja, ancho - 2 * SEPARACION);
      const izq = (ancho - util) / 2;
      const principalIzq = izq + ESC.lateral + SEPARACION;
      const principalAncho = util - ESC.lateral - SEPARACION;
      const ultimoAbajo = Math.max(...acc.map((a) => a.caja.abajo));

      // HeaderMarca: su contenido va en la misma hoja que el contenido (D6). Con `columna` bajo
      // el corte y `hoja`/`hoja-amplia` desde él; el margen lateral es al menos paso 8.
      t.ok(cuando('«Cambiar materia» alineado con el borde izquierdo de la hoja'),
        !!h.cambiar && h.cambiar.caja.izq, h.tarjeta.caja.izq);
      t.ok(cuando('control de tema alineado con el borde derecho de la hoja'),
        !!h.tema && h.tema.der, de ? izq + util : h.tarjeta.caja.der);
      if (de) {
        t.ok(cuando('margen lateral de la hoja de al menos paso 8'), izq >= SEPARACION, true);
      }

      if (!de) {
        // Bajo el corte: igual que hoy (una columna `columna`, todo apilado).
        t.ok(cuando('tarjeta y banner del ancho de la columna menos paso 5 a cada lado'),
          `${h.tarjeta.caja.ancho}|${h.banner.caja.ancho}`, `${COLUMNA - 2 * 5 * PASO}|${COLUMNA - 2 * 5 * PASO}`);
        t.ok(cuando('seis acciones en una columna, bajo el banner'),
          acc.every((a) => a.caja.izq === acc[0].caja.izq && a.caja.arriba >= h.banner.caja.abajo), true);
        t.ok(cuando('nota de privacidad bajo las acciones'), h.privacidad.caja.arriba >= ultimoAbajo, true);
      } else {
        t.ok(cuando(`tarjeta lateral de ${ESC.lateral} px a la izquierda de la hoja`),
          `${h.tarjeta.caja.izq}|${h.tarjeta.caja.ancho}`, `${izq}|${ESC.lateral}`);
        t.ok(cuando('banner en la lateral, a su ancho y bajo la tarjeta a paso 3'),
          `${h.banner.caja.izq}|${h.banner.caja.ancho}|${h.banner.caja.arriba - h.tarjeta.caja.abajo}`,
          `${izq}|${ESC.lateral}|${BAJO_BANNER}`);
        t.ok(cuando('el contacto del banner mide paso 11 y su correo entra en una línea'),
          !!h.banner.boton && h.banner.boton.caja.alto === LADO_TACTIL
            && h.banner.boton.caja.der <= h.banner.caja.der, true);
        t.ok(cuando('rótulo a paso 4 del inicio de la hoja (HOME-P2)'),
          h.rotulo.caja.arriba - h.header.abajo, 4 * PASO);
        t.ok(cuando('región principal: a paso 8 de la lateral y del ancho restante'),
          `${h.listaAcciones.izq}|${h.listaAcciones.ancho}`, `${principalIzq}|${principalAncho}`);
        t.ok(cuando('la tarjeta queda a la izquierda de las acciones'),
          acc.every((a) => a.caja.izq > h.tarjeta.caja.der), true);

        if (ancho < ESC.amplio) {
          t.ok(cuando('seis acciones en una columna, de ancho completo'),
            acc.every((a) => a.caja.izq === principalIzq && a.caja.ancho === principalAncho), true);
          t.ok(cuando('la descripción de cada acción en una línea'),
            acc.every((a) => a.descripcion.caja.alto < 1.75 * parseFloat(a.descripcion.tamano)), true);
        } else {
          const celda = (principalAncho - CELDA) / 2;
          t.ok(cuando('acciones en 2 columnas de igual ancho, separadas por paso 4'),
            acc.map((a, i) => `${a.caja.ancho}|${a.caja.izq === principalIzq + (i % 2) * (celda + CELDA)}`).join(','),
            acc.map(() => `${celda}|true`).join(','));
          t.ok(cuando('orden 1 2 / 3 4 / 5 6, con la primaria primera'),
            acc.every((a, i) => i < 2 || a.caja.arriba > acc[i - 2].caja.arriba)
              && acc[0].caja.arriba === acc[1].caja.arriba, true);
          t.ok(cuando('filas separadas por paso 4'),
            `${acc[2].caja.arriba - acc[0].caja.abajo}|${acc[4].caja.arriba - acc[2].caja.abajo}`, `${CELDA}|${CELDA}`);
        }
        t.ok(cuando('nota de privacidad al pie de la principal, a paso 6'),
          h.privacidad.caja.arriba - ultimoAbajo, AL_PIE);
        t.ok(cuando('nota de privacidad centrada en la región principal'),
          Math.abs((h.privacidad.caja.izq + h.privacidad.caja.der) / 2 - (principalIzq + principalAncho / 2)) <= 0.5, true);
      }

      // Foco = DOM = visual
      const foco = await recorrerFoco(pagina);
      const esperado = ['Cambiar materia', `Escribir a ${CORREO_BANCO}`,
        ...ACCIONES.map((a) => `home-accion-${a.clave}`)];
      t.ok(cuando('Tab: «Cambiar materia», contacto del banner y las seis acciones en orden'),
        foco.map((f) => f.nombre || f.id).join(','), esperado.join(','));
      // Orden visual medido en la página: cabecera, lateral (arriba-abajo), principal
      // (arriba-abajo, izquierda-derecha). Tab tiene que coincidir con él.
      const p = await pagina.evaluar(SONDA_PAGINA);
      t.ok(cuando('sonda de página disponible'), !!p, true);
      if (p) {
        const region = (q) => (q.nombre === 'Cambiar materia' ? 0 : q.x < principalIzq - 1 ? 1 : 2);
        const visual = p.posiciones.slice().sort((a, b) =>
          region(a) - region(b) || a.y - b.y || a.x - b.x).map((q) => q.nombre);
        const tabs = foco.map((f) => f.nombre || f.id);
        t.ok(cuando('Tab coincide con el orden visual medido en la página'),
          tabs.join(','), (de ? visual : esperado).join(','));
        t.ok(cuando('ninguna región queda fija (sin sticky ni fixed)'), p.fijos.join('|'), '');
        t.ok(cuando('ningún ancestro de un control enfocable recorta su contorno'), p.recortan.join('|'), '');
        t.ok(cuando('el contorno de foco (4 px) cabe en los cuatro bordes del contenido'), p.fuera.join('|'), '');
        // Desplazada la página, las regiones se mueven con ella.
        const tope = Math.min(p.maximo, 200);
        if (tope > 0) {
          const antes = await pagina.evaluar(SONDA_SCROLL(0));
          const despues = await pagina.evaluar(SONDA_SCROLL(tope));
          t.ok(cuando('desplazada la página, tarjeta y acciones se mueven lo mismo que el scroll'),
            `${antes.tarjeta - despues.tarjeta}|${antes.acciones - despues.acciones}`,
            `${despues.scroll}|${despues.scroll}`);
          await pagina.evaluar(SONDA_SCROLL(0));
        }
      }

      // Las figuras muestran el estado en reposo: sin contorno de foco de la pasada de Tab.
      await pagina.evaluar(EN_MARCO('if (d.activeElement && d.activeElement.blur) d.activeElement.blur(); return true;'));
      t.ok(cuando('sin foco visible al capturar'),
        await pagina.evaluar(EN_MARCO('return !d.activeElement || d.activeElement === d.body;')), true);
      if ([1024, 1366, 1920].includes(ancho)) await capturar(pagina, ancho, alto, `home-${ancho}-${tema}.png`);
    }
  }
}

module.exports = [
  { nombre: 'Home: tarjeta de materia con ilustración, id y conteos separados', correr: homeTarjetaDeMateria },
  { nombre: 'Home: banner de banco reducido solo en cyr y neuro', correr: homeBancoReducido },
  { nombre: 'Home: rótulo «Plano / Acciones» y seis acciones en orden', correr: homeRotuloYAcciones },
  { nombre: 'Home: navegación de cada acción', correr: homeNavegacion },
  { nombre: 'Home: estados K de las acciones', correr: homeEstadosK },
  { nombre: 'Home: tema oscuro sin baldosa clara', correr: homeOscuro },
  { nombre: 'Home: corte de 360 px y sin scroll horizontal', correr: homeAnchos },
  { nombre: 'Home: escritorio, regiones, columnas y foco (ESC-P2, ESC-P11)', correr: homeEscritorio },
  { nombre: 'atrás y adelante del navegador', correr: atrasDelNavegador },
  { nombre: 'HeaderMarca: mismo alto en MateriaSelect y Home', correr: altoDeHeaderIgual },
  { nombre: 'Barra interna: mismo alto con y sin volver, quiz sin barra', correr: barraInternaConYSinVolver },
  { nombre: 'Barra interna: el volver hace goBack', correr: volverDeLaBarra },
];

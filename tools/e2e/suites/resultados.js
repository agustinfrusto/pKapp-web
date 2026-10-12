// Suite «resultados» del arnés end-to-end (ver ../README.md).
//
// Cubre `ResultsScreen` y su revisión de respuestas (tarea 3.6, fichas `Results.md` y
// `Revision.md`). El porcentaje que muestra la pantalla sale de las respuestas que recibe
// por `route.params`: el arnés no puede fijarlo respondiendo bien un quiz real, así que
// las suites de abajo entran a Home en un marco y navegan a `Results` con respuestas
// armadas (el `navigation` de la pantalla se toma del árbol de React). El recorrido real
// de un quiz terminado sigue cubierto por la primera suite.

const fs = require('fs');
const path = require('path');
const { plancha } = require('../../../src/theme/colores');
const { GLIFOS } = require('../../../src/assets/glifos');
const {
  EN_MARCO, LADO_TACTIL, PASO, abrirMarco, clicEnMarco, entrarAMateria, irAHomeEnMarco,
} = require('./comunes');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const FUENTE = path.join(RAIZ, 'src', 'screens', 'ResultsScreen.js');

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const COLUMNA = 448;                  // max-w-columna
const MARGEN = 5 * PASO;              // paso 5

// Primer tema real de BCyT: clave y nombre legible (topics.js es ESM: se lee como texto).
const TEMA = (() => {
  const m = fs.readFileSync(path.join(RAIZ, 'src', 'materias', 'bcyt', 'topics.js'), 'utf8')
    .match(/'([a-z0-9-]+)':\s*'([^']+)'/);
  return { clave: m[1], nombre: m[2] };
})();

// ---------------------------------------------------------------------------
// Datos
// ---------------------------------------------------------------------------

// `falladas`: índices (base 0) de las respuestas incorrectas. Explicación en las pares.
function respuestas(total, falladas = [], conExplicacion = (i) => i % 2 === 0) {
  const malas = new Set(falladas);
  return Array.from({ length: total }, (_, i) => ({
    question: {
      id: `e2e-${i + 1}`,
      question: `Enunciado de prueba ${i + 1}`,
      options: ['Opción uno', 'Opción dos', 'Opción tres', 'Opción cuatro'],
      correctIndex: 1,
      explanation: conExplicacion(i) ? `Explicación de prueba ${i + 1}` : '',
      topic: TEMA.clave,
    },
    selectedIndex: malas.has(i) ? 0 : 1,
    isCorrect: !malas.has(i),
  }));
}

const conAciertos = (total, aciertos) =>
  respuestas(total, Array.from({ length: total - aciertos }, (_, i) => aciertos + i));

const ALTO = { estado: 'acierto', glifo: 'glifo-acierto' };
const MEDIO = { estado: 'intermedia', glifo: 'glifo-intermedia' };
const BAJO = { estado: 'error', glifo: 'glifo-error' };

// Cortes de D6: 90, 75, 60 y 50; el color cambia en 75 y en 50 (Results.md d.1).
const TRAMOS = [
  { total: 10, aciertos: 10, pct: 100, mensaje: '¡Excelente!.', ...ALTO },
  { total: 10, aciertos: 9, pct: 90, mensaje: '¡Excelente!.', ...ALTO },
  { total: 19, aciertos: 17, pct: 89, mensaje: 'Muy bien. Vas por buen camino.', ...ALTO },
  { total: 4, aciertos: 3, pct: 75, mensaje: 'Muy bien. Vas por buen camino.', ...ALTO },
  { total: 50, aciertos: 37, pct: 74, mensaje: 'A repasar solo un poco más.', ...MEDIO },
  { total: 5, aciertos: 3, pct: 60, mensaje: 'A repasar solo un poco más.', ...MEDIO },
  { total: 100, aciertos: 59, pct: 59, mensaje: 'Seguí mejorando.', ...MEDIO },
  { total: 10, aciertos: 5, pct: 50, mensaje: 'Seguí mejorando.', ...MEDIO },
  { total: 51, aciertos: 25, pct: 49, mensaje: 'A estudiar fuerte. Vos podés.', ...BAJO },
  { total: 10, aciertos: 0, pct: 0, mensaje: 'A estudiar fuerte. Vos podés.', ...BAJO },
];

// ---------------------------------------------------------------------------
// Entrada a la pantalla
// ---------------------------------------------------------------------------

const URL_EN_MARCO = EN_MARCO('return w.location.pathname;');
const esperarRuta = (pagina, ruta) => pagina.esperarA(async () =>
  await pagina.evaluar(URL_EN_MARCO) === ruta);

// Toma el `navigation` de la pantalla que está montada (Home) desde el árbol de React.
const NAVEGAR = (params, conteoDonacion) => EN_MARCO(`
  ${conteoDonacion === undefined ? '' : `w.localStorage.setItem('pkapp_donation_count', '${conteoDonacion}');`}
  for (const n of Array.from(d.querySelectorAll('*'))) {
    const k = Object.keys(n).find((x) => x.startsWith('__reactFiber$'));
    if (!k) continue;
    for (let f = n[k]; f; f = f.return) {
      const nav = f.memoizedProps && f.memoizedProps.navigation;
      if (nav && typeof nav.navigate === 'function') {
        nav.navigate('Results', ${JSON.stringify(params)});
        return true;
      }
    }
  }
  return false;
`);

// Abre la app en un marco del ancho pedido, entra a Home y navega a Results.
// `donacion`: 0 fuerza el pedido de donación si el porcentaje lo permite (1.er aprobado).
async function abrirResultados(pagina, base, {
  ancho = 390, alto, answers, topic = TEMA.clave, mode = 'practice', oscuro = false, donacion,
}) {
  // El puntero del arnés se mueve en la ventana de la página (900 de ancho por defecto): tiene
  // que abarcar el marco para tocar controles de la región principal a 1366 y 1920.
  if (ancho > 900) {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: ancho, height: alto || 800, deviceScaleFactor: 1, mobile: false });
  }
  await abrirMarco(pagina, base, ancho, alto);
  await irAHomeEnMarco(pagina);
  if (oscuro) {
    await clicEnMarco(pagina, 'oscuro');
    await pagina.esperarA(async () => await pagina.evaluar(EN_MARCO(`
      const r = visibles('[role="radio"][aria-checked="true"]')[0];
      return !!r && r.textContent.toLowerCase().includes('oscuro');
    `)), { limite: 5000 });
  }
  return navegarA(pagina, { answers, topic, mode }, donacion);
}

async function navegarA(pagina, params, donacion) {
  if (await pagina.evaluar(URL_EN_MARCO) === '/resultados') {
    await pagina.evaluar(EN_MARCO('w.history.back(); return true;'));
    await esperarRuta(pagina, '/inicio');
  }
  if (!await pagina.evaluar(NAVEGAR(params, donacion))) return false;
  if (!await esperarRuta(pagina, '/resultados')) return false;
  return pagina.esperarA(async () => (await pagina.evaluar(LEER)).hayPantalla, { limite: 5000 });
}

// ---------------------------------------------------------------------------
// Lectura
// ---------------------------------------------------------------------------

// Todo lo que mide la pantalla. Los testID salen de las fichas: resultados-tarjeta,
// resultados-rotulo, resultados-porcentaje, resultados-subtitulo, resultados-mensaje,
// resultados-tira, resultados-tira-casilla, resultados-leyenda, resultados-chip-tema,
// resultados-trio (con -correctas, -incorrectas, -total y su -cifra), resultados-revisar,
// resultados-reintentar, resultados-inicio y, en la revisión, revision-*.
const LEER = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const uno = (id) => visibles('[data-testid="' + id + '"]')[0] || null;
  const todos = (pref) => visibles('[data-testid^="' + pref + '"]');
  const estilo = (n) => (n ? w.getComputedStyle(n) : null);
  const txt = (n) => (n ? n.textContent.trim().replace(/\\s+/g, ' ') : null);
  const hoja = (n) => {
    if (!n) return null;
    const tw = d.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    let x;
    while ((x = tw.nextNode())) if (x.textContent.trim()) return x.parentElement;
    return null;
  };
  const glifos = (n) => (n ? Array.from(n.querySelectorAll('svg')).map((s) => ({
    ancho: s.getAttribute('width'),
    primerD: s.children[0] ? s.children[0].getAttribute('d') : null,
    oculto: s.getAttribute('aria-hidden'),
  })) : []);
  const texto = (n) => {
    const h = hoja(n);
    const e = estilo(h);
    return h ? {
      texto: txt(h), color: e.color, tamano: e.fontSize, mayusculas: e.textTransform,
      familia: e.fontFamily,
    } : null;
  };
  const control = (id) => {
    const n = uno(id);
    if (!n) return null;
    const marco = n.firstElementChild;
    const e = estilo(n), k = estilo(marco);
    return {
      caja: caja(n), rol: n.getAttribute('role'), nombre: n.getAttribute('aria-label'),
      texto: txt(n), fondo: k.backgroundColor, borde: k.borderTopColor, bordeAncho: k.borderTopWidth,
      color: texto(n) && texto(n).color, contorno: e.outlineWidth + ' ' + e.outlineStyle + ' ' + e.outlineColor,
      radio: k.borderTopLeftRadius, sombra: e.boxShadow + '|' + k.boxShadow, glifos: glifos(n),
    };
  };
  const tarjeta = uno('resultados-tarjeta');
  const trio = uno('resultados-trio');
  const tira = uno('resultados-tira');
  const celda = (id) => {
    const n = uno(id);
    if (!n) return null;
    const cifra = n.querySelector('[data-testid="' + id + '-cifra"]');
    const rotulo = n.querySelector('[data-testid="' + id + '-rotulo"]');
    return {
      caja: caja(n), borde: estilo(n).borderLeftWidth + ' ' + estilo(n).borderLeftColor,
      cifra: texto(cifra), rotulo: texto(rotulo), glifos: glifos(rotulo),
    };
  };
  const barra = uno('barra-interna');
  const botones = ['resultados-revisar', 'resultados-reintentar', 'resultados-inicio'];
  const ultimo = botones.map(uno).filter(Boolean).pop() || null;
  const fin = uno('revision-inicio') || ultimo;
  // El scroller de la pantalla y su contenido: el relleno inferior es lo que sobra entre el
  // último control y el final del contenido (no el alto del scroller, que puede ser mayor).
  let scroller = null;
  for (let n = fin || tarjeta; n; n = n.parentElement) {
    const o = w.getComputedStyle(n).overflowY;
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > 0) { scroller = n; break; }
  }
  const revision = uno('revision-titulo');
  const grupo = visibles('[role="radiogroup"][aria-label="Mostrar"]')[0] || null;
  return {
    vista: w.innerWidth,
    ruta: w.location.pathname,
    hayPantalla: /\\d+ de \\d+ correctas|Revisión completa/.test(d.body.innerText),
    desborda: desbordes().length > 0,
    historial: w.history.length,
    texto: d.body.innerText,
    barra: caja(barra),
    tarjeta: tarjeta ? {
      caja: caja(tarjeta), marcas: tarjeta.querySelectorAll('[data-testid="marca-esquina"]').length,
      fondo: estilo(tarjeta.firstElementChild).backgroundColor,
      borde: estilo(tarjeta.firstElementChild).borderTopColor,
      bordeAncho: estilo(tarjeta.firstElementChild).borderTopWidth,
    } : null,
    rotulo: texto(uno('resultados-rotulo')),
    rotuloCaja: caja(uno('resultados-rotulo')),
    porcentaje: uno('resultados-porcentaje') ? {
      caja: caja(uno('resultados-porcentaje')), texto: texto(uno('resultados-porcentaje')),
      glifos: glifos(uno('resultados-porcentaje')),
    } : null,
    subtitulo: texto(uno('resultados-subtitulo')),
    subtituloCaja: caja(uno('resultados-subtitulo')),
    mensaje: texto(uno('resultados-mensaje')),
    mensajeCaja: caja(uno('resultados-mensaje')),
    tira: tira ? {
      caja: caja(tira), nombre: tira.getAttribute('aria-label'),
      casillas: Array.from(tira.querySelectorAll('[data-testid="resultados-tira-casilla"]')).map((c) => ({
        ...caja(c), fondo: estilo(c).backgroundColor,
      })),
    } : null,
    leyenda: uno('resultados-leyenda') ? {
      caja: caja(uno('resultados-leyenda')), texto: txt(uno('resultados-leyenda')),
      muestras: Array.from(uno('resultados-leyenda').querySelectorAll('[data-testid^="resultados-leyenda-muestra"]'))
        .map((m) => ({ ...caja(m), fondo: estilo(m).backgroundColor, id: m.getAttribute('data-testid') })),
    } : null,
    chip: uno('resultados-chip-tema') ? {
      caja: caja(uno('resultados-chip-tema')), texto: texto(uno('resultados-chip-tema')),
      borde: estilo(uno('resultados-chip-tema')).borderTopColor,
      bordeAncho: estilo(uno('resultados-chip-tema')).borderTopWidth,
      fondo: estilo(uno('resultados-chip-tema')).backgroundColor,
    } : null,
    trio: trio ? {
      caja: caja(trio), marcas: trio.querySelectorAll('[data-testid="marca-esquina"]').length,
      fondo: estilo(trio.firstElementChild).backgroundColor,
      borde: estilo(trio.firstElementChild).borderTopColor,
    } : null,
    correctas: celda('resultados-trio-correctas'),
    incorrectas: celda('resultados-trio-incorrectas'),
    total: celda('resultados-trio-total'),
    donacion: uno('donacion') ? {
      caja: caja(uno('donacion')), texto: txt(uno('donacion')),
      trofeo: !!uno('donacion-trofeo'), descartar: !!uno('donacion-descartar'),
      montos: todos('donacion-monto-').map((n) => n.getAttribute('data-testid').replace('donacion-monto-', '')),
    } : null,
    revisar: control('resultados-revisar'),
    reintentar: control('resultados-reintentar'),
    inicio: control('resultados-inicio'),
    relleno: scroller && scroller.firstElementChild && fin
      ? scroller.firstElementChild.getBoundingClientRect().bottom - fin.getBoundingClientRect().bottom
      : null,
    // Revisión
    revision: revision ? {
      titulo: texto(revision), resumen: texto(uno('revision-resumen')),
      tituloCaja: caja(revision), resumenCaja: caja(uno('revision-resumen')),
    } : null,
    volverArriba: control('revision-volver-arriba'),
    volverFinal: control('revision-volver'),
    inicioFinal: control('revision-inicio'),
    filtro: grupo ? {
      caja: caja(grupo), nombre: grupo.getAttribute('aria-label'),
      opciones: Array.from(grupo.querySelectorAll('[role="radio"]')).map((o) => ({
        texto: txt(o), marcada: o.getAttribute('aria-checked'), ...caja(o),
        fondo: estilo(o.firstElementChild).backgroundColor,
        borde: estilo(o.firstElementChild).borderTopColor,
        color: texto(o) && texto(o).color,
      })),
    } : null,
    tarjetas: todos('revision-tarjeta-').filter((n) => /^revision-tarjeta-\\d+$/.test(n.getAttribute('data-testid')))
      .map((n) => {
        const id = n.getAttribute('data-testid');
        const nota = n.querySelector('[data-testid="' + id.replace('tarjeta', 'nota') + '"]');
        const reportar = n.querySelector('[data-testid="' + id.replace('tarjeta', 'reportar') + '"]');
        const e = estilo(n);
        return {
          id, caja: caja(n), texto: txt(n), bordeIzq: e.borderLeftWidth + ' ' + e.borderLeftColor,
          nota: nota ? txt(nota) : null, notaCaja: caja(nota),
          reportar: reportar ? {
            caja: caja(reportar), texto: txt(reportar), nombre: reportar.getAttribute('aria-label'),
            glifos: glifos(reportar),
          } : null,
          glifos: glifos(n),
        };
      }),
  };
`);

// Punto central de un elemento por `data-testid`, ya desplazado a la vista.
const PUNTO = (id) => EN_MARCO(`
  const n = visibles('[data-testid="${id}"]')[0] || visibles('[aria-label="${id}"]')[0];
  if (!n) return null;
  n.scrollIntoView({ block: 'center' });
  const r = n.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
`);

async function tocar(pagina, id) {
  await pagina.evaluar(PUNTO(id));
  await new Promise((r) => setTimeout(r, 300));
  const p = await pagina.evaluar(PUNTO(id));
  if (!p) return false;
  await pagina.clicEn(p.x, p.y);
  return true;
}

const leer = (pagina) => pagina.evaluar(LEER);

// Espía de analítica: `track` llama a `window.umami.track(evento, datos)` si existe. Se
// instala en el marco antes de navegar; solo registra eventos con nombre (el pageview
// sintético pasa una función). `window.open` queda anulado: un toque en un monto no abre pestañas.
const ESPIAR = EN_MARCO(`
  w.__eventos = [];
  w.umami = { track: (e, datos) => { if (typeof e === 'string') w.__eventos.push([e, datos || null]); } };
  w.open = () => null;
  return true;
`);
const EVENTOS = EN_MARCO('return JSON.parse(JSON.stringify(w.__eventos || []));');

// Un control por expresión de búsqueda (dentro de EN_MARCO): su punto central y su aspecto.
const LEER_K = (buscar) => EN_MARCO(`
  const uno = (id) => visibles('[data-testid="' + id + '"]')[0] || null;
  const n = ${buscar};
  if (!n) return null;
  n.scrollIntoView({ block: 'center' });
  const r = n.getBoundingClientRect();
  const e = w.getComputedStyle(n), k = w.getComputedStyle(n.firstElementChild);
  const tw = d.createTreeWalker(n, NodeFilter.SHOW_TEXT);
  let x, hoja = null;
  while ((x = tw.nextNode())) if (x.textContent.trim()) { hoja = x.parentElement; break; }
  return {
    x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2),
    fondo: k.backgroundColor, borde: k.borderTopColor, color: hoja ? w.getComputedStyle(hoja).color : null,
    contorno: e.outlineWidth + ' ' + e.outlineStyle + ' ' + e.outlineColor,
  };
`);

// Botón del mouse abajo sobre el control y sin soltar (el arnés de la suite no expone el
// mouse-down sostenido del navegador): `mousedown` en el control y `mouseup` fuera de él, que
// es lo que hace el responder de la plataforma. Soltar fuera cancela el toque.
const MOUSE = (buscar, tipo) => EN_MARCO(`
  const uno = (id) => visibles('[data-testid="' + id + '"]')[0] || null;
  const n = ${buscar};
  if (!n) return false;
  const r = n.getBoundingClientRect();
  const sobre = ${tipo === 'mousedown'};
  (sobre ? n : d).dispatchEvent(new MouseEvent('${tipo}', {
    bubbles: true, cancelable: true, view: w, button: 0, buttons: ${tipo === 'mousedown' ? 1 : 0},
    clientX: sobre ? r.left + r.width / 2 : 1, clientY: sobre ? r.top + r.height / 2 : 1,
  }));
  return true;
`);

// ---------------------------------------------------------------------------
// Recorrido real (conservado de la suite original)
// ---------------------------------------------------------------------------

async function terminarUnQuizNoPregunta(pagina, base, t) {
  await entrarAMateria(pagina, base);
  await pagina.clic('Entrena Temas/Parciales');
  t.ok('modo práctica', await pagina.esperarUrl('/temas/practice'), true);

  // El tema más corto, para que el quiz sea de pocas preguntas.
  const tema = await pagina.evaluar(`(function () {
    const visibles = Array.from(document.querySelectorAll('[tabindex]'))
      .filter((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((n) => (n.innerText || '').trim().replace(/\\s+/g, ' '))
      .filter((t) => / \\d+ preguntas$/.test(t) && !t.includes('mezclados'));
    if (!visibles.length) return null;
    visibles.sort((a, b) =>
      parseInt(a.match(/(\\d+) preguntas$/)[1]) - parseInt(b.match(/(\\d+) preguntas$/)[1]));
    return visibles[0];
  })()`);
  if (!tema) { t.ok('se encontró algún tema', false, true); return; }

  const total = parseInt(tema.match(/(\d+) preguntas$/)[1], 10);
  t.nota(`  tema elegido: ${tema}`);
  // El innerText real trae un salto de línea antes del contador: se busca por
  // el nombre pelado o no matchea nada.
  // La fila de tema puede traer el número de orden delante («24 Palancas…»): se busca
  // por el nombre solo.
  await pagina.clic(tema.replace(/ \d+ preguntas$/, '').replace(/^\d+ /, ''));
  t.ok('el quiz arrancó', await pagina.esperarUrl('/quiz'), true);

  pagina.dialogos.length = 0;
  for (let i = 0; i < total + 2; i++) {
    if (await pagina.url() !== '/quiz') break;
    const opcionA = await pagina.evaluar(`(function () {
      const nodos = Array.from(document.querySelectorAll('[tabindex]')).filter((n) => {
        const r = n.getBoundingClientRect();
        return /^A\\s/.test((n.innerText || '').trim()) && r.width > 0 && r.height > 0;
      });
      if (!nodos.length) return null;
      nodos[0].scrollIntoView({ block: 'center' });
      const r = nodos[0].getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`);
    if (opcionA) await pagina.clicEn(opcionA.x, opcionA.y);
    await pagina.esperarA(async () =>
      !!(await pagina.ubicar('Siguiente')) || !!(await pagina.ubicar('Ver resultados')),
      { limite: 5000 });
    if (!await pagina.clic('Ver resultados')) await pagina.clic('Siguiente');
  }

  t.ok('terminar el quiz lleva a /resultados', await pagina.esperarUrl('/resultados'), true);
  t.ok('terminar el quiz NO pide confirmación', pagina.dialogos.length, 0);

  await pagina.evaluar('history.back()');
  await pagina.esperarA(async () => await pagina.url() !== '/resultados', { limite: 5000 });
  t.ok('el atrás desde resultados no pregunta', pagina.dialogos.length, 0);
}

// ---------------------------------------------------------------------------
// Resumen (Results.md)
// ---------------------------------------------------------------------------

async function tarjetaPorTramo(pagina, base, t) {
  const T = plancha.claro;
  const primero = TRAMOS[0];
  t.ok('navegar a /resultados con respuestas armadas',
    await abrirResultados(pagina, base, { answers: conAciertos(primero.total, primero.aciertos) }), true);

  // Estructura de la tarjeta (a.1, a.2, b).
  let h = await leer(pagina);
  t.ok('hay tarjeta de resultado', h.tarjeta !== null, true);
  if (h.tarjeta) {
    t.ok('tarjeta: fondo superficie, borde linea border',
      `${h.tarjeta.fondo}|${h.tarjeta.borde}|${h.tarjeta.bordeAncho}`, `${rgb(T.superficie)}|${rgb(T.linea)}|1px`);
    t.ok('tarjeta: cuatro marcas de esquina', h.tarjeta.marcas, 4);
    t.ok('tarjeta: paso 4 debajo de la barra interna',
      !!h.barra && h.tarjeta.caja.arriba - h.barra.abajo, 4 * PASO);
    t.ok('tarjeta: margen lateral paso 5', h.tarjeta.caja.izq, MARGEN);
    t.ok('tarjeta: ancho de la columna menos paso 5 a cada lado', h.tarjeta.caja.ancho, 390 - 2 * MARGEN);
  }
  t.ok('rótulo «Resultado» (RESULTS-P1)', !!h.rotulo && h.rotulo.texto, 'Resultado');
  if (h.rotulo) {
    t.ok('rótulo en tintaSec, paso rotulo (11 px) en mayúsculas',
      `${h.rotulo.color}|${h.rotulo.tamano}|${h.rotulo.mayusculas}`, `${rgb(T.tintaSec)}|11px|uppercase`);
  }
  if (h.rotuloCaja && h.tarjeta && h.porcentaje) {
    t.ok('rótulo alineado a la izquierda con relleno paso 4',
      h.rotuloCaja.izq - h.tarjeta.caja.izq, 1 + 4 * PASO);
    t.ok('rótulo: paso 3 sobre la fila de porcentaje',
      h.porcentaje.caja.arriba - h.rotuloCaja.abajo, 3 * PASO);
  }
  if (h.porcentaje && h.subtituloCaja && h.mensajeCaja) {
    t.ok('subtítulo: paso 2.5 debajo del porcentaje',
      h.subtituloCaja.arriba - h.porcentaje.caja.abajo, 2.5 * PASO);
    t.ok('mensaje: paso 1.5 debajo del subtítulo', h.mensajeCaja.arriba - h.subtituloCaja.abajo, 1.5 * PASO);
  }

  // Cada tramo: porcentaje, marca, color, subtítulo y mensaje (d.1).
  for (const c of TRAMOS) {
    t.ok(`${c.pct}%: navegar con ${c.aciertos} de ${c.total}`,
      await navegarA(pagina, { answers: conAciertos(c.total, c.aciertos), topic: TEMA.clave, mode: 'practice' }), true);
    h = await leer(pagina);
    const p = h.porcentaje;
    t.ok(`${c.pct}%: valor «${c.pct}%»`, !!p && !!p.texto && p.texto.texto, `${c.pct}%`);
    t.ok(`${c.pct}%: color ${c.estado}`, !!p && !!p.texto && p.texto.color, rgb(T[c.estado]));
    t.ok(`${c.pct}%: paso display (72 px)`, !!p && !!p.texto && p.texto.tamano, '72px');
    t.ok(`${c.pct}%: marca ${c.glifo} de paso 6 (24 px), oculta a lectores`,
      !!p && p.glifos.length === 1 && `${p.glifos[0].ancho}|${p.glifos[0].primerD}|${p.glifos[0].oculto}`,
      `24|${GLIFOS[c.glifo].elementos[0].props.d}|true`);
    t.ok(`${c.pct}%: subtítulo «${c.aciertos} de ${c.total} correctas»`,
      !!h.subtitulo && h.subtitulo.texto, `${c.aciertos} de ${c.total} correctas`);
    t.ok(`${c.pct}%: mensaje «${c.mensaje}»`, !!h.mensaje && h.mensaje.texto, c.mensaje);
    t.ok(`${c.pct}%: mensaje en tintaSec`, !!h.mensaje && h.mensaje.color, rgb(T.tintaSec));
  }
  t.ok('el mensaje de 75 a 89 ya no lleva signos de exclamación (RESULTS-P2)',
    /¡Muy bien!/.test((await leer(pagina)).texto) || /¡Muy bien!/.test(fs.readFileSync(FUENTE, 'utf8')), false);
}

async function tiraDeCasillas(pagina, base, t) {
  const T = plancha.claro;
  t.ok('navegar con 40 respuestas, 25 correctas',
    await abrirResultados(pagina, base, { answers: conAciertos(40, 25) }), true);
  let h = await leer(pagina);
  t.ok('con 40 respuestas hay tira', h.tira !== null, true);
  if (h.tira) {
    t.ok('tira con nombre accesible «Detalle por pregunta»', h.tira.nombre, 'Detalle por pregunta');
    t.ok('una casilla por respuesta', h.tira.casillas.length, 40);
    const cs = h.tira.casillas;
    t.ok('las 25 correctas son altas (paso 6) y de acierto',
      cs.slice(0, 25).every((c) => c.alto === 6 * PASO && c.fondo === rgb(T.acierto)), true);
    t.ok('las 15 incorrectas son bajas (paso 3) y de error',
      cs.slice(25).every((c) => c.alto === 3 * PASO && c.fondo === rgb(T.error)), true);
    t.ok('casillas alineadas por la base',
      cs.every((c) => Math.abs(c.abajo - cs[0].abajo) < 0.5), true);
    t.ok('casillas separadas por paso 0.5',
      cs.slice(1).every((c, i) => Math.abs(c.izq - cs[i].der - 0.5 * PASO) < 0.5), true);
    t.ok('la tira llena el ancho disponible de la tarjeta',
      !!h.tarjeta && Math.abs((cs[39].der - cs[0].izq) - (h.tarjeta.caja.ancho - 2 - 2 * 4 * PASO)) < 1, true);
    if (h.mensajeCaja) t.ok('tira: paso 4 debajo del mensaje', h.tira.caja.arriba - h.mensajeCaja.abajo, 4 * PASO);
  }
  t.ok('hay leyenda «Correcta» e «Incorrecta»',
    !!h.leyenda && /correcta/i.test(h.leyenda.texto) && /incorrecta/i.test(h.leyenda.texto), true);
  if (h.leyenda) {
    const [ok, mal] = h.leyenda.muestras;
    t.ok('muestra de «Correcta»: lado paso 2, en acierto',
      !!ok && `${ok.ancho}×${ok.alto}|${ok.fondo}`, `${2 * PASO}×${2 * PASO}|${rgb(T.acierto)}`);
    t.ok('muestra de «Incorrecta»: paso 2 de ancho y paso 1 de alto, en error',
      !!mal && `${mal.ancho}×${mal.alto}|${mal.fondo}`, `${2 * PASO}×${PASO}|${rgb(T.error)}`);
    if (h.tira) t.ok('leyenda: paso 2 debajo de la tira', h.leyenda.caja.arriba - h.tira.caja.abajo, 2 * PASO);
    if (h.chip) t.ok('chip: paso 3.5 debajo de la leyenda', h.chip.caja.arriba - h.leyenda.caja.abajo, 3.5 * PASO);
  }

  // Un total de 41 omite la tira y la leyenda, sin dejar hueco.
  t.ok('navegar con 41 respuestas', await navegarA(pagina, { answers: conAciertos(41, 30), topic: TEMA.clave, mode: 'practice' }), true);
  h = await leer(pagina);
  t.ok('con 41 respuestas no hay tira', h.tira, null);
  t.ok('con 41 respuestas no hay leyenda', h.leyenda, null);
  t.ok('con 41 respuestas el chip sigue a paso 4 del mensaje (sin hueco)',
    !!h.chip && !!h.mensajeCaja && h.chip.caja.arriba - h.mensajeCaja.abajo, 4 * PASO);
  t.ok('con 41 respuestas el subtítulo cuenta las 41', !!h.subtitulo && h.subtitulo.texto, '30 de 41 correctas');
}

async function chipDeTema(pagina, base, t) {
  const T = plancha.claro;
  t.ok('navegar con la clave de un tema real',
    await abrirResultados(pagina, base, { answers: conAciertos(10, 8), topic: TEMA.clave }), true);
  let h = await leer(pagina);
  t.ok(`el chip muestra «${TEMA.nombre}»`, !!h.chip && !!h.chip.texto && h.chip.texto.texto.toLowerCase(), TEMA.nombre.toLowerCase());
  t.ok('el chip no muestra la clave cruda', !!h.chip && !!h.chip.texto && h.chip.texto.texto.toLowerCase().includes(TEMA.clave), false);
  if (h.chip) {
    t.ok('chip: texto y borde acento, border, fondo superficie',
      `${h.chip.texto.color}|${h.chip.borde}|${h.chip.bordeAncho}|${h.chip.fondo}`,
      `${rgb(T.acento)}|${rgb(T.acento)}|1px|${rgb(T.superficie)}`);
    t.ok('chip: paso rotulo (11 px) en mayúsculas', `${h.chip.texto.tamano}|${h.chip.texto.mayusculas}`, '11px|uppercase');
    t.ok('chip: ancho por contenido (no ocupa la tarjeta)',
      !!h.tarjeta && h.chip.caja.ancho < h.tarjeta.caja.ancho - 2 * 4 * PASO, true);
  }

  // Sin clave de tema: «Todos los temas» (MAQUETA-P2, bug de main).
  for (const topic of ['Todos los temas', 'tema-que-no-existe', undefined]) {
    t.ok(`navegar con topic ${JSON.stringify(topic)}`,
      await navegarA(pagina, { answers: conAciertos(10, 8), topic, mode: 'practice' }), true);
    h = await leer(pagina);
    t.ok(`topic ${JSON.stringify(topic)}: el chip dice «Todos los temas»`,
      !!h.chip && !!h.chip.texto && h.chip.texto.texto.toLowerCase(), 'todos los temas');
  }
}

async function trioDeCifras(pagina, base, t) {
  const T = plancha.claro;
  t.ok('navegar con 10 respuestas, 7 correctas',
    await abrirResultados(pagina, base, { answers: conAciertos(10, 7) }), true);
  const h = await leer(pagina);
  t.ok('hay trío', h.trio !== null, true);
  if (h.trio) {
    t.ok('trío: fondo superficie, borde linea, cuatro marcas de esquina',
      `${h.trio.fondo}|${h.trio.borde}|${h.trio.marcas}`, `${rgb(T.superficie)}|${rgb(T.linea)}|4`);
    t.ok('trío: margen lateral paso 5', h.trio.caja.izq, MARGEN);
    if (h.tarjeta) t.ok('trío: paso 3 debajo de la tarjeta', h.trio.caja.arriba - h.tarjeta.caja.abajo, 3 * PASO);
  }
  const celdas = [h.correctas, h.incorrectas, h.total];
  t.ok('tres celdas', celdas.every(Boolean), true);
  if (!celdas.every(Boolean)) return;
  t.ok('tres celdas de igual ancho',
    Math.abs(celdas[0].caja.ancho - celdas[1].caja.ancho) < 1.5 && Math.abs(celdas[1].caja.ancho - celdas[2].caja.ancho) < 1.5, true);
  t.ok('filete vertical entre celdas (la primera sin)',
    `${celdas[0].borde.split(' ')[0]}|${celdas[1].borde}|${celdas[2].borde}`,
    `0px|1px ${rgb(T.filete)}|1px ${rgb(T.filete)}`);
  t.ok('cifras 7, 3 y 10', celdas.map((c) => c.cifra && c.cifra.texto).join(','), '7,3,10');
  t.ok('cifras en acierto, error y tinta (cifra: 26 px)',
    celdas.map((c) => c.cifra && `${c.cifra.color}@${c.cifra.tamano}`).join('|'),
    `${rgb(T.acierto)}@26px|${rgb(T.error)}@26px|${rgb(T.tinta)}@26px`);
  t.ok('rótulos «Correctas», «Incorrectas» y «Total» en tintaSec',
    celdas.map((c) => c.rotulo && `${c.rotulo.texto.toLowerCase()}:${c.rotulo.color}`).join('|'),
    `correctas:${rgb(T.tintaSec)}|incorrectas:${rgb(T.tintaSec)}|total:${rgb(T.tintaSec)}`);
  t.ok('«Correctas» e «Incorrectas» con su marca (glifo-acierto y glifo-error)',
    `${celdas[0].glifos[0] && celdas[0].glifos[0].primerD}|${celdas[1].glifos[0] && celdas[1].glifos[0].primerD}`,
    `${GLIFOS['glifo-acierto'].elementos[0].props.d}|${GLIFOS['glifo-error'].elementos[0].props.d}`);
  t.ok('«Total» sin marca', celdas[2].glifos.length, 0);
  t.ok('relleno vertical paso 3 en cada celda',
    celdas.every((c) => c.caja.alto >= 2 * 3 * PASO + 28), true);
}

async function botonesYGestos(pagina, base, t) {
  const T = plancha.claro;
  // Con 5 de 10 no hay pedido de donación: los tres botones quedan debajo del trío.
  t.ok('navegar con 5 de 10', await abrirResultados(pagina, base, { answers: conAciertos(10, 5) }), true);
  let h = await leer(pagina);
  const bs = [h.revisar, h.reintentar, h.inicio];
  t.ok('hay tres botones', bs.every(Boolean), true);
  if (!bs.every(Boolean)) return;
  t.ok('orden: Revisar, Volver a practicar, Inicio',
    bs[0].caja.arriba < bs[1].caja.arriba && bs[1].caja.arriba < bs[2].caja.arriba, true);
  t.ok('textos de los botones',
    bs.map((b) => b.texto.replace(/\s+/g, ' ').trim()).join('|'),
    'Revisar todas las respuestas|Volver a practicar|Inicio');
  t.ok('sin emoji en los botones', bs.some((b) => /\p{Extended_Pictographic}/u.test(b.texto)), false);
  t.ok('los tres botones son botones', bs.every((b) => b.rol === 'button'), true);
  t.ok('los tres de al menos 44 de alto y del ancho de la columna',
    bs.every((b) => b.caja.alto >= LADO_TACTIL && b.caja.ancho === 390 - 2 * MARGEN), true);
  t.ok('relleno vertical paso 3.5: el alto supera paso 11', bs.every((b) => b.caja.alto > LADO_TACTIL), true);
  t.ok('paso 2.5 entre botones',
    `${bs[1].caja.arriba - bs[0].caja.abajo}|${bs[2].caja.arriba - bs[1].caja.abajo}`, `${2.5 * PASO}|${2.5 * PASO}`);
  t.ok('cada botón lleva su glifo chico (16 px) delante del texto',
    bs.every((b) => b.glifos.length === 1 && b.glifos[0].ancho === '16' && b.glifos[0].oculto === 'true'), true);
  t.ok('glifos revisar, reintentar e inicio',
    bs.map((b) => b.glifos[0] && b.glifos[0].primerD).join('|'),
    ['glifo-revisar', 'glifo-reintentar', 'glifo-inicio'].map((g) => GLIFOS[g].elementos[0].props.d).join('|'));
  t.ok('sin radio ni sombra', bs.every((b) => b.radio === '0px' && b.sombra === 'none|none'), true);
  if (h.trio) {
    t.ok('primer botón: paso 3 + paso 1.5 debajo del trío', bs[0].caja.arriba - h.trio.caja.abajo, 3 * PASO + 1.5 * PASO);
  }
  t.ok('relleno inferior del scroll de paso 8', h.relleno, 8 * PASO);

  // K2 de acento, K1 y K2 de marco en reposo (b, c).
  t.ok('«Revisar»: K2 de acento (texto y borde acento, fondo superficie)',
    `${bs[0].color}|${bs[0].borde}|${bs[0].fondo}|${bs[0].bordeAncho}`,
    `${rgb(T.acento)}|${rgb(T.acento)}|${rgb(T.superficie)}|1px`);
  t.ok('«Volver a practicar»: K1 (fondo tinta, texto fondo)',
    `${bs[1].color}|${bs[1].borde}|${bs[1].fondo}`, `${rgb(T.fondo)}|${rgb(T.tinta)}|${rgb(T.tinta)}`);
  t.ok('«Inicio»: K2 (texto tinta, borde linea, fondo superficie)',
    `${bs[2].color}|${bs[2].borde}|${bs[2].fondo}`, `${rgb(T.tinta)}|${rgb(T.linea)}|${rgb(T.superficie)}`);

  // Hover (web con puntero).
  const hover = {
    'resultados-revisar': `1px solid ${rgb(T.acento)}`,
    'resultados-reintentar': `2px solid ${rgb(T.linea)}`,
    'resultados-inicio': `1px solid ${rgb(T.linea)}`,
  };
  for (const [id, esperado] of Object.entries(hover)) {
    const p = await pagina.evaluar(PUNTO(id));
    if (!p) { t.ok(`${id}: hay botón para el hover`, false, true); continue; }
    await pagina.moverA(p.x, p.y);
    await new Promise((r) => setTimeout(r, 120));
    const k = (await leer(pagina))[{
      'resultados-revisar': 'revisar', 'resultados-reintentar': 'reintentar', 'resultados-inicio': 'inicio',
    }[id]];
    t.ok(`${id}: hover con contorno ${esperado}`, k && k.contorno, esperado);
    await pagina.moverA(1, 1);
  }

  // Foco con Tab real: contorno foco, border-2, separado paso 0.5; los tres son parada.
  await pagina.evaluar(EN_MARCO('d.activeElement && d.activeElement.blur(); return true;'));
  const alcanzados = new Set();
  for (let i = 0; i < 40 && alcanzados.size < 3; i++) {
    await pagina.tecla('Tab');
    const foco = await pagina.evaluar(EN_MARCO(`
      const a = d.activeElement;
      const id = a && a.getAttribute('data-testid');
      if (!id || !id.startsWith('resultados-')) return null;
      const c = w.getComputedStyle(a);
      return { id, ancho: c.outlineWidth, color: c.outlineColor, sep: c.outlineOffset };
    `));
    if (foco) {
      alcanzados.add(foco.id);
      t.ok(`${foco.id}: foco con contorno foco, border-2 y paso 0.5`,
        `${foco.ancho} ${foco.color} ${foco.sep}`, `2px ${rgb(T.foco)} ${0.5 * PASO}px`);
    }
  }
  t.ok('los tres botones son parada de Tab', alcanzados.size, 3);

  // Gestos: «Revisar» alterna la vista en el mismo lugar, sin navegar.
  const antes = (await leer(pagina)).historial;
  t.ok('«Revisar»: un toque', await tocar(pagina, 'resultados-revisar'), true);
  t.ok('«Revisar» abre la revisión en el mismo lugar',
    await pagina.esperarA(async () => enRevision(await leer(pagina))), true);
  h = await leer(pagina);
  t.ok('«Revisar» no navega (misma ruta y mismo historial)', `${h.ruta}|${h.historial}`, `/resultados|${antes}`);
  t.ok('la revisión no repite la barra interna ni cambia su título',
    h.texto.includes('pKapp · Resultados'), true);

  // «Inicio» navega a Home; «Volver a practicar» hace goBack.
  t.ok('«Volver» de arriba: un toque', await tocar(pagina, 'revision-volver-arriba'), true);
  t.ok('«Volver» regresa al resumen',
    await pagina.esperarA(async () => (await leer(pagina)).tarjeta !== null), true);
  t.ok('«Inicio»: un toque', await tocar(pagina, 'resultados-inicio'), true);
  t.ok('«Inicio» navega a /inicio', await esperarRuta(pagina, '/inicio'), true);
  t.ok('navegar de nuevo', await navegarA(pagina, { answers: conAciertos(10, 5), topic: TEMA.clave, mode: 'practice' }), true);
  t.ok('«Volver a practicar»: un toque', await tocar(pagina, 'resultados-reintentar'), true);
  t.ok('«Volver a practicar» hace goBack (sale de /resultados)',
    await pagina.esperarA(async () => await pagina.evaluar(URL_EN_MARCO) !== '/resultados'), true);
}

async function pedidoDeDonacion(pagina, base, t) {
  // 1.er aprobado con 80 %: el pedido va entre el trío y los botones, celebratorio y descartable.
  t.ok('navegar con 8 de 10 y el contador de donaciones en cero',
    await abrirResultados(pagina, base, { answers: conAciertos(10, 8), donacion: 0 }), true);
  let h = await leer(pagina);
  t.ok('con 80 % y 1.er aprobado hay pedido de donación', h.donacion !== null, true);
  if (h.donacion && h.trio && h.revisar) {
    t.ok('el pedido es el celebratorio', h.donacion.texto.includes('¡Gran resultado!'), true);
    t.ok('celebratorio: con trofeo y descartable', `${h.donacion.trofeo}|${h.donacion.descartar}`, 'true|true');
    t.ok('pedido: paso 3 debajo del trío', h.donacion.caja.arriba - h.trio.caja.abajo, 3 * PASO);
    t.ok('botones: paso 3 + paso 1.5 debajo del pedido', h.revisar.caja.arriba - h.donacion.caja.abajo, 3 * PASO + 1.5 * PASO);
    t.ok('margen lateral paso 5', h.donacion.caja.izq, MARGEN);
  }
  t.ok('el pedido no aparece en la revisión',
    await tocar(pagina, 'resultados-revisar') && await pagina.esperarA(async () => (await leer(pagina)).donacion === null), true);
  t.ok('con menos de 60 % no hay pedido',
    await navegarA(pagina, { answers: conAciertos(10, 5), topic: TEMA.clave, mode: 'practice' }, 0), true);
  h = await leer(pagina);
  t.ok('5 de 10: sin pedido de donación', h.donacion, null);
}

// DON-P5: descartable de 60 a 79 %, celebratorio desde 80 %; los cortes pesan en el borde.
async function variantesDelPedido(pagina, base, t) {
  const corte = async (aciertos, total) => {
    const ok = await navegarA(pagina, { answers: conAciertos(total, aciertos), topic: TEMA.clave, mode: 'practice' }, 0);
    return ok ? (await leer(pagina)).donacion : undefined;
  };
  t.ok('abrir Home para navegar a Results',
    await abrirResultados(pagina, base, { answers: conAciertos(10, 5), donacion: 0 }), true);

  const d79 = await corte(79, 100);
  t.ok('79 %: pedido normal (título habitual, sin trofeo) y descartable',
    !!d79 && `${d79.texto.includes('Ayuda a mantener esta aplicación')}|${d79.trofeo}|${d79.descartar}`, 'true|false|true');
  const d80 = await corte(80, 100);
  t.ok('80 %: pedido celebratorio (con trofeo) y descartable',
    !!d80 && `${d80.texto.includes('¡Gran resultado!')}|${d80.trofeo}|${d80.descartar}`, 'true|true|true');
  const d60 = await corte(6, 10);
  t.ok('60 %: ya hay pedido, el normal', !!d60 && `${d60.trofeo}|${d60.descartar}`, 'false|true');
  const d59 = await corte(59, 100);
  t.ok('59 %: sin pedido', d59, null);

  // Descartar lo quita y deja el resto de la pantalla.
  const d70 = await corte(7, 10);
  t.ok('70 %: hay pedido para descartar', d70 !== null && d70 !== undefined, true);
  t.ok('«Cerrar» del pedido: un toque', await tocar(pagina, 'donacion-descartar'), true);
  t.ok('descartar quita el pedido',
    await pagina.esperarA(async () => (await leer(pagina)).donacion === null), true);
  const h = await leer(pagina);
  t.ok('descartar no navega ni toca el resto de la pantalla',
    `${h.ruta}|${h.revisar !== null}|${h.trio !== null}`, '/resultados|true|true');
}

// «1 de cada 3 aprobados» (1.º, 4.º, 7.º...): el contador en `localStorage` decide, y solo
// cuenta desde el aprobado (D6). Con 0, 1, 2, 3... el pedido sale en 0, 3 y 6.
async function cadenciaDelPedido(pagina, base, t) {
  const CONTADOR = EN_MARCO("return w.localStorage.getItem('pkapp_donation_count');");
  t.ok('abrir Home para navegar a Results',
    await abrirResultados(pagina, base, { answers: conAciertos(10, 8), donacion: 0 }), true);
  const visto = [];
  for (const contador of [0, 1, 2, 3, 4, 5, 6]) {
    const ok = await navegarA(pagina, { answers: conAciertos(10, 8), topic: TEMA.clave, mode: 'practice' }, contador);
    visto.push(ok ? (await leer(pagina)).donacion !== null : 'sin pantalla');
  }
  t.ok('con el contador en 0 a 6 el pedido sale en 0, 3 y 6',
    visto.join(','), [true, false, false, true, false, false, true].join(','));
  t.ok('cada aprobado suma uno al contador', await pagina.evaluar(CONTADOR), '7');

  t.ok('navegar con 5 de 10 y el contador en 7',
    await navegarA(pagina, { answers: conAciertos(10, 5), topic: TEMA.clave, mode: 'practice' }, 7), true);
  t.ok('un resultado bajo no suma al contador', await pagina.evaluar(CONTADOR), '7');
}

// D6 por comportamiento: los eventos que llegan a `window.umami.track` en el navegador,
// con su payload y cuándo salen. Complementa la lectura de la fuente (que no ve cuándo corre).
async function eventosDeAnalitica(pagina, base, t) {
  const propios = (eventos) => eventos.filter(([e]) => /^(simulacro|donacion)_/.test(e));
  const abrir = async (answers, mode, donacion) => {
    await abrirMarco(pagina, base, 390);
    await irAHomeEnMarco(pagina);
    // Sin simulacros previos: el «uso» de Results (rango tras terminar este) es «1».
    await pagina.evaluar(EN_MARCO("w.localStorage.removeItem('pkapp_simulacros'); return true;"));
    await pagina.evaluar(ESPIAR);
    return navegarA(pagina, { answers, topic: TEMA.clave, mode }, donacion);
  };
  const salidos = async () => JSON.stringify(propios(await pagina.evaluar(EVENTOS)));

  // 80 %: terminado y aprobado, una sola vez, aunque se alterne la revisión.
  t.ok('navegar con 8 de 10 en modo «simulacro» y el espía instalado',
    await abrir(conAciertos(10, 8), 'simulacro', 0), true);
  const terminado = ['simulacro_terminado', { mode: 'simulacro', score: 80, total: 10 }];
  const aprobado = ['simulacro_aprobado', { mode: 'simulacro', score: 80 }];
  t.ok('80 %: «simulacro_terminado» y «simulacro_aprobado» con su payload',
    await salidos(), JSON.stringify([terminado, aprobado]));
  t.ok('abrir la revisión', await tocar(pagina, 'resultados-revisar')
    && await pagina.esperarA(async () => enRevision(await leer(pagina))), true);
  t.ok('volver al resumen', await tocar(pagina, 'revision-volver-arriba')
    && await pagina.esperarA(async () => (await leer(pagina)).tarjeta !== null), true);
  t.ok('alternar la revisión no vuelve a emitir', await salidos(), JSON.stringify([terminado, aprobado]));

  // Un toque en un monto: «donacion_click» con el origen de la pantalla.
  const montos = (await leer(pagina)).donacion;
  t.ok('el pedido trae montos', !!montos && montos.montos.length > 0, true);
  if (montos && montos.montos.length > 0) {
    const monto = montos.montos[0];
    t.ok(`tocar el monto $${monto}`, await tocar(pagina, `donacion-monto-${monto}`), true);
    t.ok('«donacion_click» con origen «resultados», variante, tramo, uso y el monto',
      await pagina.esperarA(async () => (await salidos()) ===
        JSON.stringify([terminado, aprobado, ['donacion_click', {
          origen: 'resultados', variante: 'celebratoria', tramo: '80-100', uso: '1', monto: Number(monto),
        }]])), true);
  }

  // Cortes de «aprobado»: 60 sí; 59 y 50 no. El pedido no mide nada por sí solo.
  t.ok('navegar con 6 de 10', await abrir(conAciertos(10, 6), 'practice', 0), true);
  t.ok('60 %: aprobado',
    await salidos(), JSON.stringify([
      ['simulacro_terminado', { mode: 'practice', score: 60, total: 10 }],
      ['simulacro_aprobado', { mode: 'practice', score: 60 }],
    ]));
  t.ok('navegar con 59 de 100', await abrir(conAciertos(100, 59), 'practice', 0), true);
  t.ok('59 %: solo terminado',
    await salidos(), JSON.stringify([['simulacro_terminado', { mode: 'practice', score: 59, total: 100 }]]));
  t.ok('navegar con 5 de 10', await abrir(conAciertos(10, 5), 'practice', 0), true);
  t.ok('50 %: solo terminado',
    await salidos(), JSON.stringify([['simulacro_terminado', { mode: 'practice', score: 50, total: 10 }]]));
}

// ---------------------------------------------------------------------------
// Revisión (Revision.md)
// ---------------------------------------------------------------------------

const FALLADAS = [2, 5, 6];           // «#3», «#6» y «#7»

async function abrirRevision(pagina, base, opciones) {
  const ok = await abrirResultados(pagina, base, opciones);
  if (!ok) return false;
  if (!await tocar(pagina, 'resultados-revisar')) return false;
  const abierta = await pagina.esperarA(async () => enRevision(await leer(pagina)));
  await alInicio(pagina);
  return abierta;
}

// La revisión reemplaza al resumen en el mismo ScrollView y conserva su desplazamiento (como
// en main): se vuelve arriba para medir desde el encabezado.
const alInicio = (pagina) => pagina.evaluar(EN_MARCO(`
  for (const n of Array.from(d.querySelectorAll('*'))) {
    const o = w.getComputedStyle(n).overflowY;
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight) n.scrollTop = 0;
  }
  return true;
`));

// La vista de revisión se reconoce por su título, no por un testID.
const enRevision = (h) => /Revisión completa/.test(h.texto);

async function revisionEncabezadoYFiltro(pagina, base, t) {
  const T = plancha.claro;
  t.ok('abrir la revisión con 8 respuestas, 3 falladas',
    await abrirRevision(pagina, base, { answers: respuestas(8, FALLADAS) }), true);
  let h = await leer(pagina);
  t.ok('título «Revisión completa»', !!h.revision && !!h.revision.titulo && h.revision.titulo.texto, 'Revisión completa');
  t.ok('título en tinta, paso titulo (18 px)',
    !!h.revision && !!h.revision.titulo && `${h.revision.titulo.color}|${h.revision.titulo.tamano}`, `${rgb(T.tinta)}|18px`);
  t.ok('resumen «5 / 8 aciertos (63%)»', !!h.revision && !!h.revision.resumen && h.revision.resumen.texto, '5 / 8 aciertos (63%)');
  t.ok('resumen en tintaSec', !!h.revision && !!h.revision.resumen && h.revision.resumen.color, rgb(T.tintaSec));
  if (h.revision && h.barra) {
    t.ok('encabezado: paso 4 debajo de la barra y alineado al margen paso 5',
      `${h.revision.tituloCaja.arriba - h.barra.abajo}|${h.revision.tituloCaja.izq}`, `${4 * PASO}|${MARGEN}`);
    t.ok('resumen: paso 1 debajo del título', h.revision.resumenCaja.arriba - h.revision.tituloCaja.abajo, PASO);
  }

  // «Volver» de arriba (REV-P2).
  const v = h.volverArriba;
  t.ok('hay «Volver» arriba de la lista', v !== null, true);
  if (v) {
    t.ok('«Volver» de arriba: glifo grande (paso 6, 24 px)', v.glifos.length === 1 && v.glifos[0].ancho, '24');
    t.ok('«Volver» de arriba: botón con texto «Volver», de al menos 44 × 44',
      `${v.rol}|${v.texto.trim()}|${v.caja.alto >= LADO_TACTIL && v.caja.ancho >= LADO_TACTIL}`, 'button|Volver|true');
    t.ok('«Volver» de arriba: K2 sobre fondo (texto tinta, borde linea, fondo fondo)',
      `${v.color}|${v.borde}|${v.fondo}`, `${rgb(T.tinta)}|${rgb(T.linea)}|${rgb(T.fondo)}`);
    t.ok('«Volver» de arriba: ancho por contenido y alineado a la izquierda',
      `${v.caja.izq}|${v.caja.ancho < 390 - 2 * MARGEN}`, `${MARGEN}|true`);
    t.ok('«Volver» de arriba: paso 3 debajo del resumen',
      !!h.revision && v.caja.arriba - h.revision.resumenCaja.abajo, 3 * PASO);
    t.ok('«Volver» de arriba queda sobre la primera tarjeta',
      h.tarjetas.length > 0 && v.caja.abajo < h.tarjetas[0].caja.arriba, true);
  }

  // Filtro «Todas | Incorrectas» (REV-P1).
  t.ok('hay filtro con nombre accesible «Mostrar»', !!h.filtro && h.filtro.nombre, 'Mostrar');
  if (h.filtro) {
    t.ok('opciones «Todas» e «Incorrectas», «Todas» marcada',
      h.filtro.opciones.map((o) => `${o.texto}:${o.marcada}`).join('|'), 'Todas:true|Incorrectas:false');
    t.ok('opciones de igual ancho, alto de al menos 44 y paso 2 entre ellas',
      Math.abs(h.filtro.opciones[0].ancho - h.filtro.opciones[1].ancho) < 1.5
        && h.filtro.opciones.every((o) => o.alto >= LADO_TACTIL)
        && Math.abs(h.filtro.opciones[1].izq - h.filtro.opciones[0].der - 2 * PASO) < 1, true);
    t.ok('filtro a todo el ancho de la columna',
      `${h.filtro.caja.izq}|${h.filtro.caja.ancho}`, `${MARGEN}|${390 - 2 * MARGEN}`);
    if (v) t.ok('filtro: paso 3 debajo del «Volver» de arriba', h.filtro.caja.arriba - v.caja.abajo, 3 * PASO);
  }
  t.ok('por defecto se listan las 8', h.tarjetas.length, 8);
  t.ok('tarjetas «#1» a «#8» en orden',
    h.tarjetas.map((c) => (c.texto.match(/#\d+/) || [''])[0]).join(','), '#1,#2,#3,#4,#5,#6,#7,#8');

  // «Incorrectas»: solo las falladas, con su número original.
  t.ok('tocar «Incorrectas»', await clicEnMarco(pagina, 'incorrectas'), true);
  t.ok('«Incorrectas» muestra solo las 3 falladas',
    await pagina.esperarA(async () => (await leer(pagina)).tarjetas.length === 3), true);
  h = await leer(pagina);
  t.ok('conservan su número original: «#3», «#6» y «#7»',
    h.tarjetas.map((c) => (c.texto.match(/#\d+/) || [''])[0]).join(','), '#3,#6,#7');
  t.ok('«Incorrectas» queda marcada',
    !!h.filtro && h.filtro.opciones.map((o) => o.marcada).join(','), 'false,true');
  const [todas, incorrectas] = h.filtro ? h.filtro.opciones : [];
  t.ok('«Incorrectas» marcada: K4 seleccionado (fondo y borde tinta, texto fondo)',
    !!incorrectas && `${incorrectas.fondo}|${incorrectas.borde}|${incorrectas.color}`,
    `${rgb(T.tinta)}|${rgb(T.tinta)}|${rgb(T.fondo)}`);
  t.ok('«Todas» vuelve al reposo: fondo superficie, borde, texto tinta',
    !!todas && `${todas.fondo}|${todas.borde}|${todas.color}`,
    `${rgb(T.superficie)}|${rgb(T.borde)}|${rgb(T.tinta)}`);
  t.ok('el resumen no cambia con el filtro',
    !!h.revision && !!h.revision.resumen && h.revision.resumen.texto, '5 / 8 aciertos (63%)');
  t.ok('volver a «Todas»', await clicEnMarco(pagina, 'todas'), true);
  t.ok('«Todas» lista otra vez las 8',
    await pagina.esperarA(async () => (await leer(pagina)).tarjetas.length === 8), true);
}

// Estados K de cada control de la revisión (Revision.md c, comun.md §5.2): reposo, hover,
// presionado y foco con el cableado real de la pantalla, no solo la clase en `componentes`.
const POR_TESTID = (id) => `uno('${id}')`;
const RADIO = (nombre) =>
  `visibles('[role="radio"]').find((n) => n.textContent.trim() === '${nombre}') || null`;

async function estadosDeRevision(pagina, base, t) {
  const T = plancha.claro;
  const SIN_FONDO = 'rgba(0, 0, 0, 0)';
  const contorno = (ancho, color) => `${ancho} solid ${rgb(color)}`;
  const INVERTIDO = { fondo: rgb(T.tinta), color: rgb(T.fondo), borde: rgb(T.tinta) };
  const CONTROLES = [
    { nombre: '«Volver» de arriba (K2 sobre fondo)', buscar: POR_TESTID('revision-volver-arriba'),
      reposo: { fondo: rgb(T.fondo), color: rgb(T.tinta), borde: rgb(T.linea) },
      hover: { fondo: rgb(T.fondo), contorno: contorno('1px', T.linea) }, presionado: INVERTIDO },
    { nombre: '«Volver» final (K2 sobre fondo)', buscar: POR_TESTID('revision-volver'),
      reposo: { fondo: rgb(T.fondo), color: rgb(T.tinta), borde: rgb(T.linea) },
      hover: { fondo: rgb(T.fondo), contorno: contorno('1px', T.linea) }, presionado: INVERTIDO },
    { nombre: '«Inicio» (K1)', buscar: POR_TESTID('revision-inicio'),
      reposo: INVERTIDO, hover: { ...INVERTIDO, contorno: contorno('2px', T.linea) },
      presionado: { fondo: rgb(T.superficie), color: rgb(T.tinta), borde: rgb(T.linea) } },
    { nombre: '«Reportar pregunta» (K7)', buscar: POR_TESTID('revision-reportar-1'),
      reposo: { fondo: SIN_FONDO, color: rgb(T.tinta) },
      hover: { fondo: SIN_FONDO, contorno: contorno('1px', T.linea) },
      presionado: { fondo: rgb(T.tinta), color: rgb(T.fondo) } },
    { nombre: 'filtro «Incorrectas» sin marcar (K4)', buscar: RADIO('Incorrectas'),
      reposo: { fondo: rgb(T.superficie), color: rgb(T.tinta), borde: rgb(T.borde) },
      hover: { fondo: rgb(T.superficie), borde: rgb(T.linea) }, presionado: INVERTIDO },
    { nombre: 'filtro «Todas» marcada (K4 seleccionado)', buscar: RADIO('Todas'),
      reposo: INVERTIDO, hover: INVERTIDO },
  ];

  t.ok('abrir la revisión con 8 respuestas, 3 falladas',
    await abrirRevision(pagina, base, { answers: respuestas(8, FALLADAS) }), true);

  const comparar = (nombre, estado, leido, esperado) => {
    for (const [clave, valor] of Object.entries(esperado)) {
      t.ok(`${nombre}: ${estado}, ${clave}`, !!leido && leido[clave], valor);
    }
  };
  for (const c of CONTROLES) {
    await pagina.moverA(1, 1);
    await new Promise((r) => setTimeout(r, 120));
    await pagina.evaluar(LEER_K(c.buscar));              // acomoda el scroll
    await new Promise((r) => setTimeout(r, 200));
    const reposo = await pagina.evaluar(LEER_K(c.buscar));
    t.ok(`${c.nombre}: existe`, reposo !== null, true);
    if (!reposo) continue;
    comparar(c.nombre, 'reposo', reposo, c.reposo);

    await pagina.moverA(reposo.x, reposo.y);
    await new Promise((r) => setTimeout(r, 150));
    comparar(c.nombre, 'hover', await pagina.evaluar(LEER_K(c.buscar)), c.hover);

    if (c.presionado) {
      t.ok(`${c.nombre}: botón abajo`, await pagina.evaluar(MOUSE(c.buscar, 'mousedown')), true);
      await new Promise((r) => setTimeout(r, 150));
      comparar(c.nombre, 'presionado', await pagina.evaluar(LEER_K(c.buscar)), c.presionado);
      await pagina.evaluar(MOUSE(c.buscar, 'mouseup'));
    }
    await pagina.moverA(1, 1);
    await pagina.evaluar(EN_MARCO('d.activeElement && d.activeElement.blur(); return true;'));
  }
  t.ok('el filtro y la revisión siguen como estaban tras los estados',
    await pagina.esperarA(async () => {
      const h = await leer(pagina);
      return enRevision(h) && h.tarjetas.length === 8
        && h.filtro && h.filtro.opciones.map((o) => o.marcada).join(',') === 'true,false';
    }), true);

  // Foco con Tab real: contorno foco, border-2, separado paso 0.5, en cada parada.
  await pagina.evaluar(EN_MARCO('d.activeElement && d.activeElement.blur(); return true;'));
  const esperados = ['revision-volver-arriba', 'radio:Todas', 'radio:Incorrectas', 'revision-reportar-1',
    'revision-volver', 'revision-inicio'];
  const alcanzados = new Set();
  for (let i = 0; i < 80 && alcanzados.size < esperados.length; i++) {
    await pagina.tecla('Tab');
    const foco = await pagina.evaluar(EN_MARCO(`
      const a = d.activeElement;
      if (!a) return null;
      const tid = a.getAttribute('data-testid');
      const id = tid && /^revision-(volver-arriba|volver|inicio|reportar-1)$/.test(tid) ? tid
        : (a.getAttribute('role') === 'radio' ? 'radio:' + a.textContent.trim() : null);
      if (!id) return null;
      const c = w.getComputedStyle(a);
      return { id, ancho: c.outlineWidth, estilo: c.outlineStyle, color: c.outlineColor, sep: c.outlineOffset };
    `));
    if (foco && !alcanzados.has(foco.id)) {
      alcanzados.add(foco.id);
      t.ok(`${foco.id}: foco con contorno foco, border-2 y paso 0.5`,
        `${foco.ancho} ${foco.estilo} ${foco.color} ${foco.sep}`, `2px solid ${rgb(T.foco)} ${0.5 * PASO}px`);
    }
  }
  t.ok('«Volver», el filtro, «Reportar» e «Inicio» son parada de Tab',
    esperados.filter((id) => alcanzados.has(id)).join(','), esperados.join(','));
}

async function revisionSinFalladas(pagina, base, t) {
  t.ok('abrir la revisión con 6 respuestas, todas correctas',
    await abrirRevision(pagina, base, { answers: respuestas(6, []) }), true);
  const h = await leer(pagina);
  t.ok('sin respuestas incorrectas no hay filtro', h.filtro, null);
  t.ok('la lista es la completa', h.tarjetas.length, 6);
  t.ok('hay «Volver» de arriba aunque no haya filtro', h.volverArriba !== null, true);
}

async function revisionTarjetas(pagina, base, t) {
  const T = plancha.claro;
  t.ok('abrir la revisión con 8 respuestas, 3 falladas',
    await abrirRevision(pagina, base, { answers: respuestas(8, FALLADAS) }), true);
  const h = await leer(pagina);
  const por = (n) => h.tarjetas.find((c) => c.id === `revision-tarjeta-${n}`);
  const acertada = por(1), fallada = por(3), sinNota = por(2);
  t.ok('hay tarjetas «#1», «#2» y «#3»', !!acertada && !!sinNota && !!fallada, true);
  if (!acertada || !fallada || !sinNota) return;

  t.ok('acertada: borde izquierdo acierto, border-l-3',
    acertada.bordeIzq, `3px ${rgb(T.acierto)}`);
  t.ok('fallada: borde izquierdo error, border-l-3', fallada.bordeIzq, `3px ${rgb(T.error)}`);
  t.ok('acertada: «Correcta» y fallada: «Incorrecta» en el encabezado',
    `${/Correcta/.test(acertada.texto)}|${/Incorrecta/.test(fallada.texto)}`, 'true|true');
  t.ok('encabezado con glifo-acierto o glifo-error delante',
    `${acertada.glifos[0] && acertada.glifos[0].primerD}|${fallada.glifos[0] && fallada.glifos[0].primerD}`,
    `${GLIFOS['glifo-acierto'].elementos[0].props.d}|${GLIFOS['glifo-error'].elementos[0].props.d}`);
  t.ok('fallada: la elegida lleva «Incorrecta · tu respuesta»', /Incorrecta · tu respuesta/.test(fallada.texto), true);
  t.ok('fallada: la correcta lleva «Correcta»', /Opción dos[\s\S]*Correcta/.test(fallada.texto), true);
  t.ok('las cuatro opciones con su letra A a D',
    ['A', 'B', 'C', 'D'].every((l) => new RegExp(`${l}\\s*Opción`).test(fallada.texto.replace(/\s+/g, ' '))), true);

  // Nota «Nota / Explicación» (REV-P3): solo con explicación.
  t.ok('con explicación hay nota con rótulo «Nota / Explicación»',
    !!acertada.nota && /Nota \/ Explicación/i.test(acertada.nota), true);
  t.ok('la nota trae el texto de la explicación', !!acertada.nota && acertada.nota.includes('Explicación de prueba 1'), true);
  t.ok('la nota lleva glifo-explicacion delante',
    !!acertada.nota && acertada.glifos.some((g) => g.primerD === GLIFOS['glifo-explicacion'].elementos[0].props.d), true);
  t.ok('sin explicación no hay nota', sinNota.nota, null);

  // «Reportar pregunta».
  t.ok('«Reportar pregunta» en cada tarjeta, de al menos 44 de alto, con glifo-reportar',
    h.tarjetas.every((c) => !!c.reportar && c.reportar.caja.alto >= LADO_TACTIL
      && /Reportar pregunta/.test(c.reportar.texto)
      && c.reportar.glifos[0] && c.reportar.glifos[0].primerD === GLIFOS['glifo-reportar'].elementos[0].props.d), true);

  // Botones finales: «Volver» (K2) e «Inicio» (K1), en fila de dos celdas iguales.
  const v = h.volverFinal, i = h.inicioFinal;
  t.ok('hay «Volver» e «Inicio» al final', !!v && !!i, true);
  if (v && i) {
    const ultima = h.tarjetas[h.tarjetas.length - 1];
    t.ok('«Volver» a la izquierda de «Inicio», en la misma fila',
      v.caja.der < i.caja.izq && v.caja.arriba === i.caja.arriba, true);
    t.ok('dos celdas iguales separadas por paso 2.5',
      `${v.caja.ancho}|${i.caja.izq - v.caja.der}`, `${i.caja.ancho}|${2.5 * PASO}`);
    t.ok('paso 4 debajo de la última tarjeta', v.caja.arriba - ultima.caja.abajo, 4 * PASO);
    t.ok('«Volver» final: K2 sobre fondo; «Inicio»: K1',
      `${v.color}|${v.borde}|${i.fondo}|${i.color}`, `${rgb(T.tinta)}|${rgb(T.linea)}|${rgb(T.tinta)}|${rgb(T.fondo)}`);
    t.ok('«Volver» e «Inicio» de al menos 44 de alto', v.caja.alto >= LADO_TACTIL && i.caja.alto >= LADO_TACTIL, true);
    t.ok('relleno inferior del scroll de paso 8', h.relleno, 8 * PASO);
  }

  // «Inicio» navega a Home.
  t.ok('«Inicio» de la revisión: un toque', await tocar(pagina, 'revision-inicio'), true);
  t.ok('«Inicio» navega a /inicio', await esperarRuta(pagina, '/inicio'), true);
}

// ---------------------------------------------------------------------------
// Anchos y temas
// ---------------------------------------------------------------------------

async function anchos(pagina, base, t) {
  // 1023 es el último ancho bajo el corte `escritorio`: sigue la columna de siempre.
  for (const ancho of [320, 360, 390, 768, 1023]) {
    const columna = Math.min(ancho, COLUMNA);
    const izq = (ancho - columna) / 2 + MARGEN;
    t.ok(`${ancho} px: navegar al resumen con 40 respuestas`,
      await abrirResultados(pagina, base, { ancho, answers: conAciertos(40, 31), topic: TEMA.clave, donacion: 0 }), true);
    let h = await leer(pagina);
    t.ok(`${ancho} px: resumen sin scroll horizontal`, h.desborda, false);
    t.ok(`${ancho} px: tarjeta del ancho de la columna menos paso 5 a cada lado`,
      !!h.tarjeta && `${h.tarjeta.caja.izq}|${h.tarjeta.caja.ancho}`, `${izq}|${columna - 2 * MARGEN}`);
    t.ok(`${ancho} px: la tira sigue con 40 casillas`, !!h.tira && h.tira.casillas.length, 40);
    t.ok(`${ancho} px: los tres botones apilados`,
      !!h.revisar && !!h.reintentar && !!h.inicio
        && h.revisar.caja.izq === h.reintentar.caja.izq && h.reintentar.caja.izq === h.inicio.caja.izq
        && h.revisar.caja.arriba < h.reintentar.caja.arriba && h.reintentar.caja.arriba < h.inicio.caja.arriba, true);
    t.ok(`${ancho} px: los tres botones de al menos 44 de alto`,
      !!h.revisar && [h.revisar, h.reintentar, h.inicio].every((b) => b.caja.alto >= LADO_TACTIL), true);
    t.ok(`${ancho} px: trío con tres celdas de un tercio`,
      !!h.correctas && !!h.incorrectas && !!h.total
        && [h.correctas, h.incorrectas, h.total].every((c) => Math.abs(c.caja.ancho - (columna - 2 * MARGEN) / 3) < 1.5), true);
    t.ok(`${ancho} px: nada del trío ni de los botones queda fuera de la columna`,
      !!h.trio && h.trio.caja.der <= izq + columna - 2 * MARGEN + 0.5, true);

    await tocar(pagina, 'resultados-revisar');
    await pagina.esperarA(async () => enRevision(await leer(pagina)));
    h = await leer(pagina);
    t.ok(`${ancho} px: revisión sin scroll horizontal`, h.desborda, false);
    t.ok(`${ancho} px: botones finales en fila de dos y de al menos 44`,
      !!h.volverFinal && !!h.inicioFinal
        && h.volverFinal.caja.arriba === h.inicioFinal.caja.arriba
        && h.volverFinal.caja.alto >= LADO_TACTIL && h.inicioFinal.caja.alto >= LADO_TACTIL, true);
    t.ok(`${ancho} px: filtro dentro de la columna`,
      !!h.filtro && h.filtro.caja.izq >= izq - 0.5 && h.filtro.caja.der <= izq + columna - 2 * MARGEN + 0.5, true);
  }
}

// Escritorio (Results.md y Revision.md, «Escritorio»; ESC-P5, ESC-P6 y ESC-P10): desde el corte
// de 1024 la hoja de 952 con margen paso 8, una región lateral de 320 y la principal a su
// derecha, separadas por paso 8. Los anchos salen de la ficha, no de `plancha/cortes.js`.
const LATERAL = 320;
const SEPARACION = 8 * PASO;
const HOJA = 952;
const MARGEN_HOJA = 8 * PASO;
// 1280 lo nombra «Revisado» de la ficha; 1439 y 1440 son el par alrededor del corte `amplio`
// («sin cambio en `amplio`»: la hoja sigue de 952). Las capturas son solo de las tres primeras.
const VENTANAS = [[1024, 768], [1280, 800], [1366, 768], [1439, 900], [1440, 900], [1920, 1080]];
const CON_CAPTURA = [1024, 1366, 1920];

// Capturas de evidencia (solo con PKAPP_CAPTURAS): el viewport de la página ya es el del marco.
async function capturar(pagina, nombre) {
  if (!process.env.PKAPP_CAPTURAS || !CON_CAPTURA.includes(Number(nombre.split('-')[1]))) return;
  const dir = path.join(RAIZ, 'openspec', 'changes', 'rediseno-plancha', 'evidencia', 'despues', '3.11f');
  fs.mkdirSync(dir, { recursive: true });
  await new Promise((r) => setTimeout(r, 400));
  const r = await pagina.enviar('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(dir, nombre), Buffer.from(r.data, 'base64'));
}

// Los controles enfocables, en el orden de DOM: solo el conjunto esperado, no el de Tab.
const FOCOS = EN_MARCO(`
  return visibles('[tabindex]:not([tabindex="-1"]), button, a[href], input').map((n) =>
    n.getAttribute('data-testid') || n.getAttribute('aria-label') || n.textContent.trim().slice(0, 30));
`);

// El control con foco ahora, con su caja en coordenadas de página (suma el desplazamiento de
// cada ancestro: Tab desplaza el contenido para mostrar el foco).
const FOCO_ACTUAL = EN_MARCO(`
  const n = d.activeElement;
  if (!n || n === d.body) return null;
  const r = n.getBoundingClientRect();
  let dx = 0, dy = 0;
  for (let a = n.parentElement; a; a = a.parentElement) { dx += a.scrollLeft; dy += a.scrollTop; }
  return {
    id: n.getAttribute('data-testid') || n.getAttribute('aria-label') || n.textContent.trim().slice(0, 30),
    izq: r.left + dx, arriba: r.top + dy, ancho: r.width, alto: r.height,
  };
`);

// Recorre el documento con Tab real y devuelve las paradas con su caja medida.
async function recorrerConTab(pagina, cuantas) {
  await pagina.evaluar(EN_MARCO('d.activeElement && d.activeElement.blur(); return true;'));
  const paradas = [];
  for (let i = 0; i < cuantas; i++) {
    await pagina.tecla('Tab');
    const f = await pagina.evaluar(FOCO_ACTUAL);
    if (f) paradas.push(f);
  }
  return paradas;
}

// Orden de Tab = orden visual medido: la lateral antes que la principal y, dentro de cada
// región, de arriba abajo y de izquierda a derecha. El orden esperado sale de las coordenadas
// de cada parada, no del DOM: un `order` o un `flex-direction` que cambie lo visual sin tocar
// el DOM hace que la secuencia de Tab ya no coincida.
function ordenVisual(paradas, izqPrincipal) {
  const region = (f) => (f.izq < izqPrincipal - 0.5 ? 0 : 1);
  const esperado = paradas.slice().sort((a, b) =>
    region(a) - region(b)
    || (Math.abs(a.arriba - b.arriba) > 0.5 ? a.arriba - b.arriba : a.izq - b.izq));
  return paradas.map((f) => f.id).join(',') === esperado.map((f) => f.id).join(',');
}

// Ninguna región, celda ni la hoja recorta el contorno de foco: ningún ancestro de un control
// ni de un elemento con testID (sin pasar del scroller de la pantalla, que sí desplaza) tiene
// `overflow` distinto de visible.
const RECORTES = EN_MARCO(`
  let scroller = null;
  const ancla = d.querySelector('[data-testid="resultados-tarjeta"], [data-testid="revision-titulo"]');
  for (let n = ancla; n; n = n.parentElement) {
    const o = w.getComputedStyle(n).overflowY;
    if (o === 'auto' || o === 'scroll') { scroller = n; break; }
  }
  const cand = new Set();
  const sel = '[data-testid], [tabindex]:not([tabindex="-1"]), button, a[href], input';
  for (const n of d.querySelectorAll(sel)) {
    if (scroller && !scroller.contains(n)) continue;
    for (let a = n; a && a !== scroller; a = a.parentElement) cand.add(a);
  }
  return Array.from(cand).filter((n) => {
    const e = w.getComputedStyle(n);
    return e.overflowX !== 'visible' || e.overflowY !== 'visible';
  }).map((n) => (n.getAttribute('data-testid') || n.tagName) + ':' + w.getComputedStyle(n).overflowX
    + '/' + w.getComputedStyle(n).overflowY);
`);

// Ninguna región se ancla: los ancestros de la tarjeta, del trío y del encabezado no son
// `sticky` ni `fixed` (se desplazan con la página).
const ANCLAS = EN_MARCO(`
  const ids = ['resultados-tarjeta', 'resultados-trio', 'revision-titulo', 'revision-volver-arriba'];
  const res = [];
  for (const id of ids) {
    for (let n = d.querySelector('[data-testid="' + id + '"]'); n && n !== d.body; n = n.parentElement) {
      const p = w.getComputedStyle(n).position;
      if (p === 'sticky' || p === 'fixed') res.push(id + '<' + (n.getAttribute('data-testid') || n.tagName) + ':' + p);
    }
  }
  return res;
`);

// Desplaza el scroller de la pantalla `px` y devuelve cuánto se desplazó de verdad.
const DESPLAZAR = (px) => EN_MARCO(`
  let hecho = 0;
  for (const n of Array.from(d.querySelectorAll('*'))) {
    const o = w.getComputedStyle(n).overflowY;
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight) {
      n.scrollTop = ${px};
      hecho = Math.max(hecho, n.scrollTop);
    }
  }
  return hecho;
`);

// Las cajas de la región lateral de la revisión (encabezado, «Volver», filtro) y de la
// principal (primera tarjeta), para medirlas antes y después de desplazar.
const CAJAS_REVISION = EN_MARCO(`
  const top = (id) => { const n = visibles('[data-testid="' + id + '"]')[0]; return n ? n.getBoundingClientRect().top : null; };
  const filtro = visibles('[role="radiogroup"][aria-label="Mostrar"]')[0];
  return {
    titulo: top('revision-titulo'), volver: top('revision-volver-arriba'),
    filtro: filtro ? filtro.getBoundingClientRect().top : null,
    tarjeta: (visibles('[data-testid^="revision-tarjeta-"]')[0] || { getBoundingClientRect: () => ({ top: null }) }).getBoundingClientRect().top,
  };
`);

function geometria(ancho) {
  const hoja = Math.min(HOJA, ancho - 2 * MARGEN_HOJA);
  const izq = (ancho - hoja) / 2;
  return { hoja, izq, izqPrincipal: izq + LATERAL + SEPARACION, principal: hoja - LATERAL - SEPARACION };
}

async function escritorioResumen(pagina, base, t) {
  for (const oscuro of [false, true]) {
    for (const [ancho, alto] of VENTANAS) {
      const r = `${ancho} px ${oscuro ? 'oscuro' : 'claro'}`;
      const g = geometria(ancho);
      t.ok(`${r}: navegar al resumen con 40 respuestas y pedido`,
        await abrirResultados(pagina, base, { ancho, alto, answers: conAciertos(40, 31), donacion: 0, oscuro }), true);
      await alInicio(pagina);
      const h = await leer(pagina);
      t.ok(`${r}: sin scroll horizontal`, h.desborda, false);
      t.ok(`${r}: tarjeta en la lateral: a la izquierda de la hoja y de ancho lateral`,
        !!h.tarjeta && `${h.tarjeta.caja.izq}|${h.tarjeta.caja.ancho}`, `${g.izq}|${LATERAL}`);
      t.ok(`${r}: trío en la principal: a paso 8 de la tarjeta y hasta el borde de la hoja`,
        !!h.trio && `${h.trio.caja.izq}|${h.trio.caja.ancho}`, `${g.izqPrincipal}|${g.principal}`);
      t.ok(`${r}: tarjeta y trío alineados arriba, paso 4 debajo de la barra`,
        !!h.tarjeta && !!h.trio && !!h.barra
          && `${h.tarjeta.caja.arriba - h.barra.abajo}|${h.trio.caja.arriba - h.barra.abajo}`, `${4 * PASO}|${4 * PASO}`);
      t.ok(`${r}: tres celdas del trío iguales sobre el ancho de la principal`,
        !!h.correctas && !!h.incorrectas && !!h.total
          && [h.correctas, h.incorrectas, h.total].every((c) => Math.abs(c.caja.ancho - g.principal / 3) < 1.5), true);
      t.ok(`${r}: pedido entre el trío y los botones, llena la principal`,
        !!h.donacion && !!h.trio && !!h.revisar
          && `${h.donacion.caja.izq}|${h.donacion.caja.ancho}|${h.donacion.caja.arriba - h.trio.caja.abajo}|${h.revisar.caja.arriba > h.donacion.caja.abajo}`,
        `${g.izqPrincipal}|${g.principal}|${3 * PASO}|true`);
      const botones = [h.revisar, h.reintentar, h.inicio];
      t.ok(`${r}: tres botones apilados, en orden, a ancho de la principal`,
        botones.every(Boolean)
          && botones.every((b) => b.caja.izq === g.izqPrincipal && b.caja.ancho === g.principal)
          && h.revisar.caja.arriba < h.reintentar.caja.arriba && h.reintentar.caja.arriba < h.inicio.caja.arriba, true);
      t.ok(`${r}: tarjeta, trío, pedido y botones en una ventana (${alto} de alto)`,
        !!h.inicio && h.inicio.caja.abajo <= alto, true);

      t.ok(`${r}: ninguna región, celda ni la hoja recorta el contorno de foco (sin overflow)`,
        (await pagina.evaluar(RECORTES)).join('|'), '');
      t.ok(`${r}: ninguna región se ancla (sin sticky ni fixed)`, (await pagina.evaluar(ANCLAS)).join('|'), '');
      const esperados = await pagina.evaluar(FOCOS);
      const focos = await recorrerConTab(pagina, esperados.length);
      t.ok(`${r}: Tab: descartar, cuatro montos y los tres botones, en ese orden`,
        focos.map((f) => f.id).join(','),
        ['donacion-descartar', ...(h.donacion ? h.donacion.montos : []).map((m) => `donacion-monto-${m}`),
          'resultados-revisar', 'resultados-reintentar', 'resultados-inicio'].join(','));
      t.ok(`${r}: los montos entran en una fila de celdas iguales`,
        !!h.donacion && h.donacion.montos.length === 4
          && new Set(focos.filter((f) => /^donacion-monto-/.test(f.id)).map((f) => f.arriba)).size === 1, true);
      t.ok(`${r}: Tab: el orden es el visual medido por coordenadas`, ordenVisual(focos, g.izqPrincipal), true);
      t.ok(`${r}: foco: todos los objetivos de al menos 44 × 44`,
        focos.every((f) => f.ancho >= LADO_TACTIL - 0.5 && f.alto >= LADO_TACTIL - 0.5), true);
      await capturar(pagina, `E05a-${ancho}-${oscuro ? 'oscuro' : 'claro'}.png`);

      // Tramo bajo (E05b): sin pedido, los botones siguen al trío en la principal.
      t.ok(`${r}: navegar a un resultado bajo (6 de 20)`,
        await navegarA(pagina, { answers: conAciertos(20, 6), topic: TEMA.clave, mode: 'practice' }, 0), true);
      await alInicio(pagina);
      const bajo = await leer(pagina);
      t.ok(`${r}: tramo bajo sin pedido: botones a paso 3 + 1.5 del trío, en la principal`,
        !!bajo.trio && !!bajo.revisar && bajo.donacion === null
          && `${bajo.revisar.caja.izq}|${bajo.revisar.caja.ancho}|${bajo.revisar.caja.arriba - bajo.trio.caja.abajo}`,
        `${g.izqPrincipal}|${g.principal}|${3 * PASO + 1.5 * PASO}`);
      await capturar(pagina, `E05b-${ancho}-${oscuro ? 'oscuro' : 'claro'}.png`);
    }
  }
}

async function escritorioRevision(pagina, base, t) {
  for (const oscuro of [false, true]) {
    for (const [ancho, alto] of VENTANAS) {
      const r = `${ancho} px ${oscuro ? 'oscuro' : 'claro'}`;
      const g = geometria(ancho);
      t.ok(`${r}: navegar al resumen y abrir la revisión (8 respuestas, 3 falladas)`,
        await abrirResultados(pagina, base, { ancho, alto, answers: respuestas(8, FALLADAS), donacion: 0, oscuro }), true);
      await alInicio(pagina);
      const resumen = await leer(pagina);
      t.ok(`${r}: abrir la revisión`, await tocar(pagina, 'resultados-revisar'), true);
      t.ok(`${r}: la revisión se muestra`,
        await pagina.esperarA(async () => enRevision(await leer(pagina))), true);
      await alInicio(pagina);
      const h = await leer(pagina);
      t.ok(`${r}: revisión sin scroll horizontal`, h.desborda, false);
      t.ok(`${r}: la barra interna no se mueve al alternar la vista`,
        JSON.stringify(h.barra), JSON.stringify(resumen.barra));
      t.ok(`${r}: encabezado en la lateral, paso 4 debajo de la barra`,
        !!h.revision && !!h.barra
          && `${h.revision.tituloCaja.izq}|${h.revision.tituloCaja.arriba - h.barra.abajo}`, `${g.izq}|${4 * PASO}`);
      t.ok(`${r}: «Volver» de arriba y filtro en la lateral, paso 3 entre ellos`,
        !!h.volverArriba && !!h.filtro && !!h.revision
          && `${h.volverArriba.caja.izq}|${h.filtro.caja.izq}|${h.filtro.caja.ancho}|${h.volverArriba.caja.arriba - h.revision.resumenCaja.abajo}|${h.filtro.caja.arriba - h.volverArriba.caja.abajo}`,
        `${g.izq}|${g.izq}|${LATERAL}|${3 * PASO}|${3 * PASO}`);
      t.ok(`${r}: filtro de dos opciones iguales a ancho de la región`,
        !!h.filtro && h.filtro.opciones.length === 2
          && Math.abs(h.filtro.opciones[0].ancho - h.filtro.opciones[1].ancho) < 1.5
          && h.filtro.opciones[1].der <= h.filtro.caja.der + 0.5, true);
      t.ok(`${r}: tarjetas en la principal, de ancho de la región y alineadas arriba con el encabezado`,
        h.tarjetas.length === 8 && !!h.revision
          && h.tarjetas.every((c) => c.caja.izq === g.izqPrincipal && c.caja.ancho === g.principal)
          && Math.abs(h.tarjetas[0].caja.arriba - h.revision.tituloCaja.arriba) < 0.5, true);
      t.ok(`${r}: tarjetas en orden, paso 2.5 entre ellas`,
        h.tarjetas.every((c, i) => i === 0 || Math.abs(c.caja.arriba - h.tarjetas[i - 1].caja.abajo - 2.5 * PASO) < 0.5), true);
      t.ok(`${r}: botones finales en una fila de dos celdas iguales, a ancho de la principal`,
        !!h.volverFinal && !!h.inicioFinal
          && h.volverFinal.caja.izq === g.izqPrincipal && Math.abs(h.inicioFinal.caja.der - (g.izq + g.hoja)) < 0.5
          && h.volverFinal.caja.arriba === h.inicioFinal.caja.arriba
          && Math.abs(h.volverFinal.caja.ancho - h.inicioFinal.caja.ancho) < 1.5, true);

      t.ok(`${r}: ninguna región, celda ni la hoja recorta el contorno de foco (sin overflow)`,
        (await pagina.evaluar(RECORTES)).join('|'), '');
      t.ok(`${r}: ninguna región se ancla (sin sticky ni fixed)`, (await pagina.evaluar(ANCLAS)).join('|'), '');

      // Con la página desplazada, la lateral se va con ella: cada caja sube lo que se desplazó.
      const antes = await pagina.evaluar(CAJAS_REVISION);
      const movido = await pagina.evaluar(DESPLAZAR(200));
      const despues = await pagina.evaluar(CAJAS_REVISION);
      t.ok(`${r}: la página se desplaza (la lista larga supera la ventana)`, movido > 0, true);
      t.ok(`${r}: desplazada, la lateral y la principal suben con la página (nada anclado)`,
        ['titulo', 'volver', 'filtro', 'tarjeta'].every((k) =>
          antes[k] !== null && despues[k] !== null && Math.abs(antes[k] - despues[k] - movido) < 0.5), true);
      await alInicio(pagina);

      const esperados = await pagina.evaluar(FOCOS);
      const focos = await recorrerConTab(pagina, esperados.length);
      const ids = focos.map((f) => f.id);
      t.ok(`${r}: Tab: «Volver», filtro, un «Reportar» por tarjeta y los dos botones finales`,
        `${ids.slice(0, 3).join(',')}|${ids.filter((i) => /^revision-reportar-/.test(i)).length}|${ids.slice(-2).join(',')}`,
        'revision-volver-arriba,Todas,Incorrectas|8|revision-volver,revision-inicio');
      t.ok(`${r}: Tab: el orden es el visual medido por coordenadas`, ordenVisual(focos, g.izqPrincipal), true);
      t.ok(`${r}: foco: todos los objetivos de al menos 44 × 44`,
        focos.every((f) => f.ancho >= LADO_TACTIL - 0.5 && f.alto >= LADO_TACTIL - 0.5), true);

      // E06 de página completa: la ventana crece hasta el final del contenido para que la
      // captura incluya los botones finales.
      await alInicio(pagina);
      const alto2 = await pagina.evaluar(EN_MARCO(`
        const f = visibles('[data-testid="revision-inicio"]')[0];
        for (const n of Array.from(d.querySelectorAll('*'))) {
          const o = w.getComputedStyle(n).overflowY;
          if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight) {
            return Math.ceil(n.getBoundingClientRect().top + n.scrollHeight);
          }
        }
        return f ? Math.ceil(f.getBoundingClientRect().bottom) : 0;
      `));
      await pagina.enviar('Emulation.setDeviceMetricsOverride',
        { width: ancho, height: alto2, deviceScaleFactor: 1, mobile: false });
      await pagina.evaluar(`document.getElementById('marco-e2e').style.height = '${alto2}px'; true`);
      await new Promise((res) => setTimeout(res, 300));
      const final = await leer(pagina);
      t.ok(`${r}: la captura de página completa incluye los botones finales`,
        !!final.volverFinal && !!final.inicioFinal && final.inicioFinal.caja.abajo <= alto2 + 0.5, true);
      await capturar(pagina, `E06-${ancho}-${oscuro ? 'oscuro' : 'claro'}.png`);
    }
  }
}

async function temaOscuro(pagina, base, t) {
  const T = plancha.oscuro;
  t.ok('navegar en oscuro con 8 de 10 y la revisión posible',
    await abrirResultados(pagina, base, { answers: respuestas(10, [1, 4]), oscuro: true, donacion: 0 }), true);
  let h = await leer(pagina);
  t.ok('oscuro: tarjeta en superficieD con borde lineaD',
    !!h.tarjeta && `${h.tarjeta.fondo}|${h.tarjeta.borde}`, `${rgb(T.superficie)}|${rgb(T.linea)}`);
  t.ok('oscuro: rótulo en tintaSecD', !!h.rotulo && h.rotulo.color, rgb(T.tintaSec));
  t.ok('oscuro: porcentaje en aciertoD', !!h.porcentaje && !!h.porcentaje.texto && h.porcentaje.texto.color, rgb(T.acierto));
  t.ok('oscuro: chip en acentoD', !!h.chip && h.chip.texto.color, rgb(T.acento));
  t.ok('oscuro: casillas en aciertoD y errorD',
    !!h.tira && h.tira.casillas[0].fondo === rgb(T.acierto) && h.tira.casillas[1].fondo === rgb(T.error), true);
  t.ok('oscuro: cifras en aciertoD, errorD y tintaD',
    !!h.correctas && !!h.incorrectas && !!h.total
      && `${h.correctas.cifra.color}|${h.incorrectas.cifra.color}|${h.total.cifra.color}`,
    `${rgb(T.acierto)}|${rgb(T.error)}|${rgb(T.tinta)}`);
  t.ok('oscuro: «Revisar» en acentoD sobre superficieD',
    !!h.revisar && `${h.revisar.color}|${h.revisar.borde}|${h.revisar.fondo}`,
    `${rgb(T.acento)}|${rgb(T.acento)}|${rgb(T.superficie)}`);
  t.ok('oscuro: «Volver a practicar» K1 (tintaD con texto fondoD)',
    !!h.reintentar && `${h.reintentar.color}|${h.reintentar.fondo}`, `${rgb(T.fondo)}|${rgb(T.tinta)}`);
  t.ok('oscuro: sin sombra', !!h.revisar && h.revisar.sombra, 'none|none');

  await tocar(pagina, 'resultados-revisar');
  await pagina.esperarA(async () => enRevision(await leer(pagina)));
  h = await leer(pagina);
  const [acertada, fallada] = [h.tarjetas.find((c) => c.id === 'revision-tarjeta-1'),
    h.tarjetas.find((c) => c.id === 'revision-tarjeta-2')];
  t.ok('oscuro: borde izquierdo aciertoD y errorD',
    !!acertada && !!fallada && `${acertada.bordeIzq}|${fallada.bordeIzq}`, `3px ${rgb(T.acierto)}|3px ${rgb(T.error)}`);
  t.ok('oscuro: título en tintaD', !!h.revision && !!h.revision.titulo && h.revision.titulo.color, rgb(T.tinta));
  t.ok('oscuro: «Volver» de arriba en tintaD con borde lineaD',
    !!h.volverArriba && `${h.volverArriba.color}|${h.volverArriba.borde}`, `${rgb(T.tinta)}|${rgb(T.linea)}`);
}

// ---------------------------------------------------------------------------
// Fuente
// ---------------------------------------------------------------------------

async function fuenteDeLaPantalla(pagina, base, t) {
  const fuente = fs.readFileSync(FUENTE, 'utf8');
  const sinComentarios = fuente.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  // D6: umbrales, constantes y cálculo del puntaje, sin cambio.
  t.ok('umbrales de D6 sin cambio',
    ['APROBADO_MIN_SCORE = 60', 'DONATION_MIN_SCORE = 60', 'DONATION_WARM_SCORE = 80', 'DONATION_EVERY = 3']
      .every((c) => sinComentarios.includes(c)), true);
  t.ok('cortes 90, 75, 60 y 50 de getResultFeedback sin cambio',
    [90, 75, 60, 50].every((n) => new RegExp(`percentage >= ${n}\\b`).test(sinComentarios)), true);
  t.ok('porcentaje con Math.round(correctCount / total * 100) y 0 sin respuestas',
    /total \? Math\.round\(\(correctCount \/ total\) \* 100\) : 0/.test(sinComentarios), true);

  // Eventos de analítica sin cambio.
  t.ok("track('simulacro_terminado', { mode, score: percentage, total })",
    sinComentarios.includes("track('simulacro_terminado', { mode, score: percentage, total })"), true);
  t.ok("track('simulacro_aprobado', { mode, score: percentage }) con APROBADO_MIN_SCORE",
    /percentage >= APROBADO_MIN_SCORE\)[\s\S]{0,40}track\('simulacro_aprobado', \{ mode, score: percentage \}\)/.test(sinComentarios), true);
  t.ok('el pedido de donación es DonationBox con origen «resultados»',
    /<DonationBox[\s\S]{0,120}origen="resultados"/.test(sinComentarios), true);
  t.ok('la pantalla emite solo los dos track(...) propios',
    (sinComentarios.match(/\btrack\(/g) || []).length, 2);

  // Sin legado: clases, emojis, radios, sombras, opacidad, literales de color.
  t.ok('sin clases legadas (brand, slate, accent, success, danger, warning, muted, white)',
    /(?:bg|text|border|ring|outline)-(?:l-)?(?:brand|brandD|slate|accent|accentD|success|successD|danger|dangerD|warning|warningD|muted|mutedD|white)\b/
      .test(sinComentarios), false);
  t.ok('sin emojis ni símbolos de ícono en el código',
    /\p{Extended_Pictographic}|[✓✗✕←→›]/u.test(sinComentarios), false);
  t.ok('sin rounded-*, sombras ni activeOpacity ni TouchableOpacity',
    /rounded|sombras|activeOpacity|TouchableOpacity|shadow/.test(sinComentarios), false);
  t.ok('sin literales de color ni de medida arbitraria',
    /#[0-9a-fA-F]{3,8}\b|rgba?\(|\[\d+(?:\.\d+)?px\]|\[\d+px\]/.test(sinComentarios), false);
  t.ok('sin el campo emoji de getResultFeedback', /emoji/.test(sinComentarios), false);

  // Escritorio: las piezas de `plancha/`, sin cortes ni anchos propios (3.11a).
  t.ok('usa Hoja y Regiones de plancha',
    /<Hoja[\s>]/.test(sinComentarios) && /<Regiones[\s>]/.test(sinComentarios), true);
  t.ok('sin max-w-*, escritorio:, amplio: ni useWindowDimensions propios',
    /max-w-|escritorio:|amplio:|useWindowDimensions|\b1024\b/.test(sinComentarios), false);
  t.ok('sin los nombres legados de tono (warning, success, danger)', /warning|success|danger/.test(sinComentarios), false);
}

module.exports = [
  { nombre: 'terminar un quiz no pide confirmación', correr: terminarUnQuizNoPregunta },
  { nombre: 'Results: rótulo, porcentaje y mensaje de cada tramo', correr: tarjetaPorTramo },
  { nombre: 'Results: tira de casillas hasta 40 y sin tira con más', correr: tiraDeCasillas },
  { nombre: 'Results: chip de tema con nombre legible', correr: chipDeTema },
  { nombre: 'Results: trío de correctas, incorrectas y total', correr: trioDeCifras },
  { nombre: 'Results: botones, estados K y gestos', correr: botonesYGestos },
  { nombre: 'Results: pedido de donación entre el trío y los botones', correr: pedidoDeDonacion },
  { nombre: 'Results: variantes del pedido por porcentaje y descartar (DON-P5)', correr: variantesDelPedido },
  { nombre: 'Results: cadencia de 1 de cada 3 aprobados', correr: cadenciaDelPedido },
  { nombre: 'Results: eventos de analítica por comportamiento (D6)', correr: eventosDeAnalitica },
  { nombre: 'Revisión: encabezado, volver arriba y filtro de incorrectas', correr: revisionEncabezadoYFiltro },
  { nombre: 'Revisión: estados K de cada control', correr: estadosDeRevision },
  { nombre: 'Revisión: sin falladas no hay filtro', correr: revisionSinFalladas },
  { nombre: 'Revisión: tarjetas, nota y botones finales', correr: revisionTarjetas },
  { nombre: 'Results: anchos de 320 a 1023 sin scroll horizontal', correr: anchos },
  { nombre: 'Results: escritorio, lateral y principal (ESC-P5, ESC-P10)', correr: escritorioResumen },
  { nombre: 'Revisión: escritorio, lateral y principal (ESC-P6)', correr: escritorioRevision },
  { nombre: 'Results: tema oscuro', correr: temaOscuro },
  { nombre: 'Results: fuente sin legado y con D6 intacto', correr: fuenteDeLaPantalla },
];

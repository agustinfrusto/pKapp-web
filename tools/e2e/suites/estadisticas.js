// Suite «estadisticas» del arnés end-to-end (ver ../README.md).
//
// StatsScreen migrada a la Plancha (tarea 3.7; fichas `diseno/pantallas/Stats.md` y
// `Vacios.md` V1, V6, V7 y V8). Misma técnica que las demás suites: la app corre en un
// iframe de ancho fijo y se mide su DOM. Los datos se siembran en `localStorage`
// (`pkapp_question_stats:bcyt`, la capa web de `src/db/database.web.js`) con la pantalla
// de Home ya abierta, y se llega a Estadísticas como el usuario: con «Mis estadísticas».
//
// Los cortes 80 y 60 son el contrato D6 (`acierto()`); se repiten acá a propósito, para
// que un cambio de corte rompa la suite.

const fs = require('fs');
const path = require('path');
const { plancha } = require('../../../src/theme/colores');
const { GLIFOS } = require('../../../src/assets/glifos');
const { QUESTIONS } = require('../../../src/materias/bcyt/questions');
const { TOPICS } = require('../../../src/materias/bcyt/topics');
const {
  EN_MARCO, LADO_TACTIL, PASO, abrirMarco, clicEnMarco, esperarEnMarco, irAHomeEnMarco,
} = require('./comunes');

const RAIZ = path.join(__dirname, '..', '..', '..');
const CLAVE_STATS = 'pkapp_question_stats:bcyt';
const COLUMNA = 448;                    // max-w-columna (tokens.md c.3)
const MARGEN_LATERAL = 5 * PASO;        // paso 5
const CORTE_ESCRITORIO = 1024;          // tokens.md c.4
const CORTE_AMPLIO = 1440;
const LATERAL = 320;                    // ancho `lateral`
const LECTURA = 600;                    // ancho `lectura`
const HOJA = 952;
const HOJA_AMPLIA = 1440;
const MARGEN_HOJA = 8 * PASO;           // paso 8
const EMOJI = /\p{Extended_Pictographic}/u;

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
const dDe = (glifo) => GLIFOS[glifo].elementos[0].props.d;
const banda = (pct) => (pct >= 80 ? 'acierto' : pct >= 60 ? 'intermedia' : 'error');
const GLIFO_DE = { acierto: 'glifo-acierto', intermedia: 'glifo-intermedia', error: 'glifo-error' };

// ---------------------------------------------------------------------------
// Datos sembrados: `tema: [respondidas, correctas]`, todo en la primera pregunta del tema.
// Cubren las tres bandas, los cuatro bordes de corte (80, 79, 60, 59) y 12 falladas
// (dos quedan fuera del tope de 10). El resto de los temas queda «Sin practicar».

const PLAN = {
  'quimica-agua': [5, 5],           // 100 · alta, no fallada
  'aminoacidos': [10, 7],           //  70 · intermedia
  'lipidos-glucidos': [5, 2],       //  40 · baja
  'enzimas': [5, 4],                //  80 · alta, justo en el corte
  'metabolismo': [5, 3],            //  60 · intermedia, justo en el corte
  'membrana-celular': [19, 15],     //  79 · intermedia, un punto bajo el 80
  'organelos': [17, 10],            //  59 · baja, un punto bajo el 60
  'division-celular': [3, 0],       //   0 · baja
  'reparacion-adn': [4, 1],         //  25 · baja
  'genetica': [3, 1],               //  33 · baja
  'adn-arn': [7, 3],                //  43 · baja
  'epitelial': [2, 1],              //  50 · baja
  'conjuntivo': [9, 4],             //  44 · baja
};

const preguntaDe = (tema) => QUESTIONS.find((q) => q.topic === tema);

function sembrar(plan) {
  const stats = {};
  for (const [tema, [a, c]] of Object.entries(plan)) {
    stats[preguntaDe(tema).id] = { times_answered: a, times_correct: c, last_answered_at: 1 };
  }
  return stats;
}

function esperado(plan) {
  const filas = Object.keys(TOPICS)
    .map((k) => {
      const total = QUESTIONS.filter((q) => q.topic === k).length;
      const [a, c] = plan[k] || [0, 0];
      const pct = a > 0 ? Math.round((c / a) * 100) : null;
      return { k, nombre: TOPICS[k], total, a, c, pct, banda: pct === null ? null : banda(pct) };
    })
    .filter((f) => f.total > 0);
  const respondidas = filas.reduce((s, f) => s + f.a, 0);
  const correctas = filas.reduce((s, f) => s + f.c, 0);
  const global = respondidas > 0 ? Math.round((correctas / respondidas) * 100) : 0;
  const falladas = filas
    .filter((f) => f.a > 0 && f.c < f.a)
    .map((f) => ({ ...f, acc: f.c / f.a, q: preguntaDe(f.k) }))
    .sort((x, y) => x.acc - y.acc)
    .slice(0, 10)
    .map((f) => ({ ...f, pctFallada: Math.round(f.acc * 100) }));
  return { filas, respondidas, correctas, global, bandaGlobal: banda(global), falladas };
}

// ---------------------------------------------------------------------------
// Lectura de la pantalla dentro del marco.

const LEER_STATS = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const uno = (id) => visibles('[data-testid="' + id + '"]')[0] || null;
  const estilo = (n, p) => (n ? w.getComputedStyle(n)[p] : null);
  const hojaDe = (n) => (n
    ? Array.from(n.querySelectorAll('*')).find((x) => x.children.length === 0 && x.textContent.trim() !== '') || n
    : null);
  const familia = (n) => (n ? w.getComputedStyle(n).fontFamily.split(',')[0].replace(/["']/g, '').trim() : null);
  const texto = (id) => {
    const n = uno(id);
    if (!n) return null;
    const h = hojaDe(n);
    return { texto: n.textContent.trim(), caja: caja(n), color: estilo(h, 'color'), tamano: estilo(h, 'fontSize'),
      familia: familia(h), mayusculas: estilo(h, 'textTransform'), cursiva: estilo(h, 'fontStyle') };
  };
  // Marca de estado: svg + texto con el color del estado (o tintaSec).
  const marca = (id) => {
    const t = texto(id);
    if (!t) return null;
    const n = uno(id);
    const svg = n.querySelector('svg');
    const hoja = hojaDe(n);
    return { ...t,
      hueco: svg && hoja ? hoja.getBoundingClientRect().left - svg.getBoundingClientRect().right : null,
      d: svg && svg.children[0] ? svg.children[0].getAttribute('d') : null,
      trazo: svg ? svg.getAttribute('stroke') : null,
      lado: svg ? svg.getAttribute('width') : null,
      oculto: svg ? svg.getAttribute('aria-hidden') : null,
      svgs: n.querySelectorAll('svg').length };
  };
  const claves = ${JSON.stringify(Object.keys(TOPICS))};
  const filas = claves.map((k) => {
    const f = uno('stats-fila-' + k);
    if (!f) return null;
    // Con 0 % el relleno mide 0 px y el filtro de visibles lo descarta: se lo busca sin filtro.
    const relleno = d.querySelector('[data-testid="stats-relleno-' + k + '"]');
    return {
      clave: k, caja: caja(f),
      fileteAncho: estilo(f, 'borderTopWidth'), fileteColor: estilo(f, 'borderTopColor'),
      nombre: texto('stats-nombre-' + k),
      valor: marca('stats-valor-' + k),
      sinPracticar: texto('stats-sin-practicar-' + k),
      detalle: texto('stats-detalle-' + k),
      barra: caja(uno('stats-barra-' + k)),
      barraBorde: estilo(uno('stats-barra-' + k), 'borderTopColor'),
      barraFondo: estilo(uno('stats-barra-' + k), 'backgroundColor'),
      relleno: relleno ? { caja: caja(relleno), fondo: estilo(relleno, 'backgroundColor') } : null,
      u60: caja(uno('stats-umbral-60-' + k)),
      u80: caja(uno('stats-umbral-80-' + k)),
      u60Color: estilo(uno('stats-umbral-60-' + k), 'backgroundColor'),
      svgs: f.querySelectorAll('svg').length,
    };
  });
  const falladas = [];
  for (let n = 1; n <= 12; n++) {
    const f = uno('stats-fallada-' + n);
    if (!f) break;
    falladas.push({
      n, caja: caja(f), fileteAncho: estilo(f, 'borderTopWidth'), fileteColor: estilo(f, 'borderTopColor'),
      indice: texto('stats-fallada-indice-' + n),
      valor: marca('stats-fallada-valor-' + n),
      enunciado: texto('stats-fallada-enunciado-' + n),
      tema: texto('stats-fallada-tema-' + n),
    });
  }
  const global = uno('stats-global');
  const vacio = uno('stats-vacio');
  const leyenda = uno('stats-leyenda');
  const practicar = uno('stats-practicar');
  return {
    vista: w.innerWidth,
    ruta: w.location.pathname,
    desborda: desbordes().length > 0,
    texto: d.body.innerText,
    global: global ? {
      caja: caja(global),
      marcas: global.querySelectorAll('[data-testid="marca-esquina"]').length,
      rotulo: marca('stats-global-rotulo'),
      valor: marca('stats-global-valor'),
      detalle: texto('stats-global-detalle'),
    } : null,
    rotuloPorTema: texto('stats-rotulo-por-tema'),
    leyenda: leyenda ? {
      caja: caja(leyenda),
      items: ['acierto', 'intermedia', 'error'].map((b) => marca('stats-leyenda-' + b)),
    } : null,
    filas,
    rotuloFalladas: texto('stats-rotulo-falladas'),
    falladas,
    vacio: vacio ? {
      caja: caja(vacio),
      marcas: vacio.querySelectorAll('[data-testid="marca-esquina"]').length,
      texto: vacio.textContent.trim(),
      glifo: marca('stats-vacio-glifo'),
      titulo: texto('stats-vacio-titulo'),
    } : null,
    practicar: practicar ? { caja: caja(practicar), nombre: practicar.getAttribute('aria-label') || practicar.textContent.trim(),
      rol: practicar.getAttribute('role') } : null,
    interactivos: visibles('[tabindex]').map((n) => caja(n)),
    marcasEsquina: visibles('[data-testid="marca-esquina"]').length,
  };
`);

const leer = (pagina) => pagina.evaluar(LEER_STATS);
const ESTA_OSCURO = EN_MARCO(`return d.documentElement.classList.contains('dark');`);
const RUTA = EN_MARCO('return w.location.pathname;');

const leerClave = (pagina) => pagina.evaluar(`localStorage.getItem(${JSON.stringify(CLAVE_STATS)})`);
const escribirClave = (pagina, valor) => pagina.evaluar(valor === null
  ? `localStorage.removeItem(${JSON.stringify(CLAVE_STATS)})`
  : `localStorage.setItem(${JSON.stringify(CLAVE_STATS)}, ${JSON.stringify(valor)})`);

// Abre la app, elige la materia, siembra las estadísticas (`plan` null: vacías) y entra a
// Estadísticas con «Mis estadísticas». Devuelve true si la pantalla quedó resuelta.
async function abrirStats(pagina, base, { ancho = 390, alto = 900, oscuro = false, plan = PLAN, antes } = {}) {
  // El puntero del arnés se mueve en la ventana de la página: tiene que abarcar el marco.
  if (ancho > 900) {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });
  }
  if (!await abrirMarco(pagina, base, ancho, alto)) return false;
  if (oscuro) {
    await clicEnMarco(pagina, 'oscuro');
    if (!await pagina.esperarA(() => pagina.evaluar(ESTA_OSCURO))) return false;
  }
  if (!await irAHomeEnMarco(pagina)) return false;
  await esperarEnMarco(pagina, 'mis estadísticas');
  if (previo === undefined) previo = await leerClave(pagina);
  await escribirClave(pagina, plan === null ? null : JSON.stringify(sembrar(plan)));
  if (antes) await antes();
  await clicEnMarco(pagina, 'mis estadísticas');
  if (!await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/estadisticas')) return false;
  return pagina.esperarA(async () => {
    const m = await leer(pagina);
    return m.global !== null || m.vacio !== null;
  }, { limite: 10000 });
}

// La clave de estadísticas del perfil se guarda la primera vez y se restaura en la última
// entrada de la suite: las demás suites comparten el Chrome y su `localStorage`.
let previo;

// ---------------------------------------------------------------------------
// 1 · Filas por tema: banda, marca, glifo, color, barra y marcas de umbral.

async function filasPorBanda(pagina, base, t) {
  const E = esperado(PLAN);
  for (const tema of ['claro', 'oscuro']) {
    const T = plancha[tema];
    const cuando = `390 px ${tema}`;
    t.ok(`${cuando}: abrió Estadísticas con datos`, await abrirStats(pagina, base, { oscuro: tema === 'oscuro' }), true);
    const m = await leer(pagina);
    const filas = m.filas.filter(Boolean);

    t.ok(`${cuando}: hay una fila por cada tema con preguntas`,
      filas.map((f) => f.clave).join('|'), E.filas.map((f) => f.k).join('|'));

    // STATS-P3: el orden de los temas de la materia, de arriba hacia abajo.
    t.ok(`${cuando}: las filas siguen el orden de los temas (STATS-P3)`,
      filas.every((f, i) => i === 0 || f.caja.arriba > filas[i - 1].caja.arriba), true);

    for (const e of E.filas) {
      const f = filas.find((x) => x.clave === e.k);
      const q = `${cuando}: ${e.k}`;
      if (!f) { t.ok(`${q}: existe la fila`, false, true); continue; }
      t.ok(`${q}: nombre del tema`, f.nombre && f.nombre.texto, e.nombre);
      t.ok(`${q}: nombre en tinta, paso item (16 px)`,
        f.nombre && `${f.nombre.color}|${f.nombre.tamano}`, `${rgb(T.tinta)}|16px`);
      t.ok(`${q}: nombre en Plex Sans 600 (item, C-02)`, f.nombre && f.nombre.familia, 'PlexSans-SemiBold');
      t.ok(`${q}: filete superior de 1 px en filete`, `${f.fileteAncho}|${f.fileteColor}`, `1px|${rgb(T.filete)}`);

      if (e.pct === null) {
        // V7: «Sin practicar», sin barra ni marca de banda.
        t.ok(`${q}: dice «Sin practicar» (V7)`, f.sinPracticar && f.sinPracticar.texto, 'Sin practicar');
        t.ok(`${q}: «Sin practicar» en tintaSec, sin cursiva, paso detalle`,
          f.sinPracticar && `${f.sinPracticar.color}|${f.sinPracticar.cursiva}|${f.sinPracticar.tamano}`,
          `${rgb(T.tintaSec)}|normal|13px`);
        t.ok(`${q}: sin barra, sin marcas de umbral y sin glifo`,
          f.barra === null && f.u60 === null && f.u80 === null && f.svgs === 0, true);
        t.ok(`${q}: detalle «{t} preguntas disponibles»`, f.detalle && f.detalle.texto, `${e.total} preguntas disponibles`);
        continue;
      }

      const exp = e.banda;
      t.ok(`${q}: valor «${e.pct}%»`, f.valor && f.valor.texto, `${e.pct}%`);
      t.ok(`${q}: valor en el color de su banda (${exp})`, f.valor && f.valor.color, rgb(T[exp]));
      t.ok(`${q}: marca de banda delante del valor (${GLIFO_DE[exp]})`,
        f.valor && `${f.valor.d}|${f.valor.trazo.toLowerCase()}|${f.valor.lado}|${f.valor.oculto}`,
        `${dDe(GLIFO_DE[exp])}|${T[exp].toLowerCase()}|16|true`);
      t.ok(`${q}: valor en paso dato (Plex Mono 500, 16 px)`,
        f.valor && `${f.valor.familia}|${f.valor.tamano}`, 'PlexMono-Medium|16px');
      t.ok(`${q}: detalle de respuestas y preguntas`,
        f.detalle && f.detalle.texto, `${e.c} aciertos en ${e.a} respuestas · ${e.total} preguntas disponibles`);
      t.ok(`${q}: detalle en tintaSec, paso detalle`,
        f.detalle && `${f.detalle.color}|${f.detalle.tamano}`, `${rgb(T.tintaSec)}|13px`);

      // Barra (STATS-P1): alto paso 2, pista superficie con filete, relleno de la banda.
      t.ok(`${q}: barra de paso 2 (8 px) de alto`, f.barra && f.barra.alto, 2 * PASO);
      t.ok(`${q}: barra de ancho completo de la columna`,
        !!f.barra && Math.abs(f.barra.ancho - f.caja.ancho) < 1, true);
      t.ok(`${q}: pista en superficie con borde filete`,
        f.barra && `${f.barraFondo}|${f.barraBorde}`, `${rgb(T.superficie)}|${rgb(T.filete)}`);
      t.ok(`${q}: relleno en el color de su banda`, f.relleno && f.relleno.fondo, rgb(T[exp]));

      if (f.barra && f.relleno && f.u60 && f.u80) {
        const interior = f.barra.ancho - 2;                   // menos el borde de 1 px
        const x = (p) => f.barra.izq + 1 + (p / 100) * interior;
        t.ok(`${q}: el relleno mide ${e.pct}% de la pista`,
          Math.abs(f.relleno.caja.ancho - (e.pct / 100) * interior) <= 1.5, true);
        t.ok(`${q}: marca de umbral en el 60% de la barra`,
          Math.abs((f.u60.izq + f.u60.der) / 2 - x(60)) <= 1.5, true);
        t.ok(`${q}: marca de umbral en el 80% de la barra`,
          Math.abs((f.u80.izq + f.u80.der) / 2 - x(80)) <= 1.5, true);
        t.ok(`${q}: marcas de paso 3.5 (14 px) de alto, centradas sobre la barra`,
          f.u60.alto === 3.5 * PASO && f.u80.alto === 3.5 * PASO
            && Math.abs((f.u60.arriba + f.u60.abajo) / 2 - (f.barra.arriba + f.barra.abajo) / 2) <= 0.5, true);
        t.ok(`${q}: marcas en linea`, f.u60Color, rgb(T.linea));
        t.ok(`${q}: las marcas sobresalen arriba y abajo de la barra`,
          f.u60.arriba < f.barra.arriba && f.u60.abajo > f.barra.abajo, true);

        // Posición del extremo del relleno respecto de las marcas: lo que distingue la banda sin color.
        // En los cortes exactos (80 y 60) el extremo cae sobre la marca: no se afirma posición.
        const borde = f.relleno.caja.der;
        if (e.pct > 80) t.ok(`${q}: el relleno pasa la marca del 80%`, borde > f.u80.der, true);
        else if (e.pct > 60 && e.pct < 80) {
          t.ok(`${q}: el relleno queda entre la marca del 60% y la del 80%`, borde > f.u60.der && borde < f.u80.izq, true);
        } else if (e.pct < 60) t.ok(`${q}: el relleno no llega a la marca del 60%`, borde < f.u60.izq, true);
      } else {
        t.ok(`${q}: hay relleno y dos marcas de umbral`, false, true);
      }
    }
    t.ok(`${cuando}: sin emojis`, EMOJI.test(m.texto), false);
  }
}

// ---------------------------------------------------------------------------
// 2 · Tarjeta global (STATS-P5), rótulo «Por tema» y leyenda (STATS-P2).

async function tarjetaGlobalYLeyenda(pagina, base, t) {
  const E = esperado(PLAN);
  for (const tema of ['claro', 'oscuro']) {
    const T = plancha[tema];
    const cuando = `390 px ${tema}`;
    t.ok(`${cuando}: abrió Estadísticas con datos`, await abrirStats(pagina, base, { oscuro: tema === 'oscuro' }), true);
    const m = await leer(pagina);
    const g = m.global;
    t.ok(`${cuando}: hay tarjeta global`, g !== null, true);
    if (!g) continue;
    t.ok(`${cuando}: lámina con cuatro marcas de esquina`, g.marcas, 4);
    t.ok(`${cuando}: respeta el margen lateral paso 5`,
      Math.abs(g.caja.izq - MARGEN_LATERAL) <= 1 && Math.abs(m.vista - g.caja.der - MARGEN_LATERAL) <= 1, true);
    t.ok(`${cuando}: rótulo «Aciertos globales» en tintaSec con marca de banda chica`,
      g.rotulo && `${g.rotulo.texto}|${g.rotulo.color}|${g.rotulo.lado}|${g.rotulo.d}`,
      `Aciertos globales|${rgb(T.tintaSec)}|16|${dDe(GLIFO_DE[E.bandaGlobal])}`);
    t.ok(`${cuando}: la marca del rótulo lleva el color de la banda`, g.rotulo && g.rotulo.trazo.toLowerCase(), T[E.bandaGlobal].toLowerCase());
    t.ok(`${cuando}: marca y texto del rótulo separados por paso 2 (8 px), como pide la ficha a.2`,
      !!g.rotulo && g.rotulo.hueco !== null && Math.abs(g.rotulo.hueco - 2 * PASO) <= 0.5, true);
    t.ok(`${cuando}: porcentaje global «${E.global}%»`, g.valor && g.valor.texto, `${E.global}%`);
    t.ok(`${cuando}: porcentaje en paso display (72 px, Plex Mono 500) y color de su banda`,
      g.valor && `${g.valor.tamano}|${g.valor.familia}|${g.valor.color}`, `72px|PlexMono-Medium|${rgb(T[E.bandaGlobal])}`);
    t.ok(`${cuando}: marca del porcentaje de paso 6 (24 px), con el glifo de su banda`,
      g.valor && `${g.valor.lado}|${g.valor.d}|${g.valor.trazo.toLowerCase()}`,
      `24|${dDe(GLIFO_DE[E.bandaGlobal])}|${T[E.bandaGlobal].toLowerCase()}`);
    t.ok(`${cuando}: detalle «{aciertos} aciertos de {respuestas} respuestas»`,
      g.detalle && g.detalle.texto, `${E.correctas} aciertos de ${E.respondidas} respuestas`);
    t.ok(`${cuando}: detalle en tintaSec`, g.detalle && g.detalle.color, rgb(T.tintaSec));
    t.ok(`${cuando}: contenido centrado en la lámina`,
      !!g.valor && Math.abs((g.valor.caja.izq + g.valor.caja.der) / 2 - (g.caja.izq + g.caja.der) / 2) <= 1.5, true);

    // Rótulo de sección y leyenda, en ese orden y debajo de la tarjeta.
    t.ok(`${cuando}: rótulo «Por tema» en acento, en mayúsculas`,
      m.rotuloPorTema && `${m.rotuloPorTema.texto}|${m.rotuloPorTema.color}|${m.rotuloPorTema.mayusculas}`,
      `Por tema|${rgb(T.acento)}|uppercase`);
    const l = m.leyenda;
    t.ok(`${cuando}: hay leyenda de tres bandas`, !!l && l.items.every(Boolean), true);
    if (l && l.items.every(Boolean)) {
      t.ok(`${cuando}: leyenda con cifras y signos, sin palabras (STATS-P2)`,
        l.items.map((i) => i.texto).join('|'), '≥ 80 %|60–79 %|< 60 %');
      t.ok(`${cuando}: cada ítem repite la marca de su banda`,
        l.items.map((i) => i.d).join('|'), ['acierto', 'intermedia', 'error'].map((b) => dDe(GLIFO_DE[b])).join('|'));
      t.ok(`${cuando}: marca en el color de la banda y texto en tintaSec`,
        l.items.map((i) => `${i.trazo.toLowerCase()}/${i.color}`).join('|'),
        ['acierto', 'intermedia', 'error'].map((b) => `${T[b].toLowerCase()}/${rgb(T.tintaSec)}`).join('|'));
      t.ok(`${cuando}: orden vertical tarjeta, rótulo, leyenda y primera fila`,
        g.caja.abajo <= m.rotuloPorTema.caja.arriba && m.rotuloPorTema.caja.abajo <= l.caja.arriba
          && l.caja.abajo <= m.filas.find(Boolean).caja.arriba, true);
      const mismaFila = l.items.every((i) => Math.abs(i.caja.arriba - l.items[0].caja.arriba) < 2);
      if (mismaFila) {
        t.ok(`${cuando}: ítems separados por paso 4 como mínimo`,
          l.items.every((i, k) => k === 0 || i.caja.izq - l.items[k - 1].caja.der >= 4 * PASO - 0.5), true);
      }
    }
    t.ok(`${cuando}: sin emojis`, EMOJI.test(m.texto), false);
  }

  // Las tres bandas del porcentaje global, con su marca, su color y su glifo.
  for (const [pct, [a, c], exp] of [[90, [10, 9], 'acierto'], [70, [10, 7], 'intermedia'], [30, [10, 3], 'error']]) {
    const tema = 'claro';
    const T = plancha[tema];
    t.ok(`global ${pct}%: abrió Estadísticas`,
      await abrirStats(pagina, base, { plan: { 'quimica-agua': [a, c] } }), true);
    const g = (await leer(pagina)).global;
    t.ok(`global ${pct}%: valor, glifo y color de la banda ${exp}`,
      g && g.valor && `${g.valor.texto}|${g.valor.d}|${g.valor.color}`,
      `${pct}%|${dDe(GLIFO_DE[exp])}|${rgb(T[exp])}`);
  }
}

// ---------------------------------------------------------------------------
// 3 · «Más falladas»: hasta 10, orden por acierto ascendente, valor con marca (STATS-P4).

async function masFalladas(pagina, base, t) {
  const E = esperado(PLAN);
  for (const tema of ['claro', 'oscuro']) {
    const T = plancha[tema];
    const cuando = `390 px ${tema}`;
    t.ok(`${cuando}: abrió Estadísticas con datos`, await abrirStats(pagina, base, { oscuro: tema === 'oscuro' }), true);
    const m = await leer(pagina);

    t.ok(`${cuando}: rótulo «Más falladas» en acento`,
      m.rotuloFalladas && `${m.rotuloFalladas.texto}|${m.rotuloFalladas.color}`, `Más falladas|${rgb(T.acento)}`);
    t.ok(`${cuando}: 12 preguntas falladas, la lista muestra 10`, m.falladas.length, 10);
    t.ok(`${cuando}: el rótulo va debajo de la última fila por tema`,
      !!m.rotuloFalladas && m.rotuloFalladas.caja.arriba >= m.filas.filter(Boolean).slice(-1)[0].caja.abajo, true);

    E.falladas.forEach((e, i) => {
      const f = m.falladas[i];
      const q = `${cuando}: fallada #${i + 1}`;
      if (!f) { t.ok(`${q}: existe`, false, true); return; }
      t.ok(`${q}: índice «#{n}» en tintaSec`, f.indice && `${f.indice.texto}|${f.indice.color}`, `#${i + 1}|${rgb(T.tintaSec)}`);
      t.ok(`${q}: valor «{pct}% ({aciertos}/{respuestas})»`, f.valor && f.valor.texto, `${e.pctFallada}% (${e.c}/${e.a})`);
      const exp = banda(e.pctFallada);
      t.ok(`${q}: valor con el color y la marca de su banda (${exp})`,
        f.valor && `${f.valor.color}|${f.valor.d}|${f.valor.trazo.toLowerCase()}`,
        `${rgb(T[exp])}|${dDe(GLIFO_DE[exp])}|${T[exp].toLowerCase()}`);
      t.ok(`${q}: valor en paso rotulo-medio (Plex Mono 500, 11 px, mayúsculas)`,
        f.valor && `${f.valor.familia}|${f.valor.tamano}|${f.valor.mayusculas}`, 'PlexMono-Medium|11px|uppercase');
      t.ok(`${q}: enunciado completo en el DOM, a dos líneas como máximo`,
        f.enunciado && f.enunciado.texto === e.q.question && f.enunciado.caja.alto <= 2 * 22 + 0.5, true);
      t.ok(`${q}: enunciado en tinta`, f.enunciado && f.enunciado.color, rgb(T.tinta));
      t.ok(`${q}: tema en tintaSec, sin cursiva`,
        f.tema && `${f.tema.texto}|${f.tema.color}|${f.tema.cursiva}`, `${TOPICS[e.q.topic]}|${rgb(T.tintaSec)}|normal`);
      t.ok(`${q}: filete superior de 1 px en filete`, `${f.fileteAncho}|${f.fileteColor}`, `1px|${rgb(T.filete)}`);
    });
    t.ok(`${cuando}: orden por acierto ascendente`,
      m.falladas.map((f) => f.valor && f.valor.texto).join('|'),
      E.falladas.map((e) => `${e.pctFallada}% (${e.c}/${e.a})`).join('|'));
    t.ok(`${cuando}: las dos con mejor acierto (80% y 79%) quedan fuera del tope`,
      m.falladas.every((f) => !/^(80|79)%/.test(f.valor.texto)), true);
  }

  // Una fallada con 80% o más lleva glifo-acierto: es la banda de su porcentaje (STATS-P4).
  t.ok('fallada alta: abrió Estadísticas', await abrirStats(pagina, base, { plan: { 'quimica-agua': [10, 9] } }), true);
  const alta = (await leer(pagina)).falladas[0];
  t.ok('fallada con 90%: valor «90% (9/10)» con glifo-acierto en el color acierto',
    alta && alta.valor && `${alta.valor.texto}|${alta.valor.d}|${alta.valor.color}`,
    `90% (9/10)|${dDe('glifo-acierto')}|${rgb(plancha.claro.acierto)}`);
}

// ---------------------------------------------------------------------------
// 4 · Estados vacíos: V1 con «Practicar», VAC-P4, V6 y V7.

async function vacioV1(pagina, base, t) {
  for (const tema of ['claro', 'oscuro']) {
    const T = plancha[tema];
    const cuando = `390 px ${tema}`;
    t.ok(`${cuando}: abrió Estadísticas sin datos`,
      await abrirStats(pagina, base, { plan: null, oscuro: tema === 'oscuro' }), true);
    const m = await leer(pagina);
    const v = m.vacio;
    t.ok(`${cuando}: V1 es una lámina vacía`, v !== null, true);
    if (!v) continue;
    t.ok(`${cuando}: V1 conserva título y texto de main, sin cambio de palabras`,
      v.texto.includes('Sin estadísticas todavía')
        && v.texto.includes('Hacé algunos quizzes y volvé a esta pantalla para ver tu progreso.'), true);
    t.ok(`${cuando}: V1 sin tarjeta global, filas ni «Más falladas»`,
      m.global === null && m.filas.every((f) => f === null) && m.rotuloFalladas === null && m.leyenda === null, true);
    t.ok(`${cuando}: V1 sin emoji`, EMOJI.test(m.texto), false);
    t.ok(`${cuando}: V1 con sus cuatro marcas de esquina (VAC-P1)`, v.marcas, 4);
    t.ok(`${cuando}: V1 respeta el margen lateral paso 5`,
      Math.abs(v.caja.izq - MARGEN_LATERAL) <= 1 && Math.abs(m.vista - v.caja.der - MARGEN_LATERAL) <= 1, true);
    t.ok(`${cuando}: V1 anclada arriba de la columna, no centrada en la pantalla`, v.caja.arriba < 160, true);
    t.ok(`${cuando}: V1 glifo-estadisticas de paso 12 (48 px) en tintaSec y decorativo`,
      v.glifo && `${v.glifo.d}|${v.glifo.lado}|${v.glifo.trazo.toLowerCase()}|${v.glifo.oculto}`,
      `${dDe('glifo-estadisticas')}|48|${T.tintaSec.toLowerCase()}|true`);
    t.ok(`${cuando}: V1 título en tinta`, v.titulo && v.titulo.color, rgb(T.tinta));
    t.ok(`${cuando}: V1 «Practicar» es un botón de 44 × 44 como mínimo (VAC-P2)`,
      !!m.practicar && m.practicar.caja.alto >= LADO_TACTIL && m.practicar.caja.ancho >= LADO_TACTIL, true);
    t.ok(`${cuando}: V1 «Practicar» con nombre accesible y rol botón`,
      m.practicar && `${m.practicar.nombre}|${m.practicar.rol}`, 'Practicar|button');
  }

  // «Practicar» navega a TopicSelect practice con un solo toque.
  t.ok('abrió Estadísticas sin datos', await abrirStats(pagina, base, { plan: null }), true);
  await clicEnMarco(pagina, 'practicar');
  t.ok('V1: «Practicar» lleva a /temas/practice con un solo toque',
    await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/temas/practice'), true);
  t.ok('V1: tras «Practicar» aparece la mezcla', await esperarEnMarco(pagina, 'todos los temas mezclados'), true);
}

const INSTANTANEA = (clave) => EN_MARCO(`
  w.__instantanea = null;
  const original = w.Storage.prototype.getItem;
  w.Storage.prototype.getItem = function (c) {
    if (w.__instantanea === null && String(c).startsWith(${JSON.stringify(clave)})) {
      w.__instantanea = {
        texto: d.body.innerText.toLowerCase(),
        cargando: !!d.querySelector('[data-testid="stats-cargando"]'),
      };
      w.Storage.prototype.getItem = original;
    }
    return original.apply(this, arguments);
  };
`);

// VAC-P4: hasta que resuelve la primera carga no hay lámina vacía ni contenido, ni para quien
// no tiene datos ni para quien sí los tiene. El instante se fija con la primera lectura de
// las estadísticas (el efecto de carga): ahí el DOM es el del primer render.
async function sinParpadeoDeVacio(pagina, base, t) {
  for (const [rotulo, plan] of [['sin datos', null], ['con datos', PLAN]]) {
    t.ok(`${rotulo}: abrió Estadísticas`, await abrirStats(pagina, base, {
      plan,
      antes: () => pagina.evaluar(INSTANTANEA('pkapp_question_stats:')),
    }), true);
    t.ok(`${rotulo}: la carga corrió`,
      await pagina.esperarA(async () => (await pagina.evaluar(EN_MARCO('return w.__instantanea;'))) !== null), true);
    const { texto: primera, cargando } = await pagina.evaluar(EN_MARCO('return w.__instantanea;'));
    // El marcador es de Estadísticas: el texto «estadísticas» también está en Home («mis
    // estadísticas») y la ruta todavía es la de Home en el primer render.
    t.ok(`${rotulo}: durante la primera carga está el marcador de carga de la pantalla`, cargando, true);
    t.ok(`${rotulo}: durante la primera carga no se muestra el estado vacío (VAC-P4)`,
      !primera.includes('sin estadísticas todavía') && !primera.includes('practicar'), true);
    t.ok(`${rotulo}: durante la primera carga no hay contenido`,
      !primera.includes('aciertos globales') && !primera.includes('por tema') && !primera.includes('más falladas'), true);
    const m = await leer(pagina);
    t.ok(`${rotulo}: resuelta la carga aparece ${plan === null ? 'V1' : 'la tarjeta global'}`,
      plan === null ? m.vacio !== null : m.global !== null, true);
  }
}

async function ausenciasV6yV7(pagina, base, t) {
  // V6: sin respuestas falladas, la sección no se renderiza (ni rótulo ni hueco).
  t.ok('V6: abrió Estadísticas con todo acertado',
    await abrirStats(pagina, base, { plan: { 'quimica-agua': [5, 5], 'aminoacidos': [4, 4] } }), true);
  const m = await leer(pagina);
  t.ok('V6: sin «Más falladas» ni filas de falladas', m.rotuloFalladas === null && m.falladas.length === 0, true);
  t.ok('V6: sigue la tarjeta global y las filas por tema', m.global !== null && m.filas.filter(Boolean).length > 0, true);
  const ultima = m.filas.filter(Boolean).slice(-1)[0];
  t.ok('V6: las dos filas respondidas muestran su banda alta',
    m.filas.filter((f) => f && f.valor).every((f) => f.valor.d === dDe('glifo-acierto')), true);
  t.ok('V6: la última fila es un tema «Sin practicar» (V7)', !!ultima && ultima.sinPracticar !== null, true);
}

// V8 con un dato real: un tema de la materia sin preguntas. Ningún tema publicado queda
// vacío, así que se le quitan las preguntas al banco que ya cargó la pantalla (la
// materia del contexto de React) antes de entrar a Estadísticas. El marco es nuevo en
// cada `abrirStats`, así que el cambio no sobrevive a esta entrada.
const TEMA_V8 = 'linfoideo';            // sin respuestas sembradas en PLAN

const VACIAR_TEMA = (clave) => EN_MARCO(`
  const nodo = d.querySelector('[tabindex]') || d.body.firstElementChild;
  const llave = nodo && Object.keys(nodo).find((x) => x.startsWith('__reactFiber$'));
  for (let f = llave ? nodo[llave] : null; f; f = f.return) {
    const v = f.memoizedProps && f.memoizedProps.value;
    if (v && v.materia && Array.isArray(v.materia.QUESTIONS)) {
      const Q = v.materia.QUESTIONS;
      let quitadas = 0;
      for (let i = Q.length - 1; i >= 0; i--) {
        if (Q[i].topic === ${JSON.stringify(clave)}) { Q.splice(i, 1); quitadas++; }
      }
      return quitadas;
    }
  }
  return -1;
`);

async function temaSinPreguntasV8(pagina, base, t) {
  const E = esperado(PLAN);
  const conPreguntas = QUESTIONS.filter((q) => q.topic === TEMA_V8).length;
  t.ok(`V8: «${TEMA_V8}» tiene preguntas en el banco y no tiene respuestas sembradas`,
    conPreguntas > 0 && !(TEMA_V8 in PLAN), true);
  let quitadas = null;
  t.ok('V8: abrió Estadísticas con un tema sin preguntas', await abrirStats(pagina, base, {
    antes: async () => { quitadas = await pagina.evaluar(VACIAR_TEMA(TEMA_V8)); },
  }), true);
  t.ok(`V8: se quitaron las preguntas del tema «${TEMA_V8}» del banco cargado`, quitadas, conPreguntas);
  const m = await leer(pagina);
  const claves = m.filas.filter(Boolean).map((f) => f.clave);
  t.ok('V8: el tema sin preguntas no tiene fila', m.filas[Object.keys(TOPICS).indexOf(TEMA_V8)], null);
  t.ok('V8: los demás temas con preguntas conservan su fila y el orden',
    claves.join('|'), E.filas.map((f) => f.k).filter((k) => k !== TEMA_V8).join('|'));
  t.ok('V8: la pantalla no nombra al tema sin preguntas',
    m.texto.toLowerCase().includes(TOPICS[TEMA_V8].toLowerCase()), false);
}

// ---------------------------------------------------------------------------
// 5 · Estados K del único control de la pantalla («Practicar», K2) y tirar para actualizar.

async function estadosDeControl(pagina, base, t) {
  const T = plancha.claro;
  t.ok('abrió Estadísticas sin datos', await abrirStats(pagina, base, { plan: null, ancho: 1280, alto: 900 }), true);
  const leerBoton = () => pagina.evaluar(EN_MARCO(`
    const el = visibles('[data-testid="stats-practicar"]')[0];
    if (!el) return null;
    const caja = el.firstElementChild || el;
    const hoja = Array.from(el.querySelectorAll('*')).find((x) => x.children.length === 0 && x.textContent.trim());
    const c = w.getComputedStyle(el), k = w.getComputedStyle(caja);
    const r = el.getBoundingClientRect();
    return {
      rect: { x: r.left, y: r.top, ancho: r.width, alto: r.height },
      fondo: k.backgroundColor, borde: k.borderTopColor, bordeAncho: k.borderTopWidth,
      texto: hoja ? w.getComputedStyle(hoja).color : null,
      contorno: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor + ' ' + c.outlineOffset,
      foco: d.activeElement === el,
    };
  `));
  const sinContorno = (c) => c.startsWith('none') || c.includes(' 0px ');

  await pagina.moverA(1, 1);
  const reposo = await leerBoton();
  t.ok('K2 reposo: existe', reposo !== null, true);
  if (!reposo) return;
  t.ok('K2 reposo: fondo superficie, texto tinta y borde linea de 1 px',
    `${reposo.fondo}|${reposo.texto}|${reposo.borde}|${reposo.bordeAncho}`,
    `${rgb(T.superficie)}|${rgb(T.tinta)}|${rgb(T.linea)}|1px`);
  t.ok('K2 reposo: sin contorno', sinContorno(reposo.contorno), true);
  t.ok('K2: mide 44 × 44 como mínimo', reposo.rect.ancho >= LADO_TACTIL && reposo.rect.alto >= LADO_TACTIL, true);

  const cx = Math.round(reposo.rect.x + reposo.rect.ancho / 2);
  const cy = Math.round(reposo.rect.y + reposo.rect.alto / 2);
  await pagina.moverA(cx, cy);
  const hover = await leerBoton();
  t.ok('K2 hover: contorno linea de 1 px, sin mover el layout',
    `${hover.contorno}|${hover.rect.x === reposo.rect.x && hover.rect.y === reposo.rect.y}`,
    `solid 1px ${rgb(T.linea)} 0px|true`);
  await pagina.moverA(1, 1);

  // Presionado: botón abajo sin soltar. react-native-web atiende el responder sobre eventos
  // de mouse del documento; se suelta fuera del botón para no disparar `onPress`.
  await pagina.evaluar(EN_MARCO(`
    const el = visibles('[data-testid="stats-practicar"]')[0];
    const o = { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 1, clientX: ${cx}, clientY: ${cy}, view: w };
    el.dispatchEvent(new w.MouseEvent('mousedown', o));
  `));
  await new Promise((r) => setTimeout(r, 150));
  const presionado = await leerBoton();
  t.ok('K2 presionado: inversión (fondo tinta, texto fondo, borde tinta)',
    `${presionado.fondo}|${presionado.texto}|${presionado.borde}`,
    `${rgb(T.tinta)}|${rgb(T.fondo)}|${rgb(T.tinta)}`);
  await pagina.evaluar(EN_MARCO(`
    d.dispatchEvent(new w.MouseEvent('mouseup', { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 0, clientX: 1, clientY: 1, view: w }));
  `));
  await pagina.moverA(1, 1);

  // Foco por teclado: contorno foco de 2 px separado paso 0.5.
  await pagina.evaluar(EN_MARCO(`m.contentWindow.focus(); if (d.activeElement && d.activeElement.blur) d.activeElement.blur();`));
  let enfocado = false;
  for (let i = 0; i < 12 && !enfocado; i++) {
    await pagina.tecla('Tab');
    enfocado = (await leerBoton()).foco;
  }
  t.ok('K2 foco: Tab llega a «Practicar»', enfocado, true);
  if (enfocado) {
    const foco = await leerBoton();
    t.ok('K2 foco: contorno foco de 2 px separado paso 0.5',
      foco.contorno, `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);
    await pagina.moverA(cx, cy);
    t.ok('K2 foco y hover: gana el foco, un solo contorno',
      (await leerBoton()).contorno, `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);
    await pagina.moverA(1, 1);
    // Enter sobre el botón enfocado: un solo gesto.
    await pagina.tecla('Enter');
    t.ok('K2: Enter sobre «Practicar» navega a /temas/practice',
      await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/temas/practice'), true);
  }
}

// ---------------------------------------------------------------------------
// 6 · Sin scroll horizontal, 44 × 44 y una sola columna, en claro y oscuro.

async function sinDesbordeNiCortes(pagina, base, t) {
  for (const oscuro of [false, true]) {
    const tema = oscuro ? 'oscuro' : 'claro';
    for (const ancho of [320, 360, 390, 768, 1280]) {
      for (const [estado, plan] of [['con datos', PLAN], ['vacío', null]]) {
        // El vacío alcanza con los extremos.
        if (plan === null && ancho !== 320 && ancho !== 1280) continue;
        const cuando = `${estado} ${ancho} px ${tema}`;
        if (!await abrirStats(pagina, base, { ancho, plan, oscuro })) {
          t.ok(`${cuando}: abrió Estadísticas`, false, true);
          continue;
        }
        const m = await leer(pagina);
        t.ok(`${cuando}: sin scroll horizontal`, m.desborda, false);
        const chicos = m.interactivos.filter((c) => c.ancho > 0 && (c.alto < LADO_TACTIL || c.ancho < LADO_TACTIL));
        t.ok(`${cuando}: ningún control baja de 44 × 44`, chicos.length, 0);
        const ref = (m.global || m.vacio).caja;
        // Desde el corte `escritorio` rigen las regiones de ESC-P7 y ESC-P12: las mide la suite de escritorio.
        if (ancho < CORTE_ESCRITORIO) {
          t.ok(`${cuando}: la lámina conserva el margen lateral paso 5 o la columna`,
            ancho >= 768
              ? ref.ancho <= COLUMNA + 1 && Math.abs((ref.izq + ref.der) / 2 - m.vista / 2) <= 1.5
              : Math.abs(ref.izq - MARGEN_LATERAL) <= 1 && Math.abs(m.vista - ref.der - MARGEN_LATERAL) <= 1, true);
        }
        if (plan !== null) {
          const filas = m.filas.filter(Boolean);
          t.ok(`${cuando}: las filas llenan la columna y no se salen`,
            filas.every((f) => f.caja.izq >= 0 && f.caja.der <= m.vista + 0.5), true);
          // Las marcas de umbral siguen en el 60 % y el 80 % del ancho de la barra (a.5).
          const f = filas.find((x) => x.barra && x.u60 && x.u80);
          const interior = f ? f.barra.ancho - 2 : 0;
          t.ok(`${cuando}: marcas de umbral en el 60% y el 80% de la barra`,
            !!f && Math.abs((f.u60.izq + f.u60.der) / 2 - (f.barra.izq + 1 + 0.6 * interior)) <= 1.5
              && Math.abs((f.u80.izq + f.u80.der) / 2 - (f.barra.izq + 1 + 0.8 * interior)) <= 1.5, true);
          const v = m.falladas[0];
          t.ok(`${cuando}: en «Más falladas» «#{n}» y el valor conservan su lugar`,
            !!v && !!v.indice && !!v.valor && v.valor.caja.der <= m.vista && v.indice.caja.izq >= 0, true);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 7 · Componente nuevo de 2.9: paso `rotulo-medio` de MarcaEstado (decisión del coordinador).

async function pasoRotuloMedio(pagina, base, t) {
  const T = plancha.claro;
  t.ok('abrió Estadísticas con datos', await abrirStats(pagina, base, {}), true);
  const f = (await leer(pagina)).falladas[0];
  t.ok('MarcaEstado paso rotulo-medio: Plex Mono 500, 11 px, mayúsculas, glifo chico',
    f && f.valor && `${f.valor.familia}|${f.valor.tamano}|${f.valor.mayusculas}|${f.valor.lado}`,
    'PlexMono-Medium|11px|uppercase|16');
  t.ok('MarcaEstado paso rotulo-medio: el texto lleva el color del estado',
    f && f.valor && f.valor.color, rgb(T[banda(Math.round((PLAN['division-celular'][1] / PLAN['division-celular'][0]) * 100))]));
}

// ---------------------------------------------------------------------------
// 8 · Escritorio (ESC-P7 y ESC-P12): regiones, anchos y columnas desde el corte `escritorio`.

const DOM_STATS = EN_MARCO(`
  return visibles('[data-testid^="stats-"]').map((n) => n.getAttribute('data-testid')).filter((id) =>
    id === 'stats-global' || id === 'stats-rotulo-por-tema' || id === 'stats-leyenda'
    || id.startsWith('stats-fila-') || id === 'stats-rotulo-falladas' || /^stats-fallada-[0-9]+$/.test(id));
`);

// Capturas de evidencia (solo con PKAPP_CAPTURAS): el viewport de la página ya es el del marco.
async function capturar(pagina, nombre) {
  if (!process.env.PKAPP_CAPTURAS) return;
  const dir = path.join(RAIZ, 'openspec', 'changes', 'rediseno-plancha', 'evidencia', 'despues', '3.11g');
  fs.mkdirSync(dir, { recursive: true });
  await new Promise((r) => setTimeout(r, 400));
  const r = await pagina.enviar('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(dir, nombre), Buffer.from(r.data, 'base64'));
}

const distintos = (xs) => [...new Set(xs.map((x) => Math.round(x)))].sort((a, b) => a - b);
const TAMANOS = [[1023, 768], [1024, 768], [1366, 768], [1920, 1080]];

async function escritorioConDatos(pagina, base, t) {
  const E = esperado(PLAN);
  const esperadoDom = ['stats-global', 'stats-rotulo-por-tema', 'stats-leyenda',
    ...E.filas.map((f) => `stats-fila-${f.k}`), 'stats-rotulo-falladas',
    ...E.falladas.map((_, i) => `stats-fallada-${i + 1}`)];
  for (const oscuro of [false, true]) {
    for (const [ancho, alto] of TAMANOS) {
      const cuando = `${ancho} px ${oscuro ? 'oscuro' : 'claro'}`;
      if (!await abrirStats(pagina, base, { ancho, alto, oscuro })) { t.ok(`${cuando}: abrió Estadísticas`, false, true); continue; }
      const m = await leer(pagina);
      if (ancho >= CORTE_ESCRITORIO) await capturar(pagina, `E07-${ancho}-${oscuro ? 'oscuro' : 'claro'}.png`);
      const filas = m.filas.filter(Boolean);
      const g = m.global;
      const l = m.leyenda;
      const rf = m.rotuloFalladas;
      t.ok(`${cuando}: sin scroll horizontal`, m.desborda, false);
      t.ok(`${cuando}: ningún control baja de 44 × 44`,
        m.interactivos.filter((c) => c.ancho > 0 && (c.alto < LADO_TACTIL || c.ancho < LADO_TACTIL)).length, 0);
      t.ok(`${cuando}: orden de DOM = orden de lectura (tarjeta, «Por tema», leyenda, filas, falladas)`,
        (await pagina.evaluar(DOM_STATS)).join('|'), esperadoDom.join('|'));
      if (!g || !l || !rf || filas.length === 0 || m.falladas.length === 0) { t.ok(`${cuando}: hay regiones`, false, true); continue; }

      if (ancho < CORTE_ESCRITORIO) {
        // Bajo el corte nada cambia: la columna única de siempre.
        t.ok(`${cuando}: una columna, centrada y de ${COLUMNA} px como máximo`,
          g.caja.ancho <= COLUMNA + 1 && Math.abs((g.caja.izq + g.caja.der) / 2 - m.vista / 2) <= 1.5, true);
        t.ok(`${cuando}: tarjeta, leyenda y filas apiladas`,
          g.caja.abajo <= l.caja.arriba && l.caja.abajo <= filas[0].caja.arriba, true);
        t.ok(`${cuando}: filas y falladas en una sola columna`,
          distintos(filas.map((f) => f.caja.izq)).length === 1 && distintos(m.falladas.map((f) => f.caja.izq)).length === 1, true);
        continue;
      }

      const amplio = ancho >= CORTE_AMPLIO;
      const hoja = amplio ? HOJA_AMPLIA : HOJA;
      const izqHoja = (m.vista - hoja) / 2;
      const derHoja = izqHoja + hoja;
      t.ok(`${cuando}: la tarjeta global parte del borde izquierdo de la hoja (${hoja} px)`, Math.abs(g.caja.izq - izqHoja) <= 1.5, true);
      t.ok(`${cuando}: región lateral de ancho ${LATERAL}`, Math.abs(g.caja.ancho - LATERAL) <= 1, true);
      t.ok(`${cuando}: la leyenda cabe en el ancho lateral, en una línea`,
        l.items.every((i) => Math.abs(i.caja.arriba - l.items[0].caja.arriba) < 2) && l.caja.der <= g.caja.der + 0.5, true);
      t.ok(`${cuando}: rótulo «Por tema» y leyenda debajo de la tarjeta, en la región lateral`,
        g.caja.abajo <= m.rotuloPorTema.caja.arriba && m.rotuloPorTema.caja.abajo <= l.caja.arriba
          && Math.abs(m.rotuloPorTema.caja.izq - g.caja.izq) <= 1.5, true);

      // Región principal: a la derecha de la lateral, separada paso 8, alineada arriba.
      const izqFilas = Math.min(...filas.map((f) => f.caja.izq));
      t.ok(`${cuando}: filas a la derecha de la lateral, separadas paso 8`,
        Math.abs(izqFilas - (g.caja.der + MARGEN_HOJA)) <= 1.5, true);
      t.ok(`${cuando}: lateral y principal alineadas arriba`,
        Math.abs(g.caja.arriba - Math.min(...filas.map((f) => f.caja.arriba))) <= 1.5, true);
      t.ok(`${cuando}: las filas no pasan del borde derecho de la hoja`,
        Math.max(...filas.map((f) => f.caja.der)) <= derHoja + 0.5, true);

      // Filas por tema: una columna en `escritorio`, dos con flujo por columnas desde `amplio`.
      const colsFilas = distintos(filas.map((f) => f.caja.izq));
      t.ok(`${cuando}: filas por tema en ${amplio ? 2 : 1} columna(s)`, colsFilas.length, amplio ? 2 : 1);
      if (amplio) {
        const enPrimera = filas.filter((f) => Math.round(f.caja.izq) === colsFilas[0]).length;
        t.ok(`${cuando}: el flujo baja por la primera columna y sigue por la segunda (orden de TOPICS)`,
          filas.every((f, i) => Math.round(f.caja.izq) === colsFilas[i < enPrimera ? 0 : 1]), true);
        // CSS balancea por alto, no por cantidad: la diferencia no pasa de la fila más alta.
        const altoDe = (i) => filas.filter((f) => Math.round(f.caja.izq) === colsFilas[i]).reduce((s, f) => s + f.caja.alto, 0);
        t.ok(`${cuando}: las dos columnas quedan balanceadas por alto (a lo sumo una fila de diferencia)`,
          Math.abs(altoDe(0) - altoDe(1)) <= Math.max(...filas.map((f) => f.caja.alto)) + 1, true);
        t.ok(`${cuando}: marcas de umbral en el 60% y el 80% de la barra`, (() => {
          const f = filas.find((x) => x.barra && x.u60 && x.u80);
          const i = f ? f.barra.ancho - 2 : 0;
          return !!f && Math.abs((f.u60.izq + f.u60.der) / 2 - (f.barra.izq + 1 + 0.6 * i)) <= 1.5
            && Math.abs((f.u80.izq + f.u80.der) / 2 - (f.barra.izq + 1 + 0.8 * i)) <= 1.5;
        })(), true);
      } else {
        t.ok(`${cuando}: filas en orden de TOPICS, de arriba hacia abajo`,
          filas.every((f, i) => i === 0 || f.caja.arriba > filas[i - 1].caja.arriba), true);
      }

      // Hueco entre columnas de las listas de filas: paso 8 (aviso del Ingeniero; `FlujoColumnas`, 3.11a).
      const hueco = (cajas, cols) => cols.slice(1).map((x, k) =>
        x - Math.max(...cajas.filter((c) => Math.round(c.izq) === cols[k]).map((c) => c.der)));
      if (amplio) {
        t.ok(`${cuando}: filas por tema separadas paso 8 (32 px) entre columnas`,
          hueco(filas.map((f) => f.caja), colsFilas).every((h) => Math.abs(h - MARGEN_HOJA) <= 1.5), true);
      }

      // «Más falladas»: debajo, a ancho de hoja, 2 columnas (3 desde `amplio`) con flujo por columnas.
      t.ok(`${cuando}: «Más falladas» debajo de las filas y de la región lateral`,
        rf.caja.arriba >= Math.max(...filas.map((f) => f.caja.abajo)) && rf.caja.arriba >= l.caja.abajo, true);
      t.ok(`${cuando}: «Más falladas» parte del borde izquierdo de la hoja`, Math.abs(rf.caja.izq - izqHoja) <= 1.5, true);
      const colsF = distintos(m.falladas.map((f) => f.caja.izq));
      const nCols = amplio ? 3 : 2;
      t.ok(`${cuando}: falladas en ${nCols} columnas`, colsF.length, nCols);
      t.ok(`${cuando}: la primera columna de falladas parte del borde izquierdo de la hoja`, Math.abs(colsF[0] - izqHoja) <= 1.5, true);
      t.ok(`${cuando}: las falladas no pasan del borde derecho de la hoja`,
        Math.max(...m.falladas.map((f) => f.caja.der)) <= derHoja + 0.5, true);
      t.ok(`${cuando}: falladas separadas paso 8 (32 px) entre columnas`,
        hueco(m.falladas.map((f) => f.caja), colsF).every((h) => Math.abs(h - MARGEN_HOJA) <= 1.5), true);
      const colDe = (f) => colsF.indexOf(Math.round(f.caja.izq));
      t.ok(`${cuando}: flujo por columnas: el índice de columna no baja al recorrer #1 a #${m.falladas.length}`,
        m.falladas.every((f, i) => i === 0 || colDe(f) >= colDe(m.falladas[i - 1])), true);
      t.ok(`${cuando}: enunciado a dos líneas como máximo y filete de 1 px`,
        m.falladas.every((f) => f.enunciado.caja.alto <= 2 * 22 + 0.5 && f.fileteAncho === '1px'), true);

      // «Más falladas» a la vista: la pantalla se desplaza hasta el rótulo y se captura así
      // (la captura de arriba es el viewport sin desplazar, donde las falladas quedan fuera).
      const vista = await pagina.evaluar(PAGINA(`
        const r = visibles('[data-testid="stats-rotulo-falladas"]')[0];
        r.scrollIntoView({ block: 'start' });
        const a = r.getBoundingClientRect();
        const cols = visibles('[data-testid^="stats-fallada-"]').filter((n) => /^stats-fallada-[0-9]+$/.test(n.getAttribute('data-testid')))
          .filter((n) => { const b = n.getBoundingClientRect(); return b.top >= 0 && b.bottom <= w.innerHeight; });
        return { rotulo: a.top >= 0 && a.bottom <= w.innerHeight,
          columnas: new Set(cols.map((n) => Math.round(n.getBoundingClientRect().left))).size };
      `));
      t.ok(`${cuando}: al desplazar, «Más falladas» queda a la vista en ${nCols} columnas`,
        !!vista && vista.rotulo && vista.columnas === nCols, true);
      await capturar(pagina, `E07-${ancho}-${oscuro ? 'oscuro' : 'claro'}-falladas.png`);
      await pagina.evaluar(PAGINA('raiz.scrollTop = 0;'));
    }
  }
}

async function escritorioVacio(pagina, base, t) {
  for (const oscuro of [false, true]) {
    for (const [ancho, alto] of TAMANOS) {
      const cuando = `vacío ${ancho} px ${oscuro ? 'oscuro' : 'claro'}`;
      if (!await abrirStats(pagina, base, { ancho, alto, oscuro, plan: null })) { t.ok(`${cuando}: abrió Estadísticas`, false, true); continue; }
      const m = await leer(pagina);
      if (ancho >= CORTE_ESCRITORIO) await capturar(pagina, `E10-${ancho}-${oscuro ? 'oscuro' : 'claro'}.png`);
      const v = m.vacio;
      t.ok(`${cuando}: sin scroll horizontal`, m.desborda, false);
      if (!v) { t.ok(`${cuando}: hay lámina vacía`, false, true); continue; }
      t.ok(`${cuando}: V1 con sus cuatro marcas de esquina`, v.marcas, 4);
      t.ok(`${cuando}: V1 centrada y anclada arriba`,
        Math.abs((v.caja.izq + v.caja.der) / 2 - m.vista / 2) <= 1.5 && v.caja.arriba < 160, true);
      if (ancho >= CORTE_ESCRITORIO) {
        t.ok(`${cuando}: la lámina mide ${LECTURA} px (tope \`lectura\`), no se estira a la hoja`,
          Math.abs(v.caja.ancho - LECTURA) <= 1, true);
      } else {
        t.ok(`${cuando}: la lámina conserva la columna (${COLUMNA} px como máximo)`, v.caja.ancho <= COLUMNA + 1, true);
      }
      t.ok(`${cuando}: «Practicar» de 44 × 44 como mínimo`,
        !!m.practicar && m.practicar.caja.alto >= LADO_TACTIL && m.practicar.caja.ancho >= LADO_TACTIL, true);
    }
  }
}

// ---------------------------------------------------------------------------
// 8 bis · Anclado, recorte de foco y orden de Tab contra el orden visual medido
// (lecciones de los análisis 3.11: `comun.md` §7.2).

// Todo en coordenadas de la PÁGINA (relativas al origen del contenido desplazable, no a la
// ventana): `raiz` es el ancestro que desplaza la pantalla (el `ScrollView`).
const PAGINA = (cuerpo) => EN_MARCO(`
  const ancla = visibles('[data-testid="stats-global"], [data-testid="stats-vacio"]')[0];
  let raiz = null;
  for (let p = ancla && ancla.parentElement; p && !raiz; p = p.parentElement) {
    const o = w.getComputedStyle(p).overflowY;
    if (o === 'auto' || o === 'scroll') raiz = p;
  }
  if (!raiz) return null;
  const rr = raiz.getBoundingClientRect();
  const pag = (n) => {
    const r = n.getBoundingClientRect();
    const dentro = raiz.contains(n);
    const ox = dentro ? rr.left - raiz.scrollLeft : 0, oy = dentro ? rr.top - raiz.scrollTop : -w.scrollY;
    return { izq: r.left - ox, der: r.right - ox, arriba: r.top - oy, abajo: r.bottom - oy };
  };
  const ident = (n) => n.getAttribute('data-testid') || n.getAttribute('aria-label') || n.tagName.toLowerCase();
  ${cuerpo}
`);

const IDS_ANCLADO = ['stats-global', 'stats-rotulo-por-tema', 'stats-leyenda', 'stats-rotulo-falladas',
  'stats-fallada-1'];

// Mide las regiones con la página en 0 y desplazada: ninguna debe moverse en la página.
const MEDIR_ANCLADO = PAGINA(`
  const ids = ${JSON.stringify(IDS_ANCLADO)}.concat(
    visibles('[data-testid^="stats-fila-"]').slice(0, 1).map((n) => n.getAttribute('data-testid')));
  const medir = () => ids.map((id) => {
    const n = visibles('[data-testid="' + id + '"]')[0];
    return { id, caja: n ? pag(n) : null };
  });
  raiz.scrollTop = 0;
  const reposo = medir();
  raiz.scrollTop = 400;
  const desplazado = medir();
  const aplicado = raiz.scrollTop;
  raiz.scrollTop = 0;
  return { reposo, desplazado, aplicado, maximo: raiz.scrollHeight - raiz.clientHeight };
`);

// Ancestros de cada pieza de la pantalla hasta la raíz de scroll (exclusive): ninguno puede
// recortar con `overflow` ni anclarse con `sticky`/`fixed`.
const MEDIR_ANCESTROS = PAGINA(`
  const ids = visibles('[data-testid^="stats-"]').map((n) => n.getAttribute('data-testid'))
    .filter((id) => !/^stats-(global-|fila-.+-|valor-|nombre-|barra-|relleno-|umbral-|detalle-|sin-practicar-|leyenda-.|fallada-(indice|valor|enunciado|tema)-)/.test(id));
  const malos = [];
  for (const id of ids) {
    const inicio = visibles('[data-testid="' + id + '"]')[0];
    for (let p = inicio; p && p !== raiz; p = p.parentElement) {
      const e = w.getComputedStyle(p);
      const clip = [e.overflowX, e.overflowY].some((v) => v !== 'visible');
      const ancla = e.position === 'sticky' || e.position === 'fixed';
      if (clip || ancla) malos.push(id + ' > ' + ident(p) + ': ' + (ancla ? e.position : e.overflowX + '/' + e.overflowY));
    }
  }
  return { piezas: ids.length, malos: Array.from(new Set(malos)) };
`);

// Controles enfocables dentro de la raíz: el contorno de foco (2 px + paso 0.5) no sale por
// ninguno de los cuatro bordes del área visible de la raíz (horizontal) ni de la página.
const MEDIR_CONTORNO = PAGINA(`
  const total = raiz.scrollHeight;
  const ctl = visibles('[tabindex="0"], [data-testid="stats-practicar"]').filter((n) => raiz.contains(n));
  return {
    n: ctl.length, ancho: raiz.clientWidth, alto: total,
    cajas: ctl.map((n) => ({ id: ident(n), caja: pag(n) })),
  };
`);

// Paradas de Tab reales, en orden, con sus coordenadas de página.
async function recorrerTab(pagina) {
  await pagina.evaluar(EN_MARCO(`m.contentWindow.focus(); if (d.activeElement && d.activeElement.blur) d.activeElement.blur();`));
  const paradas = [];
  for (let i = 0; i < 12; i++) {
    await pagina.tecla('Tab');
    const p = await pagina.evaluar(PAGINA(`
      const a = d.activeElement;
      if (!a || a === d.body || a === d.documentElement) return { fin: true };
      return { id: ident(a), enRaiz: raiz.contains(a), caja: pag(a) };
    `));
    if (!p || p.fin || paradas.some((x) => x.id === p.id)) break;
    paradas.push(p);
  }
  return paradas;
}

// ¿«b» queda antes que «a» en lectura visual? Misma columna: más arriba. Columnas distintas
// (sin solape horizontal): más a la izquierda. Es el orden por región, arriba-abajo e
// izquierda-derecha, medido sobre la página.
const hSolape = (a, b) => Math.min(a.der, b.der) - Math.max(a.izq, b.izq) > 1;
const antesVisual = (b, a) => (hSolape(a, b) ? b.abajo <= a.arriba + 1 : b.der <= a.izq + 1);
const retrocesos = (xs) => xs.slice(1)
  .map((x, i) => (antesVisual(x.caja, xs[i].caja) ? `${xs[i].id} → ${x.id}` : null)).filter(Boolean);

const LANDMARKS = PAGINA(`
  return visibles('[data-testid^="stats-"]').map((n) => ({ id: n.getAttribute('data-testid'), caja: pag(n) })).filter((x) =>
    x.id === 'stats-global' || x.id === 'stats-rotulo-por-tema' || x.id === 'stats-leyenda'
    || x.id.startsWith('stats-fila-') || x.id === 'stats-rotulo-falladas' || /^stats-fallada-[0-9]+$/.test(x.id)
    || x.id === 'stats-vacio' || x.id === 'stats-practicar');
`);

async function escritorioAnclaFocoYOrden(pagina, base, t) {
  for (const oscuro of [false, true]) {
    for (const [ancho, alto] of TAMANOS) {
      const cuando = `${ancho} px ${oscuro ? 'oscuro' : 'claro'}`;
      if (!await abrirStats(pagina, base, { ancho, alto, oscuro })) { t.ok(`${cuando}: abrió Estadísticas`, false, true); continue; }

      // Anclado: con la página desplazada ninguna región queda fija.
      const a = await pagina.evaluar(MEDIR_ANCLADO);
      t.ok(`${cuando}: la pantalla se desplaza (hay con qué medir el anclado)`, !!a && a.aplicado > 100, true);
      if (a) {
        const movidas = a.reposo.filter((r, i) => !r.caja || !a.desplazado[i].caja
          || Math.abs(r.caja.arriba - a.desplazado[i].caja.arriba) > 1
          || Math.abs(r.caja.izq - a.desplazado[i].caja.izq) > 1).map((r) => r.id);
        t.ok(`${cuando}: anclado: con la página desplazada ninguna región queda fija (sin sticky)`, movidas.join(','), '');
      }
      const anc = await pagina.evaluar(MEDIR_ANCESTROS);
      t.ok(`${cuando}: se revisaron las piezas de la pantalla`, !!anc && anc.piezas >= 20, true);
      t.ok(`${cuando}: ningún ancestro recorta con overflow ni se ancla (sticky/fixed)`, anc ? anc.malos.join(' ; ') : null, '');

      // Orden visual medido: el DOM de las piezas no retrocede en la página.
      const lm = await pagina.evaluar(LANDMARKS);
      t.ok(`${cuando}: orden de DOM = orden visual medido en la página, sin retrocesos`, lm ? retrocesos(lm).join(' ; ') : null, '');

      // Tab real: las paradas dentro de la pantalla no saltan hacia atrás en la página.
      const paradas = await recorrerTab(pagina);
      const enRaiz = paradas.filter((p) => p.enRaiz);
      t.ok(`${cuando}: la primera parada de Tab es «volver» de la barra interna (DOM = visual)`,
        paradas[0] && paradas[0].id, 'barra-volver');
      t.ok(`${cuando}: Tab dentro de la pantalla sigue el orden visual medido`, retrocesos(enRaiz).join(' ; '), '');
    }
  }
}

async function escritorioVacioFocoYOrden(pagina, base, t) {
  for (const oscuro of [false, true]) {
    for (const [ancho, alto] of TAMANOS) {
      const cuando = `vacío ${ancho} px ${oscuro ? 'oscuro' : 'claro'}`;
      if (!await abrirStats(pagina, base, { ancho, alto, oscuro, plan: null })) { t.ok(`${cuando}: abrió Estadísticas`, false, true); continue; }
      const anc = await pagina.evaluar(MEDIR_ANCESTROS);
      t.ok(`${cuando}: ningún ancestro de la lámina recorta con overflow ni se ancla`, anc ? anc.malos.join(' ; ') : null, '');
      const c = await pagina.evaluar(MEDIR_CONTORNO);
      t.ok(`${cuando}: «Practicar» está dentro de la pantalla desplazable`, !!c && c.n >= 1, true);
      if (c && c.n >= 1) {
        // Contorno: 2 px de trazo y paso 0.5 de separación; los cuatro bordes con margen libre.
        const borde = 2 + 0.5 * PASO;
        t.ok(`${cuando}: el contorno de foco no sale por los bordes de la pantalla`,
          c.cajas.every((x) => x.caja.izq - borde >= 0 && x.caja.der + borde <= c.ancho + 0.5
            && x.caja.arriba - borde >= 0 && x.caja.abajo + borde <= c.alto + 0.5), true);
      }
      const paradas = await recorrerTab(pagina);
      t.ok(`${cuando}: la primera parada de Tab es «volver» de la barra interna (DOM = visual)`,
        paradas[0] && paradas[0].id, 'barra-volver');
      t.ok(`${cuando}: Tab alcanza «Practicar»`, paradas.some((p) => p.id === 'stats-practicar'), true);
      t.ok(`${cuando}: Tab dentro de la pantalla sigue el orden visual medido`,
        retrocesos(paradas.filter((p) => p.enRaiz)).join(' ; '), '');
    }
  }
}

// ---------------------------------------------------------------------------
// 9 · Contenedor desplazable con datos (E-03): sigue enfocable y su foco se ve con el
// contorno de la Plancha (`foco`, 2 px, offset −2 px), solo con teclado.

const LEER_SCROLLER = EN_MARCO(`
  const el = visibles('[data-testid="stats-scroller"]')[0];
  if (!el) return null;
  const c = w.getComputedStyle(el), r = el.getBoundingClientRect();
  return {
    contorno: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor + ' ' + c.outlineOffset,
    foco: d.activeElement === el,
    izq: r.left, arriba: r.top, alto: r.height,
  };
`);

async function scrollerConFoco(pagina, base, t) {
  for (const [ancho, alto, oscuro] of [[1280, 900, false], [1280, 900, true], [390, 900, false], [390, 900, true]]) {
    const T = oscuro ? plancha.oscuro : plancha.claro;
    const cuando = `${ancho} ${oscuro ? 'oscuro' : 'claro'}`;
    if (!await abrirStats(pagina, base, { ancho, alto, oscuro })) {
      t.ok(`${cuando}: abrió Estadísticas`, false, true);
      continue;
    }
    const reposo = await pagina.evaluar(LEER_SCROLLER);
    t.ok(`E-03 ${cuando}: el contenedor desplazable existe`, reposo !== null, true);
    if (!reposo) continue;

    await pagina.evaluar(EN_MARCO(`m.contentWindow.focus(); if (d.activeElement && d.activeElement.blur) d.activeElement.blur();`));
    let enfocado = false;
    for (let i = 0; i < 12 && !enfocado; i++) {
      await pagina.tecla('Tab');
      enfocado = (await pagina.evaluar(LEER_SCROLLER)).foco;
    }
    t.ok(`E-03 ${cuando}: Tab llega al contenedor desplazable`, enfocado, true);
    if (enfocado) {
      t.ok(`E-03 ${cuando}: foco con teclado: contorno foco de 2 px y offset −2 px`,
        (await pagina.evaluar(LEER_SCROLLER)).contorno, `solid 2px ${rgb(T.foco)} -2px`);
    }

    // Foco por programa con `focusVisible: false` (el clic no enfoca este contenedor en
    // Chrome): es `:focus` pero no `:focus-visible`, sin contorno. Con `:focus` en la regla
    // aparecería el contorno.
    await pagina.evaluar(EN_MARCO(`
      const el = visibles('[data-testid="stats-scroller"]')[0];
      el.blur();
      el.focus({ focusVisible: false });
    `));
    const sinTeclado = await pagina.evaluar(LEER_SCROLLER);
    t.ok(`E-03 ${cuando}: enfocado sin ser \`:focus-visible\``, sinTeclado.foco, true);
    const sinContorno = sinTeclado.contorno.startsWith('none') || sinTeclado.contorno.includes(' 0px ');
    t.ok(`E-03 ${cuando}: foco sin teclado, sin contorno`, sinContorno ? 'sin contorno' : sinTeclado.contorno, 'sin contorno');
  }
}

async function restaurarPerfil(pagina, base, t) {
  await abrirMarco(pagina, base, 390);
  await escribirClave(pagina, previo === undefined ? null : previo);
  t.ok('el perfil queda como estaba', await leerClave(pagina), previo === undefined ? null : previo);
}

module.exports = [
  { nombre: 'Estadísticas: filas por tema, bandas, barras y marcas de umbral', correr: filasPorBanda },
  { nombre: 'Estadísticas: tarjeta global, rótulo «Por tema» y leyenda de bandas', correr: tarjetaGlobalYLeyenda },
  { nombre: 'Estadísticas: «Más falladas» con hasta 10 y su valor', correr: masFalladas },
  { nombre: 'Estadísticas: V1 con «Practicar» y VAC-P4', correr: vacioV1 },
  { nombre: 'Estadísticas: sin parpadeo del estado vacío durante la carga', correr: sinParpadeoDeVacio },
  { nombre: 'Estadísticas: V6 y V7', correr: ausenciasV6yV7 },
  { nombre: 'Estadísticas: V8, tema sin preguntas', correr: temaSinPreguntasV8 },
  { nombre: 'Estadísticas: estados K2 de «Practicar»', correr: estadosDeControl },
  { nombre: 'Estadísticas: sin desborde y 44 × 44 en claro y oscuro', correr: sinDesbordeNiCortes },
  { nombre: 'MarcaEstado: paso rotulo-medio', correr: pasoRotuloMedio },
  { nombre: 'Estadísticas: escritorio, regiones y columnas (ESC-P7)', correr: escritorioConDatos },
  { nombre: 'Estadísticas: escritorio, estado vacío en `lectura` (ESC-P12)', correr: escritorioVacio },
  { nombre: 'Estadísticas: escritorio, anclado, recorte de foco y orden de Tab con datos', correr: escritorioAnclaFocoYOrden },
  { nombre: 'Estadísticas: escritorio, foco y orden de Tab en el estado vacío', correr: escritorioVacioFocoYOrden },
  { nombre: 'Estadísticas: foco del contenedor desplazable con datos (E-03)', correr: scrollerConFoco },
  { nombre: 'Estadísticas: restaura el perfil', correr: restaurarPerfil },
];

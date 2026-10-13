// Suite «quiz» del arnés end-to-end (ver ../README.md).

const { plancha } = require('../../../src/theme/colores');
const { GLIFOS } = require('../../../src/assets/glifos');
const { abrirPagina, conectarNavegador } = require('../cdp');
const { EN_MARCO, LADO_TACTIL, MATERIA, PASO, TITULO_DEL_QUIZ, abrirMarco, cerrarNota, clicEnMarco, entrarAMateria } = require('./comunes');

// La «X» ya no es un carácter: es `glifo-cerrar` con el nombre accesible «Salir»
// (Quiz.md e). Se la ubica por ese nombre.
const SALIR = '[aria-label="Salir"]';

async function clicSalir(pagina) {
  const punto = await pagina.evaluar(`(function () {
    const n = Array.from(document.querySelectorAll(${JSON.stringify(SALIR)})).find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  })()`);
  if (!punto) return false;
  await pagina.clicEn(punto.x, punto.y);
  return true;
}

async function irAlQuizDeExamen(pagina) {
  await pagina.clic('Modo examen');
  await pagina.esperarUrl('/temas/exam');
  await pagina.clic('Comenzar examen');
  return pagina.esperarUrl('/quiz');
}

// ---------------------------------------------------------------------------

async function confirmarAlSalirDelQuiz(pagina, base, t) {
  await entrarAMateria(pagina, base);
  t.ok('el quiz tiene su propia URL', await irAlQuizDeExamen(pagina), true);

  pagina.dialogos.length = 0;

  // Atrás del navegador + cancelar: se queda en el quiz, y la URL vuelve.
  pagina.respuestaDialogo = 'cancelar';
  await pagina.evaluar('history.back()');
  t.ok('el atrás durante el quiz pide confirmación',
    await pagina.esperarA(() => pagina.dialogos.length === 1), true);
  t.ok('al cancelar la URL sigue en /quiz', await pagina.esperarUrl('/quiz'), true);
  t.ok('al cancelar seguimos viendo el quiz',
    (await pagina.texto(400)).includes('/'), true);

  // Atrás del navegador + aceptar: sale.
  pagina.respuestaDialogo = 'aceptar';
  await pagina.evaluar('history.back()');
  t.ok('el segundo atrás vuelve a preguntar',
    await pagina.esperarA(() => pagina.dialogos.length === 2), true);
  t.ok('al aceptar sale del quiz', await pagina.esperarUrl('/temas/exam'), true);
}

async function laXDelQuizPreguntaUnaVez(pagina, base, t) {
  await entrarAMateria(pagina, base);
  await irAlQuizDeExamen(pagina);

  pagina.dialogos.length = 0;
  pagina.respuestaDialogo = 'cancelar';
  await clicSalir(pagina);
  await pagina.esperarA(() => pagina.dialogos.length >= 1);
  t.ok('la X pregunta una sola vez', pagina.dialogos.length, 1);
  t.ok('al cancelar sigue en el quiz', await pagina.url(), '/quiz');

  pagina.respuestaDialogo = 'aceptar';
  await clicSalir(pagina);
  t.ok('la X con aceptar lleva a /inicio', await pagina.esperarUrl('/inicio'), true);
}

// Examen simulado completo de una materia sin parciales (dre, ryd). El banco
// es un chunk aparte: tiene que aparecer recién al elegir la materia.
const recursosJs = `performance.getEntriesByType('resource').map((r) => r.name).filter((n) => /\\.js(\\?|$)/.test(n))`;

function suiteExamenSinParciales(nombre, total) {
  return async function (pagina, base, t) {
    await pagina.ir(base + '/');
    await pagina.esperarTexto('Tus materias');
    await cerrarNota(pagina);
    const antes = await pagina.evaluar(recursosJs);

    await pagina.clic(nombre);
    t.ok(`${nombre}: elegir la materia lleva a /inicio`, await pagina.esperarUrl('/inicio'), true);
    const despues = await pagina.evaluar(recursosJs);
    t.ok(`${nombre}: el banco se baja recién al elegirla (JS nuevo)`,
      despues.some((n) => !antes.includes(n)), true);

    await pagina.clic('Modo examen');
    t.ok(`${nombre}: modo examen`, await pagina.esperarUrl('/temas/exam'), true);
    // El texto se muestra en mayúsculas por CSS: se compara sin distinguir caso.
    t.ok(`${nombre}: sin filtro de parcial`,
      (await pagina.evaluar('document.body.innerText')).toLowerCase().includes('parcial:'), false);

    await pagina.clic('Comenzar examen');
    t.ok(`${nombre}: el quiz arrancó`, await pagina.esperarUrl('/quiz'), true);
    t.ok(`${nombre}: el examen tiene ${total} preguntas`,
      await pagina.esperarTexto(`01 / ${total}`), true);

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
    t.ok(`${nombre}: completar el examen lleva a /resultados`,
      await pagina.esperarUrl('/resultados'), true);
  };
}

// ---------------------------------------------------------------------------
// HeaderMarca y control «Claro | Oscuro» (rediseño Plancha, tarea 3.1).
//
// El viewport de `pagina` es fijo (cdp.js no lo expone), así que estas suites
// abren la app dentro de un iframe del ancho pedido: los media queries y
// `useWindowDimensions` miden el iframe, no la ventana de Chrome.

async function quizSinBarraYAtrasConfirma(pagina, base, t) {
  await entrarAMateria(pagina, base);
  t.ok('el quiz tiene su propia URL', await irAlQuizDeExamen(pagina), true);

  const visibleBarra = await pagina.evaluar(`Array.from(
    document.querySelectorAll('[data-testid="barra-interna"]')).some((n) => {
      const r = n.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    })`);
  t.ok('el quiz no muestra la barra interna del Stack', visibleBarra, false);
  t.ok('el quiz no muestra el título del Stack',
    (await pagina.evaluar('document.body.innerText')).includes(TITULO_DEL_QUIZ), false);

  pagina.dialogos.length = 0;
  pagina.respuestaDialogo = 'cancelar';
  await pagina.evaluar('history.back()');
  t.ok('el atrás del navegador desde el quiz sigue pidiendo confirmación',
    await pagina.esperarA(() => pagina.dialogos.length === 1), true);
  t.ok('al cancelar sigue en /quiz', await pagina.esperarUrl('/quiz'), true);
}

// ===========================================================================
// QuizScreen en la Plancha (tarea 3.5): barra propia, progreso, opciones con
// marca de estado, nota, reporte, temporizador y examen en curso (EXA-P1).
// Fichas: diseno/pantallas/Quiz.md y ExamenEnCurso.md.
// ===========================================================================

const PUERTO_CDP = Number(process.env.PKAPP_PUERTO_CDP || process.env.E2E_PUERTO_CDP || 9222);

const NOMBRE = {
  bcyt: MATERIA,
  dre: 'Digestivo, Renal y Endócrino',
  ryd: 'Reproductor y Desarrollo',
};

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
const TRANSPARENTE = 'rgba(0, 0, 0, 0)';
const sel = (id) => `[data-testid="${id}"]`;
const EMOJI = /[\p{Extended_Pictographic}✕✓✗→⏱]/u;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// Lee de la pantalla (dentro del iframe) un elemento por selector: su caja, la de su
// contenedor interno (el primer hijo, donde las clases de control ponen fondo y borde),
// el color de su primer texto, su contorno y sus atributos accesibles.
const LEER = (s) => EN_MARCO(`
  const el = visibles(${JSON.stringify(s)})[0];
  if (!el) return null;
  const caja = el.firstElementChild || el;
  const c = w.getComputedStyle(el), k = w.getComputedStyle(caja), r = el.getBoundingClientRect();
  const hoja = (() => {
    const it = d.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = it.nextNode())) if (t.textContent.trim()) return t.parentElement;
    return null;
  })();
  const svg = el.querySelector('svg');
  return {
    rect: { x: r.left, y: r.top, ancho: r.width, alto: r.height },
    texto: (el.innerText || '').replace(/\\s+/g, ' ').trim(),
    fondo: k.backgroundColor, borde: k.borderTopColor, bordeAncho: k.borderTopWidth,
    bordeInf: k.borderBottomColor, bordeInfAncho: k.borderBottomWidth,
    fondoEl: c.backgroundColor, bordeEl: c.borderTopColor, bordeElAncho: c.borderTopWidth,
    bordeElInf: c.borderBottomColor, bordeElInfAncho: c.borderBottomWidth,
    textoColor: hoja ? w.getComputedStyle(hoja).color : null,
    familia: hoja ? w.getComputedStyle(hoja).fontFamily.split(',')[0].replace(/["']/g, '').trim() : null,
    opacidad: c.opacity,
    glifo: svg ? svg.getAttribute('stroke') : null,
    contorno: { estilo: c.outlineStyle, ancho: c.outlineWidth, color: c.outlineColor, sep: c.outlineOffset },
    nombre: el.getAttribute('aria-label'),
    presionado: el.getAttribute('aria-pressed'),
    foco: d.activeElement === el,
  };
`);

// «Reportar pregunta» (K7, REV-3): sin marco en la caja ni en el contenedor, texto Plex Sans 400/15 en
// `tinta`, centrado en la columna y de 44 de alto como mínimo, con `glifo-reportar` delante (separado
// `paso 2`, trazo `tinta`) y relleno horizontal `paso 4` entre el borde del botón y su contenido.
const LEER_REPORTAR = EN_MARCO(`
  const el = visibles('[data-testid="boton-reportar"]')[0];
  const enun = visibles('[data-testid="enunciado-quiz"]')[0];
  if (!el) return null;
  const caja = el.firstElementChild || el;
  const lados = (n) => ['Top', 'Right', 'Bottom', 'Left'].map((l) => w.getComputedStyle(n)['border' + l + 'Width']);
  const hoja = (() => {
    const it = d.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = it.nextNode())) if (t.textContent.trim()) return t.parentElement;
    return null;
  })();
  const r = el.getBoundingClientRect(), e = enun ? enun.getBoundingClientRect() : null;
  const h = hoja ? w.getComputedStyle(hoja) : null;
  const svg = el.querySelector('svg');
  const rs = svg ? svg.getBoundingClientRect() : null, rt = hoja ? hoja.getBoundingClientRect() : null;
  return {
    glifo: svg ? {
      primerD: svg.children[0] ? svg.children[0].getAttribute('d') : null,
      trazo: svg.getAttribute('stroke'),
      visible: !!rs && rs.width > 0 && rs.height > 0,
      delante: !!rs && !!rt && rs.right <= rt.left,
      separacion: rs && rt ? rt.left - rs.right : null,
      rellenoIzq: rs ? rs.left - r.left : null,
      rellenoDer: rt ? r.right - rt.right : null,
    } : null,
    bordes: lados(el).concat(lados(caja)).join(' '),
    peso: h && h.fontWeight, tamano: h && h.fontSize, color: h && h.color,
    alto: r.height, descentrado: e ? Math.abs((r.left + r.width / 2) - (e.left + e.width / 2)) : null,
  };
`);

async function reportarK7(ctx, nombre) {
  const { pagina, t, T } = ctx;
  await pagina.moverA(1, 1);
  await espera(150);
  const r = await pagina.evaluar(LEER_REPORTAR);
  t.ok(`${nombre}: «Reportar pregunta» sin borde en reposo (K7)`, r !== null && r.bordes, Array(8).fill('0px').join(' '));
  t.ok(`${nombre}: «Reportar pregunta» Plex Sans 400, 15 px, \`tinta\``,
    r !== null && `${r.peso} ${r.tamano} ${r.color}`, `400 15px ${rgb(T.tinta)}`);
  t.ok(`${nombre}: «Reportar pregunta» de 44 de alto como mínimo`, r !== null && r.alto >= LADO_TACTIL, true);
  t.ok(`${nombre}: «Reportar pregunta» centrado en la columna`, r !== null && r.descentrado !== null && r.descentrado <= 1, true);
  const g = r !== null ? r.glifo : null;
  t.ok(`${nombre}: «Reportar pregunta» lleva glifo-reportar`,
    !!g && g.visible && g.primerD === GLIFOS['glifo-reportar'].elementos[0].props.d, true);
  t.ok(`${nombre}: glifo-reportar delante del texto`, !!g && g.visible && g.delante, true);
  t.ok(`${nombre}: glifo-reportar con trazo \`tinta\``, !!g && g.trazo, T.tinta);
  t.ok(`${nombre}: separación glifo-texto \`paso 2\` (8 px)`,
    !!g && g.separacion !== null && Math.abs(g.separacion - 2 * PASO) <= 0.5, true);
  t.ok(`${nombre}: relleno horizontal \`paso 4\` (16 px)`,
    !!g && g.rellenoIzq !== null && g.rellenoDer !== null
      && Math.abs(g.rellenoIzq - 4 * PASO) <= 0.5 && Math.abs(g.rellenoDer - 4 * PASO) <= 0.5, true);
}

const CONTAR = (s) => EN_MARCO(`return visibles(${JSON.stringify(s)}).length;`);
const TEXTO = EN_MARCO('return d.body.innerText;');
const TEXTO_SIN_PREGUNTA = EN_MARCO(`
  const ocultos = Array.from(d.querySelectorAll('[data-testid="enunciado-quiz"], [data-testid^="opcion-quiz-"]'));
  const previos = ocultos.map((n) => n.style.display);
  ocultos.forEach((n) => { n.style.display = 'none'; });
  const texto = d.body.innerText;
  ocultos.forEach((n, i) => { n.style.display = previos[i]; });
  return texto;
`);
const DESBORDA = EN_MARCO('return desbordes().length;');
const RUTA = EN_MARCO('return w.location.pathname;');
const ESTA_OSCURO = EN_MARCO("return d.documentElement.classList.contains('dark');");

const PUNTO = (s) => EN_MARCO(`
  const n = visibles(${JSON.stringify(s)})[0];
  if (!n) return null;
  n.scrollIntoView({ block: 'center' });
  const r = n.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
`);

// Dos pasadas, como `pagina.clic`: la primera acomoda el scroll, la segunda mide.
async function tocar(pagina, s) {
  if (!await pagina.evaluar(PUNTO(s))) return false;
  await espera(150);
  const p = await pagina.evaluar(PUNTO(s));
  if (!p) return false;
  await pagina.clicEn(p.x, p.y);
  return true;
}

// Como `clicEnMarco`, pero acomoda el scroll antes: las materias de abajo de la lista
// quedan fuera del iframe de 800 px de alto.
const PUNTO_DE_TEXTO = (texto) => EN_MARCO(`
  const t = ${JSON.stringify(texto.toLowerCase())};
  const c = visibles('[tabindex]').filter((n) => (n.textContent || '').toLowerCase().includes(t));
  if (!c.length) return null;
  c.sort((a, b) => a.textContent.length - b.textContent.length);
  c[0].scrollIntoView({ block: 'center' });
  const r = c[0].getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
`);

async function tocarTexto(pagina, texto) {
  if (!await pagina.evaluar(PUNTO_DE_TEXTO(texto))) return false;
  await espera(150);
  const p = await pagina.evaluar(PUNTO_DE_TEXTO(texto));
  if (!p) return false;
  await pagina.clicEn(p.x, p.y);
  return true;
}

const esperarRuta = (pagina, ruta) => pagina.esperarA(async () => await pagina.evaluar(RUTA) === ruta);
const existe = async (pagina, s) => (await pagina.evaluar(CONTAR(s))) > 0;
const esperarExiste = (pagina, s, opts) => pagina.esperarA(() => existe(pagina, s), opts);

const MAS_TEMPORIZADOR = EN_MARCO(`
  const n = visibles('[tabindex]').find((x) => x.textContent.trim() === '+'
    || /^(más|mas|sumar|aumentar)/i.test(x.getAttribute('aria-label') || ''));
  if (!n) return null;
  n.scrollIntoView({ block: 'center' });
  const r = n.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
`);

// El estado presionado pide el botón del mouse abajo y sin soltar (`Input.dispatchMouseEvent`),
// que solo se puede enviar por la conexión que abrió la página: estas suites abren la suya
// (mismo Chrome y mismo perfil), como la de `componentes`.
function conNavegador(fn) {
  return async function (_paginaDelArnes, base, t) {
    const navegador = await conectarNavegador(PUERTO_CDP);
    const pagina = await abrirPagina(navegador, { ancho: 1300, alto: 1000 });
    try {
      await fn(pagina, base, t, navegador);
    } finally {
      await pagina.cerrar().catch(() => {});
      navegador.cerrar();
    }
  };
}

function limpiarAjustes(pagina) {
  return pagina.evaluar(`(function () {
    const a = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
    delete a.hide_feedback; delete a.tema;
    localStorage.setItem('pkapp_settings', JSON.stringify(a));
  })()`);
}

// Abre la app dentro de un iframe del ancho pedido y llega al quiz del examen de la
// materia. `ocultar` activa «Ocultar resultado hasta el final»; `temporizador` suma un paso
// al temporizador y deja el reloj del iframe controlable (`w.__ticks`): con él, el reloj
// real no corre y solo avanzan los ticks que da la prueba. `semilla` fija `Math.random` del
// iframe antes de armar el examen: sale siempre el mismo orden de preguntas.
async function entrarAlQuiz(pagina, base, {
  ancho = 390, alto = 800, materia = MATERIA, oscuro = false, ocultar = false, temporizador = false,
  semilla = null,
} = {}) {
  await limpiarAjustes(pagina).catch(() => {});
  await abrirMarco(pagina, base, ancho, alto);
  await limpiarAjustes(pagina);
  if (ocultar) {
    await pagina.evaluar(`(function () {
      const a = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
      a.hide_feedback = 'true';
      localStorage.setItem('pkapp_settings', JSON.stringify(a));
    })()`);
  }
  if (oscuro) {
    await clicEnMarco(pagina, 'oscuro');
    await pagina.esperarA(() => pagina.evaluar(ESTA_OSCURO));
  }
  await pagina.evaluar(EN_MARCO(`
    w.__ticks = [];
    const original = w.setInterval.bind(w);
    const congelar = ${JSON.stringify(temporizador)};
    w.setInterval = (f, ms, ...a) => {
      if (ms === 1000) { w.__ticks.push(f); if (congelar) return 0; }
      return original(f, ms, ...a);
    };
    const semilla = ${JSON.stringify(semilla)};
    if (semilla !== null) {
      let s = semilla >>> 0;
      w.Math.random = () => {
        s = (s + 0x6D2B79F5) >>> 0;
        let x = s;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      };
    }
  `));
  await tocarTexto(pagina, materia);
  if (!await esperarRuta(pagina, '/inicio')) return false;
  await tocarTexto(pagina, 'modo examen');
  if (!await esperarRuta(pagina, '/temas/exam')) return false;
  if (temporizador) {
    const p = await pagina.evaluar(MAS_TEMPORIZADOR);
    if (!p) return false;
    await pagina.clicEn(p.x, p.y);
    await espera(200);
  }
  await pagina.evaluar(EN_MARCO('w.__marca = w.__ticks.length;'));
  await tocarTexto(pagina, 'comenzar examen');
  if (!await esperarRuta(pagina, '/quiz')) return false;
  return esperarExiste(pagina, sel('barra-quiz'), { limite: 20000 });
}

async function responder(pagina, idx) {
  await tocar(pagina, sel(`opcion-quiz-${idx}`));
  return esperarExiste(pagina, sel('barra-inferior'), { limite: 5000 });
}

async function siguiente(pagina) {
  const previo = await pagina.evaluar(LEER(sel('contador-quiz')));
  const antes = previo && previo.texto;
  await tocar(pagina, sel('boton-siguiente'));
  return pagina.esperarA(async () => {
    const c = await pagina.evaluar(LEER(sel('contador-quiz')));
    return c && c.texto !== antes;
  }, { limite: 5000 });
}

const cerca = (a, b, tol = 1) => Math.abs(a - b) <= tol;

// ---------------------------------------------------------------------------
// Estados K de un control (reposo, hover, presionado, foco), contra los tokens de `T`.

async function enfocarConTab(pagina, s) {
  await pagina.evaluar(EN_MARCO('d.activeElement && d.activeElement.blur && d.activeElement.blur();'));
  for (let i = 0; i < 80; i++) {
    await pagina.tecla('Tab');
    const l = await pagina.evaluar(LEER(s));
    if (l && l.foco) return true;
  }
  return false;
}

async function estadosK(ctx, nombre, s, esperado) {
  const { pagina, navegador, t, T, tema } = ctx;
  const cuando = (e) => `${tema} · ${nombre} · ${e}`;
  const comparar = (e, real, exp) => {
    for (const [campo, v] of Object.entries(exp)) {
      if (campo === 'contorno') {
        const c = real.contorno;
        if (v === null) t.ok(`${cuando(e)}: sin contorno`, c.estilo === 'none' || c.ancho === '0px', true);
        else t.ok(`${cuando(e)}: contorno ${v.ancho} ${v.color}`,
          `${c.estilo} ${c.ancho} ${c.color} ${c.sep}`, `solid ${v.ancho} ${v.color} ${v.sep}`);
      } else {
        t.ok(`${cuando(e)}: ${campo}`, real[campo], v);
      }
    }
  };
  await pagina.moverA(1, 1);
  await pagina.evaluar(PUNTO(s));
  await espera(250);
  const reposo = await pagina.evaluar(LEER(s));
  t.ok(`${cuando('reposo')}: existe`, reposo !== null, true);
  if (!reposo) return;
  comparar('reposo', reposo, { ...esperado.reposo, contorno: null });
  t.ok(`${cuando('tamaño')}: al menos ${LADO_TACTIL} × ${LADO_TACTIL}`,
    reposo.rect.ancho >= LADO_TACTIL && reposo.rect.alto >= LADO_TACTIL, true);
  const c = { x: Math.round(reposo.rect.x + reposo.rect.ancho / 2), y: Math.round(reposo.rect.y + reposo.rect.alto / 2) };

  await pagina.moverA(c.x, c.y);
  await espera(120);
  comparar('hover', await pagina.evaluar(LEER(s)), esperado.hover);

  await navegador.enviar('Input.dispatchMouseEvent',
    { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1, buttons: 1 }, pagina.sessionId);
  await espera(150);
  comparar('presionado', await pagina.evaluar(LEER(s)), esperado.presionado);
  // Se suelta fuera: el responder cancela y no dispara `onPress`.
  await navegador.enviar('Input.dispatchMouseEvent',
    { type: 'mouseReleased', x: 1, y: 1, button: 'left', clickCount: 1, buttons: 0 }, pagina.sessionId);
  await pagina.moverA(1, 1);
  await espera(120);

  const enfocado = await enfocarConTab(pagina, s);
  t.ok(`${cuando('foco')}: llega con Tab`, enfocado, true);
  if (enfocado) {
    comparar('foco', await pagina.evaluar(LEER(s)),
      { contorno: { ancho: '2px', color: rgb(T.foco), sep: `${0.5 * PASO}px` } });
  }
  await pagina.evaluar(EN_MARCO('d.activeElement && d.activeElement.blur && d.activeElement.blur();'));
}

// ---------------------------------------------------------------------------
// Barra propia, contexto, enunciado, opciones, nota y reporte (claro y oscuro).

async function probarQuiz(pagina, base, t, navegador, { tema, preguntas }) {
  const T = plancha[tema];
  const oscuro = tema === 'oscuro';
  const nombre = (txt) => `${tema}: ${txt}`;
  t.ok(nombre('llegó al quiz'), await entrarAlQuiz(pagina, base, { oscuro }), true);
  if (oscuro) t.ok('oscuro: la raíz lleva la clase dark', await pagina.evaluar(ESTA_OSCURO), true);

  // Barra del quiz (QUIZ-P1): filete inferior `linea`, alto paso 2 + paso 11 + paso 2 + filete.
  const barra = await pagina.evaluar(LEER(sel('barra-quiz')));
  t.ok(nombre('la barra propia existe'), barra !== null, true);
  if (barra) {
    t.ok(nombre('barra: alto 61 (paso 2 + paso 11 + paso 2 + filete)'), Math.round(barra.rect.alto), 61);
    t.ok(nombre('barra: fondo `fondo`'), barra.fondoEl, rgb(T.fondo));
    t.ok(nombre('barra: filete inferior `linea`, border'),
      `${barra.bordeElInfAncho} ${barra.bordeElInf}`, `1px ${rgb(T.linea)}`);
  }
  const cerrar = await pagina.evaluar(LEER(SALIR));
  t.ok(nombre('cerrar: glifo con nombre accesible «Salir»'), cerrar !== null && cerrar.nombre, 'Salir');
  if (cerrar) {
    t.ok(nombre('cerrar: 44 × 44 como mínimo'),
      cerrar.rect.ancho >= LADO_TACTIL && cerrar.rect.alto >= LADO_TACTIL, true);
    t.ok(nombre('cerrar: glifo `tinta`'), cerrar.glifo, T.tinta);
  }
  const contador = await pagina.evaluar(LEER(sel('contador-quiz')));
  t.ok(nombre('contador «NN / NN» con cero a la izquierda'),
    contador !== null && /^01 \/ \d{2,3}$/.test(contador.texto), true);
  t.ok(nombre('contador en `tinta`'), contador && contador.textoColor, rgb(T.tinta));
  t.ok(nombre('sin barra interna del Stack'), await existe(pagina, sel('barra-interna')), false);
  // El cromo de la app, sin el enunciado ni las opciones: el texto de la pregunta sorteada puede
  // traer `→` o símbolos propios del contenido y no es lo que estas dos aserciones prueban.
  const cuerpo = await pagina.evaluar(TEXTO_SIN_PREGUNTA);
  t.ok(nombre('sin emojis ni símbolos de texto'), EMOJI.test(cuerpo), false);
  t.ok(nombre('sin «Siguiente →» de texto'), cuerpo.includes('→'), false);
  t.ok(nombre('sin título «pKapp · Quiz»'), cuerpo.includes(TITULO_DEL_QUIZ), false);

  // Contexto (QUIZ-P8) y enunciado con rótulo (QUIZ-P5).
  const meta = await pagina.evaluar(LEER(sel('meta-pregunta')));
  t.ok(nombre('meta «{shortName} · {tema}»'), meta !== null && meta.texto.startsWith('BCYT · '), true);
  t.ok(nombre('meta en `tintaSec`'), meta && meta.textoColor, rgb(T.tintaSec));
  const chip = await pagina.evaluar(LEER(sel('chip-origen')));
  t.ok(nombre('chip de origen de examen con glifo y nombre'),
    chip !== null && chip.glifo === T.acento && chip.texto.length > 0, true);
  if (chip) {
    t.ok(nombre('chip de examen: marco `acento`, fondo `superficie`'),
      `${chip.bordeElInfAncho} ${chip.bordeEl} ${chip.fondoEl}`,
      `1px ${rgb(T.acento)} ${rgb(T.superficie)}`);
  }
  const caja = await pagina.evaluar(LEER(sel('enunciado-quiz')));
  t.ok(nombre('caja del enunciado: superficie y marco `linea`, border'),
    caja !== null && `${caja.fondoEl} ${caja.bordeEl} ${caja.bordeElAncho}`, `${rgb(T.superficie)} ${rgb(T.linea)} 1px`);
  const rotulo = await pagina.evaluar(LEER(sel('rotulo-enunciado')));
  t.ok(nombre('rótulo «Enunciado» en `tintaSec`'),
    rotulo !== null && rotulo.texto.toLowerCase() === 'enunciado' && rotulo.textoColor === rgb(T.tintaSec), true);

  // Antes de responder: nada de reporte, nota ni barra inferior.
  t.ok(nombre('sin responder: no hay «Reportar pregunta»'), await existe(pagina, sel('boton-reportar')), false);
  t.ok(nombre('sin responder: no hay barra inferior'), await existe(pagina, sel('barra-inferior')), false);
  t.ok(nombre('sin responder: no hay nota ni aviso'),
    (await existe(pagina, sel('nota-explicacion'))) || (await existe(pagina, sel('aviso-resultado-oculto'))), false);

  // Opciones en reposo (K3): marco `borde`, fondo `superficie`, celda de letra con filete.
  const nOpciones = await pagina.evaluar(CONTAR('[data-testid^="opcion-quiz-"]'));
  t.ok(nombre('hay al menos dos opciones'), nOpciones >= 2, true);
  const reposo = await pagina.evaluar(LEER(sel('opcion-quiz-0')));
  t.ok(nombre('opción en reposo: marco `borde` y fondo `superficie`, border'),
    reposo !== null && `${reposo.bordeAncho} ${reposo.borde} ${reposo.fondo}`,
    `1px ${rgb(T.borde)} ${rgb(T.superficie)}`);
  const letra = await pagina.evaluar(LEER(sel('letra-opcion-quiz-0')));
  t.ok(nombre('celda de letra: ancho paso 11, letra A'),
    letra !== null && Math.round(letra.rect.ancho) === LADO_TACTIL && letra.texto === 'A', true);
  t.ok(nombre('celda de letra: filete derecho `filete`'),
    letra !== null && letra.bordeElInfAncho !== undefined && await pagina.evaluar(EN_MARCO(`
      const n = visibles('[data-testid="letra-opcion-quiz-0"]')[0];
      const s = w.getComputedStyle(n);
      return s.borderRightWidth + ' ' + s.borderRightColor;
    `)), `1px ${rgb(T.filete)}`);
  let separacionOk = true;
  for (let i = 0; i + 1 < nOpciones; i++) {
    const a = await pagina.evaluar(LEER(sel(`opcion-quiz-${i}`)));
    const b = await pagina.evaluar(LEER(sel(`opcion-quiz-${i + 1}`)));
    if (!cerca(b.rect.y - (a.rect.y + a.rect.alto), 2.5 * PASO, 1)) separacionOk = false;
    if (a.rect.alto < LADO_TACTIL) separacionOk = false;
  }
  t.ok(nombre('opciones: 44 de alto como mínimo y paso 2.5 entre sí'), separacionOk, true);

  // Estados K de los controles de la pantalla.
  const ctx = { pagina, navegador, t, T, tema };
  await estadosK(ctx, 'Cerrar (K7)', SALIR, {
    reposo: { fondo: TRANSPARENTE, glifo: T.tinta },
    hover: { fondo: TRANSPARENTE, contorno: { ancho: '1px', color: rgb(T.linea), sep: '0px' } },
    presionado: { fondo: rgb(T.tinta), glifo: T.fondo },
  });
  await estadosK(ctx, 'Opción (K3)', sel('opcion-quiz-1'), {
    reposo: { fondo: rgb(T.superficie), borde: rgb(T.borde), textoColor: rgb(T.tinta) },
    hover: { fondo: rgb(T.superficie), borde: rgb(T.linea) },
    presionado: { fondo: rgb(T.tinta), borde: rgb(T.tinta) },
  });

  // Recorrido: responde y avanza, mirando los estados de cada opción.
  const vistos = { acierto: 0, error: 0, apagada: 0, nota: 0, parcial: 0 };
  let primera = true;
  for (let i = 0; i < preguntas; i++) {
    const n = await pagina.evaluar(CONTAR('[data-testid^="opcion-quiz-"]'));
    if (!await responder(pagina, i % n)) { t.ok(nombre(`pregunta ${i + 1}: respondió`), false, true); break; }
    t.ok(nombre('responder muestra el aviso oculto solo con el ajuste'),
      await existe(pagina, sel('aviso-resultado-oculto')), false);
    for (let k = 0; k < n; k++) {
      const o = await pagina.evaluar(LEER(sel(`opcion-quiz-${k}`)));
      const e = await pagina.evaluar(LEER(sel(`estado-opcion-${k}`)));
      const tx = await pagina.evaluar(LEER(sel(`texto-opcion-quiz-${k}`)));
      const lt = await pagina.evaluar(LEER(sel(`letra-opcion-quiz-${k}`)));
      if (!o || !tx || !lt) { t.ok(nombre('opción legible'), false, true); continue; }
      t.ok(nombre('opción respondida: 44 de alto como mínimo'), o.rect.alto >= LADO_TACTIL, true);
      const textoEstado = e ? e.texto.toLowerCase() : '';
      if (e && textoEstado === 'correcta') {
        vistos.acierto++;
        t.ok(nombre('correcta: fondo `aciertoFondo` y marco `acierto`, border-2'),
          `${o.fondo} ${o.borde} ${o.bordeAncho}`, `${rgb(T.aciertoFondo)} ${rgb(T.acierto)} 2px`);
        t.ok(nombre('correcta: celda de letra `acierto` con letra `fondo`'),
          `${lt.fondoEl} ${lt.textoColor}`, `${rgb(T.acierto)} ${rgb(T.fondo)}`);
        t.ok(nombre('correcta: línea de estado con glifo y color `acierto`'),
          `${e.glifo} ${e.textoColor}`, `${T.acierto} ${rgb(T.acierto)}`);
        t.ok(nombre('correcta: texto `cuerpo-fuerte`'), tx.familia, 'PlexSans-SemiBold');
      } else if (e && /^incorrecta · tu respuesta$/.test(textoEstado)) {
        vistos.error++;
        t.ok(nombre('incorrecta: fondo `errorFondo` y marco `error`, border-2'),
          `${o.fondo} ${o.borde} ${o.bordeAncho}`, `${rgb(T.errorFondo)} ${rgb(T.error)} 2px`);
        t.ok(nombre('incorrecta: celda de letra `error` con letra `fondo`'),
          `${lt.fondoEl} ${lt.textoColor}`, `${rgb(T.error)} ${rgb(T.fondo)}`);
        t.ok(nombre('incorrecta: línea de estado con glifo y color `error`'),
          `${e.glifo} ${e.textoColor}`, `${T.error} ${rgb(T.error)}`);
        t.ok(nombre('incorrecta: texto `cuerpo`'), tx.familia, 'PlexSans-Regular');
      } else {
        vistos.apagada++;
        t.ok(nombre('apagada: sin línea de estado'), e, null);
        t.ok(nombre('apagada: marco `filete`, fondo `superficie`, sin opacidad'),
          `${o.bordeAncho} ${o.borde} ${o.fondo} ${o.opacidad}`, `1px ${rgb(T.filete)} ${rgb(T.superficie)} 1`);
        t.ok(nombre('apagada: texto y letra `tintaSec`'),
          `${tx.textoColor} ${lt.textoColor}`, `${rgb(T.tintaSec)} ${rgb(T.tintaSec)}`);
      }
    }
    if (await existe(pagina, sel('nota-explicacion'))) {
      vistos.nota++;
      const nota = await pagina.evaluar(LEER(sel('nota-explicacion')));
      t.ok(nombre('nota: rótulo «Nota / Explicación» con glifo `acento`'),
        nota.texto.toLowerCase().startsWith('nota / explicación') && nota.glifo === T.acento, true);
      t.ok(nombre('nota: izquierdo `acento` border-l-3, fondo `superficie`'),
        await pagina.evaluar(EN_MARCO(`
          const s = w.getComputedStyle(visibles('[data-testid="nota-explicacion"]')[0]);
          return s.borderLeftWidth + ' ' + s.borderLeftColor + ' ' + s.backgroundColor;
        `)), `3px ${rgb(T.acento)} ${rgb(T.superficie)}`);
    }
    if (await existe(pagina, sel('insignia-parcial'))) vistos.parcial++;
    const reportar = await pagina.evaluar(LEER(sel('boton-reportar')));
    t.ok(nombre('reportar: aparece tras responder, 44 × 44'),
      reportar !== null && reportar.rect.alto >= LADO_TACTIL && reportar.rect.ancho >= LADO_TACTIL
      && reportar.texto.toLowerCase().includes('reportar pregunta'), true);
    const sig = await pagina.evaluar(LEER(sel('boton-siguiente')));
    t.ok(nombre('siguiente: botón K1 `tinta` con texto `fondo`, 44 de alto'),
      sig !== null && sig.fondo === rgb(T.tinta) && sig.rect.alto >= LADO_TACTIL, true);
    const bi = await pagina.evaluar(LEER(sel('barra-inferior')));
    t.ok(nombre('barra inferior: filete superior `linea`, fondo `fondo`'),
      bi !== null && `${bi.bordeElAncho} ${bi.bordeEl} ${bi.fondoEl}`, `1px ${rgb(T.linea)} ${rgb(T.fondo)}`);
    if (primera) {
      primera = false;
      await reportarK7(ctx, `${tema} · quiz`);
      await estadosK(ctx, 'Reportar pregunta (K7)', sel('boton-reportar'), {
        reposo: { fondo: TRANSPARENTE, textoColor: rgb(T.tinta) },
        hover: { fondo: TRANSPARENTE, contorno: { ancho: '1px', color: rgb(T.linea), sep: '0px' } },
        presionado: { fondo: rgb(T.tinta), textoColor: rgb(T.fondo) },
      }).catch(() => {});
      await estadosK(ctx, 'Siguiente (K1)', sel('boton-siguiente'), {
        reposo: { fondo: rgb(T.tinta), borde: rgb(T.tinta), textoColor: rgb(T.fondo), glifo: T.fondo },
        hover: { fondo: rgb(T.tinta), contorno: { ancho: '2px', color: rgb(T.linea), sep: '0px' } },
        presionado: { fondo: rgb(T.superficie), borde: rgb(T.linea), textoColor: rgb(T.tinta), glifo: T.tinta },
      });
    }
    if (!await siguiente(pagina)) { t.ok(nombre('avanzó a la siguiente pregunta'), false, true); break; }
  }
  t.ok(nombre('se vio una opción correcta marcada'), vistos.acierto > 0, true);
  t.ok(nombre('se vio una opción apagada'), vistos.apagada > 0, true);
  if (preguntas >= 8) {
    t.ok(nombre('se vio una opción incorrecta marcada'), vistos.error > 0, true);
    t.ok(nombre('se vio una nota «Nota / Explicación»'), vistos.nota > 0, true);
  }
  t.ok(nombre('sin scroll horizontal'), await pagina.evaluar(DESBORDA), 0);
}

async function quizClaro(pagina, base, t, navegador) {
  try { await probarQuiz(pagina, base, t, navegador, { tema: 'claro', preguntas: 10 }); }
  finally { await limpiarAjustes(pagina); }
}

async function quizOscuro(pagina, base, t, navegador) {
  try { await probarQuiz(pagina, base, t, navegador, { tema: 'oscuro', preguntas: 4 }); }
  finally { await limpiarAjustes(pagina); }
}

// ---------------------------------------------------------------------------
// Progreso (QUIZ-P4): casillas hasta 40, barra continua con más.

async function progresoPorCasillas(pagina, base, t) {
  t.ok('ryd: llegó al quiz', await entrarAlQuiz(pagina, base, { materia: NOMBRE.ryd }), true);
  const casillas = await pagina.evaluar(EN_MARCO(`
    return visibles('[data-testid="casilla-llena"], [data-testid="casilla-vacia"]').map((n) => {
      const r = n.getBoundingClientRect();
      return { llena: n.getAttribute('data-testid') === 'casilla-llena', x: r.left, ancho: r.width, alto: r.height };
    });
  `));
  t.ok('ryd (20 preguntas): una casilla por pregunta', casillas.length, 20);
  t.ok('ryd: la primera pregunta llena una casilla', casillas.filter((c) => c.llena).length, 1);
  t.ok('ryd: la llena es la primera', casillas[0] && casillas[0].llena, true);
  t.ok('ryd: casillas de alto paso 2.5', casillas.every((c) => cerca(c.alto, 2.5 * PASO, 0.6)), true);
  let separadas = true;
  for (let i = 0; i + 1 < casillas.length; i++) {
    if (!cerca(casillas[i + 1].x - (casillas[i].x + casillas[i].ancho), 0.5 * PASO, 0.7)) separadas = false;
  }
  t.ok('ryd: casillas separadas por paso 0.5', separadas, true);
  t.ok('ryd: sin barra continua', await existe(pagina, sel('barra-progreso')), false);

  await responder(pagina, 0);
  await siguiente(pagina);
  const c2 = await pagina.evaluar(LEER(sel('contador-quiz')));
  t.ok('ryd: el contador pasa a «02 / 20»', c2 && c2.texto, '02 / 20');
  t.ok('ryd: la segunda pregunta llena dos casillas',
    await pagina.evaluar(CONTAR('[data-testid="casilla-llena"]')), 2);
}

async function progresoPorBarra(pagina, base, t) {
  t.ok('dre: llegó al quiz', await entrarAlQuiz(pagina, base, { materia: NOMBRE.dre }), true);
  t.ok('dre (50 preguntas): hay barra continua', await existe(pagina, sel('barra-progreso')), true);
  t.ok('dre: sin casillas', await pagina.evaluar(
    CONTAR('[data-testid="casilla-llena"], [data-testid="casilla-vacia"]')), 0);
  const medir = () => pagina.evaluar(EN_MARCO(`
    const b = visibles('[data-testid="barra-progreso"]')[0];
    const r = visibles('[data-testid="relleno-progreso"]')[0];
    if (!b || !r) return null;
    const rb = b.getBoundingClientRect(), rr = r.getBoundingClientRect();
    const s = w.getComputedStyle(b);
    return { alto: rb.height, proporcion: rr.width / (rb.width - 2),
      borde: s.borderTopColor, fondo: s.backgroundColor, relleno: w.getComputedStyle(r).backgroundColor };
  `));
  const T = plancha.claro;
  const a = await medir();
  t.ok('dre: barra de alto paso 2.5', a && cerca(a.alto, 2.5 * PASO, 0.6), true);
  t.ok('dre: marco `filete`, fondo `fondo`, relleno `tinta`',
    a && `${a.borde} ${a.fondo} ${a.relleno}`, `${rgb(T.filete)} ${rgb(T.fondo)} ${rgb(T.tinta)}`);
  t.ok('dre: relleno de 1/50', a && cerca(a.proporcion, 1 / 50, 0.005), true);
  await responder(pagina, 0);
  await siguiente(pagina);
  const b = await medir();
  t.ok('dre: relleno de 2/50 en la segunda', b && cerca(b.proporcion, 2 / 50, 0.005), true);
}

// ---------------------------------------------------------------------------
// Temporizador (QUIZ-P3): `glifo-reloj` y «mm:ss»; bajo 120 s pasa a `error` con marco.

async function temporizadorYAlerta(pagina, base, t) {
  const T = plancha.claro;
  t.ok('llegó al quiz con temporizador', await entrarAlQuiz(pagina, base, { temporizador: true }), true);
  const normal = await pagina.evaluar(LEER(sel('tiempo-quiz')));
  t.ok('hay tiempo visible con formato mm:ss', normal !== null && /^\d{2}:\d{2}$/.test(normal.texto), true);
  if (!normal) return;
  t.ok('tiempo en reposo: texto y glifo `tinta`', `${normal.textoColor} ${normal.glifo}`, `${rgb(T.tinta)} ${T.tinta}`);
  t.ok('tiempo en reposo: sin marco', normal.bordeElAncho, '0px');
  t.ok('tiempo: ancho mínimo paso 20', normal.rect.ancho >= 20 * PASO - 0.5, true);

  // El reloj de 1 s se maneja a mano (el real está congelado): se baja hasta 02:00 justo,
  // y de ahí a 01:59. La alerta es «menos de 120 s» (QUIZ-P3): en 120 no hay marco y en 119
  // sí, así que ni un umbral más alto ni uno más bajo ni un `<=` pasan.
  const [mm, ss] = normal.texto.split(':').map(Number);
  const faltan = mm * 60 + ss - 120;
  t.ok('el tiempo inicial deja más de 120 s para bajar', faltan > 0, true);
  const dar = (n) => pagina.evaluar(EN_MARCO(`
    const timer = w.__ticks.slice(w.__marca).pop();
    if (!timer) return false;
    for (let i = 0; i < ${n}; i++) timer();
    return true;
  `));
  t.ok('hay un reloj de 1 s que manejar', await dar(faltan), true);
  await espera(400);
  const justo = await pagina.evaluar(LEER(sel('tiempo-quiz')));
  t.ok('a 02:00 exactos el reloj marca 02:00', justo && justo.texto, '02:00');
  t.ok('a 02:00 todavía no hay alerta: sin marco', justo && justo.bordeElAncho, '0px');
  t.ok('a 02:00 el texto y el glifo siguen en `tinta`',
    justo && `${justo.textoColor} ${justo.glifo}`, `${rgb(T.tinta)} ${T.tinta}`);
  await dar(1);
  const alerta = await pagina.esperarA(async () => {
    const l = await pagina.evaluar(LEER(sel('tiempo-quiz')));
    return l && l.bordeElAncho === '2px';
  }, { limite: 5000 });
  t.ok('con menos de 120 s el bloque lleva marco border-2', alerta, true);
  const a = await pagina.evaluar(LEER(sel('tiempo-quiz')));
  t.ok('alerta: marco, texto y glifo `error`',
    a !== null && `${a.bordeEl} ${a.textoColor} ${a.glifo}`, `${rgb(T.error)} ${rgb(T.error)} ${T.error}`);
  t.ok('alerta: el bloque no cambia de tamaño',
    a !== null && cerca(a.rect.ancho, normal.rect.ancho, 0.6) && cerca(a.rect.alto, normal.rect.alto, 0.6), true);
  t.ok('alerta: a 119 s el reloj marca 01:59', a !== null && a.texto, '01:59');
  t.ok('sigue en /quiz', await pagina.evaluar(RUTA), '/quiz');
}

// ---------------------------------------------------------------------------
// Examen en curso (EXA-P1): sin retroalimentación.

// Semilla fija: el examen sale siempre con el mismo orden, así que la primera pregunta (y su
// opción correcta) es la misma en las dos entradas de abajo.
const SEMILLA = 20261011;
const ESTADISTICAS = 'pkapp_question_stats:bcyt';
const BORRAR_ESTADISTICAS = `localStorage.removeItem(${JSON.stringify(ESTADISTICAS)})`;
const RESPUESTAS_GUARDADAS = `(function () {
  const e = JSON.parse(localStorage.getItem(${JSON.stringify(ESTADISTICAS)}) || '{}');
  return Object.values(e).reduce((suma, q) => suma + q.times_answered, 0);
})()`;

// Con retroalimentación y la misma semilla: qué opción es la correcta de la primera pregunta
// y cuál es su enunciado. La UI la marca «Correcta» al responder.
async function laCorrectaDeLaPrimera(pagina, base) {
  if (!await entrarAlQuiz(pagina, base, { semilla: SEMILLA })) return null;
  const enunciado = await pagina.evaluar(LEER(sel('enunciado-quiz')));
  if (!await responder(pagina, 0)) return null;
  const n = await pagina.evaluar(CONTAR('[data-testid^="opcion-quiz-"]'));
  for (let k = 0; k < n; k++) {
    const e = await pagina.evaluar(LEER(sel(`estado-opcion-${k}`)));
    if (e && e.texto.toLowerCase() === 'correcta') return { correcta: k, enunciado: enunciado && enunciado.texto, n };
  }
  return null;
}

async function examenEnCurso(pagina, base, t) {
  const T = plancha.claro;
  try {
    await pagina.evaluar(BORRAR_ESTADISTICAS).catch(() => {});
    const previa = await laCorrectaDeLaPrimera(pagina, base);
    t.ok('con la semilla fija se conoce la correcta de la primera pregunta', previa !== null, true);
    if (!previa) return;
    // Se responde otra opción que la correcta: si la correcta se filtrara, saldría marcada.
    const idx = previa.correcta === 0 ? 1 : 0;
    const { correcta } = previa;

    await pagina.evaluar(BORRAR_ESTADISTICAS);
    t.ok('llegó al quiz con el resultado oculto',
      await entrarAlQuiz(pagina, base, { ocultar: true, semilla: SEMILLA }), true);
    const enunciado = await pagina.evaluar(LEER(sel('enunciado-quiz')));
    t.ok('la semilla repite la misma primera pregunta', enunciado && enunciado.texto, previa.enunciado);
    t.ok('sin responder: no hay aviso', await existe(pagina, sel('aviso-resultado-oculto')), false);
    const antes = await pagina.evaluar(LEER(sel(`opcion-quiz-${idx}`)));
    t.ok('hay opción para responder', antes !== null, true);
    t.ok('respondió una opción que no es la correcta', await responder(pagina, idx), true);
    const aviso = await pagina.evaluar(LEER(sel('aviso-resultado-oculto')));
    t.ok('aviso «Resultado oculto hasta el final»',
      aviso !== null && aviso.texto.toLowerCase() === 'resultado oculto hasta el final', true);
    t.ok('aviso: `tintaSec`, sin marco',
      aviso !== null && `${aviso.textoColor} ${aviso.bordeElAncho}`, `${rgb(T.tintaSec)} 0px`);
    t.ok('sin nota de explicación', await existe(pagina, sel('nota-explicacion')), false);
    t.ok('sin línea de estado en ninguna opción', await existe(pagina, '[data-testid^="estado-opcion-"]'), false);
    const elegida = await pagina.evaluar(LEER(sel(`opcion-quiz-${idx}`)));
    t.ok('elegida: relleno `tinta`, marco `tinta` border, texto `fondo`',
      elegida !== null && `${elegida.fondo} ${elegida.borde} ${elegida.bordeAncho} ${elegida.textoColor}`,
      `${rgb(T.tinta)} ${rgb(T.tinta)} 1px ${rgb(T.fondo)}`);
    t.ok('elegida: el layout no se mueve al responder',
      elegida !== null && antes !== null && cerca(elegida.rect.alto, antes.rect.alto, 0.6), true);
    t.ok('elegida: estado accesible seleccionado', elegida && elegida.presionado, 'true');

    // La correcta no se revela (EXA-C1): marco `filete`, texto `tintaSec`, sin opacidad ni
    // línea de estado. Se mira la correcta aparte, con su índice, y después todas las demás.
    let apagadas = true;
    for (let k = 0; k < previa.n; k++) {
      if (k === idx) continue;
      const o = await pagina.evaluar(LEER(sel(`opcion-quiz-${k}`)));
      const tx = await pagina.evaluar(LEER(sel(`texto-opcion-quiz-${k}`)));
      const ok = o && tx && o.borde === rgb(T.filete) && o.opacidad === '1' && tx.textoColor === rgb(T.tintaSec);
      if (k === correcta) {
        t.ok('la correcta no se revela: marco `filete` y texto `tintaSec`', ok, true);
        t.ok('la correcta no se revela: sin fondo de acierto',
          o && o.fondo, rgb(T.superficie));
      }
      if (!ok) apagadas = false;
    }
    t.ok('las demás: marco `filete`, texto `tintaSec` y sin opacidad', apagadas, true);
    t.ok('«Reportar pregunta» sigue disponible', await existe(pagina, sel('boton-reportar')), true);
    await reportarK7({ pagina, t, T }, 'examen en curso');
    t.ok('«Siguiente» o «Ver resultados» disponible', await existe(pagina, sel('boton-siguiente')), true);

    // Un solo toque (c.2): la elegida sigue siendo pulsable (`ControlMarco`), así que lo que
    // impide que un segundo toque cambie o duplique la respuesta es la guardia de
    // `handleSelectOption`. Se toca la elegida otra vez y la otra opción también.
    t.ok('una respuesta guardada tras el primer toque',
      await pagina.esperarA(async () => await pagina.evaluar(RESPUESTAS_GUARDADAS) === 1), true);
    await tocar(pagina, sel(`opcion-quiz-${idx}`));
    await espera(300);
    t.ok('segundo toque sobre la elegida: no duplica la respuesta guardada',
      await pagina.evaluar(RESPUESTAS_GUARDADAS), 1);
    await tocar(pagina, sel(`opcion-quiz-${correcta}`));
    await espera(300);
    t.ok('toque sobre otra opción: tampoco suma ni cambia la respuesta',
      await pagina.evaluar(RESPUESTAS_GUARDADAS), 1);
    const despues = await pagina.evaluar(LEER(sel(`opcion-quiz-${idx}`)));
    t.ok('tras los toques la elegida sigue siendo la misma, rellena con `tinta`',
      despues !== null && `${despues.fondo} ${despues.presionado}`, `${rgb(T.tinta)} true`);
    t.ok('tras los toques no aparece ninguna línea de estado',
      await existe(pagina, '[data-testid^="estado-opcion-"]'), false);

    t.ok('el aviso no suma gestos: avanza con un toque', await siguiente(pagina), true);
    t.ok('en la siguiente pregunta el aviso desaparece hasta responder',
      await existe(pagina, sel('aviso-resultado-oculto')), false);
  } finally {
    await pagina.evaluar(BORRAR_ESTADISTICAS).catch(() => {});
    await limpiarAjustes(pagina);
  }
}

// ---------------------------------------------------------------------------
// Anchos: 320 y 360 sin recorte ni scroll horizontal; 768 en columna (desde 1024 rige
// `lectura`: lo cubren `escritorioDelQuiz` y `escritorioDelExamenEnCurso`).

// La meta «{shortName} · {tema}» (QUIZ-P8) no pierde el tema ni se recorta (Quiz.md a.4 y c.3):
// sin tope de líneas; a la derecha del contexto si entra; si no, en su propia línea debajo, a
// todo el ancho. Con el tema más largo ocupa hasta dos líneas desde 360 px y tres a 320 px. El
// tema más largo de los bancos (59 caracteres con el prefijo) se inyecta en el nodo: el sorteo no
// decide si la prueba ve el caso malo.
const META_MAS_LARGA = 'RyD · Eje hipotálamo-hipófiso-testicular y respuesta sexual';
const META_CORTA = 'BCYT · Enzimas';

const MEDIR_META = (texto) => EN_MARCO(`
  const meta = visibles('[data-testid="meta-pregunta"]')[0];
  const e = visibles('[data-testid="enunciado-quiz"]')[0];
  if (!meta || !e) return null;
  meta.textContent = ${JSON.stringify(texto)};
  const izq = meta.parentElement.firstElementChild;
  const rm = meta.getBoundingClientRect(), ri = izq.getBoundingClientRect(), re = e.getBoundingClientRect();
  return {
    recorte: meta.scrollHeight - meta.clientHeight, clamp: w.getComputedStyle(meta).webkitLineClamp,
    interlineado: parseFloat(w.getComputedStyle(meta).lineHeight),
    arriba: rm.top, x: rm.left, der: rm.right, ancho: rm.width, alto: rm.height,
    izqAbajo: ri.bottom, izqDer: ri.right, columna: re.width, columnaDer: re.right,
    desborda: desbordes().length,
  };
`);

async function metaSinRecorte(pagina, t, ancho) {
  const m = await pagina.evaluar(MEDIR_META(META_MAS_LARGA));
  t.ok(`${ancho}: la meta más larga existe`, m !== null, true);
  if (!m) return;
  t.ok(`${ancho}: la meta más larga no se recorta (alto visible = alto del contenido)`, m.recorte <= 1, true);
  t.ok(`${ancho}: la meta no limita las líneas`, m.clamp, 'none');
  t.ok(`${ancho}: la meta que no entra al lado pasa a su propia línea`, m.arriba >= m.izqAbajo - 0.5, true);
  t.ok(`${ancho}: la meta en su línea va a todo el ancho de la columna`, cerca(m.ancho, m.columna, 1), true);
  t.ok(`${ancho}: la meta más larga no abre scroll horizontal`, m.desborda, 0);
  const lineas = Number.isFinite(m.interlineado) && m.interlineado > 0 ? Math.round(m.alto / m.interlineado) : null;
  const tope = ancho <= 320 ? 3 : 2;
  t.ok(`${ancho}: la meta más larga ocupa como mucho ${tope} líneas`, lineas !== null && lineas <= tope, true);
}

async function anchosDelQuiz(pagina, base, t) {
  for (const ancho of [320, 360]) {
    t.ok(`${ancho}: llegó al quiz`, await entrarAlQuiz(pagina, base, { ancho, temporizador: true }), true);
    t.ok(`${ancho}: sin scroll horizontal antes de responder`, await pagina.evaluar(DESBORDA), 0);
    const mide = await pagina.evaluar(EN_MARCO(`
      const caja = (s) => { const n = visibles(s)[0]; if (!n) return null; const r = n.getBoundingClientRect();
        return { x: r.left, der: r.right, ancho: r.width, alto: r.height }; };
      return { cerrar: caja('[aria-label="Salir"]'), progreso: caja('[data-testid="progreso-quiz"]'),
        contador: caja('[data-testid="contador-quiz"]'), tiempo: caja('[data-testid="tiempo-quiz"]'),
        vista: w.innerWidth };
    `));
    t.ok(`${ancho}: cerrar conserva 44 × 44`,
      mide.cerrar && mide.cerrar.ancho >= LADO_TACTIL && mide.cerrar.alto >= LADO_TACTIL, true);
    t.ok(`${ancho}: el progreso toma el espacio libre sin pisar a cerrar`,
      mide.progreso && mide.cerrar && mide.progreso.x >= mide.cerrar.der + 2 * PASO - 0.5, true);
    t.ok(`${ancho}: el contador no pisa al progreso`,
      mide.progreso && mide.contador && mide.contador.x >= mide.progreso.der + 2 * PASO - 0.5, true);
    t.ok(`${ancho}: el tiempo cabe en la pantalla`,
      mide.tiempo && mide.tiempo.der <= mide.vista + 0.5, true);
    await responder(pagina, 0);
    t.ok(`${ancho}: sin scroll horizontal después de responder`, await pagina.evaluar(DESBORDA), 0);
    const sig = await pagina.evaluar(LEER(sel('boton-siguiente')));
    t.ok(`${ancho}: «Siguiente» de ancho completo`,
      sig !== null && sig.rect.ancho >= ancho - 2 * 5 * PASO - 1, true);
    await metaSinRecorte(pagina, t, ancho);
  }
  // 390: la meta corta sigue a la derecha del contexto, en la misma fila; la larga baja.
  t.ok('390: llegó al quiz', await entrarAlQuiz(pagina, base, { ancho: 390 }), true);
  const corta = await pagina.evaluar(MEDIR_META(META_CORTA));
  t.ok('390: la meta corta existe', corta !== null, true);
  if (corta) {
    t.ok('390: la meta corta entra en la misma fila que el contexto', corta.arriba < corta.izqAbajo - 0.5, true);
    t.ok('390: la meta corta queda a la derecha del contexto', corta.x >= corta.izqDer, true);
    t.ok('390: la meta corta alineada al borde derecho de la columna', cerca(corta.der, corta.columnaDer, 1), true);
  }
  await metaSinRecorte(pagina, t, 390);
  // Desde 1024 rige `lectura` (ESC-P4): 1023, 1024, 1280, 1366 y 1920 los cubre `escritorioDelQuiz`.
  for (const ancho of [768]) {
    t.ok(`${ancho}: llegó al quiz`, await entrarAlQuiz(pagina, base, { ancho, alto: 900 }), true);
    await responder(pagina, 0);
    const m = await pagina.evaluar(EN_MARCO(`
      const caja = (s) => { const n = visibles(s)[0]; if (!n) return null; const r = n.getBoundingClientRect();
        return { x: r.left, der: r.right, ancho: r.width }; };
      return { vista: w.innerWidth, barra: caja('[data-testid="barra-quiz"]'),
        barraInf: caja('[data-testid="barra-inferior"]'), enunciado: caja('[data-testid="enunciado-quiz"]'),
        siguiente: caja('[data-testid="boton-siguiente"]') };
    `));
    t.ok(`${ancho}: la barra del quiz va a todo el ancho`, m.barra && cerca(m.barra.ancho, m.vista, 1), true);
    t.ok(`${ancho}: la barra inferior va a todo el ancho`, m.barraInf && cerca(m.barraInf.ancho, m.vista, 1), true);
    t.ok(`${ancho}: el enunciado va en una columna de 448 como máximo`,
      m.enunciado && m.enunciado.ancho <= 448 + 1, true);
    t.ok(`${ancho}: la columna va centrada`,
      m.enunciado && cerca(m.enunciado.x + m.enunciado.ancho / 2, m.vista / 2, 1), true);
    t.ok(`${ancho}: el botón mide el ancho de la columna`,
      m.siguiente && m.siguiente.ancho <= 448 + 1, true);
    t.ok(`${ancho}: sin scroll horizontal`, await pagina.evaluar(DESBORDA), 0);
  }
}


// ---------------------------------------------------------------------------
// Escritorio (tarea 3.11e, ESC-P4; comun.md §7.2): bajo 1024 la columna `columna` de siempre;
// desde 1024, `lectura` (600) con barras a todo el ancho. Orden de foco = orden visual = DOM.

const ESCRITORIO = { corte: 1024, lectura: 600, columna: 448, margen: 8 * PASO };

const MEDIR_ESCRITORIO = EN_MARCO(`
  const caja = (n) => { if (!n) return null; const r = n.getBoundingClientRect();
    return { x: r.left, der: r.right, y: r.top, ancho: r.width, alto: r.height }; };
  const uno = (s) => caja(visibles(s)[0]);
  const opciones = visibles('[data-testid^="opcion-quiz-"]').filter((n) => /^opcion-quiz-\\d+$/.test(n.dataset.testid))
    .map((n) => ({ id: n.dataset.testid, ...caja(n) }));
  const meta = visibles('[data-testid="meta-pregunta"]')[0];
  // Ancestros que podrían recortar el foco: cualquier overflow distinto de visible entre el
  // nodo y el contenedor de scroll (contenido) o la barra (cabecera). El ScrollView no cuenta.
  const recortes = (nodo, hasta) => {
    let k = 0;
    for (let e = nodo && nodo.parentElement; e && !hasta(e); e = e.parentElement) {
      const s = w.getComputedStyle(e);
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') k++;
    }
    return k;
  };
  const enScroll = (e) => { const s = w.getComputedStyle(e); return s.overflowY === 'auto' || s.overflowY === 'scroll'; };
  const enBarra = (e) => e.dataset && e.dataset.testid === 'barra-quiz';
  return { vista: w.innerWidth, barra: uno('[data-testid="barra-quiz"]'), barraInf: uno('[data-testid="barra-inferior"]'),
    cerrar: uno('[data-testid="cerrar-quiz"]'), contador: uno('[data-testid="contador-quiz"]'),
    progreso: uno('[data-testid="progreso-quiz"]'), contexto: caja(meta && meta.parentElement),
    enunciado: uno('[data-testid="enunciado-quiz"]'), nota: uno('[data-testid="nota-explicacion"]'),
    aviso: uno('[data-testid="aviso-resultado-oculto"]'),
    reportar: uno('[data-testid="boton-reportar"]'), siguiente: uno('[data-testid="boton-siguiente"]'),
    opciones, scrollV: d.scrollingElement.scrollWidth, vistaDoc: d.documentElement.clientWidth,
    recortesContenido: recortes(visibles('[data-testid="enunciado-quiz"]')[0], enScroll),
    recortesBarra: recortes(visibles('[data-testid="cerrar-quiz"]')[0], enBarra) };
`);

// Paradas de Tab: id + caja de cada parada.
const PARADAS_DE_TAB = () => EN_MARCO(`
  const a = d.activeElement;
  const c = a && a.closest ? a.closest('[data-testid]') : null;
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { id: c.dataset.testid, x: r.left, y: r.top };
`);

// Con `desde`, enfoca ese control y cuenta las paradas siguientes: tras responder, el punto de
// partida de Tab del navegador es la opción tocada, que ya no existe como control.
async function paradasDeTab(pagina, cuantas, desde = null) {
  await pagina.evaluar(EN_MARCO(desde
    ? `const n = d.querySelector('[data-testid="${desde}"]'); n && n.focus();`
    : 'd.activeElement && d.activeElement.blur && d.activeElement.blur();'));
  const vistas = [];
  for (let i = 0; i < cuantas; i++) {
    await pagina.tecla('Tab');
    vistas.push(await pagina.evaluar(PARADAS_DE_TAB()));
  }
  return vistas;
}

// Orden visual: arriba-abajo y, dentro de una fila (Δy ≤ 4), izquierda-derecha.
const porOrdenVisual = (xs) => [...xs].sort((a, b) => (Math.abs(a.y - b.y) > 4 ? a.y - b.y : a.x - b.x));
const bajan = (xs) => xs.every((c, i) => c && (i === 0 || c.y > xs[i - 1].y));

// Ancho de la columna de lectura: `lectura` desde el corte; `columna` (sin su relleno `paso 5`)
// debajo. `lectura` es la caja centrada que miden el enunciado, las opciones y «Siguiente».
function columnaDe(ancho) {
  return ancho >= ESCRITORIO.corte
    ? Math.min(ESCRITORIO.lectura, ancho - 2 * ESCRITORIO.margen)
    : Math.min(ESCRITORIO.columna, ancho) - 2 * 5 * PASO;
}

// Tab sigue el orden visual medido: las paradas esperadas salen de las cajas, ordenadas
// arriba-abajo e izquierda-derecha, no de una lista fija.
async function tabSigueLoVisual(pagina, t, n, etiqueta, paradas, desde = null) {
  const esperadas = porOrdenVisual(paradas.filter(Boolean)).map((p) => p.id);
  const vistas = (await paradasDeTab(pagina, esperadas.length, desde)).map((p) => p && p.id);
  t.ok(`${n}: ${etiqueta}: orden de Tab = orden visual medido`, vistas.join(' '), esperadas.join(' '));
}

// Regiones que no se salen de la columna de lectura (la caja del enunciado) ni recortan el foco.
function dentroDeLectura(t, n, m, nombre, caja) {
  t.ok(`${n}: ${nombre} dentro de la columna de lectura`,
    m.enunciado && caja && caja.x >= m.enunciado.x - 1 && caja.der <= m.enunciado.der + 1, true);
}

async function escritorioDelQuiz(pagina, base, t) {
  const casos = [
    { ancho: 1023, alto: 800, oscuro: false },
    { ancho: 1024, alto: 800, oscuro: false }, { ancho: 1024, alto: 800, oscuro: true },
    { ancho: 1280, alto: 800, oscuro: false },
    { ancho: 1366, alto: 768, oscuro: false }, { ancho: 1366, alto: 768, oscuro: true },
    { ancho: 1920, alto: 1080, oscuro: false }, { ancho: 1920, alto: 1080, oscuro: true },
  ];
  for (const { ancho, alto, oscuro } of casos) {
    const n = `${ancho}${oscuro ? ' oscuro' : ' claro'}`;
    const columna = columnaDe(ancho);
    const dentro = (c, m, tol = 1) => c && cerca(c.x + c.ancho / 2, m.vista / 2, tol);

    // Semilla fija: la misma primera pregunta en cada caso, con explicación (la nota de abajo).
    t.ok(`${n}: llegó al quiz`, await entrarAlQuiz(pagina, base, { ancho, alto, oscuro, semilla: SEMILLA }), true);
    if (oscuro) t.ok(`${n}: tema oscuro activo`, await pagina.evaluar(ESTA_OSCURO), true);

    // Sin responder: regiones, anchos y orden de foco
    const a = await pagina.evaluar(MEDIR_ESCRITORIO);
    t.ok(`${n}: la barra del quiz va a todo el ancho`, a.barra && cerca(a.barra.ancho, a.vista, 1), true);
    t.ok(`${n}: el enunciado mide la columna (${columna})`, a.enunciado && cerca(a.enunciado.ancho, columna, 1), true);
    t.ok(`${n}: el enunciado va centrado`, dentro(a.enunciado, a), true);
    t.ok(`${n}: cada opción llena la columna`,
      a.opciones.length > 0 && a.opciones.every((o) => cerca(o.ancho, columna, 1)), true);
    t.ok(`${n}: las opciones se separan paso 2.5`,
      a.opciones.length > 1 && a.opciones.slice(1).every((o, i) =>
        cerca(o.y - (a.opciones[i].y + a.opciones[i].alto), 2.5 * PASO, 1)), true);
    t.ok(`${n}: cerrar y el contador quedan dentro de la columna`,
      a.cerrar && a.contador
      && a.cerrar.x >= (a.vista - columna) / 2 - 1 && a.contador.der <= (a.vista + columna) / 2 + 1, true);
    dentroDeLectura(t, n, a, 'la fila de contexto', a.contexto);
    t.ok(`${n}: cerrar mide 44 × 44`,
      a.cerrar && a.cerrar.ancho >= LADO_TACTIL && a.cerrar.alto >= LADO_TACTIL, true);
    t.ok(`${n}: cada opción mide al menos 44 de alto`,
      a.opciones.length > 0 && a.opciones.every((o) => o.alto >= LADO_TACTIL), true);
    t.ok(`${n}: sin scroll horizontal`, await pagina.evaluar(DESBORDA), 0);
    t.ok(`${n}: el documento no se ensancha`, a.scrollV <= a.vistaDoc + 1, true);
    t.ok(`${n}: ningún ancestro del contenido ni de la barra recorta con overflow`,
      `${a.recortesContenido} ${a.recortesBarra}`, '0 0');

    // DOM = visual: las regiones bajan en el orden del DOM y la barra va de izquierda a derecha.
    t.ok(`${n}: las regiones bajan: barra, contexto, enunciado, opciones`,
      bajan([a.barra, a.contexto, a.enunciado, ...a.opciones]), true);
    t.ok(`${n}: la barra va de izquierda a derecha: cerrar, progreso, contador`,
      a.cerrar && a.progreso && a.contador
      && a.cerrar.der <= a.progreso.x + 1 && a.progreso.der <= a.contador.x + 1, true);
    t.ok(`${n}: las opciones bajan en el orden visual`,
      a.opciones.every((o, i) => i === 0 || o.y > a.opciones[i - 1].y), true);
    await tabSigueLoVisual(pagina, t, n, 'sin responder', [{ id: 'cerrar-quiz', ...a.cerrar }, ...a.opciones]);

    // Respondida: nota, reporte y barra inferior
    t.ok(`${n}: respondió`, await responder(pagina, 0), true);
    const r = await pagina.evaluar(MEDIR_ESCRITORIO);
    t.ok(`${n}: la pregunta fija tiene nota de explicación`, r.nota !== null, true);
    t.ok(`${n}: la barra inferior va a todo el ancho`, r.barraInf && cerca(r.barraInf.ancho, r.vista, 1), true);
    t.ok(`${n}: el botón «Siguiente» mide la columna (${columna})`,
      r.siguiente && cerca(r.siguiente.ancho, columna, 1), true);
    t.ok(`${n}: el botón «Siguiente» va centrado`, dentro(r.siguiente, r), true);
    t.ok(`${n}: la nota mide la columna`, r.nota && cerca(r.nota.ancho, columna, 1), true);
    dentroDeLectura(t, n, r, '«Reportar pregunta»', r.reportar);
    t.ok(`${n}: la nota, «Reportar pregunta» y «Siguiente» bajan en ese orden`,
      bajan([r.enunciado, r.nota, r.reportar, r.siguiente]), true);
    t.ok(`${n}: «Reportar pregunta» y «Siguiente» miden 44 de alto`,
      r.reportar && r.siguiente && r.reportar.alto >= LADO_TACTIL && r.siguiente.alto >= LADO_TACTIL, true);
    t.ok(`${n}: respondida, sin scroll horizontal`, await pagina.evaluar(DESBORDA), 0);
    t.ok(`${n}: respondida, ningún ancestro recorta con overflow`,
      `${r.recortesContenido} ${r.recortesBarra}`, '0 0');
    await tabSigueLoVisual(pagina, t, n, 'respondida', [
      { id: 'boton-reportar', ...r.reportar }, { id: 'boton-siguiente', ...r.siguiente },
    ], 'cerrar-quiz');
  }
}

// Examen en curso en escritorio (EXA-P1 sobre ESC-P4; ficha ExamenEnCurso.md, E04c): sin
// retroalimentación, la misma columna `lectura` y el aviso dentro de ella.
async function escritorioDelExamenEnCurso(pagina, base, t) {
  const casos = [
    { ancho: 1024, alto: 800, oscuro: false },
    { ancho: 1366, alto: 768, oscuro: false }, { ancho: 1366, alto: 768, oscuro: true },
    { ancho: 1920, alto: 1080, oscuro: false }, { ancho: 1920, alto: 1080, oscuro: true },
  ];
  try {
    for (const { ancho, alto, oscuro } of casos) {
      const n = `examen ${ancho}${oscuro ? ' oscuro' : ' claro'}`;
      const columna = columnaDe(ancho);
      const dentro = (c, m) => c && cerca(c.x + c.ancho / 2, m.vista / 2, 1);
      await pagina.evaluar(BORRAR_ESTADISTICAS).catch(() => {});

      t.ok(`${n}: llegó al quiz con el resultado oculto`,
        await entrarAlQuiz(pagina, base, { ancho, alto, oscuro, ocultar: true, semilla: SEMILLA }), true);
      t.ok(`${n}: respondió`, await responder(pagina, 0), true);
      const r = await pagina.evaluar(MEDIR_ESCRITORIO);

      t.ok(`${n}: la barra del quiz y la inferior van a todo el ancho`,
        r.barra && r.barraInf && cerca(r.barra.ancho, r.vista, 1) && cerca(r.barraInf.ancho, r.vista, 1), true);
      t.ok(`${n}: el enunciado mide la columna (${columna}) y va centrado`,
        r.enunciado && cerca(r.enunciado.ancho, columna, 1) && dentro(r.enunciado, r), true);
      t.ok(`${n}: cada opción llena la columna`,
        r.opciones.length > 0 && r.opciones.every((o) => cerca(o.ancho, columna, 1)), true);
      t.ok(`${n}: «Siguiente» mide la columna y va centrado`,
        r.siguiente && cerca(r.siguiente.ancho, columna, 1) && dentro(r.siguiente, r), true);
      t.ok(`${n}: sin nota de explicación`, r.nota, null);
      t.ok(`${n}: el aviso «Resultado oculto hasta el final» mide la columna`,
        r.aviso && cerca(r.aviso.ancho, columna, 1), true);
      dentroDeLectura(t, n, r, 'el aviso', r.aviso);
      dentroDeLectura(t, n, r, 'la fila de contexto', r.contexto);
      dentroDeLectura(t, n, r, '«Reportar pregunta»', r.reportar);
      t.ok(`${n}: el aviso, «Reportar pregunta» y «Siguiente» bajan en ese orden`,
        bajan([r.enunciado, r.aviso, r.reportar, r.siguiente]), true);
      t.ok(`${n}: cerrar, progreso y contador van de izquierda a derecha`,
        r.cerrar && r.progreso && r.contador
        && r.cerrar.der <= r.progreso.x + 1 && r.progreso.der <= r.contador.x + 1, true);
      t.ok(`${n}: cerrar mide 44 × 44`,
        r.cerrar && r.cerrar.ancho >= LADO_TACTIL && r.cerrar.alto >= LADO_TACTIL, true);
      t.ok(`${n}: «Reportar pregunta» y «Siguiente» miden 44 de alto`,
        r.reportar && r.siguiente && r.reportar.alto >= LADO_TACTIL && r.siguiente.alto >= LADO_TACTIL, true);
      t.ok(`${n}: sin scroll horizontal`, await pagina.evaluar(DESBORDA), 0);
      t.ok(`${n}: ningún ancestro del contenido ni de la barra recorta con overflow`,
        `${r.recortesContenido} ${r.recortesBarra}`, '0 0');
      // Con el resultado oculto solo la opción elegida es control: tras cerrar, elegida,
      // reportar y siguiente.
      await tabSigueLoVisual(pagina, t, n, 'respondida', [
        r.opciones[0], { id: 'boton-reportar', ...r.reportar }, { id: 'boton-siguiente', ...r.siguiente },
      ], 'cerrar-quiz');
    }
  } finally {
    await pagina.evaluar(BORRAR_ESTADISTICAS).catch(() => {});
    await limpiarAjustes(pagina);
  }
}

// El arnés abre una página de 1300 px: para 1366 y 1920 hace falta una del ancho de la prueba.
function conNavegadorAncho(fn, { ancho, alto }) {
  return async function (_paginaDelArnes, base, t) {
    const navegador = await conectarNavegador(PUERTO_CDP);
    const pagina = await abrirPagina(navegador, { ancho, alto });
    try {
      await fn(pagina, base, t, navegador);
    } finally {
      await pagina.cerrar().catch(() => {});
      navegador.cerrar();
    }
  };
}

// ===========================================================================
// GRUPO A · corrección de 3.1 (teclado del control de tema, desborde, hover)
// ===========================================================================

// ===========================================================================
// Movimiento del quiz (REV-1, Quiz.md c.5) y foco tras «Siguiente» (REV-9, Quiz.md d.2).
// ===========================================================================

// Propiedades de un keyframe que no son estilo: `getKeyframes()` las agrega a cada cuadro.
const META_KEYFRAME = ['offset', 'computedOffset', 'easing', 'composite'];

// Espera, dentro del iframe, a que `getAnimations()` tenga al menos una animación y devuelve
// la foto de ese instante (o la foto vacía si pasan `ms`). Se lanza en paralelo con el toque:
// ve las animaciones en el primer cuadro en que existen.
const OBSERVAR_ANIMACIONES = (ms) => EN_MARCO(`
  return new Promise((resolver) => {
    const meta = ${JSON.stringify(META_KEYFRAME)};
    const foto = () => d.getAnimations().map((a) => {
      const destino = a.effect.target;
      const marca = destino.closest('[data-testid]');
      return {
        duracion: a.effect.getTiming().duration,
        curva: a.effect.getTiming().easing,
        props: Array.from(new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k))))
          .filter((p) => !meta.includes(p)),
        objetivo: marca ? marca.getAttribute('data-testid') : null,
        desde: a.effect.getKeyframes()[0].transform || null,
        contiene: Array.from(destino.querySelectorAll('[data-testid]')).map((n) => n.getAttribute('data-testid')),
        // La barra del quiz no se anima: ni ella, ni algo dentro, ni un ancestro que la contenga.
        enBarra: !!destino.closest('[data-testid="barra-quiz"]')
          || !!destino.querySelector('[data-testid="barra-quiz"]'),
      };
    });
    const hasta = w.performance.now() + ${ms};
    const paso = () => {
      const f = foto();
      if (f.length > 0 || w.performance.now() > hasta) return resolver(f);
      w.setTimeout(paso, 0);
    };
    paso();
  });
`);

const ANIMACIONES_EN_CURSO = EN_MARCO('return d.getAnimations().length;');
const FUERA_DE_OPACIDAD_1 = EN_MARCO(`
  return Array.from(d.querySelectorAll('*'))
    .filter((n) => w.getComputedStyle(n).opacity !== '1')
    .map((n) => n.getAttribute('data-testid') || n.tagName).slice(0, 5).join(',');
`);
const SCROLL_DEL_QUIZ = EN_MARCO(`
  let n = d.querySelector('[data-testid="enunciado-quiz"]');
  while (n && !(n.scrollHeight > n.clientHeight + 1 && /auto|scroll/.test(w.getComputedStyle(n).overflowY))) {
    n = n.parentElement;
  }
  return n ? n.scrollTop : null;
`);
const BAJAR_EL_QUIZ = EN_MARCO(`
  let n = d.querySelector('[data-testid="enunciado-quiz"]');
  while (n && !(n.scrollHeight > n.clientHeight + 1 && /auto|scroll/.test(w.getComputedStyle(n).overflowY))) {
    n = n.parentElement;
  }
  if (!n) return null;
  n.scrollTop = n.scrollHeight;
  return n.scrollTop;
`);

// Achica el marco para que la pregunta desborde y el contenedor del quiz sea desplazable.
const ACHICAR_MARCO = EN_MARCO("m.style.height = '320px'; return m.clientHeight;");

// Dos «Siguiente» seguidos dentro de la ventana del fundido del bloque (150 ms): el segundo
// cambia la clave con la animación del primero en curso. Con `cancel()` en la limpieza queda
// una sola animación por nodo; sin él, dos. Devuelve cuánto tardó el segundo cambio de pregunta
// desde el primero y el máximo de animaciones sobre un mismo nodo en ese instante.
const DOBLE_SIGUIENTE = EN_MARCO(`
  return new Promise((resolver) => {
    const q = (id) => d.querySelector('[data-testid="' + id + '"]');
    const contador = () => (q('contador-quiz') ? q('contador-quiz').textContent : null);
    const maxPorNodo = () => {
      const por = new Map();
      d.getAnimations().forEach((a) => por.set(a.effect.target, (por.get(a.effect.target) || 0) + 1));
      return Math.max(0, ...por.values());
    };
    const hasta = w.performance.now() + 8000;
    const inicial = contador();
    let fase = 0;
    let previo = inicial;
    let t0 = 0;
    q('boton-siguiente').click();
    const paso = () => {
      const ahora = w.performance.now();
      if (fase === 0 && contador() !== inicial) {
        t0 = ahora; previo = contador(); fase = 1;
        if (q('opcion-quiz-0')) q('opcion-quiz-0').click();
      } else if (fase === 1 && q('boton-siguiente')) {
        fase = 2; q('boton-siguiente').click();
      } else if (fase === 2 && contador() !== previo) {
        return resolver({ tardo: ahora - t0, max: maxPorNodo(), total: d.getAnimations().length });
      }
      if (ahora > hasta) return resolver(null);
      w.setTimeout(paso, 0);
    };
    paso();
  });
`);

const abarca = (foto, id) => foto.some((a) => a.objetivo === id || a.contiene.includes(id));
const soloOpacityYTransform = (foto) => foto.every((a) => a.props.every((p) => p === 'opacity' || p === 'transform'));
const todasBreves = (foto) => foto.every((a) => a.duracion > 0 && a.duracion <= 200);
// Quiz.md c.5: 150 ms con la curva cubic-bezier(0, 0, 0.2, 1) (el navegador la normaliza con espacios).
const CURVA_C5 = 'cubic-bezier(0, 0, 0.2, 1)';
const conLaDuracionYLaCurvaDeC5 = (foto) =>
  foto.length > 0 && foto.every((a) => a.duracion === 150 && a.curva === CURVA_C5);

// Responde la opción `idx` y devuelve la foto de las animaciones del primer cuadro.
async function responderObservando(pagina, idx) {
  const [foto, tocado] = await Promise.all([
    pagina.evaluar(OBSERVAR_ANIMACIONES(1500)),
    tocar(pagina, sel(`opcion-quiz-${idx}`)),
  ]);
  return tocado ? foto : null;
}

async function siguienteObservando(pagina) {
  const [foto] = await Promise.all([
    pagina.evaluar(OBSERVAR_ANIMACIONES(1500)),
    siguiente(pagina),
  ]);
  return foto;
}

const FOCO_EN_OPCION = (i) => EN_MARCO(`
  const a = d.activeElement;
  return !!a && !!a.closest('[data-testid="opcion-quiz-${i}"]');
`);
const FOCO_VISIBLE_EN_OPCION = (i) => EN_MARCO(`
  const a = d.activeElement;
  const o = d.querySelector('[data-testid="opcion-quiz-${i}"]');
  return !!a && !!o && o.contains(a) && a.matches(':focus-visible');
`);

async function movimientoDelQuiz(pagina, base, t) {
  const T = plancha.claro;
  try {
    t.ok('llegó al quiz', await entrarAlQuiz(pagina, base, { semilla: SEMILLA }), true);
    await espera(300);
    t.ok('c.5: sin responder no hay animaciones en curso', await pagina.evaluar(ANIMACIONES_EN_CURSO), 0);

    // 1 y 3: al responder, las piezas nuevas entran con fundido; la opción tocada, no.
    const foto = await responderObservando(pagina, 0);
    t.ok('c.5 #1: respondió y hay animaciones en el primer cuadro', foto !== null && foto.length > 0, true);
    if (foto === null) return;
    const estados = await pagina.evaluar(EN_MARCO(
      "return Array.from(d.querySelectorAll('[data-testid^=\"estado-opcion-\"]')).map((n) => n.getAttribute('data-testid'));"));
    t.ok('c.5 #1: hay línea de estado y nota', estados.length > 0 && await existe(pagina, sel('nota-explicacion')), true);
    for (const id of [...estados, 'nota-explicacion', 'boton-reportar', 'barra-inferior']) {
      t.ok(`c.5 #1: ${id} entra con una animación`, abarca(foto, id), true);
    }
    t.ok('c.5 #1: todas duran 200 ms como máximo', todasBreves(foto), true);
    t.ok('c.5 #1: los keyframes solo tocan opacity y transform', soloOpacityYTransform(foto), true);
    t.ok('c.5: todas duran 150 ms con la curva cubic-bezier(0, 0, 0.2, 1)',
      conLaDuracionYLaCurvaDeC5(foto), true);
    // La lámina de la barra solo se funde; su contenido interior se desplaza (alto reservado).
    const barra = foto.filter((a) => a.objetivo === 'barra-inferior');
    t.ok('c.5: el contenedor de la barra inferior anima solo opacity',
      barra.length > 0 && barra.every((a) => a.props.join() === 'opacity'), true);
    const contenido = foto.filter((a) => a.objetivo === 'barra-inferior-contenido');
    t.ok('c.5: el contenido de la barra inferior anima transform',
      contenido.length > 0 && contenido.every((a) => a.props.includes('transform')), true);
    t.ok('c.5: el keyframe 0 del contenido es translateY(8px)',
      contenido.length > 0 && contenido.every((a) => a.desde === 'translateY(8px)'), true);
    t.ok('c.5: lo demás es solo opacity',
      foto.filter((a) => !['barra-inferior-contenido'].includes(a.objetivo))
        .every((a) => a.props.join() === 'opacity'), true);
    t.ok('c.5: la barra del quiz no se anima', foto.some((a) => a.enBarra), false);
    t.ok('c.5 #3: la letra y el texto de la opción tocada no se animan',
      abarca(foto, 'letra-opcion-quiz-0') || abarca(foto, 'texto-opcion-quiz-0'), false);
    const tocada = await pagina.evaluar(LEER(sel('opcion-quiz-0')));
    t.ok('c.5 #3: la opción tocada ya está en su estado final, sin opacidad',
      tocada !== null && `${tocada.bordeAncho} ${tocada.opacidad}`, '2px 1');
    t.ok('c.5 #3: marco `acierto` o `error`',
      tocada !== null && [rgb(T.acierto), rgb(T.error)].includes(tocada.borde), true);

    // 5: en reposo nada queda animando ni a medias.
    await espera(300);
    t.ok('c.5 #5: respondida y en reposo, sin animaciones', await pagina.evaluar(ANIMACIONES_EN_CURSO), 0);
    t.ok('c.5 #5: ningún elemento con opacity distinta de 1', await pagina.evaluar(FUERA_DE_OPACIDAD_1), '');

    // 4: «Siguiente» sube el scroll y el bloque de la pregunta entra con fundido. Con el marco
    // achicado el contenedor desborda, también con la pregunta nueva: sin el `scrollTo` queda abajo.
    await pagina.evaluar(ACHICAR_MARCO);
    const bajo = await pagina.evaluar(BAJAR_EL_QUIZ);
    t.ok('c.5 #4: el contenedor del quiz es desplazable y quedó bajado (si falla: el marco no quedó achicado y la pregunta nueva no desborda)', typeof bajo === 'number' && bajo > 0, true);
    const fotoNext = await siguienteObservando(pagina);
    t.ok('c.5 #4: pasó de pregunta con animaciones', fotoNext.length > 0, true);
    t.ok('c.5 #4: el bloque de contexto, enunciado y opciones entra', abarca(fotoNext, 'enunciado-quiz'), true);
    t.ok('c.5 #4: duran 200 ms como máximo y solo tocan opacity',
      todasBreves(fotoNext) && fotoNext.every((a) => a.props.join() === 'opacity'), true);
    t.ok('c.5 #4: la barra del quiz no se anima', fotoNext.some((a) => a.enBarra), false);
    const scroll = await pagina.evaluar(SCROLL_DEL_QUIZ);
    t.ok('c.5 #4: el scroll vuelve arriba (scrollTop 0 en un contenedor desplazable)', scroll, 0);
    t.ok('c.5 #4: duran 150 ms con la curva cubic-bezier(0, 0, 0.2, 1)',
      conLaDuracionYLaCurvaDeC5(fotoNext), true);
    await espera(300);
    t.ok('c.5 #5: tras «Siguiente» y en reposo, sin animaciones', await pagina.evaluar(ANIMACIONES_EN_CURSO), 0);
    t.ok('c.5 #5: tras «Siguiente», ningún elemento con opacity distinta de 1',
      await pagina.evaluar(FUERA_DE_OPACIDAD_1), '');
  } finally {
    await limpiarAjustes(pagina);
  }
}

async function movimientoReducido(pagina, base, t) {
  try {
    await pagina.enviar('Emulation.setEmulatedMedia',
      { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    t.ok('llegó al quiz', await entrarAlQuiz(pagina, base, { semilla: SEMILLA }), true);
    t.ok('el marco ve prefers-reduced-motion: reduce',
      await pagina.evaluar(EN_MARCO("return w.matchMedia('(prefers-reduced-motion: reduce)').matches;")), true);

    const foto = await responderObservando(pagina, 0);
    t.ok('c.5 #2: respondió', foto !== null && await existe(pagina, sel('barra-inferior')), true);
    t.ok('c.5 #2: al responder no hay ninguna animación', foto !== null && foto.length, 0);
    const siguienteFoto = await siguienteObservando(pagina);
    t.ok('c.5 #2: pasó de pregunta', await pagina.evaluar(LEER(sel('contador-quiz'))) !== null
      && (await pagina.evaluar(LEER(sel('contador-quiz')))).texto.startsWith('02 /'), true);
    t.ok('c.5 #2: tras «Siguiente» no hay ninguna animación', siguienteFoto.length, 0);
  } finally {
    await pagina.enviar('Emulation.setEmulatedMedia',
      { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] }).catch(() => {});
    await limpiarAjustes(pagina);
  }
}

async function movimientoDelExamenEnCurso(pagina, base, t) {
  try {
    t.ok('llegó al quiz con el resultado oculto',
      await entrarAlQuiz(pagina, base, { ocultar: true, semilla: SEMILLA }), true);
    await espera(300);
    const foto = await responderObservando(pagina, 0);
    t.ok('EXA-P1: respondió y hay animaciones', foto !== null && foto.length > 0, true);
    if (foto === null) return;
    for (const id of ['aviso-resultado-oculto', 'boton-reportar', 'barra-inferior']) {
      t.ok(`EXA-P1: ${id} entra con una animación`, abarca(foto, id), true);
    }
    t.ok('EXA-P1: sin nota de explicación', await existe(pagina, sel('nota-explicacion')), false);
    t.ok('EXA-P1: duran 200 ms como máximo y solo tocan opacity y transform',
      todasBreves(foto) && soloOpacityYTransform(foto), true);
    t.ok('EXA-P1: duran 150 ms con la curva cubic-bezier(0, 0, 0.2, 1)',
      conLaDuracionYLaCurvaDeC5(foto), true);
    t.ok('EXA-P1: la barra del quiz no se anima', foto.some((a) => a.enBarra), false);
    t.ok('EXA-P1: la opción elegida no se anima', abarca(foto, 'letra-opcion-quiz-0')
      || abarca(foto, 'texto-opcion-quiz-0'), false);
    await espera(300);
    t.ok('EXA-P1: en reposo, sin animaciones ni opacity distinta de 1',
      `${await pagina.evaluar(ANIMACIONES_EN_CURSO)} ${await pagina.evaluar(FUERA_DE_OPACIDAD_1)}`, '0 ');
  } finally {
    await limpiarAjustes(pagina);
  }
}

// Enter o Espacio sobre «Siguiente»: la barra se desmonta y el foco pasa a la primera opción.
async function teclaSobreSiguiente(pagina, t, n, tecla = 'Enter') {
  const nombre = tecla === ' ' ? 'Espacio' : tecla;
  t.ok(`${n}: Tab llega a «Siguiente»`, await enfocarConTab(pagina, sel('boton-siguiente')), true);
  const antes = (await pagina.evaluar(LEER(sel('contador-quiz')))).texto;
  await pagina.tecla(tecla);
  t.ok(`${n}: ${nombre} pasa de pregunta`, await pagina.esperarA(async () =>
    (await pagina.evaluar(LEER(sel('contador-quiz')))).texto !== antes, { limite: 5000 }), true);
  t.ok(`${n}: el foco queda dentro de opcion-quiz-0`,
    await pagina.esperarA(() => pagina.evaluar(FOCO_EN_OPCION(0)), { limite: 3000 }), true);
  await pagina.tecla('Tab');
  t.ok(`${n}: el Tab siguiente va a la opción B`, await pagina.evaluar(FOCO_EN_OPCION(1)), true);
}

async function focoTrasSiguiente(pagina, base, t) {
  try {
    t.ok('llegó al quiz', await entrarAlQuiz(pagina, base, { semilla: SEMILLA }), true);
    t.ok('respondió con el teclado de fondo', await responder(pagina, 0), true);
    await teclaSobreSiguiente(pagina, t, 'REV-9 teclado');

    // Con puntero el foco no se mueve y no aparece contorno.
    t.ok('respondió la segunda', await responder(pagina, 0), true);
    t.ok('«Siguiente» con puntero', await siguiente(pagina), true);
    await espera(300);
    t.ok('REV-9 puntero: la opción 0 no recibe foco visible', await pagina.evaluar(FOCO_VISIBLE_EN_OPCION(0)), false);
    t.ok('REV-9 puntero: el foco no queda dentro de la opción 0', await pagina.evaluar(FOCO_EN_OPCION(0)), false);

    // Con Espacio pasa lo mismo que con Enter.
    t.ok('respondió la tercera', await responder(pagina, 0), true);
    await teclaSobreSiguiente(pagina, t, 'REV-9 teclado (Espacio)', ' ');
  } finally {
    await limpiarAjustes(pagina);
  }
}

async function focoTrasSiguienteEnElExamen(pagina, base, t) {
  try {
    t.ok('llegó al quiz con el resultado oculto',
      await entrarAlQuiz(pagina, base, { ocultar: true, semilla: SEMILLA }), true);
    t.ok('respondió', await responder(pagina, 0), true);
    await teclaSobreSiguiente(pagina, t, 'REV-9 examen');
  } finally {
    await limpiarAjustes(pagina);
  }
}

// «Ver resultados» (última pregunta) no es «Siguiente»: no mueve el foco a una opción.
const ESPIA_DE_FOCO = EN_MARCO(`
  const proto = w.HTMLElement.prototype, original = proto.focus;
  w.__enfocados = [];
  proto.focus = function (...args) {
    const dueno = this.closest && this.closest('[data-testid]');
    w.__enfocados.push(dueno ? dueno.getAttribute('data-testid') : '');
    return original.apply(this, args);
  };
  return Array.isArray(w.__enfocados);
`);
const LEER_ESPIA_DE_FOCO = EN_MARCO('return w.__enfocados || [];');

async function focoEnVerResultados(pagina, base, t) {
  try {
    t.ok('llegó al quiz', await entrarAlQuiz(pagina, base, { semilla: SEMILLA }), true);
    let ultima = false;
    for (let i = 0; i < 80 && !ultima; i++) {
      if (!await responder(pagina, 0)) break;
      const boton = await pagina.evaluar(LEER(sel('boton-siguiente')));
      ultima = !!boton && boton.texto.toLowerCase().includes('ver resultados');
      if (!ultima && !await siguiente(pagina)) break;
    }
    t.ok('llegó a la última pregunta («Ver resultados»)', ultima, true);
    if (!ultima) return;
    t.ok('REV-9 última: Tab llega a «Ver resultados»', await enfocarConTab(pagina, sel('boton-siguiente')), true);
    // El quiz se desmonta al navegar, así que mirar el foco después no prueba nada: un espía de
    // `focus()` anota el `data-testid` de cada llamada, antes del `Enter`.
    t.ok('REV-9 última: espía de focus() instalado', await pagina.evaluar(ESPIA_DE_FOCO), true);
    await pagina.tecla('Enter');
    t.ok('REV-9 última: Enter lleva a /resultados', await esperarRuta(pagina, '/resultados'), true);
    const enfocados = await pagina.evaluar(LEER_ESPIA_DE_FOCO);
    t.ok('REV-9 última: ningún focus() apuntó a una opción',
      enfocados.filter((id) => /^opcion-quiz-/.test(id)).join(','), '');
  } finally {
    await limpiarAjustes(pagina);
  }
}

// Dos «Siguiente» dentro de los 150 ms del fundido del bloque: el `cancel()` de la limpieza
// (c.5, mecanismo) deja una sola animación por nodo y nada colgado en reposo. Si la máquina
// está tan cargada que el segundo cambio cae fuera de la ventana, repite con la pregunta siguiente.
async function siguienteDuranteElFundido(pagina, base, t) {
  try {
    t.ok('llegó al quiz', await entrarAlQuiz(pagina, base, { semilla: SEMILLA }), true);
    let res = null;
    for (let intento = 0; intento < 4; intento++) {
      if (!await responder(pagina, 0)) break;
      await espera(300);
      res = await pagina.evaluar(DOBLE_SIGUIENTE);
      if (res === null || res.tardo < 150) break;
    }
    t.ok('dos «Siguiente» cayeron dentro de los 150 ms del fundido', res !== null && res.tardo < 150, true);
    if (res === null) return;
    t.ok('c.5 mecanismo: ningún nodo con dos animaciones a la vez', res.max <= 1, true);
    await espera(300);
    t.ok('c.5 mecanismo: en reposo, sin animaciones colgadas', await pagina.evaluar(ANIMACIONES_EN_CURSO), 0);
    t.ok('c.5 mecanismo: en reposo, ningún elemento con opacity distinta de 1',
      await pagina.evaluar(FUERA_DE_OPACIDAD_1), '');
  } finally {
    await limpiarAjustes(pagina);
  }
}

module.exports = [
  { nombre: 'confirmación al abandonar un quiz', correr: confirmarAlSalirDelQuiz },
  { nombre: 'la X del quiz pregunta una sola vez', correr: laXDelQuizPreguntaUnaVez },
  { nombre: 'dre: examen de 50 sin filtro de parcial', correr: suiteExamenSinParciales('Digestivo, Renal y Endócrino', 50) },
  { nombre: 'ryd: examen de 20 sin filtro de parcial', correr: suiteExamenSinParciales('Reproductor y Desarrollo', 20) },
  { nombre: 'Barra interna: quiz sin barra y el atrás confirma', correr: quizSinBarraYAtrasConfirma },
  { nombre: 'Quiz Plancha: barra propia, opciones, nota y reporte (claro)', correr: conNavegador(quizClaro) },
  { nombre: 'Quiz Plancha: barra propia, opciones, nota y reporte (oscuro)', correr: conNavegador(quizOscuro) },
  { nombre: 'Quiz Plancha: progreso por casillas hasta 40', correr: conNavegador(progresoPorCasillas) },
  { nombre: 'Quiz Plancha: progreso por barra continua con más de 40', correr: conNavegador(progresoPorBarra) },
  { nombre: 'Quiz Plancha: temporizador y alerta bajo 120 s', correr: conNavegador(temporizadorYAlerta) },
  { nombre: 'Quiz Plancha: examen en curso (resultado oculto)', correr: conNavegador(examenEnCurso) },
  { nombre: 'Quiz Plancha: anchos 320, 360 y 768', correr: conNavegador(anchosDelQuiz) },
  { nombre: 'Quiz Plancha: escritorio 1023, 1024, 1280, 1366 y 1920 (lectura)', correr: conNavegadorAncho(escritorioDelQuiz, { ancho: 1920, alto: 1200 }) },
  { nombre: 'Quiz Plancha: examen en curso en escritorio 1024, 1366 y 1920', correr: conNavegadorAncho(escritorioDelExamenEnCurso, { ancho: 1920, alto: 1200 }) },
  { nombre: 'Quiz Plancha: movimiento de entrada (REV-1, c.5)', correr: conNavegador(movimientoDelQuiz) },
  { nombre: 'Quiz Plancha: movimiento reducido (REV-1, c.5 #2)', correr: conNavegador(movimientoReducido) },
  { nombre: 'Quiz Plancha: movimiento del examen en curso (REV-1, EXA-P1)', correr: conNavegador(movimientoDelExamenEnCurso) },
  { nombre: 'Quiz Plancha: foco tras «Siguiente» (REV-9)', correr: conNavegador(focoTrasSiguiente) },
  { nombre: 'Quiz Plancha: foco tras «Siguiente» en el examen en curso (REV-9)', correr: conNavegador(focoTrasSiguienteEnElExamen) },
  { nombre: 'Quiz Plancha: «Ver resultados» no mueve el foco (REV-9)', correr: conNavegador(focoEnVerResultados) },
  { nombre: 'Quiz Plancha: «Siguiente» durante el fundido (REV-1, c.5)', correr: conNavegador(siguienteDuranteElFundido) },
];

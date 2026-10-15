// Suite «barra» del arnés end-to-end (ver ../README.md): la barra interna de las cinco rutas
// que la llevan (tarea 3.12) contra comun.md §3 y §7.2.
//
//   - Orden: la barra precede al contenido en el DOM y en el orden de Tab (D10). La primera
//     parada de Tab dentro de la pantalla es «Volver» y el contenido va después (lectores de
//     pantalla incluidos: leen en orden de DOM).
//   - Ancho: el contenido de la barra va dentro de la hoja de su superficie (mapa ruta →
//     ancho, `BARRA`), a 1366 y a 1920.
//   - Barras clásicas: con barras de desplazamiento de 15 px visibles, el contenido de la
//     barra queda alineado con la hoja. El arnés oculta las barras (`--hide-scrollbars`):
//     esa prueba lanza su propio Chrome, sin la opción, y fuerza `::-webkit-scrollbar`. Si la
//     ventana cambia de tamaño y la barra de desplazamiento aparece o desaparece, la barra se
//     vuelve a alinear (el `ResizeObserver` de `BarraInterna`).
//   - Reposo: con la pantalla quieta, la barra no mide en bucle (callbacks del observador y
//     lecturas de estilo acotados).

const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { conectarNavegador, abrirPagina } = require('../cdp');
const { rutaChrome } = require('../entorno');
const { ANCHOS } = require('../../../src/components/plancha/cortes');
const { CORTE_AMPLIO } = require('../../../src/components/plancha/cortes');
const { EN_MARCO, abrirMarco, irAHomeEnMarco } = require('./comunes');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const pausa = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// Primer tema real de BCyT (topics.js es ESM: se lee como texto).
const TEMA = fs.readFileSync(path.join(RAIZ, 'src', 'materias', 'bcyt', 'topics.js'), 'utf8')
  .match(/'([a-z0-9-]+)':\s*'([^']+)'/)[1];

const RESPUESTAS = Array.from({ length: 3 }, (_, i) => ({
  question: {
    id: `e2e-barra-${i + 1}`,
    question: `Enunciado de prueba ${i + 1}`,
    options: ['Opción uno', 'Opción dos', 'Opción tres', 'Opción cuatro'],
    correctIndex: 1,
    explanation: `Explicación de prueba ${i + 1}`,
    topic: TEMA,
  },
  selectedIndex: i === 0 ? 0 : 1,
  isCorrect: i !== 0,
}));

// Las cinco rutas con barra: pantalla, parámetros, ruta de la URL, ancho de su hoja (nombre
// en `ANCHOS`; comun.md §7.2) y si lleva «Volver» (Results la oculta: `sinVolver`).
const RUTAS = [
  { nombre: 'TopicSelect', params: { mode: 'practice' }, url: '/temas/practice', hoja: 'hoja-amplia', volver: true },
  { nombre: 'Results', params: { answers: RESPUESTAS, topic: TEMA, mode: 'practice' }, url: '/resultados', hoja: 'hoja', volver: false },
  { nombre: 'Stats', params: undefined, url: '/estadisticas', hoja: 'hoja-amplia', volver: true },
  { nombre: 'Settings', params: undefined, url: '/ajustes', hoja: 'hoja', volver: true },
  { nombre: 'AddQuestion', params: undefined, url: '/agregar', hoja: 'lectura', volver: true },
];

// Ancho de la hoja a una ventana: `hoja-amplia` pasa de 952 a 1440 desde `amplio` (1440 px).
const topeDe = (hoja, ancho) => (hoja === 'hoja-amplia' && ancho < CORTE_AMPLIO ? ANCHOS.hoja : ANCHOS[hoja]);

const RUTA = EN_MARCO('return w.location.pathname;');

// Toma el `navigation` de la pantalla montada desde el árbol de React y navega.
const NAVEGAR = (nombre, params) => EN_MARCO(`
  for (const n of Array.from(d.querySelectorAll('*'))) {
    const k = Object.keys(n).find((x) => x.startsWith('__reactFiber$'));
    if (!k) continue;
    for (let f = n[k]; f; f = f.return) {
      const nav = f.memoizedProps && f.memoizedProps.navigation;
      if (nav && typeof nav.navigate === 'function') {
        nav.navigate(${JSON.stringify(nombre)}, ${JSON.stringify(params)});
        return true;
      }
    }
  }
  return false;
`);

// La barra, su fila y el contenido de la pantalla visible. `antes` lista las hojas de texto
// y los enfocables que NO siguen a la barra en el DOM (tiene que estar vacía).
const MEDIR = EN_MARCO(`
  const barra = visibles('[data-testid="barra-interna"]')[0];
  if (!barra) return null;
  const fuera = (n) => !barra.contains(n);
  const sigue = (n) => !!(barra.compareDocumentPosition(n) & 4);
  const nombre = (n) => (n.getAttribute('aria-label') || n.getAttribute('placeholder') ||
    n.textContent || n.tagName).trim().slice(0, 30);
  const hojas = visibles('*').filter((n) => fuera(n) && n.children.length === 0 && n.textContent.trim());
  const enfocables = visibles('[tabindex="0"], a[href], button, input, textarea, select').filter(fuera);
  const titulo = barra.querySelector('[data-testid="barra-titulo"]');
  const fila = titulo.parentElement.getBoundingClientRect();
  const b = barra.getBoundingClientRect();
  const volver = barra.querySelector('[data-testid="barra-volver"]');
  const vr = volver ? volver.getBoundingClientRect() : null;
  // El contenedor de scroll de la pantalla: el visible, fuera de la barra, más ancho.
  const scrolls = visibles('*').filter((n) => fuera(n) && !n.contains(barra) &&
    /^(auto|scroll)$/.test(w.getComputedStyle(n).overflowY))
    .sort((x, y) => (y.scrollHeight > y.clientHeight + 1) - (x.scrollHeight > x.clientHeight + 1) ||
      y.getBoundingClientRect().width - x.getBoundingClientRect().width);
  const sc = scrolls[0] || null;
  const sr = sc ? sc.getBoundingClientRect() : null;
  return {
    vista: w.innerWidth,
    barra: { izq: b.left, der: b.right },
    fila: { izq: fila.left, der: fila.right, ancho: fila.width, centro: fila.left + fila.width / 2 },
    volver: vr ? { izq: vr.left, ancho: vr.width } : null,
    tituloTexto: titulo.textContent.trim(),
    nHojas: hojas.length,
    nEnfocables: enfocables.length,
    antes: hojas.concat(enfocables).filter((n) => !sigue(n)).map(nombre).slice(0, 5),
    scroll: sc ? {
      izq: sr.left, ancho: sr.width, cliente: sc.clientWidth,
      barra: sc.offsetWidth - sc.clientWidth,
      desborda: sc.scrollHeight > sc.clientHeight + 1,
    } : null,
  };
`);

// El elemento enfocado: su nombre y si es un nodo de la barra interna (no su nombre: los
// «Volver» del contenido se llaman igual).
const ACTIVO = EN_MARCO(`
  const a = d.activeElement;
  if (!a || a === d.body) return null;
  const barra = visibles('[data-testid="barra-interna"]')[0];
  return {
    nombre: (a.getAttribute('aria-label') || a.getAttribute('placeholder') || a.textContent || '').trim().slice(0, 40),
    enBarra: !!barra && barra.contains(a),
  };
`);

// Tab real desde el inicio del documento (sin foco forzado): las primeras paradas, cada una
// `{ nombre, enBarra }`.
async function primerasParadas(pagina, cuantas = 3) {
  await pagina.evaluar(EN_MARCO(`
    m.contentWindow.focus();
    if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
    return true;
  `));
  await pausa(80);
  const vistos = [];
  for (let i = 0; i < 6 && vistos.length < cuantas; i++) {
    await pagina.tecla('Tab');
    const activo = await pagina.evaluar(ACTIVO);
    // `null`: el foco sobre el documento, no una parada.
    if (activo !== null) vistos.push(activo);
  }
  return vistos;
}

async function entrarAHome(pagina, base, ancho, alto) {
  // La ventana de la página mide 900: un marco más ancho queda fuera y sus toques no llegan.
  if (ancho > 900) {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: ancho, height: Math.max(alto, 900), deviceScaleFactor: 1, mobile: false });
  }
  if (!await abrirMarco(pagina, base, ancho, alto)) return false;
  return irAHomeEnMarco(pagina);
}

// Va a la ruta, espera la barra y deja el marco listo; `volverAHome` deshace el paso.
async function irARuta(pagina, ruta) {
  if (!await pagina.evaluar(NAVEGAR(ruta.nombre, ruta.params))) return false;
  if (!await pagina.esperarA(async () => await pagina.evaluar(RUTA) === ruta.url)) return false;
  const lista = await pagina.esperarA(async () => {
    const m = await pagina.evaluar(MEDIR);
    return !!m && m.nHojas > 0;
  }, { limite: 8000 });
  await pausa(150);
  return lista;
}

async function volverAHome(pagina) {
  await pagina.evaluar(EN_MARCO('w.history.back(); return true;'));
  return pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/inicio');
}

// ---------------------------------------------------------------------------
// 1 · Orden de DOM y de Tab, a 390 y a 1366.

async function ordenDeDomYDeTab(pagina, base, t) {
  for (const ancho of [390, 1366]) {
    t.ok(`${ancho} px · entra a Home`, await entrarAHome(pagina, base, ancho, 800), true);
    for (const ruta of RUTAS) {
      const c = (s) => `${ancho} px · ${ruta.nombre} · ${s}`;
      if (!await irARuta(pagina, ruta)) {
        t.ok(c('llega a su ruta con barra'), false, true);
        continue;
      }
      const m = await pagina.evaluar(MEDIR);
      t.ok(c('hay contenido que comparar con la barra'), m.nHojas > 0 && m.nEnfocables > 0, true);
      t.ok(c('la barra precede en el DOM a todo el contenido'), JSON.stringify(m.antes), '[]');
      t.ok(c(ruta.volver ? 'la barra lleva «Volver»' : 'la barra no lleva «Volver»'), !!m.volver, ruta.volver);

      const paradas = await primerasParadas(pagina);
      if (ruta.volver) {
        t.ok(c('la primera parada de Tab es «Volver», en la barra'),
          paradas.length > 0 && paradas[0].nombre === 'Volver' && paradas[0].enBarra, true);
        t.ok(c('la segunda parada de Tab es contenido, no la barra'), paradas.length > 1 && !paradas[1].enBarra, true);
      } else {
        t.ok(c('sin «Volver», Tab no se detiene en la barra'),
          paradas.length > 0 && paradas.every((p) => !p.enBarra), true);
      }
      await volverAHome(pagina);
    }
  }
}

// ---------------------------------------------------------------------------
// 2 · Mapa ruta → ancho de la barra, a 1366 y a 1920.

async function anchoPorRuta(pagina, base, t) {
  for (const ancho of [1366, 1920]) {
    t.ok(`${ancho} px · entra a Home`, await entrarAHome(pagina, base, ancho, 800), true);
    for (const ruta of RUTAS) {
      const c = (s) => `${ancho} px · ${ruta.nombre} · ${s}`;
      if (!await irARuta(pagina, ruta)) {
        t.ok(c('llega a su ruta con barra'), false, true);
        continue;
      }
      const m = await pagina.evaluar(MEDIR);
      const tope = topeDe(ruta.hoja, ancho);
      t.ok(c(`el contenido de la barra mide la hoja \`${ruta.hoja}\` (${tope} px)`), Math.round(m.fila.ancho), tope);
      t.ok(c('el contenido de la barra está centrado en la ventana'),
        Math.abs(m.fila.centro - m.vista / 2) <= 1, true);
      t.ok(c('el filete de la barra ocupa todo el ancho'),
        Math.abs(m.barra.izq) < 1 && Math.abs(m.barra.der - m.vista) < 1, true);
      await volverAHome(pagina);
    }
  }
}

// ---------------------------------------------------------------------------
// 3 · Barras de desplazamiento clásicas (15 px): la barra queda alineada con la hoja.

function puertoLibre() {
  return new Promise((listo, falla) => {
    const sonda = net.createServer();
    sonda.once('error', falla);
    sonda.listen(0, () => {
      const { port } = sonda.address();
      sonda.close(() => listo(port));
    });
  });
}

const BARRAS_15 = '*::-webkit-scrollbar { width: 15px; height: 15px; } *::-webkit-scrollbar-thumb { background: #888; }';

// El Chrome del arnés se lanza con `--hide-scrollbars`: esta prueba lanza el suyo, sin la
// opción, y limpia el proceso y el perfil pase lo que pase.
async function conChromeConBarras(accion) {
  const puerto = await puertoLibre();
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'pkapp-e2e-barras-'));
  const proceso = spawn(rutaChrome(), [
    '--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank',
  ], { stdio: 'ignore' });
  let navegador;
  try {
    const hasta = Date.now() + 20000;
    for (;;) {
      try { await fetch(`http://127.0.0.1:${puerto}/json/version`); break; } catch {
        if (Date.now() > hasta) throw new Error('Chrome con barras no respondió');
        await pausa(200);
      }
    }
    navegador = await conectarNavegador(puerto);
    return await accion(navegador);
  } finally {
    if (navegador) navegador.cerrar();
    try { proceso.kill('SIGKILL'); } catch { /* ya no está */ }
    // Chrome escribe en el perfil hasta salir: borrar sin esperar su 'exit' da ENOTEMPTY.
    if (proceso.exitCode === null && proceso.signalCode === null) {
      await new Promise((listo) => {
        const tope = setTimeout(listo, 5000);
        proceso.once('exit', () => { clearTimeout(tope); listo(); });
      });
    }
    fs.rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

async function barrasClasicas(_paginaDelArnes, base, t) {
  await conChromeConBarras(async (navegador) => {
    const pagina = await abrirPagina(navegador);
    try {
      for (const ancho of [1024, 1366]) {
        t.ok(`${ancho} px · barras clásicas · entra a Home`, await entrarAHome(pagina, base, ancho, 200), true);
        // Las barras clásicas se fuerzan dentro del marco (la app, no la página del arnés).
        await pagina.evaluar(EN_MARCO(`
          const s = d.createElement('style');
          s.textContent = ${JSON.stringify(BARRAS_15)};
          d.head.appendChild(s);
          return true;
        `));
        for (const ruta of RUTAS) {
          const c = (s) => `${ancho} px · barras clásicas · ${ruta.nombre} · ${s}`;
          if (!await irARuta(pagina, ruta)) {
            t.ok(c('llega a su ruta con barra'), false, true);
            continue;
          }
          const m = await pagina.evaluar(MEDIR);
          t.ok(c('hay un contenedor de scroll'), !!m.scroll, true);
          if (!m.scroll) { await volverAHome(pagina); continue; }
          t.ok(c('el contenido desborda (hay barra de desplazamiento visible)'), m.scroll.desborda, true);
          t.ok(c('la barra de desplazamiento mide 15 px'), m.scroll.barra, 15);
          // La hoja no pasa del ancho que deja la barra de desplazamiento menos el margen lateral
          // `paso 8` de cada lado (a 1024, 1009 − 64 = 945).
          const tope = Math.min(topeDe(ruta.hoja, ancho), m.scroll.cliente - 2 * 8 * 4);
          t.ok(c(`el contenido de la barra mide la hoja (${tope} px)`), Math.round(m.fila.ancho), tope);
          const centroHoja = m.scroll.izq + m.scroll.cliente / 2;
          t.ok(c('el contenido de la barra está centrado sobre la hoja (sin correrse 7,5 px)'),
            Math.abs(m.fila.centro - centroHoja) <= 1, true);
          t.ok(c('la barra y su filete ocupan todo el ancho de la ventana'),
            Math.abs(m.barra.izq) < 1 && Math.abs(m.barra.der - m.vista) < 1, true);
          await volverAHome(pagina);
        }
      }
    } finally {
      await pagina.cerrar();
    }
  });
}

// ---------------------------------------------------------------------------
// 4 · Reflujo: la barra de desplazamiento aparece o desaparece al cambiar el alto de la
// ventana, y la barra se vuelve a alinear con la hoja.

const ALTO_MARCO = (px) => EN_MARCO(`m.style.height = '${px}px'; return true;`);

async function reflujoDeBarras(_paginaDelArnes, base, t) {
  await conChromeConBarras(async (navegador) => {
    const pagina = await abrirPagina(navegador);
    const ajustes = RUTAS.find((r) => r.nombre === 'Settings');
    try {
      t.ok('1366 px · reflujo · entra a Home', await entrarAHome(pagina, base, 1366, 900), true);
      await pagina.evaluar(EN_MARCO(`
        const s = d.createElement('style');
        s.textContent = ${JSON.stringify(BARRAS_15)};
        d.head.appendChild(s);
        return true;
      `));
      t.ok('1366 px · reflujo · llega a Ajustes', await irARuta(pagina, ajustes), true);
      const alineada = async () => {
        const m = await pagina.evaluar(MEDIR);
        return !!m && !!m.scroll && Math.abs(m.fila.centro - (m.scroll.izq + m.scroll.cliente / 2)) <= 1;
      };
      for (const [paso, alto, barra] of [['alto', 900, 0], ['bajo', 250, 15], ['alto otra vez', 900, 0]]) {
        const c = (s) => `1366 px · reflujo · ${paso} (${alto} px) · ${s}`;
        await pagina.evaluar(ALTO_MARCO(alto));
        const llego = await pagina.esperarA(async () => {
          const m = await pagina.evaluar(MEDIR);
          return !!m && !!m.scroll && m.scroll.barra === barra;
        }, { limite: 4000 });
        t.ok(c(`la barra de desplazamiento mide ${barra} px`), llego, true);
        await pagina.esperarA(alineada, { limite: 3000 });
        t.ok(c('la barra queda centrada sobre la hoja'), await alineada(), true);
      }
    } finally {
      await pagina.cerrar();
    }
  });
}

// ---------------------------------------------------------------------------
// 5 · Reposo: con la pantalla quieta la barra no vuelve a medir. El observador no puede
// rearmarse dentro de su propio callback (disparaba en cada cuadro: ~120 por segundo).

// Cuenta, desde que se instala, los callbacks de todo `ResizeObserver` y las lecturas de
// estilo (`getComputedStyle`) del marco. Se instala antes de montar la pantalla.
const INSTALAR_SONDA = EN_MARCO(`
  if (w.__sonda) return true;
  const Original = w.ResizeObserver;
  const leer = w.getComputedStyle.bind(w);
  w.__sonda = { callbacks: 0, estilos: 0 };
  w.ResizeObserver = class extends Original {
    constructor(cb) { super((...a) => { w.__sonda.callbacks++; return cb(...a); }); }
  };
  w.getComputedStyle = (...a) => { w.__sonda.estilos++; return leer(...a); };
  return true;
`);
const REINICIAR_SONDA = EN_MARCO(`w.__sonda.callbacks = 0; w.__sonda.estilos = 0; return true;`);
const LEER_SONDA = EN_MARCO(`return { ...w.__sonda, divs: d.querySelectorAll('div').length };`);

// Con la barra al día, una pantalla quieta no dispara nada: el tope deja pasar los avisos de
// asentamiento del layout de después del montaje (un puñado) y no los ~360 de 3 s del bucle.
const TOPE_CALLBACKS = 5;

async function pantallaQuieta(pagina, base, t) {
  const ajustes = RUTAS.find((r) => r.nombre === 'Settings');
  for (const ancho of [390, 1366]) {
    const c = (s) => `${ancho} px · reposo · Settings · ${s}`;
    t.ok(`${ancho} px · reposo · entra a Home`, await entrarAHome(pagina, base, ancho, 800), true);
    await pagina.evaluar(INSTALAR_SONDA);
    if (!await irARuta(pagina, ajustes)) {
      t.ok(c('llega a su ruta con barra'), false, true);
      continue;
    }
    await pagina.evaluar(REINICIAR_SONDA);
    await pausa(3000);
    const s = await pagina.evaluar(LEER_SONDA);
    t.ok(c(`callbacks del observador en 3 s ≤ ${TOPE_CALLBACKS} (hubo ${s.callbacks})`),
      s.callbacks <= TOPE_CALLBACKS, true);
    // Cada medida lee el estilo de los `div` de la pantalla una vez: el tope son
    // `TOPE_CALLBACKS` pasadas completas.
    const topeEstilos = TOPE_CALLBACKS * (s.divs + 1);
    t.ok(c(`lecturas de estilo en 3 s ≤ ${topeEstilos} (hubo ${s.estilos})`), s.estilos <= topeEstilos, true);
    await volverAHome(pagina);
  }
}

module.exports = [
  { nombre: 'Barra interna: precede al contenido en el DOM y en Tab, a 390 y 1366', correr: ordenDeDomYDeTab },
  { nombre: 'Barra interna: el contenido va dentro de la hoja de su superficie, a 1366 y 1920', correr: anchoPorRuta },
  { nombre: 'Barra interna: alineada con la hoja con barras de desplazamiento clásicas, a 1024 y 1366', correr: barrasClasicas },
  { nombre: 'Barra interna: se vuelve a alinear cuando aparece o desaparece la barra de desplazamiento', correr: reflujoDeBarras },
  { nombre: 'Barra interna: en reposo no mide en bucle (observador y lecturas de estilo acotados)', correr: pantallaQuieta },
];

// Suite «componentes» del arnés end-to-end (ver ../README.md): los componentes
// compartidos de la Plancha (src/components/plancha, tarea 2.9) contra comun.md §4 a §8.
//
// La página de prueba no entra al build de producción: esta suite arma su propio
// build (EXPO_PUBLIC_PKAPP_PRUEBA=componentes) en `<PKAPP_DIST>-componentes/`, lo sirve
// en su propio puerto y lo maneja con su propia conexión CDP al Chrome del arnés.
// Estados reales: hover con el puntero, presionado con el botón del mouse sin soltar,
// foco con la tecla Tab (`:focus-visible`).

const fs = require('fs');
const net = require('net');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { conectarNavegador, abrirPagina } = require('../cdp');
const { servirEstatico } = require('../entorno');
const { plancha } = require('../../../src/theme/colores');
const { LADO_TACTIL, PASO } = require('./comunes');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const DIST = process.env.PKAPP_DIST || 'dist';
const SALIDA = path.resolve(RAIZ, `${DIST}-componentes`);
// Caché de Metro propia: la de siempre se indexa por el contenido de los archivos y no
// por las variables de entorno, así que devolvería el build sin la página de prueba.
const CACHE = path.resolve(RAIZ, `${DIST}-componentes-cache`);
// El puerto web lo da el sistema (listen en 0): derivarlo de PKAPP_PUERTO chocaba con el
// juego paralelo de al lado (8301 y 8302, 8329 y 8330).
const PUERTO_CDP = Number(process.env.PKAPP_PUERTO_CDP || process.env.E2E_PUERTO_CDP || 9222);

const TRANSPARENTE = 'rgba(0, 0, 0, 0)';

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const sel = (id) => `[data-testid="${id}"]`;
const GRUPO_K4 = '[aria-label="Filtro de prueba"]';
const opcionK4 = (n) => `${GRUPO_K4} > :nth-child(${n})`;
const GRUPO_SEG = '[aria-label="Segmentado de prueba"]';
const opcionSeg = (n) => `${GRUPO_SEG} > :nth-child(${n})`;

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

function construir() {
  fs.rmSync(SALIDA, { recursive: true, force: true });
  fs.rmSync(CACHE, { recursive: true, force: true });
  fs.mkdirSync(CACHE, { recursive: true });
  execFileSync('npx', ['expo', 'export', '-p', 'web', '--output-dir', SALIDA], {
    cwd: RAIZ,
    env: { ...process.env, EXPO_PUBLIC_PKAPP_PRUEBA: 'componentes', CI: '1', TMPDIR: CACHE },
    stdio: 'pipe',
  });
}

// Lee de la página, para el elemento `s`: su caja, sus colores computados, su contorno
// y sus atributos accesibles. La caja de color es el primer hijo (el contenedor interno).
const LEER = (s) => `(function () {
  const el = document.querySelector(${JSON.stringify(s)});
  if (!el) return null;
  const caja = el.firstElementChild || el;
  const hoja = (n) => {
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = w.nextNode())) if (t.textContent.trim()) return t.parentElement;
    return null;
  };
  const texto = hoja(el);
  const svg = el.querySelector('svg');
  const c = getComputedStyle(el), k = getComputedStyle(caja);
  const r = el.getBoundingClientRect();
  return {
    rect: { x: r.left, y: r.top, ancho: r.width, alto: r.height },
    fondo: k.backgroundColor,
    borde: k.borderTopColor,
    bordeAncho: k.borderTopWidth,
    bordeInf: k.borderBottomColor,
    bordeInfAncho: k.borderBottomWidth,
    texto: texto ? getComputedStyle(texto).color : null,
    fuente: texto ? (function () {
      const f = getComputedStyle(texto);
      return {
        tamano: f.fontSize, familia: f.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
        mayusculas: f.textTransform, interlineado: f.lineHeight,
      };
    })() : null,
    relleno: { izq: k.paddingLeft, der: k.paddingRight, arr: k.paddingTop, aba: k.paddingBottom },
    expandido: el.getAttribute('aria-expanded'),
    glifo: svg ? svg.getAttribute('stroke') : null,
    contorno: { estilo: c.outlineStyle, ancho: c.outlineWidth, color: c.outlineColor, separacion: c.outlineOffset },
    rol: el.getAttribute('role'),
    desactivado: el.getAttribute('aria-disabled'),
    seleccionado: el.getAttribute('aria-selected'),
    marcado: el.getAttribute('aria-checked'),
    presionado: el.getAttribute('aria-pressed'),
    nombre: el.getAttribute('aria-label'),
    foco: document.activeElement === el,
  };
})()`;

const centro = (l) => ({ x: Math.round(l.rect.x + l.rect.ancho / 2), y: Math.round(l.rect.y + l.rect.alto / 2) });

async function pasar(pagina, ir) {
  await ir();
  await new Promise((r) => setTimeout(r, 120));
}

// Medidas y estados de una clase de control, contra los tokens del tema `T`.
async function estadosDe(ctx, nombre, s, esperado) {
  const { pagina, navegador, t, T, tema } = ctx;
  const cuando = (estado) => `${tema} · ${nombre} · ${estado}`;
  const comparar = (estado, real, exp) => {
    const detalle = [];
    if (exp.fondo !== undefined) detalle.push(['fondo', real.fondo, exp.fondo]);
    if (exp.borde !== undefined) detalle.push(['borde', real.borde, exp.borde]);
    if (exp.texto !== undefined) detalle.push(['texto', real.texto, exp.texto]);
    if (exp.glifo !== undefined) detalle.push(['glifo', real.glifo, exp.glifo]);
    if (exp.bordeAncho !== undefined) detalle.push(['ancho del borde', real.bordeAncho, exp.bordeAncho]);
    if (exp.relleno !== undefined) {
      for (const [lado, v] of Object.entries(exp.relleno)) detalle.push([`relleno ${lado}`, real.relleno[lado], v]);
    }
    if (exp.fuente !== undefined) {
      for (const [campo, v] of Object.entries(exp.fuente)) detalle.push([`fuente ${campo}`, real.fuente && real.fuente[campo], v]);
    }
    for (const [campo, r, e] of detalle) t.ok(`${cuando(estado)}: ${campo}`, r, e);
    if (exp.contorno !== undefined) {
      const c = real.contorno;
      if (exp.contorno === null) {
        t.ok(`${cuando(estado)}: sin contorno`, c.estilo === 'none' || c.ancho === '0px', true);
      } else {
        t.ok(`${cuando(estado)}: contorno ${exp.contorno.ancho} ${exp.contorno.color}`,
          `${c.estilo} ${c.ancho} ${c.color} ${c.separacion}`,
          `solid ${exp.contorno.ancho} ${exp.contorno.color} ${exp.contorno.separacion}`);
      }
    }
  };

  // Reposo
  await pasar(pagina, () => pagina.moverA(1, 1));
  const reposo = await pagina.evaluar(LEER(s));
  t.ok(`${cuando('reposo')}: existe`, reposo !== null, true);
  if (!reposo) return;
  comparar('reposo', reposo, { ...esperado.reposo, contorno: null });
  t.ok(`${cuando('tamaño')}: al menos ${LADO_TACTIL} × ${LADO_TACTIL}`,
    reposo.rect.ancho >= LADO_TACTIL && reposo.rect.alto >= LADO_TACTIL, true);

  if (esperado.deshabilitado) {
    t.ok(`${cuando('deshabilitado')}: aria-disabled`, reposo.desactivado, 'true');
    // Un deshabilitado no recibe hover ni presionado: el aspecto no cambia con el puntero.
    const c = centro(reposo);
    await pasar(pagina, () => pagina.moverA(c.x, c.y));
    const sobre = await pagina.evaluar(LEER(s));
    comparar('deshabilitado con puntero encima', sobre, { ...esperado.reposo, contorno: null });
    await pasar(pagina, () => pagina.moverA(1, 1));
    return;
  }

  const c = centro(reposo);

  // Hover (web con puntero)
  if (esperado.hover) {
    await pasar(pagina, () => pagina.moverA(c.x, c.y));
    comparar('hover', await pagina.evaluar(LEER(s)), esperado.hover);
  }

  // Presionado: botón del mouse abajo y sin soltar
  if (esperado.presionado) {
    await navegador.enviar('Input.dispatchMouseEvent',
      { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1, buttons: 1 }, pagina.sessionId);
    await new Promise((r) => setTimeout(r, 150));
    comparar('presionado', await pagina.evaluar(LEER(s)), esperado.presionado);
    // Se suelta fuera del control: el responder cancela y no dispara `onPress`.
    await navegador.enviar('Input.dispatchMouseEvent',
      { type: 'mouseReleased', x: 1, y: 1, button: 'left', clickCount: 1, buttons: 0 }, pagina.sessionId);
    await pasar(pagina, () => pagina.moverA(1, 1));
    await pagina.evaluar('document.activeElement && document.activeElement.blur && document.activeElement.blur()');
  }

  // Las variantes comparten la base de foco con la clase: solo la clase se prueba con Tab.
  if (esperado.sinFoco) return;

  // Foco por teclado (Tab real): contorno `foco`, `border-2`, separado `paso 0.5`
  const enfocado = await enfocarConTab(pagina, s);
  t.ok(`${cuando('foco')}: llega con Tab`, enfocado, true);
  if (enfocado) {
    const conFoco = await pagina.evaluar(LEER(s));
    comparar('foco', conFoco, {
      contorno: { ancho: '2px', color: rgb(T.foco), separacion: `${0.5 * PASO}px` },
    });
    // Hover y foco a la vez: gana el foco (un solo contorno)
    const cf = centro(conFoco);
    await pasar(pagina, () => pagina.moverA(cf.x, cf.y));
    comparar('foco y hover', await pagina.evaluar(LEER(s)), {
      contorno: { ancho: '2px', color: rgb(T.foco), separacion: `${0.5 * PASO}px` },
    });
    await pasar(pagina, () => pagina.moverA(1, 1));
    await pagina.evaluar('document.activeElement.blur()');
  }
}

async function enfocarConTab(pagina, s) {
  await pagina.evaluar('document.activeElement && document.activeElement.blur()');
  for (let i = 0; i < 100; i++) {
    await pagina.tecla('Tab');
    const es = await pagina.evaluar(
      `document.activeElement === document.querySelector(${JSON.stringify(s)})`);
    if (es) return true;
  }
  return false;
}

async function probarTema(navegador, base, t, tema) {
  const T = plancha[tema];
  const pagina = await abrirPagina(navegador, { ancho: 390, alto: 5000 });
  try {
    await pagina.ir(`${base}/?tema=${tema}`);
    const hay = await pagina.esperarA(() => pagina.evaluar(
      `!!document.querySelector(${JSON.stringify(sel('k1'))})`), { limite: 30000 });
    t.ok(`${tema}: la página de prueba carga`, hay, true);
    if (!hay) return;
    if (tema === 'oscuro') {
      t.ok('oscuro: la raíz lleva la clase dark',
        await pagina.evaluar('document.documentElement.classList.contains("dark")'), true);
    }
    await new Promise((r) => setTimeout(r, 300));
    const ctx = { pagina, navegador, t, T, tema };

    const transparente = TRANSPARENTE;
    const cont = (ancho, color) => ({ ancho, color: rgb(T[color]), separacion: '0px' });
    // Relleno computado del contenedor interno (padding): `izq` en paso y `arr` en px.
    const rel = (izq, arr) => ({ izq: `${izq}px`, der: `${izq}px`, arr: `${arr}px`, aba: `${arr}px` });
    const BOTON = rel(4 * PASO, 0);            // paso 4 horizontal (§8)
    const AMPLIO = 8 * PASO;                   // paso 8 horizontal (§8)
    const GRANDE = 3.5 * PASO;                 // paso 3.5 vertical (§8)
    const BOTON_FUENTE = { tamano: '15px', familia: 'PlexSans-SemiBold' };

    // K1
    await estadosDe(ctx, 'K1', sel('k1'), {
      reposo: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta), glifo: T.fondo,
        relleno: BOTON, fuente: BOTON_FUENTE },
      hover: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta), contorno: cont('2px', 'linea') },
      presionado: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea), glifo: T.tinta },
    });
    await estadosDe(ctx, 'K1 deshabilitado', sel('k1-deshabilitado'), {
      reposo: { fondo: transparente, texto: rgb(T.inactivo), borde: rgb(T.filete) },
      deshabilitado: true,
    });
    await estadosDe(ctx, 'K1 grande', sel('k1-grande'), {
      reposo: { fondo: rgb(T.tinta), relleno: rel(4 * PASO, GRANDE) }, sinFoco: true,
    });
    await estadosDe(ctx, 'K1 amplio', sel('k1-amplio'), {
      reposo: { fondo: rgb(T.tinta), relleno: rel(AMPLIO, 0) }, sinFoco: true,
    });

    // K2
    await estadosDe(ctx, 'K2', sel('k2'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea), glifo: T.tinta,
        relleno: BOTON, fuente: BOTON_FUENTE },
      hover: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea), contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta), glifo: T.fondo },
    });
    await estadosDe(ctx, 'K2 fondo', sel('k2-fondo'), {
      reposo: { fondo: rgb(T.fondo), texto: rgb(T.tinta), borde: rgb(T.linea) },
      hover: { fondo: rgb(T.fondo), contorno: cont('1px', 'linea') },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K2 acento', sel('k2-acento'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.acento), borde: rgb(T.acento) },
      hover: { fondo: rgb(T.superficie), texto: rgb(T.acento), borde: rgb(T.acento), contorno: cont('1px', 'acento') },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K2 peligro', sel('k2-peligro'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.error), borde: rgb(T.error) },
      hover: { fondo: rgb(T.superficie), texto: rgb(T.error), borde: rgb(T.error), contorno: cont('1px', 'error') },
      presionado: { fondo: rgb(T.error), texto: rgb(T.fondo), borde: rgb(T.error) },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K2 deshabilitado', sel('k2-deshabilitado'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.inactivo), borde: rgb(T.filete) },
      deshabilitado: true,
    });
    await estadosDe(ctx, 'K2 grande y amplio', sel('k2-grande'), {
      reposo: { relleno: rel(AMPLIO, GRANDE) }, sinFoco: true,
    });

    // K3
    await estadosDe(ctx, 'K3', sel('k3'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.borde), relleno: BOTON,
        fuente: BOTON_FUENTE },
      hover: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea), contorno: null },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
    });
    await estadosDe(ctx, 'K3 seleccionado', sel('k3-seleccionado'), {
      reposo: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
      hover: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
    });
    await estadosDe(ctx, 'K3 deshabilitado', sel('k3-deshabilitado'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.inactivo), borde: rgb(T.filete) },
      deshabilitado: true,
    });
    await estadosDe(ctx, 'K3 acierto (celda marcada)', sel('k3-acierto'), {
      reposo: { fondo: rgb(T.acierto), borde: rgb(T.acierto), bordeAncho: '2px', glifo: T.fondo },
      hover: { fondo: rgb(T.acierto), borde: rgb(T.acierto), bordeAncho: '2px' },
      presionado: { fondo: rgb(T.acierto), borde: rgb(T.acierto), bordeAncho: '2px' },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K3 abierto', sel('k3-abierto'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea), bordeAncho: '1px' },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K3 cerrado', sel('k3-cerrado'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.borde), bordeAncho: '1px' },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K3 énfasis primaria', sel('k3-primaria'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea), bordeAncho: '2px' },
      hover: { fondo: rgb(T.superficie), borde: rgb(T.linea), bordeAncho: '2px', contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K3 grande y amplio', sel('k3-grande'), {
      reposo: { relleno: rel(AMPLIO, GRANDE) }, sinFoco: true,
    });

    // K4 (segmento): opción en reposo, seleccionada y deshabilitada
    const FILTRO_FUENTE = { tamano: '15px', familia: 'PlexSans-Regular' };
    await estadosDe(ctx, 'K4 opción', opcionK4(2), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.borde),
        relleno: rel(3 * PASO, 2 * PASO), fuente: FILTRO_FUENTE },
      hover: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea), contorno: null },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
    });
    await estadosDe(ctx, 'K4 seleccionada', opcionK4(1), {
      reposo: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta),
        fuente: { tamano: '15px', familia: 'PlexSans-SemiBold' } },
      hover: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
    });
    await estadosDe(ctx, 'K4 deshabilitada', opcionK4(3), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.inactivo), borde: rgb(T.filete) },
      deshabilitado: true,
    });

    // K4 como segmentado (Ajustes): contenedor `linea`, opciones sin borde, `rotulo`
    const ROTULO = { tamano: '11px', familia: 'PlexMono-Regular', mayusculas: 'uppercase' };
    await estadosDe(ctx, 'K4 segmentado opción', opcionSeg(3), {
      reposo: { fondo: transparente, texto: rgb(T.tinta), bordeAncho: '0px',
        relleno: rel(3 * PASO, 2 * PASO), fuente: ROTULO },
      hover: { fondo: transparente, texto: rgb(T.tinta), contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo) },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K4 segmentado seleccionada', opcionSeg(1), {
      reposo: { fondo: rgb(T.tinta), texto: rgb(T.fondo), bordeAncho: '0px', fuente: ROTULO },
      hover: { fondo: rgb(T.tinta), texto: rgb(T.fondo) },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K4 segmentado deshabilitada', opcionSeg(2), {
      reposo: { fondo: transparente, texto: rgb(T.inactivo), fuente: ROTULO },
      deshabilitado: true,
    });

    // K5
    await estadosDe(ctx, 'K5', sel('k5'), {
      reposo: { fondo: rgb(T.superficie), borde: rgb(T.linea), glifo: T.tinta },
      hover: { fondo: rgb(T.superficie), borde: rgb(T.linea), contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), borde: rgb(T.tinta), glifo: T.fondo },
    });
    await estadosDe(ctx, 'K5 fondo', sel('k5-fondo'), {
      reposo: { fondo: rgb(T.fondo), borde: rgb(T.linea) },
      hover: { fondo: rgb(T.fondo), contorno: cont('1px', 'linea') },
      sinFoco: true,
    });
    await estadosDe(ctx, 'K5 deshabilitado', sel('k5-deshabilitado'), {
      reposo: { fondo: rgb(T.superficie), borde: rgb(T.filete), glifo: T.inactivo },
      deshabilitado: true,
    });

    // K6: sin relleno propio; la ilustración cambia por estado (`ilustracion`)
    await estadosDe(ctx, 'K6', sel('k6'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea),
        relleno: rel(0, 0), glifo: T.filamento },
      hover: { fondo: rgb(T.superficie), borde: rgb(T.linea), contorno: cont('1px', 'linea'), glifo: T.filamento },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta), glifo: T.fondo },
    });
    await estadosDe(ctx, 'K6 deshabilitado', sel('k6-deshabilitado'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.inactivo), borde: rgb(T.filete), glifo: T.inactivo },
      deshabilitado: true,
    });
    await estadosDe(ctx, 'K6 acento', sel('k6-acento'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.acento), bordeAncho: '2px',
        glifo: T.acento },
      hover: { borde: rgb(T.acento), contorno: cont('1px', 'acento') },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) },
      sinFoco: true,
    });

    // K7
    await estadosDe(ctx, 'K7', sel('k7'), {
      reposo: { fondo: transparente, texto: rgb(T.tinta) },
      hover: { texto: rgb(T.tinta), contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo) },
    });
    await estadosDe(ctx, 'K7 deshabilitado', sel('k7-deshabilitado'), {
      reposo: { fondo: transparente, texto: rgb(T.inactivo) },
      deshabilitado: true,
    });
    await estadosDe(ctx, 'K7 glifo', sel('k7-glifo'), {
      reposo: { fondo: transparente, glifo: T.tinta },
      hover: { contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), glifo: T.fondo },
    });
    await estadosDe(ctx, 'K7 tono sec', sel('k7-sec'), {
      reposo: { fondo: transparente, glifo: T.tintaSec },
      hover: { glifo: T.tintaSec, contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), glifo: T.fondo },
      sinFoco: true,
    });

    // Deuda de la 2.9 (cubierta en 3.8): texto de K7 `tono="sec"` en `tintaSec` (FilaLista.js:36)
    await estadosDe(ctx, 'K7 tono sec texto', sel('k7-sec-texto'), {
      reposo: { fondo: transparente, texto: rgb(T.tintaSec) },
      hover: { texto: rgb(T.tintaSec), contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), texto: rgb(T.fondo) },
      sinFoco: true,
    });

    await pagina.moverA(1, 1);

    // Deuda de la 2.9 (cubierta en 3.8): contenedor del segmentado (Segmento.js:43)
    const contenedor = await pagina.evaluar(`(function () {
      const s = getComputedStyle(document.querySelector(${JSON.stringify(GRUPO_SEG)}));
      return { fondo: s.backgroundColor, borde: s.borderTopColor, ancho: s.borderTopWidth, estilo: s.borderTopStyle };
    })()`);
    t.ok(`${tema} · K4 segmentado contenedor: fondo \`superficie\``, contenedor.fondo, rgb(T.superficie));
    t.ok(`${tema} · K4 segmentado contenedor: borde \`linea\`, border`,
      `${contenedor.estilo} ${contenedor.ancho} ${contenedor.borde}`, `solid 1px ${rgb(T.linea)}`);

    // Filete inferior de K7 (listas)
    const k7 = await pagina.evaluar(LEER(sel('k7')));
    t.ok(`${tema} · K7 filete: inferior \`filete\`, border`,
      `${k7.bordeInfAncho} ${k7.bordeInf}`, `1px ${rgb(T.filete)}`);

    await accesibilidad(pagina, t, tema);
    await lamina(pagina, t, tema, T);
    await marcasDeEstado(pagina, t, tema, T);
    await rotulos(pagina, t, tema, T);
    await posiciones(pagina, t, tema);
    await marcasK6(pagina, t, tema);
    await toques(pagina, t, tema);
    await flechas(pagina, t, tema);
    await desplegables(pagina, t, tema, T);
  } finally {
    await pagina.cerrar();
  }
}

// Posición del glifo respecto del texto (B7) y `className` de layout (B8).
async function posiciones(pagina, t, tema) {
  const medir = (id) => pagina.evaluar(`(function () {
    const el = document.querySelector(${JSON.stringify(sel(id))});
    const g = el.querySelector('svg').getBoundingClientRect();
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) if (n.textContent.trim()) break;
    const rango = document.createRange();
    rango.selectNodeContents(n);
    const x = rango.getBoundingClientRect(), c = el.getBoundingClientRect();
    const p = el.parentElement.getBoundingClientRect();
    return { gIzq: g.left, gDer: g.right, tIzq: x.left, tDer: x.right, izq: c.left, der: c.right,
      ancho: c.width, anchoPadre: p.width };
  })()`);
  const delante = await medir('k1');
  t.ok(`${tema} · glifoPosicion delante (K1): el glifo va antes del texto`, delante.gDer <= delante.tIzq, true);
  const detras = await medir('k1-detras');
  t.ok(`${tema} · glifoPosicion detras (K1): el glifo va después del texto`, detras.gIzq >= detras.tDer, true);
  const detrasK2 = await medir('k2-detras');
  t.ok(`${tema} · glifoPosicion detras (K2): el glifo va después del texto`, detrasK2.gIzq >= detrasK2.tDer, true);
  const extremo = await medir('k1-extremo');
  // borde 1 px + relleno paso 4 a cada lado
  const margen = 1 + 4 * PASO;
  t.ok(`${tema} · glifoPosicion extremo (K1): el texto arranca en el borde izquierdo`,
    Math.abs(extremo.tIzq - (extremo.izq + margen)) <= 1, true);
  t.ok(`${tema} · glifoPosicion extremo (K1): el glifo queda en el borde derecho`,
    Math.abs(extremo.gDer - (extremo.der - margen)) <= 1, true);
  t.ok(`${tema} · className de layout (K1 w-full): ocupa el ancho del contenedor`,
    extremo.ancho, extremo.anchoPadre);
  const normal = await medir('k1');
  t.ok(`${tema} · sin className: el botón mide por su contenido`, normal.ancho < normal.anchoPadre, true);
}

// Toque real (hallazgo 2): un clic dispara `onPress` / `alCambiar`; un deshabilitado no.
async function toques(pagina, t, tema) {
  const leer = async () => JSON.parse(await pagina.evaluar(
    `document.querySelector(${JSON.stringify(sel('toques'))}).textContent`));
  const clic = async (s) => {
    const l = await pagina.evaluar(LEER(s));
    const c = centro(l);
    await pagina.clicEn(c.x, c.y);
    await new Promise((r) => setTimeout(r, 150));
  };
  t.ok(`${tema} · toques: soltar fuera, Tab y hover no disparan onPress`,
    JSON.stringify(await leer()), '{}');

  const activos = ['k1', 'k1-grande', 'k1-amplio', 'k1-detras', 'k1-extremo', 'k2', 'k2-fondo',
    'k2-acento', 'k2-peligro', 'k2-detras', 'k2-grande', 'k3', 'k3-seleccionado', 'k3-acierto',
    'k3-abierto', 'k3-cerrado', 'k3-primaria', 'k3-grande', 'k5', 'k5-fondo', 'k6', 'k6-acento',
    'k7', 'k7-glifo', 'k7-sec'];
  for (const id of activos) await clic(sel(id));
  const apagados = ['k1-deshabilitado', 'k2-deshabilitado', 'k3-deshabilitado', 'k5-deshabilitado',
    'k6-deshabilitado', 'k7-deshabilitado'];
  for (const id of apagados) await clic(sel(id));
  const cuenta = await leer();
  for (const id of activos) t.ok(`${tema} · toques: ${id} dispara onPress una vez`, cuenta[id], 1);
  for (const id of apagados) t.ok(`${tema} · toques: ${id} deshabilitado no dispara onPress`, cuenta[id], undefined);

  // K4: tocar una opción llama `alCambiar(valor)`; la marcada y la deshabilitada, no.
  await clic(opcionK4(2));
  await clic(opcionK4(2));
  await clic(opcionK4(3));
  const k4 = await leer();
  t.ok(`${tema} · toques K4: la opción llama alCambiar una vez con su valor`, k4['k4:reales'], 1);
  t.ok(`${tema} · toques K4: la ya marcada no llama alCambiar`,
    Object.keys(k4).filter((c) => c.startsWith('k4:')).join(','), 'k4:reales');
  t.ok(`${tema} · toques K4: la opción tocada queda marcada`,
    (await pagina.evaluar(LEER(opcionK4(2)))).marcado, 'true');

  await clic(opcionSeg(3));
  await clic(opcionSeg(3));
  await clic(opcionSeg(2));
  const seg = await leer();
  t.ok(`${tema} · toques K4 segmentado: la opción llama alCambiar una vez`, seg['k4s:oscuro'], 1);
  t.ok(`${tema} · toques K4 segmentado: la marcada y la deshabilitada no llaman alCambiar`,
    Object.keys(seg).filter((c) => c.startsWith('k4s:')).join(','), 'k4s:oscuro');
  await pagina.moverA(1, 1);
}

// Teclado del segmentado (decisión 7): flechas con vuelta y salto de deshabilitadas,
// Espacio y Enter seleccionan, Alt, Ctrl y Meta no actúan. Todas las opciones son paradas
// de Tab.
async function flechas(pagina, t, tema) {
  const marcadas = async (grupo, n) => {
    const m = [];
    for (let i = 1; i <= n; i++) m.push((await pagina.evaluar(LEER(`${grupo} > :nth-child(${i})`))).marcado);
    return m.join('|');
  };
  const foco = (grupo) => pagina.evaluar(`(function () {
    const op = Array.from(document.querySelector(${JSON.stringify(grupo)}).children);
    return op.indexOf(document.activeElement) + 1;
  })()`);
  const enfocar = (s) => pagina.evaluar(`document.querySelector(${JSON.stringify(s)}).focus()`);

  // Segmentado: Claro (1), Auto (2, deshabilitada), Oscuro (3). Parte en Oscuro (los toques).
  const G = GRUPO_SEG;
  await enfocar(opcionSeg(3));
  const pasos = [
    ['ArrowRight', 'vuelve al principio', 1, 'true|false|false'],
    ['ArrowRight', 'salta la deshabilitada', 3, 'false|false|true'],
    ['ArrowLeft', 'salta la deshabilitada hacia atrás', 1, 'true|false|false'],
    ['ArrowDown', 'abajo es siguiente', 3, 'false|false|true'],
    ['ArrowUp', 'arriba es anterior', 1, 'true|false|false'],
    ['ArrowLeft', 'vuelve al final', 3, 'false|false|true'],
  ];
  for (const [tecla, nombre, destino, estado] of pasos) {
    await pagina.tecla(tecla);
    t.ok(`${tema} · segmentado ${tecla}: ${nombre} (selecciona)`, await marcadas(G, 3), estado);
    t.ok(`${tema} · segmentado ${tecla}: ${nombre} (foco)`, await foco(G), destino);
  }

  // Alt, Ctrl y Meta: el manejador no actúa (no pisa «atrás» del navegador). Evento
  // sintético: con teclas reales Chrome ejecuta su acelerador y congela el headless.
  const CON = (modificador) => `(function () {
    const ev = new KeyboardEvent('keydown',
      { key: 'ArrowRight', code: 'ArrowRight', bubbles: true, cancelable: true, ${modificador}: true });
    return document.activeElement.dispatchEvent(ev) === false;
  })()`;
  for (const [nombre, m] of [['Alt', 'altKey'], ['Ctrl', 'ctrlKey'], ['Meta', 'metaKey']]) {
    t.ok(`${tema} · segmentado ${nombre}+→: no cancela el evento`, await pagina.evaluar(CON(m)), false);
    t.ok(`${tema} · segmentado ${nombre}+→: no cambia la selección`, await marcadas(G, 3), 'false|false|true');
    t.ok(`${tema} · segmentado ${nombre}+→: no mueve el foco`, await foco(G), 3);
  }

  // Espacio y Enter seleccionan la opción con foco (sin que sea la marcada)
  await enfocar(opcionSeg(1));
  await pagina.tecla(' ');
  t.ok(`${tema} · segmentado Espacio: selecciona la opción con foco`, await marcadas(G, 3), 'true|false|false');
  await enfocar(opcionSeg(3));
  await pagina.tecla('Enter');
  t.ok(`${tema} · segmentado Enter: selecciona la opción con foco`, await marcadas(G, 3), 'false|false|true');

  // Todas las opciones siguen siendo paradas de Tab; la deshabilitada no
  t.ok(`${tema} · segmentado: la opción 1 es parada de Tab`, await enfocarConTab(pagina, opcionSeg(1)), true);
  t.ok(`${tema} · segmentado: la opción 3 es parada de Tab`, await enfocarConTab(pagina, opcionSeg(3)), true);
  t.ok(`${tema} · segmentado: la deshabilitada no es parada de Tab`,
    await enfocarConTab(pagina, opcionSeg(2)), false);
  await pagina.evaluar('document.activeElement && document.activeElement.blur()');

  // La forma filtro tiene el mismo teclado. Parte en «Reales» (los toques).
  await enfocar(opcionK4(2));
  await pagina.tecla('ArrowRight');
  t.ok(`${tema} · filtro →: salta la deshabilitada y vuelve a «Todas»`,
    `${await marcadas(GRUPO_K4, 3)} ${await foco(GRUPO_K4)}`, 'true|false|false 1');
  await pagina.tecla('ArrowLeft');
  t.ok(`${tema} · filtro ←: vuelve a «Reales» saltando la deshabilitada`,
    `${await marcadas(GRUPO_K4, 3)} ${await foco(GRUPO_K4)}`, 'false|true|false 2');
  await pagina.evaluar('document.activeElement && document.activeElement.blur()');
}

// Desplegable (ADD-P3): lectura de una instancia de la página de prueba por su testID.
const LEER_DESP = (id) => `(function () {
  const raiz = document.querySelector(${JSON.stringify(sel(id))});
  const disp = raiz.querySelector('[aria-haspopup="listbox"]');
  const lista = raiz.querySelector('[role="listbox"]');
  const ops = lista ? Array.from(lista.querySelectorAll('[role="option"]')) : [];
  const a = document.activeElement;
  const r = disp.getBoundingClientRect();
  return {
    nombre: disp.getAttribute('aria-label'),
    expandido: disp.getAttribute('aria-expanded'),
    abierta: !!lista,
    opciones: ops.map((o) => o.textContent.trim()),
    deshabilitadas: ops.map((o) => o.getAttribute('aria-disabled') === 'true'),
    elegidas: ops.map((o) => o.getAttribute('aria-selected')),
    tabindex: ops.map((o) => o.getAttribute('tabindex')),
    foco: a === disp ? '<disparador>' : (ops.includes(a) ? a.textContent.trim() : null),
    grupos: lista ? Array.from(lista.querySelectorAll('[role="group"]')).map((g) => {
      const cab = g.children[0];
      const marca = cab.children.length > 1 ? cab.children[0] : null;
      return {
        nombre: g.getAttribute('aria-label'),
        rotulo: cab.textContent.trim(),
        marca: marca ? Array.from(marca.children).map((c) => getComputedStyle(c).backgroundColor) : null,
        oculta: marca ? marca.getAttribute('aria-hidden') : null,
        opciones: g.querySelectorAll('[role="option"]').length,
      };
    }) : [],
    centro: { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) },
  };
})()`;

// Re Pág, Av Pág, Inicio y Fin con salto de deshabilitadas; Escape y Enter; la ruta con
// `grupos` (rótulo, marca de parcial, texto de ayuda, índice acumulado).
async function desplegables(pagina, t, tema, T) {
  const c = (s) => `${tema} · Desplegable · ${s}`;
  const leerD = (id) => pagina.evaluar(LEER_DESP(id));
  const tecla = async (key) => {
    await pagina.evaluar(`(function () {
      const a = document.activeElement;
      if (a) a.dispatchEvent(new KeyboardEvent('keydown', { key: ${JSON.stringify(key)}, bubbles: true, cancelable: true }));
      return true;
    })()`);
    await new Promise((r) => setTimeout(r, 80));
  };
  const abrir = async (id) => {
    const l = await leerD(id);
    await pagina.clicEn(l.centro.x, l.centro.y);
    await new Promise((r) => setTimeout(r, 150));
    return leerD(id);
  };
  const conteo = async () => JSON.parse(await pagina.evaluar(
    `document.querySelector(${JSON.stringify(sel('toques'))}).textContent`));
  const foco = async (id) => (await leerD(id)).foco;

  // --- Plano: 12 filas, la 5.ª y la 10.ª deshabilitadas ---
  const P = 'desp-plano';
  const filas = Array.from({ length: 12 }, (_, i) => `Fila ${i + 1}`);
  let l = await leerD(P);
  t.ok(c('plano cerrado: nombre «Plano: Fila 1», aria-expanded false, sin lista'),
    `${l.nombre}|${l.expandido}|${l.abierta}`, 'Plano: Fila 1|false|false');
  l = await abrir(P);
  t.ok(c('plano abierto: aria-expanded true y una option por opción, en orden'),
    `${l.expandido}|${JSON.stringify(l.opciones)}`, `true|${JSON.stringify(filas)}`);
  t.ok(c('plano: aria-disabled en la 5.ª y la 10.ª'),
    l.deshabilitadas.map((d, i) => (d ? i : -1)).filter((i) => i >= 0).join(','), '4,9');
  t.ok(c('plano: aria-selected solo en la elegida (Fila 1)'),
    l.elegidas.map((e, i) => (e === 'true' ? i : -1)).filter((i) => i >= 0).join(','), '0');
  t.ok(c('plano: una sola parada de Tab, la elegida'),
    `${l.tabindex.filter((x) => x === '0').length}|${l.tabindex[0]}`, '1|0');
  t.ok(c('plano: el foco pasa a la fila elegida'), l.foco, 'Fila 1');

  await tecla('ArrowDown'); await tecla('ArrowDown');
  t.ok(c('plano: Flecha abajo ×2 → Fila 3'), await foco(P), 'Fila 3');
  await tecla('PageDown');
  t.ok(c('plano: Av Pág con el destino (Fila 10) deshabilitado sigue hacia abajo → Fila 11'),
    await foco(P), 'Fila 11');
  await tecla('End');
  t.ok(c('plano: Fin → Fila 12'), await foco(P), 'Fila 12');
  await tecla('PageDown');
  t.ok(c('plano: Av Pág en la última no se mueve'), await foco(P), 'Fila 12');
  await tecla('PageUp');
  t.ok(c('plano: Re Pág con el destino (Fila 5) deshabilitado sigue hacia arriba → Fila 4'),
    await foco(P), 'Fila 4');
  await tecla('ArrowDown');
  t.ok(c('plano: Flecha abajo salta la deshabilitada (Fila 4 → Fila 6)'), await foco(P), 'Fila 6');
  await tecla('Home');
  await tecla('PageUp');
  t.ok(c('plano: Re Pág en la primera no se mueve'), await foco(P), 'Fila 1');
  await tecla('PageDown');
  t.ok(c('plano: Av Pág desde la primera: siete filas → Fila 8'), await foco(P), 'Fila 8');
  l = await leerD(P);
  t.ok(c('plano: las flechas y los saltos no eligen (sigue Fila 1 y no hay toques)'),
    `${l.elegidas.indexOf('true')}|${Object.keys(await conteo()).filter((k) => k.startsWith('desp-plano:')).length}`,
    '0|0');

  // Escape cierra sin cambiar; el foco vuelve al disparador.
  await tecla('Escape');
  l = await leerD(P);
  t.ok(c('plano: Escape cierra sin cambiar y devuelve el foco al disparador'),
    `${l.abierta}|${l.nombre}|${l.foco}`, 'false|Plano: Fila 1|<disparador>');

  // Una fila deshabilitada no elige; Enter elige la fila con foco y llama alCambiar una vez.
  l = await abrir(P);
  const rect = await pagina.evaluar(`(function () {
    const o = document.querySelector(${JSON.stringify(sel(P))}).querySelectorAll('[role="option"]')[4].getBoundingClientRect();
    return { x: Math.round(o.left + o.width / 2), y: Math.round(o.top + o.height / 2) };
  })()`);
  await pagina.clicEn(rect.x, rect.y);
  await new Promise((r) => setTimeout(r, 120));
  l = await leerD(P);
  t.ok(c('plano: tocar una fila deshabilitada no elige ni cierra'),
    `${l.abierta}|${l.nombre}|${Object.keys(await conteo()).filter((k) => k.startsWith('desp-plano:')).length}`,
    'true|Plano: Fila 1|0');
  // H3: la fila deshabilitada no recibe foco por puntero; el foco y la fila activa siguen donde estaban.
  t.ok(c('plano: tocar una fila deshabilitada no mueve el foco (sigue en Fila 1)'), await foco(P), 'Fila 1');
  await tecla('End');
  t.ok(c('plano: tras tocar una deshabilitada, Fin → Fila 12'), await foco(P), 'Fila 12');
  const rect10 = await pagina.evaluar(`(function () {
    const o = document.querySelector(${JSON.stringify(sel(P))}).querySelectorAll('[role="option"]')[9].getBoundingClientRect();
    return { x: Math.round(o.left + o.width / 2), y: Math.round(o.top + o.height / 2) };
  })()`);
  await pagina.clicEn(rect10.x, rect10.y);
  await new Promise((r) => setTimeout(r, 120));
  t.ok(c('plano: tocar la Fila 10 deshabilitada no mueve el foco (sigue en Fila 12)'), await foco(P), 'Fila 12');
  await tecla('Home');
  t.ok(c('plano: Inicio → Fila 1'), await foco(P), 'Fila 1');
  await tecla('ArrowDown'); await tecla('ArrowDown');
  await pagina.tecla('Enter');
  await new Promise((r) => setTimeout(r, 150));
  l = await leerD(P);
  t.ok(c('plano: Enter elige la fila con foco, cierra y el foco vuelve al disparador'),
    `${l.abierta}|${l.nombre}|${l.foco}`, 'false|Plano: Fila 3|<disparador>');
  t.ok(c('plano: alCambiar una vez por elección'), (await conteo())['desp-plano:f3'], 1);

  // --- Borde: 10 filas, de la 8.ª a la 10.ª deshabilitadas (la vuelta de salto()) ---
  const B = 'desp-borde';
  await abrir(B);
  await tecla('ArrowDown'); await tecla('ArrowDown');
  t.ok(c('borde: Flecha abajo ×2 → Borde 3'), await foco(B), 'Borde 3');
  await tecla('PageDown');
  t.ok(c('borde: Av Pág sin destino hacia abajo (8.ª a 10.ª deshabilitadas) vuelve a la 7.ª'),
    await foco(B), 'Borde 7');
  await tecla('Escape');

  // --- Agrupado: rótulos, marca de parcial y texto de ayuda ---
  const G = 'desp-grupos';
  l = await leerD(G);
  t.ok(c('grupos cerrado sin valor: el nombre lleva el texto de ayuda'),
    `${l.nombre}|${l.abierta}`, 'Agrupado: Elegí una opción|false');
  l = await abrir(G);
  t.ok(c('grupos abierto: una option por opción, en el orden de los grupos'),
    JSON.stringify(l.opciones), JSON.stringify(['Alfa uno', 'Alfa dos', 'Beta uno', 'Beta dos']));
  t.ok(c('grupos: dos role="group" con su nombre y su rótulo'),
    JSON.stringify(l.grupos.map((g) => `${g.nombre}|${g.rotulo}|${g.opciones}`)),
    JSON.stringify(['Grupo A|Grupo A|2', 'Grupo B|Grupo B|2']));
  const llena = (g) => g.marca.map((x) => x === TRANSPARENTE ? '0' : '1').join('');
  t.ok(c('grupos: marca de parcial de 3 casillas, la llena es la del índice'),
    JSON.stringify(l.grupos.map((g) => `${g.marca.length}|${llena(g)}|${g.oculta}`)),
    JSON.stringify(['3|100|true', '3|010|true']));
  t.ok(c('grupos: la casilla llena es tintaSec'),
    l.grupos.map((g) => g.marca.find((x) => x !== TRANSPARENTE)).join('|'),
    `${rgb(T.tintaSec)}|${rgb(T.tintaSec)}`);
  t.ok(c('grupos: la deshabilitada lleva aria-disabled; ninguna está elegida'),
    `${l.deshabilitadas.join(',')}|${l.elegidas.join(',')}`, 'false,true,false,false|false,false,false,false');
  t.ok(c('grupos sin valor: el foco abre en la primera habilitada, única parada de Tab'),
    `${l.foco}|${l.tabindex.join(',')}`, 'Alfa uno|0,-1,-1,-1');
  await tecla('ArrowDown');
  t.ok(c('grupos: Flecha abajo salta la deshabilitada y cruza de grupo'), await foco(G), 'Beta uno');
  await tecla('End');
  t.ok(c('grupos: Fin → última fila'), await foco(G), 'Beta dos');
  await pagina.tecla('Enter');
  await new Promise((r) => setTimeout(r, 150));
  l = await leerD(G);
  t.ok(c('grupos: Enter elige, el disparador muestra el nombre y alCambiar se llama una vez'),
    `${l.nombre}|${(await conteo())['desp-grupos:b2']}`, 'Agrupado: Beta dos|1');
  l = await abrir(G);
  t.ok(c('grupos reabierto: la elegida lleva aria-selected y el foco'),
    `${l.elegidas.join(',')}|${l.foco}`, 'false,false,false,true|Beta dos');
  await tecla('Escape');
}

// K6 con y sin marcas de esquina (B5)
async function marcasK6(pagina, t, tema) {
  const n = await pagina.evaluar(`document.querySelectorAll(${
    JSON.stringify(sel('k6-acento') + ' [data-testid="marca-esquina"]')}).length`);
  t.ok(`${tema} · K6 variante acento: sin marcas de esquina`, n, 0);
}

// Rol y estado accesibles (comun.md §2.3, §5.1)
async function accesibilidad(pagina, t, tema) {
  const roles = [
    ['K1', sel('k1'), 'button'], ['K2', sel('k2'), 'button'], ['K3', sel('k3'), 'button'],
    ['K5', sel('k5'), 'button'], ['K6', sel('k6'), 'button'], ['K7', sel('k7'), 'button'],
    ['K4 opción', opcionK4(2), 'radio'],
  ];
  for (const [nombre, s, rol] of roles) {
    const l = await pagina.evaluar(LEER(s));
    t.ok(`${tema} · ${nombre}: rol ${rol}`, l && l.rol, rol);
  }
  const grupo = await pagina.evaluar(LEER(GRUPO_K4));
  t.ok(`${tema} · K4: el grupo es radiogroup con su nombre`,
    `${grupo.rol}|${grupo.nombre}`, 'radiogroup|Filtro de prueba');
  const k4 = [];
  for (const n of [1, 2, 3]) k4.push((await pagina.evaluar(LEER(opcionK4(n)))).marcado);
  t.ok(`${tema} · K4: estado seleccionado de cada opción (aria-checked)`, k4.join(','), 'true,false,false');

  // K3 es un botón conmutable: `aria-pressed`, no `aria-selected` (que `button` no admite).
  const k3s = await pagina.evaluar(LEER(sel('k3-seleccionado')));
  t.ok(`${tema} · K3 seleccionado: aria-pressed true, sin aria-selected`,
    `${k3s.presionado}|${k3s.seleccionado}`, 'true|null');
  const k3 = await pagina.evaluar(LEER(sel('k3')));
  t.ok(`${tema} · K3 en reposo: aria-pressed false, sin aria-selected`,
    `${k3.presionado}|${k3.seleccionado}`, 'false|null');
  const k3a = await pagina.evaluar(LEER(sel('k3-acierto')));
  t.ok(`${tema} · K3 acierto: aria-pressed true`, k3a.presionado, 'true');

  // K3 plegable: `aria-expanded` (B2); sin `abierto` no se emite
  const abierto = await pagina.evaluar(LEER(sel('k3-abierto')));
  const cerrado = await pagina.evaluar(LEER(sel('k3-cerrado')));
  const sinAbierto = await pagina.evaluar(LEER(sel('k3')));
  t.ok(`${tema} · K3 abierto: aria-expanded true`, abierto.expandido, 'true');
  t.ok(`${tema} · K3 cerrado: aria-expanded false`, cerrado.expandido, 'false');
  t.ok(`${tema} · K3 sin \`abierto\`: sin aria-expanded`, sinAbierto.expandido, null);

  for (const id of ['k1-deshabilitado', 'k2-deshabilitado', 'k3-deshabilitado', 'k5-deshabilitado',
    'k6-deshabilitado', 'k7-deshabilitado']) {
    const l = await pagina.evaluar(LEER(sel(id)));
    t.ok(`${tema} · ${id}: accessibilityState disabled`, l && l.desactivado, 'true');
  }
  t.ok(`${tema} · K4 deshabilitada: accessibilityState disabled`,
    (await pagina.evaluar(LEER(opcionK4(3)))).desactivado, 'true');

  // Un deshabilitado no entra en el orden de Tab
  t.ok(`${tema} · deshabilitado: sin foco por teclado`,
    await enfocarConTab(pagina, sel('k1-deshabilitado')), false);
  await pagina.evaluar('document.activeElement && document.activeElement.blur()');

  // Los de solo glifo llevan nombre
  for (const [id, nombre] of [['k5', 'Más tiempo'], ['k5-deshabilitado', 'Menos tiempo'], ['k7-glifo', 'Volver']]) {
    t.ok(`${tema} · ${id}: nombre accesible`, (await pagina.evaluar(LEER(sel(id)))).nombre, nombre);
  }
}

async function lamina(pagina, t, tema, T) {
  const l = await pagina.evaluar(`(function () {
    const raiz = document.querySelector(${JSON.stringify(sel('lamina'))});
    const cuerpo = raiz.firstElementChild;
    const k = getComputedStyle(cuerpo);
    const marcas = Array.from(raiz.querySelectorAll('[data-testid="marca-esquina"]'));
    const rc = cuerpo.getBoundingClientRect();
    const div = raiz.querySelector('[data-testid="lamina-divisor"]');
    return {
      fondo: k.backgroundColor, borde: k.borderTopColor, ancho: k.borderTopWidth,
      marcas: marcas.map((m, i) => {
        const r = m.getBoundingClientRect(), s = getComputedStyle(m);
        // cuánto sobresale del cuerpo en sus dos lados exteriores (izq o der, arriba o abajo)
        const dx = i % 2 === 0 ? rc.left - r.left : r.right - rc.right;
        const dy = i < 2 ? rc.top - r.top : r.bottom - rc.bottom;
        return {
          oculta: m.getAttribute('aria-hidden'),
          lado: [r.width, r.height],
          sobresale: [dx, dy],
          trazos: ['Top', 'Right', 'Bottom', 'Left'].map((c) => s['border' + c + 'Width']).join(' '),
          color: s.borderTopColor === TRANSPARENTE_CSS ? s.borderBottomColor : s.borderTopColor,
        };
      }),
      divisor: div ? { oculto: div.getAttribute('aria-hidden'), color: getComputedStyle(div).borderTopColor,
        ancho: getComputedStyle(div).borderTopWidth } : null,
    };
  })()`.replace('TRANSPARENTE_CSS', JSON.stringify('rgba(0, 0, 0, 0)')));
  t.ok(`${tema} · lámina: fondo superficie`, l.fondo, rgb(T.superficie));
  t.ok(`${tema} · lámina: marco linea, border`, `${l.ancho} ${l.borde}`, `1px ${rgb(T.linea)}`);
  t.ok(`${tema} · lámina: cuatro marcas de esquina`, l.marcas.length, 4);
  t.ok(`${tema} · lámina: todas las marcas con aria-hidden`,
    l.marcas.every((m) => m.oculta === 'true'), true);
  t.ok(`${tema} · lámina: marcas de lado paso 2`,
    l.marcas.every((m) => m.lado[0] === 2 * PASO && m.lado[1] === 2 * PASO), true);
  t.ok(`${tema} · lámina: cada marca sobresale paso 1 en sus dos lados exteriores`,
    l.marcas.map((m) => m.sobresale.join(',')).join('|'),
    Array(4).fill(`${PASO},${PASO}`).join('|'));
  t.ok(`${tema} · lámina: marcas con trazo border-2 solo hacia afuera`,
    l.marcas.map((m) => m.trazos).join('|'),
    ['2px 0px 0px 2px', '2px 2px 0px 0px', '0px 0px 2px 2px', '0px 2px 2px 0px'].join('|'));
  t.ok(`${tema} · lámina: marcas en linea`, l.marcas.every((m) => m.color === rgb(T.linea)), true);
  t.ok(`${tema} · lámina: divisor filete, border, aria-hidden`,
    l.divisor && `${l.divisor.ancho} ${l.divisor.color} ${l.divisor.oculto}`, `1px ${rgb(T.filete)} true`);

  // K6 lleva las mismas marcas
  const n = await pagina.evaluar(`(function () {
    const m = Array.from(document.querySelectorAll(${JSON.stringify(sel('k6') + ' [data-testid="marca-esquina"]')}));
    return [m.length, m.every((x) => x.getAttribute('aria-hidden') === 'true')].join(',');
  })()`);
  t.ok(`${tema} · K6: cuatro marcas de esquina con aria-hidden`, n, '4,true');
}

async function marcasDeEstado(pagina, t, tema, T) {
  // [nombre, id, texto, color del texto, color del glifo, lado del glifo, fuente]
  const ROTULO = { tamano: '11px', familia: 'PlexMono-Regular', mayusculas: 'uppercase' };
  const casos = [
    ['acierto', 'marca-acierto', 'Correcta', T.acierto, T.acierto, 16, ROTULO],
    ['error', 'marca-error', 'Incorrecta', T.error, T.error, 16, ROTULO],
    ['intermedia', 'marca-intermedia', '72 %', T.intermedia, T.intermedia, 16, ROTULO],
    ['paso detalle', 'marca-detalle', 'Correctas', T.acierto, T.acierto, 16,
      { tamano: '13px', familia: 'PlexSans-Regular', mayusculas: 'none' }],
    ['paso dato', 'marca-dato', '12', T.error, T.error, 16,
      { tamano: '16px', familia: 'PlexMono-Medium', mayusculas: 'none' }],
    ['paso display', 'marca-display', '72', T.intermedia, T.intermedia, 24,
      { tamano: '72px', familia: 'PlexMono-Medium', mayusculas: 'none' }],
    ['colorTexto tintaSec', 'marca-sec', 'Correctas', T.tintaSec, T.acierto, 16, ROTULO],
  ];
  for (const [nombre, id, texto, colorTexto, colorGlifo, lado, fuente] of casos) {
    const m = await pagina.evaluar(`(function () {
      const el = document.querySelector(${JSON.stringify(sel(id))});
      const svg = el.querySelector('svg');
      const tx = Array.from(el.querySelectorAll('*')).find((n) => n.children.length === 0 && n.textContent.trim());
      const f = tx ? getComputedStyle(tx) : null;
      return {
        texto: tx ? tx.textContent.trim() : null,
        color: f ? f.color : null,
        tamano: f ? f.fontSize : null,
        familia: f ? f.fontFamily.split(',')[0].replace(/["']/g, '').trim() : null,
        mayusculas: f ? f.textTransform : null,
        trazo: svg ? svg.getAttribute('stroke') : null,
        lado: svg ? [svg.getAttribute('width'), svg.getAttribute('height')].join('x') : null,
        oculto: svg ? svg.getAttribute('aria-hidden') : null,
      };
    })()`);
    t.ok(`${tema} · marca ${nombre}: texto`, m.texto && m.texto.toLowerCase(), texto.toLowerCase());
    t.ok(`${tema} · marca ${nombre}: color del texto`, m.color, rgb(colorTexto));
    t.ok(`${tema} · marca ${nombre}: color del glifo`, m.trazo, colorGlifo);
    t.ok(`${tema} · marca ${nombre}: paso tipográfico`,
      `${m.tamano} ${m.familia} ${m.mayusculas}`, `${fuente.tamano} ${fuente.familia} ${fuente.mayusculas}`);
    t.ok(`${tema} · marca ${nombre}: glifo de ${lado} px, decorativo`,
      `${m.lado} ${m.oculto}`, `${lado}x${lado} true`);
  }
}

async function rotulos(pagina, t, tema, T) {
  for (const [id, color] of [['rotulo-tintaSec', T.tintaSec], ['rotulo-acento', T.acento]]) {
    const r = await pagina.evaluar(`(function () {
      const s = getComputedStyle(document.querySelector(${JSON.stringify(sel(id))}));
      return [s.color, s.fontSize, s.textTransform, s.letterSpacing].join('|');
    })()`);
    t.ok(`${tema} · ${id}: color, rotulo 11 px en mayúsculas`, r,
      `${rgb(color)}|11px|uppercase|0.66px`);
  }
}

// Columna (comun.md §7): ancho completo menos paso 5 en teléfono; `columna` (448)
// centrada desde 768.
async function columna(navegador, base, t) {
  for (const ancho of [390, 768, 1280]) {
    const pagina = await abrirPagina(navegador, { ancho, alto: 900 });
    try {
      await pagina.ir(`${base}/`);
      const hay = await pagina.esperarA(() => pagina.evaluar(
        `!!document.querySelector(${JSON.stringify(sel('columna'))})`), { limite: 30000 });
      t.ok(`${ancho} px: la página de prueba carga`, hay, true);
      if (!hay) continue;
      await new Promise((r) => setTimeout(r, 300));
      const c = await pagina.evaluar(`(function () {
        const el = document.querySelector(${JSON.stringify(sel('columna'))});
        const r = el.getBoundingClientRect(), s = getComputedStyle(el);
        const h = document.querySelector(${JSON.stringify(sel('pagina-componentes'))}).getBoundingClientRect();
        return { ancho: r.width, izq: r.left, relleno: s.paddingLeft + ' ' + s.paddingRight,
          contenido: h.left, vista: window.innerWidth,
          desborda: document.documentElement.scrollWidth > window.innerWidth };
      })()`);
      const esperado = ancho >= 768 ? 448 : ancho;
      t.ok(`${ancho} px: la columna mide ${esperado} px`, c.ancho, esperado);
      t.ok(`${ancho} px: centrada en horizontal`, c.izq, (ancho - esperado) / 2);
      t.ok(`${ancho} px: margen lateral paso 5`, c.relleno, `${5 * PASO}px ${5 * PASO}px`);
      t.ok(`${ancho} px: el contenido arranca dentro del margen`, c.contenido, c.izq + 5 * PASO);
      t.ok(`${ancho} px: sin scroll horizontal`, c.desborda, false);
    } finally {
      await pagina.cerrar();
    }
  }
}

// Escritorio (comun.md §7.2, tokens.md c.4): bajo 1024 todo como hoy (`columna`); desde 1024
// la hoja (`lectura` 600, `hoja` 952, `hoja-amplia` 1440), el margen lateral paso 8, las
// regiones, el orden de foco igual al de DOM y el flujo por columnas (2 desde 1024, 3 desde
// 1440). Los valores se escriben acá a propósito: son el contrato, y `cortes.js` se compara
// contra ellos (un solo origen de verdad para la hoja de estilos y para el JS).
const ESC = { corte: 1024, amplio: 1440, lectura: 600, lateral: 320, hoja: 952, hojaAmplia: 1440 };
const SEPARACION = 8 * PASO;   // paso 8: margen lateral y entre regiones
const COLUMNAS = 8 * PASO;     // paso 8: entre columnas de una lista de filas (§7.2)

const MEDIR_ESCRITORIO = `(function () {
  const caja = (id) => {
    const el = document.querySelector('[data-testid="' + id + '"]');
    if (!el) return null;
    const r = el.getBoundingClientRect(), c = getComputedStyle(el);
    return { x: r.left, y: r.top, ancho: r.width, alto: r.height, der: r.right,
      relleno: c.paddingLeft, overflow: c.overflow + '|' + c.overflowX + '|' + c.overflowY,
      rol: el.getAttribute('role'), nombre: el.getAttribute('aria-label') };
  };
  const dentro = (id) => {
    const el = document.querySelector('[data-testid="' + id + '"]');
    if (!el || !el.firstElementChild) return null;
    const r = el.firstElementChild.getBoundingClientRect();
    return { x: r.left, ancho: r.width, der: r.right,
      overflow: getComputedStyle(el.firstElementChild).overflow };
  };
  const ids = (p, n) => Array.from({ length: n }, (_, i) => p + (i + 1));
  const salida = { vista: window.innerWidth,
    desborda: document.documentElement.scrollWidth > window.innerWidth };
  // react-native-web recorta el desborde horizontal (overflowX hidden) en el ScrollView
  // vertical de la página de prueba: el documento nunca desborda. Se mide el ScrollView.
  let sv = (document.querySelector('[data-testid="pagina-componentes"]') || {}).parentElement;
  while (sv && sv !== document.body && !(sv.scrollHeight > sv.clientHeight)) sv = sv.parentElement;
  salida.scrollInterno = sv && sv !== document.body
    ? { ancho: sv.scrollWidth, cliente: sv.clientWidth } : null;
  for (const id of ['col-lectura', 'hoja-izquierda', 'hoja-derecha', 'hoja-amplia', 'columna']) {
    salida[id] = caja(id);
    salida[id + ':interna'] = dentro(id);
  }
  for (const id of ['regiones-izquierda', 'lateral-izquierda', 'principal-izquierda',
    'regiones-derecha', 'lateral-derecha', 'principal-derecha', 'flujo']) salida[id] = caja(id);
  for (const id of ids('foco-a', 4).concat(ids('foco-b', 3))) salida[id] = caja(id);
  salida.celdas = ids('flujo-', 10).map(caja);
  // Barras: la barra (fondo y filete), el contenedor exterior y la fila de contenido
  salida.barras = {};
  for (const id of ['header-columna', 'header-hoja', 'barra-columna', 'barra-hoja-amplia']) {
    const el = document.querySelector('[data-testid="' + id + '"]');
    const ext = el && el.firstElementChild, fila = ext && ext.firstElementChild;
    if (!fila) { salida.barras[id] = null; continue; }
    const r = el.getBoundingClientRect(), f = fila.getBoundingClientRect();
    salida.barras[id] = { x: r.left, ancho: r.width, fila: { x: f.left, ancho: f.width },
      filete: getComputedStyle(el).borderBottomWidth };
  }
  // Envoltura de cada celda: el padre directo, que pone FlujoColumnas.
  salida.envolturas = ids('flujo-', 10).map((id) => {
    const el = document.querySelector('[data-testid="' + id + '"]');
    const p = el && el.parentElement;
    if (!p) return null;
    const c = getComputedStyle(p);
    return { overflow: c.overflow + '|' + c.overflowX + '|' + c.overflowY,
      rol: p.getAttribute('role'), nombre: p.getAttribute('aria-label') };
  });
  return salida;
})()`;

async function escritorio(navegador, base, t) {
  let cortes = null;
  try { cortes = require('../../../src/components/plancha/cortes'); } catch (e) { /* aún no existe */ }
  t.ok('cortes.js: corte escritorio', cortes && cortes.CORTE_ESCRITORIO, ESC.corte);
  t.ok('cortes.js: corte amplio', cortes && cortes.CORTE_AMPLIO, ESC.amplio);
  t.ok('cortes.js: anchos', cortes && JSON.stringify(cortes.ANCHOS),
    JSON.stringify({ lectura: ESC.lectura, lateral: ESC.lateral, hoja: ESC.hoja, 'hoja-amplia': ESC.hojaAmplia }));

  // A1: el CSS generado (`theme.extend.screens` de tailwind.config.js) dice lo mismo que cortes.js.
  let pantallas = null;
  try { pantallas = require('../../../tailwind.config.js').theme.extend.screens; } catch (e) { /* ilegible */ }
  t.ok('tailwind.config.js: variante escritorio', pantallas && pantallas.escritorio, `${ESC.corte}px`);
  t.ok('tailwind.config.js: variante amplio', pantallas && pantallas.amplio, `${ESC.amplio}px`);

  // 1439 = un px bajo `amplio`: dos columnas y hoja amplia en 952 (A1)
  for (const ancho of [1023, 1024, 1366, 1439, 1440, 1920]) {
    const pagina = await abrirPagina(navegador, { ancho, alto: 900 });
    const cuando = (m) => `${ancho} px: ${m}`;
    try {
      await pagina.ir(`${base}/`);
      const hay = await pagina.esperarA(() => pagina.evaluar(
        `!!document.querySelector(${JSON.stringify(sel('flujo'))})`), { limite: 30000 });
      t.ok(cuando('la página de prueba carga'), hay, true);
      if (!hay) continue;
      await new Promise((r) => setTimeout(r, 300));
      const m = await pagina.evaluar(MEDIR_ESCRITORIO);
      const de = ancho >= ESC.corte;
      const vista = m.vista;

      t.ok(cuando('sin scroll horizontal'), m.desborda, false);
      // A2: el ScrollView interno es el que recorta; ahí sí puede fallar
      t.ok(cuando('sin scroll horizontal en el ScrollView de la página'),
        m.scrollInterno && m.scrollInterno.ancho > m.scrollInterno.cliente, false);
      // La columna de siempre no cambia con el ancho (448 centrada desde 768)
      t.ok(cuando('`columna` sigue en 448'), m.columna.ancho, 448);

      // Hoja: bajo el corte, igual que `columna`; desde el corte, ancho completo con margen paso 8
      // y el contenido en su tope, que cede cuando la ventana no alcanza.
      const utilAncho = vista - 2 * SEPARACION;
      const topes = {
        'col-lectura': ESC.lectura,
        'hoja-izquierda': ESC.hoja,
        'hoja-derecha': ESC.hoja,
        'hoja-amplia': vista >= ESC.amplio ? ESC.hojaAmplia : ESC.hoja,
      };
      for (const [id, tope] of Object.entries(topes)) {
        const e = m[id], i = m[`${id}:interna`];
        if (!de) {
          t.ok(cuando(`${id}: bajo el corte mide como la columna (448)`), e.ancho, 448);
          t.ok(cuando(`${id}: bajo el corte, margen paso 5`), e.relleno, `${5 * PASO}px`);
          t.ok(cuando(`${id}: bajo el corte, el contenido llena la columna`), i.ancho, 448 - 2 * 5 * PASO);
        } else {
          const util = Math.min(tope, utilAncho);
          t.ok(cuando(`${id}: ocupa todo el ancho`), e.ancho, vista);
          t.ok(cuando(`${id}: margen lateral paso 8`), e.relleno, `${SEPARACION}px`);
          t.ok(cuando(`${id}: contenido ${util} px`), i.ancho, util);
          t.ok(cuando(`${id}: centrado`), i.x, (vista - util) / 2);
        }
        t.ok(cuando(`${id}: sin overflow que recorte el foco`),
          `${e.overflow} ${i.overflow}`, 'visible|visible|visible visible');
      }

      // Regiones, lateral a la izquierda: DOM lateral → principal
      const IZQ = [m['regiones-izquierda'], m['lateral-izquierda'], m['principal-izquierda']];
      const DER = [m['regiones-derecha'], m['lateral-derecha'], m['principal-derecha']];
      for (const [nombre, [reg, lat, pri], lateralPrimero] of
        [['lateral a la izquierda', IZQ, true], ['lateral a la derecha', DER, false]]) {
        t.ok(cuando(`${nombre}: sin rol ni nombre accesible propios`),
          [reg, lat, pri].map((r) => `${r.rol}|${r.nombre}`).join(' '), 'null|null null|null null|null');
        t.ok(cuando(`${nombre}: sin overflow`),
          [reg, lat, pri].map((r) => r.overflow).join(' '),
          'visible|visible|visible visible|visible|visible visible|visible|visible');
        if (!de) {
          t.ok(cuando(`${nombre}: apiladas, las dos al ancho de la columna`),
            `${lat.ancho}|${pri.ancho}`, `${reg.ancho}|${reg.ancho}`);
          t.ok(cuando(`${nombre}: apiladas en el orden de DOM`),
            lateralPrimero ? lat.y < pri.y : pri.y < lat.y, true);
          continue;
        }
        t.ok(cuando(`${nombre}: lateral de ${ESC.lateral} px`), lat.ancho, ESC.lateral);
        t.ok(cuando(`${nombre}: principal flexible (el resto menos paso 8)`),
          pri.ancho, reg.ancho - ESC.lateral - SEPARACION);
        t.ok(cuando(`${nombre}: alineadas arriba`), lat.y, pri.y);
        const [primera, segunda] = lateralPrimero ? [lat, pri] : [pri, lat];
        t.ok(cuando(`${nombre}: separadas por paso 8`), segunda.x - primera.der, SEPARACION);
        t.ok(cuando(`${nombre}: el orden visual es el de DOM`), primera.x < segunda.x, true);
      }
      if (de) {
        // `hoja` = lateral + paso 8 + lectura: con la hoja completa la principal mide `lectura`
        t.ok(cuando('región principal de 600 con la hoja completa'),
          m['principal-izquierda'].ancho, ESC.lectura);
      }

      // Foco = DOM = visual (Tab, sin saltos hacia atrás)
      for (const [prefijo, ids] of [['foco-a', ['foco-a1', 'foco-a2', 'foco-a3', 'foco-a4']],
        ['foco-b', ['foco-b1', 'foco-b2', 'foco-b3']]]) {
        const orden = [];
        await pagina.evaluar(`document.querySelector(${JSON.stringify(sel(ids[0]))}).focus()`);
        orden.push(await pagina.evaluar(`document.activeElement.getAttribute('data-testid')`));
        for (let i = 1; i < ids.length; i++) {
          await pagina.tecla('Tab');
          orden.push(await pagina.evaluar(`document.activeElement.getAttribute('data-testid')`));
        }
        t.ok(cuando(`${prefijo}: Tab recorre el orden de DOM`), orden.join(','), ids.join(','));
        const cajas = ids.map((id) => m[id]);
        let saltosAtras = 0;
        for (let i = 1; i < cajas.length; i++) {
          const a = cajas[i - 1], b = cajas[i];
          if (!(b.y > a.y + 1 || b.x > a.x + 1)) saltosAtras++;
        }
        t.ok(cuando(`${prefijo}: ningún salto hacia atrás en la pantalla`), saltosAtras, 0);
      }
      await pagina.evaluar('document.activeElement && document.activeElement.blur()');

      // Flujo por columnas: 1 columna bajo el corte, 2 desde 1024, 3 desde 1440
      const esperadas = ancho >= ESC.amplio ? 3 : de ? 2 : 1;
      const xs = [...new Set(m.celdas.map((c) => Math.round(c.x)))].sort((a, b) => a - b);
      t.ok(cuando(`flujo en ${esperadas} columna(s)`), xs.length, esperadas);
      const col = (c) => xs.indexOf(Math.round(c.x));
      const claves = m.celdas.map((c) => [col(c), c.y]);
      const enOrden = claves.every((k, i) => i === 0
        || k[0] > claves[i - 1][0] || (k[0] === claves[i - 1][0] && k[1] > claves[i - 1][1]));
      t.ok(cuando('flujo: el orden de DOM baja por la columna y sigue por la siguiente'), enOrden, true);
      t.ok(cuando('flujo: ninguna celda partida entre columnas'),
        m.celdas.every((c, i) => c.alto === ((i + 1) % 2 ? 11 * PASO : 16 * PASO)), true);
      if (esperadas > 1) {
        const f = m.flujo;
        const ancho1 = m.celdas[0].ancho;
        t.ok(cuando(`flujo: celdas de igual ancho, columnas separadas por paso 8`),
          Math.abs((f.ancho - COLUMNAS * (esperadas - 1)) / esperadas - ancho1) < 0.05, true);
      }
      // Barras (comun.md §7.2, fila «Barras»): fondo y filete a todo el ancho; el contenido,
      // en `columna` como siempre o dentro de la hoja con margen paso 8 desde el corte
      const cuerpo = Math.min(448, vista);
      const casos = [
        ['header-columna', null], ['barra-columna', null],
        ['header-hoja', ESC.hoja], ['barra-hoja-amplia', vista >= ESC.amplio ? ESC.hojaAmplia : ESC.hoja],
      ];
      for (const [id, tope] of casos) {
        const b = m.barras[id];
        if (!b) { t.ok(cuando(`${id}: existe`), false, true); continue; }
        t.ok(cuando(`${id}: a todo el ancho`), `${b.x}|${b.ancho}`, `0|${vista}`);
        if (id.startsWith('barra')) t.ok(cuando(`${id}: filete a todo el ancho`), b.filete, '1px');
        let ancho, x;
        if (tope === null) { ancho = cuerpo; x = (vista - cuerpo) / 2; }
        else if (de) { ancho = Math.min(tope, vista - 2 * SEPARACION); x = (vista - ancho) / 2; }
        else { ancho = cuerpo - 2 * 5 * PASO; x = (vista - cuerpo) / 2 + 5 * PASO; }
        t.ok(cuando(`${id}: contenido de ${ancho} px`), b.fila.ancho, ancho);
        t.ok(cuando(`${id}: contenido centrado`), b.fila.x, x);
      }
      // A3: ni el contenedor ni la envoltura de cada celda recortan, ni llevan rol ni nombre
      t.ok(cuando('flujo: contenedor sin overflow, sin rol ni nombre'),
        `${m.flujo.overflow} ${m.flujo.rol}|${m.flujo.nombre}`, 'visible|visible|visible null|null');
      t.ok(cuando('flujo: envoltura de cada celda sin overflow, sin rol ni nombre'),
        m.envolturas.map((e) => `${e.overflow} ${e.rol}|${e.nombre}`).every(
          (x) => x === 'visible|visible|visible null|null'), true);
    } finally {
      await pagina.cerrar();
    }
  }
}

// La guarda de build (hallazgo 1): `scripts/verificar-bundle.mjs` tiene que fallar sobre
// un bundle que contiene la página de prueba, que es justo el que acaba de armar `construir`.
function guardaDeBundle(t) {
  const r = spawnSync('node', ['scripts/verificar-bundle.mjs'], {
    cwd: RAIZ, encoding: 'utf8', env: { ...process.env, PKAPP_DIST: `${DIST}-componentes` },
  });
  t.ok('verificar-bundle: sale con 1 sobre un bundle con la página de prueba', r.status, 1);
  t.ok('verificar-bundle: nombra la página de prueba en el error',
    /página de prueba/.test(r.stderr), true);
}

module.exports = [
  {
    nombre: 'componentes · clases de control, lámina, marcas y columna de la Plancha',
    async correr(_pagina, _base, t) {
      construir();
      const puerto = await puertoLibre();
      const servidor = await servirEstatico(SALIDA, puerto);
      const navegador = await conectarNavegador(PUERTO_CDP);
      const base = `http://localhost:${puerto}`;
      try {
        guardaDeBundle(t);
        await probarTema(navegador, base, t, 'claro');
        await probarTema(navegador, base, t, 'oscuro');
        await columna(navegador, base, t);
        await escritorio(navegador, base, t);
      } finally {
        navegador.cerrar();
        await servidor.cerrar();
        fs.rmSync(SALIDA, { recursive: true, force: true });
        fs.rmSync(CACHE, { recursive: true, force: true });
      }
    },
  },
];

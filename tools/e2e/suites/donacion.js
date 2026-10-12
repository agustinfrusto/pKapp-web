// Suite «donacion» del arnés end-to-end (ver ../README.md): el pedido de donación
// (`DonationBox`, tarea 3.8, ficha DonationBox.md, DON-P5).
//
// Las variantes (normal, descartable, celebratoria) se prueban sobre la página de prueba
// de la 2.9, que las monta con `data-testid` fijos: la celebratoria de Results depende de
// un porcentaje que el arnés no puede fijar sin responder bien un quiz. La variante de
// MateriaSelect se prueba además en la app real, entrando por la materia.
//
// El build de la página de prueba es propio (`<PKAPP_DIST>-donacion/`), con su caché y su
// puerto, como el de la suite «componentes».

const fs = require('fs');
const net = require('net');
const path = require('path');
const { execFileSync } = require('child_process');
const { conectarNavegador, abrirPagina } = require('../cdp');
const { servirEstatico } = require('../entorno');
const { plancha } = require('../../../src/theme/colores');
const { LADO_TACTIL, PASO, cerrarNota, entrarAMateria } = require('./comunes');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const DIST = process.env.PKAPP_DIST || 'dist';
const SALIDA = path.resolve(RAIZ, `${DIST}-donacion`);
const CACHE = path.resolve(RAIZ, `${DIST}-donacion-cache`);
const PUERTO_CDP = Number(process.env.PKAPP_PUERTO_CDP || process.env.E2E_PUERTO_CDP || 9222);

const TITULO = 'Ayuda a mantener esta aplicación';
const TITULO_CELEBRATORIO = '¡Gran resultado!';
const TEXTO = 'Esta web NO ES DE UDELAR y se mantiene por donaciones. Para hacerla posible:';
const TEXTO_CELEBRATORIO =
  'Si pKapp te está ayudando a llegar al examen, dale una mano para mantenerla (no es de Udelar):';
const PIE = 'Vía Mercado Pago';
const MONTOS = ['$50', '$100', '$200', '$500'];
const MONTOS_VALOR = [50, 100, 200, 500];

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

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

const sel = (id) => `[data-testid="${id}"]`;

// Lee el elemento `s`: caja, colores computados del contenedor interno (primer hijo) y
// del primer texto, glifo, contorno y atributos accesibles.
const LEER = (s) => `(function () {
  const el = document.querySelector(${JSON.stringify(s)});
  if (!el) return null;
  const hoja = (n) => {
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = w.nextNode())) if (t.textContent.trim()) return t.parentElement;
    return null;
  };
  const caja = el.firstElementChild || el;
  const c = getComputedStyle(el), k = getComputedStyle(caja);
  const texto = hoja(el);
  const tf = texto ? getComputedStyle(texto) : null;
  const svg = el.querySelector('svg');
  const r = el.getBoundingClientRect();
  return {
    rect: { x: r.left, y: r.top, ancho: r.width, alto: r.height },
    fondo: c.backgroundColor, fondoInterno: k.backgroundColor,
    borde: c.borderTopColor, bordeAncho: c.borderTopWidth,
    bordeInterno: k.borderTopColor, bordeInternoAncho: k.borderTopWidth,
    bordeSup: c.borderTopColor, bordeSupAncho: c.borderTopWidth, bordeSupEstilo: c.borderTopStyle,
    relleno: { izq: c.paddingLeft, arr: c.paddingTop },
    rellenoInterno: { izq: k.paddingLeft, arr: k.paddingTop },
    texto: texto ? texto.textContent.trim() : null,
    colorTexto: tf ? tf.color : null,
    fuente: tf ? { tamano: tf.fontSize, familia: tf.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
      mayusculas: tf.textTransform } : null,
    glifo: svg ? svg.getAttribute('stroke') : null,
    glifoOculto: svg ? svg.getAttribute('aria-hidden') : null,
    contorno: { estilo: c.outlineStyle, ancho: c.outlineWidth, color: c.outlineColor, separacion: c.outlineOffset },
    nombre: el.getAttribute('aria-label'),
    rol: el.getAttribute('role'),
    foco: document.activeElement === el,
  };
})()`;

const centro = (l) => ({ x: Math.round(l.rect.x + l.rect.ancho / 2), y: Math.round(l.rect.y + l.rect.alto / 2) });
const pausa = (ms = 120) => new Promise((r) => setTimeout(r, ms));

async function enfocarConTab(pagina, s) {
  await pagina.evaluar('document.activeElement && document.activeElement.blur()');
  for (let i = 0; i < 80; i++) {
    await pagina.tecla('Tab');
    if (await pagina.evaluar(`document.activeElement === document.querySelector(${JSON.stringify(s)})`)) return true;
  }
  return false;
}

// Cuántas marcas de esquina tiene el pedido y cómo son.
const LEER_MARCAS = (id) => `(function () {
  const raiz = document.querySelector(${JSON.stringify(sel(id))});
  if (!raiz) return null;
  const marco = raiz.firstElementChild.getBoundingClientRect();
  return Array.from(raiz.querySelectorAll('[data-testid="marca-esquina"]')).map((m, i) => {
    const r = m.getBoundingClientRect(), s = getComputedStyle(m);
    return {
      oculta: m.getAttribute('aria-hidden'), lado: [r.width, r.height],
      // cuánto sobresale del marco por sus dos lados exteriores
      sobresale: [i % 2 === 0 ? marco.left - r.left : r.right - marco.right,
        i < 2 ? marco.top - r.top : r.bottom - marco.bottom],
      color: s.borderTopColor !== 'rgba(0, 0, 0, 0)' ? s.borderTopColor : s.borderBottomColor,
    };
  });
})()`;

async function estructura(pagina, t, tema, T, id, { celebratoria, descartable }) {
  const c = `${tema} · ${id}`;
  const raiz = await pagina.evaluar(LEER(sel(id)));
  t.ok(`${c}: existe`, raiz !== null, true);
  if (!raiz) return;

  // Marco `acento`, border-2 (N17), y relleno del panel `acentoFondo` (N22)
  t.ok(`${c}: marco acento border-2`,
    `${raiz.bordeInternoAncho} ${raiz.bordeInterno}`, `2px ${rgb(T.acento)}`);

  const banda = await pagina.evaluar(LEER(sel(`${id}-banda`)));
  t.ok(`${c}: banda en acentoBanda`, banda && banda.fondo, rgb(T.acentoBanda));
  t.ok(`${c}: banda de alto paso 11 como mínimo`, banda && banda.rect.alto >= LADO_TACTIL, true);
  t.ok(`${c}: banda con relleno lateral paso 3.5 y vertical paso 2`,
    banda && `${banda.relleno.izq} ${banda.relleno.arr}`, `${3.5 * PASO}px ${2 * PASO}px`);

  const titulo = await pagina.evaluar(LEER(sel(`${id}-titulo`)));
  t.ok(`${c}: título`, titulo && titulo.texto, celebratoria ? TITULO_CELEBRATORIO : TITULO);
  t.ok(`${c}: título en fondo sobre la banda (T22)`, titulo && titulo.colorTexto, rgb(T.fondo));
  t.ok(`${c}: título en paso item`, titulo && `${titulo.fuente.tamano}`, '16px');
  t.ok(`${c}: título sin pasar a mayúsculas`, titulo && titulo.fuente.mayusculas, 'none');

  const trofeo = await pagina.evaluar(LEER(sel(`${id}-trofeo`)));
  if (celebratoria) {
    t.ok(`${c}: trofeo en fondo sobre la banda (N21)`, trofeo && trofeo.glifo, T.fondo);
  } else {
    t.ok(`${c}: sin trofeo`, trofeo, null);
  }
  if (celebratoria) {
    const glifo = await pagina.evaluar(`(function () {
      const s = document.querySelector(${JSON.stringify(sel(`${id}-trofeo`))});
      const v = s ? s.querySelector('svg') : null;
      return v ? v.getAttribute('aria-hidden') : null;
    })()`);
    t.ok(`${c}: trofeo decorativo (aria-hidden)`, glifo, 'true');
  }

  const cuerpo = await pagina.evaluar(LEER(sel(`${id}-cuerpo`)));
  t.ok(`${c}: cuerpo en acentoFondo`, cuerpo && cuerpo.fondo, rgb(T.acentoFondo));
  t.ok(`${c}: cuerpo con relleno paso 3.5`,
    cuerpo && `${cuerpo.relleno.izq} ${cuerpo.relleno.arr}`, `${3.5 * PASO}px ${3.5 * PASO}px`);

  const aviso = await pagina.evaluar(LEER(sel(`${id}-aviso`)));
  t.ok(`${c}: texto del aviso`, aviso && aviso.texto, celebratoria ? TEXTO_CELEBRATORIO : TEXTO);
  t.ok(`${c}: texto del aviso en tinta (T20)`, aviso && aviso.colorTexto, rgb(T.tinta));

  const pie = await pagina.evaluar(LEER(sel(`${id}-pie`)));
  t.ok(`${c}: pie en acentoFondo`, pie && pie.fondo, rgb(T.acentoFondo));
  t.ok(`${c}: pie con filete superior, border (X7)`,
    pie && `${pie.bordeSupAncho} ${pie.bordeSup}`, `1px ${rgb(T.filete)}`);
  t.ok(`${c}: pie «${PIE}» en tintaSec (T21)`, pie && `${pie.texto}|${pie.colorTexto}`, `${PIE}|${rgb(T.tintaSec)}`);
  t.ok(`${c}: pie en paso rotulo, mayúsculas`,
    pie && `${pie.fuente.tamano} ${pie.fuente.mayusculas}`, '11px uppercase');

  // Montos: una celda por monto, `superficie` con borde `acento` (K2 de acento, X6)
  const celdas = [];
  for (const v of MONTOS_VALOR) celdas.push(await pagina.evaluar(LEER(sel(`${id}-monto-${v}`))));
  t.ok(`${c}: cuatro montos, en orden`, celdas.map((m) => m && m.texto).join(' '), MONTOS.join(' '));
  for (const [i, m] of celdas.entries()) {
    if (!m) continue;
    t.ok(`${c} · ${MONTOS[i]}: fondo superficie, borde acento border`,
      `${m.fondoInterno} ${m.bordeInternoAncho} ${m.bordeInterno}`, `${rgb(T.superficie)} 1px ${rgb(T.acento)}`);
    t.ok(`${c} · ${MONTOS[i]}: texto acento (T6)`, m.colorTexto, rgb(T.acento));
    t.ok(`${c} · ${MONTOS[i]}: paso dato`,
      `${m.fuente.tamano} ${m.fuente.familia}`, '16px PlexMono-Medium');
    t.ok(`${c} · ${MONTOS[i]}: al menos ${LADO_TACTIL} × ${LADO_TACTIL}`,
      m.rect.ancho >= LADO_TACTIL && m.rect.alto >= LADO_TACTIL, true);
  }
  const fila = celdas.filter(Boolean);
  t.ok(`${c}: montos en una fila`, new Set(fila.map((m) => Math.round(m.rect.y))).size, 1);
  t.ok(`${c}: celdas de igual ancho`, new Set(fila.map((m) => Math.round(m.rect.ancho))).size, 1);
  t.ok(`${c}: paso 2 como mínimo entre montos`,
    fila.every((m, i) => i === 0 || m.rect.x - (fila[i - 1].rect.x + fila[i - 1].rect.ancho) >= 2 * PASO - 0.5), true);

  // Marcas de esquina `linea`, decorativas, de lado paso 2 y sobresaliendo paso 1
  const marcas = await pagina.evaluar(LEER_MARCAS(id));
  t.ok(`${c}: cuatro marcas de esquina`, marcas && marcas.length, 4);
  t.ok(`${c}: marcas decorativas, de paso 2, en linea, sobresalen paso 1`,
    marcas && marcas.every((m) => m.oculta === 'true' && m.lado[0] === 2 * PASO && m.lado[1] === 2 * PASO
      && m.color === rgb(T.linea) && Math.abs(m.sobresale[0] - PASO) < 1 && Math.abs(m.sobresale[1] - PASO) < 1),
    true);

  // Descartar solo en la variante descartable
  const des = await pagina.evaluar(LEER(sel(`${id}-descartar`)));
  if (!descartable) {
    t.ok(`${c}: sin descartar`, des, null);
    return;
  }
  t.ok(`${c}: descartar de 44 × 44`, des && `${des.rect.ancho}×${des.rect.alto}`, `${LADO_TACTIL}×${LADO_TACTIL}`);
  t.ok(`${c}: descartar con nombre «Cerrar»`, des && des.nombre, 'Cerrar');
  t.ok(`${c}: glifo-cerrar en fondo (N21)`, des && des.glifo, T.fondo);
  const marco = await pagina.evaluar(
    `document.querySelector(${JSON.stringify(sel(id))}).firstElementChild.getBoundingClientRect().right`);
  t.ok(`${c}: descartar a ras del marco, esquina superior derecha`,
    des && Math.abs(des.rect.x + des.rect.ancho - (marco - 2)) < 1, true);
  t.ok(`${c}: el título no pisa el objetivo de descartar`,
    banda && titulo && des && (await pagina.evaluar(`(function () {
      const t = document.querySelector(${JSON.stringify(sel(`${id}-titulo`))}).getBoundingClientRect();
      const d = document.querySelector(${JSON.stringify(sel(`${id}-descartar`))}).getBoundingClientRect();
      return t.right <= d.left + 0.5;
    })()`)), true);
}

// Estados K de un monto y de descartar, con puntero y teclado reales.
async function estados(ctx, id, { descartable }) {
  const { pagina, navegador, t, T, tema } = ctx;
  const c = `${tema} · ${id}`;
  const objetivo = sel(`${id}-monto-100`);

  await pagina.moverA(1, 1);
  const reposo = await pagina.evaluar(LEER(objetivo));
  const p = centro(reposo);

  await pagina.moverA(p.x, p.y);
  await pausa();
  const hover = await pagina.evaluar(LEER(objetivo));
  t.ok(`${c} · monto hover: contorno acento 1px sin separación`,
    `${hover.contorno.estilo} ${hover.contorno.ancho} ${hover.contorno.color} ${hover.contorno.separacion}`,
    `solid 1px ${rgb(T.acento)} 0px`);

  await navegador.enviar('Input.dispatchMouseEvent',
    { type: 'mousePressed', x: p.x, y: p.y, button: 'left', clickCount: 1, buttons: 1 }, pagina.sessionId);
  await pausa(150);
  const presionado = await pagina.evaluar(LEER(objetivo));
  t.ok(`${c} · monto presionado: inversión tinta / fondo / tinta`,
    `${presionado.fondoInterno} ${presionado.colorTexto} ${presionado.bordeInterno}`,
    `${rgb(T.tinta)} ${rgb(T.fondo)} ${rgb(T.tinta)}`);
  await navegador.enviar('Input.dispatchMouseEvent',
    { type: 'mouseReleased', x: 1, y: 1, button: 'left', clickCount: 1, buttons: 0 }, pagina.sessionId);
  await pagina.moverA(1, 1);
  await pagina.evaluar('document.activeElement && document.activeElement.blur()');

  t.ok(`${c} · monto foco: llega con Tab`, await enfocarConTab(pagina, objetivo), true);
  const foco = await pagina.evaluar(LEER(objetivo));
  t.ok(`${c} · monto foco: contorno foco 2px separado paso 0.5`,
    `${foco.contorno.ancho} ${foco.contorno.color} ${foco.contorno.separacion}`,
    `2px ${rgb(T.foco)} ${0.5 * PASO}px`);
  await pagina.evaluar('document.activeElement.blur()');

  if (!descartable) return;
  const d = sel(`${id}-descartar`);
  const rd = await pagina.evaluar(LEER(d));
  const pd = centro(rd);
  await pagina.moverA(pd.x, pd.y);
  await pausa();
  const hd = await pagina.evaluar(LEER(d));
  t.ok(`${c} · descartar hover: contorno fondo 1px`,
    `${hd.contorno.estilo} ${hd.contorno.ancho} ${hd.contorno.color}`, `solid 1px ${rgb(T.fondo)}`);
  await navegador.enviar('Input.dispatchMouseEvent',
    { type: 'mousePressed', x: pd.x, y: pd.y, button: 'left', clickCount: 1, buttons: 1 }, pagina.sessionId);
  await pausa(150);
  const pr = await pagina.evaluar(LEER(d));
  t.ok(`${c} · descartar presionado: inversión total sobre la banda (fondo y glifo acentoBanda)`,
    `${pr.fondoInterno} ${pr.glifo}`, `${rgb(T.fondo)} ${T.acentoBanda}`);
  await navegador.enviar('Input.dispatchMouseEvent',
    { type: 'mouseReleased', x: 1, y: 1, button: 'left', clickCount: 1, buttons: 0 }, pagina.sessionId);
  await pagina.moverA(1, 1);
  await pagina.evaluar('document.activeElement && document.activeElement.blur()');

  t.ok(`${c} · descartar foco: llega con Tab`, await enfocarConTab(pagina, d), true);
  const fd = await pagina.evaluar(LEER(d));
  t.ok(`${c} · descartar foco: contorno fondo 2px hacia adentro`,
    `${fd.contorno.ancho} ${fd.contorno.color} ${fd.contorno.separacion}`,
    `2px ${rgb(T.fondo)} -2px`);
  await pagina.evaluar('document.activeElement.blur()');
}

// Un toque emite `donacion_click` con { origen, monto } y abre el enlace del monto.
const ESPIAR = `(function () {
  window.__eventos = [];
  window.__abiertos = [];
  window.umami = { track: (e, d) => window.__eventos.push([e, d]) };
  window.open = (u) => { window.__abiertos.push(u); return null; };
})()`;

async function toques(pagina, t, tema) {
  await pagina.evaluar(ESPIAR);
  const id = 'don-normal';
  for (const [i, v] of MONTOS_VALOR.entries()) {
    const l = await pagina.evaluar(LEER(sel(`${id}-monto-${v}`)));
    const p = centro(l);
    await pagina.clicEn(p.x, p.y);
    await pagina.esperarA(() => pagina.evaluar(`window.__eventos.length === ${i + 1}`), { limite: 3000 });
  }
  const eventos = await pagina.evaluar('window.__eventos');
  t.ok(`${tema} · donacion_click por monto, con origen, variante y uso`,
    JSON.stringify(eventos.map(([e, d]) => [e, d.origen, d.monto, d.variante, d.uso, 'tramo' in d])),
    JSON.stringify(MONTOS_VALOR.map((v) => ['donacion_click', 'prueba-normal', v, 'normal', '0', false])));
  await pagina.esperarA(() => pagina.evaluar('window.__abiertos.length === 4'), { limite: 3000 });
  t.ok(`${tema} · cada monto abre su enlace de Mercado Pago`,
    (await pagina.evaluar('window.__abiertos')).every((u) => /^https:\/\/mpago\.la\//.test(u)), true);
}

async function descartar(pagina, t, tema) {
  await pagina.evaluar(ESPIAR);
  const l = await pagina.evaluar(LEER(sel('don-descartable-descartar')));
  const p = centro(l);
  await pagina.clicEn(p.x, p.y);
  const oculto = await pagina.esperarA(() => pagina.evaluar(
    `!document.querySelector(${JSON.stringify(sel('don-descartable'))})`), { limite: 3000 });
  t.ok(`${tema} · tocar descartar oculta el pedido`, oculto, true);
  t.ok(`${tema} · descartar emite solo donacion_cerrada, con origen y variante, sin tramo`,
    JSON.stringify(await pagina.evaluar('window.__eventos.map(([e, d]) => [e, d.origen, d.variante, "tramo" in d])')),
    JSON.stringify([['donacion_cerrada', 'prueba-descartable', 'normal', false]]));
  t.ok(`${tema} · los otros pedidos siguen visibles`,
    await pagina.evaluar(`!!document.querySelector(${JSON.stringify(sel('don-celebratoria'))})`), true);
}

async function probarTema(navegador, base, t, tema) {
  const T = plancha[tema];
  const pagina = await abrirPagina(navegador, { ancho: 390, alto: 5000 });
  try {
    await pagina.ir(`${base}/?tema=${tema}`);
    const hay = await pagina.esperarA(() => pagina.evaluar(
      `!!document.querySelector(${JSON.stringify(sel('don-normal'))})`), { limite: 30000 });
    t.ok(`${tema}: la página de prueba carga con el pedido`, hay, true);
    if (!hay) return;
    await pausa(300);
    const ctx = { pagina, navegador, t, T, tema };

    await estructura(pagina, t, tema, T, 'don-normal', { celebratoria: false, descartable: false });
    await estructura(pagina, t, tema, T, 'don-descartable', { celebratoria: false, descartable: true });
    await estructura(pagina, t, tema, T, 'don-celebratoria', { celebratoria: true, descartable: true });

    await estados(ctx, 'don-normal', { descartable: false });
    await estados(ctx, 'don-celebratoria', { descartable: true });
    await toques(pagina, t, tema);
    await descartar(pagina, t, tema);
  } finally {
    await pagina.cerrar();
  }
}

// Sin scroll horizontal a 320 y la misma estructura a 768 y 1280 (a.3).
async function anchos(navegador, base, t) {
  for (const ancho of [320, 360, 390, 768, 1280]) {
    const pagina = await abrirPagina(navegador, { ancho, alto: 1200 });
    try {
      await pagina.ir(`${base}/`);
      const hay = await pagina.esperarA(() => pagina.evaluar(
        `!!document.querySelector(${JSON.stringify(sel('don-celebratoria'))})`), { limite: 30000 });
      t.ok(`${ancho} px: la página de prueba carga`, hay, true);
      if (!hay) continue;
      await pausa(300);
      const m = await pagina.evaluar(`(function () {
        const w = window;
        const fuera = Array.from(document.querySelectorAll('*')).filter((n) => {
          const r = n.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.right > w.innerWidth + 0.5;
        }).length;
        const q = (id) => {
          const n = document.querySelector('[data-testid="' + id + '"]');
          const r = n.getBoundingClientRect();
          return { ancho: r.width, alto: r.height, x: r.left, y: r.top };
        };
        const montos = [50, 100, 200, 500].map((v) => q('don-celebratoria-monto-' + v));
        const titulo = document.querySelector('[data-testid="don-celebratoria-titulo"]').getBoundingClientRect();
        const des = q('don-celebratoria-descartar');
        const banda = q('don-celebratoria-banda');
        return { fuera, montos, titulo: { der: titulo.right }, des, banda,
          panel: q('don-celebratoria') };
      })()`);
      t.ok(`${ancho} px: sin scroll horizontal`, m.fuera, 0);
      t.ok(`${ancho} px: montos de 44 de ancho y de alto como mínimo`,
        m.montos.every((x) => x.ancho >= LADO_TACTIL - 0.5 && x.alto >= LADO_TACTIL - 0.5), true);
      t.ok(`${ancho} px: la banda no baja de paso 11`, m.banda.alto >= LADO_TACTIL - 0.5, true);
      t.ok(`${ancho} px: el título no pisa descartar`, m.titulo.der <= m.des.x + 0.5, true);
      if (ancho >= 768) {
        // Columna 448, menos paso 5 por lado, menos el `px-1` del contenedor de la página de prueba.
        t.ok(`${ancho} px: el panel llena la columna (448 − 2 × paso 5 − 2 × paso 1)`,
          Math.round(m.panel.ancho), 448 - 2 * 5 * PASO - 2 * PASO);
      }
    } finally {
      await pagina.cerrar();
    }
  }
}

// MateriaSelect, en la app real: el pedido es persistente (sin descartar) y emite
// `origen: 'materias'`.
async function enMateriaSelect(pagina, base, t) {
  await pagina.ir(base + '/');
  await pagina.esperarTexto('Tus materias');
  const hay = await pagina.esperarA(() => pagina.evaluar(
    `!!document.querySelector(${JSON.stringify(sel('donacion'))})`), { limite: 10000 });
  t.ok('MateriaSelect: muestra el pedido de donación', hay, true);
  if (!hay) return;
  const T = await pagina.evaluar(
    `document.documentElement.classList.contains('dark')`) ? plancha.oscuro : plancha.claro;
  const banda = await pagina.evaluar(LEER(sel('donacion-banda')));
  t.ok('MateriaSelect: banda en acentoBanda', banda && banda.fondo, rgb(T.acentoBanda));
  const cuerpo = await pagina.evaluar(LEER(sel('donacion-cuerpo')));
  t.ok('MateriaSelect: cuerpo en acentoFondo', cuerpo && cuerpo.fondo, rgb(T.acentoFondo));
  const marco = await pagina.evaluar(LEER(sel('donacion')));
  t.ok('MateriaSelect: marco acento border-2',
    `${marco.bordeInternoAncho} ${marco.bordeInterno}`, `2px ${rgb(T.acento)}`);
  t.ok('MateriaSelect: sin descartar (persistente)',
    await pagina.evaluar(`!document.querySelector(${JSON.stringify(sel('donacion-descartar'))})`), true);
  const titulo = await pagina.evaluar(LEER(sel('donacion-titulo')));
  t.ok('MateriaSelect: título normal, sin trofeo', titulo && titulo.texto, TITULO);

  await pagina.evaluar(ESPIAR);
  await pagina.evaluar(`document.querySelector(${JSON.stringify(sel('donacion-monto-200'))})
    .scrollIntoView({ block: 'center' })`);
  await pausa(300);
  const m = await pagina.evaluar(LEER(sel('donacion-monto-200')));
  const p = centro(m);
  await pagina.clicEn(p.x, p.y);
  await pagina.esperarA(() => pagina.evaluar('window.__eventos.length === 1'), { limite: 3000 });
  const [[nombre, datos]] = await pagina.evaluar('window.__eventos');
  t.ok('MateriaSelect: donacion_click con origen «materias», variante y uso',
    JSON.stringify([nombre, datos.origen, datos.monto, datos.variante, /^(0|1|2-5|6-20|21\+)$/.test(datos.uso),
      'tramo' in datos]),
    JSON.stringify(['donacion_click', 'materias', 200, 'normal', true, false]));
}

// Cero literales visuales en el componente (aceptación común, C6): el foco inyectado
// toma sus medidas de constantes con nombre, no de números sueltos en el CSS.
const LITERALES = [
  [/size=\{\d+\}/, 'tamaño numérico'],
  [/['"]-?\d+deg['"]/, 'ángulo'],
  [/\b(padding|margin)\w*:\s*-?\d/, 'relleno o margen numérico'],
  [/-?\b\d+(\.\d+)?px\b/, 'medida en px'],
];

function sinLiterales(_pagina, _base, t) {
  const archivo = path.join(RAIZ, 'src', 'components', 'DonationBox.js');
  const hallados = [];
  fs.readFileSync(archivo, 'utf8').split('\n').forEach((linea, i) => {
    const codigo = linea.replace(/\/\/.*$/, '');
    for (const [patron, que] of LITERALES) if (patron.test(codigo)) hallados.push(`${i + 1}: ${que}`);
  });
  t.ok('DonationBox.js: sin literales visuales', hallados.join(' | '), '');
}

// ---------------------------------------------------------------------------
// Embudo de donación (Umami): vista, click y cierre. Contrato idéntico al de main 1.9.0.
// `window.umami` se reemplaza por un stub antes de que cargue la app; `window.open` se anula
// para que los montos no salgan a Mercado Pago. Los pageviews (track con función) no se guardan.
// ---------------------------------------------------------------------------
const STUB_UMAMI =
  "window.__eventos = [];" +
  "window.umami = { track: function (e, d) { if (typeof e === 'string') window.__eventos.push({ e: e, d: d || {} }); } };" +
  "window.open = function () { return null; };";

const conUmami = (pagina) =>
  pagina.enviar('Page.addScriptToEvaluateOnNewDocument', { source: STUB_UMAMI });

const eventosDe = (pagina, nombre) =>
  pagina.evaluar(`window.__eventos.filter((x) => x.e === ${JSON.stringify(nombre)}).map((x) => x.d)`);

const BLOQUE = sel('donacion');

// Con Results encima, el selector de materias sigue montado (oculto) y comparte los testID:
// toda búsqueda toma el elemento con caja, no el primero del documento.
const VISIBLE = (s) => `(Array.from(document.querySelectorAll(${JSON.stringify(s)})).find((n) => {
  const r = n.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}) || null)`;

const hayBloque = (pagina, opts) => pagina.esperarA(
  () => pagina.evaluar(`!!${VISIBLE(BLOQUE)}`), opts);

// Desplaza el bloque dentro de su contenedor con scroll (o la ventana) hasta que quede
// `visible` (0..1) en pantalla; sin argumento, centrado. Devuelve la fracción visible o null.
const MOSTRAR_BLOQUE = (visible) => `(function () {
  const b = ${VISIBLE(BLOQUE)};
  if (!b) return null;
  const r0 = b.getBoundingClientRect();
  let s = b.parentElement;
  while (s && !(s.scrollHeight > s.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(s).overflowY))) s = s.parentElement;
  const mover = (d) => { if (s) s.scrollTop += d; else window.scrollBy(0, d); };
  if (${visible === undefined ? 'true' : 'false'}) {
    mover(r0.top + r0.height / 2 - window.innerHeight / 2);
  } else {
    mover(r0.top - (window.innerHeight - ${visible || 0} * r0.height));
  }
  const q = b.getBoundingClientRect();
  return (Math.min(q.bottom, window.innerHeight) - Math.max(q.top, 0)) / q.height;
})()`;

const ARRIBA = `(function () {
  document.querySelectorAll('div').forEach((d) => { d.scrollTop = 0; });
  window.scrollTo(0, 0);
})()`;

// Toca el control visible `id`: lo trae a la vista, lo mide y hace el clic por coordenadas.
async function tocarId(pagina, id) {
  await pagina.evaluar(`(function () {
    const n = ${VISIBLE(sel(id))};
    if (n) n.scrollIntoView({ block: 'center' });
  })()`);
  await pausa(300);
  const p = await pagina.evaluar(`(function () {
    const n = ${VISIBLE(sel(id))};
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  })()`);
  if (!p) return false;
  await pagina.clicEn(p.x, p.y);
  return true;
}

async function entrarAlSelector(pagina, base, uso) {
  await pagina.ir(base + '/');
  await pagina.esperarTexto('Tus materias');
  if (uso !== undefined) {
    await pagina.evaluar(uso === null
      ? `localStorage.removeItem('pkapp_simulacros')`
      : `localStorage.setItem('pkapp_simulacros', '${uso}')`);
    await pagina.ir(base + '/');
    await pagina.esperarTexto('Tus materias');
  }
  await cerrarNota(pagina);
}

async function embudoEnMaterias(pagina, base, t) {
  await conUmami(pagina);
  // Ventana baja: el bloque queda debajo de las tarjetas.
  await pagina.enviar('Emulation.setDeviceMetricsOverride',
    { width: 900, height: 500, deviceScaleFactor: 1, mobile: false });
  await entrarAlSelector(pagina, base, '3');
  t.ok('materias: el bloque de donación está montado', await hayBloque(pagina, { limite: 10000 }), true);

  await pausa(1500);
  t.ok('materias: fuera de pantalla no se manda donacion_vista', (await eventosDe(pagina, 'donacion_vista')).length, 0);

  // Entra y sale antes de 1 s: no cuenta y el reloj se reinicia.
  await pagina.evaluar(MOSTRAR_BLOQUE());
  await pausa(400);
  await pagina.evaluar(ARRIBA);
  await pausa(1500);
  t.ok('materias: menos de 1 s en vista no cuenta', (await eventosDe(pagina, 'donacion_vista')).length, 0);

  // ~30 % visible durante más de 1 s: bajo el umbral del 50 %, no cuenta.
  const ratio = await pagina.evaluar(MOSTRAR_BLOQUE(0.3));
  t.ok('materias: el bloque quedó cerca del 30 % visible', ratio > 0.2 && ratio < 0.45, true);
  await pausa(1800);
  t.ok('materias: con menos del 50 % visible no cuenta', (await eventosDe(pagina, 'donacion_vista')).length, 0);

  // ~5 % visible: asomando apenas por el borde, tampoco cuenta.
  const asoma = await pagina.evaluar(MOSTRAR_BLOQUE(0.05));
  t.ok('materias: el bloque quedó cerca del 5 % visible', asoma > 0 && asoma < 0.15, true);
  await pausa(1800);
  t.ok('materias: con 5 % visible no cuenta', (await eventosDe(pagina, 'donacion_vista')).length, 0);
  await pagina.evaluar(ARRIBA);
  await pausa(300);

  await pagina.evaluar(MOSTRAR_BLOQUE());
  t.ok('materias: tras 1 s en vista se manda donacion_vista',
    await pagina.esperarA(async () => (await eventosDe(pagina, 'donacion_vista')).length === 1, { limite: 4000 }), true);
  const vista = (await eventosDe(pagina, 'donacion_vista'))[0] || {};
  t.ok('materias: vista con origen', vista.origen, 'materias');
  t.ok('materias: vista con variante normal', vista.variante, 'normal');
  t.ok('materias: vista con uso', vista.uso, '2-5');
  t.ok('materias: vista sin tramo', 'tramo' in vista, false);

  await pagina.evaluar(ARRIBA);
  await pausa(300);
  await pagina.evaluar(MOSTRAR_BLOQUE());
  await pausa(1500);
  t.ok('materias: una sola vez por montaje', (await eventosDe(pagina, 'donacion_vista')).length, 1);

  for (const monto of MONTOS_VALOR) {
    await tocarId(pagina, `donacion-monto-${monto}`);
    await pausa(150);
  }
  const clicks = await eventosDe(pagina, 'donacion_click');
  t.ok('materias: 4 donacion_click', clicks.length, 4);
  t.ok('materias: montos en orden', clicks.map((c) => c.monto).join(','), '50,100,200,500');
  t.ok('materias: click con origen, variante y uso',
    clicks.every((c) => c.origen === 'materias' && c.variante === 'normal' && c.uso === '2-5' && !('tramo' in c)), true);
}

// Rangos de `uso` con 0, 1, 3, 6, 20, 21 y 25 simulacros previos, vistos desde el selector.
async function embudoRangosDeUso(pagina, base, t) {
  await conUmami(pagina);
  const casos = [[null, '0'], ['0', '0'], ['1', '1'], ['3', '2-5'], ['6', '6-20'], ['20', '6-20'], ['21', '21+'], ['25', '21+']];
  for (const [semilla, rango] of casos) {
    await entrarAlSelector(pagina, base, semilla);
    await hayBloque(pagina, { limite: 10000 });
    await pagina.evaluar(MOSTRAR_BLOQUE());
    await pagina.esperarA(async () => (await eventosDe(pagina, 'donacion_vista')).length === 1, { limite: 4000 });
    const v = (await eventosDe(pagina, 'donacion_vista'))[0] || {};
    t.ok(`uso con ${semilla === null ? 'contador ausente' : semilla + ' previos'}: ${rango}`, v.uso, rango);
  }
}

// Respuestas de prueba (mismo formato que la suite «resultados»): `aciertos` de `total`.
function respuestasDe(total, aciertos) {
  return Array.from({ length: total }, (_, i) => ({
    question: {
      id: `e2e-${i + 1}`, question: `Enunciado de prueba ${i + 1}`,
      options: ['Opción uno', 'Opción dos', 'Opción tres', 'Opción cuatro'],
      correctIndex: 1, explanation: '', topic: 'e2e',
    },
    selectedIndex: i < aciertos ? 1 : 0,
    isCorrect: i < aciertos,
  }));
}

// Toma el `navigation` de la pantalla montada desde el árbol de React y abre Results.
const IR_A_RESULTADOS = (params) => `(function () {
  for (const n of Array.from(document.querySelectorAll('*'))) {
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
})()`;

// Termina un simulacro con `aciertos` de 10: siembra el contador del pedido en 0 (en turno) y
// los simulacros previos, y abre Results desde Inicio.
async function terminarSimulacro(pagina, base, { previos, aciertos }) {
  await pagina.ir(base + '/');
  await pagina.esperarTexto('Tus materias');
  await pagina.evaluar(`localStorage.setItem('pkapp_donation_count', '0');
    localStorage.setItem('pkapp_simulacros', '${previos}')`);
  if (!await entrarAMateria(pagina, base)) return false;
  await pagina.evaluar(IR_A_RESULTADOS({ answers: respuestasDe(10, aciertos), topic: 'e2e', mode: 'practice' }));
  return pagina.esperarUrl('/resultados', { limite: 5000 });
}

async function embudoEnResultados(pagina, base, t) {
  await conUmami(pagina);
  const vistas = () => eventosDe(pagina, 'donacion_vista');
  const hayPedido = () => hayBloque(pagina, { limite: 5000 });
  const unaVista = () => pagina.esperarA(async () => (await vistas()).length === 1, { limite: 4000 });

  // ≥ 80 %: celebratoria. 1 previo + el terminado = 2 → '2-5'.
  t.ok('resultados ≥80: abrir Results', await terminarSimulacro(pagina, base, { previos: 1, aciertos: 8 }), true);
  t.ok('resultados ≥80: sale el pedido', await hayPedido(), true);
  t.ok('resultados ≥80: vista tras 1 s', await unaVista(), true);
  let v = (await vistas())[0] || {};
  t.ok('resultados ≥80: origen', v.origen, 'resultados');
  t.ok('resultados ≥80: variante', v.variante, 'celebratoria');
  t.ok('resultados ≥80: tramo', v.tramo, '80-100');
  t.ok('resultados ≥80: uso con 1 previo incluye el terminado', v.uso, '2-5');

  // Revisar → Volver remonta el pedido pero es el mismo simulacro: sin vista ni conteo nuevos.
  t.ok('resultados: abre la revisión', await tocarId(pagina, 'resultados-revisar'), true);
  t.ok('resultados: vuelve de la revisión',
    await pagina.esperarA(() => tocarId(pagina, 'revision-volver'), { limite: 4000 }), true);
  t.ok('resultados: el pedido sigue ahí tras Volver', await hayPedido(), true);
  await pausa(2200);
  t.ok('resultados: Revisar → Volver no repite donacion_vista', (await vistas()).length, 1);
  t.ok('resultados: Revisar → Volver no cuenta otro simulacro',
    await pagina.evaluar(`localStorage.getItem('pkapp_simulacros')`), '2');

  for (const monto of MONTOS_VALOR) {
    await tocarId(pagina, `donacion-monto-${monto}`);
    await pausa(150);
  }
  const clicks = await eventosDe(pagina, 'donacion_click');
  t.ok('resultados: 4 donacion_click', clicks.length, 4);
  t.ok('resultados: montos en orden', clicks.map((c) => c.monto).join(','), '50,100,200,500');
  t.ok('resultados: click con origen, variante, tramo y uso',
    clicks.every((c) => c.origen === 'resultados' && c.variante === 'celebratoria' &&
      c.tramo === '80-100' && c.uso === '2-5'), true);

  // Misma sesión, sin recargar: Results → Inicio → Cambiar materia. El selector sigue montado
  // bajo el stack; el click debe llevar el rango actual (el simulacro ya contado), no el del montaje.
  t.ok('resultados → inicio', await tocarId(pagina, 'resultados-inicio'), true);
  t.ok('inicio: aparece «Cambiar materia»', await pagina.esperarTexto('Cambiar materia', { limite: 4000 }), true);
  t.ok('inicio → materias', !!await pagina.clic('Cambiar materia'), true);
  t.ok('materias: aparece el pedido', await hayPedido(), true);
  await tocarId(pagina, 'donacion-monto-50');
  await pausa(200);
  const ultimos = await eventosDe(pagina, 'donacion_click');
  const ultimo = ultimos[ultimos.length - 1] || {};
  t.ok('materias en la misma sesión: origen del click', ultimo.origen, 'materias');
  t.ok('resultados y materias en la misma sesión: mismo rango', ultimo.uso, v.uso);
  t.ok('materias en la misma sesión: sin tramo', 'tramo' in ultimo, false);

  // 60-79 %: normal. 3 previos + el terminado = 4 → '2-5'. Se cierra el pedido.
  await pagina.enviar('Page.addScriptToEvaluateOnNewDocument', { source: STUB_UMAMI });
  t.ok('resultados 60-79: abrir Results', await terminarSimulacro(pagina, base, { previos: 3, aciertos: 7 }), true);
  t.ok('resultados 60-79: sale el pedido', await hayPedido(), true);
  t.ok('resultados 60-79: vista tras 1 s', await unaVista(), true);
  v = (await vistas())[0] || {};
  t.ok('resultados 60-79: variante', v.variante, 'normal');
  t.ok('resultados 60-79: tramo', v.tramo, '60-79');
  t.ok('resultados 60-79: uso con 3 previos', v.uso, '2-5');
  t.ok('resultados 60-79: sin cerrar no hay donacion_cerrada', (await eventosDe(pagina, 'donacion_cerrada')).length, 0);

  t.ok('resultados: toca cerrar', await tocarId(pagina, 'donacion-descartar'), true);
  t.ok('resultados: cerrar manda donacion_cerrada',
    await pagina.esperarA(async () => (await eventosDe(pagina, 'donacion_cerrada')).length === 1, { limite: 3000 }), true);
  const cerr = (await eventosDe(pagina, 'donacion_cerrada'))[0] || {};
  t.ok('resultados: cerrada con origen, variante y tramo',
    JSON.stringify([cerr.origen, cerr.variante, cerr.tramo]), JSON.stringify(['resultados', 'normal', '60-79']));
  t.ok('resultados: el pedido desaparece',
    await pagina.evaluar(`!${VISIBLE(BLOQUE)}`), true);

  // Rango máximo y conteo: 25 previos + el terminado = 26 → 21+, y el contador sube una sola vez.
  await pagina.enviar('Page.addScriptToEvaluateOnNewDocument', { source: STUB_UMAMI });
  t.ok('resultados 21+: abrir Results', await terminarSimulacro(pagina, base, { previos: 25, aciertos: 8 }), true);
  t.ok('resultados 21+: vista', await unaVista(), true);
  v = (await vistas())[0] || {};
  t.ok('resultados: uso con 25 previos', v.uso, '21+');
  t.ok('resultados: el contador de simulacros sube a 26',
    await pagina.evaluar(`localStorage.getItem('pkapp_simulacros')`), '26');
  t.ok('resultados: un solo simulacro_terminado', (await eventosDe(pagina, 'simulacro_terminado')).length, 1);
}

module.exports = [
  { nombre: 'donacion · DonationBox.js sin literales visuales', correr: sinLiterales },
  { nombre: 'donacion · embudo: vista, click y uso en el selector de materias', correr: embudoEnMaterias },
  { nombre: 'donacion · embudo: rangos de uso', correr: embudoRangosDeUso },
  { nombre: 'donacion · embudo: vista, click y cierre en resultados', correr: embudoEnResultados },
  {
    nombre: 'donacion · pedido de MateriaSelect en la app real',
    correr: enMateriaSelect,
  },
  {
    nombre: 'donacion · variantes, estados y anchos del pedido de donación (DON-P5)',
    async correr(_pagina, _base, t) {
      construir();
      const puerto = await puertoLibre();
      const servidor = await servirEstatico(SALIDA, puerto);
      const navegador = await conectarNavegador(PUERTO_CDP);
      const base = `http://localhost:${puerto}`;
      try {
        await probarTema(navegador, base, t, 'claro');
        await probarTema(navegador, base, t, 'oscuro');
        await anchos(navegador, base, t);
      } finally {
        navegador.cerrar();
        await servidor.cerrar();
        fs.rmSync(SALIDA, { recursive: true, force: true });
        fs.rmSync(CACHE, { recursive: true, force: true });
      }
    },
  },
];

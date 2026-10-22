// Suite «agregar» del arnés end-to-end (ver ../README.md): `AddQuestionScreen` contra
// diseno/pantallas/AddQuestion.md y AddQuestion-ADD-P3.md (tarea 3.9; ADD-P2 y ADD-P3).
//
// Mismo marco que las suites de HeaderMarca: la pantalla corre en un iframe del ancho
// pedido y se mide desde la página. Los colores computados se comparan con los tokens de
// `plancha` en claro y en oscuro. Se llega por Home → «Agregar pregunta» (un toque).

const fs = require('fs');
const path = require('path');
const { plancha } = require('../../../src/theme/colores');
const { EN_MARCO, LADO_TACTIL, MATERIA, PASO, abrirMarco, clicEnMarco, esperarEnMarco } = require('./comunes');

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const pausa = (ms = 150) => new Promise((r) => setTimeout(r, ms));

const RUTA = EN_MARCO('return w.location.pathname;');
const ESTA_OSCURO = EN_MARCO(`return d.documentElement.classList.contains('dark');`);
const TEXTO_PANTALLA = EN_MARCO('return d.body.innerText;');
const HAY_DESBORDE = EN_MARCO('return desbordes().length > 0;');

const ROTULOS = ['Tema', 'Enunciado de la pregunta', 'Opciones de respuesta', 'Explicación (opcional)'];
const PH_ENUNCIADO = 'Escribí la pregunta acá...';
const PH_EXPLICACION = 'Explicación que se mostrará después de responder...';
const phOpcion = (letra) => `Opción ${letra}`;
const celda = (letra) => `Opción ${letra}, marcar como correcta`;
const quitar = (letra) => `Quitar opción ${letra}`;

// Anchos de la hoja (comun.md §7.2): `columna` bajo el corte `escritorio`, `lectura` desde él.
const COLUMNA = 448;
const LECTURA = 600;
const CORTE = 1024;

const EMOJI_O_SIMBOLO = /[\p{Extended_Pictographic}✓✕▲▼×+]/u;

// Lectura de un elemento del marco: caja, colores computados del contenedor interno
// (primer hijo) y del primer texto, glifo, contorno y atributos accesibles.
const INFO = `
  const info = (el) => {
    if (!el) return null;
    const campo = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
    const r = el.getBoundingClientRect();
    const caja = campo ? el : (el.firstElementChild || el);
    const k = w.getComputedStyle(caja), c = w.getComputedStyle(el);
    let hoja = null;
    const it = d.createTreeWalker(el, 4);
    for (let t; (t = it.nextNode());) if (t.textContent.trim()) { hoja = t.parentElement; break; }
    const tf = hoja ? w.getComputedStyle(hoja) : k;
    const svg = el.querySelector('svg');
    const sr = svg ? svg.getBoundingClientRect() : null;
    return {
      glifoCaja: sr ? { ancho: sr.width, alto: sr.height, dx: (sr.left + sr.width / 2) - (r.left + r.width / 2), dy: (sr.top + sr.height / 2) - (r.top + r.height / 2) } : null,
      x: r.left, y: r.top, ancho: r.width, alto: r.height, der: r.right, abajo: r.bottom,
      fondo: k.backgroundColor, borde: k.borderTopColor, bordeAncho: k.borderTopWidth,
      relleno: k.paddingLeft + ' ' + k.paddingTop,
      texto: (el.innerText || '').trim(),
      color: tf.color, tamano: tf.fontSize, mayusculas: tf.textTransform,
      familia: tf.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
      glifo: svg ? svg.getAttribute('stroke') : null,
      glifoOculto: svg ? svg.getAttribute('aria-hidden') : null,
      nombre: el.getAttribute('aria-label'), rol: el.getAttribute('role'),
      pressed: el.getAttribute('aria-pressed'), checked: el.getAttribute('aria-checked'),
      contorno: { estilo: c.outlineStyle, ancho: c.outlineWidth, color: c.outlineColor, sep: c.outlineOffset },
      enfocado: d.activeElement === el,
    };
  };
  const hojaConTexto = (t) => visibles('*').find((n) =>
    n.children.length === 0 && n.textContent.trim().toLowerCase() === t.toLowerCase());
  const controlDe = (n) => n && n.closest('[role="button"], [role="radio"], [tabindex="0"]');
  const porNombre = (nombre) => visibles('[aria-label]').find((n) => n.getAttribute('aria-label') === nombre);
  const porPh = (ph) => visibles('[placeholder]').find((n) => n.getAttribute('placeholder') === ph);
`;

const leer = (buscar, { scroll = true } = {}) => EN_MARCO(`
  ${INFO}
  const el = ${buscar};
  if (el && ${scroll}) el.scrollIntoView({ block: 'center' });
  return info(el);
`);

const porNombre = (pagina, nombre) => pagina.evaluar(leer(`porNombre(${JSON.stringify(nombre)})`));
const porPh = (pagina, ph) => pagina.evaluar(leer(`porPh(${JSON.stringify(ph)})`));
const porTexto = (pagina, t) => pagina.evaluar(leer(`controlDe(hojaConTexto(${JSON.stringify(t)}))`));
const hoja = (pagina, t) => pagina.evaluar(leer(`hojaConTexto(${JSON.stringify(t)})`));

const centro = (l) => ({ x: Math.round(l.x + l.ancho / 2), y: Math.round(l.y + l.alto / 2) });

async function tocar(pagina, lectura) {
  const l = await lectura;
  if (!l) return false;
  await pausa(60);
  const p = centro(l);
  await pagina.clicEn(p.x, p.y);
  await pausa(120);
  return true;
}

// Escribe como el usuario lo haría para React: por el setter nativo y un evento `input`.
async function escribir(pagina, ph, valor) {
  const ok = await pagina.evaluar(EN_MARCO(`
    ${INFO}
    const el = porPh(${JSON.stringify(ph)});
    if (!el) return false;
    const proto = el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(valor)});
    el.dispatchEvent(new w.Event('input', { bubbles: true }));
    return true;
  `));
  await pausa(80);
  return ok;
}

const valorDe = (pagina, ph) => pagina.evaluar(EN_MARCO(`
  ${INFO}
  const el = porPh(${JSON.stringify(ph)});
  return el ? el.value : null;
`));

// Selector → Home → Agregar pregunta, en el tema y el ancho pedidos.
async function abrirAgregar(pagina, base, { ancho = 390, alto = 900, oscuro = false, materia = MATERIA } = {}) {
  // La página del arnés mide 900 px: el marco de 1024 o más se sale y los toques no llegan.
  if (ancho > 900) {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: ancho, height: Math.max(alto, 900), deviceScaleFactor: 1, mobile: false });
  }
  if (!await abrirMarco(pagina, base, ancho, alto)) return false;
  if (oscuro) {
    await clicEnMarco(pagina, 'oscuro');
    if (!await pagina.esperarA(() => pagina.evaluar(ESTA_OSCURO))) return false;
  }
  await clicEnMarco(pagina, materia);
  if (!await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/inicio')) return false;
  await esperarEnMarco(pagina, 'repasar fallos');
  if (!await tocar(pagina, porTexto(pagina, 'Agregar pregunta')) && !await clicEnMarco(pagina, 'agregar pregunta')) return false;
  if (!await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/agregar')) return false;
  const lista = await esperarEnMarco(pagina, 'guardar pregunta');
  // El puntero queda donde cayó el último toque: sin moverlo, el reposo se mediría en hover.
  await pagina.moverA(1, 1);
  await pausa();
  return lista;
}

// Foco de teclado real: Tab hasta el control cuyo texto es `texto`.
async function enfocarConTab(pagina, texto) {
  await pagina.evaluar(EN_MARCO(`
    m.contentWindow.focus();
    if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
  `));
  for (let i = 0; i < 80; i++) {
    await pagina.tecla('Tab');
    const ok = await pagina.evaluar(EN_MARCO(`
      const a = d.activeElement;
      return !!a && (a.textContent || '').trim().toLowerCase() === ${JSON.stringify(texto.toLowerCase())};
    `));
    if (ok) return true;
  }
  return false;
}

// Foco de teclado real: Tab hasta el control cuyo nombre accesible es `nombre` (los que
// no llevan texto: celda marcada, quitar opción).
async function enfocarConTabPorNombre(pagina, nombre) {
  await pagina.evaluar(EN_MARCO(`
    m.contentWindow.focus();
    if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
  `));
  for (let i = 0; i < 80; i++) {
    await pagina.tecla('Tab');
    const ok = await pagina.evaluar(EN_MARCO(`
      const a = d.activeElement;
      return !!a && a.getAttribute('aria-label') === ${JSON.stringify(nombre)};
    `));
    if (ok) return true;
  }
  return false;
}

// Temas de cada materia, tal como los declara `src/materias/<id>/topics.js` (las claves
// y los nombres en su orden). El arnés no importa el módulo ES: lee las líneas `'k': 'n'`.
function temasDe(idMateria) {
  const fuente = fs.readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'src', 'materias', idMateria, 'topics.js'), 'utf8');
  const temas = [];
  for (const m of fuente.matchAll(/^\s*'([^']+)':\s*'([^']+)',?\s*(?:\/\/.*)?$/gm)) {
    temas.push({ clave: m[1], nombre: m[2] });
  }
  return temas;
}
const TEMAS_BCYT = temasDe('bcyt');

// El desplegable de tema (ADD-P3): el disparador K3, la lista abierta con sus filas K7 y
// el foco. Un `listbox` solo existe con la lámina abierta.
const LEER_DESPLEGABLE = EN_MARCO(`
  const caja = (n) => {
    const r = n.getBoundingClientRect();
    return { x: r.left, y: r.top, izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom,
      ancho: r.width, alto: r.height };
  };
  const nodo = (n) => {
    const k = w.getComputedStyle(n.firstElementChild || n), c = w.getComputedStyle(n);
    const it = d.createTreeWalker(n, 4);
    let hoja = null;
    for (let t; (t = it.nextNode());) if (t.textContent.trim()) { hoja = t.parentElement; break; }
    const tf = hoja ? w.getComputedStyle(hoja) : k;
    const svg = n.querySelector('svg');
    return { ...caja(n), texto: n.textContent.trim(),
      fondo: k.backgroundColor, borde: k.borderTopColor, bordeAncho: k.borderTopWidth,
      filete: k.borderBottomColor, fileteAncho: k.borderBottomWidth,
      relleno: k.paddingLeft + ' ' + k.paddingTop,
      color: tf.color, tamano: tf.fontSize, familia: tf.fontFamily.split(',')[0].replace(/["']/g, '').trim(),
      sombra: k.boxShadow, radio: k.borderTopLeftRadius, opacidad: k.opacity,
      sombraExt: c.boxShadow, radioExt: c.borderTopLeftRadius, opacidadExt: c.opacity,
      glifo: svg ? svg.getAttribute('stroke') : null,
      glifoOculto: svg ? svg.getAttribute('aria-hidden') : null,
      contorno: { estilo: c.outlineStyle, ancho: c.outlineWidth, color: c.outlineColor, sep: c.outlineOffset },
      seleccionada: n.getAttribute('aria-selected'), expandido: n.getAttribute('aria-expanded'),
      popup: n.getAttribute('aria-haspopup'), controla: n.getAttribute('aria-controls'),
      desactivado: n.getAttribute('aria-disabled'), inhabilitado: n.hasAttribute('disabled'),
      nombre: n.getAttribute('aria-label'), rol: n.getAttribute('role'), id: n.getAttribute('id'),
      tabindex: n.getAttribute('tabindex'), enfocado: d.activeElement === n };
  };
  const disp = visibles('[aria-haspopup="listbox"]')[0] || null;
  const lista = visibles('[role="listbox"]')[0] || null;
  const a = d.activeElement;
  // Posiciones sin mover la página (leer() de arriba centra el elemento).
  const hojaDe = (t) => visibles('*').find((n) => n.children.length === 0 && n.textContent.trim().toLowerCase() === t);
  const posDe = (n) => (n ? caja(n) : null);
  const marcoLista = lista && lista.parentElement ? w.getComputedStyle(lista.parentElement) : null;
  return {
    vista: w.innerWidth,
    alto: w.innerHeight,
    desborda: desbordes().length > 0,
    disp: disp ? nodo(disp) : null,
    lista: lista ? { ...caja(lista), nombre: lista.getAttribute('aria-label'), id: lista.getAttribute('id'),
      scrollTop: lista.scrollTop, scrollHeight: lista.scrollHeight, clientHeight: lista.clientHeight,
      ancho_marco: lista.parentElement.getBoundingClientRect().width,
      marco: { fondo: marcoLista.backgroundColor, borde: marcoLista.borderTopColor,
        bordeAncho: marcoLista.borderTopWidth, abajo: lista.parentElement.getBoundingClientRect().bottom } } : null,
    opciones: lista ? Array.from(lista.querySelectorAll('[role="option"]')).map(nodo) : [],
    nOpcionesEnDom: d.querySelectorAll('[role="option"]').length,
    nListasEnDom: d.querySelectorAll('[role="listbox"]').length,
    grupos: lista ? Array.from(lista.querySelectorAll('[role="group"]')).map((g) => g.getAttribute('aria-label')) : [],
    radiogrupos: d.querySelectorAll('[role="radiogroup"][aria-label="Tema"]').length,
    rotuloTema: posDe(hojaDe('tema')),
    enunciado: posDe(hojaDe('enunciado de la pregunta')),
    campo: posDe(visibles('[placeholder]').find((n) => n.getAttribute('placeholder') === ${JSON.stringify(PH_ENUNCIADO)})),
    guardar: posDe(visibles('[role="button"]').find((n) => n.textContent.trim().toLowerCase() === 'guardar pregunta')),
    foco: a ? { esDisparador: a === disp, rol: a.getAttribute('role'), ph: a.getAttribute('placeholder'),
      texto: (a.textContent || '').trim(), enOpcion: !!a.closest('[role="option"]') } : null,
  };
`);

const leerDesp = (pagina) => pagina.evaluar(LEER_DESPLEGABLE);
const nombres = (l) => l.opciones.map((o) => o.texto);

// Toca el centro de una lectura (disparador o fila) con el puntero real.
async function tocarCaja(pagina, caja) {
  if (!caja) return false;
  await pausa(60);
  await pagina.clicEn(Math.round(caja.x + caja.ancho / 2), Math.round(caja.y + caja.alto / 2));
  await pausa(120);
  return true;
}

// Escape, Inicio, Fin, Re Pág y las letras: el arnés (`cdp.js`) no define esas teclas, se
// envían como `keydown` sintéticos al elemento con foco. Tab, Enter, Espacio y las flechas
// van con teclado real.
async function teclaSintetica(pagina, ...teclas) {
  await pagina.evaluar(EN_MARCO(`
    for (const key of ${JSON.stringify(teclas)}) {
      const a = d.activeElement;
      if (a) a.dispatchEvent(new w.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }
    return true;
  `));
  await pausa(120);
}

// Pone el foco real en el disparador (Tab hasta su nombre accesible).
const enfocarDisparador = async (pagina) => {
  const l = await leerDesp(pagina);
  return !!l && !!l.disp && await enfocarConTabPorNombre(pagina, l.disp.nombre);
};

async function hayDisparador(pagina, t, c) {
  const hay = !!(await leerDesp(pagina)).disp;
  t.ok(c('hay un disparador de tema'), hay, true);
  return hay;
}

async function abrirDesplegable(pagina) {
  const l = await leerDesp(pagina);
  if (!l || !l.disp) return false;
  await tocarCaja(pagina, l.disp);
  return (await leerDesp(pagina)).nListasEnDom === 1;
}

// ---------------------------------------------------------------------------

async function rotulosYAyuda(pagina, base, t, tema) {
  const T = plancha[tema];
  const c = (s) => `${tema} · Agregar · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390, oscuro: tema === 'oscuro' }), true);

  // ADD-P2: rótulos de grupo sin dos puntos, en `rotulo` y `tintaSec`, en mayúsculas.
  for (const nombre of ROTULOS) {
    const r = await hoja(pagina, nombre);
    t.ok(c(`rótulo «${nombre}» sin dos puntos, tintaSec, rotulo, mayúsculas`),
      r && `${r.color}|${r.tamano}|${r.familia}|${r.mayusculas}`,
      `${rgb(T.tintaSec)}|11px|PlexMono-Regular|uppercase`);
  }
  const texto = await pagina.evaluar(TEXTO_PANTALLA);
  t.ok(c('ningún rótulo termina en dos puntos'), /(tema|pregunta|respuesta|\(opcional\)):/i.test(texto), false);

  // Ayuda de marcado: texto, glifo-acierto decorativo y texto, sin el símbolo de tilde.
  const ayuda = await pagina.evaluar(EN_MARCO(`
    ${INFO}
    const h = visibles('*').find((n) => n.children.length === 0
      && n.textContent.trim().toLowerCase() === 'marcá con');
    if (!h) return null;
    const fila = h.parentElement;
    const svg = fila.querySelector('svg');
    return { texto: fila.innerText.replace(/\\s+/g, ' ').trim(),
      glifoOculto: svg ? svg.getAttribute('aria-hidden') : null,
      glifo: svg ? svg.getAttribute('stroke') : null,
      color: w.getComputedStyle(h).color, tamano: w.getComputedStyle(h).fontSize };
  `));
  t.ok(c('ayuda de marcado: «Marcá con» + glifo + «cuál es la correcta»'),
    ayuda && ayuda.texto.toLowerCase(), 'marcá con cuál es la correcta');
  t.ok(c('ayuda de marcado: glifo-acierto decorativo en acierto'),
    ayuda && `${ayuda.glifoOculto}|${ayuda.glifo}`, `true|${T.acierto}`);
  t.ok(c('ayuda de marcado: tintaSec, detalle'),
    ayuda && `${ayuda.color}|${ayuda.tamano}`, `${rgb(T.tintaSec)}|13px`);

  // Sin emoji ni símbolos de ícono (D9, comun.md §9).
  t.ok(c('sin emojis ni símbolos de ícono'), EMOJI_O_SIMBOLO.test(texto), false);

  // Campos: marco `borde`, relleno `superficie`, paso `campo`, relleno paso 3.
  const colorPh = await pagina.evaluar(EN_MARCO(`
    ${INFO}
    const el = porPh(${JSON.stringify(PH_ENUNCIADO)});
    return el ? w.getComputedStyle(el, '::placeholder').color : null;
  `));
  t.ok(c('placeholder en tintaSec'), colorPh, rgb(T.tintaSec));
  // Vacío, el navegador pinta el placeholder y el color del elemento es el del
  // placeholder: el texto del usuario se mide con valor.
  for (const [nombre, ph, altoMin] of [['enunciado', PH_ENUNCIADO, 20 * PASO],
    ['opción A', phOpcion('A'), LADO_TACTIL], ['explicación', PH_EXPLICACION, 20 * PASO]]) {
    await escribir(pagina, ph, 'Texto');
    const f = await porPh(pagina, ph);
    t.ok(c(`campo ${nombre}: marco borde 1px, fondo superficie`),
      f && `${f.bordeAncho} ${f.borde} ${f.fondo}`, `1px ${rgb(T.borde)} ${rgb(T.superficie)}`);
    t.ok(c(`campo ${nombre}: texto tinta en paso campo (16 px)`),
      f && `${f.color}|${f.tamano}`, `${rgb(T.tinta)}|16px`);
    t.ok(c(`campo ${nombre}: relleno paso 3 y alto mínimo ${altoMin}`),
      f && f.relleno === `${3 * PASO}px ${3 * PASO}px` && f.alto >= altoMin - 0.5, true);
  }
}

// ADD-P3 j.1 y j.2: cerrado, una fila; sin filtros de tema ni opciones en el DOM.
async function desplegableCerrado(pagina, base, t, tema) {
  const T = plancha[tema];
  const c = (s) => `390 × 844 · ${tema} · Tema · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390, alto: 844, oscuro: tema === 'oscuro' }), true);
  const l = await leerDesp(pagina);
  t.ok(c('hay un disparador con aria-haspopup="listbox"'), !!l && !!l.disp, true);
  if (!l || !l.disp) return;
  t.ok(c('«Enunciado de la pregunta» a menos de 200 px del borde superior'),
    !!l.enunciado && l.enunciado.y < 200, true);
  t.ok(c('el grupo «Tema» mide 72 px (rótulo, paso 2 y disparador de 48)'),
    !!l.rotuloTema && Math.round(l.disp.abajo - l.rotuloTema.arriba), 72);
  t.ok(c('disparador de 48 de alto y ancho completo de la columna'),
    `${Math.round(l.disp.alto)}|${!!l.campo && Math.abs(l.disp.ancho - l.campo.ancho) < 1}`, '48|true');
  t.ok(c('aria-haspopup="listbox" y aria-expanded="false"'), `${l.disp.popup}|${l.disp.expandido}`, 'listbox|false');
  t.ok(c('sin radiogroup de temas ni option en el DOM'),
    `${l.radiogrupos}|${l.nOpcionesEnDom}|${l.nListasEnDom}`, '0|0|0');
  t.ok(c('el disparador muestra el primer tema de la materia'), l.disp.texto, TEMAS_BCYT[0].nombre);
  t.ok(c('nombre accesible «Tema: {nombre}»'), l.disp.nombre, `Tema: ${TEMAS_BCYT[0].nombre}`);
  t.ok(c('disparador (K3): fondo superficie, marco borde 1 px, texto tinta'),
    `${l.disp.fondo}|${l.disp.bordeAncho} ${l.disp.borde}|${l.disp.color}`,
    `${rgb(T.superficie)}|1px ${rgb(T.borde)}|${rgb(T.tinta)}`);
  t.ok(c('chevron tintaSec, decorativo'), `${l.disp.glifo}|${l.disp.glifoOculto}`, `${T.tintaSec}|true`);
  t.ok(c('el rótulo «Tema» en tintaSec'),
    await pagina.evaluar(EN_MARCO(`
      const h = visibles('*').find((n) => n.children.length === 0 && n.textContent.trim().toLowerCase() === 'tema');
      return h ? w.getComputedStyle(h).color : null;`)), rgb(T.tintaSec));
}

// ADD-P3 j.3 y j.4: abrir con un toque, una fila por clave y una sola elegida; elegir
// cierra, muestra el nombre y devuelve el foco al disparador.
async function desplegableAbrirYElegir(pagina, base, t, tema) {
  const T = plancha[tema];
  const c = (s) => `390 px · ${tema} · Tema · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390, alto: 844, oscuro: tema === 'oscuro' }), true);
  t.ok(c('un toque abre la lista'), await abrirDesplegable(pagina), true);
  const l = await leerDesp(pagina);
  if (!l.lista || !l.disp) return;
  t.ok(c('aria-expanded="true" y la lista referida por aria-controls'),
    `${l.disp.expandido}|${!!l.lista.id && l.disp.controla === l.lista.id}`, 'true|true');
  t.ok(c('listbox con el nombre «Tema»'), l.lista.nombre, 'Tema');
  t.ok(c(`una option por cada tema, en el orden de TOPICS (${TEMAS_BCYT.length})`),
    JSON.stringify(nombres(l)), JSON.stringify(TEMAS_BCYT.map((x) => x.nombre)));
  t.ok(c('exactamente una option aria-selected="true": la del tema actual'),
    JSON.stringify(l.opciones.filter((o) => o.seleccionada === 'true').map((o) => o.texto)),
    JSON.stringify([TEMAS_BCYT[0].nombre]));
  t.ok(c('la región mide a lo sumo 288 px (paso 72, lista plana)'), l.lista.alto <= 288 + 0.5, true);
  t.ok(c('la lista empuja al formulario: el enunciado queda debajo de ella'),
    !!l.enunciado && l.enunciado.arriba >= l.lista.marco.abajo, true);
  t.ok(c('la lámina: fondo superficie y marco linea 1 px'),
    `${l.lista.marco.fondo}|${l.lista.marco.bordeAncho} ${l.lista.marco.borde}`,
    `${rgb(T.superficie)}|1px ${rgb(T.linea)}`);
  t.ok(c('disparador abierto: borde linea, chevron tintaSec'),
    `${l.disp.borde}|${l.disp.glifo}`, `${rgb(T.linea)}|${T.tintaSec}`);
  t.ok(c('sin cambio de tema por abrir: el disparador sigue en el primero'), l.disp.texto, TEMAS_BCYT[0].nombre);

  // Elegir la tercera fila con el puntero.
  const tercero = TEMAS_BCYT[2].nombre;
  const filas = (await leerDesp(pagina)).opciones;
  t.ok(c('un toque sobre la tercera fila'), await tocarCaja(pagina, filas[2]), true);
  const luego = await leerDesp(pagina);
  t.ok(c('la lista desaparece'), `${luego.nListasEnDom}|${luego.nOpcionesEnDom}`, '0|0');
  t.ok(c('el disparador muestra el tema elegido'), luego.disp && luego.disp.texto, tercero);
  t.ok(c('aria-expanded="false"'), luego.disp && luego.disp.expandido, 'false');
  t.ok(c('el foco queda en el disparador'), !!luego.foco && luego.foco.esDisparador, true);
  // Reabrir: la elegida es la que lleva aria-selected y la lista la deja a la vista.
  await abrirDesplegable(pagina);
  const reabierta = await leerDesp(pagina);
  t.ok(c('al reabrir, la elegida es la única aria-selected'),
    JSON.stringify(reabierta.opciones.filter((o) => o.seleccionada === 'true').map((o) => o.texto)), JSON.stringify([tercero]));
  const elegida = reabierta.opciones.find((o) => o.seleccionada === 'true');
  t.ok(c('la fila elegida: fondo tinta, texto fondo, sin tilde (solo inversión)'),
    !!elegida && `${elegida.fondo}|${elegida.color}`, `${rgb(T.tinta)}|${rgb(T.fondo)}`);
  t.ok(c('la fila elegida: sin glifo de tilde (la marca es la inversión)'),
    !!elegida && elegida.glifo, null);
  const otra = reabierta.opciones.find((o) => o.seleccionada !== 'true');
  t.ok(c('una fila en reposo: sin relleno, texto tinta, filete inferior filete'),
    !!otra && `${otra.fondo}|${otra.color}|${otra.fileteAncho} ${otra.filete}`,
    `rgba(0, 0, 0, 0)|${rgb(T.tinta)}|1px ${rgb(T.filete)}`);
  // Una sola parada de Tab y es la fila elegida, que además es la que tiene el foco.
  const conTab = reabierta.opciones.map((o, k) => (o.tabindex === '0' ? k : -1)).filter((k) => k >= 0);
  const iElegida = reabierta.opciones.findIndex((o) => o.seleccionada === 'true');
  t.ok(c('la lista es solo una parada de Tab: la fila elegida (tabindex 0; las demás -1)'),
    `${conTab.join(',')}|${reabierta.opciones.filter((o) => o.tabindex === '-1').length}`,
    `${iElegida}|${reabierta.opciones.length - 1}`);
  t.ok(c('el foco al reabrir queda en la fila elegida'),
    JSON.stringify(reabierta.opciones.map((o, k) => (o.enfocado ? k : -1)).filter((k) => k >= 0)),
    JSON.stringify([iElegida]));
  // Elegir la misma que ya estaba: cierra sin cambiar.
  await tocarCaja(pagina, elegida);
  const igual = await leerDesp(pagina);
  t.ok(c('elegir la ya elegida cierra y conserva el tema'),
    `${igual.nListasEnDom}|${igual.disp && igual.disp.texto}`, `0|${tercero}`);

  // Alineada a fila al abrir (d.4, E-01b): solo si la elegida no está a la vista con su contorno.
  // Fila 5: cabe en la región sin desplazar → la región queda en 0.
  const filaVista = 5;
  await abrirDesplegable(pagina);
  await tocarCaja(pagina, (await leerDesp(pagina)).opciones[filaVista]);
  await abrirDesplegable(pagina);
  const vista = await leerDesp(pagina);
  t.ok(c(`elegida a la vista (fila ${filaVista + 1}): la región no se desplaza al abrir`),
    `${vista.disp && vista.disp.texto}|${vista.lista && vista.lista.scrollTop}`,
    `${TEMAS_BCYT[filaVista].nombre}|0`);
  // Fila 20: fuera de la región → al abrir queda tercera, con dos filas de contexto y la siguiente a las tres enteras cortada al pie.
  const filaLejos = 19;
  await pagina.evaluar(EN_MARCO(`
    visibles('[role="listbox"]')[0].scrollTop = 600;
    return true;`));
  await pausa(100);
  await tocarCaja(pagina, (await leerDesp(pagina)).opciones[filaLejos]);
  await abrirDesplegable(pagina);
  const lejos = await leerDesp(pagina);
  const sel = lejos.opciones.find((o) => o.seleccionada === 'true');
  t.ok(c(`elegida fuera de la región (fila ${filaLejos + 1}): es la elegida`),
    `${lejos.disp && lejos.disp.texto}|${sel && sel.texto}`,
    `${TEMAS_BCYT[filaLejos].nombre}|${TEMAS_BCYT[filaLejos].nombre}`);
  t.ok(c('al abrir, la elegida queda dentro de la región'),
    !!sel && !!lejos.lista && sel.arriba >= lejos.lista.arriba - 0.5 && sel.abajo <= lejos.lista.abajo + 0.5, true);
  const op = lejos.opciones;
  const reg = lejos.lista;
  const previa = op[filaLejos - 2];
  const asoma = reg && op[filaLejos + 4] ? reg.abajo - op[filaLejos + 4].arriba : null;
  t.ok(c('al abrir, la fila dos lugares antes queda alineada al borde superior de la región'),
    !!reg && !!previa && Math.abs(previa.arriba - reg.arriba) <= 1.5, true);
  t.ok(c('al abrir, la elegida es la tercera: a la altura de las dos filas anteriores del borde'),
    !!sel && !!reg && !!previa
      && Math.abs((sel.arriba - reg.arriba) - (previa.alto + op[filaLejos - 1].alto)) <= 1.5, true);
  t.ok(c('al abrir, tres filas enteras bajo la elegida'),
    !!reg && op[filaLejos + 3].abajo <= reg.abajo + 0.5, true);
  t.ok(c('al abrir, la fila siguiente asoma entre 19 y 26 px: la línea de texto cortada'),
    asoma !== null && asoma >= 19 && asoma <= 26, true);
  // Elegida entre las últimas (fila 26): la región queda en el final de la lista, sin fila cortada.
  const filaFinal = 25;
  await pagina.evaluar(EN_MARCO(`
    visibles('[role="listbox"]')[0].scrollTop = 99999;
    return true;`));
  await pausa(100);
  await tocarCaja(pagina, (await leerDesp(pagina)).opciones[filaFinal]);
  await abrirDesplegable(pagina);
  const alFinal = await leerDesp(pagina);
  t.ok(c(`elegida entre las últimas (fila ${filaFinal + 1}): la región queda en el final de la lista`),
    !!alFinal.lista
      && Math.abs(alFinal.lista.scrollTop - (alFinal.lista.scrollHeight - alFinal.lista.clientHeight)) <= 1, true);
  await teclaSintetica(pagina, 'Escape');
}

// ADD-P3 j.5 a j.8: teclado.
async function desplegableTeclado(pagina, base, t) {
  const c = (s) => `390 px · Tema · teclado · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390, alto: 844 }), true);
  if (!await hayDisparador(pagina, t, c)) return;
  const primero = TEMAS_BCYT[0].nombre;

  // Abrir con Enter, Espacio y Flecha abajo: el foco pasa a la fila elegida.
  for (const [tecla, nombre] of [['Enter', 'Enter'], [' ', 'Espacio'], ['ArrowDown', 'Flecha abajo'], ['ArrowUp', 'Flecha arriba']]) {
    t.ok(c(`Tab llega al disparador (${nombre})`), await enfocarDisparador(pagina), true);
    await pagina.tecla(tecla);
    await pausa(150);
    const l = await leerDesp(pagina);
    t.ok(c(`${nombre} abre y el foco pasa a la fila elegida`),
      `${l.disp.expandido}|${l.foco && l.foco.enOpcion}|${l.foco && l.foco.texto}`, `true|true|${primero}`);
    await teclaSintetica(pagina, 'Escape');
  }

  // Recorrer: las flechas mueven el foco, no la selección; sin vuelta en los extremos.
  t.ok(c('Tab llega al disparador (recorrer)'), await enfocarDisparador(pagina), true);
  await pagina.tecla('Enter');
  await pausa(150);
  const foco = async () => {
    const l = await leerDesp(pagina);
    return { texto: l.foco && l.foco.texto, sel: l.opciones.filter((o) => o.seleccionada === 'true').map((o) => o.texto).join('|') };
  };
  await pagina.tecla('ArrowDown');
  await pausa(100);
  let f = await foco();
  t.ok(c('Flecha abajo: el foco pasa a la segunda fila y la elegida no cambia'),
    `${f.texto}|${f.sel}`, `${TEMAS_BCYT[1].nombre}|${primero}`);
  await pagina.tecla('ArrowUp');
  await pagina.tecla('ArrowUp');
  await pausa(100);
  f = await foco();
  t.ok(c('Flecha arriba en la primera: sin vuelta, queda en la primera'), f.texto, primero);
  await teclaSintetica(pagina, 'End');
  await pausa(100);
  f = await foco();
  const ultimo = TEMAS_BCYT[TEMAS_BCYT.length - 1].nombre;
  t.ok(c('Fin: la última fila'), f.texto, ultimo);
  await pagina.tecla('ArrowDown');
  await pausa(100);
  f = await foco();
  t.ok(c('Flecha abajo en la última: sin vuelta, queda en la última'), f.texto, ultimo);
  await teclaSintetica(pagina, 'Home');
  await pausa(100);
  f = await foco();
  t.ok(c('Inicio: la primera fila'), f.texto, primero);
  t.ok(c('la elegida sigue siendo la primera tras recorrer (las flechas no eligen)'), f.sel, primero);

  // Enter elige la fila con foco, cierra y devuelve el foco al disparador.
  await pagina.tecla('ArrowDown');
  await pagina.tecla('ArrowDown');
  await pausa(100);
  await pagina.tecla('Enter');
  await pausa(150);
  let l = await leerDesp(pagina);
  t.ok(c('Enter elige la fila con foco, cierra y el foco vuelve al disparador'),
    `${l.nListasEnDom}|${l.disp.texto}|${l.foco && l.foco.esDisparador}`, `0|${TEMAS_BCYT[2].nombre}|true`);
  // Espacio elige.
  await pagina.tecla('Enter');
  await pausa(150);
  await pagina.tecla('ArrowDown');
  await pausa(100);
  await pagina.tecla(' ');
  await pausa(150);
  l = await leerDesp(pagina);
  t.ok(c('Espacio elige la fila con foco y cierra'),
    `${l.nListasEnDom}|${l.disp.texto}|${l.foco && l.foco.esDisparador}`, `0|${TEMAS_BCYT[3].nombre}|true`);

  // Escape cierra sin cambiar el tema y devuelve el foco.
  const actual = TEMAS_BCYT[3].nombre;
  await pagina.tecla('Enter');
  await pausa(150);
  await pagina.tecla('ArrowDown');
  await pausa(100);
  await teclaSintetica(pagina, 'Escape');
  l = await leerDesp(pagina);
  t.ok(c('Escape cierra sin cambiar el tema y el foco vuelve al disparador'),
    `${l.nListasEnDom}|${l.disp.texto}|${l.foco && l.foco.esDisparador}`, `0|${actual}|true`);

  // Tab cierra y el foco queda en el enunciado; Shift+Tab, en el disparador. El foco sale
  // antes de la fila elegida: si Tab eligiera, el tema cambiaría y la aserción caería.
  await pagina.tecla('Enter');
  await pausa(150);
  await pagina.tecla('ArrowDown');
  await pausa(100);
  await pagina.tecla('Tab');
  await pausa(200);
  l = await leerDesp(pagina);
  t.ok(c('Tab cierra sin cambiar el tema y el foco queda en el enunciado'),
    `${l.nListasEnDom}|${l.disp.texto}|${l.foco && l.foco.ph}`, `0|${actual}|${PH_ENUNCIADO}`);
  t.ok(c('Tab llega al disparador (Shift+Tab)'), await enfocarDisparador(pagina), true);
  await pagina.tecla('Enter');
  await pausa(150);
  await pagina.tecla('ArrowDown');
  await pausa(100);
  await pagina.tecla('Tab', { shift: true });
  await pausa(200);
  l = await leerDesp(pagina);
  t.ok(c('Shift+Tab cierra sin cambiar el tema y el foco queda en el disparador'),
    `${l.nListasEnDom}|${l.disp.texto}|${l.foco && l.foco.esDisparador}`, `0|${actual}|true`);

  // Letras: «t» y «e» seguidas dejan el foco en «Tejido epitelial».
  await pagina.tecla('Enter');
  await pausa(150);
  await teclaSintetica(pagina, 't', 'e');
  await pausa(100);
  f = await foco();
  t.ok(c('«t» y «e» seguidas: foco en «Tejido epitelial»'), f.texto, 'Tejido epitelial');
  t.ok(c('las letras no cambian el tema elegido'), f.sel, actual);
  await teclaSintetica(pagina, 'Escape');

  // Con Alt, Ctrl o Meta no se actúa.
  await pagina.tecla('Enter');
  await pausa(150);
  await pagina.evaluar(EN_MARCO(`
    d.activeElement.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true, cancelable: true }));
    return true;`));
  await pausa(100);
  f = await foco();
  t.ok(c('Alt+Flecha abajo no mueve el foco'), f.texto, actual);
  await teclaSintetica(pagina, 'Escape');
}

// ADD-P3 j.9 a j.11 en 320: objetivos, sin desborde y entra en la ventana.
async function desplegableA320(pagina, base, t) {
  const c = (s) => `320 × 568 · Tema · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 320, alto: 568 }), true);
  const cerrado = await leerDesp(pagina);
  t.ok(c('cerrado: sin scroll horizontal'), cerrado.desborda, false);
  t.ok(c('cerrado: el disparador mide 44 × 44 como mínimo'),
    !!cerrado.disp && cerrado.disp.alto >= LADO_TACTIL - 0.5 && cerrado.disp.ancho >= LADO_TACTIL - 0.5, true);
  t.ok(c('cerrado: «Enunciado de la pregunta» a menos de 200 px'),
    !!cerrado.enunciado && cerrado.enunciado.y < 200, true);
  t.ok(c('abre'), await abrirDesplegable(pagina), true);
  const l = await leerDesp(pagina);
  if (!l.lista) return;
  t.ok(c('abierto: sin scroll horizontal'), l.desborda, false);
  t.ok(c('abierto: cada fila mide 44 × 44 como mínimo'),
    l.opciones.length > 0 && l.opciones.every((o) => o.alto >= LADO_TACTIL - 0.5 && o.ancho >= LADO_TACTIL - 0.5), true);
  t.ok(c('abierto: la lámina entra en la ventana (borde inferior < 568 px)'), l.lista.abajo < 568, true);
  t.ok(c('abierto: la lista y las filas dentro del ancho de la ventana'),
    l.lista.izq >= 0 && l.lista.der <= l.vista + 0.5
      && l.opciones.every((o) => o.izq >= -0.5 && o.der <= l.vista + 0.5), true);
  t.ok(c('la región desplaza dentro de sí (hay más filas que alto)'), l.lista.scrollHeight > l.lista.clientHeight, true);
}

// ADD-P3 H1 (3.9e): en una ventana baja (zoom 200 %, teléfono horizontal) la lámina no entra;
// la fila con foco, con su contorno, queda dentro de la ventana en cada paso, abajo y arriba.
async function desplegableVentanaBaja(pagina, base, t) {
  const ALTO = 300;
  const c = (s) => `390 × ${ALTO} · Tema · ${s}`;
  // Se llega con la ventana normal (los botones de la ruta entran) y después se baja.
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390, alto: 900 }), true);
  await pagina.evaluar(EN_MARCO(`m.style.height = '${ALTO}px'; return true;`));
  await pausa(200);
  if (!await hayDisparador(pagina, t, c)) return;
  t.ok(c('abre'), await abrirDesplegable(pagina), true);
  const fuera = [];
  let visitadas = 0;
  const medir = async (sentido) => {
    const r = await leerDesp(pagina);
    const f = r.opciones.find((o) => o.enfocado);
    visitadas += 1;
    if (!f || f.arriba - 4 < -0.5 || f.abajo + 4 > r.alto + 0.5) {
      fuera.push(`${sentido} ${f ? f.texto : 'sin foco'}`);
    }
    return r;
  };
  const n = (await leerDesp(pagina)).opciones.length;
  await medir('·');
  for (let k = 0; k < n - 1; k++) {
    await pagina.tecla('ArrowDown');
    await pausa(40);
    await medir('↓');
  }
  for (let k = 0; k < n - 1; k++) {
    await pagina.tecla('ArrowUp');
    await pausa(40);
    await medir('↑');
  }
  t.ok(c('Flecha abajo y arriba por todas las filas: la fila con foco y su contorno quedan dentro de la ventana'),
    JSON.stringify(fuera), '[]');
  t.ok(c('se recorrieron todas las filas en los dos sentidos'), visitadas, 2 * n - 1);
}

// ADD-P3 j.10 con nombres largos: en 320 el nombre salta de línea dentro del disparador y
// de la fila, sin desborde y sin recorte. Una materia por vez.
async function temasLargosA320(pagina, base, t) {
  const materias = ['Anatomía', 'Cardiovascular y Respiratorio', 'Digestivo, Renal y Endócrino',
    'Reproductor y Desarrollo', 'Neurobiología'];
  for (const materia of materias) {
    const c = (s) => `320 px · ${materia} · Agregar · ${s}`;
    const llega = await abrirAgregar(pagina, base, { ancho: 320, materia });
    t.ok(c('llega a /agregar'), llega, true);
    if (!llega) continue;
    const cerrado = await leerDesp(pagina);
    t.ok(c('cerrado: hay disparador y no hay filtros'), !!cerrado.disp && cerrado.radiogrupos === 0, true);
    if (!cerrado.disp) continue;
    t.ok(c('cerrado: sin scroll horizontal'), cerrado.desborda, false);
    t.ok(c('cerrado: el nombre cabe dentro del disparador, sin recorte'),
      await pagina.evaluar(EN_MARCO(`
        const n = visibles('[aria-haspopup="listbox"]')[0];
        const it = d.createTreeWalker(n, 4);
        let hoja = null;
        for (let x; (x = it.nextNode());) if (x.textContent.trim()) { hoja = x.parentElement; break; }
        const rn = n.getBoundingClientRect(), rh = hoja.getBoundingClientRect();
        return rh.left >= rn.left - 0.5 && rh.right <= rn.right + 0.5
          && rh.top >= rn.top - 0.5 && rh.bottom <= rn.bottom + 0.5
          && hoja.scrollWidth <= hoja.clientWidth + 1;
      `)), true);
    t.ok(c('cerrado: el disparador mide 44 de alto como mínimo'),
      cerrado.disp.alto >= LADO_TACTIL - 0.5, true);
    t.ok(c('abre'), await abrirDesplegable(pagina), true);
    const l = await leerDesp(pagina);
    t.ok(c('abierto: sin scroll horizontal'), l.desborda, false);
    t.ok(c('abierto: hay filas y todas dentro del ancho de la ventana'),
      l.opciones.length > 0 && l.opciones.every((o) => o.izq >= -0.5 && o.der <= l.vista + 0.5), true);
    t.ok(c('abierto: cada fila mide 44 de alto como mínimo'),
      l.opciones.every((o) => o.alto >= LADO_TACTIL - 0.5), true);
    const largo = l.opciones.reduce((a, o) => (o.texto.length > a.texto.length ? o : a), l.opciones[0]);
    t.ok(c(`el nombre más largo («${largo.texto.slice(0, 30)}…») cabe sin recorte dentro de su fila`),
      await pagina.evaluar(EN_MARCO(`
        const n = Array.from(d.querySelectorAll('[role="option"]'))
          .find((x) => x.textContent.trim() === ${JSON.stringify(largo.texto)});
        if (!n) return null;
        const it = d.createTreeWalker(n, 4);
        let hoja = null;
        for (let x; (x = it.nextNode());) if (x.textContent.trim()) { hoja = x.parentElement; break; }
        const rn = n.getBoundingClientRect(), rh = hoja.getBoundingClientRect();
        return rh.left >= rn.left - 0.5 && rh.right <= rn.right + 0.5
          && rh.top >= rn.top - 0.5 && rh.bottom <= rn.bottom + 0.5
          && hoja.scrollWidth <= hoja.clientWidth + 1;
      `)), true);
  }
}

// ADD-P3 j.12 y j.13: guardando cierra y deshabilita; el tema llega al guardado y
// «Agregar otra» lo conserva.
async function desplegableGuardar(pagina, base, t) {
  const c = (s) => `390 px · Tema · guardar · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390, alto: 844 }), true);
  if (!await hayDisparador(pagina, t, c)) return;
  const inicial = TEMAS_BCYT[0].nombre;
  t.ok(c('el tema inicial es el primero de TOPICS'), (await leerDesp(pagina)).disp.texto, inicial);

  // Elegir el segundo tema y dejar la lista abierta al guardar.
  await abrirDesplegable(pagina);
  const l0 = await leerDesp(pagina);
  await tocarCaja(pagina, l0.opciones[1]);
  const elegido = TEMAS_BCYT[1];
  t.ok(c('el segundo tema queda elegido'), (await leerDesp(pagina)).disp.texto, elegido.nombre);
  await escribir(pagina, PH_ENUNCIADO, `Pregunta e2e tema ${Date.now()}`);
  await escribir(pagina, phOpcion('A'), 'Uno');
  await escribir(pagina, phOpcion('B'), 'Dos');
  await tocar(pagina, porNombre(pagina, celda('A')));
  await abrirDesplegable(pagina);
  t.ok(c('con la lista abierta'), (await leerDesp(pagina)).nListasEnDom, 1);

  // El diálogo «¡Pregunta guardada!» llega con `saving` todavía en true: se toma la
  // lectura del DOM dentro de `window.confirm` y se acepta «Agregar otra».
  await pagina.evaluar(EN_MARCO(`
    w.__guardando = null;
    w.confirm = () => {
      const disp = visibles('[aria-haspopup="listbox"]')[0];
      w.__guardando = { desactivado: disp ? disp.getAttribute('aria-disabled') : null,
        expandido: disp ? disp.getAttribute('aria-expanded') : null,
        listas: d.querySelectorAll('[role="listbox"]').length };
      return true;
    };
    return true;
  `));
  await tocar(pagina, porTexto(pagina, 'Guardar pregunta'));
  await pagina.esperarA(async () => await pagina.evaluar(EN_MARCO('return w.__guardando !== null;')), { limite: 5000 });
  const g = await pagina.evaluar(EN_MARCO('return w.__guardando;'));
  t.ok(c('guardando: el disparador queda deshabilitado (aria-disabled)'), g && g.desactivado, 'true');
  t.ok(c('guardando: la lista cerrada'), g && `${g.listas}|${g.expandido}`, '0|false');

  await pagina.esperarA(async () => (await valorDe(pagina, PH_ENUNCIADO)) === '', { limite: 5000 });
  const luego = await leerDesp(pagina);
  t.ok(c('«Agregar otra»: el disparador conserva el nombre'), luego.disp && luego.disp.texto, elegido.nombre);
  t.ok(c('«Agregar otra»: habilitado y cerrado'),
    luego.disp && `${luego.disp.desactivado === 'true' || luego.disp.inhabilitado}|${luego.disp.expandido}`, 'false|false');
  // Solo las preguntas de esta prueba (por su enunciado), que se borran al leerlas: el
  // perfil del arnés es compartido y «Ajustes» cuenta las preguntas propias.
  const guardado = await pagina.evaluar(EN_MARCO(`
    const topics = [];
    const claves = [];
    for (let i = 0; i < w.localStorage.length; i++) {
      const k = w.localStorage.key(i);
      if (k.startsWith('pkapp_user_questions:')) claves.push(k);
    }
    for (const k of claves) {
      const todas = JSON.parse(w.localStorage.getItem(k));
      const propias = todas.filter((q) => String(q.question).startsWith('Pregunta e2e tema '));
      for (const q of propias) topics.push(q.topic);
      if (propias.length === 0) continue;
      const resto = todas.filter((q) => !propias.includes(q));
      if (resto.length) w.localStorage.setItem(k, JSON.stringify(resto)); else w.localStorage.removeItem(k);
    }
    return topics;
  `));
  t.ok(c('addUserQuestion recibió la clave del tema elegido'), JSON.stringify(guardado), JSON.stringify([elegido.clave]));
}

// ADD-P3 j.15 a j.17: el foco no se recorta, sin transparencia y colores de c.1.
async function desplegableEstados(pagina, base, t, tema) {
  const T = plancha[tema];
  const c = (s) => `390 px · ${tema} · Tema · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390, alto: 844, oscuro: tema === 'oscuro' }), true);
  if (!await hayDisparador(pagina, t, c)) return;

  // Reposo y hover del disparador cerrado.
  const reposo = (await leerDesp(pagina)).disp;
  t.ok(c('disparador en reposo: borde borde'), reposo.borde, rgb(T.borde));
  await pagina.moverA(Math.round(reposo.x + reposo.ancho / 2), Math.round(reposo.y + reposo.alto / 2));
  await pausa();
  const hover = (await leerDesp(pagina)).disp;
  t.ok(c('disparador hover: borde linea, sin mover'),
    `${hover.borde}|${hover.x === reposo.x && hover.y === reposo.y}`, `${rgb(T.linea)}|true`);
  await pagina.moverA(2, 2);

  // Foco de teclado en el disparador.
  t.ok(c('Tab llega al disparador'), await enfocarDisparador(pagina), true);
  await pausa();
  const dFoco = (await leerDesp(pagina)).disp;
  t.ok(c('disparador con foco: contorno foco 2 px separado paso 0.5'),
    `${dFoco.contorno.estilo} ${dFoco.contorno.ancho} ${dFoco.contorno.color} ${dFoco.contorno.sep}`,
    `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);

  // Abierto: foco en una fila de la lista, hover en otra.
  await pagina.tecla('Enter');
  await pausa(150);
  await pagina.tecla('ArrowDown');
  await pausa(150);
  const l = await leerDesp(pagina);
  const activa = l.opciones.find((o) => o.enfocado);
  t.ok(c('hay una fila con foco'), !!activa, true);
  if (!activa) return;
  t.ok(c('fila con foco: contorno foco 2 px separado paso 0.5'),
    `${activa.contorno.estilo} ${activa.contorno.ancho} ${activa.contorno.color} ${activa.contorno.sep}`,
    `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);
  // El contorno (2 px de borde y 2 de separación) queda dentro de la región de scroll.
  const dentro = (o, r) => o.izq - 4 >= r.izq - 0.5 && o.der + 4 <= r.der + 0.5
    && o.arriba - 4 >= r.arriba - 0.5 && o.abajo + 4 <= r.abajo + 0.5;
  t.ok(c('el contorno de foco de la fila queda dentro de la región'), dentro(activa, l.lista), true);
  await teclaSintetica(pagina, 'End');
  await pausa(150);
  const fin = await leerDesp(pagina);
  const ultima = fin.opciones.find((o) => o.enfocado);
  t.ok(c('el contorno de foco de la última fila queda dentro de la región'),
    !!ultima && dentro(ultima, fin.lista), true);
  await teclaSintetica(pagina, 'Home');
  await pausa(150);
  const ini = await leerDesp(pagina);
  const primera = ini.opciones.find((o) => o.enfocado);
  t.ok(c('el contorno de foco de la primera fila queda dentro de la región'),
    !!primera && dentro(primera, ini.lista), true);

  // Todas las filas, incluidas las del pliegue de la región: con Flecha abajo hasta la
  // última y con Flecha arriba de vuelta, el contorno de cada fila con foco queda dentro.
  const recortadas = [];
  let visitadas = 0;
  const recorrer = async (tecla, veces, sentido) => {
    for (let k = 0; k < veces; k++) {
      await pagina.tecla(tecla);
      await pausa(40);
      const r = await leerDesp(pagina);
      const f = r.opciones.find((o) => o.enfocado);
      visitadas += 1;
      if (!f || !dentro(f, r.lista)) {
        recortadas.push(`${sentido} ${f ? f.texto : 'sin foco'}`);
      }
    }
  };
  await recorrer('ArrowDown', TEMAS_BCYT.length - 1, '↓');
  await recorrer('ArrowUp', TEMAS_BCYT.length - 1, '↑');
  t.ok(c('Flecha abajo y arriba por todas las filas: cada contorno de foco queda dentro de la región'),
    JSON.stringify(recortadas), '[]');
  t.ok(c('se recorrieron todas las filas en los dos sentidos'), visitadas, 2 * (TEMAS_BCYT.length - 1));

  // Hover sobre una fila en reposo: contorno linea 1 px, sin mover.
  const rep = ini.opciones[3];
  await pagina.moverA(Math.round(rep.x + rep.ancho / 2), Math.round(rep.y + rep.alto / 2));
  await pausa();
  const h = (await leerDesp(pagina)).opciones[3];
  t.ok(c('fila hover: contorno linea 1 px, sin mover'),
    `${h.contorno.estilo} ${h.contorno.ancho} ${h.contorno.color}|${h.x === rep.x && h.y === rep.y}`,
    `solid 1px ${rgb(T.linea)}|true`);
  await pagina.moverA(2, 2);

  // Sin sombra, esquinas redondeadas ni opacidad; ningún color con transparencia parcial.
  const piezas = [(await leerDesp(pagina)).disp, ...ini.opciones].filter(Boolean);
  // Se leen el elemento exterior (el que lleva el rol) y el contenedor interno de cada pieza.
  const feos = piezas.filter((p) => [p.sombra, p.sombraExt].some((x) => x !== 'none')
    || [p.radio, p.radioExt].some((x) => x !== '0px')
    || [p.opacidad, p.opacidadExt].some((x) => x !== '1')
    || [p.fondo, p.borde, p.color].some((x) => x.startsWith('rgba') && x !== 'rgba(0, 0, 0, 0)'));
  t.ok(c('sin box-shadow, border-radius, opacity ni rgba (CD-24), en el exterior y el interior'),
    JSON.stringify(feos.map((p) => `${p.texto.slice(0, 20)}:${p.sombra}|${p.sombraExt}|${p.radio}|${p.radioExt}|${p.opacidad}|${p.opacidadExt}`)), '[]');
}

// ADD-P3 j.9 y j.10 en los cinco anchos y los dos temas, cerrado y abierto.
async function desplegableAnchos(pagina, base, t) {
  for (const oscuro of [false, true]) {
    const tema = oscuro ? 'oscuro' : 'claro';
    for (const ancho of [320, 390, 1280]) {
      const c = (s) => `${ancho} px · ${tema} · Tema · ${s}`;
      if (!await abrirAgregar(pagina, base, { ancho, alto: ancho === 1280 ? 800 : 844, oscuro })) {
        t.ok(c('llega a /agregar'), false, true);
        continue;
      }
      const cerrado = await leerDesp(pagina);
      t.ok(c('cerrado: sin scroll horizontal'), cerrado.desborda, false);
      t.ok(c('cerrado: el disparador mide 44 × 44 como mínimo'),
        !!cerrado.disp && cerrado.disp.alto >= LADO_TACTIL - 0.5 && cerrado.disp.ancho >= LADO_TACTIL - 0.5, true);
      await abrirDesplegable(pagina);
      const l = await leerDesp(pagina);
      t.ok(c('abierto: sin scroll horizontal'), l.desborda, false);
      t.ok(c('abierto: las filas miden 44 × 44 como mínimo'),
        l.opciones.length > 0 && l.opciones.every((o) => o.alto >= LADO_TACTIL - 0.5 && o.ancho >= LADO_TACTIL - 0.5), true);
      t.ok(c('abierto: la lista del ancho del disparador'),
        !!l.lista && !!l.disp && Math.abs(l.lista.ancho_marco - l.disp.ancho) < 1, true);
      // Hasta 768 la columna sigue en 448; desde el corte `escritorio` rige `lectura` (600).
      if (ancho >= 768) {
        const tope = ancho >= CORTE ? LECTURA : COLUMNA;
        t.ok(c(`una sola columna de a lo sumo ${tope} px`), !!l.disp && l.disp.ancho <= tope + 1, true);
      }
    }
  }
}

async function estructuraDeOpciones(pagina, base, t, tema) {
  const T = plancha[tema];
  const c = (s) => `${tema} · Agregar · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390, oscuro: tema === 'oscuro' }), true);

  // Celdas de letra (K3): 44 × 44, marco `borde`, letra en `dato`; quitar (K7) de 44 × 44.
  for (const letra of ['A', 'B', 'C', 'D']) {
    const cel = await porNombre(pagina, celda(letra));
    t.ok(c(`celda ${letra}: 44 × 44, letra, marco borde, tinta`),
      cel && `${cel.ancho}×${cel.alto}|${cel.texto}|${cel.bordeAncho} ${cel.borde}|${cel.color}|${cel.tamano}`,
      `${LADO_TACTIL}×${LADO_TACTIL}|${letra}|1px ${rgb(T.borde)}|${rgb(T.tinta)}|16px`);
    t.ok(c(`celda ${letra}: letra en Plex Mono 500 (dato, D-03)`), cel && cel.familia, 'PlexMono-Medium');
    const q = await porNombre(pagina, quitar(letra));
    t.ok(c(`quitar ${letra}: 44 × 44, glifo-cerrar tintaSec decorativo en fondo`),
      q && `${q.ancho}×${q.alto}|${q.glifo}|${q.texto}`, `${LADO_TACTIL}×${LADO_TACTIL}|${T.tintaSec}|`);
  }

  // «Agregar opción» (K3): borde continuo `borde`, glifo-mas delante, sin «+» de texto.
  const mas = await porTexto(pagina, 'Agregar opción');
  t.ok(c('«Agregar opción»: marco borde continuo 1px, fondo superficie'),
    mas && `${mas.bordeAncho} ${mas.borde} ${mas.fondo}`, `1px ${rgb(T.borde)} ${rgb(T.superficie)}`);
  t.ok(c('«Agregar opción»: 44 de alto, glifo-mas tinta decorativo, sin «+»'),
    mas && mas.alto >= LADO_TACTIL - 0.5 && mas.glifo === T.tinta && mas.glifoOculto === 'true'
      && !mas.texto.includes('+'), true);
  const estilo = await pagina.evaluar(EN_MARCO(`
    ${INFO}
    const n = controlDe(hojaConTexto('Agregar opción'));
    return n ? w.getComputedStyle(n.firstElementChild || n).borderTopStyle : null;
  `));
  t.ok(c('«Agregar opción»: borde continuo (no discontinuo)'), estilo, 'solid');

  // «Guardar pregunta» (K1): relleno tinta, texto fondo, glifo-guardar delante, sin emoji.
  const g = await porTexto(pagina, 'Guardar pregunta');
  t.ok(c('«Guardar pregunta»: fondo tinta, texto fondo, borde tinta'),
    g && `${g.fondo}|${g.color}|${g.borde}`, `${rgb(T.tinta)}|${rgb(T.fondo)}|${rgb(T.tinta)}`);
  t.ok(c('«Guardar pregunta»: glifo-guardar en fondo, decorativo, sin emoji'),
    g && g.glifo === T.fondo && g.glifoOculto === 'true' && !EMOJI_O_SIMBOLO.test(g.texto), true);
  t.ok(c('«Guardar pregunta»: 44 de alto como mínimo'), g && g.alto >= LADO_TACTIL - 0.5, true);
  t.ok(c('«Guardar pregunta»: tamaño grande, 52 de alto (D-02)'), g && Math.round(g.alto), 52);
  t.ok(c('«Guardar pregunta»: mismo ancho que el campo del enunciado'),
    g && Math.abs(g.ancho - ((await porPh(pagina, PH_ENUNCIADO)) || { ancho: -1 }).ancho) < 1, true);

  // Marcar la correcta: el tilde reemplaza a la letra; solo esa celda.
  await tocar(pagina, porNombre(pagina, celda('B')));
  const b = await porNombre(pagina, celda('B'));
  t.ok(c('celda B marcada: aria-pressed, fondo acierto, borde acierto 2px'),
    b && `${b.pressed}|${b.fondo}|${b.bordeAncho} ${b.borde}`, `true|${rgb(T.acierto)}|2px ${rgb(T.acierto)}`);
  t.ok(c('celda B marcada: glifo-acierto en fondo, sin letra'),
    b && b.glifo === T.fondo && b.texto === '', true);
  // E-02: el glifo mide paso 4 (16 × 16) y queda centrado en la celda, sin relleno horizontal.
  const gc = b && b.glifoCaja;
  t.ok(c('celda B marcada: glifo-acierto de 16 × 16 (paso 4)'),
    gc && `${Math.round(gc.ancho)}×${Math.round(gc.alto)}`, '16×16');
  t.ok(c('celda B marcada: glifo-acierto centrado en la celda'),
    gc && Math.abs(gc.dx) <= 0.5 && Math.abs(gc.dy) <= 0.5, true);
  const resto = [];
  for (const letra of ['A', 'C', 'D']) resto.push(await porNombre(pagina, celda(letra)));
  t.ok(c('las demás celdas: letra centrada en la celda'),
    resto.every((x) => x && x.relleno.startsWith('0px')), true);
  t.ok(c('las demás celdas muestran su letra y no están marcadas'),
    resto.map((x) => (x ? `${x.texto}:${x.pressed}` : 'null')).join('|'), 'A:false|C:false|D:false');
  // Marcar otra desmarca la anterior.
  await tocar(pagina, porNombre(pagina, celda('C')));
  t.ok(c('marcar C desmarca B'),
    `${(await porNombre(pagina, celda('B')) || {}).pressed}|${(await porNombre(pagina, celda('C')) || {}).pressed}`, 'false|true');

  // Quitar la marcada la desmarca y las letras bajan un lugar.
  await tocar(pagina, porNombre(pagina, quitar('C')));
  t.ok(c('quitar la marcada: quedan tres opciones (A, B, C)'),
    (await pagina.evaluar(EN_MARCO(`return visibles('[aria-label^="Opción "][aria-label$=", marcar como correcta"]').length;`))), 3);
  const marcadas = await pagina.evaluar(EN_MARCO(`
    return visibles('[aria-label$=", marcar como correcta"][aria-pressed="true"]').length;`));
  t.ok(c('quitar la marcada: ninguna queda marcada'), marcadas, 0);

  // Con dos opciones no se quita: aviso del sistema.
  await tocar(pagina, porNombre(pagina, quitar('C')));
  pagina.dialogos.length = 0;
  await tocar(pagina, porNombre(pagina, quitar('B')));
  t.ok(c('con dos opciones el quitar responde con «Mínimo 2 opciones»'),
    pagina.dialogos.join('|'), 'Mínimo 2 opciones\n\nTiene que haber al menos 2 opciones de respuesta.');
}

// Con 6 opciones no hay «Agregar opción»: la última fila queda a 24 px del grupo siguiente (a.1, D-05).
async function seisOpciones(pagina, base, t) {
  const c = (s) => `390 px · Agregar · 6 opciones · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390 }), true);
  await tocar(pagina, porTexto(pagina, 'Agregar opción'));
  await tocar(pagina, porTexto(pagina, 'Agregar opción'));
  t.ok(c('hay una celda F'), !!(await porNombre(pagina, celda('F'))), true);
  const hueco = await pagina.evaluar(EN_MARCO(`
    ${INFO}
    const f = porNombre(${JSON.stringify(celda('F'))});
    const fila = f && f.parentElement;
    const rotulo = hojaConTexto('Explicación (opcional)');
    if (!fila || !rotulo) return null;
    return Math.round(rotulo.getBoundingClientRect().top - fila.getBoundingClientRect().bottom);
  `));
  t.ok(c('24 px entre la última fila y el grupo siguiente'), hueco, 24);
}

// El alto de los campos crece con el contenido (a.2): sin scroll interno ni texto recortado.
async function camposCrecen(pagina, base, t) {
  const c = (s) => `320 px · Agregar · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 320 }), true);
  const largo = 'Texto largo que ocupa varias líneas en un campo angosto de trescientos veinte píxeles de ancho, '
    + 'repetido para que el contenido supere cualquier alto fijo de filas. '.repeat(2);
  const medir = (ph) => pagina.evaluar(EN_MARCO(`
    ${INFO}
    const el = porPh(${JSON.stringify(ph)});
    return el ? { alto: el.getBoundingClientRect().height, recortado: el.scrollHeight > el.clientHeight + 1 } : null;
  `));
  for (const [nombre, ph] of [['opción A', phOpcion('A')], ['enunciado', PH_ENUNCIADO], ['explicación', PH_EXPLICACION]]) {
    await escribir(pagina, ph, 'Corto');
    const corto = await medir(ph);
    await escribir(pagina, ph, largo);
    await pausa();
    const grande = await medir(ph);
    t.ok(c(`${nombre}: con texto largo el alto crece`), !!corto && !!grande && grande.alto > corto.alto + 20, true);
    t.ok(c(`${nombre}: con texto largo no hay scroll interno`), grande && grande.recortado, false);
    await escribir(pagina, ph, 'Corto');
    await pausa();
    const vuelta = await medir(ph);
    t.ok(c(`${nombre}: al borrar vuelve a su alto`), !!corto && !!vuelta && Math.abs(vuelta.alto - corto.alto) < 1, true);
  }
  const opcion = await medir(phOpcion('B'));
  t.ok(c('un campo de opción vacío mide 44 como mínimo'), !!opcion && opcion.alto >= LADO_TACTIL - 0.5, true);
}

// Estados K con puntero y teclado reales, a 1280 px.
async function estadosK(pagina, base, t) {
  const T = plancha.claro;
  const c = (s) => `K · Agregar · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 1280, alto: 900 }), true);

  // K3 disparador del tema: reposo `borde`, hover `linea` sin mover el layout.
  const d0 = (await leerDesp(pagina)).disp;
  t.ok(c('hay disparador de tema'), !!d0, true);
  if (!d0) return;
  t.ok(c('K3 disparador en reposo: fondo superficie, texto tinta, borde borde'),
    `${d0.fondo}|${d0.color}|${d0.borde}`, `${rgb(T.superficie)}|${rgb(T.tinta)}|${rgb(T.borde)}`);
  await pagina.moverA(Math.round(d0.x + d0.ancho / 2), Math.round(d0.y + d0.alto / 2));
  await pausa();
  const dHover = (await leerDesp(pagina)).disp;
  t.ok(c('K3 disparador hover: borde linea, sin mover'),
    `${dHover.borde}|${dHover.x === d0.x && dHover.y === d0.y}`, `${rgb(T.linea)}|true`);
  await pagina.moverA(2, 2);

  // Campo de texto: hover con borde `linea`; foco con contorno `foco` 2 px separado paso 0.5.
  const campo = await porPh(pagina, PH_ENUNCIADO);
  const p = centro(campo);
  await pagina.moverA(p.x, p.y);
  await pausa();
  const campoHover = await porPh(pagina, PH_ENUNCIADO);
  t.ok(c('campo hover: borde linea'), campoHover.borde, rgb(T.linea));
  await pagina.clicEn(p.x, p.y);
  await pausa();
  await pagina.moverA(2, 2);
  await pausa();
  const campoFoco = await porPh(pagina, PH_ENUNCIADO);
  t.ok(c('campo con foco: enfocado'), campoFoco.enfocado, true);
  t.ok(c('campo con foco: contorno foco 2 px, separado paso 0.5'),
    `${campoFoco.contorno.estilo} ${campoFoco.contorno.ancho} ${campoFoco.contorno.color} ${campoFoco.contorno.sep}`,
    `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);

  // K3 «Agregar opción»: hover con borde `linea`; foco de teclado con contorno `foco`.
  const mas = await porTexto(pagina, 'Agregar opción');
  const pm = centro(mas);
  await pagina.moverA(pm.x, pm.y);
  await pausa();
  const masHover = await porTexto(pagina, 'Agregar opción');
  t.ok(c('K3 «Agregar opción» hover: borde linea'), masHover.borde, rgb(T.linea));
  await pagina.moverA(2, 2);
  t.ok(c('Tab llega a «Agregar opción»'), await enfocarConTab(pagina, 'Agregar opción'), true);
  await pausa();
  const masFoco = await porTexto(pagina, 'Agregar opción');
  t.ok(c('K3 «Agregar opción» foco: contorno foco 2 px separado paso 0.5'),
    `${masFoco.contorno.estilo} ${masFoco.contorno.ancho} ${masFoco.contorno.color} ${masFoco.contorno.sep}`,
    `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);

  // K3 disparador del tema: foco de teclado con contorno `foco`; abierto, borde `linea`.
  t.ok(c('Tab llega al disparador de tema'), await enfocarDisparador(pagina), true);
  await pausa();
  const dFoco = (await leerDesp(pagina)).disp;
  t.ok(c('K3 disparador foco: contorno foco 2 px separado paso 0.5'),
    `${dFoco.contorno.estilo} ${dFoco.contorno.ancho} ${dFoco.contorno.color} ${dFoco.contorno.sep}`,
    `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);
  await pagina.tecla('Enter');
  await pausa(150);
  const dAbierto = (await leerDesp(pagina)).disp;
  t.ok(c('K3 disparador abierto: borde linea'), dAbierto.borde, rgb(T.linea));
  await pagina.tecla('Escape').catch(() => null);
  await teclaSintetica(pagina, 'Escape');

  // K3 celda de letra en reposo: hover con borde `linea` sin mover; foco con contorno `foco`.
  const reposoA = await porNombre(pagina, celda('A'));
  const pa = centro(reposoA);
  await pagina.moverA(pa.x, pa.y);
  await pausa();
  const aHover = await porNombre(pagina, celda('A'));
  t.ok(c('K3 celda de letra hover: borde linea, sin mover la celda'),
    `${aHover.borde}|${aHover.bordeAncho}|${aHover.x === reposoA.x && aHover.y === reposoA.y}`,
    `${rgb(T.linea)}|1px|true`);
  await pagina.moverA(2, 2);
  t.ok(c('Tab llega a la celda de letra A'), await enfocarConTabPorNombre(pagina, celda('A')), true);
  await pausa();
  const aFoco = await porNombre(pagina, celda('A'));
  t.ok(c('K3 celda de letra foco: contorno foco 2 px separado paso 0.5'),
    `${aFoco.contorno.estilo} ${aFoco.contorno.ancho} ${aFoco.contorno.color} ${aFoco.contorno.sep}`,
    `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);

  // K7 «Quitar opción»: hover con contorno `linea` 1 px; foco con contorno `foco`.
  const qA = await porNombre(pagina, quitar('A'));
  const pq = centro(qA);
  await pagina.moverA(pq.x, pq.y);
  await pausa();
  const qHover = await porNombre(pagina, quitar('A'));
  t.ok(c('K7 quitar hover: contorno linea 1 px, sin mover'),
    `${qHover.contorno.estilo} ${qHover.contorno.ancho} ${qHover.contorno.color}|${qHover.x === qA.x && qHover.y === qA.y}`,
    `solid 1px ${rgb(T.linea)}|true`);
  await pagina.moverA(2, 2);
  t.ok(c('Tab llega a «Quitar opción A»'), await enfocarConTabPorNombre(pagina, quitar('A')), true);
  await pausa();
  const qFoco = await porNombre(pagina, quitar('A'));
  t.ok(c('K7 quitar foco: contorno foco 2 px separado paso 0.5'),
    `${qFoco.contorno.estilo} ${qFoco.contorno.ancho} ${qFoco.contorno.color} ${qFoco.contorno.sep}`,
    `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);

  // K3 celda de la correcta (seleccionada): el hover no cambia nada; el foco suma el contorno.
  await tocar(pagina, porNombre(pagina, celda('B')));
  await pagina.moverA(2, 2);
  await pausa();
  const bSel = await porNombre(pagina, celda('B'));
  const pb = centro(bSel);
  await pagina.moverA(pb.x, pb.y);
  await pausa();
  const bHover = await porNombre(pagina, celda('B'));
  t.ok(c('K3 celda de la correcta hover: sin cambio (fondo y borde acierto)'),
    `${bHover.fondo}|${bHover.bordeAncho} ${bHover.borde}`, `${bSel.fondo}|${bSel.bordeAncho} ${bSel.borde}`);
  t.ok(c('K3 celda de la correcta: fondo acierto, borde acierto 2 px'),
    `${bHover.fondo}|${bHover.bordeAncho} ${bHover.borde}`, `${rgb(T.acierto)}|2px ${rgb(T.acierto)}`);
  await pagina.moverA(2, 2);
  t.ok(c('Tab llega a la celda de la correcta'), await enfocarConTabPorNombre(pagina, celda('B')), true);
  await pausa();
  const bFoco = await porNombre(pagina, celda('B'));
  t.ok(c('K3 celda de la correcta foco: contorno foco 2 px separado paso 0.5'),
    `${bFoco.contorno.estilo} ${bFoco.contorno.ancho} ${bFoco.contorno.color} ${bFoco.contorno.sep}`,
    `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);

  // K1 «Guardar pregunta»: hover con contorno `linea` 2 px.
  const g = await porTexto(pagina, 'Guardar pregunta');
  const pg = centro(g);
  await pagina.moverA(pg.x, pg.y);
  await pausa();
  const gHover = await porTexto(pagina, 'Guardar pregunta');
  t.ok(c('K1 «Guardar pregunta» hover: contorno linea 2 px'),
    `${gHover.contorno.estilo} ${gHover.contorno.ancho} ${gHover.contorno.color}`, `solid 2px ${rgb(T.linea)}`);
  await pagina.moverA(2, 2);

  // Foco de teclado sobre «Guardar pregunta»: contorno `foco`, separado paso 0.5.
  t.ok(c('Tab llega a «Guardar pregunta»'), await enfocarConTab(pagina, 'Guardar pregunta'), true);
  await pausa();
  const gFoco = await porTexto(pagina, 'Guardar pregunta');
  t.ok(c('K1 «Guardar pregunta» foco: contorno foco 2 px separado paso 0.5'),
    `${gFoco.contorno.estilo} ${gFoco.contorno.ancho} ${gFoco.contorno.color} ${gFoco.contorno.sep}`,
    `solid 2px ${rgb(T.foco)} ${0.5 * PASO}px`);
}

// Comun.md §5.1: el hover de los campos vive bajo `@media (hover: hover)`. En un táctil
// `:hover` queda pegado tras el toque: una regla `:hover` de borde fuera del media query
// es el defecto.
async function hoverSoloConPuntero(pagina, base, t) {
  const c = (s) => `Agregar · hover · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390 }), true);
  const r = await pagina.evaluar(EN_MARCO(`
    const hallazgos = [];
    const recorrer = (lista, bajoPuntero) => {
      for (const regla of Array.from(lista)) {
        if (regla.media && regla.cssRules) {
          recorrer(regla.cssRules, bajoPuntero || /hover:\\s*hover/.test(regla.media.mediaText));
        } else if (regla.selectorText && /:hover/.test(regla.selectorText)
          && /border-linea/.test(regla.selectorText)) {
          hallazgos.push({ sel: regla.selectorText, bajoPuntero });
        }
      }
    };
    for (const hoja of Array.from(d.styleSheets)) {
      let reglas = null;
      try { reglas = hoja.cssRules; } catch (e) { reglas = null; }
      if (reglas) recorrer(reglas, false);
    }
    return hallazgos;
  `));
  t.ok(c('hay reglas de hover de borde `linea` (claro y oscuro)'), Array.isArray(r) && r.length >= 2, true);
  t.ok(c('todas están bajo @media (hover: hover)'),
    JSON.stringify((r || []).filter((x) => !x.bajoPuntero).map((x) => x.sel)), '[]');
}

// Quitar una opción anterior a la marcada: la marca sigue en la misma opción, que ahora
// tiene la letra anterior (c.2). Quitar una posterior no la mueve.
async function quitarAnteriorAMarcada(pagina, base, t) {
  const c = (s) => `Agregar · quitar · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390 }), true);
  for (const [letra, texto] of [['A', 'Uno'], ['B', 'Dos'], ['C', 'Tres'], ['D', 'Cuatro']]) {
    await escribir(pagina, phOpcion(letra), texto);
  }
  const estado = async (letras) => {
    const pares = [];
    for (const letra of letras) {
      const cel = await porNombre(pagina, celda(letra));
      pares.push(`${cel ? cel.pressed : 'null'}:${await valorDe(pagina, phOpcion(letra))}`);
    }
    return pares.join('|');
  };
  await tocar(pagina, porNombre(pagina, celda('C')));
  t.ok(c('C marcada, con «Tres»'), await estado(['A', 'B', 'C', 'D']), 'false:Uno|false:Dos|true:Tres|false:Cuatro');

  // Quitar A (anterior a la marcada): «Tres» pasa a la letra B y la marca la sigue.
  await tocar(pagina, porNombre(pagina, quitar('A')));
  t.ok(c('quitar A: quedan Dos, Tres, Cuatro y la marca sigue en «Tres» (ahora B)'),
    await estado(['A', 'B', 'C']), 'false:Dos|true:Tres|false:Cuatro');
  t.ok(c('quitar A: quedan tres celdas'),
    await pagina.evaluar(EN_MARCO(`return visibles('[aria-label$=", marcar como correcta"]').length;`)), 3);

  // Quitar C (posterior a la marcada): la marca no se mueve.
  await tocar(pagina, porNombre(pagina, quitar('C')));
  t.ok(c('quitar C (posterior): la marca sigue en «Tres» (B)'),
    await estado(['A', 'B']), 'false:Dos|true:Tres');
}

// Las validaciones, en orden, con diálogo del sistema (D6, ADD-C4).
async function validaciones(pagina, base, t) {
  const c = (s) => `Agregar · validación · ${s}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390 }), true);
  const guardar = async () => {
    pagina.dialogos.length = 0;
    await tocar(pagina, porTexto(pagina, 'Guardar pregunta'));
    await pagina.esperarA(() => pagina.dialogos.length > 0, { limite: 3000 });
    return pagina.dialogos[0];
  };

  t.ok(c('(1) enunciado vacío'), await guardar(),
    'Falta la pregunta\n\nEscribí el enunciado de la pregunta.');
  await escribir(pagina, PH_ENUNCIADO, 'Pregunta de prueba del arnés');
  await escribir(pagina, phOpcion('A'), 'Primera');
  t.ok(c('(2) menos de dos opciones con texto'), await guardar(),
    'Pocas opciones\n\nNecesitás al menos 2 opciones con texto.');
  await escribir(pagina, phOpcion('B'), 'Segunda');
  t.ok(c('(3) correcta sin marcar'), await guardar(),
    'Falta marcar la correcta\n\nMarcá cuál es la respuesta correcta.');
  await tocar(pagina, porNombre(pagina, celda('C')));
  t.ok(c('(4) correcta sin texto'), await guardar(),
    'Opción correcta vacía\n\nLa opción marcada como correcta no tiene texto.');
  t.ok(c('sigue en /agregar tras los cuatro avisos'), await pagina.evaluar(RUTA), '/agregar');
}

// Guardar, «Agregar otra» conserva el tema y limpia el resto, y la pregunta aparece en
// «Mis preguntas» (Ajustes) con su tema.
async function guardarYVerEnMisPreguntas(pagina, base, t) {
  const c = (s) => `Agregar · guardado · ${s}`;
  const enunciado = `Pregunta e2e agregar ${Date.now()}`;
  t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390 }), true);

  const tema = TEMAS_BCYT[1].nombre;
  const abrio = await abrirDesplegable(pagina);
  t.ok(c('se abre la lista de temas'), abrio, true);
  if (!abrio) return;
  const lista = await leerDesp(pagina);
  await tocarCaja(pagina, lista.opciones.find((o) => o.texto === tema));
  t.ok(c('el tema queda elegido'), (await leerDesp(pagina)).disp.texto, tema);
  await escribir(pagina, PH_ENUNCIADO, `  ${enunciado}  `);
  // B queda vacía y la correcta es la D: lo guardado descarta la vacía, recorta los
  // espacios y recalcula el índice de la correcta (de 3 a 2).
  await escribir(pagina, phOpcion('A'), 'Opción uno');
  await escribir(pagina, phOpcion('C'), ' Opción tres ');
  await escribir(pagina, phOpcion('D'), 'Opción cuatro');
  await escribir(pagina, PH_EXPLICACION, ' Porque sí ');
  await tocar(pagina, porNombre(pagina, celda('D')));

  pagina.dialogos.length = 0;
  pagina.respuestaDialogo = 'aceptar';
  await tocar(pagina, porTexto(pagina, 'Guardar pregunta'));
  await pagina.esperarA(() => pagina.dialogos.length > 0, { limite: 5000 });
  t.ok(c('diálogo «¡Pregunta guardada!»'), pagina.dialogos[0],
    '¡Pregunta guardada!\n\n¿Querés agregar otra?');
  pagina.respuestaDialogo = 'cancelar';

  // Lo guardado es lo que se cargó: enunciado y explicación recortados, tres opciones sin
  // la vacía y la correcta en el índice recalculado.
  const guardada = await pagina.evaluar(EN_MARCO(`
    const hallada = [];
    for (let i = 0; i < w.localStorage.length; i++) {
      const k = w.localStorage.key(i);
      if (!k.startsWith('pkapp_user_questions:')) continue;
      for (const q of JSON.parse(w.localStorage.getItem(k))) {
        if (q.question === ${JSON.stringify(enunciado)}) {
          hallada.push({ topic: q.topic, options: JSON.parse(q.options),
            correctIndex: q.correct_index, explanation: q.explanation });
        }
      }
    }
    return hallada;
  `));
  t.ok(c('se guardó una sola pregunta, con el enunciado recortado'), guardada.length, 1);
  const g = guardada[0] || {};
  t.ok(c('opciones guardadas: sin la vacía y recortadas'),
    JSON.stringify(g.options), JSON.stringify(['Opción uno', 'Opción tres', 'Opción cuatro']));
  t.ok(c('la correcta guardada es «Opción cuatro» (índice 2)'),
    `${g.correctIndex}|${(g.options || [])[g.correctIndex]}`, '2|Opción cuatro');
  t.ok(c('explicación guardada recortada'), g.explanation, 'Porque sí');

  // «Agregar otra»: limpia enunciado, opciones, correcta y explicación; conserva el tema.
  await pagina.esperarA(async () => (await valorDe(pagina, PH_ENUNCIADO)) === '', { limite: 5000 });
  t.ok(c('«Agregar otra» limpia el enunciado'), await valorDe(pagina, PH_ENUNCIADO), '');
  t.ok(c('«Agregar otra» limpia las opciones y la explicación'),
    `${await valorDe(pagina, phOpcion('A'))}|${await valorDe(pagina, phOpcion('B'))}|${await valorDe(pagina, PH_EXPLICACION)}`, '||');
  t.ok(c('«Agregar otra» deja cuatro opciones sin marcar'),
    await pagina.evaluar(EN_MARCO(`
      return visibles('[aria-label$=", marcar como correcta"]').length + ':' +
        visibles('[aria-label$=", marcar como correcta"][aria-pressed="true"]').length;`)), '4:0');
  const luego = await leerDesp(pagina);
  t.ok(c('«Agregar otra» conserva el tema'), luego.disp && luego.disp.texto, tema);

  // Atrás (un solo gesto) a Home y de ahí a Ajustes → Mis preguntas.
  await pagina.evaluar(EN_MARCO('w.history.back();'));
  t.ok(c('atrás vuelve a /inicio'),
    await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/inicio'), true);
  await esperarEnMarco(pagina, 'Ajustes');
  await clicEnMarco(pagina, 'Ajustes');
  t.ok(c('llega a /ajustes'),
    await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/ajustes'), true);
  await esperarEnMarco(pagina, 'Cuestionario');
  const abrir = await pagina.evaluar(EN_MARCO(`
    ${INFO}
    const h = visibles('*').find((n) => n.children.length === 0 && /^\\d+ preguntas? propias?$/i.test(n.textContent.trim()));
    const ctl = controlDe(h);
    if (!ctl) return null;
    ctl.scrollIntoView({ block: 'center' });
    const r = ctl.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  `));
  t.ok(c('Ajustes muestra el contador de preguntas propias'), !!abrir, true);
  if (!abrir) return;
  await pausa(100);
  await pagina.clicEn(abrir.x, abrir.y);
  t.ok(c('la pregunta guardada aparece en «Mis preguntas»'),
    await esperarEnMarco(pagina, enunciado), true);
  const panel = await pagina.evaluar(EN_MARCO(`return d.body.innerText.toLowerCase();`));
  t.ok(c('con su tema'), panel.includes(String(tema).toLowerCase()), true);
  t.ok(c('con la correcta que se marcó («Opción cuatro»)'), panel.includes('opción cuatro'), true);
  t.ok(c('sin la opción que no era la correcta entre las marcas'), panel.includes('opción uno'), false);

  // Limpieza: se elimina la pregunta de prueba para dejar el perfil como estaba.
  pagina.respuestaDialogo = 'aceptar';
  const borrar = await pagina.evaluar(EN_MARCO(`
    ${INFO}
    const h = visibles('*').find((n) => n.children.length === 0 && n.textContent.trim() === ${JSON.stringify(enunciado)});
    let n = h;
    while (n && n !== d.body) {
      const b = Array.from(n.querySelectorAll('[aria-label="Eliminar pregunta"]'))
        .find((x) => x.getBoundingClientRect().width > 0);
      if (b) {
        b.scrollIntoView({ block: 'center' });
        const r = b.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      }
      n = n.parentElement;
    }
    return null;
  `));
  if (borrar) {
    await pausa(100);
    await pagina.clicEn(borrar.x, borrar.y);
    await pagina.esperarA(async () =>
      !(await pagina.evaluar(TEXTO_PANTALLA)).includes(enunciado), { limite: 5000 });
  }
  pagina.respuestaDialogo = 'cancelar';
  t.ok(c('la pregunta de prueba se eliminó'),
    (await pagina.evaluar(TEXTO_PANTALLA)).includes(enunciado), false);
}

// Sin scroll horizontal, sin objetivos chicos y una sola columna, en claro y en oscuro.
async function anchos(pagina, base, t) {
  for (const oscuro of [false, true]) {
    const tema = oscuro ? 'oscuro' : 'claro';
    for (const ancho of [320, 360, 390, 768, 1280]) {
      const c = (s) => `${ancho} px · ${tema} · Agregar · ${s}`;
      if (!await abrirAgregar(pagina, base, { ancho, oscuro })) {
        t.ok(c('llega a /agregar'), false, true);
        continue;
      }
      // Seis opciones: el máximo, con todo el contenido posible.
      if (ancho === 320) {
        for (let i = 0; i < 2; i++) await tocar(pagina, porTexto(pagina, 'Agregar opción'));
        t.ok(c('con seis opciones «Agregar opción» deja de mostrarse'),
          await pagina.evaluar(EN_MARCO(`
            ${INFO}
            return !!controlDe(hojaConTexto('Agregar opción'));`)), false);
      }
      t.ok(c('sin scroll horizontal'), await pagina.evaluar(HAY_DESBORDE), false);
      const m = await pagina.evaluar(EN_MARCO(`
        const cs = visibles('[role="button"], [role="radio"], input, textarea');
        const caja = (n) => { const r = n.getBoundingClientRect(); return { ancho: r.width, alto: r.height, izq: r.left, der: r.right }; };
        const chicos = cs.filter((n) => {
          const r = n.getBoundingClientRect();
          return r.width < ${LADO_TACTIL} - 0.5 || r.height < ${LADO_TACTIL} - 0.5;
        }).map((n) => (n.getAttribute('aria-label') || n.textContent || n.getAttribute('placeholder') || '?').trim().slice(0, 30));
        const enun = visibles('[placeholder]').find((n) => n.getAttribute('placeholder') === ${JSON.stringify(PH_ENUNCIADO)});
        const guardar = Array.from(d.querySelectorAll('[role="button"]')).find((n) =>
          n.textContent.trim().toLowerCase() === 'guardar pregunta' && n.getBoundingClientRect().width > 0);
        return { n: cs.length, chicos, enun: enun ? caja(enun) : null, guardar: guardar ? caja(guardar) : null };
      `));
      t.ok(c('hay controles'), m.n > 0, true);
      t.ok(c('ningún control baja de 44 × 44'), JSON.stringify(m.chicos), '[]');
      t.ok(c('el botón de guardar mide el ancho de la columna'),
        !!m.enun && !!m.guardar && Math.abs(m.enun.ancho - m.guardar.ancho) < 1, true);
      if (ancho >= 768) {
        const tope = ancho >= CORTE ? LECTURA : COLUMNA;
        t.ok(c(`una sola columna de a lo sumo ${tope} px`), !!m.enun && m.enun.ancho <= tope + 1, true);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Escritorio (AddQuestion.md «Escritorio · columna `lectura`», i.18 y i.19; comun.md §7.2):
// una sola columna `lectura` (600) centrada y anclada arriba desde el corte `escritorio`
// (1024); bajo él, la `columna` de siempre. El orden de Tab se compara con el orden VISUAL
// medido en coordenadas de página (no con el del DOM): ninguna región queda fija al
// desplazar y ningún `overflow` recorta el contorno de foco.

const MEDIR_ESCRITORIO = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const desplazable = (n) => {
    for (let a = n && n.parentElement; a; a = a.parentElement) {
      const o = w.getComputedStyle(a).overflowY;
      if (o === 'auto' || o === 'scroll') return a;
    }
    return null;
  };
  const nombre = (n) => (n.getAttribute('aria-label') || n.getAttribute('placeholder') || n.textContent || '').trim();
  // Coordenada de página: la del marco más lo que ya se desplazó cada contenedor.
  const pagina = (n) => {
    let y = n.getBoundingClientRect().top;
    for (let a = n.parentElement; a; a = a.parentElement) y += a.scrollTop || 0;
    return y;
  };
  const barra = visibles('[data-testid="barra-interna"]')[0] || null;
  const volver = visibles('[data-testid="barra-volver"]')[0] || null;
  const disp = visibles('[aria-haspopup="listbox"]')[0] || null;
  const lista = visibles('[role="listbox"]')[0] || null;
  const enun = visibles('[placeholder]').find((n) => n.getAttribute('placeholder') === ${JSON.stringify(PH_ENUNCIADO)}) || null;
  const guardar = visibles('[role="button"]').find((n) => n.textContent.trim().toLowerCase() === 'guardar pregunta') || null;
  const rotulo = visibles('*').find((n) => n.children.length === 0 && n.textContent.trim().toLowerCase() === 'tema') || null;
  const sc = desplazable(enun);
  const controles = visibles('[role="button"], [role="radio"], [role="option"], input, textarea, [aria-haspopup]')
    .filter((n) => !n.closest('[role="listbox"]') || n.getAttribute('role') === 'option')
    .map((n) => ({ nombre: nombre(n), ...caja(n), pagina: pagina(n), tab: n.tabIndex >= 0 && !n.disabled }));
  const textos = visibles('*').filter((n) => n.children.length === 0 && n.textContent.trim() !== '' &&
    !n.closest('[data-testid="barra-interna"]')).map((n) => ({ texto: n.textContent.trim().slice(0, 30), ...caja(n) }));
  const alta = !!sc && sc.scrollHeight > sc.clientHeight + 1;
  return {
    vista: w.innerWidth, alto: w.innerHeight,
    desborda: desbordes().length > 0,
    barra: caja(barra), volver: caja(volver), disp: caja(disp), enun: caja(enun), guardar: caja(guardar),
    rotulo: caja(rotulo), lista: lista ? { ...caja(lista), marcoAbajo: lista.parentElement.getBoundingClientRect().bottom,
      marcoAncho: lista.parentElement.getBoundingClientRect().width } : null,
    centro: sc ? sc.getBoundingClientRect().left + sc.clientWidth / 2 : null,
    scroll: sc ? { top: sc.scrollTop, max: sc.scrollHeight - sc.clientHeight, alta } : null,
    controles, textos,
  };
`);

// Contorno de foco del elemento activo contra cada ancestro que recorta (overflow distinto
// de `visible`): lista los que lo cortan. El elemento se centra antes de medir.
const CONTORNO_RECORTADO = EN_MARCO(`
  const el = d.activeElement;
  if (!el || el === d.body) return null;
  el.scrollIntoView({ block: 'center' });
  const c = w.getComputedStyle(el);
  const g = parseFloat(c.outlineWidth) || 0, o = parseFloat(c.outlineOffset) || 0;
  const r = el.getBoundingClientRect();
  const f = { izq: r.left - g - o, der: r.right + g + o, arriba: r.top - g - o, abajo: r.bottom + g + o };
  const recortan = [];
  for (let a = el.parentElement; a && a !== d.documentElement; a = a.parentElement) {
    const s = w.getComputedStyle(a);
    if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
    const q = a.getBoundingClientRect();
    if (f.izq < q.left - 0.5 || f.der > q.right + 0.5 || f.arriba < q.top - 0.5 || f.abajo > q.bottom + 0.5) {
      recortan.push((a.getAttribute('role') || a.tagName) + ':' + s.overflowX + '/' + s.overflowY);
    }
  }
  return { nombre: (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.textContent || '').trim().slice(0, 30),
    ancho: g, recortan };
`);

const NOMBRE_ACTIVO = EN_MARCO(`
  const a = d.activeElement;
  return a && a !== d.body ? (a.getAttribute('aria-label') || a.getAttribute('placeholder') || a.textContent || '').trim() : null;
`);

// Tab real desde el inicio del documento, sin foco forzado: la barra tiene que ser la
// primera parada porque va primero en el DOM (3.12), no porque se la enfoque. Devuelve los
// nombres de las paradas, en orden, hasta «Guardar pregunta», y por cada una los ancestros
// que recortarían su contorno de foco (W1: todos los enfocables, no solo tres).
async function recorrerConTab(pagina) {
  await pagina.evaluar(EN_MARCO(`
    m.contentWindow.focus();
    if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
  `));
  await pausa(100);
  const vistos = [];
  const recortes = [];
  for (let i = 0; i < 40; i++) {
    await pagina.tecla('Tab');
    const n = await pagina.evaluar(NOMBRE_ACTIVO);
    // `null` es el foco sobre el documento (el primer Tab tras abrir la página en frío), no una parada.
    if (n === null) continue;
    vistos.push(n);
    const r = await pagina.evaluar(CONTORNO_RECORTADO);
    if (!r) recortes.push(`${n}: sin medida`);
    else if (r.recortan.length) recortes.push(`${n}: ${r.recortan.join(',')}`);
    if (n.toLowerCase() === 'guardar pregunta') break;
  }
  return { vistos, recortes };
}

// El arnés abre una página por suite, pero `abrirAgregar` deja el override a >900 px: se
// restaura siempre, también si la suite falla a la mitad (N1).
const restaurarViewport = (pagina) => pagina.enviar('Emulation.setDeviceMetricsOverride',
  { width: 900, height: 1400, deviceScaleFactor: 1, mobile: false });

async function escritorio(pagina, base, t) {
  try {
    await escritorioEnVentanas(pagina, base, t);
  } finally {
    await restaurarViewport(pagina);
  }
}

async function escritorioEnVentanas(pagina, base, t) {
  const medidas = {};
  for (const oscuro of [false, true]) {
    const tema = oscuro ? 'oscuro' : 'claro';
    for (const [ancho, alto] of [[768, 800], [1023, 700], [1024, 700], [1366, 768], [1920, 1080]]) {
      if (oscuro && ancho === 768) continue;
      const c = (s) => `${ancho} px · ${tema} · Escritorio · ${s}`;
      if (!await abrirAgregar(pagina, base, { ancho, alto, oscuro })) {
        t.ok(c('llega a /agregar'), false, true);
        continue;
      }
      const m = await pagina.evaluar(MEDIR_ESCRITORIO);
      t.ok(c('hay disparador, enunciado, rótulo «Tema», «Guardar pregunta» y barra'),
        !!m.disp && !!m.enun && !!m.guardar && !!m.barra && !!m.volver && !!m.rotulo, true);
      if (!m.disp || !m.enun || !m.guardar || !m.barra || !m.volver || !m.rotulo) continue;
      t.ok(c('sin scroll horizontal'), m.desborda, false);
      const esc = ancho >= CORTE;
      if (ancho === 768 || ancho === 1023) medidas[ancho] = m.enun.ancho;

      // Ancho de la columna: `columna` (igual que hoy) bajo el corte, `lectura` desde él.
      const columna = esc ? LECTURA : null;
      if (esc) {
        t.ok(c(`una sola columna \`lectura\` de ${LECTURA} px`), Math.round(m.enun.ancho), LECTURA);
        t.ok(c('el disparador mide el ancho de la columna'), Math.abs(m.disp.ancho - m.enun.ancho) < 1, true);
        t.ok(c('«Guardar pregunta» mide el ancho de la columna'), Math.abs(m.guardar.ancho - m.enun.ancho) < 1, true);
        t.ok(c('la columna está centrada'), m.centro !== null && Math.abs((m.enun.izq + m.enun.der) / 2 - m.centro) < 1, true);
        t.ok(c('la barra interna lleva el volver sobre el borde izquierdo de la columna'),
          Math.abs(m.volver.izq - m.enun.izq) < 1, true);
      } else {
        t.ok(c(`sigue la columna de a lo sumo ${COLUMNA} px`), m.enun.ancho <= COLUMNA + 1, true);
        t.ok(c('el disparador mide el ancho del campo'), Math.abs(m.disp.ancho - m.enun.ancho) < 1, true);
      }
      // La barra con su filete a todo el ancho de la ventana, en todos los anchos.
      t.ok(c('la barra interna ocupa todo el ancho de la ventana'),
        Math.abs(m.barra.izq) < 1 && Math.abs(m.barra.der - m.vista) < 1, true);

      // Sin segunda columna ni región lateral: todo cae dentro del ancho del campo.
      const fuera = m.textos.concat(m.controles).filter((n) =>
        n.izq < m.enun.izq - 1 || n.der > m.enun.der + 1).map((n) => n.texto || n.nombre);
      t.ok(c('nada fuera de la única columna'), JSON.stringify(fuera), '[]');

      // Anclada arriba: el tema es lo primero bajo la barra.
      t.ok(c('el tema arranca junto a la barra (anclada arriba)'),
        m.rotulo.arriba - m.barra.abajo >= 0 && m.rotulo.arriba - m.barra.abajo <= 40, true);

      // 44 × 44 en todo lo tocable.
      const chicos = m.controles.filter((n) => n.ancho < LADO_TACTIL - 0.5 || n.alto < LADO_TACTIL - 0.5)
        .map((n) => n.nombre.slice(0, 30));
      t.ok(c('ningún control baja de 44 × 44'), JSON.stringify(chicos), '[]');

      // Orden de Tab = orden visual medido (coordenadas de página): arriba abajo, sin saltos atrás.
      const visual = m.controles.filter((n) => n.tab)
        .sort((a, b) => Math.round(a.pagina) - Math.round(b.pagina) || a.izq - b.izq)
        .map((n) => n.nombre);
      const { vistos: real, recortes } = await recorrerConTab(pagina);
      t.ok(c('Tab arranca en «Volver» (la barra va primero en el DOM)'), real[0], 'Volver');
      t.ok(c('Tab recorre el orden visual'), JSON.stringify(real),
        JSON.stringify(visual.slice(0, real.length)));
      t.ok(c('Tab llega hasta «Guardar pregunta»'), (real[real.length - 1] || '').toLowerCase(), 'guardar pregunta');
      // W1: el contorno de foco de TODA parada (tema, enunciado, celdas, campos de opción,
      // «Quitar», «Agregar opción», explicación y «Guardar») sin recorte por overflow.
      const necesarias = [PH_ENUNCIADO, phOpcion('A'), quitar('A'), 'Agregar opción', PH_EXPLICACION]
        .filter((nom) => !real.some((v) => v.toLowerCase().includes(nom.toLowerCase())));
      t.ok(c('Tab pasa por enunciado, opciones, «Quitar», «Agregar opción» y explicación'),
        JSON.stringify(necesarias), '[]');
      t.ok(c('el contorno de ninguna parada de Tab lo recorta un overflow'), JSON.stringify(recortes), '[]');
      const rg = await pagina.evaluar(CONTORNO_RECORTADO);
      t.ok(c('el contorno de «Guardar pregunta» no lo recorta ningún overflow'), rg && JSON.stringify(rg.recortan), '[]');

      // Ninguna región queda fija al desplazar (sin sticky): al bajar, TODO sube lo mismo (W2:
      // cada control y cada texto, no solo tres; con un desplazamiento chico y con el máximo).
      // A 1920 × 1080 todo entra en la ventana (0,9): se baja el marco para que haya recorrido.
      await pagina.evaluar(EN_MARCO(`
        m.style.height = '480px';
        for (const n of d.querySelectorAll('*')) if (n.scrollTop) n.scrollTop = 0;
        return true;`));
      await pausa(200);
      const m0 = await pagina.evaluar(MEDIR_ESCRITORIO);
      t.ok(c('hay desplazamiento para medir sticky'), !!(m0.scroll && m0.scroll.alta && m0.scroll.max > 120), true);
      if (m0.scroll && m0.scroll.alta && m0.scroll.max > 120) {
        for (const bajar of [120, Math.min(400, m0.scroll.max)]) {
          await pagina.evaluar(EN_MARCO(`
            const n = visibles('[placeholder]')[0];
            for (let a = n.parentElement; a; a = a.parentElement) {
              const o = w.getComputedStyle(a).overflowY;
              if (o === 'auto' || o === 'scroll') { a.scrollTop = ${bajar}; break; }
            }
            return true;`));
          await pausa(120);
          const d2 = await pagina.evaluar(MEDIR_ESCRITORIO);
          const k = `desplazado ${bajar} px`;
          t.ok(c(`${k}, la barra interna está en su lugar`),
            !!d2.barra && !!m0.barra && Math.round(d2.barra.arriba) === Math.round(m0.barra.arriba), true);
          const mismo = m0.controles.length === d2.controles.length && m0.textos.length === d2.textos.length;
          t.ok(c(`${k}, los mismos controles y textos a la vista`), mismo, true);
          if (mismo) {
            // «Volver» es de la barra, que no se desplaza: se mide aparte (arriba).
            const fijos = m0.controles.map((n, i) => ({ n: n.nombre, d: Math.round(n.arriba - d2.controles[i].arriba) }))
              .filter((x) => x.n !== 'Volver')
              .concat(m0.textos.map((n, i) => ({ n: n.texto, d: Math.round(n.arriba - d2.textos[i].arriba) })))
              .filter((x) => x.d !== bajar).map((x) => `${x.n}:${x.d}`);
            t.ok(c(`${k}, todo el contenido sube ${bajar} px (sin sticky)`), JSON.stringify(fijos), '[]');
          }
        }
        await pagina.evaluar(EN_MARCO(`
          for (const n of d.querySelectorAll('*')) if (n.scrollTop) n.scrollTop = 0;
          return true;`));
      }
      await pagina.evaluar(EN_MARCO(`m.style.height = '${alto}px'; return true;`));
      await pausa(150);

      // Contorno de foco sin recorte: «Guardar pregunta» (donde acabó Tab), el disparador y una fila abierta.
      const l0 = await leerDesp(pagina);
      if (l0.disp && await enfocarConTabPorNombre(pagina, l0.disp.nombre)) {
        const r = await pagina.evaluar(CONTORNO_RECORTADO);
        t.ok(c('el contorno del disparador no lo recorta ningún overflow'), r && JSON.stringify(r.recortan), '[]');
        await pagina.tecla('Enter');
        await pausa(150);
        const ab = await leerDesp(pagina);
        t.ok(c('abierto, hay una lista'), ab.nListasEnDom, 1);
        if (esc) t.ok(c('abierto, la lámina tiene caja visible'), !!ab.lista, true);
        if (esc && ab.lista) {
          t.ok(c('abierto, la lámina mide el ancho del disparador y de la columna'),
            Math.abs(ab.lista.ancho_marco - ab.disp.ancho) < 1 && Math.abs(ab.disp.ancho - LECTURA) < 1, true);
          t.ok(c('abierto, la lámina entra completa en la ventana'),
            ab.lista.marco.abajo <= ab.alto + 0.5 && ab.disp.arriba >= 0, true);
          t.ok(c('abierto, sin scroll horizontal'), ab.desborda, false);
        }
        const rf = await pagina.evaluar(CONTORNO_RECORTADO);
        t.ok(c('el contorno de la fila enfocada no lo recorta ningún overflow'), rf && JSON.stringify(rf.recortan), '[]');
        await teclaSintetica(pagina, 'Escape');
      } else {
        t.ok(c('el disparador recibe el foco con Tab'), false, true);
      }
    }
  }
  await restaurarViewport(pagina);
  t.ok('a 1023 px la columna mide lo mismo que a 768 px',
    !!medidas[1023] && Math.abs(medidas[1023] - medidas[768]) < 1, true);
}

// `abrirAgregar` deja el override de ventana a >900 px: lo restaura siempre, también si la
// suite falla a la mitad.
// 6.10 T9: una lista de propias ilegible nunca se pierde. Antes de escribir sobre ella, `addUserQuestion`
// guarda una copia cruda bajo `pkapp_user_questions:<materia>:ilegible:<ts>`; si la copia falla, no escribe.
const CRUDOS_ILEGIBLES = ['{"a":1}', 'no-json{'];
const CLAVE_PROPIAS = 'pkapp_user_questions:bcyt';
const SEMBRAR_ILEGIBLE = (crudo) => EN_MARCO(`
  w.localStorage.setItem(${JSON.stringify(CLAVE_PROPIAS)}, ${JSON.stringify(crudo)});
  return true;
`);
const LEER_ILEGIBLE = EN_MARCO(`
  const copias = {};
  for (let i = 0; i < w.localStorage.length; i++) {
    const k = w.localStorage.key(i);
    if (k.startsWith(${JSON.stringify(CLAVE_PROPIAS + ':ilegible:')})) copias[k] = w.localStorage.getItem(k);
  }
  return { cruda: w.localStorage.getItem(${JSON.stringify(CLAVE_PROPIAS)}), copias };
`);
const LIMPIAR_ILEGIBLE = EN_MARCO(`
  const claves = [];
  for (let i = 0; i < w.localStorage.length; i++) {
    const k = w.localStorage.key(i);
    if (k.startsWith(${JSON.stringify(CLAVE_PROPIAS)})) claves.push(k);
  }
  claves.forEach((k) => w.localStorage.removeItem(k));
  return true;
`);
const COPIA_QUE_FALLA = EN_MARCO(`
  w.__setItemOriginal = w.Storage.prototype.setItem;
  w.Storage.prototype.setItem = function (clave) {
    if (String(clave).includes(':ilegible:')) throw new w.DOMException('lleno', 'QuotaExceededError');
    return w.__setItemOriginal.apply(this, arguments);
  };
  return true;
`);
const RESTAURAR_SETITEM = EN_MARCO(`
  if (w.__setItemOriginal) w.Storage.prototype.setItem = w.__setItemOriginal;
  return true;
`);

async function llenarYGuardar(pagina, enunciado) {
  await escribir(pagina, PH_ENUNCIADO, enunciado);
  await escribir(pagina, phOpcion('A'), 'Uno');
  await escribir(pagina, phOpcion('B'), 'Dos');
  await tocar(pagina, porNombre(pagina, celda('A')));
  pagina.dialogos.length = 0;
  await tocar(pagina, porTexto(pagina, 'Guardar pregunta'));
  return pagina.esperarA(() => pagina.dialogos.length > 0, { limite: 5000 });
}

async function listaIlegibleAlAgregar(pagina, base, t) {
  for (const crudo of CRUDOS_ILEGIBLES) {
    const c = (s) => `Agregar · lista ilegible ${crudo} · ${s}`;
    try {
      t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390 }), true);
      await pagina.evaluar(LIMPIAR_ILEGIBLE);
      await pagina.evaluar(SEMBRAR_ILEGIBLE(crudo));
      pagina.respuestaDialogo = 'cancelar';
      const enunciado = `Pregunta e2e ilegible ${Date.now()}`;
      await llenarYGuardar(pagina, enunciado);
      t.ok(c('aviso «¡Pregunta guardada!»'), pagina.dialogos[0], '¡Pregunta guardada!\n\n¿Querés agregar otra?');
      const leida = await pagina.evaluar(LEER_ILEGIBLE);
      const copias = Object.values(leida.copias);
      t.ok(c('hay una sola copia'), copias.length, 1);
      t.ok(c('la copia parsea al valor crudo'), copias.length === 1 && JSON.parse(copias[0]) === crudo, true);
      const lista = JSON.parse(leida.cruda || 'null');
      t.ok(c('la lista queda con solo la nueva'),
        Array.isArray(lista) && lista.length === 1 && lista[0].question === enunciado, true);
    } finally {
      pagina.respuestaDialogo = 'cancelar';
      await pagina.evaluar(LIMPIAR_ILEGIBLE);
    }
  }
}

async function listaIlegibleConCopiaQueFalla(pagina, base, t) {
  for (const crudo of CRUDOS_ILEGIBLES) {
    const c = (s) => `Agregar · lista ilegible ${crudo} · copia que falla · ${s}`;
    try {
      t.ok(c('llega a /agregar'), await abrirAgregar(pagina, base, { ancho: 390 }), true);
      await pagina.evaluar(LIMPIAR_ILEGIBLE);
      await pagina.evaluar(SEMBRAR_ILEGIBLE(crudo));
      await pagina.evaluar(COPIA_QUE_FALLA);
      await llenarYGuardar(pagina, `Pregunta e2e ilegible ${Date.now()}`);
      t.ok(c('rechaza con «No se pudo guardar la pregunta.»'),
        pagina.dialogos[0], 'Error\n\nNo se pudo guardar la pregunta.');
      const leida = await pagina.evaluar(LEER_ILEGIBLE);
      t.ok(c('la lista cruda queda igual'), leida.cruda, crudo);
      t.ok(c('no hay copia'), Object.keys(leida.copias).length, 0);
    } finally {
      await pagina.evaluar(RESTAURAR_SETITEM);
      await pagina.evaluar(LIMPIAR_ILEGIBLE);
    }
  }
}

const conViewportRestaurado = (correr) => async (pagina, base, t) => {
  try {
    await correr(pagina, base, t);
  } finally {
    await restaurarViewport(pagina);
  }
};

module.exports = [
  { nombre: 'Agregar: rótulos, ayuda y campos en claro', correr: (p, b, t) => rotulosYAyuda(p, b, t, 'claro') },
  { nombre: 'Agregar: rótulos, ayuda y campos en oscuro', correr: (p, b, t) => rotulosYAyuda(p, b, t, 'oscuro') },
  { nombre: 'Agregar: tema cerrado en claro (una fila)', correr: (p, b, t) => desplegableCerrado(p, b, t, 'claro') },
  { nombre: 'Agregar: tema cerrado en oscuro (una fila)', correr: (p, b, t) => desplegableCerrado(p, b, t, 'oscuro') },
  { nombre: 'Agregar: tema, abrir y elegir en claro', correr: (p, b, t) => desplegableAbrirYElegir(p, b, t, 'claro') },
  { nombre: 'Agregar: tema, abrir y elegir en oscuro', correr: (p, b, t) => desplegableAbrirYElegir(p, b, t, 'oscuro') },
  { nombre: 'Agregar: tema, teclado y letras', correr: desplegableTeclado },
  { nombre: 'Agregar: tema a 320 × 568, objetivos y ventana', correr: desplegableA320 },
  { nombre: 'Agregar: tema a 390 × 300, foco dentro de la ventana', correr: desplegableVentanaBaja },
  { nombre: 'Agregar: tema, estados y foco sin recorte en claro', correr: (p, b, t) => desplegableEstados(p, b, t, 'claro') },
  { nombre: 'Agregar: tema, estados y foco sin recorte en oscuro', correr: (p, b, t) => desplegableEstados(p, b, t, 'oscuro') },
  { nombre: 'Agregar: tema, guardando y «Agregar otra»', correr: desplegableGuardar },
  { nombre: 'Agregar: tema a 320, 390 y 1280, cerrado y abierto, claro y oscuro', correr: conViewportRestaurado(desplegableAnchos) },
  { nombre: 'Agregar: celdas, quitar, agregar y guardar en claro', correr: (p, b, t) => estructuraDeOpciones(p, b, t, 'claro') },
  { nombre: 'Agregar: celdas, quitar, agregar y guardar en oscuro', correr: (p, b, t) => estructuraDeOpciones(p, b, t, 'oscuro') },
  { nombre: 'Agregar: los campos crecen con el contenido a 320', correr: camposCrecen },
  { nombre: 'Agregar: con 6 opciones, 24 px al grupo siguiente', correr: seisOpciones },
  { nombre: 'Agregar: estados K de los controles', correr: estadosK },
  { nombre: 'Agregar: el hover de los campos solo con puntero', correr: hoverSoloConPuntero },
  { nombre: 'Agregar: quitar una opción anterior a la marcada', correr: quitarAnteriorAMarcada },
  { nombre: 'Agregar: nombres de tema largos a 320 en las cinco materias', correr: temasLargosA320 },
  { nombre: 'Agregar: validación de campos vacíos, en orden', correr: validaciones },
  { nombre: 'Agregar: guardado, «Agregar otra» y aparición en «Mis preguntas»', correr: guardarYVerEnMisPreguntas },
  { nombre: 'Agregar: lista ilegible, copia previa y lista con solo la nueva (T9)', correr: listaIlegibleAlAgregar },
  { nombre: 'Agregar: lista ilegible con copia que falla, no se escribe (T9)', correr: listaIlegibleConCopiaQueFalla },
  { nombre: 'Agregar: sin desborde y 44 × 44 a 320, 360, 390, 768 y 1280 en claro y oscuro', correr: conViewportRestaurado(anchos) },
  { nombre: 'Agregar: escritorio, columna `lectura` a 1024, 1366 y 1920 en claro y oscuro', correr: escritorio },
];

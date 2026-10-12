// Suite «temas» del arnés end-to-end (ver ../README.md).

const { DESBORDES, EN_MARCO, LADO_TACTIL, MEDIR_PANTALLA, PASO, abrirMarco, clicEnMarco, esperarEnMarco, irAHomeEnMarco, medirAmbasPantallas } = require('./comunes');

const fs = require('fs');
const path = require('path');

const SEPARACION_MINIMA = 2 * PASO;   // paso 2 entre controles adyacentes

const LEER_OPCIONES = EN_MARCO(`
  const grupo = visibles('[role="radiogroup"][aria-label="Modo oscuro"]')[0];
  if (!grupo) return [];
  return Array.from(grupo.querySelectorAll('[role="radio"]')).map((n) => {
    const r = n.getBoundingClientRect();
    return { nombre: n.textContent.trim(), marcada: n.getAttribute('aria-checked'),
      ancho: r.width, alto: r.height };
  });
`);

const ESTA_OSCURO = EN_MARCO(`return d.documentElement.classList.contains('dark');`);

async function controlDeTema(pagina, base, t) {
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390), true);

  const opciones = await pagina.evaluar(LEER_OPCIONES);
  t.ok('el control «Modo oscuro» expone dos opciones', opciones.length, 2);
  t.ok('las opciones son Claro y Oscuro, en ese orden',
    opciones.map((o) => o.nombre.toLowerCase()).join('|'), 'claro|oscuro');
  t.ok('Claro llega marcada (aria-checked) y Oscuro no',
    opciones.map((o) => o.marcada).join('|'), 'true|false');
  t.ok('cada opción mide 44 × 44 como mínimo',
    opciones.length === 2 && opciones.every((o) => o.ancho >= LADO_TACTIL && o.alto >= LADO_TACTIL), true);
  t.ok('el tema arranca claro', await pagina.evaluar(ESTA_OSCURO), false);

  await clicEnMarco(pagina, 'oscuro');
  t.ok('elegir Oscuro aplica el tema',
    await pagina.esperarA(() => pagina.evaluar(ESTA_OSCURO)), true);
  t.ok('Oscuro pasa a estar marcada',
    (await pagina.evaluar(LEER_OPCIONES)).map((o) => o.marcada).join('|'), 'false|true');

  await pagina.evaluar(EN_MARCO('w.location.reload();'));
  await pagina.esperarA(async () => {
    try { return (await pagina.evaluar(LEER_OPCIONES)).some((o) => o.marcada === 'true'); }
    catch { return false; }
  });
  await esperarEnMarco(pagina, 'Tus materias');
  t.ok('el tema oscuro persiste tras recargar',
    await pagina.esperarA(() => pagina.evaluar(ESTA_OSCURO)), true);
  t.ok('tras recargar Oscuro sigue marcada',
    (await pagina.evaluar(LEER_OPCIONES)).map((o) => o.marcada).join('|'), 'false|true');

  // Estado único: Home lee el mismo tema, no uno propio.
  t.ok('elegir la materia lleva a /inicio', await irAHomeEnMarco(pagina), true);
  await pagina.esperarA(async () => (await pagina.evaluar(LEER_OPCIONES)).length === 2);
  t.ok('Home muestra Oscuro marcada',
    (await pagina.evaluar(LEER_OPCIONES)).map((o) => o.marcada).join('|'), 'false|true');

  // Gesto único hacia atrás y dejar el perfil como estaba para las otras suites.
  await clicEnMarco(pagina, 'claro');
  t.ok('elegir Claro quita el tema oscuro',
    await pagina.esperarA(async () => !await pagina.evaluar(ESTA_OSCURO)), true);
  const guardado = await pagina.evaluar(
    `JSON.parse(localStorage.getItem('pkapp_settings') || '{}').tema`);
  t.ok('Claro queda persistida', guardado, 'claro');
}

async function sinScrollHorizontalYCorteDe360(pagina, base, t) {
  for (const ancho of [320, 360, 390]) {
    const { materia, home } = await medirAmbasPantallas(pagina, base, ancho);
    for (const [nombre, p] of [['MateriaSelect', materia], ['Home', home]]) {
      t.ok(`${ancho} px: ${nombre} sin scroll horizontal`, p.desborda, false);
      t.ok(`${ancho} px: ${nombre}: el control de tema entra en la ventana`,
        !!p.grupo && p.grupo.der <= p.vista && p.grupo.izq >= 0, true);
    }
    const v = home.volver;
    t.ok(`${ancho} px: Home tiene «Cambiar materia»`, !!v, true);
    if (!v) continue;
    t.ok(`${ancho} px: «Cambiar materia» mide 44 de alto como mínimo`, v.alto >= LADO_TACTIL, true);
    t.ok(`${ancho} px: paso 2 como mínimo entre «Cambiar materia» y el control de tema`,
      !!home.grupo && home.grupo.izq - v.der >= SEPARACION_MINIMA, true);
    if (ancho < 360) {
      t.ok(`${ancho} px: bajo 360 solo queda el glifo, sin texto`, home.volverTexto, '');
      t.ok(`${ancho} px: el botón del glifo es un cuadrado de 44 × 44`,
        v.ancho === LADO_TACTIL && v.alto === LADO_TACTIL, true);
    } else {
      t.ok(`${ancho} px: desde 360 el botón lleva su texto`,
        home.volverTexto.toLowerCase().includes('cambiar materia'), true);
    }
  }
}

// ---------------------------------------------------------------------------
// Barra interna del Stack (rediseño Plancha, tarea 3.1b; comun.md §3).
//
// Mismo marco que las suites de HeaderMarca. La barra se ubica por `testID`
// (`data-testid` en web): `barra-interna`, `barra-titulo` y `barra-volver`.

const FOCO_EN_MARCO = EN_MARCO(`
  const a = d.activeElement;
  return a ? (a.getAttribute('role') || a.tagName.toLowerCase()) + ':' + a.textContent.trim().toLowerCase() : null;
`);

const AJUSTES_TEMA = `JSON.parse(localStorage.getItem('pkapp_settings') || '{}').tema`;

// Suma de desplazamientos de la página y de todo contenedor con scroll.
const DESPLAZAMIENTO = EN_MARCO(`
  return w.scrollY + Array.from(d.querySelectorAll('*')).reduce((s, n) => s + n.scrollTop, 0);
`);

const HAY_DONDE_SCROLLEAR = EN_MARCO(`
  return Array.from(d.querySelectorAll('*')).some((n) =>
    n.scrollHeight > n.clientHeight + 1 && /auto|scroll/.test(w.getComputedStyle(n).overflowY));
`);

// Saca el foco del documento del marco: el próximo Tab arranca desde el principio.
const SOLTAR_FOCO = EN_MARCO(`
  m.contentWindow.focus();
  if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
`);

const marcadas = async (pagina) =>
  (await pagina.evaluar(LEER_OPCIONES)).map((o) => o.marcada).join('|');

async function tecladoDelControlDeTema(pagina, base, t) {
  // Alto bajo para que la pantalla tenga scroll y Espacio pueda desplazarla.
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390, 400), true);
  t.ok('la pantalla tiene scroll (precondición del chequeo de Espacio)',
    await pagina.evaluar(HAY_DONDE_SCROLLEAR), true);

  // Dos paradas de Tab, en orden: Claro y después Oscuro.
  await pagina.evaluar(SOLTAR_FOCO);
  let foco = null;
  for (let i = 0; i < 8 && foco !== 'radio:claro'; i++) {
    await pagina.tecla('Tab');
    foco = await pagina.evaluar(FOCO_EN_MARCO);
  }
  t.ok('Tab llega a la opción Claro', foco, 'radio:claro');
  await pagina.tecla('Tab');
  t.ok('el siguiente Tab llega a Oscuro (dos paradas de Tab)',
    await pagina.evaluar(FOCO_EN_MARCO), 'radio:oscuro');
  await pagina.tecla('Tab', { shift: true });
  t.ok('Mayús+Tab vuelve a Claro', await pagina.evaluar(FOCO_EN_MARCO), 'radio:claro');
  await pagina.tecla('Tab');

  // Espacio selecciona la opción con foco y no desplaza la página.
  const antes = await pagina.evaluar(DESPLAZAMIENTO);
  await pagina.tecla(' ');
  t.ok('Espacio sobre Oscuro aplica el tema (html.dark)',
    await pagina.esperarA(() => pagina.evaluar(ESTA_OSCURO), { limite: 3000 }), true);
  t.ok('Espacio sobre Oscuro lo persiste (pkapp_settings)',
    await pagina.evaluar(AJUSTES_TEMA), 'oscuro');
  t.ok('Oscuro queda marcada tras Espacio', await marcadas(pagina), 'false|true');
  t.ok('Espacio no desplaza la página', await pagina.evaluar(DESPLAZAMIENTO), antes);
  await pagina.tecla(' ');
  t.ok('Espacio sobre la ya seleccionada tampoco desplaza',
    await pagina.evaluar(DESPLAZAMIENTO), antes);

  // Flechas (patrón APG radiogroup): mover = mover el foco y seleccionar, con vuelta.
  const pasos = [
    ['ArrowLeft', 'radio:claro', 'true|false', false],
    ['ArrowRight', 'radio:oscuro', 'false|true', true],
    ['ArrowRight', 'radio:claro', 'true|false', false],
    ['ArrowLeft', 'radio:oscuro', 'false|true', true],
    ['ArrowUp', 'radio:claro', 'true|false', false],
    ['ArrowDown', 'radio:oscuro', 'false|true', true],
  ];
  for (const [tecla, focoEsperado, marcado, oscuro] of pasos) {
    await pagina.tecla(tecla);
    t.ok(`${tecla}: el foco pasa a ${focoEsperado}`,
      await pagina.esperarA(async () => await pagina.evaluar(FOCO_EN_MARCO) === focoEsperado, { limite: 2000 }), true);
    t.ok(`${tecla}: queda marcada ${marcado}`, await marcadas(pagina), marcado);
    t.ok(`${tecla}: el tema es ${oscuro ? 'oscuro' : 'claro'}`, await pagina.evaluar(ESTA_OSCURO), oscuro);
  }
  t.ok('las flechas no desplazan la página', await pagina.evaluar(DESPLAZAMIENTO), antes);

  // Enter sobre la opción no seleccionada la selecciona.
  await pagina.tecla('ArrowLeft');            // Claro seleccionada y con foco
  await pagina.tecla('Tab');                  // foco en Oscuro, sin seleccionar
  t.ok('Tab sin seleccionar: Oscuro con foco y Claro marcada',
    (await pagina.evaluar(FOCO_EN_MARCO)) === 'radio:oscuro' && await marcadas(pagina) === 'true|false', true);
  await pagina.tecla('Enter');
  t.ok('Enter sobre Oscuro la selecciona',
    await pagina.esperarA(async () => await marcadas(pagina) === 'false|true', { limite: 2000 }), true);

  // Con Alt, Ctrl o Meta el manejador no actúa: no pisa «atrás» del navegador.
  // Evento sintético a propósito: con teclas reales Chrome ejecuta su acelerador
  // (Alt+→ es «adelante») y congela el headless. `dispatchEvent` devuelve false si
  // alguien canceló el evento.
  const TECLA_CON_MODIFICADOR = (modificador) => EN_MARCO(`
    const ev = new w.KeyboardEvent('keydown',
      { key: 'ArrowRight', code: 'ArrowRight', bubbles: true, cancelable: true, ${modificador}: true });
    return d.activeElement.dispatchEvent(ev) === false;
  `);
  const focoAntes = await pagina.evaluar(FOCO_EN_MARCO);
  const marcadasAntes = await marcadas(pagina);
  for (const [nombre, modificador] of [['Alt', 'altKey'], ['Ctrl', 'ctrlKey'], ['Meta', 'metaKey']]) {
    const cancelado = await pagina.evaluar(TECLA_CON_MODIFICADOR(modificador));
    t.ok(`${nombre}+→ no cancela el evento (defaultPrevented)`, cancelado, false);
    t.ok(`${nombre}+→ no cambia el tema`, await marcadas(pagina), marcadasAntes);
    t.ok(`${nombre}+→ no mueve el foco`, await pagina.evaluar(FOCO_EN_MARCO), focoAntes);
  }

  // Deja el perfil como estaba para las otras suites.
  await pagina.tecla('ArrowLeft');
  t.ok('vuelve a Claro', await pagina.evaluar(AJUSTES_TEMA), 'claro');
}

// Control negativo de DESBORDES: un hijo de 900 px dentro del ScrollView tiene que
// detectarse, y la medición vieja (scrollWidth del documento) no lo ve.
async function controlNegativoDeDesborde(pagina, base, t) {
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390), true);
  await pagina.esperarA(async () => (await pagina.evaluar(MEDIR_PANTALLA)).header !== null);
  const limpio = await pagina.evaluar(EN_MARCO('return desbordes().length;'));
  t.ok('sin intruso: el helper no detecta desborde', limpio, 0);

  const inyectado = await pagina.evaluar(EN_MARCO(`
    const sv = Array.from(d.querySelectorAll('*')).find((n) =>
      n.scrollHeight > n.clientHeight + 1 && /auto|scroll/.test(w.getComputedStyle(n).overflowY));
    if (!sv) return false;
    const intruso = d.createElement('div');
    intruso.setAttribute('data-intruso-e2e', '');
    intruso.style.cssText = 'width:900px;height:10px';
    sv.appendChild(intruso);
    return true;
  `));
  t.ok('inyectó un hijo de 900 px dentro del ScrollView', inyectado, true);
  const conIntruso = await pagina.evaluar(EN_MARCO(`
    return { n: desbordes().length,
      documento: Math.max(d.documentElement.scrollWidth, d.body.scrollWidth) > w.innerWidth };
  `));
  t.ok('con el intruso: el helper detecta el desborde', conIntruso.n > 0, true);
  t.ok('con el intruso: la medición vieja del documento no lo veía', conIntruso.documento, false);

  await pagina.evaluar(EN_MARCO(`
    d.querySelectorAll('[data-intruso-e2e]').forEach((n) => n.remove());
  `));
  t.ok('sin el intruso otra vez: el helper vuelve a dar limpio',
    await pagina.evaluar(EN_MARCO('return desbordes().length;')), 0);
}

// El hover lo da webStyles.js (CD-3, comun.md §5.1): sin halo ni box-shadow con rgba
// inyectado por scripts/inject-pwa.js. Se mira el texto de cada <style>; las reglas
// que RNW inserta por CSSOM (sombras de otros componentes) no son de esta aserción.
async function hoverSinHalo(pagina, base, t) {
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 1280), true);
  t.ok('elegir la materia lleva a /inicio', await irAHomeEnMarco(pagina), true);
  await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_PANTALLA)).volver);
  const caja = (await pagina.evaluar(MEDIR_PANTALLA)).volver;
  t.ok('Home tiene «Cambiar materia» visible', !!caja, true);
  if (!caja) return;

  await pagina.moverA(Math.round((caja.izq + caja.der) / 2), Math.round((caja.arriba + caja.abajo) / 2));
  await pagina.esperarA(() => pagina.evaluar(EN_MARCO(`
    const n = visibles('[role="button"]').find((x) => x.matches(':hover'));
    return !!n;
  `)), { limite: 2000 });
  const hover = await pagina.evaluar(EN_MARCO(`
    const n = visibles('[role="button"]').find((x) => x.matches(':hover'));
    return n ? { sombra: w.getComputedStyle(n).boxShadow, texto: n.innerText.trim() } : null;
  `));
  t.ok('el puntero queda sobre un botón (hover real)', !!hover, true);
  t.ok('en hover, «Cambiar materia» no tiene box-shadow',
    hover && hover.sombra, 'none');

  const estilos = await pagina.evaluar(EN_MARCO(`
    return Array.from(d.querySelectorAll('style'))
      .filter((s) => /box-shadow/.test(s.textContent) && /rgba/.test(s.textContent)).length;
  `));
  t.ok('ningún <style> del documento tiene box-shadow con rgba', estilos, 0);
}

// ---------------------------------------------------------------------------
// TopicSelect (rediseño Plancha, tarea 3.4; TopicSelect.md y Vacios.md V2, V4, V5, V9, V11).
//
// Misma técnica que las suites de arriba: la app corre en un iframe de ancho fijo y se
// mide su DOM. Los modos se alcanzan desde Home, como el usuario: «Entrena Temas/Parciales»
// (practice), «Modo examen» (exam) y «Repasar fallos» (failed). Un perfil nuevo no tiene
// fallos: failed muestra V2. «Solo generadas» deja cero preguntas en las seis materias
// (conteos.js, GENERADAS): ese filtro lleva a V4.

const { MATERIA } = require('./comunes');
const { plancha } = require('../../../src/theme/colores');

const ENTRADA_DE_MODO = { practice: 'entrena temas', exam: 'modo examen', failed: 'repasar fallos' };
const SEÑAL_DE_MODO = {
  practice: 'todos los temas mezclados',
  exam: 'comenzar examen',
  failed: 'sin preguntas falladas',
};
const MATERIA_SIN_PARCIALES = 'Reproductor y Desarrollo';
const MARGEN_LATERAL_TEMAS = 5 * PASO;   // paso 5
const COLUMNA = 448;                       // max-w-columna (tokens.md c.3)

const MEDIR_TEMAS = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const grupo = (nombre) => visibles('[role="radiogroup"]')
    .find((g) => (g.getAttribute('aria-label') || '').toLowerCase() === nombre);
  const opciones = (nombre) => {
    const g = grupo(nombre);
    if (!g) return null;
    return Array.from(g.querySelectorAll('[role="radio"]')).map((n) => {
      const e = w.getComputedStyle(n.firstElementChild || n);
      const hoja = Array.from(n.querySelectorAll('*')).find((x) => x.children.length === 0 && x.textContent.trim());
      return { texto: n.innerText.trim(), marcada: n.getAttribute('aria-checked'),
        fondo: e.backgroundColor, borde: e.borderTopColor,
        color: w.getComputedStyle(hoja || n).color, caja: caja(n) };
    });
  };
  const porNombre = (nombre) => visibles('[aria-label]')
    .find((n) => n.getAttribute('aria-label').toLowerCase() === nombre);
  const paso = (nombre) => {
    const n = porNombre(nombre);
    return n ? { caja: caja(n), deshabilitado: n.getAttribute('aria-disabled') === 'true' } : null;
  };
  // Celda del grupo Temporizador: el ancestro más cercano de los cuadrados que también tiene el rótulo.
  const celdaTemporizador = () => {
    const menos = porNombre('reducir tiempo'), mas = porNombre('aumentar tiempo');
    if (!menos || !mas) return null;
    for (let a = menos.parentElement; a; a = a.parentElement) {
      if (a.contains(mas) && a.innerText.toLowerCase().includes('temporizador')) return a;
    }
    return null;
  };
  const lineas = (n) => n.innerText.split('\\n').map((x) => x.trim()).filter(Boolean);
  const botones = visibles('[tabindex]');
  const mezcla = botones.find((n) => n.innerText.toLowerCase().includes('todos los temas mezclados'));
  const filas = botones.filter((n) => n !== mezcla && /\\d+ preguntas$/.test(n.innerText.trim()) && n.querySelector('svg'))
    .map((n) => {
      const hojas = Array.from(n.querySelectorAll('*')).filter((x) => x.children.length === 0 && x.textContent.trim());
      const l = lineas(n);
      const nombre = hojas.find((x) => x.textContent.trim() === l[1]);
      const e = nombre ? w.getComputedStyle(nombre) : null;
      return { lineas: l, caja: caja(n), svg: n.querySelectorAll('svg').length,
        filete: w.getComputedStyle(n.firstElementChild || n).borderBottomWidth,
        nombreFamilia: e ? e.fontFamily : null, nombreTamano: e ? e.fontSize : null };
    });
  const valor = visibles('*').find((n) => n.children.length === 0 && /^(sin límite|\\d+ min)$/i.test(n.textContent.trim()));
  const comenzar = botones.find((n) => n.innerText.toLowerCase().includes('comenzar examen'));
  const practicar = botones.find((n) => n.innerText.trim().toLowerCase() === 'practicar');
  const panel = grupo('fuente') ? grupo('fuente').parentElement.parentElement : null;
  return {
    vista: w.innerWidth,
    ruta: w.location.pathname,
    desborda: desbordes().length > 0,
    texto: d.body.innerText,
    fuente: opciones('fuente'),
    parcial: opciones('parcial'),
    menos: paso('reducir tiempo'),
    mas: paso('aumentar tiempo'),
    valor: valor ? valor.textContent.trim() : null,
    valorCaja: caja(valor),
    lamina: caja(visibles('[data-testid="lamina-vacia"]')[0]),
    barra: caja(visibles('[data-testid="barra-interna"]')[0]),
    barraVolver: caja(visibles('[data-testid="barra-volver"]')[0]),
    barraTitulo: caja(visibles('[data-testid="barra-titulo"]')[0]),
    // Desplazamiento de la página y de todo contenedor con scroll: suma a arriba para tener coordenadas de página.
    scroll: w.scrollY + Array.from(d.querySelectorAll('*')).reduce((s, n) => s + n.scrollTop, 0),
    panel: caja(panel),
    grupoFuente: caja(grupo('fuente')),
    grupoParcial: caja(grupo('parcial')),
    celdaFuente: caja(grupo('fuente') && grupo('fuente').parentElement),
    celdaParcial: caja(grupo('parcial') && grupo('parcial').parentElement),
    celdaTemporizador: caja(celdaTemporizador()),
    divisoresVerticales: visibles('[data-testid="panel-divisor-vertical"]').map((n) => caja(n)),
    laminaExamen: caja(visibles('[data-testid="lamina-examen"]')[0]),
    mezcla: mezcla ? { lineas: lineas(mezcla), caja: caja(mezcla), svg: mezcla.querySelectorAll('svg').length,
      borde: w.getComputedStyle(mezcla.firstElementChild || mezcla).borderTopWidth } : null,
    filas,
    marcas: visibles('[data-testid="marca-esquina"]').length,
    comenzar: comenzar ? caja(comenzar) : null,
    practicar: practicar ? caja(practicar) : null,
    interactivos: botones.map((n) => caja(n)),
  };
`);

// Un perfil limpio de estadísticas y de preguntas propias: lo que dejaron las suites
// anteriores en el mismo Chrome (fallos de un quiz) cambiaría V2 y las listas.
const LIMPIAR_DATOS = `Object.keys(localStorage)
  .filter((k) => /^pkapp_(question_stats|user_questions)/.test(k))
  .forEach((k) => localStorage.removeItem(k))`;

async function abrirTemas(pagina, base, { ancho = 390, alto = 900, modo = 'practice', oscuro = false, materia = MATERIA } = {}) {
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await pagina.evaluar(LIMPIAR_DATOS);
  // La ventana de la página mide 900: un marco más ancho queda fuera de ella y sus clics no llegan.
  await pagina.enviar('Emulation.setDeviceMetricsOverride',
    { width: Math.max(ancho, 900), height: 1400, deviceScaleFactor: 1, mobile: false });
  if (!await abrirMarco(pagina, base, ancho, alto)) return false;
  if (oscuro) {
    await clicEnMarco(pagina, 'oscuro');
    if (!await pagina.esperarA(() => pagina.evaluar(ESTA_OSCURO))) return false;
  }
  await clicEnMarco(pagina, materia);
  if (!await pagina.esperarA(async () =>
    await pagina.evaluar(EN_MARCO('return w.location.pathname;')) === '/inicio')) return false;
  await esperarEnMarco(pagina, 'repasar fallos');
  await clicEnMarco(pagina, ENTRADA_DE_MODO[modo]);
  if (!await pagina.esperarA(async () =>
    await pagina.evaluar(EN_MARCO('return w.location.pathname;')) === `/temas/${modo}`)) return false;
  return esperarEnMarco(pagina, SEÑAL_DE_MODO[modo]);
}

const medirTemas = (pagina) => pagina.evaluar(MEDIR_TEMAS);

// Los cuadrados de paso no tienen texto: se ubican por su nombre accesible.
async function clicPorNombre(pagina, nombre) {
  const punto = await pagina.evaluar(EN_MARCO(`
    const n = visibles('[aria-label]').find((x) => x.getAttribute('aria-label').toLowerCase() === ${JSON.stringify(nombre)});
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  `));
  if (!punto) return false;
  await pagina.clicEn(punto.x, punto.y);
  return true;
}
const EMOJI = /\p{Extended_Pictographic}/u;
const numeroDe = (linea) => Number(String(linea).split(' ')[0]);
const conteoDeMezcla = (m) => (m.mezcla ? numeroDe(m.mezcla.lineas[m.mezcla.lineas.length - 1]) : NaN);
const sumaDeFilas = (m) => m.filas.reduce((suma, f) => suma + numeroDe(f.lineas[2]), 0);

async function filtrosYSeparacion(pagina, base, t) {
  t.ok('practice: abrió Elegir tema', await abrirTemas(pagina, base, { ancho: 390 }), true);
  const m = await medirTemas(pagina);
  const rotulos = m.texto.toLowerCase();

  t.ok('rótulos de grupo sin dos puntos (TOPIC-P3)',
    ['fuente', 'parcial', 'temporizador'].every((r) => rotulos.includes(r) && !rotulos.includes(r + ':')), true);
  t.ok('«O elegí un tema específico:» se conserva', rotulos.includes('o elegí un tema específico:'), true);
  t.ok('fuente: Todas, Solo preguntas reales y Solo generadas, en ese orden',
    m.fuente && m.fuente.map((o) => o.texto).join('|'), 'Todas|Solo preguntas reales|Solo generadas');
  t.ok('fuente: «Todas» llega marcada', m.fuente && m.fuente.map((o) => o.marcada).join('|'), 'true|false|false');
  t.ok('parcial: la materia con parciales muestra el grupo, «Examen» primero y marcado',
    !!m.parcial && m.parcial[0].texto === 'Examen' && m.parcial[0].marcada === 'true', true);
  t.ok('temporizador: arranca en «Sin límite»', m.valor, 'Sin límite');
  t.ok('sin emojis en la pantalla', EMOJI.test(m.texto), false);

  // TOPIC-P1: cada filtro es un objetivo propio, separado por paso 2 en horizontal y vertical.
  for (const [nombre, ops] of [['fuente', m.fuente], ['parcial', m.parcial]]) {
    if (!ops) continue;
    let separados = true;
    for (let i = 1; i < ops.length; i++) {
      const a = ops[i - 1].caja, b = ops[i].caja;
      const mismaFila = Math.abs(a.arriba - b.arriba) < 1;
      const hueco = mismaFila ? b.izq - a.der : b.arriba - a.abajo;
      if (hueco < SEPARACION_MINIMA - 0.5) separados = false;
    }
    t.ok(`${nombre}: los filtros quedan a paso 2 como mínimo entre sí (TOPIC-P1)`, separados, true);
    t.ok(`${nombre}: cada filtro mide 44 de alto y 44 de ancho como mínimo`,
      ops.every((o) => o.caja.alto >= LADO_TACTIL && o.caja.ancho >= LADO_TACTIL), true);
  }
  t.ok('el grupo Parcial va debajo del grupo Fuente',
    !!m.grupoParcial && m.grupoParcial.arriba > m.grupoFuente.abajo, true);

  // Panel: marco `linea` y margen lateral paso 5 a 390.
  t.ok('el panel de filtros respeta el margen lateral paso 5',
    !!m.panel && Math.abs(m.panel.izq - MARGEN_LATERAL_TEMAS) < 1 && Math.abs(m.vista - m.panel.der - MARGEN_LATERAL_TEMAS) < 1, true);

  // Temporizador: K5 de 44 × 44; el extremo en «Sin límite» está apagado.
  t.ok('cuadrado menos y más de 44 × 44',
    !!m.menos && !!m.mas && [m.menos, m.mas].every((p) => p.caja.ancho === LADO_TACTIL && p.caja.alto === LADO_TACTIL), true);
  t.ok('en «Sin límite» el cuadrado menos está deshabilitado y el más no',
    !!m.menos && !!m.mas && m.menos.deshabilitado === true && m.mas.deshabilitado === false, true);
  // a.3: separación `paso 4` entre cuadrado, valor y cuadrado (el valor mide su caja, no el texto).
  const SEPARACION_TEMPORIZADOR = 4 * PASO;
  t.ok('paso 4 entre el cuadrado menos y el valor',
    !!m.menos && !!m.valorCaja && Math.abs(m.valorCaja.izq - m.menos.caja.der - SEPARACION_TEMPORIZADOR) < 0.5, true);
  t.ok('paso 4 entre el valor y el cuadrado más',
    !!m.mas && !!m.valorCaja && Math.abs(m.mas.caja.izq - m.valorCaja.der - SEPARACION_TEMPORIZADOR) < 0.5, true);

  // El temporizador avanza de a 10 y llega al máximo sin salirse de la lista.
  await clicPorNombre(pagina, 'aumentar tiempo');
  t.ok('«Aumentar tiempo» lleva a 10 min',
    await pagina.esperarA(async () => (await medirTemas(pagina)).valor === '10 min'), true);
  t.ok('con 10 min el cuadrado menos queda habilitado',
    (await medirTemas(pagina)).menos?.deshabilitado, false);
  await clicPorNombre(pagina, 'reducir tiempo');
  t.ok('«Reducir tiempo» vuelve a «Sin límite»',
    await pagina.esperarA(async () => (await medirTemas(pagina)).valor === 'Sin límite'), true);

  // El conteo de la mezcla sigue a los filtros: es la suma de las filas, y un parcial lo baja.
  await clicEnMarco(pagina, 'solo preguntas reales');
  t.ok('«Solo preguntas reales» queda marcado',
    await pagina.esperarA(async () => ((await medirTemas(pagina)).fuente || []).map((o) => o.marcada).join('|') === 'false|true|false'), true);
  const reales = await medirTemas(pagina);
  t.ok('con «Solo preguntas reales» el conteo de la mezcla es la suma de las filas',
    conteoDeMezcla(reales) > 0 && conteoDeMezcla(reales) === sumaDeFilas(reales), true);
  if (m.parcial && m.parcial.length > 1) {
    await clicEnMarco(pagina, m.parcial[1].texto);
    await pagina.esperarA(async () => ((await medirTemas(pagina)).parcial || []).map((o) => o.marcada).join('|').startsWith('false|true'));
    const conParcial = await medirTemas(pagina);
    t.ok('con un parcial elegido la mezcla baja y sigue siendo la suma de las filas',
      conteoDeMezcla(conParcial) > 0 && conteoDeMezcla(conParcial) < conteoDeMezcla(reales)
        && conteoDeMezcla(conParcial) === sumaDeFilas(conParcial), true);
  }
}

async function mezclaYFilas(pagina, base, t) {
  t.ok('practice: abrió Elegir tema', await abrirTemas(pagina, base, { ancho: 390 }), true);
  const m = await medirTemas(pagina);
  const z = m.mezcla;

  t.ok('hay tarjeta de mezcla', !!z, true);
  if (!z) return;
  t.ok('la mezcla lleva el rótulo «Mezcla» sobre el título (TOPIC-P2)',
    z.lineas.map((l) => l.toLowerCase()).join('|').startsWith('mezcla|todos los temas mezclados'), true);
  t.ok('la mezcla muestra «{n} preguntas» como conteo', /^\d+ preguntas$/.test(z.lineas[z.lineas.length - 1]), true);
  t.ok('la mezcla lleva el glifo aleatorio (un svg) y ningún emoji', z.svg === 1 && !EMOJI.test(z.lineas.join(' ')), true);
  t.ok('la mezcla es K6 de acento: borde de 2 px', z.borde, '2px');
  t.ok('la mezcla respeta el margen lateral paso 5',
    Math.abs(z.caja.izq - MARGEN_LATERAL_TEMAS) < 1 && Math.abs(m.vista - z.caja.der - MARGEN_LATERAL_TEMAS) < 1, true);
  t.ok('la mezcla mide 44 de alto como mínimo', z.caja.alto >= LADO_TACTIL, true);

  t.ok('hay al menos un tema en la lista', m.filas.length > 0, true);
  t.ok('cada fila: índice de dos dígitos, nombre y «{n} preguntas» (TOPIC-P4)',
    m.filas.every((f) => f.lineas.length === 3 && /^\d{2}$/.test(f.lineas[0]) && /^\d+ preguntas$/.test(f.lineas[2])), true);
  t.ok('los índices van correlativos desde 01',
    m.filas.map((f) => f.lineas[0]).join('|'), m.filas.map((_, i) => String(i + 1).padStart(2, '0')).join('|'));
  t.ok('el nombre de cada tema va en `item` semibold de 16 px (b: Nombre de tema)',
    m.filas.every((f) => /PlexSans-SemiBold/.test(f.nombreFamilia) && f.nombreTamano === '16px'), true);
  t.ok('cada fila lleva chevron (svg)', m.filas.every((f) => f.svg >= 1), true);
  t.ok('cada fila mide 44 de alto como mínimo', m.filas.every((f) => f.caja.alto >= LADO_TACTIL), true);
  t.ok('cada fila lleva filete inferior de 1 px', m.filas.every((f) => f.filete === '1px'), true);
  t.ok('las filas llenan la columna: mismo ancho que la mezcla',
    m.filas.every((f) => Math.abs(f.caja.ancho - z.caja.ancho) < 1), true);

  // El toque único inicia el quiz (flujo de main).
  await clicEnMarco(pagina, 'todos los temas mezclados');
  t.ok('tocar la mezcla abre el quiz con un solo gesto',
    await pagina.esperarA(async () => await pagina.evaluar(EN_MARCO('return w.location.pathname;')) === '/quiz'), true);
}

async function varianteExam(pagina, base, t) {
  t.ok('exam: abrió Elegir tema', await abrirTemas(pagina, base, { ancho: 390, modo: 'exam' }), true);
  const m = await medirTemas(pagina);
  const x = m.texto.toLowerCase();

  t.ok('exam: panel de filtros presente (fuente y temporizador)',
    !!m.fuente && m.valor === 'Sin límite', true);
  t.ok('exam: tarjeta «Modo Examen» con su texto, disponibles y botón',
    ['modo examen', 'se sortean', 'disponibles:', 'comenzar examen'].every((s) => x.includes(s)), true);
  t.ok('exam: sin tarjeta de mezcla ni lista de temas (TOPIC-P5)', m.mezcla === null && m.filas.length === 0, true);
  t.ok('exam: la lámina lleva sus cuatro marcas de esquina', m.marcas, 4);
  t.ok('exam: «Comenzar examen» mide 44 de alto como mínimo y ancho para su texto',
    !!m.comenzar && m.comenzar.alto >= LADO_TACTIL, true);
  t.ok('exam: sin emojis', EMOJI.test(m.texto), false);

  // El texto del sorteo sigue a «Examen»/parcial: lógica de main.
  t.ok('exam: sin parcial elegido, sortea de todos los temas',
    x.includes('de todos los temas'), true);

  await clicEnMarco(pagina, 'comenzar examen');
  t.ok('exam: «Comenzar examen» abre el quiz con un solo gesto',
    await pagina.esperarA(async () => await pagina.evaluar(EN_MARCO('return w.location.pathname;')) === '/quiz'), true);
}

async function vaciosV2yV4(pagina, base, t) {
  // V2: sin fallos, lámina vacía con «Practicar».
  t.ok('failed: abrió Elegir tema', await abrirTemas(pagina, base, { ancho: 390, modo: 'failed' }), true);
  const v2 = await medirTemas(pagina);
  const x = v2.texto.toLowerCase();
  t.ok('V2: título y texto de main, sin cambio de palabras',
    x.includes('sin preguntas falladas') && x.includes('practicá un poco primero y volvé acá para repasar las que te cuesten.'), true);
  t.ok('V2: sin filtros ni mezcla debajo (VAC-C1)', v2.fuente === null && v2.mezcla === null && v2.filas.length === 0, true);
  t.ok('V2: sin emoji', EMOJI.test(v2.texto), false);
  t.ok('V2: lámina vacía con sus cuatro marcas de esquina (VAC-P1)', v2.marcas, 4);
  t.ok('V2: «Practicar» mide 44 de alto como mínimo (VAC-P2)', !!v2.practicar && v2.practicar.alto >= LADO_TACTIL, true);
  // a.4 de Vacios.md: anclada arriba, a paso 6 bajo la barra interna.
  t.ok('V2: la lámina arranca a paso 6 bajo la barra interna, no centrada en la pantalla',
    !!v2.lamina && !!v2.barra && Math.abs(v2.lamina.arriba - v2.barra.abajo - 6 * PASO) < 1, true);
  await clicEnMarco(pagina, 'practicar');
  t.ok('V2: «Practicar» navega a TopicSelect practice con un solo toque',
    await pagina.esperarA(async () => await pagina.evaluar(EN_MARCO('return w.location.pathname;')) === '/temas/practice'), true);
  t.ok('V2: tras «Practicar» aparece la mezcla',
    await esperarEnMarco(pagina, 'todos los temas mezclados'), true);

  // V4: filtros que dejan cero temas.
  t.ok('practice: abrió Elegir tema', await abrirTemas(pagina, base, { ancho: 390 }), true);
  await clicEnMarco(pagina, 'solo generadas');
  t.ok('V4: aparece el mensaje bajo el rótulo (VAC-P3)',
    await esperarEnMarco(pagina, 'no hay preguntas disponibles con los filtros actuales.'), true);
  const v4 = await medirTemas(pagina);
  t.ok('V4: la mezcla y los filtros siguen visibles, con «0 preguntas» (VAC-C4)',
    !!v4.mezcla && v4.mezcla.lineas[v4.mezcla.lineas.length - 1] === '0 preguntas' && !!v4.fuente, true);
  t.ok('V4: sin filas de tema', v4.filas.length, 0);
  t.ok('V4: el rótulo «O elegí un tema específico:» se conserva',
    v4.texto.toLowerCase().includes('o elegí un tema específico:'), true);

  // V5: la mezcla con cero preguntas sigue activa y muestra el aviso del sistema.
  pagina.dialogos.length = 0;
  await clicEnMarco(pagina, 'todos los temas mezclados');
  t.ok('V5: tocar la mezcla vacía muestra el aviso del sistema',
    await pagina.esperarA(() => pagina.dialogos.length >= 1), true);
  t.ok('V5: el aviso conserva su texto',
    pagina.dialogos.some((d) => d.includes('No hay preguntas disponibles con los filtros actuales.')), true);
  t.ok('V5: la pantalla sigue en Elegir tema',
    await pagina.evaluar(EN_MARCO('return w.location.pathname;')), '/temas/practice');
}

async function vaciosCargaYSinParciales(pagina, base, t) {
  // VAC-P4: durante la primera carga de failed no hay lámina vacía ni contenido. El
  // instante se fija con la primera lectura de las preguntas propias (el efecto de carga):
  // ahí el DOM es el del primer render.
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await pagina.evaluar(LIMPIAR_DATOS);
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390), true);
  await clicEnMarco(pagina, MATERIA);
  await esperarEnMarco(pagina, 'repasar fallos');
  await pagina.evaluar(EN_MARCO(`
    w.__instantanea = null;
    const original = w.Storage.prototype.getItem;
    w.Storage.prototype.getItem = function (clave) {
      if (w.__instantanea === null && String(clave).startsWith('pkapp_user_questions:')) {
        w.__instantanea = d.body.innerText.toLowerCase();
        w.Storage.prototype.getItem = original;
      }
      return original.apply(this, arguments);
    };
  `));
  await clicEnMarco(pagina, 'repasar fallos');
  t.ok('failed: la carga corrió',
    await pagina.esperarA(async () => (await pagina.evaluar(EN_MARCO('return w.__instantanea;'))) !== null), true);
  const primera = await pagina.evaluar(EN_MARCO('return w.__instantanea;'));
  t.ok('failed: durante la primera carga ya está la barra interna', primera.includes('elegir tema'), true);
  t.ok('failed: durante la primera carga no se muestra el estado vacío (VAC-P4)',
    !primera.includes('sin preguntas falladas') && !primera.includes('practicar'), true);
  t.ok('failed: resuelta la carga aparece V2', await esperarEnMarco(pagina, 'sin preguntas falladas'), true);

  // V11: una materia sin parciales omite el grupo, sin dejar hueco ni marcador.
  t.ok('practice sin parciales: abrió Elegir tema',
    await abrirTemas(pagina, base, { ancho: 390, materia: MATERIA_SIN_PARCIALES }), true);
  const m = await medirTemas(pagina);
  t.ok('V11: sin grupo Parcial', m.parcial === null && !m.texto.toLowerCase().includes('parcial'), true);
  t.ok('V11: Fuente y Temporizador siguen presentes', !!m.fuente && m.valor === 'Sin límite', true);
}

// Una carga que rechaza no deja la pantalla en blanco: `failed` resuelve igual y muestra V2.
// Una pregunta propia con `options` corrupto hace rechazar a `getUserQuestions`.
async function cargaQueRechazaMuestraV2(pagina, base, t) {
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await pagina.evaluar(LIMPIAR_DATOS);
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390), true);
  await clicEnMarco(pagina, MATERIA);
  await esperarEnMarco(pagina, 'repasar fallos');
  await pagina.evaluar(EN_MARCO(`
    const original = w.Storage.prototype.getItem;
    w.Storage.prototype.getItem = function (clave) {
      if (String(clave).startsWith('pkapp_user_questions:')) {
        return JSON.stringify([{ id: 'corrupta', topic: 'x', question: 'q', options: '{no es json', correct_index: 0 }]);
      }
      return original.apply(this, arguments);
    };
  `));
  await clicEnMarco(pagina, 'repasar fallos');
  t.ok('failed con carga que rechaza: aparece V2 en vez de quedar en blanco',
    await esperarEnMarco(pagina, 'sin preguntas falladas'), true);
}

// V9: un parcial deja temas sin preguntas; esos temas no se listan.
async function temasSinPreguntasNoSeListan(pagina, base, t) {
  t.ok('practice: abrió Elegir tema', await abrirTemas(pagina, base, { ancho: 390 }), true);
  const todos = await medirTemas(pagina);
  t.ok('V9: hay un parcial para filtrar', !!todos.parcial && todos.parcial.length > 1, true);
  if (!todos.parcial || todos.parcial.length < 2) return;
  await clicEnMarco(pagina, todos.parcial[1].texto);
  await pagina.esperarA(async () => ((await medirTemas(pagina)).parcial || []).map((o) => o.marcada).join('|').startsWith('false|true'));
  const parcial = await medirTemas(pagina);
  t.ok('V9: el parcial deja menos temas que sin filtro', parcial.filas.length > 0 && parcial.filas.length < todos.filas.length, true);
  t.ok('V9: toda fila listada tiene al menos una pregunta',
    parcial.filas.length > 0 && parcial.filas.every((f) => numeroDe(f.lineas[2]) >= 1), true);
}

async function estadosDeControl(pagina, base, t) {
  t.ok('practice: abrió Elegir tema', await abrirTemas(pagina, base, { ancho: 1280, alto: 900 }), true);
  const filtro = async (nombre) => {
    const m = await medirTemas(pagina);
    return (m.fuente || []).find((o) => o.texto.toLowerCase() === nombre) || { fondo: null, color: null, marcada: null, caja: { izq: 0, der: 0, arriba: 0, abajo: 0 } };
  };
  const reposo = await filtro('solo generadas');
  const marcado = await filtro('todas');
  t.ok('K4: el seleccionado invierte (fondo = color del texto en reposo)',
    marcado.fondo !== reposo.fondo && marcado.fondo === reposo.color, true);

  // Hover real: el borde pasa a `linea` (matriz c de la ficha), sin mover el layout.
  const c = reposo.caja;
  await pagina.moverA(Math.round((c.izq + c.der) / 2), Math.round((c.arriba + c.abajo) / 2));
  t.ok('K4: hover cambia el borde del filtro',
    await pagina.esperarA(async () => (await filtro('solo generadas')).borde !== reposo.borde, { limite: 2000 }), true);
  const luego = await filtro('solo generadas');
  t.ok('K4: el hover no mueve el filtro', luego.caja.izq === c.izq && luego.caja.arriba === c.arriba, true);
  await pagina.moverA(5, 5);

  // Foco por teclado: un solo contorno, el de foco.
  await pagina.evaluar(EN_MARCO(`
    m.contentWindow.focus();
    if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
  `));
  // La barra va primero en el DOM: su «Volver» es la primera parada, sin foco forzado.
  await pagina.tecla('Tab');
  t.ok('Tab: la primera parada es «Volver» de la barra (DOM = visual)',
    await pagina.evaluar(EN_MARCO(`return d.activeElement.getAttribute('data-testid');`)), 'barra-volver');
  let foco = '';
  for (let i = 0; i < 12 && !foco.startsWith('radio:todas'); i++) {
    await pagina.tecla('Tab');
    foco = await pagina.evaluar(FOCO_EN_MARCO);
  }
  t.ok('K4: Tab llega al primer filtro', foco.startsWith('radio:todas'), true);
  const conFoco = await pagina.evaluar(EN_MARCO(`
    const e = w.getComputedStyle(d.activeElement);
    return { estilo: e.outlineStyle, ancho: parseFloat(e.outlineWidth) };
  `));
  t.ok('K4: el foco dibuja contorno', conFoco.estilo !== 'none' && conFoco.ancho >= 2, true);

  // Teclado del grupo: la flecha derecha selecciona el siguiente.
  await pagina.tecla('ArrowRight');
  t.ok('K4: ArrowRight selecciona «Solo preguntas reales»',
    await pagina.esperarA(async () => (await filtro('solo preguntas reales')).marcada === 'true', { limite: 2000 }), true);
}

// Estados K de cada control de la pantalla (ficha c): hover real con el puntero,
// presionado con el botón abajo y sin soltar, foco con Tab real. Cada control se ubica
// con una expresión JS que corre dentro del marco.
const TRANSPARENTE = 'rgba(0, 0, 0, 0)';
const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const BUSCAR = {
  filtro: (texto) => `visibles('[role="radio"]').find((n) => n.innerText.trim().toLowerCase() === ${JSON.stringify(texto)})`,
  porNombre: (nombre) => `visibles('[aria-label]').find((n) => n.getAttribute('aria-label').toLowerCase() === ${JSON.stringify(nombre)})`,
  mezcla: `visibles('[tabindex]').find((n) => n.innerText.toLowerCase().includes('todos los temas mezclados'))`,
  fila: `visibles('[tabindex]').find((n) => !n.innerText.toLowerCase().includes('mezclados') && /\\d+ preguntas$/.test(n.innerText.trim()) && n.querySelector('svg'))`,
  boton: (texto) => `visibles('[tabindex]').find((n) => n.innerText.trim().toLowerCase() === ${JSON.stringify(texto)})`,
};

const LEER_CONTROL = (buscar) => EN_MARCO(`
  const el = (${buscar});
  if (!el) return null;
  const caja = el.firstElementChild || el;
  const c = w.getComputedStyle(el), k = w.getComputedStyle(caja);
  const hoja = Array.from(el.querySelectorAll('*')).find((x) => x.children.length === 0 && x.textContent.trim());
  const svg = el.querySelector('svg');
  const r = el.getBoundingClientRect();
  return {
    x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2),
    fondo: k.backgroundColor, borde: k.borderTopColor, bordeAncho: k.borderTopWidth,
    texto: hoja ? w.getComputedStyle(hoja).color : null,
    glifo: svg ? svg.getAttribute('stroke') : null,
    contorno: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor + ' ' + c.outlineOffset,
    desactivado: el.getAttribute('aria-disabled'),
  };
`);

const PRESIONAR = (buscar) => EN_MARCO(`
  const el = (${buscar});
  const r = el.getBoundingClientRect();
  el.dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true, cancelable: true, view: w,
    clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, button: 0, buttons: 1 }));
  return true;
`);

// Se suelta fuera del control: el responder cancela y no dispara `onPress`.
const SOLTAR_FUERA = EN_MARCO(`
  d.dispatchEvent(new w.MouseEvent('mouseup', { bubbles: true, cancelable: true, view: w,
    clientX: 1, clientY: 1, button: 0, buttons: 0 }));
  return true;
`);

const TIENE_FOCO = (buscar) => EN_MARCO(`return d.activeElement === (${buscar});`);

async function verEstados(pagina, t, T, nombre, buscar, esperado, { deshabilitado = false } = {}) {
  const leer = () => pagina.evaluar(LEER_CONTROL(buscar));
  const cuando = (estado) => `${nombre} · ${estado}`;
  const comparar = (estado, real, exp) => {
    for (const [campo, v] of Object.entries(exp)) {
      if (campo === 'contorno') {
        const sin = real.contorno.startsWith('none') || real.contorno.includes(' 0px ');
        if (v === null) t.ok(`${cuando(estado)}: sin contorno`, sin, true);
        else t.ok(`${cuando(estado)}: contorno ${v.ancho} ${v.color}`, real.contorno, `solid ${v.ancho} ${v.color} ${v.separacion}`);
      } else {
        t.ok(`${cuando(estado)}: ${campo}`, real[campo], v);
      }
    }
  };
  await pagina.evaluar(EN_MARCO(`(${buscar}).scrollIntoView({ block: 'center' });`));

  await pagina.moverA(1, 1);
  const reposo = await leer();
  t.ok(`${cuando('reposo')}: existe`, reposo !== null, true);
  if (!reposo) return;
  comparar('reposo', reposo, { ...esperado.reposo, contorno: null });

  if (deshabilitado) {
    t.ok(`${cuando('deshabilitado')}: aria-disabled`, reposo.desactivado, 'true');
    await pagina.moverA(reposo.x, reposo.y);
    comparar('deshabilitado con puntero encima', await leer(), { ...esperado.reposo, contorno: null });
    await pagina.moverA(1, 1);
    return;
  }

  await pagina.moverA(reposo.x, reposo.y);
  comparar('hover', await leer(), esperado.hover);

  await pagina.evaluar(PRESIONAR(buscar));
  await new Promise((r) => setTimeout(r, 150));
  comparar('presionado', await leer(), esperado.presionado);
  await pagina.evaluar(SOLTAR_FUERA);
  await pagina.moverA(1, 1);

  // Foco por teclado: contorno `foco`, `border-2`, separado `paso 0.5`.
  await pagina.evaluar(EN_MARCO(`
    m.contentWindow.focus();
    if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
  `));
  let enfocado = false;
  for (let i = 0; i < 80 && !enfocado; i++) {
    await pagina.tecla('Tab');
    enfocado = await pagina.evaluar(TIENE_FOCO(buscar));
  }
  t.ok(`${cuando('foco')}: llega con Tab`, enfocado, true);
  if (enfocado) {
    comparar('foco', await leer(), { contorno: { ancho: '2px', color: rgb(T.foco), separacion: `${0.5 * PASO}px` } });
  }
}

async function estadosDeTodosLosControles(pagina, base, t) {
  for (const oscuro of [false, true]) {
    const T = plancha[oscuro ? 'oscuro' : 'claro'];
    const pre = oscuro ? 'oscuro' : 'claro';
    const cont = (ancho, color) => ({ ancho, color: rgb(T[color]), separacion: '0px' });
    const K = (nombre, buscar, esperado, opciones) =>
      verEstados(pagina, t, T, `${pre} · ${nombre}`, buscar, esperado, opciones);
    const invertido = { fondo: rgb(T.tinta), texto: rgb(T.fondo), borde: rgb(T.tinta) };

    // practice: K4 (fuente y parcial), K5, K6 y K7.
    t.ok(`${pre}: practice abrió Elegir tema`, await abrirTemas(pagina, base, { ancho: 1280, alto: 900, oscuro }), true);
    const parciales = (await medirTemas(pagina)).parcial || [];
    const filtro = {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.borde) },
      hover: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea) },
      presionado: invertido,
    };
    await K('K4 fuente', BUSCAR.filtro('solo generadas'), filtro);
    if (parciales.length > 1) await K('K4 parcial', BUSCAR.filtro(parciales[1].texto.toLowerCase()), filtro);

    const cuadrado = {
      reposo: { fondo: rgb(T.superficie), borde: rgb(T.linea), glifo: T.tinta },
      hover: { fondo: rgb(T.superficie), borde: rgb(T.linea), contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), borde: rgb(T.tinta), glifo: T.fondo },
    };
    const apagado = { reposo: { fondo: rgb(T.superficie), borde: rgb(T.filete), glifo: T.inactivo } };
    await K('K5 menos en «Sin límite»', BUSCAR.porNombre('reducir tiempo'), apagado, { deshabilitado: true });
    await K('K5 más', BUSCAR.porNombre('aumentar tiempo'), cuadrado);
    await clicPorNombre(pagina, 'aumentar tiempo');
    await pagina.esperarA(async () => (await medirTemas(pagina)).valor === '10 min');
    await K('K5 menos', BUSCAR.porNombre('reducir tiempo'), cuadrado);
    for (let i = 0; i < 11; i++) await clicPorNombre(pagina, 'aumentar tiempo');
    await pagina.esperarA(async () => (await medirTemas(pagina)).valor === '120 min');
    await K('K5 más en el máximo', BUSCAR.porNombre('aumentar tiempo'), apagado, { deshabilitado: true });

    await K('K6 mezcla', BUSCAR.mezcla, {
      reposo: { fondo: rgb(T.superficie), borde: rgb(T.acento), bordeAncho: '2px', glifo: T.acento },
      hover: { borde: rgb(T.acento), contorno: cont('1px', 'acento') },
      presionado: { ...invertido, glifo: T.fondo },
    });
    await K('K7 fila de tema', BUSCAR.fila, {
      reposo: { fondo: TRANSPARENTE, glifo: T.tintaSec },
      hover: { contorno: cont('1px', 'linea') },
      presionado: { fondo: rgb(T.tinta), glifo: T.fondo },
    });

    // exam: K1 «Comenzar examen».
    t.ok(`${pre}: exam abrió Elegir tema`, await abrirTemas(pagina, base, { ancho: 1280, alto: 900, modo: 'exam', oscuro }), true);
    await K('K1 «Comenzar examen»', BUSCAR.boton('comenzar examen'), {
      reposo: invertido,
      hover: { ...invertido, contorno: cont('2px', 'linea') },
      presionado: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea) },
    });

    // failed sin fallos (V2): K2 «Practicar».
    t.ok(`${pre}: failed abrió Elegir tema`, await abrirTemas(pagina, base, { ancho: 1280, alto: 900, modo: 'failed', oscuro }), true);
    await K('K2 «Practicar»', BUSCAR.boton('practicar'), {
      reposo: { fondo: rgb(T.superficie), texto: rgb(T.tinta), borde: rgb(T.linea) },
      hover: { fondo: rgb(T.superficie), borde: rgb(T.linea), contorno: cont('1px', 'linea') },
      presionado: invertido,
    });
  }
}

async function sinDesbordeNiCortes(pagina, base, t) {
  for (const oscuro of [false, true]) {
    for (const ancho of [320, 360, 390, 768, 1280]) {
      const tema = oscuro ? 'oscuro' : 'claro';
      for (const modo of ['practice', 'exam', 'failed']) {
        // exam y failed alcanzan con los extremos: 320 y 1280.
        if (modo !== 'practice' && ancho !== 320 && ancho !== 1280) continue;
        if (!await abrirTemas(pagina, base, { ancho, modo, oscuro })) {
          t.ok(`${modo} ${ancho} px ${tema}: abrió Elegir tema`, false, true);
          continue;
        }
        const m = await medirTemas(pagina);
        t.ok(`${modo} ${ancho} px ${tema}: sin scroll horizontal`, m.desborda, false);
        const chicos = m.interactivos.filter((c) => c.ancho > 0 && (c.alto < LADO_TACTIL || c.ancho < LADO_TACTIL));
        t.ok(`${modo} ${ancho} px ${tema}: ningún control baja de 44 × 44`, chicos.length, 0);
        if (ancho >= 768 && ancho < 1024) {
          const ref = m.panel || m.practicar || m.comenzar || m.mezcla && m.mezcla.caja;
          t.ok(`${modo} ${ancho} px ${tema}: una sola columna de a lo sumo ${COLUMNA} px`,
            !!ref && ref.ancho <= COLUMNA + 1, true);
        }
      }
    }
  }
}


// ---------------------------------------------------------------------------
// Escritorio (rediseño Plancha, tarea 3.11d; TopicSelect.md «Escritorio» `ESC-P3`,
// Vacios.md `ESC-P12`, comun.md §7.2). Cortes: `escritorio` 1024 y `amplio` 1440.
// Bajo 1024 rige a.5 sin cambio; desde él la hoja (952; 1440 desde `amplio`), el
// panel con los grupos en una fila y los temas en 2 columnas (3 desde `amplio`).

// Capturas de evidencia (solo con PKAPP_CAPTURAS): la ventana de la ficha para cada ancho.
const ALTO_DE_CAPTURA = { 1024: 768, 1366: 768, 1920: 1080 };
async function capturar(pagina, ancho, nombre) {
  if (!process.env.PKAPP_CAPTURAS || !ALTO_DE_CAPTURA[ancho]) return;
  const dir = path.resolve(__dirname, '..', '..', '..', 'openspec', 'changes', 'rediseno-plancha',
    'evidencia', 'despues', '3.11d');
  fs.mkdirSync(dir, { recursive: true });
  await pagina.enviar('Emulation.setDeviceMetricsOverride',
    { width: ancho, height: ALTO_DE_CAPTURA[ancho], deviceScaleFactor: 1, mobile: false });
  await new Promise((r) => setTimeout(r, 400));
  const r = await pagina.enviar('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(dir, nombre), Buffer.from(r.data, 'base64'));
}

const MARGEN_HOJA = 8 * PASO;              // margen lateral paso 8 desde el corte
const TOPE_HOJA = 952;
const TOPE_HOJA_AMPLIA = 1440;
const TOPE_LECTURA = 600;
const RELLENO_PANEL = 3.5 * PASO;
const HUECO_COLUMNAS = 8 * PASO;           // lista de filas en flujo por columnas: paso 8 (TopicSelect.md)

const topeDeHoja = (vista) => Math.min(vista >= 1440 ? TOPE_HOJA_AMPLIA : TOPE_HOJA, vista - 2 * MARGEN_HOJA);
const casi = (a, b, tol = 1) => Math.abs(a - b) <= tol;

// Posición y texto de lo que tiene el foco, dentro del marco.
const FOCO_CON_CAJA = EN_MARCO(`
  const a = d.activeElement;
  if (!a || a === d.body) return null;
  const r = a.getBoundingClientRect();
  const desplazado = w.scrollY + Array.from(d.querySelectorAll('*')).reduce((s, n) => s + n.scrollTop, 0);
  return { texto: a.innerText ? a.innerText.trim() : '', izq: r.left, arriba: r.top + desplazado };
`);

// Ancla y recorte de foco de las regiones de la pantalla (comun.md §7.2). Recorre, desde
// cada control enfocable, todos sus ancestros: ninguno puede ser `sticky`/`fixed` ni tener
// `overflow` que deje el contorno de foco (borde 2 px + separación paso 0.5, unos 4 px por
// fuera) fuera de su caja. Un contenedor con scroll en un eje cuenta con su extensión
// desplazable, no con su caja visible.
const ESTRUCTURA_DE_REGIONES = EN_MARCO(`
  const FUERA = 4;
  const raiz = d.documentElement;
  const controles = visibles('[tabindex]');
  const fijos = new Set();
  const recortes = [];
  const describir = (n) => (n.getAttribute('data-testid') || n.getAttribute('aria-label') || n.tagName.toLowerCase())
    + (typeof n.className === 'string' ? '.' + n.className.split(' ').slice(0, 3).join('.') : '');
  for (const c of controles) {
    const r = c.getBoundingClientRect();
    for (let a = c; a && a !== raiz; a = a.parentElement) {
      const e = w.getComputedStyle(a);
      if (e.position === 'sticky' || e.position === 'fixed') fijos.add(describir(a));
      if (a === c) continue;
      const ejes = [['x', e.overflowX], ['y', e.overflowY]];
      const rc = a.getBoundingClientRect();
      for (const [eje, valor] of ejes) {
        if (valor === 'visible') continue;
        const desplazable = (valor === 'auto' || valor === 'scroll')
          && (eje === 'x' ? a.scrollWidth > a.clientWidth : a.scrollHeight > a.clientHeight);
        let ini = eje === 'x' ? rc.left : rc.top;
        let fin = eje === 'x' ? rc.right : rc.bottom;
        if (desplazable) {
          const largo = eje === 'x' ? a.scrollWidth : a.scrollHeight;
          const corrido = eje === 'x' ? a.scrollLeft : a.scrollTop;
          ini -= corrido;
          fin = ini + largo;
        }
        const c0 = eje === 'x' ? r.left : r.top;
        const c1 = eje === 'x' ? r.right : r.bottom;
        if (c0 - FUERA < ini - 0.5 || c1 + FUERA > fin + 0.5) {
          recortes.push({ control: (c.innerText || '').trim().split('\\n')[0].slice(0, 20), ancestro: describir(a), eje, overflow: valor });
        }
      }
      // El contenedor con scroll de la pantalla es el último que cuenta: lo de arriba (body) es la ventana.
      if (/auto|scroll/.test(e.overflowY)) break;
    }
  }
  return { controles: controles.length, fijos: Array.from(fijos), recortes };
`);

// Con la página desplazada, cuánto se movió el panel respecto de lo que se desplazó el contenedor.
const DESPLAZAR_Y_MEDIR_PANEL = EN_MARCO(`
  const g = visibles('[role="radiogroup"]').find((x) => (x.getAttribute('aria-label') || '').toLowerCase() === 'fuente');
  const panel = g.parentElement.parentElement;
  const mezcla = visibles('[tabindex]').find((n) => n.innerText.toLowerCase().includes('todos los temas mezclados'));
  const sc = Array.from(d.querySelectorAll('*')).find((n) =>
    n.scrollHeight > n.clientHeight + 1 && /auto|scroll/.test(w.getComputedStyle(n).overflowY));
  if (!sc) return { desplazable: false };
  const antes = { panel: panel.getBoundingClientRect().top, mezcla: mezcla.getBoundingClientRect().top };
  sc.scrollTop = 250;
  const aplicado = sc.scrollTop;
  const despues = { panel: panel.getBoundingClientRect().top, mezcla: mezcla.getBoundingClientRect().top };
  sc.scrollTop = 0;
  return { desplazable: true, aplicado, panel: antes.panel - despues.panel, mezcla: antes.mezcla - despues.mezcla };
`);

// Agrupa las filas por columna (izquierda distinta) y comprueba el flujo por columnas.
function columnasDe(filas) {
  const lefts = [...new Set(filas.map((f) => Math.round(f.caja.izq)))].sort((a, b) => a - b);
  return lefts.map((l) => filas.filter((f) => Math.round(f.caja.izq) === l));
}

async function escritorioPractice(pagina, base, t) {
  for (const oscuro of [false, true]) {
    const tema = oscuro ? 'oscuro' : 'claro';
    for (const ancho of [1023, 1024, 1366, 1920]) {
      const pre = `practice ${ancho} px ${tema}`;
      if (!await abrirTemas(pagina, base, { ancho, alto: 900, oscuro })) {
        t.ok(`${pre}: abrió Elegir tema`, false, true);
        continue;
      }
      const m = await medirTemas(pagina);
      await capturar(pagina, ancho, `temas-practice-${ancho}-${tema}.png`);
      t.ok(`${pre}: sin scroll horizontal`, m.desborda, false);
      const chicos = m.interactivos.filter((c) => c.ancho > 0 && (c.alto < LADO_TACTIL || c.ancho < LADO_TACTIL));
      t.ok(`${pre}: ningún control baja de 44 × 44`, chicos.length, 0);
      const cols = columnasDe(m.filas);

      if (ancho < 1024) {
        t.ok(`${pre}: bajo el corte, panel y mezcla de a lo sumo ${COLUMNA} px (a.5)`,
          !!m.panel && !!m.mezcla && m.panel.ancho <= COLUMNA + 1 && m.mezcla.caja.ancho <= COLUMNA + 1, true);
        t.ok(`${pre}: bajo el corte, margen lateral paso 5 sin cambio`,
          !!m.panel && m.panel.izq >= MARGEN_LATERAL_TEMAS - 1, true);
        t.ok(`${pre}: bajo el corte, los grupos van apilados`,
          !!m.grupoParcial && m.grupoParcial.arriba > m.grupoFuente.abajo, true);
        t.ok(`${pre}: bajo el corte, los temas van en una columna`, cols.length, 1);
        t.ok(`${pre}: bajo el corte, no hay divisor vertical`, m.divisoresVerticales.length, 0);
        continue;
      }

      const tope = topeDeHoja(ancho);
      const izqHoja = (ancho - tope) / 2;
      t.ok(`${pre}: el panel mide la hoja (${tope} px) y está centrado`,
        !!m.panel && casi(m.panel.ancho, tope) && casi(m.panel.izq, izqHoja), true);
      t.ok(`${pre}: la mezcla llena el ancho de la hoja`,
        !!m.mezcla && casi(m.mezcla.caja.ancho, tope) && casi(m.mezcla.caja.izq, izqHoja), true);
      t.ok(`${pre}: la lista de temas llena el ancho de la hoja`,
        m.filas.length > 0 && Math.min(...m.filas.map((f) => f.caja.izq)) >= izqHoja - 1
          && Math.max(...m.filas.map((f) => f.caja.der)) <= izqHoja + tope + 1
          && casi(Math.max(...m.filas.map((f) => f.caja.der)), izqHoja + tope), true);

      // Barra interna dentro de la hoja (3.11a2): el volver arranca en el borde de la hoja y el título sigue dentro.
      t.ok(`${pre}: la barra interna va dentro de la hoja (volver en el borde izquierdo)`,
        !!m.barraVolver && casi(m.barraVolver.izq, izqHoja), true);
      t.ok(`${pre}: el volver de la barra alinea con el borde del panel`,
        !!m.barraVolver && !!m.panel && casi(m.barraVolver.izq, m.panel.izq), true);
      t.ok(`${pre}: el título de la barra termina dentro de la hoja`,
        !!m.barraTitulo && m.barraTitulo.der <= izqHoja + tope + 1, true);

      // Orden vertical de las regiones, en coordenadas de página: panel, mezcla, lista.
      const pag = (c) => ({ arriba: c.arriba + m.scroll, abajo: c.abajo + m.scroll });
      const panelP = pag(m.panel), mezclaP = pag(m.mezcla.caja);
      const primeraP = Math.min(...m.filas.map((f) => pag(f.caja).arriba));
      t.ok(`${pre}: el panel queda arriba de la mezcla`, panelP.abajo <= mezclaP.arriba + 1, true);
      t.ok(`${pre}: la mezcla queda arriba del primer tema`, mezclaP.abajo <= primeraP + 1, true);

      // Panel: tres grupos en una fila, separados por un filete vertical.
      t.ok(`${pre}: Fuente y Parcial van en la misma fila`,
        !!m.celdaFuente && !!m.celdaParcial && casi(m.celdaFuente.arriba, m.celdaParcial.arriba), true);
      t.ok(`${pre}: Fuente va a la izquierda de Parcial y Parcial de Temporizador`,
        !!m.celdaParcial && m.celdaFuente.der <= m.celdaParcial.izq
          && !!m.menos && m.celdaParcial.der <= m.menos.caja.izq, true);
      t.ok(`${pre}: el Temporizador queda en la misma fila que los otros grupos`,
        !!m.menos && m.menos.caja.arriba >= m.grupoFuente.arriba - 1 && m.menos.caja.arriba <= m.grupoFuente.abajo, true);
      t.ok(`${pre}: hay dos filetes verticales entre los tres grupos`, m.divisoresVerticales.length, 2);
      t.ok(`${pre}: paso 3.5 a cada lado del filete vertical`,
        !!m.celdaParcial && casi(m.celdaParcial.izq - m.celdaFuente.der, 2 * RELLENO_PANEL + 1), true);
      t.ok(`${pre}: Fuente y Parcial reparten el ancho sobrante por igual`,
        !!m.celdaParcial && casi(m.celdaFuente.ancho, m.celdaParcial.ancho), true);
      t.ok(`${pre}: la celda del Temporizador toma el ancho de sus controles (no más)`,
        !!m.menos && !!m.mas && !!m.celdaTemporizador
          && casi(m.celdaTemporizador.ancho, m.mas.caja.der - m.menos.caja.izq), true);
      t.ok(`${pre}: el panel respeta el relleno paso 3.5 a ambos lados`,
        !!m.panel && !!m.celdaTemporizador
          && casi(m.celdaFuente.izq - m.panel.izq, RELLENO_PANEL)
          && casi(m.celdaTemporizador.der, m.panel.der - RELLENO_PANEL), true);
      t.ok(`${pre}: desde amplio los filtros de Fuente entran en una línea`,
        ancho < 1440 || (!!m.fuente && m.fuente.every((o) => casi(o.caja.arriba, m.fuente[0].caja.arriba))), true);

      // Temas: 2 columnas (3 desde `amplio`) con flujo por columnas.
      const columnas = ancho >= 1440 ? 3 : 2;
      t.ok(`${pre}: los temas van en ${columnas} columnas`, cols.length, columnas);
      const n = m.filas.length;
      const porColumna = Math.ceil(n / columnas);
      t.ok(`${pre}: la primera columna lleva ${porColumna} de ${n} temas, de 01 en adelante`,
        cols[0].length === porColumna && cols[0].map((f) => f.lineas[0]).join('|')
          === Array.from({ length: porColumna }, (_, i) => String(i + 1).padStart(2, '0')).join('|'), true);
      const orden = cols.flat().map((f) => f.lineas[0]).join('|');
      t.ok(`${pre}: el flujo baja por una columna y sigue por la siguiente (01 a ${String(n).padStart(2, '0')})`,
        orden, m.filas.map((_, i) => String(i + 1).padStart(2, '0')).join('|'));
      t.ok(`${pre}: las columnas arrancan a la misma altura y miden lo mismo`,
        cols.every((c) => casi(c[0].caja.arriba, cols[0][0].caja.arriba)
          && c.every((f) => casi(f.caja.ancho, cols[0][0].caja.ancho))), true);
      if (cols.length > 1) {
        t.ok(`${pre}: ${HUECO_COLUMNAS} px entre columnas`,
          casi(cols[1][0].caja.izq - cols[0][0].caja.der, HUECO_COLUMNAS), true);
      }
      t.ok(`${pre}: cada fila mide 44 de alto como mínimo y lleva filete de 1 px`,
        m.filas.every((f) => f.caja.alto >= LADO_TACTIL && f.filete === '1px'), true);

      // Orden de foco = orden visual = orden de DOM.
      await pagina.evaluar(SOLTAR_FOCO);
      const visitados = [];
      for (let i = 0; i < 60 && visitados.filter((v) => /^\d{2}\n/.test(v.texto) || /^\d{2}$/.test(v.texto.split('\n')[0])).length < n; i++) {
        await pagina.tecla('Tab');
        const f = await pagina.evaluar(FOCO_CON_CAJA);
        if (f) visitados.push(f);
      }
      const temas = visitados.filter((v) => /^\d{2}$/.test(v.texto.split('\n')[0].trim()));
      t.ok(`${pre}: Tab recorre los temas 01 a ${String(n).padStart(2, '0')} en orden`,
        temas.map((v) => v.texto.split('\n')[0].trim()).join('|'), m.filas.map((_, i) => String(i + 1).padStart(2, '0')).join('|'));
      let monotono = true;
      for (let i = 1; i < temas.length; i++) {
        const a = temas[i - 1], b = temas[i];
        const mismaColumna = casi(a.izq, b.izq);
        if (mismaColumna ? b.arriba <= a.arriba : b.izq <= a.izq) monotono = false;
      }
      t.ok(`${pre}: el foco no salta hacia atrás: baja por la columna y pasa a la siguiente`, monotono, true);
      const posicionDeMezcla = visitados.findIndex((v) => v.texto.toLowerCase().includes('todos los temas mezclados'));
      const posicionDeFuente = visitados.findIndex((v) => v.texto.toLowerCase() === 'todas');
      t.ok(`${pre}: el foco pasa por los filtros, la mezcla y los temas en ese orden`,
        posicionDeFuente >= 0 && posicionDeMezcla > posicionDeFuente
          && visitados.indexOf(temas[0]) > posicionDeMezcla, true);
      // El orden de Tab contra el orden visual medido (coordenadas de página). Las paradas del
      // panel se ordenan por celda (izquierda a derecha) y, dentro de la celda, de arriba a abajo
      // y de izquierda a derecha; los temas pueden pasar a la columna siguiente.
      const celdas = [m.celdaFuente, m.celdaParcial, m.celdaTemporizador].filter(Boolean)
        .sort((a, b) => a.izq - b.izq);
      const celdaDe = (v) => celdas.findIndex((c) => v.izq >= c.izq - 1 && v.izq <= c.der + 1);
      const nombreDe = (v) => v.texto.split('\n')[0] || '(control)';
      // La primera parada es «Volver», de la barra: arriba de todo el contenido (3.12).
      t.ok(`${pre}: la primera parada de Tab es «Volver», sobre todo el contenido (la barra va primero en el DOM)`,
        visitados.length > 1 && visitados[0].texto === ''
          && visitados[0].arriba < Math.min(...visitados.slice(1).map((v) => v.arriba)), true);
      const retrocesos = [];
      for (let i = 2; i < visitados.length; i++) {
        const a = visitados[i - 1], b = visitados[i];
        if (i - 1 < posicionDeMezcla && i < posicionDeMezcla) {
          const ca = celdaDe(a), cb = celdaDe(b);
          const masAbajo = b.arriba > a.arriba + 1;
          const mismaFila = Math.abs(b.arriba - a.arriba) <= 24 && b.izq > a.izq;
          if (ca < 0 || cb < 0 || cb < ca || (cb === ca && !(masAbajo || mismaFila))) retrocesos.push(`${nombreDe(a)} → ${nombreDe(b)}`);
        } else if (b.arriba <= a.arriba + 1 && !(temas.includes(a) && temas.includes(b) && b.izq > a.izq)) {
          retrocesos.push(`${nombreDe(a)} → ${nombreDe(b)}`);
        }
      }
      t.ok(`${pre}: el orden de Tab coincide con el visual (sin retrocesos)`, retrocesos.join(' | '), '');
      const paradasDelPanel = visitados.slice(0, Math.max(posicionDeMezcla, 0));
      t.ok(`${pre}: las paradas del panel quedan arriba de la mezcla y de los temas`,
        paradasDelPanel.length > 0 && posicionDeMezcla > 0
          && paradasDelPanel.every((v) => v.arriba < visitados[posicionDeMezcla].arriba)
          && temas.every((v) => v.arriba > visitados[posicionDeMezcla].arriba), true);

      // Sin anclas ni recortes de foco, con la página en reposo y desplazada.
      const est = await pagina.evaluar(ESTRUCTURA_DE_REGIONES);
      t.ok(`${pre}: ninguna región queda fija (sin sticky ni fixed)`, est.fijos.join(', '), '');
      t.ok(`${pre}: ningún ancestro de un control recorta su contorno de foco`,
        est.recortes.map((r) => `${r.control} / ${r.ancestro} (${r.eje} ${r.overflow})`).slice(0, 3).join(' | '), '');
    }
  }
}

async function escritorioSinParcialesYDesplazado(pagina, base, t) {
  for (const oscuro of [false, true]) {
    const tema = oscuro ? 'oscuro' : 'claro';
    for (const ancho of [1024, 1366, 1920]) {
      const pre = `practice ${ancho} px ${tema}`;
      // V11: materia sin parciales; queda un solo filete y Fuente toma todo el sobrante.
      if (!await abrirTemas(pagina, base, { ancho, alto: 900, oscuro, materia: MATERIA_SIN_PARCIALES })) {
        t.ok(`${pre}: sin parciales abrió Elegir tema`, false, true);
      } else {
        const m = await medirTemas(pagina);
        t.ok(`${pre}: sin parciales, sin scroll horizontal`, m.desborda, false);
        t.ok(`${pre}: sin parciales, no hay grupo Parcial y queda un solo filete vertical`,
          !m.grupoParcial && m.divisoresVerticales.length === 1, true);
        t.ok(`${pre}: sin parciales, Fuente toma el sobrante y el Temporizador queda al borde del panel`,
          !!m.celdaFuente && !!m.celdaTemporizador
            && casi(m.celdaFuente.izq - m.panel.izq, RELLENO_PANEL)
            && casi(m.celdaTemporizador.der, m.panel.der - RELLENO_PANEL)
            && casi(m.celdaTemporizador.izq - m.celdaFuente.der, 2 * RELLENO_PANEL + 1), true);
      }

      // Página desplazada: ninguna región queda fija. Ventana baja para que haya scroll.
      if (!await abrirTemas(pagina, base, { ancho, alto: 500, oscuro })) {
        t.ok(`${pre}: ventana baja abrió Elegir tema`, false, true);
        continue;
      }
      const d = await pagina.evaluar(DESPLAZAR_Y_MEDIR_PANEL);
      t.ok(`${pre}: la pantalla tiene scroll con la ventana baja (precondición)`, d.desplazable && d.aplicado > 0, true);
      t.ok(`${pre}: con la página desplazada el panel se mueve con ella (no queda fijo)`,
        !!d.desplazable && casi(d.panel, d.aplicado), true);
      t.ok(`${pre}: con la página desplazada la mezcla se mueve con ella (no queda fija)`,
        !!d.desplazable && casi(d.mezcla, d.aplicado), true);
    }
  }
}

async function escritorioExamYVacios(pagina, base, t) {
  for (const oscuro of [false, true]) {
    const tema = oscuro ? 'oscuro' : 'claro';
    for (const ancho of [1023, 1024, 1366, 1920]) {
      const pre = `${ancho} px ${tema}`;
      // Modo examen: panel a ancho de hoja; tarjeta centrada con tope `lectura`.
      if (!await abrirTemas(pagina, base, { ancho, alto: 900, modo: 'exam', oscuro })) {
        t.ok(`exam ${pre}: abrió Elegir tema`, false, true);
      } else {
        const m = await medirTemas(pagina);
        await capturar(pagina, ancho, `temas-exam-${ancho}-${tema}.png`);
        t.ok(`exam ${pre}: sin scroll horizontal`, m.desborda, false);
        const chicos = m.interactivos.filter((c) => c.ancho > 0 && (c.alto < LADO_TACTIL || c.ancho < LADO_TACTIL));
        t.ok(`exam ${pre}: ningún control baja de 44 × 44`, chicos.length, 0);
        if (ancho < 1024) {
          t.ok(`exam ${pre}: bajo el corte, panel y tarjeta de a lo sumo ${COLUMNA} px`,
            !!m.panel && !!m.laminaExamen && m.panel.ancho <= COLUMNA + 1 && m.laminaExamen.ancho <= COLUMNA + 1, true);
        } else {
          const tope = topeDeHoja(ancho);
          t.ok(`exam ${pre}: el panel mide la hoja (${tope} px)`, !!m.panel && casi(m.panel.ancho, tope), true);
          t.ok(`exam ${pre}: los tres grupos van en una fila`,
            !!m.celdaParcial && casi(m.celdaFuente.arriba, m.celdaParcial.arriba) && m.divisoresVerticales.length === 2, true);
          t.ok(`exam ${pre}: la tarjeta «Modo Examen» mide ${TOPE_LECTURA} px (tope lectura)`,
            !!m.laminaExamen && casi(m.laminaExamen.ancho, TOPE_LECTURA), true);
          t.ok(`exam ${pre}: la tarjeta queda centrada en la ventana`,
            !!m.laminaExamen && casi(m.laminaExamen.izq, (m.vista - m.laminaExamen.ancho) / 2), true);
          t.ok(`exam ${pre}: «Comenzar examen» queda dentro de la tarjeta`,
            !!m.comenzar && !!m.laminaExamen && m.comenzar.izq >= m.laminaExamen.izq && m.comenzar.der <= m.laminaExamen.der, true);
        }
      }

      // failed sin fallos (V2): lámina `lectura`, centrada y anclada arriba, margen paso 6.
      if (!await abrirTemas(pagina, base, { ancho, alto: 900, modo: 'failed', oscuro })) {
        t.ok(`failed ${pre}: abrió Elegir tema`, false, true);
        continue;
      }
      const v = await medirTemas(pagina);
      await capturar(pagina, ancho, `temas-failed-vacio-${ancho}-${tema}.png`);
      t.ok(`failed ${pre}: sin scroll horizontal`, v.desborda, false);
      t.ok(`failed ${pre}: la lámina vacía tiene su botón «Practicar» de 44 × 44 como mínimo`,
        !!v.practicar && v.practicar.alto >= LADO_TACTIL && v.practicar.ancho >= LADO_TACTIL, true);
      if (ancho < 1024) {
        t.ok(`failed ${pre}: bajo el corte, lámina de a lo sumo ${COLUMNA} px`,
          !!v.lamina && v.lamina.ancho <= COLUMNA + 1, true);
      } else {
        t.ok(`failed ${pre}: la lámina vacía mide ${TOPE_LECTURA} px (tope lectura)`,
          !!v.lamina && casi(v.lamina.ancho, TOPE_LECTURA), true);
        t.ok(`failed ${pre}: la lámina vacía queda centrada en horizontal`,
          !!v.lamina && casi(v.lamina.izq, (v.vista - v.lamina.ancho) / 2), true);
        t.ok(`failed ${pre}: anclada arriba, a paso 6 de la barra`,
          !!v.lamina && !!v.barra && casi(v.lamina.arriba - v.barra.abajo, 6 * PASO), true);
      }
    }
  }
}

// ===========================================================================
// GRUPO B · tarea 2.10, plan B de D2 (Ilustracion.web.js: <svg> del DOM)
// ===========================================================================

module.exports = [
  { nombre: 'HeaderMarca: control Claro | Oscuro', correr: controlDeTema },
  { nombre: 'HeaderMarca: sin scroll horizontal y corte de 360 px', correr: sinScrollHorizontalYCorteDe360 },
  { nombre: 'HeaderMarca: teclado del control Claro | Oscuro', correr: tecladoDelControlDeTema },
  { nombre: 'HeaderMarca: control negativo del desborde', correr: controlNegativoDeDesborde },
  { nombre: 'HeaderMarca: hover sin halo ni box-shadow', correr: hoverSinHalo },
  { nombre: 'TopicSelect: filtros, separación y temporizador', correr: filtrosYSeparacion },
  { nombre: 'TopicSelect: mezcla y filas con conteo', correr: mezclaYFilas },
  { nombre: 'TopicSelect: variante exam', correr: varianteExam },
  { nombre: 'TopicSelect: vacíos V2, V4 y V5', correr: vaciosV2yV4 },
  { nombre: 'TopicSelect: carga sin V2 (VAC-P4) y V11', correr: vaciosCargaYSinParciales },
  { nombre: 'TopicSelect: carga que rechaza (finally)', correr: cargaQueRechazaMuestraV2 },
  { nombre: 'TopicSelect: V9, temas sin preguntas fuera de la lista', correr: temasSinPreguntasNoSeListan },
  { nombre: 'TopicSelect: estados K4', correr: estadosDeControl },
  { nombre: 'TopicSelect: estados K de todos los controles', correr: estadosDeTodosLosControles },
  { nombre: 'TopicSelect: sin desborde y 44 × 44 en claro y oscuro', correr: sinDesbordeNiCortes },
  { nombre: 'TopicSelect escritorio: practice, regiones, columnas y foco', correr: escritorioPractice },
  { nombre: 'TopicSelect escritorio: exam y vacíos en lectura', correr: escritorioExamYVacios },
  { nombre: 'TopicSelect escritorio: sin parciales y página desplazada', correr: escritorioSinParcialesYDesplazado },
];

// Suite «temas» del arnés end-to-end (ver ../README.md).

const { DESBORDES, EN_MARCO, LADO_TACTIL, MEDIR_PANTALLA, PASO, abrirMarco, clicEnMarco, esperarEnMarco, irAHomeEnMarco, medirAmbasPantallas } = require('./comunes');

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

// ===========================================================================
// GRUPO B · tarea 2.10, plan B de D2 (Ilustracion.web.js: <svg> del DOM)
// ===========================================================================

module.exports = [
  { nombre: 'HeaderMarca: control Claro | Oscuro', correr: controlDeTema },
  { nombre: 'HeaderMarca: sin scroll horizontal y corte de 360 px', correr: sinScrollHorizontalYCorteDe360 },
  { nombre: 'HeaderMarca: teclado del control Claro | Oscuro', correr: tecladoDelControlDeTema },
  { nombre: 'HeaderMarca: control negativo del desborde', correr: controlNegativoDeDesborde },
  { nombre: 'HeaderMarca: hover sin halo ni box-shadow', correr: hoverSinHalo },
];

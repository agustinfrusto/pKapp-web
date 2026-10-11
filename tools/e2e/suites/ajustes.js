// Suite «ajustes» del arnés end-to-end (ver ../README.md): `SettingsScreen` contra
// diseno/pantallas/Settings.md y el estado vacío V3 de Vacios.md (tarea 3.8).
//
// Mismo marco que las suites de HeaderMarca: la pantalla corre en un iframe del ancho
// pedido y se mide desde la página. Los colores computados se comparan con los tokens de
// `plancha` en claro y en oscuro.

const fs = require('fs');
const path = require('path');
const { plancha } = require('../../../src/theme/colores');
const { EN_MARCO, LADO_TACTIL, MATERIA, PASO, abrirMarco, clicEnMarco, esperarEnMarco } = require('./comunes');

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const pausa = (ms = 150) => new Promise((r) => setTimeout(r, ms));

// Hoja de texto visible con ese contenido (sin distinguir mayúsculas) y el control que la
// contiene, con sus colores computados.
const LEER_TEXTO = (texto) => EN_MARCO(`
  const t = ${JSON.stringify(texto.toLowerCase())};
  const hoja = visibles('*').find((n) =>
    n.children.length === 0 && n.textContent.trim().toLowerCase() === t);
  if (!hoja) return null;
  const f = w.getComputedStyle(hoja);
  const ctl = hoja.closest('[role="button"], [role="radio"], [tabindex]');
  const hr = hoja.getBoundingClientRect();
  let control = null;
  if (ctl) {
    const cr = ctl.getBoundingClientRect();
    const caja = ctl.firstElementChild || ctl;
    const k = w.getComputedStyle(caja);
    const svg = ctl.querySelector('svg');
    control = {
      x: cr.left, y: cr.top, ancho: cr.width, alto: cr.height,
      rol: ctl.getAttribute('role'),
      expandido: ctl.getAttribute('aria-expanded'),
      marcado: ctl.getAttribute('aria-checked'),
      fondo: k.backgroundColor, borde: k.borderTopColor, bordeAncho: k.borderTopWidth,
      glifo: svg ? svg.getAttribute('stroke') : null,
      glifoOculto: svg ? svg.getAttribute('aria-hidden') : null,
    };
  }
  return {
    color: f.color, tamano: f.fontSize,
    familia: f.fontFamily.split(',')[0].replace(/["']/g, '').trim(), mayusculas: f.textTransform,
    rect: { x: hr.left, y: hr.top, ancho: hr.width, alto: hr.height },
    control,
  };
`);

// Panel más cercano al texto: el primer ancestro con marco.
const LEER_PANEL = (texto) => EN_MARCO(`
  const t = ${JSON.stringify(texto.toLowerCase())};
  const hoja = visibles('*').find((n) =>
    n.children.length === 0 && n.textContent.trim().toLowerCase() === t);
  if (!hoja) return null;
  let n = hoja.parentElement;
  while (n && n !== d.body) {
    const k = w.getComputedStyle(n);
    if (parseFloat(k.borderTopWidth) > 0 && k.borderTopStyle === 'solid') {
      const r = n.getBoundingClientRect();
      return { fondo: k.backgroundColor, borde: k.borderTopColor, ancho: k.borderTopWidth,
        x: r.left, y: r.top, w: r.width, h: r.height,
        relleno: k.paddingLeft + ' ' + k.paddingTop };
    }
    n = n.parentElement;
  }
  return null;
`);

// Plegable (K3): distancia del texto y del chevron a los bordes del control, y giro del
// chevron (1 = apunta abajo, -1 = girado 180°).
const LEER_PLEGABLE = (texto) => EN_MARCO(`
  const t = ${JSON.stringify(texto.toLowerCase())};
  const hoja = visibles('*').find((n) =>
    n.children.length === 0 && n.textContent.trim().toLowerCase() === t);
  const ctl = hoja && hoja.closest('[role="button"]');
  const svg = ctl && ctl.querySelector('svg');
  if (!svg) return null;
  const cr = ctl.getBoundingClientRect(), hr = hoja.getBoundingClientRect();
  const sr = svg.getBoundingClientRect();
  const giro = w.getComputedStyle(svg.parentElement).transform;
  const mat = giro && giro !== 'none' ? giro.match(/matrix\\(([^)]+)\\)/) : null;
  return { izq: hr.left - cr.left, der: cr.right - sr.right, lado: sr.width,
    giro: mat ? Math.round(parseFloat(mat[1].split(',')[0])) : 1 };
`);

// Tarjeta de una pregunta propia: panel, tres textos (tema, enunciado, correcta), eliminar
// y la distancia entre el fondo de la tarjeta y el del cuerpo que la contiene.
const LEER_TARJETA = (enunciado) => EN_MARCO(`
  const t = ${JSON.stringify(enunciado.toLowerCase())};
  const hoja = visibles('*').find((n) =>
    n.children.length === 0 && n.textContent.trim().toLowerCase() === t);
  if (!hoja) return null;
  let tarjeta = hoja.parentElement;
  while (tarjeta && tarjeta !== d.body) {
    const k = w.getComputedStyle(tarjeta);
    if (parseFloat(k.borderTopWidth) > 0 && k.borderTopStyle === 'solid') break;
    tarjeta = tarjeta.parentElement;
  }
  const r = tarjeta.getBoundingClientRect(), k = w.getComputedStyle(tarjeta);
  const cuerpo = tarjeta.parentElement.getBoundingClientRect();
  const hojas = Array.from(tarjeta.querySelectorAll('*')).filter((n) =>
    n.children.length === 0 && n.textContent.trim() && !n.closest('[role="button"]'));
  const texto = (n) => { const f = w.getComputedStyle(n);
    return { texto: n.textContent.trim(), color: f.color, tamano: f.fontSize,
      familia: f.fontFamily.split(',')[0].replace(/["']/g, '').trim(), mayusculas: f.textTransform }; };
  const marca = hojas[2] ? hojas[2].parentElement.querySelector('svg') : null;
  const el = tarjeta.querySelector('[role="button"]');
  const er = el ? el.getBoundingClientRect() : null;
  const esvg = el ? el.querySelector('svg') : null;
  return {
    x: r.left, y: r.top, abajo: r.bottom, ancho: r.width,
    fondo: k.backgroundColor, borde: k.borderTopColor, bordeAncho: k.borderTopWidth,
    relleno: k.paddingLeft + ' ' + k.paddingTop,
    aFondoDelCuerpo: cuerpo.bottom - r.bottom,
    textos: hojas.map(texto),
    correctaGlifo: marca ? marca.getAttribute('stroke') : null,
    correctaGlifoOculto: marca ? marca.getAttribute('aria-hidden') : null,
    eliminar: el ? { nombre: el.getAttribute('aria-label'), x: er.left, y: er.top,
      ancho: er.width, alto: er.height, glifo: esvg ? esvg.getAttribute('stroke') : null } : null,
  };
`);

// Padding del contenedor del scroll (primer ancestro con relleno vertical).
const LEER_SCROLL = EN_MARCO(`
  const hoja = visibles('*').find((n) =>
    n.children.length === 0 && n.textContent.trim().toLowerCase() === 'cuestionario');
  let n = hoja && hoja.parentElement;
  while (n && n !== d.body) {
    const k = w.getComputedStyle(n);
    if (parseFloat(k.paddingTop) > 0 && parseFloat(k.paddingBottom) > 0) {
      return { arriba: k.paddingTop, abajo: k.paddingBottom };
    }
    n = n.parentElement;
  }
  return null;
`);

const TEXTO_PANTALLA = EN_MARCO('return d.body.innerText;');
const RUTA = EN_MARCO('return w.location.pathname;');
const HAY_DESBORDE = EN_MARCO('return desbordes().length > 0;');

async function clicTexto(pagina, texto) {
  const l = await pagina.evaluar(LEER_TEXTO(texto));
  if (!l || !l.control) return false;
  await pagina.clicEn(Math.round(l.control.x + l.control.ancho / 2), Math.round(l.control.y + l.control.alto / 2));
  return true;
}

// Selector → Home → Ajustes, en el tema pedido.
async function irAAjustes(pagina, base, ancho, tema, sembrar = null) {
  await abrirMarco(pagina, base, ancho, 900);
  if (sembrar) await pagina.evaluar(sembrar);
  if (tema === 'oscuro') {
    await clicEnMarco(pagina, 'oscuro');
    await pagina.esperarA(() => pagina.evaluar(
      EN_MARCO(`return d.documentElement.classList.contains('dark');`)));
  }
  await clicEnMarco(pagina, MATERIA);
  await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/inicio');
  await esperarEnMarco(pagina, 'Ajustes');
  await clicEnMarco(pagina, 'Ajustes');
  const llego = await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/ajustes');
  if (llego) await esperarEnMarco(pagina, 'Cuestionario');
  return llego;
}

async function volverAClaro(pagina) {
  await pagina.evaluar(`(function () {
    const a = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
    a.tema = 'claro';
    localStorage.setItem('pkapp_settings', JSON.stringify(a));
  })()`);
}

async function pantalla(pagina, base, t, tema) {
  const T = plancha[tema];
  const c = (s) => `${tema} · Ajustes · ${s}`;
  t.ok(c('llega a /ajustes'), await irAAjustes(pagina, base, 390, tema), true);

  // Sin emojis ni símbolos de plegado, de salida o de cierre (D9, comun.md §9)
  const texto = await pagina.evaluar(TEXTO_PANTALLA);
  t.ok(c('sin emojis ni símbolos de ícono'),
    /[\p{Extended_Pictographic}▲▼×↗✕]/u.test(texto), false);

  // Contenedor del scroll: relleno superior paso 4 e inferior paso 8 (a.1)
  const scroll = await pagina.evaluar(LEER_SCROLL);
  t.ok(c('contenido: relleno superior paso 4 e inferior paso 8'),
    scroll && `${scroll.arriba}|${scroll.abajo}`, `${4 * PASO}px|${8 * PASO}px`);

  // Rótulos de sección: `acento`, paso `rotulo`, en mayúsculas
  for (const nombre of ['Cuestionario', 'Mis preguntas', 'Tus datos', 'Acerca de']) {
    const r = await pagina.evaluar(LEER_TEXTO(nombre));
    t.ok(c(`rótulo «${nombre}» en acento, rotulo, mayúsculas`),
      r && `${r.color}|${r.tamano}|${r.familia}|${r.mayusculas}`,
      `${rgb(T.acento)}|11px|PlexMono-Regular|uppercase`);
  }

  // Cuestionario: panel con marco `linea`, título y descripción, segmentado «No | Sí»
  const titulo = await pagina.evaluar(LEER_TEXTO('Ocultar resultado hasta el final'));
  t.ok(c('título del ajuste en tinta, item'),
    titulo && `${titulo.color}|${titulo.tamano}`, `${rgb(T.tinta)}|16px`);
  const desc = await pagina.evaluar(
    LEER_TEXTO('Respondé sin ver si acertás. Al terminar, revisás todo junto.'));
  t.ok(c('descripción en tintaSec, detalle'), desc && `${desc.color}|${desc.tamano}`, `${rgb(T.tintaSec)}|13px`);
  const panel = await pagina.evaluar(LEER_PANEL('Ocultar resultado hasta el final'));
  t.ok(c('panel: superficie con marco linea border'),
    panel && `${panel.fondo} ${panel.ancho} ${panel.borde}`, `${rgb(T.superficie)} 1px ${rgb(T.linea)}`);
  t.ok(c('panel: relleno paso 3.5'), panel && panel.relleno, `${3.5 * PASO}px ${3.5 * PASO}px`);

  const grupo = await pagina.evaluar(EN_MARCO(`
    const g = visibles('[role="radiogroup"]').find((n) =>
      (n.getAttribute('aria-label') || '') === 'Ocultar resultado hasta el final');
    if (!g) return null;
    const k = w.getComputedStyle(g);
    return { fondo: k.backgroundColor, borde: k.borderTopColor, ancho: k.borderTopWidth,
      opciones: Array.from(g.querySelectorAll('[role="radio"]')).map((n) => ({
        texto: n.textContent.trim(), marcado: n.getAttribute('aria-checked'),
        ancho: n.getBoundingClientRect().width, alto: n.getBoundingClientRect().height })) };
  `));
  t.ok(c('segmentado: grupo con el nombre del ajuste'), grupo !== null, true);
  if (grupo) {
    t.ok(c('segmentado: contenedor superficie con marco linea border'),
      `${grupo.fondo} ${grupo.ancho} ${grupo.borde}`, `${rgb(T.superficie)} 1px ${rgb(T.linea)}`);
    t.ok(c('segmentado: opciones «No» y «Sí», en ese orden'),
      grupo.opciones.map((o) => o.texto.toLowerCase()).join('|'), 'no|sí');
    t.ok(c('segmentado: «No» marcada por defecto'), grupo.opciones.map((o) => o.marcado).join('|'), 'true|false');
    t.ok(c('segmentado: opciones de 44 × 44 como mínimo'),
      grupo.opciones.every((o) => o.ancho >= LADO_TACTIL && o.alto >= LADO_TACTIL), true);
  }
  const no = await pagina.evaluar(LEER_TEXTO('No'));
  t.ok(c('segmentado: «No» seleccionada, fondo tinta y texto fondo'),
    no && `${no.control.fondo}|${no.color}`, `${rgb(T.tinta)}|${rgb(T.fondo)}`);
  const si = await pagina.evaluar(LEER_TEXTO('Sí'));
  t.ok(c('segmentado: «Sí» en reposo, texto tinta, rotulo'),
    si && `${si.color}|${si.tamano}|${si.familia}`, `${rgb(T.tinta)}|11px|PlexMono-Regular`);

  // Un gesto guarda el ajuste (SET-C3) y la selección se invierte
  await clicTexto(pagina, 'Sí');
  await pausa();
  const guardado = await pagina.evaluar(
    `JSON.parse(localStorage.getItem('pkapp_settings') || '{}').hide_feedback`);
  t.ok(c('tocar «Sí» guarda hide_feedback'), String(guardado), 'true');
  const siMarcada = await pagina.evaluar(LEER_TEXTO('Sí'));
  t.ok(c('tocar «Sí» la deja marcada'), siMarcada && siMarcada.control.marcado, 'true');
  await clicTexto(pagina, 'No');
  await pausa();
  t.ok(c('tocar «No» guarda hide_feedback en falso'),
    String(await pagina.evaluar(`JSON.parse(localStorage.getItem('pkapp_settings') || '{}').hide_feedback`)),
    'false');

  // Mis preguntas: plegable K3 cerrado y, abierto, el estado vacío V3 (VAC-P2)
  const nombre = '0 preguntas propias';
  const cerrado = await pagina.evaluar(LEER_TEXTO(nombre));
  t.ok(c('plegable «0 preguntas propias»: aria-expanded false'),
    cerrado && cerrado.control.expandido, 'false');
  t.ok(c('plegable cerrado: borde `borde`, fondo superficie'),
    cerrado && `${cerrado.control.borde}|${cerrado.control.fondo}`, `${rgb(T.borde)}|${rgb(T.superficie)}`);
  t.ok(c('plegable: alto de 44 como mínimo y ancho completo'),
    cerrado && cerrado.control.alto >= LADO_TACTIL && cerrado.control.ancho >= 390 - 2 * 5 * PASO - 1, true);
  t.ok(c('plegable cerrado: glifo-chevron en acento, decorativo'),
    cerrado && `${cerrado.control.glifo}|${cerrado.control.glifoOculto}`, `${T.acento}|true`);
  const pleg = await pagina.evaluar(LEER_PLEGABLE(nombre));
  t.ok(c('plegable: texto y chevron a paso 3.5 del borde (a.3)'),
    pleg && `${pleg.izq}|${pleg.der}`, `${1 + 3.5 * PASO}|${1 + 3.5 * PASO}`);
  t.ok(c('plegable cerrado: chevron chico (paso 4) apuntando abajo'),
    pleg && `${pleg.lado}|${pleg.giro}`, `${4 * PASO}|1`);
  const ver = await pagina.evaluar(LEER_TEXTO('Ver'));
  t.ok(c('palabra «Ver» en acento'), ver && ver.color, rgb(T.acento));

  await clicTexto(pagina, nombre);
  await pausa();
  const abierto = await pagina.evaluar(LEER_TEXTO(nombre));
  t.ok(c('plegable abierto: aria-expanded true y borde linea'),
    abierto && `${abierto.control.expandido}|${abierto.control.borde}`, `true|${rgb(T.linea)}`);
  t.ok(c('plegable abierto: palabra «Ocultar»'), !!(await pagina.evaluar(LEER_TEXTO('Ocultar'))), true);
  const plegAbierto = await pagina.evaluar(LEER_PLEGABLE(nombre));
  t.ok(c('plegable abierto: chevron girado 180° y relleno paso 3.5'),
    plegAbierto && `${plegAbierto.giro}|${plegAbierto.izq}|${plegAbierto.der}`,
    `-1|${1 + 3.5 * PASO}|${1 + 3.5 * PASO}`);

  const mensaje = await pagina.evaluar(
    LEER_TEXTO('No agregaste preguntas todavía. Usá "Agregar pregunta" en el menú principal.'));
  t.ok(c('V3: mensaje compacto'), mensaje !== null, true);
  t.ok(c('V3: mensaje en tintaSec, detalle'),
    mensaje && `${mensaje.color}|${mensaje.tamano}`, `${rgb(T.tintaSec)}|13px`);
  const panelV3 = await pagina.evaluar(LEER_PANEL(
    'No agregaste preguntas todavía. Usá "Agregar pregunta" en el menú principal.'));
  t.ok(c('V3: panel superficie con marco linea border'),
    panelV3 && `${panelV3.fondo} ${panelV3.ancho} ${panelV3.borde}`, `${rgb(T.superficie)} 1px ${rgb(T.linea)}`);
  const accion = await pagina.evaluar(LEER_TEXTO('Agregar pregunta'));
  t.ok(c('V3: botón «Agregar pregunta» (K2): texto tinta, borde linea'),
    accion && accion.control && `${accion.color}|${accion.control.borde}|${accion.control.bordeAncho}`,
    `${rgb(T.tinta)}|${rgb(T.linea)}|1px`);
  t.ok(c('V3: botón de 44 de alto como mínimo'),
    accion && accion.control && accion.control.alto >= LADO_TACTIL, true);

  // Tus datos: web, con respaldo y reseteo
  const datos = 'Respaldo y reseteo';
  await clicTexto(pagina, datos);
  await pausa();
  const descargar = await pagina.evaluar(LEER_TEXTO('Descargar respaldo'));
  const importar = await pagina.evaluar(LEER_TEXTO('Importar respaldo'));
  const resetear = await pagina.evaluar(LEER_TEXTO('Resetear estadísticas'));
  t.ok(c('«Descargar respaldo» (K3): borde borde, texto tinta, glifo delante'),
    descargar && `${descargar.control.borde}|${descargar.color}|${descargar.control.glifo}`,
    `${rgb(T.borde)}|${rgb(T.tinta)}|${T.tinta}`);
  t.ok(c('«Importar respaldo» (K1): fondo tinta, texto fondo'),
    importar && `${importar.control.fondo}|${importar.color}|${importar.control.glifo}`,
    `${rgb(T.tinta)}|${rgb(T.fondo)}|${T.fondo}`);
  t.ok(c('«Resetear estadísticas» (K2 de peligro): borde y texto error, fondo superficie'),
    resetear && `${resetear.control.borde}|${resetear.color}|${resetear.control.fondo}`,
    `${rgb(T.error)}|${rgb(T.error)}|${rgb(T.superficie)}`);
  const botones = [descargar, importar, resetear];
  t.ok(c('botones de respaldo: 44 de alto y paso 2 entre ellos'),
    botones.every(Boolean) && botones.every((b) => b.control.alto >= LADO_TACTIL)
      && botones.every((b, i) => i === 0 || b.control.y - (botones[i - 1].control.y + botones[i - 1].control.alto) >= 2 * PASO - 0.5),
    true);

  // Acerca de: identidad, banco y enlaces K2 de acento
  const reportar = await pagina.evaluar(LEER_TEXTO('Reportar un error'));
  const codigo = await pagina.evaluar(LEER_TEXTO('Código fuente'));
  for (const [nombreEnlace, e] of [['Reportar un error', reportar], ['Código fuente', codigo]]) {
    t.ok(c(`«${nombreEnlace}» (K2 de acento): borde y texto acento, fondo superficie`),
      e && `${e.control.borde}|${e.color}|${e.control.fondo}|${e.control.bordeAncho}`,
      `${rgb(T.acento)}|${rgb(T.acento)}|${rgb(T.superficie)}|1px`);
    t.ok(c(`«${nombreEnlace}»: 44 de alto como mínimo y glifo decorativo`),
      e && e.control.alto >= LADO_TACTIL && e.control.glifoOculto === 'true', true);
  }
  t.ok(c('enlaces de «Acerca de»: paso 2 entre ellos si están en la misma fila'),
    reportar && codigo && (Math.abs(reportar.control.y - codigo.control.y) > 1
      || codigo.control.x - (reportar.control.x + reportar.control.ancho) >= 2 * PASO - 0.5), true);
  const pk = await pagina.evaluar(LEER_TEXTO('pKapp'));
  t.ok(c('«pKapp» en tinta, item'), pk && `${pk.color}|${pk.tamano}`, `${rgb(T.tinta)}|16px`);
  const identidad = await pagina.evaluar(LEER_TEXTO('Preparación para ESFUNO'));
  t.ok(c('«Preparación para ESFUNO» en tintaSec, detalle'),
    identidad && `${identidad.color}|${identidad.tamano}`, `${rgb(T.tintaSec)}|13px`);
  t.ok(c('versión visible'), /v\d+\.\d+\.\d+/i.test(await pagina.evaluar(TEXTO_PANTALLA)), true);

  t.ok(c('sin scroll horizontal a 390'), await pagina.evaluar(HAY_DESBORDE), false);

  // El botón de V3 navega a AddQuestion, un solo toque (VAC-P2)
  await clicTexto(pagina, 'Agregar pregunta');
  t.ok(c('V3: «Agregar pregunta» lleva a /agregar'),
    await pagina.esperarA(async () => await pagina.evaluar(RUTA) === '/agregar'), true);

  if (tema === 'oscuro') await volverAClaro(pagina);
}

// Sin scroll horizontal, con todo abierto, y objetivos de 44 × 44 en cada ancho (D10).
async function anchos(pagina, base, t) {
  for (const ancho of [320, 360, 390, 768, 1280]) {
    const c = (s) => `${ancho} px · Ajustes · ${s}`;
    const llego = await irAAjustes(pagina, base, ancho, 'claro');
    t.ok(c('llega a /ajustes'), llego, true);
    if (!llego) continue;
    await clicTexto(pagina, '0 preguntas propias');
    await clicTexto(pagina, 'Respaldo y reseteo');
    await pausa(250);
    t.ok(c('sin scroll horizontal con los plegables abiertos'), await pagina.evaluar(HAY_DESBORDE), false);
    const medidas = await pagina.evaluar(EN_MARCO(`
      const cs = visibles('[role="button"], [role="radio"], [tabindex="0"]');
      return { n: cs.length,
        chicos: cs.filter((n) => { const r = n.getBoundingClientRect();
          return r.width < ${LADO_TACTIL} - 0.5 || r.height < ${LADO_TACTIL} - 0.5; })
          .map((n) => (n.textContent || n.getAttribute('aria-label') || '?').trim().slice(0, 30)),
        columna: Math.max(...visibles('[role="radiogroup"]').map((n) => n.getBoundingClientRect().right)) };
    `));
    t.ok(c('hay controles'), medidas.n > 0, true);
    t.ok(c('ningún control mide menos de 44 × 44'), JSON.stringify(medidas.chicos), '[]');
    if (ancho >= 768) {
      const panel = await pagina.evaluar(LEER_PANEL('Ocultar resultado hasta el final'));
      t.ok(c('una columna de 448 − 2 × paso 5 como máximo'), panel && Math.round(panel.w) <= 448, true);
    }
  }
}

// Con preguntas propias y estadísticas: la rama «con preguntas» (a.4), eliminar y resetear.
const SEMBRADO = `(function () {
  const ahora = Date.now();
  localStorage.setItem('pkapp_user_questions:bcyt', JSON.stringify([
    { id: 'USER-e2e-1', topic: 'enzimas', question: 'Primera pregunta propia de prueba',
      options: JSON.stringify(['Opción A', 'Opción B', 'Opción C']), correct_index: 1,
      explanation: '', created_at: ahora },
    { id: 'USER-e2e-2', topic: 'enzimas', question: 'Segunda pregunta propia de prueba',
      options: JSON.stringify(['Opción D', 'Opción E']), correct_index: 0,
      explanation: '', created_at: ahora },
  ]));
  localStorage.setItem('pkapp_question_stats:bcyt', JSON.stringify(
    { 'e2e-q': { times_answered: 2, times_correct: 1, last_answered_at: ahora } }));
})()`;
const LIMPIAR = `(function () {
  localStorage.removeItem('pkapp_user_questions:bcyt');
  localStorage.removeItem('pkapp_question_stats:bcyt');
})()`;
const IDS_PROPIAS = `JSON.stringify((JSON.parse(
  localStorage.getItem('pkapp_user_questions:bcyt') || '[]')).map((q) => q.id))`;
const HAY_STATS = `localStorage.getItem('pkapp_question_stats:bcyt') !== null`;

async function conDatos(pagina, base, t, tema) {
  const T = plancha[tema];
  const c = (s) => `${tema} · Ajustes con datos · ${s}`;
  try {
    t.ok(c('llega a /ajustes'), await irAAjustes(pagina, base, 390, tema, SEMBRADO), true);

    // Contador en plural y tarjetas
    const nombre = '2 preguntas propias';
    t.ok(c('plegable «2 preguntas propias» (plural)'), !!(await pagina.evaluar(LEER_TEXTO(nombre))), true);
    await clicTexto(pagina, nombre);
    await pausa();
    const a = await pagina.evaluar(LEER_TARJETA('Primera pregunta propia de prueba'));
    const b = await pagina.evaluar(LEER_TARJETA('Segunda pregunta propia de prueba'));
    t.ok(c('hay dos tarjetas'), a !== null && b !== null, true);
    if (!a || !b) return;

    t.ok(c('tarjeta: panel superficie con marco linea border'),
      `${a.fondo} ${a.bordeAncho} ${a.borde}`, `${rgb(T.superficie)} 1px ${rgb(T.linea)}`);
    t.ok(c('tarjeta: relleno paso 3.5'), a.relleno, `${3.5 * PASO}px ${3.5 * PASO}px`);
    const [tem, enun, cor] = a.textos;
    t.ok(c('tarjeta: tema en acento, rotulo, mayúsculas, con el nombre del tema'),
      tem && `${tem.texto}|${tem.color}|${tem.tamano}|${tem.familia}|${tem.mayusculas}`,
      `Enzimas y cinética enzimática|${rgb(T.acento)}|11px|PlexMono-Regular|uppercase`);
    t.ok(c('tarjeta: enunciado en tinta, cuerpo'),
      enun && `${enun.texto}|${enun.color}|${enun.tamano}`,
      `Primera pregunta propia de prueba|${rgb(T.tinta)}|15px`);
    t.ok(c('tarjeta: correcta en acierto, detalle, con glifo-acierto decorativo'),
      cor && `${cor.texto}|${cor.color}|${cor.tamano}|${a.correctaGlifo}|${a.correctaGlifoOculto}`,
      `Opción B|${rgb(T.acierto)}|13px|${T.acierto}|true`);
    t.ok(c('tarjeta: eliminar con nombre, 44 × 44 y glifo tintaSec'),
      a.eliminar && `${a.eliminar.nombre}|${a.eliminar.ancho}×${a.eliminar.alto}|${a.eliminar.glifo}`,
      `Eliminar pregunta|${LADO_TACTIL}×${LADO_TACTIL}|${T.tintaSec}`);
    t.ok(c('tarjetas separadas por paso 2.5'), b.y - a.abajo, 2.5 * PASO);
    t.ok(c('la última tarjeta no deja margen inferior sobre el cuerpo'), b.aFondoDelCuerpo, 0);

    // Eliminar: cancelar no borra; aceptar borra y el contador pasa al singular
    pagina.dialogos.length = 0;
    pagina.respuestaDialogo = 'cancelar';
    await pagina.clicEn(Math.round(a.eliminar.x + a.eliminar.ancho / 2), Math.round(a.eliminar.y + a.eliminar.alto / 2));
    t.ok(c('eliminar pide confirmación'),
      await pagina.esperarA(() => pagina.dialogos.length === 1), true);
    t.ok(c('eliminar: texto de la confirmación'),
      pagina.dialogos[0], 'Eliminar pregunta\n\n¿Seguro? Esta acción no se puede deshacer.');
    t.ok(c('eliminar: cancelar conserva las dos preguntas'),
      await pagina.evaluar(IDS_PROPIAS), JSON.stringify(['USER-e2e-1', 'USER-e2e-2']));
    pagina.respuestaDialogo = 'aceptar';
    await pagina.clicEn(Math.round(a.eliminar.x + a.eliminar.ancho / 2), Math.round(a.eliminar.y + a.eliminar.alto / 2));
    t.ok(c('eliminar: aceptar borra solo esa pregunta'),
      await pagina.esperarA(async () =>
        await pagina.evaluar(IDS_PROPIAS) === JSON.stringify(['USER-e2e-2'])), true);
    t.ok(c('plegable «1 pregunta propia» (singular)'),
      await pagina.esperarA(async () => !!(await pagina.evaluar(LEER_TEXTO('1 pregunta propia')))), true);
    pagina.respuestaDialogo = 'cancelar';

    // Resetear estadísticas: cancelar conserva, aceptar borra y avisa
    await clicTexto(pagina, 'Respaldo y reseteo');
    await pausa();
    pagina.dialogos.length = 0;
    t.ok(c('hay estadísticas antes de resetear'), await pagina.evaluar(HAY_STATS), true);
    await clicTexto(pagina, 'Resetear estadísticas');
    t.ok(c('resetear pide confirmación'),
      await pagina.esperarA(() => pagina.dialogos.length === 1), true);
    t.ok(c('resetear: texto de la confirmación'), pagina.dialogos[0],
      'Resetear estadísticas\n\n¿Seguro que querés borrar todas las estadísticas? Esto no se puede deshacer.');
    t.ok(c('resetear: cancelar conserva las estadísticas'), await pagina.evaluar(HAY_STATS), true);
    pagina.respuestaDialogo = 'aceptar';
    await clicTexto(pagina, 'Resetear estadísticas');
    t.ok(c('resetear: aceptar borra las estadísticas'),
      await pagina.esperarA(async () => !(await pagina.evaluar(HAY_STATS))), true);
    t.ok(c('resetear: avisa «Estadísticas borradas.»'),
      await pagina.esperarA(() => pagina.dialogos.includes('Listo\n\nEstadísticas borradas.')), true);
  } finally {
    pagina.respuestaDialogo = 'cancelar';
    await pagina.evaluar(LIMPIAR);
    if (tema === 'oscuro') await volverAClaro(pagina);
  }
}

// Cero literales visuales en la pantalla (aceptación común, C6): tamaños, ángulos y
// medidas van por token o por clase, no por número.
const LITERALES = [
  [/size=\{\d+\}/, 'tamaño numérico'],
  [/['"]-?\d+deg['"]/, 'ángulo'],
  [/\b(padding|margin)\w*:\s*-?\d/, 'relleno o margen numérico'],
  [/\b\d+(\.\d+)?px\b/, 'medida en px'],
];

function sinLiterales(_pagina, _base, t) {
  const archivo = path.resolve(__dirname, '..', '..', '..', 'src', 'screens', 'SettingsScreen.js');
  const hallados = [];
  fs.readFileSync(archivo, 'utf8').split('\n').forEach((linea, i) => {
    const codigo = linea.replace(/\/\/.*$/, '');
    for (const [patron, que] of LITERALES) if (patron.test(codigo)) hallados.push(`${i + 1}: ${que}`);
  });
  t.ok('SettingsScreen.js: sin literales visuales', hallados.join(' | '), '');
}

module.exports = [
  { nombre: 'Ajustes: la pantalla en claro contra su ficha', correr: (p, b, t) => pantalla(p, b, t, 'claro') },
  { nombre: 'Ajustes: la pantalla en oscuro contra su ficha', correr: (p, b, t) => pantalla(p, b, t, 'oscuro') },
  { nombre: 'Ajustes: sin scroll horizontal ni objetivos chicos a 320, 360, 390, 768 y 1280', correr: anchos },
  { nombre: 'Ajustes: con preguntas propias, eliminar y resetear en claro', correr: (p, b, t) => conDatos(p, b, t, 'claro') },
  { nombre: 'Ajustes: con preguntas propias, eliminar y resetear en oscuro', correr: (p, b, t) => conDatos(p, b, t, 'oscuro') },
  { nombre: 'Ajustes: SettingsScreen.js sin literales visuales', correr: sinLiterales },
];

// Suite «ajustes» del arnés end-to-end (ver ../README.md): `SettingsScreen` contra
// diseno/pantallas/Settings.md y el estado vacío V3 de Vacios.md (tarea 3.8).
//
// Mismo marco que las suites de HeaderMarca: la pantalla corre en un iframe del ancho
// pedido y se mide desde la página. Los colores computados se comparan con los tokens de
// `plancha` en claro y en oscuro.

const fs = require('fs');
const path = require('path');
const { plancha } = require('../../../src/theme/colores');
const { conectarNavegador, abrirPagina } = require('../cdp');
const { CORTE_ESCRITORIO, ANCHOS } = require('../../../src/components/plancha/cortes');
const { CONTEOS } = require('../../../src/materias/conteos');
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
// chevron medido por el seno de su matriz (1 = apunta abajo, -1 = arriba, 0 = sin giro, a la derecha).
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
    giro: mat ? Math.round(parseFloat(mat[1].split(',')[1])) : 0 };
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
async function irAAjustes(pagina, base, ancho, tema, sembrar = null, alto = 900) {
  await abrirMarco(pagina, base, ancho, alto);
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
  t.ok(c('plegable cerrado: chevron chico (paso 4) apuntando abajo (D-01)'),
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
  t.ok(c('plegable abierto: chevron apuntando arriba y relleno paso 3.5 (D-01)'),
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

  // SET-P3 (S2, S4): sin propias el desglose omite «generadas» (el banco no tiene ninguna).
  const sinPropias = await pagina.evaluar(TEXTO_PANTALLA);
  t.ok(c('S2: «Acerca de» sin propias: «{n} de exámenes · 0 tuyas»'),
    !!(await pagina.evaluar(LEER_TEXTO(`${CONTEOS.bcyt} de exámenes · 0 tuyas`))), true);
  t.ok(c('S2: sin «generadas» en la pantalla'), /generadas/i.test(sinPropias), false);

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
    if (ancho >= 768 && ancho < CORTE_ESCRITORIO) {
      const panel = await pagina.evaluar(LEER_PANEL('Ocultar resultado hasta el final'));
      t.ok(c('una columna de 448 − 2 × paso 5 como máximo'), panel && Math.round(panel.w) <= 448, true);
    }
  }
}

// Escritorio (ESC-P8, Settings.md «Escritorio»): desde el corte, «Acerca de» en la región
// lateral de la derecha y el resto en la principal. Bajo el corte, la columna de siempre.
const SEPARACION = 8 * PASO;
const LEER_ESCRITORIO = EN_MARCO(`
  const rotulo = (t) => visibles('*').find((n) =>
    n.children.length === 0 && n.textContent.trim().toLowerCase() === t.toLowerCase());
  const caja = (n) => { if (!n) return null; const r = n.getBoundingClientRect();
    return { x: r.left, y: r.top, der: r.right, abajo: r.bottom, ancho: r.width, alto: r.height }; };
  const panelDe = (n) => { let p = n && n.parentElement;
    while (p && p !== d.body) { const k = w.getComputedStyle(p);
      if (parseFloat(k.borderTopWidth) > 0 && k.borderTopStyle === 'solid') return p;
      p = p.parentElement; } return null; };
  const control = (t) => { const n = rotulo(t); return caja(n && n.closest('[role="button"], [tabindex]')); };
  const foco = visibles('[role="button"], [role="radio"], [tabindex="0"]');
  return {
    vista: w.innerWidth,
    desborda: desbordes().length > 0,
    cuestionario: caja(rotulo('Cuestionario')),
    preguntas: caja(rotulo('Mis preguntas')),
    datos: caja(rotulo('Tus datos')),
    acerca: caja(rotulo('Acerca de')),
    panelCuestionario: caja(panelDe(rotulo('Ocultar resultado hasta el final'))),
    panelAcerca: caja(panelDe(rotulo('pKapp'))),
    pkapp: caja(rotulo('pKapp')),
    esfuno: caja(rotulo('Preparación para ESFUNO')),
    reportar: control('Reportar un error'),
    codigo: control('Código fuente'),
    plegableDatos: control('Respaldo y reseteo'),
    tarjetas: visibles('[aria-label="Eliminar pregunta"]').length,
    anchoTarjetas: visibles('[aria-label="Eliminar pregunta"]')
      .map((n) => { const p = panelDe(n); return p ? p.getBoundingClientRect().width : 0; }).join('|'),
    descargar: control('Descargar respaldo'),
    resetear: control('Resetear estadísticas'),
    chicos: foco.filter((n) => { const r = n.getBoundingClientRect();
      return r.width < ${LADO_TACTIL} - 0.5 || r.height < ${LADO_TACTIL} - 0.5; })
      .map((n) => (n.textContent || n.getAttribute('aria-label') || '?').trim().slice(0, 30)),
  };
`);

// Coordenadas de PÁGINA de un nodo: su posición en la ventana más lo que desplazó cada
// ancestro. Con la pantalla desplazada, la posición en la ventana cambia aunque el orden
// visual no (ORDEN_DE_FOCO y COLA miden con esto, no con `getBoundingClientRect` solo).
const PAGINA = `
  const pag = (n) => { const r = n.getBoundingClientRect(); let x = r.left, y = r.top;
    for (let p = n.parentElement; p; p = p.parentElement) { x += p.scrollLeft; y += p.scrollTop; }
    return { x, y, abajo: y + r.height, ancho: r.width, alto: r.height }; };
`;

// Recorre Tab y devuelve, de la parada actual, su nombre y su posición en la PÁGINA.
const ORDEN_DE_FOCO = EN_MARCO(`
  ${PAGINA}
  const f = d.activeElement;
  if (!f || f === d.body) return null;
  const p = pag(f);
  return { nombre: (f.getAttribute('aria-label') || f.textContent || '?').trim().slice(0, 40),
    rol: f.getAttribute('role'), x: p.x, y: p.y };
`);

// Anclado: ningún ancestro de los primeros bloques de cada región es `sticky` ni `fixed`.
const ANCLAS_AJUSTES = EN_MARCO(`
  const res = [];
  for (const t of ['cuestionario', 'mis preguntas', 'tus datos', 'acerca de']) {
    const h = visibles('*').find((n) => n.children.length === 0 && n.textContent.trim().toLowerCase() === t);
    for (let n = h; n && n !== d.body; n = n.parentElement) {
      const p = w.getComputedStyle(n).position;
      if (p === 'sticky' || p === 'fixed') res.push(t + '<' + (n.getAttribute('data-testid') || n.tagName) + ':' + p);
    }
  }
  return res;
`);

// Foco: ancestros de un control enfocable con `overflow` distinto de `visible`, salvo el
// scroller de la pantalla (el más externo): recortarían el contorno de foco en los cuatro bordes.
const RECORTES_DE_FOCO = EN_MARCO(`
  const res = new Set();
  for (const c of visibles('[role="button"], [role="radio"], [tabindex="0"]')) {
    const cadena = [];
    for (let n = c.parentElement; n && n !== d.body && n !== d.documentElement; n = n.parentElement) {
      const k = w.getComputedStyle(n);
      if (k.overflowX !== 'visible' || k.overflowY !== 'visible') cadena.push(n);
    }
    cadena.pop();
    for (const n of cadena) {
      const k = w.getComputedStyle(n);
      res.add((n.getAttribute('data-testid') || n.tagName) + ':' + k.overflowX + '/' + k.overflowY);
    }
  }
  return Array.from(res);
`);

// Desplaza el scroller de la pantalla y devuelve cuánto se desplazó de verdad.
const DESPLAZAR_AJUSTES = (px) => EN_MARCO(`
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

// Cola: de lo último que pinta la pantalla al final del scroll (relleno inferior, a.1 #6, y
// la separación inferior del último bloque).
const COLA = EN_MARCO(`
  ${PAGINA}
  const h = visibles('*').find((n) => n.children.length === 0 && n.textContent.trim().toLowerCase() === 'cuestionario');
  let sc = h && h.parentElement;
  while (sc && sc !== d.body) {
    const o = w.getComputedStyle(sc).overflowY;
    if (o === 'auto' || o === 'scroll') break;
    sc = sc.parentElement;
  }
  if (!sc || sc === d.body) return null;
  const base = pag(sc).y;
  let piso = 0;
  for (const n of visibles('*')) {
    if (!sc.contains(n) || n === sc) continue;
    const k = w.getComputedStyle(n);
    const marco = parseFloat(k.borderBottomWidth) > 0 && k.borderBottomStyle === 'solid';
    if (n.children.length === 0 || marco) piso = Math.max(piso, pag(n).abajo - base);
  }
  return { cola: sc.scrollHeight - piso, scrollable: sc.scrollHeight > sc.clientHeight };
`);

// Lleva un plegable a la vista (con la ventana de 768 de alto el segundo queda fuera) y lo abre.
async function abrirPlegable(pagina, texto) {
  await pagina.evaluar(EN_MARCO(`
    const h = visibles('*').find((n) =>
      n.children.length === 0 && n.textContent.trim().toLowerCase() === ${JSON.stringify(texto.toLowerCase())});
    if (h) h.scrollIntoView({ block: 'center' });
  `));
  await pausa(150);
  return clicTexto(pagina, texto);
}

// Capturas de evidencia (solo con PKAPP_CAPTURAS): el viewport de la página ya es el del marco.
async function capturar(pagina, nombre) {
  if (!process.env.PKAPP_CAPTURAS) return;
  const dir = path.join(__dirname, '..', '..', '..', 'tools', 'e2e', 'capturas', '3.11h');
  fs.mkdirSync(dir, { recursive: true });
  await pausa(400);
  const r = await pagina.enviar('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(dir, nombre), Buffer.from(r.data, 'base64'));
}

// Tamaños de la ficha («Revisado»): 1023 y el corte a 768 de alto, y 1366 × 768 y 1920 × 1080.
const TAMANOS = [[CORTE_ESCRITORIO - 1, 768], [CORTE_ESCRITORIO, 768], [1366, 768], [1366, 900], [1920, 1080]];
const CAPTURADOS = [CORTE_ESCRITORIO, 1366, 1920];

async function escritorio(_pagina, base, t) {
  const navegador = await conectarNavegador(Number(
    process.env.PKAPP_PUERTO_CDP || process.env.E2E_PUERTO_CDP || 9222));
  try {
    for (const tema of ['claro', 'oscuro']) {
      for (const [ancho, alto] of TAMANOS) {
        const pagina = await abrirPagina(navegador, { ancho, alto });
        const c = (s) => `${ancho} × ${alto} · ${tema} · Ajustes escritorio · ${s}`;
        try {
          // Con dos preguntas propias, para que «Mis preguntas» abierto tenga cuerpo
          const llego = await irAAjustes(pagina, base, ancho, tema, SEMBRADO, alto);
          t.ok(c('llega a /ajustes'), llego, true);
          if (!llego) continue;
          const de = ancho >= CORTE_ESCRITORIO;
          const nombreCaptura = (estado) => `ajustes-${ancho}-${tema}-${estado}.png`;
          if (de && CAPTURADOS.includes(ancho) && (ancho !== 1366 || alto === 768)) {
            await capturar(pagina, nombreCaptura('cerrados'));
          }
          t.ok(c('abre «Mis preguntas»'), await abrirPlegable(pagina, '2 preguntas propias'), true);
          t.ok(c('abre «Respaldo y reseteo»'), await abrirPlegable(pagina, 'Respaldo y reseteo'), true);
          await pausa(250);
          await pagina.evaluar(DESPLAZAR_AJUSTES(0));
          await pausa(100);
          if (de && CAPTURADOS.includes(ancho) && (ancho !== 1366 || alto === 768)) {
            await capturar(pagina, nombreCaptura('abiertos'));
          }
          const m = await pagina.evaluar(LEER_ESCRITORIO);
          t.ok(c('sin scroll horizontal'), m.desborda, false);
          t.ok(c('ningún control mide menos de 44 × 44'), JSON.stringify(m.chicos), '[]');
          t.ok(c('hay las cuatro secciones'),
            [m.cuestionario, m.preguntas, m.datos, m.acerca].every(Boolean), true);
          t.ok(c('«Mis preguntas» abierto: las dos tarjetas propias, con su «Eliminar pregunta»'),
            m.tarjetas, 2);
          if (!m.acerca) continue;

          // Cola: «Tus datos» (separación paso 8) + relleno inferior del scroll (paso 8) desde
          // el corte; bajo el corte «Acerca de» es el último y no lleva separación (a.1 #4, #6).
          const cola = await pagina.evaluar(COLA);
          if (cola && cola.scrollable) {
            t.ok(c(`cola inferior de ${de ? 16 : 8} pasos`), Math.round(cola.cola), (de ? 2 : 1) * SEPARACION);
          }

          // Foco: sin ancestros con overflow que recorten el contorno
          t.ok(c('foco: ningún ancestro de un control recorta su contorno (overflow visible)'),
            (await pagina.evaluar(RECORTES_DE_FOCO)).join('|'), '');

          if (!de) {
            // Bajo el corte: igual que hoy, una sola columna y «Acerca de» al final
            t.ok(c('«Acerca de» debajo de «Tus datos»'), m.acerca.y > m.datos.abajo, true);
            t.ok(c('«Acerca de» alineada con el resto de la columna'), m.acerca.x, m.cuestionario.x);
            t.ok(c('una columna de 448 como máximo'), Math.round(m.panelCuestionario.ancho) <= 448, true);
            continue;
          }

          // Hoja: contenido de `hoja` centrado (tope 952); la principal queda en `lectura`
          const hoja = Math.min(ANCHOS.hoja, ancho - 2 * SEPARACION);
          const izq = (ancho - hoja) / 2;
          t.ok(c('la hoja arranca a la izquierda de su tope, centrada'), m.cuestionario.x, izq);
          t.ok(c('región principal: panel de «Cuestionario» de `lectura`'),
            m.panelCuestionario.ancho, hoja - ANCHOS.lateral - SEPARACION);
          t.ok(c('principal: «Mis preguntas» y «Tus datos» en la misma columna'),
            `${m.preguntas.x}|${m.datos.x}`, `${m.cuestionario.x}|${m.cuestionario.x}`);
          t.ok(c('principal: secciones apiladas en orden'),
            m.cuestionario.y < m.preguntas.y && m.preguntas.y < m.datos.y, true);
          t.ok(c('botones de respaldo apilados al ancho de la región principal'),
            m.descargar && m.resetear && m.descargar.x === m.resetear.x
              && m.descargar.ancho === m.resetear.ancho && m.descargar.y < m.resetear.y, true);
          t.ok(c('tarjetas de «Mis preguntas» al ancho de la región principal'),
            m.anchoTarjetas, `${m.panelCuestionario.ancho}|${m.panelCuestionario.ancho}`);

          // Lateral: a la derecha de la principal, ancho `lateral`, alineada con el primer rótulo
          t.ok(c('«Acerca de» a la derecha de la región principal'),
            m.acerca.x >= m.panelCuestionario.der + SEPARACION - 0.5, true);
          t.ok(c('lateral separada de la principal por paso 8'),
            m.panelAcerca.x - m.panelCuestionario.der, SEPARACION);
          t.ok(c('lateral de ancho `lateral`'), m.panelAcerca.ancho, ANCHOS.lateral);
          t.ok(c('lateral alineada arriba con el rótulo de la primera sección'),
            m.acerca.y, m.cuestionario.y);
          t.ok(c('lateral dentro de la hoja'), m.panelAcerca.der, izq + hoja);
          t.ok(c('la identidad salta de línea'), m.esfuno.y > m.pkapp.y, true);
          t.ok(c('los dos enlaces, una por línea y a la misma x'),
            m.reportar && m.codigo && m.codigo.y >= m.reportar.abajo + 2 * PASO - 0.5
              && Math.abs(m.codigo.x - m.reportar.x) < 1, true);

          // Anclado: con la página desplazada ninguna región queda fija
          t.ok(c('ninguna región se ancla (sin sticky ni fixed)'),
            (await pagina.evaluar(ANCLAS_AJUSTES)).join('|'), '');
          const antes = m.acerca.y;
          const hecho = await pagina.evaluar(DESPLAZAR_AJUSTES(100000));
          await pausa(150);
          const despues = await pagina.evaluar(LEER_ESCRITORIO);
          t.ok(c('desplazada, «Acerca de» sube lo que se desplazó (no queda fija)'),
            Math.round(antes - despues.acerca.y), Math.round(hecho));
          if (alto < 900) t.ok(c('a esta altura la pantalla pide desplazarse'), hecho > 0, true);
          await pagina.evaluar(DESPLAZAR_AJUSTES(0));
          await pausa(100);

          // Desde el inicio del documento, sin foco forzado: la barra va primero (DOM = visual).
          // El punto de partida de Tab es el último foco o clic: se lo lleva al `body`.
          await pagina.evaluar(EN_MARCO(`
            m.contentWindow.focus();
            d.body.setAttribute('tabindex', '-1');
            d.body.focus();
            d.body.removeAttribute('tabindex');
            return true;
          `));
          await pagina.tecla('Tab');
          const primera = await pagina.evaluar(ORDEN_DE_FOCO);
          t.ok(c('Tab: la primera parada desde el documento es «Volver» de la barra'),
            primera && primera.nombre, 'Volver');

          // Tab recorre el DOM y debe coincidir con el orden VISUAL medido en la página
          await pagina.evaluar(EN_MARCO(`
            const g = visibles('[role="radio"]')[0];
            if (g) g.focus();
          `));
          const paradas = [];
          for (let i = 0; i < 24; i++) {
            const p = await pagina.evaluar(ORDEN_DE_FOCO);
            if (!p) break;
            const u = paradas[paradas.length - 1];
            if (u && u.nombre === p.nombre && Math.abs(u.y - p.y) < 1 && Math.abs(u.x - p.x) < 1) break;
            paradas.push(p);
            if (/código fuente/i.test(p.nombre)) break;
            await pagina.tecla('Tab');
          }
          const nombres = paradas.map((p) => p.nombre.toLowerCase());
          const i = (re) => nombres.findIndex((n) => re.test(n));
          const iPle = i(/respaldo y reseteo/), iRep = i(/reportar un error/), iCod = i(/código fuente/);
          t.ok(c('Tab: «No» y «Sí» primero y los dos enlaces de «Acerca de» al final'),
            paradas.length > 3 && paradas[0].rol === 'radio' && paradas[1].rol === 'radio'
              && iPle > 1 && iRep > iPle && iCod === iRep + 1 && iCod === paradas.length - 1, true);
          // Orden visual: la región principal (arriba-abajo, izquierda-derecha) y luego la lateral
          const lateralX = m.panelAcerca.x - 1;
          const region = (p) => (p.x >= lateralX ? 1 : 0);
          const visual = [...paradas].sort((a, b) =>
            region(a) - region(b) || (Math.abs(a.y - b.y) > 2 ? a.y - b.y : a.x - b.x));
          const clave = (ps) => ps.map((p) => `${p.nombre}@${Math.round(p.y)}`).join(' > ');
          t.ok(c('Tab: el orden de foco es el orden visual (región, arriba-abajo, izquierda-derecha)'),
            clave(paradas), clave(visual));
          const rep = paradas[iRep], ple = paradas[iPle];
          t.ok(c('Tab: el foco pasa de la izquierda a la derecha'),
            rep && ple && rep.x > ple.x, true);
        } finally {
          await pagina.evaluar(LIMPIAR);
          await pagina.cerrar();
        }
      }
    }
  } finally {
    navegador.cerrar();
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

// SET-P3: «generadas» concuerda en número. Sin camino e2e (el banco de hoy no trae generadas):
// se evalúa el fragmento literal de SettingsScreen.js con g = 0, 1 y 2.
async function singularGeneradas(pagina, base, t) {
  const fuente = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'src', 'screens', 'SettingsScreen.js'), 'utf8');
  const m = fuente.match(/\{generatedCount > 0 \? (`[^`]*`) : ''\}/);
  t.ok('SettingsScreen.js: el sufijo de generadas es un fragmento evaluable', !!m, true);
  if (!m) return;
  const sufijo = (generatedCount) => new Function('generatedCount', `return ${m[1]};`)(generatedCount);
  t.ok('g = 1: « · 1 generada»', sufijo(1), ' · 1 generada');
  t.ok('g = 2: « · 2 generadas»', sufijo(2), ' · 2 generadas');
}

async function conDatos(pagina, base, t, tema) {
  const T = plancha[tema];
  const c = (s) => `${tema} · Ajustes con datos · ${s}`;
  try {
    t.ok(c('llega a /ajustes'), await irAAjustes(pagina, base, 390, tema, SEMBRADO), true);

    // SET-P3 (S1, S4): con 2 propias, «{n} de exámenes · 2 tuyas»; el total suma las propias.
    t.ok(c('S1: «Acerca de» con 2 propias: «{n} de exámenes · 2 tuyas»'),
      !!(await pagina.evaluar(LEER_TEXTO(`${CONTEOS.bcyt} de exámenes · 2 tuyas`))), true);
    const conPropias = await pagina.evaluar(TEXTO_PANTALLA);
    t.ok(c('S1: sin «generadas» en la pantalla'), /generadas/i.test(conPropias), false);
    t.ok(c('S4: total del banco = exámenes + propias'),
      conPropias.includes(String(CONTEOS.bcyt + 2)), true);

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
    t.ok(c('SET-P3: «{n} de exámenes · 1 tuya» en singular'),
      await pagina.esperarA(async () =>
        !!(await pagina.evaluar(LEER_TEXTO(`${CONTEOS.bcyt} de exámenes · 1 tuya`)))), true);
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

// E-05: avisos de «Importar respaldo». El selector de archivo (`input.click()`) no se maneja desde
// el arnés: se intercepta el `click` del `input` en el marco y se le entrega el archivo a su
// `onchange`, igual que haría el navegador.
const PREPARAR_SELECTOR = EN_MARCO(`
  w.__entradaRespaldo = null;
  w.HTMLInputElement.prototype.click = function () { w.__entradaRespaldo = this; };
  return true;
`);
const ENVIAR_ARCHIVO = (contenido) => EN_MARCO(`
  const input = w.__entradaRespaldo;
  if (!input || typeof input.onchange !== 'function') return false;
  input.onchange({ target: { files: [new w.File([${JSON.stringify(contenido)}], 'respaldo.json')] } });
  return true;
`);
const CLAVES_E05 = {
  existe: 'pkapp_question_stats:e2e-existe',
  uno: 'pkapp_question_stats:e2e-uno',
  dosA: 'pkapp_question_stats:e2e-dos-a',
  dosB: 'pkapp_question_stats:e2e-dos-b',
};
const LIMPIAR_E05 = `(function () {
  ${JSON.stringify(Object.values(CLAVES_E05))}.forEach((k) => localStorage.removeItem(k));
})()`;

async function importarRespaldo(pagina, base, t) {
  const c = (s) => `Ajustes · importar respaldo · ${s}`;
  const respaldo = (data, version = 1) => JSON.stringify({ version, data });
  const importar = async (contenido) => {
    pagina.dialogos.length = 0;
    await pagina.evaluar(PREPARAR_SELECTOR);
    await clicTexto(pagina, 'Importar respaldo');
    const entregado = await pagina.esperarA(async () => await pagina.evaluar(ENVIAR_ARCHIVO(contenido)));
    if (!entregado) return null;
    await pagina.esperarA(() => pagina.dialogos.length === 1);
    return pagina.dialogos[0] ?? null;
  };
  try {
    t.ok(c('llega a /ajustes'), await irAAjustes(pagina, base, 390, 'claro'), true);
    await clicTexto(pagina, 'Respaldo y reseteo');
    await pausa();
    await pagina.evaluar(LIMPIAR_E05);
    await pagina.evaluar(`localStorage.setItem(${JSON.stringify(CLAVES_E05.existe)}, '{}')`);

    t.ok(c('un archivo que no es JSON: sin el texto del motor (E-05.4)'),
      await importar('{no es json'), 'Error\n\nNo se pudo leer el archivo.');
    t.ok(c('un JSON sin forma de respaldo (E-05.1)'),
      await importar('{"a":1}'), 'Error\n\nArchivo inválido: no parece un respaldo de pKapp.');
    t.ok(c('una versión no soportada (E-05.2)'),
      await importar(respaldo({}, 2)), 'Error\n\nVersión de respaldo no soportada (2).');
    t.ok(c('claves que ya existen: nada nuevo (E-05.3, n = 0)'),
      await importar(respaldo({ [CLAVES_E05.existe]: '{}' })), 'Listo\n\nNo había datos nuevos para restaurar.');
    t.ok(c('una clave nueva, en singular (E-05.3, n = 1)'),
      await importar(respaldo({ [CLAVES_E05.existe]: '{}', [CLAVES_E05.uno]: '{}' })),
      'Listo\n\nSe restauró 1 dato.');
    t.ok(c('varias claves nuevas, en plural (E-05.3, n > 1)'),
      await importar(respaldo({ [CLAVES_E05.dosA]: '{}', [CLAVES_E05.dosB]: '{}', 'clave-ajena': 'x' })),
      'Listo\n\nSe restauraron 2 datos.');
  } finally {
    await pagina.evaluar(LIMPIAR_E05);
    pagina.dialogos.length = 0;
  }
}

// AUD-3 y AUD-8: una fila propia corrupta no tira la pantalla y un guardado que falla se avisa.
const AVISO_GUARDADO = 'Error\n\nNo se pudo guardar el cambio.';
const SEMBRADO_CORRUPTA = `(function () {
  localStorage.setItem('pkapp_user_questions:bcyt', JSON.stringify([
    { id: 'corrupta', topic: 'enzimas', question: 'q', options: '{no es json', correct_index: 0 },
    { id: 'USER-e2e-1', topic: 'enzimas', question: 'Primera pregunta propia de prueba',
      options: JSON.stringify(['Opción A', 'Opción B', 'Opción C']), correct_index: 1,
      explanation: '', created_at: Date.now() },
  ]));
  const a = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
  a.hide_feedback = 'true';
  localStorage.setItem('pkapp_settings', JSON.stringify(a));
})()`;
const QUITAR_HIDE_FEEDBACK = `(function () {
  const a = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
  delete a.hide_feedback;
  localStorage.setItem('pkapp_settings', JSON.stringify(a));
})()`;
// Desde acá `localStorage.setItem` lanza, como con la cuota llena o en modo privado.
const GUARDADO_QUE_FALLA = EN_MARCO(`
  w.Storage.prototype.setItem = function () { throw new w.DOMException('lleno', 'QuotaExceededError'); };
  return true;
`);

async function datosCorruptosYGuardadoFallido(pagina, base, t) {
  const c = (s) => `Ajustes · datos propios · ${s}`;
  const hayAviso = () => pagina.dialogos.includes(AVISO_GUARDADO);
  try {
    // (a) Fila corrupta: se cuenta la válida y `hide_feedback` se carga igual.
    const erroresA = pagina.errores.length;
    t.ok(c('llega a /ajustes con una fila corrupta'),
      await irAAjustes(pagina, base, 390, 'claro', SEMBRADO_CORRUPTA), true);
    t.ok(c('el segmentado muestra «Sí» con hide_feedback en «Sí»'),
      await pagina.esperarA(async () => (await pagina.evaluar(LEER_TEXTO('Sí')))?.control?.marcado === 'true'), true);
    t.ok(c('cuenta solo la propia válida'),
      await pagina.esperarA(async () => !!(await pagina.evaluar(LEER_TEXTO('1 pregunta propia')))), true);
    await pausa(300);
    t.ok(c('sin errores de JS en consola'), pagina.errores.length - erroresA, 0);
    await pagina.evaluar(QUITAR_HIDE_FEEDBACK);
    await pagina.evaluar(LIMPIAR);

    // (b) Guardado que falla al tocar «Ocultar resultado».
    t.ok(c('llega a /ajustes'), await irAAjustes(pagina, base, 390, 'claro'), true);
    pagina.dialogos.length = 0;
    const erroresB = pagina.errores.length;
    await pagina.evaluar(GUARDADO_QUE_FALLA);
    await clicTexto(pagina, 'Sí');
    t.ok(c('«Ocultar resultado» sin espacio: aparece «No se pudo guardar el cambio.»'),
      await pagina.esperarA(hayAviso), true);
    await pausa(300);
    t.ok(c('«Ocultar resultado» sin espacio: sin errores de JS en consola'), pagina.errores.length - erroresB, 0);

    // (c) Guardado que falla al eliminar una propia.
    t.ok(c('llega a /ajustes con dos propias'), await irAAjustes(pagina, base, 390, 'claro', SEMBRADO), true);
    await clicTexto(pagina, '2 preguntas propias');
    await pausa();
    const tarjeta = await pagina.evaluar(LEER_TARJETA('Primera pregunta propia de prueba'));
    t.ok(c('hay tarjeta con «Eliminar pregunta»'), !!(tarjeta && tarjeta.eliminar), true);
    if (tarjeta && tarjeta.eliminar) {
      pagina.dialogos.length = 0;
      pagina.respuestaDialogo = 'aceptar';
      const erroresC = pagina.errores.length;
      await pagina.evaluar(GUARDADO_QUE_FALLA);
      await pagina.clicEn(Math.round(tarjeta.eliminar.x + tarjeta.eliminar.ancho / 2),
        Math.round(tarjeta.eliminar.y + tarjeta.eliminar.alto / 2));
      t.ok(c('eliminar sin espacio: aparece «No se pudo guardar el cambio.»'),
        await pagina.esperarA(hayAviso), true);
      await pausa(300);
      t.ok(c('eliminar sin espacio: sin errores de JS en consola'), pagina.errores.length - erroresC, 0);
    }
    pagina.respuestaDialogo = 'cancelar';

    // (d) Guardado que falla al cambiar el tema desde la marca del header.
    t.ok(c('abre la app en el marco'), !!(await abrirMarco(pagina, base, 390)), true);
    await esperarEnMarco(pagina, MATERIA);
    pagina.dialogos.length = 0;
    const erroresD = pagina.errores.length;
    await pagina.evaluar(GUARDADO_QUE_FALLA);
    await clicEnMarco(pagina, 'oscuro');
    t.ok(c('tema sin espacio: aparece «No se pudo guardar el cambio.»'), await pagina.esperarA(hayAviso), true);
    await pausa(300);
    t.ok(c('tema sin espacio: sin errores de JS en consola'), pagina.errores.length - erroresD, 0);
  } finally {
    pagina.respuestaDialogo = 'cancelar';
    await pagina.evaluar(LIMPIAR);
    await pagina.evaluar(QUITAR_HIDE_FEEDBACK);
    await volverAClaro(pagina);
  }
}

// La lista entera guardada como un valor JSON no iterable hace rechazar a `getUserQuestions`:
// `hide_feedback` se carga igual (dos lecturas independientes).
const LISTA_QUE_RECHAZA = EN_MARCO(`
  const a = JSON.parse(w.localStorage.getItem('pkapp_settings') || '{}');
  a.hide_feedback = 'true';
  w.localStorage.setItem('pkapp_settings', JSON.stringify(a));
  const original = w.Storage.prototype.getItem;
  w.Storage.prototype.getItem = function (clave) {
    if (String(clave).startsWith('pkapp_user_questions:')) return '{"a":1}';
    return original.apply(this, arguments);
  };
`);

async function cargaQueRechazaEnAjustes(pagina, base, t) {
  const c = (s) => `Ajustes · carga que rechaza · ${s}`;
  try {
    const errores = pagina.errores.length;
    t.ok(c('llega a /ajustes con la lista no iterable'),
      await irAAjustes(pagina, base, 390, 'claro', LISTA_QUE_RECHAZA), true);
    t.ok(c('el segmentado muestra «Sí» con hide_feedback en «Sí»'),
      await pagina.esperarA(async () => (await pagina.evaluar(LEER_TEXTO('Sí')))?.control?.marcado === 'true'), true);
    await pausa(300);
    t.ok(c('sin errores de JS en consola'), pagina.errores.length - errores, 0);
  } finally {
    await pagina.evaluar(LIMPIAR);
    await pagina.evaluar(QUITAR_HIDE_FEEDBACK);
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

// Capturas de evidencia de la 3.13d (solo con PKAPP_CAPTURAS): Ajustes con «Acerca de» a la vista, a 390
// y 1366, claro y oscuro, sin y con propias. No afirma nada: deja los PNG para revisión.
async function capturasDeLaTrece(pagina, base, t) {
  if (!process.env.PKAPP_CAPTURAS) return;
  const dir = path.resolve(__dirname, '..', '..', '..', 'tools', 'e2e', 'capturas', '3.13');
  fs.mkdirSync(dir, { recursive: true });
  const foto = async (ancho, alto, nombre) => {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: Math.max(ancho, 900), height: Math.max(alto, 900), deviceScaleFactor: 1, mobile: false });
    await new Promise((r) => setTimeout(r, 400));
    const r = await pagina.enviar('Page.captureScreenshot',
      { format: 'png', clip: { x: 0, y: 0, width: ancho, height: alto, scale: 1 } });
    fs.writeFileSync(path.join(dir, nombre), Buffer.from(r.data, 'base64'));
    t.nota(`captura ${nombre}`);
  };
  const ALTO = { 390: 1100, 1366: 768 };
  try {
    for (const ancho of [390, 1366]) {
      for (const tema of ['claro', 'oscuro']) {
        for (const propias of [false, true]) {
          const ok = await irAAjustes(pagina, base, ancho, tema, propias ? SEMBRADO : null, ALTO[ancho]);
          t.ok(`captura ${ancho} ${tema} ${propias ? 'con' : 'sin'} propias: llegó a /ajustes`, ok, true);
          if (ok) {
            await pagina.evaluar(EN_MARCO(`
              const h = visibles('*').find((n) => n.children.length === 0 && n.textContent.trim() === 'Acerca de');
              if (h) h.scrollIntoView({ block: 'center' });
            `));
            await foto(ancho, ALTO[ancho], `ajustes-${ancho}-${tema}-${propias ? 'con' : 'sin'}-propias.png`);
          }
          await pagina.evaluar(LIMPIAR);
        }
        if (tema === 'oscuro') await volverAClaro(pagina);
      }
    }
  } finally {
    await pagina.evaluar(LIMPIAR);
    await volverAClaro(pagina);
  }
}

module.exports = [
  { nombre: 'Ajustes: la pantalla en claro contra su ficha', correr: (p, b, t) => pantalla(p, b, t, 'claro') },
  { nombre: 'Ajustes: la pantalla en oscuro contra su ficha', correr: (p, b, t) => pantalla(p, b, t, 'oscuro') },
  { nombre: 'Ajustes: sin scroll horizontal ni objetivos chicos a 320, 360, 390, 768 y 1280', correr: anchos },
  { nombre: 'Ajustes: layout de escritorio (1023, 1024, 1366 y 1920, claro y oscuro)', correr: escritorio },
  { nombre: 'Ajustes: con preguntas propias, eliminar y resetear en claro', correr: (p, b, t) => conDatos(p, b, t, 'claro') },
  { nombre: 'Ajustes: con preguntas propias, eliminar y resetear en oscuro', correr: (p, b, t) => conDatos(p, b, t, 'oscuro') },
  { nombre: 'Ajustes: «1 generada» en singular', correr: singularGeneradas },
  { nombre: 'Ajustes: avisos de importar respaldo (E-05)', correr: importarRespaldo },
  { nombre: 'Ajustes: fila propia corrupta y guardado que falla (AUD-3, AUD-8)', correr: datosCorruptosYGuardadoFallido },
  { nombre: 'Ajustes: carga de propias que rechaza (AUD-3)', correr: cargaQueRechazaEnAjustes },
  { nombre: 'Ajustes: SettingsScreen.js sin literales visuales', correr: sinLiterales },
  { nombre: 'Ajustes: capturas de la 3.13d (solo con PKAPP_CAPTURAS)', correr: capturasDeLaTrece },
];

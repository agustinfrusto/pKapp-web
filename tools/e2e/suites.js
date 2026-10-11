// Las comprobaciones. Cada suite recibe una página ya abierta y un verificador.
//
// Lo que se cubre acá es la navegación web: que el botón atrás del navegador no
// saque al usuario de pKapp, que las URLs profundas recargadas en frío no dejen
// una pantalla en blanco, y que nadie pierda el progreso de un quiz sin
// confirmarlo. Son las tres cosas que se rompen sin hacer ruido.

const MATERIA = 'Biología Celular y Tisular';

// La nota del creador aparece en un perfil nuevo y tapa las tarjetas.
async function cerrarNota(pagina) {
  if (await pagina.ubicar('✕')) {
    await pagina.clic('✕');
    await pagina.esperarA(async () => !await pagina.ubicar('✕'), { limite: 3000 });
  }
}

// La carga de la materia baja un chunk aparte, así que se espera por la URL y
// no por un tiempo fijo.
async function entrarAMateria(pagina, base, nombre = MATERIA) {
  await pagina.ir(base + '/');
  await pagina.esperarTexto('Tus materias');
  await cerrarNota(pagina);
  await pagina.clic(nombre);
  return pagina.esperarUrl('/inicio');
}

async function irAlQuizDeExamen(pagina) {
  await pagina.clic('Modo examen');
  await pagina.esperarUrl('/temas/exam');
  await pagina.clic('Comenzar examen');
  return pagina.esperarUrl('/quiz');
}

// ---------------------------------------------------------------------------

async function elegirMateria(pagina, base, t) {
  // Se repite: el rebote al selector que motivó el ref sincrónico dependía del
  // orden entre el commit de React y onStateChange.
  for (let i = 1; i <= 3; i++) {
    const entro = await entrarAMateria(pagina, base);
    t.ok(`intento ${i}: elegir materia queda en /inicio`, entro, true);
    if (!entro) t.nota('  quedó en ' + await pagina.url() + ' — ' + await pagina.texto(80));
  }
}

async function atrasDelNavegador(pagina, base, t) {
  await entrarAMateria(pagina, base);

  await pagina.clic('Mis estadísticas');
  t.ok('ir a estadísticas', await pagina.esperarUrl('/estadisticas'), true);

  await pagina.evaluar('history.back()');
  t.ok('el atrás vuelve a /inicio en vez de salir de pKapp',
    await pagina.esperarUrl('/inicio'), true);
  t.ok('la app sigue viva', await pagina.evaluar('document.body.innerText.length > 20'), true);

  await pagina.evaluar('history.forward()');
  t.ok('el adelante vuelve a /estadisticas', await pagina.esperarUrl('/estadisticas'), true);
  await pagina.evaluar('history.back()');
  await pagina.esperarUrl('/inicio');
}

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
  await pagina.clic('✕');
  await pagina.esperarA(() => pagina.dialogos.length >= 1);
  t.ok('la X pregunta una sola vez', pagina.dialogos.length, 1);
  t.ok('al cancelar sigue en el quiz', await pagina.url(), '/quiz');

  pagina.respuestaDialogo = 'aceptar';
  await pagina.clic('✕');
  t.ok('la X con aceptar lleva a /inicio', await pagina.esperarUrl('/inicio'), true);
}

async function urlsProfundasEnFrio(pagina, base, t) {
  // Sin materia elegida no hay pantalla que renderizar: Home y TopicSelect
  // devuelven null. La app debe volver al selector, no quedar en blanco.
  for (const ruta of ['/quiz', '/resultados', '/estadisticas', '/inicio', '/temas/exam', '/ajustes']) {
    pagina.dialogos.length = 0;
    await pagina.ir(base + ruta);
    const volvio = await pagina.esperarA(async () =>
      await pagina.url() === '/' && (await pagina.texto(400)).includes('Tus materias'));
    t.ok(`${ruta} en frío vuelve al selector`, volvio, true);
    if (!volvio) t.nota('  quedó en ' + await pagina.url() + ' — ' + await pagina.texto(80));
    t.ok(`${ruta} en frío no muestra ningún confirm`, pagina.dialogos.length, 0);
  }
}

async function terminarUnQuizNoPregunta(pagina, base, t) {
  await entrarAMateria(pagina, base);
  await pagina.clic('Entrena Temas/Parciales');
  t.ok('modo práctica', await pagina.esperarUrl('/temas/practice'), true);

  // El tema más corto, para que el quiz sea de pocas preguntas.
  const tema = await pagina.evaluar(`(function () {
    const visibles = Array.from(document.querySelectorAll('[tabindex]'))
      .filter((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((n) => (n.innerText || '').trim().replace(/\\s+/g, ' '))
      .filter((t) => / \\d+ preguntas$/.test(t) && !t.includes('mezclados'));
    if (!visibles.length) return null;
    visibles.sort((a, b) =>
      parseInt(a.match(/(\\d+) preguntas$/)[1]) - parseInt(b.match(/(\\d+) preguntas$/)[1]));
    return visibles[0];
  })()`);
  if (!tema) { t.ok('se encontró algún tema', false, true); return; }

  const total = parseInt(tema.match(/(\d+) preguntas$/)[1], 10);
  t.nota(`  tema elegido: ${tema}`);
  // El innerText real trae un salto de línea antes del contador: se busca por
  // el nombre pelado o no matchea nada.
  await pagina.clic(tema.replace(/ \d+ preguntas$/, ''));
  t.ok('el quiz arrancó', await pagina.esperarUrl('/quiz'), true);

  pagina.dialogos.length = 0;
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

  t.ok('terminar el quiz lleva a /resultados', await pagina.esperarUrl('/resultados'), true);
  t.ok('terminar el quiz NO pide confirmación', pagina.dialogos.length, 0);

  await pagina.evaluar('history.back()');
  await pagina.esperarA(async () => await pagina.url() !== '/resultados', { limite: 5000 });
  t.ok('el atrás desde resultados no pregunta', pagina.dialogos.length, 0);
}

async function seisMaterias(pagina, base, t) {
  await pagina.ir(base + '/');
  await pagina.esperarTexto('Tus materias');
  await pagina.evaluar('localStorage.clear()');
  await pagina.ir(base + '/');
  await pagina.esperarTexto('Tus materias');
  const nota = await pagina.esperarTexto('Ahora estoy trabajando en la estética de la página');
  t.ok('la nota del creador anuncia el trabajo en la estética', nota, true);
  await cerrarNota(pagina);
  const nombres =['Biología Celular y Tisular', 'Anatomía', 'Neurobiología',
    'Cardiovascular y Respiratorio', 'Digestivo, Renal y Endócrino', 'Reproductor y Desarrollo'];
  const texto = await pagina.evaluar('document.body.innerText');
  for (const n of nombres) t.ok(`el selector muestra "${n}"`, texto.includes(n), true);
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
      await pagina.esperarTexto(`1 / ${total}`), true);

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

const MARCO = 'marco-e2e';
const PASO = 4;                       // px por paso de la escala (tokens.md c.3)
const LADO_TACTIL = 11 * PASO;        // paso 11: objetivo táctil de 44 × 44
const SEPARACION_MINIMA = 2 * PASO;   // paso 2 entre controles adyacentes
// área segura (0 en web) + paso 3.5 + (paso 11 + border arriba y abajo) + paso 3.5
const ALTO_HEADER = 3.5 * PASO + LADO_TACTIL + 2 + 3.5 * PASO;

// Desborde horizontal DENTRO de la pantalla (helper único; lo usan todas las aserciones
// «sin scroll horizontal»). Medir `documentElement.scrollWidth` no alcanza: el
// `ScrollView` recorta con `overflow-x: hidden` y no ensancha el documento. Cuenta un
// elemento visible que sale por la derecha de la ventana, o un contenedor con
// contenido más ancho que su caja y `overflow-x` distinto de `visible`.
const DESBORDES = `
  const desbordes = () => Array.from(d.querySelectorAll('*')).filter((n) => {
    const r = n.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.right > w.innerWidth + 0.5) return true;
    return n.scrollWidth > n.clientWidth + 1 && w.getComputedStyle(n).overflowX !== 'visible';
  });
`;

// Todo lo que corre dentro del iframe: `d` es su documento y `w` su ventana.
const EN_MARCO = (cuerpo) => `(function () {
  const m = document.getElementById('${MARCO}');
  const w = m.contentWindow, d = m.contentDocument;
  ${DESBORDES}
  const visibles = (sel) => Array.from(d.querySelectorAll(sel)).filter((n) => {
    const r = n.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  ${cuerpo}
})()`;

const MEDIR_PANTALLA = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const header = visibles('[data-testid="header-marca"]')[0];
  const grupo = visibles('[role="radiogroup"]')[0];
  // Primer bloque de contenido debajo del header: la hoja visible (texto, imagen o svg)
  // más alta que arranca bajo su borde inferior.
  let bloque = null;
  if (header) {
    const piso = header.getBoundingClientRect().bottom - 0.5;
    const hojas = Array.from(d.querySelectorAll('*')).filter((n) => {
      if (n.closest('[data-testid="header-marca"]')) return false;
      const hoja = n.children.length === 0 && (n.textContent.trim() !== '' || /^(IMG|svg)$/i.test(n.tagName));
      const r = n.getBoundingClientRect();
      return hoja && r.width > 0 && r.height > 0 && r.top >= piso;
    });
    if (hojas.length) bloque = Math.min(...hojas.map((n) => n.getBoundingClientRect().top));
  }
  const volver = visibles('[aria-label="Cambiar materia"], [tabindex]')
    .find((n) => (n.getAttribute('aria-label') || n.innerText || '').toLowerCase().includes('cambiar materia'));
  return {
    vista: w.innerWidth,
    desborda: desbordes().length > 0,
    header: caja(header),
    bloque,
    grupo: caja(grupo),
    volver: caja(volver),
    volverTexto: volver ? volver.innerText.trim() : null,
  };
`);

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

async function abrirMarco(pagina, base, ancho, alto = 800) {
  // Sin la app de fondo: la pantalla del iframe es la única que corre.
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await pagina.evaluar(`(function () {
    const ajustes = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
    delete ajustes.tema;
    localStorage.setItem('pkapp_settings', JSON.stringify(ajustes));
    localStorage.setItem('pkapp_about_seen_at_v2', String(Date.now()));
    const marco = document.createElement('iframe');
    marco.id = '${MARCO}';
    marco.src = ${JSON.stringify(base + '/')};
    marco.style.cssText = 'position:fixed;top:0;left:0;border:0;height:${alto}px;width:${ancho}px';
    document.body.appendChild(marco);
  })()`);
  return esperarEnMarco(pagina, 'Tus materias');
}

const esperarEnMarco = (pagina, texto) => pagina.esperarA(async () =>
  (await pagina.evaluar(EN_MARCO('return d.body ? d.body.innerText : "";'))).includes(texto));

// Click por coordenadas sobre el elemento enfocable más específico del iframe
// que tenga ese texto o ese rol de radio (sin distinguir mayúsculas: el paso
// `rotulo` muestra el texto en mayúsculas por CSS).
async function clicEnMarco(pagina, texto) {
  const punto = await pagina.evaluar(EN_MARCO(`
    const t = ${JSON.stringify(texto.toLowerCase())};
    const c = visibles('[tabindex]').filter((n) =>
      (n.textContent || '').toLowerCase().includes(t));
    if (!c.length) return null;
    c.sort((a, b) => a.textContent.length - b.textContent.length);
    const r = c[0].getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  `));
  if (!punto) return false;
  await pagina.clicEn(punto.x, punto.y);
  return true;
}

async function irAHomeEnMarco(pagina) {
  await clicEnMarco(pagina, MATERIA);
  return pagina.esperarA(async () =>
    await pagina.evaluar(EN_MARCO('return w.location.pathname;')) === '/inicio');
}

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

// Mide MateriaSelect y Home a un ancho; las dos suites de abajo la comparten.
async function medirAmbasPantallas(pagina, base, ancho) {
  await abrirMarco(pagina, base, ancho);
  await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_PANTALLA)).header);
  const materia = await pagina.evaluar(MEDIR_PANTALLA);
  await irAHomeEnMarco(pagina);
  await pagina.esperarA(async () => {
    const m = await pagina.evaluar(MEDIR_PANTALLA);
    return !!m.header && !!m.volver;
  });
  const home = await pagina.evaluar(MEDIR_PANTALLA);
  return { materia, home };
}

async function altoDeHeaderIgual(pagina, base, t) {
  for (const ancho of [320, 390, 768]) {
    const { materia, home } = await medirAmbasPantallas(pagina, base, ancho);
    const mh = materia.header, hh = home.header;
    t.ok(`${ancho} px: hay header en MateriaSelect y en Home`, !!mh && !!hh, true);
    if (!mh || !hh) continue;
    t.ok(`${ancho} px: el header mide ${ALTO_HEADER} px en MateriaSelect`, mh.alto, ALTO_HEADER);
    t.ok(`${ancho} px: el header mide lo mismo en Home`, hh.alto, mh.alto);
    t.ok(`${ancho} px: hay un primer bloque debajo del header en las dos pantallas`,
      materia.bloque !== null && home.bloque !== null, true);
    t.ok(`${ancho} px: el primer bloque debajo del header arranca en la misma ordenada (CD-19)`,
      home.bloque, materia.bloque);
  }
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

// relleno `paso 4` arriba y abajo + fila de `paso 11` + filete `border` (área segura 0 en web)
const ALTO_BARRA = 4 * PASO + LADO_TACTIL + 4 * PASO + 1;
const MARGEN_LATERAL = 5 * PASO;      // paso 5
const TITULO_DEL_QUIZ = 'pKapp · Quiz';

const MEDIR_BARRA = EN_MARCO(`
  const caja = (n) => {
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height };
  };
  const barra = visibles('[data-testid="barra-interna"]')[0];
  const titulo = visibles('[data-testid="barra-titulo"]')[0];
  const volver = visibles('[data-testid="barra-volver"]')[0];
  return {
    vista: w.innerWidth,
    desborda: desbordes().length > 0,
    barra: caja(barra),
    filete: barra ? w.getComputedStyle(barra).borderBottomWidth : null,
    titulo: caja(titulo),
    tituloTexto: titulo ? titulo.textContent.trim() : null,
    volver: caja(volver),
    volverNombre: volver ? volver.getAttribute('aria-label') : null,
    volverRol: volver ? volver.getAttribute('role') : null,
    hayTituloDelQuiz: d.body.innerText.includes(${JSON.stringify(TITULO_DEL_QUIZ)}),
    ruta: w.location.pathname,
  };
`);

const URL_EN_MARCO = EN_MARCO('return w.location.pathname;');

const esperarRutaEnMarco = (pagina, ruta) => pagina.esperarA(async () =>
  await pagina.evaluar(URL_EN_MARCO) === ruta);

// Desde /temas/practice, elige el tema más corto y llega al quiz dentro del marco.
async function irAlQuizEnMarco(pagina) {
  const elegido = await pagina.evaluar(EN_MARCO(`
    const temas = visibles('[tabindex]')
      .map((n) => ({ n, t: (n.innerText || '').trim().replace(/\\s+/g, ' ') }))
      .filter((x) => / \\d+ preguntas$/.test(x.t) && !x.t.includes('mezclados'));
    if (!temas.length) return null;
    temas.sort((a, b) =>
      parseInt(a.t.match(/(\\d+) preguntas$/)[1]) - parseInt(b.t.match(/(\\d+) preguntas$/)[1]));
    temas[0].n.scrollIntoView({ block: 'center' });
    const r = temas[0].n.getBoundingClientRect();
    return { total: parseInt(temas[0].t.match(/(\\d+) preguntas$/)[1], 10),
      x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  `));
  if (!elegido) return null;
  await pagina.clicEn(elegido.x, elegido.y);
  return (await esperarRutaEnMarco(pagina, '/quiz')) ? elegido.total : null;
}

// Responde la primera opción hasta terminar el quiz y llegar a /resultados.
async function terminarElQuizEnMarco(pagina, total) {
  for (let i = 0; i < total + 2; i++) {
    if (await pagina.evaluar(URL_EN_MARCO) !== '/quiz') break;
    const opcion = await pagina.evaluar(EN_MARCO(`
      const n = visibles('[tabindex]').find((x) => /^A\\s/.test((x.innerText || '').trim()));
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    `));
    if (opcion) await pagina.clicEn(opcion.x, opcion.y);
    await pagina.esperarA(async () => {
      const txt = (await pagina.evaluar(EN_MARCO('return d.body.innerText.toLowerCase();')));
      return txt.includes('siguiente') || txt.includes('ver resultados');
    }, { limite: 5000 });
    if (!await clicEnMarco(pagina, 'ver resultados')) await clicEnMarco(pagina, 'siguiente');
  }
  return esperarRutaEnMarco(pagina, '/resultados');
}

async function barraInternaConYSinVolver(pagina, base, t) {
  for (const ancho of [320, 768]) {
    await abrirMarco(pagina, base, ancho);
    t.ok(`${ancho} px: elegir la materia lleva a /inicio`, await irAHomeEnMarco(pagina), true);

    // Con volver: TopicSelect.
    await clicEnMarco(pagina, 'Entrena Temas/Parciales');
    t.ok(`${ancho} px: TopicSelect`, await esperarRutaEnMarco(pagina, '/temas/practice'), true);
    await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_BARRA)).barra, { limite: 3000 });
    const conVolver = await pagina.evaluar(MEDIR_BARRA);
    t.ok(`${ancho} px: TopicSelect tiene barra interna`, !!conVolver.barra, true);
    t.ok(`${ancho} px: la barra mide ${ALTO_BARRA} px con volver`, conVolver.barra && conVolver.barra.alto, ALTO_BARRA);
    t.ok(`${ancho} px: el filete inferior es de 1 px`, conVolver.filete, '1px');
    t.ok(`${ancho} px: la barra ocupa todo el ancho`,
      !!conVolver.barra && conVolver.barra.izq === 0 && conVolver.barra.ancho === conVolver.vista, true);
    t.ok(`${ancho} px: el volver es un botón con nombre accesible «Volver»`,
      conVolver.volverRol === 'button' && conVolver.volverNombre === 'Volver', true);
    t.ok(`${ancho} px: el volver mide 44 × 44`,
      !!conVolver.volver && conVolver.volver.ancho === LADO_TACTIL && conVolver.volver.alto === LADO_TACTIL, true);
    t.ok(`${ancho} px: el título lleva el copy de la ruta`, conVolver.tituloTexto, 'pKapp · Elegir tema');
    t.ok(`${ancho} px: paso 3.5 entre el volver y el título`,
      !!conVolver.volver && !!conVolver.titulo && conVolver.titulo.izq - conVolver.volver.der, 3.5 * PASO);
    t.ok(`${ancho} px: TopicSelect sin scroll horizontal`, conVolver.desborda, false);
    const ordenadaTitulo = conVolver.titulo && conVolver.titulo.arriba;

    // Quiz: sin barra interna ni título del Stack.
    const total = await irAlQuizEnMarco(pagina);
    t.ok(`${ancho} px: llega al quiz`, total !== null, true);
    if (total === null) continue;
    const quiz = await pagina.evaluar(MEDIR_BARRA);
    t.ok(`${ancho} px: el quiz no tiene barra interna del Stack`, quiz.barra, null);
    t.ok(`${ancho} px: el quiz no muestra el título «${TITULO_DEL_QUIZ}»`, quiz.hayTituloDelQuiz, false);
    t.ok(`${ancho} px: el quiz sin scroll horizontal`, quiz.desborda, false);

    // Sin volver: Results.
    t.ok(`${ancho} px: terminar el quiz lleva a /resultados`, await terminarElQuizEnMarco(pagina, total), true);
    await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_BARRA)).barra, { limite: 3000 });
    const sinVolver = await pagina.evaluar(MEDIR_BARRA);
    t.ok(`${ancho} px: Results tiene barra interna`, !!sinVolver.barra, true);
    t.ok(`${ancho} px: Results no muestra volver`, sinVolver.volver, null);
    t.ok(`${ancho} px: la barra mide lo mismo sin volver`,
      sinVolver.barra && sinVolver.barra.alto, conVolver.barra && conVolver.barra.alto);
    t.ok(`${ancho} px: el título de Results lleva el copy de la ruta`, sinVolver.tituloTexto, 'pKapp · Resultados');
    t.ok(`${ancho} px: el título no cambia de lugar vertical`,
      sinVolver.titulo && sinVolver.titulo.arriba, ordenadaTitulo);
    if (ancho < 448) {
      t.ok(`${ancho} px: sin volver el título arranca en el margen lateral paso 5`,
        sinVolver.titulo && sinVolver.titulo.izq, MARGEN_LATERAL);
    }
    t.ok(`${ancho} px: Results sin scroll horizontal`, sinVolver.desborda, false);
  }
}

async function volverDeLaBarra(pagina, base, t) {
  await abrirMarco(pagina, base, 390);
  await irAHomeEnMarco(pagina);
  await clicEnMarco(pagina, 'Entrena Temas/Parciales');
  await esperarRutaEnMarco(pagina, '/temas/practice');
  await pagina.esperarA(async () => !!(await pagina.evaluar(MEDIR_BARRA)).volver, { limite: 3000 });
  const punto = await pagina.evaluar(EN_MARCO(`
    const n = visibles('[data-testid="barra-volver"]')[0];
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
  `));
  t.ok('TopicSelect muestra el volver de la barra', !!punto, true);
  if (!punto) return;
  await pagina.clicEn(punto.x, punto.y);
  t.ok('el volver de la barra hace goBack a /inicio', await esperarRutaEnMarco(pagina, '/inicio'), true);
}

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
// GRUPO A · corrección de 3.1 (teclado del control de tema, desborde, hover)
// ===========================================================================

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

module.exports = [
  { nombre: 'elegir materia sin rebotar al selector', correr: elegirMateria },
  { nombre: 'el selector muestra seis materias', correr: seisMaterias },
  { nombre: 'atrás y adelante del navegador', correr: atrasDelNavegador },
  { nombre: 'confirmación al abandonar un quiz', correr: confirmarAlSalirDelQuiz },
  { nombre: 'la X del quiz pregunta una sola vez', correr: laXDelQuizPreguntaUnaVez },
  { nombre: 'URLs profundas abiertas en frío', correr: urlsProfundasEnFrio },
  { nombre: 'terminar un quiz no pide confirmación', correr: terminarUnQuizNoPregunta },
  { nombre: 'dre: examen de 50 sin filtro de parcial', correr: suiteExamenSinParciales('Digestivo, Renal y Endócrino', 50) },
  { nombre: 'ryd: examen de 20 sin filtro de parcial', correr: suiteExamenSinParciales('Reproductor y Desarrollo', 20) },
  { nombre: 'HeaderMarca: control Claro | Oscuro', correr: controlDeTema },
  { nombre: 'HeaderMarca: mismo alto en MateriaSelect y Home', correr: altoDeHeaderIgual },
  { nombre: 'HeaderMarca: sin scroll horizontal y corte de 360 px', correr: sinScrollHorizontalYCorteDe360 },
  { nombre: 'Barra interna: mismo alto con y sin volver, quiz sin barra', correr: barraInternaConYSinVolver },
  { nombre: 'Barra interna: el volver hace goBack', correr: volverDeLaBarra },
  { nombre: 'Barra interna: quiz sin barra y el atrás confirma', correr: quizSinBarraYAtrasConfirma },
  // Grupo A
  { nombre: 'HeaderMarca: teclado del control Claro | Oscuro', correr: tecladoDelControlDeTema },
  { nombre: 'HeaderMarca: control negativo del desborde', correr: controlNegativoDeDesborde },
  { nombre: 'HeaderMarca: hover sin halo ni box-shadow', correr: hoverSinHalo },
];

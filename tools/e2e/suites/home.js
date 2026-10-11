// Suite «home» del arnés end-to-end (ver ../README.md).

const { EN_MARCO, LADO_TACTIL, PASO, TITULO_DEL_QUIZ, abrirMarco, clicEnMarco, entrarAMateria, irAHomeEnMarco, medirAmbasPantallas } = require('./comunes');

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

// área segura (0 en web) + paso 3.5 + (paso 11 + border arriba y abajo) + paso 3.5
const ALTO_HEADER = 3.5 * PASO + LADO_TACTIL + 2 + 3.5 * PASO;

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

// relleno `paso 4` arriba y abajo + fila de `paso 11` + filete `border` (área segura 0 en web)
const ALTO_BARRA = 4 * PASO + LADO_TACTIL + 4 * PASO + 1;

const MARGEN_LATERAL = 5 * PASO;      // paso 5

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

module.exports = [
  { nombre: 'atrás y adelante del navegador', correr: atrasDelNavegador },
  { nombre: 'HeaderMarca: mismo alto en MateriaSelect y Home', correr: altoDeHeaderIgual },
  { nombre: 'Barra interna: mismo alto con y sin volver, quiz sin barra', correr: barraInternaConYSinVolver },
  { nombre: 'Barra interna: el volver hace goBack', correr: volverDeLaBarra },
];

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
  await cerrarNota(pagina);
  const nombres = ['Biología Celular y Tisular', 'Anatomía', 'Neurobiología',
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
];

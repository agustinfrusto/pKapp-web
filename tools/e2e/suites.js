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

// Instagram y otros agregan parámetros al link (?utm_*, ?fbclid). Parsear la
// query pasa por query-string -> decode-uri-component, que es CommonJS: una
// versión ESM pura deja la página en blanco con "n is not a function".
async function urlsConQueryString(pagina, base, t) {
  const aperturas = [
    '/?utm_source=ig&utm_medium=social&utm_content=link_in_bio',
    '/?fbclid=abc',
    '/?q=%C3%A1rbol',
  ];
  for (const ruta of aperturas) {
    pagina.errores.length = 0;
    await pagina.ir(base + ruta);
    t.ok(`${ruta}: renderiza el selector`, await pagina.esperarTexto('Tus materias'), true);
    t.ok(`${ruta}: sin excepciones de JS`, pagina.errores.length, 0);
    if (pagina.errores.length) t.nota('  ' + pagina.errores[0]);
  }

  // La materia no persiste entre cargas: en frío /inicio vuelve al selector.
  pagina.errores.length = 0;
  await pagina.ir(base + '/inicio?x=1');
  const volvio = await pagina.esperarA(async () =>
    await pagina.url() === '/' && (await pagina.texto(400)).includes('Tus materias'));
  t.ok('/inicio?x=1 en frío vuelve al selector', volvio, true);
  t.ok('/inicio?x=1: sin excepciones de JS', pagina.errores.length, 0);
  if (pagina.errores.length) t.nota('  ' + pagina.errores[0]);
}


// Navegador interno de Instagram/Facebook: la app intenta salir sola al
// navegador del dispositivo con location.href = 'intent://…' / 'instagram://…'.
// El navegador de prueba no completa esas navegaciones (la página se queda), y
// CDP las informa con Page.frameRequestedNavigation (pagina.navegaciones): se
// prueba la rama real de producción, sin ningún gancho en el script.
// Tras ese intento Chrome headless reemplaza la página por un error de esquema
// desconocido (en Instagram real la página queda): las pruebas del aviso parten
// de una sesión que ya intentó salir, con la marca puesta, para que no navegue.
const UA_IG_ANDROID = 'Mozilla/5.0 (Linux; Android 14; moto g85 5G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 Instagram 330.0.0.0.0 Android';
const UA_IG_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 Instagram 330.0.0.0.0';
const UA_FB_ANDROID = 'Mozilla/5.0 (Linux; Android 14; moto g85 5G) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/450.0.0.38.109;]';
const UA_FB_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 [FBAN/FBIOS;FBAV/450.0.0.38.109;FBBV/1;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBLC/es_LA;FBOP/5]';
const UA_CHROME = 'Mozilla/5.0 (Linux; Android 14; moto g85 5G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

const MARCA_INTENTO = "sessionStorage.setItem('pkapp-salir', '1');";

const esperarMs = (ms) => new Promise((r) => setTimeout(r, ms));

async function conUserAgent(pagina, userAgent, arranque = '') {
  await pagina.enviar('Emulation.setUserAgentOverride', { userAgent });
  if (arranque) await pagina.enviar('Page.addScriptToEvaluateOnNewDocument', { source: arranque });
}

// Intentos de salida automática: navegaciones por script a intent:// o instagram://.
const intentos = (pagina) => pagina.navegaciones.filter((u) => /^(intent|instagram):/.test(u));

async function cargar(pagina, url) {
  pagina.navegaciones.length = 0;
  await pagina.ir(url);
  await pagina.esperarA(async () => {
    try { return await pagina.evaluar("document.readyState === 'complete'"); } catch (e) { return false; }
  }, { limite: 6000 });
}

const FN_BOTONES_AVISO = `(function () {
  const raiz = document.getElementById('pkapp-salir');
  if (!raiz) return null;
  return Array.from(raiz.querySelectorAll('button')).map((b) => {
    const r = b.getBoundingClientRect();
    return { texto: b.innerText.trim(), w: Math.round(r.width), h: Math.round(r.height) };
  });
})()`;

// Como esperarTexto, pero sin tirar si la página dejó de ser la app.
const esperarApp = (pagina) => pagina.esperarA(async () => {
  try { return (await pagina.texto(4000)).includes('Tus materias'); } catch (e) { return false; }
}, { limite: 4000 });

const hayAviso = async (pagina) => !!await pagina.evaluar(FN_BOTONES_AVISO);
const esperarAviso = (pagina) => pagina.esperarA(() => hayAviso(pagina), { limite: 4000 });

const clicBotonAviso = (pagina, texto) => pagina.evaluar(`(function () {
  const b = Array.from(document.querySelectorAll('#pkapp-salir button'))
    .find((n) => n.innerText.trim() === ${JSON.stringify(texto)});
  if (b) b.click();
  return !!b;
})()`);

function suiteSalidaAndroid(app, ua) {
  return async (pagina, base, t) => {
    await conUserAgent(pagina, ua);
    const ruta = '/inicio?utm_source=ig&x=1';
    await cargar(pagina, base + ruta);
    t.ok(`${app}: intenta salir una vez`,
      await pagina.esperarA(async () => intentos(pagina).length === 1, { limite: 4000 }), true);
    const url = intentos(pagina)[0] || '';
    t.ok(`${app}: es un intent:// con ruta y query`,
      url.startsWith('intent://localhost:') && url.includes(ruta + '#Intent;'), true);
    t.ok(`${app}: scheme=https y sin package`,
      url.includes(';scheme=https;') && !url.includes('package='), true);
    t.ok(`${app}: fallback con la URL completa codificada`,
      url.includes('S.browser_fallback_url=' + encodeURIComponent(base + ruta) + ';end'), true);

    await cargar(pagina, base + ruta);
    await esperarApp(pagina);
    await esperarMs(1000);
    t.ok(`${app}: la marca de sesión evita el segundo intento`, intentos(pagina).length, 0);
  };
}

async function salirDeInstagramIos(pagina, base, t) {
  await conUserAgent(pagina, UA_IG_IOS);
  await cargar(pagina, base + '/?fbclid=abc');
  t.ok('ios: intenta instagram://extbrowser', await pagina.esperarA(
    async () => intentos(pagina).length === 1, { limite: 4000 }), true);
  t.ok('ios: lleva la URL completa codificada',
    intentos(pagina)[0] === 'instagram://extbrowser/?url=' + encodeURIComponent(base + '/?fbclid=abc'), true);
}

async function avisoDeInstagramIos(pagina, base, t) {
  await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO);
  await cargar(pagina, base + '/');
  t.ok('ios: no muestra el aviso antes de 1,5 s', await pagina.evaluar(FN_BOTONES_AVISO), null);
  t.ok('ios: a los 1,5 s muestra el aviso', await esperarAviso(pagina), true);
  const botones = (await pagina.evaluar(FN_BOTONES_AVISO)) || [];
  t.ok('aviso: botón «Abrir en tu navegador»', botones.some((b) => b.texto === 'Abrir en tu navegador'), true);
  t.ok('aviso: botón «Copiar link»', botones.some((b) => b.texto === 'Copiar link'), true);
  t.ok('aviso: todos los botones miden al menos 44×44',
    botones.length >= 3 && botones.every((b) => b.w >= 44 && b.h >= 44), true);
}

async function facebookIosSoloCopiar(pagina, base, t) {
  await conUserAgent(pagina, UA_FB_IOS);
  await cargar(pagina, base + '/');
  t.ok('facebook ios: muestra el aviso', await esperarAviso(pagina), true);
  const botones = ((await pagina.evaluar(FN_BOTONES_AVISO)) || []).map((b) => b.texto);
  t.ok('facebook ios: sin botón «Abrir en tu navegador» (no hay mecanismo)',
    botones.includes('Abrir en tu navegador'), false);
  t.ok('facebook ios: queda «Copiar link»', botones.includes('Copiar link'), true);
  t.ok('facebook ios: queda la instrucción manual',
    (await pagina.evaluar("document.getElementById('pkapp-salir').innerText")).includes('Abrir en el navegador externo'), true);
  t.ok('facebook ios: no intenta salir solo', intentos(pagina).length, 0);
}

async function chromeComunNoSale(pagina, base, t) {
  await conUserAgent(pagina, UA_CHROME);
  await cargar(pagina, base + '/');
  await esperarApp(pagina);
  await esperarMs(2200);
  t.ok('chrome común: no intenta navegar', intentos(pagina).length, 0);
  t.ok('chrome común: no muestra aviso', await pagina.evaluar(FN_BOTONES_AVISO), null);
}

async function paginaOcultaNoAvisa(pagina, base, t) {
  await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO +
    "Object.defineProperty(document, 'visibilityState', { get: () => 'hidden', configurable: true });");
  await cargar(pagina, base + '/');
  await esperarApp(pagina);
  await esperarMs(2200);
  t.ok('página oculta a los 1,5 s: no muestra aviso', await pagina.evaluar(FN_BOTONES_AVISO), null);
}

// B1: sin una marca de sesión verificable no hay redirección automática.
function suiteStorageRoto(nombre, arranque) {
  return async (pagina, base, t) => {
    await conUserAgent(pagina, UA_IG_ANDROID, arranque);
    const porCarga = [];
    for (let i = 0; i < 3; i++) {
      await cargar(pagina, base + '/inicio?x=1');
      await esperarApp(pagina);
      await esperarMs(2000);
      porCarga.push(intentos(pagina).length);
    }
    t.ok(`${nombre}: 0 intentos automáticos en 3 cargas`, porCarga.join(','), '0,0,0');
    t.ok(`${nombre}: el aviso de respaldo queda visible`, await hayAviso(pagina), true);
  };
}

const STORAGE_LANZA =
  "const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { " +
  "if (this === window.sessionStorage) throw new Error('cuota'); return o.call(this, k, v); };";
const STORAGE_NO_PERSISTE =
  "const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { " +
  "if (this === window.sessionStorage) return; return o.call(this, k, v); };";
const STORAGE_INACCESIBLE =
  "Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('denied', 'SecurityError'); }, configurable: true });";

// A1: «Link copiado» solo cuando la copia se completó; si no, link seleccionable.
function suiteCopiar(nombre, arranque, copiado) {
  return async (pagina, base, t) => {
    await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO + arranque);
    await cargar(pagina, base + '/');
    t.ok(`${nombre}: el aviso aparece`, await esperarAviso(pagina), true);
    await clicBotonAviso(pagina, 'Copiar link');
    await esperarMs(400);
    const estado = await pagina.evaluar(`(function () {
      const raiz = document.getElementById('pkapp-salir');
      const li = raiz.querySelector('input');
      return {
        texto: raiz.innerText,
        link: !!li && !li.hidden && li.offsetWidth > 0 ? li.value : null,
      };
    })()`);
    if (copiado) {
      t.ok(`${nombre}: confirma «Link copiado»`, estado.texto.includes('Link copiado'), true);
    } else {
      t.ok(`${nombre}: no confirma una copia que falló`, estado.texto.includes('Link copiado'), false);
      t.ok(`${nombre}: pide copiarlo a mano`, estado.texto.includes('Copialo a mano'), true);
      t.ok(`${nombre}: muestra el link seleccionable`, estado.link, base + '/');
    }
  };
}

// A3: rol y nombre, foco al entrar, Escape cierra y el foco vuelve a la página.
async function avisoAccesible(pagina, base, t) {
  await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO +
    "document.addEventListener('DOMContentLoaded', () => { " +
    "const b = document.createElement('button'); b.id = 'pkapp-test-foco'; b.textContent = 'foco'; " +
    "document.body.appendChild(b); b.focus(); });");
  await cargar(pagina, base + '/');
  t.ok('a11y: el aviso aparece', await esperarAviso(pagina), true);
  const info = await pagina.evaluar(`(function () {
    const d = document.getElementById('pkapp-salir');
    const id = d.getAttribute('aria-labelledby');
    const nombre = id && document.getElementById(id);
    return {
      rol: d.getAttribute('role'),
      nombre: nombre ? nombre.innerText.trim() : '',
      foco: d.contains(document.activeElement),
    };
  })()`);
  t.ok('a11y: role="dialog"', info.rol, 'dialog');
  t.ok('a11y: nombre accesible por aria-labelledby', info.nombre.length > 0, true);
  t.ok('a11y: el foco entra al aviso', info.foco, true);

  await pagina.enviar('Input.dispatchKeyEvent',
    { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await pagina.enviar('Input.dispatchKeyEvent',
    { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  t.ok('a11y: Escape cierra el aviso',
    await pagina.esperarA(async () => !await hayAviso(pagina), { limite: 2000 }), true);
  t.ok('a11y: el foco vuelve a la página',
    await pagina.evaluar('document.activeElement && document.activeElement.id'), 'pkapp-test-foco');
}

async function avisoCerradoYAppViva(pagina, base, t) {
  await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO);
  await cargar(pagina, base + '/');
  t.ok('el aviso aparece', await esperarAviso(pagina), true);
  await pagina.evaluar(`(function () {
    const b = document.querySelector('#pkapp-salir button[aria-label="Cerrar"]');
    if (b) b.click();
  })()`);
  t.ok('cerrar quita el aviso', await pagina.esperarA(
    async () => !await hayAviso(pagina), { limite: 2000 }), true);
  t.ok('con el aviso cerrado, la app sigue funcionando',
    await entrarAMateria(pagina, base), true);
  // La marca de cerrado vive en sessionStorage: sobrevive a una recarga completa.
  await cargar(pagina, base + '/');
  await esperarApp(pagina);
  await esperarMs(2200);
  t.ok('el aviso cerrado no vuelve tras recargar la página', await pagina.evaluar(FN_BOTONES_AVISO), null);
}

module.exports = [
  { nombre: 'elegir materia sin rebotar al selector', correr: elegirMateria },
  { nombre: 'el selector muestra seis materias', correr: seisMaterias },
  { nombre: 'atrás y adelante del navegador', correr: atrasDelNavegador },
  { nombre: 'confirmación al abandonar un quiz', correr: confirmarAlSalirDelQuiz },
  { nombre: 'la X del quiz pregunta una sola vez', correr: laXDelQuizPreguntaUnaVez },
  { nombre: 'URLs profundas abiertas en frío', correr: urlsProfundasEnFrio },
  { nombre: 'URLs con query string abiertas en frío', correr: urlsConQueryString },
  { nombre: 'terminar un quiz no pide confirmación', correr: terminarUnQuizNoPregunta },
  { nombre: 'dre: examen de 50 sin filtro de parcial', correr: suiteExamenSinParciales('Digestivo, Renal y Endócrino', 50) },
  { nombre: 'ryd: examen de 20 sin filtro de parcial', correr: suiteExamenSinParciales('Reproductor y Desarrollo', 20) },
  { nombre: 'navegador interno de Instagram en Android sale solo', correr: suiteSalidaAndroid('instagram android', UA_IG_ANDROID) },
  { nombre: 'navegador interno de Facebook en Android sale solo', correr: suiteSalidaAndroid('facebook android', UA_FB_ANDROID) },
  { nombre: 'navegador interno de Instagram en iOS intenta salir', correr: salirDeInstagramIos },
  { nombre: 'navegador interno de Instagram en iOS: aviso de respaldo', correr: avisoDeInstagramIos },
  { nombre: 'navegador interno de Facebook en iOS: aviso sin botón de abrir', correr: facebookIosSoloCopiar },
  { nombre: 'un navegador común no intenta salir ni avisa', correr: chromeComunNoSale },
  { nombre: 'página oculta a los 1,5 s: sin aviso', correr: paginaOcultaNoAvisa },
  { nombre: 'sessionStorage que lanza: sin redirección, solo el aviso', correr: suiteStorageRoto('setItem lanza', STORAGE_LANZA) },
  { nombre: 'sessionStorage que no persiste: sin redirección, solo el aviso', correr: suiteStorageRoto('setItem no persiste', STORAGE_NO_PERSISTE) },
  { nombre: 'sessionStorage inaccesible: sin redirección y sin errores', correr: suiteStorageRoto('storage inaccesible', STORAGE_INACCESIBLE) },
  { nombre: 'copiar link: confirma cuando writeText resuelve', correr: suiteCopiar('writeText ok', "navigator.clipboard.writeText = () => Promise.resolve();", true) },
  { nombre: 'copiar link: writeText rechaza y execCommand falla', correr: suiteCopiar('writeText rechaza', "navigator.clipboard.writeText = () => Promise.reject(new Error('x')); document.execCommand = () => false;", false) },
  { nombre: 'copiar link: sin clipboard y execCommand falla', correr: suiteCopiar('sin clipboard', "Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); document.execCommand = () => false;", false) },
  { nombre: 'copiar link: sin clipboard y execCommand copia', correr: suiteCopiar('execCommand ok', "Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); document.execCommand = () => true;", true) },
  { nombre: 'aviso de salida accesible: rol, nombre, foco y Escape', correr: avisoAccesible },
  { nombre: 'aviso de salida cerrado: la app sigue funcionando', correr: avisoCerradoYAppViva },
];

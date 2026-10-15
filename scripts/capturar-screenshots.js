// Captura las seis pantallas de la app web sobre CDP.
//
//   npm run screenshots -- [--tema claro|oscuro] [--ancho 390[,768,...]] [--salida <dir>]
//
// Sin argumentos: las seis capturas en claro a 390 px en docs/screenshots/.
// Con --tema o --ancho explícito, los archivos llevan siempre ancho y tema en el
// nombre (01-materia-select-320-claro.png), aunque sea uno solo. El script termina siempre: cada paso tiene
// su tope y cualquier falla sale con código distinto de cero.

const fs = require('fs');
const path = require('path');
const { servirEstatico, lanzarChrome } = require('../tools/e2e/entorno');
const { conectarNavegador, abrirPagina, esperar } = require('../tools/e2e/cdp');

const RAIZ = path.resolve(__dirname, '..');
const DIST = path.resolve(RAIZ, process.env.PKAPP_DIST || 'dist');
const PUERTO_WEB = Number(process.env.PKAPP_PUERTO || 8199);
const PUERTO_CDP = Number(process.env.PKAPP_PUERTO_CDP || 9322);
const ALTO = 691;
const LIMITE_PASO_MS = 90000;
const USO = 'Uso: npm run screenshots -- [--tema claro|oscuro] [--ancho 390[,768,...]] [--salida <dir>]';

function leerArgumentos(argv) {
  const opciones = {
    tema: 'claro', anchos: [], explicito: false, salida: path.join(RAIZ, 'docs', 'screenshots'),
  };
  for (let i = 0; i < argv.length; i++) {
    const nombre = argv[i];
    const valor = argv[++i];
    if (valor === undefined || valor.startsWith('--')) {
      throw new Error(`Falta el valor de ${nombre}. ${USO}`);
    }
    if (nombre === '--tema') {
      if (valor !== 'claro' && valor !== 'oscuro') {
        throw new Error(`--tema acepta claro u oscuro, no "${valor}".`);
      }
      opciones.tema = valor;
      opciones.explicito = true;
    } else if (nombre === '--ancho') {
      opciones.explicito = true;
      for (const parte of valor.split(',')) {
        const ancho = Number(parte);
        if (!Number.isInteger(ancho) || ancho < 200 || ancho > 4000) {
          throw new Error(`--ancho espera enteros entre 200 y 4000, no "${parte}".`);
        }
        if (!opciones.anchos.includes(ancho)) opciones.anchos.push(ancho);
      }
    } else if (nombre === '--salida') {
      opciones.salida = path.resolve(valor);
    } else {
      throw new Error(`Argumento desconocido: ${nombre}. ${USO}`);
    }
  }
  if (!opciones.anchos.length) opciones.anchos.push(390);
  return opciones;
}

// Un paso que no termina en el tope es una falla, no una espera infinita.
function conTope(nombre, trabajo) {
  let reloj;
  const tope = new Promise((_, falla) => {
    reloj = setTimeout(
      () => falla(new Error(`El paso "${nombre}" no terminó en ${LIMITE_PASO_MS / 1000}s`)),
      LIMITE_PASO_MS,
    );
  });
  return Promise.race([trabajo(), tope]).finally(() => clearTimeout(reloj));
}

// Las esperas de cdp.js devuelven false al agotarse; acá eso es un error, porque
// seguir capturaría una pantalla que no es la que dice el nombre del archivo.
function exigir(cumplido, mensaje) {
  if (!cumplido) throw new Error(mensaje);
}

async function capturar(navegador, pagina, rutaArchivo) {
  const { data } = await navegador.enviar('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  }, pagina.sessionId);
  fs.writeFileSync(rutaArchivo, Buffer.from(data, 'base64'));
  console.log(`📸 Guardada: ${path.relative(RAIZ, rutaArchivo)}`);
}

// Estadísticas realistas para Biología Celular y Tisular y banderas que evitan
// el banner de donación y la nota del creador.
const SEMILLA_STATS = `(function () {
  const ahora = Date.now();
  const fila = (a, c) => ({ times_answered: a, times_correct: c, last_answered_at: ahora });
  const stats = {
    'P1-QA-001': fila(5, 5), 'P1-QA-002': fila(4, 4), 'P1-QA-003': fila(5, 4),
    'P1-QA-004': fila(6, 5), 'P1-QA-005': fila(4, 1),
    'P1-AA-001': fila(4, 4), 'P1-AA-002': fila(3, 3), 'P1-AA-003': fila(4, 3), 'P1-AA-004': fila(3, 1),
    'P1-LC-001': fila(5, 4), 'P1-LC-002': fila(4, 3), 'P1-LC-003': fila(3, 3), 'P1-LC-004': fila(4, 1),
    'P1-ENZ-001': fila(4, 3), 'P1-ENZ-002': fila(3, 3), 'P1-ENZ-003': fila(3, 1),
    'P1-MET-001': fila(5, 4), 'P1-MET-002': fila(4, 3),
  };
  localStorage.setItem('pkapp_question_stats:bcyt', JSON.stringify(stats));
  localStorage.setItem('pkapp_donation_count', '2');
  // Marcas de visto de los tres avisos de MateriaSelect (src/avisos/avisos.js).
  ['pkapp_aviso_nueva-estetica_visto', 'pkapp_about_seen_at_v3', 'pkapp_aviso_aviso-contenido_visto']
    .forEach((k) => localStorage.setItem(k, String(ahora)));
})()`;

// El tema se aplica por la preferencia `tema` de la app (src/db/database.web.js
// guarda los settings en pkapp_settings), no por el sistema operativo.
const fijarTema = (tema) => `(function () {
  const ajustes = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
  ajustes.tema = ${JSON.stringify(tema)};
  localStorage.setItem('pkapp_settings', JSON.stringify(ajustes));
})()`;

const OPCION_DE_QUIZ = `(function () {
  const nodos = Array.from(document.querySelectorAll('[tabindex]')).filter((n) => {
    const r = n.getBoundingClientRect();
    return /^[A-D]\\s/.test((n.innerText || '').trim()) && r.width > 0 && r.height > 0;
  });
  if (!nodos.length) return null;
  const r = nodos[0].getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
})()`;

const responderPregunta = (mapa, fallar) => `(function (answerMap, shouldFail) {
  const cardNodos = Array.from(document.querySelectorAll('div, span')).filter((n) => {
    const t = (n.innerText || '').trim().replace(/\\s+/g, ' ');
    return answerMap[t];
  });
  const correctOptionText = cardNodos.length
    ? answerMap[cardNodos[0].innerText.trim().replace(/\\s+/g, ' ')] : null;

  const optionElements = Array.from(document.querySelectorAll('[tabindex]')).filter((n) => {
    const r = n.getBoundingClientRect();
    return /^[A-D]\\s/.test((n.innerText || '').trim()) && r.width > 0 && r.height > 0;
  });
  if (!optionElements.length) return null;

  let target = optionElements[0];
  if (correctOptionText && !shouldFail) {
    const match = optionElements.find((el) => (el.innerText || '').includes(correctOptionText));
    if (match) target = match;
  } else if (shouldFail && correctOptionText) {
    const wrong = optionElements.find((el) => !(el.innerText || '').includes(correctOptionText));
    if (wrong) target = wrong;
  }

  const r = target.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
})(${JSON.stringify(mapa)}, ${fallar})`;

async function mapaDeRespuestas() {
  const { QUESTIONS } = await import('../src/materias/bcyt/questions.js');
  const mapa = {};
  QUESTIONS.forEach((q) => {
    const texto = q.question.trim().replace(/\s+/g, ' ');
    mapa[texto] = q.options[q.correctIndex].trim().replace(/\s+/g, ' ');
  });
  return mapa;
}

async function capturarAncho({ navegador, base, ancho, tema, salida, sufijo }) {
  const pagina = await abrirPagina(navegador, { ancho, alto: ALTO, escala: 2, movil: ancho < 768 });
  const archivo = (nombre) => path.join(salida, `${nombre}${sufijo ? `-${ancho}-${tema}` : ''}.png`);
  const paso = (nombre, trabajo) => {
    console.log(`\n--- ${nombre} (${ancho}px, ${tema}) ---`);
    return conTope(nombre, trabajo);
  };

  try {
    await paso('0. Semilla', async () => {
      await pagina.ir(base + '/');
      exigir(await pagina.esperarTexto('Tus materias'), 'La app no mostró "Tus materias" al cargar');
      await pagina.evaluar(SEMILLA_STATS);
      await pagina.evaluar(fijarTema(tema));
    });

    await paso('1. Materia Select', async () => {
      await pagina.ir(base + '/');
      exigir(await pagina.esperarTexto('Tus materias'), 'La app no mostró "Tus materias" tras recargar');
      const oscuro = await pagina.evaluar("document.documentElement.classList.contains('dark')");
      exigir(oscuro === (tema === 'oscuro'),
        `El tema aplicado no es ${tema} (clase dark: ${oscuro})`);
      await esperar(500);
      await capturar(navegador, pagina, archivo('01-materia-select'));
    });

    await paso('2. Home', async () => {
      exigir(await pagina.clic('Biología Celular y Tisular'), 'No se encontró la materia Biología Celular y Tisular');
      exigir(await pagina.esperarUrl('/inicio'), 'No se llegó a /inicio');
      await esperar(500);
      await capturar(navegador, pagina, archivo('02-home'));
    });

    await paso('3. Topic Select', async () => {
      exigir(await pagina.clic('Entrena Temas/Parciales'), 'No se encontró "Entrena Temas/Parciales"');
      exigir(await pagina.esperarUrl('/temas/practice'), 'No se llegó a /temas/practice');
      await esperar(600);
      await capturar(navegador, pagina, archivo('03-topic-select'));
    });

    await paso('4. Quiz', async () => {
      exigir(await pagina.clic('Química del agua'), 'No se encontró el tema "Química del agua"');
      exigir(await pagina.esperarUrl('/quiz'), 'No se llegó a /quiz');
      await esperar(600);
      const opcion = await pagina.evaluar(OPCION_DE_QUIZ);
      exigir(opcion, 'El quiz no mostró opciones');
      await pagina.clicEn(opcion.x, opcion.y);
      await esperar(600);
      await capturar(navegador, pagina, archivo('04-quiz'));
    });

    await paso('5. Results', async () => {
      const mapa = await mapaDeRespuestas();
      // ~88% de aciertos: tres respuestas incorrectas a propósito.
      for (let i = 0; i < 30; i++) {
        if (await pagina.url() === '/resultados') break;

        const avanzar = await pagina.ubicar('Ver resultados') || await pagina.ubicar('Siguiente');
        if (avanzar) {
          await pagina.clicEn(avanzar.x, avanzar.y);
          await esperar(150);
          continue;
        }

        const fallar = i === 5 || i === 12 || i === 18;
        const coord = await pagina.evaluar(responderPregunta(mapa, fallar));
        if (coord) {
          await pagina.clicEn(coord.x, coord.y);
          await esperar(120);
        }

        const sig = await pagina.ubicar('Ver resultados') || await pagina.ubicar('Siguiente');
        if (sig) {
          await pagina.clicEn(sig.x, sig.y);
          await esperar(150);
        }
      }
      exigir(await pagina.esperarUrl('/resultados'), 'El quiz no llegó a /resultados');
      await esperar(600);
      await capturar(navegador, pagina, archivo('05-results'));
    });

    await paso('6. Stats', async () => {
      exigir(await pagina.clic('Inicio'), 'No se encontró el botón "Inicio"');
      exigir(await pagina.esperarUrl('/inicio'), 'No se volvió a /inicio');
      await esperar(500);
      exigir(await pagina.clic('Mis estadísticas'), 'No se encontró "Mis estadísticas"');
      exigir(await pagina.esperarUrl('/estadisticas'), 'No se llegó a /estadisticas');
      await esperar(800);
      await capturar(navegador, pagina, archivo('06-stats'));
    });
  } finally {
    // Con Chrome caído, cerrar la pestaña esperaría el tope de comando entero.
    await Promise.race([pagina.cerrar().catch(() => {}), esperar(3000)]);
  }
}

async function main() {
  const { tema, anchos, explicito, salida } = leerArgumentos(process.argv.slice(2));
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('No hay dist/. Corré npm run build:web antes de capturar.');
  }
  fs.mkdirSync(salida, { recursive: true });

  const servidor = await servirEstatico(DIST, PUERTO_WEB);
  let chrome;
  let navegador;
  try {
    chrome = await lanzarChrome(PUERTO_CDP);
    navegador = await conectarNavegador(PUERTO_CDP);
    const base = `http://localhost:${PUERTO_WEB}`;
    const sufijo = explicito || anchos.length > 1;

    for (const ancho of anchos) {
      await capturarAncho({ navegador, base, ancho, tema, salida, sufijo });
    }
    console.log('\n🎉 ¡Todas las capturas se generaron correctamente!');
  } finally {
    if (navegador) navegador.cerrar();
    if (chrome) await chrome.cerrar();
    await servidor.cerrar();
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(`Error generando capturas: ${err.message}`);
    process.exit(1);
  },
);

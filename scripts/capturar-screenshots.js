const fs = require('fs');
const path = require('path');
const { servirEstatico, lanzarChrome } = require('../tools/e2e/entorno');
const { conectarNavegador, abrirPagina, esperar } = require('../tools/e2e/cdp');

const RAIZ = path.resolve(__dirname, '..');
const DIST = path.join(RAIZ, 'dist');
const SCREENSHOTS_DIR = path.join(RAIZ, 'docs', 'screenshots');
const PUERTO_WEB = 8199;
const PUERTO_CDP = 9322;

async function capturar(navegador, sessionId, rutaArchivo) {
  const { data } = await navegador.enviar('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  }, sessionId);
  fs.writeFileSync(rutaArchivo, Buffer.from(data, 'base64'));
  console.log(`📸 Guardada: ${path.relative(RAIZ, rutaArchivo)}`);
}

async function cerrarNota(pagina) {
  if (await pagina.ubicar('✕')) {
    await pagina.clic('✕');
    await pagina.esperarA(async () => !await pagina.ubicar('✕'), { limite: 3000 });
    await esperar(300);
  }
}

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const servidor = await servirEstatico(DIST, PUERTO_WEB);
  const chrome = await lanzarChrome(PUERTO_CDP);
  const navegador = await conectarNavegador(PUERTO_CDP);
  const base = `http://localhost:${PUERTO_WEB}`;

  try {
    // Abrir página con viewport móvil estándar (400 x 691 @ 2x = 800 x 1382)
    const { targetId } = await navegador.enviar('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await navegador.enviar('Target.attachToTarget', { targetId, flatten: true });

    await navegador.enviar('Page.enable', {}, sessionId);
    await navegador.enviar('Runtime.enable', {}, sessionId);
    await navegador.enviar('Emulation.setDeviceMetricsOverride', {
      width: 400,
      height: 691,
      deviceScaleFactor: 2,
      mobile: true,
    }, sessionId);

    const pagina = {
      dialogos: [],
      errores: [],
      respuestaDialogo: 'cancelar',
    };

    pagina.evaluar = async (expr) => {
      const r = await navegador.enviar('Runtime.evaluate',
        { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
      return r.result.value;
    };

    pagina.ir = (url) => navegador.enviar('Page.navigate', { url }, sessionId);
    pagina.url = () => pagina.evaluar('location.pathname');
    pagina.texto = (n = 160) =>
      pagina.evaluar(`document.body.innerText.replace(/\\s+/g,' ').slice(0, ${n})`);

    const FN_UBICAR = `(function (t) {
      const cands = Array.from(document.querySelectorAll('[tabindex]')).filter((n) => {
        const r = n.getBoundingClientRect();
        return (n.innerText || '').includes(t) && r.width > 0 && r.height > 0;
      });
      if (!cands.length) return null;
      cands.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
      const el = cands[0];
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.left + r.width / 2),
        y: Math.round(r.top + r.height / 2),
        texto: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 45),
      };
    })`;

    pagina.ubicar = (texto) => pagina.evaluar(`${FN_UBICAR}(${JSON.stringify(texto)})`);

    pagina.clicEn = async (x, y) => {
      for (const type of ['mousePressed', 'mouseReleased']) {
        await navegador.enviar('Input.dispatchMouseEvent',
          { type, x, y, button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0 },
          sessionId);
        await esperar(50);
      }
    };

    pagina.clic = async (texto) => {
      if (!await pagina.ubicar(texto)) return null;
      await esperar(400);
      const p = await pagina.ubicar(texto);
      if (!p) return null;
      await pagina.clicEn(p.x, p.y);
      return p.texto;
    };

    pagina.esperarA = async (fn, { intento = 100, limite = 15000 } = {}) => {
      const hasta = Date.now() + limite;
      for (;;) {
        if (await fn()) return true;
        if (Date.now() > hasta) return false;
        await esperar(intento);
      }
    };

    pagina.esperarUrl = (esperada, opts) =>
      pagina.esperarA(async () => await pagina.url() === esperada, opts);

    pagina.esperarTexto = (txt, opts) =>
      pagina.esperarA(async () => (await pagina.texto(4000)).includes(txt), opts);

    // Sembrar estadísticas realistas para la materia Biología Celular y Tisular
    await pagina.ir(base + '/');
    await pagina.esperarTexto('Tus materias');

    await pagina.evaluar(`
      (function() {
        const statsBcyt = {
          // quimica-agua
          'P1-QA-001': { times_answered: 5, times_correct: 5, last_answered_at: Date.now() },
          'P1-QA-002': { times_answered: 4, times_correct: 4, last_answered_at: Date.now() },
          'P1-QA-003': { times_answered: 5, times_correct: 4, last_answered_at: Date.now() },
          'P1-QA-004': { times_answered: 6, times_correct: 5, last_answered_at: Date.now() },
          'P1-QA-005': { times_answered: 4, times_correct: 1, last_answered_at: Date.now() },
          // aminoacidos
          'P1-AA-001': { times_answered: 4, times_correct: 4, last_answered_at: Date.now() },
          'P1-AA-002': { times_answered: 3, times_correct: 3, last_answered_at: Date.now() },
          'P1-AA-003': { times_answered: 4, times_correct: 3, last_answered_at: Date.now() },
          'P1-AA-004': { times_answered: 3, times_correct: 1, last_answered_at: Date.now() },
          // lipidos-glucidos
          'P1-LC-001': { times_answered: 5, times_correct: 4, last_answered_at: Date.now() },
          'P1-LC-002': { times_answered: 4, times_correct: 3, last_answered_at: Date.now() },
          'P1-LC-003': { times_answered: 3, times_correct: 3, last_answered_at: Date.now() },
          'P1-LC-004': { times_answered: 4, times_correct: 1, last_answered_at: Date.now() },
          // enzimas
          'P1-ENZ-001': { times_answered: 4, times_correct: 3, last_answered_at: Date.now() },
          'P1-ENZ-002': { times_answered: 3, times_correct: 3, last_answered_at: Date.now() },
          'P1-ENZ-003': { times_answered: 3, times_correct: 1, last_answered_at: Date.now() },
          // metabolismo
          'P1-MET-001': { times_answered: 5, times_correct: 4, last_answered_at: Date.now() },
          'P1-MET-002': { times_answered: 4, times_correct: 3, last_answered_at: Date.now() },
        };
        localStorage.setItem('pkapp_question_stats:bcyt', JSON.stringify(statsBcyt));
        localStorage.setItem('pkapp_donation_count', '2'); // Evitar banner de donación
        localStorage.setItem('pkapp_about_seen_at', String(Date.now())); // No tapar con nota del creador
      })()
    `);

    // 1. Materia Select Screen
    console.log('\n--- 1. Materia Select ---');
    await pagina.ir(base + '/');
    await pagina.esperarTexto('Tus materias');
    await esperar(500);
    await capturar(navegador, sessionId, path.join(SCREENSHOTS_DIR, '01-materia-select.png'));

    // 2. Home Screen
    console.log('\n--- 2. Home Screen ---');
    await pagina.clic('Biología Celular y Tisular');
    await pagina.esperarUrl('/inicio');
    await esperar(500);
    await capturar(navegador, sessionId, path.join(SCREENSHOTS_DIR, '02-home.png'));

    // 3. Topic Select Screen
    console.log('\n--- 3. Topic Select Screen ---');
    await pagina.clic('Entrena Temas/Parciales');
    await pagina.esperarUrl('/temas/practice');
    await esperar(600);
    await capturar(navegador, sessionId, path.join(SCREENSHOTS_DIR, '03-topic-select.png'));

    // 4. Quiz Screen (con respuesta seleccionada y explicación visible)
    console.log('\n--- 4. Quiz Screen ---');
    await pagina.clic('Química del agua');
    await pagina.esperarUrl('/quiz');
    await esperar(600);

    // Responder la primera pregunta haciendo click en la opción correcta (opción A "Se lisan")
    const clickOpcion = await pagina.evaluar(`(function () {
      const nodos = Array.from(document.querySelectorAll('[tabindex]')).filter((n) => {
        const r = n.getBoundingClientRect();
        return /^[A-D]\\s/.test((n.innerText || '').trim()) && r.width > 0 && r.height > 0;
      });
      if (!nodos.length) return null;
      const r = nodos[0].getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`);

    if (clickOpcion) {
      await pagina.clicEn(clickOpcion.x, clickOpcion.y);
      await esperar(600);
    }
    await capturar(navegador, sessionId, path.join(SCREENSHOTS_DIR, '04-quiz.png'));

    // 5. Results Screen
    console.log('\n--- 5. Results Screen ---');
    const { QUESTIONS } = await import('../src/materias/bcyt/questions.js');
    const correctAnswersMap = {};
    QUESTIONS.forEach(q => {
      const qText = q.question.trim().replace(/\s+/g, ' ');
      const correctText = q.options[q.correctIndex].trim().replace(/\s+/g, ' ');
      correctAnswersMap[qText] = correctText;
    });

    // Completar el quiz respondiendo con ~88% de aciertos (21 de 24)
    for (let i = 0; i < 30; i++) {
      if (await pagina.url() === '/resultados') break;

      const btnSigYa = await pagina.ubicar('Ver resultados') || await pagina.ubicar('Siguiente');
      if (btnSigYa) {
        await pagina.clicEn(btnSigYa.x, btnSigYa.y);
        await esperar(150);
        continue;
      }

      // Buscar el texto de la pregunta actual y responder la opción correcta (salvo en 3 preguntas)
      const shouldFail = (i === 5 || i === 12 || i === 18);
      await pagina.evaluar(`(function (answerMap, shouldFail) {
        // Encontrar texto de la pregunta
        const cardNodos = Array.from(document.querySelectorAll('div, span')).filter(n => {
          const t = (n.innerText || '').trim().replace(/\\s+/g, ' ');
          return answerMap[t];
        });
        const correctOptionText = cardNodos.length ? answerMap[cardNodos[0].innerText.trim().replace(/\\s+/g, ' ')] : null;

        // Encontrar opciones A, B, C...
        const optionElements = Array.from(document.querySelectorAll('[tabindex]')).filter((n) => {
          const r = n.getBoundingClientRect();
          return /^[A-D]\\s/.test((n.innerText || '').trim()) && r.width > 0 && r.height > 0;
        });
        if (!optionElements.length) return null;

        let target = optionElements[0];
        if (correctOptionText && !shouldFail) {
          const match = optionElements.find(el => (el.innerText || '').includes(correctOptionText));
          if (match) target = match;
        } else if (shouldFail && correctOptionText) {
          const wrong = optionElements.find(el => !(el.innerText || '').includes(correctOptionText));
          if (wrong) target = wrong;
        }

        const r = target.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      })(${JSON.stringify(correctAnswersMap)}, ${shouldFail})`).then(async (coord) => {
        if (coord) {
          await pagina.clicEn(coord.x, coord.y);
          await esperar(120);
        }
      });

      const btnSig = await pagina.ubicar('Ver resultados') || await pagina.ubicar('Siguiente');
      if (btnSig) {
        await pagina.clicEn(btnSig.x, btnSig.y);
        await esperar(150);
      }
    }
    await pagina.esperarUrl('/resultados');
    await esperar(600);
    await capturar(navegador, sessionId, path.join(SCREENSHOTS_DIR, '05-results.png'));

    // 6. Stats Screen
    console.log('\n--- 6. Stats Screen ---');
    await pagina.clic('Inicio');
    await pagina.esperarUrl('/inicio');
    await esperar(500);
    await pagina.clic('Mis estadísticas');
    await pagina.esperarUrl('/estadisticas');
    await esperar(800);
    await capturar(navegador, sessionId, path.join(SCREENSHOTS_DIR, '06-stats.png'));

    console.log('\n🎉 ¡Todas las capturas se generaron correctamente!');
  } finally {
    navegador.cerrar();
    await chrome.cerrar();
    await servidor.cerrar();
  }
}

main().catch((err) => {
  console.error('Error generando capturas:', err);
  process.exit(1);
});

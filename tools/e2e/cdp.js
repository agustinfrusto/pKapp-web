// Cliente mínimo del Chrome DevTools Protocol, con los ayudantes que hacen falta
// para manejar una app react-native-web.
//
// Por qué no basta con `el.click()`: react-native-web no escucha el evento
// `click` de los Touchable, usa su sistema de responders sobre eventos de
// puntero. Lo que sí funciona sin sorpresas es pedirle al navegador un click de
// verdad por coordenadas (Input.dispatchMouseEvent), que es lo que hace `clic`.

const CDP_HOST = '127.0.0.1';

async function conectarNavegador(puerto) {
  const info = await (await fetch(`http://${CDP_HOST}:${puerto}/json/version`)).json();
  const ws = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((listo, falla) => {
    ws.onopen = listo;
    ws.onerror = () => falla(new Error('No se pudo abrir el WebSocket del navegador'));
  });

  let proximoId = 1;
  const pendientes = new Map();
  const oyentes = [];

  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pendientes.has(m.id)) {
      const { listo, falla } = pendientes.get(m.id);
      pendientes.delete(m.id);
      m.error ? falla(new Error(m.error.message)) : listo(m.result);
    } else {
      oyentes.forEach((fn) => fn(m));
    }
  };

  // Si Chrome deja de contestar o se cae, un comando sin respuesta dejaría la
  // corrida colgada para siempre: cada uno tiene su tope y el cierre del
  // socket rechaza lo que quedó pendiente.
  const LIMITE_COMANDO_MS = 30000;

  ws.onclose = () => {
    for (const { falla } of pendientes.values()) {
      falla(new Error('Chrome cerró la conexión de debugging'));
    }
    pendientes.clear();
  };

  function enviar(method, params = {}, sessionId) {
    const id = proximoId++;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((listo, falla) => {
      const reloj = setTimeout(() => {
        pendientes.delete(id);
        falla(new Error(`Chrome no contestó a ${method} en ${LIMITE_COMANDO_MS / 1000}s`));
      }, LIMITE_COMANDO_MS);
      pendientes.set(id, {
        listo: (r) => { clearTimeout(reloj); listo(r); },
        falla: (e) => { clearTimeout(reloj); falla(e); },
      });
      ws.send(JSON.stringify(msg));
    });
  }

  return {
    enviar,
    alEvento: (fn) => oyentes.push(fn),
    cerrar: () => ws.close(),
  };
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Busca el elemento clickeable más específico que contenga el texto.
// react-native-web marca los Touchable con tabindex. Se descartan los de tamaño
// cero: las pantallas anteriores del stack siguen en el DOM y matchean igual.
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

// `escala` y `movil` son para quien captura imágenes (scripts/capturar-
// screenshots.js); los defaults son los de la e2e y no cambian su comportamiento.
async function abrirPagina(navegador, { ancho = 900, alto = 1400, escala = 1, movil = false } = {}) {
  const { targetId } = await navegador.enviar('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await navegador.enviar('Target.attachToTarget', { targetId, flatten: true });

  await navegador.enviar('Page.enable', {}, sessionId);
  await navegador.enviar('Runtime.enable', {}, sessionId);
  await navegador.enviar('Emulation.setDeviceMetricsOverride',
    { width: ancho, height: alto, deviceScaleFactor: escala, mobile: movil }, sessionId);

  const pagina = {
    sessionId,
    dialogos: [],
    errores: [],
    // 'aceptar' | 'cancelar': qué contestar al próximo window.confirm.
    respuestaDialogo: 'cancelar',
  };

  navegador.alEvento(async (m) => {
    if (m.sessionId !== sessionId) return;
    if (m.method === 'Page.javascriptDialogOpening') {
      pagina.dialogos.push(m.params.message);
      // Sin dueño, un rechazo (Chrome caído o mudo) mataría el proceso con
      // unhandledRejection antes del finally que cierra Chrome y el servidor.
      await navegador.enviar('Page.handleJavaScriptDialog',
        { accept: pagina.respuestaDialogo === 'aceptar' }, sessionId).catch(() => {});
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      pagina.errores.push(d.text + ' ' + ((d.exception && d.exception.description) || ''));
    }
  });

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

  pagina.ubicar = (texto) => pagina.evaluar(`${FN_UBICAR}(${JSON.stringify(texto)})`);

  pagina.clicEn = async (x, y) => {
    for (const type of ['mousePressed', 'mouseReleased']) {
      await navegador.enviar('Input.dispatchMouseEvent',
        { type, x, y, button: 'left', clickCount: 1, buttons: type === 'mousePressed' ? 1 : 0 },
        sessionId);
      await esperar(50);
    }
  };

  // Teclado real (Input.dispatchKeyEvent): dispara la acción por defecto del
  // navegador, a diferencia de un KeyboardEvent sintético. `key` es el nombre DOM.
  const TECLAS = {
    Tab: { code: 'Tab', vk: 9 },
    Enter: { code: 'Enter', vk: 13, text: '\r' },
    ' ': { code: 'Space', vk: 32, text: ' ' },
    ArrowLeft: { code: 'ArrowLeft', vk: 37 },
    ArrowUp: { code: 'ArrowUp', vk: 38 },
    ArrowRight: { code: 'ArrowRight', vk: 39 },
    ArrowDown: { code: 'ArrowDown', vk: 40 },
  };

  pagina.tecla = async (key, { shift = false } = {}) => {
    const def = TECLAS[key];
    if (!def) throw new Error(`tecla sin definir: ${JSON.stringify(key)}`);
    const base = { key, code: def.code, windowsVirtualKeyCode: def.vk,
      nativeVirtualKeyCode: def.vk, modifiers: shift ? 8 : 0 };
    await navegador.enviar('Input.dispatchKeyEvent',
      { ...base, type: def.text ? 'keyDown' : 'rawKeyDown', ...(def.text ? { text: def.text } : null) },
      sessionId);
    await navegador.enviar('Input.dispatchKeyEvent', { ...base, type: 'keyUp' }, sessionId);
    await esperar(50);
  };

  // Mueve el puntero sin presionar: dispara hover real.
  pagina.moverA = async (x, y) => {
    await navegador.enviar('Input.dispatchMouseEvent',
      { type: 'mouseMoved', x, y, button: 'none', buttons: 0 }, sessionId);
    await esperar(50);
  };

  // Dos pasadas a propósito: la primera acomoda el scroll, la segunda mide.
  // Midiendo de una salen las coordenadas de antes de scrollear.
  pagina.clic = async (texto) => {
    if (!await pagina.ubicar(texto)) return null;
    await esperar(400);
    const p = await pagina.ubicar(texto);
    if (!p) return null;
    await pagina.clicEn(p.x, p.y);
    return p.texto;
  };

  // Espera a que algo se cumpla en vez de dormir un rato fijo: la carga de
  // materias es asíncrona y los tiempos varían entre máquinas.
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

  pagina.cerrar = () => navegador.enviar('Target.closeTarget', { targetId });

  return pagina;
}

module.exports = { conectarNavegador, abrirPagina, esperar };

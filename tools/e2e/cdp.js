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

  function enviar(method, params = {}, sessionId) {
    const id = proximoId++;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    ws.send(JSON.stringify(msg));
    return new Promise((listo, falla) => pendientes.set(id, { listo, falla }));
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

async function abrirPagina(navegador, { ancho = 900, alto = 1400 } = {}) {
  const { targetId } = await navegador.enviar('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await navegador.enviar('Target.attachToTarget', { targetId, flatten: true });

  await navegador.enviar('Page.enable', {}, sessionId);
  await navegador.enviar('Runtime.enable', {}, sessionId);
  await navegador.enviar('Emulation.setDeviceMetricsOverride',
    { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false }, sessionId);

  const pagina = {
    dialogos: [],
    errores: [],
    // 'aceptar' | 'cancelar': qué contestar al próximo window.confirm.
    respuestaDialogo: 'cancelar',
  };

  navegador.alEvento(async (m) => {
    if (m.sessionId !== sessionId) return;
    if (m.method === 'Page.javascriptDialogOpening') {
      pagina.dialogos.push(m.params.message);
      await navegador.enviar('Page.handleJavaScriptDialog',
        { accept: pagina.respuestaDialogo === 'aceptar' }, sessionId);
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

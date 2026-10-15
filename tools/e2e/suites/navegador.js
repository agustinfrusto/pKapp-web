// Suite «navegador» del arnés end-to-end (ver ../README.md): la salida del navegador
// interno de Instagram/Facebook que inyecta scripts/inject-pwa.js (sección 2.6).

const fs = require('fs');
const path = require('path');

const { entrarAMateria } = require('./comunes');

// Mismo texto que `esperarSelector` de comunes.js: el rótulo sale en mayúsculas por CSS.
const TEXTO_DEL_SELECTOR = 'tus materias de esfuno';

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
  try { return (await pagina.texto(4000)).toLowerCase().includes(TEXTO_DEL_SELECTOR); } catch (e) { return false; }
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

// REV-6, fila 10: el aviso se pinta solo con Instagram. Con Facebook (FBAN, FBAV,
// FB_IAB) no existe `#pkapp-salir`; la salida automática de Android se conserva.
// Sin marca previa (`conMarca` falso) la sesión no ha intentado salir: es la única forma
// de que `intentos === 0` pruebe que `salir()` no corre con Facebook en iOS. Con la marca
// puesta `salir()` nunca corre, así que solo se afirma el aviso.
function suiteFacebookSinAviso(nombre, ua, conMarca = true) {
  return async (pagina, base, t) => {
    await conUserAgent(pagina, ua, conMarca ? MARCA_INTENTO : '');
    await cargar(pagina, base + '/');
    await esperarApp(pagina);
    await esperarMs(2200);
    t.ok(`${nombre}: no se pinta el aviso a los 2,2 s`, await hayAviso(pagina), false);
    if (!conMarca) t.ok(`${nombre}: no intenta salir solo, sin marca previa`, intentos(pagina).length, 0);
  };
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

const NOTA_PEGAR = 'Pegalo en la barra de direcciones de tu navegador.';
const NOTA_A_MANO = 'No se pudo copiar. Mantené presionado el link para copiarlo.';
// `acento` y `error` claros de plancha (el aviso toma el tema guardado: claro por defecto).
const RGB_ACENTO = 'rgb(11, 110, 128)';
const RGB_ERROR = 'rgb(163, 36, 36)';
// `tinta` y `fondo` claros de plancha: el presionado invierte en toda clase (COMUN-P2, CD-2).
const RGB_TINTA = 'rgb(20, 24, 29)';
const RGB_FONDO = 'rgb(244, 245, 246)';

// Estilo de K2 con el botón del mouse abajo y sin soltar (se suelta fuera del botón).
const FN_RECT_K2 = `(function () {
  const k2 = Array.from(document.querySelectorAll('#pkapp-salir button'))
    .find((b) => !b.classList.contains('p') && !b.classList.contains('x'));
  const r = k2.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
})()`;
const FN_PINTURA_K2 = `(function () {
  const k2 = Array.from(document.querySelectorAll('#pkapp-salir button'))
    .find((b) => !b.classList.contains('p') && !b.classList.contains('x'));
  const e = getComputedStyle(k2);
  return { fondo: e.backgroundColor, texto: e.color, borde: e.borderTopWidth + ' ' + e.borderTopColor };
})()`;

async function pinturaK2Presionado(pagina) {
  const c = await pagina.evaluar(FN_RECT_K2);
  await pagina.moverA(c.x, c.y);
  await pagina.enviar('Input.dispatchMouseEvent',
    { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1, buttons: 1 });
  await esperarMs(150);
  const pintura = await pagina.evaluar(FN_PINTURA_K2);
  await pagina.enviar('Input.dispatchMouseEvent',
    { type: 'mouseReleased', x: 1, y: 1, button: 'left', clickCount: 1, buttons: 0 });
  await pagina.moverA(1, 1);
  await esperarMs(150);
  return pintura;
}

const FN_ESTADO_AVISO = `(function () {
  const raiz = document.getElementById('pkapp-salir');
  if (!raiz) return null;
  const li = raiz.querySelector('input');
  const k2 = Array.from(raiz.querySelectorAll('button'))
    .find((b) => !b.classList.contains('p') && !b.classList.contains('x'));
  const estilo = getComputedStyle(k2);
  const nota = raiz.querySelector('p[role="status"]');
  const L = raiz.getBoundingClientRect();
  const desborda = Array.from(raiz.querySelectorAll('button, p, span, .f'))
    .some((n) => n.getBoundingClientRect().right > L.right + 0.5);
  return {
    texto: raiz.innerText,
    etiqueta: k2.innerText.trim(),
    nota: nota ? nota.innerText.trim() : null,
    topK2EnLamina: Math.round(k2.getBoundingClientRect().top - L.top),
    bordeK2: estilo.borderTopWidth + ' ' + estilo.borderTopColor,
    colorK2: estilo.color,
    desborda,
    link: !!li && !li.hidden && li.offsetWidth > 0 ? li.value : null,
    linkConFoco: !!li && document.activeElement === li,
    linkSeleccionado: !!li && li.selectionStart === 0 && li.selectionEnd === li.value.length && li.value.length > 0,
  };
})()`;

// A1: «Copiado» solo cuando la copia se completó; si no, link seleccionable.
function suiteCopiar(nombre, arranque, copiado) {
  return async (pagina, base, t) => {
    await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO + arranque);
    await cargar(pagina, base + '/');
    t.ok(`${nombre}: el aviso aparece`, await esperarAviso(pagina), true);
    const antes = await pagina.evaluar(FN_ESTADO_AVISO);
    t.ok(`${nombre}: nada pasa el borde derecho en reposo`, antes.desborda, false);
    await clicBotonAviso(pagina, 'Copiar link');
    await esperarMs(400);
    const estado = await pagina.evaluar(FN_ESTADO_AVISO);
    // La lámina está anclada abajo y crece hacia arriba (link de respaldo, o K2 en otra fila):
    // el `top` absoluto de K2 no sirve en ningún estado; lo que no debe cambiar es su
    // posición dentro de la lámina.
    t.ok(`${nombre}: los botones no cambian de fila`, estado.topK2EnLamina, antes.topK2EnLamina);
    t.ok(`${nombre}: nada pasa el borde derecho tras copiar`, estado.desborda, false);
    if (copiado) {
      t.ok(`${nombre}: la etiqueta de K2 dice «Copiado»`, estado.etiqueta, 'Copiado');
      t.ok(`${nombre}: la nota dice qué sigue`, estado.nota, NOTA_PEGAR);
      t.ok(`${nombre}: K2 con borde de 2 px acento`, estado.bordeK2, '2px ' + RGB_ACENTO);
      t.ok(`${nombre}: ya no dice «Link copiado»`, estado.texto.includes('Link copiado'), false);
      t.ok(`${nombre}: en reposo K2 conserva texto acento`, estado.colorK2, RGB_ACENTO);
      const p = await pinturaK2Presionado(pagina);
      t.ok(`${nombre}: presionado, K2 invierte el fondo a tinta`, p.fondo, RGB_TINTA);
      t.ok(`${nombre}: presionado, K2 invierte el texto a fondo`, p.texto, RGB_FONDO);
      t.ok(`${nombre}: presionado, K2 conserva 2 px y borde tinta`, p.borde, '2px ' + RGB_TINTA);
    } else {
      t.ok(`${nombre}: no confirma una copia que falló`, estado.etiqueta === 'Copiado', false);
      t.ok(`${nombre}: la nota pide copiarlo a mano`, estado.nota, NOTA_A_MANO);
      t.ok(`${nombre}: K2 con borde de 2 px error`, estado.bordeK2, '2px ' + RGB_ERROR);
      t.ok(`${nombre}: muestra el link seleccionable`, estado.link, base + '/');
      t.ok(`${nombre}: el link tiene el foco`, estado.linkConFoco, true);
      t.ok(`${nombre}: el link queda seleccionado`, estado.linkSeleccionado, true);
      t.ok(`${nombre}: en reposo K2 conserva texto error`, estado.colorK2, RGB_ERROR);
      const p = await pinturaK2Presionado(pagina);
      t.ok(`${nombre}: presionado, K2 invierte el fondo a tinta`, p.fondo, RGB_TINTA);
      t.ok(`${nombre}: presionado, K2 invierte el texto a fondo`, p.texto, RGB_FONDO);
      t.ok(`${nombre}: presionado, K2 conserva 2 px y borde tinta`, p.borde, '2px ' + RGB_TINTA);
    }
  };
}

// Valores por defecto de button/input de un WebView (WKWebView de Instagram en iOS), que
// Chrome headless no tiene: sin sembrarlos, quitar el reinicio del aviso no rompe nada.
// El root queda fuera (ningún WebView redondea un `div`) y sigue medido en `todos`; el
// `:where` mantiene la especificidad de la hoja en (0,0,1), como la de un valor por defecto.
const HOJA_WEBVIEW = 'button,input,div:where(:not(#pkapp-salir)){border-radius:8px;box-shadow:0 0 4px #000}';
const SEMBRAR_HOJA_WEBVIEW =
  "document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); " +
  `s.textContent = ${JSON.stringify(HOJA_WEBVIEW)}; document.head.appendChild(s); });`;

// REV-6, filas 2, 8 y 12: marcas de esquina, sin radios ni sombras, sin «✕» de texto.
async function avisoLamina(pagina, base, t) {
  await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO + SEMBRAR_HOJA_WEBVIEW);
  await cargar(pagina, base + '/');
  t.ok('lámina: el aviso aparece', await esperarAviso(pagina), true);
  const info = await pagina.evaluar(`(function () {
    const r = document.getElementById('pkapp-salir');
    const sonda = document.body.appendChild(document.createElement('button'));
    const semilla = getComputedStyle(sonda).borderRadius === '8px' && getComputedStyle(sonda).boxShadow !== 'none';
    sonda.remove();
    const todos = Array.from(r.querySelectorAll('*')).concat([r]);
    const estilo = (n) => getComputedStyle(n);
    return {
      semilla,
      marcas: r.querySelectorAll('i[aria-hidden="true"]').length,
      radios: todos.filter((n) => estilo(n).borderRadius !== '0px').length,
      sombras: todos.filter((n) => estilo(n).boxShadow !== 'none').length,
      texto: r.innerText,
      svgCerrar: !!r.querySelector('button[aria-label="Cerrar"] svg'),
      svgExterno: !!r.querySelector('svg'),
    };
  })()`);
  t.ok('lámina: la hoja de WebView sembrada está activa fuera del aviso',
    info.semilla, true);
  t.ok('lámina: cuatro marcas de esquina', info.marcas, 4);
  t.ok('lámina: ningún descendiente con radio', info.radios, 0);
  t.ok('lámina: ningún descendiente con sombra', info.sombras, 0);
  t.ok('lámina: el innerText no lleva «✕»', info.texto.includes('✕'), false);
  t.ok('lámina: cerrar es un SVG', info.svgCerrar, true);
  t.ok('lámina: lleva el copy de la ficha',
    ['Abrí pKapp en tu navegador', 'Así guardás tu progreso y podés instalarla.',
      'Si no se abre, tocá ⋯ y elegí abrirla en tu navegador.']
      .every((x) => info.texto.includes(x)), true);
}

// REV-6, fila 9: el fondo sale del tema guardado de la app, no de prefers-color-scheme.
function suiteTema(nombre, ajustes, emulado, esperado) {
  return async (pagina, base, t) => {
    const siembra = ajustes
      ? `localStorage.setItem('pkapp_settings', ${JSON.stringify(JSON.stringify(ajustes))});`
      : "localStorage.removeItem('pkapp_settings');";
    await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO + siembra);
    await pagina.enviar('Emulation.setEmulatedMedia',
      { features: [{ name: 'prefers-color-scheme', value: emulado }] });
    try {
      await cargar(pagina, base + '/');
      t.ok(`${nombre}: el aviso aparece`, await esperarAviso(pagina), true);
      t.ok(`${nombre}: fondo de la lámina`, await pagina.evaluar(
        "getComputedStyle(document.getElementById('pkapp-salir')).backgroundColor"), esperado);
    } finally {
      await pagina.enviar('Emulation.setEmulatedMedia', { features: [] });
    }
  };
}

// REV-6, fila 3: alturas por viewport. Se miden y se registran; solo se afirma cuántas
// filas de botones hay (una desde 390 px, apilados desde 375 px para abajo).
const VIEWPORTS = [[320, 568], [360, 740], [375, 667], [390, 844], [430, 932]];
const FN_FILAS = `(function () {
  const r = document.getElementById('pkapp-salir');
  if (!r) return null;
  const k1 = r.querySelector('button.p');
  const k2 = Array.from(r.querySelectorAll('button'))
    .find((b) => !b.classList.contains('p') && !b.classList.contains('x'));
  return {
    alto: Math.round(r.getBoundingClientRect().height),
    unaFila: Math.round(k1.getBoundingClientRect().top) === Math.round(k2.getBoundingClientRect().top),
  };
})()`;

async function medirViewports(pagina) {
  const medidas = [];
  for (const [w, h] of VIEWPORTS) {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await esperarMs(150);
    medidas.push({ w, h, ...(await pagina.evaluar(FN_FILAS)) });
  }
  return medidas;
}

const dirEvidencia = process.env.PKAPP_EVIDENCIA_DIR || '';

async function alturasPorViewport(pagina, base, t) {
  await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO + "navigator.clipboard.writeText = () => Promise.resolve();");
  try {
    await cargar(pagina, base + '/');
    t.ok('alturas: el aviso aparece', await esperarAviso(pagina), true);
    const reposo = await medirViewports(pagina);
    await clicBotonAviso(pagina, 'Copiar link');
    await esperarMs(300);
    const copiado = await medirViewports(pagina);

    await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO +
      "navigator.clipboard.writeText = () => Promise.reject(new Error('x')); document.execCommand = () => false;");
    await cargar(pagina, base + '/');
    t.ok('alturas: el aviso aparece (error)', await esperarAviso(pagina), true);
    await clicBotonAviso(pagina, 'Copiar link');
    await esperarMs(400);
    const error = await medirViewports(pagina);

    for (const [w, , ] of VIEWPORTS) {
      const fila = reposo.find((m) => m.w === w);
      t.ok(`alturas: ${w} px ${w >= 390 ? 'una fila de botones' : 'botones apilados'}`, fila.unaFila, w >= 390);
    }
    if (dirEvidencia) {
      const linea = (w, h, i) => `| ${w} × ${h} | ${reposo[i].unaFila ? 'una fila' : 'apilados'} | ${reposo[i].alto} | ${copiado[i].alto} | ${error[i].alto} |`;
      fs.mkdirSync(dirEvidencia, { recursive: true });
      fs.writeFileSync(path.join(dirEvidencia, 'alturas.md'), [
        '# Alto de `#pkapp-salir` por viewport (5.0b.6, REV-6, fila 3 de la aceptación)',
        '',
        'Medido con `Emulation.setDeviceMetricsOverride` (`mobile: false`, escala 1), margen `paso 5`, tema claro, UA de Instagram en iOS. Alto en px.',
        '',
        '| Viewport | Botones | Reposo | Copiado | Error (con link de respaldo) |',
        '|---|---|---|---|---|',
        ...VIEWPORTS.map(([w, h], i) => linea(w, h, i)),
        '',
      ].join('\n'));
    }
  } finally {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: 900, height: 1400, deviceScaleFactor: 1, mobile: false });
  }
}

// Capturas para la auditoría 5.0b.14: solo con PKAPP_EVIDENCIA_DIR.
async function capturasDelAviso(pagina, base, t) {
  const ANCHOS = [320, 375, 390];
  const foto = async (tema, estado, w) => {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: w, height: 740, deviceScaleFactor: 1, mobile: false });
    await esperarMs(150);
    const { data } = await pagina.enviar('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(dirEvidencia, { recursive: true });
    fs.writeFileSync(path.join(dirEvidencia, `aviso-${tema}-${estado}-${w}.png`), Buffer.from(data, 'base64'));
  };
  const OK = 'navigator.clipboard.writeText = () => Promise.resolve();';
  const FALLA = "navigator.clipboard.writeText = () => Promise.reject(new Error('x')); document.execCommand = () => false;";
  try {
    for (const tema of ['claro', 'oscuro']) {
      const siembra = `localStorage.setItem('pkapp_settings', ${JSON.stringify(JSON.stringify({ tema }))});`;
      for (const [estado, arranque] of [['copiado', OK], ['error', FALLA]]) {
        await conUserAgent(pagina, UA_IG_IOS, MARCA_INTENTO + siembra + arranque);
        await cargar(pagina, base + '/');
        t.ok(`capturas ${tema} ${estado}: el aviso aparece`, await esperarAviso(pagina), true);
        if (estado === 'copiado') for (const w of ANCHOS) await foto(tema, 'reposo', w);
        await clicBotonAviso(pagina, 'Copiar link');
        await esperarMs(400);
        for (const w of ANCHOS) await foto(tema, estado, w);
      }
    }
  } finally {
    await pagina.enviar('Emulation.setDeviceMetricsOverride',
      { width: 900, height: 1400, deviceScaleFactor: 1, mobile: false });
  }
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

const SUITES = [
  { nombre: 'navegador interno de Instagram en Android sale solo', correr: suiteSalidaAndroid('instagram android', UA_IG_ANDROID) },
  { nombre: 'navegador interno de Facebook en Android sale solo', correr: suiteSalidaAndroid('facebook android', UA_FB_ANDROID) },
  { nombre: 'navegador interno de Instagram en iOS intenta salir', correr: salirDeInstagramIos },
  { nombre: 'navegador interno de Instagram en iOS: aviso de respaldo', correr: avisoDeInstagramIos },
  { nombre: 'navegador interno de Facebook en iOS: sin aviso', correr: suiteFacebookSinAviso('facebook ios', UA_FB_IOS, false) },
  { nombre: 'navegador interno de Facebook en Android: sin aviso', correr: suiteFacebookSinAviso('facebook android', UA_FB_ANDROID) },
  { nombre: 'aviso de salida: lámina con marcas, sin radios ni sombras', correr: avisoLamina },
  { nombre: 'aviso de salida: tema oscuro guardado', correr: suiteTema('tema oscuro', { tema: 'oscuro' }, 'light', 'rgb(18, 22, 27)') },
  { nombre: 'aviso de salida: tema claro guardado', correr: suiteTema('tema claro', { tema: 'claro' }, 'dark', 'rgb(255, 255, 255)') },
  { nombre: 'aviso de salida: sin tema guardado ni prefers-color-scheme', correr: suiteTema('sin tema', null, 'dark', 'rgb(255, 255, 255)') },
  { nombre: 'aviso de salida: alturas y filas de botones por viewport', correr: alturasPorViewport },
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

module.exports = dirEvidencia
  ? SUITES.concat([{ nombre: 'aviso de salida: capturas de evidencia', correr: capturasDelAviso }])
  : SUITES;

// Suite «navegador» del arnés end-to-end (ver ../README.md): la salida del navegador
// interno de Instagram/Facebook que inyecta scripts/inject-pwa.js (sección 2.6).

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
  { nombre: 'navegador interno de Instagram en Android sale solo', correr: suiteSalidaAndroid('instagram android', UA_IG_ANDROID) },
  { nombre: 'navegador interno de Facebook en Android sale solo', correr: suiteSalidaAndroid('facebook android', UA_FB_ANDROID) },
  { nombre: 'navegador interno de Instagram en iOS intenta salir', correr: salirDeInstagramIos },
  { nombre: 'navegador interno de Instagram en iOS: aviso de respaldo', correr: avisoDeInstagramIos },
  { nombre: 'navegador interno de Facebook en iOS: aviso sin botón de abrir', correr: facebookIosSoloCopiar },
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

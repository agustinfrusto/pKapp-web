// Suite «pwa» del arnés end-to-end (ver ../README.md): los bordes de la app (D8, tarea 4.1).
// Íconos, manifest, `theme-color` y `app.json` contra los tokens `plancha` de src/theme.

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { plancha } = require('../../../src/theme/colores');
const { abrirMarco, clicEnMarco, EN_MARCO, esperarSelector } = require('./comunes');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const MAESTRO_ICO = path.join(RAIZ, 'openspec', 'diseno', 'favicon', 'FAV-1X-P1.ico');
const leerJson = (...partes) => JSON.parse(fs.readFileSync(path.join(RAIZ, ...partes), 'utf8'));

// Ancho y alto de un PNG: los 8 bytes de firma, el chunk IHDR y luego dos enteros de 32 bits.
// Un buffer de menos de 24 bytes (truncado) no tiene IHDR: se informa en vez de lanzar.
const dimensionesPng = (buffer) =>
  buffer.length < 24 ? 'truncado' : `${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`;

// Colores distintos de un PNG RGB/RGBA de 8 bits sin entrelazado (los favicon): set de «#RRGGBB».
// Los píxeles con alfa 0 no cuentan; un alfa parcial se informa como «#RRGGBB/aa».
// Devuelve null si el buffer no es un PNG soportado, está truncado o trae un filtro inválido.
function coloresDePng(buffer) {
  try {
    return decodificarColores(buffer);
  } catch (e) {
    return null;
  }
}

function decodificarColores(buffer) {
  if (buffer.length < 29 || buffer.toString('latin1', 1, 4) !== 'PNG') return null;
  const ancho = buffer.readUInt32BE(16);
  const alto = buffer.readUInt32BE(20);
  const canales = { 2: 3, 6: 4 }[buffer[25]];
  if (buffer[24] !== 8 || !canales || buffer[28] !== 0) return null;
  const datos = [];
  for (let i = 8; i < buffer.length;) {
    const largo = buffer.readUInt32BE(i);
    if (buffer.toString('latin1', i + 4, i + 8) === 'IDAT') datos.push(buffer.subarray(i + 8, i + 8 + largo));
    i += 12 + largo;
  }
  const crudo = zlib.inflateSync(Buffer.concat(datos));
  if (crudo.length < (ancho * canales + 1) * alto) return null;
  const fila = ancho * canales;
  const px = Buffer.alloc(fila * alto);
  for (let y = 0; y < alto; y++) {
    const filtro = crudo[y * (fila + 1)];
    if (!(filtro >= 0 && filtro <= 4)) return null;
    for (let x = 0; x < fila; x++) {
      const v = crudo[y * (fila + 1) + 1 + x];
      const a = x >= canales ? px[y * fila + x - canales] : 0;
      const b = y ? px[(y - 1) * fila + x] : 0;
      const c = y && x >= canales ? px[(y - 1) * fila + x - canales] : 0;
      const paeth = () => {
        const p = a + b - c;
        const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
        return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      };
      const base = [0, a, b, (a + b) >> 1, paeth()][filtro];
      px[y * fila + x] = (v + base) & 255;
    }
  }
  const colores = new Set();
  for (let i = 0; i < px.length; i += canales) {
    const alfa = canales === 4 ? px[i + 3] : 255;
    if (alfa === 0) continue;
    const hex = '#' + [px[i], px[i + 1], px[i + 2]].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
    colores.add(alfa === 255 ? hex : `${hex}/${alfa.toString(16)}`);
  }
  return colores;
}

// Directorio de un .ico: 6 bytes de cabecera y 16 por entrada (ancho, alto con 0 = 256, ..., tamaño
// y desplazamiento de 32 bits). Devuelve [{ ancho, alto, datos }] o null si no es un ICO íntegro.
function fotogramasDeIco(buffer) {
  if (buffer.length < 6 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) return null;
  const cantidad = buffer.readUInt16LE(4);
  const fotogramas = [];
  for (let i = 0; i < cantidad; i++) {
    const e = 6 + i * 16;
    if (e + 16 > buffer.length) return null;
    const tam = buffer.readUInt32LE(e + 8);
    const desde = buffer.readUInt32LE(e + 12);
    if (desde + tam > buffer.length) return null;
    fotogramas.push({
      ancho: buffer[e] || 256, alto: buffer[e + 1] || 256, datos: buffer.subarray(desde, desde + tam),
    });
  }
  return fotogramas;
}

// Paleta del favicon FAV-P2 (4.2c): fondo, tinta y acento, sin medios tonos.
const PALETA_FAVICON = ['#0B0D10', '#E6E9ED', '#5CC3D6'];

// Vacío si los colores son exactamente los de la paleta (los tres presentes, ninguno ajeno).
function problemaFavicon16(colores) {
  if (!colores) return 'formato no soportado';
  const ajenos = [...colores].filter((c) => !PALETA_FAVICON.includes(c));
  if (ajenos.length) return `colores fuera de la paleta: ${ajenos.join(',')}`;
  const faltan = PALETA_FAVICON.filter((c) => !colores.has(c));
  return faltan.length ? `faltan colores de la paleta: ${faltan.join(',')}` : '';
}

// Metas theme-color de un HTML (el servido, sin ejecutar la app): contenido de cada una.
const metasDelHtml = (html) =>
  [...html.matchAll(/<meta\s+name="theme-color"[^>]*>/g)]
    .map((m) => (m[0].match(/content="([^"]*)"/) || [])[1]);

const META = `(document.querySelector('meta[name="theme-color"]') || {}).content`;
const META_EN_MARCO = EN_MARCO(`
  const meta = d.querySelector('meta[name="theme-color"]');
  return meta ? meta.getAttribute('content') : null;
`);

async function iconoDeIos(pagina, base, t) {
  await pagina.ir(base + '/');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  const href = await pagina.evaluar(
    `(document.querySelector('link[rel="apple-touch-icon"]') || {}).getAttribute('href')`);
  t.ok('apple-touch-icon apunta a /apple-touch-icon.png', href, '/apple-touch-icon.png');

  const resp = await fetch(base + '/apple-touch-icon.png');
  t.ok('/apple-touch-icon.png responde 200', resp.status, 200);
  const cuerpo = Buffer.from(await resp.arrayBuffer());
  t.ok('apple-touch-icon.png es un PNG de 180 × 180',
    cuerpo.length > 24 ? dimensionesPng(cuerpo) : 'vacío', '180x180');
}

async function manifestDeLaApp(pagina, base, t) {
  const manifest = await fetch(base + '/manifest.json').then((r) => r.json());
  const iconos = manifest.icons || [];
  const propositos = iconos.map((i) => i.purpose).sort().join('|');
  t.ok('el manifest separa los propósitos: una entrada any y otra maskable', propositos, 'any|any|maskable');
  t.ok('ninguna entrada mezcla «any maskable»', iconos.some((i) => /\s/.test(i.purpose || '')), false);
  t.ok('el ícono maskable es icon-maskable-512.png',
    (iconos.find((i) => i.purpose === 'maskable') || {}).src, '/icon-maskable-512.png');
  t.ok('theme_color sale de plancha.manifestTema', manifest.theme_color, plancha.claro.manifestTema);
  t.ok('background_color sale de plancha.manifestFondo', manifest.background_color, plancha.claro.manifestFondo);

  for (const icono of iconos) {
    const resp = await fetch(base + icono.src);
    const lado = icono.sizes.split('x')[0];
    const cuerpo = Buffer.from(await resp.arrayBuffer());
    t.ok(`${icono.src} responde 200 y mide ${icono.sizes}`,
      resp.status === 200 && cuerpo.length > 24 ? dimensionesPng(cuerpo) : `HTTP ${resp.status}`,
      `${lado}x${lado}`);
  }
}

async function faviconDelHead(pagina, base, t) {
  await pagina.ir(base + '/');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  const enlaces = await pagina.evaluar(
    `JSON.stringify(Array.from(document.querySelectorAll('link[rel~="icon"]'))
      .map((n) => [n.getAttribute('href'), n.getAttribute('sizes'), n.getAttribute('rel')]))`);
  const lista = JSON.parse(enlaces);
  // Marca FAV-1X-P1 (4.2f): el .ico de 16/32/48 px, declarado primero, antes de los PNG.
  const iconos = lista.filter(([, , rel]) => /\bicon\b/.test(rel || ''));
  const declaraIco = iconos.filter(([h]) => h === '/favicon.ico');
  t.ok('el <head> declara exactamente un link a /favicon.ico', declaraIco.length, 1);
  t.ok('el link a /favicon.ico declara sizes="16x16 32x32 48x48"', (declaraIco[0] || [])[1], '16x16 32x32 48x48');
  t.ok('el link a /favicon.ico es el primero entre los rel="icon"', (iconos[0] || [])[0], '/favicon.ico');
  t.ok('el HTML servido declara /favicon.ico una sola vez',
    (await fetch(base + '/').then((r) => r.text())).match(/href="\/favicon\.ico"/g)?.length || 0, 1);
  const respIco = await fetch(base + '/favicon.ico');
  const ico = Buffer.from(await respIco.arrayBuffer());
  t.ok('/favicon.ico responde 200', respIco.status, 200);
  const fotogramas = fotogramasDeIco(ico);
  t.ok('/favicon.ico trae tres fotogramas de 16, 32 y 48 px',
    fotogramas ? fotogramas.map((f) => `${f.ancho}x${f.alto}`).join(',') : 'no es un ICO', '16x16,32x32,48x48');
  t.ok('los fotogramas del .ico son PNG RGBA de su tamaño',
    fotogramas ? fotogramas.map((f) => dimensionesPng(f.datos) === `${f.ancho}x${f.alto}` && f.datos[25] === 6).join(',') : 'no es un ICO',
    'true,true,true');
  const f16 = fotogramas && fotogramas.find((f) => f.ancho === 16);
  t.ok('el fotograma de 16 px usa los tres colores de la paleta FAV-P2 y ninguno más (sin medios tonos)',
    f16 ? problemaFavicon16(coloresDePng(f16.datos)) : 'sin fotograma de 16 px', '');
  t.ok('el .ico servido es el de public/ y no el de Expo',
    fs.existsSync(path.join(RAIZ, 'public', 'favicon.ico'))
      && ico.equals(fs.readFileSync(path.join(RAIZ, 'public', 'favicon.ico'))), true);
  t.ok('el .ico servido es el maestro FAV-1X-P1.ico byte a byte',
    fs.existsSync(MAESTRO_ICO) && ico.equals(fs.readFileSync(MAESTRO_ICO)), true);
  t.ok('el <head> declara el favicon de 16 px', lista.some(([h, s]) => h === '/favicon-16.png' && s === '16x16'), true);
  t.ok('el <head> declara el favicon de 32 px', lista.some(([h, s]) => h === '/favicon-32.png' && s === '32x32'), true);
  for (const archivo of ['favicon-16.png', 'favicon-32.png', 'favicon.png']) {
    const resp = await fetch(`${base}/${archivo}`);
    const cuerpo = Buffer.from(await resp.arrayBuffer());
    t.ok(`/${archivo} responde 200 como PNG`,
      resp.status === 200 && cuerpo.length > 24 ? dimensionesPng(cuerpo) : `HTTP ${resp.status}`,
      { 'favicon-16.png': '16x16', 'favicon-32.png': '32x32', 'favicon.png': '48x48' }[archivo]);
  }
  // Marca FAV-P2 (4.2c): el de 16 px es píxel exacto, con los tres colores de la paleta y ninguno más.
  const coloresServidos = async (archivo) =>
    coloresDePng(Buffer.from(await fetch(`${base}/${archivo}`).then((r) => r.arrayBuffer())));
  t.ok('/favicon-16.png usa los tres colores de la paleta FAV-P2 y ninguno más (sin medios tonos)',
    problemaFavicon16(await coloresServidos('favicon-16.png')), '');
  for (const archivo of ['favicon-32.png', 'favicon.png']) {
    const colores = await coloresServidos(archivo);
    t.ok(`/${archivo} tiene píxeles del acento #5CC3D6`, colores ? colores.has('#5CC3D6') : false, true);
  }
}

// inject-pwa.js corrido por segunda vez sobre un dist/ ya procesado: exit 0 y un solo link al .ico.
// Trabaja sobre una copia del index.html en el directorio temporal; no toca el dist servido.
async function inyeccionIdempotente(pagina, base, t) {
  const os = require('os');
  const { spawnSync } = require('child_process');
  const origen = path.resolve(RAIZ, process.env.PKAPP_DIST || 'dist', 'index.html');
  const copia = fs.mkdtempSync(path.join(os.tmpdir(), 'pkapp-inject-'));
  try {
    fs.copyFileSync(origen, path.join(copia, 'index.html'));
    const correr = () => spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'inject-pwa.js')],
      { env: { ...process.env, PKAPP_DIST: copia, CF_PAGES_BRANCH: '' }, encoding: 'utf8' });
    const primera = correr();
    const segunda = correr();
    t.ok('inject-pwa.js termina en exit 0 sobre un index.html ya procesado', primera.status, 0);
    t.ok('inject-pwa.js termina en exit 0 en una segunda corrida', segunda.status, 0);
    const html = fs.readFileSync(path.join(copia, 'index.html'), 'utf8');
    t.ok('tras dos corridas queda exactamente un link a /favicon.ico',
      html.match(/<link[^>]*href="\/favicon\.ico"[^>]*>/g)?.length || 0, 1);
    t.ok('el link que queda es el nuestro, con sizes="16x16 32x32 48x48"',
      /<link[^>]*href="\/favicon\.ico"[^>]*sizes="16x16 32x32 48x48"/.test(html), true);
    t.ok('tras dos corridas queda exactamente un <style> con color-scheme',
      [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].filter((m) => /color-scheme/.test(m[1])).length, 1);
  } finally {
    fs.rmSync(copia, { recursive: true, force: true });
  }
}

async function themeColorSigueAlTema(pagina, base, t) {
  await pagina.ir(base + '/');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  // El valor inicial se lee del HTML servido: el DOM vivo ya lo reescribió App.js.
  const html = await fetch(base + '/').then((r) => r.text());
  const iniciales = metasDelHtml(html);
  t.ok('el HTML servido trae exactamente un meta theme-color', iniciales.length, 1);
  t.ok('el theme-color inicial es plancha.claro.fondo (tokens.md a.2)', iniciales[0], plancha.claro.fondo);

  t.ok('el DOM montado tiene exactamente un meta theme-color',
    await pagina.evaluar(`document.querySelectorAll('meta[name="theme-color"]').length`), 1);

  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390), true);
  t.ok('en claro, el theme-color es plancha.claro.fondo',
    await pagina.esperarA(async () => await pagina.evaluar(META_EN_MARCO) === plancha.claro.fondo), true);

  await clicEnMarco(pagina, 'oscuro');
  t.ok('al elegir Oscuro, el theme-color pasa a plancha.oscuro.fondo',
    await pagina.esperarA(async () => await pagina.evaluar(META_EN_MARCO) === plancha.oscuro.fondo), true);

  await clicEnMarco(pagina, 'claro');
  t.ok('al volver a Claro, el theme-color vuelve a plancha.claro.fondo',
    await pagina.esperarA(async () => await pagina.evaluar(META_EN_MARCO) === plancha.claro.fondo), true);
}

// Sin navegador: manifest.json y app.json no leen src/theme, así que se copian. Si un
// valor se desfasa del token, esta prueba falla.
async function jsonContraTokens(pagina, base, t) {
  const { claro, oscuro } = plancha;
  t.ok('manifestTema, manifestFondo e iconoFondo no dependen del tema',
    ['manifestTema', 'manifestFondo', 'iconoFondo'].every((k) => claro[k] === oscuro[k]), true);

  const manifest = leerJson('public', 'manifest.json');
  t.ok('public/manifest.json: theme_color = manifestTema', manifest.theme_color, claro.manifestTema);
  t.ok('public/manifest.json: background_color = manifestFondo', manifest.background_color, claro.manifestFondo);

  const { expo } = leerJson('app.json');
  t.ok('app.json: web.themeColor = manifestTema', expo.web.themeColor, claro.manifestTema);
  t.ok('app.json: web.backgroundColor = manifestFondo', expo.web.backgroundColor, claro.manifestFondo);
  const pluginSplash = (expo.plugins || []).find((p) => Array.isArray(p) && p[0] === 'expo-splash-screen');
  const fondoSplash = pluginSplash && pluginSplash[1] ? pluginSplash[1].backgroundColor : undefined;
  t.ok('app.json: plugin expo-splash-screen backgroundColor = manifestFondo', fondoSplash, claro.manifestFondo);
  const favicon = path.join(RAIZ, expo.web.favicon);
  const cuerpoFavicon = fs.existsSync(favicon) ? fs.readFileSync(favicon) : Buffer.alloc(0);
  const esPng = cuerpoFavicon.length > 24 && cuerpoFavicon.subarray(1, 4).toString() === 'PNG';
  t.ok('app.json: web.favicon es un PNG de 48 × 48',
    esPng ? dimensionesPng(cuerpoFavicon) : 'ausente o no es PNG', '48x48');
}

// REV-2 (5.0b.2), aceptación (1): ningún elemento agregado bajo #root pinta `manifestFondo` al
// cargar con el tema claro. Versión determinista de la secuencia de cuadros: un MutationObserver
// instalado antes del documento mira cada elemento que entra (y sus descendientes) apenas se agrega.
const FONDO_DEL_SPLASH = 'rgb(11, 13, 16)';   // plancha.oscuro.manifestFondo
const OBSERVAR_CUADROS = `(function () {
  window.__cuadrosOscuros = [];
  const raiz = () => document.getElementById('root');
  const revisar = (el) => {
    if (el.nodeType !== 1) return;
    const r = raiz();
    if (!r || !r.contains(el)) return;
    for (const n of [el, ...el.querySelectorAll('*')]) {
      if (getComputedStyle(n).backgroundColor === ${JSON.stringify(FONDO_DEL_SPLASH)}) {
        window.__cuadrosOscuros.push(n.tagName + ':' + (n.className || '').toString().slice(0, 40));
      }
    }
  };
  new MutationObserver((lista) => {
    for (const m of lista) m.addedNodes.forEach(revisar);
  }).observe(document, { childList: true, subtree: true });
})()`;

async function sinCuadroOscuroAlCargar(pagina, base, t) {
  t.ok('el fondo del splash retirado es el de plancha.oscuro.manifestFondo',
    FONDO_DEL_SPLASH, aRgb(plancha.oscuro.manifestFondo));
  // Perfil en claro: se parte de una página del mismo origen sin la app.
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await pagina.evaluar(`(function () {
    const ajustes = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
    delete ajustes.tema;
    localStorage.setItem('pkapp_settings', JSON.stringify(ajustes));
  })()`);
  const { identifier } = await pagina.enviar('Page.addScriptToEvaluateOnNewDocument', { source: OBSERVAR_CUADROS });
  try {
    await pagina.ir(base + '/');
    t.ok('llegó al selector de materia', await esperarSelector(pagina), true);
    t.ok('ningún elemento bajo #root pintó manifestFondo al cargar con el tema claro',
      await pagina.evaluar('JSON.stringify(window.__cuadrosOscuros)'), '[]');
  } finally {
    await pagina.enviar('Page.removeScriptToEvaluateOnNewDocument', { identifier });
  }
}

// REV-2 (5.0b.2), hallazgo 1: «el primer cuadro que React pinta es la app, en el tema guardado»
// (tokens.md a.2, Vacios.md V19) también en oscuro. Registra cada elemento agregado bajo #root
// cuando `html` todavía no lleva la clase `dark`; con el tema oscuro guardado debe quedar vacío.
const OBSERVAR_CLARO_EN_OSCURO = `(function () {
  window.__cuadrosClaros = [];
  const revisar = (el) => {
    if (el.nodeType !== 1) return;
    const r = document.getElementById('root');
    if (!r || el === r || !r.contains(el)) return;
    if (document.documentElement.classList.contains('dark')) return;
    for (const n of [el, ...el.querySelectorAll('*')]) {
      window.__cuadrosClaros.push(n.tagName + ':' + (n.className || '').toString().slice(0, 40));
    }
  };
  new MutationObserver((lista) => {
    for (const m of lista) m.addedNodes.forEach(revisar);
  }).observe(document, { childList: true, subtree: true });
})()`;

async function primerCuadroEnElTemaGuardado(pagina, base, t) {
  const sembrar = (valor) => pagina.evaluar(`(function () {
    const ajustes = JSON.parse(localStorage.getItem('pkapp_settings') || '{}');
    ${valor === null ? 'delete ajustes.tema;' : `ajustes.tema = ${JSON.stringify(valor)};`}
    localStorage.setItem('pkapp_settings', JSON.stringify(ajustes));
  })()`);
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  await sembrar('oscuro');
  const { identifier } = await pagina.enviar('Page.addScriptToEvaluateOnNewDocument', { source: OBSERVAR_CLARO_EN_OSCURO });
  try {
    await pagina.ir(base + '/');
    t.ok('llegó al selector de materia', await esperarSelector(pagina), true);
    t.ok('con el tema oscuro guardado, ningún elemento bajo #root se agregó sin la clase dark en html',
      await pagina.evaluar('JSON.stringify(window.__cuadrosClaros.slice(0, 3))'), '[]');
  } finally {
    await pagina.enviar('Page.removeScriptToEvaluateOnNewDocument', { identifier });
    await sembrar(null);
  }
}

// A2-01 (5.2): `pkapp_settings` con un valor que no es un objeto plano (número, booleano, cadena,
// JSON roto) no puede tumbar el arranque: el tema es claro y la app monta (Vacios.md V19;
// Banners.md «clave inválida → claro»).
async function arranqueConAjustesInvalidos(pagina, base, t) {
  const valores = ['5', 'true', '"sistema"', '{roto'];
  await pagina.ir(base + '/favicon.png');
  await pagina.esperarA(() => pagina.evaluar('!!document.body'), { limite: 5000 });
  try {
    for (const crudo of valores) {
      await pagina.evaluar(`localStorage.setItem('pkapp_settings', ${JSON.stringify(crudo)})`);
      pagina.errores.length = 0;
      await pagina.ir(base + '/');
      t.ok(`pkapp_settings = ${crudo}: la app monta`, await esperarSelector(pagina), true);
      t.ok(`pkapp_settings = ${crudo}: html sin la clase dark`,
        await pagina.evaluar("document.documentElement.classList.contains('dark')"), false);
      t.ok(`pkapp_settings = ${crudo}: sin excepciones de JS`, pagina.errores.length, 0);
      if (pagina.errores.length) t.nota('  ' + pagina.errores[0]);
    }
  } finally {
    await pagina.evaluar("localStorage.removeItem('pkapp_settings')");
  }
}

// inject-preload.js sobre un dist/ mínimo en el directorio temporal; no toca el dist servido.
async function preloadDeMaterias(pagina, base, t) {
  const os = require('os');
  const { spawnSync } = require('child_process');
  const correr = (dist) => spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'inject-preload.js')],
    { env: { ...process.env, PKAPP_DIST: dist }, encoding: 'utf8' });
  const crear = (head, materias) => {
    const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'pkapp-preload-'));
    fs.writeFileSync(path.join(dist, 'index.html'), `<html><head>${head}</head><body></body></html>`);
    if (materias.length) {
      const dir = path.join(dist, 'assets', 'src', 'assets', 'materias');
      fs.mkdirSync(dir, { recursive: true });
      for (const f of materias) fs.writeFileSync(path.join(dir, f), '');
    }
    return dist;
  };
  const cuenta = (html) => html.match(/<link rel="preload" as="image" href="\/assets\/src\/assets\/materias\/[^"]+">/g)?.length || 0;
  const dirs = [crear('', []), crear('<link rel="preload" as="image" href="/ajeno.png">', ['a.png', 'b.png'])];
  try {
    const sinImagenes = correr(dirs[0]);
    t.ok('sin imágenes de materia, inject-preload.js termina con exit distinto de 0', sinImagenes.status !== 0, true);

    const conAjeno = correr(dirs[1]);
    t.ok('con un preload as="image" ajeno ya presente, inject-preload.js termina en exit 0', conAjeno.status, 0);
    const html = fs.readFileSync(path.join(dirs[1], 'index.html'), 'utf8');
    t.ok('con un preload as="image" ajeno, igual inyecta el de cada imagen de materia', cuenta(html), 2);
    const segunda = correr(dirs[1]);
    t.ok('una segunda corrida termina en exit 0', segunda.status, 0);
    t.ok('tras dos corridas quedan exactamente los preloads de materia, sin duplicar',
      cuenta(fs.readFileSync(path.join(dirs[1], 'index.html'), 'utf8')), 2);
  } finally {
    for (const d of dirs) fs.rmSync(d, { recursive: true, force: true });
  }
}

const FONDO_Y_ESQUEMA = EN_MARCO(`
  const e = w.getComputedStyle(d.documentElement);
  return JSON.stringify([e.colorScheme, e.backgroundColor]);
`);

const aRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

async function fondoYColorSchemeDelDocumento(pagina, base, t) {
  t.ok('abrió la app en el marco', await abrirMarco(pagina, base, 390), true);
  t.ok('en claro: color-scheme light y fondo claro.fondo',
    JSON.parse(await pagina.evaluar(FONDO_Y_ESQUEMA)).join('|'), `light|${aRgb(plancha.claro.fondo)}`);

  await clicEnMarco(pagina, 'oscuro');
  t.ok('en oscuro: color-scheme dark y fondo oscuro.fondo',
    await pagina.esperarA(async () =>
      JSON.parse(await pagina.evaluar(FONDO_Y_ESQUEMA)).join('|') === `dark|${aRgb(plancha.oscuro.fondo)}`), true);

  await clicEnMarco(pagina, 'claro');
  t.ok('al volver a Claro, color-scheme light y fondo claro.fondo',
    await pagina.esperarA(async () =>
      JSON.parse(await pagina.evaluar(FONDO_Y_ESQUEMA)).join('|') === `light|${aRgb(plancha.claro.fondo)}`), true);
}

async function styleDelHeadServido(pagina, base, t) {
  const html = await fetch(base + '/').then((r) => r.text());
  const estilos = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1]).filter((css) => /color-scheme/.test(css));
  t.ok('el HTML servido trae un único <style> con color-scheme', estilos.length, 1);
  const css = estilos[0] || '';
  t.ok('html: background-color = claro.fondo y color-scheme light',
    css.includes(`html{background-color:${plancha.claro.fondo};color-scheme:light}`), true);
  t.ok('html.dark: background-color = oscuro.fondo y color-scheme dark',
    css.includes(`html.dark{background-color:${plancha.oscuro.fondo};color-scheme:dark}`), true);
}

// Aceptación (4): sin `Animated` en src ni en App.js (el splash se retiró entero).
async function sinAnimatedEnLaApp(pagina, base, t) {
  const hallazgos = [];
  const recorrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const ruta = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(ruta);
      else if (/\.(js|jsx|ts|tsx)$/.test(e.name) && /\bAnimated\b/.test(fs.readFileSync(ruta, 'utf8'))) {
        hallazgos.push(path.relative(RAIZ, ruta));
      }
    }
  };
  recorrer(path.join(RAIZ, 'src'));
  if (/\bAnimated\b/.test(fs.readFileSync(path.join(RAIZ, 'App.js'), 'utf8'))) hallazgos.push('App.js');
  t.ok('ni src ni App.js mencionan Animated', hallazgos.join(','), '');
}

module.exports = [
  { nombre: 'PWA: apple-touch-icon de 180 px', correr: iconoDeIos },
  { nombre: 'PWA: manifest con propósitos any y maskable y colores de los tokens', correr: manifestDeLaApp },
  { nombre: 'PWA: favicon del head', correr: faviconDelHead },
  { nombre: 'PWA: inject-pwa.js es idempotente', correr: inyeccionIdempotente },
  { nombre: 'PWA: theme-color sigue al tema activo', correr: themeColorSigueAlTema },
  { nombre: 'PWA: manifest.json y app.json coinciden con los tokens', correr: jsonContraTokens },
  { nombre: 'PWA: sin cuadro oscuro al cargar con el tema claro', correr: sinCuadroOscuroAlCargar },
  { nombre: 'PWA: el primer cuadro de React ya está en el tema oscuro guardado', correr: primerCuadroEnElTemaGuardado },
  { nombre: 'PWA: arranca en claro con pkapp_settings inválido', correr: arranqueConAjustesInvalidos },
  { nombre: 'PWA: inject-preload.js inyecta las imágenes de materia y falla sin ellas', correr: preloadDeMaterias },
  { nombre: 'PWA: html lleva fondo y color-scheme del tema activo', correr: fondoYColorSchemeDelDocumento },
  { nombre: 'PWA: el index.html servido trae el <style> del fondo', correr: styleDelHeadServido },
  { nombre: 'PWA: la app no usa Animated (splash retirado)', correr: sinAnimatedEnLaApp },
];

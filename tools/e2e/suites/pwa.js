// Suite «pwa» del arnés end-to-end (ver ../README.md): los bordes de la app (D8, tarea 4.1).
// Íconos, manifest, `theme-color` y `app.json` contra los tokens `plancha` de src/theme.

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { plancha } = require('../../../src/theme/colores');
const { abrirMarco, clicEnMarco, EN_MARCO } = require('./comunes');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const leerJson = (...partes) => JSON.parse(fs.readFileSync(path.join(RAIZ, ...partes), 'utf8'));

// Ancho y alto de un PNG: los 8 bytes de firma, el chunk IHDR y luego dos enteros de 32 bits.
const dimensionesPng = (buffer) => `${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`;

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
      .map((n) => [n.getAttribute('href'), n.getAttribute('sizes')]))`);
  const lista = JSON.parse(enlaces);
  t.ok('el <head> no declara /favicon.ico (el link de Expo está quitado)',
    lista.some(([h]) => h === '/favicon.ico'), false);
  t.ok('el HTML servido no declara /favicon.ico',
    /href="\/favicon\.ico"/.test(await fetch(base + '/').then((r) => r.text())), false);
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
  t.ok('app.json: splash.backgroundColor = manifestFondo', expo.splash.backgroundColor, claro.manifestFondo);
  t.ok('app.json: android.adaptiveIcon.backgroundColor = iconoFondo',
    expo.android.adaptiveIcon.backgroundColor, claro.iconoFondo);
  const favicon = path.join(RAIZ, expo.web.favicon);
  const cuerpoFavicon = fs.existsSync(favicon) ? fs.readFileSync(favicon) : Buffer.alloc(0);
  const esPng = cuerpoFavicon.length > 24 && cuerpoFavicon.subarray(1, 4).toString() === 'PNG';
  t.ok('app.json: web.favicon es un PNG de 48 × 48',
    esPng ? dimensionesPng(cuerpoFavicon) : 'ausente o no es PNG', '48x48');
}

module.exports = [
  { nombre: 'PWA: apple-touch-icon de 180 px', correr: iconoDeIos },
  { nombre: 'PWA: manifest con propósitos any y maskable y colores de los tokens', correr: manifestDeLaApp },
  { nombre: 'PWA: favicon del head', correr: faviconDelHead },
  { nombre: 'PWA: theme-color sigue al tema activo', correr: themeColorSigueAlTema },
  { nombre: 'PWA: manifest.json y app.json coinciden con los tokens', correr: jsonContraTokens },
];

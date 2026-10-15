// Chequeo del plan B de D2 (tarea 2.10): `src/components/Ilustracion.js` dibuja con
// <svg> del DOM y `react-native-svg` ya no es una dependencia (tarea 5.0).
//
//   node tools/ui/svg-web.mjs        (sale con código ≠ 0 si algo falla; requiere dist/)
//
//   (a) el shell (el JS que carga dist/index.html) no contiene ninguno de los marcadores
//       propios de `react-native-svg` de MARCADORES;
//   (b) el shell gzip, con el método de evidencia/base.md (`gzip -c` por defecto, JS + CSS
//       sumados), no supera BASE + PRESUPUESTO (D5);
//   (c) `Ilustracion.js`, renderizado con react-dom/server, cumple el contrato de
//       datos de `Ilustracion` (design.md D2): medidas, encuadre, trazo, tono `acento`, `relleno`,
//       `limiteInglete`, `style` plano y `aria-hidden="true"`.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import Module from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = path.resolve(RAIZ, process.env.PKAPP_DIST || 'dist');
const requerir = createRequire(path.join(RAIZ, 'package.json'));

// Textos que el JS de `react-native-svg` lleva y que ningún otro módulo del bundle usa:
// los mensajes de error de su propio código. Minificar no los toca (son literales).
// Hoy los dos están en el shell; con el plan B ninguno.
const MARCADORES = ['[react-native-svg]', "[RNSVG] Couldn't parse SVG"];

const BASE_SHELL_GZIP = 221379;       // evidencia/base.md
const PRESUPUESTO = 35000;            // D5 (design.md, evidencia/base.md)
const LIMITE_SHELL = BASE_SHELL_GZIP + PRESUPUESTO;

let fallos = 0;
function ok(nombre, real, esperado) {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) fallos++;
  const detalle = bien ? '' : `  (dio ${JSON.stringify(real)}, esperaba ${JSON.stringify(esperado)})`;
  console.log(`  ${bien ? '✓' : '✗'} ${nombre}${detalle}`);
}

function gzipBytes(archivo) {
  const r = spawnSync('gzip', ['-c', archivo], { maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`gzip falló sobre ${archivo}`);
  return r.stdout.length;
}

// --- (a) y (b): el shell ----------------------------------------------------

function shell() {
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const js = [...html.matchAll(/<script[^>]*\ssrc="([^"]+\.js)"/g)].map((m) => m[1]);
  const css = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const aRuta = (u) => path.join(DIST, u.replace(/^\//, ''));
  return { js: [...new Set(js)].map(aRuta), css: [...new Set(css)].map(aRuta) };
}

function chequearShell() {
  console.log('\nshell del bundle web');
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error(`No hay build en ${path.relative(RAIZ, DIST)}/. Corré antes:  npm run build:web`);
    process.exit(1);
  }
  const { js, css } = shell();
  ok('index.html carga un bundle JS y un CSS', [js.length, css.length], [1, 1]);

  const codigo = js.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  for (const marcador of MARCADORES) {
    ok(`el shell no contiene «${marcador}»`, codigo.includes(marcador), false);
  }

  const bytesJs = js.reduce((s, f) => s + gzipBytes(f), 0);
  const bytesCss = css.reduce((s, f) => s + gzipBytes(f), 0);
  const total = bytesJs + bytesCss;
  console.log(`    shell gzip (gzip -c, JS + CSS): ${bytesJs} + ${bytesCss} = ${total} B`
    + ` (base ${BASE_SHELL_GZIP}, delta ${total - BASE_SHELL_GZIP >= 0 ? '+' : ''}${total - BASE_SHELL_GZIP})`);
  ok(`el shell gzip no supera ${LIMITE_SHELL} B (${BASE_SHELL_GZIP} + ${PRESUPUESTO})`,
    total <= LIMITE_SHELL, true);
}

// --- (c): el contrato de Ilustracion.js --------------------------------

// Carga un módulo ESM del árbol como CommonJS, sin tocarlo: sucrase lo transpila a un
// directorio temporal y `react`, `react-dom` y `react-native` (= react-native-web, como
// en el bundle web) se resuelven contra node_modules del proyecto.
function cargar(archivo, tmp) {
  const { transform } = requerir('sucrase');
  const salida = path.join(tmp, path.basename(archivo));
  fs.writeFileSync(salida, transform(fs.readFileSync(archivo, 'utf8'), { transforms: ['imports'] }).code);
  return createRequire(salida)(salida);
}

function renderizador() {
  const original = Module._resolveFilename;
  // Se resuelven antes de parchear: `require.resolve` pasa por _resolveFilename.
  const destino = {
    react: requerir.resolve('react'),
    'react-dom/server': requerir.resolve('react-dom/server'),
    'react-native': requerir.resolve('react-native-web'),
    'react-native-web': requerir.resolve('react-native-web'),
  };
  Module._resolveFilename = function (request, ...resto) {
    return original.call(this, destino[request] ?? request, ...resto);
  };
  return () => { Module._resolveFilename = original; };
}

const atributos = (etiqueta) =>
  Object.fromEntries([...etiqueta.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

function leerSvg(html) {
  const abre = html.match(/^<svg\b[^>]*>/);
  const hijos = [...html.slice(abre ? abre[0].length : 0).matchAll(/<(\w+)\b([^>]*)\/?>/g)]
    .filter((m) => m[1] !== 'svg')
    .map((m) => ({ etiqueta: m[1], attrs: atributos(m[2]) }));
  return { attrs: abre ? atributos(abre[0]) : null, hijos };
}

function chequearContrato() {
  console.log('\nIlustracion.js');
  const archivo = path.join(RAIZ, 'src', 'components', 'Ilustracion.js');
  if (!fs.existsSync(archivo)) {
    ok('existe src/components/Ilustracion.js', false, true);
    return;
  }
  const restaurar = renderizador();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'svg-web-'));
  try {
    const React = requerir('react');
    const { renderToStaticMarkup } = requerir('react-dom/server');
    const Ilustracion = cargar(archivo, tmp).default;
    const { ilustracion: bcyt } = cargar(path.join(RAIZ, 'src', 'materias', 'bcyt', 'ilustracion.js'), tmp);
    const dibujar = (props) => leerSvg(renderToStaticMarkup(React.createElement(Ilustracion, props)));

    // Una materia real: medidas por `size`, trazo de los datos, sin acento.
    const m = dibujar({ datos: bcyt, color: '#14181d', size: 96 });
    ok('materia: width y height salen de size y del viewBox', [m.attrs.width, m.attrs.height], ['96', '96']);
    ok('materia: viewBox de los datos', m.attrs.viewBox, bcyt.viewBox);
    ok('materia: preserveAspectRatio por defecto (meet)', m.attrs.preserveAspectRatio, 'xMidYMid meet');
    ok('materia: stroke = color', m.attrs.stroke, '#14181d');
    ok('materia: stroke-width de los datos', m.attrs['stroke-width'], String(bcyt.trazo.ancho));
    ok('materia: aria-hidden="true"', m.attrs['aria-hidden'], 'true');
    ok('materia: fill none', m.attrs.fill, 'none');
    ok('materia: la cantidad de hijos es la de los datos', m.hijos.length, bcyt.elementos.length);
    ok('materia: las etiquetas de los hijos son los tipos de los datos',
      m.hijos.map((h) => h.etiqueta), bcyt.elementos.map((e) => e.tipo));

    // Todas las opciones del contrato en un solo dibujo.
    const datos = {
      viewBox: '0 0 16 8',
      encuadre: 'slice',
      trazo: { ancho: 1, union: 'miter', extremo: 'square', limiteInglete: 2 },
      elementos: [
        { tipo: 'path', props: { d: 'M1 1 L5 5' } },
        { tipo: 'circle', props: { cx: 4, cy: 4, r: 2 }, tono: 'acento' },
        { tipo: 'rect', props: { x: 1, y: 1, width: 3, height: 3, relleno: true } },
        { tipo: 'line', props: { x1: 0, y1: 0, x2: 4, y2: 4 } },
        { tipo: 'ellipse', props: { cx: 5, cy: 5, rx: 2, ry: 1 }, tono: 'acento' },
        { tipo: 'polyline', props: { points: '0,0 4,4 8,0' } },
        { tipo: 'polygon', props: { points: '0,0 4,4 8,0', relleno: true }, tono: 'acento' },
      ],
    };
    const a = dibujar({
      datos, color: '#111111', colorAcento: '#c0392b', ancho: 40, alto: 30, anchoTrazo: 0.5,
      style: [{ marginTop: 4 }, { opacity: 0.5 }],
    });
    ok('ancho y alto explícitos mandan sobre size', [a.attrs.width, a.attrs.height], ['40', '30']);
    ok('encuadre slice', a.attrs.preserveAspectRatio, 'xMidYMid slice');
    ok('anchoTrazo reemplaza al de los datos', a.attrs['stroke-width'], '0.5');
    ok('limiteInglete llega como stroke-miterlimit', a.attrs['stroke-miterlimit'], '2');
    ok('union y extremo', [a.attrs['stroke-linejoin'], a.attrs['stroke-linecap']], ['miter', 'square']);
    ok('style (arreglo de React Native) se aplana a CSS',
      /margin-top:4px/.test(a.attrs.style) && /opacity:0\.5/.test(a.attrs.style), true);
    ok('los hijos conservan su etiqueta y su orden',
      a.hijos.map((h) => h.etiqueta), datos.elementos.map((e) => e.tipo));
    ok('tono acento: stroke = colorAcento', [a.hijos[1].attrs.stroke, a.hijos[4].attrs.stroke],
      ['#c0392b', '#c0392b']);
    ok('sin tono: el hijo hereda el stroke del svg', a.hijos[0].attrs.stroke, undefined);
    ok('relleno: fill = tinta del elemento, sin atributo «relleno»',
      [a.hijos[2].attrs.fill, a.hijos[6].attrs.fill, a.hijos[2].attrs.relleno],
      ['#111111', '#c0392b', undefined]);

    const sinAcento = dibujar({ datos, color: '#111111', size: 16 });
    ok('tono acento sin colorAcento cae al color',
      [sinAcento.hijos[1].attrs.stroke, sinAcento.hijos[6].attrs.fill], ['#111111', '#111111']);
    ok('sin style no hay atributo style', sinAcento.attrs.style, undefined);
    ok('size 16 sobre viewBox 16×8: alto proporcional', sinAcento.attrs.height, '8');
  } finally {
    restaurar();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

const esPrincipal = import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
if (esPrincipal) {
  chequearShell();
  chequearContrato();
  if (fallos) {
    console.log(`\n${fallos} comprobación(es) fallaron.`);
    process.exit(1);
  }
  console.log('\nTodo OK.');
}

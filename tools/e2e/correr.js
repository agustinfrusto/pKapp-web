// Punto de entrada del arnés end-to-end.
//
//   npm run build:web && npm run e2e
//   npm run e2e -- --suite quiz          # una sola superficie
//   npm run e2e -- "en frío"             # suites cuyo nombre contiene el texto
//
// Sirve dist/ (o $PKAPP_DIST) como lo haría el hosting, abre un Chrome headless y corre las
// suites contra el bundle real. Sale con código 1 si algo falla.

const fs = require('fs');
const path = require('path');
const { conectarNavegador, abrirPagina } = require('./cdp');
const { servirEstatico, lanzarChrome } = require('./entorno');
const { SUPERFICIES, porSuperficie, todas } = require('./suites');

const RAIZ = path.resolve(__dirname, '..', '..');
const DIST = path.resolve(RAIZ, process.env.PKAPP_DIST || 'dist');

// Un puerto fuera de 1–65535 (el 0 incluido: el SO elegiría uno al azar y la
// navegación iría a :0) corta con un mensaje antes de levantar nada.
function leerPuerto(variable, valor, porDefecto) {
  if (valor === undefined || valor === '') return porDefecto;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    console.error(`${variable} inválido: "${valor}". Usá un puerto entre 1 y 65535.`);
    process.exit(1);
  }
  return n;
}
const PUERTO_WEB = leerPuerto('PKAPP_PUERTO', process.env.PKAPP_PUERTO || process.env.E2E_PUERTO_WEB, 8099);
const PUERTO_CDP = leerPuerto('PKAPP_PUERTO_CDP', process.env.PKAPP_PUERTO_CDP || process.env.E2E_PUERTO_CDP, 9222);

function verificador() {
  const fallos = [];
  return {
    fallos,
    ok(nombre, real, esperado) {
      const bien = real === esperado;
      if (!bien) fallos.push({ nombre, real, esperado });
      const detalle = bien ? '' : `  (dio ${JSON.stringify(real)}, esperaba ${JSON.stringify(esperado)})`;
      console.log(`  ${bien ? '✓' : '✗'} ${nombre}${detalle}`);
    },
    nota(txt) { console.log(`    ${txt}`); },
  };
}

// `--suite <nombre>` (repetible) elige superficies; el resto son textos que se
// buscan en el nombre de cada suite, como siempre.
function leerArgumentos(args) {
  const superficies = [];
  const filtros = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--suite' || args[i].startsWith('--suite=')) {
      const valor = args[i] === '--suite' ? args[++i] : args[i].slice('--suite='.length);
      if (!valor) {
        console.error('--suite espera el nombre de una superficie: ' + SUPERFICIES.join(', '));
        process.exit(1);
      }
      superficies.push(valor);
    } else {
      filtros.push(args[i]);
    }
  }
  return { superficies, filtros };
}

// Si el que lanza la compuerta dejó un centinela en la carpeta del build
// (PKAPP_CENTINELA + centinela-pkapp.txt), lo pedimos por HTTP: demuestra que lo que
// se sirve es esa carpeta y no otra (p. ej. dist/ por ignorar PKAPP_DIST).
async function verificarCentinela(base) {
  const esperado = process.env.PKAPP_CENTINELA;
  if (!esperado) return;
  const recibido = await fetch(`${base}/centinela-pkapp.txt`).then((r) => r.text()).catch(() => null);
  if (recibido !== esperado) {
    throw new Error(`El servidor no sirvió ${path.relative(RAIZ, DIST)}/: el centinela no coincide.`);
  }
  console.log(`Carpeta servida verificada: ${path.relative(RAIZ, DIST)}/`);
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error(`No hay build en ${path.relative(RAIZ, DIST)}/. Corré antes:  npm run build:web`);
    process.exit(1);
  }

  const { superficies, filtros } = leerArgumentos(process.argv.slice(2));
  const desconocida = superficies.find((s) => !SUPERFICIES.includes(s));
  if (desconocida) {
    console.error(`No existe la superficie "${desconocida}". Hay: ${SUPERFICIES.join(', ')}`);
    process.exit(1);
  }

  let aCorrer = superficies.length
    ? superficies.flatMap((s) => porSuperficie[s])
    : todas;
  if (filtros.length) aCorrer = aCorrer.filter((s) => filtros.some((f) => s.nombre.includes(f)));

  if (!aCorrer.length && superficies.length && !filtros.length) {
    // Superficie que existe pero todavía no tiene suites: no es un error.
    superficies.forEach((s) => console.log(`la superficie ${s} no tiene suites`));
    return;
  }

  if (!aCorrer.length) {
    console.error('Ninguna suite coincide con: ' + process.argv.slice(2).join(' '));
    process.exit(1);
  }

  const servidor = await servirEstatico(DIST, PUERTO_WEB);
  const chrome = await lanzarChrome(PUERTO_CDP);
  const navegador = await conectarNavegador(PUERTO_CDP);
  const base = `http://localhost:${PUERTO_WEB}`;

  const t = verificador();
  let erroresConsola = [];

  try {
    await verificarCentinela(base);
    for (const suite of aCorrer) {
      console.log(`\n${suite.nombre}`);
      // Una página por suite: perfil y historial limpios entre suites.
      const pagina = await abrirPagina(navegador);
      try {
        await suite.correr(pagina, base, t);
        erroresConsola = erroresConsola.concat(pagina.errores);
      } finally {
        await pagina.cerrar();
      }
    }
  } finally {
    navegador.cerrar();
    await chrome.cerrar();
    await servidor.cerrar();
  }

  if (erroresConsola.length) {
    console.log('\nErrores de JS en consola:');
    erroresConsola.forEach((e) => console.log('  ' + e));
  }

  console.log('');
  if (t.fallos.length) {
    console.log(`${t.fallos.length} comprobación(es) fallaron.`);
    process.exit(1);
  }
  console.log('Todo OK.');
}

// Nada queda sin dueño: un rechazo o una excepción fuera de `main` cortan con
// exit 2 y la pila (qué y dónde), no con un «Uncaught» pelado.
function caer(err) {
  console.error('El arnés se cayó:', err && err.message ? err.message : err);
  if (err && err.stack) console.error(err.stack.split('\n').slice(1, 6).join('\n'));
  process.exit(2);
}
process.on('unhandledRejection', caer);
process.on('uncaughtException', caer);

main().catch(caer);

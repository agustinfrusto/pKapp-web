// Punto de entrada del arnés end-to-end.
//
//   npm run build:web && npm run e2e
//
// Sirve dist/ como lo haría el hosting, abre un Chrome headless y corre las
// suites contra el bundle real. Sale con código 1 si algo falla.

const fs = require('fs');
const path = require('path');
const { conectarNavegador, abrirPagina } = require('./cdp');
const { servirEstatico, lanzarChrome } = require('./entorno');
const suites = require('./suites');

const RAIZ = path.resolve(__dirname, '..', '..');
const DIST = path.join(RAIZ, 'dist');
const PUERTO_WEB = Number(process.env.E2E_PUERTO_WEB || 8099);
const PUERTO_CDP = Number(process.env.E2E_PUERTO_CDP || 9222);

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

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('No hay build en dist/. Corré antes:  npm run build:web');
    process.exit(1);
  }

  const soloEstas = process.argv.slice(2);
  const aCorrer = soloEstas.length
    ? suites.filter((s) => soloEstas.some((f) => s.nombre.includes(f)))
    : suites;

  if (!aCorrer.length) {
    console.error('Ninguna suite coincide con: ' + soloEstas.join(' '));
    process.exit(1);
  }

  const servidor = await servirEstatico(DIST, PUERTO_WEB);
  const chrome = await lanzarChrome(PUERTO_CDP);
  const navegador = await conectarNavegador(PUERTO_CDP);
  const base = `http://localhost:${PUERTO_WEB}`;

  const t = verificador();
  let erroresConsola = [];

  try {
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

main().catch((err) => {
  console.error('El arnés se cayó:', err.message);
  process.exit(2);
});

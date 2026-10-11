// Prueba de la compuerta paralelizable: dos compuertas completas
// (build:web + e2e) corren a la vez en este worktree, cada una con su carpeta
// de salida y sus puertos, y las dos tienen que terminar en verde sin pisarse.
//
//   node tools/e2e/pruebas/paralelo.js
//
// Sale con código 1 si alguna compuerta falla o no escribe en su carpeta.

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const RAIZ = path.resolve(__dirname, '..', '..', '..');

const JUEGOS = [
  { nombre: 'A', PKAPP_DIST: 'dist-par-a', PKAPP_PUERTO: '8301', PKAPP_PUERTO_CDP: '9401', suite: 'home' },
  { nombre: 'B', PKAPP_DIST: 'dist-par-b', PKAPP_PUERTO: '8302', PKAPP_PUERTO_CDP: '9402', suite: 'materias' },
];

// Cada build deja un centinela único en su carpeta; el runner lo pide por HTTP y corta
// si lo que sirve no es esa carpeta (p. ej. si ignorara PKAPP_DIST y sirviera dist/).
const ESCRIBIR_CENTINELA =
  `node -e "require('fs').writeFileSync(process.env.PKAPP_DIST + '/centinela-pkapp.txt', process.env.PKAPP_CENTINELA)"`;

function correrCompuerta(juego) {
  return new Promise((listo) => {
    const proceso = spawn(
      `npm run build:web && ${ESCRIBIR_CENTINELA} && npm run e2e -- --suite ${juego.suite}`,
      {
        cwd: RAIZ,
        shell: true,
        env: {
          ...process.env,
          PKAPP_DIST: juego.PKAPP_DIST,
          PKAPP_PUERTO: juego.PKAPP_PUERTO,
          PKAPP_PUERTO_CDP: juego.PKAPP_PUERTO_CDP,
          PKAPP_CENTINELA: `centinela-${juego.nombre}-${process.pid}`,
        },
      },
    );
    let salida = '';
    proceso.stdout.on('data', (d) => { salida += d; });
    proceso.stderr.on('data', (d) => { salida += d; });
    proceso.on('close', (codigo) => listo({ juego, codigo, salida }));
  });
}

function limpiar() {
  for (const j of JUEGOS) fs.rmSync(path.join(RAIZ, j.PKAPP_DIST), { recursive: true, force: true });
}

async function main() {
  limpiar();
  const resultados = await Promise.all(JUEGOS.map(correrCompuerta));
  let fallo = false;

  for (const { juego, codigo, salida } of resultados) {
    const hayIndice = fs.existsSync(path.join(RAIZ, juego.PKAPP_DIST, 'index.html'));
    const verde = codigo === 0 && /Todo OK\./.test(salida);
    console.log(`${verde ? '✓' : '✗'} compuerta ${juego.nombre}: salida ${codigo}, todo OK ${/Todo OK\./.test(salida)}`);
    console.log(`${hayIndice ? '✓' : '✗'} compuerta ${juego.nombre}: escribió ${juego.PKAPP_DIST}/index.html`);
    const sirvioLaSuya = salida.includes(`Carpeta servida verificada: ${juego.PKAPP_DIST}/`);
    console.log(`${sirvioLaSuya ? '✓' : '✗'} compuerta ${juego.nombre}: el runner sirvió ${juego.PKAPP_DIST}/ (centinela)`);
    if (!verde || !hayIndice || !sirvioLaSuya) {
      fallo = true;
      console.log(salida.split('\n').slice(-25).join('\n'));
    }
  }

  limpiar();
  console.log(fallo ? '\nLas compuertas se pisaron o fallaron.' : '\nAmbas compuertas en verde sin pisarse.');
  process.exit(fallo ? 1 : 0);
}

main();

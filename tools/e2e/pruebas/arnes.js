// Pruebas del arnés mismo (sin build ni Chrome salvo donde se indica):
// orden por defecto, --suite, validación de puertos, ocupante solo IPv4 y las
// herramientas que leen PKAPP_DIST.
//
//   node tools/e2e/pruebas/arnes.js
//
// Sale con código 1 si algo falla.

const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const CORRER = path.join(RAIZ, 'tools', 'e2e', 'correr.js');

// Orden de `module.exports` de tools/e2e/suites.js en el commit anterior a la
// partición por superficie. Las suites nuevas van después de estas.
const ORDEN_HEAD = [
  'elegir materia sin rebotar al selector',
  'el selector muestra seis materias',
  'atrás y adelante del navegador',
  'confirmación al abandonar un quiz',
  'la X del quiz pregunta una sola vez',
  'URLs profundas abiertas en frío',
  'terminar un quiz no pide confirmación',
  'dre: examen de 50 sin filtro de parcial',
  'ryd: examen de 20 sin filtro de parcial',
  'HeaderMarca: control Claro | Oscuro',
  'HeaderMarca: mismo alto en MateriaSelect y Home',
  'HeaderMarca: sin scroll horizontal y corte de 360 px',
  'Barra interna: mismo alto con y sin volver, quiz sin barra',
  'Barra interna: el volver hace goBack',
  'Barra interna: quiz sin barra y el atrás confirma',
  'HeaderMarca: teclado del control Claro | Oscuro',
  'HeaderMarca: control negativo del desborde',
  'HeaderMarca: hover sin halo ni box-shadow',
  'Ilustracion: svg del DOM conserva atributos y estructura',
];

const PUERTO_WEB = '8329';
const PUERTO_CDP = '9329';

const fallos = [];
function esperar(nombre, cond, detalle = '') {
  console.log(`${cond ? '✓' : '✗'} ${nombre}${cond ? '' : detalle ? '\n    ' + detalle : ''}`);
  if (!cond) fallos.push(nombre);
}

const distTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'pkapp-arnes-'));
fs.writeFileSync(path.join(distTemporal, 'index.html'), '<!doctype html><title>t</title>');

function correr(args, env = {}) {
  const r = spawnSync('node', [CORRER, ...args], {
    cwd: RAIZ,
    encoding: 'utf8',
    timeout: 60000,
    env: {
      ...process.env,
      PKAPP_DIST: distTemporal,
      PKAPP_PUERTO: PUERTO_WEB,
      PKAPP_PUERTO_CDP: PUERTO_CDP,
      ...env,
    },
  });
  return { codigo: r.status, salida: (r.stdout || '') + (r.stderr || '') };
}

function ocupar(host) {
  return new Promise((listo, falla) => {
    const s = net.createServer();
    s.once('error', falla);
    s.listen(Number(PUERTO_WEB), host, () => listo(s));
  });
}

async function main() {
  // A1: sin --suite, el orden de HEAD y las suites nuevas al final. La aserción
  // vale con o sin suites nuevas en el árbol: las de HEAD primero y en su orden,
  // y todo lo que venga después no es de HEAD.
  const ordenValido = (nombres) =>
    JSON.stringify(nombres.slice(0, ORDEN_HEAD.length)) === JSON.stringify(ORDEN_HEAD)
    && nombres.slice(ORDEN_HEAD.length).every((n) => !ORDEN_HEAD.includes(n));
  const { todas } = require('../suites');
  const nombres = todas.map((s) => s.nombre);
  esperar('orden por defecto: las 19 de HEAD primero y en su orden',
    JSON.stringify(nombres.slice(0, ORDEN_HEAD.length)) === JSON.stringify(ORDEN_HEAD),
    nombres.slice(0, ORDEN_HEAD.length).join(' | '));
  esperar('orden por defecto: lo que sigue a las de HEAD no es de HEAD',
    ordenValido(nombres), nombres.join(' | '));

  // Con una superficie inyectada (sin depender de ninguna real): el índice real
  // armado sobre superficies de prueba. `nueva` va primera en SUPERFICIES y las
  // de HEAD llegan invertidas, para que el orden dependa solo de ORDEN.
  const fuenteIndice = fs.readFileSync(path.join(RAIZ, 'tools', 'e2e', 'suites', 'index.js'), 'utf8');
  const indiceInyectado = (transformar = (f) => f) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkapp-suites-'));
    try {
      const fuente = transformar(fuenteIndice)
        .replace(/const SUPERFICIES = \[[\s\S]*?\];/, "const SUPERFICIES = ['nueva', 'antiguas'];");
      fs.writeFileSync(path.join(dir, 'index.js'), fuente);
      fs.writeFileSync(path.join(dir, 'nueva.js'),
        "module.exports = [{ nombre: 'suite nueva de prueba', correr() {} }];\n");
      fs.writeFileSync(path.join(dir, 'antiguas.js'),
        `module.exports = ${JSON.stringify([...ORDEN_HEAD].reverse())}.map((nombre) => ({ nombre, correr() {} }));\n`);
      return require(path.join(dir, 'index.js')).todas.map((s) => s.nombre);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };
  const conNueva = indiceInyectado();
  esperar('orden por defecto con una suite nueva: HEAD primero y la nueva al final',
    conNueva.length === ORDEN_HEAD.length + 1 && ordenValido(conNueva)
    && conNueva[conNueva.length - 1] === 'suite nueva de prueba',
    conNueva.join(' | '));

  // Control negativo: si la nueva se intercala entre las de HEAD, la aserción falla.
  const marca = 'return i === -1 ? ORDEN.length : i;';
  esperar('control negativo: el índice tiene la línea que se muta', fuenteIndice.includes(marca));
  const intercalada = indiceInyectado((f) => f.replace(marca, 'return i === -1 ? 5 : i;'));
  esperar('control negativo: una suite nueva intercalada entre las de HEAD hace fallar la aserción',
    !ordenValido(intercalada) && intercalada.indexOf('suite nueva de prueba') < ORDEN_HEAD.length,
    intercalada.join(' | '));

  // A5: superficie vacía, nombre inexistente, `--suite=x`.
  const vacia = correr(['--suite', 'agregar']);
  esperar('--suite <vacía>: sale 0 con «la superficie agregar no tiene suites»',
    vacia.codigo === 0 && vacia.salida.includes('la superficie agregar no tiene suites'),
    `exit ${vacia.codigo}: ${vacia.salida.trim()}`);
  const inexistente = correr(['--suite', 'nada']);
  esperar('--suite <inexistente>: sale ≠ 0 con la lista de superficies',
    inexistente.codigo !== 0 && inexistente.codigo !== null && inexistente.salida.includes('Hay: materias, home'),
    `exit ${inexistente.codigo}: ${inexistente.salida.trim()}`);
  const conIgual = correr(['--suite=agregar']);
  esperar('--suite=x se acepta igual que --suite x',
    conIgual.codigo === 0 && conIgual.salida.includes('la superficie agregar no tiene suites'),
    `exit ${conIgual.codigo}: ${conIgual.salida.trim()}`);
  const igualInexistente = correr(['--suite=nada']);
  esperar('--suite=<inexistente>: sale ≠ 0 con la lista de superficies',
    igualInexistente.codigo === 1 && igualInexistente.salida.includes('No existe la superficie "nada"'),
    `exit ${igualInexistente.codigo}: ${igualInexistente.salida.trim()}`);

  // N1: puerto 0 rechazado con mensaje, sin colgarse.
  const web0 = correr(['--suite', 'resultados'], { PKAPP_PUERTO: '0' });
  esperar('PKAPP_PUERTO=0 se rechaza con mensaje',
    web0.codigo === 1 && /PKAPP_PUERTO inválido/.test(web0.salida),
    `exit ${web0.codigo}: ${web0.salida.trim()}`);
  const cdp0 = correr(['--suite', 'resultados'], { PKAPP_PUERTO_CDP: '0' });
  esperar('PKAPP_PUERTO_CDP=0 se rechaza con mensaje',
    cdp0.codigo === 1 && /PKAPP_PUERTO_CDP inválido/.test(cdp0.salida),
    `exit ${cdp0.codigo}: ${cdp0.salida.trim()}`);

  // A4: ocupante solo IPv4.
  for (const host of ['127.0.0.1', '0.0.0.0']) {
    const ocupante = await ocupar(host);
    try {
      const r = correr(['--suite', 'resultados']);
      esperar(`puerto web ocupado en ${host}: error claro y salida ≠ 0`,
        r.codigo !== 0 && r.codigo !== null && /ocupado/.test(r.salida),
        `exit ${r.codigo}: ${r.salida.trim().split('\n').slice(-3).join(' / ')}`);
    } finally {
      await new Promise((r) => ocupante.close(r));
    }
  }

  // A3: analitica.mjs con PKAPP_DIST exportado (la propia herramienta lo prueba).
  const analitica = spawnSync('node', [path.join(RAIZ, 'tools', 'ui', 'analitica.mjs')], {
    cwd: RAIZ, encoding: 'utf8', env: { ...process.env, PKAPP_DIST: 'dist-exportado' },
  });
  esperar('analitica.mjs en verde con PKAPP_DIST exportado',
    analitica.status === 0, `exit ${analitica.status}: ${(analitica.stdout + analitica.stderr).trim().split('\n').slice(-3).join(' / ')}`);

  // N3: svg-web.mjs mide la carpeta de PKAPP_DIST.
  const svg = spawnSync('node', [path.join(RAIZ, 'tools', 'ui', 'svg-web.mjs')], {
    cwd: RAIZ, encoding: 'utf8', env: { ...process.env, PKAPP_DIST: 'no-existe-2-8b' },
  });
  esperar('svg-web.mjs lee PKAPP_DIST (carpeta inexistente: ≠ 0 y la nombra)',
    svg.status !== 0 && (svg.stdout + svg.stderr).includes('no-existe-2-8b'),
    `exit ${svg.status}: ${(svg.stdout + svg.stderr).trim().split('\n').slice(-2).join(' / ')}`);

  // esperarTexto no distingue mayúsculas: el rótulo de MateriaSelect es «Tus
  // materias» en el DOM pero innerText devuelve «TUS MATERIAS» (text-transform).
  // Navegador simulado: Runtime.evaluate devuelve un texto fijo.
  const { abrirPagina } = require('../cdp');
  const paginaCon = async (texto) => abrirPagina({
    enviar: async (metodo) => {
      if (metodo === 'Target.createTarget') return { targetId: 't' };
      if (metodo === 'Target.attachToTarget') return { sessionId: 's' };
      if (metodo === 'Runtime.evaluate') return { result: { value: texto } };
      return {};
    },
    alEvento() {},
  });
  const rotulada = await paginaCon('TUS MATERIAS DE ESFUNO');
  esperar('esperarTexto: «tus materias» encuentra «TUS MATERIAS»',
    await rotulada.esperarTexto('tus materias', { limite: 300 }) === true);
  esperar('esperarTexto: «Tus materias» encuentra «TUS MATERIAS»',
    await rotulada.esperarTexto('Tus materias', { limite: 300 }) === true);
  esperar('esperarTexto: un texto ausente sigue sin encontrarse',
    await rotulada.esperarTexto('Resultados', { limite: 300 }) === false);

  // A6: gen-conteos no reescribe si no cambia, sin temporales.
  const conteos = path.join(RAIZ, 'src', 'materias', 'conteos.js');
  const gen = () => spawnSync('node', [path.join(RAIZ, 'scripts', 'gen-conteos.mjs')], { cwd: RAIZ, encoding: 'utf8' });
  const g1 = gen();
  const antes = fs.statSync(conteos);
  await new Promise((r) => setTimeout(r, 30));
  const g2 = gen();
  const despues = fs.statSync(conteos);
  esperar('gen-conteos: sin cambios no reescribe conteos.js',
    g1.status === 0 && g2.status === 0 && antes.mtimeMs === despues.mtimeMs && antes.ino === despues.ino,
    `mtime ${antes.mtimeMs} → ${despues.mtimeMs}`);
  const sobras = fs.readdirSync(path.dirname(conteos)).filter((f) => f.startsWith('conteos.js.') || f.endsWith('.tmp'));
  esperar('gen-conteos: no deja temporales', sobras.length === 0, sobras.join(', '));
}

main()
  .catch((err) => { console.error(err); fallos.push('excepción'); })
  .finally(() => {
    fs.rmSync(distTemporal, { recursive: true, force: true });
    console.log(fallos.length ? `\n${fallos.length} prueba(s) fallaron.` : '\nTodo OK.');
    process.exit(fallos.length ? 1 : 0);
  });

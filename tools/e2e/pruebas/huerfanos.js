// Pruebas de la limpieza del arnés: ni Chrome ni perfiles `pkapp-e2e-*` quedan vivos
// después de una corrida cortada por señal, caída por un error o lanzada junto a restos
// de corridas anteriores.
//
//   node tools/e2e/pruebas/huerfanos.js
//
// Cada corrida usa su propio $TMPDIR: lo que se afirma («no queda nada») vale para esa
// carpeta y nunca toca los Chrome ni los perfiles de otras sesiones. Usa $PKAPP_DIST si
// tiene build; si no, una carpeta mínima (alcanza: solo hace falta que Chrome arranque).
//
// Sale con código 1 si algo falla.

const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { rutaChrome } = require('../entorno');

const RAIZ = path.resolve(__dirname, '..', '..', '..');
const CORRER = path.join(RAIZ, 'tools', 'e2e', 'correr.js');

const ENTORNO = path.join(RAIZ, 'tools', 'e2e', 'entorno.js');

// Puertos: los del juego (PKAPP_PUERTO, PKAPP_PUERTO_CDP) si vienen en el entorno; si no, los
// pide al SO. Nunca fijos: dos sesiones o un juego ajeno no tienen que chocar con esta prueba.
let PUERTO_WEB;
let PUERTO_CDP;
let PUERTO_CDP_EXTRA;

function puertoDelSO() {
  return new Promise((listo, falla) => {
    const sonda = net.createServer();
    sonda.once('error', falla);
    sonda.listen(0, '127.0.0.1', () => {
      const { port } = sonda.address();
      sonda.close(() => listo(String(port)));
    });
  });
}

async function elegirPuertos() {
  const usados = new Set([process.env.PKAPP_PUERTO, process.env.PKAPP_PUERTO_CDP]);
  const nuevo = async () => {
    let p;
    do { p = await puertoDelSO(); } while (usados.has(p));
    usados.add(p);
    return p;
  };
  PUERTO_WEB = process.env.PKAPP_PUERTO || await nuevo();
  PUERTO_CDP = process.env.PKAPP_PUERTO_CDP || await nuevo();
  PUERTO_CDP_EXTRA = [await nuevo(), await nuevo()];
}

const fallos = [];
function esperar(nombre, cond, detalle = '') {
  console.log(`${cond ? '✓' : '✗'} ${nombre}${cond ? '' : detalle ? '\n    ' + detalle : ''}`);
  if (!cond) fallos.push(nombre);
}

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

async function hasta(cond, ms, paso = 100) {
  const limite = Date.now() + ms;
  for (;;) {
    const v = await cond();
    if (v) return v;
    if (Date.now() > limite) return false;
    await pausa(paso);
  }
}

const temporales = [];
function tmpPrivado() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'pk-h-'));
  temporales.push(d);
  return d;
}

let distPropio = null;
function distParaCorrer() {
  const dado = path.resolve(RAIZ, process.env.PKAPP_DIST || 'dist');
  if (fs.existsSync(path.join(dado, 'index.html'))) return dado;
  if (!distPropio) {
    distPropio = tmpPrivado();
    fs.writeFileSync(path.join(distPropio, 'index.html'), '<!doctype html><title>t</title>');
  }
  return distPropio;
}

// Procesos del sistema cuya línea de comando menciona `fragmento`.
function procesos(fragmento) {
  const r = spawnSync('ps', ['-axo', 'pid=,ppid=,command='], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return r.stdout.split('\n').flatMap((l) => {
    const m = /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(l);
    return m && m[3].includes(fragmento) ? [{ pid: Number(m[1]), ppid: Number(m[2]), cmd: m[3] }] : [];
  });
}

function vivo(pid) {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

function perfilesEn(tmp) {
  return fs.readdirSync(tmp).filter((n) => n.startsWith('pkapp-e2e-'));
}

function lanzarRunner(tmp, env = {}) {
  const proceso = spawn('node', [CORRER, '--suite', 'home'], {
    cwd: RAIZ,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      TMPDIR: tmp,
      PKAPP_DIST: distParaCorrer(),
      PKAPP_PUERTO: PUERTO_WEB,
      PKAPP_PUERTO_CDP: PUERTO_CDP,
      ...env,
    },
  });
  let salida = '';
  proceso.stdout.on('data', (d) => { salida += d; });
  proceso.stderr.on('data', (d) => { salida += d; });
  const cierre = new Promise((r) => proceso.once('close', (codigo, senal) => r({ codigo, senal })));
  return { proceso, cierre, salida: () => salida };
}

function codigoDe({ codigo, senal }) {
  if (codigo !== null) return codigo;
  return 128 + (os.constants.signals[senal] || 0);
}

// Espera a que el Chrome del runner esté arriba: proceso con el perfil en `tmp` y el
// puerto de debugging respondiendo.
async function chromeArriba(tmp) {
  return hasta(async () => {
    if (!procesos(`--user-data-dir=${tmp}`).some((p) => !p.cmd.includes(' --type='))) return false;
    try {
      await fetch(`http://127.0.0.1:${PUERTO_CDP}/json/version`);
      return true;
    } catch {
      return false;
    }
  }, 20000);
}

// Mata lo que haya quedado con ese $TMPDIR: una prueba en rojo no debe dejar basura.
function barrer(tmp) {
  for (const p of procesos(tmp)) {
    try { process.kill(p.pid, 'SIGKILL'); } catch { /* ya no está */ }
  }
}

async function cortarConSenal(senal, codigoEsperado) {
  const tmp = tmpPrivado();
  const runner = lanzarRunner(tmp);
  const arriba = await chromeArriba(tmp);
  esperar(`${senal}: Chrome arriba antes de cortar`, arriba, runner.salida().slice(-400));
  runner.proceso.kill(senal);
  const fin = await Promise.race([runner.cierre, pausa(30000).then(() => null)]);
  if (!fin) runner.proceso.kill('SIGKILL');
  // Exacto: morir por la señal (código nulo) no cuenta como «salir con 128 + señal».
  esperar(`${senal}: el runner sale con ${codigoEsperado}`, fin && fin.codigo === codigoEsperado,
    `salió con ${fin ? JSON.stringify(fin) : 'nada (colgado)'}`);
  const sinProcesos = await hasta(() => procesos(tmp).length === 0, 8000);
  esperar(`${senal}: no queda ningún proceso con ese --user-data-dir`, sinProcesos,
    procesos(tmp).map((p) => `${p.pid} ${p.cmd.slice(0, 90)}`).join('\n    '));
  esperar(`${senal}: no queda el perfil pkapp-e2e-*`, perfilesEn(tmp).length === 0, perfilesEn(tmp).join(', '));
  barrer(tmp);
}

async function falloDeConexion() {
  const tmp = tmpPrivado();
  const runner = lanzarRunner(tmp, { PKAPP_E2E_FALLA_CONEXION: '1' });
  const fin = await Promise.race([runner.cierre, pausa(45000).then(() => null)]);
  if (!fin) runner.proceso.kill('SIGKILL');
  esperar('fallo de conexión: el runner sale con código distinto de 0', fin && codigoDe(fin) !== 0,
    `salió con ${fin ? JSON.stringify(fin) : 'nada (colgado)'}`);
  esperar('fallo de conexión: sin Chrome con el perfil',
    await hasta(() => procesos(tmp).length === 0, 8000),
    procesos(tmp).map((p) => `${p.pid} ${p.cmd.slice(0, 90)}`).join('\n    '));
  esperar('fallo de conexión: sin perfil pkapp-e2e-*', perfilesEn(tmp).length === 0, perfilesEn(tmp).join(', '));
  barrer(tmp);
}

async function centinelaDistinto() {
  const tmp = tmpPrivado();
  const runner = lanzarRunner(tmp, { PKAPP_CENTINELA: 'no-coincide' });
  const fin = await Promise.race([runner.cierre, pausa(45000).then(() => null)]);
  if (!fin) runner.proceso.kill('SIGKILL');
  esperar('centinela que no coincide: el runner sale con código distinto de 0', fin && codigoDe(fin) !== 0,
    `salió con ${fin ? JSON.stringify(fin) : 'nada (colgado)'}`);
  esperar('centinela que no coincide: sin Chrome ni perfil',
    (await hasta(() => procesos(tmp).length === 0, 8000)) && perfilesEn(tmp).length === 0);
  barrer(tmp);
}

function argumentosChrome(perfil, puerto) {
  return [
    '--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', 'about:blank',
  ];
}

async function barrido() {
  const tmp = tmpPrivado();
  const hace = (min) => new Date(Date.now() - min * 60 * 1000);
  const viejo = path.join(tmp, 'pkapp-e2e-viejo');
  const conLock = path.join(tmp, 'pkapp-e2e-conlock');
  const fresco = path.join(tmp, 'pkapp-e2e-fresco');
  const ajeno = path.join(tmp, 'otra-carpeta');
  const huerfano = path.join(tmp, 'pkapp-e2e-huerfano');
  const conRunner = path.join(tmp, 'pkapp-e2e-conrunner');
  for (const d of [viejo, conLock, fresco, ajeno, huerfano, conRunner]) fs.mkdirSync(d);
  fs.writeFileSync(path.join(viejo, 'Local State'), '{}');
  fs.utimesSync(viejo, hace(10), hace(10));

  // Dueño vivo del lock: el perfil es de otra corrida en curso.
  const dueno = spawn('sleep', ['120'], { stdio: 'ignore' });
  fs.symlinkSync(`${os.hostname()}-${dueno.pid}`, path.join(conLock, 'SingletonLock'));
  fs.utimesSync(conLock, hace(10), hace(10));

  // Chrome huérfano: lo lanza un shell que termina enseguida y el padre pasa a ser init.
  spawnSync('sh', ['-c',
    `"${rutaChrome()}" ${argumentosChrome(huerfano, PUERTO_CDP_EXTRA[0]).map((a) => `"${a}"`).join(' ')} ` +
    '</dev/null >/dev/null 2>&1 &'], { stdio: 'ignore' });
  const huerfanoArriba = await hasta(
    () => procesos(`--user-data-dir=${huerfano}`).some((p) => p.ppid === 1 && !p.cmd.includes(' --type=')), 15000);
  esperar('barrido: el Chrome huérfano de la prueba quedó con ppid 1', huerfanoArriba);
  // Con el puerto CDP ya retenido: sin esto la prueba depende de qué tan rápido bindea Chrome.
  esperar('barrido: el huérfano retiene su puerto CDP', await hasta(async () => {
    try { await fetch(`http://127.0.0.1:${PUERTO_CDP_EXTRA[0]}/json/version`); return true; } catch { return false; }
  }, 15000));

  // Chrome de una corrida concurrente: su runner (esta prueba) sigue vivo.
  const concurrente = spawn(rutaChrome(), argumentosChrome(conRunner, PUERTO_CDP_EXTRA[1]), { stdio: 'ignore' });
  await hasta(() => procesos(`--user-data-dir=${conRunner}`).length > 0, 15000);

  // El runner pide el MISMO puerto CDP que retiene el huérfano: el barrido tiene que correr
  // antes de sondear el puerto, o la corrida queda bloqueada por lo que él sabría matar.
  const runner = lanzarRunner(tmp, { PKAPP_E2E_FALLA_CONEXION: '1', PKAPP_PUERTO_CDP: PUERTO_CDP_EXTRA[0] });
  const fin = await Promise.race([runner.cierre, pausa(45000).then(() => null)]);
  if (!fin) runner.proceso.kill('SIGKILL');

  esperar('barrido: corre antes de sondear el puerto CDP (el huérfano lo retenía)',
    !/ocupado/.test(runner.salida()) && /Conexión fallida/.test(runner.salida()), runner.salida().slice(-300));
  esperar('barrido: borra el perfil abandonado', !fs.existsSync(viejo));
  esperar('barrido: mata el Chrome huérfano',
    await hasta(() => procesos(`--user-data-dir=${huerfano}`).length === 0, 8000));
  esperar('barrido: borra el perfil del Chrome huérfano', !fs.existsSync(huerfano));
  esperar('barrido: respeta un perfil con lock de un pid vivo', fs.existsSync(conLock));
  esperar('barrido: respeta un perfil reciente sin lock', fs.existsSync(fresco));
  esperar('barrido: respeta un Chrome con runner vivo y su perfil',
    vivo(concurrente.pid) && fs.existsSync(conRunner));
  esperar('barrido: no toca carpetas ajenas', fs.existsSync(ajeno));

  concurrente.kill('SIGKILL');
  dueno.kill('SIGKILL');
  barrer(tmp);
}

// --- Chrome falso: sirve /json/version y deja rastro en $FAKE_DIR (pid, SIGTERM recibido) ---

let falso = null;
function chromeFalso() {
  if (!falso) {
    falso = path.join(tmpPrivado(), 'chrome-falso.js');
    fs.writeFileSync(falso, [
      '#!/usr/bin/env node',
      "const http = require('http');",
      "const fs = require('fs');",
      "const arg = (n) => (process.argv.find((a) => a.startsWith(n + '=')) || '').slice(n.length + 1);",
      'const dir = process.env.FAKE_DIR;',
      "fs.writeFileSync(dir + '/pid', String(process.pid));",
      "process.on('SIGTERM', () => {",
      "  fs.appendFileSync(dir + '/term', '1');",
      '  if (!process.env.FAKE_IGNORA_TERM) process.exit(0);',
      '});',
      "http.createServer((q, r) => r.end('{}')).listen(Number(arg('--remote-debugging-port')), '127.0.0.1');",
      '',
    ].join('\n'));
    fs.chmodSync(falso, 0o755);
  }
  return falso;
}

// Script que usa `lanzarChrome` directo (sin correr.js): permite mirar el estado justo
// después de `cerrar()` y probar la red `exit` sin pasar por ningún cierre ordenado.
let ayuda = null;
function scriptAyuda() {
  if (!ayuda) {
    ayuda = path.join(tmpPrivado(), 'ayuda.js');
    fs.writeFileSync(ayuda, [
      "const { lanzarChrome } = require(process.env.ENTORNO);",
      "const fs = require('fs');",
      "const os = require('os');",
      "const perfiles = () => fs.readdirSync(os.tmpdir()).filter((n) => n.startsWith('pkapp-e2e-')).length;",
      '(async () => {',
      '  const modo = process.argv[2];',
      "  if (modo === 'sinchrome') {",
      '    try {',
      '      await lanzarChrome(Number(process.env.PUERTO));',
      "      console.log('RESULTADO lanzo');",
      '    } catch {',
      "      console.log('RESULTADO rechazo perfiles=' + perfiles());",
      '    }',
      '    return;',
      '  }',
      '  const chrome = await lanzarChrome(Number(process.env.PUERTO));',
      "  if (modo === 'salir') process.exit(0);",
      '  await chrome.cerrar();',
      "  const pid = Number(fs.readFileSync(process.env.FAKE_DIR + '/pid', 'utf8'));",
      '  let vivo = true;',
      '  try { process.kill(pid, 0); } catch { vivo = false; }',
      "  console.log('RESULTADO vivo=' + vivo + ' perfiles=' + perfiles());",
      "})().catch((e) => { console.log('CAYO ' + e.message); process.exit(3); });",
      '',
    ].join('\n'));
  }
  return ayuda;
}

function ejecutarAyuda(modo, env) {
  const tmp = tmpPrivado();
  const r = spawnSync('node', [scriptAyuda(), modo], {
    encoding: 'utf8',
    timeout: 40000,
    env: { ...process.env, TMPDIR: tmp, ENTORNO, PUERTO: PUERTO_CDP, ...env },
  });
  return { tmp, salida: `${r.stdout || ''}${r.stderr || ''}` };
}

async function cierreEscalaASigkill() {
  const fdir = tmpPrivado();
  const { tmp, salida } = ejecutarAyuda('cerrar', {
    CHROME_PATH: chromeFalso(), FAKE_DIR: fdir, FAKE_IGNORA_TERM: '1',
  });
  esperar('cerrar(): un Chrome que ignora SIGTERM está muerto cuando cerrar() vuelve (SIGKILL)',
    /RESULTADO vivo=false/.test(salida), salida.slice(-300));
  esperar('cerrar(): borra su perfil', /perfiles=0/.test(salida), salida.slice(-300));
  barrer(tmp);
}

async function redDeExit() {
  const fdir = tmpPrivado();
  const { tmp } = ejecutarAyuda('salir', { CHROME_PATH: chromeFalso(), FAKE_DIR: fdir });
  const pid = Number(fs.existsSync(path.join(fdir, 'pid')) ? fs.readFileSync(path.join(fdir, 'pid'), 'utf8') : 0);
  esperar('exit: salir sin cerrar no deja el Chrome (red síncrona)', pid > 0 && await hasta(() => !vivo(pid), 5000));
  esperar('exit: ni su perfil', perfilesEn(tmp).length === 0, perfilesEn(tmp).join(', '));
  barrer(tmp);
}

async function caerCierraOrdenado() {
  const fdir = tmpPrivado();
  const tmp = tmpPrivado();
  const runner = lanzarRunner(tmp, {
    PKAPP_E2E_FALLA_CONEXION: 'suelto', CHROME_PATH: chromeFalso(), FAKE_DIR: fdir,
  });
  const fin = await Promise.race([runner.cierre, pausa(30000).then(() => null)]);
  if (!fin) runner.proceso.kill('SIGKILL');
  esperar('caer(): un error suelto con Chrome vivo sale con 2', fin && fin.codigo === 2,
    `salió con ${fin ? JSON.stringify(fin) : 'nada (colgado)'}\n    ${runner.salida().slice(-300)}`);
  esperar('caer(): cierra Chrome con SIGTERM antes de salir (no solo la red de exit)',
    fs.existsSync(path.join(fdir, 'term')));
  esperar('caer(): sin Chrome ni perfil',
    (await hasta(() => procesos(tmp).length === 0, 8000)) && perfilesEn(tmp).length === 0);
  barrer(tmp);
}

async function sinChromeSinPerfil() {
  const { tmp, salida } = ejecutarAyuda('sinchrome', { CHROME_PATH: path.join(tmpPrivado(), 'no-existe') });
  esperar('sin Chrome: lanzarChrome rechaza y no deja perfil vacío',
    /RESULTADO rechazo perfiles=0/.test(salida), salida.slice(-300));
  barrer(tmp);
}

// `ps` que falla a partir de la segunda llamada: el barrido no puede seguir a ciegas.
async function psFallaEnLaSegundaLectura() {
  const tmp = tmpPrivado();
  const pila = tmpPrivado();
  const orfano = path.join(tmp, 'pkapp-e2e-huerfano-ps');
  fs.mkdirSync(orfano);
  const fdirOrfano = tmpPrivado();
  const comillas = (a) => `"${a}"`;
  spawnSync('sh', ['-c',
    `FAKE_DIR="${fdirOrfano}" "${chromeFalso()}" ${argumentosChrome(orfano, PUERTO_CDP_EXTRA[0]).map(comillas).join(' ')} ` +
    '</dev/null >/dev/null 2>&1 &'], { stdio: 'ignore' });
  const arriba = await hasta(
    () => procesos(`--user-data-dir=${orfano}`).some((p) => p.ppid === 1), 10000);
  esperar('ps roto: el Chrome huérfano de la prueba quedó con ppid 1', arriba);

  fs.writeFileSync(path.join(pila, 'ps'), [
    '#!/bin/sh',
    `n=$(cat "${pila}/n" 2>/dev/null || echo 0)`,
    'n=$((n+1))',
    `echo $n > "${pila}/n"`,
    '[ "$n" -ge 2 ] && exit 1',
    'exec /bin/ps "$@"',
    '',
  ].join('\n'));
  fs.chmodSync(path.join(pila, 'ps'), 0o755);

  const runner = lanzarRunner(tmp, {
    PKAPP_E2E_FALLA_CONEXION: '1',
    PKAPP_PUERTO_CDP: PUERTO_CDP,
    CHROME_PATH: chromeFalso(),
    FAKE_DIR: tmpPrivado(),
    PATH: `${pila}:${process.env.PATH}`,
  });
  const fin = await Promise.race([runner.cierre, pausa(45000).then(() => null)]);
  if (!fin) runner.proceso.kill('SIGKILL');
  esperar('ps roto en la segunda lectura: el barrido se detiene sin borrar el perfil del Chrome vivo',
    fs.existsSync(orfano) && procesos(`--user-data-dir=${orfano}`).length > 0,
    `perfil existe=${fs.existsSync(orfano)}`);
  barrer(tmp);
}

// `paralelo.js` cortado: copia de la prueba en una raíz falsa (package.json con build y e2e
// de juguete), para que el corte no cueste dos builds reales.
async function paraleloCortado(senal, codigoEsperado) {
  const raiz = tmpPrivado();
  fs.mkdirSync(path.join(raiz, 'tools', 'e2e', 'pruebas'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'paralelo.js'), path.join(raiz, 'tools', 'e2e', 'pruebas', 'paralelo.js'));
  fs.writeFileSync(path.join(raiz, 'package.json'), JSON.stringify({
    scripts: { 'build:web': 'node build-falso.js', e2e: 'node e2e-falso.js' },
  }));
  fs.writeFileSync(path.join(raiz, 'build-falso.js'),
    "require('fs').mkdirSync(process.env.PKAPP_DIST, { recursive: true });\n");
  fs.writeFileSync(path.join(raiz, 'e2e-falso.js'), [
    "const fs = require('fs');",
    "fs.writeFileSync(process.env.PKAPP_DIST + '/listo', String(process.pid));",
    "for (const [n, c] of [['SIGINT', 130], ['SIGTERM', 143], ['SIGHUP', 129]]) process.on(n, () => process.exit(c));",
    'setInterval(() => {}, 1000);',
    '',
  ].join('\n'));

  const proceso = spawn('node', [path.join(raiz, 'tools', 'e2e', 'pruebas', 'paralelo.js')], {
    cwd: raiz, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let salida = '';
  proceso.stdout.on('data', (d) => { salida += d; });
  proceso.stderr.on('data', (d) => { salida += d; });
  const cierre = new Promise((r) => proceso.once('close', (codigo, sig) => r({ codigo, senal: sig })));

  const marcas = ['dist-par-a', 'dist-par-b'].map((d) => path.join(raiz, d, 'listo'));
  const listas = await hasta(() => marcas.every((m) => fs.existsSync(m) && fs.readFileSync(m, 'utf8')), 20000);
  esperar(`paralelo ${senal}: las dos compuertas arrancaron antes de cortar`, listas, salida.slice(-300));
  const pids = listas ? marcas.map((m) => Number(fs.readFileSync(m, 'utf8'))) : [];
  proceso.kill(senal);
  const fin = await Promise.race([cierre, pausa(30000).then(() => null)]);
  if (!fin) proceso.kill('SIGKILL');
  esperar(`paralelo ${senal}: sale con ${codigoEsperado}`, fin && fin.codigo === codigoEsperado,
    `salió con ${fin ? JSON.stringify(fin) : 'nada (colgado)'}\n    ${salida.slice(-200)}`);
  esperar(`paralelo ${senal}: no queda ninguna compuerta viva`,
    pids.length > 0 && await hasta(() => pids.every((p) => !vivo(p)), 5000));
  for (const p of pids) { try { process.kill(p, 'SIGKILL'); } catch { /* ya no está */ } }
}

// `arnes.js` mismo: no deja `pkapp-arnes-*` en $TMPDIR ni al terminar ni cortado por señal.
// Cuenta las carpetas de la corrida antes y después, en un $TMPDIR propio.
const ARNES = path.join(__dirname, 'arnes.js');
const carpetasArnes = (tmp) => fs.readdirSync(tmp).filter((n) => n.startsWith('pkapp-arnes-'));

async function arnesSinTemporales(senal, codigoEsperado) {
  const tmp = tmpPrivado();
  const antes = carpetasArnes(tmp).length;
  const proceso = spawn('node', [ARNES], {
    cwd: RAIZ, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, TMPDIR: tmp },
  });
  let salida = '';
  proceso.stdout.on('data', (d) => { salida += d; });
  proceso.stderr.on('data', (d) => { salida += d; });
  const cierre = new Promise((r) => proceso.once('close', (codigo, sig) => r({ codigo, senal: sig })));
  const rotulo = senal ? `arnes.js cortado con ${senal}` : 'arnes.js hasta el final';
  if (senal) {
    const creo = await hasta(() => carpetasArnes(tmp).length > 0, 20000);
    esperar(`${rotulo}: creó sus temporales antes de cortar`, creo, salida.slice(-300));
    proceso.kill(senal);
  }
  const fin = await Promise.race([cierre, pausa(180000).then(() => null)]);
  if (!fin) proceso.kill('SIGKILL');
  const despues = carpetasArnes(tmp);
  if (senal) {
    esperar(`${rotulo}: sale con ${codigoEsperado}`, fin && codigoDe(fin) === codigoEsperado,
      `salió con ${fin ? JSON.stringify(fin) : 'nada (colgado)'}\n    ${salida.slice(-200)}`);
  } else {
    esperar(`${rotulo}: sale 0`, fin && fin.codigo === 0, salida.slice(-300));
  }
  esperar(`${rotulo}: no deja pkapp-arnes-* (antes ${antes}, después ${despues.length})`,
    despues.length === 0, despues.join(', '));
}

async function main() {
  try {
    await arnesSinTemporales(null);
    await arnesSinTemporales('SIGINT', 130);
    await arnesSinTemporales('SIGTERM', 143);
    await arnesSinTemporales('SIGHUP', 129);
    await elegirPuertos();
    await cortarConSenal('SIGINT', 130);
    await cortarConSenal('SIGTERM', 143);
    await cortarConSenal('SIGHUP', 129);
    await falloDeConexion();
    await centinelaDistinto();
    await barrido();
    await psFallaEnLaSegundaLectura();
    await cierreEscalaASigkill();
    await redDeExit();
    await caerCierraOrdenado();
    await sinChromeSinPerfil();
    await paraleloCortado('SIGINT', 130);
    await paraleloCortado('SIGTERM', 143);
    await paraleloCortado('SIGHUP', 129);
  } finally {
    for (const t of temporales) {
      barrer(t);
      fs.rmSync(t, { recursive: true, force: true });
    }
  }
  console.log(fallos.length ? `\n${fallos.length} comprobación(es) fallaron.` : '\nTodo OK.');
  process.exit(fallos.length ? 1 : 0);
}

main().catch((err) => {
  console.error('La prueba se cayó:', err);
  process.exit(2);
});

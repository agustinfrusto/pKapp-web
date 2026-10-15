// Levanta y baja lo que las pruebas necesitan alrededor: un servidor estático
// que imita el hosting de producción y un Chrome headless con debugging abierto.

const http = require('http');
const net = require('net');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const TIPOS = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

// El fallback a index.html no es un detalle del test: es lo que hace
// public/_redirects en producción, y sin eso recargar /estadisticas da 404.
// Si se prueba sin fallback, las rutas profundas fallan por el servidor y no
// por la app.
async function servirEstatico(raiz, puerto) {
  // `listen(puerto)` bindea `::`, y un ocupante solo IPv4 (127.0.0.1 o 0.0.0.0) no da
  // EADDRINUSE: el arnés arrancaría y `localhost` podría resolver al servidor ajeno.
  // Cada host se sonda aparte: con SO_REUSEADDR, atarse a uno específico no choca
  // con un ocupante en el comodín, ni al revés.
  await puertoLibre(puerto, 'PKAPP_PUERTO', '127.0.0.1');
  await puertoLibre(puerto, 'PKAPP_PUERTO', '0.0.0.0');
  const servidor = http.createServer((req, res) => {
    let archivo;
    try {
      const url = decodeURIComponent(req.url.split('?')[0]);
      archivo = path.join(raiz, url);
    } catch {
      archivo = path.join(raiz, 'index.html');
    }
    if (!archivo.startsWith(raiz)) { res.writeHead(403); return res.end(); }
    if (!fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
      const indice = path.join(archivo, 'index.html');
      archivo = fs.existsSync(indice) ? indice : path.join(raiz, 'index.html');
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
    res.end(fs.readFileSync(archivo));
  });

  return new Promise((listo, falla) => {
    servidor.once('error', (err) => falla(errorDePuerto(err, puerto, 'PKAPP_PUERTO')));
    servidor.listen(puerto, () => listo({
      cerrar: () => new Promise((r) => servidor.close(r)),
    }));
  });
}

// Un puerto ocupado tiene que cortar con un mensaje, no colgar ni hablarle a
// otro proceso: con dos compuertas en paralelo es el choque más probable.
function errorDePuerto(err, puerto, variable) {
  if (err.code === 'EADDRINUSE') {
    return new Error(`El puerto ${puerto} está ocupado. Elegí otro con ${variable}.`);
  }
  return err;
}

function puertoLibre(puerto, variable, host = '127.0.0.1') {
  return new Promise((listo, falla) => {
    const sonda = net.createServer();
    sonda.once('error', (err) => falla(errorDePuerto(err, puerto, variable)));
    sonda.listen(puerto, host, () => sonda.close(() => listo()));
  });
}

function rutaChrome() {
  if (process.env.CHROME_PATH) {
    if (!fs.existsSync(process.env.CHROME_PATH)) {
      throw new Error(`CHROME_PATH apunta a un archivo que no existe: ${process.env.CHROME_PATH}`);
    }
    return process.env.CHROME_PATH;
  }
  const candidatos = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  const encontrado = candidatos.find((p) => fs.existsSync(p));
  if (!encontrado) {
    throw new Error(
      'No se encontró Chrome. Instalalo o exportá CHROME_PATH con la ruta al binario.'
    );
  }
  return encontrado;
}

// Un perfil sin proceso ni lock que tiene menos de esto puede ser de un lanzamiento en
// curso (entre `mkdtemp` y el primer arranque de Chrome): no se barre.
const GRACIA_PERFIL_MS = 2 * 60 * 1000;
const PREFIJO_PERFIL = 'pkapp-e2e-';
const SENALES = { SIGHUP: 1, SIGINT: 2, SIGTERM: 15 };

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

function vivo(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

function real(ruta) {
  try {
    return fs.realpathSync(ruta);
  } catch {
    return ruta;
  }
}

// Los ayudantes de Chrome siguen escribiendo un instante tras su salida y el borrado falla
// con ENOTEMPTY: se reintenta un rato. Devuelve si el perfil ya no existe.
async function borrarPerfil(perfil) {
  for (let i = 0; i < 15 && fs.existsSync(perfil); i++) {
    try {
      fs.rmSync(perfil, { recursive: true, force: true });
    } catch { /* se reintenta */ }
    if (fs.existsSync(perfil)) await pausa(200);
  }
  return !fs.existsSync(perfil);
}

// Procesos con `--user-data-dir=`: el navegador principal y sus ayudantes (`--type=`).
function procesosConPerfil() {
  const r = spawnSync('ps', ['-axo', 'pid=,ppid=,command='], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error || r.status !== 0) throw new Error('no se pudo listar procesos con ps');
  const lista = [];
  for (const linea of r.stdout.split('\n')) {
    const m = /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(linea);
    const perfil = m && /--user-data-dir=(\S+)/.exec(m[3]);
    if (perfil) {
      lista.push({
        pid: Number(m[1]),
        ppid: Number(m[2]),
        perfil: real(perfil[1]),
        ayudante: m[3].includes(' --type='),
      });
    }
  }
  return lista;
}

// Chrome deja en el perfil el symlink `SingletonLock` -> `<host>-<pid>`.
function pidDelLock(perfil) {
  try {
    const pid = Number(fs.readlinkSync(path.join(perfil, 'SingletonLock')).split('-').pop());
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

// Borra los `pkapp-e2e-*` de $TMPDIR que ya no usa ninguna corrida, y mata el Chrome
// huérfano que los retiene. Hay corridas concurrentes (otras sesiones, otros worktrees),
// así que ante la duda no se borra:
//   - en uso: algún proceso lo referencia en `--user-data-dir` (ps), o su
//     `SingletonLock` apunta a un pid vivo. Un pid reciclado solo deja un perfil de más.
//   - huérfano: el Chrome principal tiene ppid 1, o sea que su runner ya no existe.
//     Un Chrome de una corrida viva siempre cuelga de ese runner.
//   - sin proceso y sin lock: se respeta si tiene menos de 2 minutos.
// Un fallo del barrido nunca rompe la corrida.
async function barrerAbandonados() {
  const tmp = os.tmpdir();
  let candidatos;
  try {
    candidatos = fs.readdirSync(tmp)
      .filter((n) => n.startsWith(PREFIJO_PERFIL))
      .map((n) => real(path.join(tmp, n)));
  } catch {
    return;
  }
  if (!candidatos.length) return;

  let procesos;
  try {
    procesos = procesosConPerfil();
  } catch (err) {
    console.error(`Barrido de perfiles omitido: ${err.message}`);
    return;
  }

  const huerfanos = new Set(procesos
    .filter((p) => !p.ayudante && p.ppid === 1 && candidatos.includes(p.perfil))
    .map((p) => p.perfil));
  // Se mata por perfil y se vuelve a listar: un ayudante que Chrome lanzó justo antes de
  // morir no estaba en la primera lista y recrearía el perfil recién borrado.
  for (let ronda = 0; ronda < 40 && huerfanos.size; ronda++) {
    let restantes;
    try {
      restantes = procesosConPerfil().filter((p) => huerfanos.has(p.perfil));
    } catch (err) {
      // Sin saber qué sigue vivo no se borra nada: un Chrome vivo con su perfil borrado es peor
      // que un perfil de más.
      console.error(`Barrido de perfiles interrumpido: ${err.message}`);
      return;
    }
    if (!restantes.length) break;
    for (const { pid } of restantes) {
      try { process.kill(pid, ronda < 15 ? 'SIGTERM' : 'SIGKILL'); } catch { /* ya no está */ }
    }
    await pausa(100);
  }

  const enUso = new Set(procesos.filter((p) => !huerfanos.has(p.perfil)).map((p) => p.perfil));
  for (const perfil of candidatos) {
    if (enUso.has(perfil)) continue;
    const lock = pidDelLock(perfil);
    if (lock !== null && vivo(lock)) continue;
    try {
      if (lock === null && !huerfanos.has(perfil) && Date.now() - fs.statSync(perfil).mtimeMs < GRACIA_PERFIL_MS) continue;
    } catch {
      continue; // desapareció solo: lo borró su dueño
    }
    if (!(await borrarPerfil(perfil))) console.error(`No se pudo borrar el perfil abandonado ${perfil}`);
  }
}

// Chrome lanzados por este proceso que todavía no cerraron.
const abiertos = new Set();
let senalesInstaladas = false;
let cortando = false;

// Un solo camino de cierre, idempotente: lo usan `cerrar()`, las señales y los
// errores fatales. Espera la salida con tope, escala a SIGKILL y reintenta el borrado.
async function cerrarChrome(chrome) {
  const { proceso, perfil } = chrome;
  const termino = () => proceso.exitCode !== null || proceso.signalCode !== null;
  const salio = (ms) => {
    if (termino()) return Promise.resolve(true);
    return new Promise((listo) => {
      const timer = setTimeout(() => listo(false), ms);
      proceso.once('exit', () => { clearTimeout(timer); listo(true); });
    });
  };

  if (!termino()) {
    proceso.kill('SIGTERM');
    if (!(await salio(5000))) {
      proceso.kill('SIGKILL');
      await salio(2000);
    }
  }
  if (!(await borrarPerfil(perfil))) {
    console.error(`No se pudo borrar el perfil temporal de Chrome: ${perfil}`);
  }
  abiertos.delete(chrome);
}

function cerrarTodo() {
  return Promise.all([...abiertos].map((c) => c.cerrar()));
}

// Ante una señal el proceso saldría sin pasar por ningún `finally`: se cierra Chrome
// primero y recién después se sale con 128 + señal. El `exit` es la última red, síncrona.
function instalarSenales() {
  if (senalesInstaladas) return;
  senalesInstaladas = true;
  for (const [nombre, numero] of Object.entries(SENALES)) {
    process.on(nombre, () => {
      if (cortando) return;
      cortando = true;
      cerrarTodo().finally(() => process.exit(128 + numero));
    });
  }
  process.on('exit', () => {
    for (const { proceso, perfil } of abiertos) {
      try { proceso.kill('SIGKILL'); } catch { /* ya no está */ }
      try { fs.rmSync(perfil, { recursive: true, force: true }); } catch { /* mejor esfuerzo */ }
    }
  });
}

async function lanzarChrome(puerto) {
  // El barrido va antes de sondear el puerto: un huérfano que retiene el puerto CDP es justo
  // lo que sabe matar, y no puede bloquear la corrida.
  await barrerAbandonados().catch((err) => {
    console.error(`Barrido de perfiles omitido: ${err.message}`);
  });
  await puertoLibre(puerto, 'PKAPP_PUERTO_CDP');
  // La ruta se resuelve antes de crear el perfil: sin Chrome no queda un perfil vacío.
  const ruta = rutaChrome();
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), PREFIJO_PERFIL));
  const proceso = spawn(ruta, [
    '--headless=new',
    `--remote-debugging-port=${puerto}`,
    `--user-data-dir=${perfil}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    // Sin barras del sistema: con un mouse conectado macOS usa barras clásicas de 15 px y
    // los marcos quedan más angostos. El resultado no depende del periférico.
    '--hide-scrollbars',
    'about:blank',
  ], { stdio: 'ignore' });

  const chrome = { proceso, perfil, cierre: null };
  chrome.cerrar = () => {
    if (!chrome.cierre) chrome.cierre = cerrarChrome(chrome);
    return chrome.cierre;
  };
  abiertos.add(chrome);
  instalarSenales();

  const hasta = Date.now() + 20000;
  for (;;) {
    try {
      await fetch(`http://127.0.0.1:${puerto}/json/version`);
      break;
    } catch {
      if (Date.now() > hasta) {
        await chrome.cerrar();
        throw new Error('Chrome no respondió en el puerto de debugging');
      }
      await pausa(200);
    }
  }

  return { cerrar: chrome.cerrar };
}

module.exports = { servirEstatico, lanzarChrome, rutaChrome, cerrarTodo };

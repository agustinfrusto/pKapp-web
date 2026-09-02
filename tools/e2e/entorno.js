// Levanta y baja lo que las pruebas necesitan alrededor: un servidor estático
// que imita el hosting de producción y un Chrome headless con debugging abierto.

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

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
function servirEstatico(raiz, puerto) {
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

  return new Promise((listo) => {
    servidor.listen(puerto, () => listo({
      cerrar: () => new Promise((r) => servidor.close(r)),
    }));
  });
}

function rutaChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
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

async function lanzarChrome(puerto) {
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'pkapp-e2e-'));
  const proceso = spawn(rutaChrome(), [
    '--headless=new',
    `--remote-debugging-port=${puerto}`,
    `--user-data-dir=${perfil}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank',
  ], { stdio: 'ignore' });

  const hasta = Date.now() + 20000;
  for (;;) {
    try {
      await fetch(`http://127.0.0.1:${puerto}/json/version`);
      break;
    } catch {
      if (Date.now() > hasta) {
        proceso.kill();
        throw new Error('Chrome no respondió en el puerto de debugging');
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return {
    // Hay que esperar a que el proceso muera antes de borrar el perfil: Chrome
    // sigue escribiendo mientras se apaga y el borrado falla con ENOTEMPTY.
    cerrar: async () => {
      const muerto = new Promise((r) => proceso.once('exit', r));
      proceso.kill();
      await Promise.race([muerto, new Promise((r) => setTimeout(r, 5000))]);
      try {
        fs.rmSync(perfil, { recursive: true, force: true });
      } catch {
        // Un perfil temporal que queda no justifica marcar la corrida como rota.
      }
    },
  };
}

module.exports = { servirEstatico, lanzarChrome };

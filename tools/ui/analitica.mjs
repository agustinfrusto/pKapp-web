// Chequeo: la analítica (Umami y beacon de Cloudflare) solo se inyecta en producción.
// Copia scripts/inject-pwa.js a un árbol temporal con un index.html de prueba y lo
// corre con distintos CF_PAGES_BRANCH.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const SCRIPT = resolve(import.meta.dirname, '..', '..', 'scripts', 'inject-pwa.js');
const COLORES = resolve(import.meta.dirname, '..', '..', 'src', 'theme', 'colores.js');
const HTML ='<!doctype html><html><head><title>t</title></head><body></body></html>';

function correr(rama, conToken) {
  const raiz = mkdtempSync(join(tmpdir(), 'analitica-'));
  try {
    mkdirSync(join(raiz, 'scripts'));
    mkdirSync(join(raiz, 'dist'));
    mkdirSync(join(raiz, 'src', 'theme'), { recursive: true });
    copyFileSync(SCRIPT, join(raiz, 'scripts', 'inject-pwa.js'));
    // inject-pwa.js lee el theme-color de los tokens: se copia lo que requiere.
    copyFileSync(COLORES, join(raiz, 'src', 'theme', 'colores.js'));
    writeFileSync(join(raiz, 'dist', 'index.html'), HTML);
    const env = { ...process.env };
    delete env.CF_PAGES_BRANCH;
    delete env.CF_ANALYTICS_TOKEN;
    // El árbol temporal tiene su propio dist/: una PKAPP_DIST exportada no aplica acá.
    delete env.PKAPP_DIST;
    if (rama !== undefined) env.CF_PAGES_BRANCH = rama;
    if (conToken) env.CF_ANALYTICS_TOKEN = 'token-de-prueba';
    const salida = execFileSync('node', [join(raiz, 'scripts', 'inject-pwa.js')], { env, encoding: 'utf8' });
    return { html: readFileSync(join(raiz, 'dist', 'index.html'), 'utf8'), salida };
  } finally {
    rmSync(raiz, { recursive: true, force: true });
  }
}

const fallos = [];
function esperar(nombre, cond) {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${nombre}`);
  if (!cond) fallos.push(nombre);
}
const umami = (h) => h.includes('data-website-id="6dcfe8fe-3b80-48dc-a324-57ccc4fa9bae"');
const beacon = (h) => h.includes('static.cloudflareinsights.com');

const prod = correr('main', true);
esperar('main: Umami presente', umami(prod.html));
esperar('main + token: beacon presente', beacon(prod.html));

const prodSinToken = correr('main', false);
esperar('main sin token: Umami presente, beacon ausente', umami(prodSinToken.html) && !beacon(prodSinToken.html));

const preview = correr('rediseno', true);
esperar('rediseno: Umami ausente', !umami(preview.html));
esperar('rediseno + token: beacon ausente', !beacon(preview.html));
esperar('rediseno: informa la rama', preview.salida.includes('analítica omitida: rama rediseno'));

const local = correr(undefined, true);
esperar('sin variable: Umami ausente', !umami(local.html));
esperar('sin variable + token: beacon ausente', !beacon(local.html));
esperar('sin variable: informa build local', local.salida.includes('build local'));

if (fallos.length) {
  console.error(`\n${fallos.length} chequeo(s) fallaron`);
  process.exit(1);
}
console.log('\nanalítica: todo en verde');

// Paso final de `build:web` (tarea 2.9b): falla si el bundle del shell contiene la marca
// de la página de prueba de los componentes de la Plancha.
//
// La página de prueba entra solo con EXPO_PUBLIC_PKAPP_PRUEBA=componentes. Dos caminos la
// dejan de raíz de producción sin que ningún paso de `build:web` lo note: la variable
// exportada en el shell, y una caché de Metro compartida que quedó con `index.js` plegado
// en verdadero (la caché se indexa por contenido, no por variables de entorno).
//
// Lee `PKAPP_DIST` (por defecto `dist`), igual que `build:web`. La marca sale de
// src/components/plancha/prueba/marca.js: una cadena literal, que sobrevive a la
// minificación (el nombre de un componente no).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(RAIZ, process.env.PKAPP_DIST || 'dist');
const FUENTE_MARCA = path.join(RAIZ, 'src/components/plancha/prueba/marca.js');

function fallar(mensaje) {
  console.error(`verificar-bundle: ${mensaje}`);
  process.exit(1);
}

const declaracion = /MARCA_PAGINA_PRUEBA\s*=\s*'([^']+)'/.exec(fs.readFileSync(FUENTE_MARCA, 'utf8'));
if (!declaracion) fallar(`no encontré MARCA_PAGINA_PRUEBA en ${path.relative(RAIZ, FUENTE_MARCA)}`);
const MARCA = declaracion[1];

function archivosJs(carpeta) {
  const salida = [];
  for (const entrada of fs.readdirSync(carpeta, { withFileTypes: true })) {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) salida.push(...archivosJs(ruta));
    else if (entrada.name.endsWith('.js')) salida.push(ruta);
  }
  return salida;
}

const JS = path.join(DIST, '_expo', 'static', 'js');
if (!fs.existsSync(JS)) fallar(`no hay bundle en ${path.relative(RAIZ, JS)} (¿PKAPP_DIST?)`);

const archivos = archivosJs(JS);
if (archivos.length === 0) fallar(`${path.relative(RAIZ, JS)} no tiene archivos .js`);

const infectados = archivos.filter((a) => fs.readFileSync(a, 'utf8').includes(MARCA));
if (infectados.length > 0) {
  fallar(
    `la página de prueba de los componentes está en el bundle de ${path.relative(RAIZ, DIST)} `
    + `(${infectados.map((a) => path.relative(RAIZ, a)).join(', ')}). `
    + 'Desexportá EXPO_PUBLIC_PKAPP_PRUEBA y, si ya había una caché envenenada, '
    + 'reconstruí con una caché de Metro propia (TMPDIR) o con `expo export -c`.',
  );
}

console.log(`verificar-bundle: OK (${archivos.length} archivo(s) JS sin la página de prueba)`);

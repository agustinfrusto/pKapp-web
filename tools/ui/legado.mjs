// Chequeo de lo exclusivo de nativo y lo legado (tarea 5.0). pKapp es solo web/PWA.
//
// Falla mientras quede alguno de estos restos y pasa cuando no queda ninguno:
//   - fuentes nativas: src/theme/fuentes.js y los .ttf de src/assets/fuentes/;
//   - datos nativos: src/db/database.native.js, src/db/sqlite-stub.js, la dependencia
//     expo-sqlite (package.json, plugins de app.json, metro.config.js);
//   - SVG nativo: la dependencia react-native-svg, cualquier import suyo y la versión
//     de Ilustracion que lo usaba (queda un único src/components/Ilustracion.js, el del DOM);
//   - scripts de plataforma nativa: `android` e `ios` de package.json;
//   - legado de estilo: `colores`/`oscuro` de src/theme/colores.js, las familias de color
//     legadas y los fontSize xxs…display-lg de tailwind.config.js, src/theme/sombras.js;
//   - restos del navy y el violeta legados fuera de openspec/ y referencias-diseno/, el
//     campo `color` de src/materias/*/metadata.js y los pares de contraste del tema legado;
//   - símbolos de ícono (flechas, ×, ✕…) dentro de comentarios de src/, App.js y scripts/.
//
// Uso: node tools/ui/legado.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);
const rel = (p) => path.relative(RAIZ, p);
const abs = (...p) => path.join(RAIZ, ...p);
const existe = (p) => fs.existsSync(p);

const errores = [];
const fallo = (m) => errores.push(m);

// --- árbol de texto --------------------------------------------------------------------
const OMITIR_DIRS = new Set([
  'node_modules', '.git', '.orca', '.claude', '.expo', 'openspec', 'referencias-diseno',
  'NOTAS-ARQUITECTO', 'docs',
]);
const EXTENSIONES = new Set(['.js', '.mjs', '.cjs', '.json', '.md', '.css', '.html', '.yaml', '.yml']);

function archivos(dir, salida = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (OMITIR_DIRS.has(e.name) || e.name === 'dist' || e.name.startsWith('dist-')) continue;
      archivos(path.join(dir, e.name), salida);
    } else if (EXTENSIONES.has(path.extname(e.name)) && e.name !== 'package-lock.json') {
      salida.push(path.join(dir, e.name));
    }
  }
  return salida;
}
const TODOS = archivos(RAIZ);
const dentro = (...p) => {
  const base = abs(...p) + path.sep;
  return TODOS.filter((f) => f.startsWith(base));
};

// --- 1. archivos legados -----------------------------------------------------------------
const LEGADOS = [
  'src/theme/fuentes.js',
  'src/db/database.native.js',
  'src/db/sqlite-stub.js',
  'src/theme/sombras.js',
  'src/components/Ilustracion.web.js',
  'tools/ui/pares-claro.json',
  'tools/ui/pares-oscuro.json',
];
for (const f of LEGADOS) if (existe(abs(f))) fallo(`existe ${f}`);

const DIR_FUENTES = abs('src', 'assets', 'fuentes');
if (existe(DIR_FUENTES)) {
  for (const f of fs.readdirSync(DIR_FUENTES)) {
    if (f.endsWith('.ttf')) fallo(`existe src/assets/fuentes/${f} (fuente nativa)`);
  }
}

// --- 2. dependencias y configuración nativa -----------------------------------------------
const pkg = JSON.parse(fs.readFileSync(abs('package.json'), 'utf8'));
for (const grupo of ['dependencies', 'devDependencies', 'peerDependencies']) {
  for (const dep of ['expo-sqlite', 'react-native-svg']) {
    if (pkg[grupo] && dep in pkg[grupo]) fallo(`package.json ${grupo}: ${dep}`);
  }
}
for (const s of ['android', 'ios']) {
  if (pkg.scripts && s in pkg.scripts) fallo(`package.json scripts: ${s}`);
}

const app = JSON.parse(fs.readFileSync(abs('app.json'), 'utf8')).expo || {};
for (const p of app.plugins || []) {
  const nombre = Array.isArray(p) ? p[0] : p;
  if (nombre === 'expo-sqlite') fallo('app.json plugins: expo-sqlite');
}

if (/sqlite/i.test(fs.readFileSync(abs('metro.config.js'), 'utf8'))) {
  fallo('metro.config.js nombra sqlite (exclusión de expo-sqlite)');
}

// Imports de lo que se retira, en código de la app y de las herramientas.
const IMPORTA = /(?:from\s+|require\(\s*|import\(\s*)['"](?:expo-sqlite|react-native-svg)(?:\/[^'"]*)?['"]/;
const CODIGO = [
  ...dentro('src'), ...dentro('scripts'), ...dentro('tools'),
  abs('App.js'), abs('metro.config.js'), abs('tailwind.config.js'),
].filter((f) => /\.(m?js|cjs)$/.test(f) && f !== fileURLToPath(import.meta.url));
for (const f of CODIGO) {
  if (IMPORTA.test(fs.readFileSync(f, 'utf8'))) fallo(`${rel(f)} importa expo-sqlite o react-native-svg`);
}
for (const f of dentro('src')) {
  const texto = fs.readFileSync(f, 'utf8');
  if (/theme\/sombras|from\s+['"]\.\/sombras['"]|theme\/fuentes\.native/.test(texto)) {
    fallo(`${rel(f)} referencia un módulo legado (sombras o fuentes nativas)`);
  }
}

// --- 3. legado de estilo -------------------------------------------------------------------
const colores = require(abs('src', 'theme', 'colores.js'));
const claves = Object.keys(colores).sort();
if (claves.join(',') !== 'plancha') {
  fallo(`src/theme/colores.js exporta [${claves.join(', ')}], se espera solo [plancha]`);
}

const tw = require(abs('tailwind.config.js')).theme.extend;
const FONTSIZE_LEGADO = ['xxs', 'xs', 'sm', 'base', 'md', 'lg', 'xl', 'display-sm', 'display-md', 'display-lg'];
for (const k of FONTSIZE_LEGADO) if (k in (tw.fontSize || {})) fallo(`tailwind.config.js fontSize.${k} (legado)`);
const FAMILIAS = ['brand', 'accent', 'muted', 'success', 'danger', 'warning', 'parcial'];
for (const f of FAMILIAS) {
  for (const k of [f, `${f}D`]) if (k in (tw.colors || {})) fallo(`tailwind.config.js colors.${k} (legado)`);
}

// --- 4. navy y violeta legados ---------------------------------------------------------------
// El patrón se arma por partes para que este archivo no sea su propio hallazgo.
const HEX_LEGADO = new RegExp(['1a3f' + '6f', '6366' + 'f1'].join('|'), 'i');
for (const f of TODOS) {
  if (f === fileURLToPath(import.meta.url)) continue;
  if (HEX_LEGADO.test(fs.readFileSync(f, 'utf8'))) fallo(`${rel(f)} conserva el navy o el violeta legado`);
}
for (const f of dentro('src', 'materias').filter((x) => path.basename(x) === 'metadata.js')) {
  if (/^\s*color\s*:/m.test(fs.readFileSync(f, 'utf8'))) fallo(`${rel(f)} conserva el campo color`);
}

// --- 5. símbolos de ícono en comentarios ---------------------------------------------------------
const SIMBOLOS = /[→←↑↓↔↗↘×✕✖✓✔▲▼▶◀⋯]/u;
// Comentarios: línea que abre con // , * o /*, cola `// …` y `/* … */` en línea.
function comentarios(linea) {
  const t = linea.trim();
  if (/^(\/\/|\*|\/\*)/.test(t)) return t;
  const cola = /(?:^|\s)(\/\/.*)$/.exec(linea);
  const bloque = /\/\*.*?\*\//.exec(linea);
  return [cola && cola[1], bloque && bloque[0]].filter(Boolean).join(' ');
}
const DATOS = /(?:questions|ilustracion|glifos)\.js$/;
const CON_COMENTARIOS = [...dentro('src'), ...dentro('scripts'), abs('App.js')]
  .filter((f) => /\.(m?js|cjs)$/.test(f) && !DATOS.test(f));
for (const f of CON_COMENTARIOS) {
  fs.readFileSync(f, 'utf8').split('\n').forEach((linea, i) => {
    const c = comentarios(linea);
    if (c && SIMBOLOS.test(c)) fallo(`${rel(f)}:${i + 1} símbolo de ícono en un comentario`);
  });
}

if (errores.length) {
  console.error(`legado: ${errores.length} resto(s)`);
  for (const e of errores) console.error('  - ' + e);
  process.exit(1);
}
console.log('legado: OK (sin nativo, sin legado de estilo, sin navy ni violeta, sin símbolos en comentarios)');

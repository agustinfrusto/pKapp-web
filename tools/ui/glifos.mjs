// Chequeo de los glifos (design.md D2, tarea 2.5).
//
// Valida src/assets/glifos.js contra los SVG de diseno/svg/glifos/:
//   - el conjunto de ids es el mismo en ambos lados (35 en hoy);
//   - cada glifo cumple el contrato de datos de `Ilustracion` (el validador de
//     tools/ui/ilustraciones.mjs, importado, no copiado);
//   - la conversión es fiel: mismo número y tipo de elementos que el SVG, y los datos
//     son los que el convertidor genera hoy (un SVG editado sin regenerar falla);
//   - viewBox 0 0 16 16, trazo de 1,5 u y limiteInglete 2 en todos (NOTAS-GLIFOS §1);
//   - src/components/Glifo.js: `anchoTrazo(size)` da 1,5 px efectivos a cualquier tamaño,
//     no lleva colores literales, usa `Ilustracion`, trata un id heredado del prototipo
//     como inexistente y conserva `label`/`anchoTrazo` (guardia estática, no renderiza);
//   - las guardias `isMain` de ilustraciones.mjs y convertir-glifos.mjs corren (y fallan
//     ante un árbol roto) también cuando se invocan por una ruta con symlink.
//
// Uso: node tools/ui/glifos.mjs
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { validar, colorLiteral } from './ilustraciones.mjs';
import { DIR_SVG, leerTodos } from './convertir-glifos.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const VIEWBOX = '0 0 16 16';
const ANCHO = 1.5;
const INGLETE = 2;

// Importa el archivo generado como ESM sin tocar el árbol (no declara "type": "module").
async function cargar(archivo) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'glifos-'));
  try {
    fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}');
    const destino = path.join(tmp, 'glifos.js');
    fs.copyFileSync(archivo, destino);
    return (await import(pathToFileURL(destino).href)).GLIFOS;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

let NUM = 0;
const SIZES = [12, 16, 20, 24, 32, 48, 64];

// Trae `anchoTrazo` (y las constantes numéricas que usa) de Glifo.js sin cargar
// react-native: es una función pura.
function cargarAnchoTrazo(fuente) {
  const m = fuente.match(/export function anchoTrazo\(size\) \{[\s\S]*?\n\}/);
  if (!m) return null;
  const constantes = fuente.match(/^const [A-Z_]+ = [\d.]+;$/gm) ?? [];
  return new Function(`${constantes.join('\n')}\n${m[0].replace('export ', '')}\nreturn anchoTrazo;`)();
}

function sinComentarios(fuente) {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function chequearComponente(falla) {
  const ruta = path.join(RAIZ, 'src', 'components', 'Glifo.js');
  if (!fs.existsSync(ruta)) {
    falla('componente', 'falta src/components/Glifo.js');
    return;
  }
  const fuente = fs.readFileSync(ruta, 'utf8');
  const codigo = sinComentarios(fuente);

  const anchoTrazo = cargarAnchoTrazo(fuente);
  if (!anchoTrazo) {
    falla('componente', 'Glifo.js no exporta la función pura `anchoTrazo(size)`');
  } else {
    for (const size of SIZES) {
      const efectivo = anchoTrazo(size) * (size / 16);
      if (Math.abs(efectivo - ANCHO) > 1e-9) {
        falla('componente', `anchoTrazo(${size}) = ${anchoTrazo(size)}: ${efectivo} px efectivos (debe ser ${ANCHO})`);
      }
    }
  }
  if (!/anchoTrazo=\{anchoTrazo\(size\)\}/.test(codigo)) {
    falla('componente', 'Glifo no pasa `anchoTrazo={anchoTrazo(size)}` a Ilustracion');
  }
  if (!/<Ilustracion\b/.test(codigo) || !/from '\.\/Ilustracion'/.test(codigo)) {
    falla('componente', 'Glifo.js no usa Ilustracion');
  }
  const literales = [...codigo.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2]);
  for (const v of literales) {
    if (colorLiteral(v)) falla('componente', `Glifo.js lleva un color literal: ${JSON.stringify(v)}`);
  }
  if (!/Object\.hasOwn\(GLIFOS, id\)/.test(codigo)) {
    falla('componente', 'Glifo busca el id sin `Object.hasOwn(GLIFOS, id)` (ids como `toString` romperían)');
  }
  if (!/if \(!datos\)/.test(codigo)) falla('componente', 'Glifo no trata el id inexistente (`if (!datos)`)');
  if (!/if \(!label\) return dibujo;/.test(codigo)) {
    falla('componente', 'Glifo no distingue decorativo (sin label) de imagen con label');
  }
  if (!/role: 'img'/.test(codigo)) {
    falla('componente', "Glifo con label no declara rol de imagen (role: 'img')");
  }
  const ilus = fs.readFileSync(path.join(RAIZ, 'src', 'components', 'Ilustracion.js'), 'utf8');
  if (!/strokeWidth:\s*anchoTrazo \?\? trazo\.ancho/.test(ilus)) {
    falla('componente', 'Ilustracion no aplica `anchoTrazo` a strokeWidth');
  }
}

// Las guardias isMain de los scripts deben correr por una ruta con symlink (macOS: /tmp).
function chequearSymlink(falla) {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'glifos-symlink-')));
  const correr = (raiz, script, ...args) => {
    const enlace = path.join(tmp, `enlace-${path.basename(raiz)}`);
    if (!fs.existsSync(enlace)) fs.symlinkSync(raiz, enlace);
    return spawnSync(process.execPath, [path.join(enlace, 'tools', 'ui', script), ...args], {
      encoding: 'utf8',
    });
  };
  try {
    const roto = path.join(tmp, 'roto');
    fs.mkdirSync(path.join(roto, 'tools'), { recursive: true });
    fs.cpSync(path.join(RAIZ, 'tools', 'ui'), path.join(roto, 'tools', 'ui'), { recursive: true });
    fs.cpSync(path.join(RAIZ, 'src'), path.join(roto, 'src'), {
      recursive: true,
      filter: (s) => !/(questions|topics)[^/]*\.js$|\.(png|jpe?g|ttf|woff2?)$/.test(s),
    });
    fs.cpSync(DIR_SVG, path.join(roto, path.relative(RAIZ, DIR_SVG)), { recursive: true });
    fs.writeFileSync(path.join(roto, 'package.json'), '{"type":"module"}');

    // Árbol sano por el symlink: corre y sale 0.
    const sano = correr(RAIZ, 'ilustraciones.mjs');
    if (sano.status !== 0 || !sano.stdout.includes('ILUSTRACIONES: OK')) {
      falla('symlink', `ilustraciones.mjs por symlink sobre árbol sano: exit ${sano.status}, salida ${JSON.stringify(sano.stdout)}`);
    }
    // Árbol roto por el symlink: debe fallar (exit 1), no salir 0 en silencio.
    const ilus = path.join(roto, 'src', 'materias', 'bcyt', 'ilustracion.js');
    fs.writeFileSync(
      ilus,
      fs.readFileSync(ilus, 'utf8').replace("tipo: 'path', props: {", "tipo: 'path', props: { extra: 'lime',"),
    );
    const malo = correr(roto, 'ilustraciones.mjs');
    if (malo.status !== 1 || !malo.stderr.includes('ILUSTRACIONES:')) {
      falla('symlink', `ilustraciones.mjs por symlink sobre árbol roto: exit ${malo.status} (debe ser 1)`);
    }
    // Convertidor por el symlink: regenera glifos.js.
    const destino = path.join(roto, 'src', 'assets', 'glifos.js');
    fs.appendFileSync(destino, '// tocado\n');
    const conv = correr(roto, 'convertir-glifos.mjs');
    if (conv.status !== 0 || fs.readFileSync(destino, 'utf8').includes('// tocado')) {
      falla('symlink', `convertir-glifos.mjs por symlink no regeneró glifos.js (exit ${conv.status})`);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

async function chequear() {
  const errores = [];
  const falla = (donde, msg) => errores.push(`${donde}: ${msg}`);

  chequearComponente(falla);
  chequearSymlink(falla);
  const archivo = path.join(RAIZ, 'src', 'assets', 'glifos.js');
  if (!fs.existsSync(archivo)) {
    falla('datos', 'falta src/assets/glifos.js (node tools/ui/convertir-glifos.mjs)');
    return errores;
  }

  let glifos;
  try {
    glifos = await cargar(archivo);
  } catch (e) {
    falla('carga', e.message);
    return errores;
  }
  if (!glifos || typeof glifos !== 'object') {
    falla('datos', 'glifos.js no exporta GLIFOS');
    return errores;
  }

  const svgs = fs.readdirSync(DIR_SVG).filter((f) => /^glifo-.+\.svg$/.test(f)).sort();
  const idsSvg = svgs.map((f) => f.replace(/\.svg$/, ''));
  NUM = idsSvg.length;
  const idsDatos = Object.keys(glifos).sort();
  for (const id of idsSvg) if (!idsDatos.includes(id)) falla(id, 'tiene SVG y no está en GLIFOS');
  for (const id of idsDatos) if (!idsSvg.includes(id)) falla(id, 'está en GLIFOS y no tiene SVG');

  let esperado = {};
  try {
    esperado = leerTodos();
  } catch (e) {
    falla('convertidor', e.message);
  }

  for (const id of idsSvg) {
    const datos = glifos[id];
    if (!datos) continue;
    validar(id, datos, falla);
    if (datos.viewBox !== VIEWBOX) falla(id, `viewBox ${JSON.stringify(datos.viewBox)} (debe ser ${VIEWBOX})`);
    if (datos.trazo?.ancho !== ANCHO) falla(id, `trazo.ancho ${datos.trazo?.ancho} (debe ser ${ANCHO})`);
    if (datos.trazo?.limiteInglete !== INGLETE) {
      falla(id, `trazo.limiteInglete ${datos.trazo?.limiteInglete} (debe ser ${INGLETE})`);
    }

    // Fidelidad: conteo independiente del convertidor, sobre el texto del SVG.
    const texto = fs.readFileSync(path.join(DIR_SVG, `${id}.svg`), 'utf8');
    const tipos = [...texto.matchAll(/<(path|rect|circle|ellipse|line|polyline|polygon|g|use|text)\b/g)].map((m) => m[1]);
    const obtenidos = (datos.elementos ?? []).map((e) => e.tipo);
    if (tipos.join() !== obtenidos.join()) {
      falla(id, `elementos distintos al SVG (svg: ${tipos.length} [${tipos}], datos: ${obtenidos.length} [${obtenidos}])`);
    }
    if (JSON.stringify(esperado[id]) !== JSON.stringify(datos)) {
      falla(id, 'los datos difieren de la conversión actual del SVG (regenerar con convertir-glifos.mjs)');
    }
  }
  return errores;
}

const errores = await chequear();
if (errores.length) {
  console.error(`GLIFOS: ${errores.length} error(es)`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`GLIFOS: OK (${NUM} glifos, ids y elementos fieles a los SVG)`);

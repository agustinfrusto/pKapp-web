// Registry de todas las materias disponibles.
//
// Solo la metadata se importa de forma estática: es lo único que la pantalla de
// selección necesita para dibujar las tarjetas. El banco de preguntas de cada
// materia (entre 80 y 320 kB) vive detrás de un import dinámico, así que Metro
// lo emite como un chunk aparte y el navegador lo baja recién cuando el usuario
// elige esa materia — no las cuatro al abrir la app.
import { metadata as bcyt } from './bcyt/metadata.js';
import { metadata as anatomia } from './anatomia/metadata.js';
import { metadata as neuro } from './neuro/metadata.js';
import { metadata as cyr } from './cyr/metadata.js';
import { CONTEOS } from './conteos.js';

// El conteo de preguntas se precalcula (scripts/gen-conteos.mjs) justamente
// para no tener que abrir el banco solo para mostrar un número.
const conMeta = (m) => ({ ...m, preguntas: CONTEOS[m.id] ?? 0 });

// Orden en que se muestran en MateriaSelectScreen
export const MATERIA_LIST = [bcyt, anatomia, neuro, cyr].map(conMeta);

const CARGADORES = {
  bcyt:     () => import('./bcyt/index.js'),
  anatomia: () => import('./anatomia/index.js'),
  neuro:    () => import('./neuro/index.js'),
  cyr:      () => import('./cyr/index.js'),
};

// Materias ya resueltas, por id. El cache de módulos del bundler ya evita bajar
// el chunk dos veces; esto además evita re-await y mantiene la identidad del
// objeto estable, de la que dependen los useMemo sobre QUESTIONS.
const cargadas = new Map();

export async function cargarMateria(id) {
  if (cargadas.has(id)) return cargadas.get(id);
  const cargar = CARGADORES[id];
  if (!cargar) return null;
  const mod = await cargar();
  const materia = { ...mod.default, preguntas: CONTEOS[id] ?? 0 };
  cargadas.set(id, materia);
  return materia;
}

// Registry de todas las materias disponibles.
//
// Solo la metadata y la ilustración (datos de trazo, pocos KB) se importan de forma
// estática: es lo único que la pantalla de selección necesita para dibujar las
// tarjetas. El banco de preguntas de cada materia (entre 80 y 320 kB) vive detrás
// de un import dinámico, así que Metro lo emite como un chunk aparte y el navegador
// lo baja recién cuando el usuario elige esa materia — no las seis al abrir la app.
import { metadata as bcyt } from './bcyt/metadata.js';
import { ilustracion as bcytIlustracion } from './bcyt/ilustracion.js';
import { metadata as anatomia } from './anatomia/metadata.js';
import { ilustracion as anatomiaIlustracion } from './anatomia/ilustracion.js';
import { metadata as neuro } from './neuro/metadata.js';
import { ilustracion as neuroIlustracion } from './neuro/ilustracion.js';
import { metadata as cyr } from './cyr/metadata.js';
import { ilustracion as cyrIlustracion } from './cyr/ilustracion.js';
import { metadata as dre } from './dre/metadata.js';
import { ilustracion as dreIlustracion } from './dre/ilustracion.js';
import { metadata as ryd } from './ryd/metadata.js';
import { ilustracion as rydIlustracion } from './ryd/ilustracion.js';
import { CONTEOS } from './conteos.js';

// El conteo de preguntas se precalcula (scripts/gen-conteos.mjs) justamente
// para no tener que abrir el banco solo para mostrar un número.
const conMeta = ([m, ilustracion]) => ({
  ...m,
  ilustracion,
  preguntas: CONTEOS[m.id] ?? 0,
});

// Orden en que se muestran en MateriaSelectScreen
export const MATERIA_LIST = [
  [bcyt, bcytIlustracion],
  [anatomia, anatomiaIlustracion],
  [neuro, neuroIlustracion],
  [cyr, cyrIlustracion],
  [dre, dreIlustracion],
  [ryd, rydIlustracion],
].map(conMeta);

const CARGADORES = {
  bcyt:     () => import('./bcyt/index.js'),
  anatomia: () => import('./anatomia/index.js'),
  neuro:    () => import('./neuro/index.js'),
  cyr:      () => import('./cyr/index.js'),
  dre:      () => import('./dre/index.js'),
  ryd:      () => import('./ryd/index.js'),
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
  // La ilustración sale del registro estático (D3): la materia cargada tiene la misma
  // forma que su elemento de MATERIA_LIST más el banco, sin tocar la carga diferida.
  const materia = {
    ...mod.default,
    ilustracion: MATERIA_LIST.find((m) => m.id === id)?.ilustracion,
    preguntas: CONTEOS[id] ?? 0,
  };
  cargadas.set(id, materia);
  return materia;
}

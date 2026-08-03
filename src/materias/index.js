// Registry de todas las materias disponibles.
// Cada materia exporta default { id, name, icon, color, config, TOPICS, QUESTIONS, available, ... }
import bcyt from './bcyt/index.js';
import anatomia from './anatomia/index.js';
import neuro from './neuro/index.js';

export const MATERIAS = {
  bcyt,
  anatomia,
  neuro,
};

// Orden en que se muestran en MateriaSelectScreen
export const MATERIA_LIST = [bcyt, anatomia, neuro];

export function getMateria(id) {
  return MATERIAS[id] || null;
}

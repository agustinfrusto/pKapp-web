// Registry de todas las materias disponibles.
// Cada materia exporta default { id, name, icon, color, config, TOPICS, QUESTIONS, available, ... }
import bcyt from './bcyt/index.js';
import anatomia from './anatomia/index.js';

export const MATERIAS = {
  bcyt,
  anatomia,
};

// Orden en que se muestran en MateriaSelectScreen
export const MATERIA_LIST = [bcyt, anatomia];

export function getMateria(id) {
  return MATERIAS[id] || null;
}

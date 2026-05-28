// Registry de todas las materias disponibles.
// Cada materia exporta default { id, name, icon, color, config, TOPICS, QUESTIONS, available, ... }
import bcyt from './bcyt/index.js';

export const MATERIAS = {
  bcyt,
};

// Orden en que se muestran en MateriaSelectScreen
export const MATERIA_LIST = [bcyt];

export function getMateria(id) {
  return MATERIAS[id] || null;
}

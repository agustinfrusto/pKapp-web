// Punto de entrada de la materia Digestivo, Renal y Endócrino.
import { metadata } from './metadata.js';
import { config } from './config.js';
import { TOPICS } from './topics.js';
import { QUESTIONS } from './questions.js';

export default {
  ...metadata,   // id, name, shortName, description, icon, image, color, available
  config,
  TOPICS,
  QUESTIONS,
};

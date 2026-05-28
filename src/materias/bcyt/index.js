// Punto de entrada de la materia BCYT.
import { metadata } from './metadata.js';
import { config } from './config.js';
import { TOPICS } from './topics.js';
import { QUESTIONS } from './questions.js';

export default {
  ...metadata,   // id, name, shortName, description, icon, color, available
  config,
  TOPICS,
  QUESTIONS,
};

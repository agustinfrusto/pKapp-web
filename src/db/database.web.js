// Implementación web de la capa de datos: usa localStorage en lugar de SQLite.
// Las funciones que dependen de la materia reciben materiaId como primer argumento.
// Settings (tema, hide_feedback) NO se namespacean: son globales cross-materia.

const MIGRATED_FLAG = 'pkapp_migrated_v0.10';

function statsKey(materiaId)     { return `pkapp_question_stats:${materiaId}`; }
function questionsKey(materiaId) { return `pkapp_user_questions:${materiaId}`; }
const SETTINGS_KEY = 'pkapp_settings';

// ── Helpers ────────────────────────────────────────────────────────────────

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Migración: stats/preguntas existentes pertenecen a bcyt ────────────────

function migrateIfNeeded() {
  try {
    if (localStorage.getItem(MIGRATED_FLAG)) return;

    const OLD_STATS = 'pkapp_question_stats';
    const OLD_QUESTIONS = 'pkapp_user_questions';

    const oldStats = localStorage.getItem(OLD_STATS);
    if (oldStats !== null) {
      // Solo migrar si no hay datos nuevos ya en bcyt (evitar pisar)
      if (!localStorage.getItem(statsKey('bcyt'))) {
        localStorage.setItem(statsKey('bcyt'), oldStats);
      }
      localStorage.removeItem(OLD_STATS);
    }

    const oldQs = localStorage.getItem(OLD_QUESTIONS);
    if (oldQs !== null) {
      if (!localStorage.getItem(questionsKey('bcyt'))) {
        localStorage.setItem(questionsKey('bcyt'), oldQs);
      }
      localStorage.removeItem(OLD_QUESTIONS);
    }

    localStorage.setItem(MIGRATED_FLAG, 'true');
  } catch {}
}

// ── API ────────────────────────────────────────────────────────────────────

export async function initDatabase() {
  migrateIfNeeded();
}

// Única definición de «fallada»: errada alguna vez y con menos de 2 aciertos seguidos desde el
// último error. Una entrada sin `racha` (anterior a este campo) sigue la regla vieja.
export function esFallada(entry) {
  return entry.times_answered > 0
    && entry.times_correct < entry.times_answered
    && (typeof entry.racha !== 'number' || entry.racha < 2);
}

export async function recordAnswer(materiaId, questionId, isCorrect) {
  const stats = load(statsKey(materiaId)) || {};
  const entry = stats[questionId] || { times_answered: 0, times_correct: 0 };
  entry.times_answered += 1;
  if (isCorrect) entry.times_correct += 1;
  entry.racha = isCorrect ? (entry.racha ?? 0) + 1 : 0;
  entry.last_answered_at = Date.now();
  stats[questionId] = entry;
  save(statsKey(materiaId), stats);
}

export async function getQuestionStats(materiaId, questionId) {
  const stats = load(statsKey(materiaId)) || {};
  const entry = stats[questionId];
  if (!entry) return null;
  return { question_id: questionId, ...entry };
}

export async function getAllStats(materiaId) {
  const stats = load(statsKey(materiaId)) || {};
  return Object.entries(stats).map(([question_id, data]) => ({
    question_id,
    ...data,
  }));
}

export async function getFailedQuestions(materiaId) {
  const stats = load(statsKey(materiaId)) || {};
  return Object.entries(stats)
    .map(([question_id, data]) => ({
      question_id,
      ...data,
      accuracy: data.times_answered > 0
        ? data.times_correct / data.times_answered
        : 1,
    }))
    .filter(esFallada)
    .sort((a, b) => a.accuracy - b.accuracy || b.times_answered - a.times_answered);
}

// Distingue la lista de propias ausente ([]), legible (el array) e ilegible (`ilegible` con el texto crudo).
// Ilegible: hay un valor guardado que no parsea o no es un array; nunca se pisa sin copia previa.
function leerPropias(materiaId) {
  const crudo = localStorage.getItem(questionsKey(materiaId));
  if (crudo === null) return { questions: [] };
  try {
    const parsed = JSON.parse(crudo);
    if (Array.isArray(parsed)) return { questions: parsed };
  } catch {
    // cae a ilegible
  }
  return { ilegible: crudo };
}

export async function addUserQuestion(materiaId, question) {
  const { questions: legibles, ilegible } = leerPropias(materiaId);
  let questions = legibles;
  if (ilegible !== undefined) {
    // Si la copia falla, la excepción sale y la lista original queda intacta.
    localStorage.setItem(`${questionsKey(materiaId)}:ilegible:${Date.now()}`, JSON.stringify(ilegible));
    questions = [];
  }
  const id = 'USER-' + Date.now();
  questions.unshift({
    id,
    topic:         question.topic,
    question:      question.question,
    options:       JSON.stringify(question.options),
    correct_index: question.correctIndex,
    explanation:   question.explanation || '',
    created_at:    Date.now(),
  });
  save(questionsKey(materiaId), questions);
  return id;
}

export async function getUserQuestions(materiaId) {
  const { questions, ilegible } = leerPropias(materiaId);
  if (ilegible !== undefined) {
    console.warn('Lista de preguntas propias ilegible: se devuelve vacía sin tocarla', materiaId);
    return [];
  }
  // Una fila con `options` ilegible o que no es un array se descarta sin tocarla en localStorage: un respaldo puede repararla.
  const validas = [];
  for (const row of questions) {
    let options;
    try {
      options = JSON.parse(row.options);
    } catch {
      console.warn('Pregunta propia descartada: options ilegible', row && row.id);
      continue;
    }
    if (!Array.isArray(options)) {
      console.warn('Pregunta propia descartada: options no es un array', row && row.id);
      continue;
    }
    validas.push({
      id:          row.id,
      source:      'user',
      topic:       row.topic,
      question:    row.question,
      options,
      correctIndex: row.correct_index,
      explanation: row.explanation,
    });
  }
  return validas;
}

export async function deleteUserQuestion(materiaId, id) {
  const { questions, ilegible } = leerPropias(materiaId);
  if (ilegible !== undefined) {
    console.warn('Lista de preguntas propias ilegible: no se elimina nada', materiaId);
    return;
  }
  save(questionsKey(materiaId), questions.filter(q => q.id !== id));
}

// Borra las estadísticas de todas las materias, también las de una que ya no está en el registro.
// Intenta todas las claves; si alguna falla, lanza al final.
export async function resetStats() {
  const claves = [];
  for (let i = 0; i < localStorage.length; i++) {
    const clave = localStorage.key(i);
    if (/^pkapp_question_stats(:.+)?$/.test(clave)) claves.push(clave);
  }
  let fallo = null;
  for (const clave of claves) {
    try {
      localStorage.removeItem(clave);
    } catch (e) {
      fallo = e;
    }
  }
  if (fallo) throw new Error('No se pudieron borrar todas las estadísticas', { cause: fallo });
}

// ── Settings: globales, no namespaceados ──────────────────────────────────

// Solo un objeto plano es un ajuste válido: cualquier otro valor guardado se trata como vacío.
function cargarAjustes() {
  const settings = load(SETTINGS_KEY);
  return settings && typeof settings === 'object' && !Array.isArray(settings) ? settings : {};
}

// Lectura síncrona: el tema guardado tiene que estar en el primer render, sin un await.
export function getSettingSync(key, defaultValue = null) {
  const settings = cargarAjustes();
  return key in settings ? settings[key] : defaultValue;
}

export async function getSetting(key, defaultValue = null) {
  return getSettingSync(key, defaultValue);
}

export async function saveSetting(key, value) {
  const settings = cargarAjustes();
  settings[key] = String(value);
  save(SETTINGS_KEY, settings);
}

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

export async function recordAnswer(materiaId, questionId, isCorrect) {
  const stats = load(statsKey(materiaId)) || {};
  const entry = stats[questionId] || { times_answered: 0, times_correct: 0 };
  entry.times_answered += 1;
  if (isCorrect) entry.times_correct += 1;
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
    .filter(q => q.times_answered > 0 && q.times_correct < q.times_answered)
    .sort((a, b) => a.accuracy - b.accuracy || b.times_answered - a.times_answered);
}

export async function addUserQuestion(materiaId, question) {
  const questions = load(questionsKey(materiaId)) || [];
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
  const questions = load(questionsKey(materiaId)) || [];
  return questions.map(row => ({
    id:          row.id,
    source:      'user',
    topic:       row.topic,
    question:    row.question,
    options:     JSON.parse(row.options),
    correctIndex: row.correct_index,
    explanation: row.explanation,
  }));
}

export async function deleteUserQuestion(materiaId, id) {
  const questions = load(questionsKey(materiaId)) || [];
  save(questionsKey(materiaId), questions.filter(q => q.id !== id));
}

export async function resetStats(materiaId) {
  localStorage.removeItem(statsKey(materiaId));
}

// ── Settings: globales, no namespaceados ──────────────────────────────────

export async function getSetting(key, defaultValue = null) {
  const settings = load(SETTINGS_KEY) || {};
  return key in settings ? settings[key] : defaultValue;
}

export async function saveSetting(key, value) {
  const settings = load(SETTINGS_KEY) || {};
  settings[key] = String(value);
  save(SETTINGS_KEY, settings);
}

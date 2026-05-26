// Implementación web de la capa de datos: usa localStorage en lugar de SQLite.
// Misma API que database.native.js para que el resto del código no cambie.

const KEYS = {
  stats:     'pkapp_question_stats',    // { [questionId]: { times_answered, times_correct, last_answered_at } }
  questions: 'pkapp_user_questions',    // [{ id, topic, question, options, correct_index, explanation, created_at }]
  settings:  'pkapp_settings',          // { [key]: value }
};

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

// ── API ────────────────────────────────────────────────────────────────────

export async function initDatabase() {
  // No-op en web: localStorage no necesita inicialización
}

export async function recordAnswer(questionId, isCorrect) {
  const stats = load(KEYS.stats) || {};
  const entry = stats[questionId] || { times_answered: 0, times_correct: 0 };
  entry.times_answered += 1;
  if (isCorrect) entry.times_correct += 1;
  entry.last_answered_at = Date.now();
  stats[questionId] = entry;
  save(KEYS.stats, stats);
}

export async function getQuestionStats(questionId) {
  const stats = load(KEYS.stats) || {};
  const entry = stats[questionId];
  if (!entry) return null;
  return { question_id: questionId, ...entry };
}

export async function getAllStats() {
  const stats = load(KEYS.stats) || {};
  return Object.entries(stats).map(([question_id, data]) => ({
    question_id,
    ...data,
  }));
}

export async function getFailedQuestions() {
  const stats = load(KEYS.stats) || {};
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

export async function addUserQuestion(question) {
  const questions = load(KEYS.questions) || [];
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
  save(KEYS.questions, questions);
  return id;
}

export async function getUserQuestions() {
  const questions = load(KEYS.questions) || [];
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

export async function deleteUserQuestion(id) {
  const questions = load(KEYS.questions) || [];
  save(KEYS.questions, questions.filter(q => q.id !== id));
}

export async function getSetting(key, defaultValue = null) {
  const settings = load(KEYS.settings) || {};
  return key in settings ? settings[key] : defaultValue;
}

export async function saveSetting(key, value) {
  const settings = load(KEYS.settings) || {};
  settings[key] = String(value);
  save(KEYS.settings, settings);
}

export async function resetStats() {
  localStorage.removeItem(KEYS.stats);
}

// SQLite wrapper para persistir estadísticas y preguntas del usuario.
// Las funciones que dependen de la materia reciben materiaId como primer argumento.
// Settings (tema, hide_feedback) NO se namespacean: son globales cross-materia.
import * as SQLite from 'expo-sqlite';

let db = null;

export async function initDatabase() {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('biocelular.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS question_stats (
      materia_id TEXT NOT NULL DEFAULT 'bcyt',
      question_id TEXT NOT NULL,
      times_answered INTEGER DEFAULT 0,
      times_correct INTEGER DEFAULT 0,
      last_answered_at INTEGER,
      PRIMARY KEY (materia_id, question_id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_questions (
      id TEXT PRIMARY KEY,
      materia_id TEXT NOT NULL DEFAULT 'bcyt',
      topic TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      explanation TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Migración: asignar bcyt a filas sin materia_id (compat con datos previos)
  await db.execAsync(`UPDATE question_stats SET materia_id = 'bcyt' WHERE materia_id IS NULL OR materia_id = '';`);
  await db.execAsync(`UPDATE user_questions SET materia_id = 'bcyt' WHERE materia_id IS NULL OR materia_id = '';`);

  return db;
}

export async function recordAnswer(materiaId, questionId, isCorrect) {
  const database = await initDatabase();
  const now = Date.now();
  await database.runAsync(
    `INSERT INTO question_stats (materia_id, question_id, times_answered, times_correct, last_answered_at)
     VALUES (?, ?, 1, ?, ?)
     ON CONFLICT(materia_id, question_id) DO UPDATE SET
       times_answered = times_answered + 1,
       times_correct = times_correct + ?,
       last_answered_at = ?`,
    [materiaId, questionId, isCorrect ? 1 : 0, now, isCorrect ? 1 : 0, now]
  );
}

export async function getQuestionStats(materiaId, questionId) {
  const database = await initDatabase();
  return await database.getFirstAsync(
    'SELECT * FROM question_stats WHERE materia_id = ? AND question_id = ?',
    [materiaId, questionId]
  );
}

export async function getAllStats(materiaId) {
  const database = await initDatabase();
  return await database.getAllAsync(
    'SELECT * FROM question_stats WHERE materia_id = ?',
    [materiaId]
  );
}

export async function getFailedQuestions(materiaId) {
  const database = await initDatabase();
  return await database.getAllAsync(
    `SELECT question_id, times_answered, times_correct,
            CAST(times_correct AS REAL) / times_answered AS accuracy
     FROM question_stats
     WHERE materia_id = ? AND times_answered > 0 AND times_correct < times_answered
     ORDER BY accuracy ASC, times_answered DESC`,
    [materiaId]
  );
}

export async function addUserQuestion(materiaId, question) {
  const database = await initDatabase();
  const id = 'USER-' + Date.now();
  await database.runAsync(
    `INSERT INTO user_questions (id, materia_id, topic, question, options, correct_index, explanation, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      materiaId,
      question.topic,
      question.question,
      JSON.stringify(question.options),
      question.correctIndex,
      question.explanation || '',
      Date.now(),
    ]
  );
  return id;
}

export async function getUserQuestions(materiaId) {
  const database = await initDatabase();
  const rows = await database.getAllAsync(
    'SELECT * FROM user_questions WHERE materia_id = ? ORDER BY created_at DESC',
    [materiaId]
  );
  return rows.map((row) => ({
    id: row.id,
    source: 'user',
    topic: row.topic,
    question: row.question,
    options: JSON.parse(row.options),
    correctIndex: row.correct_index,
    explanation: row.explanation,
  }));
}

export async function deleteUserQuestion(materiaId, id) {
  const database = await initDatabase();
  await database.runAsync(
    'DELETE FROM user_questions WHERE materia_id = ? AND id = ?',
    [materiaId, id]
  );
}

export async function resetStats(materiaId) {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM question_stats WHERE materia_id = ?', [materiaId]);
}

// ── Settings: globales, no namespaceados ──────────────────────────────────

export async function getSetting(key, defaultValue = null) {
  const database = await initDatabase();
  const row = await database.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : defaultValue;
}

export async function saveSetting(key, value) {
  const database = await initDatabase();
  await database.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?`,
    [key, String(value), String(value)]
  );
}

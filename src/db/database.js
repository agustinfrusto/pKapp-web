// SQLite wrapper para persistir estadísticas y preguntas del usuario
import * as SQLite from 'expo-sqlite';

let db = null;

export async function initDatabase() {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('biocelular.db');
  
  // Tabla de estadísticas por pregunta: cuántas veces se respondió y cuántas se acertó
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS question_stats (
      question_id TEXT PRIMARY KEY,
      times_answered INTEGER DEFAULT 0,
      times_correct INTEGER DEFAULT 0,
      last_answered_at INTEGER
    );
  `);
  
  // Tabla de preguntas custom agregadas por el usuario
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_questions (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_index INTEGER NOT NULL,
      explanation TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  // Tabla de ajustes clave-valor
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  
  return db;
}

// Registrar una respuesta
export async function recordAnswer(questionId, isCorrect) {
  const database = await initDatabase();
  const now = Date.now();
  
  await database.runAsync(
    `INSERT INTO question_stats (question_id, times_answered, times_correct, last_answered_at)
     VALUES (?, 1, ?, ?)
     ON CONFLICT(question_id) DO UPDATE SET
       times_answered = times_answered + 1,
       times_correct = times_correct + ?,
       last_answered_at = ?`,
    [questionId, isCorrect ? 1 : 0, now, isCorrect ? 1 : 0, now]
  );
}

// Obtener estadísticas de una pregunta
export async function getQuestionStats(questionId) {
  const database = await initDatabase();
  const result = await database.getFirstAsync(
    'SELECT * FROM question_stats WHERE question_id = ?',
    [questionId]
  );
  return result;
}

// Obtener todas las estadísticas
export async function getAllStats() {
  const database = await initDatabase();
  const results = await database.getAllAsync('SELECT * FROM question_stats');
  return results;
}

// Obtener preguntas más falladas (al menos 1 fallo, ordenadas por % de error)
export async function getFailedQuestions() {
  const database = await initDatabase();
  const results = await database.getAllAsync(
    `SELECT question_id, times_answered, times_correct,
            CAST(times_correct AS REAL) / times_answered AS accuracy
     FROM question_stats
     WHERE times_answered > 0 AND times_correct < times_answered
     ORDER BY accuracy ASC, times_answered DESC`
  );
  return results;
}

// Agregar pregunta del usuario
export async function addUserQuestion(question) {
  const database = await initDatabase();
  const id = 'USER-' + Date.now();
  await database.runAsync(
    `INSERT INTO user_questions (id, topic, question, options, correct_index, explanation, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
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

// Listar preguntas del usuario
export async function getUserQuestions() {
  const database = await initDatabase();
  const rows = await database.getAllAsync('SELECT * FROM user_questions ORDER BY created_at DESC');
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

// Eliminar pregunta del usuario
export async function deleteUserQuestion(id) {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM user_questions WHERE id = ?', [id]);
}

// Leer un ajuste (devuelve defaultValue si no existe)
export async function getSetting(key, defaultValue = null) {
  const database = await initDatabase();
  const row = await database.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : defaultValue;
}

// Guardar un ajuste
export async function saveSetting(key, value) {
  const database = await initDatabase();
  await database.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = ?`,
    [key, String(value), String(value)]
  );
}

// Resetear todas las estadísticas
export async function resetStats() {
  const database = await initDatabase();
  await database.execAsync('DELETE FROM question_stats');
}

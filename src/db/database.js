// Fallback sin expo-sqlite. Metro usa database.native.js o database.web.js
// según la plataforma; este archivo solo existe para evitar errores de bundling.
export {
  initDatabase,
  recordAnswer,
  getQuestionStats,
  getAllStats,
  getFailedQuestions,
  addUserQuestion,
  getUserQuestions,
  deleteUserQuestion,
  getSetting,
  saveSetting,
  resetStats,
} from './database.web';

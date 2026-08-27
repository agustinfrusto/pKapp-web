import fs from 'fs';
import path from 'path';

function escapeString(str) {
  if (typeof str !== 'string') return "''";
  return "'" + str.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

export function formatQuestionCanonical(q) {
  const lines = [];
  lines.push('  {');
  lines.push(`    id: ${escapeString(q.id)},`);
  lines.push(`    source: ${escapeString(q.source || 'exam')},`);
  lines.push(`    exam: ${escapeString(q.exam)},`);
  lines.push(`    topic: ${escapeString(q.topic)},`);
  lines.push(`    materia: ${escapeString(q.materia)},`);
  if (q.parcial) {
    lines.push(`    parcial: ${escapeString(q.parcial)},`);
  }
  lines.push(`    question: ${escapeString(q.question)},`);
  lines.push('    options: [');
  for (const opt of q.options || []) {
    lines.push(`      ${escapeString(opt)},`);
  }
  lines.push('    ],');
  lines.push(`    correctIndex: ${q.correctIndex},`);
  lines.push(`    explanation: ${escapeString(q.explanation || '')},`);
  lines.push('  },');
  return lines.join('\n');
}

export function renderQuestionsFragment(questions) {
  if (!questions || questions.length === 0) return '';
  
  const blocks = [];
  let currentExam = null;
  
  for (const q of questions) {
    if (q.exam && q.exam !== currentExam) {
      currentExam = q.exam;
      blocks.push(`  // ============== ${currentExam.toUpperCase()} ==============`);
    }
    blocks.push(formatQuestionCanonical(q));
  }
  
  return blocks.join('\n') + '\n';
}

export function insertQuestions(existingContent, newQuestions, materiaName = '') {
  if (!newQuestions || newQuestions.length === 0) {
    return existingContent;
  }

  const fragment = renderQuestionsFragment(newQuestions);

  if (!existingContent || existingContent.trim() === '') {
    return `/**
 * pKapp - Banco de preguntas - ${materiaName}
 *
 * SPDX-License-Identifier: CC-BY-NC-SA-4.0
 * Copyright (c) 2026 Agustín Frusto
 */
// Estructura: { id, source, exam, topic, materia, question, options, correctIndex, explanation }
export const QUESTIONS = [
${fragment}];
`;
  }

  // Find closing of QUESTIONS array
  const lastBracketIndex = existingContent.lastIndexOf('];');
  const fallbackBracketIndex = lastBracketIndex === -1 ? existingContent.lastIndexOf(']') : lastBracketIndex;

  if (fallbackBracketIndex === -1) {
    throw new Error('No se pudo encontrar el cierre del array QUESTIONS (]; o ]) en questions.js');
  }

  const before = existingContent.slice(0, fallbackBracketIndex);
  const after = existingContent.slice(fallbackBracketIndex);

  // Ensure clean newline separation before insertion if needed
  const needsNewline = !before.endsWith('\n');
  return before + (needsNewline ? '\n' : '') + fragment + after;
}

// CLI handler if called directly
if (process.argv[1] && process.argv[1].endsWith('emit-materia.mjs')) {
  const materiaId = process.argv[2];
  const inputFilePath = process.argv[3];

  if (!materiaId) {
    console.error('Uso: node emit-materia.mjs <materiaId> [ruta_a_banco.jsonl]');
    process.exit(1);
  }

  const rootDir = path.resolve(process.cwd());
  const materiaDir = path.join(rootDir, 'src', 'materias', materiaId);
  const questionsPath = path.join(materiaDir, 'questions.js');

  let questionsToAdd = [];
  if (inputFilePath) {
    const rawLines = fs.readFileSync(inputFilePath, 'utf8').split('\n');
    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        // If entry has .pregunta or is wrapped in traceability, extract app format
        const q = parsed.pregunta ? parsed.pregunta : parsed;
        questionsToAdd.push(q);
      } catch (e) {
        console.error('Error parseando línea JSONL:', line);
      }
    }
  }

  const existing = fs.existsSync(questionsPath) ? fs.readFileSync(questionsPath, 'utf8') : '';
  const updated = insertQuestions(existing, questionsToAdd, materiaId);
  
  if (!fs.existsSync(materiaDir)) {
    fs.mkdirSync(materiaDir, { recursive: true });
  }

  fs.writeFileSync(questionsPath, updated, 'utf8');
  console.log(`Emitidas ${questionsToAdd.length} preguntas en ${questionsPath}`);
}

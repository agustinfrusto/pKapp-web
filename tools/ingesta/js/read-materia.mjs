import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';

const materiaId = process.argv[2];

if (!materiaId) {
  console.error(JSON.stringify({ error: 'Falta especificar el id de la materia como argumento.' }));
  process.exit(1);
}

const rootDir = path.resolve(process.cwd());
const materiaDir = path.join(rootDir, 'src', 'materias', materiaId);

if (!fs.existsSync(materiaDir)) {
  console.error(JSON.stringify({ error: `La materia '${materiaId}' no existe en ${materiaDir}` }));
  process.exit(1);
}

async function load() {
  try {
    const topicsPath = path.join(materiaDir, 'topics.js');
    const questionsPath = path.join(materiaDir, 'questions.js');
    const configPath = path.join(materiaDir, 'config.js');
    const metadataPath = path.join(materiaDir, 'metadata.js');

    const topicsUrl = pathToFileURL(topicsPath).href;
    const questionsUrl = pathToFileURL(questionsPath).href;

    const topicsModule = fs.existsSync(topicsPath) ? await import(topicsUrl) : {};
    const questionsModule = fs.existsSync(questionsPath) ? await import(questionsUrl) : {};

    let config = {};
    if (fs.existsSync(configPath)) {
      const configUrl = pathToFileURL(configPath).href;
      const mod = await import(configUrl);
      config = mod.config || {};
    }

    let metadata = {};
    if (fs.existsSync(metadataPath)) {
      // metadata might contain require('../../assets/...') which fails in pure node ESM if not mocked or handled
      try {
        const metadataUrl = pathToFileURL(metadataPath).href;
        const mod = await import(metadataUrl);
        metadata = mod.metadata || {};
      } catch (e) {
        // Fallback for require in metadata
      }
    }

    const payload = {
      materia: materiaId,
      topics: topicsModule.TOPICS || {},
      questions: questionsModule.QUESTIONS || [],
      config: config,
      metadata: metadata,
      totalQuestions: (questionsModule.QUESTIONS || []).length,
      topicsCount: Object.keys(topicsModule.TOPICS || {}).length,
    };

    console.log(JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ error: err.message, stack: err.stack }));
    process.exit(1);
  }
}

load();

## Why

El banco de preguntas de pkapp se alimenta manualmente. Hay exámenes en
PDF con las respuestas marcadas que podrían ingerirse de forma sistemática,
pero el proceso manual no escala y la ingesta asistida por IA sin controles
introduce errores silenciosos: preguntas duplicadas, preguntas ambiguas,
preguntas que referencian imágenes ausentes y explicaciones generadas con
datos inventados.

Los exámenes fuente no contienen explicaciones y no existe material teórico
de referencia. Toda explicación publicada es generada, lo cual ya ocurre en
la materia existente bajo banner de aviso.

## What Changes

- **ADDED** capability `question-ingestion`: pipeline de extracción de
  preguntas de opción múltiple desde exámenes en PDF hacia el formato del
  banco de pkapp.
- **ADDED** criterios de admisibilidad de preguntas al banco publicado.
- **ADDED** criterios de admisibilidad de explicaciones generadas: clasifican
  la explicación, no la retienen.
- **ADDED** registro de explicaciones poco fiables, con nivel de fiabilidad y
  reparos por explicación.
- **ADDED** artefactos de salida auditables: banco, descartadas, revisión
  manual, explicaciones poco fiables y reporte de calidad.
- No modifica la app ni el formato de consumo del banco existente.

## Capabilities

### New Capabilities

- `question-ingestion`: extracción de preguntas de opción múltiple desde
  exámenes en PDF, gates de admisibilidad de preguntas y de explicaciones
  generadas, y emisión de artefactos auditables (`banco.jsonl`,
  descartadas, revisión manual y reporte de calidad) más el `questions.js`
  de la materia destino.

### Modified Capabilities

Ninguna. No hay specs previas en `openspec/specs/` y el comportamiento de
la app no cambia.

## Impact

- Affected specs: `question-ingestion` (nueva)
- Affected code: nuevo directorio de tooling; el formato de `banco.jsonl`
  debe coincidir con el que ya consume la app.
- Sin cambios en el runtime de la PWA.

### Decisiones tomadas al proponer

- El pipeline llega hasta el final: `PDF → banco.jsonl → src/materias/<id>/questions.js`.
  `banco.jsonl` es el artefacto auditable intermedio, con un registro por
  pregunta cuyos campos son exactamente los que consume la app
  (`{ id, source, exam, topic, materia, question, options, correctIndex, explanation }`);
  un paso de emisión final lo vuelca a `questions.js` conservando el
  encabezado legal de contenido de terceros.
- El tooling son scripts Node versionados que orquestan los pasos con IA
  (lectura del PDF y redacción de explicaciones) y aplican las validaciones
  de forma determinista, fuera del bundle de la app.
- La detección de duplicados compara las preguntas del lote entre sí y
  contra las ya publicadas en la materia destino, no contra las demás
  materias.
- Toda pregunta admitida se publica con explicación: la calidad de la
  explicación nunca retiene contenido. La duda se registra en los artefactos
  auditables, dirigidos al mantenedor, y no llega a la UI.

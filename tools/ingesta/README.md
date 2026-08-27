# Pipeline de Ingesta de Preguntas (`tools/ingesta`)

Pipeline para convertir exámenes reales en PDF con respuestas marcadas en preguntas estructuradas y publicables para pKapp, con gates de admisibilidad deterministas y artefactos auditables.

## Esquema que consume la app

Cada objeto de pregunta dentro del arreglo `QUESTIONS` de `src/materias/<id>/questions.js` tiene la siguiente estructura:

```javascript
{
  id: 'A-2024-T1-Q1',           // Identificador único y estable (ej: <PREFIJO>-<EXAMEN>-Q<n>)
  source: 'exam',               // 'exam' | 'generated' | 'user'
  exam: '2024 Turno 1',         // Nombre legible del examen fuente
  topic: 'snc',                 // Slug existente en src/materias/<id>/topics.js
  materia: 'anatomia',          // ID de la materia destino (coincide con metadata.id)
  parcial: 'primero',           // 'primero' | 'segundo' (opcional, SOLO si config.parciales !== null)
  question: '¿Enunciado...?',   // Texto literal de la pregunta
  options: [                    // Mínimo 2 opciones de respuesta
    'Opción A',
    'Opción B',
    'Opción C'
  ],
  correctIndex: 1,              // Índice entero (0 .. options.length - 1)
  explanation: 'Texto...'       // Explicación de la opción correcta
}
```

### Diferencias de formato entre materias existentes

1. **`anatomia` (Formato Canónico)**:
   - Comillas simples `'`, indentación de 2 espacios.
   - Un campo por línea, `options` en múltiples líneas.
   - Incluye `parcial` ('primero' / 'segundo').
   - Separadores de sección: `// ============== <NOMBRE DEL EXAMEN> ==============`.
   - Encabezado legal SPDX-License-Identifier CC-BY-NC-SA-4.0.
2. **`bcyt`**:
   - Comillas simples `'`.
   - Incluye `parcial` ('primero' / 'segundo').
   - Campo `materia: 'bct'` (histórico) y `options` en una sola línea.
   - Encabezado con licencia completa.
3. **`neuro`**:
   - Sin campo `parcial` (`parciales: null` en config).
   - Agrupación compacta de campos en una línea (`id`, `source`, `exam`, `topic`, `materia`), comillas dobles `"`.
   - Encabezado de derechos de terceros sin copyright individual.

**Nota:** Las materias nuevas se generan utilizando el **formato canónico de `anatomia`**.

---

## Muestras de Referencia (`tools/ingesta/referencia/`)

El directorio `tools/ingesta/referencia/` almacena muestras de explicaciones ya publicadas para guiar el **tono, longitud y estilo pedagógico** durante la generación con IA.

> ⚠️ **IMPORTANTE:** El contenido de `tools/ingesta/referencia/` es **exclusivamente guía de estilo y formato**. **NUNCA** debe ser utilizado como fuente de contenido factual ni como material de consulta de verdad médica/biológica.

---

## Etapas del Pipeline

1. **`extraer`**: Lee el PDF estructurado con PyMuPDF (anotaciones de highlight o tabla final de respuestas). Emite `salidas/<materia>-<examen>-<ts>/crudas.jsonl`.
2. **`enriquecer`**: Sugiere `topic` (restringido al mapa `TOPICS` de la materia), genera 3 explicaciones independientes y realiza la resolución a ciegas (*blind validation*). Emite `enriquecidas.jsonl`.
3. **`validar`**: Aplica gates deterministas en código (estructura, no material visual, no ambigüedad, no duplicados, fiabilidad de explicaciones). Emite `banco.jsonl`, `descartadas.jsonl`, `revision-manual.jsonl`, `explicaciones-dudosas.jsonl` y `reporte-calidad.md`.
4. **`emitir`**: Helper Node que inserta las preguntas de `banco.jsonl` en `src/materias/<id>/questions.js` sin alterar el encabezado legal ni las preguntas preexistentes.

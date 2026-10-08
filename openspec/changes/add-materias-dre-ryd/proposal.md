# Proposal

## Why

Faltan dos materias de ESFUNO: Digestivo, Renal y Endócrino, y Reproductor y
Desarrollo. Sus exámenes ya están disponibles en PDF, pero el pipeline de ingesta
no los puede leer. Marcan la respuesta correcta con un relleno vectorial de color
detrás de la opción, y el extractor trata todo fondo de color como resaltado no
estructurado, así que aborta los 21 PDFs únicos de ambas materias.

## What Changes

- El extractor lee la respuesta correcta marcada con un **relleno vectorial
  cromático** detrás de una opción. En el corpus aparecen cian y amarillo. Un
  relleno que no cae en ninguna opción se ignora; lo que hace abortar un examen es
  una pregunta sin marca o con más de una. Una página escaneada sigue abortando,
  como hoy.
- El extractor descarta las preguntas que el examen declara **anuladas**.
- `inventario.py` deja de clasificar un archivo como "con apartado de respuestas"
  solo porque aparece la palabra "correcta" en un enunciado.
- Materia nueva **`dre`** (Digestivo, Renal y Endócrino): examen de 50 preguntas,
  sin parciales.
- Materia nueva **`ryd`** (Reproductor y Desarrollo): examen de 20 preguntas, sin
  parciales.
- Los bancos de ambas materias salen de los exámenes, con explicación en cada
  pregunta, por el pipeline existente: validación ciega, gates deterministas y
  emisión que preserva el encabezado legal.

## Capabilities

### New Capabilities
- `subject-catalog`: qué materias ofrece la app y cómo se presenta cada una
  (tarjeta, tamaño de examen, presencia de parciales, banco cargado a demanda).
  Este change agrega `dre` y `ryd`.

### Modified Capabilities
- `question-ingestion`: se agrega la detección de la respuesta por relleno
  vectorial y el descarte de preguntas anuladas. La capacidad todavía no está en
  `openspec/specs/`, porque la define el change en curso `add-question-ingestion`,
  así que esto se declara como requisitos agregados (ADDED) y no como modificación.
  No contradice ese change: su escenario de aborto habla de fondo rasterizado, y un
  relleno vectorial es dato estructurado del documento.

## Impact

- `tools/ingesta/extraer.py` (lector de marcas por relleno, preguntas anuladas) y
  `tools/ingesta/inventario.py` (falso positivo).
- `tools/ingesta/enriquecer.py`: reglas de palabra clave para los topics de las dos
  materias nuevas.
- Nuevos `src/materias/dre/` y `src/materias/ryd/` (cinco archivos cada uno), su
  registro en `src/materias/index.js` y en `scripts/inject-preload.js`, y
  `src/materias/conteos.js` regenerado.
- Nuevos `src/assets/materias/dre.png` y `ryd.png`, de 220×220. Los elige el
  Diseñador entre los originales de `Imagenes materias/` (gitignoreada).
- README: conteos y lista de materias.
- Sin migración de datos: las claves de localStorage se namespacean por id de
  materia, y estas son materias nuevas. Los ids `dre` y `ryd` quedan fijos para
  siempre porque son la clave del progreso de cada estudiante.
- Los PDFs fuente viven en `ESFUNO/`, gitignoreada: nunca se distribuyen.

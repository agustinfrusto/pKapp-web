# question-ingestion Specification

## Purpose
Convierte exámenes reales en PDF en preguntas publicables para el banco de una
materia, con detección determinística de la respuesta y gates de admisibilidad.

## Requirements

### Requirement: Respuesta marcada por relleno vectorial
El pipeline SHALL reconocer como respuesta correcta la opción que tiene detrás un
relleno vectorial de color cromático. Un relleno vectorial es dato estructurado del
documento: su geometría se lee del PDF sin renderizar la página. La regla aplica a
cualquier color cromático, no a uno en particular.

#### Scenario: Una opción marcada por pregunta
- **WHEN** cada pregunta de un examen tiene exactamente una opción con relleno
  cromático detrás
- **THEN** el pipeline toma esa opción como clave de la pregunta

#### Scenario: Opción que ocupa varias líneas
- **WHEN** la opción marcada ocupa más de una línea y tiene un relleno por línea
- **THEN** el pipeline la cuenta como una sola opción marcada

#### Scenario: Pregunta sin marca
- **WHEN** una pregunta de un examen no tiene ninguna opción marcada y el examen no
  la declara anulada
- **THEN** el pipeline aborta ese examen, lo reporta, y no emite ninguna de sus
  preguntas

#### Scenario: Pregunta con más de una marca
- **WHEN** una pregunta tiene dos o más opciones marcadas
- **THEN** el pipeline descarta esa pregunta, la registra para revisión manual con
  las letras marcadas, y sigue con el resto del examen

#### Scenario: Relleno fuera de las opciones
- **WHEN** hay un relleno de color que no cae sobre ninguna opción, por ejemplo
  sobre un encabezado
- **THEN** el pipeline lo ignora y no lo cuenta como marca

#### Scenario: Página escaneada
- **WHEN** la página no tiene texto extraíble
- **THEN** el pipeline aborta el archivo y lo reporta para tratamiento manual, igual
  que con un resaltado rasterizado

### Requirement: Preguntas anuladas
El pipeline MUST NOT emitir una pregunta que el examen declara anulada, y SHALL
seguir procesando el resto del examen.

#### Scenario: Pregunta anulada en el examen
- **WHEN** el documento marca una pregunta como anulada
- **THEN** el pipeline la descarta, lo registra, y no la cuenta como desfase entre
  claves y preguntas

### Requirement: Selección de la sección de una materia
Cuando un examen reúne varias materias en un solo documento, el pipeline SHALL
emitir hacia la materia destino solo las preguntas de la sección que le
corresponde.

#### Scenario: Examen con varias materias
- **WHEN** un examen tiene secciones de varias materias y el destino es una de ellas
- **THEN** el pipeline emite solo las preguntas de esa sección

#### Scenario: Materia sin sección en el documento
- **WHEN** el documento reúne varias materias pero ninguna sección corresponde a la
  materia destino
- **THEN** el pipeline no emite ninguna pregunta y lo reporta

### Requirement: Inventario sin falsos positivos de clave
El inventario de un PDF MUST NOT declarar que el archivo tiene apartado de
respuestas basándose en palabras que aparecen en los enunciados.

#### Scenario: Enunciado con la palabra "correcta"
- **WHEN** un examen sin apartado de respuestas contiene enunciados como "¿cuál
  describe correctamente…?"
- **THEN** el inventario no lo clasifica como examen con apartado de respuestas
